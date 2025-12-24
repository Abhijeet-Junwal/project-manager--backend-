import express from "express";

const app = express();

app.get('/', (req, res) => {
    res.send(`Welcome Welcome.....`)
})

app.get('/', (req, res) => {
    res.send("Hello World!!")
});

app.get('/about', (req,res) => {
    res.send(`This is an About Page`)
})

export default app;