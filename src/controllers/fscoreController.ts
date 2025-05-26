import { Request, Response } from 'express';
import FScore from '../models/FScore';
import { Op } from 'sequelize';

/**
 * Calculate FScore for a stock
 * POST /api/fscores/calculate
 */
export const calculateFScore = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Here you would implement the logic to calculate the F-Score
    // This typically involves fetching financial data and performing calculations
    // For now, we'll just create/update an entry with the provided data

    const { 
      roa, cfo, delta_roa, cfo_lnst, delta_long_term_debt,
      delta_current_ratio, share_issuance, delta_gross_margin,
      delta_asset_turnover, pe_ratio, industry_pe, price_reserve_eps
    } = req.body;

    // Calculate boolean values
    const roa_positive = roa > 0;
    const cfo_positive = cfo > 0;
    const delta_roa_positive = delta_roa > 0;
    const cfo_greater_than_net_income = cfo_lnst > 1;
    const delta_long_term_debt_negative = delta_long_term_debt < 0;
    const delta_current_ratio_positive = delta_current_ratio > 0;
    const no_share_issuance = share_issuance === 0;
    const delta_gross_margin_positive = delta_gross_margin > 0;
    const delta_asset_turnover_positive = delta_asset_turnover > 0;

    // Calculate component scores
    const profitability_score = 
      (roa_positive ? 1 : 0) + 
      (cfo_positive ? 1 : 0) + 
      (delta_roa_positive ? 1 : 0) + 
      (cfo_greater_than_net_income ? 1 : 0);

    const leverage_score = 
      (delta_long_term_debt_negative ? 1 : 0) + 
      (delta_current_ratio_positive ? 1 : 0);

    const efficiency_score = 
      (no_share_issuance ? 1 : 0) + 
      (delta_gross_margin_positive ? 1 : 0) + 
      (delta_asset_turnover_positive ? 1 : 0);

    // Calculate total score
    const total_score = profitability_score + leverage_score + efficiency_score;

    // Create or update the FScore entry
    const [fscore, created] = await FScore.upsert({
      symbol: symbol.toUpperCase(),
      roa,
      cfo,
      delta_roa,
      cfo_lnst,
      delta_long_term_debt,
      delta_current_ratio,
      share_issuance,
      delta_gross_margin,
      delta_asset_turnover,
      profitability_score,
      leverage_score,
      efficiency_score,
      total_score,
      pe_ratio,
      industry_pe,
      price_reserve_eps,
      roa_positive,
      cfo_positive,
      delta_roa_positive,
      cfo_greater_than_net_income,
      delta_long_term_debt_negative,
      delta_current_ratio_positive,
      no_share_issuance,
      delta_gross_margin_positive,
      delta_asset_turnover_positive
    });

    return res.status(200).json({
      success: true,
      data: fscore,
      created
    });
  } catch (error: any) {
    console.error('Error calculating F-Score:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while calculating the F-Score'
    });
  }
};

/**
 * Get FScore data by symbol
 * GET /api/fscores/:symbol
 */
export const getFScoreBySymbol = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const fscore = await FScore.findOne({
      where: { symbol: symbol.toUpperCase() }
    });
    
    if (!fscore) {
      return res.status(404).json({
        success: false,
        error: `F-Score data for symbol ${symbol} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: fscore
    });
  } catch (error: any) {
    console.error('Error getting F-Score data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while getting the F-Score data'
    });
  }
};

/**
 * Search FScores based on criteria
 * GET /api/fscores/search
 */
export const searchFScores = async (req: Request, res: Response) => {
  try {
    // Extract query parameters with default values
    const {
      min_score,
      max_score,
      positive_roa,
      positive_cfo,
      min_pe,
      max_pe,
      sort_by = 'total_score',
      sort_direction = 'DESC',
      limit = 20,
      offset = 0
    } = req.query;

    // Build where clause based on query parameters
    const whereClause: any = {};

    // Total score filtering
    if (min_score) whereClause.total_score = { ...whereClause.total_score, [Op.gte]: Number(min_score) };
    if (max_score) whereClause.total_score = { ...whereClause.total_score, [Op.lte]: Number(max_score) };
    
    // ROA filtering
    if (positive_roa === 'true') whereClause.roa_positive = true;
    
    // CFO filtering
    if (positive_cfo === 'true') whereClause.cfo_positive = true;
    
    // P/E ratio filtering
    if (min_pe) whereClause.pe_ratio = { ...whereClause.pe_ratio, [Op.gte]: Number(min_pe) };
    if (max_pe) whereClause.pe_ratio = { ...whereClause.pe_ratio, [Op.lte]: Number(max_pe) };
    
    // Determine sort order
    const order: any = [];
    if (sort_by) {
      const direction = (sort_direction && sort_direction.toString().toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
      order.push([String(sort_by), direction]);
    } else {
      order.push(['total_score', 'DESC']);
    }

    // Execute search query
    const fscores = await FScore.findAndCountAll({
      where: whereClause,
      order,
      limit: Number(limit),
      offset: Number(offset)
    });

    return res.status(200).json({
      success: true,
      total: fscores.count,
      data: fscores.rows,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    console.error('Error searching F-Scores:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while searching for F-Scores'
    });
  }
};

/**
 * Delete FScore entry by symbol
 * DELETE /api/fscores/:symbol
 */
export const deleteFScore = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const deleted = await FScore.destroy({
      where: { symbol: symbol.toUpperCase() }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: `F-Score data for symbol ${symbol} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `F-Score data for symbol ${symbol} deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting F-Score data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while deleting the F-Score data'
    });
  }
};

/**
 * Import batch FScore data
 * POST /api/fscores/import
 */
export const importFScores = async (req: Request, res: Response) => {
  try {
    const { fscores } = req.body;
    
    if (!fscores || !Array.isArray(fscores) || fscores.length === 0) {
      return res.status(400).json({ error: 'FScores array is required' });
    }
    
    const results = await Promise.all(fscores.map(async (fscore) => {
      const {
        symbol,
        roa, cfo, delta_roa, cfo_lnst, delta_long_term_debt,
        delta_current_ratio, share_issuance, delta_gross_margin,
        delta_asset_turnover, pe_ratio, industry_pe, price_reserve_eps
      } = fscore;
      
      if (!symbol) {
        return { error: 'Symbol is required', data: fscore };
      }
      
      // Calculate boolean values
      const roa_positive = roa > 0;
      const cfo_positive = cfo > 0;
      const delta_roa_positive = delta_roa > 0;
      const cfo_greater_than_net_income = cfo_lnst > 1;
      const delta_long_term_debt_negative = delta_long_term_debt < 0;
      const delta_current_ratio_positive = delta_current_ratio > 0;
      const no_share_issuance = share_issuance === 0;
      const delta_gross_margin_positive = delta_gross_margin > 0;
      const delta_asset_turnover_positive = delta_asset_turnover > 0;
      
      // Calculate component scores
      const profitability_score = 
        (roa_positive ? 1 : 0) + 
        (cfo_positive ? 1 : 0) + 
        (delta_roa_positive ? 1 : 0) + 
        (cfo_greater_than_net_income ? 1 : 0);
      
      const leverage_score = 
        (delta_long_term_debt_negative ? 1 : 0) + 
        (delta_current_ratio_positive ? 1 : 0);
      
      const efficiency_score = 
        (no_share_issuance ? 1 : 0) + 
        (delta_gross_margin_positive ? 1 : 0) + 
        (delta_asset_turnover_positive ? 1 : 0);
      
      // Calculate total score
      const total_score = profitability_score + leverage_score + efficiency_score;
      
      try {
        const [result, created] = await FScore.upsert({
          symbol: symbol.toUpperCase(),
          roa,
          cfo,
          delta_roa,
          cfo_lnst,
          delta_long_term_debt,
          delta_current_ratio,
          share_issuance,
          delta_gross_margin,
          delta_asset_turnover,
          profitability_score,
          leverage_score,
          efficiency_score,
          total_score,
          pe_ratio,
          industry_pe,
          price_reserve_eps,
          roa_positive,
          cfo_positive,
          delta_roa_positive,
          cfo_greater_than_net_income,
          delta_long_term_debt_negative,
          delta_current_ratio_positive,
          no_share_issuance,
          delta_gross_margin_positive,
          delta_asset_turnover_positive
        });
        
        return {
          success: true,
          symbol,
          created
        };
      } catch (error: any) {
        return {
          success: false,
          symbol,
          error: error.message
        };
      }
    }));
    
    return res.status(200).json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('Error importing F-Score data:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while importing F-Score data'
    });
  }
}; 