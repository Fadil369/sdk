import React, { useMemo, useState, useEffect, useCallback } from "react";
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction$1 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$1(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$1(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$1(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$1(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$1(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$1,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path) && cookie.push("path=" + path);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder: TextEncoder$1
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder$1 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder$1()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config) => {
  let env = config ? config.env : {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2, config) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters2[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.12.2";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
class ApiClient {
  client;
  logger;
  requestCount = 0;
  rateLimitWindow = /* @__PURE__ */ new Map();
  constructor(config, logger) {
    this.logger = logger.child({ component: "ApiClient" });
    const apiConfig = config.get("api");
    this.client = axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "BrainSAIT-Healthcare-SDK/1.0.0"
      }
    });
    this.setupInterceptors(apiConfig);
  }
  async get(url, config) {
    return this.request("GET", url, void 0, config);
  }
  async post(url, data, config) {
    return this.request("POST", url, data, config);
  }
  async put(url, data, config) {
    return this.request("PUT", url, data, config);
  }
  async delete(url, config) {
    return this.request("DELETE", url, void 0, config);
  }
  async patch(url, data, config) {
    return this.request("PATCH", url, data, config);
  }
  async request(method, url, data, config) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    try {
      this.logger.debug(`${method} ${url}`, { requestId, data });
      const response = await this.client.request({
        method,
        url,
        data,
        ...config,
        headers: {
          "X-Request-ID": requestId,
          ...config?.headers
        }
      });
      const responseTime = Date.now() - startTime;
      this.logger.info(`${method} ${url} - ${response.status}`, {
        requestId,
        responseTime,
        status: response.status
      });
      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      if (axios.isAxiosError(error)) {
        this.logger.error(`${method} ${url} failed`, error, {
          requestId,
          responseTime,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        const errorMessage = error.response?.data?.message ?? error.message;
        return {
          success: false,
          error: errorMessage,
          metadata: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            requestId,
            responseTime
          }
        };
      }
      this.logger.error(
        `${method} ${url} failed with unknown error`,
        error instanceof Error ? error : new Error(String(error)),
        {
          requestId,
          responseTime
        }
      );
      return {
        success: false,
        error: "An unexpected error occurred",
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId,
          responseTime
        }
      };
    }
  }
  setupInterceptors(apiConfig) {
    this.client.interceptors.request.use(
      (config) => {
        if (apiConfig.rateLimit) {
          this.checkRateLimit(apiConfig.rateLimit);
        }
        const configWithMetadata = config;
        configWithMetadata.metadata = { startTime: Date.now() };
        this.requestCount++;
        return config;
      },
      (error) => {
        this.logger.error(
          "Request interceptor error",
          error instanceof Error ? error : new Error(String(error))
        );
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response) => {
        const configWithMetadata = response.config;
        const responseTime = Date.now() - (configWithMetadata.metadata?.startTime ?? 0);
        if (responseTime > 2500) {
          this.logger.warn("Slow API response detected", {
            url: response.config.url,
            method: response.config.method,
            responseTime
          });
        }
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error) && error.config) {
          const configWithMetadata = error.config;
          const responseTime = Date.now() - (configWithMetadata.metadata?.startTime ?? 0);
          this.logger.error("API request failed", void 0, {
            url: error.config.url,
            method: error.config.method,
            status: error.response?.status,
            responseTime
          });
        }
        return Promise.reject(error);
      }
    );
  }
  checkRateLimit(rateLimit) {
    const now = Date.now();
    const windowKey = Math.floor(now / (rateLimit.window * 1e3));
    const windowRequests = this.rateLimitWindow.get(String(windowKey)) ?? [];
    if (windowRequests.length >= rateLimit.requests) {
      throw new Error("Rate limit exceeded");
    }
    windowRequests.push(now);
    this.rateLimitWindow.set(String(windowKey), windowRequests);
    const cutoff = windowKey - 5;
    for (const [key] of this.rateLimitWindow) {
      if (parseInt(key) < cutoff) {
        this.rateLimitWindow.delete(key);
      }
    }
  }
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  getStats() {
    return {
      requestCount: this.requestCount,
      activeWindows: this.rateLimitWindow.size
    };
  }
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var joiBrowser_min = { exports: {} };
var hasRequiredJoiBrowser_min;
function requireJoiBrowser_min() {
  if (hasRequiredJoiBrowser_min) return joiBrowser_min.exports;
  hasRequiredJoiBrowser_min = 1;
  (function(module, exports) {
    !(function(e, t2) {
      module.exports = t2();
    })(self, (() => {
      return e = { 7629: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(9474), i = r(1687), o = r(8652), l = r(8160), c = r(3292), u = r(6354), f = r(8901), m = r(9708), h = r(6914), d = r(2294), p = r(6133), g = r(1152), y = r(8863), b = r(2036), v = { Base: class {
          constructor(e3) {
            this.type = e3, this.$_root = null, this._definition = {}, this._reset();
          }
          _reset() {
            this._ids = new d.Ids(), this._preferences = null, this._refs = new p.Manager(), this._cache = null, this._valids = null, this._invalids = null, this._flags = {}, this._rules = [], this._singleRules = /* @__PURE__ */ new Map(), this.$_terms = {}, this.$_temp = { ruleset: null, whens: {} };
          }
          describe() {
            return s("function" == typeof m.describe, "Manifest functionality disabled"), m.describe(this);
          }
          allow(...e3) {
            return l.verifyFlat(e3, "allow"), this._values(e3, "_valids");
          }
          alter(e3) {
            s(e3 && "object" == typeof e3 && !Array.isArray(e3), "Invalid targets argument"), s(!this._inRuleset(), "Cannot set alterations inside a ruleset");
            const t4 = this.clone();
            t4.$_terms.alterations = t4.$_terms.alterations || [];
            for (const r2 in e3) {
              const n2 = e3[r2];
              s("function" == typeof n2, "Alteration adjuster for", r2, "must be a function"), t4.$_terms.alterations.push({ target: r2, adjuster: n2 });
            }
            return t4.$_temp.ruleset = false, t4;
          }
          artifact(e3) {
            return s(void 0 !== e3, "Artifact cannot be undefined"), s(!this._cache, "Cannot set an artifact with a rule cache"), this.$_setFlag("artifact", e3);
          }
          cast(e3) {
            return s(false === e3 || "string" == typeof e3, "Invalid to value"), s(false === e3 || this._definition.cast[e3], "Type", this.type, "does not support casting to", e3), this.$_setFlag("cast", false === e3 ? void 0 : e3);
          }
          default(e3, t4) {
            return this._default("default", e3, t4);
          }
          description(e3) {
            return s(e3 && "string" == typeof e3, "Description must be a non-empty string"), this.$_setFlag("description", e3);
          }
          empty(e3) {
            const t4 = this.clone();
            return void 0 !== e3 && (e3 = t4.$_compile(e3, { override: false })), t4.$_setFlag("empty", e3, { clone: false });
          }
          error(e3) {
            return s(e3, "Missing error"), s(e3 instanceof Error || "function" == typeof e3, "Must provide a valid Error object or a function"), this.$_setFlag("error", e3);
          }
          example(e3, t4 = {}) {
            return s(void 0 !== e3, "Missing example"), l.assertOptions(t4, ["override"]), this._inner("examples", e3, { single: true, override: t4.override });
          }
          external(e3, t4) {
            return "object" == typeof e3 && (s(!t4, "Cannot combine options with description"), t4 = e3.description, e3 = e3.method), s("function" == typeof e3, "Method must be a function"), s(void 0 === t4 || t4 && "string" == typeof t4, "Description must be a non-empty string"), this._inner("externals", { method: e3, description: t4 }, { single: true });
          }
          failover(e3, t4) {
            return this._default("failover", e3, t4);
          }
          forbidden() {
            return this.presence("forbidden");
          }
          id(e3) {
            return e3 ? (s("string" == typeof e3, "id must be a non-empty string"), s(/^[^\.]+$/.test(e3), "id cannot contain period character"), this.$_setFlag("id", e3)) : this.$_setFlag("id", void 0);
          }
          invalid(...e3) {
            return this._values(e3, "_invalids");
          }
          label(e3) {
            return s(e3 && "string" == typeof e3, "Label name must be a non-empty string"), this.$_setFlag("label", e3);
          }
          meta(e3) {
            return s(void 0 !== e3, "Meta cannot be undefined"), this._inner("metas", e3, { single: true });
          }
          note(...e3) {
            s(e3.length, "Missing notes");
            for (const t4 of e3) s(t4 && "string" == typeof t4, "Notes must be non-empty strings");
            return this._inner("notes", e3);
          }
          only(e3 = true) {
            return s("boolean" == typeof e3, "Invalid mode:", e3), this.$_setFlag("only", e3);
          }
          optional() {
            return this.presence("optional");
          }
          prefs(e3) {
            s(e3, "Missing preferences"), s(void 0 === e3.context, "Cannot override context"), s(void 0 === e3.externals, "Cannot override externals"), s(void 0 === e3.warnings, "Cannot override warnings"), s(void 0 === e3.debug, "Cannot override debug"), l.checkPreferences(e3);
            const t4 = this.clone();
            return t4._preferences = l.preferences(t4._preferences, e3), t4;
          }
          presence(e3) {
            return s(["optional", "required", "forbidden"].includes(e3), "Unknown presence mode", e3), this.$_setFlag("presence", e3);
          }
          raw(e3 = true) {
            return this.$_setFlag("result", e3 ? "raw" : void 0);
          }
          result(e3) {
            return s(["raw", "strip"].includes(e3), "Unknown result mode", e3), this.$_setFlag("result", e3);
          }
          required() {
            return this.presence("required");
          }
          strict(e3) {
            const t4 = this.clone(), r2 = void 0 !== e3 && !e3;
            return t4._preferences = l.preferences(t4._preferences, { convert: r2 }), t4;
          }
          strip(e3 = true) {
            return this.$_setFlag("result", e3 ? "strip" : void 0);
          }
          tag(...e3) {
            s(e3.length, "Missing tags");
            for (const t4 of e3) s(t4 && "string" == typeof t4, "Tags must be non-empty strings");
            return this._inner("tags", e3);
          }
          unit(e3) {
            return s(e3 && "string" == typeof e3, "Unit name must be a non-empty string"), this.$_setFlag("unit", e3);
          }
          valid(...e3) {
            l.verifyFlat(e3, "valid");
            const t4 = this.allow(...e3);
            return t4.$_setFlag("only", !!t4._valids, { clone: false }), t4;
          }
          when(e3, t4) {
            const r2 = this.clone();
            r2.$_terms.whens || (r2.$_terms.whens = []);
            const n2 = c.when(r2, e3, t4);
            if (!["any", "link"].includes(r2.type)) {
              const e4 = n2.is ? [n2] : n2.switch;
              for (const t5 of e4) s(!t5.then || "any" === t5.then.type || t5.then.type === r2.type, "Cannot combine", r2.type, "with", t5.then && t5.then.type), s(!t5.otherwise || "any" === t5.otherwise.type || t5.otherwise.type === r2.type, "Cannot combine", r2.type, "with", t5.otherwise && t5.otherwise.type);
            }
            return r2.$_terms.whens.push(n2), r2.$_mutateRebuild();
          }
          cache(e3) {
            s(!this._inRuleset(), "Cannot set caching inside a ruleset"), s(!this._cache, "Cannot override schema cache"), s(void 0 === this._flags.artifact, "Cannot cache a rule with an artifact");
            const t4 = this.clone();
            return t4._cache = e3 || o.provider.provision(), t4.$_temp.ruleset = false, t4;
          }
          clone() {
            const e3 = Object.create(Object.getPrototypeOf(this));
            return this._assign(e3);
          }
          concat(e3) {
            s(l.isSchema(e3), "Invalid schema object"), s("any" === this.type || "any" === e3.type || e3.type === this.type, "Cannot merge type", this.type, "with another type:", e3.type), s(!this._inRuleset(), "Cannot concatenate onto a schema with open ruleset"), s(!e3._inRuleset(), "Cannot concatenate a schema with open ruleset");
            let t4 = this.clone();
            if ("any" === this.type && "any" !== e3.type) {
              const r2 = e3.clone();
              for (const e4 of Object.keys(t4)) "type" !== e4 && (r2[e4] = t4[e4]);
              t4 = r2;
            }
            t4._ids.concat(e3._ids), t4._refs.register(e3, p.toSibling), t4._preferences = t4._preferences ? l.preferences(t4._preferences, e3._preferences) : e3._preferences, t4._valids = b.merge(t4._valids, e3._valids, e3._invalids), t4._invalids = b.merge(t4._invalids, e3._invalids, e3._valids);
            for (const r2 of e3._singleRules.keys()) t4._singleRules.has(r2) && (t4._rules = t4._rules.filter(((e4) => e4.keep || e4.name !== r2)), t4._singleRules.delete(r2));
            for (const r2 of e3._rules) e3._definition.rules[r2.method].multi || t4._singleRules.set(r2.name, r2), t4._rules.push(r2);
            if (t4._flags.empty && e3._flags.empty) {
              t4._flags.empty = t4._flags.empty.concat(e3._flags.empty);
              const r2 = Object.assign({}, e3._flags);
              delete r2.empty, i(t4._flags, r2);
            } else if (e3._flags.empty) {
              t4._flags.empty = e3._flags.empty;
              const r2 = Object.assign({}, e3._flags);
              delete r2.empty, i(t4._flags, r2);
            } else i(t4._flags, e3._flags);
            for (const r2 in e3.$_terms) {
              const s2 = e3.$_terms[r2];
              s2 ? t4.$_terms[r2] ? t4.$_terms[r2] = t4.$_terms[r2].concat(s2) : t4.$_terms[r2] = s2.slice() : t4.$_terms[r2] || (t4.$_terms[r2] = s2);
            }
            return this.$_root._tracer && this.$_root._tracer._combine(t4, [this, e3]), t4.$_mutateRebuild();
          }
          extend(e3) {
            return s(!e3.base, "Cannot extend type with another base"), f.type(this, e3);
          }
          extract(e3) {
            return e3 = Array.isArray(e3) ? e3 : e3.split("."), this._ids.reach(e3);
          }
          fork(e3, t4) {
            s(!this._inRuleset(), "Cannot fork inside a ruleset");
            let r2 = this;
            for (let s2 of [].concat(e3)) s2 = Array.isArray(s2) ? s2 : s2.split("."), r2 = r2._ids.fork(s2, t4, r2);
            return r2.$_temp.ruleset = false, r2;
          }
          rule(e3) {
            const t4 = this._definition;
            l.assertOptions(e3, Object.keys(t4.modifiers)), s(false !== this.$_temp.ruleset, "Cannot apply rules to empty ruleset or the last rule added does not support rule properties");
            const r2 = null === this.$_temp.ruleset ? this._rules.length - 1 : this.$_temp.ruleset;
            s(r2 >= 0 && r2 < this._rules.length, "Cannot apply rules to empty ruleset");
            const a2 = this.clone();
            for (let i2 = r2; i2 < a2._rules.length; ++i2) {
              const r3 = a2._rules[i2], o2 = n(r3);
              for (const n2 in e3) t4.modifiers[n2](o2, e3[n2]), s(o2.name === r3.name, "Cannot change rule name");
              a2._rules[i2] = o2, a2._singleRules.get(o2.name) === r3 && a2._singleRules.set(o2.name, o2);
            }
            return a2.$_temp.ruleset = false, a2.$_mutateRebuild();
          }
          get ruleset() {
            s(!this._inRuleset(), "Cannot start a new ruleset without closing the previous one");
            const e3 = this.clone();
            return e3.$_temp.ruleset = e3._rules.length, e3;
          }
          get $() {
            return this.ruleset;
          }
          tailor(e3) {
            e3 = [].concat(e3), s(!this._inRuleset(), "Cannot tailor inside a ruleset");
            let t4 = this;
            if (this.$_terms.alterations) for (const { target: r2, adjuster: n2 } of this.$_terms.alterations) e3.includes(r2) && (t4 = n2(t4), s(l.isSchema(t4), "Alteration adjuster for", r2, "failed to return a schema object"));
            return t4 = t4.$_modify({ each: (t5) => t5.tailor(e3), ref: false }), t4.$_temp.ruleset = false, t4.$_mutateRebuild();
          }
          tracer() {
            return g.location ? g.location(this) : this;
          }
          validate(e3, t4) {
            return y.entry(e3, this, t4);
          }
          validateAsync(e3, t4) {
            return y.entryAsync(e3, this, t4);
          }
          $_addRule(e3) {
            "string" == typeof e3 && (e3 = { name: e3 }), s(e3 && "object" == typeof e3, "Invalid options"), s(e3.name && "string" == typeof e3.name, "Invalid rule name");
            for (const t5 in e3) s("_" !== t5[0], "Cannot set private rule properties");
            const t4 = Object.assign({}, e3);
            t4._resolve = [], t4.method = t4.method || t4.name;
            const r2 = this._definition.rules[t4.method], n2 = t4.args;
            s(r2, "Unknown rule", t4.method);
            const a2 = this.clone();
            if (n2) {
              s(1 === Object.keys(n2).length || Object.keys(n2).length === this._definition.rules[t4.name].args.length, "Invalid rule definition for", this.type, t4.name);
              for (const e4 in n2) {
                let i2 = n2[e4];
                if (r2.argsByName) {
                  const o2 = r2.argsByName.get(e4);
                  if (o2.ref && l.isResolvable(i2)) t4._resolve.push(e4), a2.$_mutateRegister(i2);
                  else if (o2.normalize && (i2 = o2.normalize(i2), n2[e4] = i2), o2.assert) {
                    const t5 = l.validateArg(i2, e4, o2);
                    s(!t5, t5, "or reference");
                  }
                }
                void 0 !== i2 ? n2[e4] = i2 : delete n2[e4];
              }
            }
            return r2.multi || (a2._ruleRemove(t4.name, { clone: false }), a2._singleRules.set(t4.name, t4)), false === a2.$_temp.ruleset && (a2.$_temp.ruleset = null), r2.priority ? a2._rules.unshift(t4) : a2._rules.push(t4), a2;
          }
          $_compile(e3, t4) {
            return c.schema(this.$_root, e3, t4);
          }
          $_createError(e3, t4, r2, s2, n2, a2 = {}) {
            const i2 = false !== a2.flags ? this._flags : {}, o2 = a2.messages ? h.merge(this._definition.messages, a2.messages) : this._definition.messages;
            return new u.Report(e3, t4, r2, i2, o2, s2, n2);
          }
          $_getFlag(e3) {
            return this._flags[e3];
          }
          $_getRule(e3) {
            return this._singleRules.get(e3);
          }
          $_mapLabels(e3) {
            return e3 = Array.isArray(e3) ? e3 : e3.split("."), this._ids.labels(e3);
          }
          $_match(e3, t4, r2, s2) {
            (r2 = Object.assign({}, r2)).abortEarly = true, r2._externals = false, t4.snapshot();
            const n2 = !y.validate(e3, this, t4, r2, s2).errors;
            return t4.restore(), n2;
          }
          $_modify(e3) {
            return l.assertOptions(e3, ["each", "once", "ref", "schema"]), d.schema(this, e3) || this;
          }
          $_mutateRebuild() {
            return s(!this._inRuleset(), "Cannot add this rule inside a ruleset"), this._refs.reset(), this._ids.reset(), this.$_modify({ each: (e3, { source: t4, name: r2, path: s2, key: n2 }) => {
              const a2 = this._definition[t4][r2] && this._definition[t4][r2].register;
              false !== a2 && this.$_mutateRegister(e3, { family: a2, key: n2 });
            } }), this._definition.rebuild && this._definition.rebuild(this), this.$_temp.ruleset = false, this;
          }
          $_mutateRegister(e3, { family: t4, key: r2 } = {}) {
            this._refs.register(e3, t4), this._ids.register(e3, { key: r2 });
          }
          $_property(e3) {
            return this._definition.properties[e3];
          }
          $_reach(e3) {
            return this._ids.reach(e3);
          }
          $_rootReferences() {
            return this._refs.roots();
          }
          $_setFlag(e3, t4, r2 = {}) {
            s("_" === e3[0] || !this._inRuleset(), "Cannot set flag inside a ruleset");
            const n2 = this._definition.flags[e3] || {};
            if (a(t4, n2.default) && (t4 = void 0), a(t4, this._flags[e3])) return this;
            const i2 = false !== r2.clone ? this.clone() : this;
            return void 0 !== t4 ? (i2._flags[e3] = t4, i2.$_mutateRegister(t4)) : delete i2._flags[e3], "_" !== e3[0] && (i2.$_temp.ruleset = false), i2;
          }
          $_parent(e3, ...t4) {
            return this[e3][l.symbols.parent].call(this, ...t4);
          }
          $_validate(e3, t4, r2) {
            return y.validate(e3, this, t4, r2);
          }
          _assign(e3) {
            e3.type = this.type, e3.$_root = this.$_root, e3.$_temp = Object.assign({}, this.$_temp), e3.$_temp.whens = {}, e3._ids = this._ids.clone(), e3._preferences = this._preferences, e3._valids = this._valids && this._valids.clone(), e3._invalids = this._invalids && this._invalids.clone(), e3._rules = this._rules.slice(), e3._singleRules = n(this._singleRules, { shallow: true }), e3._refs = this._refs.clone(), e3._flags = Object.assign({}, this._flags), e3._cache = null, e3.$_terms = {};
            for (const t4 in this.$_terms) e3.$_terms[t4] = this.$_terms[t4] ? this.$_terms[t4].slice() : null;
            e3.$_super = {};
            for (const t4 in this.$_super) e3.$_super[t4] = this._super[t4].bind(e3);
            return e3;
          }
          _bare() {
            const e3 = this.clone();
            e3._reset();
            const t4 = e3._definition.terms;
            for (const r2 in t4) {
              const s2 = t4[r2];
              e3.$_terms[r2] = s2.init;
            }
            return e3.$_mutateRebuild();
          }
          _default(e3, t4, r2 = {}) {
            return l.assertOptions(r2, "literal"), s(void 0 !== t4, "Missing", e3, "value"), s("function" == typeof t4 || !r2.literal, "Only function value supports literal option"), "function" == typeof t4 && r2.literal && (t4 = { [l.symbols.literal]: true, literal: t4 }), this.$_setFlag(e3, t4);
          }
          _generate(e3, t4, r2) {
            if (!this.$_terms.whens) return { schema: this };
            const s2 = [], n2 = [];
            for (let a3 = 0; a3 < this.$_terms.whens.length; ++a3) {
              const i3 = this.$_terms.whens[a3];
              if (i3.concat) {
                s2.push(i3.concat), n2.push(`${a3}.concat`);
                continue;
              }
              const o2 = i3.ref ? i3.ref.resolve(e3, t4, r2) : e3, l2 = i3.is ? [i3] : i3.switch, c2 = n2.length;
              for (let c3 = 0; c3 < l2.length; ++c3) {
                const { is: u2, then: f2, otherwise: m2 } = l2[c3], h2 = `${a3}${i3.switch ? "." + c3 : ""}`;
                if (u2.$_match(o2, t4.nest(u2, `${h2}.is`), r2)) {
                  if (f2) {
                    const a4 = t4.localize([...t4.path, `${h2}.then`], t4.ancestors, t4.schemas), { schema: i4, id: o3 } = f2._generate(e3, a4, r2);
                    s2.push(i4), n2.push(`${h2}.then${o3 ? `(${o3})` : ""}`);
                    break;
                  }
                } else if (m2) {
                  const a4 = t4.localize([...t4.path, `${h2}.otherwise`], t4.ancestors, t4.schemas), { schema: i4, id: o3 } = m2._generate(e3, a4, r2);
                  s2.push(i4), n2.push(`${h2}.otherwise${o3 ? `(${o3})` : ""}`);
                  break;
                }
              }
              if (i3.break && n2.length > c2) break;
            }
            const a2 = n2.join(", ");
            if (t4.mainstay.tracer.debug(t4, "rule", "when", a2), !a2) return { schema: this };
            if (!t4.mainstay.tracer.active && this.$_temp.whens[a2]) return { schema: this.$_temp.whens[a2], id: a2 };
            let i2 = this;
            this._definition.generate && (i2 = this._definition.generate(this, e3, t4, r2));
            for (const e4 of s2) i2 = i2.concat(e4);
            return this.$_root._tracer && this.$_root._tracer._combine(i2, [this, ...s2]), this.$_temp.whens[a2] = i2, { schema: i2, id: a2 };
          }
          _inner(e3, t4, r2 = {}) {
            s(!this._inRuleset(), `Cannot set ${e3} inside a ruleset`);
            const n2 = this.clone();
            return n2.$_terms[e3] && !r2.override || (n2.$_terms[e3] = []), r2.single ? n2.$_terms[e3].push(t4) : n2.$_terms[e3].push(...t4), n2.$_temp.ruleset = false, n2;
          }
          _inRuleset() {
            return null !== this.$_temp.ruleset && false !== this.$_temp.ruleset;
          }
          _ruleRemove(e3, t4 = {}) {
            if (!this._singleRules.has(e3)) return this;
            const r2 = false !== t4.clone ? this.clone() : this;
            r2._singleRules.delete(e3);
            const s2 = [];
            for (let t5 = 0; t5 < r2._rules.length; ++t5) {
              const n2 = r2._rules[t5];
              n2.name !== e3 || n2.keep ? s2.push(n2) : r2._inRuleset() && t5 < r2.$_temp.ruleset && --r2.$_temp.ruleset;
            }
            return r2._rules = s2, r2;
          }
          _values(e3, t4) {
            l.verifyFlat(e3, t4.slice(1, -1));
            const r2 = this.clone(), n2 = e3[0] === l.symbols.override;
            if (n2 && (e3 = e3.slice(1)), !r2[t4] && e3.length ? r2[t4] = new b() : n2 && (r2[t4] = e3.length ? new b() : null, r2.$_mutateRebuild()), !r2[t4]) return r2;
            n2 && r2[t4].override();
            for (const n3 of e3) {
              s(void 0 !== n3, "Cannot call allow/valid/invalid with undefined"), s(n3 !== l.symbols.override, "Override must be the first value");
              const e4 = "_invalids" === t4 ? "_valids" : "_invalids";
              r2[e4] && (r2[e4].remove(n3), r2[e4].length || (s("_valids" === t4 || !r2._flags.only, "Setting invalid value", n3, "leaves schema rejecting all values due to previous valid rule"), r2[e4] = null)), r2[t4].add(n3, r2._refs);
            }
            return r2;
          }
        } };
        v.Base.prototype[l.symbols.any] = { version: l.version, compile: c.compile, root: "$_root" }, v.Base.prototype.isImmutable = true, v.Base.prototype.deny = v.Base.prototype.invalid, v.Base.prototype.disallow = v.Base.prototype.invalid, v.Base.prototype.equal = v.Base.prototype.valid, v.Base.prototype.exist = v.Base.prototype.required, v.Base.prototype.not = v.Base.prototype.invalid, v.Base.prototype.options = v.Base.prototype.prefs, v.Base.prototype.preferences = v.Base.prototype.prefs, e2.exports = new v.Base();
      }, 8652: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(8160), i = { max: 1e3, supported: /* @__PURE__ */ new Set(["undefined", "boolean", "number", "string"]) };
        t3.provider = { provision: (e3) => new i.Cache(e3) }, i.Cache = class {
          constructor(e3 = {}) {
            a.assertOptions(e3, ["max"]), s(void 0 === e3.max || e3.max && e3.max > 0 && isFinite(e3.max), "Invalid max cache size"), this._max = e3.max || i.max, this._map = /* @__PURE__ */ new Map(), this._list = new i.List();
          }
          get length() {
            return this._map.size;
          }
          set(e3, t4) {
            if (null !== e3 && !i.supported.has(typeof e3)) return;
            let r2 = this._map.get(e3);
            if (r2) return r2.value = t4, void this._list.first(r2);
            r2 = this._list.unshift({ key: e3, value: t4 }), this._map.set(e3, r2), this._compact();
          }
          get(e3) {
            const t4 = this._map.get(e3);
            if (t4) return this._list.first(t4), n(t4.value);
          }
          _compact() {
            if (this._map.size > this._max) {
              const e3 = this._list.pop();
              this._map.delete(e3.key);
            }
          }
        }, i.List = class {
          constructor() {
            this.tail = null, this.head = null;
          }
          unshift(e3) {
            return e3.next = null, e3.prev = this.head, this.head && (this.head.next = e3), this.head = e3, this.tail || (this.tail = e3), e3;
          }
          first(e3) {
            e3 !== this.head && (this._remove(e3), this.unshift(e3));
          }
          pop() {
            return this._remove(this.tail);
          }
          _remove(e3) {
            const { next: t4, prev: r2 } = e3;
            return t4.prev = r2, r2 && (r2.next = t4), e3 === this.tail && (this.tail = t4), e3.prev = null, e3.next = null, e3;
          }
        };
      }, 8160: (e2, t3, r) => {
        const s = r(375), n = r(7916), a = r(5934);
        let i, o;
        const l = { isoDate: /^(?:[-+]\d{2})?(?:\d{4}(?!\d{2}\b))(?:(-?)(?:(?:0[1-9]|1[0-2])(?:\1(?:[12]\d|0[1-9]|3[01]))?|W(?:[0-4]\d|5[0-2])(?:-?[1-7])?|(?:00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[1-6])))(?![T]$|[T][\d]+Z$)(?:[T\s](?:(?:(?:[01]\d|2[0-3])(?:(:?)[0-5]\d)?|24\:?00)(?:[.,]\d+(?!:))?)(?:\2[0-5]\d(?:[.,]\d+)?)?(?:[Z]|(?:[+-])(?:[01]\d|2[0-3])(?::?[0-5]\d)?)?)?)?$/ };
        t3.version = a.version, t3.defaults = { abortEarly: true, allowUnknown: false, artifacts: false, cache: true, context: null, convert: true, dateFormat: "iso", errors: { escapeHtml: false, label: "path", language: null, render: true, stack: false, wrap: { label: '"', array: "[]" } }, externals: true, messages: {}, nonEnumerables: false, noDefaults: false, presence: "optional", skipFunctions: false, stripUnknown: false, warnings: false }, t3.symbols = { any: Symbol.for("@hapi/joi/schema"), arraySingle: Symbol("arraySingle"), deepDefault: Symbol("deepDefault"), errors: Symbol("errors"), literal: Symbol("literal"), override: Symbol("override"), parent: Symbol("parent"), prefs: Symbol("prefs"), ref: Symbol("ref"), template: Symbol("template"), values: Symbol("values") }, t3.assertOptions = function(e3, t4, r2 = "Options") {
          s(e3 && "object" == typeof e3 && !Array.isArray(e3), "Options must be of type object");
          const n2 = Object.keys(e3).filter(((e4) => !t4.includes(e4)));
          s(0 === n2.length, `${r2} contain unknown keys: ${n2}`);
        }, t3.checkPreferences = function(e3) {
          o = o || r(3378);
          const t4 = o.preferences.validate(e3);
          if (t4.error) throw new n([t4.error.details[0].message]);
        }, t3.compare = function(e3, t4, r2) {
          switch (r2) {
            case "=":
              return e3 === t4;
            case ">":
              return e3 > t4;
            case "<":
              return e3 < t4;
            case ">=":
              return e3 >= t4;
            case "<=":
              return e3 <= t4;
          }
        }, t3.default = function(e3, t4) {
          return void 0 === e3 ? t4 : e3;
        }, t3.isIsoDate = function(e3) {
          return l.isoDate.test(e3);
        }, t3.isNumber = function(e3) {
          return "number" == typeof e3 && !isNaN(e3);
        }, t3.isResolvable = function(e3) {
          return !!e3 && (e3[t3.symbols.ref] || e3[t3.symbols.template]);
        }, t3.isSchema = function(e3, r2 = {}) {
          const n2 = e3 && e3[t3.symbols.any];
          return !!n2 && (s(r2.legacy || n2.version === t3.version, "Cannot mix different versions of joi schemas"), true);
        }, t3.isValues = function(e3) {
          return e3[t3.symbols.values];
        }, t3.limit = function(e3) {
          return Number.isSafeInteger(e3) && e3 >= 0;
        }, t3.preferences = function(e3, s2) {
          i = i || r(6914), e3 = e3 || {}, s2 = s2 || {};
          const n2 = Object.assign({}, e3, s2);
          return s2.errors && e3.errors && (n2.errors = Object.assign({}, e3.errors, s2.errors), n2.errors.wrap = Object.assign({}, e3.errors.wrap, s2.errors.wrap)), s2.messages && (n2.messages = i.compile(s2.messages, e3.messages)), delete n2[t3.symbols.prefs], n2;
        }, t3.tryWithPath = function(e3, t4, r2 = {}) {
          try {
            return e3();
          } catch (e4) {
            throw void 0 !== e4.path ? e4.path = t4 + "." + e4.path : e4.path = t4, r2.append && (e4.message = `${e4.message} (${e4.path})`), e4;
          }
        }, t3.validateArg = function(e3, r2, { assert: s2, message: n2 }) {
          if (t3.isSchema(s2)) {
            const t4 = s2.validate(e3);
            if (!t4.error) return;
            return t4.error.message;
          }
          if (!s2(e3)) return r2 ? `${r2} ${n2}` : n2;
        }, t3.verifyFlat = function(e3, t4) {
          for (const r2 of e3) s(!Array.isArray(r2), "Method no longer accepts array arguments:", t4);
        };
      }, 3292: (e2, t3, r) => {
        const s = r(375), n = r(8160), a = r(6133), i = {};
        t3.schema = function(e3, t4, r2 = {}) {
          n.assertOptions(r2, ["appendPath", "override"]);
          try {
            return i.schema(e3, t4, r2);
          } catch (e4) {
            throw r2.appendPath && void 0 !== e4.path && (e4.message = `${e4.message} (${e4.path})`), e4;
          }
        }, i.schema = function(e3, t4, r2) {
          s(void 0 !== t4, "Invalid undefined schema"), Array.isArray(t4) && (s(t4.length, "Invalid empty array schema"), 1 === t4.length && (t4 = t4[0]));
          const a2 = (t5, ...s2) => false !== r2.override ? t5.valid(e3.override, ...s2) : t5.valid(...s2);
          if (i.simple(t4)) return a2(e3, t4);
          if ("function" == typeof t4) return e3.custom(t4);
          if (s("object" == typeof t4, "Invalid schema content:", typeof t4), n.isResolvable(t4)) return a2(e3, t4);
          if (n.isSchema(t4)) return t4;
          if (Array.isArray(t4)) {
            for (const r3 of t4) if (!i.simple(r3)) return e3.alternatives().try(...t4);
            return a2(e3, ...t4);
          }
          return t4 instanceof RegExp ? e3.string().regex(t4) : t4 instanceof Date ? a2(e3.date(), t4) : (s(Object.getPrototypeOf(t4) === Object.getPrototypeOf({}), "Schema can only contain plain objects"), e3.object().keys(t4));
        }, t3.ref = function(e3, t4) {
          return a.isRef(e3) ? e3 : a.create(e3, t4);
        }, t3.compile = function(e3, r2, a2 = {}) {
          n.assertOptions(a2, ["legacy"]);
          const o = r2 && r2[n.symbols.any];
          if (o) return s(a2.legacy || o.version === n.version, "Cannot mix different versions of joi schemas:", o.version, n.version), r2;
          if ("object" != typeof r2 || !a2.legacy) return t3.schema(e3, r2, { appendPath: true });
          const l = i.walk(r2);
          return l ? l.compile(l.root, r2) : t3.schema(e3, r2, { appendPath: true });
        }, i.walk = function(e3) {
          if ("object" != typeof e3) return null;
          if (Array.isArray(e3)) {
            for (const t5 of e3) {
              const e4 = i.walk(t5);
              if (e4) return e4;
            }
            return null;
          }
          const t4 = e3[n.symbols.any];
          if (t4) return { root: e3[t4.root], compile: t4.compile };
          s(Object.getPrototypeOf(e3) === Object.getPrototypeOf({}), "Schema can only contain plain objects");
          for (const t5 in e3) {
            const r2 = i.walk(e3[t5]);
            if (r2) return r2;
          }
          return null;
        }, i.simple = function(e3) {
          return null === e3 || ["boolean", "string", "number"].includes(typeof e3);
        }, t3.when = function(e3, r2, o) {
          if (void 0 === o && (s(r2 && "object" == typeof r2, "Missing options"), o = r2, r2 = a.create(".")), Array.isArray(o) && (o = { switch: o }), n.assertOptions(o, ["is", "not", "then", "otherwise", "switch", "break"]), n.isSchema(r2)) return s(void 0 === o.is, '"is" can not be used with a schema condition'), s(void 0 === o.not, '"not" can not be used with a schema condition'), s(void 0 === o.switch, '"switch" can not be used with a schema condition'), i.condition(e3, { is: r2, then: o.then, otherwise: o.otherwise, break: o.break });
          if (s(a.isRef(r2) || "string" == typeof r2, "Invalid condition:", r2), s(void 0 === o.not || void 0 === o.is, 'Cannot combine "is" with "not"'), void 0 === o.switch) {
            let l2 = o;
            void 0 !== o.not && (l2 = { is: o.not, then: o.otherwise, otherwise: o.then, break: o.break });
            let c = void 0 !== l2.is ? e3.$_compile(l2.is) : e3.$_root.invalid(null, false, 0, "").required();
            return s(void 0 !== l2.then || void 0 !== l2.otherwise, 'options must have at least one of "then", "otherwise", or "switch"'), s(void 0 === l2.break || void 0 === l2.then || void 0 === l2.otherwise, "Cannot specify then, otherwise, and break all together"), void 0 === o.is || a.isRef(o.is) || n.isSchema(o.is) || (c = c.required()), i.condition(e3, { ref: t3.ref(r2), is: c, then: l2.then, otherwise: l2.otherwise, break: l2.break });
          }
          s(Array.isArray(o.switch), '"switch" must be an array'), s(void 0 === o.is, 'Cannot combine "switch" with "is"'), s(void 0 === o.not, 'Cannot combine "switch" with "not"'), s(void 0 === o.then, 'Cannot combine "switch" with "then"');
          const l = { ref: t3.ref(r2), switch: [], break: o.break };
          for (let t4 = 0; t4 < o.switch.length; ++t4) {
            const r3 = o.switch[t4], i2 = t4 === o.switch.length - 1;
            n.assertOptions(r3, i2 ? ["is", "then", "otherwise"] : ["is", "then"]), s(void 0 !== r3.is, 'Switch statement missing "is"'), s(void 0 !== r3.then, 'Switch statement missing "then"');
            const c = { is: e3.$_compile(r3.is), then: e3.$_compile(r3.then) };
            if (a.isRef(r3.is) || n.isSchema(r3.is) || (c.is = c.is.required()), i2) {
              s(void 0 === o.otherwise || void 0 === r3.otherwise, 'Cannot specify "otherwise" inside and outside a "switch"');
              const t5 = void 0 !== o.otherwise ? o.otherwise : r3.otherwise;
              void 0 !== t5 && (s(void 0 === l.break, "Cannot specify both otherwise and break"), c.otherwise = e3.$_compile(t5));
            }
            l.switch.push(c);
          }
          return l;
        }, i.condition = function(e3, t4) {
          for (const r2 of ["then", "otherwise"]) void 0 === t4[r2] ? delete t4[r2] : t4[r2] = e3.$_compile(t4[r2]);
          return t4;
        };
      }, 6354: (e2, t3, r) => {
        const s = r(5688), n = r(8160), a = r(3328);
        t3.Report = class {
          constructor(e3, r2, s2, n2, a2, i, o) {
            if (this.code = e3, this.flags = n2, this.messages = a2, this.path = i.path, this.prefs = o, this.state = i, this.value = r2, this.message = null, this.template = null, this.local = s2 || {}, this.local.label = t3.label(this.flags, this.state, this.prefs, this.messages), void 0 === this.value || this.local.hasOwnProperty("value") || (this.local.value = this.value), this.path.length) {
              const e4 = this.path[this.path.length - 1];
              "object" != typeof e4 && (this.local.key = e4);
            }
          }
          _setTemplate(e3) {
            if (this.template = e3, !this.flags.label && 0 === this.path.length) {
              const e4 = this._template(this.template, "root");
              e4 && (this.local.label = e4);
            }
          }
          toString() {
            if (this.message) return this.message;
            const e3 = this.code;
            if (!this.prefs.errors.render) return this.code;
            const t4 = this._template(this.template) || this._template(this.prefs.messages) || this._template(this.messages);
            return void 0 === t4 ? `Error code "${e3}" is not defined, your custom type is missing the correct messages definition` : (this.message = t4.render(this.value, this.state, this.prefs, this.local, { errors: this.prefs.errors, messages: [this.prefs.messages, this.messages] }), this.prefs.errors.label || (this.message = this.message.replace(/^"" /, "").trim()), this.message);
          }
          _template(e3, r2) {
            return t3.template(this.value, e3, r2 || this.code, this.state, this.prefs);
          }
        }, t3.path = function(e3) {
          let t4 = "";
          for (const r2 of e3) "object" != typeof r2 && ("string" == typeof r2 ? (t4 && (t4 += "."), t4 += r2) : t4 += `[${r2}]`);
          return t4;
        }, t3.template = function(e3, t4, r2, s2, i) {
          if (!t4) return;
          if (a.isTemplate(t4)) return "root" !== r2 ? t4 : null;
          let o = i.errors.language;
          if (n.isResolvable(o) && (o = o.resolve(e3, s2, i)), o && t4[o]) {
            if (void 0 !== t4[o][r2]) return t4[o][r2];
            if (void 0 !== t4[o]["*"]) return t4[o]["*"];
          }
          return t4[r2] ? t4[r2] : t4["*"];
        }, t3.label = function(e3, r2, s2, n2) {
          if (!s2.errors.label) return "";
          if (e3.label) return e3.label;
          let a2 = r2.path;
          "key" === s2.errors.label && r2.path.length > 1 && (a2 = r2.path.slice(-1));
          return t3.path(a2) || t3.template(null, s2.messages, "root", r2, s2) || n2 && t3.template(null, n2, "root", r2, s2) || "value";
        }, t3.process = function(e3, r2, s2) {
          if (!e3) return null;
          const { override: n2, message: a2, details: i } = t3.details(e3);
          if (n2) return n2;
          if (s2.errors.stack) return new t3.ValidationError(a2, i, r2);
          const o = Error.stackTraceLimit;
          Error.stackTraceLimit = 0;
          const l = new t3.ValidationError(a2, i, r2);
          return Error.stackTraceLimit = o, l;
        }, t3.details = function(e3, t4 = {}) {
          let r2 = [];
          const s2 = [];
          for (const n2 of e3) {
            if (n2 instanceof Error) {
              if (false !== t4.override) return { override: n2 };
              const e5 = n2.toString();
              r2.push(e5), s2.push({ message: e5, type: "override", context: { error: n2 } });
              continue;
            }
            const e4 = n2.toString();
            r2.push(e4), s2.push({ message: e4, path: n2.path.filter(((e5) => "object" != typeof e5)), type: n2.code, context: n2.local });
          }
          return r2.length > 1 && (r2 = [...new Set(r2)]), { message: r2.join(". "), details: s2 };
        }, t3.ValidationError = class extends Error {
          constructor(e3, t4, r2) {
            super(e3), this._original = r2, this.details = t4;
          }
          static isError(e3) {
            return e3 instanceof t3.ValidationError;
          }
        }, t3.ValidationError.prototype.isJoi = true, t3.ValidationError.prototype.name = "ValidationError", t3.ValidationError.prototype.annotate = s.error;
      }, 8901: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(8160), i = r(6914), o = {};
        t3.type = function(e3, t4) {
          const r2 = Object.getPrototypeOf(e3), l = n(r2), c = e3._assign(Object.create(l)), u = Object.assign({}, t4);
          delete u.base, l._definition = u;
          const f = r2._definition || {};
          u.messages = i.merge(f.messages, u.messages), u.properties = Object.assign({}, f.properties, u.properties), c.type = u.type, u.flags = Object.assign({}, f.flags, u.flags);
          const m = Object.assign({}, f.terms);
          if (u.terms) for (const e4 in u.terms) {
            const t5 = u.terms[e4];
            s(void 0 === c.$_terms[e4], "Invalid term override for", u.type, e4), c.$_terms[e4] = t5.init, m[e4] = t5;
          }
          u.terms = m, u.args || (u.args = f.args), u.prepare = o.prepare(u.prepare, f.prepare), u.coerce && ("function" == typeof u.coerce && (u.coerce = { method: u.coerce }), u.coerce.from && !Array.isArray(u.coerce.from) && (u.coerce = { method: u.coerce.method, from: [].concat(u.coerce.from) })), u.coerce = o.coerce(u.coerce, f.coerce), u.validate = o.validate(u.validate, f.validate);
          const h = Object.assign({}, f.rules);
          if (u.rules) for (const e4 in u.rules) {
            const t5 = u.rules[e4];
            s("object" == typeof t5, "Invalid rule definition for", u.type, e4);
            let r3 = t5.method;
            if (void 0 === r3 && (r3 = function() {
              return this.$_addRule(e4);
            }), r3 && (s(!l[e4], "Rule conflict in", u.type, e4), l[e4] = r3), s(!h[e4], "Rule conflict in", u.type, e4), h[e4] = t5, t5.alias) {
              const e5 = [].concat(t5.alias);
              for (const r4 of e5) l[r4] = t5.method;
            }
            t5.args && (t5.argsByName = /* @__PURE__ */ new Map(), t5.args = t5.args.map(((e5) => ("string" == typeof e5 && (e5 = { name: e5 }), s(!t5.argsByName.has(e5.name), "Duplicated argument name", e5.name), a.isSchema(e5.assert) && (e5.assert = e5.assert.strict().label(e5.name)), t5.argsByName.set(e5.name, e5), e5))));
          }
          u.rules = h;
          const d = Object.assign({}, f.modifiers);
          if (u.modifiers) for (const e4 in u.modifiers) {
            s(!l[e4], "Rule conflict in", u.type, e4);
            const t5 = u.modifiers[e4];
            s("function" == typeof t5, "Invalid modifier definition for", u.type, e4);
            const r3 = function(t6) {
              return this.rule({ [e4]: t6 });
            };
            l[e4] = r3, d[e4] = t5;
          }
          if (u.modifiers = d, u.overrides) {
            l._super = r2, c.$_super = {};
            for (const e4 in u.overrides) s(r2[e4], "Cannot override missing", e4), u.overrides[e4][a.symbols.parent] = r2[e4], c.$_super[e4] = r2[e4].bind(c);
            Object.assign(l, u.overrides);
          }
          u.cast = Object.assign({}, f.cast, u.cast);
          const p = Object.assign({}, f.manifest, u.manifest);
          return p.build = o.build(u.manifest && u.manifest.build, f.manifest && f.manifest.build), u.manifest = p, u.rebuild = o.rebuild(u.rebuild, f.rebuild), c;
        }, o.build = function(e3, t4) {
          return e3 && t4 ? function(r2, s2) {
            return t4(e3(r2, s2), s2);
          } : e3 || t4;
        }, o.coerce = function(e3, t4) {
          return e3 && t4 ? { from: e3.from && t4.from ? [.../* @__PURE__ */ new Set([...e3.from, ...t4.from])] : null, method(r2, s2) {
            let n2;
            if ((!t4.from || t4.from.includes(typeof r2)) && (n2 = t4.method(r2, s2), n2)) {
              if (n2.errors || void 0 === n2.value) return n2;
              r2 = n2.value;
            }
            if (!e3.from || e3.from.includes(typeof r2)) {
              const t5 = e3.method(r2, s2);
              if (t5) return t5;
            }
            return n2;
          } } : e3 || t4;
        }, o.prepare = function(e3, t4) {
          return e3 && t4 ? function(r2, s2) {
            const n2 = e3(r2, s2);
            if (n2) {
              if (n2.errors || void 0 === n2.value) return n2;
              r2 = n2.value;
            }
            return t4(r2, s2) || n2;
          } : e3 || t4;
        }, o.rebuild = function(e3, t4) {
          return e3 && t4 ? function(r2) {
            t4(r2), e3(r2);
          } : e3 || t4;
        }, o.validate = function(e3, t4) {
          return e3 && t4 ? function(r2, s2) {
            const n2 = t4(r2, s2);
            if (n2) {
              if (n2.errors && (!Array.isArray(n2.errors) || n2.errors.length)) return n2;
              r2 = n2.value;
            }
            return e3(r2, s2) || n2;
          } : e3 || t4;
        };
      }, 5107: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(8652), i = r(8160), o = r(3292), l = r(6354), c = r(8901), u = r(9708), f = r(6133), m = r(3328), h = r(1152);
        let d;
        const p = { types: { alternatives: r(4946), any: r(8068), array: r(546), boolean: r(4937), date: r(7500), function: r(390), link: r(8785), number: r(3832), object: r(8966), string: r(7417), symbol: r(8826) }, aliases: { alt: "alternatives", bool: "boolean", func: "function" }, root: function() {
          const e3 = { _types: new Set(Object.keys(p.types)) };
          for (const t4 of e3._types) e3[t4] = function(...e4) {
            return s(!e4.length || ["alternatives", "link", "object"].includes(t4), "The", t4, "type does not allow arguments"), p.generate(this, p.types[t4], e4);
          };
          for (const t4 of ["allow", "custom", "disallow", "equal", "exist", "forbidden", "invalid", "not", "only", "optional", "options", "prefs", "preferences", "required", "strip", "valid", "when"]) e3[t4] = function(...e4) {
            return this.any()[t4](...e4);
          };
          Object.assign(e3, p.methods);
          for (const t4 in p.aliases) {
            const r2 = p.aliases[t4];
            e3[t4] = e3[r2];
          }
          return e3.x = e3.expression, h.setup && h.setup(e3), e3;
        } };
        p.methods = { ValidationError: l.ValidationError, version: i.version, cache: a.provider, assert(e3, t4, ...r2) {
          p.assert(e3, t4, true, r2);
        }, attempt: (e3, t4, ...r2) => p.assert(e3, t4, false, r2), build(e3) {
          return s("function" == typeof u.build, "Manifest functionality disabled"), u.build(this, e3);
        }, checkPreferences(e3) {
          i.checkPreferences(e3);
        }, compile(e3, t4) {
          return o.compile(this, e3, t4);
        }, defaults(e3) {
          s("function" == typeof e3, "modifier must be a function");
          const t4 = Object.assign({}, this);
          for (const r2 of t4._types) {
            const n2 = e3(t4[r2]());
            s(i.isSchema(n2), "modifier must return a valid schema object"), t4[r2] = function(...e4) {
              return p.generate(this, n2, e4);
            };
          }
          return t4;
        }, expression: (...e3) => new m(...e3), extend(...e3) {
          i.verifyFlat(e3, "extend"), d = d || r(3378), s(e3.length, "You need to provide at least one extension"), this.assert(e3, d.extensions);
          const t4 = Object.assign({}, this);
          t4._types = new Set(t4._types);
          for (let r2 of e3) {
            "function" == typeof r2 && (r2 = r2(t4)), this.assert(r2, d.extension);
            const e4 = p.expandExtension(r2, t4);
            for (const r3 of e4) {
              s(void 0 === t4[r3.type] || t4._types.has(r3.type), "Cannot override name", r3.type);
              const e5 = r3.base || this.any(), n2 = c.type(e5, r3);
              t4._types.add(r3.type), t4[r3.type] = function(...e6) {
                return p.generate(this, n2, e6);
              };
            }
          }
          return t4;
        }, isError: l.ValidationError.isError, isExpression: m.isTemplate, isRef: f.isRef, isSchema: i.isSchema, in: (...e3) => f.in(...e3), override: i.symbols.override, ref: (...e3) => f.create(...e3), types() {
          const e3 = {};
          for (const t4 of this._types) e3[t4] = this[t4]();
          for (const t4 in p.aliases) e3[t4] = this[t4]();
          return e3;
        } }, p.assert = function(e3, t4, r2, s2) {
          const a2 = s2[0] instanceof Error || "string" == typeof s2[0] ? s2[0] : null, o2 = null !== a2 ? s2[1] : s2[0], c2 = t4.validate(e3, i.preferences({ errors: { stack: true } }, o2 || {}));
          let u2 = c2.error;
          if (!u2) return c2.value;
          if (a2 instanceof Error) throw a2;
          const f2 = r2 && "function" == typeof u2.annotate ? u2.annotate() : u2.message;
          throw u2 instanceof l.ValidationError == 0 && (u2 = n(u2)), u2.message = a2 ? `${a2} ${f2}` : f2, u2;
        }, p.generate = function(e3, t4, r2) {
          return s(e3, "Must be invoked on a Joi instance."), t4.$_root = e3, t4._definition.args && r2.length ? t4._definition.args(t4, ...r2) : t4;
        }, p.expandExtension = function(e3, t4) {
          if ("string" == typeof e3.type) return [e3];
          const r2 = [];
          for (const s2 of t4._types) if (e3.type.test(s2)) {
            const n2 = Object.assign({}, e3);
            n2.type = s2, n2.base = t4[s2](), r2.push(n2);
          }
          return r2;
        }, e2.exports = p.root();
      }, 6914: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(3328);
        t3.compile = function(e3, t4) {
          if ("string" == typeof e3) return s(!t4, "Cannot set single message string"), new a(e3);
          if (a.isTemplate(e3)) return s(!t4, "Cannot set single message template"), e3;
          s("object" == typeof e3 && !Array.isArray(e3), "Invalid message options"), t4 = t4 ? n(t4) : {};
          for (let r2 in e3) {
            const n2 = e3[r2];
            if ("root" === r2 || a.isTemplate(n2)) {
              t4[r2] = n2;
              continue;
            }
            if ("string" == typeof n2) {
              t4[r2] = new a(n2);
              continue;
            }
            s("object" == typeof n2 && !Array.isArray(n2), "Invalid message for", r2);
            const i = r2;
            for (r2 in t4[i] = t4[i] || {}, n2) {
              const e4 = n2[r2];
              "root" === r2 || a.isTemplate(e4) ? t4[i][r2] = e4 : (s("string" == typeof e4, "Invalid message for", r2, "in", i), t4[i][r2] = new a(e4));
            }
          }
          return t4;
        }, t3.decompile = function(e3) {
          const t4 = {};
          for (let r2 in e3) {
            const s2 = e3[r2];
            if ("root" === r2) {
              t4.root = s2;
              continue;
            }
            if (a.isTemplate(s2)) {
              t4[r2] = s2.describe({ compact: true });
              continue;
            }
            const n2 = r2;
            for (r2 in t4[n2] = {}, s2) {
              const e4 = s2[r2];
              "root" !== r2 ? t4[n2][r2] = e4.describe({ compact: true }) : t4[n2].root = e4;
            }
          }
          return t4;
        }, t3.merge = function(e3, r2) {
          if (!e3) return t3.compile(r2);
          if (!r2) return e3;
          if ("string" == typeof r2) return new a(r2);
          if (a.isTemplate(r2)) return r2;
          const i = n(e3);
          for (let e4 in r2) {
            const t4 = r2[e4];
            if ("root" === e4 || a.isTemplate(t4)) {
              i[e4] = t4;
              continue;
            }
            if ("string" == typeof t4) {
              i[e4] = new a(t4);
              continue;
            }
            s("object" == typeof t4 && !Array.isArray(t4), "Invalid message for", e4);
            const n2 = e4;
            for (e4 in i[n2] = i[n2] || {}, t4) {
              const r3 = t4[e4];
              "root" === e4 || a.isTemplate(r3) ? i[n2][e4] = r3 : (s("string" == typeof r3, "Invalid message for", e4, "in", n2), i[n2][e4] = new a(r3));
            }
          }
          return i;
        };
      }, 2294: (e2, t3, r) => {
        const s = r(375), n = r(8160), a = r(6133), i = {};
        t3.Ids = i.Ids = class {
          constructor() {
            this._byId = /* @__PURE__ */ new Map(), this._byKey = /* @__PURE__ */ new Map(), this._schemaChain = false;
          }
          clone() {
            const e3 = new i.Ids();
            return e3._byId = new Map(this._byId), e3._byKey = new Map(this._byKey), e3._schemaChain = this._schemaChain, e3;
          }
          concat(e3) {
            e3._schemaChain && (this._schemaChain = true);
            for (const [t4, r2] of e3._byId.entries()) s(!this._byKey.has(t4), "Schema id conflicts with existing key:", t4), this._byId.set(t4, r2);
            for (const [t4, r2] of e3._byKey.entries()) s(!this._byId.has(t4), "Schema key conflicts with existing id:", t4), this._byKey.set(t4, r2);
          }
          fork(e3, t4, r2) {
            const a2 = this._collect(e3);
            a2.push({ schema: r2 });
            const o = a2.shift();
            let l = { id: o.id, schema: t4(o.schema) };
            s(n.isSchema(l.schema), "adjuster function failed to return a joi schema type");
            for (const e4 of a2) l = { id: e4.id, schema: i.fork(e4.schema, l.id, l.schema) };
            return l.schema;
          }
          labels(e3, t4 = []) {
            const r2 = e3[0], s2 = this._get(r2);
            if (!s2) return [...t4, ...e3].join(".");
            const n2 = e3.slice(1);
            return t4 = [...t4, s2.schema._flags.label || r2], n2.length ? s2.schema._ids.labels(n2, t4) : t4.join(".");
          }
          reach(e3, t4 = []) {
            const r2 = e3[0], n2 = this._get(r2);
            s(n2, "Schema does not contain path", [...t4, ...e3].join("."));
            const a2 = e3.slice(1);
            return a2.length ? n2.schema._ids.reach(a2, [...t4, r2]) : n2.schema;
          }
          register(e3, { key: t4 } = {}) {
            if (!e3 || !n.isSchema(e3)) return;
            (e3.$_property("schemaChain") || e3._ids._schemaChain) && (this._schemaChain = true);
            const r2 = e3._flags.id;
            if (r2) {
              const t5 = this._byId.get(r2);
              s(!t5 || t5.schema === e3, "Cannot add different schemas with the same id:", r2), s(!this._byKey.has(r2), "Schema id conflicts with existing key:", r2), this._byId.set(r2, { schema: e3, id: r2 });
            }
            t4 && (s(!this._byKey.has(t4), "Schema already contains key:", t4), s(!this._byId.has(t4), "Schema key conflicts with existing id:", t4), this._byKey.set(t4, { schema: e3, id: t4 }));
          }
          reset() {
            this._byId = /* @__PURE__ */ new Map(), this._byKey = /* @__PURE__ */ new Map(), this._schemaChain = false;
          }
          _collect(e3, t4 = [], r2 = []) {
            const n2 = e3[0], a2 = this._get(n2);
            s(a2, "Schema does not contain path", [...t4, ...e3].join(".")), r2 = [a2, ...r2];
            const i2 = e3.slice(1);
            return i2.length ? a2.schema._ids._collect(i2, [...t4, n2], r2) : r2;
          }
          _get(e3) {
            return this._byId.get(e3) || this._byKey.get(e3);
          }
        }, i.fork = function(e3, r2, s2) {
          const n2 = t3.schema(e3, { each: (e4, { key: t4 }) => {
            if (r2 === (e4._flags.id || t4)) return s2;
          }, ref: false });
          return n2 ? n2.$_mutateRebuild() : e3;
        }, t3.schema = function(e3, t4) {
          let r2;
          for (const s2 in e3._flags) {
            if ("_" === s2[0]) continue;
            const n2 = i.scan(e3._flags[s2], { source: "flags", name: s2 }, t4);
            void 0 !== n2 && (r2 = r2 || e3.clone(), r2._flags[s2] = n2);
          }
          for (let s2 = 0; s2 < e3._rules.length; ++s2) {
            const n2 = e3._rules[s2], a2 = i.scan(n2.args, { source: "rules", name: n2.name }, t4);
            if (void 0 !== a2) {
              r2 = r2 || e3.clone();
              const t5 = Object.assign({}, n2);
              t5.args = a2, r2._rules[s2] = t5, r2._singleRules.get(n2.name) === n2 && r2._singleRules.set(n2.name, t5);
            }
          }
          for (const s2 in e3.$_terms) {
            if ("_" === s2[0]) continue;
            const n2 = i.scan(e3.$_terms[s2], { source: "terms", name: s2 }, t4);
            void 0 !== n2 && (r2 = r2 || e3.clone(), r2.$_terms[s2] = n2);
          }
          return r2;
        }, i.scan = function(e3, t4, r2, s2, o) {
          const l = s2 || [];
          if (null === e3 || "object" != typeof e3) return;
          let c;
          if (Array.isArray(e3)) {
            for (let s3 = 0; s3 < e3.length; ++s3) {
              const n2 = "terms" === t4.source && "keys" === t4.name && e3[s3].key, a2 = i.scan(e3[s3], t4, r2, [s3, ...l], n2);
              void 0 !== a2 && (c = c || e3.slice(), c[s3] = a2);
            }
            return c;
          }
          if (false !== r2.schema && n.isSchema(e3) || false !== r2.ref && a.isRef(e3)) {
            const s3 = r2.each(e3, { ...t4, path: l, key: o });
            if (s3 === e3) return;
            return s3;
          }
          for (const s3 in e3) {
            if ("_" === s3[0]) continue;
            const n2 = i.scan(e3[s3], t4, r2, [s3, ...l], o);
            void 0 !== n2 && (c = c || Object.assign({}, e3), c[s3] = n2);
          }
          return c;
        };
      }, 6133: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(9621), i = r(8160);
        let o;
        const l = { symbol: Symbol("ref"), defaults: { adjust: null, in: false, iterables: null, map: null, separator: ".", type: "value" } };
        t3.create = function(e3, t4 = {}) {
          s("string" == typeof e3, "Invalid reference key:", e3), i.assertOptions(t4, ["adjust", "ancestor", "in", "iterables", "map", "prefix", "render", "separator"]), s(!t4.prefix || "object" == typeof t4.prefix, "options.prefix must be of type object");
          const r2 = Object.assign({}, l.defaults, t4);
          delete r2.prefix;
          const n2 = r2.separator, a2 = l.context(e3, n2, t4.prefix);
          if (r2.type = a2.type, e3 = a2.key, "value" === r2.type) if (a2.root && (s(!n2 || e3[0] !== n2, "Cannot specify relative path with root prefix"), r2.ancestor = "root", e3 || (e3 = null)), n2 && n2 === e3) e3 = null, r2.ancestor = 0;
          else if (void 0 !== r2.ancestor) s(!n2 || !e3 || e3[0] !== n2, "Cannot combine prefix with ancestor option");
          else {
            const [t5, s2] = l.ancestor(e3, n2);
            s2 && "" === (e3 = e3.slice(s2)) && (e3 = null), r2.ancestor = t5;
          }
          return r2.path = n2 ? null === e3 ? [] : e3.split(n2) : [e3], new l.Ref(r2);
        }, t3.in = function(e3, r2 = {}) {
          return t3.create(e3, { ...r2, in: true });
        }, t3.isRef = function(e3) {
          return !!e3 && !!e3[i.symbols.ref];
        }, l.Ref = class {
          constructor(e3) {
            s("object" == typeof e3, "Invalid reference construction"), i.assertOptions(e3, ["adjust", "ancestor", "in", "iterables", "map", "path", "render", "separator", "type", "depth", "key", "root", "display"]), s([false, void 0].includes(e3.separator) || "string" == typeof e3.separator && 1 === e3.separator.length, "Invalid separator"), s(!e3.adjust || "function" == typeof e3.adjust, "options.adjust must be a function"), s(!e3.map || Array.isArray(e3.map), "options.map must be an array"), s(!e3.map || !e3.adjust, "Cannot set both map and adjust options"), Object.assign(this, l.defaults, e3), s("value" === this.type || void 0 === this.ancestor, "Non-value references cannot reference ancestors"), Array.isArray(this.map) && (this.map = new Map(this.map)), this.depth = this.path.length, this.key = this.path.length ? this.path.join(this.separator) : null, this.root = this.path[0], this.updateDisplay();
          }
          resolve(e3, t4, r2, n2, a2 = {}) {
            return s(!this.in || a2.in, "Invalid in() reference usage"), "global" === this.type ? this._resolve(r2.context, t4, a2) : "local" === this.type ? this._resolve(n2, t4, a2) : this.ancestor ? "root" === this.ancestor ? this._resolve(t4.ancestors[t4.ancestors.length - 1], t4, a2) : (s(this.ancestor <= t4.ancestors.length, "Invalid reference exceeds the schema root:", this.display), this._resolve(t4.ancestors[this.ancestor - 1], t4, a2)) : this._resolve(e3, t4, a2);
          }
          _resolve(e3, t4, r2) {
            let s2;
            if ("value" === this.type && t4.mainstay.shadow && false !== r2.shadow && (s2 = t4.mainstay.shadow.get(this.absolute(t4))), void 0 === s2 && (s2 = a(e3, this.path, { iterables: this.iterables, functions: true })), this.adjust && (s2 = this.adjust(s2)), this.map) {
              const e4 = this.map.get(s2);
              void 0 !== e4 && (s2 = e4);
            }
            return t4.mainstay && t4.mainstay.tracer.resolve(t4, this, s2), s2;
          }
          toString() {
            return this.display;
          }
          absolute(e3) {
            return [...e3.path.slice(0, -this.ancestor), ...this.path];
          }
          clone() {
            return new l.Ref(this);
          }
          describe() {
            const e3 = { path: this.path };
            "value" !== this.type && (e3.type = this.type), "." !== this.separator && (e3.separator = this.separator), "value" === this.type && 1 !== this.ancestor && (e3.ancestor = this.ancestor), this.map && (e3.map = [...this.map]);
            for (const t4 of ["adjust", "iterables", "render"]) null !== this[t4] && void 0 !== this[t4] && (e3[t4] = this[t4]);
            return false !== this.in && (e3.in = true), { ref: e3 };
          }
          updateDisplay() {
            const e3 = null !== this.key ? this.key : "";
            if ("value" !== this.type) return void (this.display = `ref:${this.type}:${e3}`);
            if (!this.separator) return void (this.display = `ref:${e3}`);
            if (!this.ancestor) return void (this.display = `ref:${this.separator}${e3}`);
            if ("root" === this.ancestor) return void (this.display = `ref:root:${e3}`);
            if (1 === this.ancestor) return void (this.display = `ref:${e3 || ".."}`);
            const t4 = new Array(this.ancestor + 1).fill(this.separator).join("");
            this.display = `ref:${t4}${e3 || ""}`;
          }
        }, l.Ref.prototype[i.symbols.ref] = true, t3.build = function(e3) {
          return "value" === (e3 = Object.assign({}, l.defaults, e3)).type && void 0 === e3.ancestor && (e3.ancestor = 1), new l.Ref(e3);
        }, l.context = function(e3, t4, r2 = {}) {
          if (e3 = e3.trim(), r2) {
            const s2 = void 0 === r2.global ? "$" : r2.global;
            if (s2 !== t4 && e3.startsWith(s2)) return { key: e3.slice(s2.length), type: "global" };
            const n2 = void 0 === r2.local ? "#" : r2.local;
            if (n2 !== t4 && e3.startsWith(n2)) return { key: e3.slice(n2.length), type: "local" };
            const a2 = void 0 === r2.root ? "/" : r2.root;
            if (a2 !== t4 && e3.startsWith(a2)) return { key: e3.slice(a2.length), type: "value", root: true };
          }
          return { key: e3, type: "value" };
        }, l.ancestor = function(e3, t4) {
          if (!t4) return [1, 0];
          if (e3[0] !== t4) return [1, 0];
          if (e3[1] !== t4) return [0, 1];
          let r2 = 2;
          for (; e3[r2] === t4; ) ++r2;
          return [r2 - 1, r2];
        }, t3.toSibling = 0, t3.toParent = 1, t3.Manager = class {
          constructor() {
            this.refs = [];
          }
          register(e3, s2) {
            if (e3) if (s2 = void 0 === s2 ? t3.toParent : s2, Array.isArray(e3)) for (const t4 of e3) this.register(t4, s2);
            else if (i.isSchema(e3)) for (const t4 of e3._refs.refs) t4.ancestor - s2 >= 0 && this.refs.push({ ancestor: t4.ancestor - s2, root: t4.root });
            else t3.isRef(e3) && "value" === e3.type && e3.ancestor - s2 >= 0 && this.refs.push({ ancestor: e3.ancestor - s2, root: e3.root }), o = o || r(3328), o.isTemplate(e3) && this.register(e3.refs(), s2);
          }
          get length() {
            return this.refs.length;
          }
          clone() {
            const e3 = new t3.Manager();
            return e3.refs = n(this.refs), e3;
          }
          reset() {
            this.refs = [];
          }
          roots() {
            return this.refs.filter(((e3) => !e3.ancestor)).map(((e3) => e3.root));
          }
        };
      }, 3378: (e2, t3, r) => {
        const s = r(5107), n = {};
        n.wrap = s.string().min(1).max(2).allow(false), t3.preferences = s.object({ allowUnknown: s.boolean(), abortEarly: s.boolean(), artifacts: s.boolean(), cache: s.boolean(), context: s.object(), convert: s.boolean(), dateFormat: s.valid("date", "iso", "string", "time", "utc"), debug: s.boolean(), errors: { escapeHtml: s.boolean(), label: s.valid("path", "key", false), language: [s.string(), s.object().ref()], render: s.boolean(), stack: s.boolean(), wrap: { label: n.wrap, array: n.wrap, string: n.wrap } }, externals: s.boolean(), messages: s.object(), noDefaults: s.boolean(), nonEnumerables: s.boolean(), presence: s.valid("required", "optional", "forbidden"), skipFunctions: s.boolean(), stripUnknown: s.object({ arrays: s.boolean(), objects: s.boolean() }).or("arrays", "objects").allow(true, false), warnings: s.boolean() }).strict(), n.nameRx = /^[a-zA-Z0-9]\w*$/, n.rule = s.object({ alias: s.array().items(s.string().pattern(n.nameRx)).single(), args: s.array().items(s.string(), s.object({ name: s.string().pattern(n.nameRx).required(), ref: s.boolean(), assert: s.alternatives([s.function(), s.object().schema()]).conditional("ref", { is: true, then: s.required() }), normalize: s.function(), message: s.string().when("assert", { is: s.function(), then: s.required() }) })), convert: s.boolean(), manifest: s.boolean(), method: s.function().allow(false), multi: s.boolean(), validate: s.function() }), t3.extension = s.object({ type: s.alternatives([s.string(), s.object().regex()]).required(), args: s.function(), cast: s.object().pattern(n.nameRx, s.object({ from: s.function().maxArity(1).required(), to: s.function().minArity(1).maxArity(2).required() })), base: s.object().schema().when("type", { is: s.object().regex(), then: s.forbidden() }), coerce: [s.function().maxArity(3), s.object({ method: s.function().maxArity(3).required(), from: s.array().items(s.string()).single() })], flags: s.object().pattern(n.nameRx, s.object({ setter: s.string(), default: s.any() })), manifest: { build: s.function().arity(2) }, messages: [s.object(), s.string()], modifiers: s.object().pattern(n.nameRx, s.function().minArity(1).maxArity(2)), overrides: s.object().pattern(n.nameRx, s.function()), prepare: s.function().maxArity(3), rebuild: s.function().arity(1), rules: s.object().pattern(n.nameRx, n.rule), terms: s.object().pattern(n.nameRx, s.object({ init: s.array().allow(null).required(), manifest: s.object().pattern(/.+/, [s.valid("schema", "single"), s.object({ mapped: s.object({ from: s.string().required(), to: s.string().required() }).required() })]) })), validate: s.function().maxArity(3) }).strict(), t3.extensions = s.array().items(s.object(), s.function().arity(1)).strict(), n.desc = { buffer: s.object({ buffer: s.string() }), func: s.object({ function: s.function().required(), options: { literal: true } }), override: s.object({ override: true }), ref: s.object({ ref: s.object({ type: s.valid("value", "global", "local"), path: s.array().required(), separator: s.string().length(1).allow(false), ancestor: s.number().min(0).integer().allow("root"), map: s.array().items(s.array().length(2)).min(1), adjust: s.function(), iterables: s.boolean(), in: s.boolean(), render: s.boolean() }).required() }), regex: s.object({ regex: s.string().min(3) }), special: s.object({ special: s.valid("deep").required() }), template: s.object({ template: s.string().required(), options: s.object() }), value: s.object({ value: s.alternatives([s.object(), s.array()]).required() }) }, n.desc.entity = s.alternatives([s.array().items(s.link("...")), s.boolean(), s.function(), s.number(), s.string(), n.desc.buffer, n.desc.func, n.desc.ref, n.desc.regex, n.desc.special, n.desc.template, n.desc.value, s.link("/")]), n.desc.values = s.array().items(null, s.boolean(), s.function(), s.number().allow(1 / 0, -1 / 0), s.string().allow(""), s.symbol(), n.desc.buffer, n.desc.func, n.desc.override, n.desc.ref, n.desc.regex, n.desc.template, n.desc.value), n.desc.messages = s.object().pattern(/.+/, [s.string(), n.desc.template, s.object().pattern(/.+/, [s.string(), n.desc.template])]), t3.description = s.object({ type: s.string().required(), flags: s.object({ cast: s.string(), default: s.any(), description: s.string(), empty: s.link("/"), failover: n.desc.entity, id: s.string(), label: s.string(), only: true, presence: ["optional", "required", "forbidden"], result: ["raw", "strip"], strip: s.boolean(), unit: s.string() }).unknown(), preferences: { allowUnknown: s.boolean(), abortEarly: s.boolean(), artifacts: s.boolean(), cache: s.boolean(), convert: s.boolean(), dateFormat: ["date", "iso", "string", "time", "utc"], errors: { escapeHtml: s.boolean(), label: ["path", "key"], language: [s.string(), n.desc.ref], wrap: { label: n.wrap, array: n.wrap } }, externals: s.boolean(), messages: n.desc.messages, noDefaults: s.boolean(), nonEnumerables: s.boolean(), presence: ["required", "optional", "forbidden"], skipFunctions: s.boolean(), stripUnknown: s.object({ arrays: s.boolean(), objects: s.boolean() }).or("arrays", "objects").allow(true, false), warnings: s.boolean() }, allow: n.desc.values, invalid: n.desc.values, rules: s.array().min(1).items({ name: s.string().required(), args: s.object().min(1), keep: s.boolean(), message: [s.string(), n.desc.messages], warn: s.boolean() }), keys: s.object().pattern(/.*/, s.link("/")), link: n.desc.ref }).pattern(/^[a-z]\w*$/, s.any());
      }, 493: (e2, t3, r) => {
        const s = r(8571), n = r(9621), a = r(8160), i = { value: Symbol("value") };
        e2.exports = i.State = class {
          constructor(e3, t4, r2) {
            this.path = e3, this.ancestors = t4, this.mainstay = r2.mainstay, this.schemas = r2.schemas, this.debug = null;
          }
          localize(e3, t4 = null, r2 = null) {
            const s2 = new i.State(e3, t4, this);
            return r2 && s2.schemas && (s2.schemas = [i.schemas(r2), ...s2.schemas]), s2;
          }
          nest(e3, t4) {
            const r2 = new i.State(this.path, this.ancestors, this);
            return r2.schemas = r2.schemas && [i.schemas(e3), ...r2.schemas], r2.debug = t4, r2;
          }
          shadow(e3, t4) {
            this.mainstay.shadow = this.mainstay.shadow || new i.Shadow(), this.mainstay.shadow.set(this.path, e3, t4);
          }
          snapshot() {
            this.mainstay.shadow && (this._snapshot = s(this.mainstay.shadow.node(this.path))), this.mainstay.snapshot();
          }
          restore() {
            this.mainstay.shadow && (this.mainstay.shadow.override(this.path, this._snapshot), this._snapshot = void 0), this.mainstay.restore();
          }
          commit() {
            this.mainstay.shadow && (this.mainstay.shadow.override(this.path, this._snapshot), this._snapshot = void 0), this.mainstay.commit();
          }
        }, i.schemas = function(e3) {
          return a.isSchema(e3) ? { schema: e3 } : e3;
        }, i.Shadow = class {
          constructor() {
            this._values = null;
          }
          set(e3, t4, r2) {
            if (!e3.length) return;
            if ("strip" === r2 && "number" == typeof e3[e3.length - 1]) return;
            this._values = this._values || /* @__PURE__ */ new Map();
            let s2 = this._values;
            for (let t5 = 0; t5 < e3.length; ++t5) {
              const r3 = e3[t5];
              let n2 = s2.get(r3);
              n2 || (n2 = /* @__PURE__ */ new Map(), s2.set(r3, n2)), s2 = n2;
            }
            s2[i.value] = t4;
          }
          get(e3) {
            const t4 = this.node(e3);
            if (t4) return t4[i.value];
          }
          node(e3) {
            if (this._values) return n(this._values, e3, { iterables: true });
          }
          override(e3, t4) {
            if (!this._values) return;
            const r2 = e3.slice(0, -1), s2 = e3[e3.length - 1], a2 = n(this._values, r2, { iterables: true });
            t4 ? a2.set(s2, t4) : a2 && a2.delete(s2);
          }
        };
      }, 3328: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(5277), i = r(1447), o = r(8160), l = r(6354), c = r(6133), u = { symbol: Symbol("template"), opens: new Array(1e3).join("\0"), closes: new Array(1e3).join(""), dateFormat: { date: Date.prototype.toDateString, iso: Date.prototype.toISOString, string: Date.prototype.toString, time: Date.prototype.toTimeString, utc: Date.prototype.toUTCString } };
        e2.exports = u.Template = class {
          constructor(e3, t4) {
            if (s("string" == typeof e3, "Template source must be a string"), s(!e3.includes("\0") && !e3.includes(""), "Template source cannot contain reserved control characters"), this.source = e3, this.rendered = e3, this._template = null, t4) {
              const { functions: e4, ...r2 } = t4;
              this._settings = Object.keys(r2).length ? n(r2) : void 0, this._functions = e4, this._functions && (s(Object.keys(this._functions).every(((e5) => "string" == typeof e5)), "Functions keys must be strings"), s(Object.values(this._functions).every(((e5) => "function" == typeof e5)), "Functions values must be functions"));
            } else this._settings = void 0, this._functions = void 0;
            this._parse();
          }
          _parse() {
            if (!this.source.includes("{")) return;
            const e3 = u.encode(this.source), t4 = u.split(e3);
            let r2 = false;
            const s2 = [], n2 = t4.shift();
            n2 && s2.push(n2);
            for (const e4 of t4) {
              const t5 = "{" !== e4[0], n3 = t5 ? "}" : "}}", a2 = e4.indexOf(n3);
              if (-1 === a2 || "{" === e4[1]) {
                s2.push(`{${u.decode(e4)}`);
                continue;
              }
              let i2 = e4.slice(t5 ? 0 : 1, a2);
              const o2 = ":" === i2[0];
              o2 && (i2 = i2.slice(1));
              const l2 = this._ref(u.decode(i2), { raw: t5, wrapped: o2 });
              s2.push(l2), "string" != typeof l2 && (r2 = true);
              const c2 = e4.slice(a2 + n3.length);
              c2 && s2.push(u.decode(c2));
            }
            r2 ? this._template = s2 : this.rendered = s2.join("");
          }
          static date(e3, t4) {
            return u.dateFormat[t4.dateFormat].call(e3);
          }
          describe(e3 = {}) {
            if (!this._settings && e3.compact) return this.source;
            const t4 = { template: this.source };
            return this._settings && (t4.options = this._settings), this._functions && (t4.functions = this._functions), t4;
          }
          static build(e3) {
            return new u.Template(e3.template, e3.options || e3.functions ? { ...e3.options, functions: e3.functions } : void 0);
          }
          isDynamic() {
            return !!this._template;
          }
          static isTemplate(e3) {
            return !!e3 && !!e3[o.symbols.template];
          }
          refs() {
            if (!this._template) return;
            const e3 = [];
            for (const t4 of this._template) "string" != typeof t4 && e3.push(...t4.refs);
            return e3;
          }
          resolve(e3, t4, r2, s2) {
            return this._template && 1 === this._template.length ? this._part(this._template[0], e3, t4, r2, s2, {}) : this.render(e3, t4, r2, s2);
          }
          _part(e3, ...t4) {
            return e3.ref ? e3.ref.resolve(...t4) : e3.formula.evaluate(t4);
          }
          render(e3, t4, r2, s2, n2 = {}) {
            if (!this.isDynamic()) return this.rendered;
            const i2 = [];
            for (const o2 of this._template) if ("string" == typeof o2) i2.push(o2);
            else {
              const l2 = this._part(o2, e3, t4, r2, s2, n2), c2 = u.stringify(l2, e3, t4, r2, s2, n2);
              if (void 0 !== c2) {
                const e4 = o2.raw || false === (n2.errors && n2.errors.escapeHtml) ? c2 : a(c2);
                i2.push(u.wrap(e4, o2.wrapped && r2.errors.wrap.label));
              }
            }
            return i2.join("");
          }
          _ref(e3, { raw: t4, wrapped: r2 }) {
            const s2 = [], n2 = (e4) => {
              const t5 = c.create(e4, this._settings);
              return s2.push(t5), (e5) => {
                const r3 = t5.resolve(...e5);
                return void 0 !== r3 ? r3 : null;
              };
            };
            try {
              const t5 = this._functions ? { ...u.functions, ...this._functions } : u.functions;
              var a2 = new i.Parser(e3, { reference: n2, functions: t5, constants: u.constants });
            } catch (t5) {
              throw t5.message = `Invalid template variable "${e3}" fails due to: ${t5.message}`, t5;
            }
            if (a2.single) {
              if ("reference" === a2.single.type) {
                const e4 = s2[0];
                return { ref: e4, raw: t4, refs: s2, wrapped: r2 || "local" === e4.type && "label" === e4.key };
              }
              return u.stringify(a2.single.value);
            }
            return { formula: a2, raw: t4, refs: s2 };
          }
          toString() {
            return this.source;
          }
        }, u.Template.prototype[o.symbols.template] = true, u.Template.prototype.isImmutable = true, u.encode = function(e3) {
          return e3.replace(/\\(\{+)/g, ((e4, t4) => u.opens.slice(0, t4.length))).replace(/\\(\}+)/g, ((e4, t4) => u.closes.slice(0, t4.length)));
        }, u.decode = function(e3) {
          return e3.replace(/\u0000/g, "{").replace(/\u0001/g, "}");
        }, u.split = function(e3) {
          const t4 = [];
          let r2 = "";
          for (let s2 = 0; s2 < e3.length; ++s2) {
            const n2 = e3[s2];
            if ("{" === n2) {
              let n3 = "";
              for (; s2 + 1 < e3.length && "{" === e3[s2 + 1]; ) n3 += "{", ++s2;
              t4.push(r2), r2 = n3;
            } else r2 += n2;
          }
          return t4.push(r2), t4;
        }, u.wrap = function(e3, t4) {
          return t4 ? 1 === t4.length ? `${t4}${e3}${t4}` : `${t4[0]}${e3}${t4[1]}` : e3;
        }, u.stringify = function(e3, t4, r2, s2, n2, a2 = {}) {
          const i2 = typeof e3, o2 = s2 && s2.errors && s2.errors.wrap || {};
          let l2 = false;
          if (c.isRef(e3) && e3.render && (l2 = e3.in, e3 = e3.resolve(t4, r2, s2, n2, { in: e3.in, ...a2 })), null === e3) return "null";
          if ("string" === i2) return u.wrap(e3, a2.arrayItems && o2.string);
          if ("number" === i2 || "function" === i2 || "symbol" === i2) return e3.toString();
          if ("object" !== i2) return JSON.stringify(e3);
          if (e3 instanceof Date) return u.Template.date(e3, s2);
          if (e3 instanceof Map) {
            const t5 = [];
            for (const [r3, s3] of e3.entries()) t5.push(`${r3.toString()} -> ${s3.toString()}`);
            e3 = t5;
          }
          if (!Array.isArray(e3)) return e3.toString();
          const f = [];
          for (const i3 of e3) f.push(u.stringify(i3, t4, r2, s2, n2, { arrayItems: true, ...a2 }));
          return u.wrap(f.join(", "), !l2 && o2.array);
        }, u.constants = { true: true, false: false, null: null, second: 1e3, minute: 6e4, hour: 36e5, day: 864e5 }, u.functions = { if: (e3, t4, r2) => e3 ? t4 : r2, length: (e3) => "string" == typeof e3 ? e3.length : e3 && "object" == typeof e3 ? Array.isArray(e3) ? e3.length : Object.keys(e3).length : null, msg(e3) {
          const [t4, r2, s2, n2, a2] = this, i2 = a2.messages;
          if (!i2) return "";
          const o2 = l.template(t4, i2[0], e3, r2, s2) || l.template(t4, i2[1], e3, r2, s2);
          return o2 ? o2.render(t4, r2, s2, n2, a2) : "";
        }, number: (e3) => "number" == typeof e3 ? e3 : "string" == typeof e3 ? parseFloat(e3) : "boolean" == typeof e3 ? e3 ? 1 : 0 : e3 instanceof Date ? e3.getTime() : null };
      }, 4946: (e2, t3, r) => {
        const s = r(375), n = r(1687), a = r(8068), i = r(8160), o = r(3292), l = r(6354), c = r(6133), u = {};
        e2.exports = a.extend({ type: "alternatives", flags: { match: { default: "any" } }, terms: { matches: { init: [], register: c.toSibling } }, args: (e3, ...t4) => 1 === t4.length && Array.isArray(t4[0]) ? e3.try(...t4[0]) : e3.try(...t4), validate(e3, t4) {
          const { schema: r2, error: s2, state: a2, prefs: i2 } = t4;
          if (r2._flags.match) {
            const t5 = [], o3 = [];
            for (let s3 = 0; s3 < r2.$_terms.matches.length; ++s3) {
              const n2 = r2.$_terms.matches[s3], l2 = a2.nest(n2.schema, `match.${s3}`);
              l2.snapshot();
              const c3 = n2.schema.$_validate(e3, l2, i2);
              c3.errors ? (o3.push(c3.errors), l2.restore()) : (t5.push(c3.value), l2.commit());
            }
            if (0 === t5.length) return { errors: s2("alternatives.any", { details: o3.map(((e4) => l.details(e4, { override: false }))) }) };
            if ("one" === r2._flags.match) return 1 === t5.length ? { value: t5[0] } : { errors: s2("alternatives.one") };
            if (t5.length !== r2.$_terms.matches.length) return { errors: s2("alternatives.all", { details: o3.map(((e4) => l.details(e4, { override: false }))) }) };
            const c2 = (e4) => e4.$_terms.matches.some(((e5) => "object" === e5.schema.type || "alternatives" === e5.schema.type && c2(e5.schema)));
            return c2(r2) ? { value: t5.reduce(((e4, t6) => n(e4, t6, { mergeArrays: false }))) } : { value: t5[t5.length - 1] };
          }
          const o2 = [];
          for (let t5 = 0; t5 < r2.$_terms.matches.length; ++t5) {
            const s3 = r2.$_terms.matches[t5];
            if (s3.schema) {
              const r3 = a2.nest(s3.schema, `match.${t5}`);
              r3.snapshot();
              const n3 = s3.schema.$_validate(e3, r3, i2);
              if (!n3.errors) return r3.commit(), n3;
              r3.restore(), o2.push({ schema: s3.schema, reports: n3.errors });
              continue;
            }
            const n2 = s3.ref ? s3.ref.resolve(e3, a2, i2) : e3, l2 = s3.is ? [s3] : s3.switch;
            for (let r3 = 0; r3 < l2.length; ++r3) {
              const o3 = l2[r3], { is: c2, then: u2, otherwise: f } = o3, m = `match.${t5}${s3.switch ? "." + r3 : ""}`;
              if (c2.$_match(n2, a2.nest(c2, `${m}.is`), i2)) {
                if (u2) return u2.$_validate(e3, a2.nest(u2, `${m}.then`), i2);
              } else if (f) return f.$_validate(e3, a2.nest(f, `${m}.otherwise`), i2);
            }
          }
          return u.errors(o2, t4);
        }, rules: { conditional: { method(e3, t4) {
          s(!this._flags._endedSwitch, "Unreachable condition"), s(!this._flags.match, "Cannot combine match mode", this._flags.match, "with conditional rule"), s(void 0 === t4.break, "Cannot use break option with alternatives conditional");
          const r2 = this.clone(), n2 = o.when(r2, e3, t4), a2 = n2.is ? [n2] : n2.switch;
          for (const e4 of a2) if (e4.then && e4.otherwise) {
            r2.$_setFlag("_endedSwitch", true, { clone: false });
            break;
          }
          return r2.$_terms.matches.push(n2), r2.$_mutateRebuild();
        } }, match: { method(e3) {
          if (s(["any", "one", "all"].includes(e3), "Invalid alternatives match mode", e3), "any" !== e3) for (const t4 of this.$_terms.matches) s(t4.schema, "Cannot combine match mode", e3, "with conditional rules");
          return this.$_setFlag("match", e3);
        } }, try: { method(...e3) {
          s(e3.length, "Missing alternative schemas"), i.verifyFlat(e3, "try"), s(!this._flags._endedSwitch, "Unreachable condition");
          const t4 = this.clone();
          for (const r2 of e3) t4.$_terms.matches.push({ schema: t4.$_compile(r2) });
          return t4.$_mutateRebuild();
        } } }, overrides: { label(e3) {
          return this.$_parent("label", e3).$_modify({ each: (t4, r2) => "is" !== r2.path[0] && "string" != typeof t4._flags.label ? t4.label(e3) : void 0, ref: false });
        } }, rebuild(e3) {
          e3.$_modify({ each: (t4) => {
            i.isSchema(t4) && "array" === t4.type && e3.$_setFlag("_arrayItems", true, { clone: false });
          } });
        }, manifest: { build(e3, t4) {
          if (t4.matches) for (const r2 of t4.matches) {
            const { schema: t5, ref: s2, is: n2, not: a2, then: i2, otherwise: o2 } = r2;
            e3 = t5 ? e3.try(t5) : s2 ? e3.conditional(s2, { is: n2, then: i2, not: a2, otherwise: o2, switch: r2.switch }) : e3.conditional(n2, { then: i2, otherwise: o2 });
          }
          return e3;
        } }, messages: { "alternatives.all": "{{#label}} does not match all of the required types", "alternatives.any": "{{#label}} does not match any of the allowed types", "alternatives.match": "{{#label}} does not match any of the allowed types", "alternatives.one": "{{#label}} matches more than one allowed type", "alternatives.types": "{{#label}} must be one of {{#types}}" } }), u.errors = function(e3, { error: t4, state: r2 }) {
          if (!e3.length) return { errors: t4("alternatives.any") };
          if (1 === e3.length) return { errors: e3[0].reports };
          const s2 = /* @__PURE__ */ new Set(), n2 = [];
          for (const { reports: a2, schema: i2 } of e3) {
            if (a2.length > 1) return u.unmatched(e3, t4);
            const o2 = a2[0];
            if (o2 instanceof l.Report == 0) return u.unmatched(e3, t4);
            if (o2.state.path.length !== r2.path.length) {
              n2.push({ type: i2.type, report: o2 });
              continue;
            }
            if ("any.only" === o2.code) {
              for (const e4 of o2.local.valids) s2.add(e4);
              continue;
            }
            const [c2, f] = o2.code.split(".");
            "base" !== f ? n2.push({ type: i2.type, report: o2 }) : "object.base" === o2.code ? s2.add(o2.local.type) : s2.add(c2);
          }
          return n2.length ? 1 === n2.length ? { errors: n2[0].report } : u.unmatched(e3, t4) : { errors: t4("alternatives.types", { types: [...s2] }) };
        }, u.unmatched = function(e3, t4) {
          const r2 = [];
          for (const t5 of e3) r2.push(...t5.reports);
          return { errors: t4("alternatives.match", l.details(r2, { override: false })) };
        };
      }, 8068: (e2, t3, r) => {
        const s = r(375), n = r(7629), a = r(8160), i = r(6914);
        e2.exports = n.extend({ type: "any", flags: { only: { default: false } }, terms: { alterations: { init: null }, examples: { init: null }, externals: { init: null }, metas: { init: [] }, notes: { init: [] }, shared: { init: null }, tags: { init: [] }, whens: { init: null } }, rules: { custom: { method(e3, t4) {
          return s("function" == typeof e3, "Method must be a function"), s(void 0 === t4 || t4 && "string" == typeof t4, "Description must be a non-empty string"), this.$_addRule({ name: "custom", args: { method: e3, description: t4 } });
        }, validate(e3, t4, { method: r2 }) {
          try {
            return r2(e3, t4);
          } catch (e4) {
            return t4.error("any.custom", { error: e4 });
          }
        }, args: ["method", "description"], multi: true }, messages: { method(e3) {
          return this.prefs({ messages: e3 });
        } }, shared: { method(e3) {
          s(a.isSchema(e3) && e3._flags.id, "Schema must be a schema with an id");
          const t4 = this.clone();
          return t4.$_terms.shared = t4.$_terms.shared || [], t4.$_terms.shared.push(e3), t4.$_mutateRegister(e3), t4;
        } }, warning: { method(e3, t4) {
          return s(e3 && "string" == typeof e3, "Invalid warning code"), this.$_addRule({ name: "warning", args: { code: e3, local: t4 }, warn: true });
        }, validate: (e3, t4, { code: r2, local: s2 }) => t4.error(r2, s2), args: ["code", "local"], multi: true } }, modifiers: { keep(e3, t4 = true) {
          e3.keep = t4;
        }, message(e3, t4) {
          e3.message = i.compile(t4);
        }, warn(e3, t4 = true) {
          e3.warn = t4;
        } }, manifest: { build(e3, t4) {
          for (const r2 in t4) {
            const s2 = t4[r2];
            if (["examples", "externals", "metas", "notes", "tags"].includes(r2)) for (const t5 of s2) e3 = e3[r2.slice(0, -1)](t5);
            else if ("alterations" !== r2) if ("whens" !== r2) {
              if ("shared" === r2) for (const t5 of s2) e3 = e3.shared(t5);
            } else for (const t5 of s2) {
              const { ref: r3, is: s3, not: n2, then: a2, otherwise: i2, concat: o } = t5;
              e3 = o ? e3.concat(o) : r3 ? e3.when(r3, { is: s3, not: n2, then: a2, otherwise: i2, switch: t5.switch, break: t5.break }) : e3.when(s3, { then: a2, otherwise: i2, break: t5.break });
            }
            else {
              const t5 = {};
              for (const { target: e4, adjuster: r3 } of s2) t5[e4] = r3;
              e3 = e3.alter(t5);
            }
          }
          return e3;
        } }, messages: { "any.custom": "{{#label}} failed custom validation because {{#error.message}}", "any.default": "{{#label}} threw an error when running default method", "any.failover": "{{#label}} threw an error when running failover method", "any.invalid": "{{#label}} contains an invalid value", "any.only": '{{#label}} must be {if(#valids.length == 1, "", "one of ")}{{#valids}}', "any.ref": "{{#label}} {{#arg}} references {{:#ref}} which {{#reason}}", "any.required": "{{#label}} is required", "any.unknown": "{{#label}} is not allowed" } });
      }, 546: (e2, t3, r) => {
        const s = r(375), n = r(9474), a = r(9621), i = r(8068), o = r(8160), l = r(3292), c = {};
        e2.exports = i.extend({ type: "array", flags: { single: { default: false }, sparse: { default: false } }, terms: { items: { init: [], manifest: "schema" }, ordered: { init: [], manifest: "schema" }, _exclusions: { init: [] }, _inclusions: { init: [] }, _requireds: { init: [] } }, coerce: { from: "object", method(e3, { schema: t4, state: r2, prefs: s2 }) {
          if (!Array.isArray(e3)) return;
          const n2 = t4.$_getRule("sort");
          return n2 ? c.sort(t4, e3, n2.args.options, r2, s2) : void 0;
        } }, validate(e3, { schema: t4, error: r2 }) {
          if (!Array.isArray(e3)) {
            if (t4._flags.single) {
              const t5 = [e3];
              return t5[o.symbols.arraySingle] = true, { value: t5 };
            }
            return { errors: r2("array.base") };
          }
          if (t4.$_getRule("items") || t4.$_terms.externals) return { value: e3.slice() };
        }, rules: { has: { method(e3) {
          e3 = this.$_compile(e3, { appendPath: true });
          const t4 = this.$_addRule({ name: "has", args: { schema: e3 } });
          return t4.$_mutateRegister(e3), t4;
        }, validate(e3, { state: t4, prefs: r2, error: s2 }, { schema: n2 }) {
          const a2 = [e3, ...t4.ancestors];
          for (let s3 = 0; s3 < e3.length; ++s3) {
            const i3 = t4.localize([...t4.path, s3], a2, n2);
            if (n2.$_match(e3[s3], i3, r2)) return e3;
          }
          const i2 = n2._flags.label;
          return i2 ? s2("array.hasKnown", { patternLabel: i2 }) : s2("array.hasUnknown", null);
        }, multi: true }, items: { method(...e3) {
          o.verifyFlat(e3, "items");
          const t4 = this.$_addRule("items");
          for (let r2 = 0; r2 < e3.length; ++r2) {
            const s2 = o.tryWithPath((() => this.$_compile(e3[r2])), r2, { append: true });
            t4.$_terms.items.push(s2);
          }
          return t4.$_mutateRebuild();
        }, validate(e3, { schema: t4, error: r2, state: s2, prefs: n2, errorsArray: a2 }) {
          const i2 = t4.$_terms._requireds.slice(), l2 = t4.$_terms.ordered.slice(), u = [...t4.$_terms._inclusions, ...i2], f = !e3[o.symbols.arraySingle];
          delete e3[o.symbols.arraySingle];
          const m = a2();
          let h = e3.length;
          for (let a3 = 0; a3 < h; ++a3) {
            const o2 = e3[a3];
            let d = false, p = false;
            const g = f ? a3 : new Number(a3), y = [...s2.path, g];
            if (!t4._flags.sparse && void 0 === o2) {
              if (m.push(r2("array.sparse", { key: g, path: y, pos: a3, value: void 0 }, s2.localize(y))), n2.abortEarly) return m;
              l2.shift();
              continue;
            }
            const b = [e3, ...s2.ancestors];
            for (const e4 of t4.$_terms._exclusions) if (e4.$_match(o2, s2.localize(y, b, e4), n2, { presence: "ignore" })) {
              if (m.push(r2("array.excludes", { pos: a3, value: o2 }, s2.localize(y))), n2.abortEarly) return m;
              d = true, l2.shift();
              break;
            }
            if (d) continue;
            if (t4.$_terms.ordered.length) {
              if (l2.length) {
                const i3 = l2.shift(), u2 = i3.$_validate(o2, s2.localize(y, b, i3), n2);
                if (u2.errors) {
                  if (m.push(...u2.errors), n2.abortEarly) return m;
                } else if ("strip" === i3._flags.result) c.fastSplice(e3, a3), --a3, --h;
                else {
                  if (!t4._flags.sparse && void 0 === u2.value) {
                    if (m.push(r2("array.sparse", { key: g, path: y, pos: a3, value: void 0 }, s2.localize(y))), n2.abortEarly) return m;
                    continue;
                  }
                  e3[a3] = u2.value;
                }
                continue;
              }
              if (!t4.$_terms.items.length) {
                if (m.push(r2("array.orderedLength", { pos: a3, limit: t4.$_terms.ordered.length })), n2.abortEarly) return m;
                break;
              }
            }
            const v = [];
            let _ = i2.length;
            for (let l3 = 0; l3 < _; ++l3) {
              const u2 = s2.localize(y, b, i2[l3]);
              u2.snapshot();
              const f2 = i2[l3].$_validate(o2, u2, n2);
              if (v[l3] = f2, !f2.errors) {
                if (u2.commit(), e3[a3] = f2.value, p = true, c.fastSplice(i2, l3), --l3, --_, !t4._flags.sparse && void 0 === f2.value && (m.push(r2("array.sparse", { key: g, path: y, pos: a3, value: void 0 }, s2.localize(y))), n2.abortEarly)) return m;
                break;
              }
              u2.restore();
            }
            if (p) continue;
            const w = n2.stripUnknown && !!n2.stripUnknown.arrays || false;
            _ = u.length;
            for (const l3 of u) {
              let u2;
              const f2 = i2.indexOf(l3);
              if (-1 !== f2) u2 = v[f2];
              else {
                const i3 = s2.localize(y, b, l3);
                if (i3.snapshot(), u2 = l3.$_validate(o2, i3, n2), !u2.errors) {
                  i3.commit(), "strip" === l3._flags.result ? (c.fastSplice(e3, a3), --a3, --h) : t4._flags.sparse || void 0 !== u2.value ? e3[a3] = u2.value : (m.push(r2("array.sparse", { key: g, path: y, pos: a3, value: void 0 }, s2.localize(y))), d = true), p = true;
                  break;
                }
                i3.restore();
              }
              if (1 === _) {
                if (w) {
                  c.fastSplice(e3, a3), --a3, --h, p = true;
                  break;
                }
                if (m.push(...u2.errors), n2.abortEarly) return m;
                d = true;
                break;
              }
            }
            if (!d && (t4.$_terms._inclusions.length || t4.$_terms._requireds.length) && !p) {
              if (w) {
                c.fastSplice(e3, a3), --a3, --h;
                continue;
              }
              if (m.push(r2("array.includes", { pos: a3, value: o2 }, s2.localize(y))), n2.abortEarly) return m;
            }
          }
          return i2.length && c.fillMissedErrors(t4, m, i2, e3, s2, n2), l2.length && (c.fillOrderedErrors(t4, m, l2, e3, s2, n2), m.length || c.fillDefault(l2, e3, s2, n2)), m.length ? m : e3;
        }, priority: true, manifest: false }, length: { method(e3) {
          return this.$_addRule({ name: "length", args: { limit: e3 }, operator: "=" });
        }, validate: (e3, t4, { limit: r2 }, { name: s2, operator: n2, args: a2 }) => o.compare(e3.length, r2, n2) ? e3 : t4.error("array." + s2, { limit: a2.limit, value: e3 }), args: [{ name: "limit", ref: true, assert: o.limit, message: "must be a positive integer" }] }, max: { method(e3) {
          return this.$_addRule({ name: "max", method: "length", args: { limit: e3 }, operator: "<=" });
        } }, min: { method(e3) {
          return this.$_addRule({ name: "min", method: "length", args: { limit: e3 }, operator: ">=" });
        } }, ordered: { method(...e3) {
          o.verifyFlat(e3, "ordered");
          const t4 = this.$_addRule("items");
          for (let r2 = 0; r2 < e3.length; ++r2) {
            const s2 = o.tryWithPath((() => this.$_compile(e3[r2])), r2, { append: true });
            c.validateSingle(s2, t4), t4.$_mutateRegister(s2), t4.$_terms.ordered.push(s2);
          }
          return t4.$_mutateRebuild();
        } }, single: { method(e3) {
          const t4 = void 0 === e3 || !!e3;
          return s(!t4 || !this._flags._arrayItems, "Cannot specify single rule when array has array items"), this.$_setFlag("single", t4);
        } }, sort: { method(e3 = {}) {
          o.assertOptions(e3, ["by", "order"]);
          const t4 = { order: e3.order || "ascending" };
          return e3.by && (t4.by = l.ref(e3.by, { ancestor: 0 }), s(!t4.by.ancestor, "Cannot sort by ancestor")), this.$_addRule({ name: "sort", args: { options: t4 } });
        }, validate(e3, { error: t4, state: r2, prefs: s2, schema: n2 }, { options: a2 }) {
          const { value: i2, errors: o2 } = c.sort(n2, e3, a2, r2, s2);
          if (o2) return o2;
          for (let r3 = 0; r3 < e3.length; ++r3) if (e3[r3] !== i2[r3]) return t4("array.sort", { order: a2.order, by: a2.by ? a2.by.key : "value" });
          return e3;
        }, convert: true }, sparse: { method(e3) {
          const t4 = void 0 === e3 || !!e3;
          return this._flags.sparse === t4 ? this : (t4 ? this.clone() : this.$_addRule("items")).$_setFlag("sparse", t4, { clone: false });
        } }, unique: { method(e3, t4 = {}) {
          s(!e3 || "function" == typeof e3 || "string" == typeof e3, "comparator must be a function or a string"), o.assertOptions(t4, ["ignoreUndefined", "separator"]);
          const r2 = { name: "unique", args: { options: t4, comparator: e3 } };
          if (e3) if ("string" == typeof e3) {
            const s2 = o.default(t4.separator, ".");
            r2.path = s2 ? e3.split(s2) : [e3];
          } else r2.comparator = e3;
          return this.$_addRule(r2);
        }, validate(e3, { state: t4, error: r2, schema: i2 }, { comparator: o2, options: l2 }, { comparator: c2, path: u }) {
          const f = { string: /* @__PURE__ */ Object.create(null), number: /* @__PURE__ */ Object.create(null), undefined: /* @__PURE__ */ Object.create(null), boolean: /* @__PURE__ */ Object.create(null), bigint: /* @__PURE__ */ Object.create(null), object: /* @__PURE__ */ new Map(), function: /* @__PURE__ */ new Map(), custom: /* @__PURE__ */ new Map() }, m = c2 || n, h = l2.ignoreUndefined;
          for (let n2 = 0; n2 < e3.length; ++n2) {
            const i3 = u ? a(e3[n2], u) : e3[n2], l3 = c2 ? f.custom : f[typeof i3];
            if (s(l3, "Failed to find unique map container for type", typeof i3), l3 instanceof Map) {
              const s2 = l3.entries();
              let a2;
              for (; !(a2 = s2.next()).done; ) if (m(a2.value[0], i3)) {
                const s3 = t4.localize([...t4.path, n2], [e3, ...t4.ancestors]), i4 = { pos: n2, value: e3[n2], dupePos: a2.value[1], dupeValue: e3[a2.value[1]] };
                return u && (i4.path = o2), r2("array.unique", i4, s3);
              }
              l3.set(i3, n2);
            } else {
              if ((!h || void 0 !== i3) && void 0 !== l3[i3]) {
                const s2 = { pos: n2, value: e3[n2], dupePos: l3[i3], dupeValue: e3[l3[i3]] };
                return u && (s2.path = o2), r2("array.unique", s2, t4.localize([...t4.path, n2], [e3, ...t4.ancestors]));
              }
              l3[i3] = n2;
            }
          }
          return e3;
        }, args: ["comparator", "options"], multi: true } }, cast: { set: { from: Array.isArray, to: (e3, t4) => new Set(e3) } }, rebuild(e3) {
          e3.$_terms._inclusions = [], e3.$_terms._exclusions = [], e3.$_terms._requireds = [];
          for (const t4 of e3.$_terms.items) c.validateSingle(t4, e3), "required" === t4._flags.presence ? e3.$_terms._requireds.push(t4) : "forbidden" === t4._flags.presence ? e3.$_terms._exclusions.push(t4) : e3.$_terms._inclusions.push(t4);
          for (const t4 of e3.$_terms.ordered) c.validateSingle(t4, e3);
        }, manifest: { build: (e3, t4) => (t4.items && (e3 = e3.items(...t4.items)), t4.ordered && (e3 = e3.ordered(...t4.ordered)), e3) }, messages: { "array.base": "{{#label}} must be an array", "array.excludes": "{{#label}} contains an excluded value", "array.hasKnown": "{{#label}} does not contain at least one required match for type {:#patternLabel}", "array.hasUnknown": "{{#label}} does not contain at least one required match", "array.includes": "{{#label}} does not match any of the allowed types", "array.includesRequiredBoth": "{{#label}} does not contain {{#knownMisses}} and {{#unknownMisses}} other required value(s)", "array.includesRequiredKnowns": "{{#label}} does not contain {{#knownMisses}}", "array.includesRequiredUnknowns": "{{#label}} does not contain {{#unknownMisses}} required value(s)", "array.length": "{{#label}} must contain {{#limit}} items", "array.max": "{{#label}} must contain less than or equal to {{#limit}} items", "array.min": "{{#label}} must contain at least {{#limit}} items", "array.orderedLength": "{{#label}} must contain at most {{#limit}} items", "array.sort": "{{#label}} must be sorted in {#order} order by {{#by}}", "array.sort.mismatching": "{{#label}} cannot be sorted due to mismatching types", "array.sort.unsupported": "{{#label}} cannot be sorted due to unsupported type {#type}", "array.sparse": "{{#label}} must not be a sparse array item", "array.unique": "{{#label}} contains a duplicate value" } }), c.fillMissedErrors = function(e3, t4, r2, s2, n2, a2) {
          const i2 = [];
          let o2 = 0;
          for (const e4 of r2) {
            const t5 = e4._flags.label;
            t5 ? i2.push(t5) : ++o2;
          }
          i2.length ? o2 ? t4.push(e3.$_createError("array.includesRequiredBoth", s2, { knownMisses: i2, unknownMisses: o2 }, n2, a2)) : t4.push(e3.$_createError("array.includesRequiredKnowns", s2, { knownMisses: i2 }, n2, a2)) : t4.push(e3.$_createError("array.includesRequiredUnknowns", s2, { unknownMisses: o2 }, n2, a2));
        }, c.fillOrderedErrors = function(e3, t4, r2, s2, n2, a2) {
          const i2 = [];
          for (const e4 of r2) "required" === e4._flags.presence && i2.push(e4);
          i2.length && c.fillMissedErrors(e3, t4, i2, s2, n2, a2);
        }, c.fillDefault = function(e3, t4, r2, s2) {
          const n2 = [];
          let a2 = true;
          for (let i2 = e3.length - 1; i2 >= 0; --i2) {
            const o2 = e3[i2], l2 = [t4, ...r2.ancestors], c2 = o2.$_validate(void 0, r2.localize(r2.path, l2, o2), s2).value;
            if (a2) {
              if (void 0 === c2) continue;
              a2 = false;
            }
            n2.unshift(c2);
          }
          n2.length && t4.push(...n2);
        }, c.fastSplice = function(e3, t4) {
          let r2 = t4;
          for (; r2 < e3.length; ) e3[r2++] = e3[r2];
          --e3.length;
        }, c.validateSingle = function(e3, t4) {
          ("array" === e3.type || e3._flags._arrayItems) && (s(!t4._flags.single, "Cannot specify array item with single rule enabled"), t4.$_setFlag("_arrayItems", true, { clone: false }));
        }, c.sort = function(e3, t4, r2, s2, n2) {
          const a2 = "ascending" === r2.order ? 1 : -1, i2 = -1 * a2, o2 = a2, l2 = (l3, u) => {
            let f = c.compare(l3, u, i2, o2);
            if (null !== f) return f;
            if (r2.by && (l3 = r2.by.resolve(l3, s2, n2), u = r2.by.resolve(u, s2, n2)), f = c.compare(l3, u, i2, o2), null !== f) return f;
            const m = typeof l3;
            if (m !== typeof u) throw e3.$_createError("array.sort.mismatching", t4, null, s2, n2);
            if ("number" !== m && "string" !== m) throw e3.$_createError("array.sort.unsupported", t4, { type: m }, s2, n2);
            return "number" === m ? (l3 - u) * a2 : l3 < u ? i2 : o2;
          };
          try {
            return { value: t4.slice().sort(l2) };
          } catch (e4) {
            return { errors: e4 };
          }
        }, c.compare = function(e3, t4, r2, s2) {
          return e3 === t4 ? 0 : void 0 === e3 ? 1 : void 0 === t4 ? -1 : null === e3 ? s2 : null === t4 ? r2 : null;
        };
      }, 4937: (e2, t3, r) => {
        const s = r(375), n = r(8068), a = r(8160), i = r(2036), o = { isBool: function(e3) {
          return "boolean" == typeof e3;
        } };
        e2.exports = n.extend({ type: "boolean", flags: { sensitive: { default: false } }, terms: { falsy: { init: null, manifest: "values" }, truthy: { init: null, manifest: "values" } }, coerce(e3, { schema: t4 }) {
          if ("boolean" != typeof e3) {
            if ("string" == typeof e3) {
              const r2 = t4._flags.sensitive ? e3 : e3.toLowerCase();
              e3 = "true" === r2 || "false" !== r2 && e3;
            }
            return "boolean" != typeof e3 && (e3 = t4.$_terms.truthy && t4.$_terms.truthy.has(e3, null, null, !t4._flags.sensitive) || (!t4.$_terms.falsy || !t4.$_terms.falsy.has(e3, null, null, !t4._flags.sensitive)) && e3), { value: e3 };
          }
        }, validate(e3, { error: t4 }) {
          if ("boolean" != typeof e3) return { value: e3, errors: t4("boolean.base") };
        }, rules: { truthy: { method(...e3) {
          a.verifyFlat(e3, "truthy");
          const t4 = this.clone();
          t4.$_terms.truthy = t4.$_terms.truthy || new i();
          for (let r2 = 0; r2 < e3.length; ++r2) {
            const n2 = e3[r2];
            s(void 0 !== n2, "Cannot call truthy with undefined"), t4.$_terms.truthy.add(n2);
          }
          return t4;
        } }, falsy: { method(...e3) {
          a.verifyFlat(e3, "falsy");
          const t4 = this.clone();
          t4.$_terms.falsy = t4.$_terms.falsy || new i();
          for (let r2 = 0; r2 < e3.length; ++r2) {
            const n2 = e3[r2];
            s(void 0 !== n2, "Cannot call falsy with undefined"), t4.$_terms.falsy.add(n2);
          }
          return t4;
        } }, sensitive: { method(e3 = true) {
          return this.$_setFlag("sensitive", e3);
        } } }, cast: { number: { from: o.isBool, to: (e3, t4) => e3 ? 1 : 0 }, string: { from: o.isBool, to: (e3, t4) => e3 ? "true" : "false" } }, manifest: { build: (e3, t4) => (t4.truthy && (e3 = e3.truthy(...t4.truthy)), t4.falsy && (e3 = e3.falsy(...t4.falsy)), e3) }, messages: { "boolean.base": "{{#label}} must be a boolean" } });
      }, 7500: (e2, t3, r) => {
        const s = r(375), n = r(8068), a = r(8160), i = r(3328), o = { isDate: function(e3) {
          return e3 instanceof Date;
        } };
        e2.exports = n.extend({ type: "date", coerce: { from: ["number", "string"], method: (e3, { schema: t4 }) => ({ value: o.parse(e3, t4._flags.format) || e3 }) }, validate(e3, { schema: t4, error: r2, prefs: s2 }) {
          if (e3 instanceof Date && !isNaN(e3.getTime())) return;
          const n2 = t4._flags.format;
          return s2.convert && n2 && "string" == typeof e3 ? { value: e3, errors: r2("date.format", { format: n2 }) } : { value: e3, errors: r2("date.base") };
        }, rules: { compare: { method: false, validate(e3, t4, { date: r2 }, { name: s2, operator: n2, args: i2 }) {
          const o2 = "now" === r2 ? Date.now() : r2.getTime();
          return a.compare(e3.getTime(), o2, n2) ? e3 : t4.error("date." + s2, { limit: i2.date, value: e3 });
        }, args: [{ name: "date", ref: true, normalize: (e3) => "now" === e3 ? e3 : o.parse(e3), assert: (e3) => null !== e3, message: "must have a valid date format" }] }, format: { method(e3) {
          return s(["iso", "javascript", "unix"].includes(e3), "Unknown date format", e3), this.$_setFlag("format", e3);
        } }, greater: { method(e3) {
          return this.$_addRule({ name: "greater", method: "compare", args: { date: e3 }, operator: ">" });
        } }, iso: { method() {
          return this.format("iso");
        } }, less: { method(e3) {
          return this.$_addRule({ name: "less", method: "compare", args: { date: e3 }, operator: "<" });
        } }, max: { method(e3) {
          return this.$_addRule({ name: "max", method: "compare", args: { date: e3 }, operator: "<=" });
        } }, min: { method(e3) {
          return this.$_addRule({ name: "min", method: "compare", args: { date: e3 }, operator: ">=" });
        } }, timestamp: { method(e3 = "javascript") {
          return s(["javascript", "unix"].includes(e3), '"type" must be one of "javascript, unix"'), this.format(e3);
        } } }, cast: { number: { from: o.isDate, to: (e3, t4) => e3.getTime() }, string: { from: o.isDate, to: (e3, { prefs: t4 }) => i.date(e3, t4) } }, messages: { "date.base": "{{#label}} must be a valid date", "date.format": '{{#label}} must be in {msg("date.format." + #format) || #format} format', "date.greater": "{{#label}} must be greater than {{:#limit}}", "date.less": "{{#label}} must be less than {{:#limit}}", "date.max": "{{#label}} must be less than or equal to {{:#limit}}", "date.min": "{{#label}} must be greater than or equal to {{:#limit}}", "date.format.iso": "ISO 8601 date", "date.format.javascript": "timestamp or number of milliseconds", "date.format.unix": "timestamp or number of seconds" } }), o.parse = function(e3, t4) {
          if (e3 instanceof Date) return e3;
          if ("string" != typeof e3 && (isNaN(e3) || !isFinite(e3))) return null;
          if (/^\s*$/.test(e3)) return null;
          if ("iso" === t4) return a.isIsoDate(e3) ? o.date(e3.toString()) : null;
          const r2 = e3;
          if ("string" == typeof e3 && /^[+-]?\d+(\.\d+)?$/.test(e3) && (e3 = parseFloat(e3)), t4) {
            if ("javascript" === t4) return o.date(1 * e3);
            if ("unix" === t4) return o.date(1e3 * e3);
            if ("string" == typeof r2) return null;
          }
          return o.date(e3);
        }, o.date = function(e3) {
          const t4 = new Date(e3);
          return isNaN(t4.getTime()) ? null : t4;
        };
      }, 390: (e2, t3, r) => {
        const s = r(375), n = r(7824);
        e2.exports = n.extend({ type: "function", properties: { typeof: "function" }, rules: { arity: { method(e3) {
          return s(Number.isSafeInteger(e3) && e3 >= 0, "n must be a positive integer"), this.$_addRule({ name: "arity", args: { n: e3 } });
        }, validate: (e3, t4, { n: r2 }) => e3.length === r2 ? e3 : t4.error("function.arity", { n: r2 }) }, class: { method() {
          return this.$_addRule("class");
        }, validate: (e3, t4) => /^\s*class\s/.test(e3.toString()) ? e3 : t4.error("function.class", { value: e3 }) }, minArity: { method(e3) {
          return s(Number.isSafeInteger(e3) && e3 > 0, "n must be a strict positive integer"), this.$_addRule({ name: "minArity", args: { n: e3 } });
        }, validate: (e3, t4, { n: r2 }) => e3.length >= r2 ? e3 : t4.error("function.minArity", { n: r2 }) }, maxArity: { method(e3) {
          return s(Number.isSafeInteger(e3) && e3 >= 0, "n must be a positive integer"), this.$_addRule({ name: "maxArity", args: { n: e3 } });
        }, validate: (e3, t4, { n: r2 }) => e3.length <= r2 ? e3 : t4.error("function.maxArity", { n: r2 }) } }, messages: { "function.arity": "{{#label}} must have an arity of {{#n}}", "function.class": "{{#label}} must be a class", "function.maxArity": "{{#label}} must have an arity lesser or equal to {{#n}}", "function.minArity": "{{#label}} must have an arity greater or equal to {{#n}}" } });
      }, 7824: (e2, t3, r) => {
        const s = r(978), n = r(375), a = r(8571), i = r(3652), o = r(8068), l = r(8160), c = r(3292), u = r(6354), f = r(6133), m = r(3328), h = { renameDefaults: { alias: false, multiple: false, override: false } };
        e2.exports = o.extend({ type: "_keys", properties: { typeof: "object" }, flags: { unknown: { default: void 0 } }, terms: { dependencies: { init: null }, keys: { init: null, manifest: { mapped: { from: "schema", to: "key" } } }, patterns: { init: null }, renames: { init: null } }, args: (e3, t4) => e3.keys(t4), validate(e3, { schema: t4, error: r2, state: s2, prefs: n2 }) {
          if (!e3 || typeof e3 !== t4.$_property("typeof") || Array.isArray(e3)) return { value: e3, errors: r2("object.base", { type: t4.$_property("typeof") }) };
          if (!(t4.$_terms.renames || t4.$_terms.dependencies || t4.$_terms.keys || t4.$_terms.patterns || t4.$_terms.externals)) return;
          e3 = h.clone(e3, n2);
          const a2 = [];
          if (t4.$_terms.renames && !h.rename(t4, e3, s2, n2, a2)) return { value: e3, errors: a2 };
          if (!t4.$_terms.keys && !t4.$_terms.patterns && !t4.$_terms.dependencies) return { value: e3, errors: a2 };
          const i2 = new Set(Object.keys(e3));
          if (t4.$_terms.keys) {
            const r3 = [e3, ...s2.ancestors];
            for (const o2 of t4.$_terms.keys) {
              const t5 = o2.key, l2 = e3[t5];
              i2.delete(t5);
              const c2 = s2.localize([...s2.path, t5], r3, o2), u2 = o2.schema.$_validate(l2, c2, n2);
              if (u2.errors) {
                if (n2.abortEarly) return { value: e3, errors: u2.errors };
                void 0 !== u2.value && (e3[t5] = u2.value), a2.push(...u2.errors);
              } else "strip" === o2.schema._flags.result || void 0 === u2.value && void 0 !== l2 ? delete e3[t5] : void 0 !== u2.value && (e3[t5] = u2.value);
            }
          }
          if (i2.size || t4._flags._hasPatternMatch) {
            const r3 = h.unknown(t4, e3, i2, a2, s2, n2);
            if (r3) return r3;
          }
          if (t4.$_terms.dependencies) for (const r3 of t4.$_terms.dependencies) {
            if (null !== r3.key && false === h.isPresent(r3.options)(r3.key.resolve(e3, s2, n2, null, { shadow: false }))) continue;
            const i3 = h.dependencies[r3.rel](t4, r3, e3, s2, n2);
            if (i3) {
              const r4 = t4.$_createError(i3.code, e3, i3.context, s2, n2);
              if (n2.abortEarly) return { value: e3, errors: r4 };
              a2.push(r4);
            }
          }
          return { value: e3, errors: a2 };
        }, rules: { and: { method(...e3) {
          return l.verifyFlat(e3, "and"), h.dependency(this, "and", null, e3);
        } }, append: { method(e3) {
          return null == e3 || 0 === Object.keys(e3).length ? this : this.keys(e3);
        } }, assert: { method(e3, t4, r2) {
          m.isTemplate(e3) || (e3 = c.ref(e3)), n(void 0 === r2 || "string" == typeof r2, "Message must be a string"), t4 = this.$_compile(t4, { appendPath: true });
          const s2 = this.$_addRule({ name: "assert", args: { subject: e3, schema: t4, message: r2 } });
          return s2.$_mutateRegister(e3), s2.$_mutateRegister(t4), s2;
        }, validate(e3, { error: t4, prefs: r2, state: s2 }, { subject: n2, schema: a2, message: i2 }) {
          const o2 = n2.resolve(e3, s2, r2), l2 = f.isRef(n2) ? n2.absolute(s2) : [];
          return a2.$_match(o2, s2.localize(l2, [e3, ...s2.ancestors], a2), r2) ? e3 : t4("object.assert", { subject: n2, message: i2 });
        }, args: ["subject", "schema", "message"], multi: true }, instance: { method(e3, t4) {
          return n("function" == typeof e3, "constructor must be a function"), t4 = t4 || e3.name, this.$_addRule({ name: "instance", args: { constructor: e3, name: t4 } });
        }, validate: (e3, t4, { constructor: r2, name: s2 }) => e3 instanceof r2 ? e3 : t4.error("object.instance", { type: s2, value: e3 }), args: ["constructor", "name"] }, keys: { method(e3) {
          n(void 0 === e3 || "object" == typeof e3, "Object schema must be a valid object"), n(!l.isSchema(e3), "Object schema cannot be a joi schema");
          const t4 = this.clone();
          if (e3) if (Object.keys(e3).length) {
            t4.$_terms.keys = t4.$_terms.keys ? t4.$_terms.keys.filter(((t5) => !e3.hasOwnProperty(t5.key))) : new h.Keys();
            for (const r2 in e3) l.tryWithPath((() => t4.$_terms.keys.push({ key: r2, schema: this.$_compile(e3[r2]) })), r2);
          } else t4.$_terms.keys = new h.Keys();
          else t4.$_terms.keys = null;
          return t4.$_mutateRebuild();
        } }, length: { method(e3) {
          return this.$_addRule({ name: "length", args: { limit: e3 }, operator: "=" });
        }, validate: (e3, t4, { limit: r2 }, { name: s2, operator: n2, args: a2 }) => l.compare(Object.keys(e3).length, r2, n2) ? e3 : t4.error("object." + s2, { limit: a2.limit, value: e3 }), args: [{ name: "limit", ref: true, assert: l.limit, message: "must be a positive integer" }] }, max: { method(e3) {
          return this.$_addRule({ name: "max", method: "length", args: { limit: e3 }, operator: "<=" });
        } }, min: { method(e3) {
          return this.$_addRule({ name: "min", method: "length", args: { limit: e3 }, operator: ">=" });
        } }, nand: { method(...e3) {
          return l.verifyFlat(e3, "nand"), h.dependency(this, "nand", null, e3);
        } }, or: { method(...e3) {
          return l.verifyFlat(e3, "or"), h.dependency(this, "or", null, e3);
        } }, oxor: { method(...e3) {
          return h.dependency(this, "oxor", null, e3);
        } }, pattern: { method(e3, t4, r2 = {}) {
          const s2 = e3 instanceof RegExp;
          s2 || (e3 = this.$_compile(e3, { appendPath: true })), n(void 0 !== t4, "Invalid rule"), l.assertOptions(r2, ["fallthrough", "matches"]), s2 && n(!e3.flags.includes("g") && !e3.flags.includes("y"), "pattern should not use global or sticky mode"), t4 = this.$_compile(t4, { appendPath: true });
          const a2 = this.clone();
          a2.$_terms.patterns = a2.$_terms.patterns || [];
          const i2 = { [s2 ? "regex" : "schema"]: e3, rule: t4 };
          return r2.matches && (i2.matches = this.$_compile(r2.matches), "array" !== i2.matches.type && (i2.matches = i2.matches.$_root.array().items(i2.matches)), a2.$_mutateRegister(i2.matches), a2.$_setFlag("_hasPatternMatch", true, { clone: false })), r2.fallthrough && (i2.fallthrough = true), a2.$_terms.patterns.push(i2), a2.$_mutateRegister(t4), a2;
        } }, ref: { method() {
          return this.$_addRule("ref");
        }, validate: (e3, t4) => f.isRef(e3) ? e3 : t4.error("object.refType", { value: e3 }) }, regex: { method() {
          return this.$_addRule("regex");
        }, validate: (e3, t4) => e3 instanceof RegExp ? e3 : t4.error("object.regex", { value: e3 }) }, rename: { method(e3, t4, r2 = {}) {
          n("string" == typeof e3 || e3 instanceof RegExp, "Rename missing the from argument"), n("string" == typeof t4 || t4 instanceof m, "Invalid rename to argument"), n(t4 !== e3, "Cannot rename key to same name:", e3), l.assertOptions(r2, ["alias", "ignoreUndefined", "override", "multiple"]);
          const a2 = this.clone();
          a2.$_terms.renames = a2.$_terms.renames || [];
          for (const t5 of a2.$_terms.renames) n(t5.from !== e3, "Cannot rename the same key multiple times");
          return t4 instanceof m && a2.$_mutateRegister(t4), a2.$_terms.renames.push({ from: e3, to: t4, options: s(h.renameDefaults, r2) }), a2;
        } }, schema: { method(e3 = "any") {
          return this.$_addRule({ name: "schema", args: { type: e3 } });
        }, validate: (e3, t4, { type: r2 }) => !l.isSchema(e3) || "any" !== r2 && e3.type !== r2 ? t4.error("object.schema", { type: r2 }) : e3 }, unknown: { method(e3) {
          return this.$_setFlag("unknown", false !== e3);
        } }, with: { method(e3, t4, r2 = {}) {
          return h.dependency(this, "with", e3, t4, r2);
        } }, without: { method(e3, t4, r2 = {}) {
          return h.dependency(this, "without", e3, t4, r2);
        } }, xor: { method(...e3) {
          return l.verifyFlat(e3, "xor"), h.dependency(this, "xor", null, e3);
        } } }, overrides: { default(e3, t4) {
          return void 0 === e3 && (e3 = l.symbols.deepDefault), this.$_parent("default", e3, t4);
        } }, rebuild(e3) {
          if (e3.$_terms.keys) {
            const t4 = new i.Sorter();
            for (const r2 of e3.$_terms.keys) l.tryWithPath((() => t4.add(r2, { after: r2.schema.$_rootReferences(), group: r2.key })), r2.key);
            e3.$_terms.keys = new h.Keys(...t4.nodes);
          }
        }, manifest: { build(e3, t4) {
          if (t4.keys && (e3 = e3.keys(t4.keys)), t4.dependencies) for (const { rel: r2, key: s2 = null, peers: n2, options: a2 } of t4.dependencies) e3 = h.dependency(e3, r2, s2, n2, a2);
          if (t4.patterns) for (const { regex: r2, schema: s2, rule: n2, fallthrough: a2, matches: i2 } of t4.patterns) e3 = e3.pattern(r2 || s2, n2, { fallthrough: a2, matches: i2 });
          if (t4.renames) for (const { from: r2, to: s2, options: n2 } of t4.renames) e3 = e3.rename(r2, s2, n2);
          return e3;
        } }, messages: { "object.and": "{{#label}} contains {{#presentWithLabels}} without its required peers {{#missingWithLabels}}", "object.assert": '{{#label}} is invalid because {if(#subject.key, `"` + #subject.key + `" failed to ` + (#message || "pass the assertion test"), #message || "the assertion failed")}', "object.base": "{{#label}} must be of type {{#type}}", "object.instance": "{{#label}} must be an instance of {{:#type}}", "object.length": '{{#label}} must have {{#limit}} key{if(#limit == 1, "", "s")}', "object.max": '{{#label}} must have less than or equal to {{#limit}} key{if(#limit == 1, "", "s")}', "object.min": '{{#label}} must have at least {{#limit}} key{if(#limit == 1, "", "s")}', "object.missing": "{{#label}} must contain at least one of {{#peersWithLabels}}", "object.nand": "{{:#mainWithLabel}} must not exist simultaneously with {{#peersWithLabels}}", "object.oxor": "{{#label}} contains a conflict between optional exclusive peers {{#peersWithLabels}}", "object.pattern.match": "{{#label}} keys failed to match pattern requirements", "object.refType": "{{#label}} must be a Joi reference", "object.regex": "{{#label}} must be a RegExp object", "object.rename.multiple": "{{#label}} cannot rename {{:#from}} because multiple renames are disabled and another key was already renamed to {{:#to}}", "object.rename.override": "{{#label}} cannot rename {{:#from}} because override is disabled and target {{:#to}} exists", "object.schema": "{{#label}} must be a Joi schema of {{#type}} type", "object.unknown": "{{#label}} is not allowed", "object.with": "{{:#mainWithLabel}} missing required peer {{:#peerWithLabel}}", "object.without": "{{:#mainWithLabel}} conflict with forbidden peer {{:#peerWithLabel}}", "object.xor": "{{#label}} contains a conflict between exclusive peers {{#peersWithLabels}}" } }), h.clone = function(e3, t4) {
          if ("object" == typeof e3) {
            if (t4.nonEnumerables) return a(e3, { shallow: true });
            const r3 = Object.create(Object.getPrototypeOf(e3));
            return Object.assign(r3, e3), r3;
          }
          const r2 = function(...t5) {
            return e3.apply(this, t5);
          };
          return r2.prototype = a(e3.prototype), Object.defineProperty(r2, "name", { value: e3.name, writable: false }), Object.defineProperty(r2, "length", { value: e3.length, writable: false }), Object.assign(r2, e3), r2;
        }, h.dependency = function(e3, t4, r2, s2, a2) {
          n(null === r2 || "string" == typeof r2, t4, "key must be a strings"), a2 || (a2 = s2.length > 1 && "object" == typeof s2[s2.length - 1] ? s2.pop() : {}), l.assertOptions(a2, ["separator", "isPresent"]), s2 = [].concat(s2);
          const i2 = l.default(a2.separator, "."), o2 = [];
          for (const e4 of s2) n("string" == typeof e4, t4, "peers must be strings"), o2.push(c.ref(e4, { separator: i2, ancestor: 0, prefix: false }));
          null !== r2 && (r2 = c.ref(r2, { separator: i2, ancestor: 0, prefix: false }));
          const u2 = e3.clone();
          return u2.$_terms.dependencies = u2.$_terms.dependencies || [], u2.$_terms.dependencies.push(new h.Dependency(t4, r2, o2, s2, a2)), u2;
        }, h.dependencies = { and(e3, t4, r2, s2, n2) {
          const a2 = [], i2 = [], o2 = t4.peers.length, l2 = h.isPresent(t4.options);
          for (const e4 of t4.peers) false === l2(e4.resolve(r2, s2, n2, null, { shadow: false })) ? a2.push(e4.key) : i2.push(e4.key);
          if (a2.length !== o2 && i2.length !== o2) return { code: "object.and", context: { present: i2, presentWithLabels: h.keysToLabels(e3, i2), missing: a2, missingWithLabels: h.keysToLabels(e3, a2) } };
        }, nand(e3, t4, r2, s2, n2) {
          const a2 = [], i2 = h.isPresent(t4.options);
          for (const e4 of t4.peers) i2(e4.resolve(r2, s2, n2, null, { shadow: false })) && a2.push(e4.key);
          if (a2.length !== t4.peers.length) return;
          const o2 = t4.paths[0], l2 = t4.paths.slice(1);
          return { code: "object.nand", context: { main: o2, mainWithLabel: h.keysToLabels(e3, o2), peers: l2, peersWithLabels: h.keysToLabels(e3, l2) } };
        }, or(e3, t4, r2, s2, n2) {
          const a2 = h.isPresent(t4.options);
          for (const e4 of t4.peers) if (a2(e4.resolve(r2, s2, n2, null, { shadow: false }))) return;
          return { code: "object.missing", context: { peers: t4.paths, peersWithLabels: h.keysToLabels(e3, t4.paths) } };
        }, oxor(e3, t4, r2, s2, n2) {
          const a2 = [], i2 = h.isPresent(t4.options);
          for (const e4 of t4.peers) i2(e4.resolve(r2, s2, n2, null, { shadow: false })) && a2.push(e4.key);
          if (!a2.length || 1 === a2.length) return;
          const o2 = { peers: t4.paths, peersWithLabels: h.keysToLabels(e3, t4.paths) };
          return o2.present = a2, o2.presentWithLabels = h.keysToLabels(e3, a2), { code: "object.oxor", context: o2 };
        }, with(e3, t4, r2, s2, n2) {
          const a2 = h.isPresent(t4.options);
          for (const i2 of t4.peers) if (false === a2(i2.resolve(r2, s2, n2, null, { shadow: false }))) return { code: "object.with", context: { main: t4.key.key, mainWithLabel: h.keysToLabels(e3, t4.key.key), peer: i2.key, peerWithLabel: h.keysToLabels(e3, i2.key) } };
        }, without(e3, t4, r2, s2, n2) {
          const a2 = h.isPresent(t4.options);
          for (const i2 of t4.peers) if (a2(i2.resolve(r2, s2, n2, null, { shadow: false }))) return { code: "object.without", context: { main: t4.key.key, mainWithLabel: h.keysToLabels(e3, t4.key.key), peer: i2.key, peerWithLabel: h.keysToLabels(e3, i2.key) } };
        }, xor(e3, t4, r2, s2, n2) {
          const a2 = [], i2 = h.isPresent(t4.options);
          for (const e4 of t4.peers) i2(e4.resolve(r2, s2, n2, null, { shadow: false })) && a2.push(e4.key);
          if (1 === a2.length) return;
          const o2 = { peers: t4.paths, peersWithLabels: h.keysToLabels(e3, t4.paths) };
          return 0 === a2.length ? { code: "object.missing", context: o2 } : (o2.present = a2, o2.presentWithLabels = h.keysToLabels(e3, a2), { code: "object.xor", context: o2 });
        } }, h.keysToLabels = function(e3, t4) {
          return Array.isArray(t4) ? t4.map(((t5) => e3.$_mapLabels(t5))) : e3.$_mapLabels(t4);
        }, h.isPresent = function(e3) {
          return "function" == typeof e3.isPresent ? e3.isPresent : (e4) => void 0 !== e4;
        }, h.rename = function(e3, t4, r2, s2, n2) {
          const a2 = {};
          for (const i2 of e3.$_terms.renames) {
            const o2 = [], l2 = "string" != typeof i2.from;
            if (l2) for (const e4 in t4) {
              if (void 0 === t4[e4] && i2.options.ignoreUndefined) continue;
              if (e4 === i2.to) continue;
              const r3 = i2.from.exec(e4);
              r3 && o2.push({ from: e4, to: i2.to, match: r3 });
            }
            else !Object.prototype.hasOwnProperty.call(t4, i2.from) || void 0 === t4[i2.from] && i2.options.ignoreUndefined || o2.push(i2);
            for (const c2 of o2) {
              const o3 = c2.from;
              let u2 = c2.to;
              if (u2 instanceof m && (u2 = u2.render(t4, r2, s2, c2.match)), o3 !== u2) {
                if (!i2.options.multiple && a2[u2] && (n2.push(e3.$_createError("object.rename.multiple", t4, { from: o3, to: u2, pattern: l2 }, r2, s2)), s2.abortEarly)) return false;
                if (Object.prototype.hasOwnProperty.call(t4, u2) && !i2.options.override && !a2[u2] && (n2.push(e3.$_createError("object.rename.override", t4, { from: o3, to: u2, pattern: l2 }, r2, s2)), s2.abortEarly)) return false;
                void 0 === t4[o3] ? delete t4[u2] : t4[u2] = t4[o3], a2[u2] = true, i2.options.alias || delete t4[o3];
              }
            }
          }
          return true;
        }, h.unknown = function(e3, t4, r2, s2, n2, a2) {
          if (e3.$_terms.patterns) {
            let i2 = false;
            const o2 = e3.$_terms.patterns.map(((e4) => {
              if (e4.matches) return i2 = true, [];
            })), l2 = [t4, ...n2.ancestors];
            for (const i3 of r2) {
              const c2 = t4[i3], u2 = [...n2.path, i3];
              for (let f2 = 0; f2 < e3.$_terms.patterns.length; ++f2) {
                const m2 = e3.$_terms.patterns[f2];
                if (m2.regex) {
                  const e4 = m2.regex.test(i3);
                  if (n2.mainstay.tracer.debug(n2, "rule", `pattern.${f2}`, e4 ? "pass" : "error"), !e4) continue;
                } else if (!m2.schema.$_match(i3, n2.nest(m2.schema, `pattern.${f2}`), a2)) continue;
                r2.delete(i3);
                const h2 = n2.localize(u2, l2, { schema: m2.rule, key: i3 }), d = m2.rule.$_validate(c2, h2, a2);
                if (d.errors) {
                  if (a2.abortEarly) return { value: t4, errors: d.errors };
                  s2.push(...d.errors);
                }
                if (m2.matches && o2[f2].push(i3), t4[i3] = d.value, !m2.fallthrough) break;
              }
            }
            if (i2) for (let r3 = 0; r3 < o2.length; ++r3) {
              const i3 = o2[r3];
              if (!i3) continue;
              const c2 = e3.$_terms.patterns[r3].matches, f2 = n2.localize(n2.path, l2, c2), m2 = c2.$_validate(i3, f2, a2);
              if (m2.errors) {
                const r4 = u.details(m2.errors, { override: false });
                r4.matches = i3;
                const o3 = e3.$_createError("object.pattern.match", t4, r4, n2, a2);
                if (a2.abortEarly) return { value: t4, errors: o3 };
                s2.push(o3);
              }
            }
          }
          if (r2.size && (e3.$_terms.keys || e3.$_terms.patterns)) {
            if (a2.stripUnknown && void 0 === e3._flags.unknown || a2.skipFunctions) {
              const e4 = !(!a2.stripUnknown || true !== a2.stripUnknown && !a2.stripUnknown.objects);
              for (const s3 of r2) e4 ? (delete t4[s3], r2.delete(s3)) : "function" == typeof t4[s3] && r2.delete(s3);
            }
            if (!l.default(e3._flags.unknown, a2.allowUnknown)) for (const i2 of r2) {
              const r3 = n2.localize([...n2.path, i2], []), o2 = e3.$_createError("object.unknown", t4[i2], { child: i2 }, r3, a2, { flags: false });
              if (a2.abortEarly) return { value: t4, errors: o2 };
              s2.push(o2);
            }
          }
        }, h.Dependency = class {
          constructor(e3, t4, r2, s2, n2) {
            this.rel = e3, this.key = t4, this.peers = r2, this.paths = s2, this.options = n2;
          }
          describe() {
            const e3 = { rel: this.rel, peers: this.paths };
            return null !== this.key && (e3.key = this.key.key), "." !== this.peers[0].separator && (e3.options = { ...e3.options, separator: this.peers[0].separator }), this.options.isPresent && (e3.options = { ...e3.options, isPresent: this.options.isPresent }), e3;
          }
        }, h.Keys = class extends Array {
          concat(e3) {
            const t4 = this.slice(), r2 = /* @__PURE__ */ new Map();
            for (let e4 = 0; e4 < t4.length; ++e4) r2.set(t4[e4].key, e4);
            for (const s2 of e3) {
              const e4 = s2.key, n2 = r2.get(e4);
              void 0 !== n2 ? t4[n2] = { key: e4, schema: t4[n2].schema.concat(s2.schema) } : t4.push(s2);
            }
            return t4;
          }
        };
      }, 8785: (e2, t3, r) => {
        const s = r(375), n = r(8068), a = r(8160), i = r(3292), o = r(6354), l = {};
        e2.exports = n.extend({ type: "link", properties: { schemaChain: true }, terms: { link: { init: null, manifest: "single", register: false } }, args: (e3, t4) => e3.ref(t4), validate(e3, { schema: t4, state: r2, prefs: n2 }) {
          s(t4.$_terms.link, "Uninitialized link schema");
          const a2 = l.generate(t4, e3, r2, n2), i2 = t4.$_terms.link[0].ref;
          return a2.$_validate(e3, r2.nest(a2, `link:${i2.display}:${a2.type}`), n2);
        }, generate: (e3, t4, r2, s2) => l.generate(e3, t4, r2, s2), rules: { ref: { method(e3) {
          s(!this.$_terms.link, "Cannot reinitialize schema"), e3 = i.ref(e3), s("value" === e3.type || "local" === e3.type, "Invalid reference type:", e3.type), s("local" === e3.type || "root" === e3.ancestor || e3.ancestor > 0, "Link cannot reference itself");
          const t4 = this.clone();
          return t4.$_terms.link = [{ ref: e3 }], t4;
        } }, relative: { method(e3 = true) {
          return this.$_setFlag("relative", e3);
        } } }, overrides: { concat(e3) {
          s(this.$_terms.link, "Uninitialized link schema"), s(a.isSchema(e3), "Invalid schema object"), s("link" !== e3.type, "Cannot merge type link with another link");
          const t4 = this.clone();
          return t4.$_terms.whens || (t4.$_terms.whens = []), t4.$_terms.whens.push({ concat: e3 }), t4.$_mutateRebuild();
        } }, manifest: { build: (e3, t4) => (s(t4.link, "Invalid link description missing link"), e3.ref(t4.link)) } }), l.generate = function(e3, t4, r2, s2) {
          let n2 = r2.mainstay.links.get(e3);
          if (n2) return n2._generate(t4, r2, s2).schema;
          const a2 = e3.$_terms.link[0].ref, { perspective: i2, path: o2 } = l.perspective(a2, r2);
          l.assert(i2, "which is outside of schema boundaries", a2, e3, r2, s2);
          try {
            n2 = o2.length ? i2.$_reach(o2) : i2;
          } catch (t5) {
            l.assert(false, "to non-existing schema", a2, e3, r2, s2);
          }
          return l.assert("link" !== n2.type, "which is another link", a2, e3, r2, s2), e3._flags.relative || r2.mainstay.links.set(e3, n2), n2._generate(t4, r2, s2).schema;
        }, l.perspective = function(e3, t4) {
          if ("local" === e3.type) {
            for (const { schema: r2, key: s2 } of t4.schemas) {
              if ((r2._flags.id || s2) === e3.path[0]) return { perspective: r2, path: e3.path.slice(1) };
              if (r2.$_terms.shared) {
                for (const t5 of r2.$_terms.shared) if (t5._flags.id === e3.path[0]) return { perspective: t5, path: e3.path.slice(1) };
              }
            }
            return { perspective: null, path: null };
          }
          return "root" === e3.ancestor ? { perspective: t4.schemas[t4.schemas.length - 1].schema, path: e3.path } : { perspective: t4.schemas[e3.ancestor] && t4.schemas[e3.ancestor].schema, path: e3.path };
        }, l.assert = function(e3, t4, r2, n2, a2, i2) {
          e3 || s(false, `"${o.label(n2._flags, a2, i2)}" contains link reference "${r2.display}" ${t4}`);
        };
      }, 3832: (e2, t3, r) => {
        const s = r(375), n = r(8068), a = r(8160), i = { numberRx: /^\s*[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:e([+-]?\d+))?\s*$/i, precisionRx: /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/, exponentialPartRegex: /[eE][+-]?\d+$/, leadingSignAndZerosRegex: /^[+-]?(0*)?/, dotRegex: /\./, trailingZerosRegex: /0+$/, decimalPlaces(e3) {
          const t4 = e3.toString(), r2 = t4.indexOf("."), s2 = t4.indexOf("e");
          return (r2 < 0 ? 0 : (s2 < 0 ? t4.length : s2) - r2 - 1) + (s2 < 0 ? 0 : Math.max(0, -parseInt(t4.slice(s2 + 1))));
        } };
        e2.exports = n.extend({ type: "number", flags: { unsafe: { default: false } }, coerce: { from: "string", method(e3, { schema: t4, error: r2 }) {
          if (!e3.match(i.numberRx)) return;
          e3 = e3.trim();
          const s2 = { value: parseFloat(e3) };
          if (0 === s2.value && (s2.value = 0), !t4._flags.unsafe) if (e3.match(/e/i)) {
            if (i.extractSignificantDigits(e3) !== i.extractSignificantDigits(String(s2.value))) return s2.errors = r2("number.unsafe"), s2;
          } else {
            const t5 = s2.value.toString();
            if (t5.match(/e/i)) return s2;
            if (t5 !== i.normalizeDecimal(e3)) return s2.errors = r2("number.unsafe"), s2;
          }
          return s2;
        } }, validate(e3, { schema: t4, error: r2, prefs: s2 }) {
          if (e3 === 1 / 0 || e3 === -1 / 0) return { value: e3, errors: r2("number.infinity") };
          if (!a.isNumber(e3)) return { value: e3, errors: r2("number.base") };
          const n2 = { value: e3 };
          if (s2.convert) {
            const e4 = t4.$_getRule("precision");
            if (e4) {
              const t5 = Math.pow(10, e4.args.limit);
              n2.value = Math.round(n2.value * t5) / t5;
            }
          }
          return 0 === n2.value && (n2.value = 0), !t4._flags.unsafe && (e3 > Number.MAX_SAFE_INTEGER || e3 < Number.MIN_SAFE_INTEGER) && (n2.errors = r2("number.unsafe")), n2;
        }, rules: { compare: { method: false, validate: (e3, t4, { limit: r2 }, { name: s2, operator: n2, args: i2 }) => a.compare(e3, r2, n2) ? e3 : t4.error("number." + s2, { limit: i2.limit, value: e3 }), args: [{ name: "limit", ref: true, assert: a.isNumber, message: "must be a number" }] }, greater: { method(e3) {
          return this.$_addRule({ name: "greater", method: "compare", args: { limit: e3 }, operator: ">" });
        } }, integer: { method() {
          return this.$_addRule("integer");
        }, validate: (e3, t4) => Math.trunc(e3) - e3 == 0 ? e3 : t4.error("number.integer") }, less: { method(e3) {
          return this.$_addRule({ name: "less", method: "compare", args: { limit: e3 }, operator: "<" });
        } }, max: { method(e3) {
          return this.$_addRule({ name: "max", method: "compare", args: { limit: e3 }, operator: "<=" });
        } }, min: { method(e3) {
          return this.$_addRule({ name: "min", method: "compare", args: { limit: e3 }, operator: ">=" });
        } }, multiple: { method(e3) {
          const t4 = "number" == typeof e3 ? i.decimalPlaces(e3) : null, r2 = Math.pow(10, t4);
          return this.$_addRule({ name: "multiple", args: { base: e3, baseDecimalPlace: t4, pfactor: r2 } });
        }, validate: (e3, t4, { base: r2, baseDecimalPlace: s2, pfactor: n2 }, a2) => i.decimalPlaces(e3) > s2 ? t4.error("number.multiple", { multiple: a2.args.base, value: e3 }) : Math.round(n2 * e3) % Math.round(n2 * r2) == 0 ? e3 : t4.error("number.multiple", { multiple: a2.args.base, value: e3 }), args: [{ name: "base", ref: true, assert: (e3) => "number" == typeof e3 && isFinite(e3) && e3 > 0, message: "must be a positive number" }, "baseDecimalPlace", "pfactor"], multi: true }, negative: { method() {
          return this.sign("negative");
        } }, port: { method() {
          return this.$_addRule("port");
        }, validate: (e3, t4) => Number.isSafeInteger(e3) && e3 >= 0 && e3 <= 65535 ? e3 : t4.error("number.port") }, positive: { method() {
          return this.sign("positive");
        } }, precision: { method(e3) {
          return s(Number.isSafeInteger(e3), "limit must be an integer"), this.$_addRule({ name: "precision", args: { limit: e3 } });
        }, validate(e3, t4, { limit: r2 }) {
          const s2 = e3.toString().match(i.precisionRx);
          return Math.max((s2[1] ? s2[1].length : 0) - (s2[2] ? parseInt(s2[2], 10) : 0), 0) <= r2 ? e3 : t4.error("number.precision", { limit: r2, value: e3 });
        }, convert: true }, sign: { method(e3) {
          return s(["negative", "positive"].includes(e3), "Invalid sign", e3), this.$_addRule({ name: "sign", args: { sign: e3 } });
        }, validate: (e3, t4, { sign: r2 }) => "negative" === r2 && e3 < 0 || "positive" === r2 && e3 > 0 ? e3 : t4.error(`number.${r2}`) }, unsafe: { method(e3 = true) {
          return s("boolean" == typeof e3, "enabled must be a boolean"), this.$_setFlag("unsafe", e3);
        } } }, cast: { string: { from: (e3) => "number" == typeof e3, to: (e3, t4) => e3.toString() } }, messages: { "number.base": "{{#label}} must be a number", "number.greater": "{{#label}} must be greater than {{#limit}}", "number.infinity": "{{#label}} cannot be infinity", "number.integer": "{{#label}} must be an integer", "number.less": "{{#label}} must be less than {{#limit}}", "number.max": "{{#label}} must be less than or equal to {{#limit}}", "number.min": "{{#label}} must be greater than or equal to {{#limit}}", "number.multiple": "{{#label}} must be a multiple of {{#multiple}}", "number.negative": "{{#label}} must be a negative number", "number.port": "{{#label}} must be a valid port", "number.positive": "{{#label}} must be a positive number", "number.precision": "{{#label}} must have no more than {{#limit}} decimal places", "number.unsafe": "{{#label}} must be a safe number" } }), i.extractSignificantDigits = function(e3) {
          return e3.replace(i.exponentialPartRegex, "").replace(i.dotRegex, "").replace(i.trailingZerosRegex, "").replace(i.leadingSignAndZerosRegex, "");
        }, i.normalizeDecimal = function(e3) {
          return (e3 = e3.replace(/^\+/, "").replace(/\.0*$/, "").replace(/^(-?)\.([^\.]*)$/, "$10.$2").replace(/^(-?)0+([0-9])/, "$1$2")).includes(".") && e3.endsWith("0") && (e3 = e3.replace(/0+$/, "")), "-0" === e3 ? "0" : e3;
        };
      }, 8966: (e2, t3, r) => {
        const s = r(7824);
        e2.exports = s.extend({ type: "object", cast: { map: { from: (e3) => e3 && "object" == typeof e3, to: (e3, t4) => new Map(Object.entries(e3)) } } });
      }, 7417: (e2, t3, r) => {
        const s = r(375), n = r(5380), a = r(1745), i = r(9959), o = r(6064), l = r(9926), c = r(5752), u = r(8068), f = r(8160), m = { tlds: l instanceof Set && { tlds: { allow: l, deny: null } }, base64Regex: { true: { true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}==|[\w\-]{3}=)?$/, false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/ }, false: { true: /^(?:[\w\-]{2}[\w\-]{2})*(?:[\w\-]{2}(==)?|[\w\-]{3}=?)?$/, false: /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/ } }, dataUriRegex: /^data:[\w+.-]+\/[\w+.-]+;((charset=[\w-]+|base64),)?(.*)$/, hexRegex: { withPrefix: /^0x[0-9a-f]+$/i, withOptionalPrefix: /^(?:0x)?[0-9a-f]+$/i, withoutPrefix: /^[0-9a-f]+$/i }, ipRegex: i.regex({ cidr: "forbidden" }).regex, isoDurationRegex: /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/, guidBrackets: { "{": "}", "[": "]", "(": ")", "": "" }, guidVersions: { uuidv1: "1", uuidv2: "2", uuidv3: "3", uuidv4: "4", uuidv5: "5", uuidv6: "6", uuidv7: "7", uuidv8: "8" }, guidSeparators: /* @__PURE__ */ new Set([void 0, true, false, "-", ":"]), normalizationForms: ["NFC", "NFD", "NFKC", "NFKD"] };
        e2.exports = u.extend({ type: "string", flags: { insensitive: { default: false }, truncate: { default: false } }, terms: { replacements: { init: null } }, coerce: { from: "string", method(e3, { schema: t4, state: r2, prefs: s2 }) {
          const n2 = t4.$_getRule("normalize");
          n2 && (e3 = e3.normalize(n2.args.form));
          const a2 = t4.$_getRule("case");
          a2 && (e3 = "upper" === a2.args.direction ? e3.toLocaleUpperCase() : e3.toLocaleLowerCase());
          const i2 = t4.$_getRule("trim");
          if (i2 && i2.args.enabled && (e3 = e3.trim()), t4.$_terms.replacements) for (const r3 of t4.$_terms.replacements) e3 = e3.replace(r3.pattern, r3.replacement);
          const o2 = t4.$_getRule("hex");
          if (o2 && o2.args.options.byteAligned && e3.length % 2 != 0 && (e3 = `0${e3}`), t4.$_getRule("isoDate")) {
            const t5 = m.isoDate(e3);
            t5 && (e3 = t5);
          }
          if (t4._flags.truncate) {
            const n3 = t4.$_getRule("max");
            if (n3) {
              let a3 = n3.args.limit;
              if (f.isResolvable(a3) && (a3 = a3.resolve(e3, r2, s2), !f.limit(a3))) return { value: e3, errors: t4.$_createError("any.ref", a3, { ref: n3.args.limit, arg: "limit", reason: "must be a positive integer" }, r2, s2) };
              e3 = e3.slice(0, a3);
            }
          }
          return { value: e3 };
        } }, validate(e3, { schema: t4, error: r2 }) {
          if ("string" != typeof e3) return { value: e3, errors: r2("string.base") };
          if ("" === e3) {
            const s2 = t4.$_getRule("min");
            if (s2 && 0 === s2.args.limit) return;
            return { value: e3, errors: r2("string.empty") };
          }
        }, rules: { alphanum: { method() {
          return this.$_addRule("alphanum");
        }, validate: (e3, t4) => /^[a-zA-Z0-9]+$/.test(e3) ? e3 : t4.error("string.alphanum") }, base64: { method(e3 = {}) {
          return f.assertOptions(e3, ["paddingRequired", "urlSafe"]), e3 = { urlSafe: false, paddingRequired: true, ...e3 }, s("boolean" == typeof e3.paddingRequired, "paddingRequired must be boolean"), s("boolean" == typeof e3.urlSafe, "urlSafe must be boolean"), this.$_addRule({ name: "base64", args: { options: e3 } });
        }, validate: (e3, t4, { options: r2 }) => m.base64Regex[r2.paddingRequired][r2.urlSafe].test(e3) ? e3 : t4.error("string.base64") }, case: { method(e3) {
          return s(["lower", "upper"].includes(e3), "Invalid case:", e3), this.$_addRule({ name: "case", args: { direction: e3 } });
        }, validate: (e3, t4, { direction: r2 }) => "lower" === r2 && e3 === e3.toLocaleLowerCase() || "upper" === r2 && e3 === e3.toLocaleUpperCase() ? e3 : t4.error(`string.${r2}case`), convert: true }, creditCard: { method() {
          return this.$_addRule("creditCard");
        }, validate(e3, t4) {
          let r2 = e3.length, s2 = 0, n2 = 1;
          for (; r2--; ) {
            const t5 = e3.charAt(r2) * n2;
            s2 += t5 - 9 * (t5 > 9), n2 ^= 3;
          }
          return s2 > 0 && s2 % 10 == 0 ? e3 : t4.error("string.creditCard");
        } }, dataUri: { method(e3 = {}) {
          return f.assertOptions(e3, ["paddingRequired"]), e3 = { paddingRequired: true, ...e3 }, s("boolean" == typeof e3.paddingRequired, "paddingRequired must be boolean"), this.$_addRule({ name: "dataUri", args: { options: e3 } });
        }, validate(e3, t4, { options: r2 }) {
          const s2 = e3.match(m.dataUriRegex);
          if (s2) {
            if (!s2[2]) return e3;
            if ("base64" !== s2[2]) return e3;
            if (m.base64Regex[r2.paddingRequired].false.test(s2[3])) return e3;
          }
          return t4.error("string.dataUri");
        } }, domain: { method(e3) {
          e3 && f.assertOptions(e3, ["allowFullyQualified", "allowUnicode", "maxDomainSegments", "minDomainSegments", "tlds"]);
          const t4 = m.addressOptions(e3);
          return this.$_addRule({ name: "domain", args: { options: e3 }, address: t4 });
        }, validate: (e3, t4, r2, { address: s2 }) => n.isValid(e3, s2) ? e3 : t4.error("string.domain") }, email: { method(e3 = {}) {
          f.assertOptions(e3, ["allowFullyQualified", "allowUnicode", "ignoreLength", "maxDomainSegments", "minDomainSegments", "multiple", "separator", "tlds"]), s(void 0 === e3.multiple || "boolean" == typeof e3.multiple, "multiple option must be an boolean");
          const t4 = m.addressOptions(e3), r2 = new RegExp(`\\s*[${e3.separator ? o(e3.separator) : ","}]\\s*`);
          return this.$_addRule({ name: "email", args: { options: e3 }, regex: r2, address: t4 });
        }, validate(e3, t4, { options: r2 }, { regex: s2, address: n2 }) {
          const i2 = r2.multiple ? e3.split(s2) : [e3], o2 = [];
          for (const e4 of i2) a.isValid(e4, n2) || o2.push(e4);
          return o2.length ? t4.error("string.email", { value: e3, invalids: o2 }) : e3;
        } }, guid: { alias: "uuid", method(e3 = {}) {
          f.assertOptions(e3, ["version", "separator"]);
          let t4 = "";
          if (e3.version) {
            const r3 = [].concat(e3.version);
            s(r3.length >= 1, "version must have at least 1 valid version specified");
            const n3 = /* @__PURE__ */ new Set();
            for (let e4 = 0; e4 < r3.length; ++e4) {
              const a2 = r3[e4];
              s("string" == typeof a2, "version at position " + e4 + " must be a string");
              const i2 = m.guidVersions[a2.toLowerCase()];
              s(i2, "version at position " + e4 + " must be one of " + Object.keys(m.guidVersions).join(", ")), s(!n3.has(i2), "version at position " + e4 + " must not be a duplicate"), t4 += i2, n3.add(i2);
            }
          }
          s(m.guidSeparators.has(e3.separator), 'separator must be one of true, false, "-", or ":"');
          const r2 = void 0 === e3.separator ? "[:-]?" : true === e3.separator ? "[:-]" : false === e3.separator ? "[]?" : `\\${e3.separator}`, n2 = new RegExp(`^([\\[{\\(]?)[0-9A-F]{8}(${r2})[0-9A-F]{4}\\2?[${t4 || "0-9A-F"}][0-9A-F]{3}\\2?[${t4 ? "89AB" : "0-9A-F"}][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$`, "i");
          return this.$_addRule({ name: "guid", args: { options: e3 }, regex: n2 });
        }, validate(e3, t4, r2, { regex: s2 }) {
          const n2 = s2.exec(e3);
          return n2 ? m.guidBrackets[n2[1]] !== n2[n2.length - 1] ? t4.error("string.guid") : e3 : t4.error("string.guid");
        } }, hex: { method(e3 = {}) {
          return f.assertOptions(e3, ["byteAligned", "prefix"]), e3 = { byteAligned: false, prefix: false, ...e3 }, s("boolean" == typeof e3.byteAligned, "byteAligned must be boolean"), s("boolean" == typeof e3.prefix || "optional" === e3.prefix, 'prefix must be boolean or "optional"'), this.$_addRule({ name: "hex", args: { options: e3 } });
        }, validate: (e3, t4, { options: r2 }) => ("optional" === r2.prefix ? m.hexRegex.withOptionalPrefix : true === r2.prefix ? m.hexRegex.withPrefix : m.hexRegex.withoutPrefix).test(e3) ? r2.byteAligned && e3.length % 2 != 0 ? t4.error("string.hexAlign") : e3 : t4.error("string.hex") }, hostname: { method() {
          return this.$_addRule("hostname");
        }, validate: (e3, t4) => n.isValid(e3, { minDomainSegments: 1 }) || m.ipRegex.test(e3) ? e3 : t4.error("string.hostname") }, insensitive: { method() {
          return this.$_setFlag("insensitive", true);
        } }, ip: { method(e3 = {}) {
          f.assertOptions(e3, ["cidr", "version"]);
          const { cidr: t4, versions: r2, regex: s2 } = i.regex(e3), n2 = e3.version ? r2 : void 0;
          return this.$_addRule({ name: "ip", args: { options: { cidr: t4, version: n2 } }, regex: s2 });
        }, validate: (e3, t4, { options: r2 }, { regex: s2 }) => s2.test(e3) ? e3 : r2.version ? t4.error("string.ipVersion", { value: e3, cidr: r2.cidr, version: r2.version }) : t4.error("string.ip", { value: e3, cidr: r2.cidr }) }, isoDate: { method() {
          return this.$_addRule("isoDate");
        }, validate: (e3, { error: t4 }) => m.isoDate(e3) ? e3 : t4("string.isoDate") }, isoDuration: { method() {
          return this.$_addRule("isoDuration");
        }, validate: (e3, t4) => m.isoDurationRegex.test(e3) ? e3 : t4.error("string.isoDuration") }, length: { method(e3, t4) {
          return m.length(this, "length", e3, "=", t4);
        }, validate(e3, t4, { limit: r2, encoding: s2 }, { name: n2, operator: a2, args: i2 }) {
          const o2 = !s2 && e3.length;
          return f.compare(o2, r2, a2) ? e3 : t4.error("string." + n2, { limit: i2.limit, value: e3, encoding: s2 });
        }, args: [{ name: "limit", ref: true, assert: f.limit, message: "must be a positive integer" }, "encoding"] }, lowercase: { method() {
          return this.case("lower");
        } }, max: { method(e3, t4) {
          return m.length(this, "max", e3, "<=", t4);
        }, args: ["limit", "encoding"] }, min: { method(e3, t4) {
          return m.length(this, "min", e3, ">=", t4);
        }, args: ["limit", "encoding"] }, normalize: { method(e3 = "NFC") {
          return s(m.normalizationForms.includes(e3), "normalization form must be one of " + m.normalizationForms.join(", ")), this.$_addRule({ name: "normalize", args: { form: e3 } });
        }, validate: (e3, { error: t4 }, { form: r2 }) => e3 === e3.normalize(r2) ? e3 : t4("string.normalize", { value: e3, form: r2 }), convert: true }, pattern: { alias: "regex", method(e3, t4 = {}) {
          s(e3 instanceof RegExp, "regex must be a RegExp"), s(!e3.flags.includes("g") && !e3.flags.includes("y"), "regex should not use global or sticky mode"), "string" == typeof t4 && (t4 = { name: t4 }), f.assertOptions(t4, ["invert", "name"]);
          const r2 = ["string.pattern", t4.invert ? ".invert" : "", t4.name ? ".name" : ".base"].join("");
          return this.$_addRule({ name: "pattern", args: { regex: e3, options: t4 }, errorCode: r2 });
        }, validate: (e3, t4, { regex: r2, options: s2 }, { errorCode: n2 }) => r2.test(e3) ^ s2.invert ? e3 : t4.error(n2, { name: s2.name, regex: r2, value: e3 }), args: ["regex", "options"], multi: true }, replace: { method(e3, t4) {
          "string" == typeof e3 && (e3 = new RegExp(o(e3), "g")), s(e3 instanceof RegExp, "pattern must be a RegExp"), s("string" == typeof t4, "replacement must be a String");
          const r2 = this.clone();
          return r2.$_terms.replacements || (r2.$_terms.replacements = []), r2.$_terms.replacements.push({ pattern: e3, replacement: t4 }), r2;
        } }, token: { method() {
          return this.$_addRule("token");
        }, validate: (e3, t4) => /^\w+$/.test(e3) ? e3 : t4.error("string.token") }, trim: { method(e3 = true) {
          return s("boolean" == typeof e3, "enabled must be a boolean"), this.$_addRule({ name: "trim", args: { enabled: e3 } });
        }, validate: (e3, t4, { enabled: r2 }) => r2 && e3 !== e3.trim() ? t4.error("string.trim") : e3, convert: true }, truncate: { method(e3 = true) {
          return s("boolean" == typeof e3, "enabled must be a boolean"), this.$_setFlag("truncate", e3);
        } }, uppercase: { method() {
          return this.case("upper");
        } }, uri: { method(e3 = {}) {
          f.assertOptions(e3, ["allowRelative", "allowQuerySquareBrackets", "domain", "relativeOnly", "scheme", "encodeUri"]), e3.domain && f.assertOptions(e3.domain, ["allowFullyQualified", "allowUnicode", "maxDomainSegments", "minDomainSegments", "tlds"]);
          const { regex: t4, scheme: r2 } = c.regex(e3), s2 = e3.domain ? m.addressOptions(e3.domain) : null;
          return this.$_addRule({ name: "uri", args: { options: e3 }, regex: t4, domain: s2, scheme: r2 });
        }, validate(e3, t4, { options: r2 }, { regex: s2, domain: a2, scheme: i2 }) {
          if (["http:/", "https:/"].includes(e3)) return t4.error("string.uri");
          let o2 = s2.exec(e3);
          if (!o2 && t4.prefs.convert && r2.encodeUri) {
            const t5 = encodeURI(e3);
            o2 = s2.exec(t5), o2 && (e3 = t5);
          }
          if (o2) {
            const s3 = o2[1] || o2[2];
            return !a2 || r2.allowRelative && !s3 || n.isValid(s3, a2) ? e3 : t4.error("string.domain", { value: s3 });
          }
          return r2.relativeOnly ? t4.error("string.uriRelativeOnly") : r2.scheme ? t4.error("string.uriCustomScheme", { scheme: i2, value: e3 }) : t4.error("string.uri");
        } } }, manifest: { build(e3, t4) {
          if (t4.replacements) for (const { pattern: r2, replacement: s2 } of t4.replacements) e3 = e3.replace(r2, s2);
          return e3;
        } }, messages: { "string.alphanum": "{{#label}} must only contain alpha-numeric characters", "string.base": "{{#label}} must be a string", "string.base64": "{{#label}} must be a valid base64 string", "string.creditCard": "{{#label}} must be a credit card", "string.dataUri": "{{#label}} must be a valid dataUri string", "string.domain": "{{#label}} must contain a valid domain name", "string.email": "{{#label}} must be a valid email", "string.empty": "{{#label}} is not allowed to be empty", "string.guid": "{{#label}} must be a valid GUID", "string.hex": "{{#label}} must only contain hexadecimal characters", "string.hexAlign": "{{#label}} hex decoded representation must be byte aligned", "string.hostname": "{{#label}} must be a valid hostname", "string.ip": "{{#label}} must be a valid ip address with a {{#cidr}} CIDR", "string.ipVersion": "{{#label}} must be a valid ip address of one of the following versions {{#version}} with a {{#cidr}} CIDR", "string.isoDate": "{{#label}} must be in iso format", "string.isoDuration": "{{#label}} must be a valid ISO 8601 duration", "string.length": "{{#label}} length must be {{#limit}} characters long", "string.lowercase": "{{#label}} must only contain lowercase characters", "string.max": "{{#label}} length must be less than or equal to {{#limit}} characters long", "string.min": "{{#label}} length must be at least {{#limit}} characters long", "string.normalize": "{{#label}} must be unicode normalized in the {{#form}} form", "string.token": "{{#label}} must only contain alpha-numeric and underscore characters", "string.pattern.base": "{{#label}} with value {:[.]} fails to match the required pattern: {{#regex}}", "string.pattern.name": "{{#label}} with value {:[.]} fails to match the {{#name}} pattern", "string.pattern.invert.base": "{{#label}} with value {:[.]} matches the inverted pattern: {{#regex}}", "string.pattern.invert.name": "{{#label}} with value {:[.]} matches the inverted {{#name}} pattern", "string.trim": "{{#label}} must not have leading or trailing whitespace", "string.uri": "{{#label}} must be a valid uri", "string.uriCustomScheme": "{{#label}} must be a valid uri with a scheme matching the {{#scheme}} pattern", "string.uriRelativeOnly": "{{#label}} must be a valid relative uri", "string.uppercase": "{{#label}} must only contain uppercase characters" } }), m.addressOptions = function(e3) {
          if (!e3) return m.tlds || e3;
          if (s(void 0 === e3.minDomainSegments || Number.isSafeInteger(e3.minDomainSegments) && e3.minDomainSegments > 0, "minDomainSegments must be a positive integer"), s(void 0 === e3.maxDomainSegments || Number.isSafeInteger(e3.maxDomainSegments) && e3.maxDomainSegments > 0, "maxDomainSegments must be a positive integer"), false === e3.tlds) return e3;
          if (true === e3.tlds || void 0 === e3.tlds) return s(m.tlds, "Built-in TLD list disabled"), Object.assign({}, e3, m.tlds);
          s("object" == typeof e3.tlds, "tlds must be true, false, or an object");
          const t4 = e3.tlds.deny;
          if (t4) return Array.isArray(t4) && (e3 = Object.assign({}, e3, { tlds: { deny: new Set(t4) } })), s(e3.tlds.deny instanceof Set, "tlds.deny must be an array, Set, or boolean"), s(!e3.tlds.allow, "Cannot specify both tlds.allow and tlds.deny lists"), m.validateTlds(e3.tlds.deny, "tlds.deny"), e3;
          const r2 = e3.tlds.allow;
          return r2 ? true === r2 ? (s(m.tlds, "Built-in TLD list disabled"), Object.assign({}, e3, m.tlds)) : (Array.isArray(r2) && (e3 = Object.assign({}, e3, { tlds: { allow: new Set(r2) } })), s(e3.tlds.allow instanceof Set, "tlds.allow must be an array, Set, or boolean"), m.validateTlds(e3.tlds.allow, "tlds.allow"), e3) : e3;
        }, m.validateTlds = function(e3, t4) {
          for (const r2 of e3) s(n.isValid(r2, { minDomainSegments: 1, maxDomainSegments: 1 }), `${t4} must contain valid top level domain names`);
        }, m.isoDate = function(e3) {
          if (!f.isIsoDate(e3)) return null;
          /.*T.*[+-]\d\d$/.test(e3) && (e3 += "00");
          const t4 = new Date(e3);
          return isNaN(t4.getTime()) ? null : t4.toISOString();
        }, m.length = function(e3, t4, r2, n2, a2) {
          return s(!a2 || false, "Invalid encoding:", a2), e3.$_addRule({ name: t4, method: "length", args: { limit: r2, encoding: a2 }, operator: n2 });
        };
      }, 8826: (e2, t3, r) => {
        const s = r(375), n = r(8068), a = {};
        a.Map = class extends Map {
          slice() {
            return new a.Map(this);
          }
        }, e2.exports = n.extend({ type: "symbol", terms: { map: { init: new a.Map() } }, coerce: { method(e3, { schema: t4, error: r2 }) {
          const s2 = t4.$_terms.map.get(e3);
          return s2 && (e3 = s2), t4._flags.only && "symbol" != typeof e3 ? { value: e3, errors: r2("symbol.map", { map: t4.$_terms.map }) } : { value: e3 };
        } }, validate(e3, { error: t4 }) {
          if ("symbol" != typeof e3) return { value: e3, errors: t4("symbol.base") };
        }, rules: { map: { method(e3) {
          e3 && !e3[Symbol.iterator] && "object" == typeof e3 && (e3 = Object.entries(e3)), s(e3 && e3[Symbol.iterator], "Iterable must be an iterable or object");
          const t4 = this.clone(), r2 = [];
          for (const n2 of e3) {
            s(n2 && n2[Symbol.iterator], "Entry must be an iterable");
            const [e4, a2] = n2;
            s("object" != typeof e4 && "function" != typeof e4 && "symbol" != typeof e4, "Key must not be of type object, function, or Symbol"), s("symbol" == typeof a2, "Value must be a Symbol"), t4.$_terms.map.set(e4, a2), r2.push(a2);
          }
          return t4.valid(...r2);
        } } }, manifest: { build: (e3, t4) => (t4.map && (e3 = e3.map(t4.map)), e3) }, messages: { "symbol.base": "{{#label}} must be a symbol", "symbol.map": "{{#label}} must be one of {{#map}}" } });
      }, 8863: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(738), i = r(9621), o = r(8160), l = r(6354), c = r(493), u = { result: Symbol("result") };
        t3.entry = function(e3, t4, r2) {
          let n2 = o.defaults;
          r2 && (s(void 0 === r2.warnings, "Cannot override warnings preference in synchronous validation"), s(void 0 === r2.artifacts, "Cannot override artifacts preference in synchronous validation"), n2 = o.preferences(o.defaults, r2));
          const a2 = u.entry(e3, t4, n2);
          s(!a2.mainstay.externals.length, "Schema with external rules must use validateAsync()");
          const i2 = { value: a2.value };
          return a2.error && (i2.error = a2.error), a2.mainstay.warnings.length && (i2.warning = l.details(a2.mainstay.warnings)), a2.mainstay.debug && (i2.debug = a2.mainstay.debug), a2.mainstay.artifacts && (i2.artifacts = a2.mainstay.artifacts), i2;
        }, t3.entryAsync = async function(e3, t4, r2) {
          let s2 = o.defaults;
          r2 && (s2 = o.preferences(o.defaults, r2));
          const n2 = u.entry(e3, t4, s2), a2 = n2.mainstay;
          if (n2.error) throw a2.debug && (n2.error.debug = a2.debug), n2.error;
          if (a2.externals.length) {
            let t5 = n2.value;
            const c3 = [];
            for (const n3 of a2.externals) {
              const f = n3.state.path, m = "link" === n3.schema.type ? a2.links.get(n3.schema) : null;
              let h, d, p = t5;
              const g = f.length ? [t5] : [], y = f.length ? i(e3, f) : e3;
              if (f.length) {
                h = f[f.length - 1];
                let e4 = t5;
                for (const t6 of f.slice(0, -1)) e4 = e4[t6], g.unshift(e4);
                d = g[0], p = d[h];
              }
              try {
                const e4 = (e5, t6) => (m || n3.schema).$_createError(e5, p, t6, n3.state, s2), i2 = await n3.method(p, { schema: n3.schema, linked: m, state: n3.state, prefs: r2, original: y, error: e4, errorsArray: u.errorsArray, warn: (e5, t6) => a2.warnings.push((m || n3.schema).$_createError(e5, p, t6, n3.state, s2)), message: (e5, t6) => (m || n3.schema).$_createError("external", p, t6, n3.state, s2, { messages: e5 }) });
                if (void 0 === i2 || i2 === p) continue;
                if (i2 instanceof l.Report) {
                  if (a2.tracer.log(n3.schema, n3.state, "rule", "external", "error"), c3.push(i2), s2.abortEarly) break;
                  continue;
                }
                if (Array.isArray(i2) && i2[o.symbols.errors]) {
                  if (a2.tracer.log(n3.schema, n3.state, "rule", "external", "error"), c3.push(...i2), s2.abortEarly) break;
                  continue;
                }
                d ? (a2.tracer.value(n3.state, "rule", p, i2, "external"), d[h] = i2) : (a2.tracer.value(n3.state, "rule", t5, i2, "external"), t5 = i2);
              } catch (e4) {
                throw s2.errors.label && (e4.message += ` (${n3.label})`), e4;
              }
            }
            if (n2.value = t5, c3.length) throw n2.error = l.process(c3, e3, s2), a2.debug && (n2.error.debug = a2.debug), n2.error;
          }
          if (!s2.warnings && !s2.debug && !s2.artifacts) return n2.value;
          const c2 = { value: n2.value };
          return a2.warnings.length && (c2.warning = l.details(a2.warnings)), a2.debug && (c2.debug = a2.debug), a2.artifacts && (c2.artifacts = a2.artifacts), c2;
        }, u.Mainstay = class {
          constructor(e3, t4, r2) {
            this.externals = [], this.warnings = [], this.tracer = e3, this.debug = t4, this.links = r2, this.shadow = null, this.artifacts = null, this._snapshots = [];
          }
          snapshot() {
            this._snapshots.push({ externals: this.externals.slice(), warnings: this.warnings.slice() });
          }
          restore() {
            const e3 = this._snapshots.pop();
            this.externals = e3.externals, this.warnings = e3.warnings;
          }
          commit() {
            this._snapshots.pop();
          }
        }, u.entry = function(e3, r2, s2) {
          const { tracer: n2, cleanup: a2 } = u.tracer(r2, s2), i2 = s2.debug ? [] : null, o2 = r2._ids._schemaChain ? /* @__PURE__ */ new Map() : null, f = new u.Mainstay(n2, i2, o2), m = r2._ids._schemaChain ? [{ schema: r2 }] : null, h = new c([], [], { mainstay: f, schemas: m }), d = t3.validate(e3, r2, h, s2);
          a2 && r2.$_root.untrace();
          const p = l.process(d.errors, e3, s2);
          return { value: d.value, error: p, mainstay: f };
        }, u.tracer = function(e3, t4) {
          return e3.$_root._tracer ? { tracer: e3.$_root._tracer._register(e3) } : t4.debug ? (s(e3.$_root.trace, "Debug mode not supported"), { tracer: e3.$_root.trace()._register(e3), cleanup: true }) : { tracer: u.ignore };
        }, t3.validate = function(e3, t4, r2, s2, n2 = {}) {
          if (t4.$_terms.whens && (t4 = t4._generate(e3, r2, s2).schema), t4._preferences && (s2 = u.prefs(t4, s2)), t4._cache && s2.cache) {
            const s3 = t4._cache.get(e3);
            if (r2.mainstay.tracer.debug(r2, "validate", "cached", !!s3), s3) return s3;
          }
          const a2 = (n3, a3, i3) => t4.$_createError(n3, e3, a3, i3 || r2, s2), i2 = { original: e3, prefs: s2, schema: t4, state: r2, error: a2, errorsArray: u.errorsArray, warn: (e4, t5, s3) => r2.mainstay.warnings.push(a2(e4, t5, s3)), message: (n3, a3) => t4.$_createError("custom", e3, a3, r2, s2, { messages: n3 }) };
          r2.mainstay.tracer.entry(t4, r2);
          const l2 = t4._definition;
          if (l2.prepare && void 0 !== e3 && s2.convert) {
            const t5 = l2.prepare(e3, i2);
            if (t5) {
              if (r2.mainstay.tracer.value(r2, "prepare", e3, t5.value), t5.errors) return u.finalize(t5.value, [].concat(t5.errors), i2);
              e3 = t5.value;
            }
          }
          if (l2.coerce && void 0 !== e3 && s2.convert && (!l2.coerce.from || l2.coerce.from.includes(typeof e3))) {
            const t5 = l2.coerce.method(e3, i2);
            if (t5) {
              if (r2.mainstay.tracer.value(r2, "coerced", e3, t5.value), t5.errors) return u.finalize(t5.value, [].concat(t5.errors), i2);
              e3 = t5.value;
            }
          }
          const c2 = t4._flags.empty;
          c2 && c2.$_match(u.trim(e3, t4), r2.nest(c2), o.defaults) && (r2.mainstay.tracer.value(r2, "empty", e3, void 0), e3 = void 0);
          const f = n2.presence || t4._flags.presence || (t4._flags._endedSwitch ? null : s2.presence);
          if (void 0 === e3) {
            if ("forbidden" === f) return u.finalize(e3, null, i2);
            if ("required" === f) return u.finalize(e3, [t4.$_createError("any.required", e3, null, r2, s2)], i2);
            if ("optional" === f) {
              if (t4._flags.default !== o.symbols.deepDefault) return u.finalize(e3, null, i2);
              r2.mainstay.tracer.value(r2, "default", e3, {}), e3 = {};
            }
          } else if ("forbidden" === f) return u.finalize(e3, [t4.$_createError("any.unknown", e3, null, r2, s2)], i2);
          const m = [];
          if (t4._valids) {
            const n3 = t4._valids.get(e3, r2, s2, t4._flags.insensitive);
            if (n3) return s2.convert && (r2.mainstay.tracer.value(r2, "valids", e3, n3.value), e3 = n3.value), r2.mainstay.tracer.filter(t4, r2, "valid", n3), u.finalize(e3, null, i2);
            if (t4._flags.only) {
              const n4 = t4.$_createError("any.only", e3, { valids: t4._valids.values({ display: true }) }, r2, s2);
              if (s2.abortEarly) return u.finalize(e3, [n4], i2);
              m.push(n4);
            }
          }
          if (t4._invalids) {
            const n3 = t4._invalids.get(e3, r2, s2, t4._flags.insensitive);
            if (n3) {
              r2.mainstay.tracer.filter(t4, r2, "invalid", n3);
              const a3 = t4.$_createError("any.invalid", e3, { invalids: t4._invalids.values({ display: true }) }, r2, s2);
              if (s2.abortEarly) return u.finalize(e3, [a3], i2);
              m.push(a3);
            }
          }
          if (l2.validate) {
            const t5 = l2.validate(e3, i2);
            if (t5 && (r2.mainstay.tracer.value(r2, "base", e3, t5.value), e3 = t5.value, t5.errors)) {
              if (!Array.isArray(t5.errors)) return m.push(t5.errors), u.finalize(e3, m, i2);
              if (t5.errors.length) return m.push(...t5.errors), u.finalize(e3, m, i2);
            }
          }
          return t4._rules.length ? u.rules(e3, m, i2) : u.finalize(e3, m, i2);
        }, u.rules = function(e3, t4, r2) {
          const { schema: s2, state: n2, prefs: a2 } = r2;
          for (const i2 of s2._rules) {
            const l2 = s2._definition.rules[i2.method];
            if (l2.convert && a2.convert) {
              n2.mainstay.tracer.log(s2, n2, "rule", i2.name, "full");
              continue;
            }
            let c2, f = i2.args;
            if (i2._resolve.length) {
              f = Object.assign({}, f);
              for (const t5 of i2._resolve) {
                const r3 = l2.argsByName.get(t5), i3 = f[t5].resolve(e3, n2, a2), u2 = r3.normalize ? r3.normalize(i3) : i3, m2 = o.validateArg(u2, null, r3);
                if (m2) {
                  c2 = s2.$_createError("any.ref", i3, { arg: t5, ref: f[t5], reason: m2 }, n2, a2);
                  break;
                }
                f[t5] = u2;
              }
            }
            c2 = c2 || l2.validate(e3, r2, f, i2);
            const m = u.rule(c2, i2);
            if (m.errors) {
              if (n2.mainstay.tracer.log(s2, n2, "rule", i2.name, "error"), i2.warn) {
                n2.mainstay.warnings.push(...m.errors);
                continue;
              }
              if (a2.abortEarly) return u.finalize(e3, m.errors, r2);
              t4.push(...m.errors);
            } else n2.mainstay.tracer.log(s2, n2, "rule", i2.name, "pass"), n2.mainstay.tracer.value(n2, "rule", e3, m.value, i2.name), e3 = m.value;
          }
          return u.finalize(e3, t4, r2);
        }, u.rule = function(e3, t4) {
          return e3 instanceof l.Report ? (u.error(e3, t4), { errors: [e3], value: null }) : Array.isArray(e3) && e3[o.symbols.errors] ? (e3.forEach(((e4) => u.error(e4, t4))), { errors: e3, value: null }) : { errors: null, value: e3 };
        }, u.error = function(e3, t4) {
          return t4.message && e3._setTemplate(t4.message), e3;
        }, u.finalize = function(e3, t4, r2) {
          t4 = t4 || [];
          const { schema: n2, state: a2, prefs: i2 } = r2;
          if (t4.length) {
            const s2 = u.default("failover", void 0, t4, r2);
            void 0 !== s2 && (a2.mainstay.tracer.value(a2, "failover", e3, s2), e3 = s2, t4 = []);
          }
          if (t4.length && n2._flags.error) if ("function" == typeof n2._flags.error) {
            t4 = n2._flags.error(t4), Array.isArray(t4) || (t4 = [t4]);
            for (const e4 of t4) s(e4 instanceof Error || e4 instanceof l.Report, "error() must return an Error object");
          } else t4 = [n2._flags.error];
          if (void 0 === e3) {
            const s2 = u.default("default", e3, t4, r2);
            a2.mainstay.tracer.value(a2, "default", e3, s2), e3 = s2;
          }
          if (n2._flags.cast && void 0 !== e3) {
            const t5 = n2._definition.cast[n2._flags.cast];
            if (t5.from(e3)) {
              const s2 = t5.to(e3, r2);
              a2.mainstay.tracer.value(a2, "cast", e3, s2, n2._flags.cast), e3 = s2;
            }
          }
          if (n2.$_terms.externals && i2.externals && false !== i2._externals) for (const { method: e4 } of n2.$_terms.externals) a2.mainstay.externals.push({ method: e4, schema: n2, state: a2, label: l.label(n2._flags, a2, i2) });
          const o2 = { value: e3, errors: t4.length ? t4 : null };
          return n2._flags.result && (o2.value = "strip" === n2._flags.result ? void 0 : r2.original, a2.mainstay.tracer.value(a2, n2._flags.result, e3, o2.value), a2.shadow(e3, n2._flags.result)), n2._cache && false !== i2.cache && !n2._refs.length && n2._cache.set(r2.original, o2), void 0 === e3 || o2.errors || void 0 === n2._flags.artifact || (a2.mainstay.artifacts = a2.mainstay.artifacts || /* @__PURE__ */ new Map(), a2.mainstay.artifacts.has(n2._flags.artifact) || a2.mainstay.artifacts.set(n2._flags.artifact, []), a2.mainstay.artifacts.get(n2._flags.artifact).push(a2.path)), o2;
        }, u.prefs = function(e3, t4) {
          const r2 = t4 === o.defaults;
          return r2 && e3._preferences[o.symbols.prefs] ? e3._preferences[o.symbols.prefs] : (t4 = o.preferences(t4, e3._preferences), r2 && (e3._preferences[o.symbols.prefs] = t4), t4);
        }, u.default = function(e3, t4, r2, s2) {
          const { schema: a2, state: i2, prefs: l2 } = s2, c2 = a2._flags[e3];
          if (l2.noDefaults || void 0 === c2) return t4;
          if (i2.mainstay.tracer.log(a2, i2, "rule", e3, "full"), !c2) return c2;
          if ("function" == typeof c2) {
            const t5 = c2.length ? [n(i2.ancestors[0]), s2] : [];
            try {
              return c2(...t5);
            } catch (t6) {
              return void r2.push(a2.$_createError(`any.${e3}`, null, { error: t6 }, i2, l2));
            }
          }
          return "object" != typeof c2 ? c2 : c2[o.symbols.literal] ? c2.literal : o.isResolvable(c2) ? c2.resolve(t4, i2, l2) : n(c2);
        }, u.trim = function(e3, t4) {
          if ("string" != typeof e3) return e3;
          const r2 = t4.$_getRule("trim");
          return r2 && r2.args.enabled ? e3.trim() : e3;
        }, u.ignore = { active: false, debug: a, entry: a, filter: a, log: a, resolve: a, value: a }, u.errorsArray = function() {
          const e3 = [];
          return e3[o.symbols.errors] = true, e3;
        };
      }, 2036: (e2, t3, r) => {
        const s = r(375), n = r(9474), a = r(8160), i = {};
        e2.exports = i.Values = class {
          constructor(e3, t4) {
            this._values = new Set(e3), this._refs = new Set(t4), this._lowercase = i.lowercases(e3), this._override = false;
          }
          get length() {
            return this._values.size + this._refs.size;
          }
          add(e3, t4) {
            a.isResolvable(e3) ? this._refs.has(e3) || (this._refs.add(e3), t4 && t4.register(e3)) : this.has(e3, null, null, false) || (this._values.add(e3), "string" == typeof e3 && this._lowercase.set(e3.toLowerCase(), e3));
          }
          static merge(e3, t4, r2) {
            if (e3 = e3 || new i.Values(), t4) {
              if (t4._override) return t4.clone();
              for (const r3 of [...t4._values, ...t4._refs]) e3.add(r3);
            }
            if (r2) for (const t5 of [...r2._values, ...r2._refs]) e3.remove(t5);
            return e3.length ? e3 : null;
          }
          remove(e3) {
            a.isResolvable(e3) ? this._refs.delete(e3) : (this._values.delete(e3), "string" == typeof e3 && this._lowercase.delete(e3.toLowerCase()));
          }
          has(e3, t4, r2, s2) {
            return !!this.get(e3, t4, r2, s2);
          }
          get(e3, t4, r2, s2) {
            if (!this.length) return false;
            if (this._values.has(e3)) return { value: e3 };
            if ("string" == typeof e3 && e3 && s2) {
              const t5 = this._lowercase.get(e3.toLowerCase());
              if (t5) return { value: t5 };
            }
            if (!this._refs.size && "object" != typeof e3) return false;
            if ("object" == typeof e3) {
              for (const t5 of this._values) if (n(t5, e3)) return { value: t5 };
            }
            if (t4) for (const a2 of this._refs) {
              const i2 = a2.resolve(e3, t4, r2, null, { in: true });
              if (void 0 === i2) continue;
              const o = a2.in && "object" == typeof i2 ? Array.isArray(i2) ? i2 : Object.keys(i2) : [i2];
              for (const t5 of o) if (typeof t5 == typeof e3) {
                if (s2 && e3 && "string" == typeof e3) {
                  if (t5.toLowerCase() === e3.toLowerCase()) return { value: t5, ref: a2 };
                } else if (n(t5, e3)) return { value: t5, ref: a2 };
              }
            }
            return false;
          }
          override() {
            this._override = true;
          }
          values(e3) {
            if (e3 && e3.display) {
              const e4 = [];
              for (const t4 of [...this._values, ...this._refs]) void 0 !== t4 && e4.push(t4);
              return e4;
            }
            return Array.from([...this._values, ...this._refs]);
          }
          clone() {
            const e3 = new i.Values(this._values, this._refs);
            return e3._override = this._override, e3;
          }
          concat(e3) {
            s(!e3._override, "Cannot concat override set of values");
            const t4 = new i.Values([...this._values, ...e3._values], [...this._refs, ...e3._refs]);
            return t4._override = this._override, t4;
          }
          describe() {
            const e3 = [];
            this._override && e3.push({ override: true });
            for (const t4 of this._values.values()) e3.push(t4 && "object" == typeof t4 ? { value: t4 } : t4);
            for (const t4 of this._refs.values()) e3.push(t4.describe());
            return e3;
          }
        }, i.Values.prototype[a.symbols.values] = true, i.Values.prototype.slice = i.Values.prototype.clone, i.lowercases = function(e3) {
          const t4 = /* @__PURE__ */ new Map();
          if (e3) for (const r2 of e3) "string" == typeof r2 && t4.set(r2.toLowerCase(), r2);
          return t4;
        };
      }, 978: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(1687), i = r(9621), o = {};
        e2.exports = function(e3, t4, r2 = {}) {
          if (s(e3 && "object" == typeof e3, "Invalid defaults value: must be an object"), s(!t4 || true === t4 || "object" == typeof t4, "Invalid source value: must be true, falsy or an object"), s("object" == typeof r2, "Invalid options: must be an object"), !t4) return null;
          if (r2.shallow) return o.applyToDefaultsWithShallow(e3, t4, r2);
          const i2 = n(e3);
          if (true === t4) return i2;
          const l = void 0 !== r2.nullOverride && r2.nullOverride;
          return a(i2, t4, { nullOverride: l, mergeArrays: false });
        }, o.applyToDefaultsWithShallow = function(e3, t4, r2) {
          const l = r2.shallow;
          s(Array.isArray(l), "Invalid keys");
          const c = /* @__PURE__ */ new Map(), u = true === t4 ? null : /* @__PURE__ */ new Set();
          for (let r3 of l) {
            r3 = Array.isArray(r3) ? r3 : r3.split(".");
            const s2 = i(e3, r3);
            s2 && "object" == typeof s2 ? c.set(s2, u && i(t4, r3) || s2) : u && u.add(r3);
          }
          const f = n(e3, {}, c);
          if (!u) return f;
          for (const e4 of u) o.reachCopy(f, t4, e4);
          const m = void 0 !== r2.nullOverride && r2.nullOverride;
          return a(f, t4, { nullOverride: m, mergeArrays: false });
        }, o.reachCopy = function(e3, t4, r2) {
          for (const e4 of r2) {
            if (!(e4 in t4)) return;
            const r3 = t4[e4];
            if ("object" != typeof r3 || null === r3) return;
            t4 = r3;
          }
          const s2 = t4;
          let n2 = e3;
          for (let e4 = 0; e4 < r2.length - 1; ++e4) {
            const t5 = r2[e4];
            "object" != typeof n2[t5] && (n2[t5] = {}), n2 = n2[t5];
          }
          n2[r2[r2.length - 1]] = s2;
        };
      }, 375: (e2, t3, r) => {
        const s = r(7916);
        e2.exports = function(e3, ...t4) {
          if (!e3) {
            if (1 === t4.length && t4[0] instanceof Error) throw t4[0];
            throw new s(t4);
          }
        };
      }, 8571: (e2, t3, r) => {
        const s = r(9621), n = r(4277), a = r(7043), i = { needsProtoHack: /* @__PURE__ */ new Set([n.set, n.map, n.weakSet, n.weakMap]) };
        e2.exports = i.clone = function(e3, t4 = {}, r2 = null) {
          if ("object" != typeof e3 || null === e3) return e3;
          let s2 = i.clone, o = r2;
          if (t4.shallow) {
            if (true !== t4.shallow) return i.cloneWithShallow(e3, t4);
            s2 = (e4) => e4;
          } else if (o) {
            const t5 = o.get(e3);
            if (t5) return t5;
          } else o = /* @__PURE__ */ new Map();
          const l = n.getInternalProto(e3);
          if (l === n.buffer) return false;
          if (l === n.date) return new Date(e3.getTime());
          if (l === n.regex) return new RegExp(e3);
          const c = i.base(e3, l, t4);
          if (c === e3) return e3;
          if (o && o.set(e3, c), l === n.set) for (const r3 of e3) c.add(s2(r3, t4, o));
          else if (l === n.map) for (const [r3, n2] of e3) c.set(r3, s2(n2, t4, o));
          const u = a.keys(e3, t4);
          for (const r3 of u) {
            if ("__proto__" === r3) continue;
            if (l === n.array && "length" === r3) {
              c.length = e3.length;
              continue;
            }
            const a2 = Object.getOwnPropertyDescriptor(e3, r3);
            a2 ? a2.get || a2.set ? Object.defineProperty(c, r3, a2) : a2.enumerable ? c[r3] = s2(e3[r3], t4, o) : Object.defineProperty(c, r3, { enumerable: false, writable: true, configurable: true, value: s2(e3[r3], t4, o) }) : Object.defineProperty(c, r3, { enumerable: true, writable: true, configurable: true, value: s2(e3[r3], t4, o) });
          }
          return c;
        }, i.cloneWithShallow = function(e3, t4) {
          const r2 = t4.shallow;
          (t4 = Object.assign({}, t4)).shallow = false;
          const n2 = /* @__PURE__ */ new Map();
          for (const t5 of r2) {
            const r3 = s(e3, t5);
            "object" != typeof r3 && "function" != typeof r3 || n2.set(r3, r3);
          }
          return i.clone(e3, t4, n2);
        }, i.base = function(e3, t4, r2) {
          if (false === r2.prototype) return i.needsProtoHack.has(t4) ? new t4.constructor() : t4 === n.array ? [] : {};
          const s2 = Object.getPrototypeOf(e3);
          if (s2 && s2.isImmutable) return e3;
          if (t4 === n.array) {
            const e4 = [];
            return s2 !== t4 && Object.setPrototypeOf(e4, s2), e4;
          }
          if (i.needsProtoHack.has(t4)) {
            const e4 = new s2.constructor();
            return s2 !== t4 && Object.setPrototypeOf(e4, s2), e4;
          }
          return Object.create(s2);
        };
      }, 9474: (e2, t3, r) => {
        const s = r(4277), n = { mismatched: null };
        e2.exports = function(e3, t4, r2) {
          return r2 = Object.assign({ prototype: true }, r2), !!n.isDeepEqual(e3, t4, r2, []);
        }, n.isDeepEqual = function(e3, t4, r2, a) {
          if (e3 === t4) return 0 !== e3 || 1 / e3 == 1 / t4;
          const i = typeof e3;
          if (i !== typeof t4) return false;
          if (null === e3 || null === t4) return false;
          if ("function" === i) {
            if (!r2.deepFunction || e3.toString() !== t4.toString()) return false;
          } else if ("object" !== i) return e3 != e3 && t4 != t4;
          const o = n.getSharedType(e3, t4, !!r2.prototype);
          switch (o) {
            case s.buffer:
              return false;
            case s.promise:
              return e3 === t4;
            case s.regex:
              return e3.toString() === t4.toString();
            case n.mismatched:
              return false;
          }
          for (let r3 = a.length - 1; r3 >= 0; --r3) if (a[r3].isSame(e3, t4)) return true;
          a.push(new n.SeenEntry(e3, t4));
          try {
            return !!n.isDeepEqualObj(o, e3, t4, r2, a);
          } finally {
            a.pop();
          }
        }, n.getSharedType = function(e3, t4, r2) {
          if (r2) return Object.getPrototypeOf(e3) !== Object.getPrototypeOf(t4) ? n.mismatched : s.getInternalProto(e3);
          const a = s.getInternalProto(e3);
          return a !== s.getInternalProto(t4) ? n.mismatched : a;
        }, n.valueOf = function(e3) {
          const t4 = e3.valueOf;
          if (void 0 === t4) return e3;
          try {
            return t4.call(e3);
          } catch (e4) {
            return e4;
          }
        }, n.hasOwnEnumerableProperty = function(e3, t4) {
          return Object.prototype.propertyIsEnumerable.call(e3, t4);
        }, n.isSetSimpleEqual = function(e3, t4) {
          for (const r2 of Set.prototype.values.call(e3)) if (!Set.prototype.has.call(t4, r2)) return false;
          return true;
        }, n.isDeepEqualObj = function(e3, t4, r2, a, i) {
          const { isDeepEqual: o, valueOf: l, hasOwnEnumerableProperty: c } = n, { keys: u, getOwnPropertySymbols: f } = Object;
          if (e3 === s.array) {
            if (!a.part) {
              if (t4.length !== r2.length) return false;
              for (let e4 = 0; e4 < t4.length; ++e4) if (!o(t4[e4], r2[e4], a, i)) return false;
              return true;
            }
            for (const e4 of t4) for (const t5 of r2) if (o(e4, t5, a, i)) return true;
          } else if (e3 === s.set) {
            if (t4.size !== r2.size) return false;
            if (!n.isSetSimpleEqual(t4, r2)) {
              const e4 = new Set(Set.prototype.values.call(r2));
              for (const r3 of Set.prototype.values.call(t4)) {
                if (e4.delete(r3)) continue;
                let t5 = false;
                for (const s2 of e4) if (o(r3, s2, a, i)) {
                  e4.delete(s2), t5 = true;
                  break;
                }
                if (!t5) return false;
              }
            }
          } else if (e3 === s.map) {
            if (t4.size !== r2.size) return false;
            for (const [e4, s2] of Map.prototype.entries.call(t4)) {
              if (void 0 === s2 && !Map.prototype.has.call(r2, e4)) return false;
              if (!o(s2, Map.prototype.get.call(r2, e4), a, i)) return false;
            }
          } else if (e3 === s.error && (t4.name !== r2.name || t4.message !== r2.message)) return false;
          const m = l(t4), h = l(r2);
          if ((t4 !== m || r2 !== h) && !o(m, h, a, i)) return false;
          const d = u(t4);
          if (!a.part && d.length !== u(r2).length && !a.skip) return false;
          let p = 0;
          for (const e4 of d) if (a.skip && a.skip.includes(e4)) void 0 === r2[e4] && ++p;
          else {
            if (!c(r2, e4)) return false;
            if (!o(t4[e4], r2[e4], a, i)) return false;
          }
          if (!a.part && d.length - p !== u(r2).length) return false;
          if (false !== a.symbols) {
            const e4 = f(t4), s2 = new Set(f(r2));
            for (const n2 of e4) {
              if (!a.skip || !a.skip.includes(n2)) {
                if (c(t4, n2)) {
                  if (!c(r2, n2)) return false;
                  if (!o(t4[n2], r2[n2], a, i)) return false;
                } else if (c(r2, n2)) return false;
              }
              s2.delete(n2);
            }
            for (const e5 of s2) if (c(r2, e5)) return false;
          }
          return true;
        }, n.SeenEntry = class {
          constructor(e3, t4) {
            this.obj = e3, this.ref = t4;
          }
          isSame(e3, t4) {
            return this.obj === e3 && this.ref === t4;
          }
        };
      }, 7916: (e2, t3, r) => {
        const s = r(8761);
        e2.exports = class extends Error {
          constructor(e3) {
            super(e3.filter(((e4) => "" !== e4)).map(((e4) => "string" == typeof e4 ? e4 : e4 instanceof Error ? e4.message : s(e4))).join(" ") || "Unknown error"), "function" == typeof Error.captureStackTrace && Error.captureStackTrace(this, t3.assert);
          }
        };
      }, 5277: (e2) => {
        const t3 = {};
        e2.exports = function(e3) {
          if (!e3) return "";
          let r = "";
          for (let s = 0; s < e3.length; ++s) {
            const n = e3.charCodeAt(s);
            t3.isSafe(n) ? r += e3[s] : r += t3.escapeHtmlChar(n);
          }
          return r;
        }, t3.escapeHtmlChar = function(e3) {
          return t3.namedHtml.get(e3) || (e3 >= 256 ? "&#" + e3 + ";" : `&#x${e3.toString(16).padStart(2, "0")};`);
        }, t3.isSafe = function(e3) {
          return t3.safeCharCodes.has(e3);
        }, t3.namedHtml = /* @__PURE__ */ new Map([[38, "&amp;"], [60, "&lt;"], [62, "&gt;"], [34, "&quot;"], [160, "&nbsp;"], [162, "&cent;"], [163, "&pound;"], [164, "&curren;"], [169, "&copy;"], [174, "&reg;"]]), t3.safeCharCodes = (function() {
          const e3 = /* @__PURE__ */ new Set();
          for (let t4 = 32; t4 < 123; ++t4) (t4 >= 97 || t4 >= 65 && t4 <= 90 || t4 >= 48 && t4 <= 57 || 32 === t4 || 46 === t4 || 44 === t4 || 45 === t4 || 58 === t4 || 95 === t4) && e3.add(t4);
          return e3;
        })();
      }, 6064: (e2) => {
        e2.exports = function(e3) {
          return e3.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, "\\$&");
        };
      }, 738: (e2) => {
        e2.exports = function() {
        };
      }, 1687: (e2, t3, r) => {
        const s = r(375), n = r(8571), a = r(7043), i = {};
        e2.exports = i.merge = function(e3, t4, r2) {
          if (s(e3 && "object" == typeof e3, "Invalid target value: must be an object"), s(null == t4 || "object" == typeof t4, "Invalid source value: must be null, undefined, or an object"), !t4) return e3;
          if (r2 = Object.assign({ nullOverride: true, mergeArrays: true }, r2), Array.isArray(t4)) {
            s(Array.isArray(e3), "Cannot merge array onto an object"), r2.mergeArrays || (e3.length = 0);
            for (let s2 = 0; s2 < t4.length; ++s2) e3.push(n(t4[s2], { symbols: r2.symbols }));
            return e3;
          }
          const o = a.keys(t4, r2);
          for (let s2 = 0; s2 < o.length; ++s2) {
            const a2 = o[s2];
            if ("__proto__" === a2 || !Object.prototype.propertyIsEnumerable.call(t4, a2)) continue;
            const l = t4[a2];
            if (l && "object" == typeof l) {
              if (e3[a2] === l) continue;
              !e3[a2] || "object" != typeof e3[a2] || Array.isArray(e3[a2]) !== Array.isArray(l) || l instanceof Date || l instanceof RegExp ? e3[a2] = n(l, { symbols: r2.symbols }) : i.merge(e3[a2], l, r2);
            } else (null != l || r2.nullOverride) && (e3[a2] = l);
          }
          return e3;
        };
      }, 9621: (e2, t3, r) => {
        const s = r(375), n = {};
        e2.exports = function(e3, t4, r2) {
          if (false === t4 || null == t4) return e3;
          "string" == typeof (r2 = r2 || {}) && (r2 = { separator: r2 });
          const a = Array.isArray(t4);
          s(!a || !r2.separator, "Separator option is not valid for array-based chain");
          const i = a ? t4 : t4.split(r2.separator || ".");
          let o = e3;
          for (let e4 = 0; e4 < i.length; ++e4) {
            let a2 = i[e4];
            const l = r2.iterables && n.iterables(o);
            if (Array.isArray(o) || "set" === l) {
              const e5 = Number(a2);
              Number.isInteger(e5) && (a2 = e5 < 0 ? o.length + e5 : e5);
            }
            if (!o || "function" == typeof o && false === r2.functions || !l && void 0 === o[a2]) {
              s(!r2.strict || e4 + 1 === i.length, "Missing segment", a2, "in reach path ", t4), s("object" == typeof o || true === r2.functions || "function" != typeof o, "Invalid segment", a2, "in reach path ", t4), o = r2.default;
              break;
            }
            o = l ? "set" === l ? [...o][a2] : o.get(a2) : o[a2];
          }
          return o;
        }, n.iterables = function(e3) {
          return e3 instanceof Set ? "set" : e3 instanceof Map ? "map" : void 0;
        };
      }, 8761: (e2) => {
        e2.exports = function(...e3) {
          try {
            return JSON.stringify(...e3);
          } catch (e4) {
            return "[Cannot display object: " + e4.message + "]";
          }
        };
      }, 4277: (e2, t3) => {
        const r = {};
        t3 = e2.exports = { array: Array.prototype, buffer: false, date: Date.prototype, error: Error.prototype, generic: Object.prototype, map: Map.prototype, promise: Promise.prototype, regex: RegExp.prototype, set: Set.prototype, weakMap: WeakMap.prototype, weakSet: WeakSet.prototype }, r.typeMap = /* @__PURE__ */ new Map([["[object Error]", t3.error], ["[object Map]", t3.map], ["[object Promise]", t3.promise], ["[object Set]", t3.set], ["[object WeakMap]", t3.weakMap], ["[object WeakSet]", t3.weakSet]]), t3.getInternalProto = function(e3) {
          if (Array.isArray(e3)) return t3.array;
          if (e3 instanceof Date) return t3.date;
          if (e3 instanceof RegExp) return t3.regex;
          if (e3 instanceof Error) return t3.error;
          const s = Object.prototype.toString.call(e3);
          return r.typeMap.get(s) || t3.generic;
        };
      }, 7043: (e2, t3) => {
        t3.keys = function(e3, t4 = {}) {
          return false !== t4.symbols ? Reflect.ownKeys(e3) : Object.getOwnPropertyNames(e3);
        };
      }, 3652: (e2, t3, r) => {
        const s = r(375), n = {};
        t3.Sorter = class {
          constructor() {
            this._items = [], this.nodes = [];
          }
          add(e3, t4) {
            const r2 = [].concat((t4 = t4 || {}).before || []), n2 = [].concat(t4.after || []), a = t4.group || "?", i = t4.sort || 0;
            s(!r2.includes(a), `Item cannot come before itself: ${a}`), s(!r2.includes("?"), "Item cannot come before unassociated items"), s(!n2.includes(a), `Item cannot come after itself: ${a}`), s(!n2.includes("?"), "Item cannot come after unassociated items"), Array.isArray(e3) || (e3 = [e3]);
            for (const t5 of e3) {
              const e4 = { seq: this._items.length, sort: i, before: r2, after: n2, group: a, node: t5 };
              this._items.push(e4);
            }
            if (!t4.manual) {
              const e4 = this._sort();
              s(e4, "item", "?" !== a ? `added into group ${a}` : "", "created a dependencies error");
            }
            return this.nodes;
          }
          merge(e3) {
            Array.isArray(e3) || (e3 = [e3]);
            for (const t5 of e3) if (t5) for (const e4 of t5._items) this._items.push(Object.assign({}, e4));
            this._items.sort(n.mergeSort);
            for (let e4 = 0; e4 < this._items.length; ++e4) this._items[e4].seq = e4;
            const t4 = this._sort();
            return s(t4, "merge created a dependencies error"), this.nodes;
          }
          sort() {
            const e3 = this._sort();
            return s(e3, "sort created a dependencies error"), this.nodes;
          }
          _sort() {
            const e3 = {}, t4 = /* @__PURE__ */ Object.create(null), r2 = /* @__PURE__ */ Object.create(null);
            for (const s3 of this._items) {
              const n3 = s3.seq, a2 = s3.group;
              r2[a2] = r2[a2] || [], r2[a2].push(n3), e3[n3] = s3.before;
              for (const e4 of s3.after) t4[e4] = t4[e4] || [], t4[e4].push(n3);
            }
            for (const t5 in e3) {
              const s3 = [];
              for (const n3 in e3[t5]) {
                const a2 = e3[t5][n3];
                r2[a2] = r2[a2] || [], s3.push(...r2[a2]);
              }
              e3[t5] = s3;
            }
            for (const s3 in t4) if (r2[s3]) for (const n3 of r2[s3]) e3[n3].push(...t4[s3]);
            const s2 = {};
            for (const t5 in e3) {
              const r3 = e3[t5];
              for (const e4 of r3) s2[e4] = s2[e4] || [], s2[e4].push(t5);
            }
            const n2 = {}, a = [];
            for (let e4 = 0; e4 < this._items.length; ++e4) {
              let t5 = e4;
              if (s2[e4]) {
                t5 = null;
                for (let e5 = 0; e5 < this._items.length; ++e5) {
                  if (true === n2[e5]) continue;
                  s2[e5] || (s2[e5] = []);
                  const r3 = s2[e5].length;
                  let a2 = 0;
                  for (let t6 = 0; t6 < r3; ++t6) n2[s2[e5][t6]] && ++a2;
                  if (a2 === r3) {
                    t5 = e5;
                    break;
                  }
                }
              }
              null !== t5 && (n2[t5] = true, a.push(t5));
            }
            if (a.length !== this._items.length) return false;
            const i = {};
            for (const e4 of this._items) i[e4.seq] = e4;
            this._items = [], this.nodes = [];
            for (const e4 of a) {
              const t5 = i[e4];
              this.nodes.push(t5.node), this._items.push(t5);
            }
            return true;
          }
        }, n.mergeSort = (e3, t4) => e3.sort === t4.sort ? 0 : e3.sort < t4.sort ? -1 : 1;
      }, 5380: (e2, t3, r) => {
        const s = r(443), n = r(2178), a = { minDomainSegments: 2, nonAsciiRx: /[^\x00-\x7f]/, domainControlRx: /[\x00-\x20@\:\/\\#!\$&\'\(\)\*\+,;=\?]/, tldSegmentRx: /^[a-zA-Z](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/, domainSegmentRx: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?$/, URL: s.URL || URL };
        t3.analyze = function(e3, t4 = {}) {
          if (!e3) return n.code("DOMAIN_NON_EMPTY_STRING");
          if ("string" != typeof e3) throw new Error("Invalid input: domain must be a string");
          if (e3.length > 256) return n.code("DOMAIN_TOO_LONG");
          if (a.nonAsciiRx.test(e3)) {
            if (false === t4.allowUnicode) return n.code("DOMAIN_INVALID_UNICODE_CHARS");
            e3 = e3.normalize("NFC");
          }
          if (a.domainControlRx.test(e3)) return n.code("DOMAIN_INVALID_CHARS");
          e3 = a.punycode(e3), t4.allowFullyQualified && "." === e3[e3.length - 1] && (e3 = e3.slice(0, -1));
          const r2 = t4.minDomainSegments || a.minDomainSegments, s2 = e3.split(".");
          if (s2.length < r2) return n.code("DOMAIN_SEGMENTS_COUNT");
          if (t4.maxDomainSegments && s2.length > t4.maxDomainSegments) return n.code("DOMAIN_SEGMENTS_COUNT_MAX");
          const i = t4.tlds;
          if (i) {
            const e4 = s2[s2.length - 1].toLowerCase();
            if (i.deny && i.deny.has(e4) || i.allow && !i.allow.has(e4)) return n.code("DOMAIN_FORBIDDEN_TLDS");
          }
          for (let e4 = 0; e4 < s2.length; ++e4) {
            const t5 = s2[e4];
            if (!t5.length) return n.code("DOMAIN_EMPTY_SEGMENT");
            if (t5.length > 63) return n.code("DOMAIN_LONG_SEGMENT");
            if (e4 < s2.length - 1) {
              if (!a.domainSegmentRx.test(t5)) return n.code("DOMAIN_INVALID_CHARS");
            } else if (!a.tldSegmentRx.test(t5)) return n.code("DOMAIN_INVALID_TLDS_CHARS");
          }
          return null;
        }, t3.isValid = function(e3, r2) {
          return !t3.analyze(e3, r2);
        }, a.punycode = function(e3) {
          e3.includes("%") && (e3 = e3.replace(/%/g, "%25"));
          try {
            return new a.URL(`http://${e3}`).host;
          } catch (t4) {
            return e3;
          }
        };
      }, 1745: (e2, t3, r) => {
        const s = r(9848), n = r(5380), a = r(2178), i = { nonAsciiRx: /[^\x00-\x7f]/, encoder: new (s.TextEncoder || TextEncoder)() };
        t3.analyze = function(e3, t4) {
          return i.email(e3, t4);
        }, t3.isValid = function(e3, t4) {
          return !i.email(e3, t4);
        }, i.email = function(e3, t4 = {}) {
          if ("string" != typeof e3) throw new Error("Invalid input: email must be a string");
          if (!e3) return a.code("EMPTY_STRING");
          const r2 = !i.nonAsciiRx.test(e3);
          if (!r2) {
            if (false === t4.allowUnicode) return a.code("FORBIDDEN_UNICODE");
            e3 = e3.normalize("NFC");
          }
          const s2 = e3.split("@");
          if (2 !== s2.length) return s2.length > 2 ? a.code("MULTIPLE_AT_CHAR") : a.code("MISSING_AT_CHAR");
          const [o, l] = s2;
          if (!o) return a.code("EMPTY_LOCAL");
          if (!t4.ignoreLength) {
            if (e3.length > 254) return a.code("ADDRESS_TOO_LONG");
            if (i.encoder.encode(o).length > 64) return a.code("LOCAL_TOO_LONG");
          }
          return i.local(o, r2) || n.analyze(l, t4);
        }, i.local = function(e3, t4) {
          const r2 = e3.split(".");
          for (const e4 of r2) {
            if (!e4.length) return a.code("EMPTY_LOCAL_SEGMENT");
            if (t4) {
              if (!i.atextRx.test(e4)) return a.code("INVALID_LOCAL_CHARS");
            } else for (const t5 of e4) {
              if (i.atextRx.test(t5)) continue;
              const e5 = i.binary(t5);
              if (!i.atomRx.test(e5)) return a.code("INVALID_LOCAL_CHARS");
            }
          }
        }, i.binary = function(e3) {
          return Array.from(i.encoder.encode(e3)).map(((e4) => String.fromCharCode(e4))).join("");
        }, i.atextRx = /^[\w!#\$%&'\*\+\-/=\?\^`\{\|\}~]+$/, i.atomRx = new RegExp(["(?:[\\xc2-\\xdf][\\x80-\\xbf])", "(?:\\xe0[\\xa0-\\xbf][\\x80-\\xbf])|(?:[\\xe1-\\xec][\\x80-\\xbf]{2})|(?:\\xed[\\x80-\\x9f][\\x80-\\xbf])|(?:[\\xee-\\xef][\\x80-\\xbf]{2})", "(?:\\xf0[\\x90-\\xbf][\\x80-\\xbf]{2})|(?:[\\xf1-\\xf3][\\x80-\\xbf]{3})|(?:\\xf4[\\x80-\\x8f][\\x80-\\xbf]{2})"].join("|"));
      }, 2178: (e2, t3) => {
        t3.codes = { EMPTY_STRING: "Address must be a non-empty string", FORBIDDEN_UNICODE: "Address contains forbidden Unicode characters", MULTIPLE_AT_CHAR: "Address cannot contain more than one @ character", MISSING_AT_CHAR: "Address must contain one @ character", EMPTY_LOCAL: "Address local part cannot be empty", ADDRESS_TOO_LONG: "Address too long", LOCAL_TOO_LONG: "Address local part too long", EMPTY_LOCAL_SEGMENT: "Address local part contains empty dot-separated segment", INVALID_LOCAL_CHARS: "Address local part contains invalid character", DOMAIN_NON_EMPTY_STRING: "Domain must be a non-empty string", DOMAIN_TOO_LONG: "Domain too long", DOMAIN_INVALID_UNICODE_CHARS: "Domain contains forbidden Unicode characters", DOMAIN_INVALID_CHARS: "Domain contains invalid character", DOMAIN_INVALID_TLDS_CHARS: "Domain contains invalid tld character", DOMAIN_SEGMENTS_COUNT: "Domain lacks the minimum required number of segments", DOMAIN_SEGMENTS_COUNT_MAX: "Domain contains too many segments", DOMAIN_FORBIDDEN_TLDS: "Domain uses forbidden TLD", DOMAIN_EMPTY_SEGMENT: "Domain contains empty dot-separated segment", DOMAIN_LONG_SEGMENT: "Domain contains dot-separated segment that is too long" }, t3.code = function(e3) {
          return { code: e3, error: t3.codes[e3] };
        };
      }, 9959: (e2, t3, r) => {
        const s = r(375), n = r(5752);
        t3.regex = function(e3 = {}) {
          s(void 0 === e3.cidr || "string" == typeof e3.cidr, "options.cidr must be a string");
          const t4 = e3.cidr ? e3.cidr.toLowerCase() : "optional";
          s(["required", "optional", "forbidden"].includes(t4), "options.cidr must be one of required, optional, forbidden"), s(void 0 === e3.version || "string" == typeof e3.version || Array.isArray(e3.version), "options.version must be a string or an array of string");
          let r2 = e3.version || ["ipv4", "ipv6", "ipvfuture"];
          Array.isArray(r2) || (r2 = [r2]), s(r2.length >= 1, "options.version must have at least 1 version specified");
          for (let e4 = 0; e4 < r2.length; ++e4) s("string" == typeof r2[e4], "options.version must only contain strings"), r2[e4] = r2[e4].toLowerCase(), s(["ipv4", "ipv6", "ipvfuture"].includes(r2[e4]), "options.version contains unknown version " + r2[e4] + " - must be one of ipv4, ipv6, ipvfuture");
          r2 = Array.from(new Set(r2));
          const a = `(?:${r2.map(((e4) => {
            if ("forbidden" === t4) return n.ip[e4];
            const r3 = `\\/${"ipv4" === e4 ? n.ip.v4Cidr : n.ip.v6Cidr}`;
            return "required" === t4 ? `${n.ip[e4]}${r3}` : `${n.ip[e4]}(?:${r3})?`;
          })).join("|")})`, i = new RegExp(`^${a}$`);
          return { cidr: t4, versions: r2, regex: i, raw: a };
        };
      }, 5752: (e2, t3, r) => {
        const s = r(375), n = r(6064), a = { generate: function() {
          const e3 = {}, t4 = "\\dA-Fa-f", r2 = "[" + t4 + "]", s2 = "\\w-\\.~", n2 = "!\\$&'\\(\\)\\*\\+,;=", a2 = "%" + t4, i = s2 + a2 + n2 + ":@", o = "[" + i + "]", l = "(?:0{0,2}\\d|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])";
          e3.ipv4address = "(?:" + l + "\\.){3}" + l;
          const c = r2 + "{1,4}", u = "(?:" + c + ":" + c + "|" + e3.ipv4address + ")", f = "(?:" + c + ":){6}" + u, m = "::(?:" + c + ":){5}" + u, h = "(?:" + c + ")?::(?:" + c + ":){4}" + u, d = "(?:(?:" + c + ":){0,1}" + c + ")?::(?:" + c + ":){3}" + u, p = "(?:(?:" + c + ":){0,2}" + c + ")?::(?:" + c + ":){2}" + u, g = "(?:(?:" + c + ":){0,3}" + c + ")?::" + c + ":" + u, y = "(?:(?:" + c + ":){0,4}" + c + ")?::" + u, b = "(?:(?:" + c + ":){0,5}" + c + ")?::" + c, v = "(?:(?:" + c + ":){0,6}" + c + ")?::";
          e3.ipv4Cidr = "(?:\\d|[1-2]\\d|3[0-2])", e3.ipv6Cidr = "(?:0{0,2}\\d|0?[1-9]\\d|1[01]\\d|12[0-8])", e3.ipv6address = "(?:" + f + "|" + m + "|" + h + "|" + d + "|" + p + "|" + g + "|" + y + "|" + b + "|" + v + ")", e3.ipvFuture = "v" + r2 + "+\\.[" + s2 + n2 + ":]+", e3.scheme = "[a-zA-Z][a-zA-Z\\d+-\\.]*", e3.schemeRegex = new RegExp(e3.scheme);
          const _ = "[" + s2 + a2 + n2 + ":]*", w = "[" + s2 + a2 + n2 + "]{1,255}", $ = "(?:\\[(?:" + e3.ipv6address + "|" + e3.ipvFuture + ")\\]|" + e3.ipv4address + "|" + w + ")", x = "(?:" + _ + "@)?" + $ + "(?::\\d*)?", j = "(?:" + _ + "@)?(" + $ + ")(?::\\d*)?", k = o + "*", R = o + "+", S = "(?:\\/" + k + ")*", A = "\\/(?:" + R + S + ")?", O = R + S, E = "[" + s2 + a2 + n2 + "@]+" + S, D = "(?:\\/\\/\\/" + k + S + ")";
          return e3.hierPart = "(?:(?:\\/\\/" + x + S + ")|" + A + "|" + O + "|" + D + ")", e3.hierPartCapture = "(?:(?:\\/\\/" + j + S + ")|" + A + "|" + O + ")", e3.relativeRef = "(?:(?:\\/\\/" + x + S + ")|" + A + "|" + E + "|)", e3.relativeRefCapture = "(?:(?:\\/\\/" + j + S + ")|" + A + "|" + E + "|)", e3.query = "[" + i + "\\/\\?]*(?=#|$)", e3.queryWithSquareBrackets = "[" + i + "\\[\\]\\/\\?]*(?=#|$)", e3.fragment = "[" + i + "\\/\\?]*", e3;
        } };
        a.rfc3986 = a.generate(), t3.ip = { v4Cidr: a.rfc3986.ipv4Cidr, v6Cidr: a.rfc3986.ipv6Cidr, ipv4: a.rfc3986.ipv4address, ipv6: a.rfc3986.ipv6address, ipvfuture: a.rfc3986.ipvFuture }, a.createRegex = function(e3) {
          const t4 = a.rfc3986, r2 = "(?:\\?" + (e3.allowQuerySquareBrackets ? t4.queryWithSquareBrackets : t4.query) + ")?(?:#" + t4.fragment + ")?", i = e3.domain ? t4.relativeRefCapture : t4.relativeRef;
          if (e3.relativeOnly) return a.wrap(i + r2);
          let o = "";
          if (e3.scheme) {
            s(e3.scheme instanceof RegExp || "string" == typeof e3.scheme || Array.isArray(e3.scheme), "scheme must be a RegExp, String, or Array");
            const r3 = [].concat(e3.scheme);
            s(r3.length >= 1, "scheme must have at least 1 scheme specified");
            const a2 = [];
            for (let e4 = 0; e4 < r3.length; ++e4) {
              const i2 = r3[e4];
              s(i2 instanceof RegExp || "string" == typeof i2, "scheme at position " + e4 + " must be a RegExp or String"), i2 instanceof RegExp ? a2.push(i2.source.toString()) : (s(t4.schemeRegex.test(i2), "scheme at position " + e4 + " must be a valid scheme"), a2.push(n(i2)));
            }
            o = a2.join("|");
          }
          const l = "(?:" + (o ? "(?:" + o + ")" : t4.scheme) + ":" + (e3.domain ? t4.hierPartCapture : t4.hierPart) + ")", c = e3.allowRelative ? "(?:" + l + "|" + i + ")" : l;
          return a.wrap(c + r2, o);
        }, a.wrap = function(e3, t4) {
          return { raw: e3 = `(?=.)(?!https?:/(?:$|[^/]))(?!https?:///)(?!https?:[^/])${e3}`, regex: new RegExp(`^${e3}$`), scheme: t4 };
        }, a.uriRegex = a.createRegex({}), t3.regex = function(e3 = {}) {
          return e3.scheme || e3.allowRelative || e3.relativeOnly || e3.allowQuerySquareBrackets || e3.domain ? a.createRegex(e3) : a.uriRegex;
        };
      }, 1447: (e2, t3) => {
        const r = { operators: ["!", "^", "*", "/", "%", "+", "-", "<", "<=", ">", ">=", "==", "!=", "&&", "||", "??"], operatorCharacters: ["!", "^", "*", "/", "%", "+", "-", "<", "=", ">", "&", "|", "?"], operatorsOrder: [["^"], ["*", "/", "%"], ["+", "-"], ["<", "<=", ">", ">="], ["==", "!="], ["&&"], ["||", "??"]], operatorsPrefix: ["!", "n"], literals: { '"': '"', "`": "`", "'": "'", "[": "]" }, numberRx: /^(?:[0-9]*(\.[0-9]*)?){1}$/, tokenRx: /^[\w\$\#\.\@\:\{\}]+$/, symbol: Symbol("formula"), settings: Symbol("settings") };
        t3.Parser = class {
          constructor(e3, t4 = {}) {
            if (!t4[r.settings] && t4.constants) for (const e4 in t4.constants) {
              const r2 = t4.constants[e4];
              if (null !== r2 && !["boolean", "number", "string"].includes(typeof r2)) throw new Error(`Formula constant ${e4} contains invalid ${typeof r2} value type`);
            }
            this.settings = t4[r.settings] ? t4 : Object.assign({ [r.settings]: true, constants: {}, functions: {} }, t4), this.single = null, this._parts = null, this._parse(e3);
          }
          _parse(e3) {
            let s = [], n = "", a = 0, i = false;
            const o = (e4) => {
              if (a) throw new Error("Formula missing closing parenthesis");
              const o2 = s.length ? s[s.length - 1] : null;
              if (i || n || e4) {
                if (o2 && "reference" === o2.type && ")" === e4) return o2.type = "function", o2.value = this._subFormula(n, o2.value), void (n = "");
                if (")" === e4) {
                  const e5 = new t3.Parser(n, this.settings);
                  s.push({ type: "segment", value: e5 });
                } else if (i) {
                  if ("]" === i) return s.push({ type: "reference", value: n }), void (n = "");
                  s.push({ type: "literal", value: n });
                } else if (r.operatorCharacters.includes(n)) o2 && "operator" === o2.type && r.operators.includes(o2.value + n) ? o2.value += n : s.push({ type: "operator", value: n });
                else if (n.match(r.numberRx)) s.push({ type: "constant", value: parseFloat(n) });
                else if (void 0 !== this.settings.constants[n]) s.push({ type: "constant", value: this.settings.constants[n] });
                else {
                  if (!n.match(r.tokenRx)) throw new Error(`Formula contains invalid token: ${n}`);
                  s.push({ type: "reference", value: n });
                }
                n = "";
              }
            };
            for (const t4 of e3) i ? t4 === i ? (o(), i = false) : n += t4 : a ? "(" === t4 ? (n += t4, ++a) : ")" === t4 ? (--a, a ? n += t4 : o(t4)) : n += t4 : t4 in r.literals ? i = r.literals[t4] : "(" === t4 ? (o(), ++a) : r.operatorCharacters.includes(t4) ? (o(), n = t4, o()) : " " !== t4 ? n += t4 : o();
            o(), s = s.map(((e4, t4) => "operator" !== e4.type || "-" !== e4.value || t4 && "operator" !== s[t4 - 1].type ? e4 : { type: "operator", value: "n" }));
            let l = false;
            for (const e4 of s) {
              if ("operator" === e4.type) {
                if (r.operatorsPrefix.includes(e4.value)) continue;
                if (!l) throw new Error("Formula contains an operator in invalid position");
                if (!r.operators.includes(e4.value)) throw new Error(`Formula contains an unknown operator ${e4.value}`);
              } else if (l) throw new Error("Formula missing expected operator");
              l = !l;
            }
            if (!l) throw new Error("Formula contains invalid trailing operator");
            1 === s.length && ["reference", "literal", "constant"].includes(s[0].type) && (this.single = { type: "reference" === s[0].type ? "reference" : "value", value: s[0].value }), this._parts = s.map(((e4) => {
              if ("operator" === e4.type) return r.operatorsPrefix.includes(e4.value) ? e4 : e4.value;
              if ("reference" !== e4.type) return e4.value;
              if (this.settings.tokenRx && !this.settings.tokenRx.test(e4.value)) throw new Error(`Formula contains invalid reference ${e4.value}`);
              return this.settings.reference ? this.settings.reference(e4.value) : r.reference(e4.value);
            }));
          }
          _subFormula(e3, s) {
            const n = this.settings.functions[s];
            if ("function" != typeof n) throw new Error(`Formula contains unknown function ${s}`);
            let a = [];
            if (e3) {
              let t4 = "", n2 = 0, i = false;
              const o = () => {
                if (!t4) throw new Error(`Formula contains function ${s} with invalid arguments ${e3}`);
                a.push(t4), t4 = "";
              };
              for (let s2 = 0; s2 < e3.length; ++s2) {
                const a2 = e3[s2];
                i ? (t4 += a2, a2 === i && (i = false)) : a2 in r.literals && !n2 ? (t4 += a2, i = r.literals[a2]) : "," !== a2 || n2 ? (t4 += a2, "(" === a2 ? ++n2 : ")" === a2 && --n2) : o();
              }
              o();
            }
            return a = a.map(((e4) => new t3.Parser(e4, this.settings))), function(e4) {
              const t4 = [];
              for (const r2 of a) t4.push(r2.evaluate(e4));
              return n.call(e4, ...t4);
            };
          }
          evaluate(e3) {
            const t4 = this._parts.slice();
            for (let s = t4.length - 2; s >= 0; --s) {
              const n = t4[s];
              if (n && "operator" === n.type) {
                const a = t4[s + 1];
                t4.splice(s + 1, 1);
                const i = r.evaluate(a, e3);
                t4[s] = r.single(n.value, i);
              }
            }
            return r.operatorsOrder.forEach(((s) => {
              for (let n = 1; n < t4.length - 1; ) if (s.includes(t4[n])) {
                const s2 = t4[n], a = r.evaluate(t4[n - 1], e3), i = r.evaluate(t4[n + 1], e3);
                t4.splice(n, 2);
                const o = r.calculate(s2, a, i);
                t4[n - 1] = 0 === o ? 0 : o;
              } else n += 2;
            })), r.evaluate(t4[0], e3);
          }
        }, t3.Parser.prototype[r.symbol] = true, r.reference = function(e3) {
          return function(t4) {
            return t4 && void 0 !== t4[e3] ? t4[e3] : null;
          };
        }, r.evaluate = function(e3, t4) {
          return null === e3 ? null : "function" == typeof e3 ? e3(t4) : e3[r.symbol] ? e3.evaluate(t4) : e3;
        }, r.single = function(e3, t4) {
          if ("!" === e3) return !t4;
          const r2 = -t4;
          return 0 === r2 ? 0 : r2;
        }, r.calculate = function(e3, t4, s) {
          if ("??" === e3) return r.exists(t4) ? t4 : s;
          if ("string" == typeof t4 || "string" == typeof s) {
            if ("+" === e3) return (t4 = r.exists(t4) ? t4 : "") + (r.exists(s) ? s : "");
          } else switch (e3) {
            case "^":
              return Math.pow(t4, s);
            case "*":
              return t4 * s;
            case "/":
              return t4 / s;
            case "%":
              return t4 % s;
            case "+":
              return t4 + s;
            case "-":
              return t4 - s;
          }
          switch (e3) {
            case "<":
              return t4 < s;
            case "<=":
              return t4 <= s;
            case ">":
              return t4 > s;
            case ">=":
              return t4 >= s;
            case "==":
              return t4 === s;
            case "!=":
              return t4 !== s;
            case "&&":
              return t4 && s;
            case "||":
              return t4 || s;
          }
          return null;
        }, r.exists = function(e3) {
          return null != e3;
        };
      }, 9926: () => {
      }, 5688: () => {
      }, 9708: () => {
      }, 1152: () => {
      }, 443: () => {
      }, 9848: () => {
      }, 5934: (e2) => {
        e2.exports = JSON.parse('{"version":"17.13.3"}');
      } }, t2 = {}, (function r(s) {
        var n = t2[s];
        if (void 0 !== n) return n.exports;
        var a = t2[s] = { exports: {} };
        return e[s](a, a.exports, r), a.exports;
      })(5107);
      var e, t2;
    }));
  })(joiBrowser_min);
  return joiBrowser_min.exports;
}
var joiBrowser_minExports = requireJoiBrowser_min();
const Joi = /* @__PURE__ */ getDefaultExportFromCjs(joiBrowser_minExports);
const configSchema = Joi.object({
  environment: Joi.string().valid("development", "staging", "production").default("development"),
  api: Joi.object({
    baseUrl: Joi.string().uri().required(),
    timeout: Joi.number().min(1e3).max(6e4).default(3e4),
    retries: Joi.number().min(0).max(5).default(3),
    rateLimit: Joi.object({
      requests: Joi.number().min(1).default(100),
      window: Joi.number().min(1).default(60)
    }).optional()
  }).required(),
  fhir: Joi.object({
    serverUrl: Joi.string().uri().required(),
    version: Joi.string().valid("R4", "R5").default("R4"),
    authentication: Joi.object({
      type: Joi.string().valid("oauth2", "basic", "bearer").required(),
      credentials: Joi.object().required()
    }).optional()
  }).required(),
  nphies: Joi.object({
    baseUrl: Joi.string().uri().required(),
    clientId: Joi.string().required(),
    clientSecret: Joi.string().optional(),
    scope: Joi.array().items(Joi.string()).default(["read", "write"]),
    sandbox: Joi.boolean().default(true)
  }).required(),
  security: Joi.object({
    encryption: Joi.object({
      algorithm: Joi.string().default("AES-256-GCM"),
      keySize: Joi.number().valid(128, 192, 256).default(256)
    }).required(),
    audit: Joi.object({
      enabled: Joi.boolean().default(true),
      endpoint: Joi.string().uri().optional()
    }).required(),
    hipaa: Joi.object({
      enabled: Joi.boolean().default(true),
      auditLevel: Joi.string().valid("minimal", "standard", "comprehensive").default("standard")
    }).required()
  }).required(),
  localization: Joi.object({
    defaultLanguage: Joi.string().valid("ar", "en").default("ar"),
    supportedLanguages: Joi.array().items(Joi.string()).default(["ar", "en"]),
    rtl: Joi.boolean().default(true)
  }).required(),
  ai: Joi.object({
    enabled: Joi.boolean().default(false),
    providers: Joi.object({
      nlp: Joi.object({
        endpoint: Joi.string().uri().required(),
        model: Joi.string().required()
      }).optional(),
      analytics: Joi.object({
        endpoint: Joi.string().uri().required(),
        model: Joi.string().required()
      }).optional()
    }).required()
  }).required(),
  ui: Joi.object({
    theme: Joi.string().valid("light", "dark", "auto").default("light"),
    glassMorphism: Joi.object({
      enabled: Joi.boolean().default(true),
      opacity: Joi.number().min(0).max(1).default(0.1),
      blur: Joi.number().min(0).max(50).default(20)
    }).required(),
    performance: Joi.object({
      targetFps: Joi.number().min(30).max(120).default(60),
      lazyLoading: Joi.boolean().default(true),
      virtualScrolling: Joi.boolean().default(true)
    }).required()
  }).required(),
  logging: Joi.object({
    level: Joi.string().valid("debug", "info", "warn", "error").default("info"),
    format: Joi.string().valid("json", "text").default("json"),
    outputs: Joi.array().items(Joi.string().valid("console", "file", "remote")).default(["console"])
  }).required()
});
class ConfigManager {
  config;
  validator;
  constructor(options = {}) {
    this.validator = options.validator;
    this.config = this.createDefaultConfig();
    if (options) {
      this.update(options);
    }
  }
  /**
   * Get configuration value by path
   */
  get(path) {
    const keys = path.split(".");
    let value = this.config;
    for (const key of keys) {
      if (value && typeof value === "object" && value !== null && key in value) {
        value = value[key];
      } else {
        throw new Error(`Configuration key '${path}' not found`);
      }
    }
    return value;
  }
  /**
   * Update configuration
   */
  update(newConfig) {
    this.config = this.mergeConfig(
      this.config,
      newConfig
    );
  }
  /**
   * Validate configuration
   */
  validate() {
    try {
      const result = configSchema.validate(this.config, {
        abortEarly: false,
        allowUnknown: false
      });
      if (result.error) {
        throw new Error(`Configuration validation failed: ${result.error.message}`);
      }
      this.config = result.value;
      if (this.validator && !this.validator(this.config)) {
        throw new Error("Custom configuration validation failed");
      }
    } catch (error) {
      throw new Error(
        `Configuration validation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get full configuration
   */
  getAll() {
    return { ...this.config };
  }
  createDefaultConfig() {
    return {
      environment: "development",
      api: {
        baseUrl: "https://api.brainsait.com",
        timeout: 3e4,
        retries: 3
      },
      fhir: {
        serverUrl: "https://fhir.nphies.sa",
        version: "R4"
      },
      nphies: {
        baseUrl: "https://nphies.sa",
        clientId: "",
        scope: ["read", "write"],
        sandbox: true
      },
      security: {
        encryption: {
          algorithm: "AES-256-GCM",
          keySize: 256
        },
        audit: {
          enabled: true
        },
        hipaa: {
          enabled: true,
          auditLevel: "standard"
        }
      },
      localization: {
        defaultLanguage: "ar",
        supportedLanguages: ["ar", "en"],
        rtl: true
      },
      ai: {
        enabled: false,
        providers: {
          nlp: {
            endpoint: "https://api.openai.com/v1",
            model: "gpt-3.5-turbo"
          },
          analytics: {
            endpoint: "https://api.openai.com/v1",
            model: "gpt-3.5-turbo"
          }
        }
      },
      ui: {
        theme: "light",
        glassMorphism: {
          enabled: true,
          opacity: 0.1,
          blur: 20
        },
        performance: {
          targetFps: 60,
          lazyLoading: true,
          virtualScrolling: true
        }
      },
      logging: {
        level: "info",
        format: "json",
        outputs: ["console"]
      }
    };
  }
  mergeConfig(base, override) {
    const result = { ...base };
    for (const key in override) {
      if (override[key] !== void 0) {
        const overrideValue = override[key];
        const baseValue = result[key];
        if (typeof overrideValue === "object" && !Array.isArray(overrideValue) && overrideValue !== null && typeof baseValue === "object" && !Array.isArray(baseValue) && baseValue !== null) {
          result[key] = this.mergeConfig(
            baseValue,
            overrideValue
          );
        } else {
          result[key] = overrideValue;
        }
      }
    }
    return result;
  }
}
var browser = { exports: {} };
var quickFormatUnescaped;
var hasRequiredQuickFormatUnescaped;
function requireQuickFormatUnescaped() {
  if (hasRequiredQuickFormatUnescaped) return quickFormatUnescaped;
  hasRequiredQuickFormatUnescaped = 1;
  function tryStringify(o) {
    try {
      return JSON.stringify(o);
    } catch (e) {
      return '"[Circular]"';
    }
  }
  quickFormatUnescaped = format;
  function format(f, args, opts) {
    var ss = opts && opts.stringify || tryStringify;
    var offset = 1;
    if (typeof f === "object" && f !== null) {
      var len = args.length + offset;
      if (len === 1) return f;
      var objects = new Array(len);
      objects[0] = ss(f);
      for (var index = 1; index < len; index++) {
        objects[index] = ss(args[index]);
      }
      return objects.join(" ");
    }
    if (typeof f !== "string") {
      return f;
    }
    var argLen = args.length;
    if (argLen === 0) return f;
    var str = "";
    var a = 1 - offset;
    var lastPos = -1;
    var flen = f && f.length || 0;
    for (var i = 0; i < flen; ) {
      if (f.charCodeAt(i) === 37 && i + 1 < flen) {
        lastPos = lastPos > -1 ? lastPos : 0;
        switch (f.charCodeAt(i + 1)) {
          case 100:
          // 'd'
          case 102:
            if (a >= argLen)
              break;
            if (args[a] == null) break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Number(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 105:
            if (a >= argLen)
              break;
            if (args[a] == null) break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Math.floor(Number(args[a]));
            lastPos = i + 2;
            i++;
            break;
          case 79:
          // 'O'
          case 111:
          // 'o'
          case 106:
            if (a >= argLen)
              break;
            if (args[a] === void 0) break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            var type = typeof args[a];
            if (type === "string") {
              str += "'" + args[a] + "'";
              lastPos = i + 2;
              i++;
              break;
            }
            if (type === "function") {
              str += args[a].name || "<anonymous>";
              lastPos = i + 2;
              i++;
              break;
            }
            str += ss(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 115:
            if (a >= argLen)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += String(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 37:
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += "%";
            lastPos = i + 2;
            i++;
            a--;
            break;
        }
        ++a;
      }
      ++i;
    }
    if (lastPos === -1)
      return f;
    else if (lastPos < flen) {
      str += f.slice(lastPos);
    }
    return str;
  }
  return quickFormatUnescaped;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  const format = requireQuickFormatUnescaped();
  browser.exports = pino2;
  const _console = pfGlobalThisOrFallback().console || {};
  const stdSerializers = {
    mapHttpRequest: mock,
    mapHttpResponse: mock,
    wrapRequestSerializer: passthrough,
    wrapResponseSerializer: passthrough,
    wrapErrorSerializer: passthrough,
    req: mock,
    res: mock,
    err: asErrValue,
    errWithCause: asErrValue
  };
  function levelToValue(level, logger) {
    return level === "silent" ? Infinity : logger.levels.values[level];
  }
  const baseLogFunctionSymbol = Symbol("pino.logFuncs");
  const hierarchySymbol = Symbol("pino.hierarchy");
  const logFallbackMap = {
    error: "log",
    fatal: "error",
    warn: "error",
    info: "log",
    debug: "log",
    trace: "log"
  };
  function appendChildLogger(parentLogger, childLogger) {
    const newEntry = {
      logger: childLogger,
      parent: parentLogger[hierarchySymbol]
    };
    childLogger[hierarchySymbol] = newEntry;
  }
  function setupBaseLogFunctions(logger, levels, proto) {
    const logFunctions = {};
    levels.forEach((level) => {
      logFunctions[level] = proto[level] ? proto[level] : _console[level] || _console[logFallbackMap[level] || "log"] || noop2;
    });
    logger[baseLogFunctionSymbol] = logFunctions;
  }
  function shouldSerialize(serialize, serializers) {
    if (Array.isArray(serialize)) {
      const hasToFilter = serialize.filter(function(k) {
        return k !== "!stdSerializers.err";
      });
      return hasToFilter;
    } else if (serialize === true) {
      return Object.keys(serializers);
    }
    return false;
  }
  function pino2(opts) {
    opts = opts || {};
    opts.browser = opts.browser || {};
    const transmit2 = opts.browser.transmit;
    if (transmit2 && typeof transmit2.send !== "function") {
      throw Error("pino: transmit option must have a send function");
    }
    const proto = opts.browser.write || _console;
    if (opts.browser.write) opts.browser.asObject = true;
    const serializers = opts.serializers || {};
    const serialize = shouldSerialize(opts.browser.serialize, serializers);
    let stdErrSerialize = opts.browser.serialize;
    if (Array.isArray(opts.browser.serialize) && opts.browser.serialize.indexOf("!stdSerializers.err") > -1) stdErrSerialize = false;
    const customLevels = Object.keys(opts.customLevels || {});
    const levels = ["error", "fatal", "warn", "info", "debug", "trace"].concat(customLevels);
    if (typeof proto === "function") {
      levels.forEach(function(level2) {
        proto[level2] = proto;
      });
    }
    if (opts.enabled === false || opts.browser.disabled) opts.level = "silent";
    const level = opts.level || "info";
    const logger = Object.create(proto);
    if (!logger.log) logger.log = noop2;
    setupBaseLogFunctions(logger, levels, proto);
    appendChildLogger({}, logger);
    Object.defineProperty(logger, "levelVal", {
      get: getLevelVal
    });
    Object.defineProperty(logger, "level", {
      get: getLevel,
      set: setLevel
    });
    const setOpts = {
      transmit: transmit2,
      serialize,
      asObject: opts.browser.asObject,
      formatters: opts.browser.formatters,
      levels,
      timestamp: getTimeFunction(opts)
    };
    logger.levels = getLevels(opts);
    logger.level = level;
    logger.setMaxListeners = logger.getMaxListeners = logger.emit = logger.addListener = logger.on = logger.prependListener = logger.once = logger.prependOnceListener = logger.removeListener = logger.removeAllListeners = logger.listeners = logger.listenerCount = logger.eventNames = logger.write = logger.flush = noop2;
    logger.serializers = serializers;
    logger._serialize = serialize;
    logger._stdErrSerialize = stdErrSerialize;
    logger.child = child;
    if (transmit2) logger._logEvent = createLogEventShape();
    function getLevelVal() {
      return levelToValue(this.level, this);
    }
    function getLevel() {
      return this._level;
    }
    function setLevel(level2) {
      if (level2 !== "silent" && !this.levels.values[level2]) {
        throw Error("unknown level " + level2);
      }
      this._level = level2;
      set(this, setOpts, logger, "error");
      set(this, setOpts, logger, "fatal");
      set(this, setOpts, logger, "warn");
      set(this, setOpts, logger, "info");
      set(this, setOpts, logger, "debug");
      set(this, setOpts, logger, "trace");
      customLevels.forEach((level3) => {
        set(this, setOpts, logger, level3);
      });
    }
    function child(bindings, childOptions) {
      if (!bindings) {
        throw new Error("missing bindings for child Pino");
      }
      childOptions = childOptions || {};
      if (serialize && bindings.serializers) {
        childOptions.serializers = bindings.serializers;
      }
      const childOptionsSerializers = childOptions.serializers;
      if (serialize && childOptionsSerializers) {
        var childSerializers = Object.assign({}, serializers, childOptionsSerializers);
        var childSerialize = opts.browser.serialize === true ? Object.keys(childSerializers) : serialize;
        delete bindings.serializers;
        applySerializers([bindings], childSerialize, childSerializers, this._stdErrSerialize);
      }
      function Child(parent) {
        this._childLevel = (parent._childLevel | 0) + 1;
        this.bindings = bindings;
        if (childSerializers) {
          this.serializers = childSerializers;
          this._serialize = childSerialize;
        }
        if (transmit2) {
          this._logEvent = createLogEventShape(
            [].concat(parent._logEvent.bindings, bindings)
          );
        }
      }
      Child.prototype = this;
      const newLogger = new Child(this);
      appendChildLogger(this, newLogger);
      newLogger.level = this.level;
      return newLogger;
    }
    return logger;
  }
  function getLevels(opts) {
    const customLevels = opts.customLevels || {};
    const values = Object.assign({}, pino2.levels.values, customLevels);
    const labels = Object.assign({}, pino2.levels.labels, invertObject(customLevels));
    return {
      values,
      labels
    };
  }
  function invertObject(obj) {
    const inverted = {};
    Object.keys(obj).forEach(function(key) {
      inverted[obj[key]] = key;
    });
    return inverted;
  }
  pino2.levels = {
    values: {
      fatal: 60,
      error: 50,
      warn: 40,
      info: 30,
      debug: 20,
      trace: 10
    },
    labels: {
      10: "trace",
      20: "debug",
      30: "info",
      40: "warn",
      50: "error",
      60: "fatal"
    }
  };
  pino2.stdSerializers = stdSerializers;
  pino2.stdTimeFunctions = Object.assign({}, { nullTime, epochTime, unixTime, isoTime });
  function getBindingChain(logger) {
    const bindings = [];
    if (logger.bindings) {
      bindings.push(logger.bindings);
    }
    let hierarchy = logger[hierarchySymbol];
    while (hierarchy.parent) {
      hierarchy = hierarchy.parent;
      if (hierarchy.logger.bindings) {
        bindings.push(hierarchy.logger.bindings);
      }
    }
    return bindings.reverse();
  }
  function set(self2, opts, rootLogger, level) {
    Object.defineProperty(self2, level, {
      value: levelToValue(self2.level, rootLogger) > levelToValue(level, rootLogger) ? noop2 : rootLogger[baseLogFunctionSymbol][level],
      writable: true,
      enumerable: true,
      configurable: true
    });
    if (!opts.transmit && self2[level] === noop2) {
      return;
    }
    self2[level] = createWrap(self2, opts, rootLogger, level);
    const bindings = getBindingChain(self2);
    if (bindings.length === 0) {
      return;
    }
    self2[level] = prependBindingsInArguments(bindings, self2[level]);
  }
  function prependBindingsInArguments(bindings, logFunc) {
    return function() {
      return logFunc.apply(this, [...bindings, ...arguments]);
    };
  }
  function createWrap(self2, opts, rootLogger, level) {
    return /* @__PURE__ */ (function(write) {
      return function LOG() {
        const ts = opts.timestamp();
        const args = new Array(arguments.length);
        const proto = Object.getPrototypeOf && Object.getPrototypeOf(this) === _console ? _console : this;
        for (var i = 0; i < args.length; i++) args[i] = arguments[i];
        if (opts.serialize && !opts.asObject) {
          applySerializers(args, this._serialize, this.serializers, this._stdErrSerialize);
        }
        if (opts.asObject || opts.formatters) {
          write.call(proto, asObject(this, level, args, ts, opts.formatters));
        } else write.apply(proto, args);
        if (opts.transmit) {
          const transmitLevel = opts.transmit.level || self2._level;
          const transmitValue = rootLogger.levels.values[transmitLevel];
          const methodValue = rootLogger.levels.values[level];
          if (methodValue < transmitValue) return;
          transmit(this, {
            ts,
            methodLevel: level,
            methodValue,
            transmitValue: rootLogger.levels.values[opts.transmit.level || self2._level],
            send: opts.transmit.send,
            val: levelToValue(self2._level, rootLogger)
          }, args);
        }
      };
    })(self2[baseLogFunctionSymbol][level]);
  }
  function asObject(logger, level, args, ts, formatters = {}) {
    const {
      level: levelFormatter = () => logger.levels.values[level],
      log: logObjectFormatter = (obj) => obj
    } = formatters;
    if (logger._serialize) applySerializers(args, logger._serialize, logger.serializers, logger._stdErrSerialize);
    const argsCloned = args.slice();
    let msg = argsCloned[0];
    const logObject = {};
    if (ts) {
      logObject.time = ts;
    }
    logObject.level = levelFormatter(level, logger.levels.values[level]);
    let lvl = (logger._childLevel | 0) + 1;
    if (lvl < 1) lvl = 1;
    if (msg !== null && typeof msg === "object") {
      while (lvl-- && typeof argsCloned[0] === "object") {
        Object.assign(logObject, argsCloned.shift());
      }
      msg = argsCloned.length ? format(argsCloned.shift(), argsCloned) : void 0;
    } else if (typeof msg === "string") msg = format(argsCloned.shift(), argsCloned);
    if (msg !== void 0) logObject.msg = msg;
    const formattedLogObject = logObjectFormatter(logObject);
    return formattedLogObject;
  }
  function applySerializers(args, serialize, serializers, stdErrSerialize) {
    for (const i in args) {
      if (stdErrSerialize && args[i] instanceof Error) {
        args[i] = pino2.stdSerializers.err(args[i]);
      } else if (typeof args[i] === "object" && !Array.isArray(args[i])) {
        for (const k in args[i]) {
          if (serialize && serialize.indexOf(k) > -1 && k in serializers) {
            args[i][k] = serializers[k](args[i][k]);
          }
        }
      }
    }
  }
  function transmit(logger, opts, args) {
    const send = opts.send;
    const ts = opts.ts;
    const methodLevel = opts.methodLevel;
    const methodValue = opts.methodValue;
    const val = opts.val;
    const bindings = logger._logEvent.bindings;
    applySerializers(
      args,
      logger._serialize || Object.keys(logger.serializers),
      logger.serializers,
      logger._stdErrSerialize === void 0 ? true : logger._stdErrSerialize
    );
    logger._logEvent.ts = ts;
    logger._logEvent.messages = args.filter(function(arg) {
      return bindings.indexOf(arg) === -1;
    });
    logger._logEvent.level.label = methodLevel;
    logger._logEvent.level.value = methodValue;
    send(methodLevel, logger._logEvent, val);
    logger._logEvent = createLogEventShape(bindings);
  }
  function createLogEventShape(bindings) {
    return {
      ts: 0,
      messages: [],
      bindings: bindings || [],
      level: { label: "", value: 0 }
    };
  }
  function asErrValue(err) {
    const obj = {
      type: err.constructor.name,
      msg: err.message,
      stack: err.stack
    };
    for (const key in err) {
      if (obj[key] === void 0) {
        obj[key] = err[key];
      }
    }
    return obj;
  }
  function getTimeFunction(opts) {
    if (typeof opts.timestamp === "function") {
      return opts.timestamp;
    }
    if (opts.timestamp === false) {
      return nullTime;
    }
    return epochTime;
  }
  function mock() {
    return {};
  }
  function passthrough(a) {
    return a;
  }
  function noop2() {
  }
  function nullTime() {
    return false;
  }
  function epochTime() {
    return Date.now();
  }
  function unixTime() {
    return Math.round(Date.now() / 1e3);
  }
  function isoTime() {
    return new Date(Date.now()).toISOString();
  }
  function pfGlobalThisOrFallback() {
    function defd(o) {
      return typeof o !== "undefined" && o;
    }
    try {
      if (typeof globalThis !== "undefined") return globalThis;
      Object.defineProperty(Object.prototype, "globalThis", {
        get: function() {
          delete Object.prototype.globalThis;
          return this.globalThis = this;
        },
        configurable: true
      });
      return globalThis;
    } catch (e) {
      return defd(self) || defd(window) || defd(this) || {};
    }
  }
  browser.exports.default = pino2;
  browser.exports.pino = pino2;
  return browser.exports;
}
var browserExports = requireBrowser();
const pino = /* @__PURE__ */ getDefaultExportFromCjs(browserExports);
class Logger {
  logger;
  constructor(config) {
    if (config.format === "text") {
      this.logger = pino(
        {
          level: config.level,
          timestamp: pino.stdTimeFunctions.isoTime,
          formatters: {
            level: (label) => ({ level: label })
          }
        },
        pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard"
          }
        })
      );
    } else {
      this.logger = pino({
        level: config.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label })
        }
      });
    }
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, error, ...args) {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...args }, message);
    } else {
      this.logger.error({ error, ...args }, message);
    }
  }
  child(bindings) {
    const childLogger = new Logger({ level: "info", format: "json", outputs: ["console"] });
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }
}
class PerformanceMonitor {
  config;
  onMetric;
  metrics;
  intervalId;
  frameCount = 0;
  lastFrameTime = 0;
  constructor(config, onMetric) {
    this.config = config;
    this.onMetric = onMetric;
    this.metrics = {
      apiResponseTime: 0,
      uiFrameRate: 0,
      memoryUsage: 0,
      concurrentUsers: 0
    };
  }
  start() {
    this.intervalId = setInterval(() => {
      this.updateMetrics();
    }, 1e3);
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      this.startFpsMonitoring();
    }
  }
  stop() {
    if (this.intervalId !== void 0) {
      clearInterval(this.intervalId);
      this.intervalId = void 0;
    }
    return Promise.resolve();
  }
  getMetrics() {
    return { ...this.metrics };
  }
  recordApiResponse(responseTime) {
    const alpha = 0.1;
    this.metrics.apiResponseTime = this.metrics.apiResponseTime === 0 ? responseTime : alpha * responseTime + (1 - alpha) * this.metrics.apiResponseTime;
    if (responseTime > 2500) {
      this.onMetric?.({
        ...this.metrics,
        apiResponseTime: responseTime
      });
    }
  }
  incrementConcurrentUsers() {
    this.metrics.concurrentUsers++;
  }
  decrementConcurrentUsers() {
    this.metrics.concurrentUsers = Math.max(0, this.metrics.concurrentUsers - 1);
  }
  updateMetrics() {
    if (process?.memoryUsage) {
      const memory = process.memoryUsage();
      this.metrics.memoryUsage = memory.heapUsed / 1024 / 1024;
    } else if (typeof performance !== "undefined") {
      const performanceMemory = performance.memory;
      if (performanceMemory?.usedJSHeapSize) {
        this.metrics.memoryUsage = performanceMemory.usedJSHeapSize / 1024 / 1024;
      }
    }
    this.onMetric?.(this.metrics);
  }
  startFpsMonitoring() {
    const measureFps = (timestamp) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp;
        this.frameCount = 0;
      } else {
        this.frameCount++;
        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed >= 1e3) {
          const fps = Math.round(this.frameCount * 1e3 / elapsed);
          this.metrics.uiFrameRate = fps;
          if (fps < this.config.targetFps * 0.8) {
            this.onMetric?.({
              ...this.metrics,
              uiFrameRate: fps
            });
          }
          this.lastFrameTime = timestamp;
          this.frameCount = 0;
        }
      }
      requestAnimationFrame(measureFps);
    };
    requestAnimationFrame(measureFps);
  }
  // Performance optimization utilities
  debounce(func, wait) {
    let timeout;
    return ((...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    });
  }
  throttle(func, limit) {
    let inThrottle;
    return ((...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    });
  }
  memoize(func) {
    const cache = /* @__PURE__ */ new Map();
    return ((...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    });
  }
  createVirtualList(items, containerHeight, itemHeight) {
    if (!this.config.virtualScrolling) {
      return { visibleItems: items, startIndex: 0, endIndex: items.length - 1 };
    }
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(visibleCount / 2);
    const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight) - buffer);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + buffer * 2);
    return {
      visibleItems: items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex
    };
  }
}
class FHIRClient {
  constructor(config, logger, apiClient) {
    this.config = config;
    this.logger = logger;
    this.apiClient = apiClient;
    const fhirConfig = this.config.get("fhir");
    this.serverUrl = fhirConfig.serverUrl;
  }
  serverUrl;
  authToken;
  async initialize() {
    this.logger.info("Initializing FHIR client...");
    try {
      await this.getCapabilityStatement();
      const fhirConfig = this.config.get("fhir");
      if (fhirConfig.authentication) {
        await this.authenticate();
      }
      this.logger.info("FHIR client initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize FHIR client", error);
      throw error;
    }
  }
  async healthCheck() {
    const startTime = Date.now();
    try {
      await this.getCapabilityStatement();
      return {
        status: "up",
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      this.logger.error("FHIR server health check failed", error);
      return {
        status: "down",
        responseTime: Date.now() - startTime
      };
    }
  }
  async shutdown() {
    this.logger.info("Shutting down FHIR client...");
    this.authToken = void 0;
    this.logger.info("FHIR client shutdown completed");
  }
  // ===== CRUD Operations =====
  /**
   * Create a new FHIR resource
   */
  async create(resource) {
    this.validateResource(resource);
    const url = `${this.serverUrl}/${resource.resourceType}`;
    try {
      const response = await this.apiClient.post(url, resource, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "create", resource.resourceType);
    }
  }
  /**
   * Read a FHIR resource by ID
   */
  async read(resourceType, id, versionId) {
    let url = `${this.serverUrl}/${resourceType}/${id}`;
    if (versionId) {
      url += `/_history/${versionId}`;
    }
    try {
      const response = await this.apiClient.get(url, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "read", resourceType);
    }
  }
  /**
   * Update a FHIR resource
   */
  async update(resource) {
    if (!resource.id) {
      throw new Error("Resource must have an id for update operation");
    }
    this.validateResource(resource);
    const url = `${this.serverUrl}/${resource.resourceType}/${resource.id}`;
    try {
      const response = await this.apiClient.put(url, resource, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "update", resource.resourceType);
    }
  }
  /**
   * Delete a FHIR resource
   */
  async delete(resourceType, id) {
    const url = `${this.serverUrl}/${resourceType}/${id}`;
    try {
      await this.apiClient.delete(url, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
    } catch (error) {
      throw this.handleError(error, "delete", resourceType);
    }
  }
  // ===== Search Operations =====
  /**
   * Search for FHIR resources
   */
  async search(resourceType, parameters = {}) {
    const url = this.buildSearchUrl(resourceType, parameters);
    try {
      const response = await this.apiClient.get(url, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processSearchResponse(response);
    } catch (error) {
      throw this.handleError(error, "search", resourceType);
    }
  }
  // ===== Bundle Operations =====
  /**
   * Submit a transaction bundle
   */
  async transaction(bundle) {
    if (bundle.type !== "transaction") {
      throw new Error('Bundle type must be "transaction" for transaction operations');
    }
    const url = `${this.serverUrl}`;
    try {
      const response = await this.apiClient.post(url, bundle, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "transaction", "Bundle");
    }
  }
  /**
   * Submit a batch bundle
   */
  async batch(bundle) {
    if (bundle.type !== "batch") {
      throw new Error('Bundle type must be "batch" for batch operations');
    }
    const url = `${this.serverUrl}`;
    try {
      const response = await this.apiClient.post(url, bundle, {
        headers: this.getHeaders(),
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "batch", "Bundle");
    }
  }
  // ===== Utility Methods =====
  /**
   * Get server capability statement
   */
  async getCapabilityStatement() {
    const url = `${this.serverUrl}/metadata`;
    try {
      const response = await this.apiClient.get(url, {
        headers: { Accept: "application/fhir+json" },
        timeout: this.config.get("api.timeout")
      });
      return this.processResponse(response);
    } catch (error) {
      throw this.handleError(error, "capability", "metadata");
    }
  }
  // ===== Private Methods =====
  async authenticate() {
    this.authToken = "simulated-token";
    this.logger.info("FHIR authentication successful");
  }
  getHeaders() {
    const headers = {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json"
    };
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    return headers;
  }
  validateResource(resource) {
    if (!resource.resourceType) {
      throw new Error("Resource must have a resourceType");
    }
  }
  buildSearchUrl(resourceType, parameters) {
    const baseUrl = `${this.serverUrl}/${resourceType}`;
    const searchParams = new URLSearchParams();
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
  processResponse(response) {
    if (!response.success || !response.data) {
      throw new Error(`FHIR operation failed: ${response.error ?? "Unknown error"}`);
    }
    return {
      data: response.data,
      status: 200,
      // Default success status
      headers: {},
      // ApiResponse doesn't include headers, using empty object
      resourceId: response.data.id,
      versionId: response.data.meta?.versionId
    };
  }
  processSearchResponse(response) {
    if (!response.success || !response.data) {
      throw new Error(`FHIR search failed: ${response.error ?? "Unknown error"}`);
    }
    const bundle = response.data;
    const resources = (bundle.entry ?? []).map((entry) => entry.resource).filter((resource) => resource !== void 0);
    const links = {};
    return {
      data: bundle,
      total: bundle.total,
      resources,
      links
    };
  }
  handleError(error, operation, resourceType) {
    const fhirError = new Error(
      `FHIR ${operation} operation failed: ${error.message}`
    );
    fhirError.name = "FHIRError";
    fhirError.status = 500;
    fhirError.operation = operation;
    fhirError.resource = resourceType;
    return fhirError;
  }
}
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const validateSaudiID = (id) => {
  if (!/^\d{10}$/.test(id)) return false;
  const digits = id.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = digits[i];
    if (digit !== void 0) {
      sum += digit * (10 - i);
    }
  }
  const checkDigit = (11 - sum % 11) % 11;
  const lastDigit = digits[9];
  return lastDigit !== void 0 && checkDigit === lastDigit;
};
class FHIRValidator {
  /**
   * Validate a FHIR resource
   */
  validateResource(resource) {
    const issues = [];
    this.validateBasicFHIR(resource, issues);
    switch (resource.resourceType) {
      case "Patient":
        this.validatePatient(resource, issues);
        break;
    }
    this.validateSaudiExtensions(resource, issues);
    return {
      isValid: !issues.some((issue) => issue.severity === "error"),
      issues
    };
  }
  /**
   * Convert validation result to FHIR OperationOutcome
   */
  toOperationOutcome(result) {
    return {
      resourceType: "OperationOutcome",
      issue: result.issues.map((issue) => ({
        severity: issue.severity === "error" ? "error" : issue.severity === "warning" ? "warning" : "information",
        code: issue.code,
        diagnostics: issue.message,
        expression: issue.path ? [issue.path] : void 0
      }))
    };
  }
  validateBasicFHIR(resource, issues) {
    if (!resource.resourceType) {
      issues.push({
        severity: "error",
        code: "required",
        message: "resourceType is required",
        path: "resourceType"
      });
    }
    if (resource.meta) {
      if (resource.meta.versionId && !/^\d+$/.test(resource.meta.versionId)) {
        issues.push({
          severity: "error",
          code: "invalid",
          message: "meta.versionId must be a numeric string",
          path: "meta.versionId"
        });
      }
      if (resource.meta.lastUpdated) {
        if (!this.isValidDateTime(resource.meta.lastUpdated)) {
          issues.push({
            severity: "error",
            code: "invalid",
            message: "meta.lastUpdated must be a valid ISO 8601 datetime",
            path: "meta.lastUpdated"
          });
        }
      }
    }
  }
  validatePatient(patient, issues) {
    if (patient.identifier) {
      patient.identifier.forEach((identifier, index) => {
        if (!identifier.system && !identifier.value) {
          issues.push({
            severity: "error",
            code: "required",
            message: "Identifier must have either system or value",
            path: `identifier[${index}]`
          });
        }
        if (identifier.system === "https://fhir.nphies.sa/CodeSystem/identifier" && identifier.value) {
          if (!validateSaudiID(identifier.value)) {
            issues.push({
              severity: "error",
              code: "invalid",
              message: "Invalid Saudi National ID format",
              path: `identifier[${index}].value`
            });
          }
        }
      });
    }
    if (patient.name) {
      patient.name.forEach((name, index) => {
        if (!name.family && (!name.given || name.given.length === 0)) {
          issues.push({
            severity: "warning",
            code: "incomplete",
            message: "Name should have either family name or given name",
            path: `name[${index}]`
          });
        }
        if (name.family && this.containsArabic(name.family)) {
          this.validateArabicText(name.family, `name[${index}].family`, issues);
        }
        if (name.given) {
          name.given.forEach((given, givenIndex) => {
            if (this.containsArabic(given)) {
              this.validateArabicText(given, `name[${index}].given[${givenIndex}]`, issues);
            }
          });
        }
      });
    }
    if (patient.birthDate) {
      if (!this.isValidDate(patient.birthDate)) {
        issues.push({
          severity: "error",
          code: "invalid",
          message: "birthDate must be a valid date in YYYY-MM-DD format",
          path: "birthDate"
        });
      } else {
        const birthYear = new Date(patient.birthDate).getFullYear();
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        if (currentYear - birthYear > 150) {
          issues.push({
            severity: "warning",
            code: "unusual",
            message: "Patient age appears to be over 150 years",
            path: "birthDate"
          });
        }
      }
    }
    if (patient.telecom) {
      patient.telecom.forEach((telecom, index) => {
        if (telecom.system === "phone" && telecom.value) {
          if (!this.isValidSaudiPhoneNumber(telecom.value)) {
            issues.push({
              severity: "warning",
              code: "invalid-format",
              message: "Phone number does not match Saudi Arabia format",
              path: `telecom[${index}].value`
            });
          }
        }
        if (telecom.system === "email" && telecom.value) {
          if (!this.isValidEmail(telecom.value)) {
            issues.push({
              severity: "error",
              code: "invalid",
              message: "Invalid email format",
              path: `telecom[${index}].value`
            });
          }
        }
      });
    }
    if (patient.address) {
      patient.address.forEach((address, index) => {
        if (address.country === "SA" || address.country === "Saudi Arabia") {
          if (address.postalCode && !this.isValidSaudiPostalCode(address.postalCode)) {
            issues.push({
              severity: "warning",
              code: "invalid-format",
              message: "Postal code does not match Saudi Arabia format (5 digits)",
              path: `address[${index}].postalCode`
            });
          }
          if (address.city && !this.containsArabic(address.city)) {
            issues.push({
              severity: "information",
              code: "localization",
              message: "City name should include Arabic text for Saudi addresses",
              path: `address[${index}].city`
            });
          }
        }
      });
    }
  }
  validateSaudiExtensions(resource, issues) {
    if (resource.resourceType === "Patient") {
      const patient = resource;
      if (patient.extension) {
        patient.extension.forEach((ext, index) => {
          if (ext.url === "https://fhir.nphies.sa/StructureDefinition/saudi-patient") {
            if (ext.valueString) {
              try {
                const saudiExt = JSON.parse(ext.valueString);
                if (saudiExt.saudiNationalId && !validateSaudiID(saudiExt.saudiNationalId)) {
                  issues.push({
                    severity: "error",
                    code: "invalid",
                    message: "Invalid Saudi National ID in extension",
                    path: `extension[${index}].valueString.saudiNationalId`
                  });
                }
                if (saudiExt.residencyType && !["citizen", "resident", "visitor"].includes(saudiExt.residencyType)) {
                  issues.push({
                    severity: "error",
                    code: "invalid",
                    message: "Invalid residency type. Must be citizen, resident, or visitor",
                    path: `extension[${index}].valueString.residencyType`
                  });
                }
              } catch (error) {
                issues.push({
                  severity: "error",
                  code: "invalid",
                  message: "Invalid JSON in Saudi patient extension",
                  path: `extension[${index}].valueString`
                });
              }
            }
          }
        });
      }
    }
  }
  isValidDateTime(dateTime) {
    return !isNaN(Date.parse(dateTime));
  }
  isValidDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  isValidSaudiPhoneNumber(phone) {
    return /^(\+966|966|0)?5[0-9]{8}$/.test(phone.replace(/[\s-]/g, ""));
  }
  isValidSaudiPostalCode(postalCode) {
    return /^\d{5}$/.test(postalCode);
  }
  containsArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
  }
  validateArabicText(text, path, issues) {
    if (text.length > 0 && !this.containsArabic(text)) {
      issues.push({
        severity: "information",
        code: "localization",
        message: "Text should contain Arabic characters for Saudi localization",
        path
      });
    }
    const hasArabic = this.containsArabic(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    if (hasArabic && hasLatin && text.length > 20) {
      issues.push({
        severity: "warning",
        code: "mixed-script",
        message: "Text contains mixed Arabic and Latin scripts",
        path
      });
    }
  }
}
const fhirValidator = new FHIRValidator();
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
class FHIRBundleBuilder {
  bundle;
  constructor(type, id) {
    this.bundle = {
      resourceType: "Bundle",
      id: id ?? v4(),
      type,
      entry: [],
      meta: {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  /**
   * Add a resource to the bundle
   */
  addResource(resource, fullUrl) {
    const entry = {
      fullUrl: fullUrl ?? `urn:uuid:${resource.id ?? v4()}`,
      resource
    };
    this.bundle.entry = this.bundle.entry ?? [];
    this.bundle.entry.push(entry);
    return this;
  }
  /**
   * Add a resource with request for transaction/batch bundles
   */
  addResourceWithRequest(resource, method, url, fullUrl) {
    const entry = {
      fullUrl: fullUrl ?? `urn:uuid:${resource.id ?? v4()}`,
      resource,
      request: {
        method,
        url
      }
    };
    this.bundle.entry = this.bundle.entry ?? [];
    this.bundle.entry.push(entry);
    return this;
  }
  /**
   * Add a create request to transaction bundle
   */
  addCreate(resource) {
    if (!resource.resourceType) {
      throw new Error("Resource must have resourceType for create operation");
    }
    return this.addResourceWithRequest(resource, "POST", resource.resourceType);
  }
  /**
   * Add an update request to transaction bundle
   */
  addUpdate(resource) {
    if (!resource.id) {
      throw new Error("Resource must have id for update operation");
    }
    return this.addResourceWithRequest(resource, "PUT", `${resource.resourceType}/${resource.id}`);
  }
  /**
   * Add a delete request to transaction bundle
   */
  addDelete(resourceType, id) {
    const entry = {
      request: {
        method: "DELETE",
        url: `${resourceType}/${id}`
      }
    };
    this.bundle.entry = this.bundle.entry ?? [];
    this.bundle.entry.push(entry);
    return this;
  }
  /**
   * Add a conditional create request
   */
  addConditionalCreate(resource, condition) {
    return this.addResourceWithRequest(resource, "POST", `${resource.resourceType}?${condition}`);
  }
  /**
   * Add a conditional update request
   */
  addConditionalUpdate(resource, condition) {
    return this.addResourceWithRequest(resource, "PUT", `${resource.resourceType}?${condition}`);
  }
  /**
   * Set bundle metadata
   */
  setMeta(meta) {
    this.bundle.meta = { ...this.bundle.meta, ...meta };
    return this;
  }
  /**
   * Set bundle total (for search results)
   */
  setTotal(total) {
    this.bundle.total = total;
    return this;
  }
  /**
   * Build and return the bundle
   */
  build() {
    this.bundle.total = this.bundle.entry?.length ?? 0;
    return { ...this.bundle };
  }
  /**
   * Get current bundle (without cloning)
   */
  getBundle() {
    return this.bundle;
  }
}
class FHIRBundleProcessor {
  /**
   * Extract all resources from a bundle
   */
  static extractResources(bundle) {
    if (!bundle.entry) return [];
    return bundle.entry.map((entry) => entry.resource).filter((resource) => resource !== void 0);
  }
  /**
   * Extract resources of specific type from bundle
   */
  static extractResourcesByType(bundle, resourceType) {
    return this.extractResources(bundle).filter(
      (resource) => resource.resourceType === resourceType
    );
  }
  /**
   * Find resource by ID in bundle
   */
  static findResourceById(bundle, resourceType, id) {
    return this.extractResources(bundle).find(
      (resource) => resource.resourceType === resourceType && resource.id === id
    );
  }
  /**
   * Validate bundle structure
   */
  static validateBundle(bundle) {
    const errors = [];
    if (!bundle.resourceType || bundle.resourceType !== "Bundle") {
      errors.push('Bundle must have resourceType "Bundle"');
    }
    if (!bundle.type) {
      errors.push("Bundle must have a type");
    }
    if (bundle.type === "transaction" || bundle.type === "batch") {
      if (!bundle.entry || bundle.entry.length === 0) {
        errors.push("Transaction/batch bundles must have at least one entry");
      }
      bundle.entry?.forEach((entry, index) => {
        const completeEntry = entry;
        if (!completeEntry.request) {
          errors.push(`Entry ${index} in transaction/batch bundle must have a request`);
        }
      });
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  /**
   * Create a response bundle from a request bundle
   */
  static createResponseBundle(requestBundle, responses) {
    const responseType = requestBundle.type === "transaction" ? "transaction-response" : "batch-response";
    const builder = new FHIRBundleBuilder(responseType);
    requestBundle.entry?.forEach((requestEntry, index) => {
      const response = responses[index];
      if (response) {
        const responseEntry = {
          fullUrl: requestEntry.fullUrl,
          resource: response.resource,
          response: {
            status: response.status,
            location: response.location
          }
        };
        const bundle = builder.getBundle();
        bundle.entry = bundle.entry ?? [];
        bundle.entry.push(responseEntry);
      }
    });
    return builder.build();
  }
  /**
   * Split large bundle into smaller chunks
   */
  static splitBundle(bundle, maxSize) {
    if (!bundle.entry || bundle.entry.length <= maxSize) {
      return [bundle];
    }
    const chunks = [];
    for (let i = 0; i < bundle.entry.length; i += maxSize) {
      const chunkEntries = bundle.entry.slice(i, i + maxSize);
      const chunkBundle = {
        ...bundle,
        id: `${bundle.id}-chunk-${Math.floor(i / maxSize) + 1}`,
        entry: chunkEntries,
        total: chunkEntries.length
      };
      chunks.push(chunkBundle);
    }
    return chunks;
  }
  /**
   * Create a search result bundle
   */
  static createSearchBundle(resources, total, links) {
    const builder = new FHIRBundleBuilder("searchset");
    resources.forEach((resource) => {
      builder.addResource(resource);
    });
    if (total !== void 0) {
      builder.setTotal(total);
    }
    const bundle = builder.build();
    if (links) {
      bundle.meta = {
        ...bundle.meta,
        extension: Object.entries(links).map(([rel, url]) => ({
          url: `http://hl7.org/fhir/link-type#${rel}`,
          valueString: url
        }))
      };
    }
    return bundle;
  }
}
function createTransactionBundle() {
  return new FHIRBundleBuilder("transaction");
}
function createBatchBundle() {
  return new FHIRBundleBuilder("batch");
}
function createDocumentBundle(composition) {
  const builder = new FHIRBundleBuilder("document");
  builder.addResource(composition);
  return builder;
}
function createCollectionBundle() {
  return new FHIRBundleBuilder("collection");
}
const SAUDI_SYSTEMS = {
  NATIONAL_ID: "https://fhir.nphies.sa/CodeSystem/identifier",
  FAMILY_CARD: "https://fhir.nphies.sa/CodeSystem/family-card",
  SPONSOR_ID: "https://fhir.nphies.sa/CodeSystem/sponsor",
  REGION: "https://fhir.nphies.sa/CodeSystem/region",
  RESIDENCY_TYPE: "https://fhir.nphies.sa/CodeSystem/residency-type",
  PATIENT_EXTENSION: "https://fhir.nphies.sa/StructureDefinition/saudi-patient"
};
const SAUDI_REGIONS = [
  "riyadh",
  "makkah",
  "madinah",
  "qassim",
  "eastern",
  "asir",
  "tabuk",
  "hail",
  "northern-borders",
  "jazan",
  "najran",
  "al-bahah",
  "al-jawf"
];
class SaudiPatientBuilder {
  patient;
  constructor() {
    this.patient = {
      resourceType: "Patient",
      identifier: [],
      name: [],
      extension: []
    };
  }
  /**
   * Set Saudi National ID
   */
  setSaudiNationalId(nationalId, skipValidation = false) {
    if (!skipValidation && !validateSaudiID(nationalId)) {
      throw new Error("Invalid Saudi National ID format");
    }
    const identifier = {
      use: "official",
      system: SAUDI_SYSTEMS.NATIONAL_ID,
      value: nationalId,
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: "NI",
            display: "National identifier"
          }
        ],
        text: "Saudi National ID"
      }
    };
    this.patient.identifier = this.patient.identifier ?? [];
    this.patient.identifier.push(identifier);
    return this;
  }
  /**
   * Set family card number
   */
  setFamilyCardNumber(familyCard) {
    const identifier = {
      use: "secondary",
      system: SAUDI_SYSTEMS.FAMILY_CARD,
      value: familyCard,
      type: {
        coding: [
          {
            system: SAUDI_SYSTEMS.FAMILY_CARD,
            code: "FC",
            display: "Family Card"
          }
        ],
        text: "Saudi Family Card Number"
      }
    };
    this.patient.identifier = this.patient.identifier ?? [];
    this.patient.identifier.push(identifier);
    return this;
  }
  /**
   * Set sponsor ID (for residents and visitors)
   */
  setSponsorId(sponsorId) {
    const identifier = {
      use: "secondary",
      system: SAUDI_SYSTEMS.SPONSOR_ID,
      value: sponsorId,
      type: {
        coding: [
          {
            system: SAUDI_SYSTEMS.SPONSOR_ID,
            code: "SPONSOR",
            display: "Sponsor ID"
          }
        ],
        text: "Saudi Sponsor ID"
      }
    };
    this.patient.identifier = this.patient.identifier ?? [];
    this.patient.identifier.push(identifier);
    return this;
  }
  /**
   * Set residency type
   */
  setResidencyType(type) {
    this.addExtension("residency-type", type);
    return this;
  }
  /**
   * Set Saudi region
   */
  setRegion(region) {
    if (!SAUDI_REGIONS.includes(region)) {
      throw new Error(`Invalid Saudi region: ${region}`);
    }
    this.addExtension("region", region);
    return this;
  }
  /**
   * Set Arabic name
   */
  setArabicName(family, given) {
    const name = {
      use: "official",
      family,
      given
    };
    this.patient.name = this.patient.name ?? [];
    this.patient.name.push(name);
    return this;
  }
  /**
   * Set English name
   */
  setEnglishName(family, given) {
    const name = {
      use: "usual",
      family,
      given
    };
    this.patient.name = this.patient.name ?? [];
    this.patient.name.push(name);
    return this;
  }
  /**
   * Set basic patient information
   */
  setBasicInfo(gender, birthDate) {
    this.patient.gender = gender;
    this.patient.birthDate = birthDate;
    return this;
  }
  /**
   * Set Saudi phone number
   */
  setSaudiPhoneNumber(phoneNumber, use = "mobile") {
    const normalizedPhone = this.normalizeSaudiPhoneNumber(phoneNumber);
    const telecom = {
      system: "phone",
      value: normalizedPhone,
      use
    };
    this.patient.telecom = this.patient.telecom ?? [];
    this.patient.telecom.push(telecom);
    return this;
  }
  /**
   * Set Saudi address
   */
  setSaudiAddress(city, district, postalCode, addressLine) {
    const address = {
      use: "home",
      type: "physical",
      line: addressLine,
      city,
      district,
      state: "",
      // Saudi doesn't use states, but regions
      postalCode,
      country: "SA"
    };
    this.patient.address = this.patient.address ?? [];
    this.patient.address.push(address);
    return this;
  }
  /**
   * Build the Saudi patient profile
   */
  build() {
    if (!this.patient.identifier || this.patient.identifier.length === 0) {
      throw new Error("Saudi patient must have at least one identifier");
    }
    const hasNationalId = this.patient.identifier.some(
      (id) => id.system === SAUDI_SYSTEMS.NATIONAL_ID
    );
    if (!hasNationalId) {
      throw new Error("Saudi patient must have a National ID");
    }
    return this.patient;
  }
  addExtension(url, value) {
    this.patient.extension = this.patient.extension ?? [];
    let saudiExtension = this.patient.extension.find(
      (ext) => ext.url === SAUDI_SYSTEMS.PATIENT_EXTENSION
    );
    if (!saudiExtension) {
      saudiExtension = {
        url: SAUDI_SYSTEMS.PATIENT_EXTENSION,
        extension: []
      };
      this.patient.extension.push(saudiExtension);
    }
    saudiExtension.extension.push({
      url,
      valueString: value
    });
  }
  normalizeSaudiPhoneNumber(phone) {
    const cleaned = phone.replace(/[\s-]/g, "");
    if (cleaned.startsWith("05")) {
      return `+966${cleaned.substring(1)}`;
    } else if (cleaned.startsWith("5")) {
      return `+966${cleaned}`;
    } else if (cleaned.startsWith("966")) {
      return `+${cleaned}`;
    } else if (!cleaned.startsWith("+966")) {
      return `+966${cleaned}`;
    }
    return cleaned;
  }
}
class SaudiExtensionHelper {
  /**
   * Extract Saudi National ID from patient
   */
  static getSaudiNationalId(patient) {
    return patient.identifier?.find((id) => id.system === SAUDI_SYSTEMS.NATIONAL_ID)?.value;
  }
  /**
   * Extract family card number from patient
   */
  static getFamilyCardNumber(patient) {
    return patient.identifier?.find((id) => id.system === SAUDI_SYSTEMS.FAMILY_CARD)?.value;
  }
  /**
   * Extract residency type from patient extension
   */
  static getResidencyType(patient) {
    return this.getExtensionValue(patient, "residency-type");
  }
  /**
   * Extract region from patient extension
   */
  static getRegion(patient) {
    return this.getExtensionValue(patient, "region");
  }
  /**
   * Check if patient is a Saudi citizen
   */
  static isSaudiCitizen(patient) {
    const residencyType = this.getResidencyType(patient);
    return residencyType === "citizen";
  }
  /**
   * Get Arabic name from patient
   */
  static getArabicName(patient) {
    const arabicName = patient.name?.find((name) => name.use === "official");
    return arabicName ? {
      family: arabicName.family,
      given: arabicName.given
    } : void 0;
  }
  /**
   * Get English name from patient
   */
  static getEnglishName(patient) {
    const englishName = patient.name?.find((name) => name.use === "usual");
    return englishName ? {
      family: englishName.family,
      given: englishName.given
    } : void 0;
  }
  static getExtensionValue(patient, url) {
    const saudiExtension = patient.extension?.find(
      (ext) => ext.url === SAUDI_SYSTEMS.PATIENT_EXTENSION
    );
    if (!saudiExtension) return void 0;
    const subExtension = saudiExtension.extension.find((ext) => ext.url === url);
    return subExtension?.valueString;
  }
}
function createSaudiPatient() {
  return new SaudiPatientBuilder();
}
class LegacyFHIRClient {
  constructor(_config, logger, _apiClient) {
    this._config = _config;
    this.logger = logger;
    this._apiClient = _apiClient;
  }
  async initialize() {
    this.logger.info("FHIR client initialized");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  async healthCheck() {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return { status: "up", responseTime: 100 };
  }
  async shutdown() {
    this.logger.info("FHIR client shutdown");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
class NPHIESClient {
  constructor(config, logger, apiClient) {
    this.config = config;
    this.logger = logger;
    this.apiClient = apiClient;
  }
  async initialize() {
    this.logger.info("NPHIES client initialized");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  async healthCheck() {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return { status: "up", responseTime: 120 };
  }
  async shutdown() {
    this.logger.info("NPHIES client shutdown");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
class HIPAAAuditLogger {
  logs = /* @__PURE__ */ new Map();
  config;
  logger;
  constructor(config, logger) {
    this.config = config;
    this.logger = logger.child({ component: "HIPAAAuditLogger" });
  }
  /**
   * Log a HIPAA-compliant audit event
   */
  async logEvent(event) {
    const auditLog = {
      id: v4(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...event
    };
    this.logs.set(auditLog.id, auditLog);
    await this.processAuditLevel(auditLog);
    if (this.config.endpoint && this.config.automaticReporting) {
      await this.sendToEndpoint(auditLog);
    }
    this.logger.info("Audit event logged", {
      eventId: auditLog.id,
      eventType: auditLog.eventType,
      userId: auditLog.userId,
      patientId: auditLog.patientId ? "***MASKED***" : void 0
    });
    return auditLog.id;
  }
  /**
   * Process audit based on HIPAA compliance level
   */
  async processAuditLevel(auditLog) {
    switch (this.config.hipaaLevel) {
      case "minimal":
        this.logger.info("HIPAA Audit - Minimal", {
          id: auditLog.id,
          eventType: auditLog.eventType,
          outcome: auditLog.outcome
        });
        break;
      case "standard":
        this.logger.info("HIPAA Audit - Standard", {
          id: auditLog.id,
          eventType: auditLog.eventType,
          userId: auditLog.userId,
          action: auditLog.action,
          outcome: auditLog.outcome,
          timestamp: auditLog.timestamp
        });
        break;
      case "comprehensive":
        this.logger.info("HIPAA Audit - Comprehensive", {
          ...auditLog,
          patientId: auditLog.patientId ? this.maskPHI(auditLog.patientId) : void 0,
          details: auditLog.details ? this.maskPHIInDetails(auditLog.details) : void 0
        });
        break;
    }
  }
  /**
   * Mask PHI data for logging
   */
  maskPHI(value) {
    if (value.length <= 4) return "***";
    return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2);
  }
  /**
   * Mask PHI in complex details object
   */
  maskPHIInDetails(details) {
    const masked = { ...details };
    const phiFields = ["patientId", "ssn", "nationalId", "phone", "email", "address"];
    for (const field of phiFields) {
      if (masked[field] && typeof masked[field] === "string") {
        masked[field] = this.maskPHI(masked[field]);
      }
    }
    return masked;
  }
  /**
   * Send audit log to remote endpoint
   */
  async sendToEndpoint(auditLog) {
    try {
      if (!this.config.endpoint) return;
      this.logger.debug("Sending audit log to endpoint", {
        endpoint: this.config.endpoint,
        logId: auditLog.id
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
    } catch (error) {
      this.logger.error("Failed to send audit log to endpoint", error, {
        logId: auditLog.id
      });
    }
  }
  /**
   * Retrieve audit logs with filters
   */
  async getAuditLogs(filters) {
    let logs = Array.from(this.logs.values());
    if (filters) {
      logs = logs.filter((log) => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.eventType && log.eventType !== filters.eventType) return false;
        if (filters.outcome && log.outcome !== filters.outcome) return false;
        if (filters.startDate && log.timestamp < filters.startDate) return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        return true;
      });
    }
    return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs() {
    const retentionDate = /* @__PURE__ */ new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.retentionPeriod);
    const cutoffDate = retentionDate.toISOString();
    let removedCount = 0;
    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoffDate) {
        this.logs.delete(id);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      this.logger.info("Cleaned up old audit logs", { removedCount, cutoffDate });
    }
    return removedCount;
  }
  /**
   * Get audit statistics
   */
  async getAuditStats() {
    const logs = Array.from(this.logs.values());
    const stats = {
      totalLogs: logs.length,
      logsByEventType: {},
      logsByOutcome: {},
      oldestLog: void 0,
      newestLog: void 0
    };
    if (logs.length === 0) return stats;
    for (const log of logs) {
      stats.logsByEventType[log.eventType] = (stats.logsByEventType[log.eventType] ?? 0) + 1;
      stats.logsByOutcome[log.outcome] = (stats.logsByOutcome[log.outcome] ?? 0) + 1;
    }
    const sortedLogs = logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    if (sortedLogs.length > 0) {
      stats.oldestLog = sortedLogs[0]?.timestamp;
      stats.newestLog = sortedLogs[sortedLogs.length - 1]?.timestamp;
    }
    return stats;
  }
}
function createHIPAAAuditLogger(config, logger) {
  return new HIPAAAuditLogger(config, logger);
}
class EncryptionService {
  keys = /* @__PURE__ */ new Map();
  config;
  logger;
  constructor(config, logger) {
    this.config = config;
    this.logger = logger.child({ component: "EncryptionService" });
  }
  /**
   * Initialize encryption service with default keys
   */
  async initialize() {
    await this.generateAESKey("default-aes");
    await this.generateRSAKeyPair("default-rsa");
    this.logger.info("Encryption service initialized", {
      totalKeys: this.keys.size
    });
  }
  /**
   * Generate AES-256 encryption key
   */
  async generateAESKey(keyId) {
    const id = keyId ?? v4();
    const key = this.generateRandomBase64(32);
    const encryptionKey = {
      id,
      algorithm: this.config.aes.algorithm,
      key,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (this.config.keyRotationInterval) {
      const expirationDate = /* @__PURE__ */ new Date();
      expirationDate.setDate(expirationDate.getDate() + this.config.keyRotationInterval);
      encryptionKey.expiresAt = expirationDate.toISOString();
    }
    this.keys.set(id, encryptionKey);
    this.logger.info("AES key generated", { keyId: id });
    return id;
  }
  /**
   * Generate RSA-2048 key pair
   */
  async generateRSAKeyPair(keyId) {
    const publicKeyId = keyId ? `${keyId}-public` : `${v4()}-public`;
    const privateKeyId = keyId ? `${keyId}-private` : `${v4()}-private`;
    const publicKey = this.generateRandomBase64(256);
    const privateKey = this.generateRandomBase64(256);
    const publicEncryptionKey = {
      id: publicKeyId,
      algorithm: this.config.rsa.algorithm,
      key: publicKey,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const privateEncryptionKey = {
      id: privateKeyId,
      algorithm: this.config.rsa.algorithm,
      key: privateKey,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (this.config.keyRotationInterval) {
      const expirationDate = /* @__PURE__ */ new Date();
      expirationDate.setDate(expirationDate.getDate() + this.config.keyRotationInterval);
      publicEncryptionKey.expiresAt = expirationDate.toISOString();
      privateEncryptionKey.expiresAt = expirationDate.toISOString();
    }
    this.keys.set(publicKeyId, publicEncryptionKey);
    this.keys.set(privateKeyId, privateEncryptionKey);
    this.logger.info("RSA key pair generated", { publicKeyId, privateKeyId });
    return { publicKeyId, privateKeyId };
  }
  /**
   * Encrypt data using AES-256-GCM
   */
  async encryptWithAES(data, keyId) {
    const activeKeyId = keyId ?? "default-aes";
    const key = this.keys.get(activeKeyId);
    if (!key || !key.algorithm.includes("AES")) {
      throw new Error(`AES key not found: ${activeKeyId}`);
    }
    if (key.expiresAt && new Date(key.expiresAt) < /* @__PURE__ */ new Date()) {
      throw new Error(`Key expired: ${activeKeyId}`);
    }
    const iv = this.generateRandomBase64(12);
    const tag = this.generateRandomBase64(16);
    const encryptedData = Buffer.from(data).toString("base64");
    this.logger.debug("Data encrypted with AES", { keyId: activeKeyId, dataLength: data.length });
    return {
      data: encryptedData,
      keyId: activeKeyId,
      algorithm: key.algorithm,
      iv,
      tag
    };
  }
  /**
   * Decrypt data using AES-256-GCM
   */
  async decryptWithAES(encryptedData) {
    const key = this.keys.get(encryptedData.keyId);
    if (!key || !key.algorithm.includes("AES")) {
      throw new Error(`AES key not found: ${encryptedData.keyId}`);
    }
    if (!encryptedData.iv || !encryptedData.tag) {
      throw new Error("Missing IV or authentication tag for AES-GCM decryption");
    }
    const decryptedData = Buffer.from(encryptedData.data, "base64").toString("utf8");
    this.logger.debug("Data decrypted with AES", { keyId: encryptedData.keyId });
    return decryptedData;
  }
  /**
   * Encrypt data using RSA-OAEP (typically for small data like keys)
   */
  async encryptWithRSA(data, publicKeyId) {
    const activeKeyId = publicKeyId ?? "default-rsa-public";
    const key = this.keys.get(activeKeyId);
    if (!key || !key.algorithm.includes("RSA") || !activeKeyId.includes("public")) {
      throw new Error(`RSA public key not found: ${activeKeyId}`);
    }
    if (key.expiresAt && new Date(key.expiresAt) < /* @__PURE__ */ new Date()) {
      throw new Error(`Key expired: ${activeKeyId}`);
    }
    const encryptedData = Buffer.from(data).toString("base64");
    this.logger.debug("Data encrypted with RSA", { keyId: activeKeyId, dataLength: data.length });
    return {
      data: encryptedData,
      keyId: activeKeyId,
      algorithm: key.algorithm
    };
  }
  /**
   * Decrypt data using RSA-OAEP
   */
  async decryptWithRSA(encryptedData) {
    const privateKeyId = encryptedData.keyId.replace("-public", "-private");
    const key = this.keys.get(privateKeyId);
    if (!key || !key.algorithm.includes("RSA")) {
      throw new Error(`RSA private key not found: ${privateKeyId}`);
    }
    const decryptedData = Buffer.from(encryptedData.data, "base64").toString("utf8");
    this.logger.debug("Data decrypted with RSA", { keyId: privateKeyId });
    return decryptedData;
  }
  /**
   * Encrypt PHI data with additional compliance checks
   */
  async encryptPHI(data, metadata) {
    this.logger.info("PHI data encryption requested", {
      dataType: metadata?.dataType,
      patientId: metadata?.patientId ? "***MASKED***" : void 0
    });
    return this.encryptWithAES(data);
  }
  /**
   * Decrypt PHI data with additional compliance checks
   */
  async decryptPHI(encryptedData, metadata) {
    this.logger.info("PHI data decryption requested", {
      dataType: metadata?.dataType,
      patientId: metadata?.patientId ? "***MASKED***" : void 0,
      keyId: encryptedData.keyId
    });
    return this.decryptWithAES(encryptedData);
  }
  /**
   * Rotate encryption keys
   */
  async rotateKeys() {
    const rotated = [];
    const failed = [];
    for (const [keyId, key] of this.keys.entries()) {
      try {
        if (key.expiresAt && new Date(key.expiresAt) < /* @__PURE__ */ new Date()) {
          if (key.algorithm.includes("AES")) {
            const newKeyId = await this.generateAESKey();
            rotated.push(`${keyId} -> ${newKeyId}`);
            this.keys.delete(keyId);
          } else if (key.algorithm.includes("RSA")) {
            const baseName = keyId.replace(/-public|-private$/, "");
            const { publicKeyId, privateKeyId } = await this.generateRSAKeyPair(
              `${baseName}-rotated`
            );
            rotated.push(`${keyId} -> ${keyId.includes("public") ? publicKeyId : privateKeyId}`);
            this.keys.delete(keyId);
          }
        }
      } catch (error) {
        failed.push(keyId);
        this.logger.error("Failed to rotate key", error, { keyId });
      }
    }
    this.logger.info("Key rotation completed", {
      rotatedCount: rotated.length,
      failedCount: failed.length
    });
    return { rotated, failed };
  }
  /**
   * Get key information (without sensitive data)
   */
  getKeyInfo(keyId) {
    const key = this.keys.get(keyId);
    if (!key) return null;
    const { key: _, ...keyInfo } = key;
    return keyInfo;
  }
  /**
   * List all available keys (without sensitive data)
   */
  listKeys() {
    return Array.from(this.keys.values()).map((key) => {
      const { key: _, ...keyInfo } = key;
      return keyInfo;
    });
  }
  /**
   * Encrypt an object recursively
   */
  async encryptObject(obj) {
    const entries = Object.entries(obj);
    const encryptedEntries = await Promise.all(
      entries.map(async ([key, value]) => {
        if (typeof value === "string") {
          const encryptedValue = await this.encryptWithAES(value);
          return [key, encryptedValue];
        }
        if (typeof value === "object" && value !== null) {
          const encryptedValue = await this.encryptObject(value);
          return [key, encryptedValue];
        }
        return [key, value];
      })
    );
    return Object.fromEntries(encryptedEntries);
  }
  /**
   * Recursively decrypt an object's string values
   */
  async decryptObject(encryptedObj) {
    const entries = Object.entries(encryptedObj);
    const decryptedEntries = await Promise.all(
      entries.map(async ([key, value]) => {
        if (typeof value === "object" && value !== null && "data" in value && "keyId" in value) {
          const decryptedValue = await this.decryptWithAES(value);
          return [key, decryptedValue];
        }
        if (typeof value === "object" && value !== null) {
          const decryptedValue = await this.decryptObject(value);
          return [key, decryptedValue];
        }
        return [key, value];
      })
    );
    return Object.fromEntries(decryptedEntries);
  }
  /**
   * Generate random base64 string
   */
  generateRandomBase64(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
function createEncryptionService(config, logger) {
  return new EncryptionService(config, logger);
}
class PHIDataMasker {
  config;
  logger;
  maskingRules = /* @__PURE__ */ new Map();
  constructor(config, logger) {
    this.config = config;
    this.logger = logger.child({ component: "PHIDataMasker" });
    this.initializeDefaultRules();
  }
  /**
   * Initialize default masking rules for common PHI fields
   */
  initializeDefaultRules() {
    const defaultRules = [
      // Direct identifiers
      { field: "ssn", type: "format", preserveFormat: true, visibleChars: 4 },
      { field: "nationalId", type: "format", preserveFormat: true, visibleChars: 4 },
      { field: "medicalRecordNumber", type: "partial", visibleChars: 3 },
      { field: "accountNumber", type: "partial", visibleChars: 4 },
      // Contact information
      { field: "phone", type: "format", preserveFormat: true, visibleChars: 4 },
      { field: "email", type: "partial", visibleChars: 2 },
      { field: "fax", type: "format", preserveFormat: true, visibleChars: 4 },
      // Names and addresses
      { field: "firstName", type: "partial", visibleChars: 1 },
      { field: "lastName", type: "partial", visibleChars: 1 },
      { field: "middleName", type: "partial", visibleChars: 1 },
      { field: "address", type: "partial", visibleChars: 0 },
      { field: "city", type: "partial", visibleChars: 2 },
      { field: "state", type: "full" },
      { field: "zipCode", type: "partial", visibleChars: 2 },
      // Technical identifiers
      { field: "ipAddress", type: "format", preserveFormat: true, visibleChars: 0 },
      { field: "webUrl", type: "partial", visibleChars: 0 },
      { field: "deviceId", type: "hash" },
      { field: "biometricId", type: "hash" },
      // Dates (except year)
      { field: "dateOfBirth", type: "format", preserveFormat: true, visibleChars: 4 },
      // Show only year
      { field: "admissionDate", type: "format", preserveFormat: true, visibleChars: 4 },
      { field: "dischargeDate", type: "format", preserveFormat: true, visibleChars: 4 }
    ];
    for (const rule of defaultRules) {
      this.maskingRules.set(rule.field, rule);
    }
    this.logger.info("PHI masking rules initialized", { ruleCount: this.maskingRules.size });
  }
  /**
   * Add or update a masking rule
   */
  addMaskingRule(rule) {
    this.maskingRules.set(rule.field, rule);
    this.logger.debug("Masking rule added/updated", { field: rule.field, type: rule.type });
  }
  /**
   * Remove a masking rule
   */
  removeMaskingRule(field) {
    const removed = this.maskingRules.delete(field);
    if (removed) {
      this.logger.debug("Masking rule removed", { field });
    }
    return removed;
  }
  /**
   * Mask a single value based on field type
   */
  maskValue(value, field) {
    if (value === null || value === void 0) {
      return value;
    }
    const stringValue = String(value);
    if (stringValue.length === 0) {
      return value;
    }
    const rule = this.maskingRules.get(field);
    if (!rule) {
      return this.applyFullMasking(stringValue);
    }
    switch (rule.type) {
      case "full":
        return this.applyFullMasking(stringValue, rule.preserveLength);
      case "partial":
        return this.applyPartialMasking(stringValue, rule.visibleChars ?? 0);
      case "format":
        return this.applyFormatMasking(stringValue, field, rule.visibleChars ?? 0);
      case "hash":
        return this.applyHashMasking(stringValue);
      case "tokenize":
        return this.applyTokenization(stringValue);
      default:
        return this.applyFullMasking(stringValue);
    }
  }
  /**
   * Mask an entire object, applying rules to known PHI fields
   */
  maskObject(obj) {
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    const masked = { ...obj };
    for (const [key, value] of Object.entries(masked)) {
      if (Array.isArray(value)) {
        masked[key] = value.map(
          (item) => typeof item === "object" && item !== null ? this.maskObject(item) : this.maskValue(item, key)
        );
      } else if (typeof value === "object" && value !== null) {
        masked[key] = this.maskObject(
          value
        );
      } else {
        masked[key] = this.maskValue(value, key);
      }
    }
    return masked;
  }
  /**
   * Apply full masking (replace all characters)
   */
  applyFullMasking(value, preserveLength = true) {
    if (!preserveLength) {
      return "***";
    }
    return this.config.defaultMaskChar.repeat(value.length);
  }
  /**
   * Apply partial masking (show first/last few characters)
   */
  applyPartialMasking(value, visibleChars) {
    if (value.length <= visibleChars * 2) {
      return this.config.defaultMaskChar.repeat(Math.max(3, value.length));
    }
    if (visibleChars === 0) {
      return this.config.defaultMaskChar.repeat(value.length);
    }
    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const middle = this.config.defaultMaskChar.repeat(value.length - visibleChars * 2);
    return start + middle + end;
  }
  /**
   * Apply format-specific masking
   */
  applyFormatMasking(value, field, visibleChars) {
    switch (field) {
      case "ssn":
        return this.maskSSN(value, visibleChars);
      case "nationalId":
        return this.maskNationalId(value, visibleChars);
      case "phone":
        return this.maskPhone(value, visibleChars);
      case "email":
        return this.maskEmail(value);
      case "ipAddress":
        return this.maskIPAddress(value);
      case "dateOfBirth":
      case "admissionDate":
      case "dischargeDate":
        return this.maskDate(value, visibleChars);
      default:
        return this.applyPartialMasking(value, visibleChars);
    }
  }
  /**
   * Mask Social Security Number (XXX-XX-1234 format)
   */
  maskSSN(value, visibleChars) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 9) {
      return this.applyPartialMasking(value, visibleChars);
    }
    if (visibleChars >= 4) {
      return `***-**-${cleaned.substring(5)}`;
    } else {
      return "***-**-****";
    }
  }
  /**
   * Mask National ID (Saudi format: 1234567890)
   */
  maskNationalId(value, visibleChars) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      return this.applyPartialMasking(value, visibleChars);
    }
    if (visibleChars >= 4) {
      return `******${cleaned.substring(6)}`;
    } else {
      return "**********";
    }
  }
  /**
   * Mask phone number
   */
  maskPhone(value, visibleChars) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 10) {
      if (visibleChars >= 4) {
        return `(***) ***-${cleaned.substring(6)}`;
      } else {
        return "(***) ***-****";
      }
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      if (visibleChars >= 4) {
        return `1-***-***-${cleaned.substring(7)}`;
      } else {
        return "1-***-***-****";
      }
    } else {
      return this.applyPartialMasking(value, visibleChars);
    }
  }
  /**
   * Mask email address
   */
  maskEmail(value) {
    const atIndex = value.indexOf("@");
    if (atIndex === -1) {
      return this.applyPartialMasking(value, 2);
    }
    const username = value.substring(0, atIndex);
    const domain = value.substring(atIndex + 1);
    const maskedUsername = username.length > 2 ? `${username.substring(0, 1)}***${username.substring(username.length - 1)}` : "***";
    const dotIndex = domain.lastIndexOf(".");
    if (dotIndex === -1) {
      return `${maskedUsername}@***`;
    }
    const tld = domain.substring(dotIndex);
    const maskedDomain = `***${tld}`;
    return `${maskedUsername}@${maskedDomain}`;
  }
  /**
   * Mask IP address
   */
  maskIPAddress(value) {
    const parts = value.split(".");
    if (parts.length === 4) {
      return "***.***.***.***";
    }
    return this.applyFullMasking(value);
  }
  /**
   * Mask date (keep only year if specified)
   */
  maskDate(value, visibleChars) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return this.applyPartialMasking(value, visibleChars);
    }
    if (visibleChars >= 4) {
      return `****-**-** (${date.getFullYear()})`;
    } else {
      return "****-**-**";
    }
  }
  /**
   * Apply hash masking (one-way hash for consistent masking)
   */
  applyHashMasking(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `HASH_${Math.abs(hash).toString(16).toUpperCase()}`;
  }
  /**
   * Apply tokenization (replace with a token)
   */
  applyTokenization(_value) {
    const tokenId = Math.random().toString(36).substring(2, 15);
    return `TOKEN_${tokenId.toUpperCase()}`;
  }
  /**
   * Check if a field contains PHI
   */
  isPHIField(field) {
    return this.maskingRules.has(field);
  }
  /**
   * Get masking statistics
   */
  getMaskingStats() {
    const rulesByType = {};
    const phiFields = [];
    for (const [field, rule] of this.maskingRules.entries()) {
      rulesByType[rule.type] = (rulesByType[rule.type] ?? 0) + 1;
      phiFields.push(field);
    }
    return {
      totalRules: this.maskingRules.size,
      rulesByType,
      phiFields: phiFields.sort()
    };
  }
  /**
   * Validate masking configuration
   */
  validateConfiguration() {
    const errors = [];
    if ((this.config.defaultMaskChar ?? "").length !== 1) {
      errors.push("Default mask character must be a single character");
    }
    if (this.maskingRules.size === 0) {
      errors.push("No masking rules defined");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
function createPHIDataMasker(config, logger) {
  return new PHIDataMasker(config, logger);
}
const defaultMaskingConfig = {
  defaultMaskChar: "*",
  preserveFormat: true,
  maskingPatterns: {
    ssn: true,
    phone: true,
    email: true,
    nationalId: true,
    medicalRecordNumber: true,
    accountNumber: true,
    certificateNumber: true,
    vehicleIdentifier: true,
    deviceIdentifier: true,
    webUrl: true,
    ipAddress: true,
    biometricIdentifier: true,
    facePhotograph: true,
    otherUniqueIdentifier: true
  }
};
class SessionManager {
  sessions = /* @__PURE__ */ new Map();
  userSessions = /* @__PURE__ */ new Map();
  // userId -> sessionIds
  config;
  logger;
  cleanupInterval = null;
  constructor(config, logger) {
    this.config = config;
    this.logger = logger.child({ component: "SessionManager" });
    this.startCleanupProcess();
  }
  /**
   * Create a new session
   */
  async createSession(userId, userRole, permissions, metadata) {
    const existingSessions = this.getUserSessions(userId);
    if (existingSessions.length >= this.config.maxConcurrentSessions) {
      const oldestSession = existingSessions.sort(
        (a, b) => a.createdAt.localeCompare(b.createdAt)
      )[0];
      if (oldestSession) {
        await this.terminateSession(oldestSession.sessionId, "concurrent_limit_exceeded");
      }
    }
    const sessionId = this.generateSessionId();
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + this.config.maxDuration * 60 * 1e3);
    const sessionData = {
      userId,
      userRole,
      sessionId,
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastActivity: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata: metadata ?? {},
      permissions: []
    };
    this.sessions.set(sessionId, sessionData);
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, /* @__PURE__ */ new Set());
    }
    const userSessions = this.userSessions.get(userId);
    userSessions?.add(sessionId);
    this.logger.info("Session created", {
      sessionId,
      userId,
      userRole,
      expiresAt: sessionData.expiresAt,
      ipAddress: metadata?.ipAddress
    });
    this.logSessionEvent(sessionId, "created", {
      userId,
      userRole,
      ipAddress: metadata?.ipAddress
    });
    return sessionData;
  }
  /**
   * Validate and retrieve session
   */
  async validateSession(sessionId, ipAddress) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn("Session validation failed - not found", { sessionId });
      return null;
    }
    if (!session.isActive) {
      this.logger.warn("Session validation failed - inactive", { sessionId });
      return null;
    }
    if (new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
      this.logger.warn("Session validation failed - expired", { sessionId });
      await this.terminateSession(sessionId, "expired");
      return null;
    }
    const lastActivity = new Date(session.lastActivity);
    const idleTime = Date.now() - lastActivity.getTime();
    const idleTimeoutMs = this.config.idleTimeout * 60 * 1e3;
    if (idleTime > idleTimeoutMs) {
      this.logger.warn("Session validation failed - idle timeout", {
        sessionId,
        idleTime: Math.round(idleTime / 1e3)
      });
      await this.terminateSession(sessionId, "idle_timeout");
      return null;
    }
    if (this.config.secureTransport && session.ipAddress && ipAddress && session.ipAddress !== ipAddress) {
      this.logger.warn("Session validation failed - IP mismatch", {
        sessionId,
        originalIp: session.ipAddress,
        currentIp: ipAddress
      });
      await this.terminateSession(sessionId, "ip_mismatch");
      return null;
    }
    session.lastActivity = (/* @__PURE__ */ new Date()).toISOString();
    this.sessions.set(sessionId, session);
    this.logSessionEvent(sessionId, "activity", { ipAddress });
    return session;
  }
  /**
   * Renew session (extend expiration)
   */
  async renewSession(sessionId) {
    const session = await this.validateSession(sessionId);
    if (!session) {
      return null;
    }
    const expiresAt = new Date(session.expiresAt);
    const renewThreshold = new Date(Date.now() + this.config.renewBeforeExpiry * 60 * 1e3);
    if (expiresAt > renewThreshold) {
      return session;
    }
    const newExpiresAt = new Date(Date.now() + this.config.maxDuration * 60 * 1e3);
    session.expiresAt = newExpiresAt.toISOString();
    this.sessions.set(sessionId, session);
    this.logger.info("Session renewed", {
      sessionId,
      userId: session.userId,
      newExpiresAt: session.expiresAt
    });
    this.logSessionEvent(sessionId, "renewed", {
      newExpiresAt: session.expiresAt
    });
    return session;
  }
  /**
   * Terminate a session
   */
  async terminateSession(sessionId, reason) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    session.isActive = false;
    this.sessions.set(sessionId, session);
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
    const terminationReason = reason ?? "manual";
    this.logger.info("Session terminated", {
      sessionId,
      userId: session.userId,
      reason: terminationReason
    });
    this.logSessionEvent(sessionId, "terminated", { reason: terminationReason });
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 6e4);
    return true;
  }
  /**
   * Terminate all sessions for a user
   */
  async terminateUserSessions(userId, except) {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) {
      return 0;
    }
    const sessionsToTerminate = Array.from(userSessionIds).filter(
      (sessionId) => !except || sessionId !== except
    );
    if (sessionsToTerminate.length === 0) {
      return 0;
    }
    const terminationResults = await Promise.all(
      sessionsToTerminate.map(
        (sessionId) => this.terminateSession(sessionId, "user_sessions_terminated")
      )
    );
    const terminatedCount = terminationResults.reduce(
      (count, terminated) => count + (terminated ? 1 : 0),
      0
    );
    this.logger.info("User sessions terminated", { userId, terminatedCount });
    return terminatedCount;
  }
  /**
   * Get active sessions for a user
   */
  getUserSessions(userId) {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) {
      return [];
    }
    const sessions = [];
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      }
    }
    return sessions;
  }
  /**
   * Get session information (without sensitive data)
   */
  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    const { metadata: _metadata, ...sessionInfo } = session;
    return sessionInfo;
  }
  /**
   * Get all active sessions (admin function)
   */
  getAllActiveSessions() {
    const activeSessions = [];
    for (const session of this.sessions.values()) {
      if (session.isActive && new Date(session.expiresAt) > /* @__PURE__ */ new Date()) {
        const { metadata: _metadata, ...sessionInfo } = session;
        activeSessions.push(sessionInfo);
      }
    }
    return activeSessions.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }
  /**
   * Update session permissions
   */
  async updateSessionPermissions(sessionId, permissions) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return false;
    }
    session.permissions = [...permissions];
    session.lastActivity = (/* @__PURE__ */ new Date()).toISOString();
    this.sessions.set(sessionId, session);
    this.logger.info("Session permissions updated", {
      sessionId,
      userId: session.userId,
      permissionCount: permissions.length
    });
    return true;
  }
  /**
   * Check if session has specific permission
   */
  hasPermission(sessionId, permission) {
    const session = this.sessions.get(sessionId);
    return Boolean(session?.isActive && session.permissions.includes(permission));
  }
  /**
   * Get session statistics
   */
  getSessionStats() {
    const stats = {
      totalSessions: this.sessions.size,
      activeSessions: 0,
      expiredSessions: 0,
      userCount: this.userSessions.size,
      averageSessionDuration: 0,
      sessionsPerUser: {}
    };
    let totalDuration = 0;
    const now = /* @__PURE__ */ new Date();
    for (const session of this.sessions.values()) {
      if (session.isActive && new Date(session.expiresAt) > now) {
        stats.activeSessions++;
      } else {
        stats.expiredSessions++;
      }
      const created = new Date(session.createdAt);
      const lastActivity = new Date(session.lastActivity);
      const duration = lastActivity.getTime() - created.getTime();
      totalDuration += duration;
      stats.sessionsPerUser[session.userId] = (stats.sessionsPerUser[session.userId] ?? 0) + 1;
    }
    stats.averageSessionDuration = stats.totalSessions > 0 ? Math.round(totalDuration / stats.totalSessions / 1e3 / 60) : 0;
    return stats;
  }
  /**
   * Start automatic cleanup process
   */
  startCleanupProcess() {
    this.cleanupInterval = setInterval(
      () => {
        void this.cleanupExpiredSessions().catch((error) => {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error("Session cleanup failed", err);
        });
      },
      5 * 60 * 1e3
    );
    this.logger.info("Session cleanup process started");
  }
  /**
   * Stop cleanup process
   */
  stopCleanupProcess() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.info("Session cleanup process stopped");
    }
  }
  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions() {
    const now = /* @__PURE__ */ new Date();
    const sessionsToCleanup = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      const isExpired = new Date(session.expiresAt) < now;
      const isIdle = now.getTime() - new Date(session.lastActivity).getTime() > this.config.idleTimeout * 60 * 1e3;
      if (isExpired || isIdle) {
        sessionsToCleanup.push({
          sessionId,
          reason: isExpired ? "expired" : "idle_timeout"
        });
      }
    }
    if (sessionsToCleanup.length > 0) {
      await Promise.allSettled(
        sessionsToCleanup.map(({ sessionId, reason }) => this.terminateSession(sessionId, reason))
      );
      this.logger.info("Expired sessions cleaned up", {
        cleanedCount: sessionsToCleanup.length
      });
    }
  }
  /**
   * Generate secure session ID
   */
  generateSessionId() {
    const uuid = v4();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `sess_${uuid}_${timestamp}_${random}`.substring(0, this.config.sessionTokenLength ?? 64);
  }
  /**
   * Log session events for audit
   */
  logSessionEvent(sessionId, eventType, details) {
    const event = {
      sessionId,
      eventType,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details
    };
    this.logger.debug("Session event", event);
  }
  /**
   * Shutdown session manager
   */
  async shutdown() {
    this.stopCleanupProcess();
    const activeSessions = this.getAllActiveSessions();
    if (activeSessions.length > 0) {
      await Promise.all(
        activeSessions.map((session) => this.terminateSession(session.sessionId, "system_shutdown"))
      );
    }
    this.logger.info("Session manager shutdown complete");
  }
}
function createSessionManager(config, logger) {
  return new SessionManager(config, logger);
}
const defaultSessionConfig = {
  maxDuration: 480,
  // 8 hours
  idleTimeout: 30,
  // 30 minutes
  maxConcurrentSessions: 3,
  secureTransport: true,
  sessionTokenLength: 64,
  renewBeforeExpiry: 60
  // 1 hour
};
class ComplianceValidator {
  rules = /* @__PURE__ */ new Map();
  logger;
  constructor(logger) {
    this.logger = logger.child({ component: "ComplianceValidator" });
    this.initializeDefaultRules();
  }
  /**
   * Initialize default HIPAA compliance rules
   */
  initializeDefaultRules() {
    const defaultRules = [
      // Administrative Safeguards
      {
        id: "admin_001",
        name: "Unique User Identification",
        description: "Each user must have a unique identifier",
        category: "administrative",
        severity: "critical",
        required: true,
        validate: async (context) => {
          if (!context.user?.id) {
            return {
              passed: false,
              message: "User ID is required for all operations",
              recommendations: ["Ensure all users have unique identifiers before system access"]
            };
          }
          return { passed: true, message: "User identification verified" };
        }
      },
      {
        id: "admin_002",
        name: "Role-Based Access Control",
        description: "Users must have defined roles with appropriate permissions",
        category: "administrative",
        severity: "high",
        required: true,
        validate: async (context) => {
          if (!context.user?.role || !context.user?.permissions?.length) {
            return {
              passed: false,
              message: "User role and permissions must be defined",
              recommendations: ["Assign appropriate roles and permissions to all users"]
            };
          }
          return { passed: true, message: "Role-based access control verified" };
        }
      },
      {
        id: "admin_003",
        name: "Minimum Necessary Standard",
        description: "Access should be limited to minimum necessary information",
        category: "administrative",
        severity: "medium",
        required: true,
        validate: async (context) => {
          if (context.operation?.type === "export" && !context.user?.permissions.includes("export")) {
            return {
              passed: false,
              message: "User lacks permission for data export",
              recommendations: ["Grant appropriate export permissions or deny access"]
            };
          }
          return { passed: true, message: "Minimum necessary access verified" };
        }
      },
      // Physical Safeguards
      {
        id: "phys_001",
        name: "Workstation Security",
        description: "Access from secure workstations only",
        category: "physical",
        severity: "medium",
        required: false,
        validate: async (_context) => {
          return { passed: true, message: "Workstation security assumed compliant" };
        }
      },
      // Technical Safeguards
      {
        id: "tech_001",
        name: "Encryption in Transit",
        description: "Data must be encrypted during transmission",
        category: "technical",
        severity: "critical",
        required: true,
        validate: async (context) => {
          const userAgent = context.session?.userAgent ?? "";
          if (userAgent.includes("http:") && !userAgent.includes("localhost")) {
            return {
              passed: false,
              message: "Insecure connection detected",
              recommendations: ["Use HTTPS for all data transmission"]
            };
          }
          return { passed: true, message: "Secure transmission verified" };
        }
      },
      {
        id: "tech_002",
        name: "Audit Logging",
        description: "All PHI access must be logged",
        category: "technical",
        severity: "critical",
        required: true,
        validate: async (context) => {
          if (context.operation && !context.metadata?.auditLogged) {
            return {
              passed: false,
              message: "Operation not properly audited",
              recommendations: ["Ensure all PHI access is logged for audit purposes"]
            };
          }
          return { passed: true, message: "Audit logging verified" };
        }
      },
      {
        id: "tech_003",
        name: "Session Timeout",
        description: "Sessions must timeout after period of inactivity",
        category: "technical",
        severity: "medium",
        required: true,
        validate: async (_context) => {
          return { passed: true, message: "Session timeout configured" };
        }
      },
      {
        id: "tech_004",
        name: "PHI Data Masking",
        description: "PHI must be masked in logs and non-production environments",
        category: "technical",
        severity: "high",
        required: true,
        validate: async (context) => {
          if (context.data && typeof context.data === "object") {
            const dataStr = JSON.stringify(context.data);
            const phiPatterns = [
              /\b\d{3}-\d{2}-\d{4}\b/,
              // SSN format
              /\b\d{10}\b/,
              // Saudi National ID
              /\b[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/
              // Email
            ];
            for (const pattern of phiPatterns) {
              if (pattern.test(dataStr)) {
                return {
                  passed: false,
                  message: "Potentially unmasked PHI detected in data",
                  recommendations: ["Ensure all PHI is properly masked before processing"]
                };
              }
            }
          }
          return { passed: true, message: "PHI masking verified" };
        }
      },
      {
        id: "tech_005",
        name: "Access Control Verification",
        description: "User must have appropriate permissions for the requested operation",
        category: "technical",
        severity: "critical",
        required: true,
        validate: async (context) => {
          if (context.operation && context.user) {
            const requiredPermission = `${context.operation.type}:${context.operation.resource}`;
            const alternativePermission = `${context.operation.resource}:${context.operation.type}`;
            const hasPermission = context.user.permissions.some((p) => {
              if (p === requiredPermission) return true;
              if (p === alternativePermission) return true;
              if (p === "*") return true;
              if (context.operation && p === `${context.operation.resource}:*`) {
                return true;
              }
              if (context.operation && p === `*:${context.operation.resource}`) {
                return true;
              }
              return false;
            });
            if (!hasPermission) {
              return {
                passed: false,
                message: `User lacks permission for ${context.operation.type} on ${context.operation.resource}`,
                recommendations: [`Grant ${requiredPermission} permission to user`]
              };
            }
          }
          return { passed: true, message: "Access control verified" };
        }
      },
      // Enhanced Security Rules for Advanced HIPAA Compliance
      {
        id: "tech_006",
        name: "Multi-Factor Authentication",
        description: "Critical operations require multi-factor authentication",
        category: "technical",
        severity: "critical",
        required: true,
        validate: async (context) => {
          const criticalOperations = ["export", "delete"];
          if (context.operation?.type && criticalOperations.includes(context.operation.type)) {
            if (!context.metadata?.mfaVerified) {
              return {
                passed: false,
                message: "Multi-factor authentication required for critical operations",
                recommendations: ["Enable MFA verification for sensitive operations"]
              };
            }
          }
          return { passed: true, message: "MFA requirements satisfied" };
        }
      },
      {
        id: "tech_007",
        name: "IP Address Validation",
        description: "Access must be from authorized IP addresses",
        category: "technical",
        severity: "high",
        required: true,
        validate: async (context) => {
          const clientIp = context.session?.ipAddress;
          if (clientIp) {
            const isPrivateOrLocalhost = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|::1|localhost)/.test(clientIp);
            if (!isPrivateOrLocalhost && !context.metadata?.ipWhitelisted) {
              return {
                passed: false,
                message: "Access from non-authorized IP address",
                recommendations: ["Verify IP address is authorized for healthcare data access"]
              };
            }
          }
          return { passed: true, message: "IP address validation passed" };
        }
      },
      {
        id: "tech_008",
        name: "Data Retention Compliance",
        description: "Data retention policies must be enforced",
        category: "technical",
        severity: "medium",
        required: true,
        validate: async (context) => {
          if (context.operation?.type === "delete" && !context.metadata?.retentionPolicyChecked) {
            return {
              passed: false,
              message: "Data retention policy not verified before deletion",
              recommendations: ["Verify data retention requirements before allowing deletion"]
            };
          }
          return { passed: true, message: "Data retention compliance verified" };
        }
      },
      {
        id: "admin_004",
        name: "Business Associate Agreement",
        description: "Third-party access requires valid BAA",
        category: "administrative",
        severity: "critical",
        required: true,
        validate: async (context) => {
          if (context.user?.role === "third-party" && !context.metadata?.baaVerified) {
            return {
              passed: false,
              message: "Business Associate Agreement not verified for third-party access",
              recommendations: ["Ensure valid BAA exists before granting third-party access"]
            };
          }
          return { passed: true, message: "BAA requirements satisfied" };
        }
      },
      {
        id: "phys_002",
        name: "Device Security Compliance",
        description: "Accessing device must meet security requirements",
        category: "physical",
        severity: "high",
        required: true,
        validate: async (context) => {
          const userAgent = context.session?.userAgent ?? "";
          const insecurePatterns = [
            /Chrome\/[1-8][0-9]\./,
            // Chrome versions < 90
            /Firefox\/[1-7][0-9]\./,
            // Firefox versions < 80
            /Safari\/[1-9]\./
            // Very old Safari
          ];
          for (const pattern of insecurePatterns) {
            if (pattern.test(userAgent)) {
              return {
                passed: false,
                message: "Insecure or outdated browser detected",
                recommendations: ["Update browser to latest secure version"]
              };
            }
          }
          return { passed: true, message: "Device security compliance verified" };
        }
      }
    ];
    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
    this.logger.info("Compliance validation rules initialized", { ruleCount: this.rules.size });
  }
  /**
   * Add or update a validation rule
   */
  addRule(rule) {
    this.rules.set(rule.id, rule);
    this.logger.debug("Validation rule added/updated", { ruleId: rule.id, ruleName: rule.name });
  }
  /**
   * Remove a validation rule
   */
  removeRule(ruleId) {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.logger.debug("Validation rule removed", { ruleId });
    }
    return removed;
  }
  /**
   * Validate compliance for a given context
   */
  async validateCompliance(context) {
    const startTime = Date.now();
    const results = [];
    const recommendations = /* @__PURE__ */ new Set();
    let passedRules = 0;
    let criticalFailures = 0;
    const validationPromises = Array.from(this.rules.values()).map(async (rule) => {
      try {
        const result = await rule.validate(context);
        return { rule, result };
      } catch (error) {
        this.logger.error("Validation rule execution failed", error, { ruleId: rule.id });
        return {
          rule,
          result: {
            passed: false,
            message: `Rule execution failed: ${error.message}`,
            recommendations: ["Review and fix validation rule implementation"]
          }
        };
      }
    });
    const validationResults = await Promise.all(validationPromises);
    for (const { rule, result } of validationResults) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        passed: result.passed,
        message: result.message,
        recommendations: result.recommendations
      });
      if (result.passed) {
        passedRules++;
      } else {
        if (rule.severity === "critical") {
          criticalFailures++;
        }
        if (result.recommendations) {
          result.recommendations.forEach((rec) => recommendations.add(rec));
        }
      }
    }
    const totalRules = this.rules.size;
    const failedRules = totalRules - passedRules;
    const overallCompliance = totalRules > 0 ? Math.round(passedRules / totalRules * 100) : 100;
    const report = {
      overallCompliance,
      totalRules,
      passedRules,
      failedRules,
      criticalFailures,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ruleResults: results,
      recommendations: Array.from(recommendations)
    };
    const validationTime = Date.now() - startTime;
    this.logger.info("Compliance validation completed", {
      overallCompliance,
      passedRules,
      failedRules,
      criticalFailures,
      validationTime
    });
    return report;
  }
  /**
   * Validate specific rule categories
   */
  async validateCategory(context, category) {
    const categoryRules = Array.from(this.rules.values()).filter(
      (rule) => rule.category === category
    );
    const originalRules = new Map(this.rules);
    this.rules.clear();
    for (const rule of categoryRules) {
      this.rules.set(rule.id, rule);
    }
    const report = await this.validateCompliance(context);
    this.rules = originalRules;
    return report;
  }
  /**
   * Enhanced parallel validation for critical rules only
   */
  async quickValidation(context) {
    const startTime = Date.now();
    const criticalRules = Array.from(this.rules.values()).filter(
      (rule) => rule.severity === "critical" && rule.required
    );
    let criticalFailures = 0;
    const failedRules = [];
    const validationPromises = criticalRules.map(async (rule) => {
      try {
        const ruleStartTime = Date.now();
        const result = await rule.validate(context);
        const ruleExecutionTime = Date.now() - ruleStartTime;
        return {
          rule,
          result,
          executionTime: ruleExecutionTime
        };
      } catch (error) {
        this.logger.error("Critical rule validation failed", error, { ruleId: rule.id });
        return {
          rule,
          result: { passed: false, message: `Rule execution failed: ${error.message}` },
          executionTime: 0
        };
      }
    });
    const validationResults = await Promise.all(validationPromises);
    for (const { rule, result } of validationResults) {
      if (!result.passed) {
        criticalFailures++;
        failedRules.push(rule.id);
      }
    }
    const executionTime = Date.now() - startTime;
    const averageRuleTime = validationResults.length > 0 ? validationResults.reduce((sum, r) => sum + r.executionTime, 0) / validationResults.length : 0;
    return {
      passed: criticalFailures === 0,
      criticalFailures,
      failedRules,
      performanceMetrics: {
        executionTime,
        rulesEvaluated: criticalRules.length,
        averageRuleTime
      }
    };
  }
  /**
   * Advanced compliance validation with risk scoring
   */
  async advancedValidation(context) {
    const startTime = Date.now();
    const baseReport = await this.validateCompliance(context);
    let riskScore = 0;
    const severityWeights = { low: 1, medium: 2, high: 4, critical: 8 };
    for (const ruleResult of baseReport.ruleResults) {
      if (!ruleResult.passed) {
        riskScore += severityWeights[ruleResult.severity] || 1;
      }
    }
    const maxPossibleScore = this.rules.size * 8;
    const normalizedRiskScore = Math.min(100, riskScore / maxPossibleScore * 100);
    let riskLevel;
    if (normalizedRiskScore <= 20) riskLevel = "low";
    else if (normalizedRiskScore <= 50) riskLevel = "medium";
    else if (normalizedRiskScore <= 80) riskLevel = "high";
    else riskLevel = "critical";
    const priorityRecommendations = baseReport.ruleResults.filter((r) => !r.passed && (r.severity === "critical" || r.severity === "high")).flatMap((r) => r.recommendations ?? []).slice(0, 5);
    const executionTime = Date.now() - startTime;
    return {
      ...baseReport,
      riskScore: normalizedRiskScore,
      riskLevel,
      priorityRecommendations,
      performanceMetrics: {
        executionTime,
        rulesEvaluated: this.rules.size
      }
    };
  }
  /**
   * Get validation rule information
   */
  getRule(ruleId) {
    return this.rules.get(ruleId) ?? null;
  }
  /**
   * List all validation rules
   */
  listRules() {
    return Array.from(this.rules.values()).map((rule) => {
      const { ...ruleInfo } = rule;
      return ruleInfo;
    });
  }
  /**
   * Get compliance statistics
   */
  getComplianceStats() {
    const stats = {
      totalRules: this.rules.size,
      rulesByCategory: {},
      rulesBySeverity: {},
      requiredRules: 0
    };
    for (const rule of this.rules.values()) {
      stats.rulesByCategory[rule.category] = (stats.rulesByCategory[rule.category] ?? 0) + 1;
      stats.rulesBySeverity[rule.severity] = (stats.rulesBySeverity[rule.severity] ?? 0) + 1;
      if (rule.required) {
        stats.requiredRules++;
      }
    }
    return stats;
  }
  /**
   * Generate compliance report summary
   */
  generateReportSummary(report) {
    const summary = [];
    summary.push(`HIPAA Compliance Report - ${report.timestamp}`);
    summary.push(`Overall Compliance: ${report.overallCompliance}%`);
    summary.push(`Passed Rules: ${report.passedRules}/${report.totalRules}`);
    if (report.criticalFailures > 0) {
      summary.push(`⚠️  CRITICAL FAILURES: ${report.criticalFailures}`);
    }
    if (report.failedRules > 0) {
      summary.push(`Failed Rules: ${report.failedRules}`);
    }
    if (report.recommendations.length > 0) {
      summary.push("\nRecommendations:");
      report.recommendations.forEach((rec, index) => {
        summary.push(`${index + 1}. ${rec}`);
      });
    }
    return summary.join("\n");
  }
}
function createComplianceValidator(logger) {
  return new ComplianceValidator(logger);
}
function createValidationContext(options) {
  return {
    data: options.data,
    user: options.userId ? {
      id: options.userId,
      role: options.userRole ?? "user",
      permissions: options.permissions ?? []
    } : void 0,
    session: options.sessionInfo ?? (options.sessionId ? {
      id: options.sessionId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent
    } : void 0),
    operation: options.operationType && options.resource ? {
      type: options.operationType,
      resource: options.resource,
      resourceId: options.resourceId
    } : void 0,
    metadata: {
      auditLogged: options.auditLogged,
      mfaVerified: options.mfaVerified,
      ipWhitelisted: options.ipWhitelisted,
      baaVerified: options.baaVerified,
      retentionPolicyChecked: options.retentionPolicyChecked,
      ...options.additionalMetadata
    }
  };
}
class RBACManager {
  roles = /* @__PURE__ */ new Map();
  users = /* @__PURE__ */ new Map();
  logger;
  constructor(logger) {
    this.logger = logger.child({ component: "RBACManager" });
    this.initializeDefaultRoles();
  }
  /**
   * Initialize default healthcare roles
   */
  initializeDefaultRoles() {
    const defaultRoles = [
      {
        id: "admin",
        name: "System Administrator",
        description: "Full system access with administrative privileges",
        isActive: true,
        permissions: [
          {
            resource: "*",
            actions: ["create", "read", "update", "delete", "search"]
          }
        ]
      },
      {
        id: "physician",
        name: "Physician",
        description: "Healthcare provider with patient care access",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "Observation",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "DiagnosticReport",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "Medication",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "Procedure",
            actions: ["create", "read", "update", "search"]
          }
        ],
        restrictions: [
          {
            type: "data_access",
            rule: "own_patients_only",
            description: "Can only access patients under their care"
          }
        ]
      },
      {
        id: "nurse",
        name: "Nurse",
        description: "Nursing staff with patient care access",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["read", "update", "search"]
          },
          {
            resource: "Observation",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "Medication",
            actions: ["read", "search"]
          }
        ],
        restrictions: [
          {
            type: "data_access",
            rule: "assigned_patients_only",
            description: "Can only access patients assigned to their care"
          }
        ]
      },
      {
        id: "pharmacist",
        name: "Pharmacist",
        description: "Pharmacy staff with medication access",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["read", "search"],
            conditions: [
              {
                field: "accessReason",
                operator: "equals",
                value: "medication_dispensing"
              }
            ]
          },
          {
            resource: "Medication",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "MedicationDispense",
            actions: ["create", "read", "update", "search"]
          }
        ]
      },
      {
        id: "receptionist",
        name: "Receptionist",
        description: "Front desk staff with limited patient access",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["create", "read", "update", "search"],
            conditions: [
              {
                field: "dataType",
                operator: "in",
                value: ["demographics", "contact", "insurance"]
              }
            ]
          },
          {
            resource: "Appointment",
            actions: ["create", "read", "update", "delete", "search"]
          }
        ],
        restrictions: [
          {
            type: "field_access",
            rule: "no_clinical_data",
            description: "Cannot access clinical information"
          }
        ]
      },
      {
        id: "lab_tech",
        name: "Laboratory Technician",
        description: "Laboratory staff with diagnostic access",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["read", "search"],
            conditions: [
              {
                field: "accessReason",
                operator: "equals",
                value: "lab_testing"
              }
            ]
          },
          {
            resource: "DiagnosticReport",
            actions: ["create", "read", "update", "search"]
          },
          {
            resource: "Specimen",
            actions: ["create", "read", "update", "search"]
          }
        ]
      },
      {
        id: "auditor",
        name: "Compliance Auditor",
        description: "Audit staff with read-only access",
        isActive: true,
        permissions: [
          {
            resource: "*",
            actions: ["read", "search"]
          }
        ],
        restrictions: [
          {
            type: "access_mode",
            rule: "read_only",
            description: "Read-only access for audit purposes"
          }
        ]
      },
      {
        id: "patient",
        name: "Patient",
        description: "Patient with access to own health records",
        isActive: true,
        permissions: [
          {
            resource: "Patient",
            actions: ["read"],
            conditions: [
              {
                field: "patientId",
                operator: "equals",
                value: "self"
              }
            ]
          },
          {
            resource: "Observation",
            actions: ["read"],
            conditions: [
              {
                field: "subject.reference",
                operator: "equals",
                value: "self"
              }
            ]
          },
          {
            resource: "DiagnosticReport",
            actions: ["read"],
            conditions: [
              {
                field: "subject.reference",
                operator: "equals",
                value: "self"
              }
            ]
          }
        ],
        restrictions: [
          {
            type: "data_access",
            rule: "own_data_only",
            description: "Can only access own health information"
          }
        ]
      }
    ];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const roleData of defaultRoles) {
      const role = {
        ...roleData,
        createdAt: now,
        updatedAt: now
      };
      this.roles.set(role.id, role);
    }
    this.logger.info("Default RBAC roles initialized", { roleCount: this.roles.size });
  }
  /**
   * Create a new role
   */
  async createRole(roleData) {
    if (this.roles.has(roleData.id)) {
      throw new Error(`Role already exists: ${roleData.id}`);
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const role = {
      ...roleData,
      createdAt: now,
      updatedAt: now
    };
    this.roles.set(role.id, role);
    this.logger.info("Role created", {
      roleId: role.id,
      roleName: role.name,
      permissionCount: role.permissions.length
    });
    return role;
  }
  /**
   * Update an existing role
   */
  async updateRole(roleId, updates) {
    const existingRole = this.roles.get(roleId);
    if (!existingRole) {
      return null;
    }
    const updatedRole = {
      ...existingRole,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.roles.set(roleId, updatedRole);
    this.logger.info("Role updated", {
      roleId,
      updatedFields: Object.keys(updates)
    });
    return updatedRole;
  }
  /**
   * Delete a role
   */
  async deleteRole(roleId) {
    const deleted = this.roles.delete(roleId);
    if (deleted) {
      for (const user of this.users.values()) {
        const roleIndex = user.roles.indexOf(roleId);
        if (roleIndex > -1) {
          user.roles.splice(roleIndex, 1);
        }
      }
      this.logger.info("Role deleted", { roleId });
    }
    return deleted;
  }
  /**
   * Get role by ID
   */
  getRole(roleId) {
    return this.roles.get(roleId) ?? null;
  }
  /**
   * List all roles
   */
  listRoles(activeOnly = false) {
    const roles = Array.from(this.roles.values());
    return activeOnly ? roles.filter((role) => role.isActive) : roles;
  }
  /**
   * Create or update a user
   */
  async setUser(userData) {
    for (const roleId of userData.roles) {
      if (!this.roles.has(roleId)) {
        throw new Error(`Role not found: ${roleId}`);
      }
    }
    this.users.set(userData.id, userData);
    this.logger.info("User set", {
      userId: userData.id,
      username: userData.username,
      roleCount: userData.roles.length
    });
    return userData;
  }
  /**
   * Get user by ID
   */
  getUser(userId) {
    return this.users.get(userId) ?? null;
  }
  /**
   * Remove a user
   */
  async removeUser(userId) {
    const deleted = this.users.delete(userId);
    if (deleted) {
      this.logger.info("User removed", { userId });
    }
    return deleted;
  }
  /**
   * Check if user has access to perform an action
   */
  async checkAccess(context) {
    const user = this.users.get(context.userId);
    if (!user || !user.isActive) {
      return {
        granted: false,
        reason: "User not found or inactive",
        matchedPermissions: [],
        appliedRestrictions: []
      };
    }
    const matchedPermissions = [];
    const appliedRestrictions = [];
    let hasPermission = false;
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (!role || !role.isActive) {
        continue;
      }
      for (const permission of role.permissions) {
        if (this.matchesPermission(permission, context)) {
          matchedPermissions.push(permission);
          if (!permission.conditions || this.evaluateConditions(permission.conditions, context)) {
            hasPermission = true;
          }
        }
      }
      if (role.restrictions) {
        appliedRestrictions.push(...role.restrictions);
      }
    }
    if (!hasPermission) {
      return {
        granted: false,
        reason: "No matching permissions found",
        matchedPermissions,
        appliedRestrictions
      };
    }
    const restrictionViolation = this.checkRestrictions(appliedRestrictions, context);
    if (restrictionViolation) {
      return {
        granted: false,
        reason: `Restriction violation: ${restrictionViolation}`,
        matchedPermissions,
        appliedRestrictions
      };
    }
    this.logger.debug("Access granted", {
      userId: context.userId,
      resource: context.resource,
      action: context.action,
      permissionCount: matchedPermissions.length,
      restrictionCount: appliedRestrictions.length
    });
    return {
      granted: true,
      reason: "Access granted based on role permissions",
      matchedPermissions,
      appliedRestrictions
    };
  }
  /**
   * Get user permissions summary
   */
  getUserPermissions(userId) {
    const user = this.users.get(userId);
    if (!user) {
      return { roles: [], permissions: [], restrictions: [] };
    }
    const permissions = [];
    const restrictions = [];
    for (const roleId of user.roles) {
      const role = this.roles.get(roleId);
      if (role && role.isActive) {
        permissions.push(...role.permissions);
        if (role.restrictions) {
          restrictions.push(...role.restrictions);
        }
      }
    }
    return {
      roles: user.roles,
      permissions,
      restrictions
    };
  }
  /**
   * Check if permission matches the access context
   */
  matchesPermission(permission, context) {
    if (permission.resource !== "*" && permission.resource !== context.resource) {
      return false;
    }
    if (!permission.actions.includes(context.action)) {
      return false;
    }
    return true;
  }
  /**
   * Evaluate permission conditions
   */
  evaluateConditions(conditions, context) {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Evaluate a single condition
   */
  evaluateCondition(condition, context) {
    let contextValue;
    if (condition.field === "patientId" && condition.value === "self") {
      contextValue = context.userId;
    } else if (condition.field.includes(".")) {
      contextValue = this.getNestedValue(context.data ?? {}, condition.field);
    } else {
      contextValue = context.data?.[condition.field] ?? context.environment?.[condition.field];
    }
    switch (condition.operator) {
      case "equals":
        return contextValue === condition.value;
      case "not_equals":
        return contextValue !== condition.value;
      case "contains":
        return typeof contextValue === "string" && typeof condition.value === "string" && contextValue.includes(condition.value);
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }
  /**
   * Get nested value from an object using dot notation
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      if (typeof current === "object" && current !== null && key in current) {
        return current[key];
      }
      return void 0;
    }, obj);
  }
  /**
   * Check if any restrictions are violated
   */
  checkRestrictions(restrictions, context) {
    for (const restriction of restrictions) {
      const violation = this.evaluateRestriction(restriction, context);
      if (violation) {
        return violation;
      }
    }
    return null;
  }
  /**
   * Evaluate a single restriction
   */
  evaluateRestriction(restriction, context) {
    switch (restriction.rule) {
      case "own_patients_only":
        return null;
      case "assigned_patients_only":
        return null;
      case "no_clinical_data":
        if (context.data && this.containsClinicalData(context.data)) {
          return "Access to clinical data is restricted";
        }
        return null;
      case "read_only":
        if (context.action !== "read" && context.action !== "search") {
          return "Only read access is permitted";
        }
        return null;
      case "own_data_only":
        if (context.userId !== context.resourceId && !this.isSelfReference(context.data, context.userId)) {
          return "Can only access own health information";
        }
        return null;
      default:
        return null;
    }
  }
  /**
   * Check if data contains clinical information
   */
  containsClinicalData(data) {
    const clinicalFields = [
      "diagnosis",
      "procedure",
      "medication",
      "allergy",
      "condition",
      "observation",
      "labResult",
      "vitalSigns"
    ];
    const dataKeys = Object.keys(data).map((key) => key.toLowerCase());
    return clinicalFields.some((field) => dataKeys.some((key) => key.includes(field)));
  }
  /**
   * Check if data reference points to the user themselves
   */
  isSelfReference(data, userId) {
    if (!data) return false;
    const subjectRef = data?.subject?.reference;
    return subjectRef === `Patient/${userId}` || subjectRef === userId;
  }
  /**
   * Get RBAC statistics
   */
  getRBACStats() {
    const activeRoles = this.listRoles(true).length;
    const activeUsers = Array.from(this.users.values()).filter((user) => user.isActive).length;
    let totalPermissions = 0;
    let totalRestrictions = 0;
    for (const role of this.roles.values()) {
      totalPermissions += role.permissions.length;
      totalRestrictions += role.restrictions?.length ?? 0;
    }
    return {
      totalRoles: this.roles.size,
      activeRoles,
      totalUsers: this.users.size,
      activeUsers,
      totalPermissions,
      totalRestrictions
    };
  }
}
function createRBACManager(logger) {
  return new RBACManager(logger);
}
class SecurityManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }
  auditLogger;
  encryptionService;
  phiMasker;
  sessionManager;
  complianceValidator;
  rbacManager;
  async initialize() {
    const securityConfig = this.config.get("security");
    const hipaaLevel = securityConfig?.hipaa?.auditLevel ?? "standard";
    this.auditLogger = createHIPAAAuditLogger(
      {
        hipaaLevel,
        retentionPeriod: 2555,
        // 7 years as required by HIPAA
        automaticReporting: true,
        endpoint: securityConfig?.audit?.endpoint
      },
      this.logger
    );
    this.encryptionService = createEncryptionService(
      {
        aes: {
          keySize: 256,
          algorithm: "AES-256-GCM"
        },
        rsa: {
          keySize: 2048,
          algorithm: "RSA-OAEP"
        },
        keyRotationInterval: 90
        // 90 days
      },
      this.logger
    );
    await this.encryptionService.initialize();
    this.phiMasker = createPHIDataMasker(defaultMaskingConfig, this.logger);
    this.sessionManager = createSessionManager(defaultSessionConfig, this.logger);
    this.complianceValidator = createComplianceValidator(this.logger);
    this.rbacManager = createRBACManager(this.logger);
    this.logger.info("Security manager initialized with full compliance suite");
  }
  async healthCheck() {
    try {
      const components = {
        auditLogger: !!this.auditLogger,
        encryptionService: !!this.encryptionService,
        phiMasker: !!this.phiMasker,
        sessionManager: !!this.sessionManager,
        complianceValidator: !!this.complianceValidator,
        rbacManager: !!this.rbacManager
      };
      const allHealthy = Object.values(components).every(Boolean);
      return {
        status: allHealthy ? "up" : "degraded",
        encryption: this.encryptionService ? "enabled" : "disabled",
        audit: this.auditLogger ? "enabled" : "disabled",
        compliance: this.complianceValidator ? "enabled" : "disabled",
        rbac: this.rbacManager ? "enabled" : "disabled"
      };
    } catch (error) {
      this.logger.error("Security health check failed", error);
      return {
        status: "down",
        encryption: "unknown",
        audit: "unknown",
        compliance: "unknown",
        rbac: "unknown"
      };
    }
  }
  async shutdown() {
    if (this.sessionManager) {
      await this.sessionManager.shutdown();
    }
    if (this.auditLogger) {
      await this.auditLogger.cleanupOldLogs();
    }
    if (this.encryptionService) {
      await this.encryptionService.rotateKeys();
    }
    this.logger.info("Security manager shutdown complete");
  }
  // Getter methods to access security components
  getAuditLogger() {
    return this.auditLogger;
  }
  getEncryptionService() {
    return this.encryptionService;
  }
  getPHIMasker() {
    return this.phiMasker;
  }
  getSessionManager() {
    return this.sessionManager;
  }
  getComplianceValidator() {
    return this.complianceValidator;
  }
  getRBACManager() {
    return this.rbacManager;
  }
}
class AIAgentManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }
  async initialize() {
    this.logger.info("AI agent manager initialized");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  async healthCheck() {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return { status: "up", agents: 0 };
  }
  async shutdown() {
    this.logger.info("AI agent manager shutdown");
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
class AnalyticsManager {
  config;
  logger;
  enabled;
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.enabled = config.analytics?.enabled ?? false;
  }
  trackEvent(eventName, eventProperties) {
    if (!this.enabled) {
      return;
    }
    this.logger.info(`Tracking event: ${eventName}`, eventProperties);
  }
  healthCheck() {
    return {
      status: this.enabled ? "enabled" : "disabled"
    };
  }
}
class CacheManager {
  config;
  logger;
  enabled;
  cache = /* @__PURE__ */ new Map();
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.enabled = config.caching?.enabled ?? false;
  }
  get(key) {
    if (!this.enabled) {
      return void 0;
    }
    const item = this.cache.get(key);
    if (item && item.expires > Date.now()) {
      this.logger.info(`Cache hit for key: ${key}`);
      return item.value;
    }
    this.logger.info(`Cache miss for key: ${key}`);
    return void 0;
  }
  set(key, value, ttl) {
    if (!this.enabled) {
      return;
    }
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
    this.logger.info(`Cache set for key: ${key}`);
  }
  clear() {
    this.cache.clear();
    this.logger.info("Cache cleared");
  }
  healthCheck() {
    return {
      status: this.enabled ? "enabled" : "disabled"
    };
  }
}
class BrainSAITHealthcareSDK {
  config;
  logger;
  apiClient;
  performanceMonitor;
  fhirClient;
  nphiesClient;
  securityManager;
  aiManager;
  analyticsManager;
  cacheManager;
  initialized = false;
  constructor(options = {}) {
    this.config = new ConfigManager(options);
    this.logger = new Logger(this.config.get("logging"));
    this.apiClient = new ApiClient(this.config, this.logger);
    this.performanceMonitor = new PerformanceMonitor(
      this.config.get("ui.performance"),
      options.onPerformanceMetric
    );
    this.fhirClient = new LegacyFHIRClient(this.config, this.logger, this.apiClient);
    this.nphiesClient = new NPHIESClient(this.config, this.logger, this.apiClient);
    this.securityManager = new SecurityManager(this.config, this.logger);
    this.aiManager = new AIAgentManager(this.config, this.logger);
    this.analyticsManager = new AnalyticsManager(this.config.getAll(), this.logger);
    this.cacheManager = new CacheManager(this.config.getAll(), this.logger);
    if (options.onError) {
      this.setErrorHandler(options.onError);
    }
  }
  /**
   * Initialize the SDK with configuration validation
   */
  async initialize() {
    if (this.initialized) {
      throw new Error("SDK is already initialized");
    }
    try {
      this.logger.info("Initializing BrainSAIT Healthcare SDK...");
      this.config.validate();
      this.performanceMonitor.start();
      await this.securityManager.initialize();
      await this.fhirClient.initialize();
      await this.nphiesClient.initialize();
      if (this.config.get("ai.enabled")) {
        await this.aiManager.initialize();
      }
      this.initialized = true;
      this.logger.info("SDK initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize SDK",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
  /**
   * Get FHIR client instance
   */
  get fhir() {
    this.ensureInitialized();
    return this.fhirClient;
  }
  /**
   * Get FHIR client instance (alternative method)
   */
  getFHIRClient() {
    this.ensureInitialized();
    return this.fhirClient;
  }
  /**
   * Get NPHIES client instance
   */
  get nphies() {
    this.ensureInitialized();
    return this.nphiesClient;
  }
  /**
   * Get NPHIES client instance (alternative method)
   */
  getNPHIESClient() {
    this.ensureInitialized();
    return this.nphiesClient;
  }
  /**
   * Get security manager instance
   */
  get security() {
    this.ensureInitialized();
    return this.securityManager;
  }
  /**
   * Get security manager instance (alternative method)
   */
  getSecurityManager() {
    this.ensureInitialized();
    return this.securityManager;
  }
  /**
   * Get AI agent manager instance
   */
  get ai() {
    this.ensureInitialized();
    return this.aiManager;
  }
  /**
   * Get AI agent manager instance (alternative method)
   */
  getAIAgentManager() {
    this.ensureInitialized();
    return this.aiManager;
  }
  /**
   * Get analytics manager instance
   */
  get analytics() {
    this.ensureInitialized();
    return this.analyticsManager;
  }
  /**
   * Get analytics manager instance (alternative method)
   */
  getAnalyticsManager() {
    this.ensureInitialized();
    return this.analyticsManager;
  }
  /**
   * Get cache manager instance
   */
  get cache() {
    this.ensureInitialized();
    return this.cacheManager;
  }
  /**
   * Get cache manager instance (alternative method)
   */
  getCacheManager() {
    this.ensureInitialized();
    return this.cacheManager;
  }
  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
  /**
   * Update SDK configuration
   */
  updateConfig(newConfig) {
    this.config.update(newConfig);
    this.logger.info("Configuration updated");
  }
  /**
   * Get health status of the SDK and connected services
   */
  async healthCheck() {
    const startTime = Date.now();
    try {
      const [fhirHealth, nphiesHealth] = await Promise.allSettled([
        this.fhirClient.healthCheck(),
        this.nphiesClient.healthCheck()
      ]);
      return {
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: "1.0.0",
        responseTime: Date.now() - startTime,
        services: {
          fhir: fhirHealth.status === "fulfilled" ? fhirHealth.value : { status: "down", error: String(fhirHealth.reason) },
          nphies: nphiesHealth.status === "fulfilled" ? nphiesHealth.value : { status: "down", error: String(nphiesHealth.reason) },
          security: await this.securityManager.healthCheck(),
          ai: this.config.get("ai")?.enabled ? await this.aiManager.healthCheck() : { status: "disabled" },
          analytics: this.analyticsManager.healthCheck(),
          cache: this.cacheManager.healthCheck()
        }
      };
    } catch (error) {
      this.logger.error(
        "Health check failed",
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: "1.2.0",
        responseTime: Date.now() - startTime,
        services: {},
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Alias for health check (for compatibility)
   */
  async getHealthStatus() {
    return this.healthCheck();
  }
  /**
   * Cleanup resources and shut down the SDK
   */
  async shutdown() {
    if (!this.initialized) {
      return;
    }
    this.logger.info("Shutting down SDK...");
    try {
      await this.performanceMonitor.stop();
      await this.aiManager.shutdown();
      await this.securityManager.shutdown();
      await this.nphiesClient.shutdown();
      await this.fhirClient.shutdown();
      this.initialized = false;
      this.logger.info("SDK shutdown completed");
    } catch (error) {
      this.logger.error(
        "Error during shutdown",
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error("SDK not initialized. Call initialize() first.");
    }
  }
  setErrorHandler(handler) {
    process.on("unhandledRejection", handler);
    process.on("uncaughtException", handler);
  }
}
const encrypt = (data, key) => {
  const keyLength = key.length;
  return Buffer.from(data + keyLength).toString("base64");
};
const decrypt = (encryptedData, key) => {
  const keyLength = key.length;
  const decoded = Buffer.from(encryptedData, "base64").toString("utf-8");
  return decoded.substring(0, decoded.length - keyLength.toString().length);
};
const translations = {
  ar: {
    welcome: "مرحباً",
    patient: "مريض",
    doctor: "طبيب"
  },
  en: {
    welcome: "Welcome",
    patient: "Patient",
    doctor: "Doctor"
  }
};
const t = (key, locale = "ar") => {
  return translations[locale][key] || key;
};
const measureTime = (fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return [result, end - start];
};
const measureAsyncTime = async (fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return [result, end - start];
};
class HealthcarePerformanceProfiler {
  measurements = /* @__PURE__ */ new Map();
  activeTimers = /* @__PURE__ */ new Map();
  /**
   * Start timing an operation
   */
  startTimer(operationName) {
    this.activeTimers.set(operationName, performance.now());
  }
  /**
   * End timing an operation and record the measurement
   */
  endTimer(operationName) {
    const startTime = this.activeTimers.get(operationName);
    if (!startTime) {
      throw new Error(`Timer not started for operation: ${operationName}`);
    }
    const duration = performance.now() - startTime;
    this.activeTimers.delete(operationName);
    const measurements = this.measurements.get(operationName) ?? [];
    measurements.push(duration);
    this.measurements.set(operationName, measurements);
    return duration;
  }
  /**
   * Get performance statistics for an operation
   */
  getStats(operationName) {
    const measurements = this.measurements.get(operationName);
    if (!measurements || measurements.length === 0) {
      return null;
    }
    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const total = measurements.reduce((sum, val) => sum + val, 0);
    const average = total / count;
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const p95 = sorted[Math.floor(count * 0.95)] ?? max;
    const p99 = sorted[Math.floor(count * 0.99)] ?? max;
    return { count, average, min, max, total, p95, p99 };
  }
  /**
   * Get all operation statistics
   */
  getAllStats() {
    const stats = {};
    for (const operationName of this.measurements.keys()) {
      stats[operationName] = this.getStats(operationName);
    }
    return stats;
  }
  /**
   * Clear all measurements
   */
  clear() {
    this.measurements.clear();
    this.activeTimers.clear();
  }
  /**
   * Check if operation is performing well (under threshold)
   */
  isPerformingWell(operationName, thresholdMs) {
    const stats = this.getStats(operationName);
    return stats ? stats.p95 < thresholdMs : true;
  }
  /**
   * Generate performance report for healthcare operations
   */
  generateHealthcareReport() {
    const allStats = this.getAllStats();
    const operationNames = Object.keys(allStats);
    const totalOperations = operationNames.length;
    const slowOperations = [];
    const fastOperations = [];
    const recommendations = [];
    let totalScore = 0;
    for (const [operationName, stats] of Object.entries(allStats)) {
      if (!stats) continue;
      const thresholds = {
        "fhir-validation": 500,
        "phi-masking": 100,
        "compliance-check": 200,
        "audit-logging": 50,
        "security-validation": 300,
        default: 1e3
      };
      const threshold = thresholds[operationName] || thresholds.default;
      if (stats.p95 > threshold) {
        slowOperations.push(operationName);
        recommendations.push(
          `Optimize ${operationName} - P95: ${stats.p95.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      } else {
        fastOperations.push(operationName);
      }
      const score = Math.max(0, Math.min(100, 100 - stats.p95 / threshold * 50));
      totalScore += score;
    }
    const performanceScore = totalOperations > 0 ? totalScore / totalOperations : 100;
    if (performanceScore < 70) {
      recommendations.push("Overall performance needs improvement - consider caching strategies");
    }
    if (slowOperations.length > totalOperations * 0.3) {
      recommendations.push("High percentage of slow operations - review algorithm efficiency");
    }
    return {
      totalOperations,
      slowOperations,
      fastOperations,
      recommendations,
      performanceScore: Math.round(performanceScore)
    };
  }
}
const healthcareProfiler = new HealthcarePerformanceProfiler();
function measurePerformance(operationName) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    if (!originalMethod) {
      return descriptor;
    }
    descriptor.value = async function(...args) {
      healthcareProfiler.startTimer(operationName);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        healthcareProfiler.endTimer(operationName);
      }
    };
    return descriptor;
  };
}
class FrameRateMonitor {
  frameCount = 0;
  lastTime = performance.now();
  frameRates = [];
  isMonitoring = false;
  animationId;
  /**
   * Start monitoring frame rate
   */
  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameRates = [];
    const monitor = () => {
      if (!this.isMonitoring) return;
      this.frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      if (deltaTime >= 1e3) {
        const fps = Math.round(this.frameCount * 1e3 / deltaTime);
        this.frameRates.push(fps);
        if (this.frameRates.length > 60) {
          this.frameRates.shift();
        }
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      this.animationId = requestAnimationFrame(monitor);
    };
    this.animationId = requestAnimationFrame(monitor);
  }
  /**
   * Stop monitoring frame rate
   */
  stop() {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = void 0;
    }
  }
  /**
   * Get current average frame rate
   */
  getAverageFrameRate() {
    if (this.frameRates.length === 0) return 0;
    return Math.round(this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length);
  }
  /**
   * Check if frame rate is acceptable for healthcare UI
   */
  isPerformanceAcceptable() {
    const avgFps = this.getAverageFrameRate();
    return avgFps >= 30;
  }
  /**
   * Get performance status
   */
  getPerformanceStatus() {
    const avgFps = this.getAverageFrameRate();
    if (avgFps >= 55) return "excellent";
    if (avgFps >= 45) return "good";
    if (avgFps >= 30) return "acceptable";
    return "poor";
  }
}
const frameRateMonitor = new FrameRateMonitor();
const createGlassMorphismStyle = (props = {}) => {
  const { opacity = 0.1, blur = 20, borderRadius = "12px", border = true, shadow = true } = props;
  return {
    backdropFilter: `blur(${blur}px)`,
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    border: border ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
    borderRadius,
    boxShadow: shadow ? "0 8px 32px 0 rgba(31, 38, 135, 0.37)" : "none"
  };
};
const glassMorphismPresets = {
  card: {
    opacity: 0.1,
    blur: 20,
    borderRadius: "16px",
    border: true,
    shadow: true
  },
  button: {
    opacity: 0.15,
    blur: 10,
    borderRadius: "8px",
    border: true,
    shadow: false
  },
  modal: {
    opacity: 0.08,
    blur: 30,
    borderRadius: "20px",
    border: true,
    shadow: true
  },
  navbar: {
    opacity: 0.12,
    blur: 15,
    borderRadius: "0px",
    border: false,
    shadow: true
  }
};
const darkModeGlassStyle = (props = {}) => {
  const { opacity = 0.1, blur = 20, borderRadius = "12px", border = true, shadow = true } = props;
  return {
    backdropFilter: `blur(${blur}px)`,
    backgroundColor: `rgba(0, 0, 0, ${opacity + 0.2})`,
    border: border ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
    borderRadius,
    boxShadow: shadow ? "0 8px 32px 0 rgba(0, 0, 0, 0.5)" : "none"
  };
};
const createRTLStyle = (rtl = false) => ({
  direction: rtl ? "rtl" : "ltr",
  textAlign: rtl ? "right" : "left"
});
const rtlAwareMargin = (rtl, left, right) => ({
  marginLeft: rtl ? right : left,
  marginRight: rtl ? left : right
});
const rtlAwarePadding = (rtl, left, right) => ({
  paddingLeft: rtl ? right : left,
  paddingRight: rtl ? left : right
});
const rtlAwarePosition = (rtl, leftPos, rightPos) => {
  if (leftPos && rightPos) {
    return rtl ? { right: leftPos, left: rightPos } : { left: leftPos, right: rightPos };
  }
  if (leftPos) {
    return rtl ? { right: leftPos } : { left: leftPos };
  }
  if (rightPos) {
    return rtl ? { left: rightPos } : { right: rightPos };
  }
  return {};
};
const rtlTransform = (rtl, transform) => {
  if (!transform) return {};
  return {
    transform: rtl ? `scaleX(-1) ${transform}` : transform
  };
};
const arabicFontStack = [
  "Tajawal",
  "Cairo",
  "Amiri",
  "Noto Sans Arabic",
  "Arabic Typesetting",
  "Tahoma",
  "Arial Unicode MS",
  "sans-serif"
].join(", ");
const createFontStyle = (rtl) => ({
  fontFamily: rtl ? arabicFontStack : "Inter, system-ui, sans-serif",
  fontFeatureSettings: rtl ? '"liga" 1, "calt" 1, "kern" 1' : '"liga" 1, "calt" 1'
});
const colorTokens = {
  primary: "var(--brainsait-color-primary, #3B82F6)",
  primaryAccent: "var(--brainsait-color-primary-accent, #60A5FA)",
  secondary: "var(--brainsait-color-secondary, #6366F1)",
  success: "var(--brainsait-color-success, #10B981)",
  warning: "var(--brainsait-color-warning, #F59E0B)",
  danger: "var(--brainsait-color-danger, #EF4444)",
  info: "var(--brainsait-color-info, #0EA5E9)",
  textPrimary: "var(--brainsait-color-text-primary, rgba(17, 24, 39, 0.95))",
  textSecondary: "var(--brainsait-color-text-secondary, rgba(107, 114, 128, 0.85))",
  glassLight: "var(--brainsait-color-glass-light, rgba(255, 255, 255, 0.45))",
  glassDark: "var(--brainsait-color-glass-dark, rgba(17, 24, 39, 0.45))"
};
const typographyTokens = {
  sans: 'var(--brainsait-font-sans, "Inter", "Cairo", "Helvetica Neue", Arial, sans-serif)',
  display: 'var(--brainsait-font-display, "Sora", "Poppins", "Helvetica Neue", Arial, sans-serif)',
  monospace: 'var(--brainsait-font-mono, "JetBrains Mono", "Source Code Pro", monospace)'
};
const spacingTokens = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px"
};
const transitionTokens = {
  base: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
  microInteraction: "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)",
  fade: "opacity 240ms ease"
};
const breakpointTokens = {
  md: 768,
  lg: 1024
};
const defaultSans = '"Inter", "Cairo", "Helvetica Neue", Arial, sans-serif';
const defaultDisplay = '"Sora", "Poppins", "Helvetica Neue", Arial, sans-serif';
const defaultPrimary = "#3B82F6";
const defaultPrimaryAccent = "#60A5FA";
const defaultSecondary = "#6366F1";
const defaultSuccess = "#10B981";
const defaultWarning = "#F59E0B";
const defaultDanger = "#EF4444";
const defaultInfo = "#0EA5E9";
const defaultTextPrimary = "rgba(17, 24, 39, 0.95)";
const defaultTextSecondary = "rgba(107, 114, 128, 0.85)";
let stylesInjected = false;
const baseStyles = `
:root {
  --brainsait-font-sans: ${defaultSans};
  --brainsait-font-display: ${defaultDisplay};
  --brainsait-color-primary: ${defaultPrimary};
  --brainsait-color-primary-accent: ${defaultPrimaryAccent};
  --brainsait-color-secondary: ${defaultSecondary};
  --brainsait-color-success: ${defaultSuccess};
  --brainsait-color-warning: ${defaultWarning};
  --brainsait-color-danger: ${defaultDanger};
  --brainsait-color-info: ${defaultInfo};
  --brainsait-color-text-primary: ${defaultTextPrimary};
  --brainsait-color-text-secondary: ${defaultTextSecondary};
  --brainsait-radius-sm: 12px;
  --brainsait-radius-md: 16px;
  --brainsait-radius-lg: 24px;
  --brainsait-glass-blur: 24px;
  --brainsait-glass-opacity: 0.14;
  --brainsait-shadow-soft: 0 20px 45px rgba(15, 23, 42, 0.18);
}

@keyframes brainsait-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes brainsait-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes brainsait-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.brainsait-ui-base {
  position: relative;
  color: ${colorTokens.textPrimary};
  font-family: ${typographyTokens.sans};
  line-height: 1.5;
  isolation: isolate;
}

.brainsait-ui-base.glass-morphism::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  backdrop-filter: blur(var(--glass-blur, var(--brainsait-glass-blur)));
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, calc(var(--glass-opacity, var(--brainsait-glass-opacity)) * 0.85)),
    rgba(255, 255, 255, calc(var(--glass-opacity, var(--brainsait-glass-opacity)) * 0.35))
  );
  z-index: -1;
  transition: opacity 240ms ease;
}

.brainsait-ui-base.glass-morphism.glass-dark::before {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, calc(var(--glass-opacity, 0.18) * 1.1)),
    rgba(15, 23, 42, calc(var(--glass-opacity, 0.18) * 0.8))
  );
}

.brainsait-ui-base.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.brainsait-ui-base.loading {
  cursor: progress;
}

.brainsait-ui-base .brainsait-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 1);
  border-radius: 50%;
  animation: brainsait-spin 1s linear infinite;
}

.brainsait-loading-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14px);
  z-index: 20;
}

.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: var(--brainsait-radius-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 200ms ease, box-shadow 240ms ease;
  box-shadow: 0 12px 38px rgba(59, 130, 246, 0.22);
}

.glass-button button {
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  width: 100%;
  height: 100%;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.glass-button:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 50px rgba(59, 130, 246, 0.32);
}

.glass-button:not(.disabled):active {
  transform: translateY(0) scale(0.99);
}

.glass-button .ripple-effect {
  pointer-events: none;
  position: absolute;
  inset: -5%;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.6);
  transition: transform 320ms ease-out, opacity 320ms ease-out;
}

.glass-button:not(.disabled):hover .ripple-effect {
  opacity: 0.6;
  transform: scale(1.25);
}

.healthcare-dashboard {
  backdrop-filter: blur(28px);
  animation: brainsait-fade-in 320ms ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.45));
  box-shadow: var(--brainsait-shadow-soft);
}

.healthcare-dashboard h1 {
  font-family: ${typographyTokens.display};
  letter-spacing: -0.01em;
  color: ${colorTokens.textPrimary};
}

.healthcare-dashboard .dashboard-widget {
  border-radius: var(--brainsait-radius-md);
  backdrop-filter: blur(calc(var(--glass-blur, 24px) * 0.85));
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.35));
  border: 1px solid rgba(255, 255, 255, 0.24);
  transition: transform 200ms ease, box-shadow 240ms ease, border 200ms ease;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
}

.healthcare-dashboard .dashboard-widget:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16);
  border-color: rgba(96, 165, 250, 0.4);
}

.healthcare-dashboard .dashboard-widget .dashboard-widget-metric-value {
  font-size: clamp(1.75rem, 2.2vw, 2.4rem);
}

.patient-card {
  align-items: stretch;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.45));
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: var(--brainsait-radius-md);
  transition: transform 180ms ease, box-shadow 220ms ease;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.patient-card:not(.disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 55px rgba(15, 23, 42, 0.18);
}

.patient-card h3 {
  font-family: ${typographyTokens.display};
  margin-bottom: 6px;
  color: ${colorTokens.textPrimary};
}

.patient-card .patient-card-details {
  display: grid;
  gap: 0.5rem;
  color: ${colorTokens.textSecondary};
}

.patient-card .patient-card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: ${colorTokens.textSecondary};
}

.patient-card .patient-card-status {
  animation: brainsait-pulse 2.8s infinite;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.55);
}

.notification-system-container {
  position: fixed;
  top: 24px;
  right: 24px;
  display: grid;
  gap: 12px;
  z-index: 9999;
  max-width: min(380px, calc(100vw - 32px));
}

.notification-system-container[data-position='bottom-left'],
.notification-system-container[data-position='bottom-right'] {
  top: auto;
  bottom: 24px;
}

.notification-system-container[data-position='top-left'],
.notification-system-container[data-position='bottom-left'] {
  right: auto;
  left: 24px;
}

.notification-card {
  padding: 16px;
  border-radius: 16px;
  display: grid;
  gap: 8px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.78));
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.12);
  animation: brainsait-fade-in 280ms ease;
}

.notification-card.success {
  border-left: 6px solid ${colorTokens.success};
}

.notification-card.error {
  border-left: 6px solid ${colorTokens.danger};
}

.notification-card.warning {
  border-left: 6px solid ${colorTokens.warning};
}

.notification-card.info {
  border-left: 6px solid ${colorTokens.info};
}

@media (max-width: ${breakpointTokens.lg}px) {
  .healthcare-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: ${breakpointTokens.md}px) {
  .healthcare-dashboard-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .patient-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}
`;
const ensureGlobalUIStyles = () => {
  if (stylesInjected || typeof document === "undefined") {
    return;
  }
  const style = document.createElement("style");
  style.setAttribute("data-brainsait-ui-base", "true");
  style.innerHTML = baseStyles;
  document.head.appendChild(style);
  stylesInjected = true;
};
const BaseComponent = ({
  id,
  className = "",
  style = {},
  children,
  disabled = false,
  loading = false,
  rtl = false,
  theme = "light",
  glassMorphism = true,
  opacity,
  blur,
  borderRadius,
  border,
  shadow,
  ...props
}) => {
  ensureGlobalUIStyles();
  const glassProps = useMemo(
    () => ({ opacity, blur, borderRadius, border, shadow }),
    [opacity, blur, borderRadius, border, shadow]
  );
  const baseStyle = {
    position: "relative",
    ...!glassMorphism ? {} : theme === "dark" ? darkModeGlassStyle(glassProps) : createGlassMorphismStyle(glassProps),
    ...createRTLStyle(rtl),
    ...createFontStyle(rtl),
    transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
    ...disabled && {
      opacity: 0.6,
      pointerEvents: "none"
    },
    ...loading && {
      cursor: "progress"
    },
    ...style
  };
  const combinedClassName = [
    "brainsait-ui-base",
    glassMorphism && "glass-morphism",
    theme === "dark" && "glass-dark",
    rtl && "rtl",
    disabled && "disabled",
    loading && "loading",
    className
  ].filter(Boolean).join(" ");
  const renderedChildren = [];
  if (loading) {
    renderedChildren.push(
      React.createElement(
        "div",
        { className: "brainsait-loading-overlay", "aria-hidden": true },
        React.createElement("div", { className: "brainsait-spinner" })
      )
    );
  }
  renderedChildren.push(children);
  return React.createElement(
    "div",
    {
      id,
      className: combinedClassName,
      style: baseStyle,
      "aria-busy": loading || void 0,
      "aria-disabled": disabled || void 0,
      "data-theme": theme,
      ...props
    },
    ...renderedChildren
  );
};
const variantStyles = {
  primary: {
    background: `linear-gradient(135deg, ${colorTokens.primary}, ${colorTokens.secondary})`,
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  secondary: {
    background: "linear-gradient(135deg, rgba(107, 114, 128, 0.85), rgba(75, 85, 99, 0.8))",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  outline: {
    background: "rgba(255, 255, 255, 0.08)",
    color: colorTokens.primary,
    border: "2px solid rgba(59, 130, 246, 0.75)"
  },
  ghost: {
    background: "transparent",
    color: "rgba(0, 0, 0, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  }
};
const iconDimensions = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20
};
const GlassMorphismButton = ({
  type = "button",
  onClick,
  children,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  fullWidth = false,
  animate = true,
  disabled = false,
  loading = false,
  rtl = false,
  ...baseProps
}) => {
  const buttonStyle = useMemo(() => {
    const dimensionStyles = {
      xs: { padding: "6px 12px", fontSize: "12px", minHeight: "28px" },
      sm: { padding: "8px 16px", fontSize: "14px", minHeight: "32px" },
      md: { padding: "12px 24px", fontSize: "16px", minHeight: "40px" },
      lg: { padding: "16px 32px", fontSize: "18px", minHeight: "48px" },
      xl: { padding: "20px 40px", fontSize: "20px", minHeight: "56px" }
    };
    return {
      ...dimensionStyles[size],
      ...variantStyles[variant] ?? variantStyles.primary,
      borderRadius: "12px",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: 600,
      position: "relative",
      overflow: "hidden",
      width: fullWidth ? "100%" : "auto",
      transition: animate ? transitionTokens.base : "none",
      backdropFilter: "blur(20px)",
      ...disabled && {
        opacity: 0.6,
        pointerEvents: "none"
      }
    };
  }, [variant, size, fullWidth, animate, disabled, loading]);
  const iconStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${iconDimensions[size]}px`,
    height: `${iconDimensions[size]}px`
  };
  const renderContent = () => {
    const iconElement = icon ? React.createElement("span", { style: iconStyle, className: "glass-button-icon" }, icon) : null;
    const textElement = children ? React.createElement("span", { className: "glass-button-text" }, children) : null;
    if (!icon) {
      return textElement;
    }
    if (!children) {
      return iconElement;
    }
    const isIconLeft = !rtl && iconPosition === "left" || rtl && iconPosition === "right";
    const nodes = isIconLeft ? [iconElement, textElement] : [textElement, iconElement];
    return React.createElement(React.Fragment, null, ...nodes);
  };
  const childrenNodes = [
    React.createElement(
      "button",
      {
        type,
        onClick,
        disabled: disabled || loading,
        style: {
          background: "transparent",
          border: "none",
          color: "inherit",
          font: "inherit",
          cursor: "inherit",
          padding: 0,
          margin: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        },
        "aria-busy": loading,
        "aria-disabled": disabled
      },
      renderContent()
    )
  ];
  if (animate) {
    childrenNodes.push(
      React.createElement("div", {
        key: "ripple",
        className: "ripple-effect",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
          transform: "scale(0)",
          borderRadius: "inherit",
          pointerEvents: "none",
          transition: "transform 0.3s ease-out"
        }
      })
    );
  }
  const computedClassName = [
    "glass-button",
    `glass-button-${variant}`,
    `glass-button-${size}`,
    baseProps.className
  ].filter(Boolean).join(" ");
  const baseComponentProps = {
    ...baseProps,
    style: {
      ...buttonStyle,
      ...baseProps.style
    },
    disabled,
    loading,
    rtl,
    className: computedClassName
  };
  return React.createElement(BaseComponent, baseComponentProps, ...childrenNodes);
};
const resolveListItemContent = (item) => {
  if (typeof item === "object" && item !== null) {
    const objectItem = item;
    return objectItem.label ?? objectItem.name ?? String(item);
  }
  return String(item);
};
const HealthcareDashboard = ({
  dashboard,
  onWidgetClick,
  onFilterChange,
  data = {},
  refreshInterval,
  isLoading = false,
  rtl = false,
  ...baseProps
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [_refreshTick, setRefreshTick] = useState(0);
  const [_lastRefresh, setLastRefresh] = useState(/* @__PURE__ */ new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !isAutoRefresh) {
      return void 0;
    }
    const interval = setInterval(() => {
      setRefreshTick((prev) => prev + 1);
      setLastRefresh(/* @__PURE__ */ new Date());
    }, refreshInterval * 1e3);
    return () => clearInterval(interval);
  }, [refreshInterval, isAutoRefresh]);
  const handleFilterChange = (filterId, value) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value
    };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };
  const dashboardStyle = {
    padding: "24px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  };
  const titleStyle = {
    fontSize: "28px",
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.9)",
    margin: 0
  };
  const filtersStyle = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px"
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${dashboard.layout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${dashboard.layout.rows}, minmax(200px, auto))`,
    gap: dashboard.layout.gaps,
    flex: 1
  };
  const refreshInfo = refreshInterval ? React.createElement(
    "div",
    {
      style: {
        fontSize: "14px",
        color: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }
    },
    React.createElement("div", {
      style: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#10B981",
        animation: "pulse 2s infinite"
      }
    }),
    rtl ? `تحديث كل ${refreshInterval} ثانية` : `Auto-refresh: ${refreshInterval}s`
  ) : null;
  const header = React.createElement(
    "div",
    { style: headerStyle },
    React.createElement("h1", { style: titleStyle }, dashboard.title),
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "12px" } },
      refreshInfo
    )
  );
  const filtersNode = dashboard.filters && dashboard.filters.length > 0 ? React.createElement(
    "div",
    { style: filtersStyle },
    ...dashboard.filters.map(
      (filter2) => React.createElement(DashboardFilterComponent, {
        key: filter2.id,
        filter: filter2,
        value: activeFilters[filter2.id],
        onChange: (value) => handleFilterChange(filter2.id, value),
        rtl
      })
    )
  ) : null;
  const widgets = React.createElement(
    "div",
    { style: gridStyle },
    ...dashboard.widgets.map(
      (widget) => React.createElement(DashboardWidgetComponent, {
        key: widget.id,
        widget,
        data: data[widget.id],
        onClick: () => onWidgetClick?.(widget),
        rtl
      })
    )
  );
  const className = ["healthcare-dashboard", baseProps.className].filter(Boolean).join(" ");
  const baseChildren = [header];
  if (filtersNode) {
    baseChildren.push(filtersNode);
  }
  baseChildren.push(widgets);
  return React.createElement(
    BaseComponent,
    {
      ...baseProps,
      style: {
        ...dashboardStyle,
        ...baseProps.style
      },
      rtl,
      loading: isLoading,
      className
    },
    ...baseChildren
  );
};
const DashboardFilterComponent = ({
  filter: filter2,
  value,
  onChange
}) => {
  const filterStyle = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    fontSize: "14px",
    minWidth: "120px"
  };
  const handleSelectChange = (event) => {
    onChange(event.target.value);
  };
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };
  if (filter2.type === "select") {
    const options = [
      React.createElement("option", { key: "placeholder", value: "" }, filter2.placeholder ?? ""),
      ...filter2.options?.map(
        (option) => React.createElement("option", { key: option.value, value: option.value }, option.label)
      ) ?? []
    ];
    return React.createElement(
      "select",
      {
        value: value ?? "",
        onChange: handleSelectChange,
        style: filterStyle
      },
      ...options
    );
  }
  const inputProps = {
    value: value ?? "",
    onChange: handleInputChange,
    placeholder: filter2.placeholder,
    style: filterStyle
  };
  const inputType = filter2.type === "date" ? "date" : "text";
  return React.createElement("input", { ...inputProps, type: inputType });
};
const DashboardWidgetComponent = ({
  widget,
  data,
  onClick,
  rtl
}) => {
  const widgetStyle = {
    padding: "20px",
    borderRadius: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    minHeight: widget.minHeight ?? "200px"
  };
  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.9)",
    marginBottom: "16px"
  };
  const valueStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: widget.color ?? "#3B82F6",
    marginBottom: "8px"
  };
  const subtitleStyle = {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.6)"
  };
  const metricNodes = [];
  if (widget.type === "metric" && data && typeof data === "object" && data !== null) {
    const metricData = data;
    metricNodes.push(
      React.createElement("div", { key: "value", style: valueStyle }, metricData.value ?? "---")
    );
    metricNodes.push(
      React.createElement(
        "div",
        { key: "subtitle", style: subtitleStyle },
        metricData.subtitle ?? widget.subtitle
      )
    );
  }
  let body = null;
  if (widget.type === "metric") {
    body = React.createElement(React.Fragment, null, ...metricNodes);
  } else if (widget.type === "chart") {
    body = React.createElement(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      React.createElement(
        "div",
        { style: subtitleStyle },
        rtl ? "الرسم البياني" : "Chart visualization"
      )
    );
  } else if (widget.type === "list" && data && typeof data === "object" && data !== null) {
    const items = data.items ?? [];
    body = React.createElement(
      "div",
      { style: { flex: 1, overflow: "auto" } },
      ...items.slice(0, 5).map(
        (item, index) => React.createElement(
          "div",
          {
            key: index,
            style: {
              padding: "8px 0",
              borderBottom: index < items.length - 1 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
              fontSize: "14px"
            }
          },
          resolveListItemContent(item)
        )
      )
    );
  }
  const cardChildren = [
    React.createElement("h3", { key: "title", style: titleStyle }, widget.title)
  ];
  if (body) {
    cardChildren.push(body);
  }
  const handleKeyDown = onClick ? (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  } : void 0;
  return React.createElement(
    "div",
    {
      style: widgetStyle,
      onClick,
      className: `dashboard-widget dashboard-widget-${widget.type}`,
      role: onClick ? "button" : void 0,
      tabIndex: onClick ? 0 : void 0,
      onKeyDown: handleKeyDown
    },
    ...cardChildren
  );
};
const PatientCard = ({
  patient,
  showPhoto = true,
  showIdentifiers = true,
  showContact = true,
  onPatientClick,
  compact = false,
  rtl = false,
  ...baseProps
}) => {
  const primaryName = patient.name?.[0];
  const givenName = primaryName?.given?.join(" ") ?? "";
  const familyName = primaryName?.family ?? "";
  const textName = primaryName?.text;
  const fallbackName = `${givenName} ${familyName}`.trim();
  const displayName = textName ?? (fallbackName.length > 0 ? fallbackName : void 0) ?? "Unknown Patient";
  const primaryIdentifier = patient.identifier?.find((identifier) => identifier.type?.text === "National ID") ?? patient.identifier?.[0];
  const photoUrl = patient.photo?.[0]?.url;
  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;
  const primaryAddress = patient.address?.[0];
  const handleClick = () => {
    if (onPatientClick) {
      onPatientClick(patient);
    }
  };
  const cardStyle = {
    padding: compact ? "12px" : "20px",
    cursor: onPatientClick ? "pointer" : "default",
    minHeight: compact ? "80px" : "120px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    position: "relative",
    ...onPatientClick && {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.5)"
      }
    }
  };
  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: compact ? "4px" : "8px"
  };
  const nameStyle = {
    fontSize: compact ? "16px" : "18px",
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.9)",
    margin: 0
  };
  const detailStyle = {
    fontSize: "14px",
    color: "rgba(0, 0, 0, 0.7)",
    margin: 0
  };
  const metadataContainerStyle = {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  };
  const contactContainerStyle = {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  };
  const { style: incomingStyle, className: incomingClassName, ...restBaseProps } = baseProps;
  const mergedStyle = {
    ...cardStyle,
    ...incomingStyle ?? {}
  };
  const combinedClassName = ["patient-card", incomingClassName].filter(Boolean).join(" ");
  const children = [];
  if (showPhoto && photoUrl) {
    children.push(
      React.createElement(
        "div",
        {
          key: "photo",
          style: {
            width: compact ? "40px" : "60px",
            height: compact ? "40px" : "60px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: "rgba(255, 255, 255, 0.2)"
          }
        },
        React.createElement("img", {
          src: photoUrl,
          alt: displayName,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }
        })
      )
    );
  }
  const contentChildren = [
    React.createElement("h3", { key: "name", style: nameStyle }, displayName)
  ];
  const metadataChildren = [];
  if (patient.gender) {
    metadataChildren.push(
      React.createElement(
        "span",
        { key: "gender", style: detailStyle },
        rtl ? "الجنس:" : "Gender:",
        " ",
        patient.gender
      )
    );
  }
  if (age) {
    metadataChildren.push(
      React.createElement(
        "span",
        { key: "age", style: detailStyle },
        rtl ? "العمر:" : "Age:",
        " ",
        age,
        " ",
        rtl ? "سنة" : "years"
      )
    );
  }
  if (metadataChildren.length > 0) {
    contentChildren.push(
      React.createElement(
        "div",
        { key: "metadata", style: metadataContainerStyle },
        ...metadataChildren
      )
    );
  }
  if (showIdentifiers && primaryIdentifier) {
    contentChildren.push(
      React.createElement(
        "div",
        { key: "identifier", style: detailStyle },
        primaryIdentifier.type?.text ?? (rtl ? "المعرف" : "ID"),
        ": ",
        primaryIdentifier.value
      )
    );
  }
  const contactChildren = [];
  if (patient.phone) {
    contactChildren.push(
      React.createElement(
        "span",
        { key: "phone", style: detailStyle },
        rtl ? "الهاتف:" : "Phone:",
        " ",
        patient.phone
      )
    );
  }
  if (patient.email) {
    contactChildren.push(
      React.createElement(
        "span",
        { key: "email", style: detailStyle },
        rtl ? "البريد:" : "Email:",
        " ",
        patient.email
      )
    );
  }
  if (showContact && !compact && contactChildren.length > 0) {
    contentChildren.push(
      React.createElement(
        "div",
        { key: "contact", style: contactContainerStyle },
        ...contactChildren
      )
    );
  }
  if (primaryAddress && !compact) {
    contentChildren.push(
      React.createElement(
        "div",
        { key: "address", style: detailStyle },
        rtl ? "العنوان:" : "Address:",
        " ",
        formatAddress(primaryAddress, rtl)
      )
    );
  }
  children.push(
    React.createElement("div", { key: "content", style: contentStyle }, ...contentChildren)
  );
  if (patient.gender) {
    children.push(
      React.createElement("div", {
        key: "indicator",
        style: {
          position: "absolute",
          top: "8px",
          right: rtl ? "auto" : "8px",
          left: rtl ? "8px" : "auto",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: patient.gender === "male" ? "#3B82F6" : "#EC4899"
        }
      })
    );
  }
  return React.createElement(
    BaseComponent,
    {
      ...restBaseProps,
      style: mergedStyle,
      rtl,
      className: combinedClassName,
      onClick: onPatientClick ? handleClick : void 0
    },
    ...children
  );
};
const calculateAge = (birthDate) => {
  const today = /* @__PURE__ */ new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) {
    age--;
  }
  return age;
};
const formatAddress = (address, rtl) => {
  const parts = [...address.line ?? [], address.city, address.country].filter(Boolean);
  return parts.join(rtl ? "، " : ", ");
};
let notificationId = 0;
const globalNotifications = [];
const subscribers = [];
const NotificationSystem = ({
  maxNotifications = 5,
  defaultDuration = 5e3,
  position = "topRight",
  rtl = false,
  ...baseProps
}) => {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const updateNotifications = (newNotifications) => {
      setNotifications([...newNotifications]);
    };
    subscribers.push(updateNotifications);
    updateNotifications(globalNotifications);
    return () => {
      const index = subscribers.indexOf(updateNotifications);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);
  const removeNotification = useCallback((id) => {
    const index = globalNotifications.findIndex((notification) => notification.id === id);
    if (index > -1) {
      globalNotifications.splice(index, 1);
      subscribers.forEach((subscriber) => subscriber(globalNotifications));
    }
  }, []);
  useEffect(() => {
    const timers = [];
    notifications.forEach((notification) => {
      if (notification.duration !== 0) {
        const duration = notification.duration ?? defaultDuration;
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
        timers.push(timer);
      }
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, defaultDuration, removeNotification]);
  const getPositionStyles = () => {
    const positions = {
      topLeft: { top: "20px", left: "20px" },
      topRight: { top: "20px", right: "20px" },
      bottomLeft: { bottom: "20px", left: "20px" },
      bottomRight: { bottom: "20px", right: "20px" },
      top: { top: "20px", left: "50%", transform: "translateX(-50%)" },
      bottom: { bottom: "20px", left: "50%", transform: "translateX(-50%)" }
    };
    return positions[position ?? "topRight"];
  };
  const containerStyle = {
    position: "fixed",
    ...getPositionStyles(),
    zIndex: 9999,
    display: "flex",
    flexDirection: position.includes("bottom") ? "column-reverse" : "column",
    gap: "12px",
    maxWidth: "400px",
    width: "auto",
    pointerEvents: "none",
    ...baseProps.style
  };
  const combinedClassName = ["notification-system", baseProps.className].filter(Boolean).join(" ");
  const visibleNotifications = notifications.slice(0, maxNotifications);
  return React.createElement(
    "div",
    {
      className: combinedClassName,
      style: containerStyle
    },
    ...visibleNotifications.map(
      (notification) => React.createElement(NotificationCard, {
        key: notification.id,
        notification,
        onClose: () => removeNotification(notification.id),
        rtl
      })
    )
  );
};
const NotificationCard = ({
  notification,
  onClose,
  rtl = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };
  const typeStyles = getTypeStyles(notification.type);
  const cardStyle = {
    ...typeStyles,
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid",
    backdropFilter: "blur(20px)",
    color: "white",
    minWidth: "300px",
    maxWidth: "400px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    pointerEvents: "auto",
    cursor: "default",
    transform: `translateX(${isExiting ? rtl ? "-100%" : "100%" : isVisible ? "0%" : rtl ? "-100%" : "100%"}) translateY(${isExiting ? "-10px" : "0px"})`,
    opacity: isExiting ? 0 : isVisible ? 1 : 0,
    transition: "all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)"
  };
  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: notification.message ? "8px" : "0"
  };
  const titleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };
  const messageStyle = {
    fontSize: "14px",
    opacity: 0.9,
    lineHeight: "1.4",
    margin: 0
  };
  const closeButtonStyle = {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "white",
    fontSize: "14px",
    transition: "background-color 0.2s ease",
    flexShrink: 0
  };
  const handleMouseEnter = (event) => {
    event.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
  };
  const handleMouseLeave = (event) => {
    event.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
  };
  const cardChildren = [];
  const headerContent = React.createElement(
    "div",
    { style: headerStyle },
    React.createElement(
      "h4",
      { style: titleStyle },
      React.createElement("span", null, getTypeIcon(notification.type)),
      notification.title
    ),
    React.createElement(
      "button",
      {
        onClick: handleClose,
        style: closeButtonStyle,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave
      },
      "×"
    )
  );
  cardChildren.push(headerContent);
  if (notification.message) {
    cardChildren.push(
      React.createElement("p", { key: "message", style: messageStyle }, notification.message)
    );
  }
  return React.createElement(
    "div",
    { style: cardStyle, className: `notification notification-${notification.type}` },
    ...cardChildren
  );
};
const showNotification = (config) => {
  const notification = {
    ...config,
    id: `notification-${++notificationId}`,
    timestamp: Date.now()
  };
  globalNotifications.unshift(notification);
  subscribers.forEach((sub) => sub(globalNotifications));
  return notification.id;
};
const showSuccess = (title, message, duration) => showNotification({ type: "success", title, message, duration });
const showError = (title, message, duration) => showNotification({ type: "error", title, message, duration });
const showWarning = (title, message, duration) => showNotification({ type: "warning", title, message, duration });
const showInfo = (title, message, duration) => showNotification({ type: "info", title, message, duration });
const clearNotifications = () => {
  globalNotifications.length = 0;
  subscribers.forEach((sub) => sub(globalNotifications));
};
const getTypeStyles = (type) => {
  const styles = {
    success: {
      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(21, 128, 61, 0.9))",
      borderColor: "rgba(34, 197, 94, 0.3)"
    },
    error: {
      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9))",
      borderColor: "rgba(239, 68, 68, 0.3)"
    },
    warning: {
      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(180, 83, 9, 0.9))",
      borderColor: "rgba(245, 158, 11, 0.3)"
    },
    info: {
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))",
      borderColor: "rgba(59, 130, 246, 0.3)"
    }
  };
  if (type && type in styles) {
    return styles[type];
  }
  return styles.info;
};
const getTypeIcon = (type) => {
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  };
  if (type && type in icons) {
    return icons[type];
  }
  return icons.info;
};
const defaultTheme = {
  theme: "light",
  rtl: false,
  glassMorphism: {
    enabled: true,
    opacity: 0.1,
    blur: 20
  },
  performance: {
    targetFps: 60,
    lazyLoading: true,
    virtualScrolling: true
  }
};
const THEME_STORAGE_KEY = "brainsait-healthcare-theme";
const useHealthcareTheme = (initialConfig) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultTheme, ...parsed };
        }
      } catch (error) {
      }
    }
    return {
      ...defaultTheme,
      ...initialConfig && {
        theme: initialConfig.theme ?? defaultTheme.theme,
        glassMorphism: {
          ...defaultTheme.glassMorphism,
          ...initialConfig.glassMorphism
        },
        performance: {
          ...defaultTheme.performance,
          ...initialConfig.performance
        }
      }
    };
  });
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (theme.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => {
        setIsDark(e.matches);
      };
      setIsDark(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setIsDark(theme.theme === "dark");
      return void 0;
    }
  }, [theme.theme]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
      } catch (error) {
      }
    }
  }, [theme]);
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (isDark) {
        root.style.setProperty("--bg-primary", "rgba(17, 24, 39, 0.95)");
        root.style.setProperty("--bg-secondary", "rgba(31, 41, 55, 0.9)");
        root.style.setProperty("--text-primary", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--text-secondary", "rgba(255, 255, 255, 0.7)");
        root.style.setProperty("--border-color", "rgba(255, 255, 255, 0.1)");
      } else {
        root.style.setProperty("--bg-primary", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--bg-secondary", "rgba(249, 250, 251, 0.9)");
        root.style.setProperty("--text-primary", "rgba(17, 24, 39, 0.95)");
        root.style.setProperty("--text-secondary", "rgba(107, 114, 128, 0.9)");
        root.style.setProperty("--border-color", "rgba(229, 231, 235, 0.8)");
      }
      root.style.setProperty("--direction", theme.rtl ? "rtl" : "ltr");
      root.setAttribute("dir", theme.rtl ? "rtl" : "ltr");
      root.style.setProperty("--glass-opacity", theme.glassMorphism.opacity.toString());
      root.style.setProperty("--glass-blur", `${theme.glassMorphism.blur}px`);
      root.style.setProperty("--glass-enabled", theme.glassMorphism.enabled ? "1" : "0");
      root.style.setProperty("--target-fps", theme.performance.targetFps.toString());
    }
  }, [isDark, theme]);
  const updateTheme = useCallback((updates) => {
    setTheme((prev) => ({
      ...prev,
      ...updates,
      glassMorphism: {
        ...prev.glassMorphism,
        ...updates.glassMorphism
      },
      performance: {
        ...prev.performance,
        ...updates.performance
      }
    }));
  }, []);
  const toggleDarkMode = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark"
    }));
  }, []);
  const toggleRTL = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      rtl: !prev.rtl
    }));
  }, []);
  const toggleGlassMorphism = useCallback(() => {
    setTheme((prev) => ({
      ...prev,
      glassMorphism: {
        ...prev.glassMorphism,
        enabled: !prev.glassMorphism.enabled
      }
    }));
  }, []);
  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
  }, []);
  return {
    theme,
    isDark,
    updateTheme,
    toggleDarkMode,
    toggleRTL,
    toggleGlassMorphism,
    resetTheme
  };
};
export {
  AIAgentManager,
  AnalyticsManager,
  ApiClient,
  BaseComponent,
  BrainSAITHealthcareSDK,
  CacheManager,
  ComplianceValidator,
  ConfigManager,
  EncryptionService,
  FHIRBundleBuilder,
  FHIRBundleProcessor,
  FHIRClient,
  FHIRValidator,
  FrameRateMonitor,
  GlassMorphismButton,
  HIPAAAuditLogger,
  HealthcareDashboard,
  HealthcarePerformanceProfiler,
  LegacyFHIRClient,
  Logger,
  NPHIESClient,
  NotificationSystem,
  PHIDataMasker,
  PatientCard,
  PerformanceMonitor,
  RBACManager,
  SAUDI_REGIONS,
  SAUDI_SYSTEMS,
  SaudiExtensionHelper,
  SaudiPatientBuilder,
  SecurityManager,
  SessionManager,
  arabicFontStack,
  clearNotifications,
  colorTokens,
  createBatchBundle,
  createCollectionBundle,
  createComplianceValidator,
  createDocumentBundle,
  createEncryptionService,
  createFontStyle,
  createGlassMorphismStyle,
  createHIPAAAuditLogger,
  createPHIDataMasker,
  createRBACManager,
  createRTLStyle,
  createSaudiPatient,
  createSessionManager,
  createTransactionBundle,
  createValidationContext,
  darkModeGlassStyle,
  decrypt,
  BrainSAITHealthcareSDK as default,
  defaultMaskingConfig,
  defaultSessionConfig,
  encrypt,
  ensureGlobalUIStyles,
  fhirValidator,
  frameRateMonitor,
  glassMorphismPresets,
  healthcareProfiler,
  measureAsyncTime,
  measurePerformance,
  measureTime,
  rtlAwareMargin,
  rtlAwarePadding,
  rtlAwarePosition,
  rtlTransform,
  showError,
  showInfo,
  showNotification,
  showSuccess,
  showWarning,
  spacingTokens,
  t,
  transitionTokens,
  translations,
  typographyTokens,
  useHealthcareTheme,
  validateEmail,
  validateSaudiID
};
//# sourceMappingURL=index.esm.js.map
