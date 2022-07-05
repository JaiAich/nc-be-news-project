const connection = require("../db/connection.js");

exports.fetchArticles = (articleId) => {
  return connection
    .query(
      `SELECT articles.*, COUNT(comments.comment_id) AS comment_count 
      FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id
      HAVING articles.article_id = $1;`,
      [articleId]
    )
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

exports.updateArticles = (articleId, incVotes) => {
  if (!incVotes)
    return Promise.reject({
      status: 400,
      message: "Bad Request",
    });
  return connection
    .query(
      "UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;",
      [articleId, incVotes]
    )
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
