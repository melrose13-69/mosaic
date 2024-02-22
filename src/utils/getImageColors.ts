import {createCanvas, Image} from 'canvas'

const getImageData = (src: string): Promise<Uint8ClampedArray> => {
    const img = new Image()

    return new Promise((resolve, reject) => {
        img.onload = () => {
            const width = img.width
            const height = img.height
            const canvas = createCanvas(width, height)
            const context = canvas.getContext('2d')

            context.drawImage(img, 0, 0, width, height)

            const imageData = context.getImageData(0, 0, width, height)

            resolve(imageData.data)
        }

        img.onerror = () => {
            return reject(new Error('An error occurred attempting to load image'))
        }

        img.src = src
    })
}

const getCounts = (data: Uint8ClampedArray) => {
    const countMap: Record<string, string> = {}

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]

        if (alpha === 0) continue

        const rgbComponents = Array.from(data.subarray(i, i + 3))

        const color = alpha && alpha !== 255 ? ("rgba(" + (rgbComponents.concat([alpha]).join(',')) + ")") : ("rgb(" + (rgbComponents.join(',')) + ")")

        if (countMap[color]) continue

        countMap[color] = color
    }

    const [color] = Object.keys(countMap)

    return color
}

export default async (src: string) => {
    try {
        return Promise.resolve(getImageData(src)).then(getCounts)
    } catch (e) {
        return Promise.reject(e)
    }
}

