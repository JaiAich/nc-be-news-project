exports.handlePSQLErrors = (error, req, res, next) => {
  if (error.code == "22P02") {
    res.status(400).send({ message: "Bad Request" });
  } else {
    next(error);
  }
};

exports.handleCustomErrors = (error, req, res, next) => {
  if (error.status && error.message) {
    res.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

exports.unhandledErrors = (error, req, res) => {
  console.log(error, "<-- unhandled error");
  res.status(500).send({ message: "Sort it out" });
};
