const express = require("express");

const {
  getTopics,
  getHealth,
  getArticles,
} = require("./controllers/topics.js");

const {
  handlePSQLErrors,
  unhandledErrors,
  handleCustomErrors,
} = require("./errors/index.js");

const app = express();

app.use(express.json());

app.get("/api/health", getHealth);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticles);

app.use("*", (req, res) => {
  res.status(404).send({ message: "Path not found!" });
});

app.use(handlePSQLErrors);

app.use(handleCustomErrors);

app.use(unhandledErrors);

module.exports = app;
