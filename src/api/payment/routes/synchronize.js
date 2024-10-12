"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/payment/synchronize/receive",
      handler: "synchronize.receive",
      config: {
        polices: [],
        middlewares: [],
      },
    },
  ],
};
