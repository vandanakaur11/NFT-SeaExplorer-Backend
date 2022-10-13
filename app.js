const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const app = express();

app.use(
  session({
    secret: "secretfornftseaexplorer",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 604800000 }, // cookie expire after 7 days
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Setup Cors
const corsOption = {
  origin: ["https://nft-sea-explorer.vercel.app", "http://localhost:3000"],
  methods: "GET,POST,PUT,PATCH,DELETE",
};

app.use(cors(corsOption));

// Connect to database
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get("/", (req, res) => {
  res.status(200).send("Hello From Express App...");
});

// Routes
app.use("/api/v1/roles", require("./routes/roleRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));

module.exports = app;
