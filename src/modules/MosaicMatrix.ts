import {AspectRatio, MosaicTypeName} from '../types'
import {Cropper} from './Cropper'
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import {createWriteStream} from "node:fs"

export class MosaicMatrix extends Cropper {
    constructor(
        readonly url: string,
        readonly imageAspectRatio: AspectRatio,
        readonly cubeAspectRatio: AspectRatio
    ) {
        super(url, imageAspectRatio, cubeAspectRatio)
    }

    async generateMosaicImage(name: MosaicTypeName) {
        try {
            await this.cropImage()

            if (!this.croppedImage) {
                throw new Error('Error with crop image')
            }

            const canvas = await this.getMosaicImage(this.croppedImage, name)

            return canvas.toDataURL('image/png')
        } catch (e) {
            throw e
        }
    }

    async generateInstructions(base64Image: string, name: MosaicTypeName, output?: string) {
        try {
            if (output && !output.endsWith('.pdf')) {
                throw new Error('Should be .pdf file')
            }

            const {cubes, cubeWidth, cubeHeight} = this.cropMosaicCubes(name)

            const doc = new PDFDocument()

            if (output) {
                doc.pipe(createWriteStream(output))
            }

            const base64String = base64Image.split(';base64,').pop() as string
            const imageBuffer = Buffer.from(base64String, 'base64')

            doc.image(imageBuffer, 0, 0)
            doc.addPage()

            const TEXT_MARGIN = 20
            const coords = {x: 0, y: TEXT_MARGIN}

            let newLine = false

            for (let i = 0; i < cubes.length; i++) {
                const cube = cubes[i]

                newLine = i !== 0 && i % 3 === 0

                if (newLine) {
                    coords.x = 0
                    coords.y = coords.y + cubeHeight
                }

                if (i !== 0 && i % 9 === 0) {
                    doc.addPage()

                    coords.x = 0
                    coords.y = TEXT_MARGIN
                }

                doc.text((i + 1).toString(), coords.x, coords.y - TEXT_MARGIN)

                SVGtoPDF(doc, cube, coords.x, coords.y)

                coords.x = coords.x + cubeWidth
            }


            doc.end()

            return doc
        } catch (e) {
            throw e
        }
    }
}

