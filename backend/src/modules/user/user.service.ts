import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string) {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, created_at
       FROM users
       WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException("User not found");
    }
    const user = result.rows[0];
    // Never expose password_hash
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      createdAt: user.created_at,
    };
  }
}
