
import express from "express";
import { ValidateAuth } from "./../middlewares/index.js";
const { Request, Response, NextFunction } = express;
import { Connection, getConnection } from "typeorm";
import querystring from "querystring";
import { APPS } from "./../app.js";
import { ENV } from "./../models/index.js";

const router = express.Router();

router.get("/param", ValidateAuth, async (req, res, next) => {
  const conn = await getConnection();
  try {
    return res.status(200).send({});
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

export const ex1Router = router;
