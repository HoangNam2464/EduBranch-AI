import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { randomUUID } from "crypto";

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
    dto: { materialIds: string[]; topicHint?: string; numNodes?: number },
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
      "SELECT id FROM courses WHERE id = $1 AND lecturer_id = $2",
      [courseId, lecturerId],
    );
    if (courseRes.rows.length === 0) {
      throw new NotFoundException(`Course ${courseId} not found or access denied`);
    }

    // 2. Call AI Service to generate case draft
    const aiResponse = await this.aiClient.generateCase({
      material_ids: dto.materialIds,
      course_id: courseId,
      topic_hint: dto.topicHint,
      num_nodes: dto.numNodes,
    });

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

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

      return this.getCaseById(caseId, "LECTURER", lecturerId);
    } catch (e) {
      await client.query("ROLLBACK");
      this.logger.error("Failed to persist generated case:", e);
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
    return { id: caseId, status: newStatus };
  }
}
