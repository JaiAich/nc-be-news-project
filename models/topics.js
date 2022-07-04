const connection = require("../db/connection.js");

exports.fetchTopics = () => {
  return connection.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};
