// ======================================================
// EVENTHUB FRONTEND SCRIPT
// ======================================================

// API URL
const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://eventhub-production.up.railway.app/api";


// ======================================================
// LOAD EVENTS
// ======================================================

async function loadEvents() {

    const container =
        document.getElementById(
            "eventsContainer"
        );

    if (!container) return;


    container.innerHTML = `
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


        if (!Array.isArray(events) ||
            events.length === 0) {

            container.innerHTML = `
                <div class="message-box">

                    <h3>
                        No upcoming events
                    </h3>

                    <p>
                        New events will appear here soon.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML =
            events.map(event => {

                const image =
                    event.image ||
                    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80";


                return `

                    <article class="event-card">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(event.title)}"
                            class="event-image"
                        >


                        <div class="event-card-content">

                            <h3>
                                ${escapeHTML(event.title)}
                            </h3>


                            <p class="event-description">

                                ${escapeHTML(
                                    event.description
                                )}

                            </p>


                            <div class="event-meta">

                                <span>
                                    📅
                                    ${escapeHTML(
                                        event.date
                                    )}
                                </span>

                                <span>
                                    🕐
                                    ${escapeHTML(
                                        event.time
                                    )}
                                </span>

                                <span>
                                    📍
                                    ${escapeHTML(
                                        event.location
                                    )}
                                </span>

                            </div>


                            <a
                                href="event.html?id=${encodeURIComponent(event.id)}"
                                class="primary-btn"
                            >
                                View Details
                            </a>

                        </div>

                    </article>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Events loading error:",
            error
        );


        container.innerHTML = `
            <div class="message-box">

                <h3>
                    Unable to load events
                </h3>

                <p>
                    Please make sure the EventHub
                    server is running.
                </p>

            </div>
        `;

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadEvents();

    }
);