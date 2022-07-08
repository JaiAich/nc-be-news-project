# Northcoders News API

## About

NC-News API is a RESTful API Node.js server that provides information for a news application.

Hosted by heroku version available at: https://nc-news-server-app.herokuapp.com/api


## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

Please make sure you have the latest versions of Node.js & postgreSQL installed.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/JaiAich/nc-be-news-project.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Setup test & development databases
   ```sh
   npm run setup-dbs
   ```
4. Create environment variables files in the project root directory
   ```sh
   echo -n "PGDATABASE=nc_news" > .env.development &&  echo -n "PGDATABASE=nc_news_test" > .env.test
   ```
5. Seed databases with example data
   ```sh
   npm run seed
   ```
6. Run tests to ensure everything has been setup correctly
   ```sh
   npm test
   ```
7. To start up the server (currently set locally to port 9090)
   ```sh
   npm start
   ```
