module.exports = {
  // Метод для создания записей (без изменений)
  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      // Проверка всех записей на дублирование
      const duplicateEntries = [];
      for (const item of data) {
        const existingPayroll = await strapi.entityService.findMany(
          'api::payroll.payroll',
          {
            filters: {
              periodFrom: item.periodFrom,
              periodTo: item.periodTo,
              contragent: item.contragent.id,
            },
          }
        );

        if (existingPayroll.length > 0) {
          duplicateEntries.push(item);
        }
      }

      // Если есть дубли, отклоняем все записи
      if (duplicateEntries.length > 0) {
        return ctx.send(
          {
            message: 'Некоторые записи уже существуют. Все записи отклонены.',
            duplicates: duplicateEntries,
          },
          409 // Код ошибки для конфликта
        );
      }

      // Если нет дублей, сохраняем все записи
      const payrollEntries = [];
      for (const item of data) {
        const payrollEntry = await strapi.entityService.create(
          'api::payroll.payroll',
          {
            data: {
              docDate: item.docDate,
              periodFrom: item.periodFrom,
              periodTo: item.periodTo,
              amount: item.amount,
              contragent: item.contragent.id,
              division: item.division.id,
              subdiv_one: item.subdiv_one.id,
              autor: item.autor,
              service: item.service.id,
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

  // =================================================================================
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

      filters.periodFrom = { $lte: periodTo };
      filters.periodTo = { $gte: periodFrom };

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

  // =============================================================================

  async bulkDelete(ctx) {
    try {
      const { data } = ctx.request.body;

      if (!Array.isArray(data) || data.length === 0) {
        return ctx.throw(
          400,
          'Данные для удаления не предоставлены или пусты.'
        );
      }

      const failedToDelete = [];
      const successfullyDeleted = [];

      for (const item of data) {
        try {
          const existingPayroll = await strapi.entityService.findOne(
            'api::payroll.payroll',
            item.id
          );

          if (!existingPayroll) {
            failedToDelete.push({
              id: item.id,
              reason: 'Запись не найдена.',
            });
            continue;
          }

          await strapi.entityService.delete('api::payroll.payroll', item.id);

          successfullyDeleted.push({
            id: item.id,
            message: 'Запись успешно удалена.',
          });
        } catch (error) {
          failedToDelete.push({
            id: item.id,
            reason: `Ошибка при удалении: ${error.message}`,
          });
        }
      }

      const result = {
        message: `Удалено ${successfullyDeleted.length} записей, ${failedToDelete.length} не удалось удалить.`,
        details: {
          successfullyDeleted,
          failedToDelete,
        },
      };

      ctx.send(result);
    } catch (error) {
      ctx.throw(500, `Ошибка сервера: ${error.message}`);
    }
  },
};
