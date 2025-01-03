"use strict";

module.exports = {
  selectPeriod: async (ctx) => {
    const { periodFrom, periodTo } = ctx.request.body;

    const newPeriodTo = new Date(periodTo);
    newPeriodTo.setDate(newPeriodTo.getDate() + 1);

    try {
      const paymentEntries = await strapi.entityService.findMany(
        "api::payment.payment",
        {
          filters: {
            $and: [
              {
                paid_at: { $gte: periodFrom },
              },
              {
                paid_at: { $lte: newPeriodTo },
              },
            ],
          },
          populate: {
            contragent: {
              fields: ["id", "name", "ls"],
              populate: ["division", "subdiv_one"],
            },
          },
        },
      );

      ctx.send({
        message: `${paymentEntries.length} записей найдено.`,
        data: paymentEntries,
      });
    } catch (error) {
      console.log(error);
      ctx.throw(500, `Ошибка при выборе записей: ${error.message}`);
    }
  },
};
