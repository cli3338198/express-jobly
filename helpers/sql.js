const { BadRequestError } = require("../expressError");

/**
 * sqlForPartialUpdate: formats the keys in an object for a sql query
 * - takes in an object of user/company and an object of some mapping
 * - converts the keys into a format for a sql query
 * - return an object containing two arrays of the keys and values
 *
 *    {firstName: "Aliya", age: 32} => ({
 *        setCols: ['"first_name"=$1', '"age"=$2'],
 *        values: ["Aliya", 32]
 *        })
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
