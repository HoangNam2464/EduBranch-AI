import type { TeachingMaterial } from "@/types";

/** FE-003: accepted upload extensions and browser-reported MIME types (max size is checked separately). */
export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Extension and MIME type must both match; an empty MIME type (some browsers) is left to the server check. */
export function isAcceptedFile(file: { name: string; type: string }): boolean {
  return ACCEPTED_EXTENSIONS.includes(extensionOf(file.name)) && (file.type === "" || ACCEPTED_MIME_TYPES.includes(file.type));
}

export type MaterialStatusFilter = "ALL" | TeachingMaterial["processingStatus"];
export type MaterialTypeFilter = "ALL" | "PDF" | "DOCX";

/** FE-004: client-side filters by processing status and file type. */
export function filterMaterials(
  materials: TeachingMaterial[],
  status: MaterialStatusFilter,
  type: MaterialTypeFilter,
): TeachingMaterial[] {
  return materials.filter(
    (m) =>
      (status === "ALL" || m.processingStatus === status) &&
      (type === "ALL" || extensionOf(m.originalFilename) === `.${type.toLowerCase()}`),
  );
}
