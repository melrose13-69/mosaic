import {mkdirSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {MosaicMatrix} from './modules/MosaicMatrix'
import {AspectRatio, MosaicTypeName} from './types'
import {existsSync, rmSync} from 'node:fs'

type ImageDataForTest = {
    name: string
    ext: string
    ratio: [AspectRatio, AspectRatio]
}

const pallets: MosaicTypeName[] = ['disco', 'ocean', 'original', 'vintage']

const image1: ImageDataForTest = {name: '20x30_11x12_7x10_ratio_77x120', ext: 'jpeg', ratio: [[11, 12], [7, 10]]}
const image2: ImageDataForTest = {name: '32x40_13x11_9x15_ratio_39x55', ext: 'jpeg', ratio: [[13, 11], [9, 15]]}
const image3: ImageDataForTest = {name: '40x50_12x15_13x13_ratio_4x5', ext: 'jpeg', ratio: [[12, 15], [13, 13]]}

;(async () => {
    try {
        const outputDir = resolve(__dirname, '../output')
        const imagesDir = resolve(__dirname, '../src/images')

        for await (const {name, ext, ratio: [imageRatio, cubeRatio]} of [image1, image2, image3]) {
            const outputSizeDirName = `${outputDir}/${name}`
            const mosaic = new MosaicMatrix(`${imagesDir}/${name}.${ext}`, imageRatio, cubeRatio)

            if (existsSync(outputSizeDirName)) {
                rmSync(outputSizeDirName, {recursive: true})
            }

            mkdirSync(outputSizeDirName)

            console.log(`Working dir: ${outputSizeDirName}`)

            for await (const pallete of pallets) {
                console.time(`generateMosaicImage ${name} - ${pallete}`)
                const image = await mosaic.generateMosaicImage(pallete)
                console.timeEnd(`generateMosaicImage ${name} - ${pallete}`)

                const base64Image = image.split(';base64,').pop() as string

                writeFileSync(`${outputSizeDirName}/${pallete}.png`, base64Image, {encoding: 'base64'})
            }
        }
    } catch (e) {
        throw e
    }
})()