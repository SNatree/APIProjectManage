import express from "express";
import { ValidateAuth } from "./../middlewares/index.js";
const { Request, Response, NextFunction } = express;
import { Connection, getConnection } from "typeorm";
import querystring from "querystring";
import { APPS } from "./../app.js";
import { ENV } from "./../models/index.js";
import { ZipFile, ExtractZipFile, UserAccount, toLowerKeys, Authentication, JWT, ProjectManage } from "./../services/index.js";
import moment from "moment";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
const router = express.Router();

router.post("/create", ValidateAuth, async (req, res, next) => {
  //   const conn = await getConnection();
  try {
    const body = req.body;
    const proj = new ProjectManage();
    const data = await proj.where((f) => f["projectname"] === body["projectname"] && f["isactive"]);
    if (data.length > 0) {
      return res.status(403).send("Application name is already taken");
    }
    proj.addNew({ ...body });
    await proj.saveDB();
    // console.log('projectlist :>> ', projectlist);
    return res.status(200).send([]);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.post("/update", ValidateAuth, async (req, res, next) => {
  //   const conn = await getConnection();
  try {
    const body = req.body;
    const proj = new ProjectManage();
    const data = await proj.where((f) => f["projectname"] === body["projectname"] && f["isactive"]);
    if (data.length === 0) {
      return res.status(403).send("Application name  notfound");
    }
    const props = Object.keys(body);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      data[0][prop] = body[prop];
    }
    proj.updateModel(data[0]);
    await proj.saveDB();
    // console.log('projectlist :>> ', projectlist);
    return res.status(200).send([]);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.get("/available", ValidateAuth, async (req, res, next) => {
  //   const conn = await getConnection();
  const appName = req.query["appname"] || "";
  try {

    const proj = new ProjectManage();
    let data;
    if (appName === "") {
      data = await proj.where((f) => f["isactive"]);
    } else {
      data = await proj.where((f) => f["projectname"] === appName && f["isactive"]);
    }

    return res.status(200).send(data);
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

router.delete("/remove-app", ValidateAuth, async (req, res, next) => {
  const projAppName = req.query["appname"] || "";
  const dirRemovePath = path.join(ENV.DIR_SOURCE_PATH, projAppName);
  try {
    const proj = new ProjectManage();
    const data = await proj.where((f) => f["projectname"] === projAppName && f["isactive"]);
    if (data.length > 0) {
      await proj.delete(data[0]["projectid"]);
      rimraf(dirRemovePath, () => {});
    }
    return res.status(200).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.get("/", ValidateAuth, async (req, res, next) => {
  // const conn = await getConnection();
  const projAppName = req.query["apppath"] || "";
  const arrProjs = projAppName.split(",");
  const projsCombine = arrProjs.join("\\");
  if (projsCombine === "") {
    return res.status(404).send(`Application notfound`);
  }
  const dirPath = path.join(ENV.DIR_SOURCE_PATH, projsCombine);

  try {
    const proj = new ProjectManage();
    const projectlist = await proj.getAvailable(dirPath);
    // console.log('projectlist :>> ', projectlist);
    return res.status(200).send(projectlist);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.delete("/remove-file", ValidateAuth, async (req, res, next) => {
  // const conn = await getConnection();
  const projAppName = req.query["apppath"] || "";
  const isdir = req.query["isdir"] || false;
  const arrProjs = projAppName.split(",");
  const dirRemovePath = path.join(ENV.DIR_SOURCE_PATH, arrProjs.join("\\"));
  try {
    rimraf(dirRemovePath, () => {});
    return res.status(200).send();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export const projectRouter = router;
