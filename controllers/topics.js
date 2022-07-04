const { fetchTopics, fetchArticles } = require("../models/topics.js");

exports.getHealth = (req, res) => {
  res.status(200).send({ message: "Server up and running!" });
};

exports.getTopics = (req, res) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getArticles = (req, res, next) => {
  const articleId = req.params.article_id;
  fetchArticles(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
