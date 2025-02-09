import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const { 
    POSTGRES_USER, 
    POSTGRES_PASSWORD, 
    POSTGRES_HOST, 
    POSTGRES_PORT, 
    POSTGRES_DB, 
    OPENAI_API_KEY 
} = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_PORT || !POSTGRES_DB || !OPENAI_API_KEY) {
    console.error('Missing required environment variables for database connection');
    process.exit(1);
}

export const config = {
    connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
    openaiApiKey: OPENAI_API_KEY
}; 