const sql = require("mssql");
const dbConfig = require("../dbConfig");
require("dotenv").config();

//create senior
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

//create organiser
async function createOrganiser(data) {
  let connection;
  try{
      connection = await sql.connect(dbConfig);
      
      const insertResult = await connection.request()
      .input("fullName", sql.VarChar, data.fullName)
      .input("email", sql.VarChar, data.email)
      .input("password", sql.VarChar, data.password)
      .input("contactNumber", sql.VarChar, data.contactNumber || null)
      .query(`
        INSERT INTO Organisers (fullName, email, password, contactNumber)
        OUTPUT inserted.id
        VALUES (@fullName, @email, @password, @contactNumber)
      `);

      const insertedId = insertResult.recordset[0].id;

      // Now get the computed organiserId
      const idResult = await connection.request()
        .input("id", sql.Int, insertedId)
        .query(`SELECT organiserId FROM Organisers WHERE id = @id`);

      const newOrganiserId = idResult.recordset[0].organiserId;
      return newOrganiserId;
    } catch (error) {
      console.error('createOrganiser() error:', error);
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

//register staff only staff assigned to clinic only can register
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

//login with different role
async function loginUser(role, email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    let query = "";

    if (role === "senior") {
      query = `
        SELECT seniorId AS userId, fullName, email,password
        FROM Seniors
        WHERE email = @Email
      `;
    } else if (role === "staff") {
      query = `
        SELECT sa.staffId AS userId, cs.fullName, sa.email,sa.password
        FROM StaffAccounts sa
        JOIN ClinicStaff cs ON sa.staffId = cs.staffId
        WHERE sa.email = @Email 
      `;
    } else if (role === "organiser") {
      query = `SELECT organiserId AS userId, fullName, password FROM Organisers WHERE email = @Email`;
    } else {
      throw new Error("Invalid role");
    }

    const request = connection.request();
    request.input("Email", sql.VarChar, email);
    const result = await request.query(query);
    return result.recordset[0];

  } catch (err) {
    console.error("Error in loginUser:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}


//check email exist
async function checkEmailExists(role, email) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    let table;
    if (role === "senior") table = "Seniors";
    else if (role === "staff") table = "StaffAccounts";
    else if (role === "organiser") table = "Organisers";
    else throw new Error("Invalid role");

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

//update senior
async function updateSenior(seniorId, updatedSenior) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const queryParts = [];
    const request = connection.request().input("seniorId", sql.VarChar(10), seniorId);

    if (updatedSenior.fullName) {
      queryParts.push("fullName = @fullName");
      request.input("fullName", sql.VarChar(100), updatedSenior.fullName);
    }

    if (updatedSenior.password) {
      queryParts.push("password = @password");
      request.input("password", sql.VarChar(255), updatedSenior.password);
    }

    if (updatedSenior.interests) {
      queryParts.push("interests = @interests");
      request.input("interests", sql.Text, updatedSenior.interests);
    }

    if (updatedSenior.profileImage) {
      queryParts.push("profileImage = @profileImage");
      request.input("profileImage", sql.VarChar(255), updatedSenior.profileImage);
    }

    if (queryParts.length === 0) throw new Error("No fields provided for update.");

    const query = `
      UPDATE Seniors
      SET ${queryParts.join(", ")}
      WHERE seniorId = @seniorId
    `;

    return await request.query(query);
  } catch (error) {
    console.error("updateSenior() error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

//update staff
async function updateStaff(staffId, updatedStaff) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Update ClinicStaff
    const csParts = [];
    const csRequest = connection.request().input("staffId", sql.VarChar(10), staffId);

    if (updatedStaff.fullName) {
      csParts.push("fullName = @fullName");
      csRequest.input("fullName", sql.VarChar(100), updatedStaff.fullName);
    }

    if (updatedStaff.position) {
      csParts.push("position = @position");
      csRequest.input("position", sql.VarChar(50), updatedStaff.position);
    }

    if (csParts.length > 0) {
      const csQuery = `UPDATE ClinicStaff SET ${csParts.join(", ")} WHERE staffId = @staffId`;
      await csRequest.query(csQuery);
    }

    // Update StaffAccounts
    const saParts = [];
    const saRequest = connection.request().input("staffId", sql.VarChar(10), staffId);

    if (updatedStaff.email) {
      saParts.push("email = @email");
      saRequest.input("email", sql.VarChar(100), updatedStaff.email);
    }

    if (updatedStaff.password) {
      saParts.push("password = @password");
      saRequest.input("password", sql.VarChar(255), updatedStaff.password);
    }

    if (updatedStaff.profileImage) {
      saParts.push("profileImage = @profileImage");
      saRequest.input("profileImage", sql.VarChar(255), updatedStaff.profileImage);
    }

    if (saParts.length > 0) {
      const saQuery = `UPDATE StaffAccounts SET ${saParts.join(", ")} WHERE staffId = @staffId`;
      return await saRequest.query(saQuery);
    }

    return { success: true };
  } catch (error) {
    console.error("updateStaff() error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

//update organiser profile
async function updateOrganiser(organiserId, updatedOrganiser) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const queryParts = [];
    const request = connection.request().input("organiserId", sql.VarChar(10), organiserId);

    if (updatedOrganiser.fullName) {
      queryParts.push("fullName = @fullName");
      request.input("fullName", sql.VarChar(100), updatedOrganiser.fullName);
    }

    if (updatedOrganiser.email) {
      queryParts.push("email = @email");
      request.input("email", sql.VarChar(100), updatedOrganiser.email);
    }

    if (updatedOrganiser.password) {
      queryParts.push("password = @password");
      request.input("password", sql.VarChar(255), updatedOrganiser.password);
    }

    if (updatedOrganiser.contactNumber) {
      queryParts.push("contactNumber = @contactNumber");
      request.input("contactNumber", sql.VarChar(15), updatedOrganiser.contactNumber);
    }

    if (queryParts.length === 0) throw new Error("No fields provided for update.");

    const query = `
      UPDATE Organisers
      SET ${queryParts.join(", ")}
      WHERE organiserId = @organiserId
    `;

    return await request.query(query);
  } catch (error) {
    console.error("updateOrganiser() error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

//delete senior
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

//delete staff profile
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

//delete organiser profile
async function deleteOrganiser(organiserId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request()
      .input("organiserId", sql.VarChar(10), organiserId);

    const result = await request.query(`DELETE FROM Organisers WHERE organiserId = @organiserId`);
    return result; // result.rowsAffected[0]
  } catch (error) {
    console.error("deleteOrganiser() error:", error);
    throw error;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

//get user profile
async function getUserProfile(role, id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    let query = "";

    if (role === "senior") {
      query = `
        SELECT seniorId AS userId, fullName, email, dob, interests
        FROM Seniors
        WHERE seniorId = @id
      `;
      request.input("id", sql.VarChar(10), id);

    } else if (role === "staff") {
      query = `
        SELECT cs.staffId AS userId, cs.fullName, sa.email, cs.clinicId, cs.position, sa.profileImage
        FROM ClinicStaff cs
        JOIN StaffAccounts sa ON cs.staffId = sa.staffId
        WHERE cs.staffId = @id
      `;
      request.input("id", sql.VarChar(10), id);

    } else if (role === "organiser") {
      query = `
        SELECT organiserId AS userId, fullName, email, contactNumber
        FROM Organisers
        WHERE organiserId = @id
      `;
      request.input("id", sql.VarChar(10), id);

    } else {
      throw new Error("Invalid role");
    }

    const result = await request.query(query);
    return result.recordset[0];

  } catch (err) {
    console.error("getUserProfile() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close().catch(console.error);
  }
}

module.exports={
    createSenior,
    registerStaff,
    createOrganiser,
    updateSenior,
    updateStaff,
    updateOrganiser,
    deleteOrganiser,
    deleteSenior,
    deleteStaff,
    loginUser,
    getUserProfile,
    checkEmailExists,
}