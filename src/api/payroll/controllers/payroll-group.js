module.exports = {
  // Метод для создания записей (без изменений)
  async create(ctx) {
    try {
      const { divisionID, subdiv_oneID, docDate, periodFrom, periodTo } = ctx.request.body;

      if (!docDate || !periodFrom || !periodTo) {
        return ctx.throw(400, 'Поля docDate, periodFrom и periodTo обязательны.');
      }

      const filters = {};

      if (divisionID) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      const contragents = await strapi.entityService.findMany('api::contragent.contragent', {
        filters,
        populate: ['division', 'subdiv_one'],
      });

      if (contragents.length === 0) {
        return ctx.throw(404, 'Не найдено контрагентов для указанных критериев.');
      }

      const payrollEntries = [];
      for (const contragent of contragents) {
        const existingPayroll = await strapi.entityService.findMany('api::payroll.payroll', {
          filters: {
            contragent: contragent.id,
            periodFrom,
            periodTo,
          },
        });

        if (existingPayroll.length > 0) {
          return ctx.throw(409, `Запись для выбранных контрагентов за указанный период уже существует.`);
        }

        const amount = calculateAmount(contragent);

        const payrollEntry = await strapi.entityService.create('api::payroll.payroll', {
          data: {
            docDate,
            periodFrom,
            periodTo,
            amount,
            contragent: contragent.id,
          },
        });

        payrollEntries.push(payrollEntry);
      }

      ctx.send({ message: `${payrollEntries.length} записей успешно создано.`, data: payrollEntries });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },

  // Метод для фильтрации записей Payroll
  async filter(ctx) {
    try {
      // Получаем фильтры из тела POST-запроса
      const { divisionID, subdiv_oneID, periodFrom, periodTo } = ctx.request.body;

      const filters = {};

      // Применяем фильтр по divisionID, если он передан
      if (divisionID) {
        filters['contragent.division'] = { id: divisionID };
      }

      // Применяем фильтр по subdiv_oneID, если он передан
      if (subdiv_oneID) {
        filters['contragent.subdiv_one'] = { id: subdiv_oneID };
      }

      // Применяем фильтр по диапазону периодов
      if (periodFrom && periodTo) {
        filters.$and = [
          { periodFrom: { $gte: periodFrom } }, // Период начинается с `periodFrom` или позже
          { periodTo: { $lte: periodTo } },     // Период заканчивается до `periodTo` или раньше
        ];
      }

      // Выполняем запрос для фильтрации записей Payroll
      const payrollRecords = await strapi.entityService.findMany('api::payroll.payroll', {
        filters,
        populate: ['contragent.division', 'contragent.subdiv_one'], // Загружаем данные о контрагентах и их связях
      });

      // Если не найдены записи Payroll
      if (payrollRecords.length === 0) {
        return ctx.throw(404, 'Не найдено записей Payroll для указанных критериев.');
      }

      // Возвращаем найденные записи Payroll
      ctx.send({ message: `${payrollRecords.length} записей Payroll найдено.`, data: payrollRecords });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },

};

// Пример функции для вычисления суммы (amount)
function calculateAmount(contragent) {
  return 1000; // Пример суммы, замените на вашу логику
}
