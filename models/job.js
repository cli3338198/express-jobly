"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { makeWhere } = require("../helpers/makeWhere");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {}

module.exports = Job;
