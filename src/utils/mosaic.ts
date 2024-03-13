import {readdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {getAverageColor} from './support'
import {MosaicColorName, MosaicMeta, MosaicTypeName} from '../types'
import {mosaicColors} from './staticData'

const validateMosaicType = (type: MosaicTypeName) => {
    if (type !== 'ocean' && type !== 'original' && type !== 'disco' && type !== 'vintage') {
        throw new Error('Unvalid mosaic type')
    }
}


export const getMosaicMeta = async (name: MosaicTypeName) => {
    try {
        validateMosaicType(name)

        const path = resolve(__dirname, `../images/pallete/${name}`)
        const fileList = readdirSync(path)
        const mosaicMeta: MosaicMeta = {} as MosaicMeta

        for await (const file of fileList) {
            const [fileName, ext] = file.split('.')
            const [mosaicName, colorName] = fileName.split('_') as [string, MosaicColorName]
            const filePath = `${path}/${fileName}.${ext}`

            mosaicMeta[mosaicName] = {
                src: filePath,
                color: await getAverageColor(filePath),
                colorName,
                matrixColor: mosaicColors[name][colorName]
            }
        }

        return mosaicMeta
    } catch (e) {
        throw e
    }
}

export const getMosaicColors = (mosaicMeta: MosaicMeta) => {
    const mosaicNames = Object.keys(mosaicMeta) as (keyof typeof mosaicMeta)[]

    return mosaicNames.reduce((acc, mosaicName) => {
        return {...acc, [mosaicName]: mosaicMeta[mosaicName].color}
    }, {} as Record<string, string>)
}