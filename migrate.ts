import 'dotenv/config';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// This is required for the WebSocket connection to work in Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations completed successfully.');
    // It's important to end the pool to allow the script to exit gracefully.
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    // Also end the pool on error
    await pool.end();
    process.exit(1);
  }
}

main();
