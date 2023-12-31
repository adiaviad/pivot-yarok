const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

app.use(express.static('public'));
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nServer is shutting down...');
  server.close(() => {
    console.log('Server shut down gracefully.');
    process.exit(0);
  });
});