FROM oven/bun:latest

WORKDIR /app

RUN bun init -y
RUN bun add watercrawl
