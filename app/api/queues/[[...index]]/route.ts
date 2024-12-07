// src/app/api/queues/[[...index]]/route.ts

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { serveStatic } from "@hono/node-server/serve-static";
import { Queue } from "bullmq";

const app = new Hono();

// Create the Express adapter
const serverAdapter = new HonoAdapter(serveStatic);

// Create Bull Board with your queues
createBullBoard({
  queues: [new BullMQAdapter(new Queue('message')),new BullMQAdapter(new Queue('realtime-tasks'))],
  serverAdapter,
});

// Configure the server adapter
serverAdapter.setBasePath("/api/queues");
app.route("/api/queues", serverAdapter.registerPlugin());

export const GET = handle(app);
export const POST = handle(app);
