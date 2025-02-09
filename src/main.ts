console.log(`
    ____  _            _                   _    _    _ ____    _    ____ _____ 
   |  _ \\| |          | |                 | |  | |  | |  _ \\  / \\  / ___| ____|
   | | | | | ___   ___| | __   __ _ _ __  | |  | |  | | | | |/ _ \\| |  _|  _|  
   | |_| | |/ _ \\ / __| |/ /  / _\` | '__| | |  | |  | | |_| / ___ \\ |_| | |___ 
   |____/|_| (_) | (__|   <  | (_| | |    | |__| |__| |  __/ ____ \\____|_____| 
               \\___|\\___|_|\\_\\  \\__,_|_|     \\____/\\____/|_|  /_/    \\_\\_____| 
  `);

import { config } from './config';
import { VectorSearchService } from './services/vectorSearch';
import OpenAI from 'openai';

const vectorSearchService = new VectorSearchService(config.connectionString, config.openaiApiKey);
const openai = new OpenAI({ apiKey: config.openaiApiKey });

async function performSearch(searchText: string) {
    try {
        const results = await vectorSearchService.searchSimilarMessages(searchText);
        
        // Sort messages by timestamp
        const sortedResults = results.sort((a, b) => 
            a.message_timestamp.getTime() - b.message_timestamp.getTime()
        );

        // Extract and combine message contents without dates
        const messageHistory = sortedResults
            .map(r => `${r.author_name}: ${r.message_content}`)
            .join('\n');

        // Create the prompt
        const prompt = `
Context from previous conversations:
${messageHistory}



Based on the conversation history above, please provide a relevant answer to the questions: 
How many times mentioned the ${searchText} 
Please list the messages where it was mentioned and with the sentiment analysis of the message 


If the context doesn't contain relevant information to answer the question, respond with "No relevant information found."

`;

        return {
            originalResults: results,
            sortedResults,
            prompt,
            messageHistory
        };
        
    } catch (error) {
        console.error('Error performing search:', error);
        throw error;
    } finally {
        await vectorSearchService.close();
    }
}

async function getOpenAIResponse(searchResults: Awaited<ReturnType<typeof performSearch>>) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that analyzes Discord conversation history and provides accurate, concise answers based on the context provided."
                },
                {
                    role: "user",
                    content: searchResults.prompt
                }
            ],
            model: "gpt-4o-mini", 
            temperature: 1,
            max_tokens: 2000
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error getting OpenAI response:', error);
        throw error;
    }
}

// Updated example usage
async function searchAndAnalyze(query: string) {
    try {
        const searchResults = await performSearch(query);
        const aiResponse = await getOpenAIResponse(searchResults);
        return {
            searchResults,
            aiResponse
        };
    } catch (error) {
        console.error('Error in searchAndAnalyze:', error);
        throw error;
    }
}

// Example usage
searchAndAnalyze('ElizaOS').then(result => {
    console.log('AI Response:', result.aiResponse);
    console.log('Full Results:', result);
}).catch(error => {
    console.error('Analysis failed:', error);
});

