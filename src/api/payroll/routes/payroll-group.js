"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payroll-group/create",
      handler: "payroll-group.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/payroll-group/filter", // Новый маршрут для фильтрации
      handler: "payroll-group.filter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

