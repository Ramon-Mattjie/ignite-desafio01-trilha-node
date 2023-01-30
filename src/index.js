const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middlewares
const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => username === user.username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = userAlreadyExists;

  return next();
};
const checkTodoExists = (request, response, next) => {
  const {
    user,
    params: { id },
  } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exist!" });
  }
  request.todo = todo;

  return next();
};

app.post("/users", (request, response) => {
  const {
    body: { name, username },
  } = request;

  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exist!" });
  }
  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user: { todos },
  } = request;
  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { title, deadline },
  } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const {
      todo,
      body: { title, deadline },
    } = request;

    todo.title = title;
    todo.deadline = deadline;

    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const { todo } = request;

    todo.done = true;
    return response.status(201).json(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkTodoExists,
  (request, response) => {
    const { user, todo } = request;

    user.todos.splice(todo.id, 1);
    return response.status(204).json(user.todos);
  }
);

module.exports = app;
