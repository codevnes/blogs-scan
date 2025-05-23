import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Article from '../models/Article';
import ChatGPTResponse from '../models/ChatGPTResponse';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getPaginationParams, formatPaginatedResponse } from '../middleware/pagination';

dotenv.config();
const LOG_FOLDER = process.env.LOG_FOLDER || './logs';

// Get system status and statistics
export const getSystemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get article statistics
    const totalArticles = await Article.count();
    const processedArticles = await Article.count({ where: { isProcessed: true } });
    const unprocessedArticles = await Article.count({ where: { isProcessed: false } });
    
    // Get failed articles (has processing attempts but not processed)
    const failedArticles = await Article.count({
      where: {
        isProcessed: false,
        processingAttempts: { [Op.gt]: 0 }
      }
    });
    
    // Get recent failed articles
    const recentFailedArticles = await Article.findAll({
      where: {
        isProcessed: false,
        processingAttempts: { [Op.gt]: 0 },
        lastProcessingError: { [Op.ne]: null }
      },
      order: [['lastProcessingAttempt', 'DESC']],
      limit: 10
    });
    
    // Get article processing rate (articles processed in the last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const articlesProcessedLast24Hours = await ChatGPTResponse.count({
      where: {
        processedAt: { [Op.gte]: last24Hours }
      }
    });
    
    // Get latest log entries
    const logs = getLatestLogs();
    
    res.status(200).json({
      statistics: {
        totalArticles,
        processedArticles,
        unprocessedArticles,
        failedArticles,
        processingRate: {
          last24Hours: articlesProcessedLast24Hours
        }
      },
      recentFailedArticles,
      logs
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin hệ thống:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin hệ thống' });
  }
};

// Get list of failed articles for retry
export const getFailedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = getPaginationParams(req);
    const { limit, offset } = pagination;
    
    const { count, rows: failedArticles } = await Article.findAndCountAll({
      where: {
        isProcessed: false,
        processingAttempts: { [Op.gt]: 0 }
      },
      order: [['lastProcessingAttempt', 'DESC']],
      limit,
      offset
    });
    
    res.status(200).json(formatPaginatedResponse(failedArticles, count, pagination));
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết xử lý thất bại:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết xử lý thất bại' });
  }
};

// Get latest logs
const getLatestLogs = (lines: number = 100): { scrape: string, processing: string } => {
  try {
    const logsPath = path.resolve(process.cwd(), LOG_FOLDER);
    const scrapePath = path.join(logsPath, 'scrape.log');
    const processingPath = path.join(logsPath, 'processing.log');
    
    // Function to get last N lines of a file
    const getLastLines = (filePath: string, maxLines: number): string => {
      if (!fs.existsSync(filePath)) return 'Log file not found';
      
      const data = fs.readFileSync(filePath, 'utf-8');
      const allLines = data.split('\n');
      const lastLines = allLines.slice(-maxLines).join('\n');
      
      return lastLines;
    };
    
    return {
      scrape: getLastLines(scrapePath, lines),
      processing: getLastLines(processingPath, lines)
    };
  } catch (error) {
    console.error('Error reading log files:', error);
    return {
      scrape: 'Error reading log file',
      processing: 'Error reading log file'
    };
  }
}; 