import {AspectRatio, MosaicColor, MosaicColorName, MosaicMeta, MosaicName} from "../types/types";
import {generateMatrix} from "../utils/support";
import {Matrix, MosaicMatrixData} from "../types/modules";
import {getAverageColor} from '../utils/support'
import nearestColor from 'nearest-color'
import {loadImage, createCanvas, Canvas, CanvasRenderingContext2D} from 'canvas'
import sizeOf from 'image-size'
import {getMosaicMeta} from '../utils/mosaicData'

export class Mosaic {
    private readonly width: number
    private readonly height: number

    public readonly mosaicSize: number
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

    getMosaicColors(mosaicMeta: MosaicMeta) {
        const mosaicNames = Object.keys(mosaicMeta) as (keyof typeof mosaicMeta)[]

        return mosaicNames.reduce((acc, name) => {
            return {...acc, [name]: mosaicMeta[name].color}
        }, {} as Record<MosaicName, string>)
    }

    async getMosaicPath(ctx: CanvasRenderingContext2D, image: string, sx: number, sy: number, mosaicMeta: MosaicMeta) {
        const mosaicColors = this.getMosaicColors(mosaicMeta)

        const imageColor = await getAverageColor(image)
        // @ts-ignore
        const {name} = nearestColor.from(mosaicColors)(imageColor)
        const {src, colorName, matrixColor} = mosaicMeta[name as MosaicName]
        const img = await loadImage(src)

        // @ts-ignore
        ctx.drawImage(img, sx, sy, this.mosaicSize, this.mosaicSize)

        return {
            colorName,
            matrixColor,
            image: img
        }
    }

    async getMosaicImage(croppedImageData: Matrix, name: MosaicName): Promise<Canvas> {
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
            throw new Error(e)
        }
    }

    getMosaicSize() {
        const [xCubes, yCubes] = this.imageAspectRatio
        const [xMosaics, yMosaics] = this.cubeAspectRatio

        const xMosaicCount = xCubes * xMosaics
        const yMosaicCount = yCubes * yMosaics
        const mosaicWidth = this.width / xMosaicCount
        const mosaicHeight = this.height / yMosaicCount

        return (mosaicWidth + mosaicHeight) / 2
    }
}