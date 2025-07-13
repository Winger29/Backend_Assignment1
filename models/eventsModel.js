const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllEvents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * From Events";
    const result = await connection.request().query(query);
    return result.recordset;
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

async function getEventById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Events WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; 
    }

    return result.recordset[0];
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
    const query =`
      INSERT INTO Events (organiserId, title, eventDate, startTime, endTime, location) 
      VALUES (@organiserId, @title, @eventDate, @startTime, @endTime, @location); SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = connection.request();
    request.input("organiserId", sql.VarChar(10), organiserId)
    request.input("title", sql.VarChar(100), title);
    request.input("eventDate", sql.Date, eventDate);
    request.input("startTime", sql.Time, startTime);
    request.input("endTime", sql.Time, endTime);
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
      } 
      catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

async function updateEvent(id,eventData){
  let connection;
  try{
    connection = await sql.connect(dbConfig);
    const { organiserId, title, eventDate, startTime, endTime, location } = eventData;
    const query = `
    UPDATE Events
    SET organiserId = @organiserId,
        title = @title,
        eventDate = @eventDate,
        startTime = @startTime,
        endTime = @endTime,
        location = @location
    WHERE id = @id;
    `;

    const request = connection.request();
    request.input("id", sql.Int, id);
    request.input("organiserId", sql.VarChar(10), organiserId);
    request.input("title", sql.VarChar(100), title);
    request.input("eventDate", sql.Date, eventDate);
    request.input("startTime", sql.Time, startTime);
    request.input("endTime", sql.Time, endTime);
    request.input("location", sql.VarChar(100), location);

    const result = await request.query(query);
    if (result.rowsAffected[0] === 0) {
      return null ; 
    }
    return await getEventById(id);
  }
  catch(error){
    console.error("Database error:", error);
    throw error
  }
  finally{
    if(connection){
      try{
        await connection.close();
      }
      catch(error){
        console.error("Error closing connection:", error);
      }
    }
  }
}

async function deleteEvent(id){
  let connection;
  try{
    connection = await sql.connect(dbConfig);
    const sqlQuery = 
    "DELETE FROM Events WHERE id = @id";
    const request = connection.request();
    request.input("id", sql.Int, id);

    const result = await request.query(sqlQuery);
    if (result.rowsAffected[0]==0){
      return null;
    }
    return true;
  }
  catch(error){
    console.error("Database error",error);
    throw error;
  }
  finally{
    if (connection){
      try{
        await connection.close();
      }
      catch(error){
        console.error("error when closing connection", error)
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
};  