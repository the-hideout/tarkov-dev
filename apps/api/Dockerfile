FROM marksoftbot/base AS base

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn workspace @marksoftbot/api build

ENV NODE_ENV production
EXPOSE 4000

CMD ["yarn", "workspace", "@marksoftbot/api", "start"] 