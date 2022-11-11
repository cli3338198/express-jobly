"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const userAdmin = jwt.sign({ username: "u4", isAdmin: true }, SECRET_KEY);

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next, next)).toThrowError();
  });
});



describe("ensureIsAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "userAdmin", isAdmin: true } } };
    ensureIsAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureIsAdmin(req, res, next)).toThrowError(UnauthorizedError);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { username: "userNotAdmin", isAdmin: false } } };
    expect(() => ensureIsAdmin(req, res, next)).toThrowError(UnauthorizedError);
  })
});

//TODO: explicit test description 
describe("ensureAdminOrSameUser", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "userAdmin", isAdmin: true } } };
    ensureIsAdmin(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureIsAdmin(req, res, next)).toThrowError(UnauthorizedError);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { username: "userNotAdmin", isAdmin: false } } };
    expect(() => ensureIsAdmin(req, res, next)).toThrowError(UnauthorizedError);
  });

  test("unauth if not same user", function () {
    const req = { username: "userAdmin" };
    const res = { locals: { user: { username: "userNotAdmin", isAdmin: false } } };
    expect(() => ensureIsAdmin(req, res, next)).toThrowError(UnauthorizedError);
  });
});