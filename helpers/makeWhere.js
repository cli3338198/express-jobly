"use strict";
/**
 * makeWhere: make the where clause for Company.filter
 * TODO: takes in obj
 * - takes in nameLike, minEmployees, maxEmployees
 * TODO: returns ?
 * - returns the where clause
 */
function makeWhere({ nameLike, minEmployees, maxEmployees }) {
  let i = 1;
  const parameters = [];
  let whereString = ["WHERE"];
//TODO: const/name and json schema for nameLike length
  if (nameLike !== undefined && nameLike.length > 0) {
    whereString.push(`name ILIKE $${i}`);
    i++;
    parameters.push("%" + nameLike + "%");
  }
  if (minEmployees !== undefined) {
    whereString.push(`num_employees >= $${i}`);
    i++;
    parameters.push(parseInt(minEmployees));
  }
  if (maxEmployees !== undefined) {
    whereString.push(`num_employees <= $${i}`);
    i++;
    parameters.push(parseInt(maxEmployees));
  }

  return [whereString.join(" AND ").replace("AND ", ""), parameters];
}

module.exports = { makeWhere };
