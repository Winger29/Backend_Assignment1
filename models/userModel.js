const sql = require("mssql");
const dbConfig = require("../dbConfig");
const jwt=require("jsonwebtoken");
require("dotenv").config();

async function createSenior(senior){
    let connection;
    try{
        connection= await sql.connect(dbConfig);
        //get new senior Id
        const idResult = await connection.request().query(`
            SELECT MAX(CAST(SUBSTRING(seniorId, 2, LEN(seniorId)) AS INT)) AS maxId
            FROM Seniors
        `);
        const nextNumber = (idResult.recordset[0].maxId || 0) + 1;
        const newSeniorId = 'S' + nextNumber.toString().padStart(3, '0');


        const query = `
            INSERT INTO Seniors (seniorId, fullName, email, password, dob, interests, profileImage)
            VALUES (@seniorId, @fullName, @email, @password, @dob, @interests, @profileImage)
        `;
        const request = connection.request();
        request.input("seniorId", sql.VarChar(10), newSeniorId);
        request.input("fullName", sql.VarChar(100), senior.fullName);
        request.input("email", sql.VarChar(100), senior.email);
        request.input("password", sql.VarChar(255), senior.password);
        request.input("dob", sql.Date, senior.dob);
        request.input("interests", sql.Text, senior.interests);
        request.input("profileImage", sql.VarChar(255), senior.profileImage);

        await request.query(query);
        return newSeniorId;

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

async function registerStaff({ staffId, clinicId, email, password, profileImage }) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        // Step 1: Check if staffId and clinicId exist and not registered
        const checkResult = await connection.request()
            .input('staffId', sql.VarChar(10), staffId)
            .input('clinicId', sql.VarChar(10), clinicId)
            .query(`
                SELECT * FROM ClinicStaff
                WHERE staffId = @staffId AND clinicId = @clinicId AND isRegistered = 0
            `);

        if (checkResult.recordset.length === 0) {
            throw new Error('Staff ID not found or already registered');
        }

        // Step 2: Insert into StaffAccounts
        await connection.request()
            .input('staffId', sql.VarChar(10), staffId)
            .input('email', sql.VarChar(100), email)
            .input('password', sql.VarChar(255), password)  // plain password
            .input('profileImage', sql.VarChar(255), profileImage || null)
            .query(`
                INSERT INTO StaffAccounts (staffId, email, password, profileImage)
                VALUES (@staffId, @email, @password, @profileImage)
            `);

        // Step 3: Mark staff as registered in ClinicStaff
        await connection.request()
            .input('staffId', sql.VarChar(10), staffId)
            .query(`UPDATE ClinicStaff SET isRegistered = 1 WHERE staffId = @staffId`);

        return { success: true, staffId };

    } catch (error) {
        console.error('registerStaff() error:', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
}

async function updateSenior(seniorId,updatedSenior){
    let connection;
    try{
        connection = await sql.connect(dbConfig);
        const queryParts = [];
      const request = connection.request();

    if (updatedSenior.fullName) {
    queryParts.push("fullName = @fullName");
    request.input("fullName", sql.VarChar(100), updatedSenior.fullName);
    }
    if (updatedSenior.password && updatedSenior.password !== "********") {
    queryParts.push("password = @password");
    request.input("password", sql.VarChar(100), updatedSenior.password);
    }
    if (updatedSenior.interests) {
    queryParts.push("interests = @interests");
    request.input("interests", sql.Text, updatedSenior.interests);
    }

    if (queryParts.length === 0) {
        throw new Error("No fields provided for update.");
        }

    const query = `
    UPDATE Seniors
    SET ${queryParts.join(", ")}
    WHERE seniorId = @seniorId
    `;
    request.input("seniorId", sql.VarChar(10), seniorId);
            const result=await request.query(query);
            return result;
    }catch(error){
        console.error("Database error (update):", error);
        throw error;
    } finally {
        if (connection) await connection.close().catch(console.error);
    }
}

async function updateStaff(staffId, updatedStaff) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);

        const query = `
            UPDATE ClinicStaff
            SET fullName = @fullName,
                position = @position,
            WHERE staffId = @staffId
        `;

         const csRequest = connection.request();
    csRequest.input('staffId', sql.VarChar(10), staffId);
    csRequest.input('fullName', sql.VarChar(100), updatedStaff.fullName);
    csRequest.input('position', sql.VarChar(50), updatedStaff.position);
    await csRequest.query(`
      UPDATE ClinicStaff
      SET fullName = @fullName, position = @position
      WHERE staffId = @staffId
    `);

    // Update StaffAccounts (optional fields)
    const saFields = [];
    const saRequest = connection.request();
    saRequest.input('staffId', sql.VarChar(10), staffId);

    if (updatedStaff.email) {
      saFields.push('email = @email');
      saRequest.input('email', sql.VarChar(100), updatedStaff.email);
    }

    if (updatedStaff.password && updatedStaff.password !== '********') {
      saFields.push('password = @password');
      saRequest.input('password', sql.VarChar(255), updatedStaff.password);
    }

    if (updatedStaff.position) {
      saFields.push('position= @position');
      saRequest.input('position', sql.VarChar(255), updatedStaff.position);
    }

    if (saFields.length > 0) {
      const query = `
        UPDATE StaffAccounts
        SET ${saFields.join(', ')}
        WHERE staffId = @staffId
      `;

        const result = await request.query(query);
        return result;
    } }catch (error) {
        console.error('Database error (updateStaff):', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}


async function deleteSenior(seniorId){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = "DELETE FROM Seniors WHERE seniorId=@seniorId";
        const request = connection.request();
        request.input("seniorId", sql.VarChar(10), seniorId);
        const result = await request.query(query);
        return result; // result.rowsAffected[0] shows affected rows
    } catch (error) {
        console.error("Database error (delete):", error);
        throw error;
    } finally {
        if (connection) await connection.close().catch(console.error);
    }
}

async function deleteStaff(staffId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request()
      .input('staffId', sql.VarChar(10), staffId)
      .query(`DELETE FROM StaffAccounts WHERE staffId = @staffId`);

    // Step 2: Set isRegistered = 0 in ClinicStaff
    const result = await connection.request()
      .input('staffId', sql.VarChar(10), staffId)
      .query(`UPDATE ClinicStaff SET isRegistered = 0 WHERE staffId = @staffId`);

        return result; // result.rowsAffected[0]
    } catch (error) {
        console.error("Database error (deleteStaff):", error);
        throw error;
    } finally {
        if (connection) await connection.close().catch(console.error);
    }
}

async function loginUser(role, email, password) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    let query = "";

    if (role === "senior") {
      query = `
        SELECT seniorId AS userId, fullName, email,password
        FROM Seniors
        WHERE email = @Email and password=@Password
      `;
    } else if (role === "staff") {
      query = `
        SELECT sa.staffId AS userId, cs.fullName, sa.email,sa.password
        FROM StaffAccounts sa
        JOIN ClinicStaff cs ON sa.staffId = cs.staffId
        WHERE sa.email = @Email and sa.Password=@password
      `;
    } else {
      throw new Error("Invalid role");
    }

    const request = connection.request();
    request.input("Email", sql.VarChar, email);
    request.input("Password", sql.VarChar, password);
    const result = await request.query(query);

    const user = result.recordset[0];
    if (!user) return null;

    const token = jwt.sign(
      { id: user.userId, role: role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role,
      token,
    };

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

async function getSeniorProfile(seniorId) {
    let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("seniorId", sql.VarChar, seniorId);

    const result = await request.query(`
      SELECT seniorId AS userId, fullName, email, dob, interests
      FROM Seniors
      WHERE seniorId = @seniorId
    `);
    return result.recordset[0];
  } catch (err) {
    console.error('Error in getSeniorProfile:', err);
    throw err;
  } finally {
    await sql.close(); // Close the connection
  }
}

async function getStaffProfile(staffId) {
    let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("staffId", sql.VarChar, staffId);

    const result = await request.query(`
      SELECT 
        cs.staffId AS userId,
        cs.fullName,
        sa.email,
        cs.clinicId,
        cs.position,
        sa.profileImage
      FROM ClinicStaff cs
      JOIN StaffAccounts sa ON cs.staffId = sa.staffId
      WHERE cs.staffId = @staffId
    `);

    return result.recordset[0];
  } catch (err) {
    console.error('Error in getStaffProfile:', err);
    throw err;
  } finally {
    await sql.close(); // Close the connection
  }
}

async function checkEmailExists(role, email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const table = role === "staff" ? "StaffAccounts" : "Seniors";

    const result = await connection.request()
      .input("email", sql.VarChar(100), email)
      .query(`SELECT 1 FROM ${table} WHERE email = @email`);

    return result.recordset.length > 0;

  } catch (err) {
    console.error("Email check error:", err);
    throw err;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

module.exports={
    createSenior,
    registerStaff,
    updateSenior,
    updateStaff,
    deleteSenior,
    deleteStaff,
    loginUser,
    getSeniorProfile,
    getStaffProfile,
    checkEmailExists,
}