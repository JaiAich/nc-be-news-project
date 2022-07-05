const { fetchArticles, updateArticles } = require("../models/articles.js");

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

exports.patchArticles = (req, res, next) => {
  const articleId = req.params.article_id;
  const incVotes = req.body.inc_votes;
  updateArticles(articleId, incVotes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
