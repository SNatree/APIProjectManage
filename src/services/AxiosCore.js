import axios from "axios";
import { stringify } from "querystring";

function useAxios() {
  this.defaultHeaders = { "content-type": "application/x-www-form-urlencoded" };
}

useAxios.prototype.GET = function (url, { query = {}, params = {}, headers = {}, fullURL = true } = {}) {
  //   let resp = null;
  //   try {
  headers = { ...this.defaultHeaders, ...headers }; /**spread operator [ES6]*/
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`; /**Template literals or Template String */
  }

  const options = {
    method: "GET",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
  };
  return axios(options);
  //     (async () => {
  //       resp = await axios(options);
  //     })();
  //   } catch (error) {
  //     resp = error["response"];
  //     // console.log("error", error["response"]["status"]);
  //     // console.log("error", error["response"]["statusText"]);
  //     // console.log("error", error["response"]["data"]);
  //   }
  //   return resp;
};

useAxios.prototype.POST = function (url, { data = {}, query = {}, params = {}, headers = {}, fullURL = true } = {}) {
  headers = { ...this.defaultHeaders, ...headers };
  //   "content-type": "application/json; charset=utf-8;",
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`;
  }
  const options = {
    method: "POST",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
    data,
  };
  // (async () => {
  //   resp = await axios(options);
  // })();
  return axios(options);
};

useAxios.prototype.PUT = function (url, { data = {}, query = {}, params = {}, headers = {}, fullURL = true } = {}) {
  headers = { ...this.defaultHeaders, ...headers };
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`;
  }
  const options = {
    method: "PUT",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
    data,
  };
  return axios(options);
};

useAxios.prototype.PATCH = function (url, { data = {}, query = {}, params = {}, headers = {}, fullURL = true } = {}) {
  headers = { ...this.defaultHeaders, ...headers };
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`;
  }
  const options = {
    method: "PATCH",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
    data,
  };
  return axios(options);
};

useAxios.prototype.DELETE = function (url, { query = {}, params = {}, headers = {}, fullURL = true } = {}) {
  headers = { ...this.defaultHeaders, ...headers };
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`;
  }

  const options = {
    method: "DELETE",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
  };
  return axios(options);
};

useAxios.prototype.DOWNLOAD = function (url, { query = {}, params = {}, headers = {}, responseType = "blob", fullURL = true } = {}) {
  headers = { ...this.defaultHeaders, ...headers }; /**spread operator [ES6]*/
  if (Object.keys(query).length > 0) {
    url = `${url}?${stringify(query)}`; /**Template literals or Template String */
  }

  const options = {
    method: "GET",
    headers: headers,
    url: !fullURL ? `${baseURL}${url}` : `${url}`,
    params,
    responseType: responseType,
  };
  return axios(options);
};

export const uAxios = useAxios;
