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
  test("works: no filter", async function () {
    const result = await Job.findAll();

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
      {
        title: "Baker",
        salary: 300000,
        equity: "0.3",
        company_handle: "c2",
        id: expect.any(Number),
      },
      {
        title: "Baker",
        salary: 400000,
        equity: "0.4",
        company_handle: "c1",
        id: expect.any(Number),
      },
    ]);
  });
});

/************************************** get */

describe("Get", function () {
  test("Works", async function () {
    const newJob = await Job.create(
      { title: "Baker", salary: 500000, equity: "0.6", company_handle: "c2" }
    );
    console.log("NEW JOB!!!!!!", newJob);

    const result = await Job.get(newJob.id);
    console.log("RESULT!!!!!", result);

    expect(result).toEqual(newJob);
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("Update", function () {

  const newData = {
    title: "Pastry Chef",
    salary: 500000,
    equity: 0.5
  };

  test("Works", async function () {
    const newJob = await Job.create(
      { title: "Baker", salary: 200000, equity: "0.2", company_handle: "c2" }
    );
    const result = await Job.update(newJob.id, newData);

    expect(result).toEqual({
      title: "Pastry Chef",
      salary: 500000,
      equity: "0.5",
      company_handle: "c2",
      id: expect.any(Number)
    });
  });

  test("not found if id doesn't exist", async function () {
    try {
      await Job.update(0, newData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("works with null fields", async function () {
    const newJob = await Job.create(
      { title: "Baker", salary: 200000, equity: "0.2", company_handle: "c2" }
    );
    const result = await Job.update(newJob.id, {
      title: "Pastry Chef",
      salary: null,
      equity: null,
      company_handle: "c2"
    });

    expect(result).toEqual({
      title: "Pastry Chef",
      salary: null,
      equity: null,
      company_handle: "c2",
      id: expect.any(Number)
    });
  });

  test("bad request with no data", async function () {
    const newJob = await Job.create(
      { title: "Baker", salary: 200000, equity: "0.2", company_handle: "c2" }
    );
    try {
      await Job.update(newJob.id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {

  test("works", async function () {
    const newJob = await Job.create(
      { title: "Baker", salary: 200000, equity: "0.2", company_handle: "c2" }
    );
    await Job.remove(newJob.id);
    const res = await db.query(
      `SELECT title, salary, equity, company_handle, id
           FROM jobs
           WHERE id = $1`, [newJob.id]
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job id", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/******************************* filter by something*/
// TODO:
