import getImageColors from './getImageColors'

export const getAverageColor = async (src: string) => {
    return getImageColors(src)
}

export const generateMatrix = (yCubes: number, xCubes: number, yMosaics: number) => {
    return Array.from({length: yCubes}, () => {
        return Array.from({length: xCubes}, () => {
            return Array.from({length: yMosaics}, () => [])
        })
    })
}