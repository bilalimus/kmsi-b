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

      const autor = await strapi
        .query('plugin::users-permissions.user')
        .findOne({
          where: { id: autorID },
        });

      if (!autor) {
        return ctx.throw(404, `Пользователь с ID ${autorID} не найден.`);
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

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const operationStartDate = new Date(operation.periodFrom);
        const operationEndDate = new Date(operation.periodTo);
        const startDate = new Date(periodFrom);
        const endDate = new Date(periodTo);

        // Определяем пересечение периодов
        const effectiveStart =
          operationStartDate > startDate ? operationStartDate : startDate;
        const effectiveEnd =
          operationEndDate < endDate ? operationEndDate : endDate;

        if (effectiveStart <= effectiveEnd) {
          payrollEntries.push({
            id: i + 1,
            docDate,
            periodFrom: effectiveStart.toISOString().split('T')[0],
            periodTo: effectiveEnd.toISOString().split('T')[0],
            amount: operation.price,
            contragent: operation.contragent,
            division: operation.division,
            subdiv_one: operation.subdiv_one,
            service: operation.service,
            autor: {
              id: autor.id,
              username: autor.username,
              usersurname: autor.usersurname,
            },
            oper_type: operation.oper_type,
          });
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

  // ===========================================================================

  async operationsForPayrollOne(ctx) {
    try {
      const { contragentID, periodFrom, periodTo } = ctx.request.body;

      if (!periodFrom || !periodTo || !contragentID) {
        return ctx.throw(
          400,
          'Поля contragentID, periodFrom, periodTo обязательны.'
        );
      }

      const filters = {};

      filters.contragent = { id: contragentID };

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

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const operationStartDate = new Date(operation.periodFrom);
        const operationEndDate = new Date(operation.periodTo);
        const startDate = new Date(periodFrom);
        const endDate = new Date(periodTo);

        // Определяем пересечение периодов
        const effectiveStart =
          operationStartDate > startDate ? operationStartDate : startDate;
        const effectiveEnd =
          operationEndDate < endDate ? operationEndDate : endDate;

        if (effectiveStart <= effectiveEnd) {
          payrollEntries.push({
            id: i + 1,
            periodFrom: effectiveStart.toISOString().split('T')[0],
            periodTo: effectiveEnd.toISOString().split('T')[0],
            amount: operation.price,
            contragent: operation.contragent,
            division: operation.division,
            subdiv_one: operation.subdiv_one,
            service: operation.service,
            oper_type: operation.oper_type,
          });
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
