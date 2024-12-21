'use strict';

/**
 * A set of functions called "actions" for `operations-for-payroll`
 */

module.exports = {
  async operationsForPayroll(ctx) {
    try {
      const { autorID, divisionID, subdiv_oneID, docDate, period } =
        ctx.request.body;

      if (!docDate || !period || !autorID) {
        return ctx.throw(400, 'Поля docDate, autorID, period обязательны');
      }
      ctx.send({
        message: 'TEST',
      });
    } catch (err) {
      console.log(err);
    }
  },
};
