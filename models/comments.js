const connection = require("../db/connection.js");
const { checkExists } = require("../utils/index.js");

exports.fetchCommentsByArticleId = (articleId) => {
  return checkExists("articles", "article_id", articleId)
    .then(() => {
      return connection.query(`SELECT * FROM comments WHERE article_id = $1;`, [
        articleId,
      ]);
    })
    .then(({ rows }) => {
      if (!rows) return [];
      return rows;
    });
};

exports.addComment = (articleId, comment) => {
  const { username, body } = comment;

  if (typeof username !== "string" || typeof body !== "string") {
    return Promise.reject({
      status: 400,
      message: "Invalid request body",
    });
  }

  return checkExists("articles", "article_id", articleId)
    .then(() => {
      return checkExists("users", "username", username);
    })
    .then(() => {
      return connection.query(
        `INSERT INTO comments (body, article_id, author, created_at, votes)
      VALUES ($3, $1, $2, NOW(), 0) RETURNING *;`,
        [articleId, username, body]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.removeComment = (commentId) => {
  return checkExists("comments", "comment_id", commentId)
    .then(() => {
      return connection.query(
        `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`,
        [commentId]
      );
    })
    .then(({ rows }) => {
      if (rows[0].comment_id === parseInt(commentId)) return;
      else {
        return Promise.reject({
          status: 500,
          message: `Failed to delete comment with id: ${commentId}`,
        });
      }
    });
};
