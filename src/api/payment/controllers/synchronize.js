"use strict";

/**
 * A set of functions called "actions" for `synchronize`
 */
const fetch = require("node-fetch");

const apiUrl = "https://pay.get.kg/api/payment/list";
const login = "bilalimus@gmail.com";
const password = "dtP5nRWx";

const authString = `${login}:${password}`;
const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`;

module.exports = {
  get: async (ctx) => {
    const requestBody = {
      region: 11,
      date_from: "2024-02-01",
      date_to: "2024-02-01",
    };
    try {
      const response = await fetch(apiUrl, {
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

        const paymentEntries = [];
        const existingPayments = [];
        const warnings = [];

        for (const payment of responseData) {
          const findedContragent = await strapi.entityService.findMany(
            "api::contragent.contragent",
            {
              filters: {
                ls: payment.account.account_no,
              },
            },
          );

          if (findedContragent.length === 0) {
            warnings.push(
              `Не найден лицевой счет ${payment.account.account_no} для контрагента ${payment.account.full_name}`,
            );
            continue;
          }

          const paymentEntry = await strapi.entityService.create(
            "api::payment.payment",
            {
              data: {
                payment_id: payment.payment_id,
                source: payment.source,
                amount: payment.amount,
                desc: payment.desc,
                paid_at: payment.paid_at,
                payment_purpose: payment.payment_purpose,
                aggregator_inn: payment.aggregator_inn,
                contragent: findedContragent[0].id,
              },
            },
          );
          const populatedPayment = await strapi.entityService.findOne(
            "api::payment.payment",
            paymentEntry.id,
            {
              populate: ["contragent"],
            },
          );
          paymentEntries.push(populatedPayment);
        }
        ctx.send({
          message: `${paymentEntries.length} записей успешно создано`,
          warnings,
          data: paymentEntries,
        });
      }
    } catch (err) {
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};
