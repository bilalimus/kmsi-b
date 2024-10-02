"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/payment/synchronize/receive",
      handler: "synchronize.receive",
      config: {
        polices: [],
        middlewares: [],
      },
    },
  ],
};
