import {AspectRatio, MosaicName} from "../types/types";
import {createCanvas, Image} from 'canvas'
import {Mosaic} from './Mosaic'
// @ts-ignore
import SvgBuilder from 'svg-builder'
import {CubeDetails, ImagePath, Matrix} from "../types/modules";
import {generateMatrix} from "../utils/support";

export class Cropper extends Mosaic {
    public croppedImage: Matrix | undefined

    constructor(
        readonly url: string,
        readonly imageAspectRatio: AspectRatio,
        readonly cubeAspectRatio: AspectRatio
    ) {
        super(url, imageAspectRatio, cubeAspectRatio)

        this.croppedImage = undefined
    }

    cropImagePath(x: number, y: number): Promise<ImagePath> {
        const canvas = createCanvas(this.mosaicSize, this.mosaicSize)
        const context = canvas.getContext('2d');
        const image = new Image();

        const sx = x * this.mosaicSize
        const sy = y * this.mosaicSize

        canvas.width = this.mosaicSize;
        canvas.height = this.mosaicSize;

        return new Promise((resolve, reject) => {
            image.onload = () => {
                context.drawImage(image, sx, sy, this.mosaicSize, this.mosaicSize, 0, 0, this.mosaicSize, this.mosaicSize);

                const b64 = canvas.toDataURL('image/png')

                resolve({image: b64, sx, sy, x, y})
            }

            image.onerror = () => {
                reject(Error('An error occurred attempting to load image'))
            }

            image.src = this.url;
        })
    }

    async cropImage() {
        try {
            const [xCubes, yCubes] = this.imageAspectRatio
            const [xMosaic, yMosaic] = this.cubeAspectRatio

            if (this.croppedImage) return

            if (!this.croppedImage) {
                this.croppedImage = generateMatrix(yCubes, xCubes, yMosaic)
            }

            for (let line = 0; line < yCubes; line++) {
                for (let cube = 0; cube < xCubes; cube++) {
                    for (let cubeLine = 0; cubeLine < yMosaic; cubeLine++) {
                        for (let mosaic = 0; mosaic < xMosaic; mosaic++) {
                            const x = cube === 0 ? mosaic : (xMosaic * cube) + mosaic
                            const y = line === 0 ? cubeLine : (line * yMosaic) + cubeLine

                            const {image, sx, sy} = await this.cropImagePath(x, y)

                            this.croppedImage[line][cube][cubeLine].push({image, x: cubeLine, y: mosaic, sx, sy})
                        }
                    }
                }
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    cropMosaicCubes(name: MosaicName) {
        try {
            const rectSize = 20
            const mosaicMargin = 5
            const [xMosaics, yMosaics] = this.cubeAspectRatio

            const cubeWidth = xMosaics * rectSize + xMosaics * mosaicMargin
            const cubeHeight = yMosaics * rectSize + yMosaics * mosaicMargin

            const cubesDetails: CubeDetails = {
                cubes: [],
                cubeWidth,
                cubeHeight
            }

            if (!this.mosaicMatrix[name]) {
                throw new Error(`First generate mosaic image with '${name}' argument`)
            }

            for (const line of (this.mosaicMatrix[name] ?? [])) {
                for (let i = 0; i < line.length; i++) {
                    const cube = line[i]
                    const cubeSvg = SvgBuilder.newInstance().width(cubeWidth).height(cubeHeight)

                    for (let k = 0; k < cube.length; k++) {
                        const cubLine = cube[k]
                        const prevRect = {i: 1, name: ''}

                        for (let j = 0; j < cubLine.length; j++) {
                            const mosaic = cubLine[j]

                            if (prevRect.name === mosaic.colorName) {
                                prevRect.i = prevRect.i + 1
                            } else {
                                prevRect.i = 1
                                prevRect.name = mosaic.colorName
                            }


                            const x = mosaic.y * rectSize + (mosaicMargin * j)
                            const y = mosaic.x * rectSize + (mosaicMargin * k)

                            cubeSvg
                                .rect({x, y, fill: mosaic.matrixColor.mosaic, width: rectSize, height: rectSize, rx: 3})
                                .text({
                                    x: x + 2,
                                    y: y + 18,
                                    'font-size': 10,
                                    'font-family': 'Arial',
                                    fill: mosaic.matrixColor.text
                                }, mosaic.colorName.toUpperCase())
                                .text({
                                    x: x + 15,
                                    y: y + 6,
                                    'font-size': 5,
                                    'font-family': 'Arial',
                                    fill: mosaic.matrixColor.text
                                }, prevRect.i.toString())
                        }
                    }

                    const svg = cubeSvg.render()

                    cubesDetails.cubes.push(svg)
                }
            }

            return cubesDetails
        } catch (e) {
            throw new Error('e')
        }
    }
}

