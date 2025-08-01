const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get all groups (test if api works) 
async function getAllGroups(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "SELECT groupID, groupName, groupDesc, groupInterest FROM GroupChat WHERE NOT EXISTS (SELECT * FROM GroupMember WHERE GroupMember.groupID = GroupChat.groupID AND GroupMember.userID = @userid);";
        const request = connection.request();
        request.input("userid", id);
        const result = await request.query(query);
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

async function createGroup(groupData, userID) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO GroupChat (groupName, groupDesc, groupInterest) VALUES (@name, @description, @interest) SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("name", groupData.name);
    request.input("description", groupData.description);
    request.input("interest",groupData.interest);
    const result = await request.query(query);

    const groupID = result.recordset[0].id;
    
    const request2 = connection.request();
    const query2 ="insert into GroupMember (groupID, userID, roles) values (@gID, @uID, @role);"
    request2.input("gID",groupID);
    request2.input("uID",userID);
    request2.input("role","owner");
    const memberRes = await request2.query(query2);
    if (result.rowsAffected[0] > 0 && memberRes.rowsAffected[0] > 0) {
      return await getGroupByID(groupID)};
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

async function createMember(memberData, groupID) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    const query ="insert into GroupMember (groupID, userID, roles) values (@gID, @uID, @role);"
    request.input("gID",groupID);
    request.input("uID",memberData.userID);
    request.input("role","member");
    const memberRes = await request.query(query);
    if (memberRes.rowsAffected[0] > 0) {
      return "Group member created successfully"; 
    } else {
      throw new Error("Failed to create group member");
    }
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

async function getGroupByName(Name) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT groupID,groupName,groupDesc,groupInterest FROM GroupChat WHERE groupName = @name";
    const request = connection.request();
    request.input("name", Name );
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

    const request2 = connection.request();
    const query2 = "delete from GroupMember where groupID = @id;";
    request2.input("id", id);
    const deleted = await request2.query(query2);

    const query = "DELETE FROM GroupChat WHERE groupID = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.rowsAffected[0] > 0 && deleted.rowsAffected[0] > 0) {
      return "group deleted";
    }
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
    getGroupByName,
    createMember,
    updateGroupByID,
    deleteGroup,
    getGroupByUserID,
    createGroup
}