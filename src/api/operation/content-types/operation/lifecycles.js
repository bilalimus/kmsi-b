'use strict';

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

      const allOperationsOfContragent = await strapi.entityService.findMany(
        'api::operation.operation',
        contragent.id,
        {
          populate: ['contragent', 'oper_type']
        }
      )

      console.log("AllOperations", allOperationsOfContragent)

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
