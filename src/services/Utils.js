import { v4 as uuidv4, v4 } from "uuid";
import { Connection, getConnection } from "typeorm";
import { SqlCommand, eCommandType, eParameterType } from "./SqlCommand.js";
import { ExtractZipFile } from "./ZipFile.js";
import fs, { rmSync } from "fs";
import path from "path";

export const DateJoin = (t, a, s) => {
  const format = (m) => {
    let f = new Intl.DateTimeFormat("en", m);
    return f.format(t);
  };
  return a.map(format).join(s);
};

export const PadWithZero = (num, targetLength) => {
  return String(num).padStart(targetLength, "0");
};

export const GroupByArr = (arr = [], fieldName = null) => {
  if (fieldName === null) return [];

  const datas = [...arr];
  const groupResult = [];
  for (let i = 0; i < datas.length; i++) {
    const fld = datas[i];
    if (groupResult.filter((f) => f === fld[fieldName]).length === 0) {
      groupResult.push(fld[fieldName]);
    }
  }
  return groupResult;
};

export const GroupByObject = (arr = [], fieldName = null) => {
  if (fieldName === null) return [];

  const datas = [...arr];
  const groupResult = [];
  for (let i = 0; i < datas.length; i++) {
    const fld = datas[i];
    if (groupResult.filter((f) => f[fieldName] === fld[fieldName]).length === 0) {
      groupResult.push({
        [fieldName]: fld[fieldName],
        Count: 1,
      });
    } else {
      groupResult.filter((f) => f[fieldName] === fld[fieldName])[0]["Count"] += 1;
    }
  }
  return groupResult;
};

export const GroupByAndModelObject = (arr = [], keyName = "", fieldSums = [], models = []) => {
  const result = [];
  const fieldSumPrepare = {};
  const extendModel = {};

  for (let i = 0; i < fieldSums.length; i++) {
    const fldName = fieldSums[i];
    fieldSumPrepare[`Sum_${fldName}`] = 0;
  }

  arr.reduce(function (res, value) {
    if (!res[value[keyName]]) {
      models.filter((f) => {
        extendModel[f] = value[f];
      });

      res[value[keyName]] = { [keyName]: value[keyName], ...fieldSumPrepare, ...extendModel, GroupCount: 0 };
      result.push(res[value[keyName]]);
    }

    for (let i = 0; i < fieldSums.length; i++) {
      const fldName = fieldSums[i];
      res[value[keyName]][`Sum_${fldName}`] += value[fldName];
    }
    res[value[keyName]]["GroupCount"] += 1;
    return res;
  }, {});
  return result;
};

export const toLowerKeys = (obj = {}) => {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
};

// export const SQLGenerateParams = (params = []) => {
//   //exec sp_mfc_utils_get_params @procname=''
//   const _parms = params.map((m, i) => `@${m["Parameter_name"]}=@${i}`).join(",");
//   return _parms;
// };

// export const SQLGenerateParmsValue = (obj = {}) => {
//   const _value = Object.values(obj);
//   return _value;
// };

// export const MappingParams = (params = [], mapData = {}) => {
//   //exec sp_mfc_utils_get_params @procname=''
//   const mapping = {};
//   for (let i = 0; i < params.length; i++) {
//     const p = params[i];
//     mapping[`${p["Parameter_name"]}`] = mapData[`${p["Parameter_name"]}`] ?? "";
//   }
//   return mapping;
// };

export const UUIDV4 = () => {
  return uuidv4();
};

export const GenerateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ParamsProcAsync = async (procname = "", connection = undefined) => {
  connection = connection || getConnection();
  try {
    const cmd_u_parm = new SqlCommand("sp_mfc_utils_get_params", connection);
    cmd_u_parm.CommandType = eCommandType.StoredProcedure;
    cmd_u_parm.clearParameter();
    cmd_u_parm.addParameters({ name: "@procname", value: `${procname}` });
    const params = await cmd_u_parm.ExecuteNonQueryAsync();
    return params;
  } catch (error) {
    throw new Error(error);
  }
  return [];
};

export const ExecuteNonQueryAsync = async (commandText = "", commandType = undefined, fields = {}, params = [], connection = undefined) => {
  connection = connection || getConnection();
  if (fields === undefined) {
    throw new Error("Data notfound");
  }

  try {
    const _cmd_exec = new SqlCommand(`${commandText}`, connection);
    _cmd_exec.CommandType = commandType;
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const name = param["Parameter_name"];
      _cmd_exec.addParameters({ name: `@${name}`, type: eParameterType[param["Type"]], value: fields[name] });
    }
    // console.log('paramsMap :>> ', _cmd_exec.getParameters());
    const result = await _cmd_exec.ExecuteNonQueryAsync();
    return result;
  } catch (error) {
    throw new Error(error);
  }
  return [];
};

export const ExecuteArrayAsync = async (commandText = "", commandType = undefined, fields = [], params = [], connection = undefined) => {
  connection = connection || getConnection();
  if (fields === undefined || fields.length === 0) {
    throw new Error("Data notfound");
  }

  try {
    const _cmd_exec = new SqlCommand(`${commandText}`, connection);
    _cmd_exec.CommandType = commandType;

    for (let i = 0; i < fields.length; i++) {
      const fld = fields[i];
      _cmd_exec.clearParameter();
      for (let p = 0; p < params.length; p++) {
        const param = params[p];
        const name = param["Parameter_name"];
        _cmd_exec.addParameters({ name: `@${name}`, type: eParameterType[param["Type"]], value: fld[name] });
      }
      // console.log("params :>> ",i,  _cmd_exec.getParameters());
      // console.log("queryList :>> ",i,  _cmd_exec.getExecuteQueryList());
      await _cmd_exec.ExecuteNonQueryAsync();
    }

    return true;
  } catch (error) {
    throw new Error(error);
  }
  return false;
};

export const ExecuteCombineParamsProc = async (procname = "", fields = {}, connection = undefined) => {
  connection = connection || getConnection();
  try {
    const cmd_u_parm = new SqlCommand("sp_mfc_utils_get_params", connection);
    cmd_u_parm.CommandType = eCommandType.StoredProcedure;
    cmd_u_parm.clearParameter();
    cmd_u_parm.addParameters({ name: "@procname", value: `${procname}` });
    const params = await cmd_u_parm.ExecuteNonQueryAsync();

    let _feilds_param_val = {};
    for (let i = 0; i < params.length; i++) {
      const p = params[i];
      if (Array.isArray(fields[p["Parameter_name"]])) {
        _feilds_param_val[p["Parameter_name"]] = fields[p["Parameter_name"]].join(",").toString();
      } else {
        _feilds_param_val[p["Parameter_name"]] = fields[p["Parameter_name"]];
      }
    }
    // console.log("Utils:line208:_feilds_param_val :>> ", _feilds_param_val);
    const _result = await ExecuteNonQueryAsync(procname, eCommandType.StoredProcedure, _feilds_param_val, params, connection);
    return _result;
  } catch (error) {
    throw new Error(error);
  }
  return [];
};

export const SaveRouteLog = async (error, req, res, connection) => {
  connection = connection || getConnection();
  try {
    const requestStart = Date.now();
    const { method, socket, url, client, cookies, query, originalUrl, headers, protocol } = req;
    const { remoteAddress, remoteFamily, remotePort } = socket;
    // const { statusCode, statusMessage } = res;
    // const headers = res.getHeaders();
    const username = req.headers["x-user-id"] ?? "";
    const newitem = {
      log_title: "Test",
      log_message: `${error.message.replace(/[']/gi, "")}`,
      log_body: JSON.stringify(req.body),
      log_host_scheme: `${protocol}`,
      log_host_host: `${headers["host"]}`,
      log_host_method: `${method}`,
      log_host_path: `${originalUrl}`,
      log_url_query: `${url}`,
      log_url_query_obj: JSON.stringify(query),
      log_client_host: `${remoteAddress}`,
      log_client_family: `${remoteFamily}`,
      log_client_port: `${remotePort}`,
      log_client_cookies: JSON.stringify(cookies),
      username,
    };
    const params = await ParamsProcAsync("sp_mfc_palletizing_logs_save", connection);
    const err_object = await ExecuteNonQueryAsync("sp_mfc_palletizing_logs_save", eCommandType.StoredProcedure, newitem, params, connection);
    return { ...err_object[0], ...newitem };
  } catch (error) {}
  return null;
};

export const RemoveAllFile = (dirPath = "") => {
  const directory = `${dirPath}`;
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      const _dir_path = path.join(directory, file);
      fs.unlink(_dir_path, (err) => {
        if (err) throw err;
      });
    }
  });
};

export const MoveFiles = (sourcePath = "", destPath = "") => {
  const dir_dest_path = destPath;
  if (!fs.existsSync(dir_dest_path)) {
    fs.mkdirSync(dir_dest_path, { recursive: true });
  }

  fs.readdir(sourcePath, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      const _source = path.join(sourcePath, file);
      const _dest = path.join(dir_dest_path, file);

      const split_file = file.split(".");
      if (split_file[1] === "zip") {
        ExtractZipFile({ filePath: _source, targetPath: dir_dest_path });
      } else {
        fs.copyFile(_source, _dest, (err) => {
          if (err) throw err;
        });
      }

      // fs.copyFile(_source, _dest, (err) => {
      //   if (err) throw err;
      // });
    }
  });
};

export const GetFNParams = (func) => {
  var str = func.toString();
  str = str
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/(.)*/g, "")
    .replace(/{[\s\S]*}/, "")
    .replace(/=>/g, "")
    .trim();

  var start = str.indexOf("(") + 1;
  var end = str.length - 1;

  var result = str.substring(start, end).split(", ");

  var params = [];

  result.forEach((element) => {
    // Removing any default value
    element = element.replace(/=[\s\S]*/g, "").trim();

    if (element.length > 0) params.push(element);
  });

  return params;
};
