const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getSignup(seniorId, eventId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("seniorId", sql.VarChar(10), seniorId)
      .input("eventId", sql.Int, eventId)
      .query(`
        SELECT * FROM eventSignups
        WHERE seniorid = @seniorId AND eventid = @eventId
      `);
    return result.recordset[0]; // returns undefined if not found
  } catch (error) {
    console.error("Model error in getSignup:", error);
    throw error;
  }
}

async function addSignup(seniorId, eventId) {
  try {
    const pool = await sql.connect(dbConfig);

    // Check if event exists
    const check = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query("SELECT eventid FROM events WHERE eventid = @eventId");

    if (check.recordset.length === 0) {
      throw new Error("Event ID does not exist.");
    }

    const result = await pool
      .request()
      .input("seniorId", sql.VarChar(10), seniorId)
      .input("eventId", sql.Int, eventId)
      .query(`
        INSERT INTO eventSignups (seniorid, eventid)
        OUTPUT inserted.seniorid, inserted.eventid
        VALUES (@seniorId, @eventId)
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Model error in addSignup:", error);
    throw error;
  }
}

async function getEventSignups(eventId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query(`
        SELECT 
          es.seniorid,
          s.fullName
        FROM eventSignups es
        JOIN Seniors s ON es.seniorid = s.seniorId
        WHERE es.eventid = @eventId
        ORDER BY s.fullName
      `);
    return result.recordset;
  } catch (error) {
    console.error("Model error in getEventSignups:", error);
    throw error;
  }
}


module.exports = {
  getSignup,
  addSignup,
  getEventSignups,
};
