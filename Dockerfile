FROM node:22.17.1-alpine as builder

RUN mkdir /home/app
WORKDIR /home/app
COPY . /home/app

RUN npm install -g npm@latest
RUN npm install
RUN npm run build


FROM nginx:latest

RUN mkdir /home/app

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /home/app/dist /home/app/dist
