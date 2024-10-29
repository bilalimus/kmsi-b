module.exports = {
  // Метод для создания записей (без изменений)
  async create(ctx) {
    try {
      const { autorID, divisionID, subdiv_oneID, docDate, period } =
        ctx.request.body;

      if (!docDate || !period || !autorID) {
        return ctx.throw(400, 'Поля docDate, autorID, period обязательны.');
      }
      const [year, month] = period.split('-');
      const monthAndYear = new Date(year, month);

      const periodFrom = new Date(
        monthAndYear.getFullYear(),
        monthAndYear.getMonth() - 1,
        2
      )
        .toISOString()
        .split('T')[0];
      const periodTo = new Date(
        monthAndYear.getFullYear(),
        monthAndYear.getMonth(),
        1
      )
        .toISOString()
        .split('T')[0];
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
        'api::operation.operation',
        {
          filters: { oper_type: 3 },
          populate: ['contragent'],
        }
      );

      const excludedContragentIds = contragentWithType3.map(
        (operation) => operation.contragent.id
      );

      filters.oper_type = { $in: [1, 2] };
      if (excludedContragentIds.length > 0) {
        filters.contragent = { id: { $notIn: excludedContragentIds } };
      }

      const operations = await strapi.entityService.findMany(
        'api::operation.operation',
        {
          filters,
          populate: ['division', 'subdiv_one', 'contragent'],
        }
      );

      if (operations.length === 0) {
        return ctx.throw(
          404,
          'Не найдено контрагентов для указанных критериев'
        );
      }

      const payrollEntries = [];
      for (const operation of operations) {
        const existingPayroll = await strapi.entityService.findMany(
          'api::payroll.payroll',
          {
            filters: {
              contragent: operation.contragent.id,
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

        const amount = calculateAmount(operation.contract);

        const payrollEntry = await strapi.entityService.create(
          'api::payroll.payroll',
          {
            data: {
              docDate,
              periodFrom,
              periodTo,
              amount,
              contragent: operation.contragent.id,
              division: operation.division.id,
              subdiv_one: operation.subdiv_one.id,
              autor: autorID,
            },
          }
        );

        const populatedPayrollEntry = await strapi.entityService.findOne(
          'api::payroll.payroll',
          payrollEntry.id,
          {
            populate: {
              contragent: true,
              service: true,
              division: true,
              subdiv_one: true,
              autor: {
                fields: ['id', 'username', 'usersurname'],
              },
            },
          }
        );

        payrollEntries.push(populatedPayrollEntry);
      }

      ctx.send({
        message: `${payrollEntries.length} записей успешно создано.`,
        data: payrollEntries,
      });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },

  async read(ctx) {
    try {
      const { divisionID, subdiv_oneID, period } = ctx.request.body;

      if (!period) {
        return ctx.throw(400, 'Поле period обязателен.');
      }

      const [year, month] = period.split('-');
      const monthAndYear = new Date(year, month);

      const periodFrom = new Date(
        monthAndYear.getFullYear(),
        monthAndYear.getMonth() - 1,
        2
      )
        .toISOString()
        .split('T')[0];
      const periodTo = new Date(
        monthAndYear.getFullYear(),
        monthAndYear.getMonth(),
        1
      )
        .toISOString()
        .split('T')[0];

      const filters = {};

      if (divisionID && divisionID != 0) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID && subdiv_oneID != 0) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      filters.periodFrom = { $lte: periodFrom };
      filters.periodTo = { $gte: periodTo };

      const payrollEntries = await strapi.entityService.findMany(
        'api::payroll.payroll',
        {
          filters,
          populate: {
            contragent: true,
            service: true,
            division: true,
            subdiv_one: true,
            autor: {
              fields: ['id', 'username', 'usersurname'],
            },
          },
        }
      );

      if (payrollEntries.length === 0) {
        return ctx.throw(404, 'Не найдено записей для указанных критериев');
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

function calculateAmount(contract) {
  return contract / 12;
}
