# MarketGenie

Your AI Marketing Agent: transform campaign details into ready-to-post social media content in seconds.

## Overview
MarketGenie lets small businesses and creators sign in via Auth0, define a campaign (product, budget, audience), and automatically generates social-media posts (titles, descriptions, schedules, formats) for Twitter, Instagram, LinkedIn, and more. All assets are stored in PostgreSQL on AWS RDS.

## Features
- **Auth & Profiles**: Auth0 for login, signup, and role-based access.  
- **Campaign Builder**: Create campaigns with product details, budget, and target audience.  
- **AI Content Generation**: Anthropic Claude crafts an array of post objects in JSON.  
- **Asset Storage**: Express.js + PostgreSQL schema for campaigns and their generated posts.  
- **Responsive UI**: Next.js + Chakra UI for a polished frontend experience.  

## Tech Stack 🚀  
- **Frontend**: Next.js, React, Chakra UI, Auth0 SDK  
- **Backend**: Node.js, Express.js, `pg` for PostgreSQL , Python
- **Database**: AWS RDS (PostgreSQL)  
- **AI Service**: Anthropic Claude via `@anthropic-ai/sdk`  
- **Hosting**: Vercel for frontend, AWS for backend and database

  ## Archirecture :
  ![architecture](https://github.com/user-attachments/assets/c7fe6b3a-f7d0-42a7-92fc-3678c6acdca0)


## Local Setup & Run

### 1. Backend

```bash
cd backend
yarn install

# Copy .env (fill in with your RDS, Auth0 & Anthropic creds)
cp .env.example .env

# Run migrations
node src/migrations/001-create-users.js
node src/migrations/002-create-campaigns.js
node src/migrations/003-create-campaign-assets.js

# Start server
yarn dev
```

### 2. Frontend
```bash
cd frontend
yarn install

# Copy .env.local (fill in with your Auth0 settings)
cp .env.local.example .env.local

# Start Next.js
yarn dev
```


