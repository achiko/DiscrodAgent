# Vector Database

We use [PGVector]( https://github.com/pgvector/pgvector) to store the data. The Open-source vector similarity search for Postgres

## Getting Started

```sql 
CREATE EXTENSION vector;
```

## Adding Vector Field

```sql

ALTER TABLE discord_messages_flat 
ADD COLUMN message_content_vec vector(1536);
```




