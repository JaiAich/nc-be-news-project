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
