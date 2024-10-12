"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/contragent/synchronize/receive",
      handler: "synchronize.receive",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
