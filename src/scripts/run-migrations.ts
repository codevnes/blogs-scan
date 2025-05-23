import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import sequelize from '../config/database';

/**
 * Runs SQL migrations manually using Sequelize's query method
 */
async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/001-update-columns-to-text.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons to get individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement}`);
        await sequelize.query(statement);
        console.log('Statement executed successfully');
      }
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 