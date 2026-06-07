FROM node:22-alpine

WORKDIR /workspace
COPY . .
RUN npm install
RUN npm run build --workspace @codeclaw/types && npm run build --workspace @codeclaw/web
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@codeclaw/web"]
