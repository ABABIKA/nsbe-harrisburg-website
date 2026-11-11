# HCDD 440 NSBE Website (capstone portion)

Plain HTML/CSS/JavaScript: About, Events, Resources.

## Run locally
Requires Node 18+.

    cd HCDD440NSBEWebsite
    node server.js

Open http://localhost:3000

## Events API
`GET /api/events` returns upcoming NSBE events from Discover East (cached 10 min),
or `data/events.json` if Discover East can't be reached.
If the organization lookup fails, set the ID manually:

    NSBE_ORG_ID=12345 node server.js
