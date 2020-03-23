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
  var worker = new Worker('static/web_worker.js');
  worker.onmessage = async function() {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var face_canvas  = document.createElement("canvas");
    face = resizedDetections[0]
    if (face == undefined) {
        return;
    }
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
		//console.log(result);
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
		if (yes_prob > .75){
		var sound = document.getElementById("audio");
        sound.play();
        touch_face_counter += 1;
        classify = "touching"
		//alert("Don't touch your face!!!");
		}
        var pic = result["pic"];
        var now = new Date()
        var frag = document.createElement('div');
        frag.innerHTML = "<img src='data:image/jpg;base64, ${pic}' alt='{1}'  /> <p>{5}:  {4}:{2}:{3} </p>".replace("${pic}",pic).replace("{1}",classify).
        replace("{2}", now.getMinutes()).replace("{3}",now.getSeconds()).replace("{4}", now.getHours()).replace("{5}",classify);

        $("#snapshots").prepend(frag);
		}
	},
	error: function(){}
});
  }
  $(document).off().on("click","img", function(){
  classify =  $(this).attr("alt");
  image = $(this).attr("src");
  var data = JSON.stringify(
				   {
					   "img": image,
					   "classify": classify
				   });
  $.ajax({type: "POST",
	url: "/wrong",
	contentType: false,
	processData: false,
	data: data,
	contentType: "application/json; charset=utf-8",
	success:function(){

	}})
  });
})
setInterval(function(){
$("#snapshots").empty()
},240000);