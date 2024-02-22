import {writeFileSync} from "fs";
import {resolve} from "path";
import {MosaicMatrix} from "./modules/MosaicMatrix";

;(async () => {
    try {
        const mosaic = new MosaicMatrix(resolve(__dirname, '../src/images/example.jpg'), [11, 12], [7, 10])

        const image = await mosaic.generateMosaicImage('disco')

        const base64Image = image.split(';base64,').pop() as string

        writeFileSync(resolve(__dirname, '../src/images/disco.png'), base64Image, {encoding: 'base64'})

        const doc = await mosaic.generateInstructions(base64Image, 'ocean', 'output.pdf')

    } catch (e) {
        throw new Error(e)
    }
})()