FROM node:22-alpine

WORKDIR /workspace
COPY . .
RUN npm install
RUN npm run build --workspace @codeclaw/web
EXPOSE 5173
CMD ["npm", "run", "preview", "--workspace", "@codeclaw/web"]
