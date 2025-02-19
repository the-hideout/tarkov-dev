FROM marksoftbot/base AS base

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY apps/bot/package.json ./apps/bot/package.json

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn workspace @marksoftbot/bot build

ENV NODE_ENV production

CMD ["yarn", "workspace", "@marksoftbot/bot", "start"] 