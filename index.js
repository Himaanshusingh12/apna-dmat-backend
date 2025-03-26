const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const accountSettingRoutes = require('./routes/accountsettingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const subserviceRoutes = require('./routes/subserviceRoutes');
const servicedetailRoutes = require('./routes/servicedetailRoutes');
const termsconditionRoutes = require('./routes/termsconditionRoutes');
const privacypolicyRoutes = require('./routes/privacypolicyRoutes')
const blogRoutes = require('./routes/blogRoutes');
require('dotenv').config();

const app = express();

// Middleware (this is correct)
// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     maxAge: 3600,
// }));
// app.use(express.json());


// new one for mutliple vite urls 5173,5175 etc
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Allow localhost on any port during development
        if (origin.startsWith("http://localhost")) {
            return callback(null, true);
        }

        // Allow the frontend URL from the environment for production
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }

        // Reject other origins
        return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 3600,
}));

app.use(express.json());

//Serve static files from uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/testimonial', testimonialRoutes);
app.use('/api/account-settings', accountSettingRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/subservice', subserviceRoutes);
app.use('/api/service-detail', servicedetailRoutes);
app.use('/api/terms-condition', termsconditionRoutes);
app.use('/api/privacy-policy', privacypolicyRoutes);
app.use('/api/blog-category', blogRoutes);


// Test Route
app.get("/status", (req, res) => {
    res.status(200).json({ message: "Backend working" });
});

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
