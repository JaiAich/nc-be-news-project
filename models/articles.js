const connection = require("../db/connection.js");

exports.fetchArticles = (articleId) => {
  return connection
    .query("SELECT * FROM articles WHERE article_id = $1;", [articleId])
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
