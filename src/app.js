import express from "express";
import cors from 'cors';

const app = express();

//basic configurations
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({limit: "16kb", extended: "true"}));

app.use(express.static("public"));

//cors configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

//import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);

app.get('/', (req, res) => {
    res.send("Hello World!!")
});

app.get('/about', (req,res) => {
    res.send(`This is an About Page`)
})

export default app;