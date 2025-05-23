import cron from 'node-cron';
import dotenv from 'dotenv';
import { processArticles } from './scraper';
import { processUnprocessedArticles } from './chatgpt';
import fs from 'fs';
import path from 'path';

dotenv.config();

const {
  SCRAPE_INTERVAL = '30',
  TARGET_URL = 'https://cafef.vn/thi-truong-chung-khoan.chn',
  SCRAPE_SOURCES = 'https://cafef.vn/thi-truong-chung-khoan.chn,https://cafef.vn/thoi-su-kinh-doanh.chn,https://cafef.vn/doanh-nghiep.chn',
  LOG_FOLDER = './logs',
} = process.env;

// Ensure log folder exists
if (!fs.existsSync(LOG_FOLDER)) {
  fs.mkdirSync(LOG_FOLDER, { recursive: true });
}

// Create log file streams
const logsPath = path.resolve(process.cwd(), LOG_FOLDER);
const scrapeLogStream = fs.createWriteStream(path.join(logsPath, 'scrape.log'), { flags: 'a' });
const processingLogStream = fs.createWriteStream(path.join(logsPath, 'processing.log'), { flags: 'a' });

// Enhanced logging function
const logToFile = (stream: fs.WriteStream, message: string): void => {
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
};

// Convert interval from minutes to cron expression
const getCronExpression = (intervalMinutes: number): string => {
  if (intervalMinutes < 1) intervalMinutes = 1;
  if (intervalMinutes >= 60) {
    // If interval is in hours
    const hours = Math.floor(intervalMinutes / 60);
    return hours === 1 ? '0 * * * *' : `0 */${hours} * * *`;
  } else {
    // If interval is in minutes
    return `*/${intervalMinutes} * * * *`;
  }
};

// Get array of target URLs from environment variable
const getTargetUrls = (): string[] => {
  if (!SCRAPE_SOURCES) return [TARGET_URL];
  
  const urls = SCRAPE_SOURCES.split(',').map(url => url.trim());
  if (urls.length === 0) return [TARGET_URL];
  
  return urls;
};

// Run scraping with retry mechanism
const runScrapingWithRetry = async (maxRetries = 3): Promise<number> => {
  const targetUrls = getTargetUrls();
  let totalNewArticles = 0;
  
  logToFile(scrapeLogStream, `Bắt đầu thu thập bài viết từ ${targetUrls.length} nguồn`);
  
  for (const url of targetUrls) {
    let retries = 0;
    let success = false;
    
    while (retries < maxRetries && !success) {
      try {
        logToFile(scrapeLogStream, `Đang thu thập từ nguồn: ${url} (lần thử ${retries + 1})`);
        const newArticles = await processArticles(url);
        logToFile(scrapeLogStream, `Đã thu thập ${newArticles} bài viết mới từ ${url}`);
        totalNewArticles += newArticles;
        success = true;
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = retries * 1000;
          logToFile(scrapeLogStream, `Lỗi thu thập từ ${url}, sẽ thử lại sau ${waitTime}ms: ${error}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          logToFile(scrapeLogStream, `Không thể thu thập từ ${url} sau ${maxRetries} lần thử: ${error}`);
        }
      }
    }
  }
  
  logToFile(scrapeLogStream, `Hoàn tất thu thập: đã thêm ${totalNewArticles} bài viết mới`);
  return totalNewArticles;
};

// Run ChatGPT processing with retry mechanism
const runChatGPTProcessingWithRetry = async (maxRetries = 3): Promise<number> => {
  let retries = 0;
  let success = false;
  let articlesProcessed = 0;
  
  logToFile(processingLogStream, 'Bắt đầu xử lý các bài viết chưa xử lý với ChatGPT');
  
  while (retries < maxRetries && !success) {
    try {
      const result = await processUnprocessedArticles();
      
      if (result.success) {
        articlesProcessed = result.articlesProcessed;
        logToFile(processingLogStream, `Đã xử lý thành công ${articlesProcessed} bài viết với ChatGPT`);
        success = true;
      } else {
        throw new Error('Xử lý thất bại');
      }
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        // Wait before retrying (exponential backoff)
        const waitTime = retries * 2000;
        logToFile(processingLogStream, `Lỗi xử lý ChatGPT, sẽ thử lại sau ${waitTime}ms: ${error}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        logToFile(processingLogStream, `Không thể xử lý với ChatGPT sau ${maxRetries} lần thử: ${error}`);
      }
    }
  }
  
  return articlesProcessed;
};

// Initialize scheduler
export const initScheduler = (): void => {
  const intervalMinutes = parseInt(SCRAPE_INTERVAL, 10);
  const cronExpression = getCronExpression(intervalMinutes);
  
  logToFile(scrapeLogStream, `Lên lịch thu thập bài viết mỗi ${intervalMinutes} phút (${cronExpression})`);
  
  // Schedule scraping task
  cron.schedule(cronExpression, async () => {
    logToFile(scrapeLogStream, 'Đang chạy thu thập theo lịch...');
    try {
      const newArticles = await runScrapingWithRetry();
      
      // Process articles with ChatGPT automatically
      if (newArticles > 0) {
        logToFile(processingLogStream, 'Đang xử lý bài viết mới với ChatGPT...');
        const articlesProcessed = await runChatGPTProcessingWithRetry();
        logToFile(processingLogStream, `Xử lý ChatGPT hoàn tất: đã xử lý ${articlesProcessed} bài viết`);
      } else {
        logToFile(scrapeLogStream, 'Không có bài viết mới để xử lý');
      }
    } catch (error) {
      logToFile(scrapeLogStream, `Lỗi nghiêm trọng trong tác vụ theo lịch: ${error}`);
    }
  });
  
  // Run an initial scrape on startup with short delay
  setTimeout(async () => {
    logToFile(scrapeLogStream, 'Đang chạy thu thập ban đầu...');
    try {
      const newArticles = await runScrapingWithRetry();
      
      // Process articles with ChatGPT automatically
      if (newArticles > 0) {
        logToFile(processingLogStream, 'Đang xử lý bài viết mới với ChatGPT...');
        const articlesProcessed = await runChatGPTProcessingWithRetry();
        logToFile(processingLogStream, `Xử lý ChatGPT hoàn tất: đã xử lý ${articlesProcessed} bài viết`);
      } else {
        logToFile(scrapeLogStream, 'Không có bài viết mới để xử lý');
      }
    } catch (error) {
      logToFile(scrapeLogStream, `Lỗi nghiêm trọng trong thu thập ban đầu: ${error}`);
    }
  }, 5000); // Wait 5 seconds after startup
}; 