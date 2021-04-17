const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ae7d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());

const port = 5000;

app.get('/', (req, res) => {
    res.send('from mongodb its work')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("computerServices").collection("orders");
  const adminCollection = client.db("computerServices").collection("admin");
  const reviewCollection = client.db("computerServices").collection("review");
  const serviceCollection = client.db("computerServices").collection("service");
  // perform actions on the collection object
//   client.close();
});

app.listen(process.env.PORT || port)