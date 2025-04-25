DISCORD LOG MONITOR
===================

A simple Node.js script that monitors a log file in real time and sends player connection and disconnection events to a Discord channel via webhook.

FEATURES
--------
- Parses log lines for `[MP] <player> connected` and `[MP] <player> disconnected` events
- Ignores Steam messages and chat lines
- Tracks the current number of players and displays it against a configurable maximum
- Resets state automatically when the log file is rewritten
- Prepends a 🚔 emoji for player names starting with `PRF`

PREREQUISITES
-------------
- Node.js v14 or higher
- npm (Node Package Manager)

INSTALLATION
------------
1. Clone this repository:
   ```
   git clone https://github.com/ararasstudio/ETS2-ATS-PLAYERS-LOG-TO-DISCORD
   cd ETS2-ATS-PLAYERS-LOG-TO-DISCORD
   ```
2. Install dependencies:
   ```
   npm install axios
   ```

CONFIGURATION
-------------
Edit the constants in the script directly:

```
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'YOUR_WEBHOOK_URL';
const LOGFILE_NAME = 'PATH_TO_YOUR_LOG_FILE.log.txt';
const MAX_PLAYERS = 128;
```

USAGE
-----
Run the script:

```
node index.js
```

- On startup, processes the entire existing log file and sends events for connection/disconnection lines.
- Then watches the log file for changes and sends new events in real time.

ERROR HANDLING
--------------
- Exits with an error if `WEBHOOK_URL` is not set or the log file is not found.
- Logs errors encountered when sending messages to Discord.

LICENSE
-------
Licensed under the MIT License.

