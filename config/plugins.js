// const { register } = require("../src");

module.exports = ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '1d',
      },
      register: {
        allowedFields: ["usersurname", "mycompany"],
      }
    },
  },
  // ...
});
