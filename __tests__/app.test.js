const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  if (connection.end) connection.end();
});

// < -------------------------- GET /api/health -------------------------->
describe("1. GET /api/health", () => {
  test("status: 200, responds with server up and running message", () => {
    return request(app)
      .get("/api/health")
      .expect(200)
      .then(({ body }) => {
        expect(body.message).toBe("Server up and running!");
      });
  });
});

// < -------------------------- GET /api/topics -------------------------->
describe("2. GET /api/topics", () => {
  test("status: 200, responds with an array of topics of correct length & format", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              description: expect.any(String),
              slug: expect.any(String),
            })
          );
        });
      });
  });
});

// < -------------------------- GET /api/articles -------------------------->
describe("3. GET /api/articles", () => {
  test("status: 200, responds with an array of articles of correct length & format", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(12);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  test("status: 200, responds with articles array ordered by date in descending order", () => {
    const sortingFunc = (a, b) => {
      if (a.created_at > b.created_at) return -1;
      return 1;
    };
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articlesCopy = [...body.articles];
        expect(articlesCopy).toEqual(body.articles.sort(sortingFunc));
      });
  });
});

// < -------------------------- GET /api/articles/:article_id -------------------------->
describe("4. GET /api/articles/:article_id", () => {
  test("status: 200, responds with the correct article matching the id parameter including a comment count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            comment_count: 11,
          })
        );
      });
  });

  test("status: 200, response article is included when comment count is zero", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 2,
            comment_count: 0,
          })
        );
      });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with bad request message to invalid article ids", () => {
      return request(app)
        .get("/api/articles/invalid_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 404, responds with resource not found error message for incorrect article id numbers", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });
  });
});

// < ------------------------ GET /api/articles/:article_id/comments ------------------------>
describe("5. GET /api/articles/:article_id/comments", () => {
  test("status: 200, responds with the an array of comments for the matching article_id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(2);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              article_id: 3,
              comment_id: expect.any(Number),
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
        });
      });
  });

  test("status: 200, responds with an empty array for articles with zero comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with bad request message to invalid article ids", () => {
      return request(app)
        .get("/api/articles/invalid_id/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 404, responds with resource not found error message for incorrect article id numbers", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });
  });
});

// < -------------------------- PATCH /api/articles/:article_id -------------------------->
describe("6. PATCH /api/articles/:article_id", () => {
  test("status: 200, responds with the updated article object", () => {
    const newInfo = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/2")
      .send(newInfo)
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 5,
        });
      });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with bad request message to invalid article ids", () => {
      const newInfo = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/invalid_id")
        .send(newInfo)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 404, responds with resource not found error message for incorrect article id numbers", () => {
      const newInfo = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/999")
        .send(newInfo)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });

    test("status: 400, responds with bad request message to invalid patch object keys", () => {
      const newInfo = { increase_these_votes_by: 5 };
      return request(app)
        .patch("/api/articles/2")
        .send(newInfo)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 400, responds with bad request message to invalid patch object values", () => {
      const newInfo = { inc_votes: "pizza" };
      return request(app)
        .patch("/api/articles/2")
        .send(newInfo)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });
  });
});

// < -------------------------- GET /api/users -------------------------->
describe("7. GET /api/users", () => {
  test("status: 200, responds with an array of users of correct length & format", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              avatar_url: expect.any(String),
              name: expect.any(String),
              username: expect.any(String),
            })
          );
        });
      });
  });
});

// < ----------------------- POST /api/articles/:article_id/comments ----------------------->
describe("8. POST /api/articles/:article_id/comments", () => {
  test("status: 201, adds comment to correct db if user exists & responds with the added comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Test comment",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          article_id: 3,
          author: "butter_bridge",
          body: "Test comment",
          comment_id: 19,
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with bad request message to invalid article ids", () => {
      const newComment = {
        username: "butter_bridge",
        body: "Test comment",
      };
      return request(app)
        .post("/api/articles/invalid_id/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 404, responds with resource not found error message for incorrect article id numbers", () => {
      const newComment = {
        username: "butter_bridge",
        body: "Test comment",
      };
      return request(app)
        .post("/api/articles/999/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });

    test("status: 404, responds with resource not found error message for unregistered users", () => {
      const newComment = {
        username: "invalid user",
        body: "Valid body",
      };
      return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });

    test("status: 400, invalid request body message for invalid body keys", () => {
      const newComment = {
        username: "butter_bridge",
        text: "Invalid body key",
      };
      return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid request body");
        });
    });

    test("status: 400, invalid request body message for non-string request body values", () => {
      const newComment = {
        username: "butter_bridge",
        body: 12,
      };
      return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid request body");
        });
    });
  });
});

// < -------------------------- GET invalid path -------------------------->
describe("Misc error handling tests", () => {
  test("status: 404, responds with path not found for invalid path", () => {
    return request(app)
      .get("/invalid-path")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Path not found!");
      });
  });
});
