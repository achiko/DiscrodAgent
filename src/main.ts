console.log(`
  ____  _            _                   _    _    _ ____    _    ____ _____ 
 |  _ \\| |          | |                 | |  | |  | |  _ \\  / \\  / ___| ____|
 | | | | | ___   ___| | __   __ _ _ __  | |  | |  | | | | |/ _ \\| |  _|  _|  
 | |_| | |/ _ \\ / __| |/ /  / _\` | '__| | |  | |  | | |_| / ___ \\ |_| | |___ 
 |____/|_| (_) | (__|   <  | (_| | |    | |__| |__| |  __/ ____ \\____|_____| 
             \\___|\\___|_|\\_\\  \\__,_|_|     \\____/\\____/|_|  /_/    \\_\\_____| 
`);



import { DiscordFlatParser } from './discordFlatParser';
import dotenv from 'dotenv';
import fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: '.env' });


async function main() {
 
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, OPENAI_API_KEY } = process.env;
    

    // Validate that all required environment variables are present
    if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT || !POSTGRES_DB || !OPENAI_API_KEY) {
        console.error('Missing required environment variables for database connection');
        process.exit(1);
    }

    // Construct and validate connection string
    const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
    const openaiApiKey = process.env.OPENAI_API_KEY || '';


    try {
        new URL(connectionString);
    } catch (error: unknown) {
        console.error('Invalid database connection string:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }

    const parser = new DiscordFlatParser(connectionString, openaiApiKey);

    const dataPath = path.join(__dirname, 'ethglobal.json');
    console.log(dataPath);
    
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const discordData = JSON.parse(rawData);
        console.log(discordData.messages.length);

        await parser.parseAndInsertFlat(discordData);

    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            console.error('Error: Discord data file not found at:', dataPath);
        } else {
            console.error('Failed to process data:', error instanceof Error ? error.message : String(error));
        }
    }

}

main().catch(console.error);