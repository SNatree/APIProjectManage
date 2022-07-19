import { UUIDV4, GetFNParams } from "./Utils.js";
import { Authentication } from "./Authentication.js";
import { ENV } from "./../models/ENV.Model.js";
import fs, { stat } from "fs";
import path from "path";
import moment from "moment";
import { json } from "express";

function _publishfn({
  publishid = null,
  projectname = null,
  publishname = null,
  publishdesc = null,
  publishtemp = null, //current temp upload name
  publishurl = null,
  publishswagger = null,
  publishport = null,
  publishenv = null,
  publishexec = null,
  publishoutlog = null,
  publishinti = null,
  publishpid = null,
  publishtechnology = null,
  createddate = null,
  createdby = null,
  updateddate = null,
  updatedby = null,
} = {}) {}

const publishModel = {
  publishid: null,
  projectname: null,
  publishname: null,
  publishdesc: null,
  publishtemp: null, //current temp upload name
  publishurl: null,
  publishswagger: null,
  publishport: null,
  publishenv: null,
  publishexec: null,
  publishoutlog: null,
  publishinti: null,
  publishpid: null,
  publishtechnology: null,
  createddate: null,
  createdby: null,
  updateddate: null,
  updatedby: null,
};

function publishManage(publishname, projectname, publishdesc, publishenv, publishtemp, publishurl, publishswagger, publishport, publishexec, publishinti, publishtechnology) {
  this.publishid = UUIDV4();
  this.projectname = projectname;
  this.publishname = publishname;
  this.publishdesc = publishdesc;
  this.publishtemp = publishtemp;
  this.publishurl = publishurl;
  this.publishswagger = publishswagger;
  this.publishport = publishport;
  this.publishenv = publishenv;
  this.publishexec = publishexec;
  this.publishoutlog = "";
  this.publishinti = publishinti;
  this.publishpid = null;
  this.publishtechnology = publishtechnology;
  this.createddate = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
  this.createdby = "admin";
  this.updateddate = "";
  this.updatedby = "";
}
const ignoers = ["node_modules"];

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      const filename = file;
      file = path.resolve(dir, file);

      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          if (!ignoers.includes(filename)) {
            results.push({
              filename: filename,
              size: `${stat["size"]} bytes`,
              modified: moment(stat["mtime"]).format("yyyy-MM-DD HH:mm:ss"),
              fullpath: file,
              isdir: stat.isDirectory(), // 16682 is dir, 33206 is file
              isfile: stat.isFile(),
              sortno: 1,
            });
          }
          //   walk(file, function (err, res) {
          //     results = results.concat(res);
          //   next();
          //   });
        } else {
          //   results.push(file);
          results.push({
            filename: filename,
            size: `${stat["size"]} bytes`,
            modified: moment(stat["mtime"]).format("yyyy-MM-DD HH:mm:ss"),
            fullpath: file,
            isdir: stat.isDirectory(), // 16682 is dir, 33206 is file
            isfile: stat.isFile(),
            sortno: 2,
          });
          //   next();
        }
        next();
      });
    })();
  });
};

publishManage.prototype.getAvailable = function (dirPath) {
  return new Promise((resolve, reject) => {
    // const dirPath = path.join(ENV.DIR_APPS_PATH, pathname.join("\\"));
    const appsFile = walk(dirPath, (err, results) => {
      resolve(results);
    });
  });
};

publishManage.prototype.data = function () {
  return new Promise((resolve, reject) => {
    fs.readFile(ENV.PUBLISH_PATH, "utf8", (error, data) => {
      if (error) throw error;
      const jsonData = JSON.parse(data);
      resolve(jsonData);
    });
  });
};

publishManage.prototype.addNew = function (newFields = publishModel) {
  for (var field in newFields) {
    if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
      if (this[field] !== "undefined") {
        this[field] = newFields[field];
      }
    }
  }
};

publishManage.prototype.updateModel = function (updFields = publishModel) {
  for (var field in updFields) {
    if (this.hasOwnProperty(field) && updFields.hasOwnProperty(field)) {
      if (this[field] !== "undefined") {
        this[field] = updFields[field];
      }
    }
    updFields["updateddate"] = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
  }
};

publishManage.prototype.where = function (fn = _projfn) {
  return new Promise((resolve, reject) => {
    fs.readFile(ENV.PUBLISH_PATH, "utf8", (error, data) => {
      if (error) throw error;
      const jsonData = JSON.parse(data);
      const fdata = jsonData.filter(fn);
      resolve(fdata);
    });
  });
};

publishManage.prototype.saveDB = function () {
  return new Promise((resolve, reject) => {
    var props = Object.keys(publishModel);
    let projmodel = {};
    for (var field in props) {
      projmodel[props[field]] = this[props[field]];
    }
    this.data()
      .then((v) => {
        const isexists = v.filter((f) => f["publishid"] === projmodel["publishid"]).length > 0;
        if (isexists) {
          const upddata = v.filter((f) => f["publishid"] === projmodel["publishid"]);
          for (var field in props) {
            upddata[0][props[field]] = this[props[field]];
          }
          upddata[0]["updateddate"] = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
          // v[0]["updatedby"] = "admin";
        } else {
          v.push({ ...projmodel });
        }
        const projjson = JSON.stringify(v, null, 2);
        fs.writeFile(ENV.PUBLISH_PATH, projjson, (error) => {
          if (error) throw error;
          resolve(true);
        });
      })
      .catch((err) => {});
  });
};

publishManage.prototype.delete = function (publishid) {
  return new Promise((resolve, reject) => {
    this.data()
      .then((v) => {
        const filter_data = v.filter((f) => f["publishid"] !== publishid);
        const projjson = JSON.stringify(filter_data, null, 2);
        fs.writeFile(ENV.PUBLISH_PATH, projjson, (error) => {
          if (error) throw error;
          resolve(true);
        });
      })
      .catch((err) => {});
  });
};

export const PublishManage = publishManage;
