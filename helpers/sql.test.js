const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("It works for valid object", function () {
    const user = { firstName: "Aliya", age: 32 };
    const resp = sqlForPartialUpdate(user, { firstName: "first_name" });

    expect(resp).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });

  test("It works if second object is empty", function () {
    const user = { firstName: "Aliya", age: 32 };
    const resp = sqlForPartialUpdate(user, {});

    expect(resp).toEqual({
      setCols: '"firstName"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });

  test("It doesn't work for invalid object", function () {
    const user = {};

    expect(() => sqlForPartialUpdate(user, {})).toThrow();
  });
});
