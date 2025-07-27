const sql = require("mssql");
const dbConfig = require("../dbConfig");


async function getMessageBygID(id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = "select Seniors.fullName, groupmessages.message, groupmessages.msgtime from groupmessages inner join Seniors on Seniors.seniorId = groupmessages.userid where groupid = @id order by groupmessages.msgtime;";

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


  
module.exports = {
    getMessageBygID
}