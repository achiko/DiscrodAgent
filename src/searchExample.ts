import { config } from './config';
import { VectorSearchService } from './services/vectorSearch';

const vectorSearchService = new VectorSearchService(config.connectionString, config.openaiApiKey);

async function performSearch(searchText: string) {
    try {
        // Perform search
        const searchResults = await vectorSearchService.searchSimilarMessages(searchText, 5);
        
        // Display results
        console.log("Search Results:");
        searchResults.forEach((result, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log(`Similarity Score: ${(result.similarity_score * 100).toFixed(2)}%`);
            console.log(`Message: ${result.message_content}`);
            console.log(`Author: ${result.author_name}`);
            console.log(`Channel: ${result.channel_name}`);
            console.log(`Guild: ${result.guild_name}`);
            console.log(result.message_timestamp);
        });
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        await vectorSearchService.close();
    }
}

// Example usage
performSearch('Your search query here'); 