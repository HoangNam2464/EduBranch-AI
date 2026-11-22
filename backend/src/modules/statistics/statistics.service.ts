import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

export interface DecisionPointOptionStatDto {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

export interface DecisionPointStatDto {
  nodeId: string;
  nodeIndex: number | null;
  situation: string;
  totalSelections: number;
  options: DecisionPointOptionStatDto[];
}

export interface OutcomeStatDto {
  nodeId: string;
  situation: string;
  count: number;
  percentage: number;
}

export interface AttemptsPerStudentDto {
  attempts: number;
  students: number;
}

export interface BranchingFlowStatusDto {
  inProgress: number;
  completed: number;
  reflected: number;
}

export interface BranchingStatisticsDto {
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number;
  participants: number;
  singleAttemptStudents: number;
  retryStudents: number;
  attemptsPerStudent: AttemptsPerStudentDto[];
  flowStatus: BranchingFlowStatusDto;
  decisionPoints: DecisionPointStatDto[];
  outcomes: OutcomeStatDto[];
}

export interface ReviewStudyFlowStatusDto {
  submitted: number;
  reviewed: number;
  reflected: number;
}

export interface ReviewStudyStatisticsDto {
  totalSubmissions: number;
  flowStatus: ReviewStudyFlowStatusDto;
}

export interface CaseStatisticsDto {
  caseId: string;
  caseTitle: string;
  learningMode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  caseStatus: string;
  branching: BranchingStatisticsDto | null;
  reviewStudy: ReviewStudyStatisticsDto | null;
}

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * E8: GET /cases/:caseId/statistics
   * FR-14..18: Read-only statistics for a specific case.
   * LECTURER role (course owner only).
   * Aggregates completion rates, decision points, outcomes, attempt distributions, and learning flow.
   * FR-18: Zero student-identifying data.
   * Handles division by zero gracefully.
   */
  async getCaseStatistics(caseId: string, lecturerId: string): Promise<CaseStatisticsDto> {
    const caseRes = await this.db.query(
      `SELECT c.id, c.title, c.status, c.learning_mode, co.lecturer_id
       FROM cases c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [caseId],
    );

    if (caseRes.rows.length === 0) {
      throw new NotFoundException("Case not found");
    }

    const caseData = caseRes.rows[0];
    if (caseData.lecturer_id !== lecturerId) {
      throw new ForbiddenException("You do not have access to statistics for this case");
    }

    const isBranching = caseData.learning_mode === "BRANCHING_STUDY";

    if (isBranching) {
      // 1. Overall attempt counts
      const countsRes = await this.db.query(
        `SELECT
           COUNT(*)::int AS "totalAttempts",
           COUNT(*) FILTER (WHERE is_completed = TRUE)::int AS "completedAttempts"
         FROM branching_attempts
         WHERE case_id = $1`,
        [caseId],
      );
      const totalAttempts: number = countsRes.rows[0].totalAttempts || 0;
      const completedAttempts: number = countsRes.rows[0].completedAttempts || 0;
      const completionRate =
        totalAttempts === 0 ? 0 : Math.round((completedAttempts / totalAttempts) * 1000) / 10;

      // 2. Student distributions
      const studentsRes = await this.db.query(
        `SELECT student_id, COUNT(*)::int AS cnt, MAX(attempt_number)::int AS max_att
         FROM branching_attempts
         WHERE case_id = $1
         GROUP BY student_id`,
        [caseId],
      );

      const participants = studentsRes.rows.length;
      let singleAttemptStudents = 0;
      let retryStudents = 0;
      const distMap = new Map<number, number>();

      for (const row of studentsRes.rows) {
        if (row.cnt === 1) {
          singleAttemptStudents++;
        } else {
          retryStudents++;
        }
        const maxAtt: number = row.max_att;
        distMap.set(maxAtt, (distMap.get(maxAtt) || 0) + 1);
      }

      const attemptsPerStudent: AttemptsPerStudentDto[] = Array.from(distMap.entries())
        .map(([attempts, students]) => ({ attempts, students }))
        .sort((a, b) => a.attempts - b.attempts);

      // 3. Flow status
      const flowRes = await this.db.query(
        `SELECT
           COUNT(*) FILTER (WHERE is_completed = FALSE)::int AS "inProgress",
           COUNT(*) FILTER (WHERE is_completed = TRUE AND reflection_status = 'NOT_STARTED')::int AS "completed",
           COUNT(*) FILTER (WHERE reflection_status = 'SUBMITTED')::int AS "reflected"
         FROM branching_attempts
         WHERE case_id = $1`,
        [caseId],
      );
      const flowRow = flowRes.rows[0];
      const flowStatus: BranchingFlowStatusDto = {
        inProgress: flowRow.inProgress || 0,
        completed: flowRow.completed || 0,
        reflected: flowRow.reflected || 0,
      };

      // 4. Decision points (non-terminal nodes and their options)
      const dpRes = await this.db.query(
        `SELECT
           cn.id AS "nodeId",
           cn.node_index AS "nodeIndex",
           cn.situation,
           co.id AS "optionId",
           co.option_text AS "optionText",
           COALESCE(counts.sel_count, 0)::int AS "count"
         FROM case_nodes cn
         JOIN case_options co ON co.node_id = cn.id
         LEFT JOIN (
           SELECT sr.selected_option_id, COUNT(*)::int AS sel_count
           FROM student_reasoning sr
           JOIN branching_attempts ba ON sr.attempt_id = ba.id
           WHERE ba.case_id = $1
           GROUP BY sr.selected_option_id
         ) counts ON counts.selected_option_id = co.id
         WHERE cn.case_id = $1 AND cn.is_terminal = FALSE
         ORDER BY cn.node_index ASC NULLS LAST, cn.id ASC, co.id ASC`,
        [caseId],
      );

      const dpMap = new Map<
        string,
        {
          nodeId: string;
          nodeIndex: number | null;
          situation: string;
          options: { optionId: string; optionText: string; count: number }[];
        }
      >();

      for (const row of dpRes.rows) {
        if (!dpMap.has(row.nodeId)) {
          dpMap.set(row.nodeId, {
            nodeId: row.nodeId,
            nodeIndex: row.nodeIndex,
            situation: row.situation,
            options: [],
          });
        }
        dpMap.get(row.nodeId)!.options.push({
          optionId: row.optionId,
          optionText: row.optionText,
          count: row.count,
        });
      }

      const decisionPoints: DecisionPointStatDto[] = Array.from(dpMap.values()).map((dp) => {
        const totalSelections = dp.options.reduce((sum, opt) => sum + opt.count, 0);
        return {
          nodeId: dp.nodeId,
          nodeIndex: dp.nodeIndex,
          situation: dp.situation,
          totalSelections,
          options: dp.options.map((opt) => ({
            optionId: opt.optionId,
            optionText: opt.optionText,
            count: opt.count,
            percentage:
              totalSelections === 0 ? 0 : Math.round((opt.count / totalSelections) * 1000) / 10,
          })),
        };
      });

      // 5. Outcomes (terminal nodes)
      const outcomesRes = await this.db.query(
        `SELECT
           cn.id AS "nodeId",
           cn.situation,
           COALESCE(oc.cnt, 0)::int AS "count"
         FROM case_nodes cn
         LEFT JOIN (
           SELECT ba.outcome_node_id, COUNT(*)::int AS cnt
           FROM branching_attempts ba
           WHERE ba.case_id = $1 AND ba.is_completed = TRUE AND ba.outcome_node_id IS NOT NULL
           GROUP BY ba.outcome_node_id
         ) oc ON oc.outcome_node_id = cn.id
         WHERE cn.case_id = $1 AND cn.is_terminal = TRUE
         ORDER BY cn.node_index ASC NULLS LAST, cn.id ASC`,
        [caseId],
      );

      const outcomes: OutcomeStatDto[] = outcomesRes.rows.map((row) => ({
        nodeId: row.nodeId,
        situation: row.situation,
        count: row.count,
        percentage:
          completedAttempts === 0 ? 0 : Math.round((row.count / completedAttempts) * 1000) / 10,
      }));

      return {
        caseId: caseData.id,
        caseTitle: caseData.title,
        learningMode: "BRANCHING_STUDY",
        caseStatus: caseData.status,
        branching: {
          totalAttempts,
          completedAttempts,
          completionRate,
          participants,
          singleAttemptStudents,
          retryStudents,
          attemptsPerStudent,
          flowStatus,
          decisionPoints,
          outcomes,
        },
        reviewStudy: null,
      };
    } else {
      // REVIEW_STUDY mode statistics
      const rsRes = await this.db.query(
        `SELECT
           COUNT(*)::int AS "totalSubmissions",
           COUNT(*) FILTER (WHERE submission_status = 'SUBMITTED')::int AS "submitted",
           COUNT(*) FILTER (WHERE submission_status = 'REVIEWED')::int AS "reviewed",
           COUNT(*) FILTER (WHERE submission_status = 'REFLECTED')::int AS "reflected"
         FROM review_study_submissions
         WHERE case_id = $1`,
        [caseId],
      );

      const rsRow = rsRes.rows[0];
      return {
        caseId: caseData.id,
        caseTitle: caseData.title,
        learningMode: "REVIEW_STUDY",
        caseStatus: caseData.status,
        branching: null,
        reviewStudy: {
          totalSubmissions: rsRow.totalSubmissions || 0,
          flowStatus: {
            submitted: rsRow.submitted || 0,
            reviewed: rsRow.reviewed || 0,
            reflected: rsRow.reflected || 0,
          },
        },
      };
    }
  }
}
