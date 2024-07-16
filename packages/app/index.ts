import { computed, ref } from 'vue'

export 
const useCurrentUser = ({
  flowLogin,
  flowLogout,
  tokenStoreKey = 'authorization',
}: {
  [key: string]: any
}) => {
  const longToken = ref(localStorage.getItem(tokenStoreKey) || '')
  const userInfo = ref<{ [key: string]: any }>({})

  const isLogin = computed(() => !!longToken.value)
  const isUserInfoGot = computed(() => Object.keys(userInfo.value).length > 0)
  const isLogining = ref(false)

  const login = async (token: string) => {
    localStorage.setItem(tokenStoreKey, token)
    longToken.value = token
    await initUserInfo()
  }

  const initUserInfo = async () => {
    if (isLogining.value) return
    isLogining.value = true
    try {
      userInfo.value = await flowLogin()
      console.log('initUserInfo', userInfo.value)
      isLogining.value = false
    } catch (error) {
      isLogining.value = false
      return Promise.reject(error)
    }
  }

  const logout = async () => {
    await flowLogout()
    userInfo.value = {}
    longToken.value = ''
    localStorage.removeItem(tokenStoreKey)
  }

  return {
    userInfo,
    longToken,
    isLogin,
    isUserInfoGot,
    isLogining,
    login,
    initUserInfo,
    logout,
  }
}