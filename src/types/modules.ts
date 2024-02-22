import {MosaicTypeName} from "./types";

export type Matrix = any[][][][]

export type MosaicMatrixData = Record<MosaicTypeName, Matrix | undefined>

export type ImagePath = {
    image: string
    sx: number
    sy: number
    x: number
    y: number
}


export type CubeDetails = {
    cubes: string[]
    cubeWidth: number
    cubeHeight: number
}