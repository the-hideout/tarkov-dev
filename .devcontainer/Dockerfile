FROM node:20
EXPOSE 3000

ENV APP_ROOT /tarkov_dev
RUN mkdir -p $APP_ROOT
WORKDIR $APP_ROOT

CMD ["/bin/bash", "-c", "npm install && npm start && while :; do sleep 1; done"]