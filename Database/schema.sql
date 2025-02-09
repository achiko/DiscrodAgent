-- Create a single flat table for Discord messages
DROP TABLE IF EXISTS discord_messages_flat;
CREATE TABLE discord_messages_flat (
    -- Message core data
    message_id VARCHAR(20) PRIMARY KEY,
    message_type VARCHAR(20),
    message_timestamp TIMESTAMP WITH TIME ZONE,
    message_edited_timestamp TIMESTAMP WITH TIME ZONE,
    message_content TEXT,
    message_content_vec vector(1536),
    is_pinned BOOLEAN,
    
    -- Guild data
    guild_id VARCHAR(20),
    guild_name VARCHAR(255),
    guild_icon_url TEXT,
    
    -- Channel data
    channel_id VARCHAR(20),
    channel_type VARCHAR(50),
    channel_category_id VARCHAR(20),
    channel_category_name VARCHAR(255),
    channel_name VARCHAR(255),
    
    -- Author data
    author_id VARCHAR(20),
    author_name VARCHAR(255),
    author_discriminator VARCHAR(4),
    author_nickname VARCHAR(255),
    author_color VARCHAR(7),
    author_is_bot BOOLEAN,
    author_avatar_url TEXT,
    author_roles JSONB, -- Store roles as JSON array
    
    -- Attachments, reactions, mentions as JSON
    attachments JSONB,
    reactions JSONB,
    mentions JSONB,
    inline_emojis JSONB,
    
    -- Reference data (for replies)
    reference_message_id VARCHAR(20),
    reference_channel_id VARCHAR(20),
    reference_guild_id VARCHAR(20),
    
    -- Metadata
    exported_at TIMESTAMP WITH TIME ZONE,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
DROP INDEX IF EXISTS idx_discord_messages_guild_id;
CREATE INDEX idx_discord_messages_guild_id ON discord_messages_flat(guild_id);
DROP INDEX IF EXISTS idx_discord_messages_channel_id;
CREATE INDEX idx_discord_messages_channel_id ON discord_messages_flat(channel_id);
DROP INDEX IF EXISTS idx_discord_messages_author_id;
CREATE INDEX idx_discord_messages_author_id ON discord_messages_flat(author_id);
DROP INDEX IF EXISTS idx_discord_messages_timestamp;
CREATE INDEX idx_discord_messages_timestamp ON discord_messages_flat(message_timestamp);