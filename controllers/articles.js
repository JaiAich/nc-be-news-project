const {
  fetchArticle,
  fetchAllArticles,
  updateArticle,
} = require("../models/articles.js");

exports.getArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  fetchArticle(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  const incVotes = req.body.inc_votes;
  updateArticle(articleId, incVotes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const queryParams = req.query;
  fetchAllArticles(queryParams)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
