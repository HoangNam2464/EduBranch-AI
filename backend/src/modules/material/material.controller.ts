import {
  Controller,
  Get,
  Delete,
  Patch,
  ForbiddenException,
  Body,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MaterialService } from "./material.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { UpdateMaterialDto } from "./dto/update-material.dto";

/**
 * MaterialController — Flow 1: Material Ingestion & RAG
 *
 * All routes require JWT authentication (global guard).
 *
 * POST /api/v1/courses/:courseId/materials  — Upload PDF/DOCX material
 * GET  /api/v1/courses/:courseId/materials  — List materials for a course
 * GET  /api/v1/materials/:id               — Get material details
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
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can upload course materials");
    }
    const result = await this.materialService.uploadMaterial(courseId, file, user.id);
    return {
      status: "SUCCESS",
      data: result,
    };
  }

  @Get("courses/:courseId/materials")
  async getCourseMaterials(
    @Param("courseId") courseId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can view course materials");
    }
    const materials = await this.materialService.getMaterialsByCourse(courseId, user.id);
    return {
      status: "SUCCESS",
      data: materials,
    };
  }

  @Get("materials/:id")
  async getMaterialById(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can view course materials");
    }
    const material = await this.materialService.getMaterialById(id, user.id);
    return {
      status: "SUCCESS",
      data: material,
    };
  }

  @Delete("materials/:id")
  async deleteMaterial(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can delete course materials");
    }
    const result = await this.materialService.deleteMaterial(id, user.id);
    return { status: "SUCCESS", data: result };
  }

  @Patch("materials/:id")
  async updateMaterial(
    @Param("id") id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role !== "LECTURER") {
      throw new ForbiddenException("Only lecturers can update course materials");
    }
    const result = await this.materialService.updateMaterial(id, user.id, dto);
    return { status: "SUCCESS", data: result };
  }
}
