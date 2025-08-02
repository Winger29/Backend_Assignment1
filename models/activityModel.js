const sql = require('mssql');
const dbConfig = require('../activityDbConfig');

async function getAllActivities() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query('SELECT * FROM Activities');
  return result.recordset;
}

async function createActivity(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('userId', sql.Int, data.userId)
    .input('activityName', sql.VarChar(100), data.activityName)
    .input('duration', sql.Int, data.duration)
    .input('date', sql.Date, data.date)
    .input('notes', sql.Text, data.notes || null)
    .query(`
      INSERT INTO Activities (userId, activityName, duration, date, notes)
      VALUES (@userId, @activityName, @duration, @date, @notes)
    `);
}

async function updateActivity(id, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('id', sql.Int, id)
    .input('activityName', sql.VarChar(100), data.activityName)
    .input('duration', sql.Int, data.duration)
    .input('date', sql.Date, data.date)
    .input('notes', sql.Text, data.notes || null)
    .query(`
      UPDATE Activities
      SET activityName = @activityName, duration = @duration, date = @date, notes = @notes
      WHERE id = @id
    `);
}

async function deleteActivity(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Activities WHERE id = @id');
}

module.exports = {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
