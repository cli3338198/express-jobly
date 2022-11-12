"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobGetSchema = require("../schemas/jobGet.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle, id` }
 *
 * Authorization required: login, isAdmin
 */

router.post("/", ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    { ...req.body, equity: Number(req.body.equity) },
    jobNewSchema,
    {
      required: true,
    }
  );
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle, id }, ...] }
 *
 * //TODO:
 * Can filter on provided search filters:
 * -
 * -
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const validator = jsonschema.validate(
    {
      title: req.query.title,
      equity: req.query.equity && Number(req.query.equity),
      salary: req.query.minSalary && Number(req.query.minSalary),
    },
    jobGetSchema,
    {
      required: true,
    }
  );

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  if (Object.values(req.query).length > 0) {
    const jobs = await Job.filter(req.query);
    return res.json({ jobs });
  }

  const jobs = await Job.findAll();
  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { title, salary, equity, company_handle }
 *   where jobs is [{ title, salary, equity, company_handle, id }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { title, salary, equity, company_handle, id }
 *
 * Authorization required: login as admin
 */

router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login as admin
 */

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
