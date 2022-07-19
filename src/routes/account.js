import express from "express";
import { ValidateAuth } from "./../middlewares/index.js";
const { Request, Response, NextFunction } = express;
import { Connection, getConnection } from "typeorm";
import querystring from "querystring";
import { APPS } from "./../app.js";
import { ENV } from "./../models/index.js";
import { ZipFile, ExtractZipFile, UserAccount, toLowerKeys, Authentication, JWT } from "./../services/index.js";
import moment from "moment";
// import path from "path";
// import fs from "fs";
const router = express.Router();

router.post("/register", async (req, res, next) => {
  const conn = await getConnection();
  const payload = toLowerKeys(req.body);
  try {
    const uAcc = new UserAccount(...Object.values(payload));
    await uAcc.saveDB();
    return res.status(200).send({});
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

router.post("/login", async (req, res, next) => {
  const conn = await getConnection();
  try {
    const payload = req.body;
    const uAccs = new UserAccount();
    const whUser = await uAccs.where((f) => f["username"] === payload["username"]);
    if (whUser.length === 0) {
      return res.status(404).send(`Username '${payload["username"]}' notfound`);
    }
    const authGuard = new Authentication(payload["password"], whUser[0]["salt"]);
    const isMatch = authGuard.verifyPassword(whUser[0]["passwordhash"]);

    if (!isMatch) {
      return res.status(401).send(`Password is incorrect`);
    }
    const access = new JWT();
    const access_token = access.tokenGenerate();
    whUser[0]["accesstoken"] = access_token;
    whUser[0]["updatedby"] = payload["username"];
    uAccs.updateModel(whUser[0]);
    await uAccs.saveDB();

    // const uAcc = new UserAccount();
    // const d = await uAcc.where((f) => f.username === "user1");
    // d[0]["updatedby"] = "natree";
    // d[0]["updateddate"] = Date.now();
    // uAcc.updateModel(d[0]);
    // await uAcc.saveDB();

    //(f=>f.username==="user2")
    // const sourcep = `D:\\Projects\\MFC\\WebProjectDeploy\\ProjectDeployAPI\\dist`;
    // const dirname = "New folder";
    // // ZipFile({ sourcePath: sourcep, targetPath: sourcep, dirName: dirname });
    // const filepath = path.join(sourcep, dirname);
    // ExtractZipFile({ filePath: `${filepath}.zip`, targetPath: filepath });
    // z.AddArchive();
    // setTimeout(() => {
    //   z.ExtrackArchive("D:\\Projects\\MFC\\WebProjectDeploy\\ProjectDeployAPI\\dist");
    // }, 2000);
    return res.status(200).send({ access_token, refresh_token: "" });
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

router.get("/user", ValidateAuth, async (req, res, next) => {
  const conn = await getConnection();
  try {
    const accessToken = req.headers["x-access-token"] || "";
    const userAcc = new UserAccount();
    const uData = await userAcc.where((f) => f["accesstoken"] === accessToken && f["isactive"]);
    return res.status(200).send(uData);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.get("/reset-password", async (req, res, next) => {
  const conn = await getConnection();
  try {
    const email = req.query["email"];
    const uAccs = new UserAccount();
    const whUser = await uAccs.where((f) => f["email"] === email && f["isactive"]);
    if (whUser.length === 0) {
      return res.status(404).send(`Email '${email}' notfound`);
    }
    const reset_date = `reset-${moment(new Date()).format("yyyy-MM-DD HH:mm:ss")}`;
    const authAccReset = new Authentication(reset_date, whUser[0]["salt"]);
    whUser[0]["resettoken"] = authAccReset.hashGenerate();
    whUser[0]["updatedby"] = whUser[0]["username"];
    uAccs.updateModel(whUser[0]);
    await uAccs.saveDB();
    return res.status(200).send([]);
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

router.post("/reset-password", async (req, res, next) => {
  const conn = await getConnection();
  try {
    const payload = req.body;
    const uAccs = new UserAccount();
    const whUser = await uAccs.where((f) => f["resettoken"] === payload["resettoken"] && f["isactive"]);
    if (whUser.length === 0) {
      return res.status(404).send(`Reset token '${payload["resettoken"]}' notfound`);
    }
    const authAccReset = new Authentication(payload["resetpassword"]);
    whUser[0]["passwordhash"] = authAccReset.hashGenerate();
    whUser[0]["salt"] = authAccReset.getSalt();
    whUser[0]["resettoken"] = "";
    whUser[0]["updatedby"] = "admin";
    uAccs.updateModel(whUser[0]);
    await uAccs.saveDB();
    return res.status(200).send([]);
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

router.get("/logout", ValidateAuth, async (req, res, next) => {
  const conn = await getConnection();
  try {
    const accessToken = req.headers["x-access-token"] || "";
    const userAcc = new UserAccount();
    const uData = await userAcc.where((f) => f["accesstoken"] === accessToken && f["isactive"]);
    if (uData.length > 0) {
      uData[0]["accesstoken"] = "";
      uData[0]["updatedby"] = uData[0]["username"];
      userAcc.updateModel(uData[0]);
      await userAcc.saveDB();
    }
    return res.status(200).send([]);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.get("/token-validate", ValidateAuth, async (req, res, next) => {
  const conn = await getConnection();
  try {
    const accessToken = req.headers["x-access-token"] || "";
    const access = new JWT();
    const valid = access.tokenValidate(accessToken);
    return res.status(200).send(valid);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export const accountRouter = router;
