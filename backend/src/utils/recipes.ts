import { RecipeStep } from '../types/db';

// Utility function để tạo slug từ title (dùng chung cho admin và user)
export function generateRecipeSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .substring(0, 100); // Giới hạn độ dài
}

// Chuẩn hóa và sắp xếp steps cho công thức
export function normalizeRecipeSteps(
  steps: Array<{ order?: number; title?: string; content: string; imageUrl?: string }>
): RecipeStep[] {
  return steps
    .filter((step) => step && step.content && step.content.trim())
    .map((step, index) => ({
      order: step.order !== undefined ? step.order : index + 1,
      title: step.title?.trim() || undefined,
      content: step.content.trim(),
      imageUrl: step.imageUrl?.trim() || undefined,
    }))
    .sort((a, b) => a.order - b.order);
}




