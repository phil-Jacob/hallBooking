const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Sample data
let rooms = [
  {
      roomId: "101",
      seatsAvailable: 25,
      amenities: ["tv", "ac", "WIFI"],
      pricePerHour: 150
  },
  {
      roomId: "102",
      seatsAvailable: 30,
      amenities: ["projector", "whiteboard", "WIFI"],
      pricePerHour: 200
  },
  {
      roomId: "103",
      seatsAvailable: 20,
      amenities: ["ac", "WIFI"],
      pricePerHour: 120
  }
];

let bookings = [
  {
      customer: "chandler",
      bookingDate: "18/04/2024",
      startTime: "11:00am",
      endTime: "11:00pm",
      bookingID: "mxv1674",
      roomId: "103",
      status: "booked",
      booked_On: "30/3/2024"
  },
  {
      customer: "Joey",
      bookingDate: "20/04/2024",
      startTime: "2:00pm",
      endTime: "4:00pm",
      bookingID: "abc123",
      roomId: "101",
      status: "booked",
      booked_On: "01/4/2024"
  },
  {
      customer: "Ross",
      bookingDate: "22/04/2024",
      startTime: "9:00am",
      endTime: "12:00pm",
      bookingID: "xyz789",
      roomId: "102",
      status: "booked",
      booked_On: "05/4/2024"
  }
];

let customers = [
  {
      name: 'chandler',
      bookings: [
          {
              customer: 'chandler',
              bookingDate: '18/04/2024',
              startTime: '11:00am',
              endTime: '11:00pm',
              bookingID: 'mxv1674',
              roomId: "103",
              status: 'booked',
              booked_On: '30/3/2024'
          }
      ]
  },
  {
      name: 'Joey',
      bookings: [
          {
              customer: 'Joey',
              bookingDate: '20/04/2024',
              startTime: '2:00pm',
              endTime: '4:00pm',
              bookingID: 'abc123',
              roomId: "101",
              status: 'booked',
              booked_On: '01/4/2024'
          }
      ]
  },
  {
      name: 'Ross',
      bookings: [
          {
              customer: 'Ross',
              bookingDate: '22/04/2024',
              startTime: '9:00am',
              endTime: '12:00pm',
              bookingID: 'xyz789',
              roomId: "102",
              status: 'booked',
              booked_On: '05/4/2024'
          }
      ]
  }
];




// Get all rooms
app.get('/rooms/all', (req, res) => {
    res.status(200).json({ RoomsList: rooms });
});

// Create a new room
app.post('/rooms/create', (req, res) => {
    try {
        const room = req.body;
        const idExists = rooms.find(el => el.roomId === room.roomId);

        if (idExists) {
            return res.status(400).json({ message: "Room already exists." });
        }

        rooms.push(room);
        res.status(201).json({ message: "Room created" });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Create a new booking for a specific room
app.post("/booking/create/:id", (req, res) => {
    try {
        const { id } = req.params;
        const bookRoom = req.body;
        const idExists = rooms.find(el => el.roomId === id);

        if (!idExists) {
            return res.status(400).json({ message: "Room does not exist.", RoomsList: rooms });
        }

        // Get existing bookings for the room
        const matchID = bookings.filter(b => b.roomId === id);

        if (matchID.length > 0) {
            // Check if the room is booked for the given date
            const dateCheck = matchID.some(m => m.bookingDate === bookRoom.bookingDate);

            if (!dateCheck) {
                
                const newID = "B" + (bookings.length + 1);

                const newBooking = { ...bookRoom, bookingID: newID, roomId: id, status: "booked", booked_On: new Date().toLocaleDateString() };

                bookings.push(newBooking);


                const customerDetails = customers.find(cust => cust.name === newBooking.customer);

                if (customerDetails) {
                    customerDetails.bookings.push(newBooking);
                } else {
                    customers.push({ name: newBooking.customer, bookings: [newBooking] });
                }

                return res.status(201).json({ message: "Hall booked", Bookings: bookings, added: newBooking });
            } else {
                return res.status(400).json({ message: "Hall already booked for this date, choose another hall", Bookings: bookings });
            }
        } else {

            const newID = "B" + (bookings.length + 1);

            const newBooking = { ...bookRoom, bookingID: newID, roomId: id, status: "booked", booked_On: new Date().toLocaleDateString() };

            bookings.push(newBooking);

            const customerDetails = customers.find(cust => cust.name === newBooking.customer);

            if (customerDetails) {
                customerDetails.bookings.push(newBooking);
            } else {
                customers.push({ name: newBooking.customer, bookings: [newBooking] });
            }

            return res.status(201).json({ message: "Hall booked", Bookings: bookings, added: newBooking });
        }
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get all booked rooms
app.get('/viewbooking', (req, res) => {
    const bookedRooms = bookings.map(booking => {
        const { roomId, status, customer, bookingDate, startTime, endTime } = booking;
        return { roomId, status, customer, bookingDate, startTime, endTime };
    });
    res.status(201).json(bookedRooms);
});

// Get all customers with their bookings
app.get('/customers', (req, res) => {
    const customerBookings = customers.map(customer => {
        const { name, bookings } = customer;
        const customerDetails = bookings.map(booking => {
            const { roomId, bookingDate, startTime, endTime } = booking;
            return { name, roomId, bookingDate, startTime, endTime };
        });

        return customerDetails;
    });

    res.json(customerBookings);
});

// Get bookings for a specific customer
app.get('/customer/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(cust => cust.name === name);

    if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
    }

    const customerBookings = customer.bookings.map(booking => {
        const { customer, roomId, startTime, endTime, bookingID, status, bookingDate, booked_On } = booking;
        return { customer, roomId, startTime, endTime, bookingID, status, bookingDate, booked_On };
    });

    res.json(customerBookings);
});

app.listen(3000, ()=> console.log("started server hallbooking"));
