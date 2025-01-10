# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /smart-health-tst

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /smart-health-tst
COPY --from=deps /smart-health-tst/node_modules ./node_modules
COPY . .

# Set environment variables during build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_HUGGING_FACE_API_KEY
ARG NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME
ARG MUSICMATE_API_KEY
ARG RECIPE_API_KEY
ARG CHATBOT_BASE_URL
ARG FORUM_API_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_HUGGING_FACE_API_KEY=$NEXT_PUBLIC_HUGGING_FACE_API_KEY
ENV NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME=$NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME
ENV MUSICMATE_API_KEY=$MUSICMATE_API_KEY
ENV RECIPE_API_KEY=$RECIPE_API_KEY
ENV CHATBOT_BASE_URL=$CHATBOT_BASE_URL
ENV FORUM_API_KEY=$FORUM_API_KEY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /smart-health-tst

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts
COPY --from=builder /smart-health-tst/public ./public
COPY --from=builder --chown=nextjs:nodejs /smart-health-tst/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /smart-health-tst/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /smart-health-tst/ ./

COPY --chown=nextjs:nodejs public/ ./public/

# Set environment variables in runtime
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_HUGGING_FACE_API_KEY=$NEXT_PUBLIC_HUGGING_FACE_API_KEY
ENV NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME=$NEXT_PUBLIC_HUGGING_FACE_MODEL_NAME
ENV MUSICMATE_API_KEY=$MUSICMATE_API_KEY
ENV RECIPE_API_KEY=$RECIPE_API_KEY
ENV CHATBOT_BASE_URL=$CHATBOT_BASE_URL
ENV FORUM_API_KEY=$FORUM_API_KEY

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]