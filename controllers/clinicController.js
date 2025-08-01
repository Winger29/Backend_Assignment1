const clinicModel = require("../models/clinicModel");

async function getBookingsForStaff(req, res) {
  const { id: staffId, role } = req.user;

  if (role !== "staff") {
    return res.status(403).json({ error: "Only staff can view clinic bookings" });
  }

  try {
    // Step 1: Get clinicId from staffId
    const clinicId = await clinicModel.getClinicIdByStaffId(staffId);
    if (!clinicId) {
      return res.status(404).json({ error: "No clinic assigned to this staff" });
    }

    // Step 2: Fetch bookings for that clinic
    const bookings = await clinicModel.getBookingsByClinicId(clinicId);
    res.status(200).json(bookings);
  } catch (err) {
    console.error("getBookingsForStaff error:", err);
    res.status(500).json({ error: "Failed to fetch clinic bookings" });
  }
}



//Confirm booking (requires staff role)
async function confirmBookingByStaff(req, res) {
  const { id: staffId, role } = req.user;
  const { clinicId, bookingDate, bookingSeq, userId } = req.params;

  if (role !== "staff") {
    return res.status(403).json({ error: "Only staff can confirm bookings" });
  }

  try {
    const assignedClinicId = await clinicModel.getClinicIdByStaffId(staffId);

    if (assignedClinicId !== clinicId) {
      return res.status(403).json({ error: "You are not authorized to manage this clinic's bookings" });
    }
    
    const success = await clinicModel.confirmBooking(clinicId, bookingDate, bookingSeq, userId);

    if (success) res.json({ message: "Booking confirmed" });
    else res.status(404).json({ error: "Booking not found or already confirmed" });
  } catch (err) {
    console.error("confirmBookingByStaff error:", err);
    res.status(500).json({ error: "Failed to confirm booking" });
  }
}

//Delete booking if status is 'cancelled'
async function deleteCancelledBooking(req, res) {
  const { id: staffId, role } = req.user;
  const { bookingDate, bookingSeq, userId } = req.body;

  if (role !== "staff") {
    return res.status(403).json({ error: "Only staff can delete cancelled bookings" });
  }

  try {
    const clinicId = await clinicModel.getClinicIdByStaffId(staffId);
    const result = await clinicModel.deleteBookingIfCancelled(clinicId, bookingDate, bookingSeq, userId);

    if (result.success) res.json({ message: "Booking deleted" });
    else res.status(400).json({ error: `Deletion failed: ${result.reason}` });
  } catch (err) {
    console.error("deleteCancelledBooking error:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
}

async function cancelBooking(req, res) {
  const { id: staffId, role } = req.user;
  const { bookingDate, bookingSeq, userId } = req.body;

  if (role !== "staff") return res.status(403).json({ error: "Unauthorized" });

  try {
    const clinicId = await clinicModel.getClinicIdByStaffId(staffId);
    const result = await clinicModel.cancelBooking(clinicId, bookingDate, bookingSeq, userId);

    if (result) res.json({ message: "Booking cancelled" });
    else res.status(404).json({ error: "Booking not found" });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed" });
  }
}

//Get doctors and their available times for staff's clinic
async function getDoctorsForStaffClinic(req, res) {
  const { id: staffId, role } = req.user;

  if (role !== "staff") {
    return res.status(403).json({ error: "Only staff can view doctors" });
  }

  try {
    const clinicId = await clinicModel.getClinicIdByStaffId(staffId);
    const doctors = await clinicModel.getDoctorsByClinicId(clinicId);

    res.json(doctors);
  } catch (err) {
    console.error("getDoctorsForStaffClinic error:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
}

async function getClinicInfoForStaff(req, res) {
  const { id: staffId, role } = req.user;


  if (role !== "staff") {
    return res.status(403).json({ error: "Only staff can view clinic info" });
  }

  try {
    const clinicId = await clinicModel.getClinicIdByStaffId(staffId);

    if (!clinicId) return res.status(404).json({ error: "No clinic assigned" });

    const clinic = await clinicModel.getClinicDetailsById(clinicId);

    const doctors = await clinicModel.getDoctorsByClinicId(clinicId);
    res.json({ clinic, doctors });
  } catch (err) {
    console.error("getClinicInfoForStaff error:", err);
    res.status(500).json({ error: "Failed to fetch clinic info" });
  }
}

module.exports = {
  getBookingsForStaff,
  confirmBookingByStaff,
  deleteCancelledBooking,
  getDoctorsForStaffClinic,
  cancelBooking,
  getClinicInfoForStaff
};
