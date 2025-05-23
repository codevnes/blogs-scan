import axios from 'axios';
import * as cheerio from 'cheerio';
import Article from '../models/Article';

interface ArticleData {
  title: string;
  url: string;
  content: string;
  publishedAt?: Date;
}

/**
 * Scrapes the list of articles from the target URL
 */
export const scrapeArticlesList = async (targetUrl: string): Promise<string[]> => {
  try {
    console.log(`Đang thu thập danh sách bài viết từ ${targetUrl}`);
    const response = await axios.get(targetUrl, {
      maxRedirects: 5,
      validateStatus: (status) => status < 400
    });
    
    const $ = cheerio.load(response.data);
    
    const articleUrls: string[] = [];
    
    // Tìm kiếm tất cả các liên kết bài viết trong cấu trúc div.list-news-main hoặc div.listchungkhoannew
    $('div.list-news-main .tlitem a, div.listchungkhoannew .tlitem a, .featured-news a, .box-category-item a').each((_, element) => {
      // Lấy các liên kết trong thẻ h3 hoặc có class title
      if ($(element).parent().is('h3') || $(element).parents('h3').length > 0 || $(element).hasClass('title')) {
        const url = $(element).attr('href');
        if (url) {
          // Đảm bảo URL là tuyệt đối
          let fullUrl = url.startsWith('https://') ? url : `https://cafef.vn${url.startsWith('/') ? url : '/' + url}`;
          
          // Validate URL - use only cafef.vn URLs and make sure it has content identifiers
          const isValidUrl = fullUrl.includes('cafef.vn/') && 
                             fullUrl.includes('.chn') && 
                             !fullUrl.includes('video') &&
                             fullUrl.length < 200; // Avoid excessively long URLs
          
          // Kiểm tra nếu URL hợp lệ và chưa có trong danh sách thì thêm vào
          if (isValidUrl && !articleUrls.includes(fullUrl)) {
            articleUrls.push(fullUrl);
          }
        }
      }
    });
    
    console.log(`Đã tìm thấy ${articleUrls.length} bài viết để thu thập`);
    return articleUrls;
  } catch (error) {
    console.error('Lỗi khi thu thập danh sách bài viết:', error);
    return [];
  }
};

/**
 * Scrapes the content of a specific article
 */
export const scrapeArticleContent = async (url: string): Promise<ArticleData | null> => {
  try {
    console.log(`Đang thu thập nội dung bài viết từ ${url}`);
    
    // Set axios to automatically follow redirects
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Accept only success responses
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    // Check if we got a valid response
    if (response.status >= 300) {
      console.log(`Bỏ qua bài viết tại ${url}: HTTP code ${response.status}`);
      return null;
    }
    
    const $ = cheerio.load(response.data);
    
    // Extract article data - try different selectors to handle various page layouts
    const title = $('.kbwc-title, .title, h1.title').text().trim();
    
    // Try different content selectors
    let content = '';
    
    // Get the article content using different potential selectors
    const contentSelectors = [
      '.knc-content', 
      '.detail-content', 
      '.article-content', 
      'div[id*="content"]',
      '.newscontent', 
      '.maincontent', 
      '.article-body',
      '.knc-body',
      '#mainContent'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Found a matching element, extract its text
        content = element.text().trim();
        if (content) {
          console.log(`Đã tìm thấy nội dung sử dụng selector: ${selector}`);
          break;
        }
      }
    }
    
    // If we still don't have content, try extracting paragraphs directly
    if (!content) {
      const paragraphs: string[] = [];
      $('p').each((_, element) => {
        const paragraphText = $(element).text().trim();
        if (paragraphText && paragraphText.length > 30) {
          paragraphs.push(paragraphText);
        }
      });
      
      if (paragraphs.length > 0) {
        content = paragraphs.join('\n\n');
        console.log('Thu thập nội dung từ các thẻ <p>');
      }
    }
    
    // Try to extract publish date
    let publishedAt: Date | undefined;
    const dateText = $('.kbwc-time, .date, .time, .post-date').text().trim();
    if (dateText) {
      // Parse date format (example: 22/05/2025 - 15:52)
      const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})/);
      if (dateMatch) {
        const [_, day, month, year, hours, minutes] = dateMatch;
        publishedAt = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
      }
    }
    
    if (!title || !content) {
      console.log(`Bỏ qua bài viết tại ${url}: thiếu tiêu đề hoặc nội dung`);
      console.log(`Debug - Title found: ${title ? 'Yes' : 'No'}, Content found: ${content ? 'Yes' : 'No'}`);
      return null;
    }
    
    // Debug log showing content length
    console.log(`Đã trích xuất nội dung từ ${url}: ${content.length} ký tự`);
    
    return {
      title,
      url,
      content,
      publishedAt,
    };
  } catch (error) {
    console.error(`Lỗi khi thu thập nội dung bài viết từ ${url}:`, error);
    return null;
  }
};

/**
 * Process all articles from the target URL
 */
export const processArticles = async (targetUrl: string): Promise<number> => {
  try {
    console.log('Bắt đầu xử lý bài viết');
    const articleUrls = await scrapeArticlesList(targetUrl);
    
    if (articleUrls.length === 0) {
      console.log('Không tìm thấy bài viết nào để xử lý');
      return 0;
    }
    
    console.log(`Tìm thấy ${articleUrls.length} bài viết để xử lý`);
    let newArticles = 0;
    
    for (const url of articleUrls) {
      // Check if article already exists in the database
      const existingArticle = await Article.findOne({ where: { url } });
      
      if (!existingArticle) {
        const articleData = await scrapeArticleContent(url);
        
        if (articleData) {
          await Article.create({
            title: articleData.title,
            url: articleData.url,
            content: articleData.content,
            publishedAt: articleData.publishedAt,
            scrapedAt: new Date(),
            isProcessed: false,
            processingAttempts: 0,
            lastProcessingError: null,
            lastProcessingAttempt: null
          });
          
          newArticles++;
          console.log(`Đã lưu bài viết mới: ${articleData.title}`);
        }
      } else {
        console.log(`Bài viết đã tồn tại: ${url}`);
      }
    }
    
    console.log(`Đã xử lý ${articleUrls.length} bài viết, thêm ${newArticles} bài viết mới`);
    return newArticles;
  } catch (error) {
    console.error('Lỗi khi xử lý bài viết:', error);
    return 0;
  }
};

/**
 * Trích xuất danh sách bài viết từ HTML đã có sẵn
 */
export const extractArticlesFromHTML = (html: string): string[] => {
  try {
    const $ = cheerio.load(html);
    const articleUrls: string[] = [];
    
    // Trích xuất tất cả các liên kết trong thẻ h3 từ các tlitem
    $('.tlitem h3 a').each((_, element) => {
      const url = $(element).attr('href');
      if (url) {
        // Đảm bảo URL là tuyệt đối
        const fullUrl = url.startsWith('https://') ? url : `https://cafef.vn${url}`;
        
        // Kiểm tra nếu URL chưa có trong danh sách thì thêm vào
        if (!articleUrls.includes(fullUrl)) {
          articleUrls.push(fullUrl);
        }
      }
    });
    
    return articleUrls;
  } catch (error) {
    console.error('Lỗi khi trích xuất bài viết từ HTML:', error);
    return [];
  }
}; 