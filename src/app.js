import express from "express";
const { Request, Response, NextFunction } = express;
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { Connection, createConnection } from "typeorm";
import { ex1Router, accountRouter, projectRouter, uploadRouter, publishRouter } from "./routes/index.js";
// import Arena from "bull-arena";
// import Bull from "bull";
import { Notify } from "./services/index.js";
import { ENV } from "./models/index.js";
const app = express();

app.use(
  cors({
    origin: "*", //["http://127.0.0.1:5500"],
  })
);
//## Helmet
app.use(helmet.contentSecurityPolicy());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

//## CookieParser
app.use(cookieParser());

//## แปลงข้อมูลจาก form ในรูปแบบ url encode เป็น Object
app.use(express.urlencoded({ extended: false }));

//## JSON
app.use(express.json());

createConnection()
  .then(async () => {})
  .catch((err) => {
    // console.log("err :>> ", err);
    // app.get("/api/v1/auth-jwt", (req: Request, res: Response, next: NextFunction) => {
    //   res.status(500).send("The database connection failed!");
    // });
  });
// app.use(
//   "/arena",
//   Arena(
//     {
//       Bull,
//       queues: [
//         {
//           name: "CUBE QUEUES",
//           hostId: "Worker",
//           redis: { ...redisConfig },
//         },
//       ],
//     },
//     {
//       basePath: "/",
//       disableListen: true,
//     }
//   )
// );

//## Router
app.get("/", (req, res) => {
  res.status(200).send("/api/v1/account");
});
// app.use("/api/v1/cube", cubeRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/publish", publishRouter);
// app.use("/api/v1/blackbox", blackboxRouter);
export const APPS = app;
