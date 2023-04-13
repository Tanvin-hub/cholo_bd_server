const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

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
    const tripsCollection = client.db("cholo-BD").collection("trips");
    const tabsCollection = client.db("cholo-BD").collection("tabs");
    const reviewsCollection = client.db("explore-bd").collection("reviews");

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
    
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", async (req, res) => {
  res.send("Cholo BD server is running");
});

app.listen(port, () => console.log(`Cholo BD running ${port}`));
