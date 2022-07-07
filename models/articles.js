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

exports.fetchAllArticles = (queryParams) => {
  let { sort_by, order, topic } = queryParams;
  if (!sort_by) sort_by = "created_at";
  if (!order) order = "desc";

  const allowedSortQueries = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
  ];

  const allowedOrderQueries = ["asc", "desc"];

  if (!allowedSortQueries.includes(sort_by.toLowerCase())) {
    return Promise.reject({ status: 400, message: "Invalid sort query" });
  }

  if (!allowedOrderQueries.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, message: "Invalid order query" });
  }
  const queryValues = [];
  let queryStr = `SELECT articles.*, CAST(COUNT(comments.comment_id) AS int) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;

  if (topic) {
    return checkExists("topics", "slug", topic)
      .then(() => {
        queryStr += `WHERE topic = $1 GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;
        queryValues.push(topic);
      })
      .then(() => {
        return connection.query(queryStr, queryValues).then(({ rows }) => rows);
      });
  } else {
    queryStr += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;
    return connection.query(queryStr, queryValues).then(({ rows }) => rows);
  }
};
