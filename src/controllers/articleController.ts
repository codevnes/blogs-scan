import { Request, Response } from 'express';
import Article from '../models/Article';
import ChatGPTResponse from '../models/ChatGPTResponse';
import { processArticles } from '../services/scraper';
import { processUnprocessedArticles, reprocessArticleWithChatGPT } from '../services/chatgpt';
import { getPaginationParams, formatPaginatedResponse } from '../middleware/pagination';

// Get all articles
export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPaginationParams(req);
    const { limit, offset } = pagination;
    
    const { count, rows: articles } = await Article.findAndCountAll({
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
    });
    
    res.status(200).json(formatPaginatedResponse(articles, count, pagination));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết' });
  }
};

// Get all collected articles (all articles that have been scraped)
export const getCollectedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPaginationParams(req);
    const { limit, offset } = pagination;
    
    const { count, rows: articles } = await Article.findAndCountAll({
      order: [['scrapedAt', 'DESC']],
      limit,
      offset,
    });
    
    res.status(200).json(formatPaginatedResponse(articles, count, pagination));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết đã thu thập:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã thu thập' });
  }
};

// Get all processed articles (where isProcessed = true)
export const getProcessedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPaginationParams(req);
    const { limit, offset } = pagination;
    
    const { count, rows: articles } = await Article.findAndCountAll({
      where: {
        isProcessed: true
      },
      include: [{ model: ChatGPTResponse, as: 'ChatGPTResponses' }],
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
    });
    
    res.status(200).json(formatPaginatedResponse(articles, count, pagination));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết đã xử lý:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã xử lý' });
  }
};

// Get article by ID
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const article = await Article.findByPk(id, {
      include: [{ model: ChatGPTResponse, as: 'ChatGPTResponses' }],
    });
    
    if (!article) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }
    
    res.status(200).json(article);
  } catch (error) {
    console.error(`Lỗi khi lấy bài viết với ID ${id}:`, error);
    res.status(500).json({ message: 'Lỗi khi lấy bài viết' });
  }
};

// Manually trigger article scraping
export const triggerScrape = async (req: Request, res: Response): Promise<void> => {
  try {
    // Allow custom target URL from request body
    const requestUrl = req.body?.url?.trim();
    
    // Default URLs to try if none provided
    const defaultUrls = [
      'https://cafef.vn/thi-truong-chung-khoan.chn',
      'https://cafef.vn/thoi-su-kinh-doanh.chn', 
      'https://cafef.vn/doanh-nghiep.chn'
    ];
    
    const targetUrls = requestUrl ? [requestUrl] : defaultUrls;
    let totalNewArticles = 0;
    
    // Process multiple URLs
    for (const url of targetUrls) {
      try {
        console.log(`Đang thu thập bài viết từ nguồn: ${url}`);
        const newArticles = await processArticles(url);
        totalNewArticles += newArticles;
      } catch (error) {
        console.error(`Lỗi khi thu thập từ ${url}:`, error);
      }
    }
    
    res.status(200).json({
      message: `Thu thập bài viết thành công`,
      newArticles: totalNewArticles,
      sourcesProcessed: targetUrls.length
    });
  } catch (error) {
    console.error('Lỗi khi kích hoạt thu thập bài viết:', error);
    res.status(500).json({ message: 'Lỗi khi thu thập bài viết' });
  }
};

// Manually trigger ChatGPT processing
export const triggerChatGPTProcessing = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await processUnprocessedArticles();
    
    if (result.success) {
      res.status(200).json({
        message: 'Xử lý ChatGPT hoàn tất',
        articlesProcessed: result.articlesProcessed,
      });
    } else {
      res.status(500).json({ message: 'Lỗi khi xử lý bài viết với ChatGPT' });
    }
  } catch (error) {
    console.error('Lỗi khi kích hoạt xử lý ChatGPT:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý bài viết với ChatGPT' });
  }
};

// Delete article by ID
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    // First check if the article exists
    const article = await Article.findByPk(id);
    
    if (!article) {
      res.status(404).json({ message: 'Không tìm thấy bài viết' });
      return;
    }
    
    // Delete associated ChatGPT responses first to maintain referential integrity
    await ChatGPTResponse.destroy({
      where: {
        articleId: id
      }
    });
    
    // Then delete the article
    await article.destroy();
    
    res.status(200).json({ 
      message: 'Đã xoá bài viết thành công',
      deletedArticleId: id
    });
  } catch (error) {
    console.error(`Lỗi khi xoá bài viết với ID ${id}:`, error);
    res.status(500).json({ message: 'Lỗi khi xoá bài viết' });
  }
};

// Delete multiple articles
export const deleteMultipleArticles = async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'Cần cung cấp danh sách ID bài viết để xoá' });
    return;
  }
  
  try {
    // First delete associated ChatGPT responses
    await ChatGPTResponse.destroy({
      where: {
        articleId: ids
      }
    });
    
    // Then delete the articles
    const deletedCount = await Article.destroy({
      where: {
        id: ids
      }
    });
    
    res.status(200).json({ 
      message: `Đã xoá thành công ${deletedCount} bài viết`,
      deletedCount,
      deletedIds: ids
    });
  } catch (error) {
    console.error(`Lỗi khi xoá nhiều bài viết:`, error);
    res.status(500).json({ message: 'Lỗi khi xoá bài viết' });
  }
};

// Reprocess a specific article with ChatGPT
export const reprocessArticle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const result = await reprocessArticleWithChatGPT(parseInt(id, 10));
    
    if (result.success) {
      res.status(200).json({
        message: `Đã xử lý lại bài viết thành công`,
        articleId: id,
        response: result.response
      });
    } else {
      res.status(500).json({ message: 'Xử lý lại bài viết thất bại' });
    }
  } catch (error) {
    console.error(`Lỗi khi xử lý lại bài viết với ID ${id}:`, error);
    res.status(500).json({ message: 'Lỗi khi xử lý lại bài viết' });
  }
};

// Reprocess multiple articles with ChatGPT
export const reprocessMultipleArticles = async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'Cần cung cấp danh sách ID bài viết để xử lý lại' });
    return;
  }
  
  try {
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    for (const id of ids) {
      const result = await reprocessArticleWithChatGPT(parseInt(id, 10));
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      results.push({
        articleId: id,
        success: result.success
      });
    }
    
    res.status(200).json({
      message: `Xử lý lại hoàn tất: ${successCount} thành công, ${failCount} thất bại`,
      results
    });
  } catch (error) {
    console.error('Lỗi khi xử lý lại nhiều bài viết:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý lại bài viết' });
  }
}; 