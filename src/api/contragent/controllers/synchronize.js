"use strict";
const { apiUrl, authHeader } = require("../../../../payget_conf");

module.exports = {
  receive: async (ctx) => {
    const requestBody = {
      region: 11,
    };
    try {
      const response = await fetch(`${apiUrl}/accounts/list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        return ctx.throw(404, `Ошибка от pay.get.kg: ${response.status}`);
      } else {
        const responseData = await response.json();
        console.log("Response:", responseData);

        const contragentEntries = [];

        //for (const account of responseData) {
        //const contragentEntry = await strapi.entityService.create(
        //"api::contragent.contragent",
        //{
        //data: {
        //name: account.full_name,
        //ls: account.account_no,
        //comment: `Комментарий: ${account.comment}, курс: ${account.group}, факультет: ${account.doo}`,
        //},
        //},
        //);
        //contragentEntries.push(contragentEntry);
        //}
        //ctx.send({
        //message: `${contragentEntries.length} записей успешно создано`,
        //data: contragentEntries,
        //});
      }
    } catch (err) {
      console.log("catch:", "error:", err, "message:", err.message);
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};
