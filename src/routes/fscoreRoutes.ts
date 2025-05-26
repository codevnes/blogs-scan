import express from 'express';
import * as fscoreController from '../controllers/fscoreController';

const router = express.Router();

/**
 * @route   POST /api/fscores/calculate
 * @desc    Calculate F-Score for a stock
 * @access  Public
 */
router.post('/calculate', fscoreController.calculateFScore);

/**
 * @route   GET /api/fscores/:symbol
 * @desc    Get F-Score data by symbol
 * @access  Public
 */
router.get('/:symbol', fscoreController.getFScoreBySymbol);

/**
 * @route   GET /api/fscores/search
 * @desc    Search F-Scores by criteria
 * @access  Public
 */
router.get('/search', fscoreController.searchFScores);

/**
 * @route   DELETE /api/fscores/:symbol
 * @desc    Delete F-Score entry by symbol
 * @access  Public
 */
router.delete('/:symbol', fscoreController.deleteFScore);

/**
 * @route   POST /api/fscores/import
 * @desc    Import batch F-Score data
 * @access  Public
 */
router.post('/import', fscoreController.importFScores);

export default router; 