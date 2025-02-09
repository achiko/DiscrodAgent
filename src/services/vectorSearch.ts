import { Pool } from 'pg';
import OpenAI from 'openai';

interface SearchResult {
    message_content: string;
    message_timestamp: Date;
    author_name: string;
    channel_name: string;
    guild_name: string;
    similarity_score: number;
}

export class VectorSearchService {
    private pool: Pool;
    private openai: OpenAI;

    constructor(connectionString: string, openaiApiKey: string) {
        this.pool = new Pool({ connectionString });
        this.openai = new OpenAI({ apiKey: openaiApiKey });
    }

    async searchSimilarMessages(searchText: string, limit: number = 5): Promise<SearchResult[]> {
        try {
            // Get embedding for search text using OpenAI
            const embedding = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: searchText,
            });

            // Format the vector as a string that PostgreSQL can understand
            const vectorString = `[${embedding.data[0].embedding.join(',')}]`;

            // Perform similarity search using cosine distance
            const result = await this.pool.query<SearchResult>(`
                SELECT 
                    message_content,
                    message_timestamp,
                    author_name,
                    channel_name,
                    guild_name,
                    1 - (message_content_vec <=> $1::vector) as similarity_score
                FROM discord_messages_flat
                WHERE message_content_vec IS NOT NULL
                ORDER BY message_content_vec <=> $1::vector
                LIMIT $2
            `, [vectorString, limit]);

            return result.rows;
        } catch (error) {
            console.error('Error performing similarity search:', error);
            throw error;
        }
    }

    async close() {
        await this.pool.end();
    }
} 