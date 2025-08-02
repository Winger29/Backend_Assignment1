const sql = require('mssql');
require('dotenv').config();

const config = {
    user: 'activityapi_user',
  password: 'activitytracker',
  server: 'localhost',  // or '127.0.0.1'
  database: 'ActivityTrackerDB',
  options: {
    encrypt: false, // false for local dev; true for Azure
    trustServerCertificate: true, // required for self-signed certs / local
    port: 1433, // Default SQL Server port
    connectionTimeout: 60000, // Connection timeout in milliseconds
  }
};
module.exports = config;
