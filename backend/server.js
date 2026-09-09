const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./database");

const app = express();
const PORT = 5000;

const JWT_SECRET = "eventhub_secret_key_2026";


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());


// ======================================================
// BASIC ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.json({
        message: "EventHub API is running successfully 🚀"
    });
});


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        next();
    });
}


// ======================================================
// ADMIN MIDDLEWARE
// ======================================================

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required."
        });
    }

    next();
}


// ======================================================
// USER SIGNUP
// ======================================================

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(cleanEmail);

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = db
            .prepare(`
                INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, 'user')
            `)
            .run(
                cleanName,
                cleanEmail,
                hashedPassword
            );

        res.status(201).json({
            message: "Account created successfully.",
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Server error during signup."
        });
    }
});


// ======================================================
// USER LOGIN
// ======================================================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const user = db
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(cleanEmail);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login."
        });
    }
});


// ======================================================
// ADMIN LOGIN
// ======================================================

app.post("/api/auth/admin-login", (req, res) => {
    const { email, password } = req.body;

    const adminEmail = "admin@eventhub.com";
    const adminPassword = "admin123";

    if (
        email?.trim().toLowerCase() !== adminEmail ||
        password !== adminPassword
    ) {
        return res.status(401).json({
            message: "Invalid admin email or password."
        });
    }

    const token = jwt.sign(
        {
            id: 0,
            name: "EventHub Admin",
            email: adminEmail,
            role: "admin"
        },
        JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );

    res.json({
        message: "Admin login successful.",
        token,
        user: {
            id: 0,
            name: "EventHub Admin",
            email: adminEmail,
            role: "admin"
        }
    });
});


// ======================================================
// GET ALL EVENTS
// ======================================================

app.get("/api/events", (req, res) => {
    try {
        const events = db
            .prepare(`
                SELECT *
                FROM events
                ORDER BY date ASC, time ASC
            `)
            .all();

        res.json(events);

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            message: "Unable to load events."
        });
    }
});


// ======================================================
// GET SINGLE EVENT
// ======================================================

app.get("/api/events/:id", (req, res) => {
    try {
        const event = db
            .prepare("SELECT * FROM events WHERE id = ?")
            .get(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found."
            });
        }

        res.json(event);

    } catch (error) {
        console.error("Get event error:", error);

        res.status(500).json({
            message: "Unable to load event."
        });
    }
});


// ======================================================
// CREATE EVENT - ADMIN
// ======================================================

app.post(
    "/api/events",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        try {
            const {
                title,
                description,
                date,
                time,
                location,
                image
            } = req.body;

            if (
                !title ||
                !description ||
                !date ||
                !time ||
                !location
            ) {
                return res.status(400).json({
                    message:
                        "Title, description, date, time and location are required."
                });
            }

            const result = db
                .prepare(`
                    INSERT INTO events
                    (title, description, date, time, location, image)
                    VALUES (?, ?, ?, ?, ?, ?)
                `)
                .run(
                    title.trim(),
                    description.trim(),
                    date,
                    time,
                    location.trim(),
                    image?.trim() || ""
                );

            const newEvent = db
                .prepare("SELECT * FROM events WHERE id = ?")
                .get(result.lastInsertRowid);

            res.status(201).json({
                message: "Event created successfully.",
                event: newEvent
            });

        } catch (error) {
            console.error("Create event error:", error);

            res.status(500).json({
                message: "Unable to create event."
            });
        }
    }
);


// ======================================================
// UPDATE EVENT - ADMIN
// ======================================================

app.put(
    "/api/events/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        try {
            const {
                title,
                description,
                date,
                time,
                location,
                image
            } = req.body;

            if (
                !title ||
                !description ||
                !date ||
                !time ||
                !location
            ) {
                return res.status(400).json({
                    message:
                        "Title, description, date, time and location are required."
                });
            }

            const existingEvent = db
                .prepare("SELECT id FROM events WHERE id = ?")
                .get(req.params.id);

            if (!existingEvent) {
                return res.status(404).json({
                    message: "Event not found."
                });
            }

            db.prepare(`
                UPDATE events
                SET
                    title = ?,
                    description = ?,
                    date = ?,
                    time = ?,
                    location = ?,
                    image = ?
                WHERE id = ?
            `).run(
                title.trim(),
                description.trim(),
                date,
                time,
                location.trim(),
                image?.trim() || "",
                req.params.id
            );

            const updatedEvent = db
                .prepare("SELECT * FROM events WHERE id = ?")
                .get(req.params.id);

            res.json({
                message: "Event updated successfully.",
                event: updatedEvent
            });

        } catch (error) {
            console.error("Update event error:", error);

            res.status(500).json({
                message: "Unable to update event."
            });
        }
    }
);


// ======================================================
// DELETE EVENT - ADMIN
// ======================================================

app.delete(
    "/api/events/:id",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        try {
            const result = db
                .prepare("DELETE FROM events WHERE id = ?")
                .run(req.params.id);

            if (result.changes === 0) {
                return res.status(404).json({
                    message: "Event not found."
                });
            }

            res.json({
                message: "Event deleted successfully."
            });

        } catch (error) {
            console.error("Delete event error:", error);

            res.status(500).json({
                message: "Unable to delete event."
            });
        }
    }
);


// ======================================================
// REGISTER FOR EVENT
// ======================================================

app.post(
    "/api/registrations",
    authenticateToken,
    (req, res) => {
        try {
            if (req.user.role !== "user") {
                return res.status(403).json({
                    message: "Only users can register for events."
                });
            }

            const { eventId } = req.body;

            if (!eventId) {
                return res.status(400).json({
                    message: "Event ID is required."
                });
            }

            const event = db
                .prepare("SELECT id FROM events WHERE id = ?")
                .get(eventId);

            if (!event) {
                return res.status(404).json({
                    message: "Event not found."
                });
            }

            const existingRegistration = db
                .prepare(`
                    SELECT id
                    FROM registrations
                    WHERE user_id = ? AND event_id = ?
                `)
                .get(req.user.id, eventId);

            if (existingRegistration) {
                return res.status(409).json({
                    message: "You are already registered for this event."
                });
            }

            db.prepare(`
                INSERT INTO registrations
                (user_id, event_id)
                VALUES (?, ?)
            `).run(
                req.user.id,
                eventId
            );

            res.status(201).json({
                message: "Successfully registered for the event."
            });

        } catch (error) {
            console.error("Registration error:", error);

            res.status(500).json({
                message: "Unable to register for event."
            });
        }
    }
);


// ======================================================
// MY REGISTRATIONS
// ======================================================

app.get(
    "/api/registrations/my",
    authenticateToken,
    (req, res) => {
        try {
            if (req.user.role !== "user") {
                return res.status(403).json({
                    message: "Only users can view their registrations."
                });
            }

            const registrations = db
                .prepare(`
                    SELECT
                        registrations.id AS registration_id,
                        registrations.registered_at,
                        events.id AS event_id,
                        events.title,
                        events.description,
                        events.date,
                        events.time,
                        events.location,
                        events.image
                    FROM registrations
                    INNER JOIN events
                        ON registrations.event_id = events.id
                    WHERE registrations.user_id = ?
                    ORDER BY events.date ASC, events.time ASC
                `)
                .all(req.user.id);

            res.json(registrations);

        } catch (error) {
            console.error("My registrations error:", error);

            res.status(500).json({
                message: "Unable to load registrations."
            });
        }
    }
);


// ======================================================
// ADMIN - ALL REGISTRATIONS
// ======================================================

app.get(
    "/api/admin/registrations",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        try {
            const registrations = db
                .prepare(`
                    SELECT
                        registrations.id AS registration_id,
                        registrations.registered_at,

                        users.id AS user_id,
                        users.name AS user_name,
                        users.email AS user_email,

                        events.id AS event_id,
                        events.title AS event_title,
                        events.date AS event_date,
                        events.time AS event_time,
                        events.location AS event_location

                    FROM registrations

                    INNER JOIN users
                        ON registrations.user_id = users.id

                    INNER JOIN events
                        ON registrations.event_id = events.id

                    ORDER BY registrations.registered_at DESC
                `)
                .all();

            res.json(registrations);

        } catch (error) {
            console.error("Admin registrations error:", error);

            res.status(500).json({
                message: "Unable to load registrations."
            });
        }
    }
);


// ======================================================
// ADMIN DASHBOARD STATS
// ======================================================

app.get(
    "/api/admin/stats",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        try {
            const totalEvents = db
                .prepare("SELECT COUNT(*) AS count FROM events")
                .get().count;

            const totalUsers = db
                .prepare(`
                    SELECT COUNT(*) AS count
                    FROM users
                    WHERE role = 'user'
                `)
                .get().count;

            const totalRegistrations = db
                .prepare("SELECT COUNT(*) AS count FROM registrations")
                .get().count;

            res.json({
                totalEvents,
                totalUsers,
                totalRegistrations
            });

        } catch (error) {
            console.error("Admin stats error:", error);

            res.status(500).json({
                message: "Unable to load dashboard statistics."
            });
        }
    }
);


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
    console.log(
        `EventHub server running at http://localhost:${PORT}`
    );
});
