# create the Base Image Node.js
FROM node:24-alpine

# Set the working directory
# This is where all the commands will be run
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y g++ openjdk-17-jdk

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000
# run the project
CMD [ "node","index.js" ]

