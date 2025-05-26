import express, { Application } from 'express';
import cors from 'cors';
import articleRoutes from './routes/articleRoutes';
import adminRoutes from './routes/adminRoutes';
import stockRoutes from './routes/stockRoutes';
import fscoreRoutes from './routes/fscoreRoutes';
import { paginationMiddleware } from './middleware/pagination';

const app: Application = express();

// Configure CORS to allow all origins (bypass CORS restrictions)
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(paginationMiddleware);

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/fscores', fscoreRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'API Thu Thập Bài Viết CafeF',
    endpoints: {
      articles: '/api/articles',
      collectedArticles: '/api/articles/collected',
      processedArticles: '/api/articles/processed',
      scrape: '/api/articles/scrape (POST)',
      process: '/api/articles/process (POST)',
      reprocessArticle: '/api/articles/reprocess/:id (POST)',
      reprocessBatch: '/api/articles/reprocess-batch (POST)',
      deleteArticle: '/api/articles/:id (DELETE)',
      deleteBatch: '/api/articles/delete-batch (POST)',
      admin: {
        status: '/api/admin/status',
        failedArticles: '/api/admin/failed-articles'
      },
      stocks: {
        analyze: '/api/stocks/analyze (POST)',
        getAnalysis: '/api/stocks/:symbol (GET)',
        importData: '/api/stocks/import (POST)'
      },
      fscores: {
        calculate: '/api/fscores/calculate (POST)',
        getFScore: '/api/fscores/:symbol (GET)',
        search: '/api/fscores/search (GET)',
        deleteFScore: '/api/fscores/:symbol (DELETE)',
        importFScores: '/api/fscores/import (POST)'
      }
    },
    pagination: {
      usage: 'Add ?page=1&pageSize=20 parameters to paginated endpoints',
      defaults: 'page=1, pageSize=20, maxPageSize=100'
    }
  });
});

export default app; 