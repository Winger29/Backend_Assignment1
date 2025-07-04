const sql = require("mssql");
const dbConfig = require("../dbConfig");


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
        const query=`
            Update Seniors
            SET fullName=@fullName,email=@email,password=@password,dob=@dob,interests=@interests,profileImage=@profileImage
            where seniorId=@seniorId
        `
        const request=connection.request();
        request.input("seniorId",sql.Varchar(10),seniorId);
        request.input("fullName",sql.Varchar(100),updatedSenior.fullName);
        request.input("email",sql.VarChar(255),updatedSenior.email);
        request.input("password",sql.VarChar(100),updatedSenior.password);
        request.input("dob",sql.Date,updatedSenior.dob);
        request.input("interests",sql.Text,updatedSenior.interests);
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
                clinicId = @clinicId,
                position = @position,
                isRegistered = @isRegistered
            WHERE staffId = @staffId
        `;

        const request = connection.request();
        request.input('staffId', sql.VarChar(10), staffId);
        request.input('fullName', sql.VarChar(100), updatedStaff.fullName);
        request.input('clinicId', sql.VarChar(10), updatedStaff.clinicId);
        request.input('position', sql.VarChar(50), updatedStaff.position);
        request.input('isRegistered', sql.Bit, updatedStaff.isRegistered);

        const result = await request.query(query);
        return result;
    } catch (error) {
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
        request.input("seniorId", sql.Varchar(10), seniorId);
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

    const table = role === "staff" ? "StaffAccounts" : "Seniors";
    const query = `
      SELECT * FROM ${table}
      WHERE email = @email AND password = @password
    `;

    const request = connection.request();
    request.input("email", sql.VarChar(100), email);
    request.input("password", sql.VarChar(255), password);

    const result = await request.query(query);
    return result.recordset[0] || null;

  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
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
    checkEmailExists,
}