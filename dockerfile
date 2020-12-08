FROM node

WORKDIR /app
COPY . /app

RUN yarn install
RUN yarn build

EXPOSE 8443

CMD ["node", "app.js"]