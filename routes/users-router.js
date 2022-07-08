const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/users.js");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
