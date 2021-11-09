const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;





app.get('/', (req, res) => {
    res.send('Hello from Jewelliaa server');
});

app.listen(port, () => {
    console.log('Running port is ', port);
})