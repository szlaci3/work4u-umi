let scrolled;

export const isIOS = !!window.navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

// i wanted to use these for errorPopup, now errorPopup is not used (need to implement elimination) . 
// Maybe will use for other popups.  
export const cssAddFixed = () => {
  scrolled = document.scrollingElement.scrollTop;
  document.body.classList.add("fixed-body");
  document.body.style.marginTop = (- scrolled) + "px";
};

export const cssRemoveFixed = () => {
  document.body.classList.remove("fixed-body");
  document.body.style.marginTop = 0;
  document.scrollingElement.scrollTo(0, scrolled);
};

export const hasVal = val => {
  if (val === null || typeof val === "undefined") {
    return false;
  }
  return true;
};

export const toArrayIfPossible = obj => {
  if (typeof obj !== "object" || obj === null || $.isEmptyObject(obj)) {// Only Obj and Arr are processed further
    return obj;
  }
  if ($.isArray(obj)) {
    return obj.map(toArrayIfPossible);
  }
  let isPossible = true;
  for (let key in obj) {
    if (isNaN(Number(key))) {
      isPossible = false;
      break;
    }
  }    
  let ret = isPossible ? [] : {};
  for (let key in obj) {
    if (isPossible) {
      key = Number(key);
    }
    ret[key] = toArrayIfPossible(obj[key]);
  }
  return ret;
};

/* call for normal rounding up/down 
 * (3.005)-> 3.01
 * (3.00499)-> 3.00
 * call with "floor" for rounding down
 * (3.00999, "floor")-> 3
 */
export const toTwoDec = (val, method) => {
  if ((isNaN(val) && typeof val === "number") || !hasVal(val)) { // NaN || null,undefined
    return "";
  }
  if (isNaN(Number(val)) || (typeof val === "string" && val.trim() === "")) { // " " and such are not detected by first condition.
    return val;
  }
  if (method === "floor") {
    return Math.floor(val * 100) / 100;
  }
  return Number(val).toFixed(2);
};

export const sanitizedContent = (html) => {
  // TODO sanitize
  return {__html: html};
}

export const toObject = (arr) => { // not recursive
  if (!$.isArray(arr)) {
    return arr;
  } else {
    return arr.reduce(function(obj, cur, i) {
      obj[i] = cur; //toObject(cur);
      return obj;
    }, {});
  }
};

export const toBool = (val) => {
  switch(String(val).toLowerCase().trim()){
    case "true": case "1": return true;
    case "false": case "0": return false;
    default: return Boolean(val);
  }
};

/* undefined -> ""
 * (0.00) -> 0
 * (3.005)-> 3.01
 * (3.00499)-> 3.00
 * call with "floor" for rounding down
 * (3.00999, "floor")-> 3
 */
export const to0_2Dec = (val, method) => {
  if ((isNaN(val) && typeof val === "number") || !hasVal(val)) {
    return "";
  }
  if (isNaN(Number(val)) || (typeof val === "string" && val.trim() === "")) {
    return val;
  }
  if (method === "floor") {
    return Math.floor(val * 100) / 100;
  }
  return Number(Number(val).toFixed(2));
}

/* "anyString" returns "anyString"
 * .5 returns "50%"
 * if "%" is not wanted, use (100 * window.toTwoDec(val)) . That will display "anyString [%]" if string.
 */
export const toPercent = (val) => {
  if ((isNaN(val) && typeof val === "number") || val === null) {
    return "";
  }
  if (isNaN(Number(val)) || (typeof val === "string" && val.trim() === "")) {
    return val;
  }
  return (100 * val).toFixed(2) + "%";
}

export const toPercent0_4Dec = (val) => {
  // possible outputs: 9 0.1 0.22 0.333 0.4444
  if ((isNaN(val) && typeof val === "number") || val === null) {
    return "";
  }
  if (isNaN(Number(val)) || (typeof val === "string" && val.trim() === "")) {
    return val;
  }
  return Math.round(val * 1000000)/10000;// avoids most precision errors
}

export const toPercent2_4Dec = (val) => {
  // possible outputs: 9.00 0.10 0.22 0.333 0.4444
  if ((isNaN(val) && typeof val === "number") || val === null) {
    return "";
  }
  if (isNaN(Number(val)) || (typeof val === "string" && val.trim() === "")) {
    return val;
  }
  var ret = Math.round(val * 1000000)/10000;
  var decimals = String(ret).split(".")[1];
  if (!hasVal(decimals) || decimals.length < 2) {
    ret = ret.toFixed(2);
  }
  return ret;
}

export const formatDate = (date) => {//2020-04-9
  return date ? date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getDate() : "";  
}
export const formatDate0000 = (date) => {//2020-04-09
  return date ? date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2) : "";  
}
export const formatTime = (date) => {
  return date ? date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) : "";
}

export const animatedScroll = (element, parent, time) => { // for MMarketProduct tab switch
  // var parentPosition = $(parent).scrollTop() ;
  // var b = $(element)[0].offsetTop;
  // var c = $(parent)[0].offsetTop;

  $(parent).animate({
      scrollTop: $(element)[0].offsetTop - $(parent)[0].offsetTop,
    }, time, "swing");
}

export const noWhiteSpace = (str) => {// for URLs in location.search, especially chinese
  return str.split(" ").join("").split("/").join("");
}

export const avoidDoubleArrow = !!navigator.platform && !/iPad|iPhone|iPod/.test(navigator.platform) &&
      navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1; // WeChat browser running on non-iOS




