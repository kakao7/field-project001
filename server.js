// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve all static files (HTML, CSS, JS, images) from project root
app.use(express.static(__dirname));

// JSON file paths
const userFile = path.join(__dirname, "user.json");
const feedbackFile = path.join(__dirname, "feedback.json");

// Load users
let users = [];
if (fs.existsSync(userFile)) {
    users = JSON.parse(fs.readFileSync(userFile, "utf-8"));
}

// Load feedbacks
let feedbacks = [];
if (fs.existsSync(feedbackFile)) {
    feedbacks = JSON.parse(fs.readFileSync(feedbackFile, "utf-8"));
}

/* ===========================
   ROUTES
=========================== */

// Home route (optional)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// REGISTER
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.send("❌ All fields are required");
    }

    if (users.find(u => u.username === username || u.email === email)) {
        return res.send("❌ User already exists");
    }

    users.push({ username, email, password });
    fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
    res.redirect("/login.html");
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.send("❌ All fields are required");

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.send("❌ Invalid email or password");

    // For simplicity, no sessions implemented yet
    res.redirect("/index.html");
});

// FEEDBACK
app.post("/feedback", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) return res.send("❌ All fields are required");

    feedbacks.push({
        name,
        email,
        message,
        date: new Date().toISOString()
    });
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));

    res.send(`
        <h2 style="text-align:center; color:green;">✅ Feedback submitted successfully!</h2>
        <p style="text-align:center;"><a href="index.html" style="color:#004aad;">Go back to Home</a></p>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
