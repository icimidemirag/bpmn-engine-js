const express = require('express');

const app = express();
app.use(express.json());

app.get('/getNumber', (req, res) => {
    res.send('Hello World!');
});

app.post('/sendNumber', (req, res) => {
    res.send('Hello World!');
});

app.post('/approval', (req, res) => {
    res.send('Hello World!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı..`);
});