from starlette.applications import Starlette
from starlette.responses import JSONResponse,StreamingResponse, FileResponse
from starlette.routing import Route
from starlette.routing import Mount
from starlette.staticfiles import StaticFiles
from fastai.vision import *
import base64
from io import BytesIO
import time
import imutils
import cv2
import asyncio


import face_recognition
path = Path('static/')


face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
learn = load_learner(path)

async def homepage(request):
    return FileResponse("static/index.html")

async def wrong(request):
    json = await  request.json()
    picture = json["img"]
    classify_wrong = json["classify"]
    jpg_original = base64.b64decode(picture.split(',')[1])
    filename = "static/wrong_classify/{}/{}.jpg".format(classify_wrong,time.time())
    with open(filename, 'wb') as f:
        f.write(jpg_original)
    return JSONResponse({"status":"reported!"})

async def get_picture(request):
    start = time.time()
    json =await  request.json()
    picture = json["value"]
    jpg_original = base64.b64decode(picture.split(',')[1])
    jpg_as_np = np.frombuffer(jpg_original, dtype=np.uint8)
    img = cv2.imdecode(jpg_as_np, flags=0)
    img_time_now = time.time()
    img_time =  img_time_now - start
    #img = face_extractor(img,face_cascade)
    #img = face_detection(img)
    if img is None:
        return JSONResponse({"status": "no face found"})
    #return StreamingResponse(io.BytesIO(cv2.imencode('.jpg', img)[1].tobytes()), media_type="image/jpg")
    #img = open_image(img)
    #img = open_image(BytesIO(base64.decodebytes(picture.split(',')[1].encode())))
    img_x = open_image(BytesIO(cv2.imencode('.jpg', img)[1].tobytes()))
    open_img_time = time.time() - img_time_now
    _,_,losses = learn.predict(img_x)
    finish = time.time() - start
    return JSONResponse({ "time_total": finish, "img_convertion": img_time, "open_img_time": open_img_time,
        "predictions": sorted(
            zip(learn.data.classes, map(float, losses)),
            key=lambda p: p[1],
            reverse=True
        ),
        "pic": base64.encodebytes(cv2.imencode('.jpg', img)[1].tobytes()).decode("utf-8")
    })




def face_extractor(img, fc):
    ## Importing image using open cv
    #img = cv2.imread(origin, 1)

    ## Resizing to constant width
    img = imutils.resize(img, width=224)

    ## Finding actual size of image
    H, W, _ = img.shape

    ## Converting BGR to RGB
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    ## Detecting faces on the image
    face_coord = fc.detectMultiScale(gray, 1.2, 10, minSize=(50, 50))

    ## If only one face is foung
    if len(face_coord) == 1:
        X, Y, w, h = face_coord[0]

    ## If no face found --> SKIP
    elif len(face_coord) != 1:

        return None

    ## Crop and export the image
    img_cp = img[
             max(0, Y - int(0.35 * h)): min(Y + int(1.35 * h), H),
             max(0, X - int(w * 0.35)): min(X + int(1.35 * w), W)
             ].copy()

    return img_cp


from PIL import Image as PILImage
import cv2


def face_detection(img):
    face_locations = face_recognition.face_locations(img)
    if len(face_locations) != 1:
        return
    for (top, right, bottom, left) in face_locations:
        height = bottom - top
        width = right - left
        h_margin = int(height / 3)
        w_margin = int(width / 3)
        start = top - h_margin
        end = bottom + h_margin
        l = left - w_margin
        r = right + w_margin
        if start < 0:
            start = 0
        if l < 0:
            l = 0
        roi_color = img[start:end, l:r]
        return roi_color

app = Starlette(debug=True, routes=[
  Route('/', homepage),
   Route('/receiver',get_picture,methods=["POST"]),
Route('/wrong',wrong,methods=["POST"]),
Mount('/static', app=StaticFiles(directory='static'), name="static")
])
