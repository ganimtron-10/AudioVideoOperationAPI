import express from "express";
import APIRoute from "./routes/apiroutes.js";
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(APIRoute);

const port = 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})
