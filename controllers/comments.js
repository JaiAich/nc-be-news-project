const {
  fetchCommentsByArticleId,
  addComment,
  removeComment,
} = require("../models/comments.js");

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  fetchCommentsByArticleId(articleId)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const comment = req.body;
  const articleId = req.params.article_id;
  addComment(articleId, comment)
    .then((comment) => {
      res.status(201).send(comment);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const commentId = req.params.comment_id;
  removeComment(commentId)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
