const commentsRouter = require("express").Router();
const { deleteComment } = require("../controllers/comments.js");

commentsRouter.delete("/:comment_id", deleteComment);

module.exports = commentsRouter;

