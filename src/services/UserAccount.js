import { UUIDV4, GetFNParams } from "./Utils.js";
import { Authentication } from "./Authentication.js";
import { ENV } from "./../models/ENV.Model.js";
import fs from "fs";
import path from "path";
import moment from "moment";

function _fn({
  userid = null,
  username = null,
  passwordhash = null,
  salt = null,
  firstname = null,
  lastname = null,
  email = null,
  accesstoken = null,
  isverify = null,
  isactive = null,
  resettoken = null,
  createddate = null,
  createdby = null,
  updateddate = null,
  updatedby = null,
} = {}) {}

const useraccModel = {
  userid: null,
  username: null,
  passwordhash: null,
  salt: null,
  firstname: null,
  lastname: null,
  email: null,
  accesstoken: null,
  isverify: null,
  isactive: null,
  resettoken: null,
  createddate: null,
  createdby: null,
  updateddate: null,
  updatedby: null,
};

function userAccount(username, password, firstname, lastname, email) {
  const gauth = new Authentication(password);
  this.userid = UUIDV4();
  this.username = username;
  this.passwordhash = gauth.hashGenerate();
  this.salt = gauth.getSalt();
  this.firstname = firstname;
  this.lastname = lastname;
  this.email = email;
  this.accesstoken = "";
  this.isverify = false;
  this.isactive = true;
  this.resettoken = "";
  this.createddate = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
  this.createdby = "admin";
  this.updateddate = "";
  this.updatedby = "";
}

userAccount.prototype.getUserId = function () {
  return this.userid;
};

userAccount.prototype.setUserId = function (userid) {
  this.userid = userid;
};

userAccount.prototype.equals = function (o) {
  return o.getUserId() == this.getUserId();
};

userAccount.prototype.data = function () {
  return new Promise((resolve, reject) => {
    fs.readFile(ENV.AUTH_PATH, "utf8", (error, data) => {
      if (error) throw error;
      const jsonData = JSON.parse(data);
      resolve(jsonData);
    });
  });
};

userAccount.prototype.addNew = function (newFields = useraccModel) {
  for (var field in newFields) {
    if (this.hasOwnProperty(field) && newFields.hasOwnProperty(field)) {
      if (this[field] !== "undefined") {
        this[field] = newFields[field];
      }
    }
  }
};

userAccount.prototype.updateModel = function (updFields = useraccModel) {
  for (var field in updFields) {
    if (this.hasOwnProperty(field) && updFields.hasOwnProperty(field)) {
      if (this[field] !== "undefined") {
        this[field] = updFields[field];
      }
    }
    updFields["updateddate"] = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
  }
};

userAccount.prototype.where = function (fn = _fn) {
  return new Promise((resolve, reject) => {
    fs.readFile(ENV.AUTH_PATH, "utf8", (error, data) => {
      if (error) throw error;
      const jsonData = JSON.parse(data);
      const fdata = jsonData.filter(fn);
      resolve(fdata);
    });
  });
};

userAccount.prototype.saveDB = function () {
  return new Promise((resolve, reject) => {
    var props = Object.keys(useraccModel);
    let usermodel = {};
    for (var field in props) {
      usermodel[props[field]] = this[props[field]];
    }
    this.data()
      .then((v) => {
        const isexists = v.filter((f) => f["userid"] === usermodel["userid"]).length > 0;
        if (isexists) {
          const upddata = v.filter((f) => f["userid"] === usermodel["userid"]);
          for (var field in props) {
            upddata[0][props[field]] = this[props[field]];
          }
          upddata[0]["updateddate"] = moment(Date.now()).format("yyyy-MM-DD HH:mm:ss");
          // v[0]["updatedby"] = "admin";
        } else {
          v.push({ ...usermodel });
        }
        const userjson = JSON.stringify(v, null, 2);
        fs.writeFile(ENV.AUTH_PATH, userjson, (error) => {
          if (error) throw error;
          resolve(true);
        });
      })
      .catch((err) => {});
  });

  // var props = GetFNParams(userAccount);
  // console.log("props :>> ", props);
  // for (var field in props) {
  //   // if (this[field] !== "undefined") {
  //   //   this[field] = props[field];
  //   // }
  // }
  // console.log("str :>> ", props);
};

export const UserAccount = userAccount;
