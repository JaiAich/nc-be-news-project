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
articlesRouter.route("/:article_id").get(getArticle).patch(patchArticle);
articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postComment);

module.exports = articlesRouter;
