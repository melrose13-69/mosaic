import {readdirSync} from 'fs'
import {resolve} from 'path'
import {getAverageColor} from './support'
import {MosaicColorName, MosaicMeta, MosaicName} from "../types/types";
import {mosaicColors} from './staticData'

const validateMosaicType = (type: MosaicName) => {
    if (type !== 'ocean' && type !== 'original' && type !== 'disco' && type !== 'vintage') {
        throw new Error('Unvalid mosaic type')
    }
}

export const getMosaicMeta = async (type: MosaicName) => {
    try {
        validateMosaicType(type)

        const path = resolve(__dirname, `../images/pallete/${type}`)
        const fileList = readdirSync(path)
        const mosaicMeta: MosaicMeta = {} as MosaicMeta

        for await (const file of fileList) {
            const [fileName, ext] = file.split('.')
            const [mosaicName, colorName] = fileName.split('_') as [MosaicName, MosaicColorName]
            const filePath = `${path}/${fileName}.${ext}`

            mosaicMeta[mosaicName] = {
                src: filePath,
                color: await getAverageColor(filePath),
                colorName,
                matrixColor: mosaicColors[type][colorName]
            }
        }

        return mosaicMeta
    } catch (e) {
        throw new Error(e)
    }
}