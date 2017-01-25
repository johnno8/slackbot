FROM node:6.9.1

RUN mkdir /slackbot/

WORKDIR /slackbot/

ADD . /slackbot/

RUN npm install

CMD ["npm","start"]