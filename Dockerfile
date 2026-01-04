FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy built client to server's expected location
RUN cp -r dist/public/* dist/ || true

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
