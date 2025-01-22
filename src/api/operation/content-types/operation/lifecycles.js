'use strict';

const moment = require('moment'); // Подключение moment.js для работы с датами

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const { id: operationID } = result;

    try {
      const operation = await strapi.entityService.findOne(
        'api::operation.operation',
        operationID,
        {
          populate: ['contragent', 'division', 'subdiv_one', 'oper_type'],
        }
      );

      const { contragent, periodFrom, division, subdiv_one } = operation;

      const lastOperationOfContragent = await strapi.entityService.findMany(
        'api::operation.operation',
        {
          filters: {
            contragent: contragent.id,
            id: { $lt: operationID },
          },
          sort: { id: 'desc' },
          limit: 1,
          populate: ['contragent', 'oper_type'],
        }
      );

      if (lastOperationOfContragent.length > 0) {
        const lastOperation = lastOperationOfContragent[0];

        if (periodFrom) {
          const newPeriodTo = moment(periodFrom).subtract(1, 'day').format('YYYY-MM-DD');

          await strapi.entityService.update(
            'api::operation.operation',
            lastOperation.id,
            {
              data: {
                periodTo: newPeriodTo,
              },
            }
          );

          console.log(`Дата periodTo последней операции обновлена до ${newPeriodTo}.`);
        } else {
          console.log('Дата periodFrom текущей операции не задана.');
        }
      } else {
        console.log('Предыдущая операция для данного контрагента не найдена.');
      }

      if (contragent && contragent.id) {
        await strapi.entityService.update(
          'api::contragent.contragent',
          contragent.id,
          {
            data: {
              division: division ? division.id : null,
              subdiv_one: subdiv_one ? subdiv_one.id : null,
            },
          }
        );
        console.log(`Контрагент с ID ${contragent.id} успешно обновлен.`);
      } else {
        console.log('Контрагент не указан для этой операции.');
      }

      switch (operation.oper_type.id) {
        case 1:
          await strapi.entityService.update(
            'api::contragent.contragent',
            contragent.id,
            {
              data: {
                status: 'зачислен',
              },
            }
          );
          break;
        case 2:
          await strapi.entityService.update(
            'api::contragent.contragent',
            contragent.id,
            {
              data: {
                status: 'перемещен',
              },
            }
          );
          break;
        case 3:
          await strapi.entityService.update(
            'api::contragent.contragent',
            contragent.id,
            {
              data: {
                status: 'отчислен',
              },
            }
          );
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('Ошибка при обновлении данных контрагента:', error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    const { id: operationID } = result;

    try {
      const operation = await strapi.entityService.findOne(
        'api::operation.operation',
        operationID,
        {
          populate: ['contragent', 'division', 'subdiv_one'],
        }
      );

      const { contragent, division, subdiv_one } = operation;

      if (contragent && contragent.id) {
        await strapi.entityService.update(
          'api::contragent.contragent',
          contragent.id,
          {
            data: {
              division: division ? division.id : null,
              subdiv_one: subdiv_one ? subdiv_one.id : null,
            },
          }
        );
        console.log(`Контрагент с ID ${contragent.id} успешно обновлен.`);
      } else {
        console.log('Контрагент не указан для этой операции.');
      }
    } catch (error) {
      console.log('Ошибка при обновлении данных контрагента:', error);
    }
  },
};