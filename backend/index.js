require('dotenv').config()
const port =process.env.PORT;
const API = process.env.API;
const DB_MONGO = process.env.DB_MONGO;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//Database Connection with MongoDB
mongoose.connect(DB_MONGO
  
);

// API Creation
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image Store Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage: storage,
});

//Get and Upload images
app.use("/images", express.static("./upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `${API}${port}/images/${req.file.filename}`,
  });
});

//Create and aad product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});

  //If theres no product the id will be 1, if theres
  //products, the id will be the last id + 1
  let id;
  if (products.length > 0) {
    const lastElement = products[products.length - 1];
    id = lastElement.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  //Save on database
  await product.save();
  res.json({
    success: true,
    product_name: req.body.name,
  });
});

//Delete product
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Get All products
app.get("/getallproducts", async (req, res) => {
  let products = await Product.find();
  res.send(products);
});

//Schema for User model
const User = mongoose.model("User", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: { type: Object },
  date: {
    type: Date,
    default: Date.now(),
  },
});

//Create user
app.post("/signup", async (req, res) => {
  let check = await User.findOne({ email: req.body.email });

  if (check) {
    return res.status(400).json({
      success: false,
      error: "A user with this email already exists.",
    });
  }
  let cart = {};
  for (let index = 0; index < 300; index++) {
    cart[index] = 0;
  }
  const user = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();
  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({
    success: true,
    token: token,
  });
});

//User login
app.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (user) {
    const passCompare = req.body.password === user.password;

    if (passCompare) {
      const data = {
        id: user.id,
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({
        success: true,
        token: token,
      });
    } else {
      res.json({ success: false, error: "Wrong password" });
    }
  } else {
    res.json({ success: false, error: "A user with this email doesn't exist" });
  }
});

//New collection get
app.get("/newcollection", async (req, res) => {
  let products = await Product.find();
  let newCollection = products.slice(1).slice(-8);
  console.log("Newcol fetched");
  res.send(newCollection);
});

//Popular in women get
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popularinwomen = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popularinwomen);
});

//Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data;
      console.log("data",data);
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using valid token" });
    }
  }
};

//ADd to cart POST
app.post("/addtocart", fetchUser, async (req, res) => {
  let userData = await User.findOne({ _id: req.user.id });

  userData.cartData[req.body.itemId] += 1;
  await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      cartData: userData.cartData,
    }
  );
  res.send("Product added to Cart");
});

//Remove from cart POST
app.post("/removefromcart", fetchUser, async (req, res) => {
  let userData = await User.findOne({ _id: req.user.id });
  if( userData.cartData[req.body.itemId]>0)
  userData.cartData[req.body.itemId] -= 1;
  await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      cartData: userData.cartData,
    }
  );
  res.send("Product removed from Cart");
});

//getCart data
app.post("/getcart", fetchUser, async (req, res) => {

  let userData =await User.findOne({_id:req.user.id});
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  !error
    ? console.log("Server running on Port " + port)
    : console.log("Error: " + error);
});
