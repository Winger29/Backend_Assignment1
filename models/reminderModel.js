const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllReminders() {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request().query("SELECT * FROM MedicineReminders");
  return result.recordset;
}

async function createReminder(data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("userId", sql.Int, data.userId)
    .input("title", sql.NVarChar, data.title)
    .input("notes", sql.NVarChar, data.notes)
    .input("reminderDate", sql.DateTime, data.reminderDate)
    .query("INSERT INTO MedicineReminders (userId, title, notes, reminderDate) VALUES (@userId, @title, @notes, @reminderDate)");
}

async function updateReminder(id, data) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("id", sql.Int, id)
    .input("userId", sql.Int, data.userId)
    .input("title", sql.NVarChar, data.title)
    .input("notes", sql.NVarChar, data.notes)
    .input("reminderDate", sql.DateTime, data.reminderDate)
    .query(`
      UPDATE MedicineReminders
      SET userId = @userId, title = @title, notes = @notes, reminderDate = @reminderDate
      WHERE id = @id
    `);
}

async function deleteReminder(id) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input("id", sql.Int, id)
    .query("DELETE FROM MedicineReminders WHERE id = @id");
}

module.exports = {
  getAllReminders,
  createReminder,
  updateReminder,
  deleteReminder
};

