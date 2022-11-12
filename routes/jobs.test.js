"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");
const { query } = require("express");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "Baker",
    company_handle: "c1",
    salary: 333333,
    equity: 0.5,
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: { ...newJob, id: expect.any(Number), equity: String(newJob.equity) },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "SOME JOB TITLE",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        title: 1000000,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("cannot post if user not is_admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);

    expect(resp.statusCode).toEqual(401);
  });
});

// /************************************** GET /jobs */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Baker",
          company_handle: "c1",
          equity: "0.5",
          id: expect.any(Number),
          salary: 100000,
        },
        {
          title: "Baker",
          company_handle: "c2",
          equity: "0.2",
          id: expect.any(Number),
          salary: 200000,
        },
        {
          title: "Baker",
          company_handle: "c2",
          equity: "0.3",
          id: expect.any(Number),
          salary: 300000,
        },
        {
          title: "Baker",
          company_handle: "c1",
          equity: "0.4",
          id: expect.any(Number),
          salary: 400000,
        },
      ],
    });
  });

  test("should be able to filter jobs", async function () {
    await request(app).post("/jobs").send({
      title: "Chef",
      company_handle: "c1",
      equity: "0.4",
      salary: 600000,
    });

    const resp = await request(app).get("/jobs").query({ title: "Chef" });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Chef",
          company_handle: "c1",
          equity: "0.4",
          salary: 600000,
          id: expect.any(Number),
        },
      ],
    });
  });

  test("should be able to filter companies by equity", async function () {
    await request(app).post("/jobs").send({
      title: "Chef",
      company_handle: "c1",
      equity: 0,
      salary: 600000,
    });

    const resp = await request(app).get("/jobs").query({ equity: 0 });

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Chef",
          company_handle: "c1",
          equity: "0",
          salary: 600000,
          id: expect.any(Number),
        },
      ],
    });
  });

  test("should get all jobs if no filters provided", async function () {
    const resp = await request(app).get("/jobs").query({});

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Baker",
          company_handle: "c1",
          equity: "0.5",
          id: expect.any(Number),
          salary: 100000,
        },
        {
          title: "Baker",
          company_handle: "c2",
          equity: "0.2",
          id: expect.any(Number),
          salary: 200000,
        },
        {
          title: "Baker",
          company_handle: "c2",
          equity: "0.3",
          id: expect.any(Number),
          salary: 300000,
        },
        {
          title: "Baker",
          company_handle: "c1",
          equity: "0.4",
          id: expect.any(Number),
          salary: 400000,
        },
      ],
    });
  });

  // test("Should throw bad request error if invalid query", async function () {
  //   const resp = await request(app)
  //     .get("/companies")
  //     .query({ minEmployees: 9, maxEmployees: 1 });

  //   expect(resp.statusCode).toEqual(400);
  //   expect(resp.body.error.message).toEqual(
  //     "Min employees must be less than max employees."
  //   );
  // });

  // test("Should throw bad request error if invalid minEmployees", async function () {
  //   const resp = await request(app)
  //     .get("/companies")
  //     .query({ minEmployees: -100 });

  //   expect(resp.statusCode).toEqual(400);
  //   expect(resp.body.error.message).toEqual([
  //     "instance.minEmployees must be greater than or equal to 0",
  //   ]);
  // });

  // test("Should throw bad request error if invalid maxEmployees", async function () {
  //   const resp = await request(app)
  //     .get("/companies")
  //     .query({ maxEmployees: 99999999999999999999999999999999 });

  //   expect(resp.statusCode).toEqual(400);
  //   expect(resp.body.error.message).toEqual([
  //     "instance.maxEmployees must be less than or equal to 99999999",
  //   ]);
  // });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
      .get("/companies")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// /************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app).get(`/jobs/${job.id}`);
    expect(resp.body).toEqual({
      job: {
        title: "Baker",
        company_handle: "c1",
        equity: "0.9",
        id: expect.any(Number),
        salary: 900000,
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        title: "NEW BAKER",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        title: "NEW BAKER",
        company_handle: "c1",
        equity: "0.9",
        id: expect.any(Number),
        salary: 900000,
      },
    });
  });

  test("unauth for anon", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app).patch(`/jobs/${job.id}`).send({
      title: "SHOULD NOT CHANGE",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job id", async function () {
    const resp = await request(app)
      .patch(`/jobs/9999999999999999999`)
      .send({
        title: "NEW JOB TITLE",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        title: 100000,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("cannot update if not admin", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        title: "NEW TITLE SHOULD NOT CHANGE",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

// /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app)
      .delete(`/jobs/${job.id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: String(job.id) });
  });

  test("cannot delete if not admin", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app)
      .delete(`/jobs/${job.id}`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const job = await Job.create({
      title: "Baker",
      company_handle: "c1",
      equity: "0.9",
      salary: 900000,
    });
    const resp = await request(app).delete(`/jobs/${job.id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/99999`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
