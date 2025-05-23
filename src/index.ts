import dotenv from 'dotenv';
import app from './app';
import { initDatabase } from './models';
import { initScheduler } from './services/scheduler';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('Không thể khởi tạo cơ sở dữ liệu. Đang thoát...');
      process.exit(1);
    }
    
    // Start the scheduler
    initScheduler();
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khi khởi động máy chủ:', error);
    process.exit(1);
  }
};

startServer(); 