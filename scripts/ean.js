// Wrap the whole thing in a self-contained object...
var ean = {
	video: '',
	canvas: '',
	ctx: '',
	out: '',
	timer: '',
	found: false,
	captured: '',
	number: '',
	settings: {
		loop: true
	},
	init: function(){
		//console.log('initialized ean object');

		// get reference to elements
		ean.video = document.getElementById('sourcevid');
		ean.out = document.getElementById('out');
		ean.captured = document.getElementById('captured');

		// Standard and prefixed methods for hooking into stream
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			//console.log('getUserMedia support, yeah!');
			navigator.getUserMedia({video: true}, function(stream) {
				ean.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;

				ean.video.addEventListener('loadedmetadata', function(){
					ean.video.play();
					ean.canvasInit();
				}, false);
			});
		} else {
			//console.log('no getUserMedia support, meh...');
			return;
		}

		barcode.callback = function(n) { 
			ean.number = n;
		}

	},
	canvasInit: function(){
		//console.log('canvas initialized');
		ean.canvas = document.createElement('canvas');
		ean.canvas.width = ean.video.videoWidth;
		ean.canvas.height = ean.video.videoHeight;
		ean.ctx = ean.canvas.getContext('2d');
		ean.timer = setTimeout(ean.loop,250);
	}, 
	loop: function(){
		ean.captureToCanvas();
		if (ean.number == 'empty') {
			ean.out.innerHTML = 'scanning for EAN-code ...';
			ean.timer = setTimeout(ean.loop,250);
		} else {
			//console.log('EAN found');
			ean.out.innerHTML = ean.number;

			if (ean.timer) { 
				if (ean.settings.loop){
					setTimeout(ean.loop,5000)
				} else {
					clearTimeout(ean.timer); 
					ean.video.pause();
				}
			}
		}
	},
	captureToCanvas: function() {
		//console.log('captureing image to canvas');
		ean.ctx.drawImage(ean.video, 0, 0, ean.video.videoWidth, ean.video.videoHeight, 0, 0, ean.canvas.width, ean.canvas.height);
		//qrcode.decode(ean.canvas.toDataURL());
		
		var newImage = document.createElement("img")
		newImage.src = ean.canvas.toDataURL();
		barcode.scan(ean.canvas);
		//ean.captured.appendChild(newImage);
	}
};

window.addEventListener('load',ean.init,true);