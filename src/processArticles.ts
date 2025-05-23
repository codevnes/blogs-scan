import dotenv from 'dotenv';
import { initDatabase } from './models';
import { processUnprocessedArticles } from './services/chatgpt';

// Load environment variables
dotenv.config();

const runProcess = async () => {
  try {
    // Initialize database connection
    console.log('Đang kết nối tới cơ sở dữ liệu...');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('Không thể khởi tạo cơ sở dữ liệu. Đang thoát...');
      process.exit(1);
    }
    
    console.log('Đã kết nối thành công tới cơ sở dữ liệu');
    
    // Process all unprocessed articles
    console.log('Đang xử lý các bài viết chưa được xử lý bằng ChatGPT...');
    const result = await processUnprocessedArticles();
    
    console.log('--------- KẾT QUẢ XỬ LÝ BÀI VIẾT ---------');
    console.log(`Thành công: ${result.success ? 'Có' : 'Không'}`);
    console.log(`Số bài viết đã xử lý: ${result.articlesProcessed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi xử lý bài viết:', error);
    process.exit(1);
  }
};

// Run the process
runProcess(); 