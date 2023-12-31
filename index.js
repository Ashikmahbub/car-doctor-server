const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken');
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
function verifyJWT (req,res,next){
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader){
    return res.status(401).send({message : "unauthorizedaccess"})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    req.decoded = decoded;
    next();
  })
}

async function run() {
  const database = client.db("geniusCar");
  const serviceCollection = database.collection("services");
  const orderCollection = database.collection('orders');
  app.post('/jwt',(req,res)=>{
    const user = req.body;
    const token  = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET ,{expiresIn:'1h'})
    res.send({token});
    console.log(user);
  })

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
  app.get('/orders',verifyJWT,async(req,res) =>{
    const decoded= req.decoded;
    
    console.log('inside orders api',decoded);
    if (decoded.email !== req.query.email ){
      res.status(403).send({message:'unathorized access'});
    }
    
 
    let query = {};
    if(req.query.email){
      query ={
        email:req.query.email
      }

    }
    const cursor = orderCollection.find(query);
    const orders  = await cursor.toArray();
    res.send(orders);
  })
  // orders api 
  app.post('/orders',async(req,res)=>{
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.send(result);
  })

  app.delete('/orders/:id',async(req,res) =>{
    const id =req.params.id;
    const query = {_id:new ObjectId(id) }
    const result = await orderCollection.deleteOne(query);
    res.send(result);

  })
  app.patch('/order/:id',async(req,res) =>{
    const  id= req.params.id;
    const status = req.body.status;
    const query= {_id:new ObjectId(id)};
    const updatedDoc = {
      $set:{
        status:status
      }
    } 
    
    const  result = await orderCollection.updateOne(query,updatedDoc);
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
