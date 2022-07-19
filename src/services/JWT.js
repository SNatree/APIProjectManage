import { ENV } from "../models/ENV.Model.js";
import { UUIDV4 } from "./Utils.js";
import jwtoken from "jsonwebtoken";
import moment from "moment";

function jwt(opts = { tokenLife: null, nday: null }) {
  try {
    this.algorithm = "sha256";
    this.secretKey = ENV.TOKEN_SECRET;
    this.expiresIn = (opts.tokenLife || ENV.TOKEN_LIFE) * 1000;
    this.nDay = opts.nday;
  } catch (error) {
    throw error;
  }
}

jwt.prototype.tokenGenerate = function () {
  try {
    const dateNow = new Date();
    if (this.nDay) {
      dateNow.setDate(dateNow.getDate() + 1);
    }

    const currentDate = dateNow.setTime(dateNow.getTime() + this.expiresIn);
    // const currentDate = moment(dateNow).format("yyyy-MM-DD HH:mm:ss");
    const payloadInToken = {
      id: UUIDV4(),
      expiresDate: moment(currentDate).format("yyyy-MM-DD HH:mm:ss"),
    };
    const token = jwtoken.sign(payloadInToken, this.secretKey, { expiresIn: this.expiresIn });
    return token;
  } catch (error) {
    console.log('error :>> ', error);
    return "";
  }
};

jwt.prototype.tokenValidate = function (token) {
  try {
    const tokenverify = jwtoken.verify(token, this.secretKey);
    const expiresDate = tokenverify["expiresDate"];
    const n_date = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
    // const n_exp_date = expriesDate;
    // console.log("n_date :>> ", n_date);
    // console.log("n_exp_date :>> ", expiresDate);
    // console.log("n_exp_date :>> ", expiresDate > n_date);
    return expiresDate > n_date;
  } catch (error) {
    console.log('error :>> ', error);
    return "";
  }
};

export const JWT = jwt;
