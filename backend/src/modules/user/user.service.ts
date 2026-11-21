import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import type { UpdateProfileDto } from "./dto/update-profile.dto";

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: Date;
  preferred_language: string;
}

const PROFILE_COLUMNS = "id, email, full_name, role, created_at, preferred_language";

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string) {
    const result = await this.db.query<ProfileRow>(
      `SELECT ${PROFILE_COLUMNS} FROM users WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException("User not found");
    }
    return this.toProfile(result.rows[0]);
  }

  /**
   * Updates the signed-in user's own profile (BE-031). The user id always comes
   * from the verified token, never from the request body (AC-P4).
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.fullName === undefined && dto.language === undefined) {
      throw new BadRequestException("Provide fullName or language");
    }
    const result = await this.db.query<ProfileRow>(
      `UPDATE users
          SET full_name          = COALESCE($2, full_name),
              preferred_language = COALESCE($3, preferred_language),
              updated_at         = NOW()
        WHERE id = $1
        RETURNING ${PROFILE_COLUMNS}`,
      [userId, dto.fullName ?? null, dto.language ?? null],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException("User not found");
    }
    return this.toProfile(result.rows[0]);
  }

  // Never expose password_hash or is_active.
  private toProfile(user: ProfileRow) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      createdAt: user.created_at,
      language: user.preferred_language,
    };
  }
}
