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

      filters.periodFrom = { $lte: periodTo };
      filters.periodTo = { $gte: periodFrom };

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
        const operationStartDate = new Date(operation.periodFrom);
        const operationEndDate = new Date(operation.periodTo);
        const startDate = new Date(periodFrom);
        const endDate = new Date(periodTo);

        // Определяем пересечение периодов
        const effectiveStart = operationStartDate > startDate ? operationStartDate : startDate;
        const effectiveEnd = operationEndDate < endDate ? operationEndDate : endDate;

        if (effectiveStart <= effectiveEnd) {
          payrollEntries.push({
            docDate,
            periodFrom: effectiveStart.toISOString().split('T')[0],
            periodTo: effectiveEnd.toISOString().split('T')[0],
            amount: operation.price,
            contragent: operation.contragent,
            division: operation.division,
            subdiv_one: operation.subdiv_one,
            service: operation.service,
            autor: autorID,
            oper_type: operation.oper_type,
          });
        }
      }

      // Проверяем, чтобы покрыть весь указанный период до periodTo
      let lastCoveredDate = payrollEntries.reduce((latest, entry) => {
        const entryEndDate = new Date(entry.periodTo);
        return entryEndDate > latest ? entryEndDate : latest;
      }, new Date(periodFrom));

      if (lastCoveredDate < new Date(periodTo)) {
        payrollEntries.push({
          docDate,
          periodFrom: lastCoveredDate.toISOString().split('T')[0],
          periodTo: periodTo,
          amount: 0, // Сумму нужно определить по логике
          contragent: null, // Контрагент отсутствует
          division: null,
          subdiv_one: null,
          service: null,
          autor: autorID,
          oper_type: null,
        });
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