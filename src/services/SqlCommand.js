import { Connection, getConnection } from "typeorm";
import { toLowerKeys, UUIDV4, GenerateUUID } from "./Utils.js";
import moment from "moment";

export const eCommandType = {
  Text: "text",
  StoredProcedure: "proc",
};

export const eParameterType = {
  String: 0,
  Number: 1,
  Date: 2,
  DateTime: 4,
  Boolean: 5,
  Uniqueidentifier: 6,
};

function sqlCommand(commandText, connection = undefined) {
  this._commandText = commandText || "";
  this._connection = connection || getConnection();
  this._parameters = [];
  this._executeQueryList = [];
}

//#region === Prototype Prop

sqlCommand.prototype.CommandType = eCommandType.Text;

sqlCommand.prototype.getParameters = function () {
  return this._parameters;
};
sqlCommand.prototype.getExecuteQueryList = function () {
  return this._executeQueryList;
};
//#endregion

//#region === Event
sqlCommand.prototype.clearParameter = function () {
  this._parameters = [];
  this._executeQueryList = [];
};

sqlCommand.prototype.addParameters = function ({ name = "", type = eParameterType.String, value = "" }) {
  if (type === eParameterType.String) {
    this._parameters.push({ name, value: `${value || ""}` });
  }
  if (type === eParameterType.Number) {
    this._parameters.push({ name, value: +value });
  }
  if (type === eParameterType.DateTime) {
    // const newDate = moment(new Date()).format("yyyy-MM-DD HH:mm:ss");
    const newDate = moment(value).format("yyyy-MM-DD HH:mm:ss");
    this._parameters.push({ name, value: `${newDate}` });
  }
  if (type === eParameterType.Date) {
    const newDate = moment(value).format("yyyy-MM-DD");
    this._parameters.push({ name, value: `${newDate}` });
  }
  if (type === eParameterType.Boolean) {
    this._parameters.push({ name, value: value === "true" || value === 1 || value === true });
  }
  if (type === eParameterType.Uniqueidentifier) {
    this._parameters.push({ name, value: value || "00000000-0000-0000-0000-000000000000" });
  }
};

sqlCommand.prototype.ExecuteNonQueryAsync = function () {
  return new Promise((resolve, reject) => {
    let queryString = `${this._commandText} `;

    if (this.CommandType === "text") {
      for (let i = 0; i < this._parameters.length; i++) {
        const p = this._parameters[i];
        queryString = queryString.replace(`${p["name"]}`, `'${p["value"]}'`);
      }
    }

    if (this.CommandType === "proc") {
      const params = this._parameters
        .map((m) => {
          return `${m["name"]}=N'${m["value"]}'`;
        })
        .join(",");
      queryString = `exec ${this._commandText} ${params}`;
    }
    const _rno = this._executeQueryList.length + 1;
    this._executeQueryList.push({ _rno: _rno, query: `${queryString}` });
    // console.log("queryString :>> ", queryString);
    const _value = this._connection.query(`${queryString}`);
    resolve(_value);
  });
};

// sqlCommand.prototype.ExecuteNonQueryAsync = function ({ commandType = eCommandType.Text, commandText = "", params = [] } = {}) {
//   return new Promise((resolve, reject) => {
//     let queryString = `${commandText} `;
//     if (commandType === "proc") {
//       queryString = `exec ${commandText} `;
//     }
//     const _value = this._conn.query(`${queryString}`);
//     resolve(_value);
//   });
// };
//#endregion

export const SqlCommand = sqlCommand;
