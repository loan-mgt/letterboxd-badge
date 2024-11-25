import express from "express";
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

export default app;
