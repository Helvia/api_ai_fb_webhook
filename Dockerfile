FROM node:5.10

MAINTAINER Dimi Balaouras <dimi@helvia.io>

RUN mkdir -p /opt/helvia/api-ai-fb-webhook/

WORKDIR /opt/helvia/api-ai-fb-webhook/
COPY . /opt/helvia/api-ai-fb-webhook/

EXPOSE 5000

RUN npm install

CMD ["npm", "start"]
