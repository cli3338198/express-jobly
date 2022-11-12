"use strict";
/**
 * makeWhere: make the where clause for Company.filter
 * TODO: takes in obj
 * - takes in nameLike, minEmployees, maxEmployees
 * TODO: returns ?
 * - returns the where clause
 */
function makeWhere() {
  let i = 1;
  const parameters = [];
  let whereString = ["WHERE"];

  for (const key in arguments[0]) {
    if (key === "nameLike" && arguments[0][key].length > 0) {
      whereString.push(`name ILIKE $${i}`);
      i++;
      parameters.push("%" + arguments[0][key] + "%");
    }
    else if (key === "minEmployees" && arguments[0][key] >= 0) {
      whereString.push(`num_employees >= $${i}`);
      i++;
      parameters.push(parseInt(arguments[0][key]));
    }
    else if (key === "maxEmployees" && arguments[0][key] >= 0) {
      whereString.push(`num_employees <= $${i}`);
      i++;
      parameters.push(parseInt(arguments[0][key]));
    }
    else if (key === "title" && arguments[0][key].length > 0) {
      whereString.push(`title = $${i}`);
      i++;
      parameters.push(parseInt(arguments[0][key]));
    }
    else if (key === "equity" && arguments[0][key] >= 0) {
      whereString.push(`equity = $${i}`);
      i++;
      parameters.push(parseInt(arguments[0][key]));
    }
    else if (key === "salary" && arguments[0][key] >= 0) {
      whereString.push(`salary >= $${i}`);
      i++;
      parameters.push(parseInt(arguments[0][key]));
    }
  }
//TODO: const/name and json schema for nameLike length

  // { nameLike, minEmployees, maxEmployees; }
  console.log("!!!!!!!!!!!!!!!!!", whereString);
  console.log("@@@@@@@@@@@@", parameters);
  return [whereString.join(" AND ").replace("AND ", ""), parameters];
}

module.exports = { makeWhere };
