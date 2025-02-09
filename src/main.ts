console.log(`
    ____  _            _                   _    _    _ ____    _    ____ _____ 
   |  _ \\| |          | |                 | |  | |  | |  _ \\  / \\  / ___| ____|
   | | | | | ___   ___| | __   __ _ _ __  | |  | |  | | | | |/ _ \\| |  _|  _|  
   | |_| | |/ _ \\ / __| |/ /  / _\` | '__| | |  | |  | | |_| / ___ \\ |_| | |___ 
   |____/|_| (_) | (__|   <  | (_| | |    | |__| |__| |  __/ ____ \\____|_____| 
               \\___|\\___|_|\\_\\  \\__,_|_|     \\____/\\____/|_|  /_/    \\_\\_____| 
  `);


import dotenv from 'dotenv';
dotenv.config({ path: '.env' });


import { VectorSearchService } from './services/vectorSearch';
import { Pool } from 'pg';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, OPENAI_API_KEY } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT || !POSTGRES_DB || !OPENAI_API_KEY) {
    console.error('Missing required environment variables for database connection');
    process.exit(1);
}

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

const vectorSearchService = new VectorSearchService(connectionString, OPENAI_API_KEY);

async function performSearch(searchText: string) {
    try {
        const results = await vectorSearchService.searchSimilarMessages(searchText);
        console.log('Search results:', results);
    } catch (error) {
        console.error('Error performing search:', error);
    } finally {
        await vectorSearchService.close();
    }
}

// Example usage
performSearch('ElizoOS');

