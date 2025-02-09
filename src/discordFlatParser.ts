import { Pool } from 'pg';
import OpenAI from 'openai';

interface DiscordData {
    guild: any;
    channel: any;
    dateRange: any;
    exportedAt: string;
    messages: any[];
}

export class DiscordFlatParser {
    private pool: Pool;
    private openai: OpenAI;

    constructor(connectionString: string, openaiApiKey: string) {
        this.pool = new Pool({
            connectionString,
        });
        this.openai = new OpenAI({
            apiKey: openaiApiKey
        });
    }

    private async getEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: text || "" // Handle empty messages
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error getting embedding:', error);
            return Array(1536).fill(0);  // Return zero vector of correct dimension
        }
    }

    async parseAndInsertFlat(data: DiscordData) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Process messages and get embeddings
            const values = await Promise.all(data.messages.map(async message => {
                const embedding = await this.getEmbedding(message.content);
                
                return {
                    // Message core data
                    message_id: message.id,
                    message_type: message.type,
                    message_timestamp: message.timestamp,
                    message_edited_timestamp: message.timestampEdited,
                    message_content: message.content,
                    is_pinned: message.isPinned,

                    // Guild data
                    guild_id: data.guild.id,
                    guild_name: data.guild.name,
                    guild_icon_url: data.guild.iconUrl,

                    // Channel data
                    channel_id: data.channel.id,
                    channel_type: data.channel.type,
                    channel_category_id: data.channel.categoryId,
                    channel_category_name: data.channel.category,
                    channel_name: data.channel.name,

                    // Author data
                    author_id: message.author.id,
                    author_name: message.author.name,
                    author_discriminator: message.author.discriminator,
                    author_nickname: message.author.nickname,
                    author_color: message.author.color,
                    author_is_bot: message.author.isBot,
                    author_avatar_url: message.author.avatarUrl,
                    author_roles: JSON.stringify(message.author.roles),

                    // JSON fields
                    attachments: JSON.stringify(message.attachments),
                    reactions: JSON.stringify(message.reactions),
                    mentions: JSON.stringify(message.mentions),
                    inline_emojis: JSON.stringify(message.inlineEmojis),

                    // Reference data
                    reference_message_id: message.reference?.messageId,
                    reference_channel_id: message.reference?.channelId,
                    reference_guild_id: message.reference?.guildId,

                    // Metadata
                    exported_at: data.exportedAt,

                    message_content_vec: `[${embedding.join(',')}]` // Format as PostgreSQL array
                };
            }));

            // Update the INSERT query to include message_content_vec
            const insertQuery = `
                INSERT INTO discord_messages_flat (
                    message_id, message_type, message_timestamp, message_edited_timestamp,
                    message_content, message_content_vec, is_pinned, guild_id, guild_name, guild_icon_url,
                    channel_id, channel_type, channel_category_id, channel_category_name,
                    channel_name, author_id, author_name, author_discriminator,
                    author_nickname, author_color, author_is_bot, author_avatar_url,
                    author_roles, attachments, reactions, mentions, inline_emojis,
                    reference_message_id, reference_channel_id, reference_guild_id,
                    exported_at
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                    $27, $28, $29, $30, $31
                )
                ON CONFLICT (message_id) DO UPDATE SET
                    message_edited_timestamp = EXCLUDED.message_edited_timestamp,
                    message_content = EXCLUDED.message_content,
                    message_content_vec = EXCLUDED.message_content_vec,
                    reactions = EXCLUDED.reactions
            `;

            // Update the batch processing
            const batchSize = 100;
            for (let i = 0; i < values.length; i += batchSize) {
                const batch = values.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(value => 
                        client.query(insertQuery, [
                            value.message_id,
                            value.message_type,
                            value.message_timestamp,
                            value.message_edited_timestamp,
                            value.message_content,
                            value.message_content_vec,
                            value.is_pinned,
                            value.guild_id,
                            value.guild_name,
                            value.guild_icon_url,
                            value.channel_id,
                            value.channel_type,
                            value.channel_category_id,
                            value.channel_category_name,
                            value.channel_name,
                            value.author_id,
                            value.author_name,
                            value.author_discriminator,
                            value.author_nickname,
                            value.author_color,
                            value.author_is_bot,
                            value.author_avatar_url,
                            value.author_roles,
                            value.attachments,
                            value.reactions,
                            value.mentions,
                            value.inline_emojis,
                            value.reference_message_id,
                            value.reference_channel_id,
                            value.reference_guild_id,
                            value.exported_at
                        ])
                    )
                );
            }

            await client.query('COMMIT');
            console.log(`Successfully inserted ${values.length} messages`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error inserting data:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}