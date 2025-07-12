const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get all groups (test if api works) 
async function getAllGroups() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "select groupName,groupDesc,groupInterest from GroupChat";
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

async function getGroupByID(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT groupName,groupDesc,groupInterest FROM GroupChat WHERE groupID = @id";
    const request = connection.request();
    request.input("id", id );
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // Groupchat not found
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


async function updateGroupByID(id, groupData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "UPDATE GroupChat SET groupName = @groupName, groupDesc = @groupDesc, groupInterest = @groupInterest WHERE groupID = @id";
    const request = connection.request();
    request.input("id", id);
    request.input("groupName", groupData.groupName);
    request.input("groupDesc", groupData.groupDesc);
    request.input("groupInterest", groupData.groupInterest);
    await request.query(query);

    return await getGroupByID(id); 
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

async function deleteGroup(id) {

}

module.exports = {
    getAllGroups,
    getGroupByID,
    updateGroupByID,
    deleteGroup
}