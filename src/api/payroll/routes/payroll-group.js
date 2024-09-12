'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/payroll-group/filter-by-division',
      handler: 'payroll-group.filterByDivision',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
