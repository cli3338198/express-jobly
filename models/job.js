"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { makeWhere } = require("../helpers/makeWhere");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {

  // const duplicateCheck = await db.query(
  //   `SELECT handle
  //          FROM companies
  //          WHERE handle = $1`,
  //   [handle]
  // );

  static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle, id`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];

    return job;
  }
}



module.exports = Job;
