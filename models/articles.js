const connection = require("../db/connection.js");
const { checkExists } = require("../utils/index.js");

exports.fetchArticle = (articleId) => {
  return checkExists("articles", "article_id", articleId)
    .then(() => {
      return connection.query(
        `SELECT articles.*, CAST(COUNT(comments.comment_id) AS int) AS comment_count 
      FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id
      HAVING articles.article_id = $1;`,
        [articleId]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.updateArticle = (articleId, incVotes) => {
  if (!incVotes)
    return Promise.reject({
      status: 400,
      message: "Bad Request",
    });
  return checkExists("articles", "article_id", articleId)
    .then(() => {
      return connection.query(
        "UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;",
        [articleId, incVotes]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.fetchAllArticles = () => {
  return connection
    .query(
      `SELECT articles.*, CAST(COUNT(comments.comment_id) AS int) AS comment_count 
      FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => rows);
};
