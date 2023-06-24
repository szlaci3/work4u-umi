import request from 'umi-request';
import { notification } from 'antd';
import { history } from 'umi';
import hash from 'hash.js';

/**
 * Requests a URL, returning a promise.
 *
 */
export default function myRequest(
  urlArg,
  body = {},
  addToken = true,
  method = 'POST',
  directErrorHandling = true,
  urlMain = flxUrl,
  plain = false,
) {
  let url = urlMain + urlArg;
  const defaultOptions = {
    method,
  };
  const newOptions = { ...defaultOptions, body: body };

  if (addToken) {
    newOptions.headers = {Authorization: "Bearer " + sessionStorage.getItem('logintoken') || ''};
  }

  if (method === 'GET') {
    newOptions.method = 'GET';
    let urlSearch = '';
    Object.keys(newOptions.body).map((param, i) => {
      let val = newOptions.body[param];
      if (val !== null && typeof val !== "undefined") {
        urlSearch += `${i ? '&' : ''}${param}=${newOptions.body[param]}`; // i ? (Whether not 0)
      }
      return 0;
    });
    url += `?${urlSearch}`;
    delete newOptions.body;
  } else if (!plain) {
    let bodyFormData = new FormData();
    for (let i in body) {
      bodyFormData.append(i, body[i]);
    }
    newOptions.body = bodyFormData;
  }
  const fingerprint = url + JSON.stringify(newOptions.body || body);
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  if (!(newOptions.body instanceof FormData) && method !== 'GET') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
  } else {
    newOptions.headers = {
      Accept: 'application/json',
      ...newOptions.headers,
    };
  }

  return request(url, newOptions)
    .then(response => {
      if (response.code === -1) {
        if (url !== flxUrl + "/Common/logout") {
          sessionStorage.setItem("loginExpired", "1");
        }
        sessionStorage.removeItem("logintoken");
        if (location.hash !== "#/login") {
          sessionStorage.setItem("afterLogin", location.hash.replace("#", ""));
        }
        history.push('/login');
      } else if (directErrorHandling && response.code === 0) {
        notification.warn({
          className: "erm",
          message: response.msg,
          duration: 0,
        });
      } else {
        return response;
      }
    })
    .catch(e => {
      const status = e.name;
      if (status === "TypeError") { // user may be offline
        notification.warn({
          className: "erm",
          message: `请求错误`,
          duration: 0,
        });
      }
    });
}