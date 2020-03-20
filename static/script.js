const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/static'),
 // faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
 // faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
 // faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)

  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var face_canvas  = document.createElement("canvas");
    face = resizedDetections[0]
    face_canvas.width = face.box.width * 1.4;
    face_canvas.height = face.box.height * 1.4;
    var ctx = face_canvas.getContext("2d");
    ctx.drawImage(video, -face.box.left + ( face_canvas.width / 3 ) , -face.box.top +  ( face_canvas.height / 3 ) );
    //document.body.append(face_canvas);
    //img = document.querySelector('#screenshot');
    pic = face_canvas.toDataURL();

    faceapi.draw.drawDetections(canvas, resizedDetections)
    var data = JSON.stringify(
				   {
					   value: pic
				   });
  var touch_face_counter = 0;

$.ajax({
	type: "POST",
	url: "/receiver",
	contentType: false,
	processData: false,
	data: data,
	contentType: "application/json; charset=utf-8",
	success: function (result) {
		console.log(result);
		if ("predictions" in result){
            no_prob = 0;
            yes_prob = 0;

		predictions = result["predictions"]
		var i = 0;
		for(i = 0;i< predictions.length;i++){
		    pred = predictions[i]
		    pred_name = pred[0]
		    if (pred_name == "not_touching"){
		        no_prob = pred[1]
		    }
		    if (pred_name == "touching" ){
		        yes_prob = pred[1]
		    }


		}
        classify = "no";
		if (yes_prob > no_prob){
		var sound = document.getElementById("audio");
        sound.play();
        touch_face_counter += 1;
        classify = "touching"
		//alert("Don't touch your face!!!");
		}
        var pic = result["pic"];
        $("#snapshots").append("<img src='data:image/jpg;base64, ${pic}'  /> <p>{1}</p>".replace("${pic}",pic).replace("{1}",classify));
		}
	},
	error: function(){}
});
   // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
   // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 3000)
})