const express = require("express");

const { getTopics, getHealth } = require("./controllers/topics.js");

const { getArticle, getAllArticles, patchArticle } = require("./controllers/articles.js");

const { getUsers } = require("./controllers/users.js");

const {
  handlePSQLErrors,
  unhandledErrors,
  handleCustomErrors,
} = require("./errors/index.js");

const app = express();

app.use(express.json());

app.get("/api/health", getHealth);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticle);

app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/users", getUsers);

app.get("/api/articles", getAllArticles);

app.use("*", (req, res) => {
  res.status(404).send({ message: "Path not found!" });
});

app.use(handlePSQLErrors);

app.use(handleCustomErrors);

app.use(unhandledErrors);

module.exports = app;
