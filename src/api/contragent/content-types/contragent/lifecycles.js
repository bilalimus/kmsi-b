const fetch = require("node-fetch");
const { apiUrl, authHeader } = require("../../../../../payget_conf");

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    const newData = {
      full_name: data.name,
      region: 11,
      comment: data.comment,
    };
    if (data.create_ls) {
      try {
        const response = await fetch(`${apiUrl}/account_no/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(newData),
        });

        if (!response.ok) {
          throw new Error("Ошибка HTTP: " + response.status);
        } else {
          const responseData = await response.json();
          data.ls = responseData.account_no;
        }
      } catch (error) {
        console.error("Ответ от сервера - ", error);
        throw new Error("Ошибка при получении лицевого счета");
      }
    }
  },
};
