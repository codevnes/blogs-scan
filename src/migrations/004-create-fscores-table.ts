import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('fscores', {
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
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('fscores');
  },
}; 