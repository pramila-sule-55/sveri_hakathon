const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

// ✅ Show Login Form
router.get("/login", (req, res) => {
    res.render("login", { message: null });
});

// ✅ Handle Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { message: "❌ You need to create an account first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { message: "❌ Invalid email or password." });
        }

        // ✅ Store user session and redirect to dashboard
        req.session.user = { id: user._id, username: user.username, email: user.email };
        res.redirect("/dashboard");
    } catch (error) {
        res.status(500).send("❌ Server Error: " + error.message);
    }
});

// ✅ Show Register Form
router.get("/register", (req, res) => {
    res.render("register", { message: null });
});

// ✅ Handle Registration
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register", { message: "❌ Email already registered!" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create New User
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        req.session.user = { id: newUser._id, username: newUser.username, email: newUser.email };

        res.redirect("/dashboard");
    } catch (error) {
        res.status(500).send("❌ Server Error: " + error.message);
    }
});

// ✅ Show Dashboard
router.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/auth/login");
    }
    res.render("dashboard", { user: req.session.user });
});

// ✅ Logout Route
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
