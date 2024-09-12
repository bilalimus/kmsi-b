// path: src/api/payroll-group/controllers/payroll-group.js

module.exports = {
  async filterByDivision(ctx) {
    try {
      const divisionID = 0;
      const subdiv_oneID = 1;

      const filters = {};

      if (divisionID) {
        filters.divisionID = {
          id: divisionID,
        };
      }
      if (subdiv_oneID) {
        filters.subdiv_one = {
          id: subdiv_oneID,
        };
      }
      const contragent = await strapi.entityService.findMany(
        "api::contragent.contragent",
        {
          filters,
          populate: ['division','subdiv_one'],
        }
      );

      ctx.send({ data: contragent });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
