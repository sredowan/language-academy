const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const Batch = require('../models/Batch');
const { injectBranchFilter } = require('../middleware/branch.middleware');

exports.getRooms = async (req, res) => {
  try {
    const queryOptions = injectBranchFilter(req, {});
    const rooms = await Room.findAll(queryOptions);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, floor, capacity, facilities } = req.body;
    const room = await Room.create({
      branch_id: req.branchId,
      name,
      floor,
      capacity,
      facilities,
      status: 'free'
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { date, room_id } = req.query;
    const where = { branch_id: req.branchId };
    if (date) where.date = date;
    if (room_id) where.room_id = room_id;

    const bookings = await RoomBooking.findAll({
      where,
      include: [Room, Batch]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bookRoom = async (req, res) => {
  try {
    const { room_id, batch_id, date, start_time, end_time } = req.body;

    // Basic conflict check
    const conflict = await RoomBooking.findOne({
      where: {
        room_id,
        date,
        [require('sequelize').Op.or]: [
          {
            start_time: { [require('sequelize').Op.between]: [start_time, end_time] }
          },
          {
            end_time: { [require('sequelize').Op.between]: [start_time, end_time] }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ error: 'Room is already booked for this time slot.' });
    }

    const booking = await RoomBooking.create({
      branch_id: req.branchId,
      room_id,
      batch_id,
      date,
      start_time,
      end_time
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await RoomBooking.findOne({
      where: { id, branch_id: req.branchId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.destroy();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
