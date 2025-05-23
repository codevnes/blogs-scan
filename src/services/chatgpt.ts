import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import Article from '../models/Article';
import ChatGPTResponse from '../models/ChatGPTResponse';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessResult {
  success: boolean;
  articlesProcessed: number;
}

/**
 * Process a single article with ChatGPT
 */
export const processArticleWithChatGPT = async (
  article: Article,
  promptTemplate: string
): Promise<{success: boolean, response?: string, error?: string}> => {
  try {
    // Update processing attempt tracking
    article.processingAttempts += 1;
    article.lastProcessingAttempt = new Date();
    await article.save();

    // Check if article content exists
    if (!article.content || article.content.trim() === '') {
      const error = `Bài viết ID=${article.id}, Title="${article.title}" không có nội dung`;
      console.error(error);
      
      // Update error tracking
      article.lastProcessingError = error;
      await article.save();
      
      return { success: false, error };
    }

    // Clean article content by removing extra spaces and non-content elements
    const cleanContent = article.content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/(CÙNG CHUYÊN MỤC|Xem theo ngày|Ngày|Tháng|Năm|XEM).+?(?=CÙNG CHUYÊN MỤC|$)/gs, '') // Remove calendar navigation
      .replace(/TIN MỚI\s+/g, '') // Remove "TIN MỚI" label
      .replace(/\s+/g, ' '); // Clean up any remaining extra spaces

    // Create a complete prompt with the article content
    const prompt = `Hãy đọc và phân tích bài viết tài chính sau, sau đó tóm tắt thành một đoạn văn ngắn gọn, súc tích có độ dài chính xác từ 250 đến 300 ký tự. Đảm bảo tóm tắt phải bao gồm các ý chính và thông tin quan trọng từ bài viết gốc. Không đưa ra nhận xét cá nhân hay phân tích ngoài nội dung bài viết. Chỉ trả về đoạn tóm tắt và KHÔNG bao gồm bất kỳ câu giới thiệu hoặc kết luận nào. Không bắt đầu bằng "Bài viết này..." hoặc "Đoạn này...". Nghiêm túc đảm bảo độ dài tóm tắt từ 250-300 ký tự.

Tiêu đề: ${article.title}

Nội dung bài viết: ${cleanContent}`;
    
    console.log(`Đang xử lý bài viết với ChatGPT: ${article.title}`);
    console.log(`Độ dài nội dung: ${cleanContent.length} ký tự`);
    console.log(`Phần đầu nội dung sau khi làm sạch: ${cleanContent.substring(0, 100)}...`);
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "gpt-4.1",
      temperature: 0.7
    });
    
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      const error = 'Phản hồi từ ChatGPT trống';
      console.error(error);
      
      // Update error tracking
      article.lastProcessingError = error;
      await article.save();
      
      return { success: false, error };
    }
    
    // Clear any previous errors since we succeeded
    article.lastProcessingError = null;
    await article.save();
    
    return { success: true, response };
  } catch (error: any) {
    const errorMessage = `Lỗi khi xử lý bài viết với ChatGPT: ${error?.message || 'Unknown error'}`;
    console.error(errorMessage);
    
    // Update error tracking
    if (article) {
      article.lastProcessingError = errorMessage;
      await article.save();
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Reprocess a specific article with ChatGPT, regardless of its previous processing status
 */
export const reprocessArticleWithChatGPT = async (articleId: number): Promise<{success: boolean, response?: string}> => {
  try {
    // Find the article
    const article = await Article.findByPk(articleId);
    
    if (!article) {
      console.error(`Không tìm thấy bài viết với ID=${articleId}`);
      return { success: false };
    }
    
    // Use the latest prompt template
    const promptTemplate = 'Hãy đọc và phân tích bài viết tài chính sau, sau đó tóm tắt thành một đoạn văn ngắn gọn, súc tích có độ dài chính xác từ 250 đến 300 ký tự. Đảm bảo tóm tắt phải bao gồm các ý chính và thông tin quan trọng từ bài viết gốc. Không đưa ra nhận xét cá nhân hay phân tích ngoài nội dung bài viết. Chỉ trả về đoạn tóm tắt và KHÔNG bao gồm bất kỳ câu giới thiệu hoặc kết luận nào. Không bắt đầu bằng "Bài viết này..." hoặc "Đoạn này...". Nghiêm túc đảm bảo độ dài tóm tắt từ 250-300 ký tự.';
    
    console.log(`Đang xử lý lại bài viết ID=${articleId}, Title="${article.title}"`);
    
    const result = await processArticleWithChatGPT(article, promptTemplate);
    
    if (result.success && result.response) {
      // Check if there's an existing response
      const existingResponse = await ChatGPTResponse.findOne({
        where: { articleId: article.id }
      });
      
      if (existingResponse) {
        // Update existing response
        existingResponse.response = result.response;
        existingResponse.promptUsed = promptTemplate;
        existingResponse.processedAt = new Date();
        await existingResponse.save();
      } else {
        // Create new response
        await ChatGPTResponse.create({
          articleId: article.id,
          response: result.response,
          promptUsed: promptTemplate,
          processedAt: new Date(),
        });
      }
      
      // Mark the article as processed
      article.isProcessed = true;
      await article.save();
      
      console.log(`Xử lý lại thành công bài viết ID=${articleId}`);
      return { success: true, response: result.response };
    } else {
      console.error(`Xử lý lại thất bại bài viết ID=${articleId}: ${result.error}`);
      return { success: false };
    }
  } catch (error: any) {
    console.error(`Lỗi khi xử lý lại bài viết với ID=${articleId}: ${error?.message || 'Unknown error'}`);
    return { success: false };
  }
};

/**
 * Process all unprocessed articles
 */
export const processUnprocessedArticles = async (): Promise<ProcessResult> => {
  try {
    console.log('Đang tìm kiếm các bài viết chưa được xử lý...');
    
    // Find all unprocessed articles
    const unprocessedArticles = await Article.findAll({
      where: { isProcessed: false },
      order: [['processingAttempts', 'ASC'], ['id', 'ASC']], // Process articles with fewer attempts first
    });
    
    if (unprocessedArticles.length === 0) {
      console.log('Không tìm thấy bài viết chưa xử lý');
      return { success: true, articlesProcessed: 0 };
    }
    
    console.log(`Tìm thấy ${unprocessedArticles.length} bài viết chưa xử lý`);
    let articlesProcessed = 0;
    
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Lỗi: OPENAI_API_KEY không được cấu hình trong tệp .env');
      return { success: false, articlesProcessed: 0 };
    }

    // We'll use a fixed prompt template that doesn't rely on the {{content}} placeholder
    const promptTemplate = 'Hãy đọc và phân tích bài viết tài chính sau, sau đó tóm tắt thành một đoạn văn ngắn gọn, súc tích có độ dài chính xác từ 250 đến 300 ký tự. Đảm bảo tóm tắt phải bao gồm các ý chính và thông tin quan trọng từ bài viết gốc. Không đưa ra nhận xét cá nhân hay phân tích ngoài nội dung bài viết. Chỉ trả về đoạn tóm tắt và KHÔNG bao gồm bất kỳ câu giới thiệu hoặc kết luận nào. Không bắt đầu bằng "Bài viết này..." hoặc "Đoạn này...". Nghiêm túc đảm bảo độ dài tóm tắt từ 250-300 ký tự.'
    
    for (const article of unprocessedArticles) {
      console.log(`Đang xử lý bài viết: "${article.title}" (ID: ${article.id})`);
      console.log(`URL: ${article.url}`);
      console.log(`Nội dung có sẵn: ${article.content ? 'Có' : 'Không'}`);
      console.log(`Số lần thử xử lý trước đó: ${article.processingAttempts}`);
      
      if (article.content) {
        console.log(`Độ dài nội dung: ${article.content.length} ký tự`);
        console.log(`Phần đầu nội dung: ${article.content.substring(0, 100)}...`);
      }
      
      const result = await processArticleWithChatGPT(article, promptTemplate);
      
      if (result.success && result.response) {
        // Save the ChatGPT response to the database
        await ChatGPTResponse.create({
          articleId: article.id,
          response: result.response,
          promptUsed: promptTemplate,
          processedAt: new Date(),
        });
        
        // Mark the article as processed
        article.isProcessed = true;
        await article.save();
        
        articlesProcessed++;
        console.log(`Xử lý thành công bài viết: ${article.title}`);
        console.log(`Phản hồi ChatGPT: ${result.response.substring(0, 100)}...`);
      } else {
        console.error(`Xử lý thất bại bài viết: ${article.title}: ${result.error}`);
      }
    }
    
    console.log(`Đã xử lý ${articlesProcessed} trên ${unprocessedArticles.length} bài viết`);
    return { success: true, articlesProcessed };
  } catch (error) {
    console.error('Lỗi khi xử lý bài viết chưa xử lý:', error);
    return { success: false, articlesProcessed: 0 };
  }
}; 