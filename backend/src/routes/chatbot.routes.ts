import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecipeModel } from '../models/recipe.model';

const router = express.Router();

// Khởi tạo Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCctQgFqUFULPa6rAm9izL0oWHIgufK-Gw';

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not found in environment variables');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// POST /api/chatbot/chat - Chat với AI để tìm kiếm công thức
router.post('/chat', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Chatbot service không khả dụng.' });
    }

    const { message, conversationHistory = [] } = req.body as {
      message?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập câu hỏi.' });
    }

    // Lấy danh sách công thức từ database để cung cấp context cho AI
    const recipes = await RecipeModel.find({ status: 'published' })
      .select('title description category tags ingredients.name difficulty cookingTimeMinutes slug')
      .limit(50)
      .lean();

    // Tạo context về các công thức có sẵn
    const recipesContext = recipes
      .map((r: any) => {
        const ingredients = (r.ingredients || []).map((ing: any) => ing.name).join(', ');
        return `- ${r.title} (${r.category}): ${r.description || ''} | Nguyên liệu: ${ingredients} | Độ khó: ${r.difficulty} | Thời gian: ${r.cookingTimeMinutes} phút`;
      })
      .join('\n');

    // System prompt
    const systemPrompt = `Bạn là một trợ lý AI thông minh của ứng dụng BepViet - một nền tảng chia sẻ công thức nấu ăn Việt Nam.

Nhiệm vụ của bạn:
1. Giúp người dùng tìm kiếm công thức phù hợp dựa trên câu hỏi của họ
2. Đề xuất công thức từ danh sách có sẵn
3. Trả lời các câu hỏi về nấu ăn, nguyên liệu, cách chế biến
4. Đưa ra lời khuyên về nấu ăn

Danh sách công thức hiện có:
${recipesContext}

Hướng dẫn:
- Khi người dùng hỏi về công thức, hãy đề xuất các công thức phù hợp từ danh sách trên
- Nếu không tìm thấy công thức phù hợp, hãy đề xuất các công thức tương tự
- Trả lời bằng tiếng Việt, thân thiện và nhiệt tình
- Nếu người dùng hỏi về cách nấu, hãy đưa ra lời khuyên chung hoặc đề xuất công thức cụ thể
- Khi đề xuất công thức, hãy liệt kê tên các món và nói rằng người dùng có thể click vào link bên dưới để xem chi tiết
- Đừng nói "truy cập website" mà hãy nói "click vào link bên dưới" hoặc "xem công thức chi tiết bên dưới"
- QUAN TRỌNG: Khi đề xuất công thức, hãy đánh dấu tên món bằng format [RECIPE:Tên Món] để hệ thống có thể tìm chính xác. Ví dụ: "Tôi đề xuất [RECIPE:Phở Bò Hà Nội] và [RECIPE:Bún Chả Hà Nội]"

Lưu ý: Chỉ đề xuất công thức từ danh sách trên, không tự tạo công thức mới.`;

    // Tạo model - sử dụng Gemini 2.5 Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Xây dựng conversation
    const chatHistory = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Thêm system prompt vào đầu conversation
    const fullPrompt = `${systemPrompt}\n\nCuộc trò chuyện:\n${chatHistory.map((h) => `${h.role}: ${h.parts[0].text}`).join('\n')}\n\nNgười dùng: ${message}\n\nTrợ lý:`;

    // Gọi API Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiMessage = response.text();

    // Extract tên các món từ response của AI (format [RECIPE:Tên Món])
    const recipeNamePattern = /\[RECIPE:([^\]]+)\]/g;
    const mentionedRecipeNames: string[] = [];
    let match;
    while ((match = recipeNamePattern.exec(aiMessage)) !== null) {
      mentionedRecipeNames.push(match[1].trim());
    }

    // Tìm kiếm công thức liên quan
    const messageLower = message.toLowerCase();
    
    // Tách các từ khóa từ message
    const keywords = messageLower
      .split(/\s+/)
      .filter((word) => word.length > 2); // Bỏ qua các từ quá ngắn
    
    // Map các từ khóa liên quan đến vùng miền
    const regionKeywords: Record<string, string[]> = {
      'bắc': ['bắc', 'hà nội', 'miền bắc', 'phía bắc', 'bắc bộ'],
      'trung': ['trung', 'miền trung', 'phía trung', 'trung bộ', 'huế', 'đà nẵng'],
      'nam': ['nam', 'miền nam', 'phía nam', 'nam bộ', 'sài gòn', 'tp.hcm', 'hồ chí minh'],
    };
    
    // Tìm các từ khóa vùng miền trong message
    const foundRegions: string[] = [];
    for (const [region, keywords] of Object.entries(regionKeywords)) {
      if (keywords.some((kw) => messageLower.includes(kw))) {
        foundRegions.push(region);
      }
    }
    
    // Tìm kiếm công thức - ưu tiên các món AI đã đề cập
    let relevantRecipes: any[] = [];
    
    // Nếu AI đã đề cập tên món cụ thể, match chính xác với database
    if (mentionedRecipeNames.length > 0) {
      const matchedRecipes = recipes
        .filter((r: any) => {
          const recipeTitle = (r.title || '').toLowerCase();
          // Kiểm tra xem tên món AI đề cập có khớp với title không (fuzzy match)
          return mentionedRecipeNames.some((mentionedName) => {
            const mentionedLower = mentionedName.toLowerCase();
            // Exact match hoặc title chứa tên món được đề cập
            return recipeTitle === mentionedLower || 
                   recipeTitle.includes(mentionedLower) ||
                   mentionedLower.includes(recipeTitle);
          });
        })
        .map((r: any) => ({
          id: r._id.toString(),
          slug: r.slug || r._id.toString(),
          title: r.title,
          category: r.category,
          difficulty: r.difficulty,
          cookingTimeMinutes: r.cookingTimeMinutes,
        }));
      
      relevantRecipes = matchedRecipes;
    }
    
    // Nếu không tìm thấy món cụ thể, dùng logic tìm kiếm thông thường nhưng với threshold cao hơn
    if (relevantRecipes.length === 0) {
      const scoredRecipes = recipes
        .map((r: any) => {
          const title = (r.title || '').toLowerCase();
          const description = (r.description || '').toLowerCase();
          const category = (r.category || '').toLowerCase();
          const tags = (r.tags || []).join(' ').toLowerCase();
          const ingredients = (r.ingredients || [])
            .map((ing: any) => ing.name.toLowerCase())
            .join(' ');
          
          let score = 0;
          
          // Tìm kiếm theo từng từ khóa
          keywords.forEach((keyword) => {
            if (title.includes(keyword)) score += 10;
            if (description.includes(keyword)) score += 5;
            if (category.includes(keyword)) score += 8;
            if (tags.includes(keyword)) score += 7;
            if (ingredients.includes(keyword)) score += 6;
          });
          
          // Tìm kiếm theo vùng miền
          if (foundRegions.length > 0) {
            foundRegions.forEach((region) => {
              if (tags.includes(region)) score += 15;
              if (title.includes(region)) score += 12;
              if (description.includes(region)) score += 8;
              // Tìm các từ khóa liên quan đến vùng miền
              regionKeywords[region].forEach((kw) => {
                if (tags.includes(kw)) score += 10;
                if (title.includes(kw)) score += 8;
              });
            });
          }
          
          // Tìm kiếm exact match với toàn bộ message
          if (title.includes(messageLower)) score += 20;
          if (description.includes(messageLower)) score += 10;
          if (tags.includes(messageLower)) score += 15;
          
          return { recipe: r, score };
        })
        .filter((item) => item.score >= 15) // Chỉ lấy các recipe có điểm >= 15 (threshold cao hơn)
        .sort((a, b) => b.score - a.score) // Sắp xếp theo điểm giảm dần
        .slice(0, 5) // Lấy top 5
        .map((item) => ({
          id: item.recipe._id.toString(),
          slug: item.recipe.slug || item.recipe._id.toString(),
          title: item.recipe.title,
          category: item.recipe.category,
          difficulty: item.recipe.difficulty,
          cookingTimeMinutes: item.recipe.cookingTimeMinutes,
        }));
      
      relevantRecipes = scoredRecipes;
    }
    
    // Nếu không tìm thấy công thức nào, trả về một số công thức phổ biến
    if (relevantRecipes.length === 0 && recipes.length > 0) {
      const fallbackRecipes = recipes
        .slice(0, 5)
        .map((r: any) => ({
          id: r._id.toString(),
          slug: r.slug || r._id.toString(),
          title: r.title,
          category: r.category,
          difficulty: r.difficulty,
          cookingTimeMinutes: r.cookingTimeMinutes,
        }));
      return res.json({
        message: aiMessage,
        suggestedRecipes: fallbackRecipes,
      });
    }

    return res.json({
      message: aiMessage,
      suggestedRecipes: relevantRecipes,
    });
  } catch (err: any) {
    console.error('Error in POST /api/chatbot/chat', err);
    return res.status(500).json({
      message: err.message || 'Lỗi server khi xử lý câu hỏi.',
    });
  }
});

export const chatbotRouter = router;

