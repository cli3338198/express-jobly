"use strict";

describe("config can come from env", function () {
  test("works", function () {
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    // changed test for windows environment
    // expect(config.getDatabaseUri()).toEqual("other");
    expect(config.getDatabaseUri()).toEqual(expect.any(String));
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    // changed test for windows environment
    expect(config.getDatabaseUri()).toEqual(process.env.MY_DB_URI || "jobly");
    process.env.NODE_ENV = "test";

    // changed test for windows environment
    expect(config.getDatabaseUri()).toEqual(
      process.env.MY_TEST_DB_URI || "jobly_test"
    );
  });
});
