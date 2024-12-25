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
      path: "/payroll-group/read", // Новый маршрут для фильтрации
      handler: "payroll-group.read",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/payroll-group/delete", // Новый маршрут для фильтрации
      handler: "payroll-group.bulkDelete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

