import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { CaseStatus } from "./dto/update-case-status.dto";
import { randomUUID } from "crypto";
import { UpdateCaseNodeDto } from "./dto/update-case-node.dto";
import { findTreeViolation } from "./case-tree.validator";

@Injectable()
export class CaseService {
  private readonly logger = new Logger(CaseService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly aiClient: AiClientService,
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
    const aiResponse = await this.aiClient.generateCase({
      material_ids: dto.materialIds,
      course_id: courseId,
      topic_hint: dto.topicHint,
      num_nodes: dto.numNodes,
      idempotency_key: dto.idempotencyKey,
    });

    const client = await this.db.getClient();
    let transactionCommitted = false;
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
      if (!Array.isArray(nodes) || nodes.length === 0) {
        throw new BadRequestException("Generated decision tree must contain at least one node");
      }

      const rootIndex = aiResponse.root_node_index ?? 0;
      if (!Number.isInteger(rootIndex) || rootIndex < 0 || rootIndex >= nodes.length) {
        throw new BadRequestException(`Invalid root node index: ${rootIndex}`);
      }

      // Validate every temporary edge before writing nodes/options. This prevents
      // dangling references from being silently persisted as terminal options.
      for (let sourceIndex = 0; sourceIndex < nodes.length; sourceIndex++) {
        const node = nodes[sourceIndex];
        if (!node || typeof node.situation !== "string" || !node.situation.trim()) {
          throw new BadRequestException(`Node ${sourceIndex} has no valid situation`);
        }
        if (node.options != null && !Array.isArray(node.options)) {
          throw new BadRequestException(`Node ${sourceIndex} options must be an array`);
        }
        for (const option of node.options || []) {
          if (option.next_node_index != null &&
              (!Number.isInteger(option.next_node_index) || option.next_node_index < 0 || option.next_node_index >= nodes.length)) {
            throw new BadRequestException(`Option on node ${sourceIndex} references invalid node index ${option.next_node_index}`);
          }
        }
      }

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
            const nextNodeId = opt.next_node_index != null ? nodeMap.get(opt.next_node_index) : null;
            if (opt.next_node_index != null && !nextNodeId) {
              throw new BadRequestException(`Option references unmapped node index ${opt.next_node_index}`);
            }
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

      const rootNodeId = nodeMap.get(rootIndex);
      if (!rootNodeId) {
        throw new BadRequestException(`Root node index ${rootIndex} was not persisted`);
      }
      await client.query(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [rootNodeId, caseId]);

      // Confirm persisted references and root linkage before allowing the commit.
      const referencesRes = await client.query(
        `SELECT
           (SELECT COUNT(*) FROM case_nodes WHERE case_id = $1) AS node_count,
           (SELECT COUNT(*) FROM cases c JOIN case_nodes n ON n.id = c.root_node_id
             WHERE c.id = $1 AND n.case_id = c.id) AS root_count,
           (SELECT COUNT(*) FROM case_options o
             JOIN case_nodes source ON source.id = o.node_id
             LEFT JOIN case_nodes target ON target.id = o.next_node_id
             WHERE source.case_id = $1 AND (target.id IS NULL OR target.case_id = $1 OR o.next_node_id IS NULL)) AS valid_option_count,
           (SELECT COUNT(*) FROM case_options o JOIN case_nodes source ON source.id = o.node_id
             LEFT JOIN case_nodes target ON target.id = o.next_node_id
             WHERE source.case_id = $1 AND o.next_node_id IS NOT NULL AND target.id IS NULL) AS invalid_target_count`,
        [caseId],
      );
      const refs = referencesRes.rows[0];
      const expectedOptionCount = nodes.reduce((count, node) => count + (node.options?.length || 0), 0);
      const persistedOptionCount = Number(refs.valid_option_count);
      if (Number(refs.node_count) !== nodes.length || Number(refs.root_count) !== 1 ||
          persistedOptionCount !== expectedOptionCount || Number(refs.invalid_target_count) !== 0) {
        throw new BadRequestException("Persisted decision tree contains invalid node or option references");
      }

      await client.query("COMMIT");
      transactionCommitted = true;

      return this.getCaseById(caseId, "LECTURER", lecturerId);
    } catch (e) {
      if (!transactionCommitted) {
        await client.query("ROLLBACK");
      }
      this.logger.error("Failed to persist generated case:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getCaseById(caseId: string, role?: string, _userId?: string) {
    const isStudent = role === "STUDENT";
    const caseRes = await this.db.query(
      `SELECT c.*, co.lecturer_id
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1
         AND ($2::boolean = FALSE OR c.status = 'PUBLISHED')`,
      [caseId, isStudent],
    );
    if (caseRes.rows.length === 0) {
      if (isStudent) {
        // Check existence using only the identifier; never load case content for
        // a student unless the published-only query above returns a row.
        const existenceRes = await this.db.query("SELECT id FROM cases WHERE id = $1", [caseId]);
        if (existenceRes.rows.length > 0) {
          throw new ForbiddenException("Students can only access PUBLISHED cases");
        }
      }
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    const caseData = caseRes.rows[0];

    // P0-SEC-01 & P0-SEC-02: Strict role gating and data masking for students
    if (role === "STUDENT") {
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
    newStatus: CaseStatus,
  ) {
    const allowedTransitions: Record<CaseStatus, readonly CaseStatus[]> = {
      DRAFT: ["REVIEWED"],
      REVIEWED: ["APPROVED", "DRAFT"],
      APPROVED: ["PUBLISHED", "DRAFT"],
      PUBLISHED: ["DRAFT"],
    };

    const client = await this.db.getClient();
    let transactionCommitted = false;
    try {
      await client.query("BEGIN");
      // Serialize transitions for this case so two concurrent requests cannot
      // both validate against the same stale status.
      const caseRes = await client.query(
        `SELECT c.id, c.status, c.learning_mode, c.root_node_id, c.context_text, c.problem_text, co.lecturer_id
         FROM cases c
         JOIN courses co ON c.course_id = co.id
         WHERE c.id = $1
         FOR UPDATE OF c`,
        [caseId],
      );
      if (caseRes.rows.length === 0) {
        throw new NotFoundException(`Case ${caseId} not found`);
      }
      const caseRow = caseRes.rows[0];
      if (caseRow.lecturer_id !== lecturerId) {
        throw new ForbiddenException("You can only change the status of cases in your own courses");
      }

      const currentStatus = caseRow.status as CaseStatus;
      if (currentStatus !== newStatus && !allowedTransitions[currentStatus]?.includes(newStatus)) {
        const allowed = allowedTransitions[currentStatus] || [];
        throw new BadRequestException(
          `Invalid status transition from ${currentStatus} to ${newStatus}. Permitted transitions: ${allowed.length ? allowed.join(", ") : "none"}`,
        );
      }

      if (currentStatus === newStatus) {
        await client.query("COMMIT");
        transactionCommitted = true;
        return { id: caseId, status: currentStatus };
      }

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
          if (!caseRow.root_node_id) {
            throw new ForbiddenException("Cannot publish case without a designated root node");
          }
          const terminalRes = await client.query(
            "SELECT COUNT(*) as count FROM case_nodes WHERE case_id = $1 AND is_terminal = TRUE",
            [caseId],
          );
          if (parseInt(terminalRes.rows[0]?.count || "0", 10) === 0) {
            throw new BadRequestException("Cannot publish case: The decision tree must contain at least one terminal node");
          }
        }
      }

      const updateRes = await client.query(
        "UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2 AND status = $3",
        [newStatus, caseId, currentStatus],
      );
      if (updateRes.rowCount !== 1) {
        throw new ConflictException("Case status changed before the transition could be saved");
      }

      await client.query("COMMIT");
      transactionCommitted = true;
      return { id: caseId, status: newStatus };
    } catch (error) {
      if (!transactionCommitted) {
        await client.query("ROLLBACK");
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
