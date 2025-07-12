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

// get group details by user joined 
async function getGroupByUserID(id){
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "select groupName,groupDesc,groupInterest from GroupChat inner join GroupMember on GroupChat.groupID = GroupMember.groupID inner join Seniors on Seniors.seniorId = GroupMember.userID where userID = @id";
    const request = connection.request();
    request.input("id", id);
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

async function deleteGroup(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "DELETE FROM GroupChat WHERE groupID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null; 
    }

    return { message: "GroupChat deleted successfully" };
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
    getAllGroups,
    getGroupByID,
    updateGroupByID,
    deleteGroup,
    getGroupByUserID
}