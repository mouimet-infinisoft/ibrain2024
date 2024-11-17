import { setupPersistentTask } from "./persistent";
import { SocketServer } from "./ws/server";
import express from "express";
import { metrics } from "./metrics";
import { register } from "prom-client";

// Create Express app
const app = express();

// Add metrics endpoint
app.get("/api/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    const metric = await metrics();
    res.send(metric);
});

setupPersistentTask("realtime-tasks").catch((err) => {
    console.error(err);
});

const port = 7777;
new SocketServer(port);

// Start Express server
app.listen(7778, () => {
    console.log("Metrics server listening on port 7778");
});

export {};