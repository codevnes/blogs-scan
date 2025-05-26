import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class FScore extends Model {
  public id!: number;
  public symbol!: string;
  
  // Raw values
  public roa!: number;
  public cfo!: number;
  public delta_roa!: number;
  public cfo_lnst!: number;
  public delta_long_term_debt!: number;
  public delta_current_ratio!: number;
  public share_issuance!: number;
  public delta_gross_margin!: number;
  public delta_asset_turnover!: number;
  
  // Score components
  public profitability_score!: number;  // Sinh loi
  public leverage_score!: number;       // Don bay
  public efficiency_score!: number;     // Hieu qua
  public total_score!: number;          // Tong diem
  
  // Market data
  public pe_ratio!: number;
  public industry_pe!: number;
  public price_reserve_eps!: number;
  
  // Boolean values for individual F-Score criteria
  public roa_positive!: boolean;
  public cfo_positive!: boolean;
  public delta_roa_positive!: boolean;
  public cfo_greater_than_net_income!: boolean;
  public delta_long_term_debt_negative!: boolean;
  public delta_current_ratio_positive!: boolean;
  public no_share_issuance!: boolean;
  public delta_gross_margin_positive!: boolean;
  public delta_asset_turnover_positive!: boolean;
  
  public created_at!: Date;
  public updated_at!: Date;
}

FScore.init(
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
    // Raw values
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
    delta_long_term_debt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    delta_current_ratio: {
      type: DataTypes.FLOAT, 
      allowNull: true,
    },
    share_issuance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delta_gross_margin: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    delta_asset_turnover: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    // Score components
    profitability_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    leverage_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    efficiency_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    
    // Market data
    pe_ratio: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    industry_pe: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    price_reserve_eps: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    // Boolean values for individual F-Score criteria
    roa_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    cfo_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delta_roa_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    cfo_greater_than_net_income: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delta_long_term_debt_negative: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delta_current_ratio_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    no_share_issuance: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delta_gross_margin_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delta_asset_turnover_positive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    tableName: 'fscores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default FScore; 