import { ref as i, onUnmounted as v } from "vue";
const m = ({
  getSecret: u,
  intevalTimeout: s = 3 * 1e3,
  timeout: f = 180 * 1e3,
  verifyLogin: w,
  onPass: c
}) => {
  const o = i(!1), n = i(!1);
  let a, l = 0, r;
  const h = async () => {
    o.value = !1, l = 0, n.value = !0;
    try {
      r = null, r = await u();
    } catch (e) {
      throw console.log("获取密钥失败", e), new Error("获取密钥失败");
    }
    n.value = !1, r && (a = window.setInterval(async () => {
      if (l += s, l > f)
        return t();
      try {
        const e = await w(r);
        e && (t(), c && c(e));
      } catch (e) {
        throw t(), console.error("校验登录失败", e), new Error("校验登录失败");
      }
    }, s));
  }, t = () => {
    o.value = !0, a && clearInterval(a);
  };
  return v(t), {
    isTimeout: o,
    isLoading: n,
    start: h
  };
};
export {
  m as useScanLogin
};
//# sourceMappingURL=index2.js.map
