const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ae7d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'))
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("computerServices").collection("orders");
  const adminCollection = client.db("computerServices").collection("admin");
  const reviewCollection = client.db("computerServices").collection("review");
  const serviceCollection = client.db("computerServices").collection("service");
  // perform actions on the collection object
  //   client.close();


  app.post('/addAdmin', (req, res) => {
    // const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }

    serviceCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  //post-method for user data
  app.post('/placeService', (req, res) => {
    const file = req.files.file;
    const image = req.body.image;
    const status = req.body.status;
    const name = req.body.name;
    const email = req.body.email;
    const price = req.body.price;
    const service = req.body.service;
    const description = req.body.description;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var img = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }

    collection.insertOne({ name, email, price, service, description, image, img, status })
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })

  //post for review
  app.post('/review', (req, res) => {
    const name = req.body.name;
    const newFile = req.body.newFile;
    const description = req.body.description;
    const designation = req.body.designation;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var img = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    reviewCollection.insertOne({ name, description, designation, img, newFile })
      .then(result => {
        console.log(result);
        res.send(result)
      })
  })


  //post for admin
  app.post('/setAdmin', (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    adminCollection.insertOne({ email, pass })
      .then(result => {
        console.log(result);
        res.send(result)
      })
  })


  //get for review
  app.get('/seeReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/seeService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/seeParticularService', (req, res) => {
    const newUser = req.query.email;
    collection.find({ email: newUser })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.get('/seeAllService', (req, res) => {
    collection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/admin', (req, res) => {
    const email = req.query.email;

    adminCollection.find({ email })
      .toArray((err, collection) => {
        res.send(collection.length > 0)
      })

  })



  app.patch("/updateSurviceById/:id", (req, res) => {

    collection.updateOne({ _id: ObjectID(req.params.id) }, {
      $set: { status: req.body.status }
    })
      .then(result => {

        res.send(result.modifiedCount > 0)
      })


  })

  
});

app.get('/', (req, res) => {
  res.send('from mongodb its work')
})

app.listen(process.env.PORT || port)