const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1fhcqrs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const database = client.db("geniusCar");
  const serviceCollection = database.collection("services");
  const orderCollection = database.collection('orders');

  app.get("/services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  });

  app.get("/services/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
  });
  // orders api 
  app.post('/orders',async(req,res)=>{
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.send(result);
  })

}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("genius car server is running");
});

app.listen(port, () => {
  console.log(`Genius car server running ${port}`);
});
