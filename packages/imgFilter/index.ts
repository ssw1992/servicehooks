import { ref } from 'vue'
import type { Ref } from 'vue'

/**
 * 将文件对象转换为HTMLImageElement对象
 *
 * @param file 文件对象
 * @returns 返回一个Promise，resolve参数为HTMLImageElement对象
 */
export const imgFileToImgDom = (file: File) => {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => resolve(img)
  })
}

/**
 * 将文件转换为图片源URL。
 *
 * @param file 文件对象，需要是图片文件。
 * @returns 返回一个Promise对象，该对象在解析后返回图片的Base64编码字符串。
 */
export const imgFileToImgSrc = (file: File) => {
  return new Promise<String>((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => resolve(e.target!.result as string)
  })
}

/**
 * 将HTMLImageElement元素绘制到HTMLCanvasElement上
 *
 * @param imgDom HTMLImageElement类型的DOM元素，即要绘制的图片元素
 * @param canvasDom HTMLCanvasElement类型的DOM元素，即要绘制的画布元素
 * @returns 返回CanvasRenderingContext2D对象，用于后续可能的绘图操作
 */
export const imgToCanvas = (
  imgDom: HTMLImageElement,
  canvasDom: HTMLCanvasElement
) => {
  canvasDom.width = imgDom.clientWidth
  canvasDom.height = imgDom.clientHeight
  const ctx = canvasDom.getContext('2d')!
  ctx.drawImage(imgDom, 0, 0, imgDom.clientWidth, imgDom.clientHeight)
  return ctx
}

export const useImgFilter = (imgRef: Ref<HTMLImageElement>) => {
  const canvasRef = ref<HTMLCanvasElement>()

  const loadImg = () => {
    if (!canvasRef.value) {
      canvasRef.value = document.createElement('canvas')
      //   canvasRef.value.style.position = "fixed";
      //   canvasRef.value.style.opacity = "0";
      document.body.appendChild(canvasRef.value)
    }

    const ctx = imgToCanvas(imgRef.value, canvasRef.value)

    const imageData = ctx.getImageData(
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    )

    const traverseImgPixel = (
      callback: (config: {
        index: number
        getByIndex: (index: number) => number
        setByIndex: (index: number, val: number) => void
        r: number
        g: number
        b: number
        setR: (val: number) => void
        setG: (val: number) => void
        setB: (val: number) => void
      }) => void
    ) => {
      const { data } = imageData
      const getByIndex = (index: number) => data[index]
      const setByIndex = (index: number, val: number) => (data[index] = val)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        callback({
          index: i,
          getByIndex,
          setByIndex,
          r,
          g,
          b,
          setR: (val: number) => (data[i] = val),
          setG: (val: number) => (data[i + 1] = val),
          setB: (val: number) => (data[i + 2] = val),
        })
      }
    }

    const reverseTraverseImgPixel = (
      callback: (config: {
        index: number
        getByIndex: (index: number) => number
        setByIndex: (index: number, val: number) => void
        r: number
        g: number
        b: number
        setR: (val: number) => void
        setG: (val: number) => void
        setB: (val: number) => void
      }) => void
    ) => {
      const { data } = imageData
      const getByIndex = (index: number) => data[index]
      const setByIndex = (index: number, val: number) => (data[index] = val)
      for (let i = data.length; i > 0; i -= 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        callback({
          index: i,
          getByIndex,
          setByIndex,
          r,
          g,
          b,
          setR: (val: number) => setByIndex(i, val),
          setG: (val: number) => setByIndex(i + 1, val),
          setB: (val: number) => setByIndex(i + 2, val),
        })
      }
    }

    const traverseRgba = (callback: (rgbaIndex: number) => boolean | void) => {
      for (let rgbaIndex = 0; rgbaIndex < 3; rgbaIndex++) {
        const needBreak = callback(rgbaIndex)
        if (needBreak) {
          break
        }
      }
    }

    const countPosi = (index: number, w: number) => {
      const y = parseInt(index / (w * 4) + '')
      const rowIndex = index - y * w * 4
      const x = parseInt(rowIndex / 4 + '')
      const z = rowIndex % 4
      return { x, y, z }
    }
    return {
      ctx,
      imageData,
      traverseImgPixel,
      reverseTraverseImgPixel,
      traverseRgba,
      countPosi,
      w: canvasRef.value.width,
      h: canvasRef.value.height,
    }
  }

  return {
    styleBlackWhite: async () => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, setR, setG, setB }) => {
        if (r > 255 / 2) {
          setR(255)
          setG(255)
          setB(255)
        } else if (r < 255 / 2) {
          setR(0)
          setG(0)
          setB(0)
        }
      })
      ctx.putImageData(imageData, 0, 0)
    },
    styleGray: async () => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, g, b, setR, setG, setB }) => {
        const average = Math.floor((r + g + b) / 3)
        setR(average)
        setG(average)
        setB(average)
      })
      ctx.putImageData(imageData, 0, 0)
    },
    styleReverse: async () => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, g, b, setR, setG, setB }) => {
        setR(255 - r)
        setG(255 - g)
        setB(255 - b)
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 复古色调 */
    styleRetro: async () => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, g, b, setR }) => {
        setR(r * 0.393 + g * 0.769 + b * 0.189)
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 红色蒙版 */
    styleRedMask: async () => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, g, b, setR, setG, setB }) => {
        setR((r + g + b) / 3)
        setG(0)
        setB(0)
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 增加亮度 */
    styleBrightening: async (delta = 50) => {
      const { ctx, imageData, traverseImgPixel } = await loadImg()
      traverseImgPixel(({ r, g, b, setR, setG, setB }) => {
        setR(r + delta)
        setG(0)
        setB(0)
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 浮雕 */
    styleRelief: async () => {
      const { ctx, imageData, reverseTraverseImgPixel, traverseRgba, w } =
        await loadImg()
      reverseTraverseImgPixel(({ index, setByIndex, getByIndex }) => {
        traverseRgba((rgbaIndex) => {
          if (rgbaIndex < 3) {
            if (index / 4 > w) {
              const numUpIndex = index + rgbaIndex + 4 - w * 4
              setByIndex(
                index + rgbaIndex,
                getByIndex(index + rgbaIndex) - getByIndex(numUpIndex - 4) + 128
              )
            }
          }
        })
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 雾化 */
    styleAtomize: async () => {
      const { ctx, imageData, reverseTraverseImgPixel, w, h } = await loadImg()
      reverseTraverseImgPixel(({ index, setByIndex }) => {
        if (Math.random() < 0.1) {
          setByIndex(index, 255)
          setByIndex(index + 1, 255)
          setByIndex(index + 2, 255)
        }
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 毛玻璃 */
    styleGroundGlass: async () => {
      const {
        ctx,
        imageData,
        traverseImgPixel,
        traverseRgba,
        countPosi,
        w,
        h,
      } = await loadImg()
      traverseImgPixel(({ index, setByIndex, getByIndex }) => {
        const { x, y } = countPosi(index, w)
        traverseRgba((rgbaIndex) => {
          if (rgbaIndex < 3) {
            const round = Math.floor(Math.random() * 10) % 3
            const roundIndex = ((y + round) * w + (x + round)) * 4 + rgbaIndex
            setByIndex(index + rgbaIndex, getByIndex(roundIndex))
          }
        })
      })
      ctx.putImageData(imageData, 0, 0)
    },
    /** 马赛克 */
    styleMosaic: async (size = 5) => {
      const { ctx, imageData } = await loadImg()
      const { data } = imageData
      const w = imgRef.value!.width,
        h = imgRef.value!.height
      for (let i = 1; i < h - 1; i += size) {
        for (let j = 1; j < w - 1; j += size) {
          let num = (i * w + j) * 4
          for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
              let x = i + dx
              let y = j + dy
              let p1 = (x * w + y) * 4

              data[p1 + 0] = data[num + 0]
              data[p1 + 1] = data[num + 1]
              data[p1 + 2] = data[num + 2]
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    },
    /** 模糊 */
    styleVague: async () => {
      const { ctx, imageData, traverseImgPixel, traverseRgba, w } =
        await loadImg()
      traverseImgPixel(({ index, setByIndex, getByIndex }) => {
        traverseRgba((rgbaIndex) => {
          if (rgbaIndex < 3) {
            const num = index + rgbaIndex
            const numUp = index + rgbaIndex - w * 4
            const numDown = index + rgbaIndex - w * 4

            setByIndex(
              num,
              (getByIndex(numUp - 4) +
                getByIndex(numUp) +
                getByIndex(numUp + 4) +
                getByIndex(num - 4) +
                getByIndex(num) +
                getByIndex(num + 4) +
                getByIndex(numDown - 4) +
                getByIndex(numDown) +
                getByIndex(numDown + 4)) /
                9
            )
          }
        })
      })
      ctx.putImageData(imageData, 0, 0)
    },
  }
}
