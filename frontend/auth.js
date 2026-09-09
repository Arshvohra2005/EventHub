const API_URL = "http://localhost:5000/api";


// ======================================================
// PASSWORD TOGGLE
// ======================================================

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    if (!input) return;


    if (input.type === "password") {

        input.type = "text";

        button.textContent = "Hide";

    } else {

        input.type = "password";

        button.textContent = "Show";

    }

}


// ======================================================
// SAVE LOGIN SESSION
// ======================================================

function saveSession(data) {

    localStorage.setItem(
        "eventhubToken",
        data.token
    );

    localStorage.setItem(
        "currentUser",
        JSON.stringify(data.user)
    );

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem("eventhubToken");
    localStorage.removeItem("currentUser");

    window.location.href = "index.html";

}


function adminLogout() {

    localStorage.removeItem("eventhubToken");
    localStorage.removeItem("currentUser");

    window.location.href = "admin-login.html";

}


// ======================================================
// USER SIGNUP
// ======================================================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("signupName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("signupPassword")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;

            const message =
                document.getElementById("signupMessage");


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.style.color =
                    "#dc2626";

                return;
            }


            if (password.length < 6) {

                message.textContent =
                    "Password must be at least 6 characters.";

                message.style.color =
                    "#dc2626";

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/signup`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Signup failed.";

                    message.style.color =
                        "#dc2626";

                    return;
                }


               message.textContent =
    "Account created successfully!";

message.style.color =
    "#16a34a";

signupForm.reset();

window.location.href = "login.html";


            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}


// ======================================================
// USER LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const message =
                document.getElementById("loginMessage");


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Login failed.";

                    message.style.color =
                        "#dc2626";

                    return;
                }


                saveSession(data);


                message.textContent =
                    "Login successful! Redirecting...";

                message.style.color =
                    "#16a34a";


                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                const redirect =
                    params.get("redirect");


                setTimeout(() => {

                    if (data.user.role === "admin") {

                        window.location.href =
                            "admin.html";

                    } else if (redirect) {

                        window.location.href =
                            redirect;

                    } else {

                        window.location.href =
                            "index.html";

                    }

                }, 500);


            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}


// ======================================================
// ADMIN LOGIN
// ======================================================

const adminLoginForm =
    document.getElementById("adminLoginForm");


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("adminEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("adminPassword")
                    .value;

            const message =
                document.getElementById("adminMessage");


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/admin-login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Admin login failed.";

                    message.style.color =
                        "#dc2626";

                    return;
                }


                saveSession(data);


                message.textContent =
                    "Admin login successful!";

                message.style.color =
                    "#16a34a";


                setTimeout(() => {

                    window.location.href =
                        "admin.html";

                }, 500);


            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}


// ======================================================
// ADMIN PAGE PROTECTION
// ======================================================

if (
    window.location.pathname.endsWith("admin.html")
) {

    const token =
        localStorage.getItem("eventhubToken");

    const userString =
        localStorage.getItem("currentUser");


    if (!token || !userString) {

        window.location.href =
            "admin-login.html";

    } else {

        try {

            const user =
                JSON.parse(userString);


            if (user.role !== "admin") {

                localStorage.removeItem(
                    "eventhubToken"
                );

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "admin-login.html";

            } else {

                loadAdminStats();

            }

        } catch (error) {

            adminLogout();

        }

    }

}


// ======================================================
// AUTH HEADERS
// ======================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("eventhubToken");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

}


// ======================================================
// ADMIN STATS
// ======================================================

async function loadAdminStats() {

    try {

        const response =
            await fetch(
                `${API_URL}/admin/stats`,
                {
                    headers: getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load statistics."
            );

        }


        const totalEvents =
            document.getElementById("totalEvents");

        const totalUsers =
            document.getElementById("totalUsers");

        const totalRegistrations =
            document.getElementById(
                "totalRegistrations"
            );


        if (totalEvents) {
            totalEvents.textContent =
                data.totalEvents;
        }

        if (totalUsers) {
            totalUsers.textContent =
                data.totalUsers;
        }

        if (totalRegistrations) {
            totalRegistrations.textContent =
                data.totalRegistrations;
        }


    } catch (error) {

        console.error(
            "Stats error:",
            error
        );

    }

}


// ======================================================
// CREATE EVENT FORM
// ======================================================

function showCreateEventForm() {

    const content =
        document.getElementById("adminContent");


    if (!content) return;


    content.innerHTML = `

        <h2>Create New Event</h2>

        <form id="createEventForm">

            <div class="form-group">

                <label>Event Title</label>

                <input
                    type="text"
                    id="eventTitle"
                    placeholder="Enter event title"
                    required
                >

            </div>


            <div class="form-group">

                <label>Description</label>

                <textarea
                    id="eventDescription"
                    placeholder="Describe the event"
                    required
                ></textarea>

            </div>


            <div class="form-group">

                <label>Date</label>

                <input
                    type="date"
                    id="eventDate"
                    required
                >

            </div>


            <div class="form-group">

                <label>Time</label>

                <input
                    type="time"
                    id="eventTime"
                    required
                >

            </div>


            <div class="form-group">

                <label>Location</label>

                <input
                    type="text"
                    id="eventLocation"
                    placeholder="Event location"
                    required
                >

            </div>


            <div class="form-group">

                <label>Image URL</label>

                <input
                    type="url"
                    id="eventImage"
                    placeholder="https://example.com/image.jpg"
                >

            </div>


            <button
                type="submit"
                class="primary-btn"
            >
                Create Event
            </button>

            <button
                type="button"
                class="secondary-btn"
                onclick="manageEvents()"
            >
                Cancel
            </button>


            <div
                id="eventFormMessage"
                class="form-message"
            ></div>

        </form>

    `;


    const form =
        document.getElementById(
            "createEventForm"
        );


    form.addEventListener(
        "submit",
        createEvent
    );

}


// ======================================================
// CREATE EVENT
// ======================================================

async function createEvent(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "eventFormMessage"
        );


    const eventData = {

        title:
            document
                .getElementById("eventTitle")
                .value
                .trim(),

        description:
            document
                .getElementById("eventDescription")
                .value
                .trim(),

        date:
            document
                .getElementById("eventDate")
                .value,

        time:
            document
                .getElementById("eventTime")
                .value,

        location:
            document
                .getElementById("eventLocation")
                .value
                .trim(),

        image:
            document
                .getElementById("eventImage")
                .value
                .trim()

    };


    try {

        const response =
            await fetch(
                `${API_URL}/events`,
                {

                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(eventData)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Unable to create event.";

            message.style.color =
                "#dc2626";

            return;
        }


        message.textContent =
            "Event created successfully!";

        message.style.color =
            "#16a34a";


        event.target.reset();

        loadAdminStats();


    } catch (error) {

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "#dc2626";

    }

}


// ======================================================
// MANAGE EVENTS
// ======================================================

async function manageEvents() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML = `
        <h2>Manage Events</h2>
        <div class="loading">
            Loading events...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/events`
            );


        const events =
            await response.json();


        if (!response.ok) {

            throw new Error(
                events.message ||
                "Unable to load events."
            );

        }


        if (events.length === 0) {

            content.innerHTML = `

                <h2>Manage Events</h2>

                <div class="message-box">

                    <p>
                        No events created yet.
                    </p>

                    <br>

                    <button
                        class="primary-btn"
                        onclick="showCreateEventForm()"
                    >
                        Create First Event
                    </button>

                </div>

            `;

            return;
        }


        content.innerHTML = `

            <h2>Manage Events</h2>

            <div id="adminEventsList"></div>

        `;


        const list =
            document.getElementById(
                "adminEventsList"
            );


        list.innerHTML =
            events.map(event => `

                <div class="admin-event">

                    <div class="admin-event-info">

                        <h3>
                            ${escapeHTML(event.title)}
                        </h3>

                        <p>
                            📅 ${escapeHTML(event.date)}
                            &nbsp; | &nbsp;
                            🕐 ${escapeHTML(event.time)}
                            &nbsp; | &nbsp;
                            📍 ${escapeHTML(event.location)}
                        </p>

                    </div>


                    <div class="admin-event-buttons">

                        <button
                            class="edit-btn"
                            onclick="editEvent(${event.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteEvent(${event.id})"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        content.innerHTML = `
            <div class="message-box">
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


// ======================================================
// EDIT EVENT
// ======================================================

async function editEvent(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`
            );


        const event =
            await response.json();


        if (!response.ok) {

            throw new Error(
                event.message ||
                "Event not found."
            );

        }


        const content =
            document.getElementById(
                "adminContent"
            );


        content.innerHTML = `

            <h2>Edit Event</h2>

            <form id="editEventForm">

                <div class="form-group">

                    <label>Event Title</label>

                    <input
                        type="text"
                        id="editTitle"
                        value="${escapeAttribute(event.title)}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Description</label>

                    <textarea
                        id="editDescription"
                        required
                    >${escapeHTML(event.description)}</textarea>

                </div>


                <div class="form-group">

                    <label>Date</label>

                    <input
                        type="date"
                        id="editDate"
                        value="${escapeAttribute(event.date)}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Time</label>

                    <input
                        type="time"
                        id="editTime"
                        value="${escapeAttribute(event.time)}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Location</label>

                    <input
                        type="text"
                        id="editLocation"
                        value="${escapeAttribute(event.location)}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Image URL</label>

                    <input
                        type="url"
                        id="editImage"
                        value="${escapeAttribute(event.image || "")}"
                    >

                </div>


                <button
                    type="submit"
                    class="primary-btn"
                >
                    Update Event
                </button>

                <button
                    type="button"
                    class="secondary-btn"
                    onclick="manageEvents()"
                >
                    Cancel
                </button>

                <div
                    id="editMessage"
                    class="form-message"
                ></div>

            </form>

        `;


        document
            .getElementById("editEventForm")
            .addEventListener(
                "submit",
                async function (formEvent) {

                    formEvent.preventDefault();


                    const message =
                        document.getElementById(
                            "editMessage"
                        );


                    const updatedEvent = {

                        title:
                            document
                                .getElementById("editTitle")
                                .value
                                .trim(),

                        description:
                            document
                                .getElementById(
                                    "editDescription"
                                )
                                .value
                                .trim(),

                        date:
                            document
                                .getElementById("editDate")
                                .value,

                        time:
                            document
                                .getElementById("editTime")
                                .value,

                        location:
                            document
                                .getElementById(
                                    "editLocation"
                                )
                                .value
                                .trim(),

                        image:
                            document
                                .getElementById("editImage")
                                .value
                                .trim()

                    };


                    try {

                        const updateResponse =
                            await fetch(
                                `${API_URL}/events/${id}`,
                                {

                                    method: "PUT",

                                    headers:
                                        getAuthHeaders(),

                                    body:
                                        JSON.stringify(
                                            updatedEvent
                                        )

                                }
                            );


                        const data =
                            await updateResponse.json();


                        if (!updateResponse.ok) {

                            message.textContent =
                                data.message ||
                                "Update failed.";

                            message.style.color =
                                "#dc2626";

                            return;
                        }


                        message.textContent =
                            "Event updated successfully!";

                        message.style.color =
                            "#16a34a";


                        setTimeout(() => {

                            manageEvents();
                            loadAdminStats();

                        }, 700);


                    } catch (error) {

                        message.textContent =
                            "Unable to connect to server.";

                        message.style.color =
                            "#dc2626";

                    }

                }
            );


    } catch (error) {

        alert(error.message);

    }

}


// ======================================================
// DELETE EVENT
// ======================================================

async function deleteEvent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`,
                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete event."
            );

            return;
        }


        alert(
            "Event deleted successfully."
        );


        manageEvents();
        loadAdminStats();


    } catch (error) {

        alert(
            "Unable to connect to server."
        );

    }

}


// ======================================================
// VIEW REGISTRATIONS
// ======================================================

async function viewRegistrations() {

    const content =
        document.getElementById(
            "adminContent"
        );


    content.innerHTML = `

        <h2>All Registrations</h2>

        <div class="loading">
            Loading registrations...
        </div>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/admin/registrations`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        const registrations =
            await response.json();


        if (!response.ok) {

            throw new Error(
                registrations.message ||
                "Unable to load registrations."
            );

        }


        if (registrations.length === 0) {

            content.innerHTML = `

                <h2>All Registrations</h2>

                <div class="message-box">

                    <p>
                        No registrations yet.
                    </p>

                </div>

            `;

            return;
        }


        content.innerHTML = `

            <h2>All Registrations</h2>

            <div class="table-wrapper">

                <table class="data-table">

                    <thead>

                        <tr>

                            <th>User</th>

                            <th>Email</th>

                            <th>Event</th>

                            <th>Date</th>

                            <th>Location</th>

                            <th>Registered At</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${registrations.map(reg => `

                            <tr>

                                <td>
                                    ${escapeHTML(
                                        reg.user_name
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        reg.user_email
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        reg.event_title
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        reg.event_date
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        reg.event_location
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        reg.registered_at
                                    )}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;


    } catch (error) {

        content.innerHTML = `

            <div class="message-box">

                ${escapeHTML(error.message)}

            </div>

        `;

    }

}


// ======================================================
// ESCAPE HELPERS
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function escapeAttribute(value) {

    return escapeHTML(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
