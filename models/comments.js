const connection = require("../db/connection.js");

const checkArticleExists = (articleId) => {
  return connection
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "Article ID index out of range",
        });
      }
      return rows[0];
    });
};

exports.fetchCommentsByArticleId = (articleId) => {
  return checkArticleExists(articleId)
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
