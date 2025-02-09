import dotenv from 'dotenv';
import { VectorSearchService } from './services/vectorSearch';

// Load environment variables
dotenv.config();

async function main() {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, OPENAI_API_KEY } = process.env;

    // Validate environment variables
    if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT || !POSTGRES_DB || !OPENAI_API_KEY) {
        console.error('Missing required environment variables');
        process.exit(1);
    }

    // Create connection string
    const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
    
    // Initialize search service
    const searchService = new VectorSearchService(connectionString, OPENAI_API_KEY);

    try {
        // Perform search
        const searchResults = await searchService.searchSimilarMessages("Your search query here", 5);
        
        // Display results
        console.log("Search Results:");
        searchResults.forEach((result, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log(`Similarity Score: ${(result.similarity_score * 100).toFixed(2)}%`);
            console.log(`Message: ${result.message_content}`);
            console.log(`Author: ${result.author_name}`);
            console.log(`Channel: ${result.channel_name}`);
            console.log(`Guild: ${result.guild_name}`);
            console.log(`Time: ${result.message_timestamp}`);
        });
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        await searchService.close();
    }
}

main().catch(console.error); 