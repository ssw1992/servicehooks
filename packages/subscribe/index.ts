import { onUnmounted } from "vue";


export const useSubscribe = () => {
  const theArr: any[] = [];

  const subscribe = (cb: () => any) => {
    if (theArr.includes(cb) || !(typeof cb === "function")) {
      return;
    }
    theArr.push(cb);
  };
  const publish = () => {
    theArr.forEach((cb) => cb());
  };
  const unsubscribe = (cb: () => any) => {
    const index = theArr.findIndex(cb);
    if (index > -1) {
      theArr.splice(index, 1);
    }
  };

  onUnmounted(() => {
    theArr.length = 0;
  });

  return {
    subscribe,
    publish,
    unsubscribe
  };
};
