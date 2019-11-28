FROM node:alpine
LABEL maintaner="vlad.crishan20@gmail.com"
WORKDIR /opt
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3001
ENTRYPOINT [ "npm", "start" ]