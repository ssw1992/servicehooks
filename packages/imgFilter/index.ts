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
  return new Promise<String>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      if (e.target) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('FileReader event target is null'))
      }
    }
    reader.onerror = (error) => reject(error)
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
  canvasDom.width = imgDom.clientWidth // 使用图像的原始宽度
  canvasDom.height = imgDom.clientHeight // 使用图像的原始高度
  const ctx = canvasDom.getContext('2d')!
  ctx.drawImage(imgDom, 0, 0, imgDom.clientWidth, imgDom.clientHeight) // 绘制图像时使用原始尺寸
  return ctx
}

type PixelTransformationCallback = (config: {
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
const applyPixelValue = (
  data: Uint8ClampedArray,
  index: number,
  value: number
) => (data[index] = value)
export const applyPixelTransformation = (
  data: Uint8ClampedArray,
  callback: PixelTransformationCallback,
  reverse: boolean = false
) => {
  const getByIndex = (index: number) => data[index]
  const setByIndex = (index: number, val: number) => (data[index] = val)

  const transformation = (index: number) => {
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]

    callback({
      index,
      getByIndex,
      setByIndex,
      r,
      g,
      b,
      setR: (val: number) => applyPixelValue(data, index, val),
      setG: (val: number) => applyPixelValue(data, index + 1, val),
      setB: (val: number) => applyPixelValue(data, index + 2, val),
    })
  }
  if (reverse) {
    for (let i = data.length; i > 0; i -= 4) {
      transformation(i)
    }
  } else {
    for (let i = 0; i < data.length; i += 4) {
      transformation(i)
    }
  }
}

export const traverseRgba = (
  callback: (rgbaIndex: number) => boolean | void
) => {
  for (let rgbaIndex = 0; rgbaIndex < 3; rgbaIndex++) {
    const needBreak = callback(rgbaIndex)
    if (needBreak) {
      break
    }
  }
}

export const countPosi = (index: number, w: number) => {
  const y = parseInt(index / (w * 4) + '')
  const rowIndex = index - y * w * 4
  const x = parseInt(rowIndex / 4 + '')
  const z = rowIndex % 4
  return { x, y, z }
}

export const loadImgToCanvas = (imgDom: HTMLImageElement) => {
  const canvasDom = document.createElement('canvas')
  //   canvasRef.value.style.position = "fixed";
  //   canvasRef.value.style.opacity = "0";
  document.body.appendChild(canvasDom)

  const ctx = imgToCanvas(imgDom, canvasDom)
  const w = canvasDom.width
  const h = canvasDom.height
  const imageData = ctx.getImageData(0, 0, w, h)
  return {
    canvasDom,
    ctx,
    imageData,
    w,
    h,
  }
}

/**
 * 将图片转换为黑白效果
 *
 * @param imgDom 图片的DOM元素
 * @returns 返回处理后的Canvas DOM元素
 */
export const imgFilterBlackWhite = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  const brightnessThreshold = 127.5
  applyPixelTransformation(imageData.data, ({ r, g, b, setR, setG, setB }) => {
    const brightness = (r + g + b) / 3 // 计算亮度
    const newColor = brightness > brightnessThreshold ? 255 : 0
    setR(newColor)
    setG(newColor)
    setB(newColor)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 将图片转换为灰度图
 *
 * @param imgDom 需要转换的图片元素
 * @returns 转换后的canvas元素
 */
export const imgFilterGray = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(imageData.data, ({ r, g, b, setR, setG, setB }) => {
    const average = Math.floor((r + g + b) / 3)
    setR(average)
    setG(average)
    setB(average)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 将图片中的颜色进行反转
 *
 * @param imgDom 图片DOM元素
 * @returns 转换后的Canvas DOM元素
 */
export const imgFilterReverse = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(imageData.data, ({ r, g, b, setR, setG, setB }) => {
    setR(255 - r)
    setG(255 - g)
    setB(255 - b)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 将图片应用复古滤镜效果
 *
 * @param imgDom 图片的DOM元素
 * @returns 返回应用复古滤镜后的canvas元素
 */
export const imgFilterRetro = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(imageData.data, ({ r, g, b, setR }) => {
    setR(r * 0.393 + g * 0.769 + b * 0.189)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 对图片应用红色遮罩滤镜
 *
 * @param imgDom HTMLImageElement - 需要处理的图片元素
 * @returns 返回处理后的canvas元素
 */
export const imgFilterRedMask = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(imageData.data, ({ r, g, b, setR, setG, setB }) => {
    setR((r + g + b) / 3)
    setG(0)
    setB(0)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}
/**
 * 对图片进行亮度提升处理
 *
 * @param imgDom HTMLImageElement - 要处理的图片DOM元素
 * @param delta number - 亮度提升值，默认为50
 * @returns HTMLCanvasElement - 处理后的图片canvas元素
 */
export const imgFilterBrightening = async (
  imgDom: HTMLImageElement,
  delta = 50
) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(imageData.data, ({ r, g, b, setR, setG, setB }) => {
    setR(r + delta)
    setG(g + delta)
    setB(b + delta)
  })
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}
/**
 * 将图片转换为浮雕效果
 *
 * @param imgDom HTMLImageElement类型，表示要处理的图片元素
 * @returns 返回处理后的canvas元素
 */
export const imgFilterRelief = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData, w } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(
    imageData.data,
    ({ index, setByIndex, getByIndex }) => {
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
    },
    true
  )
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 对图片进行雾化滤镜处理
 *
 * @param imgDom 需要处理的图片元素
 * @returns 处理后的canvas元素
 */
export const imgFilterAtomize = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(
    imageData.data,
    ({ index, setByIndex }) => {
      if (Math.random() < 0.1) {
        setByIndex(index, 255)
        setByIndex(index + 1, 255)
        setByIndex(index + 2, 255)
      }
    },
    true
  )
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 对传入的图片元素应用磨砂滤镜效果
 *
 * @param imgDom HTMLImageElement 图片元素
 * @returns 返回处理后的canvas元素
 */
export const imgFilterGroundGlass = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData, w } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(
    imageData.data,
    ({ index, setByIndex, getByIndex }) => {
      const { x, y } = countPosi(index, w)
      traverseRgba((rgbaIndex) => {
        if (rgbaIndex < 3) {
          const round = Math.floor(Math.random() * 10) % 3
          const roundIndex = ((y + round) * w + (x + round)) * 4 + rgbaIndex
          setByIndex(index + rgbaIndex, getByIndex(roundIndex))
        }
      })
    },
    true
  )
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}

/**
 * 对图片进行马赛克处理
 *
 * @param imgDom 需要处理的HTMLImageElement对象
 * @param size 马赛克的大小，默认为3
 * @returns 处理后的canvasDom对象
 */
export const imgFilterMosaic = async (imgDom: HTMLImageElement, size = 3) => {
  const { canvasDom, ctx, imageData, w, h } = await loadImgToCanvas(imgDom)
  const { data } = imageData
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
  return canvasDom
}

/**
 * 对图片进行模糊处理
 *
 * @param imgDom 要处理的HTMLImageElement对象
 * @returns 处理后的canvas元素
 */
export const imgFilterVague = async (imgDom: HTMLImageElement) => {
  const { canvasDom, ctx, imageData, w } = await loadImgToCanvas(imgDom)
  applyPixelTransformation(
    imageData.data,
    ({ index, setByIndex, getByIndex }) => {
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
    }
  )
  ctx.putImageData(imageData, 0, 0)
  return canvasDom
}
