module.exports = {
  // Метод для создания записей (без изменений)
  async create(ctx) {
    try {
      const { divisionID, subdiv_oneID, docDate, periodFrom, periodTo } =
        ctx.request.body;

      if (!docDate || !periodFrom || !periodTo) {
        return ctx.throw(
          400,
          "Поля docDate, periodFrom и periodTo обязательны.",
        );
      }

      const filters = {};

      if (divisionID && divisionID != 0) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID && subdiv_oneID != 0) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      const contragents = await strapi.entityService.findMany(
        "api::contragent.contragent",
        {
          filters,
          populate: ["division", "subdiv_one"],
        },
      );

      if (contragents.length === 0) {
        return ctx.throw(
          404,
          "Не найдено контрагентов для указанных критериев.",
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
          },
        );

        if (existingPayroll.length > 0) {
          return ctx.throw(
            409,
            `Запись для выбранных контрагентов за указанный период уже существует.`,
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
          },
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
          "Поля docDate, periodFrom и periodTo обязательны.",
        );
      }

      const filters = {};

      if (divisionID && divisionID != 0) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID && subdiv_oneID != 0) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      filters.periodFrom = { $lte: periodFrom };
      filters.periodTo = { $gte: periodTo };

      const contragentWithType3 = await strapi.entityService.findMany(
        "api::operation.operation",
        {
          filters: { oper_type: 3 },
          populate: ["contragent"],
        },
      );

      const excludedContragentIds = contragentWithType3.map(
        (operation) => operation.contragent.id,
      );

      filters.oper_type = { $in: [1, 2] };
      if (excludedContragentIds.length > 0) {
        filters.contragent = { id: { $notIn: excludedContragentIds } };
      }

      console.log("Фильтры для операций:", filters);

      const operations = await strapi.entityService.findMany(
        "api::operation.operation",
        {
          filters,
          populate: ["division", "subdiv_one", "oper_type", "contragent"],
        },
      );
      console.log("test");
      console.log(
        "Запрашиваемый период",
        new Date(periodFrom),
        new Date(periodTo),
      );
      operations.map((item) => console.log(item.contragent.id));

      if (operations.length === 0) {
        return ctx.throw(
          404,
          "Не найдено контрагентов для указанных критериев",
        );
      }

      //      const payrollEntries = [];
      //      for (const operation of operations) {
      //        const existingPayroll = await strapi.entityService.findMany(
      //          "api::payroll.payroll",
      //          {
      //            filters: {
      //              contragent: operation.contragent.id,
      //              periodFrom,
      //              periodTo,
      //            },
      //            populate: ["contragent.division", "contragent.subdiv_one"],
      //          },
      //        );
      //
      //        payrollEntries.push(...existingPayroll);
      //      }

      ctx.send({
        message: `${operations.length} записей`,
        data: operations,
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
