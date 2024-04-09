require('dotenv').config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const connectionToMongo = require("./utilis/db.js");
const router = require("./router/route.js");

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by"); //less hacker know about your stack

app.get("/", (req, res) => {
  res.status(200).json("welcome");
});

app.use("/api/auth", router);

connectionToMongo().then(() => {
  try {
    const myServer = http.createServer(app);
    myServer.listen(port, () => {
      console.log(`server connected at ${port}`);
    });
  } catch (error) {
    console.error("cannot connect to mongodb");
  }
});
