#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { scrapeArticleContent } from '../services/scraper';
import dotenv from 'dotenv';
import { processArticleWithChatGPT } from '../services/chatgpt';
import sequelize from '../config/database';
import Article from '../models/Article';
import ChatGPTResponse from '../models/ChatGPTResponse';

// Cấu hình môi trường
dotenv.config();

/**
 * Công cụ dòng lệnh để quét nội dung từ danh sách liên kết
 * 
 * Sử dụng:
 * - Đọc từ tệp: node dist/cli/crawl-links.js --file=links.txt --save-db --gpt
 */

async function main() {
  try {
    // Phân tích tham số dòng lệnh
    const args = process.argv.slice(2);
    const options: { [key: string]: string | boolean } = {};
    
    args.forEach(arg => {
      if (arg.startsWith('--')) {
        if (arg.includes('=')) {
          const [key, value] = arg.slice(2).split('=');
          options[key] = value;
        } else {
          // Xử lý tham số dạng flag
          options[arg.slice(2)] = true;
        }
      }
    });
    
    // Đảm bảo có tệp đầu vào
    if (!options.file) {
      console.error('Vui lòng cung cấp tệp liên kết với --file=links.txt');
      process.exit(1);
    }
    
    // Kiểm tra xem có cần kết nối cơ sở dữ liệu không
    const saveToDb = options['save-db'] === true;
    const processWithGPT = options.gpt === true;
    
    if (saveToDb) {
      console.log('Kết nối đến cơ sở dữ liệu...');
      try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Kết nối cơ sở dữ liệu thành công');
      } catch (error) {
        console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
        process.exit(1);
      }
    }
    
    // Đọc danh sách liên kết
    const filePath = path.resolve(process.cwd(), options.file as string);
    const links = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(link => link.trim());
    
    console.log(`Bắt đầu quét ${links.length} liên kết...`);
    
    // Thư mục để lưu kết quả
    const outputDir = options.output ? 
      path.resolve(process.cwd(), options.output as string) : 
      path.resolve(process.cwd(), 'crawled_articles');
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Lấy mẫu nhắc nhở từ biến môi trường hoặc sử dụng mặc định
    const promptTemplate = process.env.GPT_PROMPT_TEMPLATE || 
      "Phân tích bài viết sau từ CafeF: {{content}}";
    
    // Quét từng liên kết
    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      console.log(`[${i+1}/${links.length}] Đang quét: ${url}`);
      
      try {
        // Kiểm tra nếu đã có trong cơ sở dữ liệu
        if (saveToDb) {
          const existingArticle = await Article.findOne({ where: { url } });
          
          if (existingArticle) {
            console.log(`Bài viết đã tồn tại trong cơ sở dữ liệu: ${url}`);
            continue;
          }
        }
        
        // Quét nội dung
        const article = await scrapeArticleContent(url);
        
        if (!article) {
          console.error(`Không thể quét nội dung từ ${url}`);
          continue;
        }
        
        // Lưu kết quả vào cơ sở dữ liệu nếu cần
        if (saveToDb) {
          const savedArticle = await Article.create({
            title: article.title,
            url: article.url,
            content: article.content,
            publishedAt: article.publishedAt,
            scrapedAt: new Date(),
            isProcessed: false,
            processingAttempts: 0,
          });
          
          console.log(`Đã lưu vào cơ sở dữ liệu: ${article.title}`);
          
          // Xử lý với ChatGPT nếu cần
          if (processWithGPT && savedArticle) {
            console.log(`Đang xử lý với ChatGPT: ${article.title}`);
            
            try {
              const response = await processArticleWithChatGPT(savedArticle, promptTemplate);
              
              if (response) {
                await ChatGPTResponse.create({
                  articleId: savedArticle.id,
                  response: response.response || '',
                  promptUsed: promptTemplate,
                  processedAt: new Date(),
                });
                
                savedArticle.isProcessed = true;
                await savedArticle.save();
                
                console.log(`Đã xử lý ChatGPT thành công: ${article.title}`);
              } else {
                console.error(`Xử lý ChatGPT thất bại: ${article.title}`);
              }
            } catch (error) {
              console.error(`Lỗi khi xử lý ChatGPT: ${error}`);
            }
          }
        }
        
        // Lưu vào tệp
        const fileName = `${outputDir}/${path.basename(url)}.json`;
        fs.writeFileSync(fileName, JSON.stringify(article, null, 2), 'utf-8');
        console.log(`Đã lưu vào tệp: ${fileName}`);
        
        // Thêm thời gian chờ ngắn để tránh gây quá tải cho máy chủ
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Lỗi khi xử lý ${url}:`, error);
      }
    }
    
    console.log('Quá trình quét hoàn tất');
    
    // Đóng kết nối cơ sở dữ liệu nếu đã mở
    if (saveToDb) {
      await sequelize.close();
    }
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

main(); 