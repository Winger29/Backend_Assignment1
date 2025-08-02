async function getMyEvents(seniorId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT 
        e.eventId,
        e.title,
        e.organiserId,
        o.fullName AS organiserName,
        e.eventDate,
        e.startTime,
        e.endTime,
        e.location,
        es.seniorid
      FROM 
        Events e
      LEFT JOIN 
        Organisers o ON e.organiserId = o.organiserId
      INNER JOIN 
        eventSignups es ON e.eventId = es.eventid
      WHERE 
        es.seniorid = @seniorId
      ORDER BY 
        e.eventDate ASC, e.startTime ASC
    `;
    
    const request = connection.request();
    request.input("seniorId", sql.VarChar(10), seniorId);
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error (getMyEvents):", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

async function cancelSignup(seniorId, eventId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("seniorId", sql.VarChar(10), seniorId)
      .input("eventId", sql.Int, eventId)
      .query(`
        DELETE FROM eventSignups
        WHERE seniorid = @seniorId AND eventid = @eventId
      `);
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Model error in cancelSignup:", error);
    throw error;
  }
}

module.exports = {
  getMyEvents,
  cancelSignup,
};