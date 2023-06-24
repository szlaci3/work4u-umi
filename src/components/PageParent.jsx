import React from 'react';
import { history } from 'umi';
import { notification } from 'antd';

class PageParent extends React.Component {
  checkLoginToken(callback) {
    if (sessionStorage.logintoken) {
      if (callback) {
        callback();
      }
    } else {
      this.loginAndReturn();
    }
  }

  loginAndReturn() {// can be called also directly
    notification.warn({
      className: "erm",
      message: "请登录~",
      duration: 3,
    });
    sessionStorage.setItem("afterLogin", location.hash.replace("#", ""));
    history.push("/login");
  }

  htmlDecode(s) {
    // use this when sanitizedContent can't be used because the string is an input value.
    let el = document.createElement("div");
    el.innerHTML = s || "";
    s = el.innerText;
    return s;
  }
}

export default PageParent;