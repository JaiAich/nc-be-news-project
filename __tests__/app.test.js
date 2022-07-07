const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");
const endpointsJSON = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  if (connection.end) connection.end();
});

// < -------------------------- GET /api -------------------------->
describe("1. GET /api", () => {
  test("status: 200, responds with all available endpoints on the API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpointsJSON);
      });
  });
});

// < -------------------------- GET /api/health -------------------------->
describe("2. GET /api/health", () => {
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
describe("3. GET /api/topics", () => {
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
describe("4. GET /api/articles", () => {
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

  test("status: 200, responds with articles array ordered by date in descending order by default", () => {
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

  describe("Queries testing", () => {
    test("status: 200, responds with articles array ordered by sort_by query with no order query parameter (defaults to desc)", () => {
      const sortingFunc = (a, b) => {
        if (a.votes > b.votes) return -1;
        return 1;
      };
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          const articlesCopy = [...body.articles];
          expect(articlesCopy).toEqual(body.articles.sort(sortingFunc));
        });
    });

    test("status: 200, responds with articles array ordered by ascending with no sort_by query parameter (defaults to date)", () => {
      const sortingFunc = (a, b) => {
        if (a.created_at < b.created_at) return -1;
        return 1;
      };
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          const articlesCopy = [...body.articles];
          expect(articlesCopy).toEqual(body.articles.sort(sortingFunc));
        });
    });

    test("status: 200, responds with articles array ordered by inputted sort_by & order queries", () => {
      const sortingFunc = (a, b) => {
        if (a.title < b.title) return -1;
        return 1;
      };
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body }) => {
          const articlesCopy = [...body.articles];
          expect(articlesCopy).toEqual(body.articles.sort(sortingFunc));
        });
    });

    test("status: 200, responds with articles array filtered by topic query", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([
            {
              article_id: 5,
              title: "UNCOVERED: catspiracy to bring down democracy",
              topic: "cats",
              author: "rogersop",
              body: "Bastet walks amongst us, and the cats are taking arms!",
              created_at: expect.any(String),
              votes: 0,
              comment_count: 2,
            },
          ]);
        });
    });

    test("status: 200, responds with articles array filtered by topic query and sorted by inputted queries", () => {
      const sortingFunc = (a, b) => {
        if (a.author < b.author) return -1;
        return 1;
      };
      return request(app)
        .get("/api/articles?topic=mitch&order=asc&sort_by=author")
        .expect(200)
        .then(({ body }) => {
          const articlesCopy = [...body.articles];
          expect(articlesCopy).toEqual(body.articles.sort(sortingFunc)); // <-- test sort_by & order

          expect(body.articles).toHaveLength(11); // <-- test filter
          body.articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                topic: "mitch",
              })
            );
          });
        });
    });

    test("status: 200, responds with an empty array for valid topics with zero articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
        });
    });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with invalid sort query message to invalid sort_by values", () => {
      return request(app)
        .get("/api/articles?sort_by=pizza")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid sort query");
        });
    });

    test("status: 400, responds with invalid order query message to invalid order values", () => {
      return request(app)
        .get("/api/articles?order=invalid_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid order query");
        });
    });

    test("status: 404, responds with resource not found message to topic values which do not exist", () => {
      return request(app)
        .get("/api/articles?topic=pizza")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });
  });
});

// < -------------------------- GET /api/articles/:article_id -------------------------->
describe("5. GET /api/articles/:article_id", () => {
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
describe("6. GET /api/articles/:article_id/comments", () => {
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
describe("7. PATCH /api/articles/:article_id", () => {
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
describe("8. GET /api/users", () => {
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
describe("9. POST /api/articles/:article_id/comments", () => {
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

// < ----------------------- DELETE /api/comments/:comment_id ----------------------->
describe("10. DELETE /api/comments/:comment_id", () => {
  test("status: 204, deletes specified comment returning a 204 no content", () => {
    const commentToDelete = {
      article_id: 1,
      author: "icellusedkars",
      body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
      comment_id: 3,
      created_at: "2020-03-01T01:13:00.000Z",
      votes: 100,
    };
    return request(app)
      .get("/api/articles/1/comments") // <-- Get article comments list containing comment to delete
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
        expect(body.comments).toEqual(
          expect.arrayContaining([commentToDelete])
        );
      })
      .then(() => {
        return request(app).delete("/api/comments/3").expect(204); // <-- Delete comment
      })
      .then(() => {
        return request(app).get("/api/articles/1/comments").expect(200); // <-- Check comment has been deleted
      })
      .then(({ body }) => {
        expect(body.comments).toHaveLength(10);
        expect(body.comments).not.toEqual(
          expect.arrayContaining([commentToDelete])
        );
      });
  });

  describe("Error handling tests", () => {
    test("status: 400, responds with bad request message to invalid comment ids", () => {
      return request(app)
        .delete("/api/comments/invalid_comment_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Bad Request");
        });
    });

    test("status: 404, responds with resource not found message to out of range comment ids", () => {
      return request(app)
        .delete("/api/comments/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
        });
    });

    test("status: 404, responds with resource not found message for already deleted comments", () => {
      return request(app)
        .delete("/api/comments/3")
        .expect(204)
        .then(() => {
          // attempt to delete same comment again
          return request(app).delete("/api/comments/3").expect(404);
        })
        .then(({ body }) => {
          expect(body.message).toBe("Resource not found");
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
