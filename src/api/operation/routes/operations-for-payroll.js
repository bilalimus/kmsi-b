'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/operations-for-payroll',
      handler: 'operations-for-payroll.operationsForPayroll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/operations-for-payroll/one',
      handler: 'operations-for-payroll.operationsForPayrollOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
