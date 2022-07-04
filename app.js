const express = require("express");

const { getTopics, getHealth } = require("./controllers/topics.js");

const app = express();

app.use(express.json());

app.get("/api/health", getHealth);

app.get("/api/topics", getTopics);

app.use("*", (req, res) => {
  res.status(404).send({ message: "Path not found!" });
});

module.exports = app;
