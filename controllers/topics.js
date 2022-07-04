const { fetchTopics } = require("../models/topics.js");

exports.getHealth = (req, res) => {
  res.status(200).send({ message: "Server up and running!" });
};

exports.getTopics = (req, res) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};
