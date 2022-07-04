const { fetchArticles } = require("../models/articles.js");

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
