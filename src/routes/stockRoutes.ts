import express from 'express';
import * as stockAnalysisController from '../controllers/stockAnalysisController';

const router = express.Router();

/**
 * @route   POST /api/stocks/analyze
 * @desc    Analyze a stock by symbol
 * @access  Public
 */
router.post('/analyze', stockAnalysisController.analyzeStock);

/**
 * @route   GET /api/stocks/:symbol
 * @desc    Get stock analysis by symbol
 * @access  Public
 */
router.get('/:symbol', stockAnalysisController.getStockAnalysis);

/**
 * @route   POST /api/stocks/import
 * @desc    Import stock data
 * @access  Public
 */
router.post('/import', stockAnalysisController.importStockData);

/**
 * @route   GET /api/stocks/search
 * @desc    Search stocks by financial criteria
 * @access  Public
 */
router.get('/search', stockAnalysisController.searchStocks);

export default router; 