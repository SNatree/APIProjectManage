import { toLowerKeys, UUIDV4, GenerateUUID, ExecuteNonQueryAsync } from "./Utils.js";
import { eCommandType, eParameterType, uAxios } from "../services/index.js";
import { Connection, getConnection } from "typeorm";
import { ENV } from "./../models/index.js";
import { APPS } from "../app.js";
import moment from "moment";
export let subscribers = {};

function notify(apps = null, conn = null, username, socketid) {
  this.conn = conn || getConnection();
  this.apps = apps || APPS;
  this.username = username;
  this.socketid = socketid;
  const user_conns = subscribers[username];
  if (!user_conns) {
    subscribers[username] = [];
  }
}
notify.prototype.reSendMessage = function ({ title = "", message = "", processid = "", issuccess = true, error = null } = {}) {
  try {
    const sends = subscribers[this.username].filter((f) => f["close"] === false);
    for (let i = 0; i < sends.length; i++) {
      const s = sends[i];
      this.apps.get("socketService").to(this.socketid).emit("message", s["body"]);
    }
  } catch (error) {
    // console.log('error :>> ', error);
  }
};

notify.prototype.sendAPIMessage = function ({ title = "", message = "", processid = "", issuccess = true, error = null } = {}) {
  let socket_obj = {
    title,
    message,
    api: `${ENV.BB_HOST}`,
    processid,
    issuccess,
    error,
  };
  try {
    subscribers[this.username].push({ socketid: this.socketid, body: socket_obj, close: true, uid: UUIDV4() });
    this.apps.get("socketService").to(this.socketid).emit("message", socket_obj);
  } catch (error) {
    // console.log('error :>> ', error);
  }
  // save transaction
  // get notify from db
  // send notify
  // update flag
};

notify.prototype.sendDBMessage = function ({ title = "", message = "", processid = "", issuccess = true, error = null } = {}) {
  let socket_obj = {
    title,
    message,
    api: null,
    processid,
    issuccess,
    error,
  };

  try {
    subscribers[this.username].push({ socketid: socketid, body: socket_obj, close: true, uid: UUIDV4() });
    this.apps.get("socketService").to(this.socketid).emit("message", socket_obj);
  } catch (error) {}
};

export const Notify = notify;
