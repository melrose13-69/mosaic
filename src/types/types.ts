import {Image} from "canvas";

export type MosaicTypeName = 'ocean' | 'original' | 'disco' | 'vintage'
export type MosaicColorName = 'z' | 'x' | 'k' | 'f' | 'e' | 'h' | 'v'

export type AspectRatio = [number, number]

export type MosaicColor = {
    mosaic: string
    text: string
}

export type MosaicColors = Record<MosaicTypeName, Record<MosaicColorName, MosaicColor>>

export type MosaicMetaData = {
    src: string
    color: string
    colorName: MosaicColorName
    matrixColor: MosaicColor
}

export type MosaicMeta = Record<string, MosaicMetaData>