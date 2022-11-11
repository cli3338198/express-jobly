"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Baker",
    salary: 100000,
    equity: 0.5,
    company_handle: "c1",

  };

  test("works", async function () {
    let job = await Job.create(newJob);
    newJob.equity = String(newJob.equity);
    expect(job).toEqual(newJob);
    console.log(job);
    const result = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = $1`, [job.id]
    );

    expect(result).toEqual([
      {
        title: "Baker",
        salary: 100000,
        id: job.id,
        equity: "0.5",
        company_handle: "c1"
      },
    ]);
  });

  // test("bad request with dupe", async function () {
  //   try {
  //     await Job.create(newJob);
  //     await Job.create(newJob);
  //     throw new Error("fail test, you shouldn't get here");
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

/************************************** findAll */

/************************************** get */

/************************************** update */

/************************************** remove */

/******************************* filter by something*/
// TODO:
