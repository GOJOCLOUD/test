const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/index.js');
const convertRoutes = require('./routes/convertRoutes.js');

const tableRoutes = require('./routes/tableRoutes.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 增加请求体大小限制和超时时间
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 设置请求超时时间
app.use((req, res, next) => {
  res.setTimeout(10 * 60 * 1000, () => {
    console.log('Request has timed out');
    res.status(408).send('Request has timed out');
  });
  next();
});

app.use(cors());

app.use('/api', routes);
app.use('/api/convert', convertRoutes);

app.use('/api/table', tableRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set server-level timeout to 10 minutes
server.timeout = 10 * 60 * 1000;