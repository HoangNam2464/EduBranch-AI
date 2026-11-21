import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  Optional,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../../common/database/database.service";
import { AuditService } from "../../common/audit/audit.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload, AuthResponse } from "./auth.types";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 8; // 8 hours

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existing = await this.db.query(
      "SELECT id FROM users WHERE email = $1",
      [dto.email.toLowerCase()],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const userId = randomUUID();

    const result = await this.db.query(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      [userId, dto.email.toLowerCase(), passwordHash, dto.fullName, dto.role],
    );

    const user = result.rows[0];
    this.logger.log(`New user registered: ${user.email} (${user.role})`);

    return this._buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const result = await this.db.query(
      "SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1",
      [dto.email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      // No e-mail stored for unknown accounts (spec 007 AC-A9).
      await this.audit?.record({ type: "LOGIN_FAILED", outcome: "WARNING", meta: { reason: "UNKNOWN_ACCOUNT" } });
      throw new UnauthorizedException("Invalid email or password");
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordMatch) {
      await this.audit?.record({
        type: "LOGIN_FAILED",
        outcome: "WARNING",
        actorId: user.id,
        meta: { reason: "BAD_PASSWORD" },
      });
      throw new UnauthorizedException("Invalid email or password");
    }

    // Locked accounts get the same generic message: the lock state is not disclosed (AC-A5).
    if (user.is_active === false) {
      await this.audit?.record({
        type: "LOGIN_FAILED",
        outcome: "WARNING",
        actorId: user.id,
        meta: { reason: "ACCOUNT_LOCKED" },
      });
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.audit?.record({ type: "LOGIN_SUCCEEDED", outcome: "SUCCESS", actorId: user.id });
    this.logger.log(`User logged in: ${user.email}`);
    return this._buildAuthResponse(user);
  }

  async validateToken(payload: JwtPayload): Promise<{ id: string; email: string; fullName: string; role: string }> {
    const result = await this.db.query(
      "SELECT id, email, full_name, role, is_active FROM users WHERE id = $1",
      [payload.sub],
    );
    if (result.rows.length === 0) {
      throw new UnauthorizedException("User not found");
    }
    // A token issued before the account was locked stops working at once (AC-A5).
    if (result.rows[0].is_active === false) {
      throw new UnauthorizedException("Account is locked");
    }
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };
  }

  private _buildAuthResponse(user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  }): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as any,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: JWT_EXPIRES_IN_SECONDS,
    });

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn: JWT_EXPIRES_IN_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role as any,
      },
    };
  }
}
