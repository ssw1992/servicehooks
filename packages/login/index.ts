import { onUnmounted, ref } from "vue";

interface ScanLoginConfig {
  timeout?: number;
  intevalTimeout?: number;
  getSecret: () => Promise<string>;
  verifyLogin: (str: string) => Promise<any>;
  onPass?: (str: string) => void;
  onTimeout?: () => void;
}

export const useScanLogin = ({
  getSecret,
  intevalTimeout = 3 * 1000,
  timeout = 180 * 1000,
  verifyLogin,
  onPass,
}: ScanLoginConfig) => {
  const isTimeout = ref(false);
  const isLoading = ref(false);
  let theInterval: number | null;
  let time = 0;
  let theSecret: string | null;

  const start = async () => {
    isTimeout.value = false;
    time = 0;
    isLoading.value = true;
    try {
      theSecret = null;
      theSecret = await getSecret();
    } catch (error) {
      console.log("获取密钥失败", error);
      throw new Error("获取密钥失败");
    }
    isLoading.value = false;
    if (!theSecret) {
      return;
    }
    theInterval = window.setInterval(async () => {
      time += intevalTimeout;
      if (time > timeout) {
        return stop();
      }

      try {
        const loginInfo = await verifyLogin(theSecret as string);
        if (loginInfo) {
          stop();
          onPass && onPass(loginInfo);
        }
      } catch (error) {
        stop();
        console.error("校验登录失败", error);
        throw new Error("校验登录失败");
      }
    }, intevalTimeout);
  };
  const stop = () => {
    isTimeout.value = true;
    theInterval && clearInterval(theInterval);
  };

  onUnmounted(stop);
  return {
    isTimeout,
    isLoading,
    start,
  };
};
