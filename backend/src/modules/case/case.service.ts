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
import { randomUUID } from "crypto";
import { UpdateNodeDto } from "./dto/update-node.dto";

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
      `SELECT c.status, co.lecturer_id, co.id AS course_id, co.is_active
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

    if (caseRow.is_active === false) {
      throw new ConflictException("Course is archived");
    }

    const status = caseRow.status;
    if (status === "APPROVED" || status === "PUBLISHED") {
      throw new ForbiddenException("Cannot edit an APPROVED or PUBLISHED case directly. Revert to DRAFT first.");
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // C1-B / OPD-014: Check course archived status under a share lock
      const lockRes = await client.query(
        "SELECT is_active FROM courses WHERE id = $1 FOR SHARE",
        [caseRow.course_id],
      );
      if (lockRes.rows[0]?.is_active !== true) {
        throw new ConflictException("Course is archived");
      }

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
            // IDOR Protection: verify node belongs to this case
            const nodeRes = await client.query(
              "SELECT id FROM case_nodes WHERE id = $1 AND case_id = $2",
              [node.id, caseId],
            );
            if (nodeRes.rows.length === 0) {
              throw new NotFoundException(`Node ${node.id} not found in case ${caseId}`);
            }
            await client.query(
              "UPDATE case_nodes SET situation = $1 WHERE id = $2 AND case_id = $3",
              [node.situation, node.id, caseId],
            );
          }
          if (node.options && Array.isArray(node.options)) {
            for (const option of node.options) {
              if (option.id) {
                // IDOR Protection: verify option belongs to this node and case
                const optRes = await client.query(
                  `SELECT co.id
                   FROM case_options co
                   JOIN case_nodes cn ON co.node_id = cn.id
                   WHERE co.id = $1 AND co.node_id = $2 AND cn.case_id = $3`,
                  [option.id, node.id, caseId],
                );
                if (optRes.rows.length === 0) {
                  throw new NotFoundException(`Option ${option.id} not found on node ${node.id} in case ${caseId}`);
                }
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

  async updateNode(
    caseId: string,
    nodeId: string,
    lecturerId: string,
    dto: UpdateNodeDto,
  ) {
    // Ownership check & course status check
    const caseRes = await this.db.query(
      `SELECT c.status, c.course_id, co.lecturer_id, co.is_active
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [caseId],
    );
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const caseRow = caseRes.rows[0];

    if (caseRow.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only edit nodes in cases belonging to your courses");
    }

    if (caseRow.is_active === false) {
      throw new ConflictException("Course is archived");
    }

    const status = caseRow.status;
    if (status === "APPROVED" || status === "PUBLISHED") {
      throw new ForbiddenException("Cannot edit nodes in an APPROVED or PUBLISHED case directly. Revert to DRAFT first.");
    }

    // IDOR Protection: Verify node belongs to this case
    const nodeRes = await this.db.query(
      "SELECT id, is_terminal FROM case_nodes WHERE id = $1 AND case_id = $2",
      [nodeId, caseId],
    );
    if (nodeRes.rows.length === 0) {
      throw new NotFoundException(`Node ${nodeId} not found in case ${caseId}`);
    }
    const currentNode = nodeRes.rows[0];

    // FND §5 Validation: non-terminal nodes must have 2 to 4 options
    if (dto.options && Array.isArray(dto.options)) {
      if (!currentNode.is_terminal && (dto.options.length < 2 || dto.options.length > 4)) {
        throw new BadRequestException("Non-terminal decision nodes must have between 2 and 4 options");
      }

      // Validate target nodes: all target nodes must exist in the same case
      for (const opt of dto.options) {
        if (opt.next_node_id) {
          const targetRes = await this.db.query(
            "SELECT id FROM case_nodes WHERE id = $1 AND case_id = $2",
            [opt.next_node_id, caseId],
          );
          if (targetRes.rows.length === 0) {
            throw new BadRequestException(`Target node ${opt.next_node_id} does not exist in case ${caseId}`);
          }
        }
      }

      // Cycle detection: build adjacency list and verify DAG property (DFS 3-color)
      const allEdgesRes = await this.db.query(
        `SELECT co.node_id, co.next_node_id
         FROM case_options co
         JOIN case_nodes cn ON co.node_id = cn.id
         WHERE cn.case_id = $1`,
        [caseId],
      );
      const adj = new Map<string, string[]>();
      for (const row of allEdgesRes.rows) {
        if (!row.next_node_id) continue;
        if (!adj.has(row.node_id)) adj.set(row.node_id, []);
        adj.get(row.node_id)!.push(row.next_node_id);
      }
      const proposedTargets = dto.options
        .map((o) => o.next_node_id)
        .filter((id): id is string => Boolean(id));
      adj.set(nodeId, proposedTargets);

      const visited = new Map<string, number>();
      const hasCycle = (curr: string): boolean => {
        visited.set(curr, 1);
        const neighbors = adj.get(curr) || [];
        for (const nxt of neighbors) {
          const state = visited.get(nxt) || 0;
          if (state === 1) return true;
          if (state === 0 && hasCycle(nxt)) return true;
        }
        visited.set(curr, 2);
        return false;
      };

      for (const nodeKey of adj.keys()) {
        if ((visited.get(nodeKey) || 0) === 0) {
          if (hasCycle(nodeKey)) {
            throw new BadRequestException("Cycle detected in decision tree. Tree must be a directed acyclic graph (DAG).");
          }
        }
      }
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // C1-B: Check course archived status under a share lock
      const lockRes = await client.query(
        "SELECT is_active FROM courses WHERE id = $1 FOR SHARE",
        [caseRow.course_id],
      );
      if (lockRes.rows[0]?.is_active !== true) {
        throw new ConflictException("Course is archived");
      }

      if (dto.situation !== undefined || dto.is_key_decision !== undefined) {
        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;
        if (dto.situation !== undefined) {
          updates.push(`situation = $${i++}`);
          params.push(dto.situation);
        }
        if (dto.is_key_decision !== undefined) {
          updates.push(`is_key_decision = $${i++}`);
          params.push(dto.is_key_decision);
        }
        params.push(nodeId);
        params.push(caseId);
        await client.query(
          `UPDATE case_nodes SET ${updates.join(", ")} WHERE id = $${i++} AND case_id = $${i}`,
          params,
        );
      }

      if (dto.options && Array.isArray(dto.options)) {
        for (const option of dto.options) {
          if (option.id) {
            // IDOR Protection: Option must belong to this node and case
            const optRes = await client.query(
              `SELECT co.id
               FROM case_options co
               JOIN case_nodes cn ON co.node_id = cn.id
               WHERE co.id = $1 AND co.node_id = $2 AND cn.case_id = $3`,
              [option.id, nodeId, caseId],
            );
            if (optRes.rows.length === 0) {
              throw new NotFoundException(`Option ${option.id} not found on node ${nodeId} in case ${caseId}`);
            }
            await client.query(
              `UPDATE case_options
               SET option_text = $1, consequence = $2, next_node_id = $3
               WHERE id = $4 AND node_id = $5`,
              [option.option_text, option.consequence, option.next_node_id || null, option.id, nodeId],
            );
          } else {
            await client.query(
              `INSERT INTO case_options (node_id, option_text, consequence, next_node_id)
               VALUES ($1, $2, $3, $4)`,
              [nodeId, option.option_text, option.consequence, option.next_node_id || null],
            );
          }
        }
      }

      await client.query("UPDATE cases SET updated_at = NOW() WHERE id = $1", [caseId]);
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
