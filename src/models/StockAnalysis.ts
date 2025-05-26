import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class StockAnalysis extends Model {
  public id!: number;
  public symbol!: string;
  
  // F-Score data
  public f_score!: number;
  public roa!: number;
  public cfo!: number;
  public delta_roa!: number;
  public cfo_lnst!: number;
  public debt_change!: number;
  public current_ratio_change!: number;
  public share_issuance!: number;
  public gross_margin_change!: number;
  public asset_turnover_change!: number;
  
  // Z-Score data
  public z_score!: number;
  public sector_id!: number;
  public industry_rank!: number;
  
  // Financial report data
  public revenue!: number;
  public gross_profit!: number;
  public net_profit!: number;
  public eps!: number;
  public pe_ratio!: number;
  
  // Analysis results from GPT
  public financial_health!: string;  // F-Score analysis
  public industry_comparison!: string;  // Z-Score analysis
  public risk_warnings!: string;  // Warnings from financial report
  public investment_recommendation!: string;  // Investment recommendation
  public raw_data!: object;  // Raw data used for analysis
  
  public created_at!: Date;
  public updated_at!: Date;
}

StockAnalysis.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    // F-Score data
    f_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roa: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    cfo: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    delta_roa: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    cfo_lnst: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    debt_change: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    current_ratio_change: {
      type: DataTypes.FLOAT, 
      allowNull: true,
    },
    share_issuance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gross_margin_change: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    asset_turnover_change: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    // Z-Score data
    z_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    industry_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    
    // Financial report data
    revenue: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    gross_profit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    net_profit: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    eps: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    pe_ratio: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    // Analysis results
    financial_health: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    industry_comparison: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    risk_warnings: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    investment_recommendation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    raw_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'stock_analysis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default StockAnalysis; 