# Replace the version with the desired Node.js version
FROM node:20

# Set the working directory
WORKDIR /app

# Install required libraries and packages for Puppeteer
RUN apt-get update && apt-get install -y \
      libnss3 \
      libxss1 \
      libgbm1 \
      libasound2 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgcc1 \
      libgconf-2-4 \
      libgdk-pixbuf2.0-0 \
      libegl1-mesa \
      libgbm-dev \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxslt1.1 \
      libxt6 \
      libxtst6 \
      libsm6 \
      libxshmfence1 \
      libdrm2

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Start the application
CMD ["npm", "start"]
