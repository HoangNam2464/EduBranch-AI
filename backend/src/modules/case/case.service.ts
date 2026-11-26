import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Optional,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { AuditService } from "../../common/audit/audit.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { randomUUID } from "crypto";
import { UpdateCaseNodeDto } from "./dto/update-case-node.dto";
import { findTreeViolation } from "./case-tree.validator";

@Injectable()
export class CaseService {
  private readonly logger = new Logger(CaseService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly aiClient: AiClientService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async generateCase(
    courseId: string,
    lecturerId: string,
    dto: { materialIds: string[]; topicHint?: string; numNodes?: number; idempotencyKey?: string },
  ) {
    // Verify lecturer exists
    const userRes = await this.db.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'LECTURER'",
      [lecturerId],
    );
    if (userRes.rows.length === 0) {
      throw new ForbiddenException("Only lecturers can generate cases");
    }

    // Verify course exists and belongs to this lecturer
    const courseRes = await this.db.query(
      "SELECT id, is_active FROM courses WHERE id = $1 AND lecturer_id = $2",
      [courseId, lecturerId],
    );
    if (courseRes.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found or access denied`);
    }
    // C1-B / OPD-014: no new cases in an archived course
    if (courseRes.rows[0].is_active === false) {
      throw new ConflictException("Course is archived");
    }

    // 2. Call AI Service to generate case draft with idempotency support
    const startedAt = Date.now();
    let aiResponse: any;
    try {
      aiResponse = await this.aiClient.generateCase({
        material_ids: dto.materialIds,
        course_id: courseId,
        topic_hint: dto.topicHint,
        num_nodes: dto.numNodes,
        idempotency_key: dto.idempotencyKey,
      });
    } catch (err) {
      await this.recordGenerationFailure(lecturerId, courseId, startedAt, err);
      throw err;
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // C1-B: the AI call above can take long; re-check under a share lock so a course
      // archived meanwhile gets no new case (the lock holds off a concurrent archive)
      const lockRes = await client.query(
        "SELECT is_active FROM courses WHERE id = $1 FOR SHARE",
        [courseId],
      );
      if (lockRes.rows[0]?.is_active !== true) {
        throw new ConflictException("Course is archived");
      }

      const caseId = randomUUID();
      const title = aiResponse.title || "University Case Study";
      const description = aiResponse.description || "Interactive case study generated from course materials.";

      await client.query(
        `INSERT INTO cases (id, title, description, course_id, created_by, status, learning_mode)
         VALUES ($1, $2, $3, $4, $5, 'DRAFT', 'BRANCHING_STUDY')`,
        [caseId, title, description, courseId, lecturerId],
      );

      const nodes = aiResponse.nodes || [];
      const nodeMap = new Map<number, string>();
      for (let i = 0; i < nodes.length; i++) {
        nodeMap.set(i, randomUUID());
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeId = nodeMap.get(i)!;
        const isTerminal = !node.options || node.options.length === 0;

        await client.query(
          `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [nodeId, caseId, node.situation, isTerminal, i],
        );

        if (node.options && Array.isArray(node.options)) {
          for (const opt of node.options) {
            const nextNodeId =
              opt.next_node_index != null ? nodeMap.get(opt.next_node_index) || null : null;
            const optionText = opt.text || opt.option_text || "Choose Option";
            const consequence = opt.consequence || "Consequence recorded.";

            await client.query(
              `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [randomUUID(), nodeId, optionText, consequence, nextNodeId],
            );
          }
        }
      }

      const rootIndex = aiResponse.root_node_index ?? 0;
      const rootNodeId = nodeMap.get(rootIndex);
      if (rootNodeId) {
        await client.query(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [rootNodeId, caseId]);
      }

      await client.query("COMMIT");

      await this.audit?.record({
        type: "CASE_GENERATED",
        outcome: "SUCCESS",
        actorId: lecturerId,
        targetId: caseId,
        meta: {
          courseId,
          caseTitle: title,
          learningMode: "BRANCHING_STUDY",
          decisionsCount: nodes.filter((n: any) => n.options && n.options.length > 0).length,
          materialsCount: dto.materialIds.length,
          durationMs: Date.now() - startedAt,
        },
      });

      return this.getCaseById(caseId, "LECTURER", lecturerId);
    } catch (e) {
      await client.query("ROLLBACK");
      this.logger.error("Failed to persist generated case:", e);
      await this.recordGenerationFailure(lecturerId, courseId, startedAt, e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getCaseById(caseId: string, role?: string, _userId?: string) {
    const caseRes = await this.db.query(
      `SELECT c.*, co.lecturer_id
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [caseId],
    );
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const caseData = caseRes.rows[0];

    // P0-SEC-01 & P0-SEC-02: Strict role gating and data masking for students
    if (role === "STUDENT") {
      if (caseData.status !== "PUBLISHED") {
        throw new ForbiddenException("Students can only access PUBLISHED cases");
      }
      // P0-SEC-02: Never leak decision tree, options, or consequences to students
      // Students play through /branching-attempts endpoints step-by-step
      return {
        id: caseData.id,
        title: caseData.title,
        description: caseData.description,
        course_id: caseData.course_id,
        status: caseData.status,
        learning_mode: caseData.learning_mode,
        context_text: caseData.context_text,
        problem_text: caseData.problem_text,
        created_at: caseData.created_at,
        updated_at: caseData.updated_at,
      };
    }

    // For lecturers: retrieve full decision tree for ReactFlow review editor
    const nodesRes = await this.db.query(
      "SELECT * FROM case_nodes WHERE case_id = $1 ORDER BY node_index ASC",
      [caseId],
    );
    const nodes = nodesRes.rows;

    const nodeIds = nodes.map((n: any) => n.id);
    let options: any[] = [];
    if (nodeIds.length > 0) {
      const optionsRes = await this.db.query(
        "SELECT * FROM case_options WHERE node_id = ANY($1)",
        [nodeIds],
      );
      options = optionsRes.rows;
    }

    // Attach options to corresponding nodes for structured tree representation
    const populatedNodes = nodes.map((node: any) => ({
      ...node,
      options: options.filter((opt: any) => opt.node_id === node.id),
    }));

    return {
      ...caseData,
      nodes: populatedNodes,
      all_options: options,
    };
  }

  async getCasesByCourse(courseId: string, role?: string) {
    let query = "SELECT * FROM cases WHERE course_id = $1";
    const params: any[] = [courseId];

    if (role === "STUDENT") {
      query += " AND status = 'PUBLISHED'";
    }

    query += " ORDER BY updated_at DESC";

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async updateCase(
    caseId: string,
    lecturerId: string,
    dto: { title?: string; description?: string; nodes?: any[] },
  ) {
    // P0-DATA-03: Ownership check
    const caseRes = await this.db.query(
      `SELECT c.status, co.lecturer_id
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [caseId],
    );
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const caseRow = caseRes.rows[0];

    if (caseRow.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only edit cases in your own courses");
    }

    const status = caseRow.status;
    if (status === "APPROVED" || status === "PUBLISHED") {
      throw new ForbiddenException("Cannot edit an APPROVED or PUBLISHED case directly. Revert to DRAFT first.");
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      if (dto.title !== undefined || dto.description !== undefined) {
        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;
        if (dto.title !== undefined) {
          updates.push(`title = $${i++}`);
          params.push(dto.title);
        }
        if (dto.description !== undefined) {
          updates.push(`description = $${i++}`);
          params.push(dto.description);
        }
        params.push(caseId);
        await client.query(`UPDATE cases SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${i}`, params);
      }

      if (dto.nodes && Array.isArray(dto.nodes)) {
        for (const node of dto.nodes) {
          if (node.id && node.situation) {
            await client.query(
              "UPDATE case_nodes SET situation = $1 WHERE id = $2 AND case_id = $3",
              [node.situation, node.id, caseId],
            );
          }
          if (node.options && Array.isArray(node.options)) {
            for (const option of node.options) {
              if (option.id) {
                const optText = option.option_text || option.text;
                await client.query(
                  "UPDATE case_options SET option_text = $1, consequence = $2 WHERE id = $3 AND node_id = $4",
                  [optText, option.consequence, option.id, node.id],
                );
              }
            }
          }
        }
      }

      await client.query("COMMIT");
      return this.getCaseById(caseId, "LECTURER", lecturerId);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * BE-017 / FE-009: `PUT /cases/:id/nodes/:nodeId` saves one node — its situation and its
   * options (text, consequence, next node). Options with an `id` are updated in place, new
   * ones are inserted, missing ones are deleted. The whole tree is checked (FND §5) before
   * anything is written. The case status does not change (BE-017 AC-3, PO 2026-11-19);
   * editing is allowed in DRAFT and REVIEWED only, like `PUT /cases/:id`.
   */
  async updateCaseNode(caseId: string, nodeId: string, lecturerId: string, dto: UpdateCaseNodeDto) {
    if (!dto.situation?.trim()) throw new BadRequestException("Situation is required");
    for (const option of dto.options ?? []) {
      if (!option.text?.trim() || !option.consequence?.trim()) {
        throw new BadRequestException("Every option needs a text and a consequence");
      }
    }
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");
      const caseRes = await client.query(
        `SELECT c.status, c.learning_mode, c.root_node_id, co.lecturer_id, co.is_active
         FROM cases c
         JOIN courses co ON co.id = c.course_id
         WHERE c.id = $1
         FOR UPDATE OF c`,
        [caseId],
      );
      if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
      const caseRow = caseRes.rows[0];
      if (caseRow.lecturer_id !== lecturerId) {
        throw new ForbiddenException("You can only edit cases in your own courses");
      }
      // C1-B / OPD-014: an archived course is read-only, as for case generation
      if (caseRow.is_active === false) throw new ConflictException("Course is archived");
      if (caseRow.status === "APPROVED" || caseRow.status === "PUBLISHED") {
        throw new ForbiddenException("Cannot edit an APPROVED or PUBLISHED case directly. Revert to DRAFT first.");
      }
      if (caseRow.learning_mode === "REVIEW_STUDY") {
        throw new BadRequestException("Review Study cases have no decision tree nodes");
      }

      const nodesRes = await client.query("SELECT id FROM case_nodes WHERE case_id = $1 FOR UPDATE", [caseId]);
      const nodes = nodesRes.rows as Array<{ id: string }>;
      if (!nodes.some((n) => n.id === nodeId)) {
        throw new NotFoundException(`Node ${nodeId} not found in case ${caseId}`);
      }
      const optionsRes = await client.query(
        `SELECT o.id, o.node_id, o.next_node_id
         FROM case_options o JOIN case_nodes n ON n.id = o.node_id
         WHERE n.case_id = $1
         FOR UPDATE OF o`,
        [caseId],
      );
      const options = optionsRes.rows as Array<{ id: string; node_id: string; next_node_id: string | null }>;
      const ownOptionIds = new Set(options.filter((o) => o.node_id === nodeId).map((o) => o.id));

      const seenIds = new Set<string>();
      for (const option of dto.options) {
        if (!option.id) continue;
        if (!ownOptionIds.has(option.id)) {
          throw new BadRequestException(`Option ${option.id} does not belong to node ${nodeId}`);
        }
        if (seenIds.has(option.id)) throw new BadRequestException(`Option ${option.id} is listed twice`);
        seenIds.add(option.id);
      }

      const targetsByNode = new Map<string, string[]>();
      for (const o of options) {
        if (o.node_id === nodeId) continue;
        const list = targetsByNode.get(o.node_id) ?? [];
        list.push(o.next_node_id ?? "");
        targetsByNode.set(o.node_id, list);
      }
      targetsByNode.set(nodeId, dto.options.map((o) => o.nextNodeId));
      const violation = findTreeViolation(caseRow.root_node_id, nodes, targetsByNode, nodeId);
      if (violation) throw new BadRequestException(violation);

      const keptIds = new Set(dto.options.filter((o) => o.id).map((o) => o.id as string));
      const removedIds = [...ownOptionIds].filter((id) => !keptIds.has(id));
      if (removedIds.length > 0) {
        const usedRes = await client.query(
          "SELECT COUNT(*)::int AS count FROM student_reasoning WHERE selected_option_id = ANY($1)",
          [removedIds],
        );
        if ((usedRes.rows[0]?.count ?? 0) > 0) {
          throw new ConflictException("An option that students already chose cannot be removed");
        }
        try {
          await client.query("DELETE FROM case_options WHERE id = ANY($1)", [removedIds]);
        } catch (e) {
          // Any other table that still references the option (e.g. legacy student_arguments): 409, not 500.
          if ((e as { code?: string }).code === "23503") {
            throw new ConflictException("An option that students already used cannot be removed");
          }
          throw e;
        }
      }
      for (const option of dto.options) {
        const text = option.text.trim();
        const consequence = option.consequence.trim();
        if (option.id) {
          await client.query(
            "UPDATE case_options SET option_text = $1, consequence = $2, next_node_id = $3 WHERE id = $4 AND node_id = $5",
            [text, consequence, option.nextNodeId, option.id, nodeId],
          );
        } else {
          await client.query(
            "INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES ($1, $2, $3, $4, $5)",
            [randomUUID(), nodeId, text, consequence, option.nextNodeId],
          );
        }
      }
      await client.query("UPDATE case_nodes SET situation = $1, is_terminal = $2 WHERE id = $3 AND case_id = $4", [
        dto.situation.trim(),
        dto.options.length === 0,
        nodeId,
        caseId,
      ]);
      // Re-check the edited node against what was actually written before committing.
      const writtenRes = await client.query("SELECT next_node_id FROM case_options WHERE node_id = $1", [nodeId]);
      targetsByNode.set(
        nodeId,
        (writtenRes.rows as Array<{ next_node_id: string | null }>).map((r) => r.next_node_id ?? ""),
      );
      const afterWrite = findTreeViolation(caseRow.root_node_id, nodes, targetsByNode, nodeId);
      if (afterWrite) throw new BadRequestException(afterWrite);
      await client.query("UPDATE cases SET updated_at = NOW() WHERE id = $1", [caseId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
    return this.getCaseById(caseId, "LECTURER", lecturerId);
  }

  async updateCaseStatus(
    caseId: string,
    lecturerId: string,
    newStatus: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED",
  ) {
    // P0-DATA-03: Verify course ownership
    const caseRes = await this.db.query(
      `SELECT c.id, c.status, c.learning_mode, c.root_node_id, c.context_text, c.problem_text, co.lecturer_id
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [caseId],
    );
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const caseRow = caseRes.rows[0];

    if (caseRow.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only change the status of cases in your own courses");
    }

    // P0-DATA-03: Enforce valid state machine transitions (DRAFT -> REVIEWED -> APPROVED -> PUBLISHED)
    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      DRAFT: ["REVIEWED"],
      REVIEWED: ["APPROVED", "DRAFT"],
      APPROVED: ["PUBLISHED", "DRAFT"],
      PUBLISHED: ["DRAFT"],
    };

    const currentStatus = caseRow.status;
    if (currentStatus !== newStatus) {
      const allowed = ALLOWED_TRANSITIONS[currentStatus];
      if (!allowed || !allowed.includes(newStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${currentStatus} to ${newStatus}. Permitted transitions: ${allowed ? allowed.join(", ") : "none"}`
        );
      }
    }

    // P0-DATA-03: Publishing gates differentiated by learning_mode (Proposal V1.2 & INV-02/INV-03)
    if (newStatus === "PUBLISHED") {
      const mode = caseRow.learning_mode || "BRANCHING_STUDY";

      if (mode === "REVIEW_STUDY") {
        if (!caseRow.context_text || !caseRow.context_text.trim()) {
          throw new BadRequestException("Cannot publish Review Study case: Context text must be provided");
        }
        if (!caseRow.problem_text || !caseRow.problem_text.trim()) {
          throw new BadRequestException("Cannot publish Review Study case: Problem text must be provided");
        }
      } else {
        // BRANCHING_STUDY requires root node and at least one terminal node
        if (!caseRow.root_node_id) {
          throw new ForbiddenException("Cannot publish case without a designated root node");
        }

        const terminalRes = await this.db.query(
          "SELECT COUNT(*) as count FROM case_nodes WHERE case_id = $1 AND is_terminal = TRUE",
          [caseId],
        );
        const terminalCount = parseInt(terminalRes.rows[0]?.count || "0", 10);
        if (terminalCount === 0) {
          throw new BadRequestException("Cannot publish case: The decision tree must contain at least one terminal node");
        }
      }
    }

    await this.db.query("UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2", [newStatus, caseId]);
    if (currentStatus !== newStatus) {
      await this.audit?.record({
        type: "CASE_STATUS_CHANGED",
        outcome: "SUCCESS",
        actorId: lecturerId,
        targetId: caseId,
        meta: { from: currentStatus, to: newStatus },
      });
    }
    return { id: caseId, status: newStatus };
  }

  /** Spec 007 AC-A9: a failed generation is logged with its duration; never with material text. */
  private async recordGenerationFailure(lecturerId: string, courseId: string, startedAt: number, err: unknown) {
    const status = (err as { status?: number; getStatus?: () => number })?.getStatus?.() ?? (err as any)?.status;
    await this.audit?.record({
      type: "CASE_GENERATION_FAILED",
      outcome: "ERROR",
      actorId: lecturerId,
      meta: {
        courseId,
        durationMs: Date.now() - startedAt,
        errorCode: typeof status === "number" ? `HTTP_${status}` : (err as Error)?.name ?? "ERROR",
      },
    });
  }
}
