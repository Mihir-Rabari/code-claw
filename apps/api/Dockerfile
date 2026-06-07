FROM node:22-alpine

WORKDIR /workspace
COPY . .
RUN npm install
RUN npm run build --workspace @codeclaw/types && npm run build --workspace @codeclaw/github && npm run build --workspace @codeclaw/api
EXPOSE 3001
CMD ["npm", "run", "start", "--workspace", "@codeclaw/api"]
