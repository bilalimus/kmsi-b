module.exports = {
  // Метод для создания записей (без изменений)
  async create(ctx) {
    try {
      const { divisionID, subdiv_oneID, docDate, periodFrom, periodTo } =
        ctx.request.body;

      if (!docDate || !periodFrom || !periodTo) {
        return ctx.throw(
          400,
          "Поля docDate, periodFrom и periodTo обязательны."
        );
      }

      const filters = {};

      if (divisionID) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      const contragents = await strapi.entityService.findMany(
        "api::contragent.contragent",
        {
          filters,
          populate: ["division", "subdiv_one"],
        }
      );

      if (contragents.length === 0) {
        return ctx.throw(
          404,
          "Не найдено контрагентов для указанных критериев."
        );
      }

      const payrollEntries = [];
      for (const contragent of contragents) {
        const existingPayroll = await strapi.entityService.findMany(
          "api::payroll.payroll",
          {
            filters: {
              contragent: contragent.id,
              periodFrom,
              periodTo,
            },
          }
        );

        if (existingPayroll.length > 0) {
          return ctx.throw(
            409,
            `Запись для выбранных контрагентов за указанный период уже существует.`
          );
        }

        const amount = calculateAmount(contragent);

        const payrollEntry = await strapi.entityService.create(
          "api::payroll.payroll",
          {
            data: {
              docDate,
              periodFrom,
              periodTo,
              amount,
              contragent: contragent.id,
            },
          }
        );

        payrollEntries.push(payrollEntry);
      }

      ctx.send({
        message: `${payrollEntries.length} записей успешно создано.`,
        data: payrollEntries,
      });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },

  // Метод для фильтрации записей Payroll
  async read(ctx) {
    try {
      const { divisionID, subdiv_oneID, periodFrom, periodTo } =
        ctx.request.body;

      if (!periodFrom || !periodTo) {
        return ctx.throw(
          400,
          "Поля docDate, periodFrom и periodTo обязательны."
        );
      }

      const filters = {};

      if (divisionID) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      const contragents = await strapi.entityService.findMany(
        "api::contragent.contragent",
        {
          filters,
          populate: ["division", "subdiv_one"],
        }
      );

      if (contragents.length === 0) {
        return ctx.throw(
          404,
          "Не найдено контрагентов для указанных критериев."
        );
      }

      const payrollEntries = [];
      for (const contragent of contragents) {
        const existingPayroll = await strapi.entityService.findMany(
          "api::payroll.payroll",
          {
            filters: {
              contragent: contragent.id,
              periodFrom,
              periodTo,
            },
          }
        );

        if (existingPayroll.length > 0) {
          return ctx.throw(
            409,
            `Запись для выбранных контрагентов за указанный период уже существует.`
          );
        }

       payrollEntries.push(existingPayroll);
      }

      ctx.send({
        message: `${payrollEntries.length} записей`,
        data: payrollEntries,
      });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};

// Пример функции для вычисления суммы (amount)
function calculateAmount(contragent) {
  return 1000; // Пример суммы, замените на вашу логику
}
