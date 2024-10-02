"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/payment/synchronize/get",
      handler: "synchronize.get",
      config: {
        polices: [],
        middlewares: [],
      },
    },
  ],
};
