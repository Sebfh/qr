// Wrap the whole thing in a self-contained object...

var qry = {
	video:'',
	container:'',
	canvas:'',
	ctx:'',
	out:'',
	found:false,
	timer:'',

	loop: function() {
		qry.captureToCanvas();
		if (!qry.found) {
			qry.out.className = '';
			qry.out.innerHTML = 'scanning for QR-code ...';
			qry.timer = setTimeout(qry.loop,250);
		} else {
			if (qry.timer) { clearTimeout(qry.timer); }
			// only make it a clickable link if it smells like a url
			var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			if (regexp.test(qry.found)) {
				qry.out.innerHTML = '<a href="'+qry.found+'">'+qry.found+'</a>';
			} else {
				qry.out.innerHTML = qry.found;
			}

			var snd = new Audio("/sound/beep.wav"); // buffers automatically when created
			snd.play();

			/* canvas.style.width = video.clientWidth+'px'; // doesn't work with current nesting used */
			qry.canvas.style.height = qry.video.clientHeight+'px'; 
			qry.container.removeChild(qry.video);
			qry.container.appendChild(qry.canvas);
		}
	},

	captureToCanvas: function() {
		qry.ctx.drawImage(qry.video, 0, 0, qry.video.videoWidth, qry.video.videoHeight, 0, 0, qry.canvas.width, qry.canvas.height);
		qrcode.decode(qry.canvas.toDataURL());
	},

	canvasInit: function() {
		qry.canvas = document.createElement('canvas');
		qry.canvas.width = qry.video.videoWidth;
		qry.canvas.height = qry.video.videoHeight;
		qry.ctx = qry.canvas.getContext('2d');
		qry.timer = setTimeout(qry.loop,250);
	},

	init: function() {
		qry.video = document.getElementById('sourcevid');
		qry.container = qry.video.parentNode;
		qry.out = document.getElementById('out');

		// Standard and prefixed methods for hooking into stream
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		if (navigator.getUserMedia) {
			function errorCallback(error) {
				qry.out.innerHTML = 'an error occurred';
				return;
			}

			navigator.getUserMedia({video: true}, function(stream) {
				// Replace the source of the video element with the stream from the camera
				if (qry.video.mozCaptureStream) { // Needed to check for Firefox
					qry.video.mozSrcObject = stream;
				} else {
					qry.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
				}
				qry.video.addEventListener('loadedmetadata', function(){
					qry.video.play();
					qry.canvasInit();
				}, false);
			}, errorCallback);
		} else {
			qry.out.innerHTML = 'no <code>getUserMedia</code> support';
			return;
		}
		
		qrcode.callback = function(a) { qry.found=a; }
	}
};

window.addEventListener('load',qry.init,true);