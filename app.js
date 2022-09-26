const express = require("express");

const {
  handlePSQLErrors,
  unhandledErrors,
  handleCustomErrors,
} = require("./errors/index.js");

const apiRouter = require("./routes/api-router.js");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api", apiRouter);
app.use("*", (req, res) => {
  res.status(404).send({ message: "Path not found!" });
});

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(unhandledErrors);

module.exports = app;
