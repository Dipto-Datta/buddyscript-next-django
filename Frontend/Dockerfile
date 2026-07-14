FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci
COPY . /app/
RUN npm run build


EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
