const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    port: parseInt(process.env.DB_PORT),          // use true if on Azure
    trustServerCertificate: true, // for local dev / self-signed certs
  },
};

module.exports = config;