const API_URL = "http://localhost:5000/api";

const eventsContainer =
    document.getElementById("eventsContainer");


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


// ======================================================
// LOAD EVENTS
// ======================================================

async function loadEvents() {

    try {

        const response =
            await fetch(`${API_URL}/events`);

        const events =
            await response.json();


        if (!response.ok) {

            throw new Error(
                events.message ||
                "Unable to load events."
            );

        }


        if (events.length === 0) {

            eventsContainer.innerHTML = `
                <div class="message-box">
                    <h3>No upcoming events</h3>

                    <p>
                        New events will appear here soon.
                    </p>
                </div>
            `;

            return;
        }


        eventsContainer.innerHTML =
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

                        <div class="event-body">

                            <h3>
                                ${escapeHTML(event.title)}
                            </h3>

                            <p class="event-description">
                                ${escapeHTML(
                                    event.description
                                )}
                            </p>


                            <div class="event-info">

                                <span>
                                    📅
                                    ${escapeHTML(event.date)}
                                </span>

                                <span>
                                    🕐
                                    ${escapeHTML(event.time)}
                                </span>

                                <span>
                                    📍
                                    ${escapeHTML(event.location)}
                                </span>

                            </div>


                            <div class="event-actions">

                                <a
                                    href="event.html?id=${event.id}"
                                    class="secondary-btn"
                                >
                                    View Details
                                </a>

                                <button
                                    class="primary-btn"
                                    onclick="registerEvent(${event.id})"
                                >
                                    Register
                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }).join("");


    } catch (error) {

        eventsContainer.innerHTML = `
            <div class="message-box">
                <h3>Unable to load events</h3>

                <p>
                    Make sure the EventHub server is running.
                </p>
            </div>
        `;

        console.error(error);

    }

}


// ======================================================
// REGISTER EVENT
// ======================================================

async function registerEvent(eventId) {

    const token =
        localStorage.getItem("eventhubToken");

    if (!token) {

        window.location.href =
            `login.html?redirect=index.html`;

        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/registrations`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    eventId
                })

            });


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("eventhubToken");
            localStorage.removeItem("currentUser");

            window.location.href = "login.html";

            return;
        }


        alert(data.message);

    } catch (error) {

        alert(
            "Unable to connect to EventHub server."
        );

    }

}


// ======================================================
// EXPLORE BUTTON
// ======================================================

const exploreButton =
    document.getElementById("exploreEventsBtn");


if (exploreButton) {

    exploreButton.addEventListener(
        "click",
        function () {

            const eventsSection =
                document.getElementById("events");

            if (eventsSection) {

                eventsSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadEvents();
