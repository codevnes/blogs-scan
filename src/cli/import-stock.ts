import dotenv from 'dotenv';
import readline from 'readline';
import { analyzeStock } from '../services/stockAnalysisService';
import { initDatabase } from '../models';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Import a single stock
 */
const importSingleStock = async (symbol: string) => {
  try {
    console.log(`Importing data for symbol: ${symbol}`);
    const result = await analyzeStock(symbol);
    console.log(`Successfully imported data for symbol: ${symbol}`);
    return result;
  } catch (error: any) {
    console.error(`Error importing data for symbol ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Import multiple stocks
 */
const importMultipleStocks = async (symbols: string[]) => {
  console.log(`Importing data for ${symbols.length} symbols...`);
  const results = [];

  for (const symbol of symbols) {
    const result = await importSingleStock(symbol);
    if (result) {
      results.push(result);
    }
  }

  console.log(`Successfully imported data for ${results.length}/${symbols.length} symbols`);
  return results;
};

/**
 * Ask for symbols to import
 */
const askForSymbols = () => {
  return new Promise<string[]>((resolve) => {
    rl.question('Enter stock symbols (comma separated, e.g. "VIC,VHM,VRE"): ', (input) => {
      const symbols = input
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);
      
      resolve(symbols);
    });
  });
};

/**
 * Main function
 */
const main = async () => {
  try {
    // Initialize database
    console.log('Initializing database...');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    console.log('Database initialized successfully');

    // Get symbols from command line arguments or ask user
    let symbols: string[] = [];
    
    if (process.argv.length > 2) {
      symbols = process.argv.slice(2).map((s) => s.toUpperCase());
    } else {
      symbols = await askForSymbols();
    }

    if (symbols.length === 0) {
      console.error('No symbols provided. Exiting...');
      process.exit(1);
    }

    // Import stock data
    await importMultipleStocks(symbols);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the main function
main(); 