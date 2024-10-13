"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment-group/selectPeriod",
      handler: "payment-group.selectPeriod",
      confit: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
