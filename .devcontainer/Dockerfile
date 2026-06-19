FROM node:24
EXPOSE 3000

ENV APP_ROOT /tarkov-dev
RUN mkdir -p $APP_ROOT
WORKDIR $APP_ROOT

RUN corepack enable

CMD ["/bin/bash", "-c", "pnpm install && pnpm start && while :; do sleep 1; done"]