import sys
import base64
import json
from typing import List
from PIL import Image
from io import BytesIO

class ImagePath:
    def __init__(self, image, sx, sy):
        self.image = image
        self.sx = sx
        self.sy = sy


def crop_image_path(image: Image, mosaic_size: float, x: int, y: int):
    sx = float(x) * mosaic_size
    sy = float(y) * mosaic_size

    x = sx + mosaic_size
    y = sy + mosaic_size

    cropped_image = image.crop((sx, sy, x, y))

    buffered = BytesIO()
    cropped_image.save(buffered, format="PNG")

    b64_image = base64.b64encode(buffered.getvalue())

    return ImagePath(b64_image, sx, sy)


def cropImage(
    x_cubes: int,
    y_cubes: int,
    x_mosaic: int,
    y_mosaic: int,
    mosaic_size: float,
    image_path: str
) -> List[List[List[List[ImagePath]]]]:
    try:
        image = Image.open(image_path)
        croppedImage = [[[[] for _ in range(y_mosaic)] for _ in range(x_cubes)] for _ in range(y_cubes)]


        for line in range(y_cubes):
            for cube in range(x_cubes):
                for cubeLine in range(y_mosaic):
                    for mosaic in range(x_mosaic):
                        x = mosaic if cube == 0 else (x_mosaic * cube) + mosaic
                        y = cubeLine if line == 0 else (line * y_mosaic) + cubeLine
                        
                        res = crop_image_path(image, mosaic_size, x, y)

                        croppedImage[line][cube][cubeLine].append({'image': str(res.image), 'sx': res.sx, 'sy': res.sy})

        return croppedImage
    except Exception as e:
        raise ValueError(str(e))
    

result = crop_image(int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), str(sys.argv[6]))

sys.stdout.write(json.dumps(result))
    
# result = cropImage(11, 12, 7, 10, 6.670995670995671, "/Users/poltoratchi/freelance/mosaic/src/images/example.jpg")

# print(result)