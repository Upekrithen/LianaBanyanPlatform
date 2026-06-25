function K_(B) {
  return B && B.__esModule && Object.prototype.hasOwnProperty.call(B, "default") ? B.default : B;
}
var mE = { exports: {} }, Jp = {}, yE = { exports: {} }, yt = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ZR;
function J_() {
  if (ZR) return yt;
  ZR = 1;
  var B = Symbol.for("react.element"), X = Symbol.for("react.portal"), A = Symbol.for("react.fragment"), wt = Symbol.for("react.strict_mode"), pt = Symbol.for("react.profiler"), Ie = Symbol.for("react.provider"), S = Symbol.for("react.context"), jt = Symbol.for("react.forward_ref"), se = Symbol.for("react.suspense"), de = Symbol.for("react.memo"), Je = Symbol.for("react.lazy"), Z = Symbol.iterator;
  function Se(_) {
    return _ === null || typeof _ != "object" ? null : (_ = Z && _[Z] || _["@@iterator"], typeof _ == "function" ? _ : null);
  }
  var ie = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, je = Object.assign, Xe = {};
  function it(_, P, He) {
    this.props = _, this.context = P, this.refs = Xe, this.updater = He || ie;
  }
  it.prototype.isReactComponent = {}, it.prototype.setState = function(_, P) {
    if (typeof _ != "object" && typeof _ != "function" && _ != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, _, P, "setState");
  }, it.prototype.forceUpdate = function(_) {
    this.updater.enqueueForceUpdate(this, _, "forceUpdate");
  };
  function Kt() {
  }
  Kt.prototype = it.prototype;
  function vt(_, P, He) {
    this.props = _, this.context = P, this.refs = Xe, this.updater = He || ie;
  }
  var Qe = vt.prototype = new Kt();
  Qe.constructor = vt, je(Qe, it.prototype), Qe.isPureReactComponent = !0;
  var ht = Array.isArray, be = Object.prototype.hasOwnProperty, ct = { current: null }, Fe = { key: !0, ref: !0, __self: !0, __source: !0 };
  function an(_, P, He) {
    var ze, lt = {}, tt = null, Ze = null;
    if (P != null) for (ze in P.ref !== void 0 && (Ze = P.ref), P.key !== void 0 && (tt = "" + P.key), P) be.call(P, ze) && !Fe.hasOwnProperty(ze) && (lt[ze] = P[ze]);
    var nt = arguments.length - 2;
    if (nt === 1) lt.children = He;
    else if (1 < nt) {
      for (var ut = Array(nt), Vt = 0; Vt < nt; Vt++) ut[Vt] = arguments[Vt + 2];
      lt.children = ut;
    }
    if (_ && _.defaultProps) for (ze in nt = _.defaultProps, nt) lt[ze] === void 0 && (lt[ze] = nt[ze]);
    return { $$typeof: B, type: _, key: tt, ref: Ze, props: lt, _owner: ct.current };
  }
  function Ft(_, P) {
    return { $$typeof: B, type: _.type, key: P, ref: _.ref, props: _.props, _owner: _._owner };
  }
  function Jt(_) {
    return typeof _ == "object" && _ !== null && _.$$typeof === B;
  }
  function ln(_) {
    var P = { "=": "=0", ":": "=2" };
    return "$" + _.replace(/[=:]/g, function(He) {
      return P[He];
    });
  }
  var xt = /\/+/g;
  function ke(_, P) {
    return typeof _ == "object" && _ !== null && _.key != null ? ln("" + _.key) : P.toString(36);
  }
  function zt(_, P, He, ze, lt) {
    var tt = typeof _;
    (tt === "undefined" || tt === "boolean") && (_ = null);
    var Ze = !1;
    if (_ === null) Ze = !0;
    else switch (tt) {
      case "string":
      case "number":
        Ze = !0;
        break;
      case "object":
        switch (_.$$typeof) {
          case B:
          case X:
            Ze = !0;
        }
    }
    if (Ze) return Ze = _, lt = lt(Ze), _ = ze === "" ? "." + ke(Ze, 0) : ze, ht(lt) ? (He = "", _ != null && (He = _.replace(xt, "$&/") + "/"), zt(lt, P, He, "", function(Vt) {
      return Vt;
    })) : lt != null && (Jt(lt) && (lt = Ft(lt, He + (!lt.key || Ze && Ze.key === lt.key ? "" : ("" + lt.key).replace(xt, "$&/") + "/") + _)), P.push(lt)), 1;
    if (Ze = 0, ze = ze === "" ? "." : ze + ":", ht(_)) for (var nt = 0; nt < _.length; nt++) {
      tt = _[nt];
      var ut = ze + ke(tt, nt);
      Ze += zt(tt, P, He, ut, lt);
    }
    else if (ut = Se(_), typeof ut == "function") for (_ = ut.call(_), nt = 0; !(tt = _.next()).done; ) tt = tt.value, ut = ze + ke(tt, nt++), Ze += zt(tt, P, He, ut, lt);
    else if (tt === "object") throw P = String(_), Error("Objects are not valid as a React child (found: " + (P === "[object Object]" ? "object with keys {" + Object.keys(_).join(", ") + "}" : P) + "). If you meant to render a collection of children, use an array instead.");
    return Ze;
  }
  function bt(_, P, He) {
    if (_ == null) return _;
    var ze = [], lt = 0;
    return zt(_, ze, "", "", function(tt) {
      return P.call(He, tt, lt++);
    }), ze;
  }
  function Dt(_) {
    if (_._status === -1) {
      var P = _._result;
      P = P(), P.then(function(He) {
        (_._status === 0 || _._status === -1) && (_._status = 1, _._result = He);
      }, function(He) {
        (_._status === 0 || _._status === -1) && (_._status = 2, _._result = He);
      }), _._status === -1 && (_._status = 0, _._result = P);
    }
    if (_._status === 1) return _._result.default;
    throw _._result;
  }
  var Ce = { current: null }, J = { transition: null }, Re = { ReactCurrentDispatcher: Ce, ReactCurrentBatchConfig: J, ReactCurrentOwner: ct };
  function ne() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return yt.Children = { map: bt, forEach: function(_, P, He) {
    bt(_, function() {
      P.apply(this, arguments);
    }, He);
  }, count: function(_) {
    var P = 0;
    return bt(_, function() {
      P++;
    }), P;
  }, toArray: function(_) {
    return bt(_, function(P) {
      return P;
    }) || [];
  }, only: function(_) {
    if (!Jt(_)) throw Error("React.Children.only expected to receive a single React element child.");
    return _;
  } }, yt.Component = it, yt.Fragment = A, yt.Profiler = pt, yt.PureComponent = vt, yt.StrictMode = wt, yt.Suspense = se, yt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Re, yt.act = ne, yt.cloneElement = function(_, P, He) {
    if (_ == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + _ + ".");
    var ze = je({}, _.props), lt = _.key, tt = _.ref, Ze = _._owner;
    if (P != null) {
      if (P.ref !== void 0 && (tt = P.ref, Ze = ct.current), P.key !== void 0 && (lt = "" + P.key), _.type && _.type.defaultProps) var nt = _.type.defaultProps;
      for (ut in P) be.call(P, ut) && !Fe.hasOwnProperty(ut) && (ze[ut] = P[ut] === void 0 && nt !== void 0 ? nt[ut] : P[ut]);
    }
    var ut = arguments.length - 2;
    if (ut === 1) ze.children = He;
    else if (1 < ut) {
      nt = Array(ut);
      for (var Vt = 0; Vt < ut; Vt++) nt[Vt] = arguments[Vt + 2];
      ze.children = nt;
    }
    return { $$typeof: B, type: _.type, key: lt, ref: tt, props: ze, _owner: Ze };
  }, yt.createContext = function(_) {
    return _ = { $$typeof: S, _currentValue: _, _currentValue2: _, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, _.Provider = { $$typeof: Ie, _context: _ }, _.Consumer = _;
  }, yt.createElement = an, yt.createFactory = function(_) {
    var P = an.bind(null, _);
    return P.type = _, P;
  }, yt.createRef = function() {
    return { current: null };
  }, yt.forwardRef = function(_) {
    return { $$typeof: jt, render: _ };
  }, yt.isValidElement = Jt, yt.lazy = function(_) {
    return { $$typeof: Je, _payload: { _status: -1, _result: _ }, _init: Dt };
  }, yt.memo = function(_, P) {
    return { $$typeof: de, type: _, compare: P === void 0 ? null : P };
  }, yt.startTransition = function(_) {
    var P = J.transition;
    J.transition = {};
    try {
      _();
    } finally {
      J.transition = P;
    }
  }, yt.unstable_act = ne, yt.useCallback = function(_, P) {
    return Ce.current.useCallback(_, P);
  }, yt.useContext = function(_) {
    return Ce.current.useContext(_);
  }, yt.useDebugValue = function() {
  }, yt.useDeferredValue = function(_) {
    return Ce.current.useDeferredValue(_);
  }, yt.useEffect = function(_, P) {
    return Ce.current.useEffect(_, P);
  }, yt.useId = function() {
    return Ce.current.useId();
  }, yt.useImperativeHandle = function(_, P, He) {
    return Ce.current.useImperativeHandle(_, P, He);
  }, yt.useInsertionEffect = function(_, P) {
    return Ce.current.useInsertionEffect(_, P);
  }, yt.useLayoutEffect = function(_, P) {
    return Ce.current.useLayoutEffect(_, P);
  }, yt.useMemo = function(_, P) {
    return Ce.current.useMemo(_, P);
  }, yt.useReducer = function(_, P, He) {
    return Ce.current.useReducer(_, P, He);
  }, yt.useRef = function(_) {
    return Ce.current.useRef(_);
  }, yt.useState = function(_) {
    return Ce.current.useState(_);
  }, yt.useSyncExternalStore = function(_, P, He) {
    return Ce.current.useSyncExternalStore(_, P, He);
  }, yt.useTransition = function() {
    return Ce.current.useTransition();
  }, yt.version = "18.3.1", yt;
}
var tv = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
tv.exports;
var eT;
function Z_() {
  return eT || (eT = 1, function(B, X) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var A = "18.3.1", wt = Symbol.for("react.element"), pt = Symbol.for("react.portal"), Ie = Symbol.for("react.fragment"), S = Symbol.for("react.strict_mode"), jt = Symbol.for("react.profiler"), se = Symbol.for("react.provider"), de = Symbol.for("react.context"), Je = Symbol.for("react.forward_ref"), Z = Symbol.for("react.suspense"), Se = Symbol.for("react.suspense_list"), ie = Symbol.for("react.memo"), je = Symbol.for("react.lazy"), Xe = Symbol.for("react.offscreen"), it = Symbol.iterator, Kt = "@@iterator";
      function vt(h) {
        if (h === null || typeof h != "object")
          return null;
        var C = it && h[it] || h[Kt];
        return typeof C == "function" ? C : null;
      }
      var Qe = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, ht = {
        transition: null
      }, be = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, ct = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, Fe = {}, an = null;
      function Ft(h) {
        an = h;
      }
      Fe.setExtraStackFrame = function(h) {
        an = h;
      }, Fe.getCurrentStack = null, Fe.getStackAddendum = function() {
        var h = "";
        an && (h += an);
        var C = Fe.getCurrentStack;
        return C && (h += C() || ""), h;
      };
      var Jt = !1, ln = !1, xt = !1, ke = !1, zt = !1, bt = {
        ReactCurrentDispatcher: Qe,
        ReactCurrentBatchConfig: ht,
        ReactCurrentOwner: ct
      };
      bt.ReactDebugCurrentFrame = Fe, bt.ReactCurrentActQueue = be;
      function Dt(h) {
        {
          for (var C = arguments.length, N = new Array(C > 1 ? C - 1 : 0), j = 1; j < C; j++)
            N[j - 1] = arguments[j];
          J("warn", h, N);
        }
      }
      function Ce(h) {
        {
          for (var C = arguments.length, N = new Array(C > 1 ? C - 1 : 0), j = 1; j < C; j++)
            N[j - 1] = arguments[j];
          J("error", h, N);
        }
      }
      function J(h, C, N) {
        {
          var j = bt.ReactDebugCurrentFrame, K = j.getStackAddendum();
          K !== "" && (C += "%s", N = N.concat([K]));
          var Oe = N.map(function(re) {
            return String(re);
          });
          Oe.unshift("Warning: " + C), Function.prototype.apply.call(console[h], console, Oe);
        }
      }
      var Re = {};
      function ne(h, C) {
        {
          var N = h.constructor, j = N && (N.displayName || N.name) || "ReactClass", K = j + "." + C;
          if (Re[K])
            return;
          Ce("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", C, j), Re[K] = !0;
        }
      }
      var _ = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(h) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(h, C, N) {
          ne(h, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(h, C, N, j) {
          ne(h, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(h, C, N, j) {
          ne(h, "setState");
        }
      }, P = Object.assign, He = {};
      Object.freeze(He);
      function ze(h, C, N) {
        this.props = h, this.context = C, this.refs = He, this.updater = N || _;
      }
      ze.prototype.isReactComponent = {}, ze.prototype.setState = function(h, C) {
        if (typeof h != "object" && typeof h != "function" && h != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, h, C, "setState");
      }, ze.prototype.forceUpdate = function(h) {
        this.updater.enqueueForceUpdate(this, h, "forceUpdate");
      };
      {
        var lt = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, tt = function(h, C) {
          Object.defineProperty(ze.prototype, h, {
            get: function() {
              Dt("%s(...) is deprecated in plain JavaScript React classes. %s", C[0], C[1]);
            }
          });
        };
        for (var Ze in lt)
          lt.hasOwnProperty(Ze) && tt(Ze, lt[Ze]);
      }
      function nt() {
      }
      nt.prototype = ze.prototype;
      function ut(h, C, N) {
        this.props = h, this.context = C, this.refs = He, this.updater = N || _;
      }
      var Vt = ut.prototype = new nt();
      Vt.constructor = ut, P(Vt, ze.prototype), Vt.isPureReactComponent = !0;
      function kn() {
        var h = {
          current: null
        };
        return Object.seal(h), h;
      }
      var wr = Array.isArray;
      function En(h) {
        return wr(h);
      }
      function tr(h) {
        {
          var C = typeof Symbol == "function" && Symbol.toStringTag, N = C && h[Symbol.toStringTag] || h.constructor.name || "Object";
          return N;
        }
      }
      function Pn(h) {
        try {
          return Vn(h), !1;
        } catch {
          return !0;
        }
      }
      function Vn(h) {
        return "" + h;
      }
      function Yr(h) {
        if (Pn(h))
          return Ce("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", tr(h)), Vn(h);
      }
      function si(h, C, N) {
        var j = h.displayName;
        if (j)
          return j;
        var K = C.displayName || C.name || "";
        return K !== "" ? N + "(" + K + ")" : N;
      }
      function oa(h) {
        return h.displayName || "Context";
      }
      function Gn(h) {
        if (h == null)
          return null;
        if (typeof h.tag == "number" && Ce("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof h == "function")
          return h.displayName || h.name || null;
        if (typeof h == "string")
          return h;
        switch (h) {
          case Ie:
            return "Fragment";
          case pt:
            return "Portal";
          case jt:
            return "Profiler";
          case S:
            return "StrictMode";
          case Z:
            return "Suspense";
          case Se:
            return "SuspenseList";
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case de:
              var C = h;
              return oa(C) + ".Consumer";
            case se:
              var N = h;
              return oa(N._context) + ".Provider";
            case Je:
              return si(h, h.render, "ForwardRef");
            case ie:
              var j = h.displayName || null;
              return j !== null ? j : Gn(h.type) || "Memo";
            case je: {
              var K = h, Oe = K._payload, re = K._init;
              try {
                return Gn(re(Oe));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var Cn = Object.prototype.hasOwnProperty, Bn = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, yr, Ya, On;
      On = {};
      function gr(h) {
        if (Cn.call(h, "ref")) {
          var C = Object.getOwnPropertyDescriptor(h, "ref").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.ref !== void 0;
      }
      function sa(h) {
        if (Cn.call(h, "key")) {
          var C = Object.getOwnPropertyDescriptor(h, "key").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.key !== void 0;
      }
      function Ia(h, C) {
        var N = function() {
          yr || (yr = !0, Ce("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        N.isReactWarning = !0, Object.defineProperty(h, "key", {
          get: N,
          configurable: !0
        });
      }
      function ci(h, C) {
        var N = function() {
          Ya || (Ya = !0, Ce("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        N.isReactWarning = !0, Object.defineProperty(h, "ref", {
          get: N,
          configurable: !0
        });
      }
      function ee(h) {
        if (typeof h.ref == "string" && ct.current && h.__self && ct.current.stateNode !== h.__self) {
          var C = Gn(ct.current.type);
          On[C] || (Ce('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', C, h.ref), On[C] = !0);
        }
      }
      var Te = function(h, C, N, j, K, Oe, re) {
        var Ne = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: wt,
          // Built-in properties that belong on the element
          type: h,
          key: C,
          ref: N,
          props: re,
          // Record the component responsible for creating this element.
          _owner: Oe
        };
        return Ne._store = {}, Object.defineProperty(Ne._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(Ne, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: j
        }), Object.defineProperty(Ne, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: K
        }), Object.freeze && (Object.freeze(Ne.props), Object.freeze(Ne)), Ne;
      };
      function rt(h, C, N) {
        var j, K = {}, Oe = null, re = null, Ne = null, dt = null;
        if (C != null) {
          gr(C) && (re = C.ref, ee(C)), sa(C) && (Yr(C.key), Oe = "" + C.key), Ne = C.__self === void 0 ? null : C.__self, dt = C.__source === void 0 ? null : C.__source;
          for (j in C)
            Cn.call(C, j) && !Bn.hasOwnProperty(j) && (K[j] = C[j]);
        }
        var Tt = arguments.length - 2;
        if (Tt === 1)
          K.children = N;
        else if (Tt > 1) {
          for (var nn = Array(Tt), It = 0; It < Tt; It++)
            nn[It] = arguments[It + 2];
          Object.freeze && Object.freeze(nn), K.children = nn;
        }
        if (h && h.defaultProps) {
          var at = h.defaultProps;
          for (j in at)
            K[j] === void 0 && (K[j] = at[j]);
        }
        if (Oe || re) {
          var Qt = typeof h == "function" ? h.displayName || h.name || "Unknown" : h;
          Oe && Ia(K, Qt), re && ci(K, Qt);
        }
        return Te(h, Oe, re, Ne, dt, ct.current, K);
      }
      function At(h, C) {
        var N = Te(h.type, C, h.ref, h._self, h._source, h._owner, h.props);
        return N;
      }
      function Zt(h, C, N) {
        if (h == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + h + ".");
        var j, K = P({}, h.props), Oe = h.key, re = h.ref, Ne = h._self, dt = h._source, Tt = h._owner;
        if (C != null) {
          gr(C) && (re = C.ref, Tt = ct.current), sa(C) && (Yr(C.key), Oe = "" + C.key);
          var nn;
          h.type && h.type.defaultProps && (nn = h.type.defaultProps);
          for (j in C)
            Cn.call(C, j) && !Bn.hasOwnProperty(j) && (C[j] === void 0 && nn !== void 0 ? K[j] = nn[j] : K[j] = C[j]);
        }
        var It = arguments.length - 2;
        if (It === 1)
          K.children = N;
        else if (It > 1) {
          for (var at = Array(It), Qt = 0; Qt < It; Qt++)
            at[Qt] = arguments[Qt + 2];
          K.children = at;
        }
        return Te(h.type, Oe, re, Ne, dt, Tt, K);
      }
      function pn(h) {
        return typeof h == "object" && h !== null && h.$$typeof === wt;
      }
      var un = ".", qn = ":";
      function en(h) {
        var C = /[=:]/g, N = {
          "=": "=0",
          ":": "=2"
        }, j = h.replace(C, function(K) {
          return N[K];
        });
        return "$" + j;
      }
      var Bt = !1, $t = /\/+/g;
      function ca(h) {
        return h.replace($t, "$&/");
      }
      function Sr(h, C) {
        return typeof h == "object" && h !== null && h.key != null ? (Yr(h.key), en("" + h.key)) : C.toString(36);
      }
      function Ta(h, C, N, j, K) {
        var Oe = typeof h;
        (Oe === "undefined" || Oe === "boolean") && (h = null);
        var re = !1;
        if (h === null)
          re = !0;
        else
          switch (Oe) {
            case "string":
            case "number":
              re = !0;
              break;
            case "object":
              switch (h.$$typeof) {
                case wt:
                case pt:
                  re = !0;
              }
          }
        if (re) {
          var Ne = h, dt = K(Ne), Tt = j === "" ? un + Sr(Ne, 0) : j;
          if (En(dt)) {
            var nn = "";
            Tt != null && (nn = ca(Tt) + "/"), Ta(dt, C, nn, "", function(Xf) {
              return Xf;
            });
          } else dt != null && (pn(dt) && (dt.key && (!Ne || Ne.key !== dt.key) && Yr(dt.key), dt = At(
            dt,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            N + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            (dt.key && (!Ne || Ne.key !== dt.key) ? (
              // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
              // eslint-disable-next-line react-internal/safe-string-coercion
              ca("" + dt.key) + "/"
            ) : "") + Tt
          )), C.push(dt));
          return 1;
        }
        var It, at, Qt = 0, vn = j === "" ? un : j + qn;
        if (En(h))
          for (var Cl = 0; Cl < h.length; Cl++)
            It = h[Cl], at = vn + Sr(It, Cl), Qt += Ta(It, C, N, at, K);
        else {
          var Xo = vt(h);
          if (typeof Xo == "function") {
            var Vi = h;
            Xo === Vi.entries && (Bt || Dt("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Bt = !0);
            for (var Ko = Xo.call(Vi), uu, qf = 0; !(uu = Ko.next()).done; )
              It = uu.value, at = vn + Sr(It, qf++), Qt += Ta(It, C, N, at, K);
          } else if (Oe === "object") {
            var sc = String(h);
            throw new Error("Objects are not valid as a React child (found: " + (sc === "[object Object]" ? "object with keys {" + Object.keys(h).join(", ") + "}" : sc) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return Qt;
      }
      function Fi(h, C, N) {
        if (h == null)
          return h;
        var j = [], K = 0;
        return Ta(h, j, "", "", function(Oe) {
          return C.call(N, Oe, K++);
        }), j;
      }
      function Jl(h) {
        var C = 0;
        return Fi(h, function() {
          C++;
        }), C;
      }
      function Zl(h, C, N) {
        Fi(h, function() {
          C.apply(this, arguments);
        }, N);
      }
      function dl(h) {
        return Fi(h, function(C) {
          return C;
        }) || [];
      }
      function pl(h) {
        if (!pn(h))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return h;
      }
      function eu(h) {
        var C = {
          $$typeof: de,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: h,
          _currentValue2: h,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        C.Provider = {
          $$typeof: se,
          _context: C
        };
        var N = !1, j = !1, K = !1;
        {
          var Oe = {
            $$typeof: de,
            _context: C
          };
          Object.defineProperties(Oe, {
            Provider: {
              get: function() {
                return j || (j = !0, Ce("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), C.Provider;
              },
              set: function(re) {
                C.Provider = re;
              }
            },
            _currentValue: {
              get: function() {
                return C._currentValue;
              },
              set: function(re) {
                C._currentValue = re;
              }
            },
            _currentValue2: {
              get: function() {
                return C._currentValue2;
              },
              set: function(re) {
                C._currentValue2 = re;
              }
            },
            _threadCount: {
              get: function() {
                return C._threadCount;
              },
              set: function(re) {
                C._threadCount = re;
              }
            },
            Consumer: {
              get: function() {
                return N || (N = !0, Ce("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), C.Consumer;
              }
            },
            displayName: {
              get: function() {
                return C.displayName;
              },
              set: function(re) {
                K || (Dt("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", re), K = !0);
              }
            }
          }), C.Consumer = Oe;
        }
        return C._currentRenderer = null, C._currentRenderer2 = null, C;
      }
      var xr = -1, br = 0, nr = 1, fi = 2;
      function Qa(h) {
        if (h._status === xr) {
          var C = h._result, N = C();
          if (N.then(function(Oe) {
            if (h._status === br || h._status === xr) {
              var re = h;
              re._status = nr, re._result = Oe;
            }
          }, function(Oe) {
            if (h._status === br || h._status === xr) {
              var re = h;
              re._status = fi, re._result = Oe;
            }
          }), h._status === xr) {
            var j = h;
            j._status = br, j._result = N;
          }
        }
        if (h._status === nr) {
          var K = h._result;
          return K === void 0 && Ce(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like:
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, K), "default" in K || Ce(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like:
  const MyComponent = lazy(() => import('./MyComponent'))`, K), K.default;
        } else
          throw h._result;
      }
      function di(h) {
        var C = {
          // We use these fields to store the result.
          _status: xr,
          _result: h
        }, N = {
          $$typeof: je,
          _payload: C,
          _init: Qa
        };
        {
          var j, K;
          Object.defineProperties(N, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return j;
              },
              set: function(Oe) {
                Ce("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), j = Oe, Object.defineProperty(N, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return K;
              },
              set: function(Oe) {
                Ce("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), K = Oe, Object.defineProperty(N, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return N;
      }
      function pi(h) {
        h != null && h.$$typeof === ie ? Ce("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof h != "function" ? Ce("forwardRef requires a render function but was given %s.", h === null ? "null" : typeof h) : h.length !== 0 && h.length !== 2 && Ce("forwardRef render functions accept exactly two parameters: props and ref. %s", h.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), h != null && (h.defaultProps != null || h.propTypes != null) && Ce("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var C = {
          $$typeof: Je,
          render: h
        };
        {
          var N;
          Object.defineProperty(C, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return N;
            },
            set: function(j) {
              N = j, !h.name && !h.displayName && (h.displayName = j);
            }
          });
        }
        return C;
      }
      var R;
      R = Symbol.for("react.module.reference");
      function $(h) {
        return !!(typeof h == "string" || typeof h == "function" || h === Ie || h === jt || zt || h === S || h === Z || h === Se || ke || h === Xe || Jt || ln || xt || typeof h == "object" && h !== null && (h.$$typeof === je || h.$$typeof === ie || h.$$typeof === se || h.$$typeof === de || h.$$typeof === Je || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        h.$$typeof === R || h.getModuleId !== void 0));
      }
      function ae(h, C) {
        $(h) || Ce("memo: The first argument must be a component. Instead received: %s", h === null ? "null" : typeof h);
        var N = {
          $$typeof: ie,
          type: h,
          compare: C === void 0 ? null : C
        };
        {
          var j;
          Object.defineProperty(N, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return j;
            },
            set: function(K) {
              j = K, !h.name && !h.displayName && (h.displayName = K);
            }
          });
        }
        return N;
      }
      function he() {
        var h = Qe.current;
        return h === null && Ce(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), h;
      }
      function Ge(h) {
        var C = he();
        if (h._context !== void 0) {
          var N = h._context;
          N.Consumer === h ? Ce("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : N.Provider === h && Ce("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return C.useContext(h);
      }
      function $e(h) {
        var C = he();
        return C.useState(h);
      }
      function ft(h, C, N) {
        var j = he();
        return j.useReducer(h, C, N);
      }
      function ot(h) {
        var C = he();
        return C.useRef(h);
      }
      function Rn(h, C) {
        var N = he();
        return N.useEffect(h, C);
      }
      function tn(h, C) {
        var N = he();
        return N.useInsertionEffect(h, C);
      }
      function on(h, C) {
        var N = he();
        return N.useLayoutEffect(h, C);
      }
      function rr(h, C) {
        var N = he();
        return N.useCallback(h, C);
      }
      function Wa(h, C) {
        var N = he();
        return N.useMemo(h, C);
      }
      function Ga(h, C, N) {
        var j = he();
        return j.useImperativeHandle(h, C, N);
      }
      function qe(h, C) {
        {
          var N = he();
          return N.useDebugValue(h, C);
        }
      }
      function et() {
        var h = he();
        return h.useTransition();
      }
      function qa(h) {
        var C = he();
        return C.useDeferredValue(h);
      }
      function tu() {
        var h = he();
        return h.useId();
      }
      function nu(h, C, N) {
        var j = he();
        return j.useSyncExternalStore(h, C, N);
      }
      var vl = 0, Wu, hl, Ir, Qo, _r, uc, oc;
      function Gu() {
      }
      Gu.__reactDisabledLog = !0;
      function ml() {
        {
          if (vl === 0) {
            Wu = console.log, hl = console.info, Ir = console.warn, Qo = console.error, _r = console.group, uc = console.groupCollapsed, oc = console.groupEnd;
            var h = {
              configurable: !0,
              enumerable: !0,
              value: Gu,
              writable: !0
            };
            Object.defineProperties(console, {
              info: h,
              log: h,
              warn: h,
              error: h,
              group: h,
              groupCollapsed: h,
              groupEnd: h
            });
          }
          vl++;
        }
      }
      function fa() {
        {
          if (vl--, vl === 0) {
            var h = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: P({}, h, {
                value: Wu
              }),
              info: P({}, h, {
                value: hl
              }),
              warn: P({}, h, {
                value: Ir
              }),
              error: P({}, h, {
                value: Qo
              }),
              group: P({}, h, {
                value: _r
              }),
              groupCollapsed: P({}, h, {
                value: uc
              }),
              groupEnd: P({}, h, {
                value: oc
              })
            });
          }
          vl < 0 && Ce("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var Xa = bt.ReactCurrentDispatcher, Ka;
      function qu(h, C, N) {
        {
          if (Ka === void 0)
            try {
              throw Error();
            } catch (K) {
              var j = K.stack.trim().match(/\n( *(at )?)/);
              Ka = j && j[1] || "";
            }
          return `
` + Ka + h;
        }
      }
      var ru = !1, yl;
      {
        var Xu = typeof WeakMap == "function" ? WeakMap : Map;
        yl = new Xu();
      }
      function Ku(h, C) {
        if (!h || ru)
          return "";
        {
          var N = yl.get(h);
          if (N !== void 0)
            return N;
        }
        var j;
        ru = !0;
        var K = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var Oe;
        Oe = Xa.current, Xa.current = null, ml();
        try {
          if (C) {
            var re = function() {
              throw Error();
            };
            if (Object.defineProperty(re.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(re, []);
              } catch (vn) {
                j = vn;
              }
              Reflect.construct(h, [], re);
            } else {
              try {
                re.call();
              } catch (vn) {
                j = vn;
              }
              h.call(re.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (vn) {
              j = vn;
            }
            h();
          }
        } catch (vn) {
          if (vn && j && typeof vn.stack == "string") {
            for (var Ne = vn.stack.split(`
`), dt = j.stack.split(`
`), Tt = Ne.length - 1, nn = dt.length - 1; Tt >= 1 && nn >= 0 && Ne[Tt] !== dt[nn]; )
              nn--;
            for (; Tt >= 1 && nn >= 0; Tt--, nn--)
              if (Ne[Tt] !== dt[nn]) {
                if (Tt !== 1 || nn !== 1)
                  do
                    if (Tt--, nn--, nn < 0 || Ne[Tt] !== dt[nn]) {
                      var It = `
` + Ne[Tt].replace(" at new ", " at ");
                      return h.displayName && It.includes("<anonymous>") && (It = It.replace("<anonymous>", h.displayName)), typeof h == "function" && yl.set(h, It), It;
                    }
                  while (Tt >= 1 && nn >= 0);
                break;
              }
          }
        } finally {
          ru = !1, Xa.current = Oe, fa(), Error.prepareStackTrace = K;
        }
        var at = h ? h.displayName || h.name : "", Qt = at ? qu(at) : "";
        return typeof h == "function" && yl.set(h, Qt), Qt;
      }
      function Hi(h, C, N) {
        return Ku(h, !1);
      }
      function Wf(h) {
        var C = h.prototype;
        return !!(C && C.isReactComponent);
      }
      function Pi(h, C, N) {
        if (h == null)
          return "";
        if (typeof h == "function")
          return Ku(h, Wf(h));
        if (typeof h == "string")
          return qu(h);
        switch (h) {
          case Z:
            return qu("Suspense");
          case Se:
            return qu("SuspenseList");
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case Je:
              return Hi(h.render);
            case ie:
              return Pi(h.type, C, N);
            case je: {
              var j = h, K = j._payload, Oe = j._init;
              try {
                return Pi(Oe(K), C, N);
              } catch {
              }
            }
          }
        return "";
      }
      var kt = {}, Ju = bt.ReactDebugCurrentFrame;
      function Rt(h) {
        if (h) {
          var C = h._owner, N = Pi(h.type, h._source, C ? C.type : null);
          Ju.setExtraStackFrame(N);
        } else
          Ju.setExtraStackFrame(null);
      }
      function Wo(h, C, N, j, K) {
        {
          var Oe = Function.call.bind(Cn);
          for (var re in h)
            if (Oe(h, re)) {
              var Ne = void 0;
              try {
                if (typeof h[re] != "function") {
                  var dt = Error((j || "React class") + ": " + N + " type `" + re + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof h[re] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw dt.name = "Invariant Violation", dt;
                }
                Ne = h[re](C, re, j, N, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (Tt) {
                Ne = Tt;
              }
              Ne && !(Ne instanceof Error) && (Rt(K), Ce("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", j || "React class", N, re, typeof Ne), Rt(null)), Ne instanceof Error && !(Ne.message in kt) && (kt[Ne.message] = !0, Rt(K), Ce("Failed %s type: %s", N, Ne.message), Rt(null));
            }
        }
      }
      function vi(h) {
        if (h) {
          var C = h._owner, N = Pi(h.type, h._source, C ? C.type : null);
          Ft(N);
        } else
          Ft(null);
      }
      var Be;
      Be = !1;
      function Zu() {
        if (ct.current) {
          var h = Gn(ct.current.type);
          if (h)
            return `

Check the render method of \`` + h + "`.";
        }
        return "";
      }
      function ar(h) {
        if (h !== void 0) {
          var C = h.fileName.replace(/^.*[\\\/]/, ""), N = h.lineNumber;
          return `

Check your code at ` + C + ":" + N + ".";
        }
        return "";
      }
      function hi(h) {
        return h != null ? ar(h.__source) : "";
      }
      var Dr = {};
      function mi(h) {
        var C = Zu();
        if (!C) {
          var N = typeof h == "string" ? h : h.displayName || h.name;
          N && (C = `

Check the top-level render call using <` + N + ">.");
        }
        return C;
      }
      function sn(h, C) {
        if (!(!h._store || h._store.validated || h.key != null)) {
          h._store.validated = !0;
          var N = mi(C);
          if (!Dr[N]) {
            Dr[N] = !0;
            var j = "";
            h && h._owner && h._owner !== ct.current && (j = " It was passed a child from " + Gn(h._owner.type) + "."), vi(h), Ce('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', N, j), vi(null);
          }
        }
      }
      function Yt(h, C) {
        if (typeof h == "object") {
          if (En(h))
            for (var N = 0; N < h.length; N++) {
              var j = h[N];
              pn(j) && sn(j, C);
            }
          else if (pn(h))
            h._store && (h._store.validated = !0);
          else if (h) {
            var K = vt(h);
            if (typeof K == "function" && K !== h.entries)
              for (var Oe = K.call(h), re; !(re = Oe.next()).done; )
                pn(re.value) && sn(re.value, C);
          }
        }
      }
      function gl(h) {
        {
          var C = h.type;
          if (C == null || typeof C == "string")
            return;
          var N;
          if (typeof C == "function")
            N = C.propTypes;
          else if (typeof C == "object" && (C.$$typeof === Je || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          C.$$typeof === ie))
            N = C.propTypes;
          else
            return;
          if (N) {
            var j = Gn(C);
            Wo(N, h.props, "prop", j, h);
          } else if (C.PropTypes !== void 0 && !Be) {
            Be = !0;
            var K = Gn(C);
            Ce("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", K || "Unknown");
          }
          typeof C.getDefaultProps == "function" && !C.getDefaultProps.isReactClassApproved && Ce("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function $n(h) {
        {
          for (var C = Object.keys(h.props), N = 0; N < C.length; N++) {
            var j = C[N];
            if (j !== "children" && j !== "key") {
              vi(h), Ce("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", j), vi(null);
              break;
            }
          }
          h.ref !== null && (vi(h), Ce("Invalid attribute `ref` supplied to `React.Fragment`."), vi(null));
        }
      }
      function kr(h, C, N) {
        var j = $(h);
        if (!j) {
          var K = "";
          (h === void 0 || typeof h == "object" && h !== null && Object.keys(h).length === 0) && (K += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Oe = hi(C);
          Oe ? K += Oe : K += Zu();
          var re;
          h === null ? re = "null" : En(h) ? re = "array" : h !== void 0 && h.$$typeof === wt ? (re = "<" + (Gn(h.type) || "Unknown") + " />", K = " Did you accidentally export a JSX literal instead of a component?") : re = typeof h, Ce("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", re, K);
        }
        var Ne = rt.apply(this, arguments);
        if (Ne == null)
          return Ne;
        if (j)
          for (var dt = 2; dt < arguments.length; dt++)
            Yt(arguments[dt], h);
        return h === Ie ? $n(Ne) : gl(Ne), Ne;
      }
      var wa = !1;
      function au(h) {
        var C = kr.bind(null, h);
        return C.type = h, wa || (wa = !0, Dt("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(C, "type", {
          enumerable: !1,
          get: function() {
            return Dt("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: h
            }), h;
          }
        }), C;
      }
      function Go(h, C, N) {
        for (var j = Zt.apply(this, arguments), K = 2; K < arguments.length; K++)
          Yt(arguments[K], j.type);
        return gl(j), j;
      }
      function qo(h, C) {
        var N = ht.transition;
        ht.transition = {};
        var j = ht.transition;
        ht.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          h();
        } finally {
          if (ht.transition = N, N === null && j._updatedFibers) {
            var K = j._updatedFibers.size;
            K > 10 && Dt("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), j._updatedFibers.clear();
          }
        }
      }
      var Sl = !1, iu = null;
      function Gf(h) {
        if (iu === null)
          try {
            var C = ("require" + Math.random()).slice(0, 7), N = B && B[C];
            iu = N.call(B, "timers").setImmediate;
          } catch {
            iu = function(K) {
              Sl === !1 && (Sl = !0, typeof MessageChannel > "u" && Ce("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var Oe = new MessageChannel();
              Oe.port1.onmessage = K, Oe.port2.postMessage(void 0);
            };
          }
        return iu(h);
      }
      var xa = 0, Ja = !1;
      function yi(h) {
        {
          var C = xa;
          xa++, be.current === null && (be.current = []);
          var N = be.isBatchingLegacy, j;
          try {
            if (be.isBatchingLegacy = !0, j = h(), !N && be.didScheduleLegacyUpdate) {
              var K = be.current;
              K !== null && (be.didScheduleLegacyUpdate = !1, El(K));
            }
          } catch (at) {
            throw ba(C), at;
          } finally {
            be.isBatchingLegacy = N;
          }
          if (j !== null && typeof j == "object" && typeof j.then == "function") {
            var Oe = j, re = !1, Ne = {
              then: function(at, Qt) {
                re = !0, Oe.then(function(vn) {
                  ba(C), xa === 0 ? eo(vn, at, Qt) : at(vn);
                }, function(vn) {
                  ba(C), Qt(vn);
                });
              }
            };
            return !Ja && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              re || (Ja = !0, Ce("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), Ne;
          } else {
            var dt = j;
            if (ba(C), xa === 0) {
              var Tt = be.current;
              Tt !== null && (El(Tt), be.current = null);
              var nn = {
                then: function(at, Qt) {
                  be.current === null ? (be.current = [], eo(dt, at, Qt)) : at(dt);
                }
              };
              return nn;
            } else {
              var It = {
                then: function(at, Qt) {
                  at(dt);
                }
              };
              return It;
            }
          }
        }
      }
      function ba(h) {
        h !== xa - 1 && Ce("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), xa = h;
      }
      function eo(h, C, N) {
        {
          var j = be.current;
          if (j !== null)
            try {
              El(j), Gf(function() {
                j.length === 0 ? (be.current = null, C(h)) : eo(h, C, N);
              });
            } catch (K) {
              N(K);
            }
          else
            C(h);
        }
      }
      var to = !1;
      function El(h) {
        if (!to) {
          to = !0;
          var C = 0;
          try {
            for (; C < h.length; C++) {
              var N = h[C];
              do
                N = N(!0);
              while (N !== null);
            }
            h.length = 0;
          } catch (j) {
            throw h = h.slice(C + 1), j;
          } finally {
            to = !1;
          }
        }
      }
      var lu = kr, no = Go, ro = au, Za = {
        map: Fi,
        forEach: Zl,
        count: Jl,
        toArray: dl,
        only: pl
      };
      X.Children = Za, X.Component = ze, X.Fragment = Ie, X.Profiler = jt, X.PureComponent = ut, X.StrictMode = S, X.Suspense = Z, X.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = bt, X.act = yi, X.cloneElement = no, X.createContext = eu, X.createElement = lu, X.createFactory = ro, X.createRef = kn, X.forwardRef = pi, X.isValidElement = pn, X.lazy = di, X.memo = ae, X.startTransition = qo, X.unstable_act = yi, X.useCallback = rr, X.useContext = Ge, X.useDebugValue = qe, X.useDeferredValue = qa, X.useEffect = Rn, X.useId = tu, X.useImperativeHandle = Ga, X.useInsertionEffect = tn, X.useLayoutEffect = on, X.useMemo = Wa, X.useReducer = ft, X.useRef = ot, X.useState = $e, X.useSyncExternalStore = nu, X.useTransition = et, X.version = A, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(tv, tv.exports)), tv.exports;
}
process.env.NODE_ENV === "production" ? yE.exports = J_() : yE.exports = Z_();
var rv = yE.exports;
const Km = /* @__PURE__ */ K_(rv);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var tT;
function eD() {
  if (tT) return Jp;
  tT = 1;
  var B = rv, X = Symbol.for("react.element"), A = Symbol.for("react.fragment"), wt = Object.prototype.hasOwnProperty, pt = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Ie = { key: !0, ref: !0, __self: !0, __source: !0 };
  function S(jt, se, de) {
    var Je, Z = {}, Se = null, ie = null;
    de !== void 0 && (Se = "" + de), se.key !== void 0 && (Se = "" + se.key), se.ref !== void 0 && (ie = se.ref);
    for (Je in se) wt.call(se, Je) && !Ie.hasOwnProperty(Je) && (Z[Je] = se[Je]);
    if (jt && jt.defaultProps) for (Je in se = jt.defaultProps, se) Z[Je] === void 0 && (Z[Je] = se[Je]);
    return { $$typeof: X, type: jt, key: Se, ref: ie, props: Z, _owner: pt.current };
  }
  return Jp.Fragment = A, Jp.jsx = S, Jp.jsxs = S, Jp;
}
var Zp = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nT;
function tD() {
  return nT || (nT = 1, process.env.NODE_ENV !== "production" && function() {
    var B = rv, X = Symbol.for("react.element"), A = Symbol.for("react.portal"), wt = Symbol.for("react.fragment"), pt = Symbol.for("react.strict_mode"), Ie = Symbol.for("react.profiler"), S = Symbol.for("react.provider"), jt = Symbol.for("react.context"), se = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), Je = Symbol.for("react.suspense_list"), Z = Symbol.for("react.memo"), Se = Symbol.for("react.lazy"), ie = Symbol.for("react.offscreen"), je = Symbol.iterator, Xe = "@@iterator";
    function it(R) {
      if (R === null || typeof R != "object")
        return null;
      var $ = je && R[je] || R[Xe];
      return typeof $ == "function" ? $ : null;
    }
    var Kt = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function vt(R) {
      {
        for (var $ = arguments.length, ae = new Array($ > 1 ? $ - 1 : 0), he = 1; he < $; he++)
          ae[he - 1] = arguments[he];
        Qe("error", R, ae);
      }
    }
    function Qe(R, $, ae) {
      {
        var he = Kt.ReactDebugCurrentFrame, Ge = he.getStackAddendum();
        Ge !== "" && ($ += "%s", ae = ae.concat([Ge]));
        var $e = ae.map(function(ft) {
          return String(ft);
        });
        $e.unshift("Warning: " + $), Function.prototype.apply.call(console[R], console, $e);
      }
    }
    var ht = !1, be = !1, ct = !1, Fe = !1, an = !1, Ft;
    Ft = Symbol.for("react.module.reference");
    function Jt(R) {
      return !!(typeof R == "string" || typeof R == "function" || R === wt || R === Ie || an || R === pt || R === de || R === Je || Fe || R === ie || ht || be || ct || typeof R == "object" && R !== null && (R.$$typeof === Se || R.$$typeof === Z || R.$$typeof === S || R.$$typeof === jt || R.$$typeof === se || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      R.$$typeof === Ft || R.getModuleId !== void 0));
    }
    function ln(R, $, ae) {
      var he = R.displayName;
      if (he)
        return he;
      var Ge = $.displayName || $.name || "";
      return Ge !== "" ? ae + "(" + Ge + ")" : ae;
    }
    function xt(R) {
      return R.displayName || "Context";
    }
    function ke(R) {
      if (R == null)
        return null;
      if (typeof R.tag == "number" && vt("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof R == "function")
        return R.displayName || R.name || null;
      if (typeof R == "string")
        return R;
      switch (R) {
        case wt:
          return "Fragment";
        case A:
          return "Portal";
        case Ie:
          return "Profiler";
        case pt:
          return "StrictMode";
        case de:
          return "Suspense";
        case Je:
          return "SuspenseList";
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case jt:
            var $ = R;
            return xt($) + ".Consumer";
          case S:
            var ae = R;
            return xt(ae._context) + ".Provider";
          case se:
            return ln(R, R.render, "ForwardRef");
          case Z:
            var he = R.displayName || null;
            return he !== null ? he : ke(R.type) || "Memo";
          case Se: {
            var Ge = R, $e = Ge._payload, ft = Ge._init;
            try {
              return ke(ft($e));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var zt = Object.assign, bt = 0, Dt, Ce, J, Re, ne, _, P;
    function He() {
    }
    He.__reactDisabledLog = !0;
    function ze() {
      {
        if (bt === 0) {
          Dt = console.log, Ce = console.info, J = console.warn, Re = console.error, ne = console.group, _ = console.groupCollapsed, P = console.groupEnd;
          var R = {
            configurable: !0,
            enumerable: !0,
            value: He,
            writable: !0
          };
          Object.defineProperties(console, {
            info: R,
            log: R,
            warn: R,
            error: R,
            group: R,
            groupCollapsed: R,
            groupEnd: R
          });
        }
        bt++;
      }
    }
    function lt() {
      {
        if (bt--, bt === 0) {
          var R = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: zt({}, R, {
              value: Dt
            }),
            info: zt({}, R, {
              value: Ce
            }),
            warn: zt({}, R, {
              value: J
            }),
            error: zt({}, R, {
              value: Re
            }),
            group: zt({}, R, {
              value: ne
            }),
            groupCollapsed: zt({}, R, {
              value: _
            }),
            groupEnd: zt({}, R, {
              value: P
            })
          });
        }
        bt < 0 && vt("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var tt = Kt.ReactCurrentDispatcher, Ze;
    function nt(R, $, ae) {
      {
        if (Ze === void 0)
          try {
            throw Error();
          } catch (Ge) {
            var he = Ge.stack.trim().match(/\n( *(at )?)/);
            Ze = he && he[1] || "";
          }
        return `
` + Ze + R;
      }
    }
    var ut = !1, Vt;
    {
      var kn = typeof WeakMap == "function" ? WeakMap : Map;
      Vt = new kn();
    }
    function wr(R, $) {
      if (!R || ut)
        return "";
      {
        var ae = Vt.get(R);
        if (ae !== void 0)
          return ae;
      }
      var he;
      ut = !0;
      var Ge = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var $e;
      $e = tt.current, tt.current = null, ze();
      try {
        if ($) {
          var ft = function() {
            throw Error();
          };
          if (Object.defineProperty(ft.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(ft, []);
            } catch (qe) {
              he = qe;
            }
            Reflect.construct(R, [], ft);
          } else {
            try {
              ft.call();
            } catch (qe) {
              he = qe;
            }
            R.call(ft.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (qe) {
            he = qe;
          }
          R();
        }
      } catch (qe) {
        if (qe && he && typeof qe.stack == "string") {
          for (var ot = qe.stack.split(`
`), Rn = he.stack.split(`
`), tn = ot.length - 1, on = Rn.length - 1; tn >= 1 && on >= 0 && ot[tn] !== Rn[on]; )
            on--;
          for (; tn >= 1 && on >= 0; tn--, on--)
            if (ot[tn] !== Rn[on]) {
              if (tn !== 1 || on !== 1)
                do
                  if (tn--, on--, on < 0 || ot[tn] !== Rn[on]) {
                    var rr = `
` + ot[tn].replace(" at new ", " at ");
                    return R.displayName && rr.includes("<anonymous>") && (rr = rr.replace("<anonymous>", R.displayName)), typeof R == "function" && Vt.set(R, rr), rr;
                  }
                while (tn >= 1 && on >= 0);
              break;
            }
        }
      } finally {
        ut = !1, tt.current = $e, lt(), Error.prepareStackTrace = Ge;
      }
      var Wa = R ? R.displayName || R.name : "", Ga = Wa ? nt(Wa) : "";
      return typeof R == "function" && Vt.set(R, Ga), Ga;
    }
    function En(R, $, ae) {
      return wr(R, !1);
    }
    function tr(R) {
      var $ = R.prototype;
      return !!($ && $.isReactComponent);
    }
    function Pn(R, $, ae) {
      if (R == null)
        return "";
      if (typeof R == "function")
        return wr(R, tr(R));
      if (typeof R == "string")
        return nt(R);
      switch (R) {
        case de:
          return nt("Suspense");
        case Je:
          return nt("SuspenseList");
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case se:
            return En(R.render);
          case Z:
            return Pn(R.type, $, ae);
          case Se: {
            var he = R, Ge = he._payload, $e = he._init;
            try {
              return Pn($e(Ge), $, ae);
            } catch {
            }
          }
        }
      return "";
    }
    var Vn = Object.prototype.hasOwnProperty, Yr = {}, si = Kt.ReactDebugCurrentFrame;
    function oa(R) {
      if (R) {
        var $ = R._owner, ae = Pn(R.type, R._source, $ ? $.type : null);
        si.setExtraStackFrame(ae);
      } else
        si.setExtraStackFrame(null);
    }
    function Gn(R, $, ae, he, Ge) {
      {
        var $e = Function.call.bind(Vn);
        for (var ft in R)
          if ($e(R, ft)) {
            var ot = void 0;
            try {
              if (typeof R[ft] != "function") {
                var Rn = Error((he || "React class") + ": " + ae + " type `" + ft + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof R[ft] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw Rn.name = "Invariant Violation", Rn;
              }
              ot = R[ft]($, ft, he, ae, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (tn) {
              ot = tn;
            }
            ot && !(ot instanceof Error) && (oa(Ge), vt("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", he || "React class", ae, ft, typeof ot), oa(null)), ot instanceof Error && !(ot.message in Yr) && (Yr[ot.message] = !0, oa(Ge), vt("Failed %s type: %s", ae, ot.message), oa(null));
          }
      }
    }
    var Cn = Array.isArray;
    function Bn(R) {
      return Cn(R);
    }
    function yr(R) {
      {
        var $ = typeof Symbol == "function" && Symbol.toStringTag, ae = $ && R[Symbol.toStringTag] || R.constructor.name || "Object";
        return ae;
      }
    }
    function Ya(R) {
      try {
        return On(R), !1;
      } catch {
        return !0;
      }
    }
    function On(R) {
      return "" + R;
    }
    function gr(R) {
      if (Ya(R))
        return vt("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", yr(R)), On(R);
    }
    var sa = Kt.ReactCurrentOwner, Ia = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ci, ee;
    function Te(R) {
      if (Vn.call(R, "ref")) {
        var $ = Object.getOwnPropertyDescriptor(R, "ref").get;
        if ($ && $.isReactWarning)
          return !1;
      }
      return R.ref !== void 0;
    }
    function rt(R) {
      if (Vn.call(R, "key")) {
        var $ = Object.getOwnPropertyDescriptor(R, "key").get;
        if ($ && $.isReactWarning)
          return !1;
      }
      return R.key !== void 0;
    }
    function At(R, $) {
      typeof R.ref == "string" && sa.current;
    }
    function Zt(R, $) {
      {
        var ae = function() {
          ci || (ci = !0, vt("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", $));
        };
        ae.isReactWarning = !0, Object.defineProperty(R, "key", {
          get: ae,
          configurable: !0
        });
      }
    }
    function pn(R, $) {
      {
        var ae = function() {
          ee || (ee = !0, vt("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", $));
        };
        ae.isReactWarning = !0, Object.defineProperty(R, "ref", {
          get: ae,
          configurable: !0
        });
      }
    }
    var un = function(R, $, ae, he, Ge, $e, ft) {
      var ot = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: X,
        // Built-in properties that belong on the element
        type: R,
        key: $,
        ref: ae,
        props: ft,
        // Record the component responsible for creating this element.
        _owner: $e
      };
      return ot._store = {}, Object.defineProperty(ot._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(ot, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: he
      }), Object.defineProperty(ot, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: Ge
      }), Object.freeze && (Object.freeze(ot.props), Object.freeze(ot)), ot;
    };
    function qn(R, $, ae, he, Ge) {
      {
        var $e, ft = {}, ot = null, Rn = null;
        ae !== void 0 && (gr(ae), ot = "" + ae), rt($) && (gr($.key), ot = "" + $.key), Te($) && (Rn = $.ref, At($, Ge));
        for ($e in $)
          Vn.call($, $e) && !Ia.hasOwnProperty($e) && (ft[$e] = $[$e]);
        if (R && R.defaultProps) {
          var tn = R.defaultProps;
          for ($e in tn)
            ft[$e] === void 0 && (ft[$e] = tn[$e]);
        }
        if (ot || Rn) {
          var on = typeof R == "function" ? R.displayName || R.name || "Unknown" : R;
          ot && Zt(ft, on), Rn && pn(ft, on);
        }
        return un(R, ot, Rn, Ge, he, sa.current, ft);
      }
    }
    var en = Kt.ReactCurrentOwner, Bt = Kt.ReactDebugCurrentFrame;
    function $t(R) {
      if (R) {
        var $ = R._owner, ae = Pn(R.type, R._source, $ ? $.type : null);
        Bt.setExtraStackFrame(ae);
      } else
        Bt.setExtraStackFrame(null);
    }
    var ca;
    ca = !1;
    function Sr(R) {
      return typeof R == "object" && R !== null && R.$$typeof === X;
    }
    function Ta() {
      {
        if (en.current) {
          var R = ke(en.current.type);
          if (R)
            return `

Check the render method of \`` + R + "`.";
        }
        return "";
      }
    }
    function Fi(R) {
      return "";
    }
    var Jl = {};
    function Zl(R) {
      {
        var $ = Ta();
        if (!$) {
          var ae = typeof R == "string" ? R : R.displayName || R.name;
          ae && ($ = `

Check the top-level render call using <` + ae + ">.");
        }
        return $;
      }
    }
    function dl(R, $) {
      {
        if (!R._store || R._store.validated || R.key != null)
          return;
        R._store.validated = !0;
        var ae = Zl($);
        if (Jl[ae])
          return;
        Jl[ae] = !0;
        var he = "";
        R && R._owner && R._owner !== en.current && (he = " It was passed a child from " + ke(R._owner.type) + "."), $t(R), vt('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', ae, he), $t(null);
      }
    }
    function pl(R, $) {
      {
        if (typeof R != "object")
          return;
        if (Bn(R))
          for (var ae = 0; ae < R.length; ae++) {
            var he = R[ae];
            Sr(he) && dl(he, $);
          }
        else if (Sr(R))
          R._store && (R._store.validated = !0);
        else if (R) {
          var Ge = it(R);
          if (typeof Ge == "function" && Ge !== R.entries)
            for (var $e = Ge.call(R), ft; !(ft = $e.next()).done; )
              Sr(ft.value) && dl(ft.value, $);
        }
      }
    }
    function eu(R) {
      {
        var $ = R.type;
        if ($ == null || typeof $ == "string")
          return;
        var ae;
        if (typeof $ == "function")
          ae = $.propTypes;
        else if (typeof $ == "object" && ($.$$typeof === se || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        $.$$typeof === Z))
          ae = $.propTypes;
        else
          return;
        if (ae) {
          var he = ke($);
          Gn(ae, R.props, "prop", he, R);
        } else if ($.PropTypes !== void 0 && !ca) {
          ca = !0;
          var Ge = ke($);
          vt("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", Ge || "Unknown");
        }
        typeof $.getDefaultProps == "function" && !$.getDefaultProps.isReactClassApproved && vt("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function xr(R) {
      {
        for (var $ = Object.keys(R.props), ae = 0; ae < $.length; ae++) {
          var he = $[ae];
          if (he !== "children" && he !== "key") {
            $t(R), vt("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", he), $t(null);
            break;
          }
        }
        R.ref !== null && ($t(R), vt("Invalid attribute `ref` supplied to `React.Fragment`."), $t(null));
      }
    }
    var br = {};
    function nr(R, $, ae, he, Ge, $e) {
      {
        var ft = Jt(R);
        if (!ft) {
          var ot = "";
          (R === void 0 || typeof R == "object" && R !== null && Object.keys(R).length === 0) && (ot += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Rn = Fi();
          Rn ? ot += Rn : ot += Ta();
          var tn;
          R === null ? tn = "null" : Bn(R) ? tn = "array" : R !== void 0 && R.$$typeof === X ? (tn = "<" + (ke(R.type) || "Unknown") + " />", ot = " Did you accidentally export a JSX literal instead of a component?") : tn = typeof R, vt("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", tn, ot);
        }
        var on = qn(R, $, ae, Ge, $e);
        if (on == null)
          return on;
        if (ft) {
          var rr = $.children;
          if (rr !== void 0)
            if (he)
              if (Bn(rr)) {
                for (var Wa = 0; Wa < rr.length; Wa++)
                  pl(rr[Wa], R);
                Object.freeze && Object.freeze(rr);
              } else
                vt("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              pl(rr, R);
        }
        if (Vn.call($, "key")) {
          var Ga = ke(R), qe = Object.keys($).filter(function(tu) {
            return tu !== "key";
          }), et = qe.length > 0 ? "{key: someKey, " + qe.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!br[Ga + et]) {
            var qa = qe.length > 0 ? "{" + qe.join(": ..., ") + ": ...}" : "{}";
            vt(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, et, Ga, qa, Ga), br[Ga + et] = !0;
          }
        }
        return R === wt ? xr(on) : eu(on), on;
      }
    }
    function fi(R, $, ae) {
      return nr(R, $, ae, !0);
    }
    function Qa(R, $, ae) {
      return nr(R, $, ae, !1);
    }
    var di = Qa, pi = fi;
    Zp.Fragment = wt, Zp.jsx = di, Zp.jsxs = pi;
  }()), Zp;
}
process.env.NODE_ENV === "production" ? mE.exports = eD() : mE.exports = tD();
var $r = mE.exports, nv = {}, gE = { exports: {} }, Ba = {}, qm = { exports: {} }, vE = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rT;
function nD() {
  return rT || (rT = 1, function(B) {
    function X(J, Re) {
      var ne = J.length;
      J.push(Re);
      e: for (; 0 < ne; ) {
        var _ = ne - 1 >>> 1, P = J[_];
        if (0 < pt(P, Re)) J[_] = Re, J[ne] = P, ne = _;
        else break e;
      }
    }
    function A(J) {
      return J.length === 0 ? null : J[0];
    }
    function wt(J) {
      if (J.length === 0) return null;
      var Re = J[0], ne = J.pop();
      if (ne !== Re) {
        J[0] = ne;
        e: for (var _ = 0, P = J.length, He = P >>> 1; _ < He; ) {
          var ze = 2 * (_ + 1) - 1, lt = J[ze], tt = ze + 1, Ze = J[tt];
          if (0 > pt(lt, ne)) tt < P && 0 > pt(Ze, lt) ? (J[_] = Ze, J[tt] = ne, _ = tt) : (J[_] = lt, J[ze] = ne, _ = ze);
          else if (tt < P && 0 > pt(Ze, ne)) J[_] = Ze, J[tt] = ne, _ = tt;
          else break e;
        }
      }
      return Re;
    }
    function pt(J, Re) {
      var ne = J.sortIndex - Re.sortIndex;
      return ne !== 0 ? ne : J.id - Re.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var Ie = performance;
      B.unstable_now = function() {
        return Ie.now();
      };
    } else {
      var S = Date, jt = S.now();
      B.unstable_now = function() {
        return S.now() - jt;
      };
    }
    var se = [], de = [], Je = 1, Z = null, Se = 3, ie = !1, je = !1, Xe = !1, it = typeof setTimeout == "function" ? setTimeout : null, Kt = typeof clearTimeout == "function" ? clearTimeout : null, vt = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function Qe(J) {
      for (var Re = A(de); Re !== null; ) {
        if (Re.callback === null) wt(de);
        else if (Re.startTime <= J) wt(de), Re.sortIndex = Re.expirationTime, X(se, Re);
        else break;
        Re = A(de);
      }
    }
    function ht(J) {
      if (Xe = !1, Qe(J), !je) if (A(se) !== null) je = !0, Dt(be);
      else {
        var Re = A(de);
        Re !== null && Ce(ht, Re.startTime - J);
      }
    }
    function be(J, Re) {
      je = !1, Xe && (Xe = !1, Kt(an), an = -1), ie = !0;
      var ne = Se;
      try {
        for (Qe(Re), Z = A(se); Z !== null && (!(Z.expirationTime > Re) || J && !ln()); ) {
          var _ = Z.callback;
          if (typeof _ == "function") {
            Z.callback = null, Se = Z.priorityLevel;
            var P = _(Z.expirationTime <= Re);
            Re = B.unstable_now(), typeof P == "function" ? Z.callback = P : Z === A(se) && wt(se), Qe(Re);
          } else wt(se);
          Z = A(se);
        }
        if (Z !== null) var He = !0;
        else {
          var ze = A(de);
          ze !== null && Ce(ht, ze.startTime - Re), He = !1;
        }
        return He;
      } finally {
        Z = null, Se = ne, ie = !1;
      }
    }
    var ct = !1, Fe = null, an = -1, Ft = 5, Jt = -1;
    function ln() {
      return !(B.unstable_now() - Jt < Ft);
    }
    function xt() {
      if (Fe !== null) {
        var J = B.unstable_now();
        Jt = J;
        var Re = !0;
        try {
          Re = Fe(!0, J);
        } finally {
          Re ? ke() : (ct = !1, Fe = null);
        }
      } else ct = !1;
    }
    var ke;
    if (typeof vt == "function") ke = function() {
      vt(xt);
    };
    else if (typeof MessageChannel < "u") {
      var zt = new MessageChannel(), bt = zt.port2;
      zt.port1.onmessage = xt, ke = function() {
        bt.postMessage(null);
      };
    } else ke = function() {
      it(xt, 0);
    };
    function Dt(J) {
      Fe = J, ct || (ct = !0, ke());
    }
    function Ce(J, Re) {
      an = it(function() {
        J(B.unstable_now());
      }, Re);
    }
    B.unstable_IdlePriority = 5, B.unstable_ImmediatePriority = 1, B.unstable_LowPriority = 4, B.unstable_NormalPriority = 3, B.unstable_Profiling = null, B.unstable_UserBlockingPriority = 2, B.unstable_cancelCallback = function(J) {
      J.callback = null;
    }, B.unstable_continueExecution = function() {
      je || ie || (je = !0, Dt(be));
    }, B.unstable_forceFrameRate = function(J) {
      0 > J || 125 < J ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Ft = 0 < J ? Math.floor(1e3 / J) : 5;
    }, B.unstable_getCurrentPriorityLevel = function() {
      return Se;
    }, B.unstable_getFirstCallbackNode = function() {
      return A(se);
    }, B.unstable_next = function(J) {
      switch (Se) {
        case 1:
        case 2:
        case 3:
          var Re = 3;
          break;
        default:
          Re = Se;
      }
      var ne = Se;
      Se = Re;
      try {
        return J();
      } finally {
        Se = ne;
      }
    }, B.unstable_pauseExecution = function() {
    }, B.unstable_requestPaint = function() {
    }, B.unstable_runWithPriority = function(J, Re) {
      switch (J) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          J = 3;
      }
      var ne = Se;
      Se = J;
      try {
        return Re();
      } finally {
        Se = ne;
      }
    }, B.unstable_scheduleCallback = function(J, Re, ne) {
      var _ = B.unstable_now();
      switch (typeof ne == "object" && ne !== null ? (ne = ne.delay, ne = typeof ne == "number" && 0 < ne ? _ + ne : _) : ne = _, J) {
        case 1:
          var P = -1;
          break;
        case 2:
          P = 250;
          break;
        case 5:
          P = 1073741823;
          break;
        case 4:
          P = 1e4;
          break;
        default:
          P = 5e3;
      }
      return P = ne + P, J = { id: Je++, callback: Re, priorityLevel: J, startTime: ne, expirationTime: P, sortIndex: -1 }, ne > _ ? (J.sortIndex = ne, X(de, J), A(se) === null && J === A(de) && (Xe ? (Kt(an), an = -1) : Xe = !0, Ce(ht, ne - _))) : (J.sortIndex = P, X(se, J), je || ie || (je = !0, Dt(be))), J;
    }, B.unstable_shouldYield = ln, B.unstable_wrapCallback = function(J) {
      var Re = Se;
      return function() {
        var ne = Se;
        Se = Re;
        try {
          return J.apply(this, arguments);
        } finally {
          Se = ne;
        }
      };
    };
  }(vE)), vE;
}
var hE = {};
/**
 * @license React
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var aT;
function rD() {
  return aT || (aT = 1, function(B) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var X = !1, A = 5;
      function wt(ee, Te) {
        var rt = ee.length;
        ee.push(Te), S(ee, Te, rt);
      }
      function pt(ee) {
        return ee.length === 0 ? null : ee[0];
      }
      function Ie(ee) {
        if (ee.length === 0)
          return null;
        var Te = ee[0], rt = ee.pop();
        return rt !== Te && (ee[0] = rt, jt(ee, rt, 0)), Te;
      }
      function S(ee, Te, rt) {
        for (var At = rt; At > 0; ) {
          var Zt = At - 1 >>> 1, pn = ee[Zt];
          if (se(pn, Te) > 0)
            ee[Zt] = Te, ee[At] = pn, At = Zt;
          else
            return;
        }
      }
      function jt(ee, Te, rt) {
        for (var At = rt, Zt = ee.length, pn = Zt >>> 1; At < pn; ) {
          var un = (At + 1) * 2 - 1, qn = ee[un], en = un + 1, Bt = ee[en];
          if (se(qn, Te) < 0)
            en < Zt && se(Bt, qn) < 0 ? (ee[At] = Bt, ee[en] = Te, At = en) : (ee[At] = qn, ee[un] = Te, At = un);
          else if (en < Zt && se(Bt, Te) < 0)
            ee[At] = Bt, ee[en] = Te, At = en;
          else
            return;
        }
      }
      function se(ee, Te) {
        var rt = ee.sortIndex - Te.sortIndex;
        return rt !== 0 ? rt : ee.id - Te.id;
      }
      var de = 1, Je = 2, Z = 3, Se = 4, ie = 5;
      function je(ee, Te) {
      }
      var Xe = typeof performance == "object" && typeof performance.now == "function";
      if (Xe) {
        var it = performance;
        B.unstable_now = function() {
          return it.now();
        };
      } else {
        var Kt = Date, vt = Kt.now();
        B.unstable_now = function() {
          return Kt.now() - vt;
        };
      }
      var Qe = 1073741823, ht = -1, be = 250, ct = 5e3, Fe = 1e4, an = Qe, Ft = [], Jt = [], ln = 1, xt = null, ke = Z, zt = !1, bt = !1, Dt = !1, Ce = typeof setTimeout == "function" ? setTimeout : null, J = typeof clearTimeout == "function" ? clearTimeout : null, Re = typeof setImmediate < "u" ? setImmediate : null;
      typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function ne(ee) {
        for (var Te = pt(Jt); Te !== null; ) {
          if (Te.callback === null)
            Ie(Jt);
          else if (Te.startTime <= ee)
            Ie(Jt), Te.sortIndex = Te.expirationTime, wt(Ft, Te);
          else
            return;
          Te = pt(Jt);
        }
      }
      function _(ee) {
        if (Dt = !1, ne(ee), !bt)
          if (pt(Ft) !== null)
            bt = !0, On(P);
          else {
            var Te = pt(Jt);
            Te !== null && gr(_, Te.startTime - ee);
          }
      }
      function P(ee, Te) {
        bt = !1, Dt && (Dt = !1, sa()), zt = !0;
        var rt = ke;
        try {
          var At;
          if (!X) return He(ee, Te);
        } finally {
          xt = null, ke = rt, zt = !1;
        }
      }
      function He(ee, Te) {
        var rt = Te;
        for (ne(rt), xt = pt(Ft); xt !== null && !(xt.expirationTime > rt && (!ee || si())); ) {
          var At = xt.callback;
          if (typeof At == "function") {
            xt.callback = null, ke = xt.priorityLevel;
            var Zt = xt.expirationTime <= rt, pn = At(Zt);
            rt = B.unstable_now(), typeof pn == "function" ? xt.callback = pn : xt === pt(Ft) && Ie(Ft), ne(rt);
          } else
            Ie(Ft);
          xt = pt(Ft);
        }
        if (xt !== null)
          return !0;
        var un = pt(Jt);
        return un !== null && gr(_, un.startTime - rt), !1;
      }
      function ze(ee, Te) {
        switch (ee) {
          case de:
          case Je:
          case Z:
          case Se:
          case ie:
            break;
          default:
            ee = Z;
        }
        var rt = ke;
        ke = ee;
        try {
          return Te();
        } finally {
          ke = rt;
        }
      }
      function lt(ee) {
        var Te;
        switch (ke) {
          case de:
          case Je:
          case Z:
            Te = Z;
            break;
          default:
            Te = ke;
            break;
        }
        var rt = ke;
        ke = Te;
        try {
          return ee();
        } finally {
          ke = rt;
        }
      }
      function tt(ee) {
        var Te = ke;
        return function() {
          var rt = ke;
          ke = Te;
          try {
            return ee.apply(this, arguments);
          } finally {
            ke = rt;
          }
        };
      }
      function Ze(ee, Te, rt) {
        var At = B.unstable_now(), Zt;
        if (typeof rt == "object" && rt !== null) {
          var pn = rt.delay;
          typeof pn == "number" && pn > 0 ? Zt = At + pn : Zt = At;
        } else
          Zt = At;
        var un;
        switch (ee) {
          case de:
            un = ht;
            break;
          case Je:
            un = be;
            break;
          case ie:
            un = an;
            break;
          case Se:
            un = Fe;
            break;
          case Z:
          default:
            un = ct;
            break;
        }
        var qn = Zt + un, en = {
          id: ln++,
          callback: Te,
          priorityLevel: ee,
          startTime: Zt,
          expirationTime: qn,
          sortIndex: -1
        };
        return Zt > At ? (en.sortIndex = Zt, wt(Jt, en), pt(Ft) === null && en === pt(Jt) && (Dt ? sa() : Dt = !0, gr(_, Zt - At))) : (en.sortIndex = qn, wt(Ft, en), !bt && !zt && (bt = !0, On(P))), en;
      }
      function nt() {
      }
      function ut() {
        !bt && !zt && (bt = !0, On(P));
      }
      function Vt() {
        return pt(Ft);
      }
      function kn(ee) {
        ee.callback = null;
      }
      function wr() {
        return ke;
      }
      var En = !1, tr = null, Pn = -1, Vn = A, Yr = -1;
      function si() {
        var ee = B.unstable_now() - Yr;
        return !(ee < Vn);
      }
      function oa() {
      }
      function Gn(ee) {
        if (ee < 0 || ee > 125) {
          console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
          return;
        }
        ee > 0 ? Vn = Math.floor(1e3 / ee) : Vn = A;
      }
      var Cn = function() {
        if (tr !== null) {
          var ee = B.unstable_now();
          Yr = ee;
          var Te = !0, rt = !0;
          try {
            rt = tr(Te, ee);
          } finally {
            rt ? Bn() : (En = !1, tr = null);
          }
        } else
          En = !1;
      }, Bn;
      if (typeof Re == "function")
        Bn = function() {
          Re(Cn);
        };
      else if (typeof MessageChannel < "u") {
        var yr = new MessageChannel(), Ya = yr.port2;
        yr.port1.onmessage = Cn, Bn = function() {
          Ya.postMessage(null);
        };
      } else
        Bn = function() {
          Ce(Cn, 0);
        };
      function On(ee) {
        tr = ee, En || (En = !0, Bn());
      }
      function gr(ee, Te) {
        Pn = Ce(function() {
          ee(B.unstable_now());
        }, Te);
      }
      function sa() {
        J(Pn), Pn = -1;
      }
      var Ia = oa, ci = null;
      B.unstable_IdlePriority = ie, B.unstable_ImmediatePriority = de, B.unstable_LowPriority = Se, B.unstable_NormalPriority = Z, B.unstable_Profiling = ci, B.unstable_UserBlockingPriority = Je, B.unstable_cancelCallback = kn, B.unstable_continueExecution = ut, B.unstable_forceFrameRate = Gn, B.unstable_getCurrentPriorityLevel = wr, B.unstable_getFirstCallbackNode = Vt, B.unstable_next = lt, B.unstable_pauseExecution = nt, B.unstable_requestPaint = Ia, B.unstable_runWithPriority = ze, B.unstable_scheduleCallback = Ze, B.unstable_shouldYield = si, B.unstable_wrapCallback = tt, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(hE)), hE;
}
var iT;
function sT() {
  return iT || (iT = 1, process.env.NODE_ENV === "production" ? qm.exports = nD() : qm.exports = rD()), qm.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lT;
function aD() {
  if (lT) return Ba;
  lT = 1;
  var B = rv, X = sT();
  function A(n) {
    for (var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + n, l = 1; l < arguments.length; l++) r += "&args[]=" + encodeURIComponent(arguments[l]);
    return "Minified React error #" + n + "; visit " + r + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var wt = /* @__PURE__ */ new Set(), pt = {};
  function Ie(n, r) {
    S(n, r), S(n + "Capture", r);
  }
  function S(n, r) {
    for (pt[n] = r, n = 0; n < r.length; n++) wt.add(r[n]);
  }
  var jt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), se = Object.prototype.hasOwnProperty, de = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Je = {}, Z = {};
  function Se(n) {
    return se.call(Z, n) ? !0 : se.call(Je, n) ? !1 : de.test(n) ? Z[n] = !0 : (Je[n] = !0, !1);
  }
  function ie(n, r, l, o) {
    if (l !== null && l.type === 0) return !1;
    switch (typeof r) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return o ? !1 : l !== null ? !l.acceptsBooleans : (n = n.toLowerCase().slice(0, 5), n !== "data-" && n !== "aria-");
      default:
        return !1;
    }
  }
  function je(n, r, l, o) {
    if (r === null || typeof r > "u" || ie(n, r, l, o)) return !0;
    if (o) return !1;
    if (l !== null) switch (l.type) {
      case 3:
        return !r;
      case 4:
        return r === !1;
      case 5:
        return isNaN(r);
      case 6:
        return isNaN(r) || 1 > r;
    }
    return !1;
  }
  function Xe(n, r, l, o, c, d, m) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = o, this.attributeNamespace = c, this.mustUseProperty = l, this.propertyName = n, this.type = r, this.sanitizeURL = d, this.removeEmptyString = m;
  }
  var it = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n) {
    it[n] = new Xe(n, 0, !1, n, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(n) {
    var r = n[0];
    it[r] = new Xe(r, 1, !1, n[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(n) {
    it[n] = new Xe(n, 2, !1, n.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(n) {
    it[n] = new Xe(n, 2, !1, n, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n) {
    it[n] = new Xe(n, 3, !1, n.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(n) {
    it[n] = new Xe(n, 3, !0, n, null, !1, !1);
  }), ["capture", "download"].forEach(function(n) {
    it[n] = new Xe(n, 4, !1, n, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(n) {
    it[n] = new Xe(n, 6, !1, n, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(n) {
    it[n] = new Xe(n, 5, !1, n.toLowerCase(), null, !1, !1);
  });
  var Kt = /[\-:]([a-z])/g;
  function vt(n) {
    return n[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n) {
    var r = n.replace(
      Kt,
      vt
    );
    it[r] = new Xe(r, 1, !1, n, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n) {
    var r = n.replace(Kt, vt);
    it[r] = new Xe(r, 1, !1, n, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(n) {
    var r = n.replace(Kt, vt);
    it[r] = new Xe(r, 1, !1, n, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(n) {
    it[n] = new Xe(n, 1, !1, n.toLowerCase(), null, !1, !1);
  }), it.xlinkHref = new Xe("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(n) {
    it[n] = new Xe(n, 1, !1, n.toLowerCase(), null, !0, !0);
  });
  function Qe(n, r, l, o) {
    var c = it.hasOwnProperty(r) ? it[r] : null;
    (c !== null ? c.type !== 0 : o || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (je(r, l, c, o) && (l = null), o || c === null ? Se(r) && (l === null ? n.removeAttribute(r) : n.setAttribute(r, "" + l)) : c.mustUseProperty ? n[c.propertyName] = l === null ? c.type === 3 ? !1 : "" : l : (r = c.attributeName, o = c.attributeNamespace, l === null ? n.removeAttribute(r) : (c = c.type, l = c === 3 || c === 4 && l === !0 ? "" : "" + l, o ? n.setAttributeNS(o, r, l) : n.setAttribute(r, l))));
  }
  var ht = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, be = Symbol.for("react.element"), ct = Symbol.for("react.portal"), Fe = Symbol.for("react.fragment"), an = Symbol.for("react.strict_mode"), Ft = Symbol.for("react.profiler"), Jt = Symbol.for("react.provider"), ln = Symbol.for("react.context"), xt = Symbol.for("react.forward_ref"), ke = Symbol.for("react.suspense"), zt = Symbol.for("react.suspense_list"), bt = Symbol.for("react.memo"), Dt = Symbol.for("react.lazy"), Ce = Symbol.for("react.offscreen"), J = Symbol.iterator;
  function Re(n) {
    return n === null || typeof n != "object" ? null : (n = J && n[J] || n["@@iterator"], typeof n == "function" ? n : null);
  }
  var ne = Object.assign, _;
  function P(n) {
    if (_ === void 0) try {
      throw Error();
    } catch (l) {
      var r = l.stack.trim().match(/\n( *(at )?)/);
      _ = r && r[1] || "";
    }
    return `
` + _ + n;
  }
  var He = !1;
  function ze(n, r) {
    if (!n || He) return "";
    He = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (r) if (r = function() {
        throw Error();
      }, Object.defineProperty(r.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(r, []);
        } catch (U) {
          var o = U;
        }
        Reflect.construct(n, [], r);
      } else {
        try {
          r.call();
        } catch (U) {
          o = U;
        }
        n.call(r.prototype);
      }
      else {
        try {
          throw Error();
        } catch (U) {
          o = U;
        }
        n();
      }
    } catch (U) {
      if (U && o && typeof U.stack == "string") {
        for (var c = U.stack.split(`
`), d = o.stack.split(`
`), m = c.length - 1, E = d.length - 1; 1 <= m && 0 <= E && c[m] !== d[E]; ) E--;
        for (; 1 <= m && 0 <= E; m--, E--) if (c[m] !== d[E]) {
          if (m !== 1 || E !== 1)
            do
              if (m--, E--, 0 > E || c[m] !== d[E]) {
                var T = `
` + c[m].replace(" at new ", " at ");
                return n.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", n.displayName)), T;
              }
            while (1 <= m && 0 <= E);
          break;
        }
      }
    } finally {
      He = !1, Error.prepareStackTrace = l;
    }
    return (n = n ? n.displayName || n.name : "") ? P(n) : "";
  }
  function lt(n) {
    switch (n.tag) {
      case 5:
        return P(n.type);
      case 16:
        return P("Lazy");
      case 13:
        return P("Suspense");
      case 19:
        return P("SuspenseList");
      case 0:
      case 2:
      case 15:
        return n = ze(n.type, !1), n;
      case 11:
        return n = ze(n.type.render, !1), n;
      case 1:
        return n = ze(n.type, !0), n;
      default:
        return "";
    }
  }
  function tt(n) {
    if (n == null) return null;
    if (typeof n == "function") return n.displayName || n.name || null;
    if (typeof n == "string") return n;
    switch (n) {
      case Fe:
        return "Fragment";
      case ct:
        return "Portal";
      case Ft:
        return "Profiler";
      case an:
        return "StrictMode";
      case ke:
        return "Suspense";
      case zt:
        return "SuspenseList";
    }
    if (typeof n == "object") switch (n.$$typeof) {
      case ln:
        return (n.displayName || "Context") + ".Consumer";
      case Jt:
        return (n._context.displayName || "Context") + ".Provider";
      case xt:
        var r = n.render;
        return n = n.displayName, n || (n = r.displayName || r.name || "", n = n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef"), n;
      case bt:
        return r = n.displayName || null, r !== null ? r : tt(n.type) || "Memo";
      case Dt:
        r = n._payload, n = n._init;
        try {
          return tt(n(r));
        } catch {
        }
    }
    return null;
  }
  function Ze(n) {
    var r = n.type;
    switch (n.tag) {
      case 24:
        return "Cache";
      case 9:
        return (r.displayName || "Context") + ".Consumer";
      case 10:
        return (r._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return n = r.render, n = n.displayName || n.name || "", r.displayName || (n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return r;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return tt(r);
      case 8:
        return r === an ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof r == "function") return r.displayName || r.name || null;
        if (typeof r == "string") return r;
    }
    return null;
  }
  function nt(n) {
    switch (typeof n) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return n;
      case "object":
        return n;
      default:
        return "";
    }
  }
  function ut(n) {
    var r = n.type;
    return (n = n.nodeName) && n.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function Vt(n) {
    var r = ut(n) ? "checked" : "value", l = Object.getOwnPropertyDescriptor(n.constructor.prototype, r), o = "" + n[r];
    if (!n.hasOwnProperty(r) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var c = l.get, d = l.set;
      return Object.defineProperty(n, r, { configurable: !0, get: function() {
        return c.call(this);
      }, set: function(m) {
        o = "" + m, d.call(this, m);
      } }), Object.defineProperty(n, r, { enumerable: l.enumerable }), { getValue: function() {
        return o;
      }, setValue: function(m) {
        o = "" + m;
      }, stopTracking: function() {
        n._valueTracker = null, delete n[r];
      } };
    }
  }
  function kn(n) {
    n._valueTracker || (n._valueTracker = Vt(n));
  }
  function wr(n) {
    if (!n) return !1;
    var r = n._valueTracker;
    if (!r) return !0;
    var l = r.getValue(), o = "";
    return n && (o = ut(n) ? n.checked ? "true" : "false" : n.value), n = o, n !== l ? (r.setValue(n), !0) : !1;
  }
  function En(n) {
    if (n = n || (typeof document < "u" ? document : void 0), typeof n > "u") return null;
    try {
      return n.activeElement || n.body;
    } catch {
      return n.body;
    }
  }
  function tr(n, r) {
    var l = r.checked;
    return ne({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: l ?? n._wrapperState.initialChecked });
  }
  function Pn(n, r) {
    var l = r.defaultValue == null ? "" : r.defaultValue, o = r.checked != null ? r.checked : r.defaultChecked;
    l = nt(r.value != null ? r.value : l), n._wrapperState = { initialChecked: o, initialValue: l, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function Vn(n, r) {
    r = r.checked, r != null && Qe(n, "checked", r, !1);
  }
  function Yr(n, r) {
    Vn(n, r);
    var l = nt(r.value), o = r.type;
    if (l != null) o === "number" ? (l === 0 && n.value === "" || n.value != l) && (n.value = "" + l) : n.value !== "" + l && (n.value = "" + l);
    else if (o === "submit" || o === "reset") {
      n.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? oa(n, r.type, l) : r.hasOwnProperty("defaultValue") && oa(n, r.type, nt(r.defaultValue)), r.checked == null && r.defaultChecked != null && (n.defaultChecked = !!r.defaultChecked);
  }
  function si(n, r, l) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var o = r.type;
      if (!(o !== "submit" && o !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + n._wrapperState.initialValue, l || r === n.value || (n.value = r), n.defaultValue = r;
    }
    l = n.name, l !== "" && (n.name = ""), n.defaultChecked = !!n._wrapperState.initialChecked, l !== "" && (n.name = l);
  }
  function oa(n, r, l) {
    (r !== "number" || En(n.ownerDocument) !== n) && (l == null ? n.defaultValue = "" + n._wrapperState.initialValue : n.defaultValue !== "" + l && (n.defaultValue = "" + l));
  }
  var Gn = Array.isArray;
  function Cn(n, r, l, o) {
    if (n = n.options, r) {
      r = {};
      for (var c = 0; c < l.length; c++) r["$" + l[c]] = !0;
      for (l = 0; l < n.length; l++) c = r.hasOwnProperty("$" + n[l].value), n[l].selected !== c && (n[l].selected = c), c && o && (n[l].defaultSelected = !0);
    } else {
      for (l = "" + nt(l), r = null, c = 0; c < n.length; c++) {
        if (n[c].value === l) {
          n[c].selected = !0, o && (n[c].defaultSelected = !0);
          return;
        }
        r !== null || n[c].disabled || (r = n[c]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function Bn(n, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(A(91));
    return ne({}, r, { value: void 0, defaultValue: void 0, children: "" + n._wrapperState.initialValue });
  }
  function yr(n, r) {
    var l = r.value;
    if (l == null) {
      if (l = r.children, r = r.defaultValue, l != null) {
        if (r != null) throw Error(A(92));
        if (Gn(l)) {
          if (1 < l.length) throw Error(A(93));
          l = l[0];
        }
        r = l;
      }
      r == null && (r = ""), l = r;
    }
    n._wrapperState = { initialValue: nt(l) };
  }
  function Ya(n, r) {
    var l = nt(r.value), o = nt(r.defaultValue);
    l != null && (l = "" + l, l !== n.value && (n.value = l), r.defaultValue == null && n.defaultValue !== l && (n.defaultValue = l)), o != null && (n.defaultValue = "" + o);
  }
  function On(n) {
    var r = n.textContent;
    r === n._wrapperState.initialValue && r !== "" && r !== null && (n.value = r);
  }
  function gr(n) {
    switch (n) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function sa(n, r) {
    return n == null || n === "http://www.w3.org/1999/xhtml" ? gr(r) : n === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : n;
  }
  var Ia, ci = function(n) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, l, o, c) {
      MSApp.execUnsafeLocalFunction(function() {
        return n(r, l, o, c);
      });
    } : n;
  }(function(n, r) {
    if (n.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in n) n.innerHTML = r;
    else {
      for (Ia = Ia || document.createElement("div"), Ia.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = Ia.firstChild; n.firstChild; ) n.removeChild(n.firstChild);
      for (; r.firstChild; ) n.appendChild(r.firstChild);
    }
  });
  function ee(n, r) {
    if (r) {
      var l = n.firstChild;
      if (l && l === n.lastChild && l.nodeType === 3) {
        l.nodeValue = r;
        return;
      }
    }
    n.textContent = r;
  }
  var Te = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, rt = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Te).forEach(function(n) {
    rt.forEach(function(r) {
      r = r + n.charAt(0).toUpperCase() + n.substring(1), Te[r] = Te[n];
    });
  });
  function At(n, r, l) {
    return r == null || typeof r == "boolean" || r === "" ? "" : l || typeof r != "number" || r === 0 || Te.hasOwnProperty(n) && Te[n] ? ("" + r).trim() : r + "px";
  }
  function Zt(n, r) {
    n = n.style;
    for (var l in r) if (r.hasOwnProperty(l)) {
      var o = l.indexOf("--") === 0, c = At(l, r[l], o);
      l === "float" && (l = "cssFloat"), o ? n.setProperty(l, c) : n[l] = c;
    }
  }
  var pn = ne({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function un(n, r) {
    if (r) {
      if (pn[n] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(A(137, n));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(A(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(A(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(A(62));
    }
  }
  function qn(n, r) {
    if (n.indexOf("-") === -1) return typeof r.is == "string";
    switch (n) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var en = null;
  function Bt(n) {
    return n = n.target || n.srcElement || window, n.correspondingUseElement && (n = n.correspondingUseElement), n.nodeType === 3 ? n.parentNode : n;
  }
  var $t = null, ca = null, Sr = null;
  function Ta(n) {
    if (n = _e(n)) {
      if (typeof $t != "function") throw Error(A(280));
      var r = n.stateNode;
      r && (r = hn(r), $t(n.stateNode, n.type, r));
    }
  }
  function Fi(n) {
    ca ? Sr ? Sr.push(n) : Sr = [n] : ca = n;
  }
  function Jl() {
    if (ca) {
      var n = ca, r = Sr;
      if (Sr = ca = null, Ta(n), r) for (n = 0; n < r.length; n++) Ta(r[n]);
    }
  }
  function Zl(n, r) {
    return n(r);
  }
  function dl() {
  }
  var pl = !1;
  function eu(n, r, l) {
    if (pl) return n(r, l);
    pl = !0;
    try {
      return Zl(n, r, l);
    } finally {
      pl = !1, (ca !== null || Sr !== null) && (dl(), Jl());
    }
  }
  function xr(n, r) {
    var l = n.stateNode;
    if (l === null) return null;
    var o = hn(l);
    if (o === null) return null;
    l = o[r];
    e: switch (r) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (o = !o.disabled) || (n = n.type, o = !(n === "button" || n === "input" || n === "select" || n === "textarea")), n = !o;
        break e;
      default:
        n = !1;
    }
    if (n) return null;
    if (l && typeof l != "function") throw Error(A(231, r, typeof l));
    return l;
  }
  var br = !1;
  if (jt) try {
    var nr = {};
    Object.defineProperty(nr, "passive", { get: function() {
      br = !0;
    } }), window.addEventListener("test", nr, nr), window.removeEventListener("test", nr, nr);
  } catch {
    br = !1;
  }
  function fi(n, r, l, o, c, d, m, E, T) {
    var U = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(l, U);
    } catch (Q) {
      this.onError(Q);
    }
  }
  var Qa = !1, di = null, pi = !1, R = null, $ = { onError: function(n) {
    Qa = !0, di = n;
  } };
  function ae(n, r, l, o, c, d, m, E, T) {
    Qa = !1, di = null, fi.apply($, arguments);
  }
  function he(n, r, l, o, c, d, m, E, T) {
    if (ae.apply(this, arguments), Qa) {
      if (Qa) {
        var U = di;
        Qa = !1, di = null;
      } else throw Error(A(198));
      pi || (pi = !0, R = U);
    }
  }
  function Ge(n) {
    var r = n, l = n;
    if (n.alternate) for (; r.return; ) r = r.return;
    else {
      n = r;
      do
        r = n, r.flags & 4098 && (l = r.return), n = r.return;
      while (n);
    }
    return r.tag === 3 ? l : null;
  }
  function $e(n) {
    if (n.tag === 13) {
      var r = n.memoizedState;
      if (r === null && (n = n.alternate, n !== null && (r = n.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function ft(n) {
    if (Ge(n) !== n) throw Error(A(188));
  }
  function ot(n) {
    var r = n.alternate;
    if (!r) {
      if (r = Ge(n), r === null) throw Error(A(188));
      return r !== n ? null : n;
    }
    for (var l = n, o = r; ; ) {
      var c = l.return;
      if (c === null) break;
      var d = c.alternate;
      if (d === null) {
        if (o = c.return, o !== null) {
          l = o;
          continue;
        }
        break;
      }
      if (c.child === d.child) {
        for (d = c.child; d; ) {
          if (d === l) return ft(c), n;
          if (d === o) return ft(c), r;
          d = d.sibling;
        }
        throw Error(A(188));
      }
      if (l.return !== o.return) l = c, o = d;
      else {
        for (var m = !1, E = c.child; E; ) {
          if (E === l) {
            m = !0, l = c, o = d;
            break;
          }
          if (E === o) {
            m = !0, o = c, l = d;
            break;
          }
          E = E.sibling;
        }
        if (!m) {
          for (E = d.child; E; ) {
            if (E === l) {
              m = !0, l = d, o = c;
              break;
            }
            if (E === o) {
              m = !0, o = d, l = c;
              break;
            }
            E = E.sibling;
          }
          if (!m) throw Error(A(189));
        }
      }
      if (l.alternate !== o) throw Error(A(190));
    }
    if (l.tag !== 3) throw Error(A(188));
    return l.stateNode.current === l ? n : r;
  }
  function Rn(n) {
    return n = ot(n), n !== null ? tn(n) : null;
  }
  function tn(n) {
    if (n.tag === 5 || n.tag === 6) return n;
    for (n = n.child; n !== null; ) {
      var r = tn(n);
      if (r !== null) return r;
      n = n.sibling;
    }
    return null;
  }
  var on = X.unstable_scheduleCallback, rr = X.unstable_cancelCallback, Wa = X.unstable_shouldYield, Ga = X.unstable_requestPaint, qe = X.unstable_now, et = X.unstable_getCurrentPriorityLevel, qa = X.unstable_ImmediatePriority, tu = X.unstable_UserBlockingPriority, nu = X.unstable_NormalPriority, vl = X.unstable_LowPriority, Wu = X.unstable_IdlePriority, hl = null, Ir = null;
  function Qo(n) {
    if (Ir && typeof Ir.onCommitFiberRoot == "function") try {
      Ir.onCommitFiberRoot(hl, n, void 0, (n.current.flags & 128) === 128);
    } catch {
    }
  }
  var _r = Math.clz32 ? Math.clz32 : Gu, uc = Math.log, oc = Math.LN2;
  function Gu(n) {
    return n >>>= 0, n === 0 ? 32 : 31 - (uc(n) / oc | 0) | 0;
  }
  var ml = 64, fa = 4194304;
  function Xa(n) {
    switch (n & -n) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return n & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return n;
    }
  }
  function Ka(n, r) {
    var l = n.pendingLanes;
    if (l === 0) return 0;
    var o = 0, c = n.suspendedLanes, d = n.pingedLanes, m = l & 268435455;
    if (m !== 0) {
      var E = m & ~c;
      E !== 0 ? o = Xa(E) : (d &= m, d !== 0 && (o = Xa(d)));
    } else m = l & ~c, m !== 0 ? o = Xa(m) : d !== 0 && (o = Xa(d));
    if (o === 0) return 0;
    if (r !== 0 && r !== o && !(r & c) && (c = o & -o, d = r & -r, c >= d || c === 16 && (d & 4194240) !== 0)) return r;
    if (o & 4 && (o |= l & 16), r = n.entangledLanes, r !== 0) for (n = n.entanglements, r &= o; 0 < r; ) l = 31 - _r(r), c = 1 << l, o |= n[l], r &= ~c;
    return o;
  }
  function qu(n, r) {
    switch (n) {
      case 1:
      case 2:
      case 4:
        return r + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function ru(n, r) {
    for (var l = n.suspendedLanes, o = n.pingedLanes, c = n.expirationTimes, d = n.pendingLanes; 0 < d; ) {
      var m = 31 - _r(d), E = 1 << m, T = c[m];
      T === -1 ? (!(E & l) || E & o) && (c[m] = qu(E, r)) : T <= r && (n.expiredLanes |= E), d &= ~E;
    }
  }
  function yl(n) {
    return n = n.pendingLanes & -1073741825, n !== 0 ? n : n & 1073741824 ? 1073741824 : 0;
  }
  function Xu() {
    var n = ml;
    return ml <<= 1, !(ml & 4194240) && (ml = 64), n;
  }
  function Ku(n) {
    for (var r = [], l = 0; 31 > l; l++) r.push(n);
    return r;
  }
  function Hi(n, r, l) {
    n.pendingLanes |= r, r !== 536870912 && (n.suspendedLanes = 0, n.pingedLanes = 0), n = n.eventTimes, r = 31 - _r(r), n[r] = l;
  }
  function Wf(n, r) {
    var l = n.pendingLanes & ~r;
    n.pendingLanes = r, n.suspendedLanes = 0, n.pingedLanes = 0, n.expiredLanes &= r, n.mutableReadLanes &= r, n.entangledLanes &= r, r = n.entanglements;
    var o = n.eventTimes;
    for (n = n.expirationTimes; 0 < l; ) {
      var c = 31 - _r(l), d = 1 << c;
      r[c] = 0, o[c] = -1, n[c] = -1, l &= ~d;
    }
  }
  function Pi(n, r) {
    var l = n.entangledLanes |= r;
    for (n = n.entanglements; l; ) {
      var o = 31 - _r(l), c = 1 << o;
      c & r | n[o] & r && (n[o] |= r), l &= ~c;
    }
  }
  var kt = 0;
  function Ju(n) {
    return n &= -n, 1 < n ? 4 < n ? n & 268435455 ? 16 : 536870912 : 4 : 1;
  }
  var Rt, Wo, vi, Be, Zu, ar = !1, hi = [], Dr = null, mi = null, sn = null, Yt = /* @__PURE__ */ new Map(), gl = /* @__PURE__ */ new Map(), $n = [], kr = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function wa(n, r) {
    switch (n) {
      case "focusin":
      case "focusout":
        Dr = null;
        break;
      case "dragenter":
      case "dragleave":
        mi = null;
        break;
      case "mouseover":
      case "mouseout":
        sn = null;
        break;
      case "pointerover":
      case "pointerout":
        Yt.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        gl.delete(r.pointerId);
    }
  }
  function au(n, r, l, o, c, d) {
    return n === null || n.nativeEvent !== d ? (n = { blockedOn: r, domEventName: l, eventSystemFlags: o, nativeEvent: d, targetContainers: [c] }, r !== null && (r = _e(r), r !== null && Wo(r)), n) : (n.eventSystemFlags |= o, r = n.targetContainers, c !== null && r.indexOf(c) === -1 && r.push(c), n);
  }
  function Go(n, r, l, o, c) {
    switch (r) {
      case "focusin":
        return Dr = au(Dr, n, r, l, o, c), !0;
      case "dragenter":
        return mi = au(mi, n, r, l, o, c), !0;
      case "mouseover":
        return sn = au(sn, n, r, l, o, c), !0;
      case "pointerover":
        var d = c.pointerId;
        return Yt.set(d, au(Yt.get(d) || null, n, r, l, o, c)), !0;
      case "gotpointercapture":
        return d = c.pointerId, gl.set(d, au(gl.get(d) || null, n, r, l, o, c)), !0;
    }
    return !1;
  }
  function qo(n) {
    var r = pu(n.target);
    if (r !== null) {
      var l = Ge(r);
      if (l !== null) {
        if (r = l.tag, r === 13) {
          if (r = $e(l), r !== null) {
            n.blockedOn = r, Zu(n.priority, function() {
              vi(l);
            });
            return;
          }
        } else if (r === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          n.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    n.blockedOn = null;
  }
  function Sl(n) {
    if (n.blockedOn !== null) return !1;
    for (var r = n.targetContainers; 0 < r.length; ) {
      var l = no(n.domEventName, n.eventSystemFlags, r[0], n.nativeEvent);
      if (l === null) {
        l = n.nativeEvent;
        var o = new l.constructor(l.type, l);
        en = o, l.target.dispatchEvent(o), en = null;
      } else return r = _e(l), r !== null && Wo(r), n.blockedOn = l, !1;
      r.shift();
    }
    return !0;
  }
  function iu(n, r, l) {
    Sl(n) && l.delete(r);
  }
  function Gf() {
    ar = !1, Dr !== null && Sl(Dr) && (Dr = null), mi !== null && Sl(mi) && (mi = null), sn !== null && Sl(sn) && (sn = null), Yt.forEach(iu), gl.forEach(iu);
  }
  function xa(n, r) {
    n.blockedOn === r && (n.blockedOn = null, ar || (ar = !0, X.unstable_scheduleCallback(X.unstable_NormalPriority, Gf)));
  }
  function Ja(n) {
    function r(c) {
      return xa(c, n);
    }
    if (0 < hi.length) {
      xa(hi[0], n);
      for (var l = 1; l < hi.length; l++) {
        var o = hi[l];
        o.blockedOn === n && (o.blockedOn = null);
      }
    }
    for (Dr !== null && xa(Dr, n), mi !== null && xa(mi, n), sn !== null && xa(sn, n), Yt.forEach(r), gl.forEach(r), l = 0; l < $n.length; l++) o = $n[l], o.blockedOn === n && (o.blockedOn = null);
    for (; 0 < $n.length && (l = $n[0], l.blockedOn === null); ) qo(l), l.blockedOn === null && $n.shift();
  }
  var yi = ht.ReactCurrentBatchConfig, ba = !0;
  function eo(n, r, l, o) {
    var c = kt, d = yi.transition;
    yi.transition = null;
    try {
      kt = 1, El(n, r, l, o);
    } finally {
      kt = c, yi.transition = d;
    }
  }
  function to(n, r, l, o) {
    var c = kt, d = yi.transition;
    yi.transition = null;
    try {
      kt = 4, El(n, r, l, o);
    } finally {
      kt = c, yi.transition = d;
    }
  }
  function El(n, r, l, o) {
    if (ba) {
      var c = no(n, r, l, o);
      if (c === null) Ec(n, r, o, lu, l), wa(n, o);
      else if (Go(c, n, r, l, o)) o.stopPropagation();
      else if (wa(n, o), r & 4 && -1 < kr.indexOf(n)) {
        for (; c !== null; ) {
          var d = _e(c);
          if (d !== null && Rt(d), d = no(n, r, l, o), d === null && Ec(n, r, o, lu, l), d === c) break;
          c = d;
        }
        c !== null && o.stopPropagation();
      } else Ec(n, r, o, null, l);
    }
  }
  var lu = null;
  function no(n, r, l, o) {
    if (lu = null, n = Bt(o), n = pu(n), n !== null) if (r = Ge(n), r === null) n = null;
    else if (l = r.tag, l === 13) {
      if (n = $e(r), n !== null) return n;
      n = null;
    } else if (l === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      n = null;
    } else r !== n && (n = null);
    return lu = n, null;
  }
  function ro(n) {
    switch (n) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (et()) {
          case qa:
            return 1;
          case tu:
            return 4;
          case nu:
          case vl:
            return 16;
          case Wu:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Za = null, h = null, C = null;
  function N() {
    if (C) return C;
    var n, r = h, l = r.length, o, c = "value" in Za ? Za.value : Za.textContent, d = c.length;
    for (n = 0; n < l && r[n] === c[n]; n++) ;
    var m = l - n;
    for (o = 1; o <= m && r[l - o] === c[d - o]; o++) ;
    return C = c.slice(n, 1 < o ? 1 - o : void 0);
  }
  function j(n) {
    var r = n.keyCode;
    return "charCode" in n ? (n = n.charCode, n === 0 && r === 13 && (n = 13)) : n = r, n === 10 && (n = 13), 32 <= n || n === 13 ? n : 0;
  }
  function K() {
    return !0;
  }
  function Oe() {
    return !1;
  }
  function re(n) {
    function r(l, o, c, d, m) {
      this._reactName = l, this._targetInst = c, this.type = o, this.nativeEvent = d, this.target = m, this.currentTarget = null;
      for (var E in n) n.hasOwnProperty(E) && (l = n[E], this[E] = l ? l(d) : d[E]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? K : Oe, this.isPropagationStopped = Oe, this;
    }
    return ne(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var l = this.nativeEvent;
      l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = K);
    }, stopPropagation: function() {
      var l = this.nativeEvent;
      l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = K);
    }, persist: function() {
    }, isPersistent: K }), r;
  }
  var Ne = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(n) {
    return n.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, dt = re(Ne), Tt = ne({}, Ne, { view: 0, detail: 0 }), nn = re(Tt), It, at, Qt, vn = ne({}, Tt, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Zf, button: 0, buttons: 0, relatedTarget: function(n) {
    return n.relatedTarget === void 0 ? n.fromElement === n.srcElement ? n.toElement : n.fromElement : n.relatedTarget;
  }, movementX: function(n) {
    return "movementX" in n ? n.movementX : (n !== Qt && (Qt && n.type === "mousemove" ? (It = n.screenX - Qt.screenX, at = n.screenY - Qt.screenY) : at = It = 0, Qt = n), It);
  }, movementY: function(n) {
    return "movementY" in n ? n.movementY : at;
  } }), Cl = re(vn), Xo = ne({}, vn, { dataTransfer: 0 }), Vi = re(Xo), Ko = ne({}, Tt, { relatedTarget: 0 }), uu = re(Ko), qf = ne({}, Ne, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), sc = re(qf), Xf = ne({}, Ne, { clipboardData: function(n) {
    return "clipboardData" in n ? n.clipboardData : window.clipboardData;
  } }), av = re(Xf), Kf = ne({}, Ne, { data: 0 }), Jf = re(Kf), iv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, lv = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Jm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Bi(n) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(n) : (n = Jm[n]) ? !!r[n] : !1;
  }
  function Zf() {
    return Bi;
  }
  var ed = ne({}, Tt, { key: function(n) {
    if (n.key) {
      var r = iv[n.key] || n.key;
      if (r !== "Unidentified") return r;
    }
    return n.type === "keypress" ? (n = j(n), n === 13 ? "Enter" : String.fromCharCode(n)) : n.type === "keydown" || n.type === "keyup" ? lv[n.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Zf, charCode: function(n) {
    return n.type === "keypress" ? j(n) : 0;
  }, keyCode: function(n) {
    return n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  }, which: function(n) {
    return n.type === "keypress" ? j(n) : n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  } }), td = re(ed), nd = ne({}, vn, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), uv = re(nd), cc = ne({}, Tt, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Zf }), ov = re(cc), Qr = ne({}, Ne, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), $i = re(Qr), Ln = ne({}, vn, {
    deltaX: function(n) {
      return "deltaX" in n ? n.deltaX : "wheelDeltaX" in n ? -n.wheelDeltaX : 0;
    },
    deltaY: function(n) {
      return "deltaY" in n ? n.deltaY : "wheelDeltaY" in n ? -n.wheelDeltaY : "wheelDelta" in n ? -n.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Yi = re(Ln), rd = [9, 13, 27, 32], ao = jt && "CompositionEvent" in window, Jo = null;
  jt && "documentMode" in document && (Jo = document.documentMode);
  var Zo = jt && "TextEvent" in window && !Jo, sv = jt && (!ao || Jo && 8 < Jo && 11 >= Jo), cv = " ", fc = !1;
  function fv(n, r) {
    switch (n) {
      case "keyup":
        return rd.indexOf(r.keyCode) !== -1;
      case "keydown":
        return r.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function dv(n) {
    return n = n.detail, typeof n == "object" && "data" in n ? n.data : null;
  }
  var io = !1;
  function pv(n, r) {
    switch (n) {
      case "compositionend":
        return dv(r);
      case "keypress":
        return r.which !== 32 ? null : (fc = !0, cv);
      case "textInput":
        return n = r.data, n === cv && fc ? null : n;
      default:
        return null;
    }
  }
  function Zm(n, r) {
    if (io) return n === "compositionend" || !ao && fv(n, r) ? (n = N(), C = h = Za = null, io = !1, n) : null;
    switch (n) {
      case "paste":
        return null;
      case "keypress":
        if (!(r.ctrlKey || r.altKey || r.metaKey) || r.ctrlKey && r.altKey) {
          if (r.char && 1 < r.char.length) return r.char;
          if (r.which) return String.fromCharCode(r.which);
        }
        return null;
      case "compositionend":
        return sv && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var ey = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function vv(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r === "input" ? !!ey[n.type] : r === "textarea";
  }
  function ad(n, r, l, o) {
    Fi(o), r = is(r, "onChange"), 0 < r.length && (l = new dt("onChange", "change", null, l, o), n.push({ event: l, listeners: r }));
  }
  var gi = null, ou = null;
  function hv(n) {
    fu(n, 0);
  }
  function es(n) {
    var r = ti(n);
    if (wr(r)) return n;
  }
  function ty(n, r) {
    if (n === "change") return r;
  }
  var mv = !1;
  if (jt) {
    var id;
    if (jt) {
      var ld = "oninput" in document;
      if (!ld) {
        var yv = document.createElement("div");
        yv.setAttribute("oninput", "return;"), ld = typeof yv.oninput == "function";
      }
      id = ld;
    } else id = !1;
    mv = id && (!document.documentMode || 9 < document.documentMode);
  }
  function gv() {
    gi && (gi.detachEvent("onpropertychange", Sv), ou = gi = null);
  }
  function Sv(n) {
    if (n.propertyName === "value" && es(ou)) {
      var r = [];
      ad(r, ou, n, Bt(n)), eu(hv, r);
    }
  }
  function ny(n, r, l) {
    n === "focusin" ? (gv(), gi = r, ou = l, gi.attachEvent("onpropertychange", Sv)) : n === "focusout" && gv();
  }
  function Ev(n) {
    if (n === "selectionchange" || n === "keyup" || n === "keydown") return es(ou);
  }
  function ry(n, r) {
    if (n === "click") return es(r);
  }
  function Cv(n, r) {
    if (n === "input" || n === "change") return es(r);
  }
  function ay(n, r) {
    return n === r && (n !== 0 || 1 / n === 1 / r) || n !== n && r !== r;
  }
  var ei = typeof Object.is == "function" ? Object.is : ay;
  function ts(n, r) {
    if (ei(n, r)) return !0;
    if (typeof n != "object" || n === null || typeof r != "object" || r === null) return !1;
    var l = Object.keys(n), o = Object.keys(r);
    if (l.length !== o.length) return !1;
    for (o = 0; o < l.length; o++) {
      var c = l[o];
      if (!se.call(r, c) || !ei(n[c], r[c])) return !1;
    }
    return !0;
  }
  function Rv(n) {
    for (; n && n.firstChild; ) n = n.firstChild;
    return n;
  }
  function dc(n, r) {
    var l = Rv(n);
    n = 0;
    for (var o; l; ) {
      if (l.nodeType === 3) {
        if (o = n + l.textContent.length, n <= r && o >= r) return { node: l, offset: r - n };
        n = o;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = Rv(l);
    }
  }
  function Rl(n, r) {
    return n && r ? n === r ? !0 : n && n.nodeType === 3 ? !1 : r && r.nodeType === 3 ? Rl(n, r.parentNode) : "contains" in n ? n.contains(r) : n.compareDocumentPosition ? !!(n.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function ns() {
    for (var n = window, r = En(); r instanceof n.HTMLIFrameElement; ) {
      try {
        var l = typeof r.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) n = r.contentWindow;
      else break;
      r = En(n.document);
    }
    return r;
  }
  function pc(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r && (r === "input" && (n.type === "text" || n.type === "search" || n.type === "tel" || n.type === "url" || n.type === "password") || r === "textarea" || n.contentEditable === "true");
  }
  function lo(n) {
    var r = ns(), l = n.focusedElem, o = n.selectionRange;
    if (r !== l && l && l.ownerDocument && Rl(l.ownerDocument.documentElement, l)) {
      if (o !== null && pc(l)) {
        if (r = o.start, n = o.end, n === void 0 && (n = r), "selectionStart" in l) l.selectionStart = r, l.selectionEnd = Math.min(n, l.value.length);
        else if (n = (r = l.ownerDocument || document) && r.defaultView || window, n.getSelection) {
          n = n.getSelection();
          var c = l.textContent.length, d = Math.min(o.start, c);
          o = o.end === void 0 ? d : Math.min(o.end, c), !n.extend && d > o && (c = o, o = d, d = c), c = dc(l, d);
          var m = dc(
            l,
            o
          );
          c && m && (n.rangeCount !== 1 || n.anchorNode !== c.node || n.anchorOffset !== c.offset || n.focusNode !== m.node || n.focusOffset !== m.offset) && (r = r.createRange(), r.setStart(c.node, c.offset), n.removeAllRanges(), d > o ? (n.addRange(r), n.extend(m.node, m.offset)) : (r.setEnd(m.node, m.offset), n.addRange(r)));
        }
      }
      for (r = [], n = l; n = n.parentNode; ) n.nodeType === 1 && r.push({ element: n, left: n.scrollLeft, top: n.scrollTop });
      for (typeof l.focus == "function" && l.focus(), l = 0; l < r.length; l++) n = r[l], n.element.scrollLeft = n.left, n.element.scrollTop = n.top;
    }
  }
  var iy = jt && "documentMode" in document && 11 >= document.documentMode, uo = null, ud = null, rs = null, od = !1;
  function sd(n, r, l) {
    var o = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    od || uo == null || uo !== En(o) || (o = uo, "selectionStart" in o && pc(o) ? o = { start: o.selectionStart, end: o.selectionEnd } : (o = (o.ownerDocument && o.ownerDocument.defaultView || window).getSelection(), o = { anchorNode: o.anchorNode, anchorOffset: o.anchorOffset, focusNode: o.focusNode, focusOffset: o.focusOffset }), rs && ts(rs, o) || (rs = o, o = is(ud, "onSelect"), 0 < o.length && (r = new dt("onSelect", "select", null, r, l), n.push({ event: r, listeners: o }), r.target = uo)));
  }
  function vc(n, r) {
    var l = {};
    return l[n.toLowerCase()] = r.toLowerCase(), l["Webkit" + n] = "webkit" + r, l["Moz" + n] = "moz" + r, l;
  }
  var su = { animationend: vc("Animation", "AnimationEnd"), animationiteration: vc("Animation", "AnimationIteration"), animationstart: vc("Animation", "AnimationStart"), transitionend: vc("Transition", "TransitionEnd") }, ir = {}, cd = {};
  jt && (cd = document.createElement("div").style, "AnimationEvent" in window || (delete su.animationend.animation, delete su.animationiteration.animation, delete su.animationstart.animation), "TransitionEvent" in window || delete su.transitionend.transition);
  function hc(n) {
    if (ir[n]) return ir[n];
    if (!su[n]) return n;
    var r = su[n], l;
    for (l in r) if (r.hasOwnProperty(l) && l in cd) return ir[n] = r[l];
    return n;
  }
  var Tv = hc("animationend"), wv = hc("animationiteration"), xv = hc("animationstart"), bv = hc("transitionend"), fd = /* @__PURE__ */ new Map(), mc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function _a(n, r) {
    fd.set(n, r), Ie(r, [n]);
  }
  for (var dd = 0; dd < mc.length; dd++) {
    var cu = mc[dd], ly = cu.toLowerCase(), uy = cu[0].toUpperCase() + cu.slice(1);
    _a(ly, "on" + uy);
  }
  _a(Tv, "onAnimationEnd"), _a(wv, "onAnimationIteration"), _a(xv, "onAnimationStart"), _a("dblclick", "onDoubleClick"), _a("focusin", "onFocus"), _a("focusout", "onBlur"), _a(bv, "onTransitionEnd"), S("onMouseEnter", ["mouseout", "mouseover"]), S("onMouseLeave", ["mouseout", "mouseover"]), S("onPointerEnter", ["pointerout", "pointerover"]), S("onPointerLeave", ["pointerout", "pointerover"]), Ie("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Ie("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Ie("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), Ie("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Ie("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Ie("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var as = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), pd = new Set("cancel close invalid load scroll toggle".split(" ").concat(as));
  function yc(n, r, l) {
    var o = n.type || "unknown-event";
    n.currentTarget = l, he(o, r, void 0, n), n.currentTarget = null;
  }
  function fu(n, r) {
    r = (r & 4) !== 0;
    for (var l = 0; l < n.length; l++) {
      var o = n[l], c = o.event;
      o = o.listeners;
      e: {
        var d = void 0;
        if (r) for (var m = o.length - 1; 0 <= m; m--) {
          var E = o[m], T = E.instance, U = E.currentTarget;
          if (E = E.listener, T !== d && c.isPropagationStopped()) break e;
          yc(c, E, U), d = T;
        }
        else for (m = 0; m < o.length; m++) {
          if (E = o[m], T = E.instance, U = E.currentTarget, E = E.listener, T !== d && c.isPropagationStopped()) break e;
          yc(c, E, U), d = T;
        }
      }
    }
    if (pi) throw n = R, pi = !1, R = null, n;
  }
  function Ht(n, r) {
    var l = r[os];
    l === void 0 && (l = r[os] = /* @__PURE__ */ new Set());
    var o = n + "__bubble";
    l.has(o) || (_v(r, n, 2, !1), l.add(o));
  }
  function gc(n, r, l) {
    var o = 0;
    r && (o |= 4), _v(l, n, o, r);
  }
  var Sc = "_reactListening" + Math.random().toString(36).slice(2);
  function oo(n) {
    if (!n[Sc]) {
      n[Sc] = !0, wt.forEach(function(l) {
        l !== "selectionchange" && (pd.has(l) || gc(l, !1, n), gc(l, !0, n));
      });
      var r = n.nodeType === 9 ? n : n.ownerDocument;
      r === null || r[Sc] || (r[Sc] = !0, gc("selectionchange", !1, r));
    }
  }
  function _v(n, r, l, o) {
    switch (ro(r)) {
      case 1:
        var c = eo;
        break;
      case 4:
        c = to;
        break;
      default:
        c = El;
    }
    l = c.bind(null, r, l, n), c = void 0, !br || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (c = !0), o ? c !== void 0 ? n.addEventListener(r, l, { capture: !0, passive: c }) : n.addEventListener(r, l, !0) : c !== void 0 ? n.addEventListener(r, l, { passive: c }) : n.addEventListener(r, l, !1);
  }
  function Ec(n, r, l, o, c) {
    var d = o;
    if (!(r & 1) && !(r & 2) && o !== null) e: for (; ; ) {
      if (o === null) return;
      var m = o.tag;
      if (m === 3 || m === 4) {
        var E = o.stateNode.containerInfo;
        if (E === c || E.nodeType === 8 && E.parentNode === c) break;
        if (m === 4) for (m = o.return; m !== null; ) {
          var T = m.tag;
          if ((T === 3 || T === 4) && (T = m.stateNode.containerInfo, T === c || T.nodeType === 8 && T.parentNode === c)) return;
          m = m.return;
        }
        for (; E !== null; ) {
          if (m = pu(E), m === null) return;
          if (T = m.tag, T === 5 || T === 6) {
            o = d = m;
            continue e;
          }
          E = E.parentNode;
        }
      }
      o = o.return;
    }
    eu(function() {
      var U = d, Q = Bt(l), G = [];
      e: {
        var I = fd.get(n);
        if (I !== void 0) {
          var ce = dt, me = n;
          switch (n) {
            case "keypress":
              if (j(l) === 0) break e;
            case "keydown":
            case "keyup":
              ce = td;
              break;
            case "focusin":
              me = "focus", ce = uu;
              break;
            case "focusout":
              me = "blur", ce = uu;
              break;
            case "beforeblur":
            case "afterblur":
              ce = uu;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              ce = Cl;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              ce = Vi;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              ce = ov;
              break;
            case Tv:
            case wv:
            case xv:
              ce = sc;
              break;
            case bv:
              ce = $i;
              break;
            case "scroll":
              ce = nn;
              break;
            case "wheel":
              ce = Yi;
              break;
            case "copy":
            case "cut":
            case "paste":
              ce = av;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              ce = uv;
          }
          var Ee = (r & 4) !== 0, _n = !Ee && n === "scroll", D = Ee ? I !== null ? I + "Capture" : null : I;
          Ee = [];
          for (var x = U, L; x !== null; ) {
            L = x;
            var W = L.stateNode;
            if (L.tag === 5 && W !== null && (L = W, D !== null && (W = xr(x, D), W != null && Ee.push(so(x, W, L)))), _n) break;
            x = x.return;
          }
          0 < Ee.length && (I = new ce(I, me, null, l, Q), G.push({ event: I, listeners: Ee }));
        }
      }
      if (!(r & 7)) {
        e: {
          if (I = n === "mouseover" || n === "pointerover", ce = n === "mouseout" || n === "pointerout", I && l !== en && (me = l.relatedTarget || l.fromElement) && (pu(me) || me[Ii])) break e;
          if ((ce || I) && (I = Q.window === Q ? Q : (I = Q.ownerDocument) ? I.defaultView || I.parentWindow : window, ce ? (me = l.relatedTarget || l.toElement, ce = U, me = me ? pu(me) : null, me !== null && (_n = Ge(me), me !== _n || me.tag !== 5 && me.tag !== 6) && (me = null)) : (ce = null, me = U), ce !== me)) {
            if (Ee = Cl, W = "onMouseLeave", D = "onMouseEnter", x = "mouse", (n === "pointerout" || n === "pointerover") && (Ee = uv, W = "onPointerLeave", D = "onPointerEnter", x = "pointer"), _n = ce == null ? I : ti(ce), L = me == null ? I : ti(me), I = new Ee(W, x + "leave", ce, l, Q), I.target = _n, I.relatedTarget = L, W = null, pu(Q) === U && (Ee = new Ee(D, x + "enter", me, l, Q), Ee.target = L, Ee.relatedTarget = _n, W = Ee), _n = W, ce && me) t: {
              for (Ee = ce, D = me, x = 0, L = Ee; L; L = Tl(L)) x++;
              for (L = 0, W = D; W; W = Tl(W)) L++;
              for (; 0 < x - L; ) Ee = Tl(Ee), x--;
              for (; 0 < L - x; ) D = Tl(D), L--;
              for (; x--; ) {
                if (Ee === D || D !== null && Ee === D.alternate) break t;
                Ee = Tl(Ee), D = Tl(D);
              }
              Ee = null;
            }
            else Ee = null;
            ce !== null && Dv(G, I, ce, Ee, !1), me !== null && _n !== null && Dv(G, _n, me, Ee, !0);
          }
        }
        e: {
          if (I = U ? ti(U) : window, ce = I.nodeName && I.nodeName.toLowerCase(), ce === "select" || ce === "input" && I.type === "file") var ye = ty;
          else if (vv(I)) if (mv) ye = Cv;
          else {
            ye = Ev;
            var Me = ny;
          }
          else (ce = I.nodeName) && ce.toLowerCase() === "input" && (I.type === "checkbox" || I.type === "radio") && (ye = ry);
          if (ye && (ye = ye(n, U))) {
            ad(G, ye, l, Q);
            break e;
          }
          Me && Me(n, I, U), n === "focusout" && (Me = I._wrapperState) && Me.controlled && I.type === "number" && oa(I, "number", I.value);
        }
        switch (Me = U ? ti(U) : window, n) {
          case "focusin":
            (vv(Me) || Me.contentEditable === "true") && (uo = Me, ud = U, rs = null);
            break;
          case "focusout":
            rs = ud = uo = null;
            break;
          case "mousedown":
            od = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            od = !1, sd(G, l, Q);
            break;
          case "selectionchange":
            if (iy) break;
          case "keydown":
          case "keyup":
            sd(G, l, Q);
        }
        var Ue;
        if (ao) e: {
          switch (n) {
            case "compositionstart":
              var Ve = "onCompositionStart";
              break e;
            case "compositionend":
              Ve = "onCompositionEnd";
              break e;
            case "compositionupdate":
              Ve = "onCompositionUpdate";
              break e;
          }
          Ve = void 0;
        }
        else io ? fv(n, l) && (Ve = "onCompositionEnd") : n === "keydown" && l.keyCode === 229 && (Ve = "onCompositionStart");
        Ve && (sv && l.locale !== "ko" && (io || Ve !== "onCompositionStart" ? Ve === "onCompositionEnd" && io && (Ue = N()) : (Za = Q, h = "value" in Za ? Za.value : Za.textContent, io = !0)), Me = is(U, Ve), 0 < Me.length && (Ve = new Jf(Ve, n, null, l, Q), G.push({ event: Ve, listeners: Me }), Ue ? Ve.data = Ue : (Ue = dv(l), Ue !== null && (Ve.data = Ue)))), (Ue = Zo ? pv(n, l) : Zm(n, l)) && (U = is(U, "onBeforeInput"), 0 < U.length && (Q = new Jf("onBeforeInput", "beforeinput", null, l, Q), G.push({ event: Q, listeners: U }), Q.data = Ue));
      }
      fu(G, r);
    });
  }
  function so(n, r, l) {
    return { instance: n, listener: r, currentTarget: l };
  }
  function is(n, r) {
    for (var l = r + "Capture", o = []; n !== null; ) {
      var c = n, d = c.stateNode;
      c.tag === 5 && d !== null && (c = d, d = xr(n, l), d != null && o.unshift(so(n, d, c)), d = xr(n, r), d != null && o.push(so(n, d, c))), n = n.return;
    }
    return o;
  }
  function Tl(n) {
    if (n === null) return null;
    do
      n = n.return;
    while (n && n.tag !== 5);
    return n || null;
  }
  function Dv(n, r, l, o, c) {
    for (var d = r._reactName, m = []; l !== null && l !== o; ) {
      var E = l, T = E.alternate, U = E.stateNode;
      if (T !== null && T === o) break;
      E.tag === 5 && U !== null && (E = U, c ? (T = xr(l, d), T != null && m.unshift(so(l, T, E))) : c || (T = xr(l, d), T != null && m.push(so(l, T, E)))), l = l.return;
    }
    m.length !== 0 && n.push({ event: r, listeners: m });
  }
  var kv = /\r\n?/g, oy = /\u0000|\uFFFD/g;
  function Ov(n) {
    return (typeof n == "string" ? n : "" + n).replace(kv, `
`).replace(oy, "");
  }
  function Cc(n, r, l) {
    if (r = Ov(r), Ov(n) !== r && l) throw Error(A(425));
  }
  function wl() {
  }
  var ls = null, du = null;
  function Rc(n, r) {
    return n === "textarea" || n === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var Tc = typeof setTimeout == "function" ? setTimeout : void 0, vd = typeof clearTimeout == "function" ? clearTimeout : void 0, Lv = typeof Promise == "function" ? Promise : void 0, co = typeof queueMicrotask == "function" ? queueMicrotask : typeof Lv < "u" ? function(n) {
    return Lv.resolve(null).then(n).catch(wc);
  } : Tc;
  function wc(n) {
    setTimeout(function() {
      throw n;
    });
  }
  function fo(n, r) {
    var l = r, o = 0;
    do {
      var c = l.nextSibling;
      if (n.removeChild(l), c && c.nodeType === 8) if (l = c.data, l === "/$") {
        if (o === 0) {
          n.removeChild(c), Ja(r);
          return;
        }
        o--;
      } else l !== "$" && l !== "$?" && l !== "$!" || o++;
      l = c;
    } while (l);
    Ja(r);
  }
  function Si(n) {
    for (; n != null; n = n.nextSibling) {
      var r = n.nodeType;
      if (r === 1 || r === 3) break;
      if (r === 8) {
        if (r = n.data, r === "$" || r === "$!" || r === "$?") break;
        if (r === "/$") return null;
      }
    }
    return n;
  }
  function Mv(n) {
    n = n.previousSibling;
    for (var r = 0; n; ) {
      if (n.nodeType === 8) {
        var l = n.data;
        if (l === "$" || l === "$!" || l === "$?") {
          if (r === 0) return n;
          r--;
        } else l === "/$" && r++;
      }
      n = n.previousSibling;
    }
    return null;
  }
  var xl = Math.random().toString(36).slice(2), Ei = "__reactFiber$" + xl, us = "__reactProps$" + xl, Ii = "__reactContainer$" + xl, os = "__reactEvents$" + xl, po = "__reactListeners$" + xl, sy = "__reactHandles$" + xl;
  function pu(n) {
    var r = n[Ei];
    if (r) return r;
    for (var l = n.parentNode; l; ) {
      if (r = l[Ii] || l[Ei]) {
        if (l = r.alternate, r.child !== null || l !== null && l.child !== null) for (n = Mv(n); n !== null; ) {
          if (l = n[Ei]) return l;
          n = Mv(n);
        }
        return r;
      }
      n = l, l = n.parentNode;
    }
    return null;
  }
  function _e(n) {
    return n = n[Ei] || n[Ii], !n || n.tag !== 5 && n.tag !== 6 && n.tag !== 13 && n.tag !== 3 ? null : n;
  }
  function ti(n) {
    if (n.tag === 5 || n.tag === 6) return n.stateNode;
    throw Error(A(33));
  }
  function hn(n) {
    return n[us] || null;
  }
  var gt = [], Da = -1;
  function ka(n) {
    return { current: n };
  }
  function rn(n) {
    0 > Da || (n.current = gt[Da], gt[Da] = null, Da--);
  }
  function xe(n, r) {
    Da++, gt[Da] = n.current, n.current = r;
  }
  var Er = {}, Sn = ka(Er), Yn = ka(!1), Wr = Er;
  function Gr(n, r) {
    var l = n.type.contextTypes;
    if (!l) return Er;
    var o = n.stateNode;
    if (o && o.__reactInternalMemoizedUnmaskedChildContext === r) return o.__reactInternalMemoizedMaskedChildContext;
    var c = {}, d;
    for (d in l) c[d] = r[d];
    return o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = r, n.__reactInternalMemoizedMaskedChildContext = c), c;
  }
  function Mn(n) {
    return n = n.childContextTypes, n != null;
  }
  function vo() {
    rn(Yn), rn(Sn);
  }
  function Nv(n, r, l) {
    if (Sn.current !== Er) throw Error(A(168));
    xe(Sn, r), xe(Yn, l);
  }
  function ss(n, r, l) {
    var o = n.stateNode;
    if (r = r.childContextTypes, typeof o.getChildContext != "function") return l;
    o = o.getChildContext();
    for (var c in o) if (!(c in r)) throw Error(A(108, Ze(n) || "Unknown", c));
    return ne({}, l, o);
  }
  function Xn(n) {
    return n = (n = n.stateNode) && n.__reactInternalMemoizedMergedChildContext || Er, Wr = Sn.current, xe(Sn, n), xe(Yn, Yn.current), !0;
  }
  function xc(n, r, l) {
    var o = n.stateNode;
    if (!o) throw Error(A(169));
    l ? (n = ss(n, r, Wr), o.__reactInternalMemoizedMergedChildContext = n, rn(Yn), rn(Sn), xe(Sn, n)) : rn(Yn), xe(Yn, l);
  }
  var Ci = null, ho = !1, Qi = !1;
  function bc(n) {
    Ci === null ? Ci = [n] : Ci.push(n);
  }
  function bl(n) {
    ho = !0, bc(n);
  }
  function Ri() {
    if (!Qi && Ci !== null) {
      Qi = !0;
      var n = 0, r = kt;
      try {
        var l = Ci;
        for (kt = 1; n < l.length; n++) {
          var o = l[n];
          do
            o = o(!0);
          while (o !== null);
        }
        Ci = null, ho = !1;
      } catch (c) {
        throw Ci !== null && (Ci = Ci.slice(n + 1)), on(qa, Ri), c;
      } finally {
        kt = r, Qi = !1;
      }
    }
    return null;
  }
  var _l = [], Dl = 0, kl = null, Wi = 0, Nn = [], Oa = 0, da = null, Ti = 1, wi = "";
  function vu(n, r) {
    _l[Dl++] = Wi, _l[Dl++] = kl, kl = n, Wi = r;
  }
  function Uv(n, r, l) {
    Nn[Oa++] = Ti, Nn[Oa++] = wi, Nn[Oa++] = da, da = n;
    var o = Ti;
    n = wi;
    var c = 32 - _r(o) - 1;
    o &= ~(1 << c), l += 1;
    var d = 32 - _r(r) + c;
    if (30 < d) {
      var m = c - c % 5;
      d = (o & (1 << m) - 1).toString(32), o >>= m, c -= m, Ti = 1 << 32 - _r(r) + c | l << c | o, wi = d + n;
    } else Ti = 1 << d | l << c | o, wi = n;
  }
  function _c(n) {
    n.return !== null && (vu(n, 1), Uv(n, 1, 0));
  }
  function Dc(n) {
    for (; n === kl; ) kl = _l[--Dl], _l[Dl] = null, Wi = _l[--Dl], _l[Dl] = null;
    for (; n === da; ) da = Nn[--Oa], Nn[Oa] = null, wi = Nn[--Oa], Nn[Oa] = null, Ti = Nn[--Oa], Nn[Oa] = null;
  }
  var qr = null, Xr = null, fn = !1, La = null;
  function hd(n, r) {
    var l = Aa(5, null, null, 0);
    l.elementType = "DELETED", l.stateNode = r, l.return = n, r = n.deletions, r === null ? (n.deletions = [l], n.flags |= 16) : r.push(l);
  }
  function zv(n, r) {
    switch (n.tag) {
      case 5:
        var l = n.type;
        return r = r.nodeType !== 1 || l.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (n.stateNode = r, qr = n, Xr = Si(r.firstChild), !0) : !1;
      case 6:
        return r = n.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (n.stateNode = r, qr = n, Xr = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (l = da !== null ? { id: Ti, overflow: wi } : null, n.memoizedState = { dehydrated: r, treeContext: l, retryLane: 1073741824 }, l = Aa(18, null, null, 0), l.stateNode = r, l.return = n, n.child = l, qr = n, Xr = null, !0) : !1;
      default:
        return !1;
    }
  }
  function md(n) {
    return (n.mode & 1) !== 0 && (n.flags & 128) === 0;
  }
  function yd(n) {
    if (fn) {
      var r = Xr;
      if (r) {
        var l = r;
        if (!zv(n, r)) {
          if (md(n)) throw Error(A(418));
          r = Si(l.nextSibling);
          var o = qr;
          r && zv(n, r) ? hd(o, l) : (n.flags = n.flags & -4097 | 2, fn = !1, qr = n);
        }
      } else {
        if (md(n)) throw Error(A(418));
        n.flags = n.flags & -4097 | 2, fn = !1, qr = n;
      }
    }
  }
  function In(n) {
    for (n = n.return; n !== null && n.tag !== 5 && n.tag !== 3 && n.tag !== 13; ) n = n.return;
    qr = n;
  }
  function kc(n) {
    if (n !== qr) return !1;
    if (!fn) return In(n), fn = !0, !1;
    var r;
    if ((r = n.tag !== 3) && !(r = n.tag !== 5) && (r = n.type, r = r !== "head" && r !== "body" && !Rc(n.type, n.memoizedProps)), r && (r = Xr)) {
      if (md(n)) throw cs(), Error(A(418));
      for (; r; ) hd(n, r), r = Si(r.nextSibling);
    }
    if (In(n), n.tag === 13) {
      if (n = n.memoizedState, n = n !== null ? n.dehydrated : null, !n) throw Error(A(317));
      e: {
        for (n = n.nextSibling, r = 0; n; ) {
          if (n.nodeType === 8) {
            var l = n.data;
            if (l === "/$") {
              if (r === 0) {
                Xr = Si(n.nextSibling);
                break e;
              }
              r--;
            } else l !== "$" && l !== "$!" && l !== "$?" || r++;
          }
          n = n.nextSibling;
        }
        Xr = null;
      }
    } else Xr = qr ? Si(n.stateNode.nextSibling) : null;
    return !0;
  }
  function cs() {
    for (var n = Xr; n; ) n = Si(n.nextSibling);
  }
  function Ol() {
    Xr = qr = null, fn = !1;
  }
  function Gi(n) {
    La === null ? La = [n] : La.push(n);
  }
  var cy = ht.ReactCurrentBatchConfig;
  function hu(n, r, l) {
    if (n = l.ref, n !== null && typeof n != "function" && typeof n != "object") {
      if (l._owner) {
        if (l = l._owner, l) {
          if (l.tag !== 1) throw Error(A(309));
          var o = l.stateNode;
        }
        if (!o) throw Error(A(147, n));
        var c = o, d = "" + n;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === d ? r.ref : (r = function(m) {
          var E = c.refs;
          m === null ? delete E[d] : E[d] = m;
        }, r._stringRef = d, r);
      }
      if (typeof n != "string") throw Error(A(284));
      if (!l._owner) throw Error(A(290, n));
    }
    return n;
  }
  function Oc(n, r) {
    throw n = Object.prototype.toString.call(r), Error(A(31, n === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : n));
  }
  function Av(n) {
    var r = n._init;
    return r(n._payload);
  }
  function mu(n) {
    function r(D, x) {
      if (n) {
        var L = D.deletions;
        L === null ? (D.deletions = [x], D.flags |= 16) : L.push(x);
      }
    }
    function l(D, x) {
      if (!n) return null;
      for (; x !== null; ) r(D, x), x = x.sibling;
      return null;
    }
    function o(D, x) {
      for (D = /* @__PURE__ */ new Map(); x !== null; ) x.key !== null ? D.set(x.key, x) : D.set(x.index, x), x = x.sibling;
      return D;
    }
    function c(D, x) {
      return D = Fl(D, x), D.index = 0, D.sibling = null, D;
    }
    function d(D, x, L) {
      return D.index = L, n ? (L = D.alternate, L !== null ? (L = L.index, L < x ? (D.flags |= 2, x) : L) : (D.flags |= 2, x)) : (D.flags |= 1048576, x);
    }
    function m(D) {
      return n && D.alternate === null && (D.flags |= 2), D;
    }
    function E(D, x, L, W) {
      return x === null || x.tag !== 6 ? (x = Gd(L, D.mode, W), x.return = D, x) : (x = c(x, L), x.return = D, x);
    }
    function T(D, x, L, W) {
      var ye = L.type;
      return ye === Fe ? Q(D, x, L.props.children, W, L.key) : x !== null && (x.elementType === ye || typeof ye == "object" && ye !== null && ye.$$typeof === Dt && Av(ye) === x.type) ? (W = c(x, L.props), W.ref = hu(D, x, L), W.return = D, W) : (W = Ps(L.type, L.key, L.props, null, D.mode, W), W.ref = hu(D, x, L), W.return = D, W);
    }
    function U(D, x, L, W) {
      return x === null || x.tag !== 4 || x.stateNode.containerInfo !== L.containerInfo || x.stateNode.implementation !== L.implementation ? (x = cf(L, D.mode, W), x.return = D, x) : (x = c(x, L.children || []), x.return = D, x);
    }
    function Q(D, x, L, W, ye) {
      return x === null || x.tag !== 7 ? (x = el(L, D.mode, W, ye), x.return = D, x) : (x = c(x, L), x.return = D, x);
    }
    function G(D, x, L) {
      if (typeof x == "string" && x !== "" || typeof x == "number") return x = Gd("" + x, D.mode, L), x.return = D, x;
      if (typeof x == "object" && x !== null) {
        switch (x.$$typeof) {
          case be:
            return L = Ps(x.type, x.key, x.props, null, D.mode, L), L.ref = hu(D, null, x), L.return = D, L;
          case ct:
            return x = cf(x, D.mode, L), x.return = D, x;
          case Dt:
            var W = x._init;
            return G(D, W(x._payload), L);
        }
        if (Gn(x) || Re(x)) return x = el(x, D.mode, L, null), x.return = D, x;
        Oc(D, x);
      }
      return null;
    }
    function I(D, x, L, W) {
      var ye = x !== null ? x.key : null;
      if (typeof L == "string" && L !== "" || typeof L == "number") return ye !== null ? null : E(D, x, "" + L, W);
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case be:
            return L.key === ye ? T(D, x, L, W) : null;
          case ct:
            return L.key === ye ? U(D, x, L, W) : null;
          case Dt:
            return ye = L._init, I(
              D,
              x,
              ye(L._payload),
              W
            );
        }
        if (Gn(L) || Re(L)) return ye !== null ? null : Q(D, x, L, W, null);
        Oc(D, L);
      }
      return null;
    }
    function ce(D, x, L, W, ye) {
      if (typeof W == "string" && W !== "" || typeof W == "number") return D = D.get(L) || null, E(x, D, "" + W, ye);
      if (typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case be:
            return D = D.get(W.key === null ? L : W.key) || null, T(x, D, W, ye);
          case ct:
            return D = D.get(W.key === null ? L : W.key) || null, U(x, D, W, ye);
          case Dt:
            var Me = W._init;
            return ce(D, x, L, Me(W._payload), ye);
        }
        if (Gn(W) || Re(W)) return D = D.get(L) || null, Q(x, D, W, ye, null);
        Oc(x, W);
      }
      return null;
    }
    function me(D, x, L, W) {
      for (var ye = null, Me = null, Ue = x, Ve = x = 0, Zn = null; Ue !== null && Ve < L.length; Ve++) {
        Ue.index > Ve ? (Zn = Ue, Ue = null) : Zn = Ue.sibling;
        var Mt = I(D, Ue, L[Ve], W);
        if (Mt === null) {
          Ue === null && (Ue = Zn);
          break;
        }
        n && Ue && Mt.alternate === null && r(D, Ue), x = d(Mt, x, Ve), Me === null ? ye = Mt : Me.sibling = Mt, Me = Mt, Ue = Zn;
      }
      if (Ve === L.length) return l(D, Ue), fn && vu(D, Ve), ye;
      if (Ue === null) {
        for (; Ve < L.length; Ve++) Ue = G(D, L[Ve], W), Ue !== null && (x = d(Ue, x, Ve), Me === null ? ye = Ue : Me.sibling = Ue, Me = Ue);
        return fn && vu(D, Ve), ye;
      }
      for (Ue = o(D, Ue); Ve < L.length; Ve++) Zn = ce(Ue, D, Ve, L[Ve], W), Zn !== null && (n && Zn.alternate !== null && Ue.delete(Zn.key === null ? Ve : Zn.key), x = d(Zn, x, Ve), Me === null ? ye = Zn : Me.sibling = Zn, Me = Zn);
      return n && Ue.forEach(function(Vl) {
        return r(D, Vl);
      }), fn && vu(D, Ve), ye;
    }
    function Ee(D, x, L, W) {
      var ye = Re(L);
      if (typeof ye != "function") throw Error(A(150));
      if (L = ye.call(L), L == null) throw Error(A(151));
      for (var Me = ye = null, Ue = x, Ve = x = 0, Zn = null, Mt = L.next(); Ue !== null && !Mt.done; Ve++, Mt = L.next()) {
        Ue.index > Ve ? (Zn = Ue, Ue = null) : Zn = Ue.sibling;
        var Vl = I(D, Ue, Mt.value, W);
        if (Vl === null) {
          Ue === null && (Ue = Zn);
          break;
        }
        n && Ue && Vl.alternate === null && r(D, Ue), x = d(Vl, x, Ve), Me === null ? ye = Vl : Me.sibling = Vl, Me = Vl, Ue = Zn;
      }
      if (Mt.done) return l(
        D,
        Ue
      ), fn && vu(D, Ve), ye;
      if (Ue === null) {
        for (; !Mt.done; Ve++, Mt = L.next()) Mt = G(D, Mt.value, W), Mt !== null && (x = d(Mt, x, Ve), Me === null ? ye = Mt : Me.sibling = Mt, Me = Mt);
        return fn && vu(D, Ve), ye;
      }
      for (Ue = o(D, Ue); !Mt.done; Ve++, Mt = L.next()) Mt = ce(Ue, D, Ve, Mt.value, W), Mt !== null && (n && Mt.alternate !== null && Ue.delete(Mt.key === null ? Ve : Mt.key), x = d(Mt, x, Ve), Me === null ? ye = Mt : Me.sibling = Mt, Me = Mt);
      return n && Ue.forEach(function(gh) {
        return r(D, gh);
      }), fn && vu(D, Ve), ye;
    }
    function _n(D, x, L, W) {
      if (typeof L == "object" && L !== null && L.type === Fe && L.key === null && (L = L.props.children), typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case be:
            e: {
              for (var ye = L.key, Me = x; Me !== null; ) {
                if (Me.key === ye) {
                  if (ye = L.type, ye === Fe) {
                    if (Me.tag === 7) {
                      l(D, Me.sibling), x = c(Me, L.props.children), x.return = D, D = x;
                      break e;
                    }
                  } else if (Me.elementType === ye || typeof ye == "object" && ye !== null && ye.$$typeof === Dt && Av(ye) === Me.type) {
                    l(D, Me.sibling), x = c(Me, L.props), x.ref = hu(D, Me, L), x.return = D, D = x;
                    break e;
                  }
                  l(D, Me);
                  break;
                } else r(D, Me);
                Me = Me.sibling;
              }
              L.type === Fe ? (x = el(L.props.children, D.mode, W, L.key), x.return = D, D = x) : (W = Ps(L.type, L.key, L.props, null, D.mode, W), W.ref = hu(D, x, L), W.return = D, D = W);
            }
            return m(D);
          case ct:
            e: {
              for (Me = L.key; x !== null; ) {
                if (x.key === Me) if (x.tag === 4 && x.stateNode.containerInfo === L.containerInfo && x.stateNode.implementation === L.implementation) {
                  l(D, x.sibling), x = c(x, L.children || []), x.return = D, D = x;
                  break e;
                } else {
                  l(D, x);
                  break;
                }
                else r(D, x);
                x = x.sibling;
              }
              x = cf(L, D.mode, W), x.return = D, D = x;
            }
            return m(D);
          case Dt:
            return Me = L._init, _n(D, x, Me(L._payload), W);
        }
        if (Gn(L)) return me(D, x, L, W);
        if (Re(L)) return Ee(D, x, L, W);
        Oc(D, L);
      }
      return typeof L == "string" && L !== "" || typeof L == "number" ? (L = "" + L, x !== null && x.tag === 6 ? (l(D, x.sibling), x = c(x, L), x.return = D, D = x) : (l(D, x), x = Gd(L, D.mode, W), x.return = D, D = x), m(D)) : l(D, x);
    }
    return _n;
  }
  var Tn = mu(!0), le = mu(!1), pa = ka(null), Kr = null, mo = null, gd = null;
  function Sd() {
    gd = mo = Kr = null;
  }
  function Ed(n) {
    var r = pa.current;
    rn(pa), n._currentValue = r;
  }
  function Cd(n, r, l) {
    for (; n !== null; ) {
      var o = n.alternate;
      if ((n.childLanes & r) !== r ? (n.childLanes |= r, o !== null && (o.childLanes |= r)) : o !== null && (o.childLanes & r) !== r && (o.childLanes |= r), n === l) break;
      n = n.return;
    }
  }
  function mn(n, r) {
    Kr = n, gd = mo = null, n = n.dependencies, n !== null && n.firstContext !== null && (n.lanes & r && (zn = !0), n.firstContext = null);
  }
  function Ma(n) {
    var r = n._currentValue;
    if (gd !== n) if (n = { context: n, memoizedValue: r, next: null }, mo === null) {
      if (Kr === null) throw Error(A(308));
      mo = n, Kr.dependencies = { lanes: 0, firstContext: n };
    } else mo = mo.next = n;
    return r;
  }
  var yu = null;
  function Rd(n) {
    yu === null ? yu = [n] : yu.push(n);
  }
  function Td(n, r, l, o) {
    var c = r.interleaved;
    return c === null ? (l.next = l, Rd(r)) : (l.next = c.next, c.next = l), r.interleaved = l, va(n, o);
  }
  function va(n, r) {
    n.lanes |= r;
    var l = n.alternate;
    for (l !== null && (l.lanes |= r), l = n, n = n.return; n !== null; ) n.childLanes |= r, l = n.alternate, l !== null && (l.childLanes |= r), l = n, n = n.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var ha = !1;
  function wd(n) {
    n.updateQueue = { baseState: n.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function jv(n, r) {
    n = n.updateQueue, r.updateQueue === n && (r.updateQueue = { baseState: n.baseState, firstBaseUpdate: n.firstBaseUpdate, lastBaseUpdate: n.lastBaseUpdate, shared: n.shared, effects: n.effects });
  }
  function qi(n, r) {
    return { eventTime: n, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Ll(n, r, l) {
    var o = n.updateQueue;
    if (o === null) return null;
    if (o = o.shared, St & 2) {
      var c = o.pending;
      return c === null ? r.next = r : (r.next = c.next, c.next = r), o.pending = r, va(n, l);
    }
    return c = o.interleaved, c === null ? (r.next = r, Rd(o)) : (r.next = c.next, c.next = r), o.interleaved = r, va(n, l);
  }
  function Lc(n, r, l) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (l & 4194240) !== 0)) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, Pi(n, l);
    }
  }
  function Fv(n, r) {
    var l = n.updateQueue, o = n.alternate;
    if (o !== null && (o = o.updateQueue, l === o)) {
      var c = null, d = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var m = { eventTime: l.eventTime, lane: l.lane, tag: l.tag, payload: l.payload, callback: l.callback, next: null };
          d === null ? c = d = m : d = d.next = m, l = l.next;
        } while (l !== null);
        d === null ? c = d = r : d = d.next = r;
      } else c = d = r;
      l = { baseState: o.baseState, firstBaseUpdate: c, lastBaseUpdate: d, shared: o.shared, effects: o.effects }, n.updateQueue = l;
      return;
    }
    n = l.lastBaseUpdate, n === null ? l.firstBaseUpdate = r : n.next = r, l.lastBaseUpdate = r;
  }
  function fs(n, r, l, o) {
    var c = n.updateQueue;
    ha = !1;
    var d = c.firstBaseUpdate, m = c.lastBaseUpdate, E = c.shared.pending;
    if (E !== null) {
      c.shared.pending = null;
      var T = E, U = T.next;
      T.next = null, m === null ? d = U : m.next = U, m = T;
      var Q = n.alternate;
      Q !== null && (Q = Q.updateQueue, E = Q.lastBaseUpdate, E !== m && (E === null ? Q.firstBaseUpdate = U : E.next = U, Q.lastBaseUpdate = T));
    }
    if (d !== null) {
      var G = c.baseState;
      m = 0, Q = U = T = null, E = d;
      do {
        var I = E.lane, ce = E.eventTime;
        if ((o & I) === I) {
          Q !== null && (Q = Q.next = {
            eventTime: ce,
            lane: 0,
            tag: E.tag,
            payload: E.payload,
            callback: E.callback,
            next: null
          });
          e: {
            var me = n, Ee = E;
            switch (I = r, ce = l, Ee.tag) {
              case 1:
                if (me = Ee.payload, typeof me == "function") {
                  G = me.call(ce, G, I);
                  break e;
                }
                G = me;
                break e;
              case 3:
                me.flags = me.flags & -65537 | 128;
              case 0:
                if (me = Ee.payload, I = typeof me == "function" ? me.call(ce, G, I) : me, I == null) break e;
                G = ne({}, G, I);
                break e;
              case 2:
                ha = !0;
            }
          }
          E.callback !== null && E.lane !== 0 && (n.flags |= 64, I = c.effects, I === null ? c.effects = [E] : I.push(E));
        } else ce = { eventTime: ce, lane: I, tag: E.tag, payload: E.payload, callback: E.callback, next: null }, Q === null ? (U = Q = ce, T = G) : Q = Q.next = ce, m |= I;
        if (E = E.next, E === null) {
          if (E = c.shared.pending, E === null) break;
          I = E, E = I.next, I.next = null, c.lastBaseUpdate = I, c.shared.pending = null;
        }
      } while (!0);
      if (Q === null && (T = G), c.baseState = T, c.firstBaseUpdate = U, c.lastBaseUpdate = Q, r = c.shared.interleaved, r !== null) {
        c = r;
        do
          m |= c.lane, c = c.next;
        while (c !== r);
      } else d === null && (c.shared.lanes = 0);
      ki |= m, n.lanes = m, n.memoizedState = G;
    }
  }
  function xd(n, r, l) {
    if (n = r.effects, r.effects = null, n !== null) for (r = 0; r < n.length; r++) {
      var o = n[r], c = o.callback;
      if (c !== null) {
        if (o.callback = null, o = l, typeof c != "function") throw Error(A(191, c));
        c.call(o);
      }
    }
  }
  var ds = {}, xi = ka(ds), ps = ka(ds), vs = ka(ds);
  function gu(n) {
    if (n === ds) throw Error(A(174));
    return n;
  }
  function bd(n, r) {
    switch (xe(vs, r), xe(ps, n), xe(xi, ds), n = r.nodeType, n) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : sa(null, "");
        break;
      default:
        n = n === 8 ? r.parentNode : r, r = n.namespaceURI || null, n = n.tagName, r = sa(r, n);
    }
    rn(xi), xe(xi, r);
  }
  function Su() {
    rn(xi), rn(ps), rn(vs);
  }
  function Hv(n) {
    gu(vs.current);
    var r = gu(xi.current), l = sa(r, n.type);
    r !== l && (xe(ps, n), xe(xi, l));
  }
  function Mc(n) {
    ps.current === n && (rn(xi), rn(ps));
  }
  var yn = ka(0);
  function Nc(n) {
    for (var r = n; r !== null; ) {
      if (r.tag === 13) {
        var l = r.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || l.data === "$?" || l.data === "$!")) return r;
      } else if (r.tag === 19 && r.memoizedProps.revealOrder !== void 0) {
        if (r.flags & 128) return r;
      } else if (r.child !== null) {
        r.child.return = r, r = r.child;
        continue;
      }
      if (r === n) break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === n) return null;
        r = r.return;
      }
      r.sibling.return = r.return, r = r.sibling;
    }
    return null;
  }
  var hs = [];
  function De() {
    for (var n = 0; n < hs.length; n++) hs[n]._workInProgressVersionPrimary = null;
    hs.length = 0;
  }
  var st = ht.ReactCurrentDispatcher, Ot = ht.ReactCurrentBatchConfig, Wt = 0, Lt = null, Un = null, Kn = null, Uc = !1, ms = !1, Eu = 0, Y = 0;
  function _t() {
    throw Error(A(321));
  }
  function Ae(n, r) {
    if (r === null) return !1;
    for (var l = 0; l < r.length && l < n.length; l++) if (!ei(n[l], r[l])) return !1;
    return !0;
  }
  function Ml(n, r, l, o, c, d) {
    if (Wt = d, Lt = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, st.current = n === null || n.memoizedState === null ? qc : Rs, n = l(o, c), ms) {
      d = 0;
      do {
        if (ms = !1, Eu = 0, 25 <= d) throw Error(A(301));
        d += 1, Kn = Un = null, r.updateQueue = null, st.current = Xc, n = l(o, c);
      } while (ms);
    }
    if (st.current = xu, r = Un !== null && Un.next !== null, Wt = 0, Kn = Un = Lt = null, Uc = !1, r) throw Error(A(300));
    return n;
  }
  function ni() {
    var n = Eu !== 0;
    return Eu = 0, n;
  }
  function Cr() {
    var n = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Kn === null ? Lt.memoizedState = Kn = n : Kn = Kn.next = n, Kn;
  }
  function wn() {
    if (Un === null) {
      var n = Lt.alternate;
      n = n !== null ? n.memoizedState : null;
    } else n = Un.next;
    var r = Kn === null ? Lt.memoizedState : Kn.next;
    if (r !== null) Kn = r, Un = n;
    else {
      if (n === null) throw Error(A(310));
      Un = n, n = { memoizedState: Un.memoizedState, baseState: Un.baseState, baseQueue: Un.baseQueue, queue: Un.queue, next: null }, Kn === null ? Lt.memoizedState = Kn = n : Kn = Kn.next = n;
    }
    return Kn;
  }
  function Xi(n, r) {
    return typeof r == "function" ? r(n) : r;
  }
  function Nl(n) {
    var r = wn(), l = r.queue;
    if (l === null) throw Error(A(311));
    l.lastRenderedReducer = n;
    var o = Un, c = o.baseQueue, d = l.pending;
    if (d !== null) {
      if (c !== null) {
        var m = c.next;
        c.next = d.next, d.next = m;
      }
      o.baseQueue = c = d, l.pending = null;
    }
    if (c !== null) {
      d = c.next, o = o.baseState;
      var E = m = null, T = null, U = d;
      do {
        var Q = U.lane;
        if ((Wt & Q) === Q) T !== null && (T = T.next = { lane: 0, action: U.action, hasEagerState: U.hasEagerState, eagerState: U.eagerState, next: null }), o = U.hasEagerState ? U.eagerState : n(o, U.action);
        else {
          var G = {
            lane: Q,
            action: U.action,
            hasEagerState: U.hasEagerState,
            eagerState: U.eagerState,
            next: null
          };
          T === null ? (E = T = G, m = o) : T = T.next = G, Lt.lanes |= Q, ki |= Q;
        }
        U = U.next;
      } while (U !== null && U !== d);
      T === null ? m = o : T.next = E, ei(o, r.memoizedState) || (zn = !0), r.memoizedState = o, r.baseState = m, r.baseQueue = T, l.lastRenderedState = o;
    }
    if (n = l.interleaved, n !== null) {
      c = n;
      do
        d = c.lane, Lt.lanes |= d, ki |= d, c = c.next;
      while (c !== n);
    } else c === null && (l.lanes = 0);
    return [r.memoizedState, l.dispatch];
  }
  function Cu(n) {
    var r = wn(), l = r.queue;
    if (l === null) throw Error(A(311));
    l.lastRenderedReducer = n;
    var o = l.dispatch, c = l.pending, d = r.memoizedState;
    if (c !== null) {
      l.pending = null;
      var m = c = c.next;
      do
        d = n(d, m.action), m = m.next;
      while (m !== c);
      ei(d, r.memoizedState) || (zn = !0), r.memoizedState = d, r.baseQueue === null && (r.baseState = d), l.lastRenderedState = d;
    }
    return [d, o];
  }
  function zc() {
  }
  function Ac(n, r) {
    var l = Lt, o = wn(), c = r(), d = !ei(o.memoizedState, c);
    if (d && (o.memoizedState = c, zn = !0), o = o.queue, ys(Hc.bind(null, l, o, n), [n]), o.getSnapshot !== r || d || Kn !== null && Kn.memoizedState.tag & 1) {
      if (l.flags |= 2048, Ru(9, Fc.bind(null, l, o, c, r), void 0, null), Qn === null) throw Error(A(349));
      Wt & 30 || jc(l, r, c);
    }
    return c;
  }
  function jc(n, r, l) {
    n.flags |= 16384, n = { getSnapshot: r, value: l }, r = Lt.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Lt.updateQueue = r, r.stores = [n]) : (l = r.stores, l === null ? r.stores = [n] : l.push(n));
  }
  function Fc(n, r, l, o) {
    r.value = l, r.getSnapshot = o, Pc(r) && Vc(n);
  }
  function Hc(n, r, l) {
    return l(function() {
      Pc(r) && Vc(n);
    });
  }
  function Pc(n) {
    var r = n.getSnapshot;
    n = n.value;
    try {
      var l = r();
      return !ei(n, l);
    } catch {
      return !0;
    }
  }
  function Vc(n) {
    var r = va(n, 1);
    r !== null && Nr(r, n, 1, -1);
  }
  function Bc(n) {
    var r = Cr();
    return typeof n == "function" && (n = n()), r.memoizedState = r.baseState = n, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Xi, lastRenderedState: n }, r.queue = n, n = n.dispatch = wu.bind(null, Lt, n), [r.memoizedState, n];
  }
  function Ru(n, r, l, o) {
    return n = { tag: n, create: r, destroy: l, deps: o, next: null }, r = Lt.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, Lt.updateQueue = r, r.lastEffect = n.next = n) : (l = r.lastEffect, l === null ? r.lastEffect = n.next = n : (o = l.next, l.next = n, n.next = o, r.lastEffect = n)), n;
  }
  function $c() {
    return wn().memoizedState;
  }
  function yo(n, r, l, o) {
    var c = Cr();
    Lt.flags |= n, c.memoizedState = Ru(1 | r, l, void 0, o === void 0 ? null : o);
  }
  function go(n, r, l, o) {
    var c = wn();
    o = o === void 0 ? null : o;
    var d = void 0;
    if (Un !== null) {
      var m = Un.memoizedState;
      if (d = m.destroy, o !== null && Ae(o, m.deps)) {
        c.memoizedState = Ru(r, l, d, o);
        return;
      }
    }
    Lt.flags |= n, c.memoizedState = Ru(1 | r, l, d, o);
  }
  function Yc(n, r) {
    return yo(8390656, 8, n, r);
  }
  function ys(n, r) {
    return go(2048, 8, n, r);
  }
  function Ic(n, r) {
    return go(4, 2, n, r);
  }
  function gs(n, r) {
    return go(4, 4, n, r);
  }
  function Tu(n, r) {
    if (typeof r == "function") return n = n(), r(n), function() {
      r(null);
    };
    if (r != null) return n = n(), r.current = n, function() {
      r.current = null;
    };
  }
  function Qc(n, r, l) {
    return l = l != null ? l.concat([n]) : null, go(4, 4, Tu.bind(null, r, n), l);
  }
  function Ss() {
  }
  function Wc(n, r) {
    var l = wn();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && Ae(r, o[1]) ? o[0] : (l.memoizedState = [n, r], n);
  }
  function Gc(n, r) {
    var l = wn();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && Ae(r, o[1]) ? o[0] : (n = n(), l.memoizedState = [n, r], n);
  }
  function _d(n, r, l) {
    return Wt & 21 ? (ei(l, r) || (l = Xu(), Lt.lanes |= l, ki |= l, n.baseState = !0), r) : (n.baseState && (n.baseState = !1, zn = !0), n.memoizedState = l);
  }
  function Es(n, r) {
    var l = kt;
    kt = l !== 0 && 4 > l ? l : 4, n(!0);
    var o = Ot.transition;
    Ot.transition = {};
    try {
      n(!1), r();
    } finally {
      kt = l, Ot.transition = o;
    }
  }
  function Dd() {
    return wn().memoizedState;
  }
  function Cs(n, r, l) {
    var o = Oi(n);
    if (l = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null }, Jr(n)) Pv(r, l);
    else if (l = Td(n, r, l, o), l !== null) {
      var c = Fn();
      Nr(l, n, o, c), Xt(l, r, o);
    }
  }
  function wu(n, r, l) {
    var o = Oi(n), c = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null };
    if (Jr(n)) Pv(r, c);
    else {
      var d = n.alternate;
      if (n.lanes === 0 && (d === null || d.lanes === 0) && (d = r.lastRenderedReducer, d !== null)) try {
        var m = r.lastRenderedState, E = d(m, l);
        if (c.hasEagerState = !0, c.eagerState = E, ei(E, m)) {
          var T = r.interleaved;
          T === null ? (c.next = c, Rd(r)) : (c.next = T.next, T.next = c), r.interleaved = c;
          return;
        }
      } catch {
      } finally {
      }
      l = Td(n, r, c, o), l !== null && (c = Fn(), Nr(l, n, o, c), Xt(l, r, o));
    }
  }
  function Jr(n) {
    var r = n.alternate;
    return n === Lt || r !== null && r === Lt;
  }
  function Pv(n, r) {
    ms = Uc = !0;
    var l = n.pending;
    l === null ? r.next = r : (r.next = l.next, l.next = r), n.pending = r;
  }
  function Xt(n, r, l) {
    if (l & 4194240) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, Pi(n, l);
    }
  }
  var xu = { readContext: Ma, useCallback: _t, useContext: _t, useEffect: _t, useImperativeHandle: _t, useInsertionEffect: _t, useLayoutEffect: _t, useMemo: _t, useReducer: _t, useRef: _t, useState: _t, useDebugValue: _t, useDeferredValue: _t, useTransition: _t, useMutableSource: _t, useSyncExternalStore: _t, useId: _t, unstable_isNewReconciler: !1 }, qc = { readContext: Ma, useCallback: function(n, r) {
    return Cr().memoizedState = [n, r === void 0 ? null : r], n;
  }, useContext: Ma, useEffect: Yc, useImperativeHandle: function(n, r, l) {
    return l = l != null ? l.concat([n]) : null, yo(
      4194308,
      4,
      Tu.bind(null, r, n),
      l
    );
  }, useLayoutEffect: function(n, r) {
    return yo(4194308, 4, n, r);
  }, useInsertionEffect: function(n, r) {
    return yo(4, 2, n, r);
  }, useMemo: function(n, r) {
    var l = Cr();
    return r = r === void 0 ? null : r, n = n(), l.memoizedState = [n, r], n;
  }, useReducer: function(n, r, l) {
    var o = Cr();
    return r = l !== void 0 ? l(r) : r, o.memoizedState = o.baseState = r, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: n, lastRenderedState: r }, o.queue = n, n = n.dispatch = Cs.bind(null, Lt, n), [o.memoizedState, n];
  }, useRef: function(n) {
    var r = Cr();
    return n = { current: n }, r.memoizedState = n;
  }, useState: Bc, useDebugValue: Ss, useDeferredValue: function(n) {
    return Cr().memoizedState = n;
  }, useTransition: function() {
    var n = Bc(!1), r = n[0];
    return n = Es.bind(null, n[1]), Cr().memoizedState = n, [r, n];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(n, r, l) {
    var o = Lt, c = Cr();
    if (fn) {
      if (l === void 0) throw Error(A(407));
      l = l();
    } else {
      if (l = r(), Qn === null) throw Error(A(349));
      Wt & 30 || jc(o, r, l);
    }
    c.memoizedState = l;
    var d = { value: l, getSnapshot: r };
    return c.queue = d, Yc(Hc.bind(
      null,
      o,
      d,
      n
    ), [n]), o.flags |= 2048, Ru(9, Fc.bind(null, o, d, l, r), void 0, null), l;
  }, useId: function() {
    var n = Cr(), r = Qn.identifierPrefix;
    if (fn) {
      var l = wi, o = Ti;
      l = (o & ~(1 << 32 - _r(o) - 1)).toString(32) + l, r = ":" + r + "R" + l, l = Eu++, 0 < l && (r += "H" + l.toString(32)), r += ":";
    } else l = Y++, r = ":" + r + "r" + l.toString(32) + ":";
    return n.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, Rs = {
    readContext: Ma,
    useCallback: Wc,
    useContext: Ma,
    useEffect: ys,
    useImperativeHandle: Qc,
    useInsertionEffect: Ic,
    useLayoutEffect: gs,
    useMemo: Gc,
    useReducer: Nl,
    useRef: $c,
    useState: function() {
      return Nl(Xi);
    },
    useDebugValue: Ss,
    useDeferredValue: function(n) {
      var r = wn();
      return _d(r, Un.memoizedState, n);
    },
    useTransition: function() {
      var n = Nl(Xi)[0], r = wn().memoizedState;
      return [n, r];
    },
    useMutableSource: zc,
    useSyncExternalStore: Ac,
    useId: Dd,
    unstable_isNewReconciler: !1
  }, Xc = { readContext: Ma, useCallback: Wc, useContext: Ma, useEffect: ys, useImperativeHandle: Qc, useInsertionEffect: Ic, useLayoutEffect: gs, useMemo: Gc, useReducer: Cu, useRef: $c, useState: function() {
    return Cu(Xi);
  }, useDebugValue: Ss, useDeferredValue: function(n) {
    var r = wn();
    return Un === null ? r.memoizedState = n : _d(r, Un.memoizedState, n);
  }, useTransition: function() {
    var n = Cu(Xi)[0], r = wn().memoizedState;
    return [n, r];
  }, useMutableSource: zc, useSyncExternalStore: Ac, useId: Dd, unstable_isNewReconciler: !1 };
  function ri(n, r) {
    if (n && n.defaultProps) {
      r = ne({}, r), n = n.defaultProps;
      for (var l in n) r[l] === void 0 && (r[l] = n[l]);
      return r;
    }
    return r;
  }
  function kd(n, r, l, o) {
    r = n.memoizedState, l = l(o, r), l = l == null ? r : ne({}, r, l), n.memoizedState = l, n.lanes === 0 && (n.updateQueue.baseState = l);
  }
  var Kc = { isMounted: function(n) {
    return (n = n._reactInternals) ? Ge(n) === n : !1;
  }, enqueueSetState: function(n, r, l) {
    n = n._reactInternals;
    var o = Fn(), c = Oi(n), d = qi(o, c);
    d.payload = r, l != null && (d.callback = l), r = Ll(n, d, c), r !== null && (Nr(r, n, c, o), Lc(r, n, c));
  }, enqueueReplaceState: function(n, r, l) {
    n = n._reactInternals;
    var o = Fn(), c = Oi(n), d = qi(o, c);
    d.tag = 1, d.payload = r, l != null && (d.callback = l), r = Ll(n, d, c), r !== null && (Nr(r, n, c, o), Lc(r, n, c));
  }, enqueueForceUpdate: function(n, r) {
    n = n._reactInternals;
    var l = Fn(), o = Oi(n), c = qi(l, o);
    c.tag = 2, r != null && (c.callback = r), r = Ll(n, c, o), r !== null && (Nr(r, n, o, l), Lc(r, n, o));
  } };
  function Vv(n, r, l, o, c, d, m) {
    return n = n.stateNode, typeof n.shouldComponentUpdate == "function" ? n.shouldComponentUpdate(o, d, m) : r.prototype && r.prototype.isPureReactComponent ? !ts(l, o) || !ts(c, d) : !0;
  }
  function Jc(n, r, l) {
    var o = !1, c = Er, d = r.contextType;
    return typeof d == "object" && d !== null ? d = Ma(d) : (c = Mn(r) ? Wr : Sn.current, o = r.contextTypes, d = (o = o != null) ? Gr(n, c) : Er), r = new r(l, d), n.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = Kc, n.stateNode = r, r._reactInternals = n, o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = c, n.__reactInternalMemoizedMaskedChildContext = d), r;
  }
  function Bv(n, r, l, o) {
    n = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(l, o), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(l, o), r.state !== n && Kc.enqueueReplaceState(r, r.state, null);
  }
  function Ts(n, r, l, o) {
    var c = n.stateNode;
    c.props = l, c.state = n.memoizedState, c.refs = {}, wd(n);
    var d = r.contextType;
    typeof d == "object" && d !== null ? c.context = Ma(d) : (d = Mn(r) ? Wr : Sn.current, c.context = Gr(n, d)), c.state = n.memoizedState, d = r.getDerivedStateFromProps, typeof d == "function" && (kd(n, r, d, l), c.state = n.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (r = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), r !== c.state && Kc.enqueueReplaceState(c, c.state, null), fs(n, l, c, o), c.state = n.memoizedState), typeof c.componentDidMount == "function" && (n.flags |= 4194308);
  }
  function bu(n, r) {
    try {
      var l = "", o = r;
      do
        l += lt(o), o = o.return;
      while (o);
      var c = l;
    } catch (d) {
      c = `
Error generating stack: ` + d.message + `
` + d.stack;
    }
    return { value: n, source: r, stack: c, digest: null };
  }
  function Od(n, r, l) {
    return { value: n, source: null, stack: l ?? null, digest: r ?? null };
  }
  function Ld(n, r) {
    try {
      console.error(r.value);
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  var Zc = typeof WeakMap == "function" ? WeakMap : Map;
  function $v(n, r, l) {
    l = qi(-1, l), l.tag = 3, l.payload = { element: null };
    var o = r.value;
    return l.callback = function() {
      wo || (wo = !0, ku = o), Ld(n, r);
    }, l;
  }
  function Md(n, r, l) {
    l = qi(-1, l), l.tag = 3;
    var o = n.type.getDerivedStateFromError;
    if (typeof o == "function") {
      var c = r.value;
      l.payload = function() {
        return o(c);
      }, l.callback = function() {
        Ld(n, r);
      };
    }
    var d = n.stateNode;
    return d !== null && typeof d.componentDidCatch == "function" && (l.callback = function() {
      Ld(n, r), typeof o != "function" && (Al === null ? Al = /* @__PURE__ */ new Set([this]) : Al.add(this));
      var m = r.stack;
      this.componentDidCatch(r.value, { componentStack: m !== null ? m : "" });
    }), l;
  }
  function Nd(n, r, l) {
    var o = n.pingCache;
    if (o === null) {
      o = n.pingCache = new Zc();
      var c = /* @__PURE__ */ new Set();
      o.set(r, c);
    } else c = o.get(r), c === void 0 && (c = /* @__PURE__ */ new Set(), o.set(r, c));
    c.has(l) || (c.add(l), n = yy.bind(null, n, r, l), r.then(n, n));
  }
  function Yv(n) {
    do {
      var r;
      if ((r = n.tag === 13) && (r = n.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return n;
      n = n.return;
    } while (n !== null);
    return null;
  }
  function Ul(n, r, l, o, c) {
    return n.mode & 1 ? (n.flags |= 65536, n.lanes = c, n) : (n === r ? n.flags |= 65536 : (n.flags |= 128, l.flags |= 131072, l.flags &= -52805, l.tag === 1 && (l.alternate === null ? l.tag = 17 : (r = qi(-1, 1), r.tag = 2, Ll(l, r, 1))), l.lanes |= 1), n);
  }
  var ws = ht.ReactCurrentOwner, zn = !1;
  function lr(n, r, l, o) {
    r.child = n === null ? le(r, null, l, o) : Tn(r, n.child, l, o);
  }
  function Zr(n, r, l, o, c) {
    l = l.render;
    var d = r.ref;
    return mn(r, c), o = Ml(n, r, l, o, d, c), l = ni(), n !== null && !zn ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, Ua(n, r, c)) : (fn && l && _c(r), r.flags |= 1, lr(n, r, o, c), r.child);
  }
  function _u(n, r, l, o, c) {
    if (n === null) {
      var d = l.type;
      return typeof d == "function" && !Wd(d) && d.defaultProps === void 0 && l.compare === null && l.defaultProps === void 0 ? (r.tag = 15, r.type = d, Ke(n, r, d, o, c)) : (n = Ps(l.type, null, o, r, r.mode, c), n.ref = r.ref, n.return = r, r.child = n);
    }
    if (d = n.child, !(n.lanes & c)) {
      var m = d.memoizedProps;
      if (l = l.compare, l = l !== null ? l : ts, l(m, o) && n.ref === r.ref) return Ua(n, r, c);
    }
    return r.flags |= 1, n = Fl(d, o), n.ref = r.ref, n.return = r, r.child = n;
  }
  function Ke(n, r, l, o, c) {
    if (n !== null) {
      var d = n.memoizedProps;
      if (ts(d, o) && n.ref === r.ref) if (zn = !1, r.pendingProps = o = d, (n.lanes & c) !== 0) n.flags & 131072 && (zn = !0);
      else return r.lanes = n.lanes, Ua(n, r, c);
    }
    return Iv(n, r, l, o, c);
  }
  function xs(n, r, l) {
    var o = r.pendingProps, c = o.children, d = n !== null ? n.memoizedState : null;
    if (o.mode === "hidden") if (!(r.mode & 1)) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, xe(Co, ma), ma |= l;
    else {
      if (!(l & 1073741824)) return n = d !== null ? d.baseLanes | l : l, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: n, cachePool: null, transitions: null }, r.updateQueue = null, xe(Co, ma), ma |= n, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, o = d !== null ? d.baseLanes : l, xe(Co, ma), ma |= o;
    }
    else d !== null ? (o = d.baseLanes | l, r.memoizedState = null) : o = l, xe(Co, ma), ma |= o;
    return lr(n, r, c, l), r.child;
  }
  function Ud(n, r) {
    var l = r.ref;
    (n === null && l !== null || n !== null && n.ref !== l) && (r.flags |= 512, r.flags |= 2097152);
  }
  function Iv(n, r, l, o, c) {
    var d = Mn(l) ? Wr : Sn.current;
    return d = Gr(r, d), mn(r, c), l = Ml(n, r, l, o, d, c), o = ni(), n !== null && !zn ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, Ua(n, r, c)) : (fn && o && _c(r), r.flags |= 1, lr(n, r, l, c), r.child);
  }
  function Qv(n, r, l, o, c) {
    if (Mn(l)) {
      var d = !0;
      Xn(r);
    } else d = !1;
    if (mn(r, c), r.stateNode === null) Na(n, r), Jc(r, l, o), Ts(r, l, o, c), o = !0;
    else if (n === null) {
      var m = r.stateNode, E = r.memoizedProps;
      m.props = E;
      var T = m.context, U = l.contextType;
      typeof U == "object" && U !== null ? U = Ma(U) : (U = Mn(l) ? Wr : Sn.current, U = Gr(r, U));
      var Q = l.getDerivedStateFromProps, G = typeof Q == "function" || typeof m.getSnapshotBeforeUpdate == "function";
      G || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== o || T !== U) && Bv(r, m, o, U), ha = !1;
      var I = r.memoizedState;
      m.state = I, fs(r, o, m, c), T = r.memoizedState, E !== o || I !== T || Yn.current || ha ? (typeof Q == "function" && (kd(r, l, Q, o), T = r.memoizedState), (E = ha || Vv(r, l, E, o, I, T, U)) ? (G || typeof m.UNSAFE_componentWillMount != "function" && typeof m.componentWillMount != "function" || (typeof m.componentWillMount == "function" && m.componentWillMount(), typeof m.UNSAFE_componentWillMount == "function" && m.UNSAFE_componentWillMount()), typeof m.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = o, r.memoizedState = T), m.props = o, m.state = T, m.context = U, o = E) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), o = !1);
    } else {
      m = r.stateNode, jv(n, r), E = r.memoizedProps, U = r.type === r.elementType ? E : ri(r.type, E), m.props = U, G = r.pendingProps, I = m.context, T = l.contextType, typeof T == "object" && T !== null ? T = Ma(T) : (T = Mn(l) ? Wr : Sn.current, T = Gr(r, T));
      var ce = l.getDerivedStateFromProps;
      (Q = typeof ce == "function" || typeof m.getSnapshotBeforeUpdate == "function") || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== G || I !== T) && Bv(r, m, o, T), ha = !1, I = r.memoizedState, m.state = I, fs(r, o, m, c);
      var me = r.memoizedState;
      E !== G || I !== me || Yn.current || ha ? (typeof ce == "function" && (kd(r, l, ce, o), me = r.memoizedState), (U = ha || Vv(r, l, U, o, I, me, T) || !1) ? (Q || typeof m.UNSAFE_componentWillUpdate != "function" && typeof m.componentWillUpdate != "function" || (typeof m.componentWillUpdate == "function" && m.componentWillUpdate(o, me, T), typeof m.UNSAFE_componentWillUpdate == "function" && m.UNSAFE_componentWillUpdate(o, me, T)), typeof m.componentDidUpdate == "function" && (r.flags |= 4), typeof m.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 1024), r.memoizedProps = o, r.memoizedState = me), m.props = o, m.state = me, m.context = T, o = U) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && I === n.memoizedState || (r.flags |= 1024), o = !1);
    }
    return bs(n, r, l, o, d, c);
  }
  function bs(n, r, l, o, c, d) {
    Ud(n, r);
    var m = (r.flags & 128) !== 0;
    if (!o && !m) return c && xc(r, l, !1), Ua(n, r, d);
    o = r.stateNode, ws.current = r;
    var E = m && typeof l.getDerivedStateFromError != "function" ? null : o.render();
    return r.flags |= 1, n !== null && m ? (r.child = Tn(r, n.child, null, d), r.child = Tn(r, null, E, d)) : lr(n, r, E, d), r.memoizedState = o.state, c && xc(r, l, !0), r.child;
  }
  function So(n) {
    var r = n.stateNode;
    r.pendingContext ? Nv(n, r.pendingContext, r.pendingContext !== r.context) : r.context && Nv(n, r.context, !1), bd(n, r.containerInfo);
  }
  function Wv(n, r, l, o, c) {
    return Ol(), Gi(c), r.flags |= 256, lr(n, r, l, o), r.child;
  }
  var ef = { dehydrated: null, treeContext: null, retryLane: 0 };
  function zd(n) {
    return { baseLanes: n, cachePool: null, transitions: null };
  }
  function tf(n, r, l) {
    var o = r.pendingProps, c = yn.current, d = !1, m = (r.flags & 128) !== 0, E;
    if ((E = m) || (E = n !== null && n.memoizedState === null ? !1 : (c & 2) !== 0), E ? (d = !0, r.flags &= -129) : (n === null || n.memoizedState !== null) && (c |= 1), xe(yn, c & 1), n === null)
      return yd(r), n = r.memoizedState, n !== null && (n = n.dehydrated, n !== null) ? (r.mode & 1 ? n.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824 : r.lanes = 1, null) : (m = o.children, n = o.fallback, d ? (o = r.mode, d = r.child, m = { mode: "hidden", children: m }, !(o & 1) && d !== null ? (d.childLanes = 0, d.pendingProps = m) : d = Hl(m, o, 0, null), n = el(n, o, l, null), d.return = r, n.return = r, d.sibling = n, r.child = d, r.child.memoizedState = zd(l), r.memoizedState = ef, n) : Ad(r, m));
    if (c = n.memoizedState, c !== null && (E = c.dehydrated, E !== null)) return Gv(n, r, m, o, E, c, l);
    if (d) {
      d = o.fallback, m = r.mode, c = n.child, E = c.sibling;
      var T = { mode: "hidden", children: o.children };
      return !(m & 1) && r.child !== c ? (o = r.child, o.childLanes = 0, o.pendingProps = T, r.deletions = null) : (o = Fl(c, T), o.subtreeFlags = c.subtreeFlags & 14680064), E !== null ? d = Fl(E, d) : (d = el(d, m, l, null), d.flags |= 2), d.return = r, o.return = r, o.sibling = d, r.child = o, o = d, d = r.child, m = n.child.memoizedState, m = m === null ? zd(l) : { baseLanes: m.baseLanes | l, cachePool: null, transitions: m.transitions }, d.memoizedState = m, d.childLanes = n.childLanes & ~l, r.memoizedState = ef, o;
    }
    return d = n.child, n = d.sibling, o = Fl(d, { mode: "visible", children: o.children }), !(r.mode & 1) && (o.lanes = l), o.return = r, o.sibling = null, n !== null && (l = r.deletions, l === null ? (r.deletions = [n], r.flags |= 16) : l.push(n)), r.child = o, r.memoizedState = null, o;
  }
  function Ad(n, r) {
    return r = Hl({ mode: "visible", children: r }, n.mode, 0, null), r.return = n, n.child = r;
  }
  function _s(n, r, l, o) {
    return o !== null && Gi(o), Tn(r, n.child, null, l), n = Ad(r, r.pendingProps.children), n.flags |= 2, r.memoizedState = null, n;
  }
  function Gv(n, r, l, o, c, d, m) {
    if (l)
      return r.flags & 256 ? (r.flags &= -257, o = Od(Error(A(422))), _s(n, r, m, o)) : r.memoizedState !== null ? (r.child = n.child, r.flags |= 128, null) : (d = o.fallback, c = r.mode, o = Hl({ mode: "visible", children: o.children }, c, 0, null), d = el(d, c, m, null), d.flags |= 2, o.return = r, d.return = r, o.sibling = d, r.child = o, r.mode & 1 && Tn(r, n.child, null, m), r.child.memoizedState = zd(m), r.memoizedState = ef, d);
    if (!(r.mode & 1)) return _s(n, r, m, null);
    if (c.data === "$!") {
      if (o = c.nextSibling && c.nextSibling.dataset, o) var E = o.dgst;
      return o = E, d = Error(A(419)), o = Od(d, o, void 0), _s(n, r, m, o);
    }
    if (E = (m & n.childLanes) !== 0, zn || E) {
      if (o = Qn, o !== null) {
        switch (m & -m) {
          case 4:
            c = 2;
            break;
          case 16:
            c = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            c = 32;
            break;
          case 536870912:
            c = 268435456;
            break;
          default:
            c = 0;
        }
        c = c & (o.suspendedLanes | m) ? 0 : c, c !== 0 && c !== d.retryLane && (d.retryLane = c, va(n, c), Nr(o, n, c, -1));
      }
      return Qd(), o = Od(Error(A(421))), _s(n, r, m, o);
    }
    return c.data === "$?" ? (r.flags |= 128, r.child = n.child, r = gy.bind(null, n), c._reactRetry = r, null) : (n = d.treeContext, Xr = Si(c.nextSibling), qr = r, fn = !0, La = null, n !== null && (Nn[Oa++] = Ti, Nn[Oa++] = wi, Nn[Oa++] = da, Ti = n.id, wi = n.overflow, da = r), r = Ad(r, o.children), r.flags |= 4096, r);
  }
  function jd(n, r, l) {
    n.lanes |= r;
    var o = n.alternate;
    o !== null && (o.lanes |= r), Cd(n.return, r, l);
  }
  function Or(n, r, l, o, c) {
    var d = n.memoizedState;
    d === null ? n.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: o, tail: l, tailMode: c } : (d.isBackwards = r, d.rendering = null, d.renderingStartTime = 0, d.last = o, d.tail = l, d.tailMode = c);
  }
  function bi(n, r, l) {
    var o = r.pendingProps, c = o.revealOrder, d = o.tail;
    if (lr(n, r, o.children, l), o = yn.current, o & 2) o = o & 1 | 2, r.flags |= 128;
    else {
      if (n !== null && n.flags & 128) e: for (n = r.child; n !== null; ) {
        if (n.tag === 13) n.memoizedState !== null && jd(n, l, r);
        else if (n.tag === 19) jd(n, l, r);
        else if (n.child !== null) {
          n.child.return = n, n = n.child;
          continue;
        }
        if (n === r) break e;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === r) break e;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
      o &= 1;
    }
    if (xe(yn, o), !(r.mode & 1)) r.memoizedState = null;
    else switch (c) {
      case "forwards":
        for (l = r.child, c = null; l !== null; ) n = l.alternate, n !== null && Nc(n) === null && (c = l), l = l.sibling;
        l = c, l === null ? (c = r.child, r.child = null) : (c = l.sibling, l.sibling = null), Or(r, !1, c, l, d);
        break;
      case "backwards":
        for (l = null, c = r.child, r.child = null; c !== null; ) {
          if (n = c.alternate, n !== null && Nc(n) === null) {
            r.child = c;
            break;
          }
          n = c.sibling, c.sibling = l, l = c, c = n;
        }
        Or(r, !0, l, null, d);
        break;
      case "together":
        Or(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function Na(n, r) {
    !(r.mode & 1) && n !== null && (n.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function Ua(n, r, l) {
    if (n !== null && (r.dependencies = n.dependencies), ki |= r.lanes, !(l & r.childLanes)) return null;
    if (n !== null && r.child !== n.child) throw Error(A(153));
    if (r.child !== null) {
      for (n = r.child, l = Fl(n, n.pendingProps), r.child = l, l.return = r; n.sibling !== null; ) n = n.sibling, l = l.sibling = Fl(n, n.pendingProps), l.return = r;
      l.sibling = null;
    }
    return r.child;
  }
  function Ds(n, r, l) {
    switch (r.tag) {
      case 3:
        So(r), Ol();
        break;
      case 5:
        Hv(r);
        break;
      case 1:
        Mn(r.type) && Xn(r);
        break;
      case 4:
        bd(r, r.stateNode.containerInfo);
        break;
      case 10:
        var o = r.type._context, c = r.memoizedProps.value;
        xe(pa, o._currentValue), o._currentValue = c;
        break;
      case 13:
        if (o = r.memoizedState, o !== null)
          return o.dehydrated !== null ? (xe(yn, yn.current & 1), r.flags |= 128, null) : l & r.child.childLanes ? tf(n, r, l) : (xe(yn, yn.current & 1), n = Ua(n, r, l), n !== null ? n.sibling : null);
        xe(yn, yn.current & 1);
        break;
      case 19:
        if (o = (l & r.childLanes) !== 0, n.flags & 128) {
          if (o) return bi(n, r, l);
          r.flags |= 128;
        }
        if (c = r.memoizedState, c !== null && (c.rendering = null, c.tail = null, c.lastEffect = null), xe(yn, yn.current), o) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, xs(n, r, l);
    }
    return Ua(n, r, l);
  }
  var za, An, qv, Xv;
  za = function(n, r) {
    for (var l = r.child; l !== null; ) {
      if (l.tag === 5 || l.tag === 6) n.appendChild(l.stateNode);
      else if (l.tag !== 4 && l.child !== null) {
        l.child.return = l, l = l.child;
        continue;
      }
      if (l === r) break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === r) return;
        l = l.return;
      }
      l.sibling.return = l.return, l = l.sibling;
    }
  }, An = function() {
  }, qv = function(n, r, l, o) {
    var c = n.memoizedProps;
    if (c !== o) {
      n = r.stateNode, gu(xi.current);
      var d = null;
      switch (l) {
        case "input":
          c = tr(n, c), o = tr(n, o), d = [];
          break;
        case "select":
          c = ne({}, c, { value: void 0 }), o = ne({}, o, { value: void 0 }), d = [];
          break;
        case "textarea":
          c = Bn(n, c), o = Bn(n, o), d = [];
          break;
        default:
          typeof c.onClick != "function" && typeof o.onClick == "function" && (n.onclick = wl);
      }
      un(l, o);
      var m;
      l = null;
      for (U in c) if (!o.hasOwnProperty(U) && c.hasOwnProperty(U) && c[U] != null) if (U === "style") {
        var E = c[U];
        for (m in E) E.hasOwnProperty(m) && (l || (l = {}), l[m] = "");
      } else U !== "dangerouslySetInnerHTML" && U !== "children" && U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && U !== "autoFocus" && (pt.hasOwnProperty(U) ? d || (d = []) : (d = d || []).push(U, null));
      for (U in o) {
        var T = o[U];
        if (E = c != null ? c[U] : void 0, o.hasOwnProperty(U) && T !== E && (T != null || E != null)) if (U === "style") if (E) {
          for (m in E) !E.hasOwnProperty(m) || T && T.hasOwnProperty(m) || (l || (l = {}), l[m] = "");
          for (m in T) T.hasOwnProperty(m) && E[m] !== T[m] && (l || (l = {}), l[m] = T[m]);
        } else l || (d || (d = []), d.push(
          U,
          l
        )), l = T;
        else U === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, E = E ? E.__html : void 0, T != null && E !== T && (d = d || []).push(U, T)) : U === "children" ? typeof T != "string" && typeof T != "number" || (d = d || []).push(U, "" + T) : U !== "suppressContentEditableWarning" && U !== "suppressHydrationWarning" && (pt.hasOwnProperty(U) ? (T != null && U === "onScroll" && Ht("scroll", n), d || E === T || (d = [])) : (d = d || []).push(U, T));
      }
      l && (d = d || []).push("style", l);
      var U = d;
      (r.updateQueue = U) && (r.flags |= 4);
    }
  }, Xv = function(n, r, l, o) {
    l !== o && (r.flags |= 4);
  };
  function ks(n, r) {
    if (!fn) switch (n.tailMode) {
      case "hidden":
        r = n.tail;
        for (var l = null; r !== null; ) r.alternate !== null && (l = r), r = r.sibling;
        l === null ? n.tail = null : l.sibling = null;
        break;
      case "collapsed":
        l = n.tail;
        for (var o = null; l !== null; ) l.alternate !== null && (o = l), l = l.sibling;
        o === null ? r || n.tail === null ? n.tail = null : n.tail.sibling = null : o.sibling = null;
    }
  }
  function Jn(n) {
    var r = n.alternate !== null && n.alternate.child === n.child, l = 0, o = 0;
    if (r) for (var c = n.child; c !== null; ) l |= c.lanes | c.childLanes, o |= c.subtreeFlags & 14680064, o |= c.flags & 14680064, c.return = n, c = c.sibling;
    else for (c = n.child; c !== null; ) l |= c.lanes | c.childLanes, o |= c.subtreeFlags, o |= c.flags, c.return = n, c = c.sibling;
    return n.subtreeFlags |= o, n.childLanes = l, r;
  }
  function Kv(n, r, l) {
    var o = r.pendingProps;
    switch (Dc(r), r.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Jn(r), null;
      case 1:
        return Mn(r.type) && vo(), Jn(r), null;
      case 3:
        return o = r.stateNode, Su(), rn(Yn), rn(Sn), De(), o.pendingContext && (o.context = o.pendingContext, o.pendingContext = null), (n === null || n.child === null) && (kc(r) ? r.flags |= 4 : n === null || n.memoizedState.isDehydrated && !(r.flags & 256) || (r.flags |= 1024, La !== null && (Ou(La), La = null))), An(n, r), Jn(r), null;
      case 5:
        Mc(r);
        var c = gu(vs.current);
        if (l = r.type, n !== null && r.stateNode != null) qv(n, r, l, o, c), n.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!o) {
            if (r.stateNode === null) throw Error(A(166));
            return Jn(r), null;
          }
          if (n = gu(xi.current), kc(r)) {
            o = r.stateNode, l = r.type;
            var d = r.memoizedProps;
            switch (o[Ei] = r, o[us] = d, n = (r.mode & 1) !== 0, l) {
              case "dialog":
                Ht("cancel", o), Ht("close", o);
                break;
              case "iframe":
              case "object":
              case "embed":
                Ht("load", o);
                break;
              case "video":
              case "audio":
                for (c = 0; c < as.length; c++) Ht(as[c], o);
                break;
              case "source":
                Ht("error", o);
                break;
              case "img":
              case "image":
              case "link":
                Ht(
                  "error",
                  o
                ), Ht("load", o);
                break;
              case "details":
                Ht("toggle", o);
                break;
              case "input":
                Pn(o, d), Ht("invalid", o);
                break;
              case "select":
                o._wrapperState = { wasMultiple: !!d.multiple }, Ht("invalid", o);
                break;
              case "textarea":
                yr(o, d), Ht("invalid", o);
            }
            un(l, d), c = null;
            for (var m in d) if (d.hasOwnProperty(m)) {
              var E = d[m];
              m === "children" ? typeof E == "string" ? o.textContent !== E && (d.suppressHydrationWarning !== !0 && Cc(o.textContent, E, n), c = ["children", E]) : typeof E == "number" && o.textContent !== "" + E && (d.suppressHydrationWarning !== !0 && Cc(
                o.textContent,
                E,
                n
              ), c = ["children", "" + E]) : pt.hasOwnProperty(m) && E != null && m === "onScroll" && Ht("scroll", o);
            }
            switch (l) {
              case "input":
                kn(o), si(o, d, !0);
                break;
              case "textarea":
                kn(o), On(o);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (o.onclick = wl);
            }
            o = c, r.updateQueue = o, o !== null && (r.flags |= 4);
          } else {
            m = c.nodeType === 9 ? c : c.ownerDocument, n === "http://www.w3.org/1999/xhtml" && (n = gr(l)), n === "http://www.w3.org/1999/xhtml" ? l === "script" ? (n = m.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(n.firstChild)) : typeof o.is == "string" ? n = m.createElement(l, { is: o.is }) : (n = m.createElement(l), l === "select" && (m = n, o.multiple ? m.multiple = !0 : o.size && (m.size = o.size))) : n = m.createElementNS(n, l), n[Ei] = r, n[us] = o, za(n, r, !1, !1), r.stateNode = n;
            e: {
              switch (m = qn(l, o), l) {
                case "dialog":
                  Ht("cancel", n), Ht("close", n), c = o;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Ht("load", n), c = o;
                  break;
                case "video":
                case "audio":
                  for (c = 0; c < as.length; c++) Ht(as[c], n);
                  c = o;
                  break;
                case "source":
                  Ht("error", n), c = o;
                  break;
                case "img":
                case "image":
                case "link":
                  Ht(
                    "error",
                    n
                  ), Ht("load", n), c = o;
                  break;
                case "details":
                  Ht("toggle", n), c = o;
                  break;
                case "input":
                  Pn(n, o), c = tr(n, o), Ht("invalid", n);
                  break;
                case "option":
                  c = o;
                  break;
                case "select":
                  n._wrapperState = { wasMultiple: !!o.multiple }, c = ne({}, o, { value: void 0 }), Ht("invalid", n);
                  break;
                case "textarea":
                  yr(n, o), c = Bn(n, o), Ht("invalid", n);
                  break;
                default:
                  c = o;
              }
              un(l, c), E = c;
              for (d in E) if (E.hasOwnProperty(d)) {
                var T = E[d];
                d === "style" ? Zt(n, T) : d === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, T != null && ci(n, T)) : d === "children" ? typeof T == "string" ? (l !== "textarea" || T !== "") && ee(n, T) : typeof T == "number" && ee(n, "" + T) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (pt.hasOwnProperty(d) ? T != null && d === "onScroll" && Ht("scroll", n) : T != null && Qe(n, d, T, m));
              }
              switch (l) {
                case "input":
                  kn(n), si(n, o, !1);
                  break;
                case "textarea":
                  kn(n), On(n);
                  break;
                case "option":
                  o.value != null && n.setAttribute("value", "" + nt(o.value));
                  break;
                case "select":
                  n.multiple = !!o.multiple, d = o.value, d != null ? Cn(n, !!o.multiple, d, !1) : o.defaultValue != null && Cn(
                    n,
                    !!o.multiple,
                    o.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof c.onClick == "function" && (n.onclick = wl);
              }
              switch (l) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  o = !!o.autoFocus;
                  break e;
                case "img":
                  o = !0;
                  break e;
                default:
                  o = !1;
              }
            }
            o && (r.flags |= 4);
          }
          r.ref !== null && (r.flags |= 512, r.flags |= 2097152);
        }
        return Jn(r), null;
      case 6:
        if (n && r.stateNode != null) Xv(n, r, n.memoizedProps, o);
        else {
          if (typeof o != "string" && r.stateNode === null) throw Error(A(166));
          if (l = gu(vs.current), gu(xi.current), kc(r)) {
            if (o = r.stateNode, l = r.memoizedProps, o[Ei] = r, (d = o.nodeValue !== l) && (n = qr, n !== null)) switch (n.tag) {
              case 3:
                Cc(o.nodeValue, l, (n.mode & 1) !== 0);
                break;
              case 5:
                n.memoizedProps.suppressHydrationWarning !== !0 && Cc(o.nodeValue, l, (n.mode & 1) !== 0);
            }
            d && (r.flags |= 4);
          } else o = (l.nodeType === 9 ? l : l.ownerDocument).createTextNode(o), o[Ei] = r, r.stateNode = o;
        }
        return Jn(r), null;
      case 13:
        if (rn(yn), o = r.memoizedState, n === null || n.memoizedState !== null && n.memoizedState.dehydrated !== null) {
          if (fn && Xr !== null && r.mode & 1 && !(r.flags & 128)) cs(), Ol(), r.flags |= 98560, d = !1;
          else if (d = kc(r), o !== null && o.dehydrated !== null) {
            if (n === null) {
              if (!d) throw Error(A(318));
              if (d = r.memoizedState, d = d !== null ? d.dehydrated : null, !d) throw Error(A(317));
              d[Ei] = r;
            } else Ol(), !(r.flags & 128) && (r.memoizedState = null), r.flags |= 4;
            Jn(r), d = !1;
          } else La !== null && (Ou(La), La = null), d = !0;
          if (!d) return r.flags & 65536 ? r : null;
        }
        return r.flags & 128 ? (r.lanes = l, r) : (o = o !== null, o !== (n !== null && n.memoizedState !== null) && o && (r.child.flags |= 8192, r.mode & 1 && (n === null || yn.current & 1 ? bn === 0 && (bn = 3) : Qd())), r.updateQueue !== null && (r.flags |= 4), Jn(r), null);
      case 4:
        return Su(), An(n, r), n === null && oo(r.stateNode.containerInfo), Jn(r), null;
      case 10:
        return Ed(r.type._context), Jn(r), null;
      case 17:
        return Mn(r.type) && vo(), Jn(r), null;
      case 19:
        if (rn(yn), d = r.memoizedState, d === null) return Jn(r), null;
        if (o = (r.flags & 128) !== 0, m = d.rendering, m === null) if (o) ks(d, !1);
        else {
          if (bn !== 0 || n !== null && n.flags & 128) for (n = r.child; n !== null; ) {
            if (m = Nc(n), m !== null) {
              for (r.flags |= 128, ks(d, !1), o = m.updateQueue, o !== null && (r.updateQueue = o, r.flags |= 4), r.subtreeFlags = 0, o = l, l = r.child; l !== null; ) d = l, n = o, d.flags &= 14680066, m = d.alternate, m === null ? (d.childLanes = 0, d.lanes = n, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = m.childLanes, d.lanes = m.lanes, d.child = m.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = m.memoizedProps, d.memoizedState = m.memoizedState, d.updateQueue = m.updateQueue, d.type = m.type, n = m.dependencies, d.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }), l = l.sibling;
              return xe(yn, yn.current & 1 | 2), r.child;
            }
            n = n.sibling;
          }
          d.tail !== null && qe() > To && (r.flags |= 128, o = !0, ks(d, !1), r.lanes = 4194304);
        }
        else {
          if (!o) if (n = Nc(m), n !== null) {
            if (r.flags |= 128, o = !0, l = n.updateQueue, l !== null && (r.updateQueue = l, r.flags |= 4), ks(d, !0), d.tail === null && d.tailMode === "hidden" && !m.alternate && !fn) return Jn(r), null;
          } else 2 * qe() - d.renderingStartTime > To && l !== 1073741824 && (r.flags |= 128, o = !0, ks(d, !1), r.lanes = 4194304);
          d.isBackwards ? (m.sibling = r.child, r.child = m) : (l = d.last, l !== null ? l.sibling = m : r.child = m, d.last = m);
        }
        return d.tail !== null ? (r = d.tail, d.rendering = r, d.tail = r.sibling, d.renderingStartTime = qe(), r.sibling = null, l = yn.current, xe(yn, o ? l & 1 | 2 : l & 1), r) : (Jn(r), null);
      case 22:
      case 23:
        return Id(), o = r.memoizedState !== null, n !== null && n.memoizedState !== null !== o && (r.flags |= 8192), o && r.mode & 1 ? ma & 1073741824 && (Jn(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : Jn(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(A(156, r.tag));
  }
  function nf(n, r) {
    switch (Dc(r), r.tag) {
      case 1:
        return Mn(r.type) && vo(), n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 3:
        return Su(), rn(Yn), rn(Sn), De(), n = r.flags, n & 65536 && !(n & 128) ? (r.flags = n & -65537 | 128, r) : null;
      case 5:
        return Mc(r), null;
      case 13:
        if (rn(yn), n = r.memoizedState, n !== null && n.dehydrated !== null) {
          if (r.alternate === null) throw Error(A(340));
          Ol();
        }
        return n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 19:
        return rn(yn), null;
      case 4:
        return Su(), null;
      case 10:
        return Ed(r.type._context), null;
      case 22:
      case 23:
        return Id(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Os = !1, Rr = !1, fy = typeof WeakSet == "function" ? WeakSet : Set, ve = null;
  function Eo(n, r) {
    var l = n.ref;
    if (l !== null) if (typeof l == "function") try {
      l(null);
    } catch (o) {
      dn(n, r, o);
    }
    else l.current = null;
  }
  function rf(n, r, l) {
    try {
      l();
    } catch (o) {
      dn(n, r, o);
    }
  }
  var Jv = !1;
  function Zv(n, r) {
    if (ls = ba, n = ns(), pc(n)) {
      if ("selectionStart" in n) var l = { start: n.selectionStart, end: n.selectionEnd };
      else e: {
        l = (l = n.ownerDocument) && l.defaultView || window;
        var o = l.getSelection && l.getSelection();
        if (o && o.rangeCount !== 0) {
          l = o.anchorNode;
          var c = o.anchorOffset, d = o.focusNode;
          o = o.focusOffset;
          try {
            l.nodeType, d.nodeType;
          } catch {
            l = null;
            break e;
          }
          var m = 0, E = -1, T = -1, U = 0, Q = 0, G = n, I = null;
          t: for (; ; ) {
            for (var ce; G !== l || c !== 0 && G.nodeType !== 3 || (E = m + c), G !== d || o !== 0 && G.nodeType !== 3 || (T = m + o), G.nodeType === 3 && (m += G.nodeValue.length), (ce = G.firstChild) !== null; )
              I = G, G = ce;
            for (; ; ) {
              if (G === n) break t;
              if (I === l && ++U === c && (E = m), I === d && ++Q === o && (T = m), (ce = G.nextSibling) !== null) break;
              G = I, I = G.parentNode;
            }
            G = ce;
          }
          l = E === -1 || T === -1 ? null : { start: E, end: T };
        } else l = null;
      }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (du = { focusedElem: n, selectionRange: l }, ba = !1, ve = r; ve !== null; ) if (r = ve, n = r.child, (r.subtreeFlags & 1028) !== 0 && n !== null) n.return = r, ve = n;
    else for (; ve !== null; ) {
      r = ve;
      try {
        var me = r.alternate;
        if (r.flags & 1024) switch (r.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (me !== null) {
              var Ee = me.memoizedProps, _n = me.memoizedState, D = r.stateNode, x = D.getSnapshotBeforeUpdate(r.elementType === r.type ? Ee : ri(r.type, Ee), _n);
              D.__reactInternalSnapshotBeforeUpdate = x;
            }
            break;
          case 3:
            var L = r.stateNode.containerInfo;
            L.nodeType === 1 ? L.textContent = "" : L.nodeType === 9 && L.documentElement && L.removeChild(L.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(A(163));
        }
      } catch (W) {
        dn(r, r.return, W);
      }
      if (n = r.sibling, n !== null) {
        n.return = r.return, ve = n;
        break;
      }
      ve = r.return;
    }
    return me = Jv, Jv = !1, me;
  }
  function Ls(n, r, l) {
    var o = r.updateQueue;
    if (o = o !== null ? o.lastEffect : null, o !== null) {
      var c = o = o.next;
      do {
        if ((c.tag & n) === n) {
          var d = c.destroy;
          c.destroy = void 0, d !== void 0 && rf(r, l, d);
        }
        c = c.next;
      } while (c !== o);
    }
  }
  function Ms(n, r) {
    if (r = r.updateQueue, r = r !== null ? r.lastEffect : null, r !== null) {
      var l = r = r.next;
      do {
        if ((l.tag & n) === n) {
          var o = l.create;
          l.destroy = o();
        }
        l = l.next;
      } while (l !== r);
    }
  }
  function Fd(n) {
    var r = n.ref;
    if (r !== null) {
      var l = n.stateNode;
      switch (n.tag) {
        case 5:
          n = l;
          break;
        default:
          n = l;
      }
      typeof r == "function" ? r(n) : r.current = n;
    }
  }
  function af(n) {
    var r = n.alternate;
    r !== null && (n.alternate = null, af(r)), n.child = null, n.deletions = null, n.sibling = null, n.tag === 5 && (r = n.stateNode, r !== null && (delete r[Ei], delete r[us], delete r[os], delete r[po], delete r[sy])), n.stateNode = null, n.return = null, n.dependencies = null, n.memoizedProps = null, n.memoizedState = null, n.pendingProps = null, n.stateNode = null, n.updateQueue = null;
  }
  function Ns(n) {
    return n.tag === 5 || n.tag === 3 || n.tag === 4;
  }
  function Ki(n) {
    e: for (; ; ) {
      for (; n.sibling === null; ) {
        if (n.return === null || Ns(n.return)) return null;
        n = n.return;
      }
      for (n.sibling.return = n.return, n = n.sibling; n.tag !== 5 && n.tag !== 6 && n.tag !== 18; ) {
        if (n.flags & 2 || n.child === null || n.tag === 4) continue e;
        n.child.return = n, n = n.child;
      }
      if (!(n.flags & 2)) return n.stateNode;
    }
  }
  function _i(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6) n = n.stateNode, r ? l.nodeType === 8 ? l.parentNode.insertBefore(n, r) : l.insertBefore(n, r) : (l.nodeType === 8 ? (r = l.parentNode, r.insertBefore(n, l)) : (r = l, r.appendChild(n)), l = l._reactRootContainer, l != null || r.onclick !== null || (r.onclick = wl));
    else if (o !== 4 && (n = n.child, n !== null)) for (_i(n, r, l), n = n.sibling; n !== null; ) _i(n, r, l), n = n.sibling;
  }
  function Di(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6) n = n.stateNode, r ? l.insertBefore(n, r) : l.appendChild(n);
    else if (o !== 4 && (n = n.child, n !== null)) for (Di(n, r, l), n = n.sibling; n !== null; ) Di(n, r, l), n = n.sibling;
  }
  var xn = null, Lr = !1;
  function Mr(n, r, l) {
    for (l = l.child; l !== null; ) eh(n, r, l), l = l.sibling;
  }
  function eh(n, r, l) {
    if (Ir && typeof Ir.onCommitFiberUnmount == "function") try {
      Ir.onCommitFiberUnmount(hl, l);
    } catch {
    }
    switch (l.tag) {
      case 5:
        Rr || Eo(l, r);
      case 6:
        var o = xn, c = Lr;
        xn = null, Mr(n, r, l), xn = o, Lr = c, xn !== null && (Lr ? (n = xn, l = l.stateNode, n.nodeType === 8 ? n.parentNode.removeChild(l) : n.removeChild(l)) : xn.removeChild(l.stateNode));
        break;
      case 18:
        xn !== null && (Lr ? (n = xn, l = l.stateNode, n.nodeType === 8 ? fo(n.parentNode, l) : n.nodeType === 1 && fo(n, l), Ja(n)) : fo(xn, l.stateNode));
        break;
      case 4:
        o = xn, c = Lr, xn = l.stateNode.containerInfo, Lr = !0, Mr(n, r, l), xn = o, Lr = c;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!Rr && (o = l.updateQueue, o !== null && (o = o.lastEffect, o !== null))) {
          c = o = o.next;
          do {
            var d = c, m = d.destroy;
            d = d.tag, m !== void 0 && (d & 2 || d & 4) && rf(l, r, m), c = c.next;
          } while (c !== o);
        }
        Mr(n, r, l);
        break;
      case 1:
        if (!Rr && (Eo(l, r), o = l.stateNode, typeof o.componentWillUnmount == "function")) try {
          o.props = l.memoizedProps, o.state = l.memoizedState, o.componentWillUnmount();
        } catch (E) {
          dn(l, r, E);
        }
        Mr(n, r, l);
        break;
      case 21:
        Mr(n, r, l);
        break;
      case 22:
        l.mode & 1 ? (Rr = (o = Rr) || l.memoizedState !== null, Mr(n, r, l), Rr = o) : Mr(n, r, l);
        break;
      default:
        Mr(n, r, l);
    }
  }
  function th(n) {
    var r = n.updateQueue;
    if (r !== null) {
      n.updateQueue = null;
      var l = n.stateNode;
      l === null && (l = n.stateNode = new fy()), r.forEach(function(o) {
        var c = ch.bind(null, n, o);
        l.has(o) || (l.add(o), o.then(c, c));
      });
    }
  }
  function ai(n, r) {
    var l = r.deletions;
    if (l !== null) for (var o = 0; o < l.length; o++) {
      var c = l[o];
      try {
        var d = n, m = r, E = m;
        e: for (; E !== null; ) {
          switch (E.tag) {
            case 5:
              xn = E.stateNode, Lr = !1;
              break e;
            case 3:
              xn = E.stateNode.containerInfo, Lr = !0;
              break e;
            case 4:
              xn = E.stateNode.containerInfo, Lr = !0;
              break e;
          }
          E = E.return;
        }
        if (xn === null) throw Error(A(160));
        eh(d, m, c), xn = null, Lr = !1;
        var T = c.alternate;
        T !== null && (T.return = null), c.return = null;
      } catch (U) {
        dn(c, r, U);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) Hd(r, n), r = r.sibling;
  }
  function Hd(n, r) {
    var l = n.alternate, o = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (ai(r, n), ea(n), o & 4) {
          try {
            Ls(3, n, n.return), Ms(3, n);
          } catch (Ee) {
            dn(n, n.return, Ee);
          }
          try {
            Ls(5, n, n.return);
          } catch (Ee) {
            dn(n, n.return, Ee);
          }
        }
        break;
      case 1:
        ai(r, n), ea(n), o & 512 && l !== null && Eo(l, l.return);
        break;
      case 5:
        if (ai(r, n), ea(n), o & 512 && l !== null && Eo(l, l.return), n.flags & 32) {
          var c = n.stateNode;
          try {
            ee(c, "");
          } catch (Ee) {
            dn(n, n.return, Ee);
          }
        }
        if (o & 4 && (c = n.stateNode, c != null)) {
          var d = n.memoizedProps, m = l !== null ? l.memoizedProps : d, E = n.type, T = n.updateQueue;
          if (n.updateQueue = null, T !== null) try {
            E === "input" && d.type === "radio" && d.name != null && Vn(c, d), qn(E, m);
            var U = qn(E, d);
            for (m = 0; m < T.length; m += 2) {
              var Q = T[m], G = T[m + 1];
              Q === "style" ? Zt(c, G) : Q === "dangerouslySetInnerHTML" ? ci(c, G) : Q === "children" ? ee(c, G) : Qe(c, Q, G, U);
            }
            switch (E) {
              case "input":
                Yr(c, d);
                break;
              case "textarea":
                Ya(c, d);
                break;
              case "select":
                var I = c._wrapperState.wasMultiple;
                c._wrapperState.wasMultiple = !!d.multiple;
                var ce = d.value;
                ce != null ? Cn(c, !!d.multiple, ce, !1) : I !== !!d.multiple && (d.defaultValue != null ? Cn(
                  c,
                  !!d.multiple,
                  d.defaultValue,
                  !0
                ) : Cn(c, !!d.multiple, d.multiple ? [] : "", !1));
            }
            c[us] = d;
          } catch (Ee) {
            dn(n, n.return, Ee);
          }
        }
        break;
      case 6:
        if (ai(r, n), ea(n), o & 4) {
          if (n.stateNode === null) throw Error(A(162));
          c = n.stateNode, d = n.memoizedProps;
          try {
            c.nodeValue = d;
          } catch (Ee) {
            dn(n, n.return, Ee);
          }
        }
        break;
      case 3:
        if (ai(r, n), ea(n), o & 4 && l !== null && l.memoizedState.isDehydrated) try {
          Ja(r.containerInfo);
        } catch (Ee) {
          dn(n, n.return, Ee);
        }
        break;
      case 4:
        ai(r, n), ea(n);
        break;
      case 13:
        ai(r, n), ea(n), c = n.child, c.flags & 8192 && (d = c.memoizedState !== null, c.stateNode.isHidden = d, !d || c.alternate !== null && c.alternate.memoizedState !== null || (Bd = qe())), o & 4 && th(n);
        break;
      case 22:
        if (Q = l !== null && l.memoizedState !== null, n.mode & 1 ? (Rr = (U = Rr) || Q, ai(r, n), Rr = U) : ai(r, n), ea(n), o & 8192) {
          if (U = n.memoizedState !== null, (n.stateNode.isHidden = U) && !Q && n.mode & 1) for (ve = n, Q = n.child; Q !== null; ) {
            for (G = ve = Q; ve !== null; ) {
              switch (I = ve, ce = I.child, I.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Ls(4, I, I.return);
                  break;
                case 1:
                  Eo(I, I.return);
                  var me = I.stateNode;
                  if (typeof me.componentWillUnmount == "function") {
                    o = I, l = I.return;
                    try {
                      r = o, me.props = r.memoizedProps, me.state = r.memoizedState, me.componentWillUnmount();
                    } catch (Ee) {
                      dn(o, l, Ee);
                    }
                  }
                  break;
                case 5:
                  Eo(I, I.return);
                  break;
                case 22:
                  if (I.memoizedState !== null) {
                    Us(G);
                    continue;
                  }
              }
              ce !== null ? (ce.return = I, ve = ce) : Us(G);
            }
            Q = Q.sibling;
          }
          e: for (Q = null, G = n; ; ) {
            if (G.tag === 5) {
              if (Q === null) {
                Q = G;
                try {
                  c = G.stateNode, U ? (d = c.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (E = G.stateNode, T = G.memoizedProps.style, m = T != null && T.hasOwnProperty("display") ? T.display : null, E.style.display = At("display", m));
                } catch (Ee) {
                  dn(n, n.return, Ee);
                }
              }
            } else if (G.tag === 6) {
              if (Q === null) try {
                G.stateNode.nodeValue = U ? "" : G.memoizedProps;
              } catch (Ee) {
                dn(n, n.return, Ee);
              }
            } else if ((G.tag !== 22 && G.tag !== 23 || G.memoizedState === null || G === n) && G.child !== null) {
              G.child.return = G, G = G.child;
              continue;
            }
            if (G === n) break e;
            for (; G.sibling === null; ) {
              if (G.return === null || G.return === n) break e;
              Q === G && (Q = null), G = G.return;
            }
            Q === G && (Q = null), G.sibling.return = G.return, G = G.sibling;
          }
        }
        break;
      case 19:
        ai(r, n), ea(n), o & 4 && th(n);
        break;
      case 21:
        break;
      default:
        ai(
          r,
          n
        ), ea(n);
    }
  }
  function ea(n) {
    var r = n.flags;
    if (r & 2) {
      try {
        e: {
          for (var l = n.return; l !== null; ) {
            if (Ns(l)) {
              var o = l;
              break e;
            }
            l = l.return;
          }
          throw Error(A(160));
        }
        switch (o.tag) {
          case 5:
            var c = o.stateNode;
            o.flags & 32 && (ee(c, ""), o.flags &= -33);
            var d = Ki(n);
            Di(n, d, c);
            break;
          case 3:
          case 4:
            var m = o.stateNode.containerInfo, E = Ki(n);
            _i(n, E, m);
            break;
          default:
            throw Error(A(161));
        }
      } catch (T) {
        dn(n, n.return, T);
      }
      n.flags &= -3;
    }
    r & 4096 && (n.flags &= -4097);
  }
  function dy(n, r, l) {
    ve = n, Pd(n);
  }
  function Pd(n, r, l) {
    for (var o = (n.mode & 1) !== 0; ve !== null; ) {
      var c = ve, d = c.child;
      if (c.tag === 22 && o) {
        var m = c.memoizedState !== null || Os;
        if (!m) {
          var E = c.alternate, T = E !== null && E.memoizedState !== null || Rr;
          E = Os;
          var U = Rr;
          if (Os = m, (Rr = T) && !U) for (ve = c; ve !== null; ) m = ve, T = m.child, m.tag === 22 && m.memoizedState !== null ? Vd(c) : T !== null ? (T.return = m, ve = T) : Vd(c);
          for (; d !== null; ) ve = d, Pd(d), d = d.sibling;
          ve = c, Os = E, Rr = U;
        }
        nh(n);
      } else c.subtreeFlags & 8772 && d !== null ? (d.return = c, ve = d) : nh(n);
    }
  }
  function nh(n) {
    for (; ve !== null; ) {
      var r = ve;
      if (r.flags & 8772) {
        var l = r.alternate;
        try {
          if (r.flags & 8772) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              Rr || Ms(5, r);
              break;
            case 1:
              var o = r.stateNode;
              if (r.flags & 4 && !Rr) if (l === null) o.componentDidMount();
              else {
                var c = r.elementType === r.type ? l.memoizedProps : ri(r.type, l.memoizedProps);
                o.componentDidUpdate(c, l.memoizedState, o.__reactInternalSnapshotBeforeUpdate);
              }
              var d = r.updateQueue;
              d !== null && xd(r, d, o);
              break;
            case 3:
              var m = r.updateQueue;
              if (m !== null) {
                if (l = null, r.child !== null) switch (r.child.tag) {
                  case 5:
                    l = r.child.stateNode;
                    break;
                  case 1:
                    l = r.child.stateNode;
                }
                xd(r, m, l);
              }
              break;
            case 5:
              var E = r.stateNode;
              if (l === null && r.flags & 4) {
                l = E;
                var T = r.memoizedProps;
                switch (r.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    T.autoFocus && l.focus();
                    break;
                  case "img":
                    T.src && (l.src = T.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (r.memoizedState === null) {
                var U = r.alternate;
                if (U !== null) {
                  var Q = U.memoizedState;
                  if (Q !== null) {
                    var G = Q.dehydrated;
                    G !== null && Ja(G);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(A(163));
          }
          Rr || r.flags & 512 && Fd(r);
        } catch (I) {
          dn(r, r.return, I);
        }
      }
      if (r === n) {
        ve = null;
        break;
      }
      if (l = r.sibling, l !== null) {
        l.return = r.return, ve = l;
        break;
      }
      ve = r.return;
    }
  }
  function Us(n) {
    for (; ve !== null; ) {
      var r = ve;
      if (r === n) {
        ve = null;
        break;
      }
      var l = r.sibling;
      if (l !== null) {
        l.return = r.return, ve = l;
        break;
      }
      ve = r.return;
    }
  }
  function Vd(n) {
    for (; ve !== null; ) {
      var r = ve;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var l = r.return;
            try {
              Ms(4, r);
            } catch (T) {
              dn(r, l, T);
            }
            break;
          case 1:
            var o = r.stateNode;
            if (typeof o.componentDidMount == "function") {
              var c = r.return;
              try {
                o.componentDidMount();
              } catch (T) {
                dn(r, c, T);
              }
            }
            var d = r.return;
            try {
              Fd(r);
            } catch (T) {
              dn(r, d, T);
            }
            break;
          case 5:
            var m = r.return;
            try {
              Fd(r);
            } catch (T) {
              dn(r, m, T);
            }
        }
      } catch (T) {
        dn(r, r.return, T);
      }
      if (r === n) {
        ve = null;
        break;
      }
      var E = r.sibling;
      if (E !== null) {
        E.return = r.return, ve = E;
        break;
      }
      ve = r.return;
    }
  }
  var py = Math.ceil, zl = ht.ReactCurrentDispatcher, Du = ht.ReactCurrentOwner, ur = ht.ReactCurrentBatchConfig, St = 0, Qn = null, jn = null, or = 0, ma = 0, Co = ka(0), bn = 0, zs = null, ki = 0, Ro = 0, lf = 0, As = null, ta = null, Bd = 0, To = 1 / 0, ya = null, wo = !1, ku = null, Al = null, uf = !1, Ji = null, js = 0, jl = 0, xo = null, Fs = -1, Tr = 0;
  function Fn() {
    return St & 6 ? qe() : Fs !== -1 ? Fs : Fs = qe();
  }
  function Oi(n) {
    return n.mode & 1 ? St & 2 && or !== 0 ? or & -or : cy.transition !== null ? (Tr === 0 && (Tr = Xu()), Tr) : (n = kt, n !== 0 || (n = window.event, n = n === void 0 ? 16 : ro(n.type)), n) : 1;
  }
  function Nr(n, r, l, o) {
    if (50 < jl) throw jl = 0, xo = null, Error(A(185));
    Hi(n, l, o), (!(St & 2) || n !== Qn) && (n === Qn && (!(St & 2) && (Ro |= l), bn === 4 && ii(n, or)), na(n, o), l === 1 && St === 0 && !(r.mode & 1) && (To = qe() + 500, ho && Ri()));
  }
  function na(n, r) {
    var l = n.callbackNode;
    ru(n, r);
    var o = Ka(n, n === Qn ? or : 0);
    if (o === 0) l !== null && rr(l), n.callbackNode = null, n.callbackPriority = 0;
    else if (r = o & -o, n.callbackPriority !== r) {
      if (l != null && rr(l), r === 1) n.tag === 0 ? bl($d.bind(null, n)) : bc($d.bind(null, n)), co(function() {
        !(St & 6) && Ri();
      }), l = null;
      else {
        switch (Ju(o)) {
          case 1:
            l = qa;
            break;
          case 4:
            l = tu;
            break;
          case 16:
            l = nu;
            break;
          case 536870912:
            l = Wu;
            break;
          default:
            l = nu;
        }
        l = dh(l, of.bind(null, n));
      }
      n.callbackPriority = r, n.callbackNode = l;
    }
  }
  function of(n, r) {
    if (Fs = -1, Tr = 0, St & 6) throw Error(A(327));
    var l = n.callbackNode;
    if (bo() && n.callbackNode !== l) return null;
    var o = Ka(n, n === Qn ? or : 0);
    if (o === 0) return null;
    if (o & 30 || o & n.expiredLanes || r) r = sf(n, o);
    else {
      r = o;
      var c = St;
      St |= 2;
      var d = ah();
      (Qn !== n || or !== r) && (ya = null, To = qe() + 500, Zi(n, r));
      do
        try {
          ih();
          break;
        } catch (E) {
          rh(n, E);
        }
      while (!0);
      Sd(), zl.current = d, St = c, jn !== null ? r = 0 : (Qn = null, or = 0, r = bn);
    }
    if (r !== 0) {
      if (r === 2 && (c = yl(n), c !== 0 && (o = c, r = Hs(n, c))), r === 1) throw l = zs, Zi(n, 0), ii(n, o), na(n, qe()), l;
      if (r === 6) ii(n, o);
      else {
        if (c = n.current.alternate, !(o & 30) && !vy(c) && (r = sf(n, o), r === 2 && (d = yl(n), d !== 0 && (o = d, r = Hs(n, d))), r === 1)) throw l = zs, Zi(n, 0), ii(n, o), na(n, qe()), l;
        switch (n.finishedWork = c, n.finishedLanes = o, r) {
          case 0:
          case 1:
            throw Error(A(345));
          case 2:
            Mu(n, ta, ya);
            break;
          case 3:
            if (ii(n, o), (o & 130023424) === o && (r = Bd + 500 - qe(), 10 < r)) {
              if (Ka(n, 0) !== 0) break;
              if (c = n.suspendedLanes, (c & o) !== o) {
                Fn(), n.pingedLanes |= n.suspendedLanes & c;
                break;
              }
              n.timeoutHandle = Tc(Mu.bind(null, n, ta, ya), r);
              break;
            }
            Mu(n, ta, ya);
            break;
          case 4:
            if (ii(n, o), (o & 4194240) === o) break;
            for (r = n.eventTimes, c = -1; 0 < o; ) {
              var m = 31 - _r(o);
              d = 1 << m, m = r[m], m > c && (c = m), o &= ~d;
            }
            if (o = c, o = qe() - o, o = (120 > o ? 120 : 480 > o ? 480 : 1080 > o ? 1080 : 1920 > o ? 1920 : 3e3 > o ? 3e3 : 4320 > o ? 4320 : 1960 * py(o / 1960)) - o, 10 < o) {
              n.timeoutHandle = Tc(Mu.bind(null, n, ta, ya), o);
              break;
            }
            Mu(n, ta, ya);
            break;
          case 5:
            Mu(n, ta, ya);
            break;
          default:
            throw Error(A(329));
        }
      }
    }
    return na(n, qe()), n.callbackNode === l ? of.bind(null, n) : null;
  }
  function Hs(n, r) {
    var l = As;
    return n.current.memoizedState.isDehydrated && (Zi(n, r).flags |= 256), n = sf(n, r), n !== 2 && (r = ta, ta = l, r !== null && Ou(r)), n;
  }
  function Ou(n) {
    ta === null ? ta = n : ta.push.apply(ta, n);
  }
  function vy(n) {
    for (var r = n; ; ) {
      if (r.flags & 16384) {
        var l = r.updateQueue;
        if (l !== null && (l = l.stores, l !== null)) for (var o = 0; o < l.length; o++) {
          var c = l[o], d = c.getSnapshot;
          c = c.value;
          try {
            if (!ei(d(), c)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (l = r.child, r.subtreeFlags & 16384 && l !== null) l.return = r, r = l;
      else {
        if (r === n) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === n) return !0;
          r = r.return;
        }
        r.sibling.return = r.return, r = r.sibling;
      }
    }
    return !0;
  }
  function ii(n, r) {
    for (r &= ~lf, r &= ~Ro, n.suspendedLanes |= r, n.pingedLanes &= ~r, n = n.expirationTimes; 0 < r; ) {
      var l = 31 - _r(r), o = 1 << l;
      n[l] = -1, r &= ~o;
    }
  }
  function $d(n) {
    if (St & 6) throw Error(A(327));
    bo();
    var r = Ka(n, 0);
    if (!(r & 1)) return na(n, qe()), null;
    var l = sf(n, r);
    if (n.tag !== 0 && l === 2) {
      var o = yl(n);
      o !== 0 && (r = o, l = Hs(n, o));
    }
    if (l === 1) throw l = zs, Zi(n, 0), ii(n, r), na(n, qe()), l;
    if (l === 6) throw Error(A(345));
    return n.finishedWork = n.current.alternate, n.finishedLanes = r, Mu(n, ta, ya), na(n, qe()), null;
  }
  function Yd(n, r) {
    var l = St;
    St |= 1;
    try {
      return n(r);
    } finally {
      St = l, St === 0 && (To = qe() + 500, ho && Ri());
    }
  }
  function Lu(n) {
    Ji !== null && Ji.tag === 0 && !(St & 6) && bo();
    var r = St;
    St |= 1;
    var l = ur.transition, o = kt;
    try {
      if (ur.transition = null, kt = 1, n) return n();
    } finally {
      kt = o, ur.transition = l, St = r, !(St & 6) && Ri();
    }
  }
  function Id() {
    ma = Co.current, rn(Co);
  }
  function Zi(n, r) {
    n.finishedWork = null, n.finishedLanes = 0;
    var l = n.timeoutHandle;
    if (l !== -1 && (n.timeoutHandle = -1, vd(l)), jn !== null) for (l = jn.return; l !== null; ) {
      var o = l;
      switch (Dc(o), o.tag) {
        case 1:
          o = o.type.childContextTypes, o != null && vo();
          break;
        case 3:
          Su(), rn(Yn), rn(Sn), De();
          break;
        case 5:
          Mc(o);
          break;
        case 4:
          Su();
          break;
        case 13:
          rn(yn);
          break;
        case 19:
          rn(yn);
          break;
        case 10:
          Ed(o.type._context);
          break;
        case 22:
        case 23:
          Id();
      }
      l = l.return;
    }
    if (Qn = n, jn = n = Fl(n.current, null), or = ma = r, bn = 0, zs = null, lf = Ro = ki = 0, ta = As = null, yu !== null) {
      for (r = 0; r < yu.length; r++) if (l = yu[r], o = l.interleaved, o !== null) {
        l.interleaved = null;
        var c = o.next, d = l.pending;
        if (d !== null) {
          var m = d.next;
          d.next = c, o.next = m;
        }
        l.pending = o;
      }
      yu = null;
    }
    return n;
  }
  function rh(n, r) {
    do {
      var l = jn;
      try {
        if (Sd(), st.current = xu, Uc) {
          for (var o = Lt.memoizedState; o !== null; ) {
            var c = o.queue;
            c !== null && (c.pending = null), o = o.next;
          }
          Uc = !1;
        }
        if (Wt = 0, Kn = Un = Lt = null, ms = !1, Eu = 0, Du.current = null, l === null || l.return === null) {
          bn = 1, zs = r, jn = null;
          break;
        }
        e: {
          var d = n, m = l.return, E = l, T = r;
          if (r = or, E.flags |= 32768, T !== null && typeof T == "object" && typeof T.then == "function") {
            var U = T, Q = E, G = Q.tag;
            if (!(Q.mode & 1) && (G === 0 || G === 11 || G === 15)) {
              var I = Q.alternate;
              I ? (Q.updateQueue = I.updateQueue, Q.memoizedState = I.memoizedState, Q.lanes = I.lanes) : (Q.updateQueue = null, Q.memoizedState = null);
            }
            var ce = Yv(m);
            if (ce !== null) {
              ce.flags &= -257, Ul(ce, m, E, d, r), ce.mode & 1 && Nd(d, U, r), r = ce, T = U;
              var me = r.updateQueue;
              if (me === null) {
                var Ee = /* @__PURE__ */ new Set();
                Ee.add(T), r.updateQueue = Ee;
              } else me.add(T);
              break e;
            } else {
              if (!(r & 1)) {
                Nd(d, U, r), Qd();
                break e;
              }
              T = Error(A(426));
            }
          } else if (fn && E.mode & 1) {
            var _n = Yv(m);
            if (_n !== null) {
              !(_n.flags & 65536) && (_n.flags |= 256), Ul(_n, m, E, d, r), Gi(bu(T, E));
              break e;
            }
          }
          d = T = bu(T, E), bn !== 4 && (bn = 2), As === null ? As = [d] : As.push(d), d = m;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, r &= -r, d.lanes |= r;
                var D = $v(d, T, r);
                Fv(d, D);
                break e;
              case 1:
                E = T;
                var x = d.type, L = d.stateNode;
                if (!(d.flags & 128) && (typeof x.getDerivedStateFromError == "function" || L !== null && typeof L.componentDidCatch == "function" && (Al === null || !Al.has(L)))) {
                  d.flags |= 65536, r &= -r, d.lanes |= r;
                  var W = Md(d, E, r);
                  Fv(d, W);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        uh(l);
      } catch (ye) {
        r = ye, jn === l && l !== null && (jn = l = l.return);
        continue;
      }
      break;
    } while (!0);
  }
  function ah() {
    var n = zl.current;
    return zl.current = xu, n === null ? xu : n;
  }
  function Qd() {
    (bn === 0 || bn === 3 || bn === 2) && (bn = 4), Qn === null || !(ki & 268435455) && !(Ro & 268435455) || ii(Qn, or);
  }
  function sf(n, r) {
    var l = St;
    St |= 2;
    var o = ah();
    (Qn !== n || or !== r) && (ya = null, Zi(n, r));
    do
      try {
        hy();
        break;
      } catch (c) {
        rh(n, c);
      }
    while (!0);
    if (Sd(), St = l, zl.current = o, jn !== null) throw Error(A(261));
    return Qn = null, or = 0, bn;
  }
  function hy() {
    for (; jn !== null; ) lh(jn);
  }
  function ih() {
    for (; jn !== null && !Wa(); ) lh(jn);
  }
  function lh(n) {
    var r = fh(n.alternate, n, ma);
    n.memoizedProps = n.pendingProps, r === null ? uh(n) : jn = r, Du.current = null;
  }
  function uh(n) {
    var r = n;
    do {
      var l = r.alternate;
      if (n = r.return, r.flags & 32768) {
        if (l = nf(l, r), l !== null) {
          l.flags &= 32767, jn = l;
          return;
        }
        if (n !== null) n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null;
        else {
          bn = 6, jn = null;
          return;
        }
      } else if (l = Kv(l, r, ma), l !== null) {
        jn = l;
        return;
      }
      if (r = r.sibling, r !== null) {
        jn = r;
        return;
      }
      jn = r = n;
    } while (r !== null);
    bn === 0 && (bn = 5);
  }
  function Mu(n, r, l) {
    var o = kt, c = ur.transition;
    try {
      ur.transition = null, kt = 1, my(n, r, l, o);
    } finally {
      ur.transition = c, kt = o;
    }
    return null;
  }
  function my(n, r, l, o) {
    do
      bo();
    while (Ji !== null);
    if (St & 6) throw Error(A(327));
    l = n.finishedWork;
    var c = n.finishedLanes;
    if (l === null) return null;
    if (n.finishedWork = null, n.finishedLanes = 0, l === n.current) throw Error(A(177));
    n.callbackNode = null, n.callbackPriority = 0;
    var d = l.lanes | l.childLanes;
    if (Wf(n, d), n === Qn && (jn = Qn = null, or = 0), !(l.subtreeFlags & 2064) && !(l.flags & 2064) || uf || (uf = !0, dh(nu, function() {
      return bo(), null;
    })), d = (l.flags & 15990) !== 0, l.subtreeFlags & 15990 || d) {
      d = ur.transition, ur.transition = null;
      var m = kt;
      kt = 1;
      var E = St;
      St |= 4, Du.current = null, Zv(n, l), Hd(l, n), lo(du), ba = !!ls, du = ls = null, n.current = l, dy(l), Ga(), St = E, kt = m, ur.transition = d;
    } else n.current = l;
    if (uf && (uf = !1, Ji = n, js = c), d = n.pendingLanes, d === 0 && (Al = null), Qo(l.stateNode), na(n, qe()), r !== null) for (o = n.onRecoverableError, l = 0; l < r.length; l++) c = r[l], o(c.value, { componentStack: c.stack, digest: c.digest });
    if (wo) throw wo = !1, n = ku, ku = null, n;
    return js & 1 && n.tag !== 0 && bo(), d = n.pendingLanes, d & 1 ? n === xo ? jl++ : (jl = 0, xo = n) : jl = 0, Ri(), null;
  }
  function bo() {
    if (Ji !== null) {
      var n = Ju(js), r = ur.transition, l = kt;
      try {
        if (ur.transition = null, kt = 16 > n ? 16 : n, Ji === null) var o = !1;
        else {
          if (n = Ji, Ji = null, js = 0, St & 6) throw Error(A(331));
          var c = St;
          for (St |= 4, ve = n.current; ve !== null; ) {
            var d = ve, m = d.child;
            if (ve.flags & 16) {
              var E = d.deletions;
              if (E !== null) {
                for (var T = 0; T < E.length; T++) {
                  var U = E[T];
                  for (ve = U; ve !== null; ) {
                    var Q = ve;
                    switch (Q.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Ls(8, Q, d);
                    }
                    var G = Q.child;
                    if (G !== null) G.return = Q, ve = G;
                    else for (; ve !== null; ) {
                      Q = ve;
                      var I = Q.sibling, ce = Q.return;
                      if (af(Q), Q === U) {
                        ve = null;
                        break;
                      }
                      if (I !== null) {
                        I.return = ce, ve = I;
                        break;
                      }
                      ve = ce;
                    }
                  }
                }
                var me = d.alternate;
                if (me !== null) {
                  var Ee = me.child;
                  if (Ee !== null) {
                    me.child = null;
                    do {
                      var _n = Ee.sibling;
                      Ee.sibling = null, Ee = _n;
                    } while (Ee !== null);
                  }
                }
                ve = d;
              }
            }
            if (d.subtreeFlags & 2064 && m !== null) m.return = d, ve = m;
            else e: for (; ve !== null; ) {
              if (d = ve, d.flags & 2048) switch (d.tag) {
                case 0:
                case 11:
                case 15:
                  Ls(9, d, d.return);
              }
              var D = d.sibling;
              if (D !== null) {
                D.return = d.return, ve = D;
                break e;
              }
              ve = d.return;
            }
          }
          var x = n.current;
          for (ve = x; ve !== null; ) {
            m = ve;
            var L = m.child;
            if (m.subtreeFlags & 2064 && L !== null) L.return = m, ve = L;
            else e: for (m = x; ve !== null; ) {
              if (E = ve, E.flags & 2048) try {
                switch (E.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ms(9, E);
                }
              } catch (ye) {
                dn(E, E.return, ye);
              }
              if (E === m) {
                ve = null;
                break e;
              }
              var W = E.sibling;
              if (W !== null) {
                W.return = E.return, ve = W;
                break e;
              }
              ve = E.return;
            }
          }
          if (St = c, Ri(), Ir && typeof Ir.onPostCommitFiberRoot == "function") try {
            Ir.onPostCommitFiberRoot(hl, n);
          } catch {
          }
          o = !0;
        }
        return o;
      } finally {
        kt = l, ur.transition = r;
      }
    }
    return !1;
  }
  function oh(n, r, l) {
    r = bu(l, r), r = $v(n, r, 1), n = Ll(n, r, 1), r = Fn(), n !== null && (Hi(n, 1, r), na(n, r));
  }
  function dn(n, r, l) {
    if (n.tag === 3) oh(n, n, l);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        oh(r, n, l);
        break;
      } else if (r.tag === 1) {
        var o = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof o.componentDidCatch == "function" && (Al === null || !Al.has(o))) {
          n = bu(l, n), n = Md(r, n, 1), r = Ll(r, n, 1), n = Fn(), r !== null && (Hi(r, 1, n), na(r, n));
          break;
        }
      }
      r = r.return;
    }
  }
  function yy(n, r, l) {
    var o = n.pingCache;
    o !== null && o.delete(r), r = Fn(), n.pingedLanes |= n.suspendedLanes & l, Qn === n && (or & l) === l && (bn === 4 || bn === 3 && (or & 130023424) === or && 500 > qe() - Bd ? Zi(n, 0) : lf |= l), na(n, r);
  }
  function sh(n, r) {
    r === 0 && (n.mode & 1 ? (r = fa, fa <<= 1, !(fa & 130023424) && (fa = 4194304)) : r = 1);
    var l = Fn();
    n = va(n, r), n !== null && (Hi(n, r, l), na(n, l));
  }
  function gy(n) {
    var r = n.memoizedState, l = 0;
    r !== null && (l = r.retryLane), sh(n, l);
  }
  function ch(n, r) {
    var l = 0;
    switch (n.tag) {
      case 13:
        var o = n.stateNode, c = n.memoizedState;
        c !== null && (l = c.retryLane);
        break;
      case 19:
        o = n.stateNode;
        break;
      default:
        throw Error(A(314));
    }
    o !== null && o.delete(r), sh(n, l);
  }
  var fh;
  fh = function(n, r, l) {
    if (n !== null) if (n.memoizedProps !== r.pendingProps || Yn.current) zn = !0;
    else {
      if (!(n.lanes & l) && !(r.flags & 128)) return zn = !1, Ds(n, r, l);
      zn = !!(n.flags & 131072);
    }
    else zn = !1, fn && r.flags & 1048576 && Uv(r, Wi, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var o = r.type;
        Na(n, r), n = r.pendingProps;
        var c = Gr(r, Sn.current);
        mn(r, l), c = Ml(null, r, o, n, c, l);
        var d = ni();
        return r.flags |= 1, typeof c == "object" && c !== null && typeof c.render == "function" && c.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, Mn(o) ? (d = !0, Xn(r)) : d = !1, r.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, wd(r), c.updater = Kc, r.stateNode = c, c._reactInternals = r, Ts(r, o, n, l), r = bs(null, r, o, !0, d, l)) : (r.tag = 0, fn && d && _c(r), lr(null, r, c, l), r = r.child), r;
      case 16:
        o = r.elementType;
        e: {
          switch (Na(n, r), n = r.pendingProps, c = o._init, o = c(o._payload), r.type = o, c = r.tag = Ey(o), n = ri(o, n), c) {
            case 0:
              r = Iv(null, r, o, n, l);
              break e;
            case 1:
              r = Qv(null, r, o, n, l);
              break e;
            case 11:
              r = Zr(null, r, o, n, l);
              break e;
            case 14:
              r = _u(null, r, o, ri(o.type, n), l);
              break e;
          }
          throw Error(A(
            306,
            o,
            ""
          ));
        }
        return r;
      case 0:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Iv(n, r, o, c, l);
      case 1:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Qv(n, r, o, c, l);
      case 3:
        e: {
          if (So(r), n === null) throw Error(A(387));
          o = r.pendingProps, d = r.memoizedState, c = d.element, jv(n, r), fs(r, o, null, l);
          var m = r.memoizedState;
          if (o = m.element, d.isDehydrated) if (d = { element: o, isDehydrated: !1, cache: m.cache, pendingSuspenseBoundaries: m.pendingSuspenseBoundaries, transitions: m.transitions }, r.updateQueue.baseState = d, r.memoizedState = d, r.flags & 256) {
            c = bu(Error(A(423)), r), r = Wv(n, r, o, l, c);
            break e;
          } else if (o !== c) {
            c = bu(Error(A(424)), r), r = Wv(n, r, o, l, c);
            break e;
          } else for (Xr = Si(r.stateNode.containerInfo.firstChild), qr = r, fn = !0, La = null, l = le(r, null, o, l), r.child = l; l; ) l.flags = l.flags & -3 | 4096, l = l.sibling;
          else {
            if (Ol(), o === c) {
              r = Ua(n, r, l);
              break e;
            }
            lr(n, r, o, l);
          }
          r = r.child;
        }
        return r;
      case 5:
        return Hv(r), n === null && yd(r), o = r.type, c = r.pendingProps, d = n !== null ? n.memoizedProps : null, m = c.children, Rc(o, c) ? m = null : d !== null && Rc(o, d) && (r.flags |= 32), Ud(n, r), lr(n, r, m, l), r.child;
      case 6:
        return n === null && yd(r), null;
      case 13:
        return tf(n, r, l);
      case 4:
        return bd(r, r.stateNode.containerInfo), o = r.pendingProps, n === null ? r.child = Tn(r, null, o, l) : lr(n, r, o, l), r.child;
      case 11:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Zr(n, r, o, c, l);
      case 7:
        return lr(n, r, r.pendingProps, l), r.child;
      case 8:
        return lr(n, r, r.pendingProps.children, l), r.child;
      case 12:
        return lr(n, r, r.pendingProps.children, l), r.child;
      case 10:
        e: {
          if (o = r.type._context, c = r.pendingProps, d = r.memoizedProps, m = c.value, xe(pa, o._currentValue), o._currentValue = m, d !== null) if (ei(d.value, m)) {
            if (d.children === c.children && !Yn.current) {
              r = Ua(n, r, l);
              break e;
            }
          } else for (d = r.child, d !== null && (d.return = r); d !== null; ) {
            var E = d.dependencies;
            if (E !== null) {
              m = d.child;
              for (var T = E.firstContext; T !== null; ) {
                if (T.context === o) {
                  if (d.tag === 1) {
                    T = qi(-1, l & -l), T.tag = 2;
                    var U = d.updateQueue;
                    if (U !== null) {
                      U = U.shared;
                      var Q = U.pending;
                      Q === null ? T.next = T : (T.next = Q.next, Q.next = T), U.pending = T;
                    }
                  }
                  d.lanes |= l, T = d.alternate, T !== null && (T.lanes |= l), Cd(
                    d.return,
                    l,
                    r
                  ), E.lanes |= l;
                  break;
                }
                T = T.next;
              }
            } else if (d.tag === 10) m = d.type === r.type ? null : d.child;
            else if (d.tag === 18) {
              if (m = d.return, m === null) throw Error(A(341));
              m.lanes |= l, E = m.alternate, E !== null && (E.lanes |= l), Cd(m, l, r), m = d.sibling;
            } else m = d.child;
            if (m !== null) m.return = d;
            else for (m = d; m !== null; ) {
              if (m === r) {
                m = null;
                break;
              }
              if (d = m.sibling, d !== null) {
                d.return = m.return, m = d;
                break;
              }
              m = m.return;
            }
            d = m;
          }
          lr(n, r, c.children, l), r = r.child;
        }
        return r;
      case 9:
        return c = r.type, o = r.pendingProps.children, mn(r, l), c = Ma(c), o = o(c), r.flags |= 1, lr(n, r, o, l), r.child;
      case 14:
        return o = r.type, c = ri(o, r.pendingProps), c = ri(o.type, c), _u(n, r, o, c, l);
      case 15:
        return Ke(n, r, r.type, r.pendingProps, l);
      case 17:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Na(n, r), r.tag = 1, Mn(o) ? (n = !0, Xn(r)) : n = !1, mn(r, l), Jc(r, o, c), Ts(r, o, c, l), bs(null, r, o, !0, n, l);
      case 19:
        return bi(n, r, l);
      case 22:
        return xs(n, r, l);
    }
    throw Error(A(156, r.tag));
  };
  function dh(n, r) {
    return on(n, r);
  }
  function Sy(n, r, l, o) {
    this.tag = n, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = o, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Aa(n, r, l, o) {
    return new Sy(n, r, l, o);
  }
  function Wd(n) {
    return n = n.prototype, !(!n || !n.isReactComponent);
  }
  function Ey(n) {
    if (typeof n == "function") return Wd(n) ? 1 : 0;
    if (n != null) {
      if (n = n.$$typeof, n === xt) return 11;
      if (n === bt) return 14;
    }
    return 2;
  }
  function Fl(n, r) {
    var l = n.alternate;
    return l === null ? (l = Aa(n.tag, r, n.key, n.mode), l.elementType = n.elementType, l.type = n.type, l.stateNode = n.stateNode, l.alternate = n, n.alternate = l) : (l.pendingProps = r, l.type = n.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = n.flags & 14680064, l.childLanes = n.childLanes, l.lanes = n.lanes, l.child = n.child, l.memoizedProps = n.memoizedProps, l.memoizedState = n.memoizedState, l.updateQueue = n.updateQueue, r = n.dependencies, l.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, l.sibling = n.sibling, l.index = n.index, l.ref = n.ref, l;
  }
  function Ps(n, r, l, o, c, d) {
    var m = 2;
    if (o = n, typeof n == "function") Wd(n) && (m = 1);
    else if (typeof n == "string") m = 5;
    else e: switch (n) {
      case Fe:
        return el(l.children, c, d, r);
      case an:
        m = 8, c |= 8;
        break;
      case Ft:
        return n = Aa(12, l, r, c | 2), n.elementType = Ft, n.lanes = d, n;
      case ke:
        return n = Aa(13, l, r, c), n.elementType = ke, n.lanes = d, n;
      case zt:
        return n = Aa(19, l, r, c), n.elementType = zt, n.lanes = d, n;
      case Ce:
        return Hl(l, c, d, r);
      default:
        if (typeof n == "object" && n !== null) switch (n.$$typeof) {
          case Jt:
            m = 10;
            break e;
          case ln:
            m = 9;
            break e;
          case xt:
            m = 11;
            break e;
          case bt:
            m = 14;
            break e;
          case Dt:
            m = 16, o = null;
            break e;
        }
        throw Error(A(130, n == null ? n : typeof n, ""));
    }
    return r = Aa(m, l, r, c), r.elementType = n, r.type = o, r.lanes = d, r;
  }
  function el(n, r, l, o) {
    return n = Aa(7, n, o, r), n.lanes = l, n;
  }
  function Hl(n, r, l, o) {
    return n = Aa(22, n, o, r), n.elementType = Ce, n.lanes = l, n.stateNode = { isHidden: !1 }, n;
  }
  function Gd(n, r, l) {
    return n = Aa(6, n, null, r), n.lanes = l, n;
  }
  function cf(n, r, l) {
    return r = Aa(4, n.children !== null ? n.children : [], n.key, r), r.lanes = l, r.stateNode = { containerInfo: n.containerInfo, pendingChildren: null, implementation: n.implementation }, r;
  }
  function ph(n, r, l, o, c) {
    this.tag = r, this.containerInfo = n, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ku(0), this.expirationTimes = Ku(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ku(0), this.identifierPrefix = o, this.onRecoverableError = c, this.mutableSourceEagerHydrationData = null;
  }
  function ff(n, r, l, o, c, d, m, E, T) {
    return n = new ph(n, r, l, E, T), r === 1 ? (r = 1, d === !0 && (r |= 8)) : r = 0, d = Aa(3, null, null, r), n.current = d, d.stateNode = n, d.memoizedState = { element: o, isDehydrated: l, cache: null, transitions: null, pendingSuspenseBoundaries: null }, wd(d), n;
  }
  function Cy(n, r, l) {
    var o = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: ct, key: o == null ? null : "" + o, children: n, containerInfo: r, implementation: l };
  }
  function qd(n) {
    if (!n) return Er;
    n = n._reactInternals;
    e: {
      if (Ge(n) !== n || n.tag !== 1) throw Error(A(170));
      var r = n;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (Mn(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(A(171));
    }
    if (n.tag === 1) {
      var l = n.type;
      if (Mn(l)) return ss(n, l, r);
    }
    return r;
  }
  function vh(n, r, l, o, c, d, m, E, T) {
    return n = ff(l, o, !0, n, c, d, m, E, T), n.context = qd(null), l = n.current, o = Fn(), c = Oi(l), d = qi(o, c), d.callback = r ?? null, Ll(l, d, c), n.current.lanes = c, Hi(n, c, o), na(n, o), n;
  }
  function df(n, r, l, o) {
    var c = r.current, d = Fn(), m = Oi(c);
    return l = qd(l), r.context === null ? r.context = l : r.pendingContext = l, r = qi(d, m), r.payload = { element: n }, o = o === void 0 ? null : o, o !== null && (r.callback = o), n = Ll(c, r, m), n !== null && (Nr(n, c, m, d), Lc(n, c, m)), m;
  }
  function pf(n) {
    if (n = n.current, !n.child) return null;
    switch (n.child.tag) {
      case 5:
        return n.child.stateNode;
      default:
        return n.child.stateNode;
    }
  }
  function Xd(n, r) {
    if (n = n.memoizedState, n !== null && n.dehydrated !== null) {
      var l = n.retryLane;
      n.retryLane = l !== 0 && l < r ? l : r;
    }
  }
  function vf(n, r) {
    Xd(n, r), (n = n.alternate) && Xd(n, r);
  }
  function hh() {
    return null;
  }
  var Nu = typeof reportError == "function" ? reportError : function(n) {
    console.error(n);
  };
  function Kd(n) {
    this._internalRoot = n;
  }
  hf.prototype.render = Kd.prototype.render = function(n) {
    var r = this._internalRoot;
    if (r === null) throw Error(A(409));
    df(n, r, null, null);
  }, hf.prototype.unmount = Kd.prototype.unmount = function() {
    var n = this._internalRoot;
    if (n !== null) {
      this._internalRoot = null;
      var r = n.containerInfo;
      Lu(function() {
        df(null, n, null, null);
      }), r[Ii] = null;
    }
  };
  function hf(n) {
    this._internalRoot = n;
  }
  hf.prototype.unstable_scheduleHydration = function(n) {
    if (n) {
      var r = Be();
      n = { blockedOn: null, target: n, priority: r };
      for (var l = 0; l < $n.length && r !== 0 && r < $n[l].priority; l++) ;
      $n.splice(l, 0, n), l === 0 && qo(n);
    }
  };
  function Jd(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11);
  }
  function mf(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11 && (n.nodeType !== 8 || n.nodeValue !== " react-mount-point-unstable "));
  }
  function mh() {
  }
  function Ry(n, r, l, o, c) {
    if (c) {
      if (typeof o == "function") {
        var d = o;
        o = function() {
          var U = pf(m);
          d.call(U);
        };
      }
      var m = vh(r, o, n, 0, null, !1, !1, "", mh);
      return n._reactRootContainer = m, n[Ii] = m.current, oo(n.nodeType === 8 ? n.parentNode : n), Lu(), m;
    }
    for (; c = n.lastChild; ) n.removeChild(c);
    if (typeof o == "function") {
      var E = o;
      o = function() {
        var U = pf(T);
        E.call(U);
      };
    }
    var T = ff(n, 0, !1, null, null, !1, !1, "", mh);
    return n._reactRootContainer = T, n[Ii] = T.current, oo(n.nodeType === 8 ? n.parentNode : n), Lu(function() {
      df(r, T, l, o);
    }), T;
  }
  function Vs(n, r, l, o, c) {
    var d = l._reactRootContainer;
    if (d) {
      var m = d;
      if (typeof c == "function") {
        var E = c;
        c = function() {
          var T = pf(m);
          E.call(T);
        };
      }
      df(r, m, n, c);
    } else m = Ry(l, r, n, c, o);
    return pf(m);
  }
  Rt = function(n) {
    switch (n.tag) {
      case 3:
        var r = n.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var l = Xa(r.pendingLanes);
          l !== 0 && (Pi(r, l | 1), na(r, qe()), !(St & 6) && (To = qe() + 500, Ri()));
        }
        break;
      case 13:
        Lu(function() {
          var o = va(n, 1);
          if (o !== null) {
            var c = Fn();
            Nr(o, n, 1, c);
          }
        }), vf(n, 1);
    }
  }, Wo = function(n) {
    if (n.tag === 13) {
      var r = va(n, 134217728);
      if (r !== null) {
        var l = Fn();
        Nr(r, n, 134217728, l);
      }
      vf(n, 134217728);
    }
  }, vi = function(n) {
    if (n.tag === 13) {
      var r = Oi(n), l = va(n, r);
      if (l !== null) {
        var o = Fn();
        Nr(l, n, r, o);
      }
      vf(n, r);
    }
  }, Be = function() {
    return kt;
  }, Zu = function(n, r) {
    var l = kt;
    try {
      return kt = n, r();
    } finally {
      kt = l;
    }
  }, $t = function(n, r, l) {
    switch (r) {
      case "input":
        if (Yr(n, l), r = l.name, l.type === "radio" && r != null) {
          for (l = n; l.parentNode; ) l = l.parentNode;
          for (l = l.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < l.length; r++) {
            var o = l[r];
            if (o !== n && o.form === n.form) {
              var c = hn(o);
              if (!c) throw Error(A(90));
              wr(o), Yr(o, c);
            }
          }
        }
        break;
      case "textarea":
        Ya(n, l);
        break;
      case "select":
        r = l.value, r != null && Cn(n, !!l.multiple, r, !1);
    }
  }, Zl = Yd, dl = Lu;
  var Ty = { usingClientEntryPoint: !1, Events: [_e, ti, hn, Fi, Jl, Yd] }, Bs = { findFiberByHostInstance: pu, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, yh = { bundleType: Bs.bundleType, version: Bs.version, rendererPackageName: Bs.rendererPackageName, rendererConfig: Bs.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ht.ReactCurrentDispatcher, findHostInstanceByFiber: function(n) {
    return n = Rn(n), n === null ? null : n.stateNode;
  }, findFiberByHostInstance: Bs.findFiberByHostInstance || hh, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Pl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Pl.isDisabled && Pl.supportsFiber) try {
      hl = Pl.inject(yh), Ir = Pl;
    } catch {
    }
  }
  return Ba.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ty, Ba.createPortal = function(n, r) {
    var l = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Jd(r)) throw Error(A(200));
    return Cy(n, r, null, l);
  }, Ba.createRoot = function(n, r) {
    if (!Jd(n)) throw Error(A(299));
    var l = !1, o = "", c = Nu;
    return r != null && (r.unstable_strictMode === !0 && (l = !0), r.identifierPrefix !== void 0 && (o = r.identifierPrefix), r.onRecoverableError !== void 0 && (c = r.onRecoverableError)), r = ff(n, 1, !1, null, null, l, !1, o, c), n[Ii] = r.current, oo(n.nodeType === 8 ? n.parentNode : n), new Kd(r);
  }, Ba.findDOMNode = function(n) {
    if (n == null) return null;
    if (n.nodeType === 1) return n;
    var r = n._reactInternals;
    if (r === void 0)
      throw typeof n.render == "function" ? Error(A(188)) : (n = Object.keys(n).join(","), Error(A(268, n)));
    return n = Rn(r), n = n === null ? null : n.stateNode, n;
  }, Ba.flushSync = function(n) {
    return Lu(n);
  }, Ba.hydrate = function(n, r, l) {
    if (!mf(r)) throw Error(A(200));
    return Vs(null, n, r, !0, l);
  }, Ba.hydrateRoot = function(n, r, l) {
    if (!Jd(n)) throw Error(A(405));
    var o = l != null && l.hydratedSources || null, c = !1, d = "", m = Nu;
    if (l != null && (l.unstable_strictMode === !0 && (c = !0), l.identifierPrefix !== void 0 && (d = l.identifierPrefix), l.onRecoverableError !== void 0 && (m = l.onRecoverableError)), r = vh(r, null, n, 1, l ?? null, c, !1, d, m), n[Ii] = r.current, oo(n), o) for (n = 0; n < o.length; n++) l = o[n], c = l._getVersion, c = c(l._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [l, c] : r.mutableSourceEagerHydrationData.push(
      l,
      c
    );
    return new hf(r);
  }, Ba.render = function(n, r, l) {
    if (!mf(r)) throw Error(A(200));
    return Vs(null, n, r, !1, l);
  }, Ba.unmountComponentAtNode = function(n) {
    if (!mf(n)) throw Error(A(40));
    return n._reactRootContainer ? (Lu(function() {
      Vs(null, null, n, !1, function() {
        n._reactRootContainer = null, n[Ii] = null;
      });
    }), !0) : !1;
  }, Ba.unstable_batchedUpdates = Yd, Ba.unstable_renderSubtreeIntoContainer = function(n, r, l, o) {
    if (!mf(l)) throw Error(A(200));
    if (n == null || n._reactInternals === void 0) throw Error(A(38));
    return Vs(n, r, l, !1, o);
  }, Ba.version = "18.3.1-next-f1338f8080-20240426", Ba;
}
var $a = {};
/**
 * @license React
 * react-dom.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var uT;
function iD() {
  return uT || (uT = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var B = rv, X = sT(), A = B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, wt = !1;
    function pt(e) {
      wt = e;
    }
    function Ie(e) {
      if (!wt) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        jt("warn", e, a);
      }
    }
    function S(e) {
      if (!wt) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        jt("error", e, a);
      }
    }
    function jt(e, t, a) {
      {
        var i = A.ReactDebugCurrentFrame, u = i.getStackAddendum();
        u !== "" && (t += "%s", a = a.concat([u]));
        var s = a.map(function(f) {
          return String(f);
        });
        s.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, s);
      }
    }
    var se = 0, de = 1, Je = 2, Z = 3, Se = 4, ie = 5, je = 6, Xe = 7, it = 8, Kt = 9, vt = 10, Qe = 11, ht = 12, be = 13, ct = 14, Fe = 15, an = 16, Ft = 17, Jt = 18, ln = 19, xt = 21, ke = 22, zt = 23, bt = 24, Dt = 25, Ce = !0, J = !1, Re = !1, ne = !1, _ = !1, P = !0, He = !0, ze = !0, lt = !0, tt = /* @__PURE__ */ new Set(), Ze = {}, nt = {};
    function ut(e, t) {
      Vt(e, t), Vt(e + "Capture", t);
    }
    function Vt(e, t) {
      Ze[e] && S("EventRegistry: More than one plugin attempted to publish the same registration name, `%s`.", e), Ze[e] = t;
      {
        var a = e.toLowerCase();
        nt[a] = e, e === "onDoubleClick" && (nt.ondblclick = e);
      }
      for (var i = 0; i < t.length; i++)
        tt.add(t[i]);
    }
    var kn = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", wr = Object.prototype.hasOwnProperty;
    function En(e) {
      {
        var t = typeof Symbol == "function" && Symbol.toStringTag, a = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return a;
      }
    }
    function tr(e) {
      try {
        return Pn(e), !1;
      } catch {
        return !0;
      }
    }
    function Pn(e) {
      return "" + e;
    }
    function Vn(e, t) {
      if (tr(e))
        return S("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", t, En(e)), Pn(e);
    }
    function Yr(e) {
      if (tr(e))
        return S("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", En(e)), Pn(e);
    }
    function si(e, t) {
      if (tr(e))
        return S("The provided `%s` prop is an unsupported type %s. This value must be coerced to a string before before using it here.", t, En(e)), Pn(e);
    }
    function oa(e, t) {
      if (tr(e))
        return S("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", t, En(e)), Pn(e);
    }
    function Gn(e) {
      if (tr(e))
        return S("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", En(e)), Pn(e);
    }
    function Cn(e) {
      if (tr(e))
        return S("Form field values (value, checked, defaultValue, or defaultChecked props) must be strings, not %s. This value must be coerced to a string before before using it here.", En(e)), Pn(e);
    }
    var Bn = 0, yr = 1, Ya = 2, On = 3, gr = 4, sa = 5, Ia = 6, ci = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", ee = ci + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040", Te = new RegExp("^[" + ci + "][" + ee + "]*$"), rt = {}, At = {};
    function Zt(e) {
      return wr.call(At, e) ? !0 : wr.call(rt, e) ? !1 : Te.test(e) ? (At[e] = !0, !0) : (rt[e] = !0, S("Invalid attribute name: `%s`", e), !1);
    }
    function pn(e, t, a) {
      return t !== null ? t.type === Bn : a ? !1 : e.length > 2 && (e[0] === "o" || e[0] === "O") && (e[1] === "n" || e[1] === "N");
    }
    function un(e, t, a, i) {
      if (a !== null && a.type === Bn)
        return !1;
      switch (typeof t) {
        case "function":
        case "symbol":
          return !0;
        case "boolean": {
          if (i)
            return !1;
          if (a !== null)
            return !a.acceptsBooleans;
          var u = e.toLowerCase().slice(0, 5);
          return u !== "data-" && u !== "aria-";
        }
        default:
          return !1;
      }
    }
    function qn(e, t, a, i) {
      if (t === null || typeof t > "u" || un(e, t, a, i))
        return !0;
      if (i)
        return !1;
      if (a !== null)
        switch (a.type) {
          case On:
            return !t;
          case gr:
            return t === !1;
          case sa:
            return isNaN(t);
          case Ia:
            return isNaN(t) || t < 1;
        }
      return !1;
    }
    function en(e) {
      return $t.hasOwnProperty(e) ? $t[e] : null;
    }
    function Bt(e, t, a, i, u, s, f) {
      this.acceptsBooleans = t === Ya || t === On || t === gr, this.attributeName = i, this.attributeNamespace = u, this.mustUseProperty = a, this.propertyName = e, this.type = t, this.sanitizeURL = s, this.removeEmptyString = f;
    }
    var $t = {}, ca = [
      "children",
      "dangerouslySetInnerHTML",
      // TODO: This prevents the assignment of defaultValue to regular
      // elements (not just inputs). Now that ReactDOMInput assigns to the
      // defaultValue property -- do we need this?
      "defaultValue",
      "defaultChecked",
      "innerHTML",
      "suppressContentEditableWarning",
      "suppressHydrationWarning",
      "style"
    ];
    ca.forEach(function(e) {
      $t[e] = new Bt(
        e,
        Bn,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
      var t = e[0], a = e[1];
      $t[t] = new Bt(
        t,
        yr,
        !1,
        // mustUseProperty
        a,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
      $t[e] = new Bt(
        e,
        Ya,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
      $t[e] = new Bt(
        e,
        Ya,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "allowFullScreen",
      "async",
      // Note: there is a special case that prevents it from being written to the DOM
      // on the client side because the browsers are inconsistent. Instead we call focus().
      "autoFocus",
      "autoPlay",
      "controls",
      "default",
      "defer",
      "disabled",
      "disablePictureInPicture",
      "disableRemotePlayback",
      "formNoValidate",
      "hidden",
      "loop",
      "noModule",
      "noValidate",
      "open",
      "playsInline",
      "readOnly",
      "required",
      "reversed",
      "scoped",
      "seamless",
      // Microdata
      "itemScope"
    ].forEach(function(e) {
      $t[e] = new Bt(
        e,
        On,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "checked",
      // Note: `option.selected` is not updated if `select.multiple` is
      // disabled with `removeAttribute`. We have special logic for handling this.
      "multiple",
      "muted",
      "selected"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      $t[e] = new Bt(
        e,
        On,
        !0,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "capture",
      "download"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      $t[e] = new Bt(
        e,
        gr,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "cols",
      "rows",
      "size",
      "span"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      $t[e] = new Bt(
        e,
        Ia,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["rowSpan", "start"].forEach(function(e) {
      $t[e] = new Bt(
        e,
        sa,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    });
    var Sr = /[\-\:]([a-z])/g, Ta = function(e) {
      return e[1].toUpperCase();
    };
    [
      "accent-height",
      "alignment-baseline",
      "arabic-form",
      "baseline-shift",
      "cap-height",
      "clip-path",
      "clip-rule",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "dominant-baseline",
      "enable-background",
      "fill-opacity",
      "fill-rule",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "glyph-name",
      "glyph-orientation-horizontal",
      "glyph-orientation-vertical",
      "horiz-adv-x",
      "horiz-origin-x",
      "image-rendering",
      "letter-spacing",
      "lighting-color",
      "marker-end",
      "marker-mid",
      "marker-start",
      "overline-position",
      "overline-thickness",
      "paint-order",
      "panose-1",
      "pointer-events",
      "rendering-intent",
      "shape-rendering",
      "stop-color",
      "stop-opacity",
      "strikethrough-position",
      "strikethrough-thickness",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke-width",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "underline-position",
      "underline-thickness",
      "unicode-bidi",
      "unicode-range",
      "units-per-em",
      "v-alphabetic",
      "v-hanging",
      "v-ideographic",
      "v-mathematical",
      "vector-effect",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "word-spacing",
      "writing-mode",
      "xmlns:xlink",
      "x-height"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Sr, Ta);
      $t[t] = new Bt(
        t,
        yr,
        !1,
        // mustUseProperty
        e,
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "xlink:actuate",
      "xlink:arcrole",
      "xlink:role",
      "xlink:show",
      "xlink:title",
      "xlink:type"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Sr, Ta);
      $t[t] = new Bt(
        t,
        yr,
        !1,
        // mustUseProperty
        e,
        "http://www.w3.org/1999/xlink",
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "xml:base",
      "xml:lang",
      "xml:space"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Sr, Ta);
      $t[t] = new Bt(
        t,
        yr,
        !1,
        // mustUseProperty
        e,
        "http://www.w3.org/XML/1998/namespace",
        !1,
        // sanitizeURL
        !1
      );
    }), ["tabIndex", "crossOrigin"].forEach(function(e) {
      $t[e] = new Bt(
        e,
        yr,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    });
    var Fi = "xlinkHref";
    $t[Fi] = new Bt(
      "xlinkHref",
      yr,
      !1,
      // mustUseProperty
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      // sanitizeURL
      !1
    ), ["src", "href", "action", "formAction"].forEach(function(e) {
      $t[e] = new Bt(
        e,
        yr,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !0,
        // sanitizeURL
        !0
      );
    });
    var Jl = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i, Zl = !1;
    function dl(e) {
      !Zl && Jl.test(e) && (Zl = !0, S("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(e)));
    }
    function pl(e, t, a, i) {
      if (i.mustUseProperty) {
        var u = i.propertyName;
        return e[u];
      } else {
        Vn(a, t), i.sanitizeURL && dl("" + a);
        var s = i.attributeName, f = null;
        if (i.type === gr) {
          if (e.hasAttribute(s)) {
            var p = e.getAttribute(s);
            return p === "" ? !0 : qn(t, a, i, !1) ? p : p === "" + a ? a : p;
          }
        } else if (e.hasAttribute(s)) {
          if (qn(t, a, i, !1))
            return e.getAttribute(s);
          if (i.type === On)
            return a;
          f = e.getAttribute(s);
        }
        return qn(t, a, i, !1) ? f === null ? a : f : f === "" + a ? a : f;
      }
    }
    function eu(e, t, a, i) {
      {
        if (!Zt(t))
          return;
        if (!e.hasAttribute(t))
          return a === void 0 ? void 0 : null;
        var u = e.getAttribute(t);
        return Vn(a, t), u === "" + a ? a : u;
      }
    }
    function xr(e, t, a, i) {
      var u = en(t);
      if (!pn(t, u, i)) {
        if (qn(t, a, u, i) && (a = null), i || u === null) {
          if (Zt(t)) {
            var s = t;
            a === null ? e.removeAttribute(s) : (Vn(a, t), e.setAttribute(s, "" + a));
          }
          return;
        }
        var f = u.mustUseProperty;
        if (f) {
          var p = u.propertyName;
          if (a === null) {
            var v = u.type;
            e[p] = v === On ? !1 : "";
          } else
            e[p] = a;
          return;
        }
        var y = u.attributeName, g = u.attributeNamespace;
        if (a === null)
          e.removeAttribute(y);
        else {
          var b = u.type, w;
          b === On || b === gr && a === !0 ? w = "" : (Vn(a, y), w = "" + a, u.sanitizeURL && dl(w.toString())), g ? e.setAttributeNS(g, y, w) : e.setAttribute(y, w);
        }
      }
    }
    var br = Symbol.for("react.element"), nr = Symbol.for("react.portal"), fi = Symbol.for("react.fragment"), Qa = Symbol.for("react.strict_mode"), di = Symbol.for("react.profiler"), pi = Symbol.for("react.provider"), R = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), ae = Symbol.for("react.suspense"), he = Symbol.for("react.suspense_list"), Ge = Symbol.for("react.memo"), $e = Symbol.for("react.lazy"), ft = Symbol.for("react.scope"), ot = Symbol.for("react.debug_trace_mode"), Rn = Symbol.for("react.offscreen"), tn = Symbol.for("react.legacy_hidden"), on = Symbol.for("react.cache"), rr = Symbol.for("react.tracing_marker"), Wa = Symbol.iterator, Ga = "@@iterator";
    function qe(e) {
      if (e === null || typeof e != "object")
        return null;
      var t = Wa && e[Wa] || e[Ga];
      return typeof t == "function" ? t : null;
    }
    var et = Object.assign, qa = 0, tu, nu, vl, Wu, hl, Ir, Qo;
    function _r() {
    }
    _r.__reactDisabledLog = !0;
    function uc() {
      {
        if (qa === 0) {
          tu = console.log, nu = console.info, vl = console.warn, Wu = console.error, hl = console.group, Ir = console.groupCollapsed, Qo = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: _r,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        qa++;
      }
    }
    function oc() {
      {
        if (qa--, qa === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: et({}, e, {
              value: tu
            }),
            info: et({}, e, {
              value: nu
            }),
            warn: et({}, e, {
              value: vl
            }),
            error: et({}, e, {
              value: Wu
            }),
            group: et({}, e, {
              value: hl
            }),
            groupCollapsed: et({}, e, {
              value: Ir
            }),
            groupEnd: et({}, e, {
              value: Qo
            })
          });
        }
        qa < 0 && S("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Gu = A.ReactCurrentDispatcher, ml;
    function fa(e, t, a) {
      {
        if (ml === void 0)
          try {
            throw Error();
          } catch (u) {
            var i = u.stack.trim().match(/\n( *(at )?)/);
            ml = i && i[1] || "";
          }
        return `
` + ml + e;
      }
    }
    var Xa = !1, Ka;
    {
      var qu = typeof WeakMap == "function" ? WeakMap : Map;
      Ka = new qu();
    }
    function ru(e, t) {
      if (!e || Xa)
        return "";
      {
        var a = Ka.get(e);
        if (a !== void 0)
          return a;
      }
      var i;
      Xa = !0;
      var u = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var s;
      s = Gu.current, Gu.current = null, uc();
      try {
        if (t) {
          var f = function() {
            throw Error();
          };
          if (Object.defineProperty(f.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(f, []);
            } catch (z) {
              i = z;
            }
            Reflect.construct(e, [], f);
          } else {
            try {
              f.call();
            } catch (z) {
              i = z;
            }
            e.call(f.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (z) {
            i = z;
          }
          e();
        }
      } catch (z) {
        if (z && i && typeof z.stack == "string") {
          for (var p = z.stack.split(`
`), v = i.stack.split(`
`), y = p.length - 1, g = v.length - 1; y >= 1 && g >= 0 && p[y] !== v[g]; )
            g--;
          for (; y >= 1 && g >= 0; y--, g--)
            if (p[y] !== v[g]) {
              if (y !== 1 || g !== 1)
                do
                  if (y--, g--, g < 0 || p[y] !== v[g]) {
                    var b = `
` + p[y].replace(" at new ", " at ");
                    return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), typeof e == "function" && Ka.set(e, b), b;
                  }
                while (y >= 1 && g >= 0);
              break;
            }
        }
      } finally {
        Xa = !1, Gu.current = s, oc(), Error.prepareStackTrace = u;
      }
      var w = e ? e.displayName || e.name : "", M = w ? fa(w) : "";
      return typeof e == "function" && Ka.set(e, M), M;
    }
    function yl(e, t, a) {
      return ru(e, !0);
    }
    function Xu(e, t, a) {
      return ru(e, !1);
    }
    function Ku(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function Hi(e, t, a) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return ru(e, Ku(e));
      if (typeof e == "string")
        return fa(e);
      switch (e) {
        case ae:
          return fa("Suspense");
        case he:
          return fa("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case $:
            return Xu(e.render);
          case Ge:
            return Hi(e.type, t, a);
          case $e: {
            var i = e, u = i._payload, s = i._init;
            try {
              return Hi(s(u), t, a);
            } catch {
            }
          }
        }
      return "";
    }
    function Wf(e) {
      switch (e._debugOwner && e._debugOwner.type, e._debugSource, e.tag) {
        case ie:
          return fa(e.type);
        case an:
          return fa("Lazy");
        case be:
          return fa("Suspense");
        case ln:
          return fa("SuspenseList");
        case se:
        case Je:
        case Fe:
          return Xu(e.type);
        case Qe:
          return Xu(e.type.render);
        case de:
          return yl(e.type);
        default:
          return "";
      }
    }
    function Pi(e) {
      try {
        var t = "", a = e;
        do
          t += Wf(a), a = a.return;
        while (a);
        return t;
      } catch (i) {
        return `
Error generating stack: ` + i.message + `
` + i.stack;
      }
    }
    function kt(e, t, a) {
      var i = e.displayName;
      if (i)
        return i;
      var u = t.displayName || t.name || "";
      return u !== "" ? a + "(" + u + ")" : a;
    }
    function Ju(e) {
      return e.displayName || "Context";
    }
    function Rt(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && S("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case fi:
          return "Fragment";
        case nr:
          return "Portal";
        case di:
          return "Profiler";
        case Qa:
          return "StrictMode";
        case ae:
          return "Suspense";
        case he:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case R:
            var t = e;
            return Ju(t) + ".Consumer";
          case pi:
            var a = e;
            return Ju(a._context) + ".Provider";
          case $:
            return kt(e, e.render, "ForwardRef");
          case Ge:
            var i = e.displayName || null;
            return i !== null ? i : Rt(e.type) || "Memo";
          case $e: {
            var u = e, s = u._payload, f = u._init;
            try {
              return Rt(f(s));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    function Wo(e, t, a) {
      var i = t.displayName || t.name || "";
      return e.displayName || (i !== "" ? a + "(" + i + ")" : a);
    }
    function vi(e) {
      return e.displayName || "Context";
    }
    function Be(e) {
      var t = e.tag, a = e.type;
      switch (t) {
        case bt:
          return "Cache";
        case Kt:
          var i = a;
          return vi(i) + ".Consumer";
        case vt:
          var u = a;
          return vi(u._context) + ".Provider";
        case Jt:
          return "DehydratedFragment";
        case Qe:
          return Wo(a, a.render, "ForwardRef");
        case Xe:
          return "Fragment";
        case ie:
          return a;
        case Se:
          return "Portal";
        case Z:
          return "Root";
        case je:
          return "Text";
        case an:
          return Rt(a);
        case it:
          return a === Qa ? "StrictMode" : "Mode";
        case ke:
          return "Offscreen";
        case ht:
          return "Profiler";
        case xt:
          return "Scope";
        case be:
          return "Suspense";
        case ln:
          return "SuspenseList";
        case Dt:
          return "TracingMarker";
        case de:
        case se:
        case Ft:
        case Je:
        case ct:
        case Fe:
          if (typeof a == "function")
            return a.displayName || a.name || null;
          if (typeof a == "string")
            return a;
          break;
      }
      return null;
    }
    var Zu = A.ReactDebugCurrentFrame, ar = null, hi = !1;
    function Dr() {
      {
        if (ar === null)
          return null;
        var e = ar._debugOwner;
        if (e !== null && typeof e < "u")
          return Be(e);
      }
      return null;
    }
    function mi() {
      return ar === null ? "" : Pi(ar);
    }
    function sn() {
      Zu.getCurrentStack = null, ar = null, hi = !1;
    }
    function Yt(e) {
      Zu.getCurrentStack = e === null ? null : mi, ar = e, hi = !1;
    }
    function gl() {
      return ar;
    }
    function $n(e) {
      hi = e;
    }
    function kr(e) {
      return "" + e;
    }
    function wa(e) {
      switch (typeof e) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return Cn(e), e;
        default:
          return "";
      }
    }
    var au = {
      button: !0,
      checkbox: !0,
      image: !0,
      hidden: !0,
      radio: !0,
      reset: !0,
      submit: !0
    };
    function Go(e, t) {
      au[t.type] || t.onChange || t.onInput || t.readOnly || t.disabled || t.value == null || S("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."), t.onChange || t.readOnly || t.disabled || t.checked == null || S("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
    }
    function qo(e) {
      var t = e.type, a = e.nodeName;
      return a && a.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
    }
    function Sl(e) {
      return e._valueTracker;
    }
    function iu(e) {
      e._valueTracker = null;
    }
    function Gf(e) {
      var t = "";
      return e && (qo(e) ? t = e.checked ? "true" : "false" : t = e.value), t;
    }
    function xa(e) {
      var t = qo(e) ? "checked" : "value", a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      Cn(e[t]);
      var i = "" + e[t];
      if (!(e.hasOwnProperty(t) || typeof a > "u" || typeof a.get != "function" || typeof a.set != "function")) {
        var u = a.get, s = a.set;
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function() {
            return u.call(this);
          },
          set: function(p) {
            Cn(p), i = "" + p, s.call(this, p);
          }
        }), Object.defineProperty(e, t, {
          enumerable: a.enumerable
        });
        var f = {
          getValue: function() {
            return i;
          },
          setValue: function(p) {
            Cn(p), i = "" + p;
          },
          stopTracking: function() {
            iu(e), delete e[t];
          }
        };
        return f;
      }
    }
    function Ja(e) {
      Sl(e) || (e._valueTracker = xa(e));
    }
    function yi(e) {
      if (!e)
        return !1;
      var t = Sl(e);
      if (!t)
        return !0;
      var a = t.getValue(), i = Gf(e);
      return i !== a ? (t.setValue(i), !0) : !1;
    }
    function ba(e) {
      if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var eo = !1, to = !1, El = !1, lu = !1;
    function no(e) {
      var t = e.type === "checkbox" || e.type === "radio";
      return t ? e.checked != null : e.value != null;
    }
    function ro(e, t) {
      var a = e, i = t.checked, u = et({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: i ?? a._wrapperState.initialChecked
      });
      return u;
    }
    function Za(e, t) {
      Go("input", t), t.checked !== void 0 && t.defaultChecked !== void 0 && !to && (S("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component", t.type), to = !0), t.value !== void 0 && t.defaultValue !== void 0 && !eo && (S("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component", t.type), eo = !0);
      var a = e, i = t.defaultValue == null ? "" : t.defaultValue;
      a._wrapperState = {
        initialChecked: t.checked != null ? t.checked : t.defaultChecked,
        initialValue: wa(t.value != null ? t.value : i),
        controlled: no(t)
      };
    }
    function h(e, t) {
      var a = e, i = t.checked;
      i != null && xr(a, "checked", i, !1);
    }
    function C(e, t) {
      var a = e;
      {
        var i = no(t);
        !a._wrapperState.controlled && i && !lu && (S("A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), lu = !0), a._wrapperState.controlled && !i && !El && (S("A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), El = !0);
      }
      h(e, t);
      var u = wa(t.value), s = t.type;
      if (u != null)
        s === "number" ? (u === 0 && a.value === "" || // We explicitly want to coerce to number here if possible.
        // eslint-disable-next-line
        a.value != u) && (a.value = kr(u)) : a.value !== kr(u) && (a.value = kr(u));
      else if (s === "submit" || s === "reset") {
        a.removeAttribute("value");
        return;
      }
      t.hasOwnProperty("value") ? Oe(a, t.type, u) : t.hasOwnProperty("defaultValue") && Oe(a, t.type, wa(t.defaultValue)), t.checked == null && t.defaultChecked != null && (a.defaultChecked = !!t.defaultChecked);
    }
    function N(e, t, a) {
      var i = e;
      if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
        var u = t.type, s = u === "submit" || u === "reset";
        if (s && (t.value === void 0 || t.value === null))
          return;
        var f = kr(i._wrapperState.initialValue);
        a || f !== i.value && (i.value = f), i.defaultValue = f;
      }
      var p = i.name;
      p !== "" && (i.name = ""), i.defaultChecked = !i.defaultChecked, i.defaultChecked = !!i._wrapperState.initialChecked, p !== "" && (i.name = p);
    }
    function j(e, t) {
      var a = e;
      C(a, t), K(a, t);
    }
    function K(e, t) {
      var a = t.name;
      if (t.type === "radio" && a != null) {
        for (var i = e; i.parentNode; )
          i = i.parentNode;
        Vn(a, "name");
        for (var u = i.querySelectorAll("input[name=" + JSON.stringify("" + a) + '][type="radio"]'), s = 0; s < u.length; s++) {
          var f = u[s];
          if (!(f === e || f.form !== e.form)) {
            var p = zh(f);
            if (!p)
              throw new Error("ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.");
            yi(f), C(f, p);
          }
        }
      }
    }
    function Oe(e, t, a) {
      // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
      (t !== "number" || ba(e.ownerDocument) !== e) && (a == null ? e.defaultValue = kr(e._wrapperState.initialValue) : e.defaultValue !== kr(a) && (e.defaultValue = kr(a)));
    }
    var re = !1, Ne = !1, dt = !1;
    function Tt(e, t) {
      t.value == null && (typeof t.children == "object" && t.children !== null ? B.Children.forEach(t.children, function(a) {
        a != null && (typeof a == "string" || typeof a == "number" || Ne || (Ne = !0, S("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.")));
      }) : t.dangerouslySetInnerHTML != null && (dt || (dt = !0, S("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.")))), t.selected != null && !re && (S("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."), re = !0);
    }
    function nn(e, t) {
      t.value != null && e.setAttribute("value", kr(wa(t.value)));
    }
    var It = Array.isArray;
    function at(e) {
      return It(e);
    }
    var Qt;
    Qt = !1;
    function vn() {
      var e = Dr();
      return e ? `

Check the render method of \`` + e + "`." : "";
    }
    var Cl = ["value", "defaultValue"];
    function Xo(e) {
      {
        Go("select", e);
        for (var t = 0; t < Cl.length; t++) {
          var a = Cl[t];
          if (e[a] != null) {
            var i = at(e[a]);
            e.multiple && !i ? S("The `%s` prop supplied to <select> must be an array if `multiple` is true.%s", a, vn()) : !e.multiple && i && S("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.%s", a, vn());
          }
        }
      }
    }
    function Vi(e, t, a, i) {
      var u = e.options;
      if (t) {
        for (var s = a, f = {}, p = 0; p < s.length; p++)
          f["$" + s[p]] = !0;
        for (var v = 0; v < u.length; v++) {
          var y = f.hasOwnProperty("$" + u[v].value);
          u[v].selected !== y && (u[v].selected = y), y && i && (u[v].defaultSelected = !0);
        }
      } else {
        for (var g = kr(wa(a)), b = null, w = 0; w < u.length; w++) {
          if (u[w].value === g) {
            u[w].selected = !0, i && (u[w].defaultSelected = !0);
            return;
          }
          b === null && !u[w].disabled && (b = u[w]);
        }
        b !== null && (b.selected = !0);
      }
    }
    function Ko(e, t) {
      return et({}, t, {
        value: void 0
      });
    }
    function uu(e, t) {
      var a = e;
      Xo(t), a._wrapperState = {
        wasMultiple: !!t.multiple
      }, t.value !== void 0 && t.defaultValue !== void 0 && !Qt && (S("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components"), Qt = !0);
    }
    function qf(e, t) {
      var a = e;
      a.multiple = !!t.multiple;
      var i = t.value;
      i != null ? Vi(a, !!t.multiple, i, !1) : t.defaultValue != null && Vi(a, !!t.multiple, t.defaultValue, !0);
    }
    function sc(e, t) {
      var a = e, i = a._wrapperState.wasMultiple;
      a._wrapperState.wasMultiple = !!t.multiple;
      var u = t.value;
      u != null ? Vi(a, !!t.multiple, u, !1) : i !== !!t.multiple && (t.defaultValue != null ? Vi(a, !!t.multiple, t.defaultValue, !0) : Vi(a, !!t.multiple, t.multiple ? [] : "", !1));
    }
    function Xf(e, t) {
      var a = e, i = t.value;
      i != null && Vi(a, !!t.multiple, i, !1);
    }
    var av = !1;
    function Kf(e, t) {
      var a = e;
      if (t.dangerouslySetInnerHTML != null)
        throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
      var i = et({}, t, {
        value: void 0,
        defaultValue: void 0,
        children: kr(a._wrapperState.initialValue)
      });
      return i;
    }
    function Jf(e, t) {
      var a = e;
      Go("textarea", t), t.value !== void 0 && t.defaultValue !== void 0 && !av && (S("%s contains a textarea with both value and defaultValue props. Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component"), av = !0);
      var i = t.value;
      if (i == null) {
        var u = t.children, s = t.defaultValue;
        if (u != null) {
          S("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
          {
            if (s != null)
              throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            if (at(u)) {
              if (u.length > 1)
                throw new Error("<textarea> can only have at most one child.");
              u = u[0];
            }
            s = u;
          }
        }
        s == null && (s = ""), i = s;
      }
      a._wrapperState = {
        initialValue: wa(i)
      };
    }
    function iv(e, t) {
      var a = e, i = wa(t.value), u = wa(t.defaultValue);
      if (i != null) {
        var s = kr(i);
        s !== a.value && (a.value = s), t.defaultValue == null && a.defaultValue !== s && (a.defaultValue = s);
      }
      u != null && (a.defaultValue = kr(u));
    }
    function lv(e, t) {
      var a = e, i = a.textContent;
      i === a._wrapperState.initialValue && i !== "" && i !== null && (a.value = i);
    }
    function Jm(e, t) {
      iv(e, t);
    }
    var Bi = "http://www.w3.org/1999/xhtml", Zf = "http://www.w3.org/1998/Math/MathML", ed = "http://www.w3.org/2000/svg";
    function td(e) {
      switch (e) {
        case "svg":
          return ed;
        case "math":
          return Zf;
        default:
          return Bi;
      }
    }
    function nd(e, t) {
      return e == null || e === Bi ? td(t) : e === ed && t === "foreignObject" ? Bi : e;
    }
    var uv = function(e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, a, i, u) {
        MSApp.execUnsafeLocalFunction(function() {
          return e(t, a, i, u);
        });
      } : e;
    }, cc, ov = uv(function(e, t) {
      if (e.namespaceURI === ed && !("innerHTML" in e)) {
        cc = cc || document.createElement("div"), cc.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>";
        for (var a = cc.firstChild; e.firstChild; )
          e.removeChild(e.firstChild);
        for (; a.firstChild; )
          e.appendChild(a.firstChild);
        return;
      }
      e.innerHTML = t;
    }), Qr = 1, $i = 3, Ln = 8, Yi = 9, rd = 11, ao = function(e, t) {
      if (t) {
        var a = e.firstChild;
        if (a && a === e.lastChild && a.nodeType === $i) {
          a.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }, Jo = {
      animation: ["animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationTimingFunction"],
      background: ["backgroundAttachment", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize"],
      backgroundPosition: ["backgroundPositionX", "backgroundPositionY"],
      border: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderBlockEnd: ["borderBlockEndColor", "borderBlockEndStyle", "borderBlockEndWidth"],
      borderBlockStart: ["borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth"],
      borderBottom: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth"],
      borderColor: ["borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"],
      borderImage: ["borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth"],
      borderInlineEnd: ["borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth"],
      borderInlineStart: ["borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth"],
      borderLeft: ["borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
      borderRadius: ["borderBottomLeftRadius", "borderBottomRightRadius", "borderTopLeftRadius", "borderTopRightRadius"],
      borderRight: ["borderRightColor", "borderRightStyle", "borderRightWidth"],
      borderStyle: ["borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopStyle"],
      borderTop: ["borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderWidth: ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth"],
      columnRule: ["columnRuleColor", "columnRuleStyle", "columnRuleWidth"],
      columns: ["columnCount", "columnWidth"],
      flex: ["flexBasis", "flexGrow", "flexShrink"],
      flexFlow: ["flexDirection", "flexWrap"],
      font: ["fontFamily", "fontFeatureSettings", "fontKerning", "fontLanguageOverride", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontWeight", "lineHeight"],
      fontVariant: ["fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition"],
      gap: ["columnGap", "rowGap"],
      grid: ["gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      gridArea: ["gridColumnEnd", "gridColumnStart", "gridRowEnd", "gridRowStart"],
      gridColumn: ["gridColumnEnd", "gridColumnStart"],
      gridColumnGap: ["columnGap"],
      gridGap: ["columnGap", "rowGap"],
      gridRow: ["gridRowEnd", "gridRowStart"],
      gridRowGap: ["rowGap"],
      gridTemplate: ["gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      listStyle: ["listStyleImage", "listStylePosition", "listStyleType"],
      margin: ["marginBottom", "marginLeft", "marginRight", "marginTop"],
      marker: ["markerEnd", "markerMid", "markerStart"],
      mask: ["maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPositionX", "maskPositionY", "maskRepeat", "maskSize"],
      maskPosition: ["maskPositionX", "maskPositionY"],
      outline: ["outlineColor", "outlineStyle", "outlineWidth"],
      overflow: ["overflowX", "overflowY"],
      padding: ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"],
      placeContent: ["alignContent", "justifyContent"],
      placeItems: ["alignItems", "justifyItems"],
      placeSelf: ["alignSelf", "justifySelf"],
      textDecoration: ["textDecorationColor", "textDecorationLine", "textDecorationStyle"],
      textEmphasis: ["textEmphasisColor", "textEmphasisStyle"],
      transition: ["transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction"],
      wordWrap: ["overflowWrap"]
    }, Zo = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      // SVG-related properties
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0
    };
    function sv(e, t) {
      return e + t.charAt(0).toUpperCase() + t.substring(1);
    }
    var cv = ["Webkit", "ms", "Moz", "O"];
    Object.keys(Zo).forEach(function(e) {
      cv.forEach(function(t) {
        Zo[sv(t, e)] = Zo[e];
      });
    });
    function fc(e, t, a) {
      var i = t == null || typeof t == "boolean" || t === "";
      return i ? "" : !a && typeof t == "number" && t !== 0 && !(Zo.hasOwnProperty(e) && Zo[e]) ? t + "px" : (oa(t, e), ("" + t).trim());
    }
    var fv = /([A-Z])/g, dv = /^ms-/;
    function io(e) {
      return e.replace(fv, "-$1").toLowerCase().replace(dv, "-ms-");
    }
    var pv = function() {
    };
    {
      var Zm = /^(?:webkit|moz|o)[A-Z]/, ey = /^-ms-/, vv = /-(.)/g, ad = /;\s*$/, gi = {}, ou = {}, hv = !1, es = !1, ty = function(e) {
        return e.replace(vv, function(t, a) {
          return a.toUpperCase();
        });
      }, mv = function(e) {
        gi.hasOwnProperty(e) && gi[e] || (gi[e] = !0, S(
          "Unsupported style property %s. Did you mean %s?",
          e,
          // As Andi Smith suggests
          // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
          // is converted to lowercase `ms`.
          ty(e.replace(ey, "ms-"))
        ));
      }, id = function(e) {
        gi.hasOwnProperty(e) && gi[e] || (gi[e] = !0, S("Unsupported vendor-prefixed style property %s. Did you mean %s?", e, e.charAt(0).toUpperCase() + e.slice(1)));
      }, ld = function(e, t) {
        ou.hasOwnProperty(t) && ou[t] || (ou[t] = !0, S(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, e, t.replace(ad, "")));
      }, yv = function(e, t) {
        hv || (hv = !0, S("`NaN` is an invalid value for the `%s` css style property.", e));
      }, gv = function(e, t) {
        es || (es = !0, S("`Infinity` is an invalid value for the `%s` css style property.", e));
      };
      pv = function(e, t) {
        e.indexOf("-") > -1 ? mv(e) : Zm.test(e) ? id(e) : ad.test(t) && ld(e, t), typeof t == "number" && (isNaN(t) ? yv(e, t) : isFinite(t) || gv(e, t));
      };
    }
    var Sv = pv;
    function ny(e) {
      {
        var t = "", a = "";
        for (var i in e)
          if (e.hasOwnProperty(i)) {
            var u = e[i];
            if (u != null) {
              var s = i.indexOf("--") === 0;
              t += a + (s ? i : io(i)) + ":", t += fc(i, u, s), a = ";";
            }
          }
        return t || null;
      }
    }
    function Ev(e, t) {
      var a = e.style;
      for (var i in t)
        if (t.hasOwnProperty(i)) {
          var u = i.indexOf("--") === 0;
          u || Sv(i, t[i]);
          var s = fc(i, t[i], u);
          i === "float" && (i = "cssFloat"), u ? a.setProperty(i, s) : a[i] = s;
        }
    }
    function ry(e) {
      return e == null || typeof e == "boolean" || e === "";
    }
    function Cv(e) {
      var t = {};
      for (var a in e)
        for (var i = Jo[a] || [a], u = 0; u < i.length; u++)
          t[i[u]] = a;
      return t;
    }
    function ay(e, t) {
      {
        if (!t)
          return;
        var a = Cv(e), i = Cv(t), u = {};
        for (var s in a) {
          var f = a[s], p = i[s];
          if (p && f !== p) {
            var v = f + "," + p;
            if (u[v])
              continue;
            u[v] = !0, S("%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.", ry(e[f]) ? "Removing" : "Updating", f, p);
          }
        }
      }
    }
    var ei = {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0
      // NOTE: menuitem's close tag should be omitted, but that causes problems.
    }, ts = et({
      menuitem: !0
    }, ei), Rv = "__html";
    function dc(e, t) {
      if (t) {
        if (ts[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
          throw new Error(e + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
        if (t.dangerouslySetInnerHTML != null) {
          if (t.children != null)
            throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if (typeof t.dangerouslySetInnerHTML != "object" || !(Rv in t.dangerouslySetInnerHTML))
            throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        }
        if (!t.suppressContentEditableWarning && t.contentEditable && t.children != null && S("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."), t.style != null && typeof t.style != "object")
          throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      }
    }
    function Rl(e, t) {
      if (e.indexOf("-") === -1)
        return typeof t.is == "string";
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var ns = {
      // HTML
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      // SVG
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, pc = {
      "aria-current": 0,
      // state
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      // state
      "aria-hidden": 0,
      // state
      "aria-invalid": 0,
      // state
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      // Widget Attributes
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      // Live Region Attributes
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      // Drag-and-Drop Attributes
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      // Relationship Attributes
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0
    }, lo = {}, iy = new RegExp("^(aria)-[" + ee + "]*$"), uo = new RegExp("^(aria)[A-Z][" + ee + "]*$");
    function ud(e, t) {
      {
        if (wr.call(lo, t) && lo[t])
          return !0;
        if (uo.test(t)) {
          var a = "aria-" + t.slice(4).toLowerCase(), i = pc.hasOwnProperty(a) ? a : null;
          if (i == null)
            return S("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", t), lo[t] = !0, !0;
          if (t !== i)
            return S("Invalid ARIA attribute `%s`. Did you mean `%s`?", t, i), lo[t] = !0, !0;
        }
        if (iy.test(t)) {
          var u = t.toLowerCase(), s = pc.hasOwnProperty(u) ? u : null;
          if (s == null)
            return lo[t] = !0, !1;
          if (t !== s)
            return S("Unknown ARIA attribute `%s`. Did you mean `%s`?", t, s), lo[t] = !0, !0;
        }
      }
      return !0;
    }
    function rs(e, t) {
      {
        var a = [];
        for (var i in t) {
          var u = ud(e, i);
          u || a.push(i);
        }
        var s = a.map(function(f) {
          return "`" + f + "`";
        }).join(", ");
        a.length === 1 ? S("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e) : a.length > 1 && S("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e);
      }
    }
    function od(e, t) {
      Rl(e, t) || rs(e, t);
    }
    var sd = !1;
    function vc(e, t) {
      {
        if (e !== "input" && e !== "textarea" && e !== "select")
          return;
        t != null && t.value === null && !sd && (sd = !0, e === "select" && t.multiple ? S("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", e) : S("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", e));
      }
    }
    var su = function() {
    };
    {
      var ir = {}, cd = /^on./, hc = /^on[^A-Z]/, Tv = new RegExp("^(aria)-[" + ee + "]*$"), wv = new RegExp("^(aria)[A-Z][" + ee + "]*$");
      su = function(e, t, a, i) {
        if (wr.call(ir, t) && ir[t])
          return !0;
        var u = t.toLowerCase();
        if (u === "onfocusin" || u === "onfocusout")
          return S("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."), ir[t] = !0, !0;
        if (i != null) {
          var s = i.registrationNameDependencies, f = i.possibleRegistrationNames;
          if (s.hasOwnProperty(t))
            return !0;
          var p = f.hasOwnProperty(u) ? f[u] : null;
          if (p != null)
            return S("Invalid event handler property `%s`. Did you mean `%s`?", t, p), ir[t] = !0, !0;
          if (cd.test(t))
            return S("Unknown event handler property `%s`. It will be ignored.", t), ir[t] = !0, !0;
        } else if (cd.test(t))
          return hc.test(t) && S("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", t), ir[t] = !0, !0;
        if (Tv.test(t) || wv.test(t))
          return !0;
        if (u === "innerhtml")
          return S("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."), ir[t] = !0, !0;
        if (u === "aria")
          return S("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."), ir[t] = !0, !0;
        if (u === "is" && a !== null && a !== void 0 && typeof a != "string")
          return S("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof a), ir[t] = !0, !0;
        if (typeof a == "number" && isNaN(a))
          return S("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", t), ir[t] = !0, !0;
        var v = en(t), y = v !== null && v.type === Bn;
        if (ns.hasOwnProperty(u)) {
          var g = ns[u];
          if (g !== t)
            return S("Invalid DOM property `%s`. Did you mean `%s`?", t, g), ir[t] = !0, !0;
        } else if (!y && t !== u)
          return S("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", t, u), ir[t] = !0, !0;
        return typeof a == "boolean" && un(t, a, v, !1) ? (a ? S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', a, t, t, a, t) : S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', a, t, t, a, t, t, t), ir[t] = !0, !0) : y ? !0 : un(t, a, v, !1) ? (ir[t] = !0, !1) : ((a === "false" || a === "true") && v !== null && v.type === On && (S("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", a, t, a === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', t, a), ir[t] = !0), !0);
      };
    }
    var xv = function(e, t, a) {
      {
        var i = [];
        for (var u in t) {
          var s = su(e, u, t[u], a);
          s || i.push(u);
        }
        var f = i.map(function(p) {
          return "`" + p + "`";
        }).join(", ");
        i.length === 1 ? S("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e) : i.length > 1 && S("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e);
      }
    };
    function bv(e, t, a) {
      Rl(e, t) || xv(e, t, a);
    }
    var fd = 1, mc = 2, _a = 4, dd = fd | mc | _a, cu = null;
    function ly(e) {
      cu !== null && S("Expected currently replaying event to be null. This error is likely caused by a bug in React. Please file an issue."), cu = e;
    }
    function uy() {
      cu === null && S("Expected currently replaying event to not be null. This error is likely caused by a bug in React. Please file an issue."), cu = null;
    }
    function as(e) {
      return e === cu;
    }
    function pd(e) {
      var t = e.target || e.srcElement || window;
      return t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === $i ? t.parentNode : t;
    }
    var yc = null, fu = null, Ht = null;
    function gc(e) {
      var t = ko(e);
      if (t) {
        if (typeof yc != "function")
          throw new Error("setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.");
        var a = t.stateNode;
        if (a) {
          var i = zh(a);
          yc(t.stateNode, t.type, i);
        }
      }
    }
    function Sc(e) {
      yc = e;
    }
    function oo(e) {
      fu ? Ht ? Ht.push(e) : Ht = [e] : fu = e;
    }
    function _v() {
      return fu !== null || Ht !== null;
    }
    function Ec() {
      if (fu) {
        var e = fu, t = Ht;
        if (fu = null, Ht = null, gc(e), t)
          for (var a = 0; a < t.length; a++)
            gc(t[a]);
      }
    }
    var so = function(e, t) {
      return e(t);
    }, is = function() {
    }, Tl = !1;
    function Dv() {
      var e = _v();
      e && (is(), Ec());
    }
    function kv(e, t, a) {
      if (Tl)
        return e(t, a);
      Tl = !0;
      try {
        return so(e, t, a);
      } finally {
        Tl = !1, Dv();
      }
    }
    function oy(e, t, a) {
      so = e, is = a;
    }
    function Ov(e) {
      return e === "button" || e === "input" || e === "select" || e === "textarea";
    }
    function Cc(e, t, a) {
      switch (e) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          return !!(a.disabled && Ov(t));
        default:
          return !1;
      }
    }
    function wl(e, t) {
      var a = e.stateNode;
      if (a === null)
        return null;
      var i = zh(a);
      if (i === null)
        return null;
      var u = i[t];
      if (Cc(t, e.type, i))
        return null;
      if (u && typeof u != "function")
        throw new Error("Expected `" + t + "` listener to be a function, instead got a value of `" + typeof u + "` type.");
      return u;
    }
    var ls = !1;
    if (kn)
      try {
        var du = {};
        Object.defineProperty(du, "passive", {
          get: function() {
            ls = !0;
          }
        }), window.addEventListener("test", du, du), window.removeEventListener("test", du, du);
      } catch {
        ls = !1;
      }
    function Rc(e, t, a, i, u, s, f, p, v) {
      var y = Array.prototype.slice.call(arguments, 3);
      try {
        t.apply(a, y);
      } catch (g) {
        this.onError(g);
      }
    }
    var Tc = Rc;
    if (typeof window < "u" && typeof window.dispatchEvent == "function" && typeof document < "u" && typeof document.createEvent == "function") {
      var vd = document.createElement("react");
      Tc = function(t, a, i, u, s, f, p, v, y) {
        if (typeof document > "u" || document === null)
          throw new Error("The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.");
        var g = document.createEvent("Event"), b = !1, w = !0, M = window.event, z = Object.getOwnPropertyDescriptor(window, "event");
        function F() {
          vd.removeEventListener(H, Le, !1), typeof window.event < "u" && window.hasOwnProperty("event") && (window.event = M);
        }
        var ue = Array.prototype.slice.call(arguments, 3);
        function Le() {
          b = !0, F(), a.apply(i, ue), w = !1;
        }
        var we, Ct = !1, mt = !1;
        function k(O) {
          if (we = O.error, Ct = !0, we === null && O.colno === 0 && O.lineno === 0 && (mt = !0), O.defaultPrevented && we != null && typeof we == "object")
            try {
              we._suppressLogging = !0;
            } catch {
            }
        }
        var H = "react-" + (t || "invokeguardedcallback");
        if (window.addEventListener("error", k), vd.addEventListener(H, Le, !1), g.initEvent(H, !1, !1), vd.dispatchEvent(g), z && Object.defineProperty(window, "event", z), b && w && (Ct ? mt && (we = new Error("A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://reactjs.org/link/crossorigin-error for more information.")) : we = new Error(`An error was thrown inside one of your components, but React doesn't know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It's possible that these don't work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.`), this.onError(we)), window.removeEventListener("error", k), !b)
          return F(), Rc.apply(this, arguments);
      };
    }
    var Lv = Tc, co = !1, wc = null, fo = !1, Si = null, Mv = {
      onError: function(e) {
        co = !0, wc = e;
      }
    };
    function xl(e, t, a, i, u, s, f, p, v) {
      co = !1, wc = null, Lv.apply(Mv, arguments);
    }
    function Ei(e, t, a, i, u, s, f, p, v) {
      if (xl.apply(this, arguments), co) {
        var y = os();
        fo || (fo = !0, Si = y);
      }
    }
    function us() {
      if (fo) {
        var e = Si;
        throw fo = !1, Si = null, e;
      }
    }
    function Ii() {
      return co;
    }
    function os() {
      if (co) {
        var e = wc;
        return co = !1, wc = null, e;
      } else
        throw new Error("clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.");
    }
    function po(e) {
      return e._reactInternals;
    }
    function sy(e) {
      return e._reactInternals !== void 0;
    }
    function pu(e, t) {
      e._reactInternals = t;
    }
    var _e = (
      /*                      */
      0
    ), ti = (
      /*                */
      1
    ), hn = (
      /*                    */
      2
    ), gt = (
      /*                       */
      4
    ), Da = (
      /*                */
      16
    ), ka = (
      /*                 */
      32
    ), rn = (
      /*                     */
      64
    ), xe = (
      /*                   */
      128
    ), Er = (
      /*            */
      256
    ), Sn = (
      /*                          */
      512
    ), Yn = (
      /*                     */
      1024
    ), Wr = (
      /*                      */
      2048
    ), Gr = (
      /*                    */
      4096
    ), Mn = (
      /*                   */
      8192
    ), vo = (
      /*             */
      16384
    ), Nv = (
      /*               */
      32767
    ), ss = (
      /*                   */
      32768
    ), Xn = (
      /*                */
      65536
    ), xc = (
      /* */
      131072
    ), Ci = (
      /*                       */
      1048576
    ), ho = (
      /*                    */
      2097152
    ), Qi = (
      /*                 */
      4194304
    ), bc = (
      /*                */
      8388608
    ), bl = (
      /*               */
      16777216
    ), Ri = (
      /*              */
      33554432
    ), _l = (
      // TODO: Remove Update flag from before mutation phase by re-landing Visibility
      // flag logic (see #20043)
      gt | Yn | 0
    ), Dl = hn | gt | Da | ka | Sn | Gr | Mn, kl = gt | rn | Sn | Mn, Wi = Wr | Da, Nn = Qi | bc | ho, Oa = A.ReactCurrentOwner;
    function da(e) {
      var t = e, a = e;
      if (e.alternate)
        for (; t.return; )
          t = t.return;
      else {
        var i = t;
        do
          t = i, (t.flags & (hn | Gr)) !== _e && (a = t.return), i = t.return;
        while (i);
      }
      return t.tag === Z ? a : null;
    }
    function Ti(e) {
      if (e.tag === be) {
        var t = e.memoizedState;
        if (t === null) {
          var a = e.alternate;
          a !== null && (t = a.memoizedState);
        }
        if (t !== null)
          return t.dehydrated;
      }
      return null;
    }
    function wi(e) {
      return e.tag === Z ? e.stateNode.containerInfo : null;
    }
    function vu(e) {
      return da(e) === e;
    }
    function Uv(e) {
      {
        var t = Oa.current;
        if (t !== null && t.tag === de) {
          var a = t, i = a.stateNode;
          i._warnedAboutRefsInRender || S("%s is accessing isMounted inside its render() function. render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", Be(a) || "A component"), i._warnedAboutRefsInRender = !0;
        }
      }
      var u = po(e);
      return u ? da(u) === u : !1;
    }
    function _c(e) {
      if (da(e) !== e)
        throw new Error("Unable to find node on an unmounted component.");
    }
    function Dc(e) {
      var t = e.alternate;
      if (!t) {
        var a = da(e);
        if (a === null)
          throw new Error("Unable to find node on an unmounted component.");
        return a !== e ? null : e;
      }
      for (var i = e, u = t; ; ) {
        var s = i.return;
        if (s === null)
          break;
        var f = s.alternate;
        if (f === null) {
          var p = s.return;
          if (p !== null) {
            i = u = p;
            continue;
          }
          break;
        }
        if (s.child === f.child) {
          for (var v = s.child; v; ) {
            if (v === i)
              return _c(s), e;
            if (v === u)
              return _c(s), t;
            v = v.sibling;
          }
          throw new Error("Unable to find node on an unmounted component.");
        }
        if (i.return !== u.return)
          i = s, u = f;
        else {
          for (var y = !1, g = s.child; g; ) {
            if (g === i) {
              y = !0, i = s, u = f;
              break;
            }
            if (g === u) {
              y = !0, u = s, i = f;
              break;
            }
            g = g.sibling;
          }
          if (!y) {
            for (g = f.child; g; ) {
              if (g === i) {
                y = !0, i = f, u = s;
                break;
              }
              if (g === u) {
                y = !0, u = f, i = s;
                break;
              }
              g = g.sibling;
            }
            if (!y)
              throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
          }
        }
        if (i.alternate !== u)
          throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
      }
      if (i.tag !== Z)
        throw new Error("Unable to find node on an unmounted component.");
      return i.stateNode.current === i ? e : t;
    }
    function qr(e) {
      var t = Dc(e);
      return t !== null ? Xr(t) : null;
    }
    function Xr(e) {
      if (e.tag === ie || e.tag === je)
        return e;
      for (var t = e.child; t !== null; ) {
        var a = Xr(t);
        if (a !== null)
          return a;
        t = t.sibling;
      }
      return null;
    }
    function fn(e) {
      var t = Dc(e);
      return t !== null ? La(t) : null;
    }
    function La(e) {
      if (e.tag === ie || e.tag === je)
        return e;
      for (var t = e.child; t !== null; ) {
        if (t.tag !== Se) {
          var a = La(t);
          if (a !== null)
            return a;
        }
        t = t.sibling;
      }
      return null;
    }
    var hd = X.unstable_scheduleCallback, zv = X.unstable_cancelCallback, md = X.unstable_shouldYield, yd = X.unstable_requestPaint, In = X.unstable_now, kc = X.unstable_getCurrentPriorityLevel, cs = X.unstable_ImmediatePriority, Ol = X.unstable_UserBlockingPriority, Gi = X.unstable_NormalPriority, cy = X.unstable_LowPriority, hu = X.unstable_IdlePriority, Oc = X.unstable_yieldValue, Av = X.unstable_setDisableYieldValue, mu = null, Tn = null, le = null, pa = !1, Kr = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u";
    function mo(e) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u")
        return !1;
      var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (t.isDisabled)
        return !0;
      if (!t.supportsFiber)
        return S("The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://reactjs.org/link/react-devtools"), !0;
      try {
        He && (e = et({}, e, {
          getLaneLabelMap: yu,
          injectProfilingHooks: Ma
        })), mu = t.inject(e), Tn = t;
      } catch (a) {
        S("React instrumentation encountered an error: %s.", a);
      }
      return !!t.checkDCE;
    }
    function gd(e, t) {
      if (Tn && typeof Tn.onScheduleFiberRoot == "function")
        try {
          Tn.onScheduleFiberRoot(mu, e, t);
        } catch (a) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", a));
        }
    }
    function Sd(e, t) {
      if (Tn && typeof Tn.onCommitFiberRoot == "function")
        try {
          var a = (e.current.flags & xe) === xe;
          if (ze) {
            var i;
            switch (t) {
              case Or:
                i = cs;
                break;
              case bi:
                i = Ol;
                break;
              case Na:
                i = Gi;
                break;
              case Ua:
                i = hu;
                break;
              default:
                i = Gi;
                break;
            }
            Tn.onCommitFiberRoot(mu, e, i, a);
          }
        } catch (u) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", u));
        }
    }
    function Ed(e) {
      if (Tn && typeof Tn.onPostCommitFiberRoot == "function")
        try {
          Tn.onPostCommitFiberRoot(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function Cd(e) {
      if (Tn && typeof Tn.onCommitFiberUnmount == "function")
        try {
          Tn.onCommitFiberUnmount(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function mn(e) {
      if (typeof Oc == "function" && (Av(e), pt(e)), Tn && typeof Tn.setStrictMode == "function")
        try {
          Tn.setStrictMode(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function Ma(e) {
      le = e;
    }
    function yu() {
      {
        for (var e = /* @__PURE__ */ new Map(), t = 1, a = 0; a < Eu; a++) {
          var i = Pv(t);
          e.set(t, i), t *= 2;
        }
        return e;
      }
    }
    function Rd(e) {
      le !== null && typeof le.markCommitStarted == "function" && le.markCommitStarted(e);
    }
    function Td() {
      le !== null && typeof le.markCommitStopped == "function" && le.markCommitStopped();
    }
    function va(e) {
      le !== null && typeof le.markComponentRenderStarted == "function" && le.markComponentRenderStarted(e);
    }
    function ha() {
      le !== null && typeof le.markComponentRenderStopped == "function" && le.markComponentRenderStopped();
    }
    function wd(e) {
      le !== null && typeof le.markComponentPassiveEffectMountStarted == "function" && le.markComponentPassiveEffectMountStarted(e);
    }
    function jv() {
      le !== null && typeof le.markComponentPassiveEffectMountStopped == "function" && le.markComponentPassiveEffectMountStopped();
    }
    function qi(e) {
      le !== null && typeof le.markComponentPassiveEffectUnmountStarted == "function" && le.markComponentPassiveEffectUnmountStarted(e);
    }
    function Ll() {
      le !== null && typeof le.markComponentPassiveEffectUnmountStopped == "function" && le.markComponentPassiveEffectUnmountStopped();
    }
    function Lc(e) {
      le !== null && typeof le.markComponentLayoutEffectMountStarted == "function" && le.markComponentLayoutEffectMountStarted(e);
    }
    function Fv() {
      le !== null && typeof le.markComponentLayoutEffectMountStopped == "function" && le.markComponentLayoutEffectMountStopped();
    }
    function fs(e) {
      le !== null && typeof le.markComponentLayoutEffectUnmountStarted == "function" && le.markComponentLayoutEffectUnmountStarted(e);
    }
    function xd() {
      le !== null && typeof le.markComponentLayoutEffectUnmountStopped == "function" && le.markComponentLayoutEffectUnmountStopped();
    }
    function ds(e, t, a) {
      le !== null && typeof le.markComponentErrored == "function" && le.markComponentErrored(e, t, a);
    }
    function xi(e, t, a) {
      le !== null && typeof le.markComponentSuspended == "function" && le.markComponentSuspended(e, t, a);
    }
    function ps(e) {
      le !== null && typeof le.markLayoutEffectsStarted == "function" && le.markLayoutEffectsStarted(e);
    }
    function vs() {
      le !== null && typeof le.markLayoutEffectsStopped == "function" && le.markLayoutEffectsStopped();
    }
    function gu(e) {
      le !== null && typeof le.markPassiveEffectsStarted == "function" && le.markPassiveEffectsStarted(e);
    }
    function bd() {
      le !== null && typeof le.markPassiveEffectsStopped == "function" && le.markPassiveEffectsStopped();
    }
    function Su(e) {
      le !== null && typeof le.markRenderStarted == "function" && le.markRenderStarted(e);
    }
    function Hv() {
      le !== null && typeof le.markRenderYielded == "function" && le.markRenderYielded();
    }
    function Mc() {
      le !== null && typeof le.markRenderStopped == "function" && le.markRenderStopped();
    }
    function yn(e) {
      le !== null && typeof le.markRenderScheduled == "function" && le.markRenderScheduled(e);
    }
    function Nc(e, t) {
      le !== null && typeof le.markForceUpdateScheduled == "function" && le.markForceUpdateScheduled(e, t);
    }
    function hs(e, t) {
      le !== null && typeof le.markStateUpdateScheduled == "function" && le.markStateUpdateScheduled(e, t);
    }
    var De = (
      /*                         */
      0
    ), st = (
      /*                 */
      1
    ), Ot = (
      /*                    */
      2
    ), Wt = (
      /*               */
      8
    ), Lt = (
      /*              */
      16
    ), Un = Math.clz32 ? Math.clz32 : ms, Kn = Math.log, Uc = Math.LN2;
    function ms(e) {
      var t = e >>> 0;
      return t === 0 ? 32 : 31 - (Kn(t) / Uc | 0) | 0;
    }
    var Eu = 31, Y = (
      /*                        */
      0
    ), _t = (
      /*                          */
      0
    ), Ae = (
      /*                        */
      1
    ), Ml = (
      /*    */
      2
    ), ni = (
      /*             */
      4
    ), Cr = (
      /*            */
      8
    ), wn = (
      /*                     */
      16
    ), Xi = (
      /*                */
      32
    ), Nl = (
      /*                       */
      4194240
    ), Cu = (
      /*                        */
      64
    ), zc = (
      /*                        */
      128
    ), Ac = (
      /*                        */
      256
    ), jc = (
      /*                        */
      512
    ), Fc = (
      /*                        */
      1024
    ), Hc = (
      /*                        */
      2048
    ), Pc = (
      /*                        */
      4096
    ), Vc = (
      /*                        */
      8192
    ), Bc = (
      /*                        */
      16384
    ), Ru = (
      /*                       */
      32768
    ), $c = (
      /*                       */
      65536
    ), yo = (
      /*                       */
      131072
    ), go = (
      /*                       */
      262144
    ), Yc = (
      /*                       */
      524288
    ), ys = (
      /*                       */
      1048576
    ), Ic = (
      /*                       */
      2097152
    ), gs = (
      /*                            */
      130023424
    ), Tu = (
      /*                             */
      4194304
    ), Qc = (
      /*                             */
      8388608
    ), Ss = (
      /*                             */
      16777216
    ), Wc = (
      /*                             */
      33554432
    ), Gc = (
      /*                             */
      67108864
    ), _d = Tu, Es = (
      /*          */
      134217728
    ), Dd = (
      /*                          */
      268435455
    ), Cs = (
      /*               */
      268435456
    ), wu = (
      /*                        */
      536870912
    ), Jr = (
      /*                   */
      1073741824
    );
    function Pv(e) {
      {
        if (e & Ae)
          return "Sync";
        if (e & Ml)
          return "InputContinuousHydration";
        if (e & ni)
          return "InputContinuous";
        if (e & Cr)
          return "DefaultHydration";
        if (e & wn)
          return "Default";
        if (e & Xi)
          return "TransitionHydration";
        if (e & Nl)
          return "Transition";
        if (e & gs)
          return "Retry";
        if (e & Es)
          return "SelectiveHydration";
        if (e & Cs)
          return "IdleHydration";
        if (e & wu)
          return "Idle";
        if (e & Jr)
          return "Offscreen";
      }
    }
    var Xt = -1, xu = Cu, qc = Tu;
    function Rs(e) {
      switch (Ul(e)) {
        case Ae:
          return Ae;
        case Ml:
          return Ml;
        case ni:
          return ni;
        case Cr:
          return Cr;
        case wn:
          return wn;
        case Xi:
          return Xi;
        case Cu:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Vc:
        case Bc:
        case Ru:
        case $c:
        case yo:
        case go:
        case Yc:
        case ys:
        case Ic:
          return e & Nl;
        case Tu:
        case Qc:
        case Ss:
        case Wc:
        case Gc:
          return e & gs;
        case Es:
          return Es;
        case Cs:
          return Cs;
        case wu:
          return wu;
        case Jr:
          return Jr;
        default:
          return S("Should have found matching lanes. This is a bug in React."), e;
      }
    }
    function Xc(e, t) {
      var a = e.pendingLanes;
      if (a === Y)
        return Y;
      var i = Y, u = e.suspendedLanes, s = e.pingedLanes, f = a & Dd;
      if (f !== Y) {
        var p = f & ~u;
        if (p !== Y)
          i = Rs(p);
        else {
          var v = f & s;
          v !== Y && (i = Rs(v));
        }
      } else {
        var y = a & ~u;
        y !== Y ? i = Rs(y) : s !== Y && (i = Rs(s));
      }
      if (i === Y)
        return Y;
      if (t !== Y && t !== i && // If we already suspended with a delay, then interrupting is fine. Don't
      // bother waiting until the root is complete.
      (t & u) === Y) {
        var g = Ul(i), b = Ul(t);
        if (
          // Tests whether the next lane is equal or lower priority than the wip
          // one. This works because the bits decrease in priority as you go left.
          g >= b || // Default priority updates should not interrupt transition updates. The
          // only difference between default updates and transition updates is that
          // default updates do not support refresh transitions.
          g === wn && (b & Nl) !== Y
        )
          return t;
      }
      (i & ni) !== Y && (i |= a & wn);
      var w = e.entangledLanes;
      if (w !== Y)
        for (var M = e.entanglements, z = i & w; z > 0; ) {
          var F = zn(z), ue = 1 << F;
          i |= M[F], z &= ~ue;
        }
      return i;
    }
    function ri(e, t) {
      for (var a = e.eventTimes, i = Xt; t > 0; ) {
        var u = zn(t), s = 1 << u, f = a[u];
        f > i && (i = f), t &= ~s;
      }
      return i;
    }
    function kd(e, t) {
      switch (e) {
        case Ae:
        case Ml:
        case ni:
          return t + 250;
        case Cr:
        case wn:
        case Xi:
        case Cu:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Vc:
        case Bc:
        case Ru:
        case $c:
        case yo:
        case go:
        case Yc:
        case ys:
        case Ic:
          return t + 5e3;
        case Tu:
        case Qc:
        case Ss:
        case Wc:
        case Gc:
          return Xt;
        case Es:
        case Cs:
        case wu:
        case Jr:
          return Xt;
        default:
          return S("Should have found matching lanes. This is a bug in React."), Xt;
      }
    }
    function Kc(e, t) {
      for (var a = e.pendingLanes, i = e.suspendedLanes, u = e.pingedLanes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = zn(f), v = 1 << p, y = s[p];
        y === Xt ? ((v & i) === Y || (v & u) !== Y) && (s[p] = kd(v, t)) : y <= t && (e.expiredLanes |= v), f &= ~v;
      }
    }
    function Vv(e) {
      return Rs(e.pendingLanes);
    }
    function Jc(e) {
      var t = e.pendingLanes & ~Jr;
      return t !== Y ? t : t & Jr ? Jr : Y;
    }
    function Bv(e) {
      return (e & Ae) !== Y;
    }
    function Ts(e) {
      return (e & Dd) !== Y;
    }
    function bu(e) {
      return (e & gs) === e;
    }
    function Od(e) {
      var t = Ae | ni | wn;
      return (e & t) === Y;
    }
    function Ld(e) {
      return (e & Nl) === e;
    }
    function Zc(e, t) {
      var a = Ml | ni | Cr | wn;
      return (t & a) !== Y;
    }
    function $v(e, t) {
      return (t & e.expiredLanes) !== Y;
    }
    function Md(e) {
      return (e & Nl) !== Y;
    }
    function Nd() {
      var e = xu;
      return xu <<= 1, (xu & Nl) === Y && (xu = Cu), e;
    }
    function Yv() {
      var e = qc;
      return qc <<= 1, (qc & gs) === Y && (qc = Tu), e;
    }
    function Ul(e) {
      return e & -e;
    }
    function ws(e) {
      return Ul(e);
    }
    function zn(e) {
      return 31 - Un(e);
    }
    function lr(e) {
      return zn(e);
    }
    function Zr(e, t) {
      return (e & t) !== Y;
    }
    function _u(e, t) {
      return (e & t) === t;
    }
    function Ke(e, t) {
      return e | t;
    }
    function xs(e, t) {
      return e & ~t;
    }
    function Ud(e, t) {
      return e & t;
    }
    function Iv(e) {
      return e;
    }
    function Qv(e, t) {
      return e !== _t && e < t ? e : t;
    }
    function bs(e) {
      for (var t = [], a = 0; a < Eu; a++)
        t.push(e);
      return t;
    }
    function So(e, t, a) {
      e.pendingLanes |= t, t !== wu && (e.suspendedLanes = Y, e.pingedLanes = Y);
      var i = e.eventTimes, u = lr(t);
      i[u] = a;
    }
    function Wv(e, t) {
      e.suspendedLanes |= t, e.pingedLanes &= ~t;
      for (var a = e.expirationTimes, i = t; i > 0; ) {
        var u = zn(i), s = 1 << u;
        a[u] = Xt, i &= ~s;
      }
    }
    function ef(e, t, a) {
      e.pingedLanes |= e.suspendedLanes & t;
    }
    function zd(e, t) {
      var a = e.pendingLanes & ~t;
      e.pendingLanes = t, e.suspendedLanes = Y, e.pingedLanes = Y, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t;
      for (var i = e.entanglements, u = e.eventTimes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = zn(f), v = 1 << p;
        i[p] = Y, u[p] = Xt, s[p] = Xt, f &= ~v;
      }
    }
    function tf(e, t) {
      for (var a = e.entangledLanes |= t, i = e.entanglements, u = a; u; ) {
        var s = zn(u), f = 1 << s;
        // Is this one of the newly entangled lanes?
        f & t | // Is this lane transitively entangled with the newly entangled lanes?
        i[s] & t && (i[s] |= t), u &= ~f;
      }
    }
    function Ad(e, t) {
      var a = Ul(t), i;
      switch (a) {
        case ni:
          i = Ml;
          break;
        case wn:
          i = Cr;
          break;
        case Cu:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Vc:
        case Bc:
        case Ru:
        case $c:
        case yo:
        case go:
        case Yc:
        case ys:
        case Ic:
        case Tu:
        case Qc:
        case Ss:
        case Wc:
        case Gc:
          i = Xi;
          break;
        case wu:
          i = Cs;
          break;
        default:
          i = _t;
          break;
      }
      return (i & (e.suspendedLanes | t)) !== _t ? _t : i;
    }
    function _s(e, t, a) {
      if (Kr)
        for (var i = e.pendingUpdatersLaneMap; a > 0; ) {
          var u = lr(a), s = 1 << u, f = i[u];
          f.add(t), a &= ~s;
        }
    }
    function Gv(e, t) {
      if (Kr)
        for (var a = e.pendingUpdatersLaneMap, i = e.memoizedUpdaters; t > 0; ) {
          var u = lr(t), s = 1 << u, f = a[u];
          f.size > 0 && (f.forEach(function(p) {
            var v = p.alternate;
            (v === null || !i.has(v)) && i.add(p);
          }), f.clear()), t &= ~s;
        }
    }
    function jd(e, t) {
      return null;
    }
    var Or = Ae, bi = ni, Na = wn, Ua = wu, Ds = _t;
    function za() {
      return Ds;
    }
    function An(e) {
      Ds = e;
    }
    function qv(e, t) {
      var a = Ds;
      try {
        return Ds = e, t();
      } finally {
        Ds = a;
      }
    }
    function Xv(e, t) {
      return e !== 0 && e < t ? e : t;
    }
    function ks(e, t) {
      return e > t ? e : t;
    }
    function Jn(e, t) {
      return e !== 0 && e < t;
    }
    function Kv(e) {
      var t = Ul(e);
      return Jn(Or, t) ? Jn(bi, t) ? Ts(t) ? Na : Ua : bi : Or;
    }
    function nf(e) {
      var t = e.current.memoizedState;
      return t.isDehydrated;
    }
    var Os;
    function Rr(e) {
      Os = e;
    }
    function fy(e) {
      Os(e);
    }
    var ve;
    function Eo(e) {
      ve = e;
    }
    var rf;
    function Jv(e) {
      rf = e;
    }
    var Zv;
    function Ls(e) {
      Zv = e;
    }
    var Ms;
    function Fd(e) {
      Ms = e;
    }
    var af = !1, Ns = [], Ki = null, _i = null, Di = null, xn = /* @__PURE__ */ new Map(), Lr = /* @__PURE__ */ new Map(), Mr = [], eh = [
      "mousedown",
      "mouseup",
      "touchcancel",
      "touchend",
      "touchstart",
      "auxclick",
      "dblclick",
      "pointercancel",
      "pointerdown",
      "pointerup",
      "dragend",
      "dragstart",
      "drop",
      "compositionend",
      "compositionstart",
      "keydown",
      "keypress",
      "keyup",
      "input",
      "textInput",
      // Intentionally camelCase
      "copy",
      "cut",
      "paste",
      "click",
      "change",
      "contextmenu",
      "reset",
      "submit"
    ];
    function th(e) {
      return eh.indexOf(e) > -1;
    }
    function ai(e, t, a, i, u) {
      return {
        blockedOn: e,
        domEventName: t,
        eventSystemFlags: a,
        nativeEvent: u,
        targetContainers: [i]
      };
    }
    function Hd(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          Ki = null;
          break;
        case "dragenter":
        case "dragleave":
          _i = null;
          break;
        case "mouseover":
        case "mouseout":
          Di = null;
          break;
        case "pointerover":
        case "pointerout": {
          var a = t.pointerId;
          xn.delete(a);
          break;
        }
        case "gotpointercapture":
        case "lostpointercapture": {
          var i = t.pointerId;
          Lr.delete(i);
          break;
        }
      }
    }
    function ea(e, t, a, i, u, s) {
      if (e === null || e.nativeEvent !== s) {
        var f = ai(t, a, i, u, s);
        if (t !== null) {
          var p = ko(t);
          p !== null && ve(p);
        }
        return f;
      }
      e.eventSystemFlags |= i;
      var v = e.targetContainers;
      return u !== null && v.indexOf(u) === -1 && v.push(u), e;
    }
    function dy(e, t, a, i, u) {
      switch (t) {
        case "focusin": {
          var s = u;
          return Ki = ea(Ki, e, t, a, i, s), !0;
        }
        case "dragenter": {
          var f = u;
          return _i = ea(_i, e, t, a, i, f), !0;
        }
        case "mouseover": {
          var p = u;
          return Di = ea(Di, e, t, a, i, p), !0;
        }
        case "pointerover": {
          var v = u, y = v.pointerId;
          return xn.set(y, ea(xn.get(y) || null, e, t, a, i, v)), !0;
        }
        case "gotpointercapture": {
          var g = u, b = g.pointerId;
          return Lr.set(b, ea(Lr.get(b) || null, e, t, a, i, g)), !0;
        }
      }
      return !1;
    }
    function Pd(e) {
      var t = Is(e.target);
      if (t !== null) {
        var a = da(t);
        if (a !== null) {
          var i = a.tag;
          if (i === be) {
            var u = Ti(a);
            if (u !== null) {
              e.blockedOn = u, Ms(e.priority, function() {
                rf(a);
              });
              return;
            }
          } else if (i === Z) {
            var s = a.stateNode;
            if (nf(s)) {
              e.blockedOn = wi(a);
              return;
            }
          }
        }
      }
      e.blockedOn = null;
    }
    function nh(e) {
      for (var t = Zv(), a = {
        blockedOn: null,
        target: e,
        priority: t
      }, i = 0; i < Mr.length && Jn(t, Mr[i].priority); i++)
        ;
      Mr.splice(i, 0, a), i === 0 && Pd(a);
    }
    function Us(e) {
      if (e.blockedOn !== null)
        return !1;
      for (var t = e.targetContainers; t.length > 0; ) {
        var a = t[0], i = Ro(e.domEventName, e.eventSystemFlags, a, e.nativeEvent);
        if (i === null) {
          var u = e.nativeEvent, s = new u.constructor(u.type, u);
          ly(s), u.target.dispatchEvent(s), uy();
        } else {
          var f = ko(i);
          return f !== null && ve(f), e.blockedOn = i, !1;
        }
        t.shift();
      }
      return !0;
    }
    function Vd(e, t, a) {
      Us(e) && a.delete(t);
    }
    function py() {
      af = !1, Ki !== null && Us(Ki) && (Ki = null), _i !== null && Us(_i) && (_i = null), Di !== null && Us(Di) && (Di = null), xn.forEach(Vd), Lr.forEach(Vd);
    }
    function zl(e, t) {
      e.blockedOn === t && (e.blockedOn = null, af || (af = !0, X.unstable_scheduleCallback(X.unstable_NormalPriority, py)));
    }
    function Du(e) {
      if (Ns.length > 0) {
        zl(Ns[0], e);
        for (var t = 1; t < Ns.length; t++) {
          var a = Ns[t];
          a.blockedOn === e && (a.blockedOn = null);
        }
      }
      Ki !== null && zl(Ki, e), _i !== null && zl(_i, e), Di !== null && zl(Di, e);
      var i = function(p) {
        return zl(p, e);
      };
      xn.forEach(i), Lr.forEach(i);
      for (var u = 0; u < Mr.length; u++) {
        var s = Mr[u];
        s.blockedOn === e && (s.blockedOn = null);
      }
      for (; Mr.length > 0; ) {
        var f = Mr[0];
        if (f.blockedOn !== null)
          break;
        Pd(f), f.blockedOn === null && Mr.shift();
      }
    }
    var ur = A.ReactCurrentBatchConfig, St = !0;
    function Qn(e) {
      St = !!e;
    }
    function jn() {
      return St;
    }
    function or(e, t, a) {
      var i = lf(t), u;
      switch (i) {
        case Or:
          u = ma;
          break;
        case bi:
          u = Co;
          break;
        case Na:
        default:
          u = bn;
          break;
      }
      return u.bind(null, t, a, e);
    }
    function ma(e, t, a, i) {
      var u = za(), s = ur.transition;
      ur.transition = null;
      try {
        An(Or), bn(e, t, a, i);
      } finally {
        An(u), ur.transition = s;
      }
    }
    function Co(e, t, a, i) {
      var u = za(), s = ur.transition;
      ur.transition = null;
      try {
        An(bi), bn(e, t, a, i);
      } finally {
        An(u), ur.transition = s;
      }
    }
    function bn(e, t, a, i) {
      St && zs(e, t, a, i);
    }
    function zs(e, t, a, i) {
      var u = Ro(e, t, a, i);
      if (u === null) {
        Oy(e, t, i, ki, a), Hd(e, i);
        return;
      }
      if (dy(u, e, t, a, i)) {
        i.stopPropagation();
        return;
      }
      if (Hd(e, i), t & _a && th(e)) {
        for (; u !== null; ) {
          var s = ko(u);
          s !== null && fy(s);
          var f = Ro(e, t, a, i);
          if (f === null && Oy(e, t, i, ki, a), f === u)
            break;
          u = f;
        }
        u !== null && i.stopPropagation();
        return;
      }
      Oy(e, t, i, null, a);
    }
    var ki = null;
    function Ro(e, t, a, i) {
      ki = null;
      var u = pd(i), s = Is(u);
      if (s !== null) {
        var f = da(s);
        if (f === null)
          s = null;
        else {
          var p = f.tag;
          if (p === be) {
            var v = Ti(f);
            if (v !== null)
              return v;
            s = null;
          } else if (p === Z) {
            var y = f.stateNode;
            if (nf(y))
              return wi(f);
            s = null;
          } else f !== s && (s = null);
        }
      }
      return ki = s, null;
    }
    function lf(e) {
      switch (e) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return Or;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return bi;
        case "message": {
          var t = kc();
          switch (t) {
            case cs:
              return Or;
            case Ol:
              return bi;
            case Gi:
            case cy:
              return Na;
            case hu:
              return Ua;
            default:
              return Na;
          }
        }
        default:
          return Na;
      }
    }
    function As(e, t, a) {
      return e.addEventListener(t, a, !1), a;
    }
    function ta(e, t, a) {
      return e.addEventListener(t, a, !0), a;
    }
    function Bd(e, t, a, i) {
      return e.addEventListener(t, a, {
        capture: !0,
        passive: i
      }), a;
    }
    function To(e, t, a, i) {
      return e.addEventListener(t, a, {
        passive: i
      }), a;
    }
    var ya = null, wo = null, ku = null;
    function Al(e) {
      return ya = e, wo = js(), !0;
    }
    function uf() {
      ya = null, wo = null, ku = null;
    }
    function Ji() {
      if (ku)
        return ku;
      var e, t = wo, a = t.length, i, u = js(), s = u.length;
      for (e = 0; e < a && t[e] === u[e]; e++)
        ;
      var f = a - e;
      for (i = 1; i <= f && t[a - i] === u[s - i]; i++)
        ;
      var p = i > 1 ? 1 - i : void 0;
      return ku = u.slice(e, p), ku;
    }
    function js() {
      return "value" in ya ? ya.value : ya.textContent;
    }
    function jl(e) {
      var t, a = e.keyCode;
      return "charCode" in e ? (t = e.charCode, t === 0 && a === 13 && (t = 13)) : t = a, t === 10 && (t = 13), t >= 32 || t === 13 ? t : 0;
    }
    function xo() {
      return !0;
    }
    function Fs() {
      return !1;
    }
    function Tr(e) {
      function t(a, i, u, s, f) {
        this._reactName = a, this._targetInst = u, this.type = i, this.nativeEvent = s, this.target = f, this.currentTarget = null;
        for (var p in e)
          if (e.hasOwnProperty(p)) {
            var v = e[p];
            v ? this[p] = v(s) : this[p] = s[p];
          }
        var y = s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1;
        return y ? this.isDefaultPrevented = xo : this.isDefaultPrevented = Fs, this.isPropagationStopped = Fs, this;
      }
      return et(t.prototype, {
        preventDefault: function() {
          this.defaultPrevented = !0;
          var a = this.nativeEvent;
          a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = xo);
        },
        stopPropagation: function() {
          var a = this.nativeEvent;
          a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = xo);
        },
        /**
         * We release all dispatched `SyntheticEvent`s after each event loop, adding
         * them back into the pool. This allows a way to hold onto a reference that
         * won't be added back into the pool.
         */
        persist: function() {
        },
        /**
         * Checks if this event should be released back into the pool.
         *
         * @return {boolean} True if this should not be released, false otherwise.
         */
        isPersistent: xo
      }), t;
    }
    var Fn = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function(e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    }, Oi = Tr(Fn), Nr = et({}, Fn, {
      view: 0,
      detail: 0
    }), na = Tr(Nr), of, Hs, Ou;
    function vy(e) {
      e !== Ou && (Ou && e.type === "mousemove" ? (of = e.screenX - Ou.screenX, Hs = e.screenY - Ou.screenY) : (of = 0, Hs = 0), Ou = e);
    }
    var ii = et({}, Nr, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: dn,
      button: 0,
      buttons: 0,
      relatedTarget: function(e) {
        return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
      },
      movementX: function(e) {
        return "movementX" in e ? e.movementX : (vy(e), of);
      },
      movementY: function(e) {
        return "movementY" in e ? e.movementY : Hs;
      }
    }), $d = Tr(ii), Yd = et({}, ii, {
      dataTransfer: 0
    }), Lu = Tr(Yd), Id = et({}, Nr, {
      relatedTarget: 0
    }), Zi = Tr(Id), rh = et({}, Fn, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), ah = Tr(rh), Qd = et({}, Fn, {
      clipboardData: function(e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      }
    }), sf = Tr(Qd), hy = et({}, Fn, {
      data: 0
    }), ih = Tr(hy), lh = ih, uh = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, Mu = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    };
    function my(e) {
      if (e.key) {
        var t = uh[e.key] || e.key;
        if (t !== "Unidentified")
          return t;
      }
      if (e.type === "keypress") {
        var a = jl(e);
        return a === 13 ? "Enter" : String.fromCharCode(a);
      }
      return e.type === "keydown" || e.type === "keyup" ? Mu[e.keyCode] || "Unidentified" : "";
    }
    var bo = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    };
    function oh(e) {
      var t = this, a = t.nativeEvent;
      if (a.getModifierState)
        return a.getModifierState(e);
      var i = bo[e];
      return i ? !!a[i] : !1;
    }
    function dn(e) {
      return oh;
    }
    var yy = et({}, Nr, {
      key: my,
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: dn,
      // Legacy Interface
      charCode: function(e) {
        return e.type === "keypress" ? jl(e) : 0;
      },
      keyCode: function(e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function(e) {
        return e.type === "keypress" ? jl(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      }
    }), sh = Tr(yy), gy = et({}, ii, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    }), ch = Tr(gy), fh = et({}, Nr, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: dn
    }), dh = Tr(fh), Sy = et({}, Fn, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), Aa = Tr(Sy), Wd = et({}, ii, {
      deltaX: function(e) {
        return "deltaX" in e ? e.deltaX : (
          // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
          "wheelDeltaX" in e ? -e.wheelDeltaX : 0
        );
      },
      deltaY: function(e) {
        return "deltaY" in e ? e.deltaY : (
          // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
          "wheelDeltaY" in e ? -e.wheelDeltaY : (
            // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
            "wheelDelta" in e ? -e.wheelDelta : 0
          )
        );
      },
      deltaZ: 0,
      // Browsers without "deltaMode" is reporting in raw wheel delta where one
      // notch on the scroll is always +/- 120, roughly equivalent to pixels.
      // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
      // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
      deltaMode: 0
    }), Ey = Tr(Wd), Fl = [9, 13, 27, 32], Ps = 229, el = kn && "CompositionEvent" in window, Hl = null;
    kn && "documentMode" in document && (Hl = document.documentMode);
    var Gd = kn && "TextEvent" in window && !Hl, cf = kn && (!el || Hl && Hl > 8 && Hl <= 11), ph = 32, ff = String.fromCharCode(ph);
    function Cy() {
      ut("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), ut("onCompositionEnd", ["compositionend", "focusout", "keydown", "keypress", "keyup", "mousedown"]), ut("onCompositionStart", ["compositionstart", "focusout", "keydown", "keypress", "keyup", "mousedown"]), ut("onCompositionUpdate", ["compositionupdate", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
    }
    var qd = !1;
    function vh(e) {
      return (e.ctrlKey || e.altKey || e.metaKey) && // ctrlKey && altKey is equivalent to AltGr, and is not a command.
      !(e.ctrlKey && e.altKey);
    }
    function df(e) {
      switch (e) {
        case "compositionstart":
          return "onCompositionStart";
        case "compositionend":
          return "onCompositionEnd";
        case "compositionupdate":
          return "onCompositionUpdate";
      }
    }
    function pf(e, t) {
      return e === "keydown" && t.keyCode === Ps;
    }
    function Xd(e, t) {
      switch (e) {
        case "keyup":
          return Fl.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== Ps;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function vf(e) {
      var t = e.detail;
      return typeof t == "object" && "data" in t ? t.data : null;
    }
    function hh(e) {
      return e.locale === "ko";
    }
    var Nu = !1;
    function Kd(e, t, a, i, u) {
      var s, f;
      if (el ? s = df(t) : Nu ? Xd(t, i) && (s = "onCompositionEnd") : pf(t, i) && (s = "onCompositionStart"), !s)
        return null;
      cf && !hh(i) && (!Nu && s === "onCompositionStart" ? Nu = Al(u) : s === "onCompositionEnd" && Nu && (f = Ji()));
      var p = Rh(a, s);
      if (p.length > 0) {
        var v = new ih(s, t, null, i, u);
        if (e.push({
          event: v,
          listeners: p
        }), f)
          v.data = f;
        else {
          var y = vf(i);
          y !== null && (v.data = y);
        }
      }
    }
    function hf(e, t) {
      switch (e) {
        case "compositionend":
          return vf(t);
        case "keypress":
          var a = t.which;
          return a !== ph ? null : (qd = !0, ff);
        case "textInput":
          var i = t.data;
          return i === ff && qd ? null : i;
        default:
          return null;
      }
    }
    function Jd(e, t) {
      if (Nu) {
        if (e === "compositionend" || !el && Xd(e, t)) {
          var a = Ji();
          return uf(), Nu = !1, a;
        }
        return null;
      }
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (!vh(t)) {
            if (t.char && t.char.length > 1)
              return t.char;
            if (t.which)
              return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return cf && !hh(t) ? null : t.data;
        default:
          return null;
      }
    }
    function mf(e, t, a, i, u) {
      var s;
      if (Gd ? s = hf(t, i) : s = Jd(t, i), !s)
        return null;
      var f = Rh(a, "onBeforeInput");
      if (f.length > 0) {
        var p = new lh("onBeforeInput", "beforeinput", null, i, u);
        e.push({
          event: p,
          listeners: f
        }), p.data = s;
      }
    }
    function mh(e, t, a, i, u, s, f) {
      Kd(e, t, a, i, u), mf(e, t, a, i, u);
    }
    var Ry = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0
    };
    function Vs(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!Ry[e.type] : t === "textarea";
    }
    /**
     * Checks if an event is supported in the current execution environment.
     *
     * NOTE: This will not work correctly for non-generic events such as `change`,
     * `reset`, `load`, `error`, and `select`.
     *
     * Borrows from Modernizr.
     *
     * @param {string} eventNameSuffix Event name, e.g. "click".
     * @return {boolean} True if the event is supported.
     * @internal
     * @license Modernizr 3.0.0pre (Custom Build) | MIT
     */
    function Ty(e) {
      if (!kn)
        return !1;
      var t = "on" + e, a = t in document;
      if (!a) {
        var i = document.createElement("div");
        i.setAttribute(t, "return;"), a = typeof i[t] == "function";
      }
      return a;
    }
    function Bs() {
      ut("onChange", ["change", "click", "focusin", "focusout", "input", "keydown", "keyup", "selectionchange"]);
    }
    function yh(e, t, a, i) {
      oo(i);
      var u = Rh(t, "onChange");
      if (u.length > 0) {
        var s = new Oi("onChange", "change", null, a, i);
        e.push({
          event: s,
          listeners: u
        });
      }
    }
    var Pl = null, n = null;
    function r(e) {
      var t = e.nodeName && e.nodeName.toLowerCase();
      return t === "select" || t === "input" && e.type === "file";
    }
    function l(e) {
      var t = [];
      yh(t, n, e, pd(e)), kv(o, t);
    }
    function o(e) {
      OE(e, 0);
    }
    function c(e) {
      var t = Rf(e);
      if (yi(t))
        return e;
    }
    function d(e, t) {
      if (e === "change")
        return t;
    }
    var m = !1;
    kn && (m = Ty("input") && (!document.documentMode || document.documentMode > 9));
    function E(e, t) {
      Pl = e, n = t, Pl.attachEvent("onpropertychange", U);
    }
    function T() {
      Pl && (Pl.detachEvent("onpropertychange", U), Pl = null, n = null);
    }
    function U(e) {
      e.propertyName === "value" && c(n) && l(e);
    }
    function Q(e, t, a) {
      e === "focusin" ? (T(), E(t, a)) : e === "focusout" && T();
    }
    function G(e, t) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return c(n);
    }
    function I(e) {
      var t = e.nodeName;
      return t && t.toLowerCase() === "input" && (e.type === "checkbox" || e.type === "radio");
    }
    function ce(e, t) {
      if (e === "click")
        return c(t);
    }
    function me(e, t) {
      if (e === "input" || e === "change")
        return c(t);
    }
    function Ee(e) {
      var t = e._wrapperState;
      !t || !t.controlled || e.type !== "number" || Oe(e, "number", e.value);
    }
    function _n(e, t, a, i, u, s, f) {
      var p = a ? Rf(a) : window, v, y;
      if (r(p) ? v = d : Vs(p) ? m ? v = me : (v = G, y = Q) : I(p) && (v = ce), v) {
        var g = v(t, a);
        if (g) {
          yh(e, g, i, u);
          return;
        }
      }
      y && y(t, p, a), t === "focusout" && Ee(p);
    }
    function D() {
      Vt("onMouseEnter", ["mouseout", "mouseover"]), Vt("onMouseLeave", ["mouseout", "mouseover"]), Vt("onPointerEnter", ["pointerout", "pointerover"]), Vt("onPointerLeave", ["pointerout", "pointerover"]);
    }
    function x(e, t, a, i, u, s, f) {
      var p = t === "mouseover" || t === "pointerover", v = t === "mouseout" || t === "pointerout";
      if (p && !as(i)) {
        var y = i.relatedTarget || i.fromElement;
        if (y && (Is(y) || dp(y)))
          return;
      }
      if (!(!v && !p)) {
        var g;
        if (u.window === u)
          g = u;
        else {
          var b = u.ownerDocument;
          b ? g = b.defaultView || b.parentWindow : g = window;
        }
        var w, M;
        if (v) {
          var z = i.relatedTarget || i.toElement;
          if (w = a, M = z ? Is(z) : null, M !== null) {
            var F = da(M);
            (M !== F || M.tag !== ie && M.tag !== je) && (M = null);
          }
        } else
          w = null, M = a;
        if (w !== M) {
          var ue = $d, Le = "onMouseLeave", we = "onMouseEnter", Ct = "mouse";
          (t === "pointerout" || t === "pointerover") && (ue = ch, Le = "onPointerLeave", we = "onPointerEnter", Ct = "pointer");
          var mt = w == null ? g : Rf(w), k = M == null ? g : Rf(M), H = new ue(Le, Ct + "leave", w, i, u);
          H.target = mt, H.relatedTarget = k;
          var O = null, q = Is(u);
          if (q === a) {
            var pe = new ue(we, Ct + "enter", M, i, u);
            pe.target = k, pe.relatedTarget = mt, O = pe;
          }
          kT(e, H, O, w, M);
        }
      }
    }
    function L(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    var W = typeof Object.is == "function" ? Object.is : L;
    function ye(e, t) {
      if (W(e, t))
        return !0;
      if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1;
      var a = Object.keys(e), i = Object.keys(t);
      if (a.length !== i.length)
        return !1;
      for (var u = 0; u < a.length; u++) {
        var s = a[u];
        if (!wr.call(t, s) || !W(e[s], t[s]))
          return !1;
      }
      return !0;
    }
    function Me(e) {
      for (; e && e.firstChild; )
        e = e.firstChild;
      return e;
    }
    function Ue(e) {
      for (; e; ) {
        if (e.nextSibling)
          return e.nextSibling;
        e = e.parentNode;
      }
    }
    function Ve(e, t) {
      for (var a = Me(e), i = 0, u = 0; a; ) {
        if (a.nodeType === $i) {
          if (u = i + a.textContent.length, i <= t && u >= t)
            return {
              node: a,
              offset: t - i
            };
          i = u;
        }
        a = Me(Ue(a));
      }
    }
    function Zn(e) {
      var t = e.ownerDocument, a = t && t.defaultView || window, i = a.getSelection && a.getSelection();
      if (!i || i.rangeCount === 0)
        return null;
      var u = i.anchorNode, s = i.anchorOffset, f = i.focusNode, p = i.focusOffset;
      try {
        u.nodeType, f.nodeType;
      } catch {
        return null;
      }
      return Mt(e, u, s, f, p);
    }
    function Mt(e, t, a, i, u) {
      var s = 0, f = -1, p = -1, v = 0, y = 0, g = e, b = null;
      e: for (; ; ) {
        for (var w = null; g === t && (a === 0 || g.nodeType === $i) && (f = s + a), g === i && (u === 0 || g.nodeType === $i) && (p = s + u), g.nodeType === $i && (s += g.nodeValue.length), (w = g.firstChild) !== null; )
          b = g, g = w;
        for (; ; ) {
          if (g === e)
            break e;
          if (b === t && ++v === a && (f = s), b === i && ++y === u && (p = s), (w = g.nextSibling) !== null)
            break;
          g = b, b = g.parentNode;
        }
        g = w;
      }
      return f === -1 || p === -1 ? null : {
        start: f,
        end: p
      };
    }
    function Vl(e, t) {
      var a = e.ownerDocument || document, i = a && a.defaultView || window;
      if (i.getSelection) {
        var u = i.getSelection(), s = e.textContent.length, f = Math.min(t.start, s), p = t.end === void 0 ? f : Math.min(t.end, s);
        if (!u.extend && f > p) {
          var v = p;
          p = f, f = v;
        }
        var y = Ve(e, f), g = Ve(e, p);
        if (y && g) {
          if (u.rangeCount === 1 && u.anchorNode === y.node && u.anchorOffset === y.offset && u.focusNode === g.node && u.focusOffset === g.offset)
            return;
          var b = a.createRange();
          b.setStart(y.node, y.offset), u.removeAllRanges(), f > p ? (u.addRange(b), u.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), u.addRange(b));
        }
      }
    }
    function gh(e) {
      return e && e.nodeType === $i;
    }
    function SE(e, t) {
      return !e || !t ? !1 : e === t ? !0 : gh(e) ? !1 : gh(t) ? SE(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1;
    }
    function fT(e) {
      return e && e.ownerDocument && SE(e.ownerDocument.documentElement, e);
    }
    function dT(e) {
      try {
        return typeof e.contentWindow.location.href == "string";
      } catch {
        return !1;
      }
    }
    function EE() {
      for (var e = window, t = ba(); t instanceof e.HTMLIFrameElement; ) {
        if (dT(t))
          e = t.contentWindow;
        else
          return t;
        t = ba(e.document);
      }
      return t;
    }
    function wy(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
    }
    function pT() {
      var e = EE();
      return {
        focusedElem: e,
        selectionRange: wy(e) ? hT(e) : null
      };
    }
    function vT(e) {
      var t = EE(), a = e.focusedElem, i = e.selectionRange;
      if (t !== a && fT(a)) {
        i !== null && wy(a) && mT(a, i);
        for (var u = [], s = a; s = s.parentNode; )
          s.nodeType === Qr && u.push({
            element: s,
            left: s.scrollLeft,
            top: s.scrollTop
          });
        typeof a.focus == "function" && a.focus();
        for (var f = 0; f < u.length; f++) {
          var p = u[f];
          p.element.scrollLeft = p.left, p.element.scrollTop = p.top;
        }
      }
    }
    function hT(e) {
      var t;
      return "selectionStart" in e ? t = {
        start: e.selectionStart,
        end: e.selectionEnd
      } : t = Zn(e), t || {
        start: 0,
        end: 0
      };
    }
    function mT(e, t) {
      var a = t.start, i = t.end;
      i === void 0 && (i = a), "selectionStart" in e ? (e.selectionStart = a, e.selectionEnd = Math.min(i, e.value.length)) : Vl(e, t);
    }
    var yT = kn && "documentMode" in document && document.documentMode <= 11;
    function gT() {
      ut("onSelect", ["focusout", "contextmenu", "dragend", "focusin", "keydown", "keyup", "mousedown", "mouseup", "selectionchange"]);
    }
    var yf = null, xy = null, Zd = null, by = !1;
    function ST(e) {
      if ("selectionStart" in e && wy(e))
        return {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      var t = e.ownerDocument && e.ownerDocument.defaultView || window, a = t.getSelection();
      return {
        anchorNode: a.anchorNode,
        anchorOffset: a.anchorOffset,
        focusNode: a.focusNode,
        focusOffset: a.focusOffset
      };
    }
    function ET(e) {
      return e.window === e ? e.document : e.nodeType === Yi ? e : e.ownerDocument;
    }
    function CE(e, t, a) {
      var i = ET(a);
      if (!(by || yf == null || yf !== ba(i))) {
        var u = ST(yf);
        if (!Zd || !ye(Zd, u)) {
          Zd = u;
          var s = Rh(xy, "onSelect");
          if (s.length > 0) {
            var f = new Oi("onSelect", "select", null, t, a);
            e.push({
              event: f,
              listeners: s
            }), f.target = yf;
          }
        }
      }
    }
    function CT(e, t, a, i, u, s, f) {
      var p = a ? Rf(a) : window;
      switch (t) {
        case "focusin":
          (Vs(p) || p.contentEditable === "true") && (yf = p, xy = a, Zd = null);
          break;
        case "focusout":
          yf = null, xy = null, Zd = null;
          break;
        case "mousedown":
          by = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          by = !1, CE(e, i, u);
          break;
        case "selectionchange":
          if (yT)
            break;
        case "keydown":
        case "keyup":
          CE(e, i, u);
      }
    }
    function Sh(e, t) {
      var a = {};
      return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
    }
    var gf = {
      animationend: Sh("Animation", "AnimationEnd"),
      animationiteration: Sh("Animation", "AnimationIteration"),
      animationstart: Sh("Animation", "AnimationStart"),
      transitionend: Sh("Transition", "TransitionEnd")
    }, _y = {}, RE = {};
    kn && (RE = document.createElement("div").style, "AnimationEvent" in window || (delete gf.animationend.animation, delete gf.animationiteration.animation, delete gf.animationstart.animation), "TransitionEvent" in window || delete gf.transitionend.transition);
    function Eh(e) {
      if (_y[e])
        return _y[e];
      if (!gf[e])
        return e;
      var t = gf[e];
      for (var a in t)
        if (t.hasOwnProperty(a) && a in RE)
          return _y[e] = t[a];
      return e;
    }
    var TE = Eh("animationend"), wE = Eh("animationiteration"), xE = Eh("animationstart"), bE = Eh("transitionend"), _E = /* @__PURE__ */ new Map(), DE = ["abort", "auxClick", "cancel", "canPlay", "canPlayThrough", "click", "close", "contextMenu", "copy", "cut", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "gotPointerCapture", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "lostPointerCapture", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "pointerCancel", "pointerDown", "pointerMove", "pointerOut", "pointerOver", "pointerUp", "progress", "rateChange", "reset", "resize", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "touchCancel", "touchEnd", "touchStart", "volumeChange", "scroll", "toggle", "touchMove", "waiting", "wheel"];
    function _o(e, t) {
      _E.set(e, t), ut(t, [e]);
    }
    function RT() {
      for (var e = 0; e < DE.length; e++) {
        var t = DE[e], a = t.toLowerCase(), i = t[0].toUpperCase() + t.slice(1);
        _o(a, "on" + i);
      }
      _o(TE, "onAnimationEnd"), _o(wE, "onAnimationIteration"), _o(xE, "onAnimationStart"), _o("dblclick", "onDoubleClick"), _o("focusin", "onFocus"), _o("focusout", "onBlur"), _o(bE, "onTransitionEnd");
    }
    function TT(e, t, a, i, u, s, f) {
      var p = _E.get(t);
      if (p !== void 0) {
        var v = Oi, y = t;
        switch (t) {
          case "keypress":
            if (jl(i) === 0)
              return;
          case "keydown":
          case "keyup":
            v = sh;
            break;
          case "focusin":
            y = "focus", v = Zi;
            break;
          case "focusout":
            y = "blur", v = Zi;
            break;
          case "beforeblur":
          case "afterblur":
            v = Zi;
            break;
          case "click":
            if (i.button === 2)
              return;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = $d;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Lu;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = dh;
            break;
          case TE:
          case wE:
          case xE:
            v = ah;
            break;
          case bE:
            v = Aa;
            break;
          case "scroll":
            v = na;
            break;
          case "wheel":
            v = Ey;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = sf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = ch;
            break;
        }
        var g = (s & _a) !== 0;
        {
          var b = !g && // TODO: ideally, we'd eventually add all events from
          // nonDelegatedEvents list in DOMPluginEventSystem.
          // Then we can remove this special list.
          // This is a breaking change that can wait until React 18.
          t === "scroll", w = _T(a, p, i.type, g, b);
          if (w.length > 0) {
            var M = new v(p, y, null, i, u);
            e.push({
              event: M,
              listeners: w
            });
          }
        }
      }
    }
    RT(), D(), Bs(), gT(), Cy();
    function wT(e, t, a, i, u, s, f) {
      TT(e, t, a, i, u, s);
      var p = (s & dd) === 0;
      p && (x(e, t, a, i, u), _n(e, t, a, i, u), CT(e, t, a, i, u), mh(e, t, a, i, u));
    }
    var ep = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "resize", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"], Dy = new Set(["cancel", "close", "invalid", "load", "scroll", "toggle"].concat(ep));
    function kE(e, t, a) {
      var i = e.type || "unknown-event";
      e.currentTarget = a, Ei(i, t, void 0, e), e.currentTarget = null;
    }
    function xT(e, t, a) {
      var i;
      if (a)
        for (var u = t.length - 1; u >= 0; u--) {
          var s = t[u], f = s.instance, p = s.currentTarget, v = s.listener;
          if (f !== i && e.isPropagationStopped())
            return;
          kE(e, v, p), i = f;
        }
      else
        for (var y = 0; y < t.length; y++) {
          var g = t[y], b = g.instance, w = g.currentTarget, M = g.listener;
          if (b !== i && e.isPropagationStopped())
            return;
          kE(e, M, w), i = b;
        }
    }
    function OE(e, t) {
      for (var a = (t & _a) !== 0, i = 0; i < e.length; i++) {
        var u = e[i], s = u.event, f = u.listeners;
        xT(s, f, a);
      }
      us();
    }
    function bT(e, t, a, i, u) {
      var s = pd(a), f = [];
      wT(f, e, i, a, s, t), OE(f, t);
    }
    function gn(e, t) {
      Dy.has(e) || S('Did not expect a listenToNonDelegatedEvent() call for "%s". This is a bug in React. Please file an issue.', e);
      var a = !1, i = nw(t), u = OT(e);
      i.has(u) || (LE(t, e, mc, a), i.add(u));
    }
    function ky(e, t, a) {
      Dy.has(e) && !t && S('Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. This is a bug in React. Please file an issue.', e);
      var i = 0;
      t && (i |= _a), LE(a, e, i, t);
    }
    var Ch = "_reactListening" + Math.random().toString(36).slice(2);
    function tp(e) {
      if (!e[Ch]) {
        e[Ch] = !0, tt.forEach(function(a) {
          a !== "selectionchange" && (Dy.has(a) || ky(a, !1, e), ky(a, !0, e));
        });
        var t = e.nodeType === Yi ? e : e.ownerDocument;
        t !== null && (t[Ch] || (t[Ch] = !0, ky("selectionchange", !1, t)));
      }
    }
    function LE(e, t, a, i, u) {
      var s = or(e, t, a), f = void 0;
      ls && (t === "touchstart" || t === "touchmove" || t === "wheel") && (f = !0), e = e, i ? f !== void 0 ? Bd(e, t, s, f) : ta(e, t, s) : f !== void 0 ? To(e, t, s, f) : As(e, t, s);
    }
    function ME(e, t) {
      return e === t || e.nodeType === Ln && e.parentNode === t;
    }
    function Oy(e, t, a, i, u) {
      var s = i;
      if (!(t & fd) && !(t & mc)) {
        var f = u;
        if (i !== null) {
          var p = i;
          e: for (; ; ) {
            if (p === null)
              return;
            var v = p.tag;
            if (v === Z || v === Se) {
              var y = p.stateNode.containerInfo;
              if (ME(y, f))
                break;
              if (v === Se)
                for (var g = p.return; g !== null; ) {
                  var b = g.tag;
                  if (b === Z || b === Se) {
                    var w = g.stateNode.containerInfo;
                    if (ME(w, f))
                      return;
                  }
                  g = g.return;
                }
              for (; y !== null; ) {
                var M = Is(y);
                if (M === null)
                  return;
                var z = M.tag;
                if (z === ie || z === je) {
                  p = s = M;
                  continue e;
                }
                y = y.parentNode;
              }
            }
            p = p.return;
          }
        }
      }
      kv(function() {
        return bT(e, t, a, s);
      });
    }
    function np(e, t, a) {
      return {
        instance: e,
        listener: t,
        currentTarget: a
      };
    }
    function _T(e, t, a, i, u, s) {
      for (var f = t !== null ? t + "Capture" : null, p = i ? f : t, v = [], y = e, g = null; y !== null; ) {
        var b = y, w = b.stateNode, M = b.tag;
        if (M === ie && w !== null && (g = w, p !== null)) {
          var z = wl(y, p);
          z != null && v.push(np(y, z, g));
        }
        if (u)
          break;
        y = y.return;
      }
      return v;
    }
    function Rh(e, t) {
      for (var a = t + "Capture", i = [], u = e; u !== null; ) {
        var s = u, f = s.stateNode, p = s.tag;
        if (p === ie && f !== null) {
          var v = f, y = wl(u, a);
          y != null && i.unshift(np(u, y, v));
          var g = wl(u, t);
          g != null && i.push(np(u, g, v));
        }
        u = u.return;
      }
      return i;
    }
    function Sf(e) {
      if (e === null)
        return null;
      do
        e = e.return;
      while (e && e.tag !== ie);
      return e || null;
    }
    function DT(e, t) {
      for (var a = e, i = t, u = 0, s = a; s; s = Sf(s))
        u++;
      for (var f = 0, p = i; p; p = Sf(p))
        f++;
      for (; u - f > 0; )
        a = Sf(a), u--;
      for (; f - u > 0; )
        i = Sf(i), f--;
      for (var v = u; v--; ) {
        if (a === i || i !== null && a === i.alternate)
          return a;
        a = Sf(a), i = Sf(i);
      }
      return null;
    }
    function NE(e, t, a, i, u) {
      for (var s = t._reactName, f = [], p = a; p !== null && p !== i; ) {
        var v = p, y = v.alternate, g = v.stateNode, b = v.tag;
        if (y !== null && y === i)
          break;
        if (b === ie && g !== null) {
          var w = g;
          if (u) {
            var M = wl(p, s);
            M != null && f.unshift(np(p, M, w));
          } else if (!u) {
            var z = wl(p, s);
            z != null && f.push(np(p, z, w));
          }
        }
        p = p.return;
      }
      f.length !== 0 && e.push({
        event: t,
        listeners: f
      });
    }
    function kT(e, t, a, i, u) {
      var s = i && u ? DT(i, u) : null;
      i !== null && NE(e, t, i, s, !1), u !== null && a !== null && NE(e, a, u, s, !0);
    }
    function OT(e, t) {
      return e + "__bubble";
    }
    var ja = !1, rp = "dangerouslySetInnerHTML", Th = "suppressContentEditableWarning", Do = "suppressHydrationWarning", UE = "autoFocus", $s = "children", Ys = "style", wh = "__html", Ly, xh, ap, zE, bh, AE, jE;
    Ly = {
      // There are working polyfills for <dialog>. Let people use it.
      dialog: !0,
      // Electron ships a custom <webview> tag to display external web content in
      // an isolated frame and process.
      // This tag is not present in non Electron environments such as JSDom which
      // is often used for testing purposes.
      // @see https://electronjs.org/docs/api/webview-tag
      webview: !0
    }, xh = function(e, t) {
      od(e, t), vc(e, t), bv(e, t, {
        registrationNameDependencies: Ze,
        possibleRegistrationNames: nt
      });
    }, AE = kn && !document.documentMode, ap = function(e, t, a) {
      if (!ja) {
        var i = _h(a), u = _h(t);
        u !== i && (ja = !0, S("Prop `%s` did not match. Server: %s Client: %s", e, JSON.stringify(u), JSON.stringify(i)));
      }
    }, zE = function(e) {
      if (!ja) {
        ja = !0;
        var t = [];
        e.forEach(function(a) {
          t.push(a);
        }), S("Extra attributes from the server: %s", t);
      }
    }, bh = function(e, t) {
      t === !1 ? S("Expected `%s` listener to be a function, instead got `false`.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.", e, e, e) : S("Expected `%s` listener to be a function, instead got a value of `%s` type.", e, typeof t);
    }, jE = function(e, t) {
      var a = e.namespaceURI === Bi ? e.ownerDocument.createElement(e.tagName) : e.ownerDocument.createElementNS(e.namespaceURI, e.tagName);
      return a.innerHTML = t, a.innerHTML;
    };
    var LT = /\r\n?/g, MT = /\u0000|\uFFFD/g;
    function _h(e) {
      Gn(e);
      var t = typeof e == "string" ? e : "" + e;
      return t.replace(LT, `
`).replace(MT, "");
    }
    function Dh(e, t, a, i) {
      var u = _h(t), s = _h(e);
      if (s !== u && (i && (ja || (ja = !0, S('Text content did not match. Server: "%s" Client: "%s"', s, u))), a && Ce))
        throw new Error("Text content does not match server-rendered HTML.");
    }
    function FE(e) {
      return e.nodeType === Yi ? e : e.ownerDocument;
    }
    function NT() {
    }
    function kh(e) {
      e.onclick = NT;
    }
    function UT(e, t, a, i, u) {
      for (var s in i)
        if (i.hasOwnProperty(s)) {
          var f = i[s];
          if (s === Ys)
            f && Object.freeze(f), Ev(t, f);
          else if (s === rp) {
            var p = f ? f[wh] : void 0;
            p != null && ov(t, p);
          } else if (s === $s)
            if (typeof f == "string") {
              var v = e !== "textarea" || f !== "";
              v && ao(t, f);
            } else typeof f == "number" && ao(t, "" + f);
          else s === Th || s === Do || s === UE || (Ze.hasOwnProperty(s) ? f != null && (typeof f != "function" && bh(s, f), s === "onScroll" && gn("scroll", t)) : f != null && xr(t, s, f, u));
        }
    }
    function zT(e, t, a, i) {
      for (var u = 0; u < t.length; u += 2) {
        var s = t[u], f = t[u + 1];
        s === Ys ? Ev(e, f) : s === rp ? ov(e, f) : s === $s ? ao(e, f) : xr(e, s, f, i);
      }
    }
    function AT(e, t, a, i) {
      var u, s = FE(a), f, p = i;
      if (p === Bi && (p = td(e)), p === Bi) {
        if (u = Rl(e, t), !u && e !== e.toLowerCase() && S("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", e), e === "script") {
          var v = s.createElement("div");
          v.innerHTML = "<script><\/script>";
          var y = v.firstChild;
          f = v.removeChild(y);
        } else if (typeof t.is == "string")
          f = s.createElement(e, {
            is: t.is
          });
        else if (f = s.createElement(e), e === "select") {
          var g = f;
          t.multiple ? g.multiple = !0 : t.size && (g.size = t.size);
        }
      } else
        f = s.createElementNS(p, e);
      return p === Bi && !u && Object.prototype.toString.call(f) === "[object HTMLUnknownElement]" && !wr.call(Ly, e) && (Ly[e] = !0, S("The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.", e)), f;
    }
    function jT(e, t) {
      return FE(t).createTextNode(e);
    }
    function FT(e, t, a, i) {
      var u = Rl(t, a);
      xh(t, a);
      var s;
      switch (t) {
        case "dialog":
          gn("cancel", e), gn("close", e), s = a;
          break;
        case "iframe":
        case "object":
        case "embed":
          gn("load", e), s = a;
          break;
        case "video":
        case "audio":
          for (var f = 0; f < ep.length; f++)
            gn(ep[f], e);
          s = a;
          break;
        case "source":
          gn("error", e), s = a;
          break;
        case "img":
        case "image":
        case "link":
          gn("error", e), gn("load", e), s = a;
          break;
        case "details":
          gn("toggle", e), s = a;
          break;
        case "input":
          Za(e, a), s = ro(e, a), gn("invalid", e);
          break;
        case "option":
          Tt(e, a), s = a;
          break;
        case "select":
          uu(e, a), s = Ko(e, a), gn("invalid", e);
          break;
        case "textarea":
          Jf(e, a), s = Kf(e, a), gn("invalid", e);
          break;
        default:
          s = a;
      }
      switch (dc(t, s), UT(t, e, i, s, u), t) {
        case "input":
          Ja(e), N(e, a, !1);
          break;
        case "textarea":
          Ja(e), lv(e);
          break;
        case "option":
          nn(e, a);
          break;
        case "select":
          qf(e, a);
          break;
        default:
          typeof s.onClick == "function" && kh(e);
          break;
      }
    }
    function HT(e, t, a, i, u) {
      xh(t, i);
      var s = null, f, p;
      switch (t) {
        case "input":
          f = ro(e, a), p = ro(e, i), s = [];
          break;
        case "select":
          f = Ko(e, a), p = Ko(e, i), s = [];
          break;
        case "textarea":
          f = Kf(e, a), p = Kf(e, i), s = [];
          break;
        default:
          f = a, p = i, typeof f.onClick != "function" && typeof p.onClick == "function" && kh(e);
          break;
      }
      dc(t, p);
      var v, y, g = null;
      for (v in f)
        if (!(p.hasOwnProperty(v) || !f.hasOwnProperty(v) || f[v] == null))
          if (v === Ys) {
            var b = f[v];
            for (y in b)
              b.hasOwnProperty(y) && (g || (g = {}), g[y] = "");
          } else v === rp || v === $s || v === Th || v === Do || v === UE || (Ze.hasOwnProperty(v) ? s || (s = []) : (s = s || []).push(v, null));
      for (v in p) {
        var w = p[v], M = f != null ? f[v] : void 0;
        if (!(!p.hasOwnProperty(v) || w === M || w == null && M == null))
          if (v === Ys)
            if (w && Object.freeze(w), M) {
              for (y in M)
                M.hasOwnProperty(y) && (!w || !w.hasOwnProperty(y)) && (g || (g = {}), g[y] = "");
              for (y in w)
                w.hasOwnProperty(y) && M[y] !== w[y] && (g || (g = {}), g[y] = w[y]);
            } else
              g || (s || (s = []), s.push(v, g)), g = w;
          else if (v === rp) {
            var z = w ? w[wh] : void 0, F = M ? M[wh] : void 0;
            z != null && F !== z && (s = s || []).push(v, z);
          } else v === $s ? (typeof w == "string" || typeof w == "number") && (s = s || []).push(v, "" + w) : v === Th || v === Do || (Ze.hasOwnProperty(v) ? (w != null && (typeof w != "function" && bh(v, w), v === "onScroll" && gn("scroll", e)), !s && M !== w && (s = [])) : (s = s || []).push(v, w));
      }
      return g && (ay(g, p[Ys]), (s = s || []).push(Ys, g)), s;
    }
    function PT(e, t, a, i, u) {
      a === "input" && u.type === "radio" && u.name != null && h(e, u);
      var s = Rl(a, i), f = Rl(a, u);
      switch (zT(e, t, s, f), a) {
        case "input":
          C(e, u);
          break;
        case "textarea":
          iv(e, u);
          break;
        case "select":
          sc(e, u);
          break;
      }
    }
    function VT(e) {
      {
        var t = e.toLowerCase();
        return ns.hasOwnProperty(t) && ns[t] || null;
      }
    }
    function BT(e, t, a, i, u, s, f) {
      var p, v;
      switch (p = Rl(t, a), xh(t, a), t) {
        case "dialog":
          gn("cancel", e), gn("close", e);
          break;
        case "iframe":
        case "object":
        case "embed":
          gn("load", e);
          break;
        case "video":
        case "audio":
          for (var y = 0; y < ep.length; y++)
            gn(ep[y], e);
          break;
        case "source":
          gn("error", e);
          break;
        case "img":
        case "image":
        case "link":
          gn("error", e), gn("load", e);
          break;
        case "details":
          gn("toggle", e);
          break;
        case "input":
          Za(e, a), gn("invalid", e);
          break;
        case "option":
          Tt(e, a);
          break;
        case "select":
          uu(e, a), gn("invalid", e);
          break;
        case "textarea":
          Jf(e, a), gn("invalid", e);
          break;
      }
      dc(t, a);
      {
        v = /* @__PURE__ */ new Set();
        for (var g = e.attributes, b = 0; b < g.length; b++) {
          var w = g[b].name.toLowerCase();
          switch (w) {
            case "value":
              break;
            case "checked":
              break;
            case "selected":
              break;
            default:
              v.add(g[b].name);
          }
        }
      }
      var M = null;
      for (var z in a)
        if (a.hasOwnProperty(z)) {
          var F = a[z];
          if (z === $s)
            typeof F == "string" ? e.textContent !== F && (a[Do] !== !0 && Dh(e.textContent, F, s, f), M = [$s, F]) : typeof F == "number" && e.textContent !== "" + F && (a[Do] !== !0 && Dh(e.textContent, F, s, f), M = [$s, "" + F]);
          else if (Ze.hasOwnProperty(z))
            F != null && (typeof F != "function" && bh(z, F), z === "onScroll" && gn("scroll", e));
          else if (f && // Convince Flow we've calculated it (it's DEV-only in this method.)
          typeof p == "boolean") {
            var ue = void 0, Le = en(z);
            if (a[Do] !== !0) {
              if (!(z === Th || z === Do || // Controlled attributes are not validated
              // TODO: Only ignore them on controlled tags.
              z === "value" || z === "checked" || z === "selected")) {
                if (z === rp) {
                  var we = e.innerHTML, Ct = F ? F[wh] : void 0;
                  if (Ct != null) {
                    var mt = jE(e, Ct);
                    mt !== we && ap(z, we, mt);
                  }
                } else if (z === Ys) {
                  if (v.delete(z), AE) {
                    var k = ny(F);
                    ue = e.getAttribute("style"), k !== ue && ap(z, ue, k);
                  }
                } else if (p && !_)
                  v.delete(z.toLowerCase()), ue = eu(e, z, F), F !== ue && ap(z, ue, F);
                else if (!pn(z, Le, p) && !qn(z, F, Le, p)) {
                  var H = !1;
                  if (Le !== null)
                    v.delete(Le.attributeName), ue = pl(e, z, F, Le);
                  else {
                    var O = i;
                    if (O === Bi && (O = td(t)), O === Bi)
                      v.delete(z.toLowerCase());
                    else {
                      var q = VT(z);
                      q !== null && q !== z && (H = !0, v.delete(q)), v.delete(z);
                    }
                    ue = eu(e, z, F);
                  }
                  var pe = _;
                  !pe && F !== ue && !H && ap(z, ue, F);
                }
              }
            }
          }
        }
      switch (f && // $FlowFixMe - Should be inferred as not undefined.
      v.size > 0 && a[Do] !== !0 && zE(v), t) {
        case "input":
          Ja(e), N(e, a, !0);
          break;
        case "textarea":
          Ja(e), lv(e);
          break;
        case "select":
        case "option":
          break;
        default:
          typeof a.onClick == "function" && kh(e);
          break;
      }
      return M;
    }
    function $T(e, t, a) {
      var i = e.nodeValue !== t;
      return i;
    }
    function My(e, t) {
      {
        if (ja)
          return;
        ja = !0, S("Did not expect server HTML to contain a <%s> in <%s>.", t.nodeName.toLowerCase(), e.nodeName.toLowerCase());
      }
    }
    function Ny(e, t) {
      {
        if (ja)
          return;
        ja = !0, S('Did not expect server HTML to contain the text node "%s" in <%s>.', t.nodeValue, e.nodeName.toLowerCase());
      }
    }
    function Uy(e, t, a) {
      {
        if (ja)
          return;
        ja = !0, S("Expected server HTML to contain a matching <%s> in <%s>.", t, e.nodeName.toLowerCase());
      }
    }
    function zy(e, t) {
      {
        if (t === "" || ja)
          return;
        ja = !0, S('Expected server HTML to contain a matching text node for "%s" in <%s>.', t, e.nodeName.toLowerCase());
      }
    }
    function YT(e, t, a) {
      switch (t) {
        case "input":
          j(e, a);
          return;
        case "textarea":
          Jm(e, a);
          return;
        case "select":
          Xf(e, a);
          return;
      }
    }
    var ip = function() {
    }, lp = function() {
    };
    {
      var IT = ["address", "applet", "area", "article", "aside", "base", "basefont", "bgsound", "blockquote", "body", "br", "button", "caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "img", "input", "isindex", "li", "link", "listing", "main", "marquee", "menu", "menuitem", "meta", "nav", "noembed", "noframes", "noscript", "object", "ol", "p", "param", "plaintext", "pre", "script", "section", "select", "source", "style", "summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "title", "tr", "track", "ul", "wbr", "xmp"], HE = [
        "applet",
        "caption",
        "html",
        "table",
        "td",
        "th",
        "marquee",
        "object",
        "template",
        // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
        // TODO: Distinguish by namespace here -- for <title>, including it here
        // errs on the side of fewer warnings
        "foreignObject",
        "desc",
        "title"
      ], QT = HE.concat(["button"]), WT = ["dd", "dt", "li", "option", "optgroup", "p", "rp", "rt"], PE = {
        current: null,
        formTag: null,
        aTagInScope: null,
        buttonTagInScope: null,
        nobrTagInScope: null,
        pTagInButtonScope: null,
        listItemTagAutoclosing: null,
        dlItemTagAutoclosing: null
      };
      lp = function(e, t) {
        var a = et({}, e || PE), i = {
          tag: t
        };
        return HE.indexOf(t) !== -1 && (a.aTagInScope = null, a.buttonTagInScope = null, a.nobrTagInScope = null), QT.indexOf(t) !== -1 && (a.pTagInButtonScope = null), IT.indexOf(t) !== -1 && t !== "address" && t !== "div" && t !== "p" && (a.listItemTagAutoclosing = null, a.dlItemTagAutoclosing = null), a.current = i, t === "form" && (a.formTag = i), t === "a" && (a.aTagInScope = i), t === "button" && (a.buttonTagInScope = i), t === "nobr" && (a.nobrTagInScope = i), t === "p" && (a.pTagInButtonScope = i), t === "li" && (a.listItemTagAutoclosing = i), (t === "dd" || t === "dt") && (a.dlItemTagAutoclosing = i), a;
      };
      var GT = function(e, t) {
        switch (t) {
          case "select":
            return e === "option" || e === "optgroup" || e === "#text";
          case "optgroup":
            return e === "option" || e === "#text";
          case "option":
            return e === "#text";
          case "tr":
            return e === "th" || e === "td" || e === "style" || e === "script" || e === "template";
          case "tbody":
          case "thead":
          case "tfoot":
            return e === "tr" || e === "style" || e === "script" || e === "template";
          case "colgroup":
            return e === "col" || e === "template";
          case "table":
            return e === "caption" || e === "colgroup" || e === "tbody" || e === "tfoot" || e === "thead" || e === "style" || e === "script" || e === "template";
          case "head":
            return e === "base" || e === "basefont" || e === "bgsound" || e === "link" || e === "meta" || e === "title" || e === "noscript" || e === "noframes" || e === "style" || e === "script" || e === "template";
          case "html":
            return e === "head" || e === "body" || e === "frameset";
          case "frameset":
            return e === "frame";
          case "#document":
            return e === "html";
        }
        switch (e) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t !== "h1" && t !== "h2" && t !== "h3" && t !== "h4" && t !== "h5" && t !== "h6";
          case "rp":
          case "rt":
            return WT.indexOf(t) === -1;
          case "body":
          case "caption":
          case "col":
          case "colgroup":
          case "frameset":
          case "frame":
          case "head":
          case "html":
          case "tbody":
          case "td":
          case "tfoot":
          case "th":
          case "thead":
          case "tr":
            return t == null;
        }
        return !0;
      }, qT = function(e, t) {
        switch (e) {
          case "address":
          case "article":
          case "aside":
          case "blockquote":
          case "center":
          case "details":
          case "dialog":
          case "dir":
          case "div":
          case "dl":
          case "fieldset":
          case "figcaption":
          case "figure":
          case "footer":
          case "header":
          case "hgroup":
          case "main":
          case "menu":
          case "nav":
          case "ol":
          case "p":
          case "section":
          case "summary":
          case "ul":
          case "pre":
          case "listing":
          case "table":
          case "hr":
          case "xmp":
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t.pTagInButtonScope;
          case "form":
            return t.formTag || t.pTagInButtonScope;
          case "li":
            return t.listItemTagAutoclosing;
          case "dd":
          case "dt":
            return t.dlItemTagAutoclosing;
          case "button":
            return t.buttonTagInScope;
          case "a":
            return t.aTagInScope;
          case "nobr":
            return t.nobrTagInScope;
        }
        return null;
      }, VE = {};
      ip = function(e, t, a) {
        a = a || PE;
        var i = a.current, u = i && i.tag;
        t != null && (e != null && S("validateDOMNesting: when childText is passed, childTag should be null"), e = "#text");
        var s = GT(e, u) ? null : i, f = s ? null : qT(e, a), p = s || f;
        if (p) {
          var v = p.tag, y = !!s + "|" + e + "|" + v;
          if (!VE[y]) {
            VE[y] = !0;
            var g = e, b = "";
            if (e === "#text" ? /\S/.test(t) ? g = "Text nodes" : (g = "Whitespace text nodes", b = " Make sure you don't have any extra whitespace between tags on each line of your source code.") : g = "<" + e + ">", s) {
              var w = "";
              v === "table" && e === "tr" && (w += " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser."), S("validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s", g, v, b, w);
            } else
              S("validateDOMNesting(...): %s cannot appear as a descendant of <%s>.", g, v);
          }
        }
      };
    }
    var Oh = "suppressHydrationWarning", Lh = "$", Mh = "/$", up = "$?", op = "$!", XT = "style", Ay = null, jy = null;
    function KT(e) {
      var t, a, i = e.nodeType;
      switch (i) {
        case Yi:
        case rd: {
          t = i === Yi ? "#document" : "#fragment";
          var u = e.documentElement;
          a = u ? u.namespaceURI : nd(null, "");
          break;
        }
        default: {
          var s = i === Ln ? e.parentNode : e, f = s.namespaceURI || null;
          t = s.tagName, a = nd(f, t);
          break;
        }
      }
      {
        var p = t.toLowerCase(), v = lp(null, p);
        return {
          namespace: a,
          ancestorInfo: v
        };
      }
    }
    function JT(e, t, a) {
      {
        var i = e, u = nd(i.namespace, t), s = lp(i.ancestorInfo, t);
        return {
          namespace: u,
          ancestorInfo: s
        };
      }
    }
    function fD(e) {
      return e;
    }
    function ZT(e) {
      Ay = jn(), jy = pT();
      var t = null;
      return Qn(!1), t;
    }
    function e1(e) {
      vT(jy), Qn(Ay), Ay = null, jy = null;
    }
    function t1(e, t, a, i, u) {
      var s;
      {
        var f = i;
        if (ip(e, null, f.ancestorInfo), typeof t.children == "string" || typeof t.children == "number") {
          var p = "" + t.children, v = lp(f.ancestorInfo, e);
          ip(null, p, v);
        }
        s = f.namespace;
      }
      var y = AT(e, t, a, s);
      return fp(u, y), Iy(y, t), y;
    }
    function n1(e, t) {
      e.appendChild(t);
    }
    function r1(e, t, a, i, u) {
      switch (FT(e, t, a, i), t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          return !!a.autoFocus;
        case "img":
          return !0;
        default:
          return !1;
      }
    }
    function a1(e, t, a, i, u, s) {
      {
        var f = s;
        if (typeof i.children != typeof a.children && (typeof i.children == "string" || typeof i.children == "number")) {
          var p = "" + i.children, v = lp(f.ancestorInfo, t);
          ip(null, p, v);
        }
      }
      return HT(e, t, a, i);
    }
    function Fy(e, t) {
      return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
    }
    function i1(e, t, a, i) {
      {
        var u = a;
        ip(null, e, u.ancestorInfo);
      }
      var s = jT(e, t);
      return fp(i, s), s;
    }
    function l1() {
      var e = window.event;
      return e === void 0 ? Na : lf(e.type);
    }
    var Hy = typeof setTimeout == "function" ? setTimeout : void 0, u1 = typeof clearTimeout == "function" ? clearTimeout : void 0, Py = -1, BE = typeof Promise == "function" ? Promise : void 0, o1 = typeof queueMicrotask == "function" ? queueMicrotask : typeof BE < "u" ? function(e) {
      return BE.resolve(null).then(e).catch(s1);
    } : Hy;
    function s1(e) {
      setTimeout(function() {
        throw e;
      });
    }
    function c1(e, t, a, i) {
      switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && e.focus();
          return;
        case "img": {
          a.src && (e.src = a.src);
          return;
        }
      }
    }
    function f1(e, t, a, i, u, s) {
      PT(e, t, a, i, u), Iy(e, u);
    }
    function $E(e) {
      ao(e, "");
    }
    function d1(e, t, a) {
      e.nodeValue = a;
    }
    function p1(e, t) {
      e.appendChild(t);
    }
    function v1(e, t) {
      var a;
      e.nodeType === Ln ? (a = e.parentNode, a.insertBefore(t, e)) : (a = e, a.appendChild(t));
      var i = e._reactRootContainer;
      i == null && a.onclick === null && kh(a);
    }
    function h1(e, t, a) {
      e.insertBefore(t, a);
    }
    function m1(e, t, a) {
      e.nodeType === Ln ? e.parentNode.insertBefore(t, a) : e.insertBefore(t, a);
    }
    function y1(e, t) {
      e.removeChild(t);
    }
    function g1(e, t) {
      e.nodeType === Ln ? e.parentNode.removeChild(t) : e.removeChild(t);
    }
    function Vy(e, t) {
      var a = t, i = 0;
      do {
        var u = a.nextSibling;
        if (e.removeChild(a), u && u.nodeType === Ln) {
          var s = u.data;
          if (s === Mh)
            if (i === 0) {
              e.removeChild(u), Du(t);
              return;
            } else
              i--;
          else (s === Lh || s === up || s === op) && i++;
        }
        a = u;
      } while (a);
      Du(t);
    }
    function S1(e, t) {
      e.nodeType === Ln ? Vy(e.parentNode, t) : e.nodeType === Qr && Vy(e, t), Du(e);
    }
    function E1(e) {
      e = e;
      var t = e.style;
      typeof t.setProperty == "function" ? t.setProperty("display", "none", "important") : t.display = "none";
    }
    function C1(e) {
      e.nodeValue = "";
    }
    function R1(e, t) {
      e = e;
      var a = t[XT], i = a != null && a.hasOwnProperty("display") ? a.display : null;
      e.style.display = fc("display", i);
    }
    function T1(e, t) {
      e.nodeValue = t;
    }
    function w1(e) {
      e.nodeType === Qr ? e.textContent = "" : e.nodeType === Yi && e.documentElement && e.removeChild(e.documentElement);
    }
    function x1(e, t, a) {
      return e.nodeType !== Qr || t.toLowerCase() !== e.nodeName.toLowerCase() ? null : e;
    }
    function b1(e, t) {
      return t === "" || e.nodeType !== $i ? null : e;
    }
    function _1(e) {
      return e.nodeType !== Ln ? null : e;
    }
    function YE(e) {
      return e.data === up;
    }
    function By(e) {
      return e.data === op;
    }
    function D1(e) {
      var t = e.nextSibling && e.nextSibling.dataset, a, i, u;
      return t && (a = t.dgst, i = t.msg, u = t.stck), {
        message: i,
        digest: a,
        stack: u
      };
    }
    function k1(e, t) {
      e._reactRetry = t;
    }
    function Nh(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === Qr || t === $i)
          break;
        if (t === Ln) {
          var a = e.data;
          if (a === Lh || a === op || a === up)
            break;
          if (a === Mh)
            return null;
        }
      }
      return e;
    }
    function sp(e) {
      return Nh(e.nextSibling);
    }
    function O1(e) {
      return Nh(e.firstChild);
    }
    function L1(e) {
      return Nh(e.firstChild);
    }
    function M1(e) {
      return Nh(e.nextSibling);
    }
    function N1(e, t, a, i, u, s, f) {
      fp(s, e), Iy(e, a);
      var p;
      {
        var v = u;
        p = v.namespace;
      }
      var y = (s.mode & st) !== De;
      return BT(e, t, a, p, i, y, f);
    }
    function U1(e, t, a, i) {
      return fp(a, e), a.mode & st, $T(e, t);
    }
    function z1(e, t) {
      fp(t, e);
    }
    function A1(e) {
      for (var t = e.nextSibling, a = 0; t; ) {
        if (t.nodeType === Ln) {
          var i = t.data;
          if (i === Mh) {
            if (a === 0)
              return sp(t);
            a--;
          } else (i === Lh || i === op || i === up) && a++;
        }
        t = t.nextSibling;
      }
      return null;
    }
    function IE(e) {
      for (var t = e.previousSibling, a = 0; t; ) {
        if (t.nodeType === Ln) {
          var i = t.data;
          if (i === Lh || i === op || i === up) {
            if (a === 0)
              return t;
            a--;
          } else i === Mh && a++;
        }
        t = t.previousSibling;
      }
      return null;
    }
    function j1(e) {
      Du(e);
    }
    function F1(e) {
      Du(e);
    }
    function H1(e) {
      return e !== "head" && e !== "body";
    }
    function P1(e, t, a, i) {
      var u = !0;
      Dh(t.nodeValue, a, i, u);
    }
    function V1(e, t, a, i, u, s) {
      if (t[Oh] !== !0) {
        var f = !0;
        Dh(i.nodeValue, u, s, f);
      }
    }
    function B1(e, t) {
      t.nodeType === Qr ? My(e, t) : t.nodeType === Ln || Ny(e, t);
    }
    function $1(e, t) {
      {
        var a = e.parentNode;
        a !== null && (t.nodeType === Qr ? My(a, t) : t.nodeType === Ln || Ny(a, t));
      }
    }
    function Y1(e, t, a, i, u) {
      (u || t[Oh] !== !0) && (i.nodeType === Qr ? My(a, i) : i.nodeType === Ln || Ny(a, i));
    }
    function I1(e, t, a) {
      Uy(e, t);
    }
    function Q1(e, t) {
      zy(e, t);
    }
    function W1(e, t, a) {
      {
        var i = e.parentNode;
        i !== null && Uy(i, t);
      }
    }
    function G1(e, t) {
      {
        var a = e.parentNode;
        a !== null && zy(a, t);
      }
    }
    function q1(e, t, a, i, u, s) {
      (s || t[Oh] !== !0) && Uy(a, i);
    }
    function X1(e, t, a, i, u) {
      (u || t[Oh] !== !0) && zy(a, i);
    }
    function K1(e) {
      S("An error occurred during hydration. The server HTML was replaced with client content in <%s>.", e.nodeName.toLowerCase());
    }
    function J1(e) {
      tp(e);
    }
    var Ef = Math.random().toString(36).slice(2), Cf = "__reactFiber$" + Ef, $y = "__reactProps$" + Ef, cp = "__reactContainer$" + Ef, Yy = "__reactEvents$" + Ef, Z1 = "__reactListeners$" + Ef, ew = "__reactHandles$" + Ef;
    function tw(e) {
      delete e[Cf], delete e[$y], delete e[Yy], delete e[Z1], delete e[ew];
    }
    function fp(e, t) {
      t[Cf] = e;
    }
    function Uh(e, t) {
      t[cp] = e;
    }
    function QE(e) {
      e[cp] = null;
    }
    function dp(e) {
      return !!e[cp];
    }
    function Is(e) {
      var t = e[Cf];
      if (t)
        return t;
      for (var a = e.parentNode; a; ) {
        if (t = a[cp] || a[Cf], t) {
          var i = t.alternate;
          if (t.child !== null || i !== null && i.child !== null)
            for (var u = IE(e); u !== null; ) {
              var s = u[Cf];
              if (s)
                return s;
              u = IE(u);
            }
          return t;
        }
        e = a, a = e.parentNode;
      }
      return null;
    }
    function ko(e) {
      var t = e[Cf] || e[cp];
      return t && (t.tag === ie || t.tag === je || t.tag === be || t.tag === Z) ? t : null;
    }
    function Rf(e) {
      if (e.tag === ie || e.tag === je)
        return e.stateNode;
      throw new Error("getNodeFromInstance: Invalid argument.");
    }
    function zh(e) {
      return e[$y] || null;
    }
    function Iy(e, t) {
      e[$y] = t;
    }
    function nw(e) {
      var t = e[Yy];
      return t === void 0 && (t = e[Yy] = /* @__PURE__ */ new Set()), t;
    }
    var WE = {}, GE = A.ReactDebugCurrentFrame;
    function Ah(e) {
      if (e) {
        var t = e._owner, a = Hi(e.type, e._source, t ? t.type : null);
        GE.setExtraStackFrame(a);
      } else
        GE.setExtraStackFrame(null);
    }
    function tl(e, t, a, i, u) {
      {
        var s = Function.call.bind(wr);
        for (var f in e)
          if (s(e, f)) {
            var p = void 0;
            try {
              if (typeof e[f] != "function") {
                var v = Error((i || "React class") + ": " + a + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw v.name = "Invariant Violation", v;
              }
              p = e[f](t, f, i, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (y) {
              p = y;
            }
            p && !(p instanceof Error) && (Ah(u), S("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", a, f, typeof p), Ah(null)), p instanceof Error && !(p.message in WE) && (WE[p.message] = !0, Ah(u), S("Failed %s type: %s", a, p.message), Ah(null));
          }
      }
    }
    var Qy = [], jh;
    jh = [];
    var Uu = -1;
    function Oo(e) {
      return {
        current: e
      };
    }
    function ra(e, t) {
      if (Uu < 0) {
        S("Unexpected pop.");
        return;
      }
      t !== jh[Uu] && S("Unexpected Fiber popped."), e.current = Qy[Uu], Qy[Uu] = null, jh[Uu] = null, Uu--;
    }
    function aa(e, t, a) {
      Uu++, Qy[Uu] = e.current, jh[Uu] = a, e.current = t;
    }
    var Wy;
    Wy = {};
    var li = {};
    Object.freeze(li);
    var zu = Oo(li), Bl = Oo(!1), Gy = li;
    function Tf(e, t, a) {
      return a && $l(t) ? Gy : zu.current;
    }
    function qE(e, t, a) {
      {
        var i = e.stateNode;
        i.__reactInternalMemoizedUnmaskedChildContext = t, i.__reactInternalMemoizedMaskedChildContext = a;
      }
    }
    function wf(e, t) {
      {
        var a = e.type, i = a.contextTypes;
        if (!i)
          return li;
        var u = e.stateNode;
        if (u && u.__reactInternalMemoizedUnmaskedChildContext === t)
          return u.__reactInternalMemoizedMaskedChildContext;
        var s = {};
        for (var f in i)
          s[f] = t[f];
        {
          var p = Be(e) || "Unknown";
          tl(i, s, "context", p);
        }
        return u && qE(e, t, s), s;
      }
    }
    function Fh() {
      return Bl.current;
    }
    function $l(e) {
      {
        var t = e.childContextTypes;
        return t != null;
      }
    }
    function Hh(e) {
      ra(Bl, e), ra(zu, e);
    }
    function qy(e) {
      ra(Bl, e), ra(zu, e);
    }
    function XE(e, t, a) {
      {
        if (zu.current !== li)
          throw new Error("Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.");
        aa(zu, t, e), aa(Bl, a, e);
      }
    }
    function KE(e, t, a) {
      {
        var i = e.stateNode, u = t.childContextTypes;
        if (typeof i.getChildContext != "function") {
          {
            var s = Be(e) || "Unknown";
            Wy[s] || (Wy[s] = !0, S("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", s, s));
          }
          return a;
        }
        var f = i.getChildContext();
        for (var p in f)
          if (!(p in u))
            throw new Error((Be(e) || "Unknown") + '.getChildContext(): key "' + p + '" is not defined in childContextTypes.');
        {
          var v = Be(e) || "Unknown";
          tl(u, f, "child context", v);
        }
        return et({}, a, f);
      }
    }
    function Ph(e) {
      {
        var t = e.stateNode, a = t && t.__reactInternalMemoizedMergedChildContext || li;
        return Gy = zu.current, aa(zu, a, e), aa(Bl, Bl.current, e), !0;
      }
    }
    function JE(e, t, a) {
      {
        var i = e.stateNode;
        if (!i)
          throw new Error("Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.");
        if (a) {
          var u = KE(e, t, Gy);
          i.__reactInternalMemoizedMergedChildContext = u, ra(Bl, e), ra(zu, e), aa(zu, u, e), aa(Bl, a, e);
        } else
          ra(Bl, e), aa(Bl, a, e);
      }
    }
    function rw(e) {
      {
        if (!vu(e) || e.tag !== de)
          throw new Error("Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.");
        var t = e;
        do {
          switch (t.tag) {
            case Z:
              return t.stateNode.context;
            case de: {
              var a = t.type;
              if ($l(a))
                return t.stateNode.__reactInternalMemoizedMergedChildContext;
              break;
            }
          }
          t = t.return;
        } while (t !== null);
        throw new Error("Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    var Lo = 0, Vh = 1, Au = null, Xy = !1, Ky = !1;
    function ZE(e) {
      Au === null ? Au = [e] : Au.push(e);
    }
    function aw(e) {
      Xy = !0, ZE(e);
    }
    function eC() {
      Xy && Mo();
    }
    function Mo() {
      if (!Ky && Au !== null) {
        Ky = !0;
        var e = 0, t = za();
        try {
          var a = !0, i = Au;
          for (An(Or); e < i.length; e++) {
            var u = i[e];
            do
              u = u(a);
            while (u !== null);
          }
          Au = null, Xy = !1;
        } catch (s) {
          throw Au !== null && (Au = Au.slice(e + 1)), hd(cs, Mo), s;
        } finally {
          An(t), Ky = !1;
        }
      }
      return null;
    }
    var xf = [], bf = 0, Bh = null, $h = 0, Li = [], Mi = 0, Qs = null, ju = 1, Fu = "";
    function iw(e) {
      return Gs(), (e.flags & Ci) !== _e;
    }
    function lw(e) {
      return Gs(), $h;
    }
    function uw() {
      var e = Fu, t = ju, a = t & ~ow(t);
      return a.toString(32) + e;
    }
    function Ws(e, t) {
      Gs(), xf[bf++] = $h, xf[bf++] = Bh, Bh = e, $h = t;
    }
    function tC(e, t, a) {
      Gs(), Li[Mi++] = ju, Li[Mi++] = Fu, Li[Mi++] = Qs, Qs = e;
      var i = ju, u = Fu, s = Yh(i) - 1, f = i & ~(1 << s), p = a + 1, v = Yh(t) + s;
      if (v > 30) {
        var y = s - s % 5, g = (1 << y) - 1, b = (f & g).toString(32), w = f >> y, M = s - y, z = Yh(t) + M, F = p << M, ue = F | w, Le = b + u;
        ju = 1 << z | ue, Fu = Le;
      } else {
        var we = p << s, Ct = we | f, mt = u;
        ju = 1 << v | Ct, Fu = mt;
      }
    }
    function Jy(e) {
      Gs();
      var t = e.return;
      if (t !== null) {
        var a = 1, i = 0;
        Ws(e, a), tC(e, a, i);
      }
    }
    function Yh(e) {
      return 32 - Un(e);
    }
    function ow(e) {
      return 1 << Yh(e) - 1;
    }
    function Zy(e) {
      for (; e === Bh; )
        Bh = xf[--bf], xf[bf] = null, $h = xf[--bf], xf[bf] = null;
      for (; e === Qs; )
        Qs = Li[--Mi], Li[Mi] = null, Fu = Li[--Mi], Li[Mi] = null, ju = Li[--Mi], Li[Mi] = null;
    }
    function sw() {
      return Gs(), Qs !== null ? {
        id: ju,
        overflow: Fu
      } : null;
    }
    function cw(e, t) {
      Gs(), Li[Mi++] = ju, Li[Mi++] = Fu, Li[Mi++] = Qs, ju = t.id, Fu = t.overflow, Qs = e;
    }
    function Gs() {
      zr() || S("Expected to be hydrating. This is a bug in React. Please file an issue.");
    }
    var Ur = null, Ni = null, nl = !1, qs = !1, No = null;
    function fw() {
      nl && S("We should not be hydrating here. This is a bug in React. Please file a bug.");
    }
    function nC() {
      qs = !0;
    }
    function dw() {
      return qs;
    }
    function pw(e) {
      var t = e.stateNode.containerInfo;
      return Ni = L1(t), Ur = e, nl = !0, No = null, qs = !1, !0;
    }
    function vw(e, t, a) {
      return Ni = M1(t), Ur = e, nl = !0, No = null, qs = !1, a !== null && cw(e, a), !0;
    }
    function rC(e, t) {
      switch (e.tag) {
        case Z: {
          B1(e.stateNode.containerInfo, t);
          break;
        }
        case ie: {
          var a = (e.mode & st) !== De;
          Y1(
            e.type,
            e.memoizedProps,
            e.stateNode,
            t,
            // TODO: Delete this argument when we remove the legacy root API.
            a
          );
          break;
        }
        case be: {
          var i = e.memoizedState;
          i.dehydrated !== null && $1(i.dehydrated, t);
          break;
        }
      }
    }
    function aC(e, t) {
      rC(e, t);
      var a = g_();
      a.stateNode = t, a.return = e;
      var i = e.deletions;
      i === null ? (e.deletions = [a], e.flags |= Da) : i.push(a);
    }
    function eg(e, t) {
      {
        if (qs)
          return;
        switch (e.tag) {
          case Z: {
            var a = e.stateNode.containerInfo;
            switch (t.tag) {
              case ie:
                var i = t.type;
                t.pendingProps, I1(a, i);
                break;
              case je:
                var u = t.pendingProps;
                Q1(a, u);
                break;
            }
            break;
          }
          case ie: {
            var s = e.type, f = e.memoizedProps, p = e.stateNode;
            switch (t.tag) {
              case ie: {
                var v = t.type, y = t.pendingProps, g = (e.mode & st) !== De;
                q1(
                  s,
                  f,
                  p,
                  v,
                  y,
                  // TODO: Delete this argument when we remove the legacy root API.
                  g
                );
                break;
              }
              case je: {
                var b = t.pendingProps, w = (e.mode & st) !== De;
                X1(
                  s,
                  f,
                  p,
                  b,
                  // TODO: Delete this argument when we remove the legacy root API.
                  w
                );
                break;
              }
            }
            break;
          }
          case be: {
            var M = e.memoizedState, z = M.dehydrated;
            if (z !== null) switch (t.tag) {
              case ie:
                var F = t.type;
                t.pendingProps, W1(z, F);
                break;
              case je:
                var ue = t.pendingProps;
                G1(z, ue);
                break;
            }
            break;
          }
          default:
            return;
        }
      }
    }
    function iC(e, t) {
      t.flags = t.flags & ~Gr | hn, eg(e, t);
    }
    function lC(e, t) {
      switch (e.tag) {
        case ie: {
          var a = e.type;
          e.pendingProps;
          var i = x1(t, a);
          return i !== null ? (e.stateNode = i, Ur = e, Ni = O1(i), !0) : !1;
        }
        case je: {
          var u = e.pendingProps, s = b1(t, u);
          return s !== null ? (e.stateNode = s, Ur = e, Ni = null, !0) : !1;
        }
        case be: {
          var f = _1(t);
          if (f !== null) {
            var p = {
              dehydrated: f,
              treeContext: sw(),
              retryLane: Jr
            };
            e.memoizedState = p;
            var v = S_(f);
            return v.return = e, e.child = v, Ur = e, Ni = null, !0;
          }
          return !1;
        }
        default:
          return !1;
      }
    }
    function tg(e) {
      return (e.mode & st) !== De && (e.flags & xe) === _e;
    }
    function ng(e) {
      throw new Error("Hydration failed because the initial UI does not match what was rendered on the server.");
    }
    function rg(e) {
      if (nl) {
        var t = Ni;
        if (!t) {
          tg(e) && (eg(Ur, e), ng()), iC(Ur, e), nl = !1, Ur = e;
          return;
        }
        var a = t;
        if (!lC(e, t)) {
          tg(e) && (eg(Ur, e), ng()), t = sp(a);
          var i = Ur;
          if (!t || !lC(e, t)) {
            iC(Ur, e), nl = !1, Ur = e;
            return;
          }
          aC(i, a);
        }
      }
    }
    function hw(e, t, a) {
      var i = e.stateNode, u = !qs, s = N1(i, e.type, e.memoizedProps, t, a, e, u);
      return e.updateQueue = s, s !== null;
    }
    function mw(e) {
      var t = e.stateNode, a = e.memoizedProps, i = U1(t, a, e);
      if (i) {
        var u = Ur;
        if (u !== null)
          switch (u.tag) {
            case Z: {
              var s = u.stateNode.containerInfo, f = (u.mode & st) !== De;
              P1(
                s,
                t,
                a,
                // TODO: Delete this argument when we remove the legacy root API.
                f
              );
              break;
            }
            case ie: {
              var p = u.type, v = u.memoizedProps, y = u.stateNode, g = (u.mode & st) !== De;
              V1(
                p,
                v,
                y,
                t,
                a,
                // TODO: Delete this argument when we remove the legacy root API.
                g
              );
              break;
            }
          }
      }
      return i;
    }
    function yw(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      z1(a, e);
    }
    function gw(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      return A1(a);
    }
    function uC(e) {
      for (var t = e.return; t !== null && t.tag !== ie && t.tag !== Z && t.tag !== be; )
        t = t.return;
      Ur = t;
    }
    function Ih(e) {
      if (e !== Ur)
        return !1;
      if (!nl)
        return uC(e), nl = !0, !1;
      if (e.tag !== Z && (e.tag !== ie || H1(e.type) && !Fy(e.type, e.memoizedProps))) {
        var t = Ni;
        if (t)
          if (tg(e))
            oC(e), ng();
          else
            for (; t; )
              aC(e, t), t = sp(t);
      }
      return uC(e), e.tag === be ? Ni = gw(e) : Ni = Ur ? sp(e.stateNode) : null, !0;
    }
    function Sw() {
      return nl && Ni !== null;
    }
    function oC(e) {
      for (var t = Ni; t; )
        rC(e, t), t = sp(t);
    }
    function _f() {
      Ur = null, Ni = null, nl = !1, qs = !1;
    }
    function sC() {
      No !== null && (nR(No), No = null);
    }
    function zr() {
      return nl;
    }
    function ag(e) {
      No === null ? No = [e] : No.push(e);
    }
    var Ew = A.ReactCurrentBatchConfig, Cw = null;
    function Rw() {
      return Ew.transition;
    }
    var rl = {
      recordUnsafeLifecycleWarnings: function(e, t) {
      },
      flushPendingUnsafeLifecycleWarnings: function() {
      },
      recordLegacyContextWarning: function(e, t) {
      },
      flushLegacyContextWarning: function() {
      },
      discardPendingWarnings: function() {
      }
    };
    {
      var Tw = function(e) {
        for (var t = null, a = e; a !== null; )
          a.mode & Wt && (t = a), a = a.return;
        return t;
      }, Xs = function(e) {
        var t = [];
        return e.forEach(function(a) {
          t.push(a);
        }), t.sort().join(", ");
      }, pp = [], vp = [], hp = [], mp = [], yp = [], gp = [], Ks = /* @__PURE__ */ new Set();
      rl.recordUnsafeLifecycleWarnings = function(e, t) {
        Ks.has(e.type) || (typeof t.componentWillMount == "function" && // Don't warn about react-lifecycles-compat polyfilled components.
        t.componentWillMount.__suppressDeprecationWarning !== !0 && pp.push(e), e.mode & Wt && typeof t.UNSAFE_componentWillMount == "function" && vp.push(e), typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps.__suppressDeprecationWarning !== !0 && hp.push(e), e.mode & Wt && typeof t.UNSAFE_componentWillReceiveProps == "function" && mp.push(e), typeof t.componentWillUpdate == "function" && t.componentWillUpdate.__suppressDeprecationWarning !== !0 && yp.push(e), e.mode & Wt && typeof t.UNSAFE_componentWillUpdate == "function" && gp.push(e));
      }, rl.flushPendingUnsafeLifecycleWarnings = function() {
        var e = /* @__PURE__ */ new Set();
        pp.length > 0 && (pp.forEach(function(w) {
          e.add(Be(w) || "Component"), Ks.add(w.type);
        }), pp = []);
        var t = /* @__PURE__ */ new Set();
        vp.length > 0 && (vp.forEach(function(w) {
          t.add(Be(w) || "Component"), Ks.add(w.type);
        }), vp = []);
        var a = /* @__PURE__ */ new Set();
        hp.length > 0 && (hp.forEach(function(w) {
          a.add(Be(w) || "Component"), Ks.add(w.type);
        }), hp = []);
        var i = /* @__PURE__ */ new Set();
        mp.length > 0 && (mp.forEach(function(w) {
          i.add(Be(w) || "Component"), Ks.add(w.type);
        }), mp = []);
        var u = /* @__PURE__ */ new Set();
        yp.length > 0 && (yp.forEach(function(w) {
          u.add(Be(w) || "Component"), Ks.add(w.type);
        }), yp = []);
        var s = /* @__PURE__ */ new Set();
        if (gp.length > 0 && (gp.forEach(function(w) {
          s.add(Be(w) || "Component"), Ks.add(w.type);
        }), gp = []), t.size > 0) {
          var f = Xs(t);
          S(`Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: %s`, f);
        }
        if (i.size > 0) {
          var p = Xs(i);
          S(`Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state

Please update the following components: %s`, p);
        }
        if (s.size > 0) {
          var v = Xs(s);
          S(`Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.

Please update the following components: %s`, v);
        }
        if (e.size > 0) {
          var y = Xs(e);
          Ie(`componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, y);
        }
        if (a.size > 0) {
          var g = Xs(a);
          Ie(`componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, g);
        }
        if (u.size > 0) {
          var b = Xs(u);
          Ie(`componentWillUpdate has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, b);
        }
      };
      var Qh = /* @__PURE__ */ new Map(), cC = /* @__PURE__ */ new Set();
      rl.recordLegacyContextWarning = function(e, t) {
        var a = Tw(e);
        if (a === null) {
          S("Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue.");
          return;
        }
        if (!cC.has(e.type)) {
          var i = Qh.get(a);
          (e.type.contextTypes != null || e.type.childContextTypes != null || t !== null && typeof t.getChildContext == "function") && (i === void 0 && (i = [], Qh.set(a, i)), i.push(e));
        }
      }, rl.flushLegacyContextWarning = function() {
        Qh.forEach(function(e, t) {
          if (e.length !== 0) {
            var a = e[0], i = /* @__PURE__ */ new Set();
            e.forEach(function(s) {
              i.add(Be(s) || "Component"), cC.add(s.type);
            });
            var u = Xs(i);
            try {
              Yt(a), S(`Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: %s

Learn more about this warning here: https://reactjs.org/link/legacy-context`, u);
            } finally {
              sn();
            }
          }
        });
      }, rl.discardPendingWarnings = function() {
        pp = [], vp = [], hp = [], mp = [], yp = [], gp = [], Qh = /* @__PURE__ */ new Map();
      };
    }
    var ig, lg, ug, og, sg, fC = function(e, t) {
    };
    ig = !1, lg = !1, ug = {}, og = {}, sg = {}, fC = function(e, t) {
      if (!(e === null || typeof e != "object") && !(!e._store || e._store.validated || e.key != null)) {
        if (typeof e._store != "object")
          throw new Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
        e._store.validated = !0;
        var a = Be(t) || "Component";
        og[a] || (og[a] = !0, S('Each child in a list should have a unique "key" prop. See https://reactjs.org/link/warning-keys for more information.'));
      }
    };
    function ww(e) {
      return e.prototype && e.prototype.isReactComponent;
    }
    function Sp(e, t, a) {
      var i = a.ref;
      if (i !== null && typeof i != "function" && typeof i != "object") {
        if ((e.mode & Wt || P) && // We warn in ReactElement.js if owner and self are equal for string refs
        // because these cannot be automatically converted to an arrow function
        // using a codemod. Therefore, we don't have to warn about string refs again.
        !(a._owner && a._self && a._owner.stateNode !== a._self) && // Will already throw with "Function components cannot have string refs"
        !(a._owner && a._owner.tag !== de) && // Will already warn with "Function components cannot be given refs"
        !(typeof a.type == "function" && !ww(a.type)) && // Will already throw with "Element ref was specified as a string (someStringRef) but no owner was set"
        a._owner) {
          var u = Be(e) || "Component";
          ug[u] || (S('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. We recommend using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', u, i), ug[u] = !0);
        }
        if (a._owner) {
          var s = a._owner, f;
          if (s) {
            var p = s;
            if (p.tag !== de)
              throw new Error("Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref");
            f = p.stateNode;
          }
          if (!f)
            throw new Error("Missing owner for string ref " + i + ". This error is likely caused by a bug in React. Please file an issue.");
          var v = f;
          si(i, "ref");
          var y = "" + i;
          if (t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === y)
            return t.ref;
          var g = function(b) {
            var w = v.refs;
            b === null ? delete w[y] : w[y] = b;
          };
          return g._stringRef = y, g;
        } else {
          if (typeof i != "string")
            throw new Error("Expected ref to be a function, a string, an object returned by React.createRef(), or null.");
          if (!a._owner)
            throw new Error("Element ref was specified as a string (" + i + `) but no owner was set. This could happen for one of the following reasons:
1. You may be adding a ref to a function component
2. You may be adding a ref to a component that was not created inside a component's render method
3. You have multiple copies of React loaded
See https://reactjs.org/link/refs-must-have-owner for more information.`);
        }
      }
      return i;
    }
    function Wh(e, t) {
      var a = Object.prototype.toString.call(t);
      throw new Error("Objects are not valid as a React child (found: " + (a === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
    }
    function Gh(e) {
      {
        var t = Be(e) || "Component";
        if (sg[t])
          return;
        sg[t] = !0, S("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
      }
    }
    function dC(e) {
      var t = e._payload, a = e._init;
      return a(t);
    }
    function pC(e) {
      function t(k, H) {
        if (e) {
          var O = k.deletions;
          O === null ? (k.deletions = [H], k.flags |= Da) : O.push(H);
        }
      }
      function a(k, H) {
        if (!e)
          return null;
        for (var O = H; O !== null; )
          t(k, O), O = O.sibling;
        return null;
      }
      function i(k, H) {
        for (var O = /* @__PURE__ */ new Map(), q = H; q !== null; )
          q.key !== null ? O.set(q.key, q) : O.set(q.index, q), q = q.sibling;
        return O;
      }
      function u(k, H) {
        var O = lc(k, H);
        return O.index = 0, O.sibling = null, O;
      }
      function s(k, H, O) {
        if (k.index = O, !e)
          return k.flags |= Ci, H;
        var q = k.alternate;
        if (q !== null) {
          var pe = q.index;
          return pe < H ? (k.flags |= hn, H) : pe;
        } else
          return k.flags |= hn, H;
      }
      function f(k) {
        return e && k.alternate === null && (k.flags |= hn), k;
      }
      function p(k, H, O, q) {
        if (H === null || H.tag !== je) {
          var pe = aE(O, k.mode, q);
          return pe.return = k, pe;
        } else {
          var oe = u(H, O);
          return oe.return = k, oe;
        }
      }
      function v(k, H, O, q) {
        var pe = O.type;
        if (pe === fi)
          return g(k, H, O.props.children, q, O.key);
        if (H !== null && (H.elementType === pe || // Keep this check inline so it only runs on the false path:
        gR(H, O) || // Lazy types should reconcile their resolved type.
        // We need to do this after the Hot Reloading check above,
        // because hot reloading has different semantics than prod because
        // it doesn't resuspend. So we can't let the call below suspend.
        typeof pe == "object" && pe !== null && pe.$$typeof === $e && dC(pe) === H.type)) {
          var oe = u(H, O.props);
          return oe.ref = Sp(k, H, O), oe.return = k, oe._debugSource = O._source, oe._debugOwner = O._owner, oe;
        }
        var Pe = rE(O, k.mode, q);
        return Pe.ref = Sp(k, H, O), Pe.return = k, Pe;
      }
      function y(k, H, O, q) {
        if (H === null || H.tag !== Se || H.stateNode.containerInfo !== O.containerInfo || H.stateNode.implementation !== O.implementation) {
          var pe = iE(O, k.mode, q);
          return pe.return = k, pe;
        } else {
          var oe = u(H, O.children || []);
          return oe.return = k, oe;
        }
      }
      function g(k, H, O, q, pe) {
        if (H === null || H.tag !== Xe) {
          var oe = Yo(O, k.mode, q, pe);
          return oe.return = k, oe;
        } else {
          var Pe = u(H, O);
          return Pe.return = k, Pe;
        }
      }
      function b(k, H, O) {
        if (typeof H == "string" && H !== "" || typeof H == "number") {
          var q = aE("" + H, k.mode, O);
          return q.return = k, q;
        }
        if (typeof H == "object" && H !== null) {
          switch (H.$$typeof) {
            case br: {
              var pe = rE(H, k.mode, O);
              return pe.ref = Sp(k, null, H), pe.return = k, pe;
            }
            case nr: {
              var oe = iE(H, k.mode, O);
              return oe.return = k, oe;
            }
            case $e: {
              var Pe = H._payload, We = H._init;
              return b(k, We(Pe), O);
            }
          }
          if (at(H) || qe(H)) {
            var qt = Yo(H, k.mode, O, null);
            return qt.return = k, qt;
          }
          Wh(k, H);
        }
        return typeof H == "function" && Gh(k), null;
      }
      function w(k, H, O, q) {
        var pe = H !== null ? H.key : null;
        if (typeof O == "string" && O !== "" || typeof O == "number")
          return pe !== null ? null : p(k, H, "" + O, q);
        if (typeof O == "object" && O !== null) {
          switch (O.$$typeof) {
            case br:
              return O.key === pe ? v(k, H, O, q) : null;
            case nr:
              return O.key === pe ? y(k, H, O, q) : null;
            case $e: {
              var oe = O._payload, Pe = O._init;
              return w(k, H, Pe(oe), q);
            }
          }
          if (at(O) || qe(O))
            return pe !== null ? null : g(k, H, O, q, null);
          Wh(k, O);
        }
        return typeof O == "function" && Gh(k), null;
      }
      function M(k, H, O, q, pe) {
        if (typeof q == "string" && q !== "" || typeof q == "number") {
          var oe = k.get(O) || null;
          return p(H, oe, "" + q, pe);
        }
        if (typeof q == "object" && q !== null) {
          switch (q.$$typeof) {
            case br: {
              var Pe = k.get(q.key === null ? O : q.key) || null;
              return v(H, Pe, q, pe);
            }
            case nr: {
              var We = k.get(q.key === null ? O : q.key) || null;
              return y(H, We, q, pe);
            }
            case $e:
              var qt = q._payload, Nt = q._init;
              return M(k, H, O, Nt(qt), pe);
          }
          if (at(q) || qe(q)) {
            var Wn = k.get(O) || null;
            return g(H, Wn, q, pe, null);
          }
          Wh(H, q);
        }
        return typeof q == "function" && Gh(H), null;
      }
      function z(k, H, O) {
        {
          if (typeof k != "object" || k === null)
            return H;
          switch (k.$$typeof) {
            case br:
            case nr:
              fC(k, O);
              var q = k.key;
              if (typeof q != "string")
                break;
              if (H === null) {
                H = /* @__PURE__ */ new Set(), H.add(q);
                break;
              }
              if (!H.has(q)) {
                H.add(q);
                break;
              }
              S("Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.", q);
              break;
            case $e:
              var pe = k._payload, oe = k._init;
              z(oe(pe), H, O);
              break;
          }
        }
        return H;
      }
      function F(k, H, O, q) {
        for (var pe = null, oe = 0; oe < O.length; oe++) {
          var Pe = O[oe];
          pe = z(Pe, pe, k);
        }
        for (var We = null, qt = null, Nt = H, Wn = 0, Ut = 0, Hn = null; Nt !== null && Ut < O.length; Ut++) {
          Nt.index > Ut ? (Hn = Nt, Nt = null) : Hn = Nt.sibling;
          var la = w(k, Nt, O[Ut], q);
          if (la === null) {
            Nt === null && (Nt = Hn);
            break;
          }
          e && Nt && la.alternate === null && t(k, Nt), Wn = s(la, Wn, Ut), qt === null ? We = la : qt.sibling = la, qt = la, Nt = Hn;
        }
        if (Ut === O.length) {
          if (a(k, Nt), zr()) {
            var Br = Ut;
            Ws(k, Br);
          }
          return We;
        }
        if (Nt === null) {
          for (; Ut < O.length; Ut++) {
            var oi = b(k, O[Ut], q);
            oi !== null && (Wn = s(oi, Wn, Ut), qt === null ? We = oi : qt.sibling = oi, qt = oi);
          }
          if (zr()) {
            var Ca = Ut;
            Ws(k, Ca);
          }
          return We;
        }
        for (var Ra = i(k, Nt); Ut < O.length; Ut++) {
          var ua = M(Ra, k, Ut, O[Ut], q);
          ua !== null && (e && ua.alternate !== null && Ra.delete(ua.key === null ? Ut : ua.key), Wn = s(ua, Wn, Ut), qt === null ? We = ua : qt.sibling = ua, qt = ua);
        }
        if (e && Ra.forEach(function(Qf) {
          return t(k, Qf);
        }), zr()) {
          var Iu = Ut;
          Ws(k, Iu);
        }
        return We;
      }
      function ue(k, H, O, q) {
        var pe = qe(O);
        if (typeof pe != "function")
          throw new Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
        {
          typeof Symbol == "function" && // $FlowFixMe Flow doesn't know about toStringTag
          O[Symbol.toStringTag] === "Generator" && (lg || S("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers."), lg = !0), O.entries === pe && (ig || S("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), ig = !0);
          var oe = pe.call(O);
          if (oe)
            for (var Pe = null, We = oe.next(); !We.done; We = oe.next()) {
              var qt = We.value;
              Pe = z(qt, Pe, k);
            }
        }
        var Nt = pe.call(O);
        if (Nt == null)
          throw new Error("An iterable object provided no iterator.");
        for (var Wn = null, Ut = null, Hn = H, la = 0, Br = 0, oi = null, Ca = Nt.next(); Hn !== null && !Ca.done; Br++, Ca = Nt.next()) {
          Hn.index > Br ? (oi = Hn, Hn = null) : oi = Hn.sibling;
          var Ra = w(k, Hn, Ca.value, q);
          if (Ra === null) {
            Hn === null && (Hn = oi);
            break;
          }
          e && Hn && Ra.alternate === null && t(k, Hn), la = s(Ra, la, Br), Ut === null ? Wn = Ra : Ut.sibling = Ra, Ut = Ra, Hn = oi;
        }
        if (Ca.done) {
          if (a(k, Hn), zr()) {
            var ua = Br;
            Ws(k, ua);
          }
          return Wn;
        }
        if (Hn === null) {
          for (; !Ca.done; Br++, Ca = Nt.next()) {
            var Iu = b(k, Ca.value, q);
            Iu !== null && (la = s(Iu, la, Br), Ut === null ? Wn = Iu : Ut.sibling = Iu, Ut = Iu);
          }
          if (zr()) {
            var Qf = Br;
            Ws(k, Qf);
          }
          return Wn;
        }
        for (var Kp = i(k, Hn); !Ca.done; Br++, Ca = Nt.next()) {
          var Kl = M(Kp, k, Br, Ca.value, q);
          Kl !== null && (e && Kl.alternate !== null && Kp.delete(Kl.key === null ? Br : Kl.key), la = s(Kl, la, Br), Ut === null ? Wn = Kl : Ut.sibling = Kl, Ut = Kl);
        }
        if (e && Kp.forEach(function(X_) {
          return t(k, X_);
        }), zr()) {
          var q_ = Br;
          Ws(k, q_);
        }
        return Wn;
      }
      function Le(k, H, O, q) {
        if (H !== null && H.tag === je) {
          a(k, H.sibling);
          var pe = u(H, O);
          return pe.return = k, pe;
        }
        a(k, H);
        var oe = aE(O, k.mode, q);
        return oe.return = k, oe;
      }
      function we(k, H, O, q) {
        for (var pe = O.key, oe = H; oe !== null; ) {
          if (oe.key === pe) {
            var Pe = O.type;
            if (Pe === fi) {
              if (oe.tag === Xe) {
                a(k, oe.sibling);
                var We = u(oe, O.props.children);
                return We.return = k, We._debugSource = O._source, We._debugOwner = O._owner, We;
              }
            } else if (oe.elementType === Pe || // Keep this check inline so it only runs on the false path:
            gR(oe, O) || // Lazy types should reconcile their resolved type.
            // We need to do this after the Hot Reloading check above,
            // because hot reloading has different semantics than prod because
            // it doesn't resuspend. So we can't let the call below suspend.
            typeof Pe == "object" && Pe !== null && Pe.$$typeof === $e && dC(Pe) === oe.type) {
              a(k, oe.sibling);
              var qt = u(oe, O.props);
              return qt.ref = Sp(k, oe, O), qt.return = k, qt._debugSource = O._source, qt._debugOwner = O._owner, qt;
            }
            a(k, oe);
            break;
          } else
            t(k, oe);
          oe = oe.sibling;
        }
        if (O.type === fi) {
          var Nt = Yo(O.props.children, k.mode, q, O.key);
          return Nt.return = k, Nt;
        } else {
          var Wn = rE(O, k.mode, q);
          return Wn.ref = Sp(k, H, O), Wn.return = k, Wn;
        }
      }
      function Ct(k, H, O, q) {
        for (var pe = O.key, oe = H; oe !== null; ) {
          if (oe.key === pe)
            if (oe.tag === Se && oe.stateNode.containerInfo === O.containerInfo && oe.stateNode.implementation === O.implementation) {
              a(k, oe.sibling);
              var Pe = u(oe, O.children || []);
              return Pe.return = k, Pe;
            } else {
              a(k, oe);
              break;
            }
          else
            t(k, oe);
          oe = oe.sibling;
        }
        var We = iE(O, k.mode, q);
        return We.return = k, We;
      }
      function mt(k, H, O, q) {
        var pe = typeof O == "object" && O !== null && O.type === fi && O.key === null;
        if (pe && (O = O.props.children), typeof O == "object" && O !== null) {
          switch (O.$$typeof) {
            case br:
              return f(we(k, H, O, q));
            case nr:
              return f(Ct(k, H, O, q));
            case $e:
              var oe = O._payload, Pe = O._init;
              return mt(k, H, Pe(oe), q);
          }
          if (at(O))
            return F(k, H, O, q);
          if (qe(O))
            return ue(k, H, O, q);
          Wh(k, O);
        }
        return typeof O == "string" && O !== "" || typeof O == "number" ? f(Le(k, H, "" + O, q)) : (typeof O == "function" && Gh(k), a(k, H));
      }
      return mt;
    }
    var Df = pC(!0), vC = pC(!1);
    function xw(e, t) {
      if (e !== null && t.child !== e.child)
        throw new Error("Resuming work not yet implemented.");
      if (t.child !== null) {
        var a = t.child, i = lc(a, a.pendingProps);
        for (t.child = i, i.return = t; a.sibling !== null; )
          a = a.sibling, i = i.sibling = lc(a, a.pendingProps), i.return = t;
        i.sibling = null;
      }
    }
    function bw(e, t) {
      for (var a = e.child; a !== null; )
        p_(a, t), a = a.sibling;
    }
    var cg = Oo(null), fg;
    fg = {};
    var qh = null, kf = null, dg = null, Xh = !1;
    function Kh() {
      qh = null, kf = null, dg = null, Xh = !1;
    }
    function hC() {
      Xh = !0;
    }
    function mC() {
      Xh = !1;
    }
    function yC(e, t, a) {
      aa(cg, t._currentValue, e), t._currentValue = a, t._currentRenderer !== void 0 && t._currentRenderer !== null && t._currentRenderer !== fg && S("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), t._currentRenderer = fg;
    }
    function pg(e, t) {
      var a = cg.current;
      ra(cg, t), e._currentValue = a;
    }
    function vg(e, t, a) {
      for (var i = e; i !== null; ) {
        var u = i.alternate;
        if (_u(i.childLanes, t) ? u !== null && !_u(u.childLanes, t) && (u.childLanes = Ke(u.childLanes, t)) : (i.childLanes = Ke(i.childLanes, t), u !== null && (u.childLanes = Ke(u.childLanes, t))), i === a)
          break;
        i = i.return;
      }
      i !== a && S("Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue.");
    }
    function _w(e, t, a) {
      Dw(e, t, a);
    }
    function Dw(e, t, a) {
      var i = e.child;
      for (i !== null && (i.return = e); i !== null; ) {
        var u = void 0, s = i.dependencies;
        if (s !== null) {
          u = i.child;
          for (var f = s.firstContext; f !== null; ) {
            if (f.context === t) {
              if (i.tag === de) {
                var p = ws(a), v = Hu(Xt, p);
                v.tag = Zh;
                var y = i.updateQueue;
                if (y !== null) {
                  var g = y.shared, b = g.pending;
                  b === null ? v.next = v : (v.next = b.next, b.next = v), g.pending = v;
                }
              }
              i.lanes = Ke(i.lanes, a);
              var w = i.alternate;
              w !== null && (w.lanes = Ke(w.lanes, a)), vg(i.return, a, e), s.lanes = Ke(s.lanes, a);
              break;
            }
            f = f.next;
          }
        } else if (i.tag === vt)
          u = i.type === e.type ? null : i.child;
        else if (i.tag === Jt) {
          var M = i.return;
          if (M === null)
            throw new Error("We just came from a parent so we must have had a parent. This is a bug in React.");
          M.lanes = Ke(M.lanes, a);
          var z = M.alternate;
          z !== null && (z.lanes = Ke(z.lanes, a)), vg(M, a, e), u = i.sibling;
        } else
          u = i.child;
        if (u !== null)
          u.return = i;
        else
          for (u = i; u !== null; ) {
            if (u === e) {
              u = null;
              break;
            }
            var F = u.sibling;
            if (F !== null) {
              F.return = u.return, u = F;
              break;
            }
            u = u.return;
          }
        i = u;
      }
    }
    function Of(e, t) {
      qh = e, kf = null, dg = null;
      var a = e.dependencies;
      if (a !== null) {
        var i = a.firstContext;
        i !== null && (Zr(a.lanes, t) && Up(), a.firstContext = null);
      }
    }
    function er(e) {
      Xh && S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      var t = e._currentValue;
      if (dg !== e) {
        var a = {
          context: e,
          memoizedValue: t,
          next: null
        };
        if (kf === null) {
          if (qh === null)
            throw new Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
          kf = a, qh.dependencies = {
            lanes: Y,
            firstContext: a
          };
        } else
          kf = kf.next = a;
      }
      return t;
    }
    var Js = null;
    function hg(e) {
      Js === null ? Js = [e] : Js.push(e);
    }
    function kw() {
      if (Js !== null) {
        for (var e = 0; e < Js.length; e++) {
          var t = Js[e], a = t.interleaved;
          if (a !== null) {
            t.interleaved = null;
            var i = a.next, u = t.pending;
            if (u !== null) {
              var s = u.next;
              u.next = i, a.next = s;
            }
            t.pending = a;
          }
        }
        Js = null;
      }
    }
    function gC(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, hg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Jh(e, i);
    }
    function Ow(e, t, a, i) {
      var u = t.interleaved;
      u === null ? (a.next = a, hg(t)) : (a.next = u.next, u.next = a), t.interleaved = a;
    }
    function Lw(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, hg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Jh(e, i);
    }
    function Fa(e, t) {
      return Jh(e, t);
    }
    var Mw = Jh;
    function Jh(e, t) {
      e.lanes = Ke(e.lanes, t);
      var a = e.alternate;
      a !== null && (a.lanes = Ke(a.lanes, t)), a === null && (e.flags & (hn | Gr)) !== _e && vR(e);
      for (var i = e, u = e.return; u !== null; )
        u.childLanes = Ke(u.childLanes, t), a = u.alternate, a !== null ? a.childLanes = Ke(a.childLanes, t) : (u.flags & (hn | Gr)) !== _e && vR(e), i = u, u = u.return;
      if (i.tag === Z) {
        var s = i.stateNode;
        return s;
      } else
        return null;
    }
    var SC = 0, EC = 1, Zh = 2, mg = 3, em = !1, yg, tm;
    yg = !1, tm = null;
    function gg(e) {
      var t = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
          pending: null,
          interleaved: null,
          lanes: Y
        },
        effects: null
      };
      e.updateQueue = t;
    }
    function CC(e, t) {
      var a = t.updateQueue, i = e.updateQueue;
      if (a === i) {
        var u = {
          baseState: i.baseState,
          firstBaseUpdate: i.firstBaseUpdate,
          lastBaseUpdate: i.lastBaseUpdate,
          shared: i.shared,
          effects: i.effects
        };
        t.updateQueue = u;
      }
    }
    function Hu(e, t) {
      var a = {
        eventTime: e,
        lane: t,
        tag: SC,
        payload: null,
        callback: null,
        next: null
      };
      return a;
    }
    function Uo(e, t, a) {
      var i = e.updateQueue;
      if (i === null)
        return null;
      var u = i.shared;
      if (tm === u && !yg && (S("An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback."), yg = !0), Ob()) {
        var s = u.pending;
        return s === null ? t.next = t : (t.next = s.next, s.next = t), u.pending = t, Mw(e, a);
      } else
        return Lw(e, u, t, a);
    }
    function nm(e, t, a) {
      var i = t.updateQueue;
      if (i !== null) {
        var u = i.shared;
        if (Md(a)) {
          var s = u.lanes;
          s = Ud(s, e.pendingLanes);
          var f = Ke(s, a);
          u.lanes = f, tf(e, f);
        }
      }
    }
    function Sg(e, t) {
      var a = e.updateQueue, i = e.alternate;
      if (i !== null) {
        var u = i.updateQueue;
        if (a === u) {
          var s = null, f = null, p = a.firstBaseUpdate;
          if (p !== null) {
            var v = p;
            do {
              var y = {
                eventTime: v.eventTime,
                lane: v.lane,
                tag: v.tag,
                payload: v.payload,
                callback: v.callback,
                next: null
              };
              f === null ? s = f = y : (f.next = y, f = y), v = v.next;
            } while (v !== null);
            f === null ? s = f = t : (f.next = t, f = t);
          } else
            s = f = t;
          a = {
            baseState: u.baseState,
            firstBaseUpdate: s,
            lastBaseUpdate: f,
            shared: u.shared,
            effects: u.effects
          }, e.updateQueue = a;
          return;
        }
      }
      var g = a.lastBaseUpdate;
      g === null ? a.firstBaseUpdate = t : g.next = t, a.lastBaseUpdate = t;
    }
    function Nw(e, t, a, i, u, s) {
      switch (a.tag) {
        case EC: {
          var f = a.payload;
          if (typeof f == "function") {
            hC();
            var p = f.call(s, i, u);
            {
              if (e.mode & Wt) {
                mn(!0);
                try {
                  f.call(s, i, u);
                } finally {
                  mn(!1);
                }
              }
              mC();
            }
            return p;
          }
          return f;
        }
        case mg:
          e.flags = e.flags & ~Xn | xe;
        case SC: {
          var v = a.payload, y;
          if (typeof v == "function") {
            hC(), y = v.call(s, i, u);
            {
              if (e.mode & Wt) {
                mn(!0);
                try {
                  v.call(s, i, u);
                } finally {
                  mn(!1);
                }
              }
              mC();
            }
          } else
            y = v;
          return y == null ? i : et({}, i, y);
        }
        case Zh:
          return em = !0, i;
      }
      return i;
    }
    function rm(e, t, a, i) {
      var u = e.updateQueue;
      em = !1, tm = u.shared;
      var s = u.firstBaseUpdate, f = u.lastBaseUpdate, p = u.shared.pending;
      if (p !== null) {
        u.shared.pending = null;
        var v = p, y = v.next;
        v.next = null, f === null ? s = y : f.next = y, f = v;
        var g = e.alternate;
        if (g !== null) {
          var b = g.updateQueue, w = b.lastBaseUpdate;
          w !== f && (w === null ? b.firstBaseUpdate = y : w.next = y, b.lastBaseUpdate = v);
        }
      }
      if (s !== null) {
        var M = u.baseState, z = Y, F = null, ue = null, Le = null, we = s;
        do {
          var Ct = we.lane, mt = we.eventTime;
          if (_u(i, Ct)) {
            if (Le !== null) {
              var H = {
                eventTime: mt,
                // This update is going to be committed so we never want uncommit
                // it. Using NoLane works because 0 is a subset of all bitmasks, so
                // this will never be skipped by the check above.
                lane: _t,
                tag: we.tag,
                payload: we.payload,
                callback: we.callback,
                next: null
              };
              Le = Le.next = H;
            }
            M = Nw(e, u, we, M, t, a);
            var O = we.callback;
            if (O !== null && // If the update was already committed, we should not queue its
            // callback again.
            we.lane !== _t) {
              e.flags |= rn;
              var q = u.effects;
              q === null ? u.effects = [we] : q.push(we);
            }
          } else {
            var k = {
              eventTime: mt,
              lane: Ct,
              tag: we.tag,
              payload: we.payload,
              callback: we.callback,
              next: null
            };
            Le === null ? (ue = Le = k, F = M) : Le = Le.next = k, z = Ke(z, Ct);
          }
          if (we = we.next, we === null) {
            if (p = u.shared.pending, p === null)
              break;
            var pe = p, oe = pe.next;
            pe.next = null, we = oe, u.lastBaseUpdate = pe, u.shared.pending = null;
          }
        } while (!0);
        Le === null && (F = M), u.baseState = F, u.firstBaseUpdate = ue, u.lastBaseUpdate = Le;
        var Pe = u.shared.interleaved;
        if (Pe !== null) {
          var We = Pe;
          do
            z = Ke(z, We.lane), We = We.next;
          while (We !== Pe);
        } else s === null && (u.shared.lanes = Y);
        Qp(z), e.lanes = z, e.memoizedState = M;
      }
      tm = null;
    }
    function Uw(e, t) {
      if (typeof e != "function")
        throw new Error("Invalid argument passed as callback. Expected a function. Instead " + ("received: " + e));
      e.call(t);
    }
    function RC() {
      em = !1;
    }
    function am() {
      return em;
    }
    function TC(e, t, a) {
      var i = t.effects;
      if (t.effects = null, i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u], f = s.callback;
          f !== null && (s.callback = null, Uw(f, a));
        }
    }
    var Ep = {}, zo = Oo(Ep), Cp = Oo(Ep), im = Oo(Ep);
    function lm(e) {
      if (e === Ep)
        throw new Error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.");
      return e;
    }
    function wC() {
      var e = lm(im.current);
      return e;
    }
    function Eg(e, t) {
      aa(im, t, e), aa(Cp, e, e), aa(zo, Ep, e);
      var a = KT(t);
      ra(zo, e), aa(zo, a, e);
    }
    function Lf(e) {
      ra(zo, e), ra(Cp, e), ra(im, e);
    }
    function Cg() {
      var e = lm(zo.current);
      return e;
    }
    function xC(e) {
      lm(im.current);
      var t = lm(zo.current), a = JT(t, e.type);
      t !== a && (aa(Cp, e, e), aa(zo, a, e));
    }
    function Rg(e) {
      Cp.current === e && (ra(zo, e), ra(Cp, e));
    }
    var zw = 0, bC = 1, _C = 1, Rp = 2, al = Oo(zw);
    function Tg(e, t) {
      return (e & t) !== 0;
    }
    function Mf(e) {
      return e & bC;
    }
    function wg(e, t) {
      return e & bC | t;
    }
    function Aw(e, t) {
      return e | t;
    }
    function Ao(e, t) {
      aa(al, t, e);
    }
    function Nf(e) {
      ra(al, e);
    }
    function jw(e, t) {
      var a = e.memoizedState;
      return a !== null ? a.dehydrated !== null : (e.memoizedProps, !0);
    }
    function um(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === be) {
          var a = t.memoizedState;
          if (a !== null) {
            var i = a.dehydrated;
            if (i === null || YE(i) || By(i))
              return t;
          }
        } else if (t.tag === ln && // revealOrder undefined can't be trusted because it don't
        // keep track of whether it suspended or not.
        t.memoizedProps.revealOrder !== void 0) {
          var u = (t.flags & xe) !== _e;
          if (u)
            return t;
        } else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e)
          return null;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return null;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return null;
    }
    var Ha = (
      /*   */
      0
    ), sr = (
      /* */
      1
    ), Yl = (
      /*  */
      2
    ), cr = (
      /*    */
      4
    ), Ar = (
      /*   */
      8
    ), xg = [];
    function bg() {
      for (var e = 0; e < xg.length; e++) {
        var t = xg[e];
        t._workInProgressVersionPrimary = null;
      }
      xg.length = 0;
    }
    function Fw(e, t) {
      var a = t._getVersion, i = a(t._source);
      e.mutableSourceEagerHydrationData == null ? e.mutableSourceEagerHydrationData = [t, i] : e.mutableSourceEagerHydrationData.push(t, i);
    }
    var fe = A.ReactCurrentDispatcher, Tp = A.ReactCurrentBatchConfig, _g, Uf;
    _g = /* @__PURE__ */ new Set();
    var Zs = Y, Gt = null, fr = null, dr = null, om = !1, wp = !1, xp = 0, Hw = 0, Pw = 25, V = null, Ui = null, jo = -1, Dg = !1;
    function Pt() {
      {
        var e = V;
        Ui === null ? Ui = [e] : Ui.push(e);
      }
    }
    function te() {
      {
        var e = V;
        Ui !== null && (jo++, Ui[jo] !== e && Vw(e));
      }
    }
    function zf(e) {
      e != null && !at(e) && S("%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.", V, typeof e);
    }
    function Vw(e) {
      {
        var t = Be(Gt);
        if (!_g.has(t) && (_g.add(t), Ui !== null)) {
          for (var a = "", i = 30, u = 0; u <= jo; u++) {
            for (var s = Ui[u], f = u === jo ? e : s, p = u + 1 + ". " + s; p.length < i; )
              p += " ";
            p += f + `
`, a += p;
          }
          S(`React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
`, t, a);
        }
      }
    }
    function ia() {
      throw new Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`);
    }
    function kg(e, t) {
      if (Dg)
        return !1;
      if (t === null)
        return S("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", V), !1;
      e.length !== t.length && S(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, V, "[" + t.join(", ") + "]", "[" + e.join(", ") + "]");
      for (var a = 0; a < t.length && a < e.length; a++)
        if (!W(e[a], t[a]))
          return !1;
      return !0;
    }
    function Af(e, t, a, i, u, s) {
      Zs = s, Gt = t, Ui = e !== null ? e._debugHookTypes : null, jo = -1, Dg = e !== null && e.type !== t.type, t.memoizedState = null, t.updateQueue = null, t.lanes = Y, e !== null && e.memoizedState !== null ? fe.current = qC : Ui !== null ? fe.current = GC : fe.current = WC;
      var f = a(i, u);
      if (wp) {
        var p = 0;
        do {
          if (wp = !1, xp = 0, p >= Pw)
            throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          p += 1, Dg = !1, fr = null, dr = null, t.updateQueue = null, jo = -1, fe.current = XC, f = a(i, u);
        } while (wp);
      }
      fe.current = Cm, t._debugHookTypes = Ui;
      var v = fr !== null && fr.next !== null;
      if (Zs = Y, Gt = null, fr = null, dr = null, V = null, Ui = null, jo = -1, e !== null && (e.flags & Nn) !== (t.flags & Nn) && // Disable this warning in legacy mode, because legacy Suspense is weird
      // and creates false positives. To make this work in legacy mode, we'd
      // need to mark fibers that commit in an incomplete state, somehow. For
      // now I'll disable the warning that most of the bugs that would trigger
      // it are either exclusive to concurrent mode or exist in both.
      (e.mode & st) !== De && S("Internal React error: Expected static flag was missing. Please notify the React team."), om = !1, v)
        throw new Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
      return f;
    }
    function jf() {
      var e = xp !== 0;
      return xp = 0, e;
    }
    function DC(e, t, a) {
      t.updateQueue = e.updateQueue, (t.mode & Lt) !== De ? t.flags &= -50333701 : t.flags &= -2053, e.lanes = xs(e.lanes, a);
    }
    function kC() {
      if (fe.current = Cm, om) {
        for (var e = Gt.memoizedState; e !== null; ) {
          var t = e.queue;
          t !== null && (t.pending = null), e = e.next;
        }
        om = !1;
      }
      Zs = Y, Gt = null, fr = null, dr = null, Ui = null, jo = -1, V = null, BC = !1, wp = !1, xp = 0;
    }
    function Il() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
      };
      return dr === null ? Gt.memoizedState = dr = e : dr = dr.next = e, dr;
    }
    function zi() {
      var e;
      if (fr === null) {
        var t = Gt.alternate;
        t !== null ? e = t.memoizedState : e = null;
      } else
        e = fr.next;
      var a;
      if (dr === null ? a = Gt.memoizedState : a = dr.next, a !== null)
        dr = a, a = dr.next, fr = e;
      else {
        if (e === null)
          throw new Error("Rendered more hooks than during the previous render.");
        fr = e;
        var i = {
          memoizedState: fr.memoizedState,
          baseState: fr.baseState,
          baseQueue: fr.baseQueue,
          queue: fr.queue,
          next: null
        };
        dr === null ? Gt.memoizedState = dr = i : dr = dr.next = i;
      }
      return dr;
    }
    function OC() {
      return {
        lastEffect: null,
        stores: null
      };
    }
    function Og(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function Lg(e, t, a) {
      var i = Il(), u;
      a !== void 0 ? u = a(t) : u = t, i.memoizedState = i.baseState = u;
      var s = {
        pending: null,
        interleaved: null,
        lanes: Y,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: u
      };
      i.queue = s;
      var f = s.dispatch = Iw.bind(null, Gt, s);
      return [i.memoizedState, f];
    }
    function Mg(e, t, a) {
      var i = zi(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = fr, f = s.baseQueue, p = u.pending;
      if (p !== null) {
        if (f !== null) {
          var v = f.next, y = p.next;
          f.next = y, p.next = v;
        }
        s.baseQueue !== f && S("Internal error: Expected work-in-progress queue to be a clone. This is a bug in React."), s.baseQueue = f = p, u.pending = null;
      }
      if (f !== null) {
        var g = f.next, b = s.baseState, w = null, M = null, z = null, F = g;
        do {
          var ue = F.lane;
          if (_u(Zs, ue)) {
            if (z !== null) {
              var we = {
                // This update is going to be committed so we never want uncommit
                // it. Using NoLane works because 0 is a subset of all bitmasks, so
                // this will never be skipped by the check above.
                lane: _t,
                action: F.action,
                hasEagerState: F.hasEagerState,
                eagerState: F.eagerState,
                next: null
              };
              z = z.next = we;
            }
            if (F.hasEagerState)
              b = F.eagerState;
            else {
              var Ct = F.action;
              b = e(b, Ct);
            }
          } else {
            var Le = {
              lane: ue,
              action: F.action,
              hasEagerState: F.hasEagerState,
              eagerState: F.eagerState,
              next: null
            };
            z === null ? (M = z = Le, w = b) : z = z.next = Le, Gt.lanes = Ke(Gt.lanes, ue), Qp(ue);
          }
          F = F.next;
        } while (F !== null && F !== g);
        z === null ? w = b : z.next = M, W(b, i.memoizedState) || Up(), i.memoizedState = b, i.baseState = w, i.baseQueue = z, u.lastRenderedState = b;
      }
      var mt = u.interleaved;
      if (mt !== null) {
        var k = mt;
        do {
          var H = k.lane;
          Gt.lanes = Ke(Gt.lanes, H), Qp(H), k = k.next;
        } while (k !== mt);
      } else f === null && (u.lanes = Y);
      var O = u.dispatch;
      return [i.memoizedState, O];
    }
    function Ng(e, t, a) {
      var i = zi(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = u.dispatch, f = u.pending, p = i.memoizedState;
      if (f !== null) {
        u.pending = null;
        var v = f.next, y = v;
        do {
          var g = y.action;
          p = e(p, g), y = y.next;
        } while (y !== v);
        W(p, i.memoizedState) || Up(), i.memoizedState = p, i.baseQueue === null && (i.baseState = p), u.lastRenderedState = p;
      }
      return [p, s];
    }
    function dD(e, t, a) {
    }
    function pD(e, t, a) {
    }
    function Ug(e, t, a) {
      var i = Gt, u = Il(), s, f = zr();
      if (f) {
        if (a === void 0)
          throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
        s = a(), Uf || s !== a() && (S("The result of getServerSnapshot should be cached to avoid an infinite loop"), Uf = !0);
      } else {
        if (s = t(), !Uf) {
          var p = t();
          W(s, p) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), Uf = !0);
        }
        var v = Pm();
        if (v === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Zc(v, Zs) || LC(i, t, s);
      }
      u.memoizedState = s;
      var y = {
        value: s,
        getSnapshot: t
      };
      return u.queue = y, pm(NC.bind(null, i, y, e), [e]), i.flags |= Wr, bp(sr | Ar, MC.bind(null, i, y, s, t), void 0, null), s;
    }
    function sm(e, t, a) {
      var i = Gt, u = zi(), s = t();
      if (!Uf) {
        var f = t();
        W(s, f) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), Uf = !0);
      }
      var p = u.memoizedState, v = !W(p, s);
      v && (u.memoizedState = s, Up());
      var y = u.queue;
      if (Dp(NC.bind(null, i, y, e), [e]), y.getSnapshot !== t || v || // Check if the susbcribe function changed. We can save some memory by
      // checking whether we scheduled a subscription effect above.
      dr !== null && dr.memoizedState.tag & sr) {
        i.flags |= Wr, bp(sr | Ar, MC.bind(null, i, y, s, t), void 0, null);
        var g = Pm();
        if (g === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Zc(g, Zs) || LC(i, t, s);
      }
      return s;
    }
    function LC(e, t, a) {
      e.flags |= vo;
      var i = {
        getSnapshot: t,
        value: a
      }, u = Gt.updateQueue;
      if (u === null)
        u = OC(), Gt.updateQueue = u, u.stores = [i];
      else {
        var s = u.stores;
        s === null ? u.stores = [i] : s.push(i);
      }
    }
    function MC(e, t, a, i) {
      t.value = a, t.getSnapshot = i, UC(t) && zC(e);
    }
    function NC(e, t, a) {
      var i = function() {
        UC(t) && zC(e);
      };
      return a(i);
    }
    function UC(e) {
      var t = e.getSnapshot, a = e.value;
      try {
        var i = t();
        return !W(a, i);
      } catch {
        return !0;
      }
    }
    function zC(e) {
      var t = Fa(e, Ae);
      t !== null && mr(t, e, Ae, Xt);
    }
    function cm(e) {
      var t = Il();
      typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        interleaved: null,
        lanes: Y,
        dispatch: null,
        lastRenderedReducer: Og,
        lastRenderedState: e
      };
      t.queue = a;
      var i = a.dispatch = Qw.bind(null, Gt, a);
      return [t.memoizedState, i];
    }
    function zg(e) {
      return Mg(Og);
    }
    function Ag(e) {
      return Ng(Og);
    }
    function bp(e, t, a, i) {
      var u = {
        tag: e,
        create: t,
        destroy: a,
        deps: i,
        // Circular
        next: null
      }, s = Gt.updateQueue;
      if (s === null)
        s = OC(), Gt.updateQueue = s, s.lastEffect = u.next = u;
      else {
        var f = s.lastEffect;
        if (f === null)
          s.lastEffect = u.next = u;
        else {
          var p = f.next;
          f.next = u, u.next = p, s.lastEffect = u;
        }
      }
      return u;
    }
    function jg(e) {
      var t = Il();
      {
        var a = {
          current: e
        };
        return t.memoizedState = a, a;
      }
    }
    function fm(e) {
      var t = zi();
      return t.memoizedState;
    }
    function _p(e, t, a, i) {
      var u = Il(), s = i === void 0 ? null : i;
      Gt.flags |= e, u.memoizedState = bp(sr | t, a, void 0, s);
    }
    function dm(e, t, a, i) {
      var u = zi(), s = i === void 0 ? null : i, f = void 0;
      if (fr !== null) {
        var p = fr.memoizedState;
        if (f = p.destroy, s !== null) {
          var v = p.deps;
          if (kg(s, v)) {
            u.memoizedState = bp(t, a, f, s);
            return;
          }
        }
      }
      Gt.flags |= e, u.memoizedState = bp(sr | t, a, f, s);
    }
    function pm(e, t) {
      return (Gt.mode & Lt) !== De ? _p(Ri | Wr | bc, Ar, e, t) : _p(Wr | bc, Ar, e, t);
    }
    function Dp(e, t) {
      return dm(Wr, Ar, e, t);
    }
    function Fg(e, t) {
      return _p(gt, Yl, e, t);
    }
    function vm(e, t) {
      return dm(gt, Yl, e, t);
    }
    function Hg(e, t) {
      var a = gt;
      return a |= Qi, (Gt.mode & Lt) !== De && (a |= bl), _p(a, cr, e, t);
    }
    function hm(e, t) {
      return dm(gt, cr, e, t);
    }
    function AC(e, t) {
      if (typeof t == "function") {
        var a = t, i = e();
        return a(i), function() {
          a(null);
        };
      } else if (t != null) {
        var u = t;
        u.hasOwnProperty("current") || S("Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.", "an object with keys {" + Object.keys(u).join(", ") + "}");
        var s = e();
        return u.current = s, function() {
          u.current = null;
        };
      }
    }
    function Pg(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null, u = gt;
      return u |= Qi, (Gt.mode & Lt) !== De && (u |= bl), _p(u, cr, AC.bind(null, t, e), i);
    }
    function mm(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null;
      return dm(gt, cr, AC.bind(null, t, e), i);
    }
    function Bw(e, t) {
    }
    var ym = Bw;
    function Vg(e, t) {
      var a = Il(), i = t === void 0 ? null : t;
      return a.memoizedState = [e, i], e;
    }
    function gm(e, t) {
      var a = zi(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (kg(i, s))
          return u[0];
      }
      return a.memoizedState = [e, i], e;
    }
    function Bg(e, t) {
      var a = Il(), i = t === void 0 ? null : t, u = e();
      return a.memoizedState = [u, i], u;
    }
    function Sm(e, t) {
      var a = zi(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (kg(i, s))
          return u[0];
      }
      var f = e();
      return a.memoizedState = [f, i], f;
    }
    function $g(e) {
      var t = Il();
      return t.memoizedState = e, e;
    }
    function jC(e) {
      var t = zi(), a = fr, i = a.memoizedState;
      return HC(t, i, e);
    }
    function FC(e) {
      var t = zi();
      if (fr === null)
        return t.memoizedState = e, e;
      var a = fr.memoizedState;
      return HC(t, a, e);
    }
    function HC(e, t, a) {
      var i = !Od(Zs);
      if (i) {
        if (!W(a, t)) {
          var u = Nd();
          Gt.lanes = Ke(Gt.lanes, u), Qp(u), e.baseState = !0;
        }
        return t;
      } else
        return e.baseState && (e.baseState = !1, Up()), e.memoizedState = a, a;
    }
    function $w(e, t, a) {
      var i = za();
      An(Xv(i, bi)), e(!0);
      var u = Tp.transition;
      Tp.transition = {};
      var s = Tp.transition;
      Tp.transition._updatedFibers = /* @__PURE__ */ new Set();
      try {
        e(!1), t();
      } finally {
        if (An(i), Tp.transition = u, u === null && s._updatedFibers) {
          var f = s._updatedFibers.size;
          f > 10 && Ie("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), s._updatedFibers.clear();
        }
      }
    }
    function Yg() {
      var e = cm(!1), t = e[0], a = e[1], i = $w.bind(null, a), u = Il();
      return u.memoizedState = i, [t, i];
    }
    function PC() {
      var e = zg(), t = e[0], a = zi(), i = a.memoizedState;
      return [t, i];
    }
    function VC() {
      var e = Ag(), t = e[0], a = zi(), i = a.memoizedState;
      return [t, i];
    }
    var BC = !1;
    function Yw() {
      return BC;
    }
    function Ig() {
      var e = Il(), t = Pm(), a = t.identifierPrefix, i;
      if (zr()) {
        var u = uw();
        i = ":" + a + "R" + u;
        var s = xp++;
        s > 0 && (i += "H" + s.toString(32)), i += ":";
      } else {
        var f = Hw++;
        i = ":" + a + "r" + f.toString(32) + ":";
      }
      return e.memoizedState = i, i;
    }
    function Em() {
      var e = zi(), t = e.memoizedState;
      return t;
    }
    function Iw(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = Bo(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if ($C(e))
        YC(t, u);
      else {
        var s = gC(e, t, u, i);
        if (s !== null) {
          var f = Ea();
          mr(s, e, i, f), IC(s, t, i);
        }
      }
      QC(e, i);
    }
    function Qw(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = Bo(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if ($C(e))
        YC(t, u);
      else {
        var s = e.alternate;
        if (e.lanes === Y && (s === null || s.lanes === Y)) {
          var f = t.lastRenderedReducer;
          if (f !== null) {
            var p;
            p = fe.current, fe.current = il;
            try {
              var v = t.lastRenderedState, y = f(v, a);
              if (u.hasEagerState = !0, u.eagerState = y, W(y, v)) {
                Ow(e, t, u, i);
                return;
              }
            } catch {
            } finally {
              fe.current = p;
            }
          }
        }
        var g = gC(e, t, u, i);
        if (g !== null) {
          var b = Ea();
          mr(g, e, i, b), IC(g, t, i);
        }
      }
      QC(e, i);
    }
    function $C(e) {
      var t = e.alternate;
      return e === Gt || t !== null && t === Gt;
    }
    function YC(e, t) {
      wp = om = !0;
      var a = e.pending;
      a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
    }
    function IC(e, t, a) {
      if (Md(a)) {
        var i = t.lanes;
        i = Ud(i, e.pendingLanes);
        var u = Ke(i, a);
        t.lanes = u, tf(e, u);
      }
    }
    function QC(e, t, a) {
      hs(e, t);
    }
    var Cm = {
      readContext: er,
      useCallback: ia,
      useContext: ia,
      useEffect: ia,
      useImperativeHandle: ia,
      useInsertionEffect: ia,
      useLayoutEffect: ia,
      useMemo: ia,
      useReducer: ia,
      useRef: ia,
      useState: ia,
      useDebugValue: ia,
      useDeferredValue: ia,
      useTransition: ia,
      useMutableSource: ia,
      useSyncExternalStore: ia,
      useId: ia,
      unstable_isNewReconciler: J
    }, WC = null, GC = null, qC = null, XC = null, Ql = null, il = null, Rm = null;
    {
      var Qg = function() {
        S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      }, Ye = function() {
        S("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
      };
      WC = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Pt(), zf(t), Vg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Pt(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Pt(), zf(t), pm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Pt(), zf(a), Pg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Pt(), zf(t), Fg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Pt(), zf(t), Hg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Pt(), zf(t);
          var a = fe.current;
          fe.current = Ql;
          try {
            return Bg(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Pt();
          var i = fe.current;
          fe.current = Ql;
          try {
            return Lg(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Pt(), jg(e);
        },
        useState: function(e) {
          V = "useState", Pt();
          var t = fe.current;
          fe.current = Ql;
          try {
            return cm(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Pt(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Pt(), $g(e);
        },
        useTransition: function() {
          return V = "useTransition", Pt(), Yg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Pt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Pt(), Ug(e, t, a);
        },
        useId: function() {
          return V = "useId", Pt(), Ig();
        },
        unstable_isNewReconciler: J
      }, GC = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", te(), Vg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", te(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", te(), pm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", te(), Pg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", te(), Fg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", te(), Hg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", te();
          var a = fe.current;
          fe.current = Ql;
          try {
            return Bg(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", te();
          var i = fe.current;
          fe.current = Ql;
          try {
            return Lg(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", te(), jg(e);
        },
        useState: function(e) {
          V = "useState", te();
          var t = fe.current;
          fe.current = Ql;
          try {
            return cm(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", te(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", te(), $g(e);
        },
        useTransition: function() {
          return V = "useTransition", te(), Yg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", te(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", te(), Ug(e, t, a);
        },
        useId: function() {
          return V = "useId", te(), Ig();
        },
        unstable_isNewReconciler: J
      }, qC = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", te(), gm(e, t);
        },
        useContext: function(e) {
          return V = "useContext", te(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", te(), Dp(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", te(), mm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", te(), vm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", te(), hm(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", te();
          var a = fe.current;
          fe.current = il;
          try {
            return Sm(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", te();
          var i = fe.current;
          fe.current = il;
          try {
            return Mg(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", te(), fm();
        },
        useState: function(e) {
          V = "useState", te();
          var t = fe.current;
          fe.current = il;
          try {
            return zg(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", te(), ym();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", te(), jC(e);
        },
        useTransition: function() {
          return V = "useTransition", te(), PC();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", te(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", te(), sm(e, t);
        },
        useId: function() {
          return V = "useId", te(), Em();
        },
        unstable_isNewReconciler: J
      }, XC = {
        readContext: function(e) {
          return er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", te(), gm(e, t);
        },
        useContext: function(e) {
          return V = "useContext", te(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", te(), Dp(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", te(), mm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", te(), vm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", te(), hm(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", te();
          var a = fe.current;
          fe.current = Rm;
          try {
            return Sm(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", te();
          var i = fe.current;
          fe.current = Rm;
          try {
            return Ng(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", te(), fm();
        },
        useState: function(e) {
          V = "useState", te();
          var t = fe.current;
          fe.current = Rm;
          try {
            return Ag(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", te(), ym();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", te(), FC(e);
        },
        useTransition: function() {
          return V = "useTransition", te(), VC();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", te(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", te(), sm(e, t);
        },
        useId: function() {
          return V = "useId", te(), Em();
        },
        unstable_isNewReconciler: J
      }, Ql = {
        readContext: function(e) {
          return Qg(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ye(), Pt(), Vg(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ye(), Pt(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ye(), Pt(), pm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ye(), Pt(), Pg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ye(), Pt(), Fg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ye(), Pt(), Hg(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ye(), Pt();
          var a = fe.current;
          fe.current = Ql;
          try {
            return Bg(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ye(), Pt();
          var i = fe.current;
          fe.current = Ql;
          try {
            return Lg(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ye(), Pt(), jg(e);
        },
        useState: function(e) {
          V = "useState", Ye(), Pt();
          var t = fe.current;
          fe.current = Ql;
          try {
            return cm(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ye(), Pt(), void 0;
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ye(), Pt(), $g(e);
        },
        useTransition: function() {
          return V = "useTransition", Ye(), Pt(), Yg();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ye(), Pt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ye(), Pt(), Ug(e, t, a);
        },
        useId: function() {
          return V = "useId", Ye(), Pt(), Ig();
        },
        unstable_isNewReconciler: J
      }, il = {
        readContext: function(e) {
          return Qg(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ye(), te(), gm(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ye(), te(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ye(), te(), Dp(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ye(), te(), mm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ye(), te(), vm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ye(), te(), hm(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ye(), te();
          var a = fe.current;
          fe.current = il;
          try {
            return Sm(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ye(), te();
          var i = fe.current;
          fe.current = il;
          try {
            return Mg(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ye(), te(), fm();
        },
        useState: function(e) {
          V = "useState", Ye(), te();
          var t = fe.current;
          fe.current = il;
          try {
            return zg(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ye(), te(), ym();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ye(), te(), jC(e);
        },
        useTransition: function() {
          return V = "useTransition", Ye(), te(), PC();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ye(), te(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ye(), te(), sm(e, t);
        },
        useId: function() {
          return V = "useId", Ye(), te(), Em();
        },
        unstable_isNewReconciler: J
      }, Rm = {
        readContext: function(e) {
          return Qg(), er(e);
        },
        useCallback: function(e, t) {
          return V = "useCallback", Ye(), te(), gm(e, t);
        },
        useContext: function(e) {
          return V = "useContext", Ye(), te(), er(e);
        },
        useEffect: function(e, t) {
          return V = "useEffect", Ye(), te(), Dp(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return V = "useImperativeHandle", Ye(), te(), mm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return V = "useInsertionEffect", Ye(), te(), vm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return V = "useLayoutEffect", Ye(), te(), hm(e, t);
        },
        useMemo: function(e, t) {
          V = "useMemo", Ye(), te();
          var a = fe.current;
          fe.current = il;
          try {
            return Sm(e, t);
          } finally {
            fe.current = a;
          }
        },
        useReducer: function(e, t, a) {
          V = "useReducer", Ye(), te();
          var i = fe.current;
          fe.current = il;
          try {
            return Ng(e, t, a);
          } finally {
            fe.current = i;
          }
        },
        useRef: function(e) {
          return V = "useRef", Ye(), te(), fm();
        },
        useState: function(e) {
          V = "useState", Ye(), te();
          var t = fe.current;
          fe.current = il;
          try {
            return Ag(e);
          } finally {
            fe.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return V = "useDebugValue", Ye(), te(), ym();
        },
        useDeferredValue: function(e) {
          return V = "useDeferredValue", Ye(), te(), FC(e);
        },
        useTransition: function() {
          return V = "useTransition", Ye(), te(), VC();
        },
        useMutableSource: function(e, t, a) {
          return V = "useMutableSource", Ye(), te(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return V = "useSyncExternalStore", Ye(), te(), sm(e, t);
        },
        useId: function() {
          return V = "useId", Ye(), te(), Em();
        },
        unstable_isNewReconciler: J
      };
    }
    var Fo = X.unstable_now, KC = 0, Tm = -1, kp = -1, wm = -1, Wg = !1, xm = !1;
    function JC() {
      return Wg;
    }
    function Ww() {
      xm = !0;
    }
    function Gw() {
      Wg = !1, xm = !1;
    }
    function qw() {
      Wg = xm, xm = !1;
    }
    function ZC() {
      return KC;
    }
    function e0() {
      KC = Fo();
    }
    function Gg(e) {
      kp = Fo(), e.actualStartTime < 0 && (e.actualStartTime = Fo());
    }
    function t0(e) {
      kp = -1;
    }
    function bm(e, t) {
      if (kp >= 0) {
        var a = Fo() - kp;
        e.actualDuration += a, t && (e.selfBaseDuration = a), kp = -1;
      }
    }
    function Wl(e) {
      if (Tm >= 0) {
        var t = Fo() - Tm;
        Tm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case Z:
              var i = a.stateNode;
              i.effectDuration += t;
              return;
            case ht:
              var u = a.stateNode;
              u.effectDuration += t;
              return;
          }
          a = a.return;
        }
      }
    }
    function qg(e) {
      if (wm >= 0) {
        var t = Fo() - wm;
        wm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case Z:
              var i = a.stateNode;
              i !== null && (i.passiveEffectDuration += t);
              return;
            case ht:
              var u = a.stateNode;
              u !== null && (u.passiveEffectDuration += t);
              return;
          }
          a = a.return;
        }
      }
    }
    function Gl() {
      Tm = Fo();
    }
    function Xg() {
      wm = Fo();
    }
    function Kg(e) {
      for (var t = e.child; t; )
        e.actualDuration += t.actualDuration, t = t.sibling;
    }
    function ll(e, t) {
      if (e && e.defaultProps) {
        var a = et({}, t), i = e.defaultProps;
        for (var u in i)
          a[u] === void 0 && (a[u] = i[u]);
        return a;
      }
      return t;
    }
    var Jg = {}, Zg, eS, tS, nS, rS, n0, _m, aS, iS, lS, Op;
    {
      Zg = /* @__PURE__ */ new Set(), eS = /* @__PURE__ */ new Set(), tS = /* @__PURE__ */ new Set(), nS = /* @__PURE__ */ new Set(), aS = /* @__PURE__ */ new Set(), rS = /* @__PURE__ */ new Set(), iS = /* @__PURE__ */ new Set(), lS = /* @__PURE__ */ new Set(), Op = /* @__PURE__ */ new Set();
      var r0 = /* @__PURE__ */ new Set();
      _m = function(e, t) {
        if (!(e === null || typeof e == "function")) {
          var a = t + "_" + e;
          r0.has(a) || (r0.add(a), S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e));
        }
      }, n0 = function(e, t) {
        if (t === void 0) {
          var a = Rt(e) || "Component";
          rS.has(a) || (rS.add(a), S("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", a));
        }
      }, Object.defineProperty(Jg, "_processChildContext", {
        enumerable: !1,
        value: function() {
          throw new Error("_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn't supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).");
        }
      }), Object.freeze(Jg);
    }
    function uS(e, t, a, i) {
      var u = e.memoizedState, s = a(i, u);
      {
        if (e.mode & Wt) {
          mn(!0);
          try {
            s = a(i, u);
          } finally {
            mn(!1);
          }
        }
        n0(t, s);
      }
      var f = s == null ? u : et({}, u, s);
      if (e.memoizedState = f, e.lanes === Y) {
        var p = e.updateQueue;
        p.baseState = f;
      }
    }
    var oS = {
      isMounted: Uv,
      enqueueSetState: function(e, t, a) {
        var i = po(e), u = Ea(), s = Bo(i), f = Hu(u, s);
        f.payload = t, a != null && (_m(a, "setState"), f.callback = a);
        var p = Uo(i, f, s);
        p !== null && (mr(p, i, s, u), nm(p, i, s)), hs(i, s);
      },
      enqueueReplaceState: function(e, t, a) {
        var i = po(e), u = Ea(), s = Bo(i), f = Hu(u, s);
        f.tag = EC, f.payload = t, a != null && (_m(a, "replaceState"), f.callback = a);
        var p = Uo(i, f, s);
        p !== null && (mr(p, i, s, u), nm(p, i, s)), hs(i, s);
      },
      enqueueForceUpdate: function(e, t) {
        var a = po(e), i = Ea(), u = Bo(a), s = Hu(i, u);
        s.tag = Zh, t != null && (_m(t, "forceUpdate"), s.callback = t);
        var f = Uo(a, s, u);
        f !== null && (mr(f, a, u, i), nm(f, a, u)), Nc(a, u);
      }
    };
    function a0(e, t, a, i, u, s, f) {
      var p = e.stateNode;
      if (typeof p.shouldComponentUpdate == "function") {
        var v = p.shouldComponentUpdate(i, s, f);
        {
          if (e.mode & Wt) {
            mn(!0);
            try {
              v = p.shouldComponentUpdate(i, s, f);
            } finally {
              mn(!1);
            }
          }
          v === void 0 && S("%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.", Rt(t) || "Component");
        }
        return v;
      }
      return t.prototype && t.prototype.isPureReactComponent ? !ye(a, i) || !ye(u, s) : !0;
    }
    function Xw(e, t, a) {
      var i = e.stateNode;
      {
        var u = Rt(t) || "Component", s = i.render;
        s || (t.prototype && typeof t.prototype.render == "function" ? S("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", u) : S("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", u)), i.getInitialState && !i.getInitialState.isReactClassApproved && !i.state && S("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", u), i.getDefaultProps && !i.getDefaultProps.isReactClassApproved && S("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", u), i.propTypes && S("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", u), i.contextType && S("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", u), t.childContextTypes && !Op.has(t) && // Strict Mode has its own warning for legacy context, so we can skip
        // this one.
        (e.mode & Wt) === De && (Op.add(t), S(`%s uses the legacy childContextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() instead

.Learn more about this warning here: https://reactjs.org/link/legacy-context`, u)), t.contextTypes && !Op.has(t) && // Strict Mode has its own warning for legacy context, so we can skip
        // this one.
        (e.mode & Wt) === De && (Op.add(t), S(`%s uses the legacy contextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() with static contextType instead.

Learn more about this warning here: https://reactjs.org/link/legacy-context`, u)), i.contextTypes && S("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", u), t.contextType && t.contextTypes && !iS.has(t) && (iS.add(t), S("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", u)), typeof i.componentShouldUpdate == "function" && S("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", u), t.prototype && t.prototype.isPureReactComponent && typeof i.shouldComponentUpdate < "u" && S("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", Rt(t) || "A pure component"), typeof i.componentDidUnmount == "function" && S("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", u), typeof i.componentDidReceiveProps == "function" && S("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", u), typeof i.componentWillRecieveProps == "function" && S("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", u), typeof i.UNSAFE_componentWillRecieveProps == "function" && S("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", u);
        var f = i.props !== a;
        i.props !== void 0 && f && S("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", u, u), i.defaultProps && S("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", u, u), typeof i.getSnapshotBeforeUpdate == "function" && typeof i.componentDidUpdate != "function" && !tS.has(t) && (tS.add(t), S("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", Rt(t))), typeof i.getDerivedStateFromProps == "function" && S("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof i.getDerivedStateFromError == "function" && S("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof t.getSnapshotBeforeUpdate == "function" && S("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", u);
        var p = i.state;
        p && (typeof p != "object" || at(p)) && S("%s.state: must be set to an object or null", u), typeof i.getChildContext == "function" && typeof t.childContextTypes != "object" && S("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", u);
      }
    }
    function i0(e, t) {
      t.updater = oS, e.stateNode = t, pu(t, e), t._reactInternalInstance = Jg;
    }
    function l0(e, t, a) {
      var i = !1, u = li, s = li, f = t.contextType;
      if ("contextType" in t) {
        var p = (
          // Allow null for conditional declaration
          f === null || f !== void 0 && f.$$typeof === R && f._context === void 0
        );
        if (!p && !lS.has(t)) {
          lS.add(t);
          var v = "";
          f === void 0 ? v = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof f != "object" ? v = " However, it is set to a " + typeof f + "." : f.$$typeof === pi ? v = " Did you accidentally pass the Context.Provider instead?" : f._context !== void 0 ? v = " Did you accidentally pass the Context.Consumer instead?" : v = " However, it is set to an object with keys {" + Object.keys(f).join(", ") + "}.", S("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", Rt(t) || "Component", v);
        }
      }
      if (typeof f == "object" && f !== null)
        s = er(f);
      else {
        u = Tf(e, t, !0);
        var y = t.contextTypes;
        i = y != null, s = i ? wf(e, u) : li;
      }
      var g = new t(a, s);
      if (e.mode & Wt) {
        mn(!0);
        try {
          g = new t(a, s);
        } finally {
          mn(!1);
        }
      }
      var b = e.memoizedState = g.state !== null && g.state !== void 0 ? g.state : null;
      i0(e, g);
      {
        if (typeof t.getDerivedStateFromProps == "function" && b === null) {
          var w = Rt(t) || "Component";
          eS.has(w) || (eS.add(w), S("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", w, g.state === null ? "null" : "undefined", w));
        }
        if (typeof t.getDerivedStateFromProps == "function" || typeof g.getSnapshotBeforeUpdate == "function") {
          var M = null, z = null, F = null;
          if (typeof g.componentWillMount == "function" && g.componentWillMount.__suppressDeprecationWarning !== !0 ? M = "componentWillMount" : typeof g.UNSAFE_componentWillMount == "function" && (M = "UNSAFE_componentWillMount"), typeof g.componentWillReceiveProps == "function" && g.componentWillReceiveProps.__suppressDeprecationWarning !== !0 ? z = "componentWillReceiveProps" : typeof g.UNSAFE_componentWillReceiveProps == "function" && (z = "UNSAFE_componentWillReceiveProps"), typeof g.componentWillUpdate == "function" && g.componentWillUpdate.__suppressDeprecationWarning !== !0 ? F = "componentWillUpdate" : typeof g.UNSAFE_componentWillUpdate == "function" && (F = "UNSAFE_componentWillUpdate"), M !== null || z !== null || F !== null) {
            var ue = Rt(t) || "Component", Le = typeof t.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            nS.has(ue) || (nS.add(ue), S(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://reactjs.org/link/unsafe-component-lifecycles`, ue, Le, M !== null ? `
  ` + M : "", z !== null ? `
  ` + z : "", F !== null ? `
  ` + F : ""));
          }
        }
      }
      return i && qE(e, u, s), g;
    }
    function Kw(e, t) {
      var a = t.state;
      typeof t.componentWillMount == "function" && t.componentWillMount(), typeof t.UNSAFE_componentWillMount == "function" && t.UNSAFE_componentWillMount(), a !== t.state && (S("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", Be(e) || "Component"), oS.enqueueReplaceState(t, t.state, null));
    }
    function u0(e, t, a, i) {
      var u = t.state;
      if (typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, i), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, i), t.state !== u) {
        {
          var s = Be(e) || "Component";
          Zg.has(s) || (Zg.add(s), S("%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", s));
        }
        oS.enqueueReplaceState(t, t.state, null);
      }
    }
    function sS(e, t, a, i) {
      Xw(e, t, a);
      var u = e.stateNode;
      u.props = a, u.state = e.memoizedState, u.refs = {}, gg(e);
      var s = t.contextType;
      if (typeof s == "object" && s !== null)
        u.context = er(s);
      else {
        var f = Tf(e, t, !0);
        u.context = wf(e, f);
      }
      {
        if (u.state === a) {
          var p = Rt(t) || "Component";
          aS.has(p) || (aS.add(p), S("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", p));
        }
        e.mode & Wt && rl.recordLegacyContextWarning(e, u), rl.recordUnsafeLifecycleWarnings(e, u);
      }
      u.state = e.memoizedState;
      var v = t.getDerivedStateFromProps;
      if (typeof v == "function" && (uS(e, t, v, a), u.state = e.memoizedState), typeof t.getDerivedStateFromProps != "function" && typeof u.getSnapshotBeforeUpdate != "function" && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (Kw(e, u), rm(e, a, u, i), u.state = e.memoizedState), typeof u.componentDidMount == "function") {
        var y = gt;
        y |= Qi, (e.mode & Lt) !== De && (y |= bl), e.flags |= y;
      }
    }
    function Jw(e, t, a, i) {
      var u = e.stateNode, s = e.memoizedProps;
      u.props = s;
      var f = u.context, p = t.contextType, v = li;
      if (typeof p == "object" && p !== null)
        v = er(p);
      else {
        var y = Tf(e, t, !0);
        v = wf(e, y);
      }
      var g = t.getDerivedStateFromProps, b = typeof g == "function" || typeof u.getSnapshotBeforeUpdate == "function";
      !b && (typeof u.UNSAFE_componentWillReceiveProps == "function" || typeof u.componentWillReceiveProps == "function") && (s !== a || f !== v) && u0(e, u, a, v), RC();
      var w = e.memoizedState, M = u.state = w;
      if (rm(e, a, u, i), M = e.memoizedState, s === a && w === M && !Fh() && !am()) {
        if (typeof u.componentDidMount == "function") {
          var z = gt;
          z |= Qi, (e.mode & Lt) !== De && (z |= bl), e.flags |= z;
        }
        return !1;
      }
      typeof g == "function" && (uS(e, t, g, a), M = e.memoizedState);
      var F = am() || a0(e, t, s, a, w, M, v);
      if (F) {
        if (!b && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function") {
          var ue = gt;
          ue |= Qi, (e.mode & Lt) !== De && (ue |= bl), e.flags |= ue;
        }
      } else {
        if (typeof u.componentDidMount == "function") {
          var Le = gt;
          Le |= Qi, (e.mode & Lt) !== De && (Le |= bl), e.flags |= Le;
        }
        e.memoizedProps = a, e.memoizedState = M;
      }
      return u.props = a, u.state = M, u.context = v, F;
    }
    function Zw(e, t, a, i, u) {
      var s = t.stateNode;
      CC(e, t);
      var f = t.memoizedProps, p = t.type === t.elementType ? f : ll(t.type, f);
      s.props = p;
      var v = t.pendingProps, y = s.context, g = a.contextType, b = li;
      if (typeof g == "object" && g !== null)
        b = er(g);
      else {
        var w = Tf(t, a, !0);
        b = wf(t, w);
      }
      var M = a.getDerivedStateFromProps, z = typeof M == "function" || typeof s.getSnapshotBeforeUpdate == "function";
      !z && (typeof s.UNSAFE_componentWillReceiveProps == "function" || typeof s.componentWillReceiveProps == "function") && (f !== v || y !== b) && u0(t, s, i, b), RC();
      var F = t.memoizedState, ue = s.state = F;
      if (rm(t, i, s, u), ue = t.memoizedState, f === v && F === ue && !Fh() && !am() && !Re)
        return typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || F !== e.memoizedState) && (t.flags |= gt), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || F !== e.memoizedState) && (t.flags |= Yn), !1;
      typeof M == "function" && (uS(t, a, M, i), ue = t.memoizedState);
      var Le = am() || a0(t, a, p, i, F, ue, b) || // TODO: In some cases, we'll end up checking if context has changed twice,
      // both before and after `shouldComponentUpdate` has been called. Not ideal,
      // but I'm loath to refactor this function. This only happens for memoized
      // components so it's not that common.
      Re;
      return Le ? (!z && (typeof s.UNSAFE_componentWillUpdate == "function" || typeof s.componentWillUpdate == "function") && (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(i, ue, b), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(i, ue, b)), typeof s.componentDidUpdate == "function" && (t.flags |= gt), typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= Yn)) : (typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || F !== e.memoizedState) && (t.flags |= gt), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || F !== e.memoizedState) && (t.flags |= Yn), t.memoizedProps = i, t.memoizedState = ue), s.props = i, s.state = ue, s.context = b, Le;
    }
    function ec(e, t) {
      return {
        value: e,
        source: t,
        stack: Pi(t),
        digest: null
      };
    }
    function cS(e, t, a) {
      return {
        value: e,
        source: null,
        stack: a ?? null,
        digest: t ?? null
      };
    }
    function ex(e, t) {
      return !0;
    }
    function fS(e, t) {
      try {
        var a = ex(e, t);
        if (a === !1)
          return;
        var i = t.value, u = t.source, s = t.stack, f = s !== null ? s : "";
        if (i != null && i._suppressLogging) {
          if (e.tag === de)
            return;
          console.error(i);
        }
        var p = u ? Be(u) : null, v = p ? "The above error occurred in the <" + p + "> component:" : "The above error occurred in one of your React components:", y;
        if (e.tag === Z)
          y = `Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.`;
        else {
          var g = Be(e) || "Anonymous";
          y = "React will try to recreate this component tree from scratch " + ("using the error boundary you provided, " + g + ".");
        }
        var b = v + `
` + f + `

` + ("" + y);
        console.error(b);
      } catch (w) {
        setTimeout(function() {
          throw w;
        });
      }
    }
    var tx = typeof WeakMap == "function" ? WeakMap : Map;
    function o0(e, t, a) {
      var i = Hu(Xt, a);
      i.tag = mg, i.payload = {
        element: null
      };
      var u = t.value;
      return i.callback = function() {
        Wb(u), fS(e, t);
      }, i;
    }
    function dS(e, t, a) {
      var i = Hu(Xt, a);
      i.tag = mg;
      var u = e.type.getDerivedStateFromError;
      if (typeof u == "function") {
        var s = t.value;
        i.payload = function() {
          return u(s);
        }, i.callback = function() {
          SR(e), fS(e, t);
        };
      }
      var f = e.stateNode;
      return f !== null && typeof f.componentDidCatch == "function" && (i.callback = function() {
        SR(e), fS(e, t), typeof u != "function" && Ib(this);
        var v = t.value, y = t.stack;
        this.componentDidCatch(v, {
          componentStack: y !== null ? y : ""
        }), typeof u != "function" && (Zr(e.lanes, Ae) || S("%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.", Be(e) || "Unknown"));
      }), i;
    }
    function s0(e, t, a) {
      var i = e.pingCache, u;
      if (i === null ? (i = e.pingCache = new tx(), u = /* @__PURE__ */ new Set(), i.set(t, u)) : (u = i.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), i.set(t, u))), !u.has(a)) {
        u.add(a);
        var s = Gb.bind(null, e, t, a);
        Kr && Wp(e, a), t.then(s, s);
      }
    }
    function nx(e, t, a, i) {
      var u = e.updateQueue;
      if (u === null) {
        var s = /* @__PURE__ */ new Set();
        s.add(a), e.updateQueue = s;
      } else
        u.add(a);
    }
    function rx(e, t) {
      var a = e.tag;
      if ((e.mode & st) === De && (a === se || a === Qe || a === Fe)) {
        var i = e.alternate;
        i ? (e.updateQueue = i.updateQueue, e.memoizedState = i.memoizedState, e.lanes = i.lanes) : (e.updateQueue = null, e.memoizedState = null);
      }
    }
    function c0(e) {
      var t = e;
      do {
        if (t.tag === be && jw(t))
          return t;
        t = t.return;
      } while (t !== null);
      return null;
    }
    function f0(e, t, a, i, u) {
      if ((e.mode & st) === De) {
        if (e === t)
          e.flags |= Xn;
        else {
          if (e.flags |= xe, a.flags |= xc, a.flags &= -52805, a.tag === de) {
            var s = a.alternate;
            if (s === null)
              a.tag = Ft;
            else {
              var f = Hu(Xt, Ae);
              f.tag = Zh, Uo(a, f, Ae);
            }
          }
          a.lanes = Ke(a.lanes, Ae);
        }
        return e;
      }
      return e.flags |= Xn, e.lanes = u, e;
    }
    function ax(e, t, a, i, u) {
      if (a.flags |= ss, Kr && Wp(e, u), i !== null && typeof i == "object" && typeof i.then == "function") {
        var s = i;
        rx(a), zr() && a.mode & st && nC();
        var f = c0(t);
        if (f !== null) {
          f.flags &= ~Er, f0(f, t, a, e, u), f.mode & st && s0(e, s, u), nx(f, e, s);
          return;
        } else {
          if (!Bv(u)) {
            s0(e, s, u), IS();
            return;
          }
          var p = new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
          i = p;
        }
      } else if (zr() && a.mode & st) {
        nC();
        var v = c0(t);
        if (v !== null) {
          (v.flags & Xn) === _e && (v.flags |= Er), f0(v, t, a, e, u), ag(ec(i, a));
          return;
        }
      }
      i = ec(i, a), jb(i);
      var y = t;
      do {
        switch (y.tag) {
          case Z: {
            var g = i;
            y.flags |= Xn;
            var b = ws(u);
            y.lanes = Ke(y.lanes, b);
            var w = o0(y, g, b);
            Sg(y, w);
            return;
          }
          case de:
            var M = i, z = y.type, F = y.stateNode;
            if ((y.flags & xe) === _e && (typeof z.getDerivedStateFromError == "function" || F !== null && typeof F.componentDidCatch == "function" && !cR(F))) {
              y.flags |= Xn;
              var ue = ws(u);
              y.lanes = Ke(y.lanes, ue);
              var Le = dS(y, M, ue);
              Sg(y, Le);
              return;
            }
            break;
        }
        y = y.return;
      } while (y !== null);
    }
    function ix() {
      return null;
    }
    var Lp = A.ReactCurrentOwner, ul = !1, pS, Mp, vS, hS, mS, tc, yS, Dm, Np;
    pS = {}, Mp = {}, vS = {}, hS = {}, mS = {}, tc = !1, yS = {}, Dm = {}, Np = {};
    function ga(e, t, a, i) {
      e === null ? t.child = vC(t, null, a, i) : t.child = Df(t, e.child, a, i);
    }
    function lx(e, t, a, i) {
      t.child = Df(t, e.child, null, i), t.child = Df(t, null, a, i);
    }
    function d0(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && tl(
          s,
          i,
          // Resolved props
          "prop",
          Rt(a)
        );
      }
      var f = a.render, p = t.ref, v, y;
      Of(t, u), va(t);
      {
        if (Lp.current = t, $n(!0), v = Af(e, t, f, i, p, u), y = jf(), t.mode & Wt) {
          mn(!0);
          try {
            v = Af(e, t, f, i, p, u), y = jf();
          } finally {
            mn(!1);
          }
        }
        $n(!1);
      }
      return ha(), e !== null && !ul ? (DC(e, t, u), Pu(e, t, u)) : (zr() && y && Jy(t), t.flags |= ti, ga(e, t, v, u), t.child);
    }
    function p0(e, t, a, i, u) {
      if (e === null) {
        var s = a.type;
        if (f_(s) && a.compare === null && // SimpleMemoComponent codepath doesn't resolve outer props either.
        a.defaultProps === void 0) {
          var f = s;
          return f = If(s), t.tag = Fe, t.type = f, ES(t, s), v0(e, t, f, i, u);
        }
        {
          var p = s.propTypes;
          if (p && tl(
            p,
            i,
            // Resolved props
            "prop",
            Rt(s)
          ), a.defaultProps !== void 0) {
            var v = Rt(s) || "Unknown";
            Np[v] || (S("%s: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.", v), Np[v] = !0);
          }
        }
        var y = nE(a.type, null, i, t, t.mode, u);
        return y.ref = t.ref, y.return = t, t.child = y, y;
      }
      {
        var g = a.type, b = g.propTypes;
        b && tl(
          b,
          i,
          // Resolved props
          "prop",
          Rt(g)
        );
      }
      var w = e.child, M = bS(e, u);
      if (!M) {
        var z = w.memoizedProps, F = a.compare;
        if (F = F !== null ? F : ye, F(z, i) && e.ref === t.ref)
          return Pu(e, t, u);
      }
      t.flags |= ti;
      var ue = lc(w, i);
      return ue.ref = t.ref, ue.return = t, t.child = ue, ue;
    }
    function v0(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = t.elementType;
        if (s.$$typeof === $e) {
          var f = s, p = f._payload, v = f._init;
          try {
            s = v(p);
          } catch {
            s = null;
          }
          var y = s && s.propTypes;
          y && tl(
            y,
            i,
            // Resolved (SimpleMemoComponent has no defaultProps)
            "prop",
            Rt(s)
          );
        }
      }
      if (e !== null) {
        var g = e.memoizedProps;
        if (ye(g, i) && e.ref === t.ref && // Prevent bailout if the implementation changed due to hot reload.
        t.type === e.type)
          if (ul = !1, t.pendingProps = i = g, bS(e, u))
            (e.flags & xc) !== _e && (ul = !0);
          else return t.lanes = e.lanes, Pu(e, t, u);
      }
      return gS(e, t, a, i, u);
    }
    function h0(e, t, a) {
      var i = t.pendingProps, u = i.children, s = e !== null ? e.memoizedState : null;
      if (i.mode === "hidden" || ne)
        if ((t.mode & st) === De) {
          var f = {
            baseLanes: Y,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = f, Vm(t, a);
        } else if (Zr(a, Jr)) {
          var b = {
            baseLanes: Y,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = b;
          var w = s !== null ? s.baseLanes : a;
          Vm(t, w);
        } else {
          var p = null, v;
          if (s !== null) {
            var y = s.baseLanes;
            v = Ke(y, a);
          } else
            v = a;
          t.lanes = t.childLanes = Jr;
          var g = {
            baseLanes: v,
            cachePool: p,
            transitions: null
          };
          return t.memoizedState = g, t.updateQueue = null, Vm(t, v), null;
        }
      else {
        var M;
        s !== null ? (M = Ke(s.baseLanes, a), t.memoizedState = null) : M = a, Vm(t, M);
      }
      return ga(e, t, u, a), t.child;
    }
    function ux(e, t, a) {
      var i = t.pendingProps;
      return ga(e, t, i, a), t.child;
    }
    function ox(e, t, a) {
      var i = t.pendingProps.children;
      return ga(e, t, i, a), t.child;
    }
    function sx(e, t, a) {
      {
        t.flags |= gt;
        {
          var i = t.stateNode;
          i.effectDuration = 0, i.passiveEffectDuration = 0;
        }
      }
      var u = t.pendingProps, s = u.children;
      return ga(e, t, s, a), t.child;
    }
    function m0(e, t) {
      var a = t.ref;
      (e === null && a !== null || e !== null && e.ref !== a) && (t.flags |= Sn, t.flags |= ho);
    }
    function gS(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && tl(
          s,
          i,
          // Resolved props
          "prop",
          Rt(a)
        );
      }
      var f;
      {
        var p = Tf(t, a, !0);
        f = wf(t, p);
      }
      var v, y;
      Of(t, u), va(t);
      {
        if (Lp.current = t, $n(!0), v = Af(e, t, a, i, f, u), y = jf(), t.mode & Wt) {
          mn(!0);
          try {
            v = Af(e, t, a, i, f, u), y = jf();
          } finally {
            mn(!1);
          }
        }
        $n(!1);
      }
      return ha(), e !== null && !ul ? (DC(e, t, u), Pu(e, t, u)) : (zr() && y && Jy(t), t.flags |= ti, ga(e, t, v, u), t.child);
    }
    function y0(e, t, a, i, u) {
      {
        switch (b_(t)) {
          case !1: {
            var s = t.stateNode, f = t.type, p = new f(t.memoizedProps, s.context), v = p.state;
            s.updater.enqueueSetState(s, v, null);
            break;
          }
          case !0: {
            t.flags |= xe, t.flags |= Xn;
            var y = new Error("Simulated error coming from DevTools"), g = ws(u);
            t.lanes = Ke(t.lanes, g);
            var b = dS(t, ec(y, t), g);
            Sg(t, b);
            break;
          }
        }
        if (t.type !== t.elementType) {
          var w = a.propTypes;
          w && tl(
            w,
            i,
            // Resolved props
            "prop",
            Rt(a)
          );
        }
      }
      var M;
      $l(a) ? (M = !0, Ph(t)) : M = !1, Of(t, u);
      var z = t.stateNode, F;
      z === null ? (Om(e, t), l0(t, a, i), sS(t, a, i, u), F = !0) : e === null ? F = Jw(t, a, i, u) : F = Zw(e, t, a, i, u);
      var ue = SS(e, t, a, F, M, u);
      {
        var Le = t.stateNode;
        F && Le.props !== i && (tc || S("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", Be(t) || "a component"), tc = !0);
      }
      return ue;
    }
    function SS(e, t, a, i, u, s) {
      m0(e, t);
      var f = (t.flags & xe) !== _e;
      if (!i && !f)
        return u && JE(t, a, !1), Pu(e, t, s);
      var p = t.stateNode;
      Lp.current = t;
      var v;
      if (f && typeof a.getDerivedStateFromError != "function")
        v = null, t0();
      else {
        va(t);
        {
          if ($n(!0), v = p.render(), t.mode & Wt) {
            mn(!0);
            try {
              p.render();
            } finally {
              mn(!1);
            }
          }
          $n(!1);
        }
        ha();
      }
      return t.flags |= ti, e !== null && f ? lx(e, t, v, s) : ga(e, t, v, s), t.memoizedState = p.state, u && JE(t, a, !0), t.child;
    }
    function g0(e) {
      var t = e.stateNode;
      t.pendingContext ? XE(e, t.pendingContext, t.pendingContext !== t.context) : t.context && XE(e, t.context, !1), Eg(e, t.containerInfo);
    }
    function cx(e, t, a) {
      if (g0(t), e === null)
        throw new Error("Should have a current fiber. This is a bug in React.");
      var i = t.pendingProps, u = t.memoizedState, s = u.element;
      CC(e, t), rm(t, i, null, a);
      var f = t.memoizedState;
      t.stateNode;
      var p = f.element;
      if (u.isDehydrated) {
        var v = {
          element: p,
          isDehydrated: !1,
          cache: f.cache,
          pendingSuspenseBoundaries: f.pendingSuspenseBoundaries,
          transitions: f.transitions
        }, y = t.updateQueue;
        if (y.baseState = v, t.memoizedState = v, t.flags & Er) {
          var g = ec(new Error("There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering."), t);
          return S0(e, t, p, a, g);
        } else if (p !== s) {
          var b = ec(new Error("This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."), t);
          return S0(e, t, p, a, b);
        } else {
          pw(t);
          var w = vC(t, null, p, a);
          t.child = w;
          for (var M = w; M; )
            M.flags = M.flags & ~hn | Gr, M = M.sibling;
        }
      } else {
        if (_f(), p === s)
          return Pu(e, t, a);
        ga(e, t, p, a);
      }
      return t.child;
    }
    function S0(e, t, a, i, u) {
      return _f(), ag(u), t.flags |= Er, ga(e, t, a, i), t.child;
    }
    function fx(e, t, a) {
      xC(t), e === null && rg(t);
      var i = t.type, u = t.pendingProps, s = e !== null ? e.memoizedProps : null, f = u.children, p = Fy(i, u);
      return p ? f = null : s !== null && Fy(i, s) && (t.flags |= ka), m0(e, t), ga(e, t, f, a), t.child;
    }
    function dx(e, t) {
      return e === null && rg(t), null;
    }
    function px(e, t, a, i) {
      Om(e, t);
      var u = t.pendingProps, s = a, f = s._payload, p = s._init, v = p(f);
      t.type = v;
      var y = t.tag = d_(v), g = ll(v, u), b;
      switch (y) {
        case se:
          return ES(t, v), t.type = v = If(v), b = gS(null, t, v, g, i), b;
        case de:
          return t.type = v = XS(v), b = y0(null, t, v, g, i), b;
        case Qe:
          return t.type = v = KS(v), b = d0(null, t, v, g, i), b;
        case ct: {
          if (t.type !== t.elementType) {
            var w = v.propTypes;
            w && tl(
              w,
              g,
              // Resolved for outer only
              "prop",
              Rt(v)
            );
          }
          return b = p0(
            null,
            t,
            v,
            ll(v.type, g),
            // The inner type can have defaults too
            i
          ), b;
        }
      }
      var M = "";
      throw v !== null && typeof v == "object" && v.$$typeof === $e && (M = " Did you wrap a component in React.lazy() more than once?"), new Error("Element type is invalid. Received a promise that resolves to: " + v + ". " + ("Lazy element type must resolve to a class or function." + M));
    }
    function vx(e, t, a, i, u) {
      Om(e, t), t.tag = de;
      var s;
      return $l(a) ? (s = !0, Ph(t)) : s = !1, Of(t, u), l0(t, a, i), sS(t, a, i, u), SS(null, t, a, !0, s, u);
    }
    function hx(e, t, a, i) {
      Om(e, t);
      var u = t.pendingProps, s;
      {
        var f = Tf(t, a, !1);
        s = wf(t, f);
      }
      Of(t, i);
      var p, v;
      va(t);
      {
        if (a.prototype && typeof a.prototype.render == "function") {
          var y = Rt(a) || "Unknown";
          pS[y] || (S("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", y, y), pS[y] = !0);
        }
        t.mode & Wt && rl.recordLegacyContextWarning(t, null), $n(!0), Lp.current = t, p = Af(null, t, a, u, s, i), v = jf(), $n(!1);
      }
      if (ha(), t.flags |= ti, typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0) {
        var g = Rt(a) || "Unknown";
        Mp[g] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", g, g, g), Mp[g] = !0);
      }
      if (
        // Run these checks in production only if the flag is off.
        // Eventually we'll delete this branch altogether.
        typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0
      ) {
        {
          var b = Rt(a) || "Unknown";
          Mp[b] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", b, b, b), Mp[b] = !0);
        }
        t.tag = de, t.memoizedState = null, t.updateQueue = null;
        var w = !1;
        return $l(a) ? (w = !0, Ph(t)) : w = !1, t.memoizedState = p.state !== null && p.state !== void 0 ? p.state : null, gg(t), i0(t, p), sS(t, a, u, i), SS(null, t, a, !0, w, i);
      } else {
        if (t.tag = se, t.mode & Wt) {
          mn(!0);
          try {
            p = Af(null, t, a, u, s, i), v = jf();
          } finally {
            mn(!1);
          }
        }
        return zr() && v && Jy(t), ga(null, t, p, i), ES(t, a), t.child;
      }
    }
    function ES(e, t) {
      {
        if (t && t.childContextTypes && S("%s(...): childContextTypes cannot be defined on a function component.", t.displayName || t.name || "Component"), e.ref !== null) {
          var a = "", i = Dr();
          i && (a += `

Check the render method of \`` + i + "`.");
          var u = i || "", s = e._debugSource;
          s && (u = s.fileName + ":" + s.lineNumber), mS[u] || (mS[u] = !0, S("Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?%s", a));
        }
        if (t.defaultProps !== void 0) {
          var f = Rt(t) || "Unknown";
          Np[f] || (S("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", f), Np[f] = !0);
        }
        if (typeof t.getDerivedStateFromProps == "function") {
          var p = Rt(t) || "Unknown";
          hS[p] || (S("%s: Function components do not support getDerivedStateFromProps.", p), hS[p] = !0);
        }
        if (typeof t.contextType == "object" && t.contextType !== null) {
          var v = Rt(t) || "Unknown";
          vS[v] || (S("%s: Function components do not support contextType.", v), vS[v] = !0);
        }
      }
    }
    var CS = {
      dehydrated: null,
      treeContext: null,
      retryLane: _t
    };
    function RS(e) {
      return {
        baseLanes: e,
        cachePool: ix(),
        transitions: null
      };
    }
    function mx(e, t) {
      var a = null;
      return {
        baseLanes: Ke(e.baseLanes, t),
        cachePool: a,
        transitions: e.transitions
      };
    }
    function yx(e, t, a, i) {
      if (t !== null) {
        var u = t.memoizedState;
        if (u === null)
          return !1;
      }
      return Tg(e, Rp);
    }
    function gx(e, t) {
      return xs(e.childLanes, t);
    }
    function E0(e, t, a) {
      var i = t.pendingProps;
      __(t) && (t.flags |= xe);
      var u = al.current, s = !1, f = (t.flags & xe) !== _e;
      if (f || yx(u, e) ? (s = !0, t.flags &= ~xe) : (e === null || e.memoizedState !== null) && (u = Aw(u, _C)), u = Mf(u), Ao(t, u), e === null) {
        rg(t);
        var p = t.memoizedState;
        if (p !== null) {
          var v = p.dehydrated;
          if (v !== null)
            return Tx(t, v);
        }
        var y = i.children, g = i.fallback;
        if (s) {
          var b = Sx(t, y, g, a), w = t.child;
          return w.memoizedState = RS(a), t.memoizedState = CS, b;
        } else
          return TS(t, y);
      } else {
        var M = e.memoizedState;
        if (M !== null) {
          var z = M.dehydrated;
          if (z !== null)
            return wx(e, t, f, i, z, M, a);
        }
        if (s) {
          var F = i.fallback, ue = i.children, Le = Cx(e, t, ue, F, a), we = t.child, Ct = e.child.memoizedState;
          return we.memoizedState = Ct === null ? RS(a) : mx(Ct, a), we.childLanes = gx(e, a), t.memoizedState = CS, Le;
        } else {
          var mt = i.children, k = Ex(e, t, mt, a);
          return t.memoizedState = null, k;
        }
      }
    }
    function TS(e, t, a) {
      var i = e.mode, u = {
        mode: "visible",
        children: t
      }, s = wS(u, i);
      return s.return = e, e.child = s, s;
    }
    function Sx(e, t, a, i) {
      var u = e.mode, s = e.child, f = {
        mode: "hidden",
        children: t
      }, p, v;
      return (u & st) === De && s !== null ? (p = s, p.childLanes = Y, p.pendingProps = f, e.mode & Ot && (p.actualDuration = 0, p.actualStartTime = -1, p.selfBaseDuration = 0, p.treeBaseDuration = 0), v = Yo(a, u, i, null)) : (p = wS(f, u), v = Yo(a, u, i, null)), p.return = e, v.return = e, p.sibling = v, e.child = p, v;
    }
    function wS(e, t, a) {
      return CR(e, t, Y, null);
    }
    function C0(e, t) {
      return lc(e, t);
    }
    function Ex(e, t, a, i) {
      var u = e.child, s = u.sibling, f = C0(u, {
        mode: "visible",
        children: a
      });
      if ((t.mode & st) === De && (f.lanes = i), f.return = t, f.sibling = null, s !== null) {
        var p = t.deletions;
        p === null ? (t.deletions = [s], t.flags |= Da) : p.push(s);
      }
      return t.child = f, f;
    }
    function Cx(e, t, a, i, u) {
      var s = t.mode, f = e.child, p = f.sibling, v = {
        mode: "hidden",
        children: a
      }, y;
      if (
        // In legacy mode, we commit the primary tree as if it successfully
        // completed, even though it's in an inconsistent state.
        (s & st) === De && // Make sure we're on the second pass, i.e. the primary child fragment was
        // already cloned. In legacy mode, the only case where this isn't true is
        // when DevTools forces us to display a fallback; we skip the first render
        // pass entirely and go straight to rendering the fallback. (In Concurrent
        // Mode, SuspenseList can also trigger this scenario, but this is a legacy-
        // only codepath.)
        t.child !== f
      ) {
        var g = t.child;
        y = g, y.childLanes = Y, y.pendingProps = v, t.mode & Ot && (y.actualDuration = 0, y.actualStartTime = -1, y.selfBaseDuration = f.selfBaseDuration, y.treeBaseDuration = f.treeBaseDuration), t.deletions = null;
      } else
        y = C0(f, v), y.subtreeFlags = f.subtreeFlags & Nn;
      var b;
      return p !== null ? b = lc(p, i) : (b = Yo(i, s, u, null), b.flags |= hn), b.return = t, y.return = t, y.sibling = b, t.child = y, b;
    }
    function km(e, t, a, i) {
      i !== null && ag(i), Df(t, e.child, null, a);
      var u = t.pendingProps, s = u.children, f = TS(t, s);
      return f.flags |= hn, t.memoizedState = null, f;
    }
    function Rx(e, t, a, i, u) {
      var s = t.mode, f = {
        mode: "visible",
        children: a
      }, p = wS(f, s), v = Yo(i, s, u, null);
      return v.flags |= hn, p.return = t, v.return = t, p.sibling = v, t.child = p, (t.mode & st) !== De && Df(t, e.child, null, u), v;
    }
    function Tx(e, t, a) {
      return (e.mode & st) === De ? (S("Cannot hydrate Suspense in legacy mode. Switch from ReactDOM.hydrate(element, container) to ReactDOMClient.hydrateRoot(container, <App />).render(element) or remove the Suspense components from the server rendered components."), e.lanes = Ae) : By(t) ? e.lanes = Cr : e.lanes = Jr, null;
    }
    function wx(e, t, a, i, u, s, f) {
      if (a)
        if (t.flags & Er) {
          t.flags &= ~Er;
          var k = cS(new Error("There was an error while hydrating this Suspense boundary. Switched to client rendering."));
          return km(e, t, f, k);
        } else {
          if (t.memoizedState !== null)
            return t.child = e.child, t.flags |= xe, null;
          var H = i.children, O = i.fallback, q = Rx(e, t, H, O, f), pe = t.child;
          return pe.memoizedState = RS(f), t.memoizedState = CS, q;
        }
      else {
        if (fw(), (t.mode & st) === De)
          return km(
            e,
            t,
            f,
            // TODO: When we delete legacy mode, we should make this error argument
            // required — every concurrent mode path that causes hydration to
            // de-opt to client rendering should have an error message.
            null
          );
        if (By(u)) {
          var p, v, y;
          {
            var g = D1(u);
            p = g.digest, v = g.message, y = g.stack;
          }
          var b;
          v ? b = new Error(v) : b = new Error("The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering.");
          var w = cS(b, p, y);
          return km(e, t, f, w);
        }
        var M = Zr(f, e.childLanes);
        if (ul || M) {
          var z = Pm();
          if (z !== null) {
            var F = Ad(z, f);
            if (F !== _t && F !== s.retryLane) {
              s.retryLane = F;
              var ue = Xt;
              Fa(e, F), mr(z, e, F, ue);
            }
          }
          IS();
          var Le = cS(new Error("This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering. The usual way to fix this is to wrap the original update in startTransition."));
          return km(e, t, f, Le);
        } else if (YE(u)) {
          t.flags |= xe, t.child = e.child;
          var we = qb.bind(null, e);
          return k1(u, we), null;
        } else {
          vw(t, u, s.treeContext);
          var Ct = i.children, mt = TS(t, Ct);
          return mt.flags |= Gr, mt;
        }
      }
    }
    function R0(e, t, a) {
      e.lanes = Ke(e.lanes, t);
      var i = e.alternate;
      i !== null && (i.lanes = Ke(i.lanes, t)), vg(e.return, t, a);
    }
    function xx(e, t, a) {
      for (var i = t; i !== null; ) {
        if (i.tag === be) {
          var u = i.memoizedState;
          u !== null && R0(i, a, e);
        } else if (i.tag === ln)
          R0(i, a, e);
        else if (i.child !== null) {
          i.child.return = i, i = i.child;
          continue;
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          i = i.return;
        }
        i.sibling.return = i.return, i = i.sibling;
      }
    }
    function bx(e) {
      for (var t = e, a = null; t !== null; ) {
        var i = t.alternate;
        i !== null && um(i) === null && (a = t), t = t.sibling;
      }
      return a;
    }
    function _x(e) {
      if (e !== void 0 && e !== "forwards" && e !== "backwards" && e !== "together" && !yS[e])
        if (yS[e] = !0, typeof e == "string")
          switch (e.toLowerCase()) {
            case "together":
            case "forwards":
            case "backwards": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.', e, e.toLowerCase());
              break;
            }
            case "forward":
            case "backward": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.', e, e.toLowerCase());
              break;
            }
            default:
              S('"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
              break;
          }
        else
          S('%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
    }
    function Dx(e, t) {
      e !== void 0 && !Dm[e] && (e !== "collapsed" && e !== "hidden" ? (Dm[e] = !0, S('"%s" is not a supported value for tail on <SuspenseList />. Did you mean "collapsed" or "hidden"?', e)) : t !== "forwards" && t !== "backwards" && (Dm[e] = !0, S('<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?', e)));
    }
    function T0(e, t) {
      {
        var a = at(e), i = !a && typeof qe(e) == "function";
        if (a || i) {
          var u = a ? "array" : "iterable";
          return S("A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>", u, t, u), !1;
        }
      }
      return !0;
    }
    function kx(e, t) {
      if ((t === "forwards" || t === "backwards") && e !== void 0 && e !== null && e !== !1)
        if (at(e)) {
          for (var a = 0; a < e.length; a++)
            if (!T0(e[a], a))
              return;
        } else {
          var i = qe(e);
          if (typeof i == "function") {
            var u = i.call(e);
            if (u)
              for (var s = u.next(), f = 0; !s.done; s = u.next()) {
                if (!T0(s.value, f))
                  return;
                f++;
              }
          } else
            S('A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?', t);
        }
    }
    function xS(e, t, a, i, u) {
      var s = e.memoizedState;
      s === null ? e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: i,
        tail: a,
        tailMode: u
      } : (s.isBackwards = t, s.rendering = null, s.renderingStartTime = 0, s.last = i, s.tail = a, s.tailMode = u);
    }
    function w0(e, t, a) {
      var i = t.pendingProps, u = i.revealOrder, s = i.tail, f = i.children;
      _x(u), Dx(s, u), kx(f, u), ga(e, t, f, a);
      var p = al.current, v = Tg(p, Rp);
      if (v)
        p = wg(p, Rp), t.flags |= xe;
      else {
        var y = e !== null && (e.flags & xe) !== _e;
        y && xx(t, t.child, a), p = Mf(p);
      }
      if (Ao(t, p), (t.mode & st) === De)
        t.memoizedState = null;
      else
        switch (u) {
          case "forwards": {
            var g = bx(t.child), b;
            g === null ? (b = t.child, t.child = null) : (b = g.sibling, g.sibling = null), xS(
              t,
              !1,
              // isBackwards
              b,
              g,
              s
            );
            break;
          }
          case "backwards": {
            var w = null, M = t.child;
            for (t.child = null; M !== null; ) {
              var z = M.alternate;
              if (z !== null && um(z) === null) {
                t.child = M;
                break;
              }
              var F = M.sibling;
              M.sibling = w, w = M, M = F;
            }
            xS(
              t,
              !0,
              // isBackwards
              w,
              null,
              // last
              s
            );
            break;
          }
          case "together": {
            xS(
              t,
              !1,
              // isBackwards
              null,
              // tail
              null,
              // last
              void 0
            );
            break;
          }
          default:
            t.memoizedState = null;
        }
      return t.child;
    }
    function Ox(e, t, a) {
      Eg(t, t.stateNode.containerInfo);
      var i = t.pendingProps;
      return e === null ? t.child = Df(t, null, i, a) : ga(e, t, i, a), t.child;
    }
    var x0 = !1;
    function Lx(e, t, a) {
      var i = t.type, u = i._context, s = t.pendingProps, f = t.memoizedProps, p = s.value;
      {
        "value" in s || x0 || (x0 = !0, S("The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?"));
        var v = t.type.propTypes;
        v && tl(v, s, "prop", "Context.Provider");
      }
      if (yC(t, u, p), f !== null) {
        var y = f.value;
        if (W(y, p)) {
          if (f.children === s.children && !Fh())
            return Pu(e, t, a);
        } else
          _w(t, u, a);
      }
      var g = s.children;
      return ga(e, t, g, a), t.child;
    }
    var b0 = !1;
    function Mx(e, t, a) {
      var i = t.type;
      i._context === void 0 ? i !== i.Consumer && (b0 || (b0 = !0, S("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?"))) : i = i._context;
      var u = t.pendingProps, s = u.children;
      typeof s != "function" && S("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it."), Of(t, a);
      var f = er(i);
      va(t);
      var p;
      return Lp.current = t, $n(!0), p = s(f), $n(!1), ha(), t.flags |= ti, ga(e, t, p, a), t.child;
    }
    function Up() {
      ul = !0;
    }
    function Om(e, t) {
      (t.mode & st) === De && e !== null && (e.alternate = null, t.alternate = null, t.flags |= hn);
    }
    function Pu(e, t, a) {
      return e !== null && (t.dependencies = e.dependencies), t0(), Qp(t.lanes), Zr(a, t.childLanes) ? (xw(e, t), t.child) : null;
    }
    function Nx(e, t, a) {
      {
        var i = t.return;
        if (i === null)
          throw new Error("Cannot swap the root fiber.");
        if (e.alternate = null, t.alternate = null, a.index = t.index, a.sibling = t.sibling, a.return = t.return, a.ref = t.ref, t === i.child)
          i.child = a;
        else {
          var u = i.child;
          if (u === null)
            throw new Error("Expected parent to have a child.");
          for (; u.sibling !== t; )
            if (u = u.sibling, u === null)
              throw new Error("Expected to find the previous sibling.");
          u.sibling = a;
        }
        var s = i.deletions;
        return s === null ? (i.deletions = [e], i.flags |= Da) : s.push(e), a.flags |= hn, a;
      }
    }
    function bS(e, t) {
      var a = e.lanes;
      return !!Zr(a, t);
    }
    function Ux(e, t, a) {
      switch (t.tag) {
        case Z:
          g0(t), t.stateNode, _f();
          break;
        case ie:
          xC(t);
          break;
        case de: {
          var i = t.type;
          $l(i) && Ph(t);
          break;
        }
        case Se:
          Eg(t, t.stateNode.containerInfo);
          break;
        case vt: {
          var u = t.memoizedProps.value, s = t.type._context;
          yC(t, s, u);
          break;
        }
        case ht:
          {
            var f = Zr(a, t.childLanes);
            f && (t.flags |= gt);
            {
              var p = t.stateNode;
              p.effectDuration = 0, p.passiveEffectDuration = 0;
            }
          }
          break;
        case be: {
          var v = t.memoizedState;
          if (v !== null) {
            if (v.dehydrated !== null)
              return Ao(t, Mf(al.current)), t.flags |= xe, null;
            var y = t.child, g = y.childLanes;
            if (Zr(a, g))
              return E0(e, t, a);
            Ao(t, Mf(al.current));
            var b = Pu(e, t, a);
            return b !== null ? b.sibling : null;
          } else
            Ao(t, Mf(al.current));
          break;
        }
        case ln: {
          var w = (e.flags & xe) !== _e, M = Zr(a, t.childLanes);
          if (w) {
            if (M)
              return w0(e, t, a);
            t.flags |= xe;
          }
          var z = t.memoizedState;
          if (z !== null && (z.rendering = null, z.tail = null, z.lastEffect = null), Ao(t, al.current), M)
            break;
          return null;
        }
        case ke:
        case zt:
          return t.lanes = Y, h0(e, t, a);
      }
      return Pu(e, t, a);
    }
    function _0(e, t, a) {
      if (t._debugNeedsRemount && e !== null)
        return Nx(e, t, nE(t.type, t.key, t.pendingProps, t._debugOwner || null, t.mode, t.lanes));
      if (e !== null) {
        var i = e.memoizedProps, u = t.pendingProps;
        if (i !== u || Fh() || // Force a re-render if the implementation changed due to hot reload:
        t.type !== e.type)
          ul = !0;
        else {
          var s = bS(e, a);
          if (!s && // If this is the second pass of an error or suspense boundary, there
          // may not be work scheduled on `current`, so we check for this flag.
          (t.flags & xe) === _e)
            return ul = !1, Ux(e, t, a);
          (e.flags & xc) !== _e ? ul = !0 : ul = !1;
        }
      } else if (ul = !1, zr() && iw(t)) {
        var f = t.index, p = lw();
        tC(t, p, f);
      }
      switch (t.lanes = Y, t.tag) {
        case Je:
          return hx(e, t, t.type, a);
        case an: {
          var v = t.elementType;
          return px(e, t, v, a);
        }
        case se: {
          var y = t.type, g = t.pendingProps, b = t.elementType === y ? g : ll(y, g);
          return gS(e, t, y, b, a);
        }
        case de: {
          var w = t.type, M = t.pendingProps, z = t.elementType === w ? M : ll(w, M);
          return y0(e, t, w, z, a);
        }
        case Z:
          return cx(e, t, a);
        case ie:
          return fx(e, t, a);
        case je:
          return dx(e, t);
        case be:
          return E0(e, t, a);
        case Se:
          return Ox(e, t, a);
        case Qe: {
          var F = t.type, ue = t.pendingProps, Le = t.elementType === F ? ue : ll(F, ue);
          return d0(e, t, F, Le, a);
        }
        case Xe:
          return ux(e, t, a);
        case it:
          return ox(e, t, a);
        case ht:
          return sx(e, t, a);
        case vt:
          return Lx(e, t, a);
        case Kt:
          return Mx(e, t, a);
        case ct: {
          var we = t.type, Ct = t.pendingProps, mt = ll(we, Ct);
          if (t.type !== t.elementType) {
            var k = we.propTypes;
            k && tl(
              k,
              mt,
              // Resolved for outer only
              "prop",
              Rt(we)
            );
          }
          return mt = ll(we.type, mt), p0(e, t, we, mt, a);
        }
        case Fe:
          return v0(e, t, t.type, t.pendingProps, a);
        case Ft: {
          var H = t.type, O = t.pendingProps, q = t.elementType === H ? O : ll(H, O);
          return vx(e, t, H, q, a);
        }
        case ln:
          return w0(e, t, a);
        case xt:
          break;
        case ke:
          return h0(e, t, a);
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function Ff(e) {
      e.flags |= gt;
    }
    function D0(e) {
      e.flags |= Sn, e.flags |= ho;
    }
    var k0, _S, O0, L0;
    k0 = function(e, t, a, i) {
      for (var u = t.child; u !== null; ) {
        if (u.tag === ie || u.tag === je)
          n1(e, u.stateNode);
        else if (u.tag !== Se) {
          if (u.child !== null) {
            u.child.return = u, u = u.child;
            continue;
          }
        }
        if (u === t)
          return;
        for (; u.sibling === null; ) {
          if (u.return === null || u.return === t)
            return;
          u = u.return;
        }
        u.sibling.return = u.return, u = u.sibling;
      }
    }, _S = function(e, t) {
    }, O0 = function(e, t, a, i, u) {
      var s = e.memoizedProps;
      if (s !== i) {
        var f = t.stateNode, p = Cg(), v = a1(f, a, s, i, u, p);
        t.updateQueue = v, v && Ff(t);
      }
    }, L0 = function(e, t, a, i) {
      a !== i && Ff(t);
    };
    function zp(e, t) {
      if (!zr())
        switch (e.tailMode) {
          case "hidden": {
            for (var a = e.tail, i = null; a !== null; )
              a.alternate !== null && (i = a), a = a.sibling;
            i === null ? e.tail = null : i.sibling = null;
            break;
          }
          case "collapsed": {
            for (var u = e.tail, s = null; u !== null; )
              u.alternate !== null && (s = u), u = u.sibling;
            s === null ? !t && e.tail !== null ? e.tail.sibling = null : e.tail = null : s.sibling = null;
            break;
          }
        }
    }
    function jr(e) {
      var t = e.alternate !== null && e.alternate.child === e.child, a = Y, i = _e;
      if (t) {
        if ((e.mode & Ot) !== De) {
          for (var v = e.selfBaseDuration, y = e.child; y !== null; )
            a = Ke(a, Ke(y.lanes, y.childLanes)), i |= y.subtreeFlags & Nn, i |= y.flags & Nn, v += y.treeBaseDuration, y = y.sibling;
          e.treeBaseDuration = v;
        } else
          for (var g = e.child; g !== null; )
            a = Ke(a, Ke(g.lanes, g.childLanes)), i |= g.subtreeFlags & Nn, i |= g.flags & Nn, g.return = e, g = g.sibling;
        e.subtreeFlags |= i;
      } else {
        if ((e.mode & Ot) !== De) {
          for (var u = e.actualDuration, s = e.selfBaseDuration, f = e.child; f !== null; )
            a = Ke(a, Ke(f.lanes, f.childLanes)), i |= f.subtreeFlags, i |= f.flags, u += f.actualDuration, s += f.treeBaseDuration, f = f.sibling;
          e.actualDuration = u, e.treeBaseDuration = s;
        } else
          for (var p = e.child; p !== null; )
            a = Ke(a, Ke(p.lanes, p.childLanes)), i |= p.subtreeFlags, i |= p.flags, p.return = e, p = p.sibling;
        e.subtreeFlags |= i;
      }
      return e.childLanes = a, t;
    }
    function zx(e, t, a) {
      if (Sw() && (t.mode & st) !== De && (t.flags & xe) === _e)
        return oC(t), _f(), t.flags |= Er | ss | Xn, !1;
      var i = Ih(t);
      if (a !== null && a.dehydrated !== null)
        if (e === null) {
          if (!i)
            throw new Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
          if (yw(t), jr(t), (t.mode & Ot) !== De) {
            var u = a !== null;
            if (u) {
              var s = t.child;
              s !== null && (t.treeBaseDuration -= s.treeBaseDuration);
            }
          }
          return !1;
        } else {
          if (_f(), (t.flags & xe) === _e && (t.memoizedState = null), t.flags |= gt, jr(t), (t.mode & Ot) !== De) {
            var f = a !== null;
            if (f) {
              var p = t.child;
              p !== null && (t.treeBaseDuration -= p.treeBaseDuration);
            }
          }
          return !1;
        }
      else
        return sC(), !0;
    }
    function M0(e, t, a) {
      var i = t.pendingProps;
      switch (Zy(t), t.tag) {
        case Je:
        case an:
        case Fe:
        case se:
        case Qe:
        case Xe:
        case it:
        case ht:
        case Kt:
        case ct:
          return jr(t), null;
        case de: {
          var u = t.type;
          return $l(u) && Hh(t), jr(t), null;
        }
        case Z: {
          var s = t.stateNode;
          if (Lf(t), qy(t), bg(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), e === null || e.child === null) {
            var f = Ih(t);
            if (f)
              Ff(t);
            else if (e !== null) {
              var p = e.memoizedState;
              // Check if this is a client root
              (!p.isDehydrated || // Check if we reverted to client rendering (e.g. due to an error)
              (t.flags & Er) !== _e) && (t.flags |= Yn, sC());
            }
          }
          return _S(e, t), jr(t), null;
        }
        case ie: {
          Rg(t);
          var v = wC(), y = t.type;
          if (e !== null && t.stateNode != null)
            O0(e, t, y, i, v), e.ref !== t.ref && D0(t);
          else {
            if (!i) {
              if (t.stateNode === null)
                throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
              return jr(t), null;
            }
            var g = Cg(), b = Ih(t);
            if (b)
              hw(t, v, g) && Ff(t);
            else {
              var w = t1(y, i, v, g, t);
              k0(w, t, !1, !1), t.stateNode = w, r1(w, y, i, v) && Ff(t);
            }
            t.ref !== null && D0(t);
          }
          return jr(t), null;
        }
        case je: {
          var M = i;
          if (e && t.stateNode != null) {
            var z = e.memoizedProps;
            L0(e, t, z, M);
          } else {
            if (typeof M != "string" && t.stateNode === null)
              throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
            var F = wC(), ue = Cg(), Le = Ih(t);
            Le ? mw(t) && Ff(t) : t.stateNode = i1(M, F, ue, t);
          }
          return jr(t), null;
        }
        case be: {
          Nf(t);
          var we = t.memoizedState;
          if (e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
            var Ct = zx(e, t, we);
            if (!Ct)
              return t.flags & Xn ? t : null;
          }
          if ((t.flags & xe) !== _e)
            return t.lanes = a, (t.mode & Ot) !== De && Kg(t), t;
          var mt = we !== null, k = e !== null && e.memoizedState !== null;
          if (mt !== k && mt) {
            var H = t.child;
            if (H.flags |= Mn, (t.mode & st) !== De) {
              var O = e === null && (t.memoizedProps.unstable_avoidThisFallback !== !0 || !0);
              O || Tg(al.current, _C) ? Ab() : IS();
            }
          }
          var q = t.updateQueue;
          if (q !== null && (t.flags |= gt), jr(t), (t.mode & Ot) !== De && mt) {
            var pe = t.child;
            pe !== null && (t.treeBaseDuration -= pe.treeBaseDuration);
          }
          return null;
        }
        case Se:
          return Lf(t), _S(e, t), e === null && J1(t.stateNode.containerInfo), jr(t), null;
        case vt:
          var oe = t.type._context;
          return pg(oe, t), jr(t), null;
        case Ft: {
          var Pe = t.type;
          return $l(Pe) && Hh(t), jr(t), null;
        }
        case ln: {
          Nf(t);
          var We = t.memoizedState;
          if (We === null)
            return jr(t), null;
          var qt = (t.flags & xe) !== _e, Nt = We.rendering;
          if (Nt === null)
            if (qt)
              zp(We, !1);
            else {
              var Wn = Fb() && (e === null || (e.flags & xe) === _e);
              if (!Wn)
                for (var Ut = t.child; Ut !== null; ) {
                  var Hn = um(Ut);
                  if (Hn !== null) {
                    qt = !0, t.flags |= xe, zp(We, !1);
                    var la = Hn.updateQueue;
                    return la !== null && (t.updateQueue = la, t.flags |= gt), t.subtreeFlags = _e, bw(t, a), Ao(t, wg(al.current, Rp)), t.child;
                  }
                  Ut = Ut.sibling;
                }
              We.tail !== null && In() > Z0() && (t.flags |= xe, qt = !0, zp(We, !1), t.lanes = _d);
            }
          else {
            if (!qt) {
              var Br = um(Nt);
              if (Br !== null) {
                t.flags |= xe, qt = !0;
                var oi = Br.updateQueue;
                if (oi !== null && (t.updateQueue = oi, t.flags |= gt), zp(We, !0), We.tail === null && We.tailMode === "hidden" && !Nt.alternate && !zr())
                  return jr(t), null;
              } else // The time it took to render last row is greater than the remaining
              // time we have to render. So rendering one more row would likely
              // exceed it.
              In() * 2 - We.renderingStartTime > Z0() && a !== Jr && (t.flags |= xe, qt = !0, zp(We, !1), t.lanes = _d);
            }
            if (We.isBackwards)
              Nt.sibling = t.child, t.child = Nt;
            else {
              var Ca = We.last;
              Ca !== null ? Ca.sibling = Nt : t.child = Nt, We.last = Nt;
            }
          }
          if (We.tail !== null) {
            var Ra = We.tail;
            We.rendering = Ra, We.tail = Ra.sibling, We.renderingStartTime = In(), Ra.sibling = null;
            var ua = al.current;
            return qt ? ua = wg(ua, Rp) : ua = Mf(ua), Ao(t, ua), Ra;
          }
          return jr(t), null;
        }
        case xt:
          break;
        case ke:
        case zt: {
          YS(t);
          var Iu = t.memoizedState, Qf = Iu !== null;
          if (e !== null) {
            var Kp = e.memoizedState, Kl = Kp !== null;
            Kl !== Qf && // LegacyHidden doesn't do any hiding — it only pre-renders.
            !ne && (t.flags |= Mn);
          }
          return !Qf || (t.mode & st) === De ? jr(t) : Zr(Xl, Jr) && (jr(t), t.subtreeFlags & (hn | gt) && (t.flags |= Mn)), null;
        }
        case bt:
          return null;
        case Dt:
          return null;
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function Ax(e, t, a) {
      switch (Zy(t), t.tag) {
        case de: {
          var i = t.type;
          $l(i) && Hh(t);
          var u = t.flags;
          return u & Xn ? (t.flags = u & ~Xn | xe, (t.mode & Ot) !== De && Kg(t), t) : null;
        }
        case Z: {
          t.stateNode, Lf(t), qy(t), bg();
          var s = t.flags;
          return (s & Xn) !== _e && (s & xe) === _e ? (t.flags = s & ~Xn | xe, t) : null;
        }
        case ie:
          return Rg(t), null;
        case be: {
          Nf(t);
          var f = t.memoizedState;
          if (f !== null && f.dehydrated !== null) {
            if (t.alternate === null)
              throw new Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
            _f();
          }
          var p = t.flags;
          return p & Xn ? (t.flags = p & ~Xn | xe, (t.mode & Ot) !== De && Kg(t), t) : null;
        }
        case ln:
          return Nf(t), null;
        case Se:
          return Lf(t), null;
        case vt:
          var v = t.type._context;
          return pg(v, t), null;
        case ke:
        case zt:
          return YS(t), null;
        case bt:
          return null;
        default:
          return null;
      }
    }
    function N0(e, t, a) {
      switch (Zy(t), t.tag) {
        case de: {
          var i = t.type.childContextTypes;
          i != null && Hh(t);
          break;
        }
        case Z: {
          t.stateNode, Lf(t), qy(t), bg();
          break;
        }
        case ie: {
          Rg(t);
          break;
        }
        case Se:
          Lf(t);
          break;
        case be:
          Nf(t);
          break;
        case ln:
          Nf(t);
          break;
        case vt:
          var u = t.type._context;
          pg(u, t);
          break;
        case ke:
        case zt:
          YS(t);
          break;
      }
    }
    var U0 = null;
    U0 = /* @__PURE__ */ new Set();
    var Lm = !1, Fr = !1, jx = typeof WeakSet == "function" ? WeakSet : Set, ge = null, Hf = null, Pf = null;
    function Fx(e) {
      xl(null, function() {
        throw e;
      }), os();
    }
    var Hx = function(e, t) {
      if (t.props = e.memoizedProps, t.state = e.memoizedState, e.mode & Ot)
        try {
          Gl(), t.componentWillUnmount();
        } finally {
          Wl(e);
        }
      else
        t.componentWillUnmount();
    };
    function z0(e, t) {
      try {
        Ho(cr, e);
      } catch (a) {
        cn(e, t, a);
      }
    }
    function DS(e, t, a) {
      try {
        Hx(e, a);
      } catch (i) {
        cn(e, t, i);
      }
    }
    function Px(e, t, a) {
      try {
        a.componentDidMount();
      } catch (i) {
        cn(e, t, i);
      }
    }
    function A0(e, t) {
      try {
        F0(e);
      } catch (a) {
        cn(e, t, a);
      }
    }
    function Vf(e, t) {
      var a = e.ref;
      if (a !== null)
        if (typeof a == "function") {
          var i;
          try {
            if (ze && lt && e.mode & Ot)
              try {
                Gl(), i = a(null);
              } finally {
                Wl(e);
              }
            else
              i = a(null);
          } catch (u) {
            cn(e, t, u);
          }
          typeof i == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", Be(e));
        } else
          a.current = null;
    }
    function Mm(e, t, a) {
      try {
        a();
      } catch (i) {
        cn(e, t, i);
      }
    }
    var j0 = !1;
    function Vx(e, t) {
      ZT(e.containerInfo), ge = t, Bx();
      var a = j0;
      return j0 = !1, a;
    }
    function Bx() {
      for (; ge !== null; ) {
        var e = ge, t = e.child;
        (e.subtreeFlags & _l) !== _e && t !== null ? (t.return = e, ge = t) : $x();
      }
    }
    function $x() {
      for (; ge !== null; ) {
        var e = ge;
        Yt(e);
        try {
          Yx(e);
        } catch (a) {
          cn(e, e.return, a);
        }
        sn();
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, ge = t;
          return;
        }
        ge = e.return;
      }
    }
    function Yx(e) {
      var t = e.alternate, a = e.flags;
      if ((a & Yn) !== _e) {
        switch (Yt(e), e.tag) {
          case se:
          case Qe:
          case Fe:
            break;
          case de: {
            if (t !== null) {
              var i = t.memoizedProps, u = t.memoizedState, s = e.stateNode;
              e.type === e.elementType && !tc && (s.props !== e.memoizedProps && S("Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Be(e) || "instance"), s.state !== e.memoizedState && S("Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Be(e) || "instance"));
              var f = s.getSnapshotBeforeUpdate(e.elementType === e.type ? i : ll(e.type, i), u);
              {
                var p = U0;
                f === void 0 && !p.has(e.type) && (p.add(e.type), S("%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.", Be(e)));
              }
              s.__reactInternalSnapshotBeforeUpdate = f;
            }
            break;
          }
          case Z: {
            {
              var v = e.stateNode;
              w1(v.containerInfo);
            }
            break;
          }
          case ie:
          case je:
          case Se:
          case Ft:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
        sn();
      }
    }
    function ol(e, t, a) {
      var i = t.updateQueue, u = i !== null ? i.lastEffect : null;
      if (u !== null) {
        var s = u.next, f = s;
        do {
          if ((f.tag & e) === e) {
            var p = f.destroy;
            f.destroy = void 0, p !== void 0 && ((e & Ar) !== Ha ? qi(t) : (e & cr) !== Ha && fs(t), (e & Yl) !== Ha && Gp(!0), Mm(t, a, p), (e & Yl) !== Ha && Gp(!1), (e & Ar) !== Ha ? Ll() : (e & cr) !== Ha && xd());
          }
          f = f.next;
        } while (f !== s);
      }
    }
    function Ho(e, t) {
      var a = t.updateQueue, i = a !== null ? a.lastEffect : null;
      if (i !== null) {
        var u = i.next, s = u;
        do {
          if ((s.tag & e) === e) {
            (e & Ar) !== Ha ? wd(t) : (e & cr) !== Ha && Lc(t);
            var f = s.create;
            (e & Yl) !== Ha && Gp(!0), s.destroy = f(), (e & Yl) !== Ha && Gp(!1), (e & Ar) !== Ha ? jv() : (e & cr) !== Ha && Fv();
            {
              var p = s.destroy;
              if (p !== void 0 && typeof p != "function") {
                var v = void 0;
                (s.tag & cr) !== _e ? v = "useLayoutEffect" : (s.tag & Yl) !== _e ? v = "useInsertionEffect" : v = "useEffect";
                var y = void 0;
                p === null ? y = " You returned null. If your effect does not require clean up, return undefined (or nothing)." : typeof p.then == "function" ? y = `

It looks like you wrote ` + v + `(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

` + v + `(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

Learn more about data fetching with Hooks: https://reactjs.org/link/hooks-data-fetching` : y = " You returned: " + p, S("%s must not return anything besides a function, which is used for clean-up.%s", v, y);
              }
            }
          }
          s = s.next;
        } while (s !== u);
      }
    }
    function Ix(e, t) {
      if ((t.flags & gt) !== _e)
        switch (t.tag) {
          case ht: {
            var a = t.stateNode.passiveEffectDuration, i = t.memoizedProps, u = i.id, s = i.onPostCommit, f = ZC(), p = t.alternate === null ? "mount" : "update";
            JC() && (p = "nested-update"), typeof s == "function" && s(u, p, a, f);
            var v = t.return;
            e: for (; v !== null; ) {
              switch (v.tag) {
                case Z:
                  var y = v.stateNode;
                  y.passiveEffectDuration += a;
                  break e;
                case ht:
                  var g = v.stateNode;
                  g.passiveEffectDuration += a;
                  break e;
              }
              v = v.return;
            }
            break;
          }
        }
    }
    function Qx(e, t, a, i) {
      if ((a.flags & kl) !== _e)
        switch (a.tag) {
          case se:
          case Qe:
          case Fe: {
            if (!Fr)
              if (a.mode & Ot)
                try {
                  Gl(), Ho(cr | sr, a);
                } finally {
                  Wl(a);
                }
              else
                Ho(cr | sr, a);
            break;
          }
          case de: {
            var u = a.stateNode;
            if (a.flags & gt && !Fr)
              if (t === null)
                if (a.type === a.elementType && !tc && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Be(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Be(a) || "instance")), a.mode & Ot)
                  try {
                    Gl(), u.componentDidMount();
                  } finally {
                    Wl(a);
                  }
                else
                  u.componentDidMount();
              else {
                var s = a.elementType === a.type ? t.memoizedProps : ll(a.type, t.memoizedProps), f = t.memoizedState;
                if (a.type === a.elementType && !tc && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Be(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Be(a) || "instance")), a.mode & Ot)
                  try {
                    Gl(), u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
                  } finally {
                    Wl(a);
                  }
                else
                  u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
              }
            var p = a.updateQueue;
            p !== null && (a.type === a.elementType && !tc && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", Be(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", Be(a) || "instance")), TC(a, p, u));
            break;
          }
          case Z: {
            var v = a.updateQueue;
            if (v !== null) {
              var y = null;
              if (a.child !== null)
                switch (a.child.tag) {
                  case ie:
                    y = a.child.stateNode;
                    break;
                  case de:
                    y = a.child.stateNode;
                    break;
                }
              TC(a, v, y);
            }
            break;
          }
          case ie: {
            var g = a.stateNode;
            if (t === null && a.flags & gt) {
              var b = a.type, w = a.memoizedProps;
              c1(g, b, w);
            }
            break;
          }
          case je:
            break;
          case Se:
            break;
          case ht: {
            {
              var M = a.memoizedProps, z = M.onCommit, F = M.onRender, ue = a.stateNode.effectDuration, Le = ZC(), we = t === null ? "mount" : "update";
              JC() && (we = "nested-update"), typeof F == "function" && F(a.memoizedProps.id, we, a.actualDuration, a.treeBaseDuration, a.actualStartTime, Le);
              {
                typeof z == "function" && z(a.memoizedProps.id, we, ue, Le), $b(a);
                var Ct = a.return;
                e: for (; Ct !== null; ) {
                  switch (Ct.tag) {
                    case Z:
                      var mt = Ct.stateNode;
                      mt.effectDuration += ue;
                      break e;
                    case ht:
                      var k = Ct.stateNode;
                      k.effectDuration += ue;
                      break e;
                  }
                  Ct = Ct.return;
                }
              }
            }
            break;
          }
          case be: {
            eb(e, a);
            break;
          }
          case ln:
          case Ft:
          case xt:
          case ke:
          case zt:
          case Dt:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
      Fr || a.flags & Sn && F0(a);
    }
    function Wx(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          if (e.mode & Ot)
            try {
              Gl(), z0(e, e.return);
            } finally {
              Wl(e);
            }
          else
            z0(e, e.return);
          break;
        }
        case de: {
          var t = e.stateNode;
          typeof t.componentDidMount == "function" && Px(e, e.return, t), A0(e, e.return);
          break;
        }
        case ie: {
          A0(e, e.return);
          break;
        }
      }
    }
    function Gx(e, t) {
      for (var a = null, i = e; ; ) {
        if (i.tag === ie) {
          if (a === null) {
            a = i;
            try {
              var u = i.stateNode;
              t ? E1(u) : R1(i.stateNode, i.memoizedProps);
            } catch (f) {
              cn(e, e.return, f);
            }
          }
        } else if (i.tag === je) {
          if (a === null)
            try {
              var s = i.stateNode;
              t ? C1(s) : T1(s, i.memoizedProps);
            } catch (f) {
              cn(e, e.return, f);
            }
        } else if (!((i.tag === ke || i.tag === zt) && i.memoizedState !== null && i !== e)) {
          if (i.child !== null) {
            i.child.return = i, i = i.child;
            continue;
          }
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          a === i && (a = null), i = i.return;
        }
        a === i && (a = null), i.sibling.return = i.return, i = i.sibling;
      }
    }
    function F0(e) {
      var t = e.ref;
      if (t !== null) {
        var a = e.stateNode, i;
        switch (e.tag) {
          case ie:
            i = a;
            break;
          default:
            i = a;
        }
        if (typeof t == "function") {
          var u;
          if (e.mode & Ot)
            try {
              Gl(), u = t(i);
            } finally {
              Wl(e);
            }
          else
            u = t(i);
          typeof u == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", Be(e));
        } else
          t.hasOwnProperty("current") || S("Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().", Be(e)), t.current = i;
      }
    }
    function qx(e) {
      var t = e.alternate;
      t !== null && (t.return = null), e.return = null;
    }
    function H0(e) {
      var t = e.alternate;
      t !== null && (e.alternate = null, H0(t));
      {
        if (e.child = null, e.deletions = null, e.sibling = null, e.tag === ie) {
          var a = e.stateNode;
          a !== null && tw(a);
        }
        e.stateNode = null, e._debugOwner = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
      }
    }
    function Xx(e) {
      for (var t = e.return; t !== null; ) {
        if (P0(t))
          return t;
        t = t.return;
      }
      throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
    }
    function P0(e) {
      return e.tag === ie || e.tag === Z || e.tag === Se;
    }
    function V0(e) {
      var t = e;
      e: for (; ; ) {
        for (; t.sibling === null; ) {
          if (t.return === null || P0(t.return))
            return null;
          t = t.return;
        }
        for (t.sibling.return = t.return, t = t.sibling; t.tag !== ie && t.tag !== je && t.tag !== Jt; ) {
          if (t.flags & hn || t.child === null || t.tag === Se)
            continue e;
          t.child.return = t, t = t.child;
        }
        if (!(t.flags & hn))
          return t.stateNode;
      }
    }
    function Kx(e) {
      var t = Xx(e);
      switch (t.tag) {
        case ie: {
          var a = t.stateNode;
          t.flags & ka && ($E(a), t.flags &= ~ka);
          var i = V0(e);
          OS(e, i, a);
          break;
        }
        case Z:
        case Se: {
          var u = t.stateNode.containerInfo, s = V0(e);
          kS(e, s, u);
          break;
        }
        default:
          throw new Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    function kS(e, t, a) {
      var i = e.tag, u = i === ie || i === je;
      if (u) {
        var s = e.stateNode;
        t ? m1(a, s, t) : v1(a, s);
      } else if (i !== Se) {
        var f = e.child;
        if (f !== null) {
          kS(f, t, a);
          for (var p = f.sibling; p !== null; )
            kS(p, t, a), p = p.sibling;
        }
      }
    }
    function OS(e, t, a) {
      var i = e.tag, u = i === ie || i === je;
      if (u) {
        var s = e.stateNode;
        t ? h1(a, s, t) : p1(a, s);
      } else if (i !== Se) {
        var f = e.child;
        if (f !== null) {
          OS(f, t, a);
          for (var p = f.sibling; p !== null; )
            OS(p, t, a), p = p.sibling;
        }
      }
    }
    var Hr = null, sl = !1;
    function Jx(e, t, a) {
      {
        var i = t;
        e: for (; i !== null; ) {
          switch (i.tag) {
            case ie: {
              Hr = i.stateNode, sl = !1;
              break e;
            }
            case Z: {
              Hr = i.stateNode.containerInfo, sl = !0;
              break e;
            }
            case Se: {
              Hr = i.stateNode.containerInfo, sl = !0;
              break e;
            }
          }
          i = i.return;
        }
        if (Hr === null)
          throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
        B0(e, t, a), Hr = null, sl = !1;
      }
      qx(a);
    }
    function Po(e, t, a) {
      for (var i = a.child; i !== null; )
        B0(e, t, i), i = i.sibling;
    }
    function B0(e, t, a) {
      switch (Cd(a), a.tag) {
        case ie:
          Fr || Vf(a, t);
        case je: {
          {
            var i = Hr, u = sl;
            Hr = null, Po(e, t, a), Hr = i, sl = u, Hr !== null && (sl ? g1(Hr, a.stateNode) : y1(Hr, a.stateNode));
          }
          return;
        }
        case Jt: {
          Hr !== null && (sl ? S1(Hr, a.stateNode) : Vy(Hr, a.stateNode));
          return;
        }
        case Se: {
          {
            var s = Hr, f = sl;
            Hr = a.stateNode.containerInfo, sl = !0, Po(e, t, a), Hr = s, sl = f;
          }
          return;
        }
        case se:
        case Qe:
        case ct:
        case Fe: {
          if (!Fr) {
            var p = a.updateQueue;
            if (p !== null) {
              var v = p.lastEffect;
              if (v !== null) {
                var y = v.next, g = y;
                do {
                  var b = g, w = b.destroy, M = b.tag;
                  w !== void 0 && ((M & Yl) !== Ha ? Mm(a, t, w) : (M & cr) !== Ha && (fs(a), a.mode & Ot ? (Gl(), Mm(a, t, w), Wl(a)) : Mm(a, t, w), xd())), g = g.next;
                } while (g !== y);
              }
            }
          }
          Po(e, t, a);
          return;
        }
        case de: {
          if (!Fr) {
            Vf(a, t);
            var z = a.stateNode;
            typeof z.componentWillUnmount == "function" && DS(a, t, z);
          }
          Po(e, t, a);
          return;
        }
        case xt: {
          Po(e, t, a);
          return;
        }
        case ke: {
          if (
            // TODO: Remove this dead flag
            a.mode & st
          ) {
            var F = Fr;
            Fr = F || a.memoizedState !== null, Po(e, t, a), Fr = F;
          } else
            Po(e, t, a);
          break;
        }
        default: {
          Po(e, t, a);
          return;
        }
      }
    }
    function Zx(e) {
      e.memoizedState;
    }
    function eb(e, t) {
      var a = t.memoizedState;
      if (a === null) {
        var i = t.alternate;
        if (i !== null) {
          var u = i.memoizedState;
          if (u !== null) {
            var s = u.dehydrated;
            s !== null && F1(s);
          }
        }
      }
    }
    function $0(e) {
      var t = e.updateQueue;
      if (t !== null) {
        e.updateQueue = null;
        var a = e.stateNode;
        a === null && (a = e.stateNode = new jx()), t.forEach(function(i) {
          var u = Xb.bind(null, e, i);
          if (!a.has(i)) {
            if (a.add(i), Kr)
              if (Hf !== null && Pf !== null)
                Wp(Pf, Hf);
              else
                throw Error("Expected finished root and lanes to be set. This is a bug in React.");
            i.then(u, u);
          }
        });
      }
    }
    function tb(e, t, a) {
      Hf = a, Pf = e, Yt(t), Y0(t, e), Yt(t), Hf = null, Pf = null;
    }
    function cl(e, t, a) {
      var i = t.deletions;
      if (i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u];
          try {
            Jx(e, t, s);
          } catch (v) {
            cn(s, t, v);
          }
        }
      var f = gl();
      if (t.subtreeFlags & Dl)
        for (var p = t.child; p !== null; )
          Yt(p), Y0(p, e), p = p.sibling;
      Yt(f);
    }
    function Y0(e, t, a) {
      var i = e.alternate, u = e.flags;
      switch (e.tag) {
        case se:
        case Qe:
        case ct:
        case Fe: {
          if (cl(t, e), ql(e), u & gt) {
            try {
              ol(Yl | sr, e, e.return), Ho(Yl | sr, e);
            } catch (Pe) {
              cn(e, e.return, Pe);
            }
            if (e.mode & Ot) {
              try {
                Gl(), ol(cr | sr, e, e.return);
              } catch (Pe) {
                cn(e, e.return, Pe);
              }
              Wl(e);
            } else
              try {
                ol(cr | sr, e, e.return);
              } catch (Pe) {
                cn(e, e.return, Pe);
              }
          }
          return;
        }
        case de: {
          cl(t, e), ql(e), u & Sn && i !== null && Vf(i, i.return);
          return;
        }
        case ie: {
          cl(t, e), ql(e), u & Sn && i !== null && Vf(i, i.return);
          {
            if (e.flags & ka) {
              var s = e.stateNode;
              try {
                $E(s);
              } catch (Pe) {
                cn(e, e.return, Pe);
              }
            }
            if (u & gt) {
              var f = e.stateNode;
              if (f != null) {
                var p = e.memoizedProps, v = i !== null ? i.memoizedProps : p, y = e.type, g = e.updateQueue;
                if (e.updateQueue = null, g !== null)
                  try {
                    f1(f, g, y, v, p, e);
                  } catch (Pe) {
                    cn(e, e.return, Pe);
                  }
              }
            }
          }
          return;
        }
        case je: {
          if (cl(t, e), ql(e), u & gt) {
            if (e.stateNode === null)
              throw new Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
            var b = e.stateNode, w = e.memoizedProps, M = i !== null ? i.memoizedProps : w;
            try {
              d1(b, M, w);
            } catch (Pe) {
              cn(e, e.return, Pe);
            }
          }
          return;
        }
        case Z: {
          if (cl(t, e), ql(e), u & gt && i !== null) {
            var z = i.memoizedState;
            if (z.isDehydrated)
              try {
                j1(t.containerInfo);
              } catch (Pe) {
                cn(e, e.return, Pe);
              }
          }
          return;
        }
        case Se: {
          cl(t, e), ql(e);
          return;
        }
        case be: {
          cl(t, e), ql(e);
          var F = e.child;
          if (F.flags & Mn) {
            var ue = F.stateNode, Le = F.memoizedState, we = Le !== null;
            if (ue.isHidden = we, we) {
              var Ct = F.alternate !== null && F.alternate.memoizedState !== null;
              Ct || zb();
            }
          }
          if (u & gt) {
            try {
              Zx(e);
            } catch (Pe) {
              cn(e, e.return, Pe);
            }
            $0(e);
          }
          return;
        }
        case ke: {
          var mt = i !== null && i.memoizedState !== null;
          if (
            // TODO: Remove this dead flag
            e.mode & st
          ) {
            var k = Fr;
            Fr = k || mt, cl(t, e), Fr = k;
          } else
            cl(t, e);
          if (ql(e), u & Mn) {
            var H = e.stateNode, O = e.memoizedState, q = O !== null, pe = e;
            if (H.isHidden = q, q && !mt && (pe.mode & st) !== De) {
              ge = pe;
              for (var oe = pe.child; oe !== null; )
                ge = oe, rb(oe), oe = oe.sibling;
            }
            Gx(pe, q);
          }
          return;
        }
        case ln: {
          cl(t, e), ql(e), u & gt && $0(e);
          return;
        }
        case xt:
          return;
        default: {
          cl(t, e), ql(e);
          return;
        }
      }
    }
    function ql(e) {
      var t = e.flags;
      if (t & hn) {
        try {
          Kx(e);
        } catch (a) {
          cn(e, e.return, a);
        }
        e.flags &= ~hn;
      }
      t & Gr && (e.flags &= ~Gr);
    }
    function nb(e, t, a) {
      Hf = a, Pf = t, ge = e, I0(e, t, a), Hf = null, Pf = null;
    }
    function I0(e, t, a) {
      for (var i = (e.mode & st) !== De; ge !== null; ) {
        var u = ge, s = u.child;
        if (u.tag === ke && i) {
          var f = u.memoizedState !== null, p = f || Lm;
          if (p) {
            LS(e, t, a);
            continue;
          } else {
            var v = u.alternate, y = v !== null && v.memoizedState !== null, g = y || Fr, b = Lm, w = Fr;
            Lm = p, Fr = g, Fr && !w && (ge = u, ab(u));
            for (var M = s; M !== null; )
              ge = M, I0(
                M,
                // New root; bubble back up to here and stop.
                t,
                a
              ), M = M.sibling;
            ge = u, Lm = b, Fr = w, LS(e, t, a);
            continue;
          }
        }
        (u.subtreeFlags & kl) !== _e && s !== null ? (s.return = u, ge = s) : LS(e, t, a);
      }
    }
    function LS(e, t, a) {
      for (; ge !== null; ) {
        var i = ge;
        if ((i.flags & kl) !== _e) {
          var u = i.alternate;
          Yt(i);
          try {
            Qx(t, u, i, a);
          } catch (f) {
            cn(i, i.return, f);
          }
          sn();
        }
        if (i === e) {
          ge = null;
          return;
        }
        var s = i.sibling;
        if (s !== null) {
          s.return = i.return, ge = s;
          return;
        }
        ge = i.return;
      }
    }
    function rb(e) {
      for (; ge !== null; ) {
        var t = ge, a = t.child;
        switch (t.tag) {
          case se:
          case Qe:
          case ct:
          case Fe: {
            if (t.mode & Ot)
              try {
                Gl(), ol(cr, t, t.return);
              } finally {
                Wl(t);
              }
            else
              ol(cr, t, t.return);
            break;
          }
          case de: {
            Vf(t, t.return);
            var i = t.stateNode;
            typeof i.componentWillUnmount == "function" && DS(t, t.return, i);
            break;
          }
          case ie: {
            Vf(t, t.return);
            break;
          }
          case ke: {
            var u = t.memoizedState !== null;
            if (u) {
              Q0(e);
              continue;
            }
            break;
          }
        }
        a !== null ? (a.return = t, ge = a) : Q0(e);
      }
    }
    function Q0(e) {
      for (; ge !== null; ) {
        var t = ge;
        if (t === e) {
          ge = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, ge = a;
          return;
        }
        ge = t.return;
      }
    }
    function ab(e) {
      for (; ge !== null; ) {
        var t = ge, a = t.child;
        if (t.tag === ke) {
          var i = t.memoizedState !== null;
          if (i) {
            W0(e);
            continue;
          }
        }
        a !== null ? (a.return = t, ge = a) : W0(e);
      }
    }
    function W0(e) {
      for (; ge !== null; ) {
        var t = ge;
        Yt(t);
        try {
          Wx(t);
        } catch (i) {
          cn(t, t.return, i);
        }
        if (sn(), t === e) {
          ge = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, ge = a;
          return;
        }
        ge = t.return;
      }
    }
    function ib(e, t, a, i) {
      ge = t, lb(t, e, a, i);
    }
    function lb(e, t, a, i) {
      for (; ge !== null; ) {
        var u = ge, s = u.child;
        (u.subtreeFlags & Wi) !== _e && s !== null ? (s.return = u, ge = s) : ub(e, t, a, i);
      }
    }
    function ub(e, t, a, i) {
      for (; ge !== null; ) {
        var u = ge;
        if ((u.flags & Wr) !== _e) {
          Yt(u);
          try {
            ob(t, u, a, i);
          } catch (f) {
            cn(u, u.return, f);
          }
          sn();
        }
        if (u === e) {
          ge = null;
          return;
        }
        var s = u.sibling;
        if (s !== null) {
          s.return = u.return, ge = s;
          return;
        }
        ge = u.return;
      }
    }
    function ob(e, t, a, i) {
      switch (t.tag) {
        case se:
        case Qe:
        case Fe: {
          if (t.mode & Ot) {
            Xg();
            try {
              Ho(Ar | sr, t);
            } finally {
              qg(t);
            }
          } else
            Ho(Ar | sr, t);
          break;
        }
      }
    }
    function sb(e) {
      ge = e, cb();
    }
    function cb() {
      for (; ge !== null; ) {
        var e = ge, t = e.child;
        if ((ge.flags & Da) !== _e) {
          var a = e.deletions;
          if (a !== null) {
            for (var i = 0; i < a.length; i++) {
              var u = a[i];
              ge = u, pb(u, e);
            }
            {
              var s = e.alternate;
              if (s !== null) {
                var f = s.child;
                if (f !== null) {
                  s.child = null;
                  do {
                    var p = f.sibling;
                    f.sibling = null, f = p;
                  } while (f !== null);
                }
              }
            }
            ge = e;
          }
        }
        (e.subtreeFlags & Wi) !== _e && t !== null ? (t.return = e, ge = t) : fb();
      }
    }
    function fb() {
      for (; ge !== null; ) {
        var e = ge;
        (e.flags & Wr) !== _e && (Yt(e), db(e), sn());
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, ge = t;
          return;
        }
        ge = e.return;
      }
    }
    function db(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          e.mode & Ot ? (Xg(), ol(Ar | sr, e, e.return), qg(e)) : ol(Ar | sr, e, e.return);
          break;
        }
      }
    }
    function pb(e, t) {
      for (; ge !== null; ) {
        var a = ge;
        Yt(a), hb(a, t), sn();
        var i = a.child;
        i !== null ? (i.return = a, ge = i) : vb(e);
      }
    }
    function vb(e) {
      for (; ge !== null; ) {
        var t = ge, a = t.sibling, i = t.return;
        if (H0(t), t === e) {
          ge = null;
          return;
        }
        if (a !== null) {
          a.return = i, ge = a;
          return;
        }
        ge = i;
      }
    }
    function hb(e, t) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          e.mode & Ot ? (Xg(), ol(Ar, e, t), qg(e)) : ol(Ar, e, t);
          break;
        }
      }
    }
    function mb(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          try {
            Ho(cr | sr, e);
          } catch (a) {
            cn(e, e.return, a);
          }
          break;
        }
        case de: {
          var t = e.stateNode;
          try {
            t.componentDidMount();
          } catch (a) {
            cn(e, e.return, a);
          }
          break;
        }
      }
    }
    function yb(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          try {
            Ho(Ar | sr, e);
          } catch (t) {
            cn(e, e.return, t);
          }
          break;
        }
      }
    }
    function gb(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe: {
          try {
            ol(cr | sr, e, e.return);
          } catch (a) {
            cn(e, e.return, a);
          }
          break;
        }
        case de: {
          var t = e.stateNode;
          typeof t.componentWillUnmount == "function" && DS(e, e.return, t);
          break;
        }
      }
    }
    function Sb(e) {
      switch (e.tag) {
        case se:
        case Qe:
        case Fe:
          try {
            ol(Ar | sr, e, e.return);
          } catch (t) {
            cn(e, e.return, t);
          }
      }
    }
    if (typeof Symbol == "function" && Symbol.for) {
      var Ap = Symbol.for;
      Ap("selector.component"), Ap("selector.has_pseudo_class"), Ap("selector.role"), Ap("selector.test_id"), Ap("selector.text");
    }
    var Eb = [];
    function Cb() {
      Eb.forEach(function(e) {
        return e();
      });
    }
    var Rb = A.ReactCurrentActQueue;
    function Tb(e) {
      {
        var t = (
          // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
          typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0
        ), a = typeof jest < "u";
        return a && t !== !1;
      }
    }
    function G0() {
      {
        var e = (
          // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
          typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0
        );
        return !e && Rb.current !== null && S("The current testing environment is not configured to support act(...)"), e;
      }
    }
    var wb = Math.ceil, MS = A.ReactCurrentDispatcher, NS = A.ReactCurrentOwner, Pr = A.ReactCurrentBatchConfig, fl = A.ReactCurrentActQueue, pr = (
      /*             */
      0
    ), q0 = (
      /*               */
      1
    ), Vr = (
      /*                */
      2
    ), Ai = (
      /*                */
      4
    ), Vu = 0, jp = 1, nc = 2, Nm = 3, Fp = 4, X0 = 5, US = 6, Et = pr, Sa = null, Dn = null, vr = Y, Xl = Y, zS = Oo(Y), hr = Vu, Hp = null, Um = Y, Pp = Y, zm = Y, Vp = null, Pa = null, AS = 0, K0 = 500, J0 = 1 / 0, xb = 500, Bu = null;
    function Bp() {
      J0 = In() + xb;
    }
    function Z0() {
      return J0;
    }
    var Am = !1, jS = null, Bf = null, rc = !1, Vo = null, $p = Y, FS = [], HS = null, bb = 50, Yp = 0, PS = null, VS = !1, jm = !1, _b = 50, $f = 0, Fm = null, Ip = Xt, Hm = Y, eR = !1;
    function Pm() {
      return Sa;
    }
    function Ea() {
      return (Et & (Vr | Ai)) !== pr ? In() : (Ip !== Xt || (Ip = In()), Ip);
    }
    function Bo(e) {
      var t = e.mode;
      if ((t & st) === De)
        return Ae;
      if ((Et & Vr) !== pr && vr !== Y)
        return ws(vr);
      var a = Rw() !== Cw;
      if (a) {
        if (Pr.transition !== null) {
          var i = Pr.transition;
          i._updatedFibers || (i._updatedFibers = /* @__PURE__ */ new Set()), i._updatedFibers.add(e);
        }
        return Hm === _t && (Hm = Nd()), Hm;
      }
      var u = za();
      if (u !== _t)
        return u;
      var s = l1();
      return s;
    }
    function Db(e) {
      var t = e.mode;
      return (t & st) === De ? Ae : Yv();
    }
    function mr(e, t, a, i) {
      Jb(), eR && S("useInsertionEffect must not schedule updates."), VS && (jm = !0), So(e, a, i), (Et & Vr) !== Y && e === Sa ? t_(t) : (Kr && _s(e, t, a), n_(t), e === Sa && ((Et & Vr) === pr && (Pp = Ke(Pp, a)), hr === Fp && $o(e, vr)), Va(e, i), a === Ae && Et === pr && (t.mode & st) === De && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
      !fl.isBatchingLegacy && (Bp(), eC()));
    }
    function kb(e, t, a) {
      var i = e.current;
      i.lanes = t, So(e, t, a), Va(e, a);
    }
    function Ob(e) {
      return (
        // TODO: Remove outdated deferRenderPhaseUpdateToNextBatch experiment. We
        // decided not to enable it.
        (Et & Vr) !== pr
      );
    }
    function Va(e, t) {
      var a = e.callbackNode;
      Kc(e, t);
      var i = Xc(e, e === Sa ? vr : Y);
      if (i === Y) {
        a !== null && mR(a), e.callbackNode = null, e.callbackPriority = _t;
        return;
      }
      var u = Ul(i), s = e.callbackPriority;
      if (s === u && // Special case related to `act`. If the currently scheduled task is a
      // Scheduler task, rather than an `act` task, cancel it and re-scheduled
      // on the `act` queue.
      !(fl.current !== null && a !== GS)) {
        a == null && s !== Ae && S("Expected scheduled callback to exist. This error is likely caused by a bug in React. Please file an issue.");
        return;
      }
      a != null && mR(a);
      var f;
      if (u === Ae)
        e.tag === Lo ? (fl.isBatchingLegacy !== null && (fl.didScheduleLegacyUpdate = !0), aw(rR.bind(null, e))) : ZE(rR.bind(null, e)), fl.current !== null ? fl.current.push(Mo) : o1(function() {
          (Et & (Vr | Ai)) === pr && Mo();
        }), f = null;
      else {
        var p;
        switch (Kv(i)) {
          case Or:
            p = cs;
            break;
          case bi:
            p = Ol;
            break;
          case Na:
            p = Gi;
            break;
          case Ua:
            p = hu;
            break;
          default:
            p = Gi;
            break;
        }
        f = qS(p, tR.bind(null, e));
      }
      e.callbackPriority = u, e.callbackNode = f;
    }
    function tR(e, t) {
      if (Gw(), Ip = Xt, Hm = Y, (Et & (Vr | Ai)) !== pr)
        throw new Error("Should not already be working.");
      var a = e.callbackNode, i = Yu();
      if (i && e.callbackNode !== a)
        return null;
      var u = Xc(e, e === Sa ? vr : Y);
      if (u === Y)
        return null;
      var s = !Zc(e, u) && !$v(e, u) && !t, f = s ? Pb(e, u) : Bm(e, u);
      if (f !== Vu) {
        if (f === nc) {
          var p = Jc(e);
          p !== Y && (u = p, f = BS(e, p));
        }
        if (f === jp) {
          var v = Hp;
          throw ac(e, Y), $o(e, u), Va(e, In()), v;
        }
        if (f === US)
          $o(e, u);
        else {
          var y = !Zc(e, u), g = e.current.alternate;
          if (y && !Mb(g)) {
            if (f = Bm(e, u), f === nc) {
              var b = Jc(e);
              b !== Y && (u = b, f = BS(e, b));
            }
            if (f === jp) {
              var w = Hp;
              throw ac(e, Y), $o(e, u), Va(e, In()), w;
            }
          }
          e.finishedWork = g, e.finishedLanes = u, Lb(e, f, u);
        }
      }
      return Va(e, In()), e.callbackNode === a ? tR.bind(null, e) : null;
    }
    function BS(e, t) {
      var a = Vp;
      if (nf(e)) {
        var i = ac(e, t);
        i.flags |= Er, K1(e.containerInfo);
      }
      var u = Bm(e, t);
      if (u !== nc) {
        var s = Pa;
        Pa = a, s !== null && nR(s);
      }
      return u;
    }
    function nR(e) {
      Pa === null ? Pa = e : Pa.push.apply(Pa, e);
    }
    function Lb(e, t, a) {
      switch (t) {
        case Vu:
        case jp:
          throw new Error("Root did not complete. This is a bug in React.");
        case nc: {
          ic(e, Pa, Bu);
          break;
        }
        case Nm: {
          if ($o(e, a), bu(a) && // do not delay if we're inside an act() scope
          !yR()) {
            var i = AS + K0 - In();
            if (i > 10) {
              var u = Xc(e, Y);
              if (u !== Y)
                break;
              var s = e.suspendedLanes;
              if (!_u(s, a)) {
                Ea(), ef(e, s);
                break;
              }
              e.timeoutHandle = Hy(ic.bind(null, e, Pa, Bu), i);
              break;
            }
          }
          ic(e, Pa, Bu);
          break;
        }
        case Fp: {
          if ($o(e, a), Ld(a))
            break;
          if (!yR()) {
            var f = ri(e, a), p = f, v = In() - p, y = Kb(v) - v;
            if (y > 10) {
              e.timeoutHandle = Hy(ic.bind(null, e, Pa, Bu), y);
              break;
            }
          }
          ic(e, Pa, Bu);
          break;
        }
        case X0: {
          ic(e, Pa, Bu);
          break;
        }
        default:
          throw new Error("Unknown root exit status.");
      }
    }
    function Mb(e) {
      for (var t = e; ; ) {
        if (t.flags & vo) {
          var a = t.updateQueue;
          if (a !== null) {
            var i = a.stores;
            if (i !== null)
              for (var u = 0; u < i.length; u++) {
                var s = i[u], f = s.getSnapshot, p = s.value;
                try {
                  if (!W(f(), p))
                    return !1;
                } catch {
                  return !1;
                }
              }
          }
        }
        var v = t.child;
        if (t.subtreeFlags & vo && v !== null) {
          v.return = t, t = v;
          continue;
        }
        if (t === e)
          return !0;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return !0;
    }
    function $o(e, t) {
      t = xs(t, zm), t = xs(t, Pp), Wv(e, t);
    }
    function rR(e) {
      if (qw(), (Et & (Vr | Ai)) !== pr)
        throw new Error("Should not already be working.");
      Yu();
      var t = Xc(e, Y);
      if (!Zr(t, Ae))
        return Va(e, In()), null;
      var a = Bm(e, t);
      if (e.tag !== Lo && a === nc) {
        var i = Jc(e);
        i !== Y && (t = i, a = BS(e, i));
      }
      if (a === jp) {
        var u = Hp;
        throw ac(e, Y), $o(e, t), Va(e, In()), u;
      }
      if (a === US)
        throw new Error("Root did not complete. This is a bug in React.");
      var s = e.current.alternate;
      return e.finishedWork = s, e.finishedLanes = t, ic(e, Pa, Bu), Va(e, In()), null;
    }
    function Nb(e, t) {
      t !== Y && (tf(e, Ke(t, Ae)), Va(e, In()), (Et & (Vr | Ai)) === pr && (Bp(), Mo()));
    }
    function $S(e, t) {
      var a = Et;
      Et |= q0;
      try {
        return e(t);
      } finally {
        Et = a, Et === pr && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
        !fl.isBatchingLegacy && (Bp(), eC());
      }
    }
    function Ub(e, t, a, i, u) {
      var s = za(), f = Pr.transition;
      try {
        return Pr.transition = null, An(Or), e(t, a, i, u);
      } finally {
        An(s), Pr.transition = f, Et === pr && Bp();
      }
    }
    function $u(e) {
      Vo !== null && Vo.tag === Lo && (Et & (Vr | Ai)) === pr && Yu();
      var t = Et;
      Et |= q0;
      var a = Pr.transition, i = za();
      try {
        return Pr.transition = null, An(Or), e ? e() : void 0;
      } finally {
        An(i), Pr.transition = a, Et = t, (Et & (Vr | Ai)) === pr && Mo();
      }
    }
    function aR() {
      return (Et & (Vr | Ai)) !== pr;
    }
    function Vm(e, t) {
      aa(zS, Xl, e), Xl = Ke(Xl, t);
    }
    function YS(e) {
      Xl = zS.current, ra(zS, e);
    }
    function ac(e, t) {
      e.finishedWork = null, e.finishedLanes = Y;
      var a = e.timeoutHandle;
      if (a !== Py && (e.timeoutHandle = Py, u1(a)), Dn !== null)
        for (var i = Dn.return; i !== null; ) {
          var u = i.alternate;
          N0(u, i), i = i.return;
        }
      Sa = e;
      var s = lc(e.current, null);
      return Dn = s, vr = Xl = t, hr = Vu, Hp = null, Um = Y, Pp = Y, zm = Y, Vp = null, Pa = null, kw(), rl.discardPendingWarnings(), s;
    }
    function iR(e, t) {
      do {
        var a = Dn;
        try {
          if (Kh(), kC(), sn(), NS.current = null, a === null || a.return === null) {
            hr = jp, Hp = t, Dn = null;
            return;
          }
          if (ze && a.mode & Ot && bm(a, !0), He)
            if (ha(), t !== null && typeof t == "object" && typeof t.then == "function") {
              var i = t;
              xi(a, i, vr);
            } else
              ds(a, t, vr);
          ax(e, a.return, a, t, vr), sR(a);
        } catch (u) {
          t = u, Dn === a && a !== null ? (a = a.return, Dn = a) : a = Dn;
          continue;
        }
        return;
      } while (!0);
    }
    function lR() {
      var e = MS.current;
      return MS.current = Cm, e === null ? Cm : e;
    }
    function uR(e) {
      MS.current = e;
    }
    function zb() {
      AS = In();
    }
    function Qp(e) {
      Um = Ke(e, Um);
    }
    function Ab() {
      hr === Vu && (hr = Nm);
    }
    function IS() {
      (hr === Vu || hr === Nm || hr === nc) && (hr = Fp), Sa !== null && (Ts(Um) || Ts(Pp)) && $o(Sa, vr);
    }
    function jb(e) {
      hr !== Fp && (hr = nc), Vp === null ? Vp = [e] : Vp.push(e);
    }
    function Fb() {
      return hr === Vu;
    }
    function Bm(e, t) {
      var a = Et;
      Et |= Vr;
      var i = lR();
      if (Sa !== e || vr !== t) {
        if (Kr) {
          var u = e.memoizedUpdaters;
          u.size > 0 && (Wp(e, vr), u.clear()), Gv(e, t);
        }
        Bu = jd(), ac(e, t);
      }
      Su(t);
      do
        try {
          Hb();
          break;
        } catch (s) {
          iR(e, s);
        }
      while (!0);
      if (Kh(), Et = a, uR(i), Dn !== null)
        throw new Error("Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.");
      return Mc(), Sa = null, vr = Y, hr;
    }
    function Hb() {
      for (; Dn !== null; )
        oR(Dn);
    }
    function Pb(e, t) {
      var a = Et;
      Et |= Vr;
      var i = lR();
      if (Sa !== e || vr !== t) {
        if (Kr) {
          var u = e.memoizedUpdaters;
          u.size > 0 && (Wp(e, vr), u.clear()), Gv(e, t);
        }
        Bu = jd(), Bp(), ac(e, t);
      }
      Su(t);
      do
        try {
          Vb();
          break;
        } catch (s) {
          iR(e, s);
        }
      while (!0);
      return Kh(), uR(i), Et = a, Dn !== null ? (Hv(), Vu) : (Mc(), Sa = null, vr = Y, hr);
    }
    function Vb() {
      for (; Dn !== null && !md(); )
        oR(Dn);
    }
    function oR(e) {
      var t = e.alternate;
      Yt(e);
      var a;
      (e.mode & Ot) !== De ? (Gg(e), a = QS(t, e, Xl), bm(e, !0)) : a = QS(t, e, Xl), sn(), e.memoizedProps = e.pendingProps, a === null ? sR(e) : Dn = a, NS.current = null;
    }
    function sR(e) {
      var t = e;
      do {
        var a = t.alternate, i = t.return;
        if ((t.flags & ss) === _e) {
          Yt(t);
          var u = void 0;
          if ((t.mode & Ot) === De ? u = M0(a, t, Xl) : (Gg(t), u = M0(a, t, Xl), bm(t, !1)), sn(), u !== null) {
            Dn = u;
            return;
          }
        } else {
          var s = Ax(a, t);
          if (s !== null) {
            s.flags &= Nv, Dn = s;
            return;
          }
          if ((t.mode & Ot) !== De) {
            bm(t, !1);
            for (var f = t.actualDuration, p = t.child; p !== null; )
              f += p.actualDuration, p = p.sibling;
            t.actualDuration = f;
          }
          if (i !== null)
            i.flags |= ss, i.subtreeFlags = _e, i.deletions = null;
          else {
            hr = US, Dn = null;
            return;
          }
        }
        var v = t.sibling;
        if (v !== null) {
          Dn = v;
          return;
        }
        t = i, Dn = t;
      } while (t !== null);
      hr === Vu && (hr = X0);
    }
    function ic(e, t, a) {
      var i = za(), u = Pr.transition;
      try {
        Pr.transition = null, An(Or), Bb(e, t, a, i);
      } finally {
        Pr.transition = u, An(i);
      }
      return null;
    }
    function Bb(e, t, a, i) {
      do
        Yu();
      while (Vo !== null);
      if (Zb(), (Et & (Vr | Ai)) !== pr)
        throw new Error("Should not already be working.");
      var u = e.finishedWork, s = e.finishedLanes;
      if (Rd(s), u === null)
        return Td(), null;
      if (s === Y && S("root.finishedLanes should not be empty during a commit. This is a bug in React."), e.finishedWork = null, e.finishedLanes = Y, u === e.current)
        throw new Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
      e.callbackNode = null, e.callbackPriority = _t;
      var f = Ke(u.lanes, u.childLanes);
      zd(e, f), e === Sa && (Sa = null, Dn = null, vr = Y), ((u.subtreeFlags & Wi) !== _e || (u.flags & Wi) !== _e) && (rc || (rc = !0, HS = a, qS(Gi, function() {
        return Yu(), null;
      })));
      var p = (u.subtreeFlags & (_l | Dl | kl | Wi)) !== _e, v = (u.flags & (_l | Dl | kl | Wi)) !== _e;
      if (p || v) {
        var y = Pr.transition;
        Pr.transition = null;
        var g = za();
        An(Or);
        var b = Et;
        Et |= Ai, NS.current = null, Vx(e, u), e0(), tb(e, u, s), e1(e.containerInfo), e.current = u, ps(s), nb(u, e, s), vs(), yd(), Et = b, An(g), Pr.transition = y;
      } else
        e.current = u, e0();
      var w = rc;
      if (rc ? (rc = !1, Vo = e, $p = s) : ($f = 0, Fm = null), f = e.pendingLanes, f === Y && (Bf = null), w || pR(e.current, !1), Sd(u.stateNode, i), Kr && e.memoizedUpdaters.clear(), Cb(), Va(e, In()), t !== null)
        for (var M = e.onRecoverableError, z = 0; z < t.length; z++) {
          var F = t[z], ue = F.stack, Le = F.digest;
          M(F.value, {
            componentStack: ue,
            digest: Le
          });
        }
      if (Am) {
        Am = !1;
        var we = jS;
        throw jS = null, we;
      }
      return Zr($p, Ae) && e.tag !== Lo && Yu(), f = e.pendingLanes, Zr(f, Ae) ? (Ww(), e === PS ? Yp++ : (Yp = 0, PS = e)) : Yp = 0, Mo(), Td(), null;
    }
    function Yu() {
      if (Vo !== null) {
        var e = Kv($p), t = ks(Na, e), a = Pr.transition, i = za();
        try {
          return Pr.transition = null, An(t), Yb();
        } finally {
          An(i), Pr.transition = a;
        }
      }
      return !1;
    }
    function $b(e) {
      FS.push(e), rc || (rc = !0, qS(Gi, function() {
        return Yu(), null;
      }));
    }
    function Yb() {
      if (Vo === null)
        return !1;
      var e = HS;
      HS = null;
      var t = Vo, a = $p;
      if (Vo = null, $p = Y, (Et & (Vr | Ai)) !== pr)
        throw new Error("Cannot flush passive effects while already rendering.");
      VS = !0, jm = !1, gu(a);
      var i = Et;
      Et |= Ai, sb(t.current), ib(t, t.current, a, e);
      {
        var u = FS;
        FS = [];
        for (var s = 0; s < u.length; s++) {
          var f = u[s];
          Ix(t, f);
        }
      }
      bd(), pR(t.current, !0), Et = i, Mo(), jm ? t === Fm ? $f++ : ($f = 0, Fm = t) : $f = 0, VS = !1, jm = !1, Ed(t);
      {
        var p = t.current.stateNode;
        p.effectDuration = 0, p.passiveEffectDuration = 0;
      }
      return !0;
    }
    function cR(e) {
      return Bf !== null && Bf.has(e);
    }
    function Ib(e) {
      Bf === null ? Bf = /* @__PURE__ */ new Set([e]) : Bf.add(e);
    }
    function Qb(e) {
      Am || (Am = !0, jS = e);
    }
    var Wb = Qb;
    function fR(e, t, a) {
      var i = ec(a, t), u = o0(e, i, Ae), s = Uo(e, u, Ae), f = Ea();
      s !== null && (So(s, Ae, f), Va(s, f));
    }
    function cn(e, t, a) {
      if (Fx(a), Gp(!1), e.tag === Z) {
        fR(e, e, a);
        return;
      }
      var i = null;
      for (i = t; i !== null; ) {
        if (i.tag === Z) {
          fR(i, e, a);
          return;
        } else if (i.tag === de) {
          var u = i.type, s = i.stateNode;
          if (typeof u.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && !cR(s)) {
            var f = ec(a, e), p = dS(i, f, Ae), v = Uo(i, p, Ae), y = Ea();
            v !== null && (So(v, Ae, y), Va(v, y));
            return;
          }
        }
        i = i.return;
      }
      S(`Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Likely causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.

Error message:

%s`, a);
    }
    function Gb(e, t, a) {
      var i = e.pingCache;
      i !== null && i.delete(t);
      var u = Ea();
      ef(e, a), r_(e), Sa === e && _u(vr, a) && (hr === Fp || hr === Nm && bu(vr) && In() - AS < K0 ? ac(e, Y) : zm = Ke(zm, a)), Va(e, u);
    }
    function dR(e, t) {
      t === _t && (t = Db(e));
      var a = Ea(), i = Fa(e, t);
      i !== null && (So(i, t, a), Va(i, a));
    }
    function qb(e) {
      var t = e.memoizedState, a = _t;
      t !== null && (a = t.retryLane), dR(e, a);
    }
    function Xb(e, t) {
      var a = _t, i;
      switch (e.tag) {
        case be:
          i = e.stateNode;
          var u = e.memoizedState;
          u !== null && (a = u.retryLane);
          break;
        case ln:
          i = e.stateNode;
          break;
        default:
          throw new Error("Pinged unknown suspense boundary type. This is probably a bug in React.");
      }
      i !== null && i.delete(t), dR(e, a);
    }
    function Kb(e) {
      return e < 120 ? 120 : e < 480 ? 480 : e < 1080 ? 1080 : e < 1920 ? 1920 : e < 3e3 ? 3e3 : e < 4320 ? 4320 : wb(e / 1960) * 1960;
    }
    function Jb() {
      if (Yp > bb)
        throw Yp = 0, PS = null, new Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
      $f > _b && ($f = 0, Fm = null, S("Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."));
    }
    function Zb() {
      rl.flushLegacyContextWarning(), rl.flushPendingUnsafeLifecycleWarnings();
    }
    function pR(e, t) {
      Yt(e), $m(e, bl, gb), t && $m(e, Ri, Sb), $m(e, bl, mb), t && $m(e, Ri, yb), sn();
    }
    function $m(e, t, a) {
      for (var i = e, u = null; i !== null; ) {
        var s = i.subtreeFlags & t;
        i !== u && i.child !== null && s !== _e ? i = i.child : ((i.flags & t) !== _e && a(i), i.sibling !== null ? i = i.sibling : i = u = i.return);
      }
    }
    var Ym = null;
    function vR(e) {
      {
        if ((Et & Vr) !== pr || !(e.mode & st))
          return;
        var t = e.tag;
        if (t !== Je && t !== Z && t !== de && t !== se && t !== Qe && t !== ct && t !== Fe)
          return;
        var a = Be(e) || "ReactComponent";
        if (Ym !== null) {
          if (Ym.has(a))
            return;
          Ym.add(a);
        } else
          Ym = /* @__PURE__ */ new Set([a]);
        var i = ar;
        try {
          Yt(e), S("Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously later calls tries to update the component. Move this work to useEffect instead.");
        } finally {
          i ? Yt(e) : sn();
        }
      }
    }
    var QS;
    {
      var e_ = null;
      QS = function(e, t, a) {
        var i = RR(e_, t);
        try {
          return _0(e, t, a);
        } catch (s) {
          if (dw() || s !== null && typeof s == "object" && typeof s.then == "function")
            throw s;
          if (Kh(), kC(), N0(e, t), RR(t, i), t.mode & Ot && Gg(t), xl(null, _0, null, e, t, a), Ii()) {
            var u = os();
            typeof u == "object" && u !== null && u._suppressLogging && typeof s == "object" && s !== null && !s._suppressLogging && (s._suppressLogging = !0);
          }
          throw s;
        }
      };
    }
    var hR = !1, WS;
    WS = /* @__PURE__ */ new Set();
    function t_(e) {
      if (hi && !Yw())
        switch (e.tag) {
          case se:
          case Qe:
          case Fe: {
            var t = Dn && Be(Dn) || "Unknown", a = t;
            if (!WS.has(a)) {
              WS.add(a);
              var i = Be(e) || "Unknown";
              S("Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render", i, t, t);
            }
            break;
          }
          case de: {
            hR || (S("Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state."), hR = !0);
            break;
          }
        }
    }
    function Wp(e, t) {
      if (Kr) {
        var a = e.memoizedUpdaters;
        a.forEach(function(i) {
          _s(e, i, t);
        });
      }
    }
    var GS = {};
    function qS(e, t) {
      {
        var a = fl.current;
        return a !== null ? (a.push(t), GS) : hd(e, t);
      }
    }
    function mR(e) {
      if (e !== GS)
        return zv(e);
    }
    function yR() {
      return fl.current !== null;
    }
    function n_(e) {
      {
        if (e.mode & st) {
          if (!G0())
            return;
        } else if (!Tb() || Et !== pr || e.tag !== se && e.tag !== Qe && e.tag !== Fe)
          return;
        if (fl.current === null) {
          var t = ar;
          try {
            Yt(e), S(`An update to %s inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`, Be(e));
          } finally {
            t ? Yt(e) : sn();
          }
        }
      }
    }
    function r_(e) {
      e.tag !== Lo && G0() && fl.current === null && S(`A suspended resource finished loading inside a test, but the event was not wrapped in act(...).

When testing, code that resolves suspended data should be wrapped into act(...):

act(() => {
  /* finish loading suspended data */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`);
    }
    function Gp(e) {
      eR = e;
    }
    var ji = null, Yf = null, a_ = function(e) {
      ji = e;
    };
    function If(e) {
      {
        if (ji === null)
          return e;
        var t = ji(e);
        return t === void 0 ? e : t.current;
      }
    }
    function XS(e) {
      return If(e);
    }
    function KS(e) {
      {
        if (ji === null)
          return e;
        var t = ji(e);
        if (t === void 0) {
          if (e != null && typeof e.render == "function") {
            var a = If(e.render);
            if (e.render !== a) {
              var i = {
                $$typeof: $,
                render: a
              };
              return e.displayName !== void 0 && (i.displayName = e.displayName), i;
            }
          }
          return e;
        }
        return t.current;
      }
    }
    function gR(e, t) {
      {
        if (ji === null)
          return !1;
        var a = e.elementType, i = t.type, u = !1, s = typeof i == "object" && i !== null ? i.$$typeof : null;
        switch (e.tag) {
          case de: {
            typeof i == "function" && (u = !0);
            break;
          }
          case se: {
            (typeof i == "function" || s === $e) && (u = !0);
            break;
          }
          case Qe: {
            (s === $ || s === $e) && (u = !0);
            break;
          }
          case ct:
          case Fe: {
            (s === Ge || s === $e) && (u = !0);
            break;
          }
          default:
            return !1;
        }
        if (u) {
          var f = ji(a);
          if (f !== void 0 && f === ji(i))
            return !0;
        }
        return !1;
      }
    }
    function SR(e) {
      {
        if (ji === null || typeof WeakSet != "function")
          return;
        Yf === null && (Yf = /* @__PURE__ */ new WeakSet()), Yf.add(e);
      }
    }
    var i_ = function(e, t) {
      {
        if (ji === null)
          return;
        var a = t.staleFamilies, i = t.updatedFamilies;
        Yu(), $u(function() {
          JS(e.current, i, a);
        });
      }
    }, l_ = function(e, t) {
      {
        if (e.context !== li)
          return;
        Yu(), $u(function() {
          qp(t, e, null, null);
        });
      }
    };
    function JS(e, t, a) {
      {
        var i = e.alternate, u = e.child, s = e.sibling, f = e.tag, p = e.type, v = null;
        switch (f) {
          case se:
          case Fe:
          case de:
            v = p;
            break;
          case Qe:
            v = p.render;
            break;
        }
        if (ji === null)
          throw new Error("Expected resolveFamily to be set during hot reload.");
        var y = !1, g = !1;
        if (v !== null) {
          var b = ji(v);
          b !== void 0 && (a.has(b) ? g = !0 : t.has(b) && (f === de ? g = !0 : y = !0));
        }
        if (Yf !== null && (Yf.has(e) || i !== null && Yf.has(i)) && (g = !0), g && (e._debugNeedsRemount = !0), g || y) {
          var w = Fa(e, Ae);
          w !== null && mr(w, e, Ae, Xt);
        }
        u !== null && !g && JS(u, t, a), s !== null && JS(s, t, a);
      }
    }
    var u_ = function(e, t) {
      {
        var a = /* @__PURE__ */ new Set(), i = new Set(t.map(function(u) {
          return u.current;
        }));
        return ZS(e.current, i, a), a;
      }
    };
    function ZS(e, t, a) {
      {
        var i = e.child, u = e.sibling, s = e.tag, f = e.type, p = null;
        switch (s) {
          case se:
          case Fe:
          case de:
            p = f;
            break;
          case Qe:
            p = f.render;
            break;
        }
        var v = !1;
        p !== null && t.has(p) && (v = !0), v ? o_(e, a) : i !== null && ZS(i, t, a), u !== null && ZS(u, t, a);
      }
    }
    function o_(e, t) {
      {
        var a = s_(e, t);
        if (a)
          return;
        for (var i = e; ; ) {
          switch (i.tag) {
            case ie:
              t.add(i.stateNode);
              return;
            case Se:
              t.add(i.stateNode.containerInfo);
              return;
            case Z:
              t.add(i.stateNode.containerInfo);
              return;
          }
          if (i.return === null)
            throw new Error("Expected to reach root first.");
          i = i.return;
        }
      }
    }
    function s_(e, t) {
      for (var a = e, i = !1; ; ) {
        if (a.tag === ie)
          i = !0, t.add(a.stateNode);
        else if (a.child !== null) {
          a.child.return = a, a = a.child;
          continue;
        }
        if (a === e)
          return i;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === e)
            return i;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
      return !1;
    }
    var eE;
    {
      eE = !1;
      try {
        var ER = Object.preventExtensions({});
      } catch {
        eE = !0;
      }
    }
    function c_(e, t, a, i) {
      this.tag = e, this.key = a, this.elementType = null, this.type = null, this.stateNode = null, this.return = null, this.child = null, this.sibling = null, this.index = 0, this.ref = null, this.pendingProps = t, this.memoizedProps = null, this.updateQueue = null, this.memoizedState = null, this.dependencies = null, this.mode = i, this.flags = _e, this.subtreeFlags = _e, this.deletions = null, this.lanes = Y, this.childLanes = Y, this.alternate = null, this.actualDuration = Number.NaN, this.actualStartTime = Number.NaN, this.selfBaseDuration = Number.NaN, this.treeBaseDuration = Number.NaN, this.actualDuration = 0, this.actualStartTime = -1, this.selfBaseDuration = 0, this.treeBaseDuration = 0, this._debugSource = null, this._debugOwner = null, this._debugNeedsRemount = !1, this._debugHookTypes = null, !eE && typeof Object.preventExtensions == "function" && Object.preventExtensions(this);
    }
    var ui = function(e, t, a, i) {
      return new c_(e, t, a, i);
    };
    function tE(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function f_(e) {
      return typeof e == "function" && !tE(e) && e.defaultProps === void 0;
    }
    function d_(e) {
      if (typeof e == "function")
        return tE(e) ? de : se;
      if (e != null) {
        var t = e.$$typeof;
        if (t === $)
          return Qe;
        if (t === Ge)
          return ct;
      }
      return Je;
    }
    function lc(e, t) {
      var a = e.alternate;
      a === null ? (a = ui(e.tag, t, e.key, e.mode), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a._debugSource = e._debugSource, a._debugOwner = e._debugOwner, a._debugHookTypes = e._debugHookTypes, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = _e, a.subtreeFlags = _e, a.deletions = null, a.actualDuration = 0, a.actualStartTime = -1), a.flags = e.flags & Nn, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue;
      var i = e.dependencies;
      switch (a.dependencies = i === null ? null : {
        lanes: i.lanes,
        firstContext: i.firstContext
      }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.selfBaseDuration = e.selfBaseDuration, a.treeBaseDuration = e.treeBaseDuration, a._debugNeedsRemount = e._debugNeedsRemount, a.tag) {
        case Je:
        case se:
        case Fe:
          a.type = If(e.type);
          break;
        case de:
          a.type = XS(e.type);
          break;
        case Qe:
          a.type = KS(e.type);
          break;
      }
      return a;
    }
    function p_(e, t) {
      e.flags &= Nn | hn;
      var a = e.alternate;
      if (a === null)
        e.childLanes = Y, e.lanes = t, e.child = null, e.subtreeFlags = _e, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null, e.selfBaseDuration = 0, e.treeBaseDuration = 0;
      else {
        e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = _e, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type;
        var i = a.dependencies;
        e.dependencies = i === null ? null : {
          lanes: i.lanes,
          firstContext: i.firstContext
        }, e.selfBaseDuration = a.selfBaseDuration, e.treeBaseDuration = a.treeBaseDuration;
      }
      return e;
    }
    function v_(e, t, a) {
      var i;
      return e === Vh ? (i = st, t === !0 && (i |= Wt, i |= Lt)) : i = De, Kr && (i |= Ot), ui(Z, null, null, i);
    }
    function nE(e, t, a, i, u, s) {
      var f = Je, p = e;
      if (typeof e == "function")
        tE(e) ? (f = de, p = XS(p)) : p = If(p);
      else if (typeof e == "string")
        f = ie;
      else
        e: switch (e) {
          case fi:
            return Yo(a.children, u, s, t);
          case Qa:
            f = it, u |= Wt, (u & st) !== De && (u |= Lt);
            break;
          case di:
            return h_(a, u, s, t);
          case ae:
            return m_(a, u, s, t);
          case he:
            return y_(a, u, s, t);
          case Rn:
            return CR(a, u, s, t);
          case tn:
          case ft:
          case on:
          case rr:
          case ot:
          default: {
            if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
                case pi:
                  f = vt;
                  break e;
                case R:
                  f = Kt;
                  break e;
                case $:
                  f = Qe, p = KS(p);
                  break e;
                case Ge:
                  f = ct;
                  break e;
                case $e:
                  f = an, p = null;
                  break e;
              }
            var v = "";
            {
              (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (v += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
              var y = i ? Be(i) : null;
              y && (v += `

Check the render method of \`` + y + "`.");
            }
            throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (e == null ? e : typeof e) + "." + v));
          }
        }
      var g = ui(f, a, t, u);
      return g.elementType = e, g.type = p, g.lanes = s, g._debugOwner = i, g;
    }
    function rE(e, t, a) {
      var i = null;
      i = e._owner;
      var u = e.type, s = e.key, f = e.props, p = nE(u, s, f, i, t, a);
      return p._debugSource = e._source, p._debugOwner = e._owner, p;
    }
    function Yo(e, t, a, i) {
      var u = ui(Xe, e, i, t);
      return u.lanes = a, u;
    }
    function h_(e, t, a, i) {
      typeof e.id != "string" && S('Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.', typeof e.id);
      var u = ui(ht, e, i, t | Ot);
      return u.elementType = di, u.lanes = a, u.stateNode = {
        effectDuration: 0,
        passiveEffectDuration: 0
      }, u;
    }
    function m_(e, t, a, i) {
      var u = ui(be, e, i, t);
      return u.elementType = ae, u.lanes = a, u;
    }
    function y_(e, t, a, i) {
      var u = ui(ln, e, i, t);
      return u.elementType = he, u.lanes = a, u;
    }
    function CR(e, t, a, i) {
      var u = ui(ke, e, i, t);
      u.elementType = Rn, u.lanes = a;
      var s = {
        isHidden: !1
      };
      return u.stateNode = s, u;
    }
    function aE(e, t, a) {
      var i = ui(je, e, null, t);
      return i.lanes = a, i;
    }
    function g_() {
      var e = ui(ie, null, null, De);
      return e.elementType = "DELETED", e;
    }
    function S_(e) {
      var t = ui(Jt, null, null, De);
      return t.stateNode = e, t;
    }
    function iE(e, t, a) {
      var i = e.children !== null ? e.children : [], u = ui(Se, i, e.key, t);
      return u.lanes = a, u.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        // Used by persistent updates
        implementation: e.implementation
      }, u;
    }
    function RR(e, t) {
      return e === null && (e = ui(Je, null, null, De)), e.tag = t.tag, e.key = t.key, e.elementType = t.elementType, e.type = t.type, e.stateNode = t.stateNode, e.return = t.return, e.child = t.child, e.sibling = t.sibling, e.index = t.index, e.ref = t.ref, e.pendingProps = t.pendingProps, e.memoizedProps = t.memoizedProps, e.updateQueue = t.updateQueue, e.memoizedState = t.memoizedState, e.dependencies = t.dependencies, e.mode = t.mode, e.flags = t.flags, e.subtreeFlags = t.subtreeFlags, e.deletions = t.deletions, e.lanes = t.lanes, e.childLanes = t.childLanes, e.alternate = t.alternate, e.actualDuration = t.actualDuration, e.actualStartTime = t.actualStartTime, e.selfBaseDuration = t.selfBaseDuration, e.treeBaseDuration = t.treeBaseDuration, e._debugSource = t._debugSource, e._debugOwner = t._debugOwner, e._debugNeedsRemount = t._debugNeedsRemount, e._debugHookTypes = t._debugHookTypes, e;
    }
    function E_(e, t, a, i, u) {
      this.tag = t, this.containerInfo = e, this.pendingChildren = null, this.current = null, this.pingCache = null, this.finishedWork = null, this.timeoutHandle = Py, this.context = null, this.pendingContext = null, this.callbackNode = null, this.callbackPriority = _t, this.eventTimes = bs(Y), this.expirationTimes = bs(Xt), this.pendingLanes = Y, this.suspendedLanes = Y, this.pingedLanes = Y, this.expiredLanes = Y, this.mutableReadLanes = Y, this.finishedLanes = Y, this.entangledLanes = Y, this.entanglements = bs(Y), this.identifierPrefix = i, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null, this.effectDuration = 0, this.passiveEffectDuration = 0;
      {
        this.memoizedUpdaters = /* @__PURE__ */ new Set();
        for (var s = this.pendingUpdatersLaneMap = [], f = 0; f < Eu; f++)
          s.push(/* @__PURE__ */ new Set());
      }
      switch (t) {
        case Vh:
          this._debugRootType = a ? "hydrateRoot()" : "createRoot()";
          break;
        case Lo:
          this._debugRootType = a ? "hydrate()" : "render()";
          break;
      }
    }
    function TR(e, t, a, i, u, s, f, p, v, y) {
      var g = new E_(e, t, a, p, v), b = v_(t, s);
      g.current = b, b.stateNode = g;
      {
        var w = {
          element: i,
          isDehydrated: a,
          cache: null,
          // not enabled yet
          transitions: null,
          pendingSuspenseBoundaries: null
        };
        b.memoizedState = w;
      }
      return gg(b), g;
    }
    var lE = "18.3.1";
    function C_(e, t, a) {
      var i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
      return Yr(i), {
        // This tag allow us to uniquely identify this as a React Portal
        $$typeof: nr,
        key: i == null ? null : "" + i,
        children: e,
        containerInfo: t,
        implementation: a
      };
    }
    var uE, oE;
    uE = !1, oE = {};
    function wR(e) {
      if (!e)
        return li;
      var t = po(e), a = rw(t);
      if (t.tag === de) {
        var i = t.type;
        if ($l(i))
          return KE(t, i, a);
      }
      return a;
    }
    function R_(e, t) {
      {
        var a = po(e);
        if (a === void 0) {
          if (typeof e.render == "function")
            throw new Error("Unable to find node on an unmounted component.");
          var i = Object.keys(e).join(",");
          throw new Error("Argument appears to not be a ReactComponent. Keys: " + i);
        }
        var u = qr(a);
        if (u === null)
          return null;
        if (u.mode & Wt) {
          var s = Be(a) || "Component";
          if (!oE[s]) {
            oE[s] = !0;
            var f = ar;
            try {
              Yt(u), a.mode & Wt ? S("%s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s) : S("%s is deprecated in StrictMode. %s was passed an instance of %s which renders StrictMode children. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s);
            } finally {
              f ? Yt(f) : sn();
            }
          }
        }
        return u.stateNode;
      }
    }
    function xR(e, t, a, i, u, s, f, p) {
      var v = !1, y = null;
      return TR(e, t, v, y, a, i, u, s, f);
    }
    function bR(e, t, a, i, u, s, f, p, v, y) {
      var g = !0, b = TR(a, i, g, e, u, s, f, p, v);
      b.context = wR(null);
      var w = b.current, M = Ea(), z = Bo(w), F = Hu(M, z);
      return F.callback = t ?? null, Uo(w, F, z), kb(b, z, M), b;
    }
    function qp(e, t, a, i) {
      gd(t, e);
      var u = t.current, s = Ea(), f = Bo(u);
      yn(f);
      var p = wR(a);
      t.context === null ? t.context = p : t.pendingContext = p, hi && ar !== null && !uE && (uE = !0, S(`Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.

Check the render method of %s.`, Be(ar) || "Unknown"));
      var v = Hu(s, f);
      v.payload = {
        element: e
      }, i = i === void 0 ? null : i, i !== null && (typeof i != "function" && S("render(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", i), v.callback = i);
      var y = Uo(u, v, f);
      return y !== null && (mr(y, u, f, s), nm(y, u, f)), f;
    }
    function Im(e) {
      var t = e.current;
      if (!t.child)
        return null;
      switch (t.child.tag) {
        case ie:
          return t.child.stateNode;
        default:
          return t.child.stateNode;
      }
    }
    function T_(e) {
      switch (e.tag) {
        case Z: {
          var t = e.stateNode;
          if (nf(t)) {
            var a = Vv(t);
            Nb(t, a);
          }
          break;
        }
        case be: {
          $u(function() {
            var u = Fa(e, Ae);
            if (u !== null) {
              var s = Ea();
              mr(u, e, Ae, s);
            }
          });
          var i = Ae;
          sE(e, i);
          break;
        }
      }
    }
    function _R(e, t) {
      var a = e.memoizedState;
      a !== null && a.dehydrated !== null && (a.retryLane = Qv(a.retryLane, t));
    }
    function sE(e, t) {
      _R(e, t);
      var a = e.alternate;
      a && _R(a, t);
    }
    function w_(e) {
      if (e.tag === be) {
        var t = Es, a = Fa(e, t);
        if (a !== null) {
          var i = Ea();
          mr(a, e, t, i);
        }
        sE(e, t);
      }
    }
    function x_(e) {
      if (e.tag === be) {
        var t = Bo(e), a = Fa(e, t);
        if (a !== null) {
          var i = Ea();
          mr(a, e, t, i);
        }
        sE(e, t);
      }
    }
    function DR(e) {
      var t = fn(e);
      return t === null ? null : t.stateNode;
    }
    var kR = function(e) {
      return null;
    };
    function b_(e) {
      return kR(e);
    }
    var OR = function(e) {
      return !1;
    };
    function __(e) {
      return OR(e);
    }
    var LR = null, MR = null, NR = null, UR = null, zR = null, AR = null, jR = null, FR = null, HR = null;
    {
      var PR = function(e, t, a) {
        var i = t[a], u = at(e) ? e.slice() : et({}, e);
        return a + 1 === t.length ? (at(u) ? u.splice(i, 1) : delete u[i], u) : (u[i] = PR(e[i], t, a + 1), u);
      }, VR = function(e, t) {
        return PR(e, t, 0);
      }, BR = function(e, t, a, i) {
        var u = t[i], s = at(e) ? e.slice() : et({}, e);
        if (i + 1 === t.length) {
          var f = a[i];
          s[f] = s[u], at(s) ? s.splice(u, 1) : delete s[u];
        } else
          s[u] = BR(
            // $FlowFixMe number or string is fine here
            e[u],
            t,
            a,
            i + 1
          );
        return s;
      }, $R = function(e, t, a) {
        if (t.length !== a.length) {
          Ie("copyWithRename() expects paths of the same length");
          return;
        } else
          for (var i = 0; i < a.length - 1; i++)
            if (t[i] !== a[i]) {
              Ie("copyWithRename() expects paths to be the same except for the deepest key");
              return;
            }
        return BR(e, t, a, 0);
      }, YR = function(e, t, a, i) {
        if (a >= t.length)
          return i;
        var u = t[a], s = at(e) ? e.slice() : et({}, e);
        return s[u] = YR(e[u], t, a + 1, i), s;
      }, IR = function(e, t, a) {
        return YR(e, t, 0, a);
      }, cE = function(e, t) {
        for (var a = e.memoizedState; a !== null && t > 0; )
          a = a.next, t--;
        return a;
      };
      LR = function(e, t, a, i) {
        var u = cE(e, t);
        if (u !== null) {
          var s = IR(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = et({}, e.memoizedProps);
          var f = Fa(e, Ae);
          f !== null && mr(f, e, Ae, Xt);
        }
      }, MR = function(e, t, a) {
        var i = cE(e, t);
        if (i !== null) {
          var u = VR(i.memoizedState, a);
          i.memoizedState = u, i.baseState = u, e.memoizedProps = et({}, e.memoizedProps);
          var s = Fa(e, Ae);
          s !== null && mr(s, e, Ae, Xt);
        }
      }, NR = function(e, t, a, i) {
        var u = cE(e, t);
        if (u !== null) {
          var s = $R(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = et({}, e.memoizedProps);
          var f = Fa(e, Ae);
          f !== null && mr(f, e, Ae, Xt);
        }
      }, UR = function(e, t, a) {
        e.pendingProps = IR(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Fa(e, Ae);
        i !== null && mr(i, e, Ae, Xt);
      }, zR = function(e, t) {
        e.pendingProps = VR(e.memoizedProps, t), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var a = Fa(e, Ae);
        a !== null && mr(a, e, Ae, Xt);
      }, AR = function(e, t, a) {
        e.pendingProps = $R(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Fa(e, Ae);
        i !== null && mr(i, e, Ae, Xt);
      }, jR = function(e) {
        var t = Fa(e, Ae);
        t !== null && mr(t, e, Ae, Xt);
      }, FR = function(e) {
        kR = e;
      }, HR = function(e) {
        OR = e;
      };
    }
    function D_(e) {
      var t = qr(e);
      return t === null ? null : t.stateNode;
    }
    function k_(e) {
      return null;
    }
    function O_() {
      return ar;
    }
    function L_(e) {
      var t = e.findFiberByHostInstance, a = A.ReactCurrentDispatcher;
      return mo({
        bundleType: e.bundleType,
        version: e.version,
        rendererPackageName: e.rendererPackageName,
        rendererConfig: e.rendererConfig,
        overrideHookState: LR,
        overrideHookStateDeletePath: MR,
        overrideHookStateRenamePath: NR,
        overrideProps: UR,
        overridePropsDeletePath: zR,
        overridePropsRenamePath: AR,
        setErrorHandler: FR,
        setSuspenseHandler: HR,
        scheduleUpdate: jR,
        currentDispatcherRef: a,
        findHostInstanceByFiber: D_,
        findFiberByHostInstance: t || k_,
        // React Refresh
        findHostInstancesForRefresh: u_,
        scheduleRefresh: i_,
        scheduleRoot: l_,
        setRefreshHandler: a_,
        // Enables DevTools to append owner stacks to error messages in DEV mode.
        getCurrentFiber: O_,
        // Enables DevTools to detect reconciler version rather than renderer version
        // which may not match for third party renderers.
        reconcilerVersion: lE
      });
    }
    var QR = typeof reportError == "function" ? (
      // In modern browsers, reportError will dispatch an error event,
      // emulating an uncaught JavaScript error.
      reportError
    ) : function(e) {
      console.error(e);
    };
    function fE(e) {
      this._internalRoot = e;
    }
    Qm.prototype.render = fE.prototype.render = function(e) {
      var t = this._internalRoot;
      if (t === null)
        throw new Error("Cannot update an unmounted root.");
      {
        typeof arguments[1] == "function" ? S("render(...): does not support the second callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().") : Wm(arguments[1]) ? S("You passed a container to the second argument of root.render(...). You don't need to pass it again since you already passed it to create the root.") : typeof arguments[1] < "u" && S("You passed a second argument to root.render(...) but it only accepts one argument.");
        var a = t.containerInfo;
        if (a.nodeType !== Ln) {
          var i = DR(t.current);
          i && i.parentNode !== a && S("render(...): It looks like the React-rendered content of the root container was removed without using React. This is not supported and will cause errors. Instead, call root.unmount() to empty a root's container.");
        }
      }
      qp(e, t, null, null);
    }, Qm.prototype.unmount = fE.prototype.unmount = function() {
      typeof arguments[0] == "function" && S("unmount(...): does not support a callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().");
      var e = this._internalRoot;
      if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        aR() && S("Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition."), $u(function() {
          qp(null, e, null, null);
        }), QE(t);
      }
    };
    function M_(e, t) {
      if (!Wm(e))
        throw new Error("createRoot(...): Target container is not a DOM element.");
      WR(e);
      var a = !1, i = !1, u = "", s = QR;
      t != null && (t.hydrate ? Ie("hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead.") : typeof t == "object" && t !== null && t.$$typeof === br && S(`You passed a JSX element to createRoot. You probably meant to call root.render instead. Example usage:

  let root = createRoot(domContainer);
  root.render(<App />);`), t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (u = t.identifierPrefix), t.onRecoverableError !== void 0 && (s = t.onRecoverableError), t.transitionCallbacks !== void 0 && t.transitionCallbacks);
      var f = xR(e, Vh, null, a, i, u, s);
      Uh(f.current, e);
      var p = e.nodeType === Ln ? e.parentNode : e;
      return tp(p), new fE(f);
    }
    function Qm(e) {
      this._internalRoot = e;
    }
    function N_(e) {
      e && nh(e);
    }
    Qm.prototype.unstable_scheduleHydration = N_;
    function U_(e, t, a) {
      if (!Wm(e))
        throw new Error("hydrateRoot(...): Target container is not a DOM element.");
      WR(e), t === void 0 && S("Must provide initial children as second argument to hydrateRoot. Example usage: hydrateRoot(domContainer, <App />)");
      var i = a ?? null, u = a != null && a.hydratedSources || null, s = !1, f = !1, p = "", v = QR;
      a != null && (a.unstable_strictMode === !0 && (s = !0), a.identifierPrefix !== void 0 && (p = a.identifierPrefix), a.onRecoverableError !== void 0 && (v = a.onRecoverableError));
      var y = bR(t, null, e, Vh, i, s, f, p, v);
      if (Uh(y.current, e), tp(e), u)
        for (var g = 0; g < u.length; g++) {
          var b = u[g];
          Fw(y, b);
        }
      return new Qm(y);
    }
    function Wm(e) {
      return !!(e && (e.nodeType === Qr || e.nodeType === Yi || e.nodeType === rd));
    }
    function Xp(e) {
      return !!(e && (e.nodeType === Qr || e.nodeType === Yi || e.nodeType === rd || e.nodeType === Ln && e.nodeValue === " react-mount-point-unstable "));
    }
    function WR(e) {
      e.nodeType === Qr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("createRoot(): Creating roots directly with document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try using a container element created for your app."), dp(e) && (e._reactRootContainer ? S("You are calling ReactDOMClient.createRoot() on a container that was previously passed to ReactDOM.render(). This is not supported.") : S("You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it."));
    }
    var z_ = A.ReactCurrentOwner, GR;
    GR = function(e) {
      if (e._reactRootContainer && e.nodeType !== Ln) {
        var t = DR(e._reactRootContainer.current);
        t && t.parentNode !== e && S("render(...): It looks like the React-rendered content of this container was removed without using React. This is not supported and will cause errors. Instead, call ReactDOM.unmountComponentAtNode to empty a container.");
      }
      var a = !!e._reactRootContainer, i = dE(e), u = !!(i && ko(i));
      u && !a && S("render(...): Replacing React-rendered children with a new root component. If you intended to update the children of this node, you should instead have the existing children update their state and render the new components instead of calling ReactDOM.render."), e.nodeType === Qr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("render(): Rendering components directly into document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try rendering into a container element created for your app.");
    };
    function dE(e) {
      return e ? e.nodeType === Yi ? e.documentElement : e.firstChild : null;
    }
    function qR() {
    }
    function A_(e, t, a, i, u) {
      if (u) {
        if (typeof i == "function") {
          var s = i;
          i = function() {
            var w = Im(f);
            s.call(w);
          };
        }
        var f = bR(
          t,
          i,
          e,
          Lo,
          null,
          // hydrationCallbacks
          !1,
          // isStrictMode
          !1,
          // concurrentUpdatesByDefaultOverride,
          "",
          // identifierPrefix
          qR
        );
        e._reactRootContainer = f, Uh(f.current, e);
        var p = e.nodeType === Ln ? e.parentNode : e;
        return tp(p), $u(), f;
      } else {
        for (var v; v = e.lastChild; )
          e.removeChild(v);
        if (typeof i == "function") {
          var y = i;
          i = function() {
            var w = Im(g);
            y.call(w);
          };
        }
        var g = xR(
          e,
          Lo,
          null,
          // hydrationCallbacks
          !1,
          // isStrictMode
          !1,
          // concurrentUpdatesByDefaultOverride,
          "",
          // identifierPrefix
          qR
        );
        e._reactRootContainer = g, Uh(g.current, e);
        var b = e.nodeType === Ln ? e.parentNode : e;
        return tp(b), $u(function() {
          qp(t, g, a, i);
        }), g;
      }
    }
    function j_(e, t) {
      e !== null && typeof e != "function" && S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e);
    }
    function Gm(e, t, a, i, u) {
      GR(a), j_(u === void 0 ? null : u, "render");
      var s = a._reactRootContainer, f;
      if (!s)
        f = A_(a, t, e, u, i);
      else {
        if (f = s, typeof u == "function") {
          var p = u;
          u = function() {
            var v = Im(f);
            p.call(v);
          };
        }
        qp(t, f, e, u);
      }
      return Im(f);
    }
    var XR = !1;
    function F_(e) {
      {
        XR || (XR = !0, S("findDOMNode is deprecated and will be removed in the next major release. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node"));
        var t = z_.current;
        if (t !== null && t.stateNode !== null) {
          var a = t.stateNode._warnedAboutRefsInRender;
          a || S("%s is accessing findDOMNode inside its render(). render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", Rt(t.type) || "A component"), t.stateNode._warnedAboutRefsInRender = !0;
        }
      }
      return e == null ? null : e.nodeType === Qr ? e : R_(e, "findDOMNode");
    }
    function H_(e, t, a) {
      if (S("ReactDOM.hydrate is no longer supported in React 18. Use hydrateRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Xp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = dp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.hydrate() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call hydrateRoot(container, element)?");
      }
      return Gm(null, e, t, !0, a);
    }
    function P_(e, t, a) {
      if (S("ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Xp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = dp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.render() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.render(element)?");
      }
      return Gm(null, e, t, !1, a);
    }
    function V_(e, t, a, i) {
      if (S("ReactDOM.unstable_renderSubtreeIntoContainer() is no longer supported in React 18. Consider using a portal instead. Until you switch to the createRoot API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !Xp(a))
        throw new Error("Target container is not a DOM element.");
      if (e == null || !sy(e))
        throw new Error("parentComponent must be a valid React Component");
      return Gm(e, t, a, !1, i);
    }
    var KR = !1;
    function B_(e) {
      if (KR || (KR = !0, S("unmountComponentAtNode is deprecated and will be removed in the next major release. Switch to the createRoot API. Learn more: https://reactjs.org/link/switch-to-createroot")), !Xp(e))
        throw new Error("unmountComponentAtNode(...): Target container is not a DOM element.");
      {
        var t = dp(e) && e._reactRootContainer === void 0;
        t && S("You are calling ReactDOM.unmountComponentAtNode() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?");
      }
      if (e._reactRootContainer) {
        {
          var a = dE(e), i = a && !ko(a);
          i && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.");
        }
        return $u(function() {
          Gm(null, null, e, !1, function() {
            e._reactRootContainer = null, QE(e);
          });
        }), !0;
      } else {
        {
          var u = dE(e), s = !!(u && ko(u)), f = e.nodeType === Qr && Xp(e.parentNode) && !!e.parentNode._reactRootContainer;
          s && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by React and is not a top-level container. %s", f ? "You may have accidentally passed in a React root node instead of its container." : "Instead, have the parent component update its state and rerender in order to remove this component.");
        }
        return !1;
      }
    }
    Rr(T_), Eo(w_), Jv(x_), Ls(za), Fd(qv), (typeof Map != "function" || // $FlowIssue Flow incorrectly thinks Map has no prototype
    Map.prototype == null || typeof Map.prototype.forEach != "function" || typeof Set != "function" || // $FlowIssue Flow incorrectly thinks Set has no prototype
    Set.prototype == null || typeof Set.prototype.clear != "function" || typeof Set.prototype.forEach != "function") && S("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"), Sc(YT), oy($S, Ub, $u);
    function $_(e, t) {
      var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
      if (!Wm(t))
        throw new Error("Target container is not a DOM element.");
      return C_(e, t, null, a);
    }
    function Y_(e, t, a, i) {
      return V_(e, t, a, i);
    }
    var pE = {
      usingClientEntryPoint: !1,
      // Keep in sync with ReactTestUtils.js.
      // This is an array for better minification.
      Events: [ko, Rf, zh, oo, Ec, $S]
    };
    function I_(e, t) {
      return pE.usingClientEntryPoint || S('You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), M_(e, t);
    }
    function Q_(e, t, a) {
      return pE.usingClientEntryPoint || S('You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), U_(e, t, a);
    }
    function W_(e) {
      return aR() && S("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."), $u(e);
    }
    var G_ = L_({
      findFiberByHostInstance: Is,
      bundleType: 1,
      version: lE,
      rendererPackageName: "react-dom"
    });
    if (!G_ && kn && window.top === window.self && (navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge") === -1 || navigator.userAgent.indexOf("Firefox") > -1)) {
      var JR = window.location.protocol;
      /^(https?|file):$/.test(JR) && console.info("%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools" + (JR === "file:" ? `
You might need to use a local HTTP server (instead of file://): https://reactjs.org/link/react-devtools-faq` : ""), "font-weight:bold");
    }
    $a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = pE, $a.createPortal = $_, $a.createRoot = I_, $a.findDOMNode = F_, $a.flushSync = W_, $a.hydrate = H_, $a.hydrateRoot = Q_, $a.render = P_, $a.unmountComponentAtNode = B_, $a.unstable_batchedUpdates = $S, $a.unstable_renderSubtreeIntoContainer = Y_, $a.version = lE, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), $a;
}
function cT() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
    if (process.env.NODE_ENV !== "production")
      throw new Error("^_^");
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(cT);
    } catch (B) {
      console.error(B);
    }
  }
}
process.env.NODE_ENV === "production" ? (cT(), gE.exports = aD()) : gE.exports = iD();
var lD = gE.exports, ev = lD;
if (process.env.NODE_ENV === "production")
  nv.createRoot = ev.createRoot, nv.hydrateRoot = ev.hydrateRoot;
else {
  var Xm = ev.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  nv.createRoot = function(B, X) {
    Xm.usingClientEntryPoint = !0;
    try {
      return ev.createRoot(B, X);
    } finally {
      Xm.usingClientEntryPoint = !1;
    }
  }, nv.hydrateRoot = function(B, X, A) {
    Xm.usingClientEntryPoint = !0;
    try {
      return ev.hydrateRoot(B, X, A);
    } finally {
      Xm.usingClientEntryPoint = !1;
    }
  };
}
function uD(B) {
  return {
    door: B.dataset.door ?? "direct",
    refs: {
      download_version: B.dataset.doorRefVersion,
      order_ref: B.dataset.doorRefOrder,
      inviter_user_id: B.dataset.doorRefInviter,
      bounty_id: B.dataset.doorRefBounty,
      crown_id: B.dataset.doorRefCrown
    }
  };
}
const Qu = "https://mnemosynec.org", Io = "https://lianabanyan.com";
function oD(B) {
  var X, A, wt, pt;
  switch (B.door) {
    case "direct":
      return `${Io}/pathways/?just_joined=1`;
    case "download":
      return `${Qu}/welcome-member/?from=${encodeURIComponent("/download/")}`;
    case "order": {
      const Ie = ((X = B.refs) == null ? void 0 : X.order_ref) ?? "";
      return Ie ? `${Qu}/order/${Ie}/?member_unlock=1` : `${Qu}/order/?member_unlock=1`;
    }
    case "invite": {
      const Ie = ((A = B.refs) == null ? void 0 : A.inviter_user_id) ?? "";
      return `${Io}/welcome/?inviter=${Ie}`;
    }
    case "bounty": {
      const Ie = ((wt = B.refs) == null ? void 0 : wt.bounty_id) ?? "";
      return `${Io}/bounty/${Ie}/?member_unlock=1`;
    }
    case "crown": {
      const Ie = ((pt = B.refs) == null ? void 0 : pt.crown_id) ?? "";
      return `${Io}/welcome/?crown=${Ie}`;
    }
    default:
      return `${Qu}/join/success/`;
  }
}
function sD(B) {
  var X, A;
  switch (B.door) {
    case "direct":
      return `${Qu}/join/`;
    case "download":
      return `${Qu}/download/`;
    case "order":
      return (X = B.refs) != null && X.order_ref ? `${Qu}/order/${B.refs.order_ref}/` : `${Qu}/order/`;
    case "invite":
      return `${Io}/`;
    case "bounty":
      return (A = B.refs) != null && A.bounty_id ? `${Io}/bounty/${B.refs.bounty_id}/` : `${Io}/`;
    case "crown":
      return `${Io}/`;
    default:
      return `${Qu}/join/`;
  }
}
function cD() {
  const [B, X] = Km.useState(""), [A, wt] = Km.useState(!1), [pt, Ie] = Km.useState(""), S = document.getElementById("mnemo-join-root"), jt = (S == null ? void 0 : S.getAttribute("data-supabase-url")) || "", se = (S == null ? void 0 : S.getAttribute("data-supabase-anon-key")) || "", de = (S == null ? void 0 : S.getAttribute("data-price-id")) || "price_1TlDLIRlWRgRXQ3YHfH6Jjmi", Je = S ? uD(S) : { door: "direct" }, Z = (S == null ? void 0 : S.getAttribute("data-success-url")) || oD(Je), Se = (S == null ? void 0 : S.getAttribute("data-cancel-url")) || sD(Je), ie = async (je) => {
    if (je.preventDefault(), !B || !B.includes("@")) {
      Ie("Please enter a valid email address.");
      return;
    }
    wt(!0), Ie("");
    try {
      const Xe = await fetch(`${jt}/functions/v1/create-membership-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: se
        },
        body: JSON.stringify({
          email: B,
          priceId: de,
          successUrl: Z,
          cancelUrl: Se
        })
      });
      if (!Xe.ok) {
        const Kt = await Xe.json().catch(() => ({}));
        throw new Error(Kt.error || `HTTP ${Xe.status}`);
      }
      const { url: it } = await Xe.json();
      if (!it) throw new Error("No checkout URL returned.");
      window.location.href = it;
    } catch (Xe) {
      Ie(Xe instanceof Error ? Xe.message : "Could not start checkout. Please try again."), wt(!1);
    }
  };
  return /* @__PURE__ */ $r.jsx("div", { className: "mnemo-join-widget", children: /* @__PURE__ */ $r.jsxs("div", { className: "mnemo-join-card", children: [
    /* @__PURE__ */ $r.jsxs("div", { className: "mnemo-join-header", children: [
      /* @__PURE__ */ $r.jsx("h2", { className: "mnemo-join-title", children: "Join the Cooperative" }),
      /* @__PURE__ */ $r.jsx("p", { className: "mnemo-join-price", children: "$5 / year" })
    ] }),
    /* @__PURE__ */ $r.jsxs("ul", { className: "mnemo-join-benefits", children: [
      /* @__PURE__ */ $r.jsx("li", { children: "One vote. One voice. Full cooperative membership." }),
      /* @__PURE__ */ $r.jsx("li", { children: "Access to all 16 substrate initiative folders." }),
      /* @__PURE__ */ $r.jsx("li", { children: "83.3% of every dollar you earn stays with you." }),
      /* @__PURE__ */ $r.jsx("li", { children: "No algorithms. No ads. No extraction." })
    ] }),
    /* @__PURE__ */ $r.jsxs("form", { onSubmit: ie, className: "mnemo-join-form", children: [
      /* @__PURE__ */ $r.jsx(
        "input",
        {
          type: "email",
          value: B,
          onChange: (je) => X(je.target.value),
          placeholder: "your@email.com",
          required: !0,
          className: "mnemo-join-input",
          disabled: A
        }
      ),
      pt && /* @__PURE__ */ $r.jsx("p", { className: "mnemo-join-error", children: pt }),
      /* @__PURE__ */ $r.jsx(
        "button",
        {
          type: "submit",
          disabled: A,
          className: "mnemo-join-btn",
          children: A ? "Opening checkout…" : "Join for $5 →"
        }
      )
    ] }),
    /* @__PURE__ */ $r.jsx("p", { className: "mnemo-join-fine-print", children: "Secure checkout via Stripe. Cancel any time." })
  ] }) });
}
function oT() {
  const B = document.getElementById("mnemo-join-root");
  B && nv.createRoot(B).render(
    /* @__PURE__ */ $r.jsx(Km.StrictMode, { children: /* @__PURE__ */ $r.jsx(cD, {}) })
  );
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", oT) : oT();
