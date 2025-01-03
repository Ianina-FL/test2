const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const checkPermissions = require('./middlewares/check-permissions');
const modifyPath = require('./middlewares/modify-path');

const executorRoutes = require('./routes/executor');

app.use(cors({ origin: true }));

app.use(bodyParser.json());

app.use(checkPermissions);
app.use(modifyPath);

app.use('/executor', executorRoutes);

const PORT = 4000;


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;
