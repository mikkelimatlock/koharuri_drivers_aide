const express = require('express');
const morgan = require('morgan');
const dgram = require('dgram');
const app = express();
const httpPort = 5860; // You can use any port that's open
// const beamngPort = 4444;

/* ************* */
/* THE HTTP PART */
// Use morgan to log HTTP requests 
app.use(morgan('dev'));

// Serve static files from 'rikka_public' directory
app.use(express.static('rikka_public'));

// Start the server
app.listen(httpPort, () => {
  console.log(`Server running at http://localhost:${httpPort}/`);
});
/* ************* */

/* something OBD2, prolly Bluetooth */