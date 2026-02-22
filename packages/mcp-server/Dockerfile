FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy pre-built server
COPY dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
