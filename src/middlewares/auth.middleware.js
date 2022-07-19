import express from "express";
import { JWT } from "./../services/JWT.js";
// import { NextFunction, Response, Request } from "express";
// import { Connection, createConnection,getConnection } from "typeorm";
// const router = express.Router();

const validateAuth = async (req, res, next) => {
  const x_access_token = req.headers["x-access-token"] || req.headers["authorization"];
  // console.log('x_access_token :>> ', x_access_token);
  if (!x_access_token){
    return res.status(401).send("Token notfound");
  }
  try {
    const access = new JWT();
    const isValid = access.tokenValidate(x_access_token); //JWToken.TokenValidate(xAccessToken);
    if (!isValid) {
      return res.status(401).send("Token has been expired or revoked");
    }
    next();
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

export const ValidateAuth = validateAuth;
