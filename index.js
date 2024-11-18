const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { routes } = require("./src/routes");

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
// app.options(
//   "*",
//   cors({ origin: "http://localhost:5173", credentials: true, origin: true })
// );

app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send({
    message: "running",
  });
});

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
