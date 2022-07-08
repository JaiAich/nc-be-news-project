const endpoints = require("../endpoints.json");

exports.getEndpoints = (req, res) => {
  res.status(200).send(endpoints);
};

exports.getHealth = (req, res) => {
    res.status(200).send({ message: "Server up and running!" });
  };