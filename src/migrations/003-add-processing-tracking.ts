import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('articles', 'processingAttempts', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });
  
  await queryInterface.addColumn('articles', 'lastProcessingError', {
    type: DataTypes.TEXT,
    allowNull: true,
  });
  
  await queryInterface.addColumn('articles', 'lastProcessingAttempt', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  
  console.log('Migration: Added processing tracking columns to articles table');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('articles', 'processingAttempts');
  await queryInterface.removeColumn('articles', 'lastProcessingError');
  await queryInterface.removeColumn('articles', 'lastProcessingAttempt');
  
  console.log('Migration: Removed processing tracking columns from articles table');
} 