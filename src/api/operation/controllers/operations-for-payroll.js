'use strict';

/**
 * A set of functions called "actions" for `operations-for-payroll`
 */

module.exports = {
  async operationsForPayroll(ctx) {
    try {
      const {
        autorID,
        divisionID,
        subdiv_oneID,
        docDate,
        periodFrom,
        periodTo,
      } = ctx.request.body;

      if (!docDate || !periodFrom || !periodTo || !autorID) {
        return ctx.throw(400, 'Поля docDate, autorID, period обязательны.');
      }

      const filters = {};

      if (divisionID && divisionID != 0) {
        filters.division = { id: divisionID };
      }

      if (subdiv_oneID && subdiv_oneID != 0) {
        filters.subdiv_one = { id: subdiv_oneID };
      }

      filters.periodFrom = { $gte: periodFrom };

      const operations = await strapi.entityService.findMany(
        'api::operation.operation',
        {
          filters,
          populate: [
            'division',
            'subdiv_one',
            'contragent',
            'service',
            'oper_type',
          ],
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
        const startDate = new Date(periodFrom);
        const midDate = new Date(docDate);
        const endDate = new Date(periodTo);

        if (operation.price && operation.price > 0) {
          // Период с начала до даты документа
          if (startDate < midDate) {
            payrollEntries.push({
              data: {
                docDate,
                periodFrom: periodFrom,
                periodTo: midDate.toISOString().split('T')[0],
                amount: operation.price, // Использование значения из operations.price
                contragent: operation.contragent,
                division: operation.division,
                subdiv_one: operation.subdiv_one,
                service: operation.service,
                autor: autorID,
                oper_type: operation.oper_type,
              },
            });
          }

          // Период с даты документа до конца
          if (midDate <= endDate) {
            payrollEntries.push({
              data: {
                docDate,
                periodFrom: midDate.toISOString().split('T')[0],
                periodTo: periodTo,
                amount: operation.price, // Использование значения из operations.price
                contragent: operation.contragent,
                division: operation.division,
                subdiv_one: operation.subdiv_one,
                service: operation.service,
                autor: autorID,
                oper_type: operation.oper_type,
              },
            });
          }
        }
      }

      ctx.send({
        message: `${payrollEntries.length} записей.`,
        data: payrollEntries,
      });
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};