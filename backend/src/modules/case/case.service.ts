import {
  Injectable,
  ForbiddenException,
  NotFoundException,
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
    lecturerId: string | undefined,
    dto: { materialIds: string[]; topicHint?: string; numNodes?: number },
  ) {
    // 1. Resolve or ensure valid lecturer user in DB
    let effectiveLecturerId = lecturerId;
    const userRes = await this.db.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'LECTURER'",
      [lecturerId],
    );
    if (userRes.rows.length === 0) {
      const defaultUserRes = await this.db.query(
        "SELECT id FROM users WHERE role = 'LECTURER' LIMIT 1",
      );
      if (defaultUserRes.rows.length > 0) {
        effectiveLecturerId = defaultUserRes.rows[0].id;
      } else {
        const newUserId = randomUUID();
        await this.db.query(
          `INSERT INTO users (id, email, password_hash, full_name, role)
           VALUES ($1, $2, $3, $4, 'LECTURER')
           ON CONFLICT DO NOTHING`,
          [newUserId, `lecturer_${newUserId.slice(0, 8)}@university.edu`, "hash", "University Lecturer"],
        );
        effectiveLecturerId = newUserId;
      }
    }

    // Ensure course exists
    const courseRes = await this.db.query("SELECT id FROM courses WHERE id = $1", [courseId]);
    if (courseRes.rows.length === 0) {
      await this.db.query(
        `INSERT INTO courses (id, name, course_code, lecturer_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [courseId, "University Course", `CRS-${courseId.slice(0, 6)}`, effectiveLecturerId],
      );
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
        [caseId, title, description, courseId, effectiveLecturerId],
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

      return this.getCaseById(caseId);
    } catch (e) {
      await client.query("ROLLBACK");
      this.logger.error("Failed to persist generated case:", e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getCaseById(caseId: string, role?: string) {
    const caseRes = await this.db.query("SELECT * FROM cases WHERE id = $1", [caseId]);
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const caseData = caseRes.rows[0];

    if (role === "STUDENT" && caseData.status !== "PUBLISHED") {
      throw new ForbiddenException("Students can only access PUBLISHED cases");
    }

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
    dto: { title?: string; description?: string; nodes?: any[] },
  ) {
    const caseRes = await this.db.query("SELECT status FROM cases WHERE id = $1", [caseId]);
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);
    const status = caseRes.rows[0].status;

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
      return this.getCaseById(caseId);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async updateCaseStatus(
    caseId: string,
    newStatus: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED",
  ) {
    const caseRes = await this.db.query(
      "SELECT status, root_node_id FROM cases WHERE id = $1",
      [caseId],
    );
    if (caseRes.rows.length === 0) throw new NotFoundException(`Case ${caseId} not found`);

    if (newStatus === "PUBLISHED" && !caseRes.rows[0].root_node_id) {
      throw new ForbiddenException("Cannot publish case without a designated root node");
    }

    await this.db.query("UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2", [newStatus, caseId]);
    return { id: caseId, status: newStatus };
  }
}
