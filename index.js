const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

// SSL Commerce
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j7sazjy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("cholo-BD").collection("users");
    const tripsCollection = client.db("cholo-BD").collection("trips");
    const tabsCollection = client.db("cholo-BD").collection("tabs");
    const reviewsCollection = client.db("cholo-BD").collection("reviews");
    const offersCollection = client.db("cholo-BD").collection("offers");
    const usersBookingCollection = client.db("cholo-BD").collection("booking");
    const bookedDataCollection = client.db("cholo-BD").collection("booked");
    const offerBookingCollection = client.db("cholo-BD").collection("offerBooked");
    const adminServicesCollection = client.db("cholo-BD").collection("admin-services");
    const bookingCollection = client.db("cholo-BD").collection("bookings");

    // Orders
    app.post("/bookings", async(req, res) => {
      const booking = req.body;
      const bookingProduct = await tripsCollection.findOne({_id: new ObjectId(booking.serviceID)}) 

      const data = {
        total_amount: 100,
        currency: 'BDT',
        tran_id: new ObjectId().toString(), // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: "",
        cus_email: "example@gmail.com",
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: booking.phone,
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.send({url: GatewayPageURL})
        // console.log('Redirecting to: ', apiResponse)
    });
    })

    // users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Get User  By Email
  app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/all-users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/trips", async (req, res) => {
      const query = {};
      const trips = await tripsCollection.find(query).toArray();
      res.send(trips);
    });

    app.get("/trips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const trip = await tripsCollection.findOne(query);
      res.send(trip);
    });

    // Trip Details Tabs
    app.get("/tabs", async (req, res) => {
      const query = {};
      const tabs = await tabsCollection.find(query).toArray();
      res.send(tabs);
    });

    // Trip Offers
    app.get("/offers", async (req, res) => {
      const query = {};
      const offers = await offersCollection.find(query).toArray();
      res.send(offers);
    });

    app.get("/offers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const trip = await offersCollection.findOne(query);
      res.send(trip);
    });

    // Reviews Collection
    app.get("/reviews", async (req, res) => {
      let query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    });

    // Booking Items
    app.get("/usersBooking", async (req, res) => {
      let query = {};
      const cursor = usersBookingCollection.find(query);
      const booking = await cursor.toArray();
      res.send(booking);
    });

    app.post("/usersBooking", async (req, res) => {
      const userBooking = req.body;
      const result = await usersBookingCollection.insertOne(userBooking);
      res.send(result);
    });

    // Offer Booking
    app.post("/offerBooking", async (req, res) => {
      const offerBooking = req.body;
      const result = await offerBookingCollection.insertOne(offerBooking);
      res.send(result);
    });

    // Recieve booking data
    app.get("/bookingData", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookingData = await usersBookingCollection.find(query).toArray();
      res.send(bookingData);
    });

    // Booked
    app.post("/booked", async (req, res) => {
      const data = req.body;
      const upload = await bookedDataCollection.insertOne(data);
      res.send(upload);
    });

    app.get("/booked", async (req, res) => {
      const query = {};
      const booked = await bookedDataCollection.find(query).toArray();
      res.send(booked);
    });

    // Admin upload Services
    app.get("/admin/services", async (req, res) => {
      let query = {};
      const cursor = adminServicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.post("/admin/services", async (req, res) => {
      const services = req.body;
      const result = await adminServicesCollection.insertOne(services);
      res.send(result);
    });

    // Delete services data from admin panel
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await adminServicesCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", async (req, res) => {
  res.send("Cholo BD server is running");
});

app.listen(port, () => console.log(`Cholo BD running ${port}`));
