'use strict';
const { apiUrl, authHeader } = require('../../../../payget_conf');
const fetch = require('node-fetch');

module.exports = {
  receive: async (ctx) => {
    const { region, date_from, date_to } = ctx.request.body;
    const requestBody = {
      region,
      date_from,
      date_to,
    };

    try {
      const response = await fetch(`${apiUrl}/payment/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return ctx.throw(404, `Ошибка от ${apiUrl}: ${response.status}`);
      } else {
        const responseData = await response.json();
        const paymentEntries = [];

        let index = 0;
        while (index < responseData.length) {
          const payment = responseData[index];

          const findedContragent = await strapi.entityService.findMany(
            'api::contragent.contragent',
            {
              filters: {
                ls: payment.account.account_no,
              },
            }
          );

          if (findedContragent.length === 0) {
            console.log(
              `Не найден лицевой счет ${payment.account.account_no} для контрагента ${payment.account.full_name}`
            );

            let inn = '';
            let resident = '';

            if (payment.account.comment) {
              const splittedComment = payment.account.comment.split('/');
              if (splittedComment) {
                const [inn_spl, resident_spl] = splittedComment;
                inn = inn_spl;
                resident = resident_spl;
              }
            }

            const contragentEntry = await strapi.entityService.create(
              'api::contragent.contragent',
              {
                data: {
                  name: payment.account.full_name,
                  ls: payment.account.account_no,
                  comment: `Комментарий: ${payment.account.comment}, курс: ${payment.account.group}, факультет: ${payment.account.doo}`,
                  inn,
                  resident,
                  create_ls: false,
                },
              }
            );

            console.log('Добавлен контрагент:', contragentEntry);

            continue; 
          }

          console.log('Before create payment', payment);

          const paymentEntry = await strapi.entityService.create(
            'api::payment.payment',
            {
              data: {
                payment_id: payment.payment_id,
                source: payment.source,
                amount: payment.amount,
                desc: payment.desc,
                paid_at: payment.paid_at,
                payment_purpose: payment.payment_purpose,
                aggregator_inn: payment.aggregator_inn,
                contragent: findedContragent[0]?.id,
              },
            }
          );

          console.log('paymentEntry', paymentEntry);

          const populatedPayment = await strapi.entityService.findOne(
            'api::payment.payment',
            paymentEntry.id,
            {
              populate: ['contragent'],
            }
          );

          paymentEntries.push(populatedPayment);
          
          index++;
        }

        ctx.send({
          message: `${paymentEntries.length} записей успешно создано`,
          data: paymentEntries,
        });
      }
    } catch (err) {
      console.log("catch error:", err)
      ctx.throw(500, `Ошибка сервера: ${err.message}`);
    }
  },
};

