import { APPS } from "./app.js";
import http from "http";
import fs from "fs";
// import https from "https";
import { SocketService } from "./services/index.js";
import { ENV } from "./models/index.js";
// import fs from "fs";
// import path from "path";
// import https from "https";`
// const privateKey = fs.readFileSync("sslcert/PRIVATE KEY_aattms.com.txt", "utf8");
// const certificate = fs.readFileSync("sslcert/Certificate_aattms.com.txt", "utf8");
// const credentials = {key: privateKey, cert: certificate};
// ## Set Socket io
const server = http.createServer(APPS);
// const server = https.createServer(credentials,APPS);
APPS.set("socketService", SocketService.Initialize(server));

const host_name = ENV.HOST;
const host_port = ENV.PORT;

//### Start Sever
server.listen(host_port, host_name, (err) => {
  if (err) console.log(err);
  console.log(`ENV ${ENV.NODE_ENV} :>> Listening to ${ENV.USESSL === true ? "https" : "http"}://${host_name}:${host_port}`);
});
