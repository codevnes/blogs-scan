import { Router } from 'express';
import {
  getArticles,
  getArticleById,
  getCollectedArticles,
  getProcessedArticles,
  triggerScrape,
  triggerChatGPTProcessing,
  deleteArticle,
  deleteMultipleArticles,
  reprocessArticle,
  reprocessMultipleArticles
} from '../controllers/articleController';

const router = Router();

// Article routes
router.get('/', getArticles);
router.get('/collected', getCollectedArticles);
router.get('/processed', getProcessedArticles);
router.post('/scrape', triggerScrape);
router.post('/process', triggerChatGPTProcessing);
router.post('/reprocess/:id', reprocessArticle);
router.post('/reprocess-batch', reprocessMultipleArticles);
router.delete('/:id', deleteArticle);
router.post('/delete-batch', deleteMultipleArticles);
router.get('/:id', getArticleById);

export default router; 