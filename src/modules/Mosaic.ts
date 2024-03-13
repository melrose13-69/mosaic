import {AspectRatio, MosaicMeta, MosaicTypeName, CroppedImageMatrix, MosaicMatrixData} from '../types'
import {generateMatrix, getAverageColor, getMosaicColors, getMosaicMeta} from '../utils'
import nearestColor from 'nearest-color'
import {loadImage, createCanvas, Canvas, CanvasRenderingContext2D} from 'canvas'
import sizeOf from 'image-size'

export class Mosaic {
    private readonly width: number
    private readonly height: number

    public readonly mosaicSize: {
        naturalSize: number
        ceilSize: number
    }
    public readonly mosaicMatrix: MosaicMatrixData

    constructor(
        public readonly url: string,
        public readonly imageAspectRatio: AspectRatio,
        public readonly cubeAspectRatio: AspectRatio
    ) {
        const {width, height} = sizeOf(url)

        this.url = url
        this.imageAspectRatio = imageAspectRatio
        this.cubeAspectRatio = cubeAspectRatio
        this.width = width as number
        this.height = height as number

        this.mosaicSize = this.getMosaicSize()

        this.mosaicMatrix = {
            ocean: undefined,
            original: undefined,
            disco: undefined,
            vintage: undefined
        }
    }


    async getMosaicPath(ctx: CanvasRenderingContext2D, image: string, sx: number, sy: number, mosaicMeta: MosaicMeta) {
        const imageColor = await getAverageColor(image)
        const mosaicColors = getMosaicColors(mosaicMeta)

        const {name} = nearestColor.from(mosaicColors)(imageColor) as { name: string }
        const {src, colorName, matrixColor} = mosaicMeta[name]
        const img = await loadImage(src)

        ctx.drawImage(img, sx, sy, this.mosaicSize.ceilSize, this.mosaicSize.ceilSize)

        return {
            colorName,
            matrixColor,
            image: img
        }
    }

    async getMosaicImage(croppedImageData: CroppedImageMatrix, name: MosaicTypeName): Promise<Canvas> {
        try {
            const mosaicMeta = await getMosaicMeta(name)

            const [xCubes, yCubes] = this.imageAspectRatio
            const [xMosaics, yMosaics] = this.cubeAspectRatio

            this.mosaicMatrix[name] = generateMatrix(yCubes, xCubes, yMosaics)

            const canvas = createCanvas(this.width, this.height)
            const context = canvas.getContext('2d')

            for (let line = 0; line < yCubes; line++) {
                for (let cube = 0; cube < xCubes; cube++) {
                    for (let cubeLine = 0; cubeLine < yMosaics; cubeLine++) {
                        for (let mosaic = 0; mosaic < xMosaics; mosaic++) {
                            const {image, sx, sy} = croppedImageData[line][cube][cubeLine][mosaic]

                            const {
                                image: mosaicImage,
                                colorName,
                                matrixColor
                            } = await this.getMosaicPath(context, image, sx, sy, mosaicMeta)

                            this.mosaicMatrix[name]?.[line][cube][cubeLine].push({
                                image: mosaicImage,
                                x: cubeLine,
                                y: mosaic,
                                colorName,
                                matrixColor
                            })
                        }
                    }
                }
            }

            return canvas
        } catch (e) {
            throw e
        }
    }

    getMosaicSize() {
        const [xCubes, yCubes] = this.imageAspectRatio
        const [xMosaics, yMosaics] = this.cubeAspectRatio

        const xMosaicCount = xCubes * xMosaics
        const yMosaicCount = yCubes * yMosaics
        const mosaicWidth = this.width / xMosaicCount
        const mosaicHeight = this.height / yMosaicCount
        const naturalSize = (mosaicWidth + mosaicHeight) / 2

        return {
            naturalSize,
            ceilSize: Math.ceil(naturalSize)
        }
    }
}