"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { IntegrityError } = require("pg");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  job1,
  job2,
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
    console.log("------------------->", newJob);
    const job = await Job.create(newJob);
    newJob.equity = String(newJob.equity);

    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle, id
           FROM jobs
           WHERE id = $1`,
      [job.id]
    );

    expect(result.rows[0]).toEqual({
      title: "Baker",
      salary: 100000,
      id: job.id,
      equity: "0.5",
      company_handle: "c1",
    });
  });

  test("does not work if bad company_handle", async function () {
    const badJob = { ...newJob, company_handle: "BAD HANDLE" };

    try {
      await Job.create(badJob);
      throw new Error("Should never get here!");
    } catch (err) {
      expect(err.detail).toEqual(
        `Key (company_handle)=(BAD HANDLE) is not present in table "companies".`
      );
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const result = await Job.findAll();

    console.log(result, "<-----------------------------");

    expect(result).toEqual([
      {
        title: "Baker",
        salary: 100000,
        equity: "0.5",
        company_handle: "c1",
        id: expect.any(Number),
      },
      {
        title: "Baker",
        salary: 200000,
        equity: "0.2",
        company_handle: "c2",
        id: expect.any(Number),
      },
      { ...job1, id: expect.any(Number) },
      { ...job2, id: expect.any(Number) },
    ]);
  });
});

/************************************** get */

describe("Get", function () {
  test("Works", async function () {
    const result = await Job.get(job1.id);
    expect(result).toEqual(job1);
  });
});

/************************************** update */

/************************************** remove */

/******************************* filter by something*/
// TODO:
