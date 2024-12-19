"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/operations-for-payroll",
      handler: "operationsForPayroll",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};