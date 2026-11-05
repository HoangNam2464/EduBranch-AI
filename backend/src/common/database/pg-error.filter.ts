import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { DatabaseError } from "pg";

/**
 * Maps client-caused PostgreSQL errors to 4xx responses instead of a generic 500.
 * Other database errors stay 500 and are logged; no SQL detail is sent to the client.
 */
const PG_CLIENT_ERRORS: Record<string, { status: number; message: string }> = {
  "22P02": { status: HttpStatus.BAD_REQUEST, message: "Invalid identifier or value format" },
  "23503": { status: HttpStatus.CONFLICT, message: "Referenced record does not exist or is still in use" },
  "23505": { status: HttpStatus.CONFLICT, message: "Record already exists" },
  "23514": { status: HttpStatus.BAD_REQUEST, message: "Value violates a data constraint" },
};

@Catch(DatabaseError)
export class PgErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(PgErrorFilter.name);

  catch(exception: DatabaseError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const mapped = exception.code ? PG_CLIENT_ERRORS[exception.code] : undefined;
    if (!mapped) {
      this.logger.error(`Database error ${exception.code ?? "?"}: ${exception.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
    return res.status(mapped.status).json({ statusCode: mapped.status, message: mapped.message });
  }
}
