const apiUrl = 'https://pay.get.kg/api';
const login = 'bilalimus@gmail.com';
const password = 'dtP5nRWx';

const authString = `${login}:${password}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

module.exports = { apiUrl, authHeader };
