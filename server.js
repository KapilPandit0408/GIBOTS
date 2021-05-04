const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { json } = require("body-parser");
require("dotenv").config();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(json())
app.use(cors());

const url = process.env.MONGO_URL || "mongodb://localhost:27017/Auth";

mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDB connection established");
  }
);

app.use("/", require("./Router/userRouter"));

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server started at port  : ${port}`);
});