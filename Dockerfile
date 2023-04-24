# Using the official Node.js base image
FROM node

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the required packages
RUN npm install

# Copy the app.ts and other needed files
COPY . .

# Expose the PORT from the environment variable
EXPOSE ${PORT}

# Run the application
CMD npx ts-node app.ts