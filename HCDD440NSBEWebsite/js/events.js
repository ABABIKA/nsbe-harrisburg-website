// Loads events from our own API (server.js), which reads Discover East.
const container = document.getElementById("events");

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit"
  });
}

function render(events) {
  if (!events.length) {
    container.innerHTML = "<p>No upcoming events right now. Check back soon or follow us on Instagram!</p>";
    return;
  }
  container.innerHTML = events.map(e => `
    <article class="card event">
      <div>
        <h3>${e.name}</h3>
        <p class="meta">${formatDate(e.startsOn)}${e.location ? " &middot; " + e.location : ""}</p>
      </div>
      <div><a class="btn" href="${e.url}" target="_blank" rel="noopener">Details</a></div>
    </article>
  `).join("");
}

fetch("/api/events")
  .then(res => res.json())
  .then(data => {
    render(data.events);
    if (data.source === "fallback") {
      container.insertAdjacentHTML("afterbegin",
        "<p><em>Showing saved events. Live Discover East data is unavailable right now.</em></p>");
    }
  })
  .catch(() => {
    container.innerHTML = "<p>Couldn't load events. Please visit our Discover East page.</p>";
  });
