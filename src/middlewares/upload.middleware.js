import util from "util";
import path from "path";
import multer from "multer";
import fs from "fs";
import { ENV } from "./../models/index.js";

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const _dir_path = path.join(ENV.DIR_TEMP_APPS_PATH, req["uploadpath"]);
    if (!fs.existsSync(_dir_path)) {
      fs.mkdirSync(_dir_path, {
        recursive: true,
      });
    }
    callback(null, _dir_path);
  },
  filename: (req, file, callback) => {
    // const match = ["image/png", "image/jpeg"];
    // if (match.indexOf(file.mimetype) === -1) {
    //   var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
    //   return callback(message, null);
    // }
    var filename = `${Date.now()}-${file.originalname}`;
    // console.log('file :>> ', file.mimetype==='application/x-zip-compressed');
    callback(null, file.originalname);
  },
});
var uploadFiles = multer({ storage: storage }).array("files");
var uploadFilesMiddleware = util.promisify(uploadFiles);

// export const UploadFilesMiddleware = uploadFilesMiddleware;

// const multerUpload = async (req, res, pathCombine = "") => {
//   var storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//       callback(null, path.join(ENV.DIR_TEMP_APPS_PATH, pathCombine));
//     },
//     filename: (req, file, callback) => {
//       // const match = ["image/png", "image/jpeg"];
//       // if (match.indexOf(file.mimetype) === -1) {
//       //   var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
//       //   return callback(message, null);
//       // }
//       var filename = `${Date.now()}-${file.originalname}`;
//       callback(null, file.originalname);
//     },
//   });
//   var uploadFiles = multer({ storage: storage }).array("files");
//   var uploadFilesMiddleware = util.promisify(uploadFiles);
//   return uploadFilesMiddleware;
// };

export const MulterUpload = uploadFilesMiddleware;
