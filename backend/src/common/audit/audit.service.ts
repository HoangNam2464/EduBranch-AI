import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import type { AuditEventInput } from "./audit.types";

/**
 * Writes system activity events (spec 007 AC-A9).
 * Recording never fails the calling operation: errors are logged and swallowed.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly db: DatabaseService) {}

  async record(event: AuditEventInput): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO audit_events (event_type, outcome, actor_id, target_id, meta)
         VALUES ($1, $2, $3, $4, $5::jsonb)`,
        [
          event.type,
          event.outcome,
          event.actorId ?? null,
          event.targetId ?? null,
          JSON.stringify(event.meta ?? {}),
        ],
      );
    } catch (err) {
      this.logger.warn(
        `Could not record audit event ${event.type}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
