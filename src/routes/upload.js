import express from "express";
import { ValidateAuth, MulterUpload } from "./../middlewares/index.js";
const { Request, Response, NextFunction } = express;
import { Connection, getConnection } from "typeorm";
import querystring from "querystring";
import { APPS } from "./../app.js";
import { ENV } from "./../models/index.js";
import { ZipFile, ExtractZipFile, UserAccount, toLowerKeys, Authentication, JWT, ProjectManage, MoveFiles } from "./../services/index.js";
import moment from "moment";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";

const router = express.Router();

// var multerStorage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, ENV.DIR_TEMP_APPS_PATH);
//   },
//   filename: function (req, file, callback) {
//     callback(null, `${Date.now()}-${file.originalname}`);
//   },
// });
// var upload = multer({ storage: multerStorage }).array("files");
// const upload = multer({ dest: `${ENV.DIR_TEMP_APPS_PATH}/` });

router.post("/", async (req, res, next) => {
  try {
    const apppath = req.query["apppath"] || "";
    const arrProjs = apppath.split(",");
    const projsCombine = arrProjs.join("\\");
    // const _uploadpath = path.join(projsCombine, `temp-${moment(Date.now()).format("yyyy-MM-DD-HH-mm-ss")}`);
    let _uploadpath_temp = path.join(projsCombine, `temp-${moment(Date.now()).format("yyyy-MM-DD-HH-mm-ss")}`);
    if (arrProjs.length > 0) {
      let _path_comb = [];
      for (let i = 1; i <= arrProjs.length; i++) {
        let ap = arrProjs[i];
        _path_comb.push(ap);
      }
      _uploadpath_temp = path.join(arrProjs[0], `temp-${moment(Date.now()).format("yyyy-MM-DD-HH-mm-ss")}`, _path_comb.join("\\"));
    }
    req["uploadpath"] = _uploadpath_temp;

    await MulterUpload(req, res);

    const projM = new ProjectManage();
    const data = await projM.where((f) => f["projectname"] === arrProjs[0] && f["isactive"]);
    if (data.length > 0) {
      data[0]["projecttemp"] = path.join(ENV.DIR_TEMP_APPS_PATH, _uploadpath_temp);
      projM.updateModel(data[0]);
      await projM.saveDB();
    }
    // *** เตรียมไว้ทำใน สร้าง api path ใหม่

    MoveFiles(path.join(ENV.DIR_TEMP_APPS_PATH, _uploadpath_temp), path.join(ENV.DIR_SOURCE_PATH, projsCombine));
    return res.status(200).send({});
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export const uploadRouter = router;
