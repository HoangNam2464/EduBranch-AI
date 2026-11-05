import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MaterialService } from "./material.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";

/**
 * MaterialController — Flow 1: Material Ingestion & RAG
 *
 * All routes require JWT authentication (global guard) and the LECTURER role.
 * Every route checks that the lecturer owns the course of the material (BE-005).
 *
 * POST   /api/v1/courses/:courseId/materials  — Upload PDF/DOCX material
 * GET    /api/v1/courses/:courseId/materials  — List materials for a course
 * GET    /api/v1/materials/:id                — Get material details
 * DELETE /api/v1/materials/:id                — Delete a material and its chunks (FE-005)
 * POST   /api/v1/materials/:id/reprocess      — Re-run ingestion for a failed material (FE-005)
 * GET    /api/v1/materials/:id/chunks         — Source chunks for the RAG inspector (FE-006)
 */
@Controller()
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Roles("LECTURER")
  @Post("courses/:courseId/materials")
  @UseInterceptors(FileInterceptor("file"))
  async uploadCourseMaterial(
    @Param("courseId") courseId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const result = await this.materialService.uploadMaterial(courseId, file, user.id);
    return { status: "SUCCESS", data: result };
  }

  @Roles("LECTURER")
  @Get("courses/:courseId/materials")
  async getCourseMaterials(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const materials = await this.materialService.getMaterialsByCourse(courseId, user.id);
    return { status: "SUCCESS", data: materials };
  }

  @Roles("LECTURER")
  @Get("materials/:id")
  async getMaterialById(@Param("id") id: string, @CurrentUser() user: { id: string; role: string }) {
    const material = await this.materialService.getMaterialById(id, user.id);
    return { status: "SUCCESS", data: material };
  }

  @Roles("LECTURER")
  @Delete("materials/:id")
  async deleteMaterial(@Param("id") id: string, @CurrentUser() user: { id: string; role: string }) {
    const result = await this.materialService.deleteMaterial(id, user.id);
    return { status: "SUCCESS", data: result };
  }

  @Roles("LECTURER")
  @Post("materials/:id/reprocess")
  @HttpCode(HttpStatus.OK)
  async reprocessMaterial(@Param("id") id: string, @CurrentUser() user: { id: string; role: string }) {
    const result = await this.materialService.reprocessMaterial(id, user.id);
    return { status: "SUCCESS", data: result };
  }

  @Roles("LECTURER")
  @Get("materials/:id/chunks")
  async getMaterialChunks(@Param("id") id: string, @CurrentUser() user: { id: string; role: string }) {
    const result = await this.materialService.getMaterialChunks(id, user.id);
    return { status: "SUCCESS", data: result };
  }
}
