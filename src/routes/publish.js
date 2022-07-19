import express from "express";
import { ValidateAuth } from "./../middlewares/index.js";
const { Request, Response, NextFunction } = express;
import { Connection, getConnection } from "typeorm";
import querystring from "querystring";
import { APPS } from "./../app.js";
import { ENV } from "./../models/index.js";
import { ZipFile, ExtractZipFile, UserAccount, toLowerKeys, Authentication, JWT, ProjectManage, PublishManage, MoveFiles } from "./../services/index.js";
import moment from "moment";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import util from "node:util";
import { spawn } from "child_process";
import { exec } from "node:child_process";
const router = express.Router();

function app_cmd(cmd, args, path) {
  const ls = spawn(cmd, args, { cwd: path });
  console.log(cmd + " " + ls.pid);
  ls.on("close", function (code) {
    console.log("returning: " + code + " on " + ls.pid);
  });
  return ls.pid;
}
router.get("/", ValidateAuth, async (req, res, next) => {
  try {
    const appname = req.query["appname"] || "";
    const pub = new PublishManage();
    const data = await pub.where((f) => f["projectname"] === appname);
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

router.post("/", ValidateAuth, async (req, res, next) => {
  //   const conn = await getConnection();
  try {
    const body = toLowerKeys(req.body);
    const pubname = body["publishname"];
    const projname = body["projectname"];
    const pubenv = body["publishenv"].toUpperCase();
    const pubinti = body["publishinti"] ?? false;
    const tech = body["publishtechnology"];
    const execstr = body["publishexec"];
    const ondev = pubenv === "DEV";

    const publishPath = path.join(ENV.DIR_APPS_PATH, projname, pubenv, pubname);
    MoveFiles(path.join(ENV.DIR_SOURCE_PATH, projname), publishPath);

    const outPath = path.join(ENV.DIR_APPS_PATH, projname, pubenv, pubname, `${pubname}-${pubenv}-out.log`);
    // var out = fs.openSync(outPath, "a");
    // var err = fs.openSync(outPath, "a");

    const _exec = util.promisify(exec);

    //#region ============ NODE==============

    if (tech === "node") {
      /**FOR NODE JS */
      if (pubinti) {
        const { stdout, stderr } = await _exec(`npm install`, { cwd: `${publishPath}` });
        console.log("stdout :>> ", stdout);
        console.log("stderr :>> ", stderr);
        //socket on send message
      }

      const ls = spawn(tech, [execstr], { stdio: ["ignore"], cwd: publishPath, detached: true }); //stdio: ["ignore", out, err],
      console.log("ls.pid :>> ", ls.pid);

      ls.stdout.on("data", (data) => {
        // console.log(`stdout: ${data}`);
        savePublish(data);
      });

      ls.stderr.on("data", (data) => {
        // console.log(`stderr: ${data}`);
        savePublish(data);
      });

      ls.on("error", (error) => {
        // console.log(`error: ${error.message}`);
        savePublish(error.message);
      });

      ls.on("close", (code) => {
        // console.log(`child process exited with code ${code}`);
      });

      const savePublish = async (data) => {
        const pub = new PublishManage();
        const whdata = await pub.where((f) => f["projectname"] === projname && f["publishname"] === pubname);
        if (whdata.length === 0) {
          pub.addNew({ ...body, publishoutlog: `${data}`, publishpid: ls.pid });
        } else {
          pub.updateModel({ ...body, publishoutlog: `${data}`, publishpid: ls.pid });
        }
        await pub.saveDB();
      };

      ls.unref();
    } else {
      //dotnet publish --self-contained true -c Release -r win-x64 --output ./MyTargetFolder MySolution.sln
    }

    //#endregion

    return res.status(200).send([]);
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send({ error: error });
  }
});

export const publishRouter = router;
