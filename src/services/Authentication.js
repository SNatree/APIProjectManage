import { UUIDV4, GetFNParams } from "./Utils.js";
import CryptoJS from "crypto-js";
import { ENV } from "../models/ENV.Model.js";
import fs from "fs";
import path from "path";
import moment from "moment";

function authentication(passwordText, salt) {
  this.passwordtext = passwordText;
  this.salt = salt || CryptoJS.lib.WordArray.random(this.defaultConfig.saltBytes);
}

authentication.prototype.defaultConfig = {
  // size of the generated hash
  hashBytes: 8,
  // larger salt means hashed passwords are more resistant to rainbow table, but
  // you get diminishing returns pretty fast
  saltBytes: 16,
  // more iterations means an attacker has to take longer to brute force an
  // individual password, so larger is better. however, larger also means longer
  // to hash the password. tune so that hashing the password takes about a
  // second
  iterations: 1000,
};

authentication.prototype.hashGenerate = function () {
  try {
    const _hash = CryptoJS.PBKDF2(this.passwordtext, this.salt, {
      keySize: this.defaultConfig.hashBytes,
      iterations: this.defaultConfig.iterations,
    });
    return _hash.toString(CryptoJS.enc.Base64);
  } catch (error) {
    return "";
  }
};

authentication.prototype.getSalt = function () {
  try {
    return this.salt.toString(CryptoJS.enc.Base64);
  } catch (error) {
    return "";
  }
};

authentication.prototype.verifyPassword = function (combined) {
  try {
    const de_salt = this.DecodeBase64(this.salt);
    const _hash = CryptoJS.PBKDF2(this.passwordtext, de_salt, {
      keySize: this.defaultConfig.hashBytes,
      iterations: this.defaultConfig.iterations,
    });
    const newPassword = _hash.toString(CryptoJS.enc.Base64);
    //   const combPassword = _combined.toString(CryptoJS.enc.Base64);
    return combined === newPassword;
  } catch (error) {
    return false;
  }
};

authentication.prototype.DecodeBase64 = function (encodeText) {
  return CryptoJS.enc.Base64.parse(encodeText);
};

export const Authentication = authentication;
