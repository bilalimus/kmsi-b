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
        const contragentEntries = [];
        console.log("Количество записей:", responseData.length);
        let kol = 0;

        for (const account of responseData) {
          let inn = "";
          let resident = "";
          if (account.comment) {
            const splittedComment = account.comment.split("/");
            if (splittedComment) {
              const [inn_spl, resident_spl] = splittedComment;
              inn = inn_spl;
              resident = resident_spl;
            }
          }

          const existingContragentByLs = await strapi.entityService.findMany(
            "api::contragent.contragent",
            {
              filters: {
                ls: account.account_no,
              },
            },
          );

          if (existingContragentByLs.length > 0) {
            continue;
          }
          console.log("BeforeCreate:", account);

          const contragentEntry = await strapi.entityService.create(
            "api::contragent.contragent",
            {
              data: {
                name: account.full_name,
                ls: account.account_no,
                comment: `Комментарий: ${account.comment}, курс: ${account.group}, факультет: ${account.doo}`,
                inn,
                resident,
                create_ls: false,
              },
            },
          );
          contragentEntries.push(contragentEntry);
          kol = kol + 1;
          console.log(
            "ContragentEntry:",
            contragentEntry.id,
            "Количество итераций:",
            kol,
          );
        }
        ctx.send({
          message: `${contragentEntries.length} записей успешно создано`,
          data: contragentEntries,
        });
      }
    } catch (err) {
      console.log("catch:", "error:", err, "message:", err.message);
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};
