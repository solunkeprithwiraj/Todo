require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminTaskRoutes = require("./routes/adminTaskRoutes")

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", methods: ["POST", "GET", "PUT", "DELETE", "PATCH"] }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api", taskRoutes);
app.use("/api", adminTaskRoutes);


// Server listening
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.listen(port, () => console.log(`Server running on port ${port}`));
