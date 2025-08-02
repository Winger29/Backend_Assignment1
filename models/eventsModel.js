const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllEvents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT 
        e.eventId,
        e.title,
        e.organiserId,
        COALESCE(o.fullName, 'Unknown organiser') AS organiserName,
        e.eventDate,
        e.startTime,
        e.endTime,
        e.location
      FROM 
        Events e
      LEFT JOIN 
        Organisers o ON e.organiserId = o.organiserId
      ORDER BY 
        e.eventDate ASC, e.startTime ASC
    `;
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error (getAllEvents):", error);
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

async function getEventById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Events WHERE eventId = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);
    const result = await request.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
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

async function createEvent(eventData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const { organiserId, title, eventDate, startTime, endTime, location } = eventData;

    const query = `
      INSERT INTO Events (organiserId, title, eventDate, startTime, endTime, location)
      VALUES (@organiserId, @title, @eventDate, @startTime, @endTime, @location);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = connection.request();
    request.input("organiserId", sql.VarChar(10), organiserId);
    request.input("title", sql.VarChar(100), title);
    request.input("eventDate", sql.Date, eventDate);
    request.input("startTime", sql.VarChar(8), startTime);  
    request.input("endTime", sql.VarChar(8), endTime);      
    request.input("location", sql.VarChar(100), location);

    const result = await request.query(query);
    const newEventId = result.recordset[0].id;
    return await getEventById(newEventId);
  } catch (error) {
    console.error("Database error:", error);
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

async function updateEvent(id, eventData, organiserId = null) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const { title, eventDate, startTime, endTime, location } = eventData;

    // If organiserId is provided, only allow update if the event belongs to that organiser
    let query;
    let request = connection.request();
    
    if (organiserId) {
      query = `
        UPDATE Events
        SET title = @title,
            eventDate = @eventDate,
            startTime = @startTime,
            endTime = @endTime,
            location = @location
        WHERE eventId = @id AND organiserId = @organiserId;
      `;
      request.input("organiserId", sql.VarChar(10), organiserId);
    } else {
      query = `
        UPDATE Events
        SET title = @title,
            eventDate = @eventDate,
            startTime = @startTime,
            endTime = @endTime,
            location = @location
        WHERE eventId = @id;
      `;
    }

    request.input("id", sql.Int, id);
    request.input("title", sql.VarChar(100), title);
    request.input("eventDate", sql.Date, eventDate);
    request.input("startTime", sql.VarChar(8), startTime);  
    request.input("endTime", sql.VarChar(8), endTime);      
    request.input("location", sql.VarChar(100), location);

    const result = await request.query(query);
    if (result.rowsAffected[0] === 0) return null;
    return await getEventById(id);
  } catch (error) {
    console.error("Database error:", error);
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

async function deleteEvent(id, organiserId = null) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    let query;
    let request = connection.request();
    
    if (organiserId) {
      query = "DELETE FROM Events WHERE eventId = @id AND organiserId = @organiserId";
      request.input("organiserId", sql.VarChar(10), organiserId);
    } else {
      query = "DELETE FROM Events WHERE eventId = @id";
    }
    
    request.input("id", sql.Int, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Database error:", error);
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



async function isEventOwnedByOrganiser(eventId, organiserId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT eventId FROM Events WHERE eventId = @eventId AND organiserId = @organiserId";
    const request = connection.request();
    request.input("eventId", sql.Int, eventId);
    request.input("organiserId", sql.VarChar(10), organiserId);
    
    const result = await request.query(query);
    return result.recordset.length > 0;
  } catch (error) {
    console.error("Database error:", error);
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

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  isEventOwnedByOrganiser,
};
