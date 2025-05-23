import sequelize from '../config/database';
import Article from './Article';
import ChatGPTResponse from './ChatGPTResponse';

// Initialize models
const models = {
  Article,
  ChatGPTResponse,
};

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối đến cơ sở dữ liệu đã được thiết lập thành công.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Tất cả các mô hình đã được đồng bộ hóa thành công.');
    
    return true;
  } catch (error) {
    console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
    return false;
  }
};

export { initDatabase };
export default models; 