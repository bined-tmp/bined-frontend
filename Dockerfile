FROM node:lts-slim

# Create frontend directory
WORKDIR /frontend

COPY package.json ./
COPY package-lock.json ./

RUN npm install
