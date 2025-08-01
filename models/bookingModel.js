const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllClinics() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.query("SELECT clinicId,clinicName,location from  Clinic");
    return result.recordset;
  } catch (err) {
    console.error("getClinics() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function getDoctorsByClinicId(clinicId) {
    let connection;
    try{
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
        .input("clinicId", sql.VarChar, clinicId)
        .query(`
        SELECT DISTINCT 
            d.doctorId, 
            d.name AS doctorName, 
            d.doctorType
        FROM DoctorClinic dc
        JOIN Doctor d ON dc.doctorId = d.doctorId
        WHERE dc.clinicId = @clinicId
        `);
    return result.recordset;
    } catch (err) {
        console.error("getDoctorsByClinicID() error:", err);
        throw err;
    } finally {
        if (connection) await connection.close();
    }
}

async function getAvailableTimeSlots(clinicId, doctorId, weekday) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("clinicId", sql.VarChar, clinicId)
      .input("doctorId", sql.VarChar, doctorId)
      .input("availableDay", sql.VarChar, weekday)
      .query(`
        SELECT availableTime
        FROM DoctorClinic
        WHERE clinicId = @clinicId AND doctorId = @doctorId AND availableDay = @availableDay
        ORDER BY availableTime
      `);
    return result.recordset;
  } catch (err) {
    console.error("getAvailableTimeSlots() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function createBooking({ clinicId, bookingDate, appointmentTime, doctorId, userId, phone, type, status }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Get the next booking sequence for this clinic and date
    const seqResult = await connection.request()
      .input("clinicId", sql.VarChar, clinicId)
      .input("bookingDate", sql.Date, bookingDate)
      .query(`
        SELECT ISNULL(MAX(bookingSeq), 0) + 1 AS nextSeq
        FROM Booking

        WHERE clinicId = @clinicId AND bookingDate = @bookingDate
      `);

    const nextSeq = seqResult.recordset[0].nextSeq;
    const timeOnly = new Date(`1970-01-01T${appointmentTime}Z`);
    // Insert the new booking
    await connection.request()
      .input("clinicId", sql.VarChar, clinicId)
      .input("bookingDate", sql.Date, bookingDate)
      .input("bookingSeq", sql.Int, nextSeq)
      .input("appointmentTime", sql.Time, timeOnly)
      .input("doctorId", sql.VarChar, doctorId)
      .input("userId", sql.VarChar, userId)
      .input("phone", sql.VarChar, phone)
      .input("type", sql.VarChar, type)
      .input("status", sql.VarChar, status || 'pending')
      .query(`
        INSERT INTO Booking (
          clinicId, bookingDate, bookingSeq, appointmentTime,
          doctorId, userId, phone, type, status
        ) VALUES (
          @clinicId, @bookingDate, @bookingSeq, @appointmentTime,
          @doctorId, @userId, @phone, @type, @status
        )
      `);

    return { success: true, bookingSeq: nextSeq };
  } catch (err) {
    console.error("Error creating booking:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function fetchBookingsBySeniorId(seniorId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request()
      .input("seniorId", sql.VarChar(10), seniorId)
      .query(`
        SELECT 
            b.bookingSeq,
            b.bookingDate,
            b.clinicId,
            b.appointmentTime,
            b.status,
            b.doctorId,
            d.name AS doctorName,
            c.clinicName
        FROM Booking b
        JOIN Doctor d ON b.doctorId = d.doctorId
        JOIN Clinic c ON b.clinicId = c.clinicId
        WHERE b.userId = @seniorId
        ORDER BY b.bookingDate DESC, b.appointmentTime DESC
      `);

    return result.recordset;
  } catch (err) {
    console.error("fetchBookingsBySeniorId() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function cancelBooking(clinicId, bookingDate, bookingSeq, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Only update if the booking belongs to the user
    const result = await connection.request()
      .input("clinicId", sql.VarChar(10), clinicId)
      .input("bookingDate", sql.Date, bookingDate)
      .input("bookingSeq", sql.Int, bookingSeq)
      .input("userId", sql.VarChar(10), userId)
      .query(`
        UPDATE Booking
        SET status = 'cancelled'
        WHERE clinicId = @clinicId
          AND bookingDate = @bookingDate
          AND bookingSeq = @bookingSeq
          AND userId = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("No matching booking found or unauthorized");
    }

    return { success: true };
  } catch (err) {
    console.error("cancelBooking() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function updateBookingTime(clinicId, bookingDate, bookingSeq, userId, newTime) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    // Step 1: Get the doctorId for the booking
    const result = await connection.request()
      .input("clinicId", sql.VarChar(10), clinicId)
      .input("bookingDate", sql.Date, bookingDate)
      .input("bookingSeq", sql.Int, bookingSeq)
      .input("userId", sql.VarChar(10), userId)
      .query(`
        SELECT doctorId FROM Booking
        WHERE clinicId = @clinicId
          AND bookingDate = @bookingDate
          AND bookingSeq = @bookingSeq
          AND userId = @userId
      `);

    if (result.recordset.length === 0) {
      throw new Error("Booking not found or unauthorized");
    }

    const doctorId = result.recordset[0].doctorId;

    // Step 2: Get the day of the week from bookingDate
    const dayNameResult = await connection.request()
      .input("bookingDate", sql.Date, bookingDate)
      .query(`SELECT DATENAME(WEEKDAY, @bookingDate) AS dayName`);
    
    const availableDay = dayNameResult.recordset[0].dayName;

    // Step 3: Check doctor availability and conflicts
    const availabilityCheck = await connection.request()
      .input("clinicId", sql.VarChar(10), clinicId)
      .input("doctorId", sql.VarChar(10), doctorId)
      .input("availableDay", sql.VarChar(10), availableDay)
      .input("newTime", sql.Time, newTime)
      .input("bookingDate", sql.Date, bookingDate)
      .query(`
        SELECT dc.availableTime
        FROM DoctorClinic dc
        WHERE dc.clinicId = @clinicId
          AND dc.doctorId = @doctorId
          AND dc.availableDay = @availableDay
          AND dc.availableTime = @newTime
          AND NOT EXISTS (
            SELECT 1 FROM Booking b
            WHERE b.clinicId = dc.clinicId
              AND b.doctorId = dc.doctorId
              AND b.bookingDate = @bookingDate
              AND b.appointmentTime = @newTime
              AND b.status != 'cancelled'
          )
      `);

    if (availabilityCheck.recordset.length === 0) {
      throw new Error("Selected time is not available for this doctor on that day");
    }

    // Step 4: Perform the update
    await connection.request()
      .input("clinicId", sql.VarChar(10), clinicId)
      .input("bookingDate", sql.Date, bookingDate)
      .input("bookingSeq", sql.Int, bookingSeq)
      .input("userId", sql.VarChar(10), userId)
      .input("newTime", sql.Time, newTime)
      .query(`
        UPDATE Booking
        SET appointmentTime = @newTime
        WHERE clinicId = @clinicId
          AND bookingDate = @bookingDate
          AND bookingSeq = @bookingSeq
          AND userId = @userId
      `);

    return { success: true };

  } catch (err) {
    console.error("updateBookingTime() error:", err);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function checkExistingBooking({ clinicId, doctorId, bookingDate, appointmentTime, userId }) {
  let connection;
  try{
    connection = await sql.connect(dbConfig);

    const result = await connection.request()
    .input("clinicId", sql.VarChar(10), clinicId)
    .input("doctorId", sql.VarChar(10), doctorId)
    .input("bookingDate", sql.Date, bookingDate)
    .input("appointmentTime", sql.Time, new Date(`1970-01-01T${appointmentTime}Z`))
    .input("userId", sql.VarChar(10), userId)
    .query(`
      SELECT COUNT(*) AS count FROM Booking
      WHERE clinicId = @clinicId
        AND doctorId = @doctorId
        AND bookingDate = @bookingDate
        AND appointmentTime = @appointmentTime
        AND userId = @userId
        AND status NOT IN ('cancelled')
    `);

    return result.recordset[0].count > 0;
    }catch(err){
    throw err;
    }finally{
      if (connection) await connection.close();
    }
}

module.exports = {
    getAllClinics,
    getDoctorsByClinicId,
    getAvailableTimeSlots,
    createBooking,
    fetchBookingsBySeniorId,
    cancelBooking,
    updateBookingTime,
    checkExistingBooking
};
