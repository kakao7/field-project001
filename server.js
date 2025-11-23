// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve all files from project root
app.use(express.static(__dirname));

// Middleware for form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// JSON file paths
const userFile = path.join(__dirname, "user.json");
const feedbackFile = path.join(__dirname, "feedback.json");

// Safe JSON loader
function loadJSON(filepath) {
    try {
        if (!fs.existsSync(filepath)) return [];
        const raw = fs.readFileSync(filepath, "utf8").trim();
        if (!raw) return []; // empty file
        return JSON.parse(raw);
    } catch (err) {
        console.error("❌ Error loading JSON:", filepath, err);
        return [];
    }
}

// Safe JSON writer
function saveJSON(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("❌ Error saving JSON:", filepath, err);
    }
}

/* ===========================
   ROUTES
=========================== */

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// REGISTER
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.send("❌ All fields are required");
    }

    const users = loadJSON(userFile);

    if (users.find(u => u.username === username || u.email === email)) {
        return res.send("❌ User already exists");
    }

    users.push({ username, email, password });
    saveJSON(userFile, users);

    res.redirect("/login.html");
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.send("❌ All fields are required");

    const users = loadJSON(userFile);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return res.send("❌ Invalid email or password");

    res.redirect("/index.html");
});

// FEEDBACK
app.post("/feedback", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
        return res.send("❌ All fields are required");

    const feedbacks = loadJSON(feedbackFile);

    feedbacks.push({
        name,
        email,
        message,
        date: new Date().toISOString()
    });

    saveJSON(feedbackFile, feedbacks);

    res.send(`
        <h2 style="text-align:center; color:green;">✅ Feedback submitted successfully!</h2>
        <p style="text-align:center;"><a href="/index.html" style="color:#004aad;">Go back to Home</a></p>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
