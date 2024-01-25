import { onUnmounted as i } from "vue";
const c = () => {
  const s = [], t = (n) => {
    s.includes(n) || typeof n != "function" || s.push(n);
  }, o = () => {
    s.forEach((n) => n());
  }, r = (n) => {
    const e = s.findIndex(n);
    e > -1 && s.splice(e, 1);
  };
  return i(() => {
    s.length = 0;
  }), {
    subscribe: t,
    publish: o,
    unsubscribe: r
  };
};
export {
  c as useSubscribe
};
//# sourceMappingURL=index3.js.map
