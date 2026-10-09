import prisma from "@/utils/prisma";
import logger from "@/utils/logger";
import { TemplateType } from "@/generated/prisma/enums";
import { TemplateDefinition } from "@/lib/template-engine/types";
import { DEFAULT_QUIZ_POSTER_TEMPLATE } from "@/lib/template-engine/templates/default-quiz-template";
import { DEFAULT_CERTIFICATE_TEMPLATE } from "@/lib/template-engine/templates/default-certificate-template";

export async function ensureDefaultTemplates(): Promise<void> {
  try {
    const count = await prisma.visualTemplate.count();
    if (count === 0) {
      logger.info("[TemplateService] Seeding default templates...");
      await prisma.visualTemplate.createMany({
        data: [
          {
            name: "Default Dark Quiz Poster",
            description: "High-impact dark mode portrait poster for daily quiz questions with QR code.",
            type: TemplateType.QUIZ_POSTER,
            width: DEFAULT_QUIZ_POSTER_TEMPLATE.width,
            height: DEFAULT_QUIZ_POSTER_TEMPLATE.height,
            isDefault: true,
            isActive: true,
            backgroundColor: DEFAULT_QUIZ_POSTER_TEMPLATE.backgroundColor,
            elements: JSON.parse(JSON.stringify(DEFAULT_QUIZ_POSTER_TEMPLATE.elements)),
          },
          {
            name: "Default Gold Contributor Certificate",
            description: "Luxury landscape certificate honoring contributor achievements and stats.",
            type: TemplateType.CONTRIBUTOR_CERTIFICATE,
            width: DEFAULT_CERTIFICATE_TEMPLATE.width,
            height: DEFAULT_CERTIFICATE_TEMPLATE.height,
            isDefault: true,
            isActive: true,
            backgroundColor: DEFAULT_CERTIFICATE_TEMPLATE.backgroundColor,
            elements: JSON.parse(JSON.stringify(DEFAULT_CERTIFICATE_TEMPLATE.elements)),
          },
        ],
      });
      logger.info("[TemplateService] Default templates seeded successfully.");
    }
  } catch (err) {
    logger.error("[TemplateService] Error ensuring default templates:", err);
  }
}

export async function getTemplates(options?: {
  type?: TemplateType;
  isActive?: boolean;
}) {
  try {
    await ensureDefaultTemplates();

    const where: any = {};
    if (options?.type) where.type = options.type;
    if (options?.isActive !== undefined) where.isActive = options.isActive;

    const templates = await prisma.visualTemplate.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        backgroundMedia: {
          select: { id: true, url: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true, user_name: true },
        },
      },
    });

    return { success: true, data: templates };
  } catch (err: any) {
    logger.error("[TemplateService] Error fetching templates:", err);
    return { success: false, error: err.message || "Failed to fetch templates" };
  }
}

export async function getTemplateById(id: number) {
  try {
    await ensureDefaultTemplates();

    const template = await prisma.visualTemplate.findUnique({
      where: { id },
      include: {
        backgroundMedia: {
          select: { id: true, url: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true, user_name: true },
        },
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, data: template };
  } catch (err: any) {
    logger.error(`[TemplateService] Error fetching template #${id}:`, err);
    return { success: false, error: err.message || "Failed to fetch template" };
  }
}

export async function getDefaultTemplateForType(type: TemplateType | string) {
  try {
    await ensureDefaultTemplates();

    const template = await prisma.visualTemplate.findFirst({
      where: {
        type: type as TemplateType,
        isActive: true,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      include: {
        backgroundMedia: {
          select: { id: true, url: true, name: true },
        },
      },
    });

    if (template) {
      return { success: true, data: template };
    }

    // Fallback in-memory template definition if DB query returns null
    if (type === "QUIZ_POSTER") {
      return {
        success: true,
        data: {
          id: 0,
          name: "Default Quiz Poster",
          type: "QUIZ_POSTER",
          width: DEFAULT_QUIZ_POSTER_TEMPLATE.width,
          height: DEFAULT_QUIZ_POSTER_TEMPLATE.height,
          backgroundColor: DEFAULT_QUIZ_POSTER_TEMPLATE.backgroundColor,
          elements: DEFAULT_QUIZ_POSTER_TEMPLATE.elements,
          backgroundMedia: null,
        },
      };
    }

    return {
      success: true,
      data: {
        id: 0,
        name: "Default Certificate",
        type: "CONTRIBUTOR_CERTIFICATE",
        width: DEFAULT_CERTIFICATE_TEMPLATE.width,
        height: DEFAULT_CERTIFICATE_TEMPLATE.height,
        backgroundColor: DEFAULT_CERTIFICATE_TEMPLATE.backgroundColor,
        elements: DEFAULT_CERTIFICATE_TEMPLATE.elements,
        backgroundMedia: null,
      },
    };
  } catch (err: any) {
    logger.error(`[TemplateService] Error getting default template for ${type}:`, err);
    return { success: false, error: err.message };
  }
}

export async function createTemplate(data: {
  name: string;
  description?: string;
  type: TemplateType;
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundMediaId?: number | null;
  elements: any;
  isDefault?: boolean;
  createdById?: number | null;
}) {
  try {
    if (data.isDefault) {
      // Unset previous defaults for this type
      await prisma.visualTemplate.updateMany({
        where: { type: data.type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.visualTemplate.create({
      data: {
        name: data.name,
        description: data.description || "",
        type: data.type,
        width: data.width || 1080,
        height: data.height || 1350,
        backgroundColor: data.backgroundColor || "#ffffff",
        backgroundMediaId: data.backgroundMediaId || null,
        elements: data.elements,
        isDefault: data.isDefault ?? false,
        createdById: data.createdById || null,
      },
    });

    return { success: true, data: template };
  } catch (err: any) {
    logger.error("[TemplateService] Error creating template:", err);
    return { success: false, error: err.message || "Failed to create template" };
  }
}

export async function updateTemplate(
  id: number,
  data: {
    name?: string;
    description?: string;
    type?: TemplateType;
    width?: number;
    height?: number;
    backgroundColor?: string;
    backgroundMediaId?: number | null;
    elements?: any;
    isDefault?: boolean;
    isActive?: boolean;
  }
) {
  try {
    if (data.isDefault && data.type) {
      await prisma.visualTemplate.updateMany({
        where: { type: data.type, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const template = await prisma.visualTemplate.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return { success: true, data: template };
  } catch (err: any) {
    logger.error(`[TemplateService] Error updating template #${id}:`, err);
    return { success: false, error: err.message || "Failed to update template" };
  }
}

export async function deleteTemplate(id: number) {
  try {
    await prisma.visualTemplate.delete({
      where: { id },
    });
    return { success: true };
  } catch (err: any) {
    logger.error(`[TemplateService] Error deleting template #${id}:`, err);
    return { success: false, error: err.message || "Failed to delete template" };
  }
}
