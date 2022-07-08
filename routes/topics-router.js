const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.js");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;