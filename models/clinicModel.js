const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get clinicId assigned to a staff member
async function getClinicIdByStaffId(staffId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig); // use local connection instance

    const request = connection.request(); // use connection-bound request
    request.input("staffId", sql.VarChar(10), staffId);

    const result = await request.query(`
      SELECT clinicId FROM ClinicStaff WHERE staffId = @staffId;
    `);

    return result.recordset[0]?.clinicId;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close(); // safely close only your own connection
  }
}

// Fetch all bookings for a clinic
async function getBookingsByClinicId(clinicId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("clinicId", sql.VarChar(10), clinicId);

    const result = await request.query(`
      SELECT 
        b.clinicId, 
        b.bookingDate, 
        b.bookingSeq, 
        CONVERT(varchar(5), b.appointmentTime, 108) AS appointmentTime,
        b.doctorId, 
        d.name AS doctorName,
        b.userId, 
        s.fullName AS seniorName,
        b.phone, 
        b.type, 
        b.status, 
        b.createdAt
      FROM Booking b
      JOIN Seniors s ON b.userId = s.seniorId
      JOIN Doctor d ON b.doctorId = d.doctorId
      WHERE b.clinicId = @clinicId
      ORDER BY b.bookingDate DESC, b.appointmentTime;
    `);

    return result.recordset;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close(); // safely close
  }
}

// Confirm a booking (update status)
async function confirmBooking(clinicId, bookingDate, bookingSeq, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = new sql.Request();

    request.input("clinicId", sql.VarChar(10), clinicId);
    request.input("bookingDate", sql.Date, bookingDate);
    request.input("bookingSeq", sql.Int, bookingSeq);
    request.input("userId", sql.VarChar(10), userId);

    const result = await request.query(`
      UPDATE Booking
      SET status = 'confirmed'
      WHERE clinicId = @clinicId
        AND bookingDate = @bookingDate
        AND bookingSeq = @bookingSeq
        AND userId = @userId;
    `);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}


// Delete booking only if status is 'cancelled'
async function deleteBookingIfCancelled(clinicId, bookingDate, bookingSeq, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = new sql.Request();

    request.input("clinicId", sql.VarChar(10), clinicId);
    request.input("bookingDate", sql.Date, bookingDate);
    request.input("bookingSeq", sql.Int, bookingSeq);
    request.input("userId", sql.VarChar(10), userId);

    const statusCheck = await request.query(`
      SELECT status FROM Booking
      WHERE clinicId = @clinicId
        AND bookingDate = @bookingDate
        AND bookingSeq = @bookingSeq
        AND userId = @userId;
    `);

    const booking = statusCheck.recordset[0];
    if (!booking) return { success: false, reason: "Not found" };
    if (booking.status !== "cancelled") return { success: false, reason: "Not cancelled" };

    const deleteRequest = new sql.Request();
    deleteRequest.input("clinicId", sql.VarChar(10), clinicId);
    deleteRequest.input("bookingDate", sql.Date, bookingDate);
    deleteRequest.input("bookingSeq", sql.Int, bookingSeq);
    deleteRequest.input("userId", sql.VarChar(10), userId);

    await deleteRequest.query(`
      DELETE FROM Booking
      WHERE clinicId = @clinicId
        AND bookingDate = @bookingDate
        AND bookingSeq = @bookingSeq
        AND userId = @userId;
    `);

    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}


async function getDoctorsByClinicId(clinicId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const request = new sql.Request();
    request.input("clinicId", sql.VarChar(10), clinicId);

    const result = await request.query(`
      SELECT 
        d.doctorId,
        d.name AS doctorName,
        d.email,
        d.doctorType,
        d.profileImage,
        dc.availableDay,
        CONVERT(varchar(5), dc.availableTime, 108) AS availableTime
      FROM DoctorClinic dc
      JOIN Doctor d ON dc.doctorId = d.doctorId
      WHERE dc.clinicId = @clinicId
      ORDER BY d.name, dc.availableDay, dc.availableTime;
    `);

    return result.recordset;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

async function cancelBooking(clinicId, bookingDate, bookingSeq, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input("clinicId", sql.VarChar(10), clinicId);
    request.input("bookingDate", sql.Date, bookingDate);
    request.input("bookingSeq", sql.Int, bookingSeq);
    request.input("userId", sql.VarChar(10), userId);

    const result = await request.query(`
      UPDATE Booking
      SET status = 'cancelled'
      WHERE clinicId = @clinicId AND bookingDate = @bookingDate
      AND bookingSeq = @bookingSeq AND userId = @userId;
    `);
    return result.rowsAffected[0] > 0;
  } finally {
    if (connection) await connection.close();
  }
}

async function getClinicDetailsById(clinicId) {
  let connection;
  try{
  connection = await sql.connect(dbConfig);
  const result = await connection.request()
    .input("clinicId", sql.VarChar(10), clinicId)
    .query("SELECT clinicName, location FROM Clinic WHERE clinicId = @clinicId");

  return result.recordset[0];
  }catch (err) {
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getClinicIdByStaffId,
  getBookingsByClinicId,
  confirmBooking,
  deleteBookingIfCancelled,
  getDoctorsByClinicId,
  getClinicDetailsById,
  cancelBooking
};
