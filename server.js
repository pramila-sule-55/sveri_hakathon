const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Session Middleware
app.use(
    session({
        secret: "yourSecretKey",
        resave: false,
        saveUninitialized: true,
    })
);

// ✅ Set EJS as the templating engine
app.set("view engine", "ejs");

// ✅ Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Use authentication routes
app.use(authRoutes);


// ✅ Serve Public Home Page
app.get("/", (req, res) => {
    res.render("home", { user: req.session.user || null });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
