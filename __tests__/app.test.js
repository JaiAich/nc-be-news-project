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

// < -------------------------- GET api health -------------------------->
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

// < -------------------------- GET api topics -------------------------->
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

// < -------------------------- GET api articles -------------------------->
describe("3. GET /api/articles/:article_id", () => {
  test("status: 200, responds with the correct article matching the id parameter", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 2,
            author: expect.any(String),
            body: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
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

    test("status: 404, responds with index out of range error message for incorrect article id numbers", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Article ID index out of range");
        });
    });
  });
});

// < -------------------------- PATCH api articles -------------------------->
describe("4. PATCH /api/articles/:article_id", () => {
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

    test("status: 404, responds with index out of range error message for incorrect article id numbers", () => {
      const newInfo = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/999")
        .send(newInfo)
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("Article ID index out of range");
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
