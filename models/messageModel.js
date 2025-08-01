const sql = require("mssql");
const dbConfig = require("../dbConfig");


async function getMessageBygID(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "select groupmessages.msgid, Seniors.seniorId ,Seniors.fullName ,groupmessages.message, groupmessages.msgtime from groupmessages inner join Seniors on Seniors.seniorId = groupmessages.userid where groupid = @id order by groupmessages.msgtime;";

    const request = connection.request();
    request.input("id", id );
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; 
    }

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

async function createMessage(messageData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO groupmessages (groupid, userid, message, msgtime) VALUES(@group, @user, @message, @msgtime); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("group", messageData.groupid);
    request.input("user", messageData.senderid);
    request.input("message", messageData.content);
    request.input("msgtime", messageData.timestamp);
    const result = await request.query(query);
    if (result.recordset.length === 0) {
      return null; 
    }
    return result.recordset[0].id; 

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

async function deleteMessage(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM groupmessages WHERE msgid = @msgId";
    const request = connection.request();
    request.input("msgId", id);
    await request.query(query);
    return { success: true, message: "Message deleted successfully" };
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
    getMessageBygID,
    createMessage,
    deleteMessage
}