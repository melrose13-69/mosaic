export type MosaicName = 'ocean' | 'original' | 'disco' | 'vintage'
export type MosaicColorName = 'z' | 'x' | 'k' | 'f' | 'e' | 'h' | 'v'

export type AspectRatio = [number, number]

export type MosaicColor = {
    mosaic: string
    text: string
}

export type MosaicColors = Record<MosaicName, Record<MosaicColorName, MosaicColor>>

export type MosaicMeta = Record<MosaicName, {
    src: string
    color: string
    colorName: MosaicColorName
    matrixColor: MosaicColor
}>

