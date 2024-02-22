```ts
const imagePath = resolve(__dirname, '../src/images/example.jpg')
const imageAspectRatio = [11, 12] // [xCubes, yCubes] cubes in image
const cubeAspectRatio = [7, 10] // [xMosaics, yMosaics] mosaics in cube

const mosaicMatrix = new MosaicMatrix(imagePath, imageAspectRatio, cubeAspectRatio)

mosaicMatrix.generateMosaicImage // return base64 image
mosaicMatrix.generateInstructions // return PDF document
```

