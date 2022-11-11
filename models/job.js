"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { makeWhere } = require("../helpers/makeWhere");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /**Create a job.
   *
   * Accepts an object {title: string, salary: number, equity: number, company_handle: string}
   *
   * Returns {title: string, salary: number, equity: string, company_handle: string, id: number}
   */
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

  /**Find all jobs.
   *
   * Returns a list like [{title: string, salary: number, equity: string, company_handle: string, id: number}, ...]
   */
  static async findAll() {
    const result = await db.query(`
      SELECT title, salary, equity, company_handle, id
      FROM jobs
    `);

    return result.rows;
  }

  /**Get a job by id.
   *
   * Accepts an id: number.
   *
   * Returns a job like {title: string, salary: number, equity: string, company_handle: string, id: number}
   */
  static async get(id) {
    const result = await db.query(
      `
      SELECT title, salary, equity, company_handle, id
      FROM jobs
      WHERE id = $1
    `,
      [id]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return result.rows[0];
  }


  /** Update a job with new data.
   *
   * Accepts a job id and an object with new data
   *
   * Returns the updated job data: {
   *  title: string,
   *  salary: number,
   *  equity: string,
   *  company_handle: string,
   *  id: number
   * }
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity"
    });
    //TODO: fix parameters
    const handleVarIdx = "$" + (values.length);

    const querySql = await db.query(
      `UPDATE jobs
        SET ${setCols}
        WHERE id = ${handleVarIdx}
        RETURNING title, salary, equity, company_handle, id`
    )

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
    }
}

module.exports = Job;
