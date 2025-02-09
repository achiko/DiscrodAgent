# Discrod Chat Extractor

## Description

We use the [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter) to extract data from Discord channels.

## How to use

```bash
docker run -it --rm -v $(pwd)/data:/data tyrrrz/discordchatexporter --token $DISCORD_TOKEN --channels $CHANNEL_ID --output /data/channel.json


```

## How to get the CHANNEL_ID

You can get the CHANNEL_ID by going to the channel in the browser and looking at the URL.

For example This is the URL for the **agentic ethereum** channel:
https://discord.com/channels/554623348622098432/1319401418532065280
From this link the last part `1319401418532065280` is the CHANNEL_ID 



## Obtaining Token and Channel IDs
:  https://github.com/Tyrrrz/DiscordChatExporter/blob/f31e73bb7a392f450448625db9d69e20df75d634/.docs/Token-and-IDs.md



p.s do not share the DISCORD_TOKEN with anyone. put it in the .env file.




