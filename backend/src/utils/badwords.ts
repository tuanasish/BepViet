// Danh sách từ ngữ không phù hợp bằng tiếng Việt
const vietnameseBadWords = [
  'địt', 'đụ', 'đéo', 'đĩ', 'đồ chó', 'đồ khốn', 'đồ ngu', 'đồ ngốc',
  'đồ súc vật', 'đồ thối', 'đồ điên', 'đồ dốt', 'đồ ngu xuẩn',
  'chết tiệt', 'chết bầm', 'chết cha', 'chết mẹ', 'chết cha mày',
  'cứt', 'cứt chó', 'cứt lợn',
  'khốn nạn', 'khốn kiếp', 'khốn khổ',
  'ngu', 'ngu xuẩn', 'ngu dốt', 'ngu si',
  'súc vật', 'súc sinh',
  'thằng ngu', 'thằng chó', 'thằng khốn',
  'con chó', 'con lợn', 'con heo',
  'đồ ngu', 'đồ chó', 'đồ lợn',
  'mẹ mày', 'cha mày', 'bố mày',
  'điên', 'điên khùng', 'điên rồ',
  'dại', 'dại dột',
  'ngu ngốc', 'ngu dại',
  'thô tục', 'tục tĩu',
  'xấu xa', 'xấu xí',
  // Từ viết tắt không phù hợp
  'ncc', 'vcl', 'vl', 'cc',
];

/**
 * Chuẩn hóa text để so sánh (chuyển về chữ thường, loại bỏ dấu cách thừa)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Kiểm tra xem text có chứa từ ngữ không phù hợp không
 * @param text - Text cần kiểm tra
 * @returns true nếu có từ ngữ không phù hợp, false nếu không
 */
export function containsBadWords(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const normalizedText = normalizeText(text);
  
  // Kiểm tra từng từ trong danh sách
  for (const badWord of vietnameseBadWords) {
    const normalizedBadWord = normalizeText(badWord);
    
    // Kiểm tra từ xuất hiện như một từ riêng biệt hoặc là một phần của từ
    // Sử dụng regex để tìm từ trong text
    const regex = new RegExp(
      `\\b${normalizedBadWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );
    
    if (regex.test(normalizedText)) {
      return true;
    }
    
    // Cũng kiểm tra nếu từ xuất hiện như một phần của text (không chỉ là từ riêng)
    if (normalizedText.includes(normalizedBadWord)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Làm sạch text bằng cách thay thế từ ngữ không phù hợp bằng dấu *
 * @param text - Text cần làm sạch
 * @returns Text đã được làm sạch
 */
export function cleanBadWords(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  let cleanedText = text;
  
  // Thay thế từng từ không phù hợp
  for (const badWord of vietnameseBadWords) {
    const regex = new RegExp(
      badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi'
    );
    cleanedText = cleanedText.replace(regex, (match) => '*'.repeat(match.length));
  }
  
  return cleanedText;
}

/**
 * Validate và làm sạch text, ném lỗi nếu có từ ngữ không phù hợp
 * @param text - Text cần validate
 * @param fieldName - Tên field để hiển thị trong thông báo lỗi
 * @param options - Options: { throwError: boolean, clean: boolean }
 * @returns Text đã được làm sạch (nếu clean = true) hoặc text gốc
 * @throws Error nếu throwError = true và có từ ngữ không phù hợp
 */
export function validateAndCleanText(
  text: string,
  fieldName: string = 'Nội dung',
  options: { throwError?: boolean; clean?: boolean } = { throwError: true, clean: false }
): string {
  if (!text || typeof text !== 'string') return text;

  const { throwError = true, clean = false } = options;

  const hasBadWords = containsBadWords(text);
  if (hasBadWords) {
    if (throwError) {
      throw new Error(`${fieldName} chứa từ ngữ không phù hợp. Vui lòng sửa lại.`);
    }
    if (clean) {
      return cleanBadWords(text);
    }
  }

  return text;
}

/**
 * Validate và làm sạch recipe data (title, description, steps)
 * @param recipeData - Recipe data cần validate
 * @param options - Options: { throwError: boolean, clean: boolean }
 * @returns Recipe data đã được validate và làm sạch
 * @throws Error nếu throwError = true và có từ ngữ không phù hợp
 */
export function validateRecipeData(
  recipeData: {
    title?: string;
    description?: string;
    steps?: Array<{ title?: string; content: string }>;
  },
  options: { throwError?: boolean; clean?: boolean } = { throwError: true, clean: false }
): typeof recipeData {
  const { throwError = true, clean = false } = options;
  const result = { ...recipeData };

  // Validate title
  if (result.title) {
    try {
      result.title = validateAndCleanText(result.title, 'Tiêu đề công thức', {
        throwError,
        clean,
      });
    } catch (err: any) {
      if (throwError) throw err;
    }
  }

  // Validate description
  if (result.description) {
    try {
      result.description = validateAndCleanText(result.description, 'Mô tả công thức', {
        throwError,
        clean,
      });
    } catch (err: any) {
      if (throwError) throw err;
    }
  }

  // Validate steps
  if (result.steps && Array.isArray(result.steps)) {
    result.steps = result.steps.map((step, index) => {
      const stepResult = { ...step };

      // Validate step title
      if (stepResult.title) {
        try {
          stepResult.title = validateAndCleanText(
            stepResult.title,
            `Tiêu đề bước ${index + 1}`,
            { throwError, clean }
          );
        } catch (err: any) {
          if (throwError) throw err;
        }
      }

      // Validate step content
      if (stepResult.content) {
        try {
          stepResult.content = validateAndCleanText(
            stepResult.content,
            `Nội dung bước ${index + 1}`,
            { throwError, clean }
          );
        } catch (err: any) {
          if (throwError) throw err;
        }
      }

      return stepResult;
    });
  }

  return result;
}

