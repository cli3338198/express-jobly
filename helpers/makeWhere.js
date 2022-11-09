/**
 * makeWhere: make the where clause for Company.filter
 * - takes in nameLike, minEmployees, maxEmployees
 * - returns the where clause
 */
function makeWhere({ nameLike, minEmployees, maxEmployees }) {
  let i = 1;
  const parameters = [];
  let whereString = ["WHERE"];

  if (nameLike !== undefined) {
    whereString.push(`name ILIKE $${i}`);
    i++;
    parameters.push("%" + nameLike + "%");
  }
  if (minEmployees !== undefined) {
    whereString.push(`num_employees >= $${i}`);
    i++;
    parameters.push(minEmployees);
  }
  if (maxEmployees !== undefined) {
    whereString.push(`num_employees <= $${i}`);
    i++;
    parameters.push(maxEmployees);
  }

  return [whereString.join(" AND ").replace("AND ", ""), parameters];
}

module.exports = { makeWhere };
