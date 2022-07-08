const articlesRouter = require("express").Router();
const {
  getAllArticles,
  getArticle,
  patchArticle,
} = require("../controllers/articles.js");

const {
  getCommentsByArticleId,
  postComment,
} = require("../controllers/comments.js");

articlesRouter.get("/", getAllArticles);
articlesRouter.get("/:article_id", getArticle);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postComment);

module.exports = articlesRouter;
