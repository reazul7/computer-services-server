const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
// const stripe = require("stripe")("pk_test_51IhsRTDIrlQ0GMJ6Blyc2Y5WNa1tGNERjnT5IoPpXd9NagrXrnh9WSBABWYUE5NLWHCszPtL5O2nPYUfNj3tK9oK00vJItvxfW");
const stripe = require("stripe")("sk_test_51IhsRTDIrlQ0GMJ6jlrqHDjK658wUvv2mEUdGXStxqGHkb5DyCvoigAg32OXc2uqn3FqouZndAR9ZtKoBC6JoLZ600Kr2prEkz");

require("dotenv").config();

// "https://warm-springs-45915.herokuapp.com/"

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ae7d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("services"));
app.use(fileUpload());

const port = 5000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db("computerServices").collection("orders");
  const serviceCollection = client.db("computerServices").collection("service");
  const reviewCollection = client.db("computerServices").collection("review");
  const adminCollection = client.db("computerServices").collection("admin");
  console.log("db connection success");

  //post method for admin data;

  app.post("/addAdmin", (req, res) => {
    // const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const newImg = req.files.file.data;
    const encImg = newImg.toString("base64");
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ title, description, image, price })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  //post method for user data;

  app.post("/placeService", (req, res) => {
    const status = req.body.status;
    const name = req.body.name;
    const image = req.body.image;
    const email = req.body.email;
    const price = req.body.price;
    const service = req.body.service;
    const description = req.body.description;

    collection
      .insertOne({
        name,
        email,
        image,
        price,
        service,
        description,
        status,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      })
      .catch(err => {
        console.log(err);
      })
  });

  //post method for review;
  app.post("/review", (req, res) => {
    const name = req.body.name;
    const newFile = req.body.newFile;
    const description = req.body.description;
    const designation = req.body.designation;
    // const newImg = req.files.file.data;
    // const encImg = newImg.toString("base64");
    // var img = {
    //   contentType: req.files.file.mimetype,
    //   size: req.files.file.size,
    //   img: Buffer.from(encImg, "base64"),
    // };
    reviewCollection
      .insertOne({ name, description, designation, img, newFile })
      .then((result) => {
        console.log(result);
        res.send(result);
      });
  });


  //post method for set admin;
  app.post("/setAdmin", (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    adminCollection.insertOne({ email, pass }).then((result) => {
      console.log(result);
      res.send(result);
    }).then(err => {
      console.log(err);
    })
  });

  //get method for review
  app.get("/seeReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/seeService", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/seeParticularService", (req, res) => {
    const newUser = req.query.email;
    collection.find({ email: newUser }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/seeAllService", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/admin", (req, res) => {
    const email = req.query.email;
    adminCollection.find({ email }).toArray((err, collection) => {
      res.send(collection.length > 0);
    });
  });


  // delete service
  app.delete("/deleteService/:id", (req, res) => {
    serviceCollection.deleteOne({_id: ObjectID(req.params.id)})
    .then((result) =>{
      res.send(result.deletedCount > 0);
    })
    .catch((err) => {
      console.log(err);
    })
  })


  //patch method;
  app.patch("/updateSurviceById/:id", (req, res) => {
    collection
      .updateOne(
        { _id: ObjectID(req.params.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      })
      .catch((err) => {
        console.log(err);
      })
  });

  const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };

  app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
  // console.log("Listening port 5000");
});
