"use strict";

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const { id: operationID } = result;

    try {
      const operation = await strapi.entityService.findOne(
        "api::operation.operation",
        operationID,
        {
          populate: ["contragent", "division", "subdiv_one"],
        },
      );

      const { contragent, division, subdiv_one } = operation;

      if (contragent && contragent.id) {
        await strapi.entityService.update(
          "api::contragent.contragent",
          contragent.id,
          {
            data: {
              division: division ? division.id : null,
              subdiv_one: subdiv_one ? subdiv_one.id : null,
            },
          },
        );
        console.log(`Контрагент с ID ${contragent.id} успешно обновлен.`);
      } else {
        console.log("Контрагент не указан для этой операции.");
      }
    } catch (error) {
      console.log("Ошибка при обновлении данных контрагента:", error);
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    const { id: operationID } = result;

    try {
      const operation = await strapi.entityService.findOne(
        "api::operation.operation",
        operationID,
        {
          populate: ["contragent", "division", "subdiv_one"],
        },
      );

      const { contragent, division, subdiv_one } = operation;

      if (contragent && contragent.id) {
        await strapi.entityService.update(
          "api::contragent.contragent",
          contragent.id,
          {
            data: {
              division: division ? division.id : null,
              subdiv_one: subdiv_one ? subdiv_one.id : null,
            },
          },
        );
        console.log(`Контрагент с ID ${contragent.id} успешно обновлен.`);
      } else {
        console.log("Контрагент не указан для этой операции.");
      }
    } catch (error) {
      console.log("Ошибка при обновлении данных контрагента:", error);
    }
  },
};
