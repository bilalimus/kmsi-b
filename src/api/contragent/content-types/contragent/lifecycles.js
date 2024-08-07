const fetch = require('node-fetch');

const apiUrl = "https://pay.get.kg/api/account_no/create";
const login = "bilalimus@gmail.com";
const password = "dtP5nRWx";

const authString = `${login}:${password}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    const newData = {
      full_name: data.name, 
      region: 13,
      comment: data.comment 
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify(newData)
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
  },
};
