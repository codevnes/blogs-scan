import { Request, Response } from 'express';
import * as stockAnalysisService from '../services/stockAnalysisService';
import StockAnalysis from '../models/StockAnalysis';
import { Op } from 'sequelize';

/**
 * Analyze a stock by symbol
 * POST /api/stocks/analyze
 */
export const analyzeStock = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const analysis = await stockAnalysisService.analyzeStock(symbol.toUpperCase());
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Error analyzing stock:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while analyzing the stock'
    });
  }
};

/**
 * Get stock analysis by symbol
 * GET /api/stocks/:symbol
 */
export const getStockAnalysis = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const analysis = await stockAnalysisService.getStockAnalysis(symbol.toUpperCase());
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: `Analysis for symbol ${symbol} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Error getting stock analysis:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while getting the stock analysis'
    });
  }
};

/**
 * Import stock data
 * POST /api/stocks/import
 */
export const importStockData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const analysis = await stockAnalysisService.importStockData(symbol.toUpperCase());
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Error importing stock data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while importing the stock data'
    });
  }
};

/**
 * Search stocks based on financial criteria
 * GET /api/stocks/search
 */
export const searchStocks = async (req: Request, res: Response) => {
  try {
    // Extract query parameters with default values
    const {
      min_fscore,
      max_fscore,
      min_zscore,
      max_zscore,
      min_pe,
      max_pe,
      min_eps,
      positive_cfo,
      sector_id,
      sort_by,
      sort_direction,
      limit = 20,
      offset = 0
    } = req.query;

    // Build where clause based on query parameters
    const whereClause: any = {};

    // F-Score filtering
    if (min_fscore) whereClause.f_score = { ...whereClause.f_score, [Op.gte]: Number(min_fscore) };
    if (max_fscore) whereClause.f_score = { ...whereClause.f_score, [Op.lte]: Number(max_fscore) };
    
    // Z-Score filtering
    if (min_zscore) whereClause.z_score = { ...whereClause.z_score, [Op.gte]: Number(min_zscore) };
    if (max_zscore) whereClause.z_score = { ...whereClause.z_score, [Op.lte]: Number(max_zscore) };
    
    // P/E ratio filtering
    if (min_pe) whereClause.pe_ratio = { ...whereClause.pe_ratio, [Op.gte]: Number(min_pe) };
    if (max_pe) whereClause.pe_ratio = { ...whereClause.pe_ratio, [Op.lte]: Number(max_pe) };
    
    // EPS filtering
    if (min_eps) whereClause.eps = { ...whereClause.eps, [Op.gte]: Number(min_eps) };
    
    // CFO filtering (positive)
    if (positive_cfo === 'true') whereClause.cfo = { [Op.gt]: 0 };
    
    // Sector filtering
    if (sector_id) whereClause.sector_id = Number(sector_id);

    // Determine sort order
    const order: any = [];
    if (sort_by) {
      const direction = (sort_direction && sort_direction.toString().toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
      order.push([String(sort_by), direction]);
    } else {
      // Default sort by f_score descending
      order.push(['f_score', 'DESC']);
    }

    // Execute search query
    const stocks = await StockAnalysis.findAndCountAll({
      where: whereClause,
      order,
      limit: Number(limit),
      offset: Number(offset),
      attributes: [
        'id', 'symbol', 'f_score', 'z_score', 
        'roa', 'cfo', 'debt_change', 
        'eps', 'pe_ratio', 'revenue', 'gross_profit', 'net_profit',
        'sector_id', 'industry_rank',
        'created_at'
      ]
    });

    return res.status(200).json({
      success: true,
      total: stocks.count,
      data: stocks.rows,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    console.error('Error searching stocks:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while searching for stocks'
    });
  }
}; 