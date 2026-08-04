import http from "node:http";
import express from "express";
import { bootstrap } from "@mercuryworkshop/proxy-bootstrap";

/*
 * Proxy Bootstrap supplies:
 * - /bootstrap-init.js
 * - /sw.js
 * - /scram/scramjet.js
 * - Scramjet controller and utility files
 * - Libcurl transport
 * - Berri's own /wisp/ WebSocket server
 */
const { routeRequest, routeUpgrade } = await bootstrap({
  transport: "libcurl",
  wispPath: "/wisp/"
});

const app = express();

/* Proxy/Scramjet assets must be checked before normal website files. */
app.use((req, res, next) => {
  if (routeRequest(req, res)) return;
  next();
});

app.use(express.static("public"));

const server = http.createServer(app);
server.on("upgrade", routeUpgrade);

const port = process.env.PORT || 3030;

server.listen(port, () => {
  console.log(`Berri Browser is running on http://localhost:${port}`);
  console.log(`Berri Wisp is running at ws://localhost:${port}/wisp/`);
  console.log("Transport: Libcurl");
});
