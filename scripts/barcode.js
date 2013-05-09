var barcode = {
	UPC_SET: {
        "3211": '0',
        "2221": '1',
        "2122": '2',
        "1411": '3',
        "1132": '4',
        "1231": '5',
        "1114": '6',
        "1312": '7',
        "1213": '8',
        "3112": '9'
    },
    number: '',
    callback: null,
    width: '',
    height: '',
    scan: function(canvas){
    	//check to see if image is an object
    	if (typeof canvas == "object"){
			//console.log('scanning for barcode');

			barcode.number = 'empty';
			barcode.width = canvas.width;
            barcode.height = canvas.height;

            //console.log(barcode.width);
            //console.log(barcode.height);

            ctx = canvas.getContext("2d"),
            spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
            numLines = spoints.length,
            slineStep = barcode.height / (numLines + 1),
            round = Math.round;

            while(numLines--){
            	//console.log(spoints[numLines]);
            	var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], barcode.width, 2).data,
                sum = [],
                min = 0,
                max = 0;
                //console.log(pxLine);

                for(var row = 0; row < 2; row++) {
	                for(var col = 0; col < barcode.width; col++){
	                    var i = ((row * barcode.width) + col) * 4,
	                        g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
	                        s = sum[col];
	                    pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
	                    sum[col] = g + (undefined == s ? 0 : s);
	                }
	            }
	            for(var i = 0; i < barcode.width; i++){
	                var s = sum[i] = sum[i] / 2;
	                if(s < min){ min = s; }
	                if(s > max){ max = s; }
	            }
            	var pivot = min + ((max - min) / 2),
                bmp = [];
	            for(var col = 0; col < barcode.width; col++){
	                var matches = 0;
	                for(var row = 0; row < 2; row++){
	                    if(pxLine[((row * barcode.width) + col) * 4] > pivot){ matches++; }
	                }
	                bmp.push(matches > 1);
	            }
	            var curr = bmp[0],
	                count = 1,
	                lines = [];
	            for(var col = 0; col < barcode.width; col++){
	                if(bmp[col] == curr){ count++; }
	                else{
	                    lines.push(count);
	                    count = 1;
	                    curr = bmp[col];
	                }
	            }
	            var code = '',
	                bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
	                u = barcode.UPC_SET;
	            for(var i = 1, l = lines.length; i < l; i++){
	                if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
	                else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
	                var digits = [
	                    round(group[0] / bar),
	                    round(group[1] / bar),
	                    round(group[2] / bar),
	                    round(group[3] / bar)
	                ];
	                code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
	                
	                console.log(code);

	                if(12 == code.length){ 
	                	//console.log(code); 
	                	break; 
	                }
	            }
	            if(-1 == code.indexOf('X') && code.length > 3){ 
	            	//return code || false; 
	            	barcode.number = code;
	            }

        	}
			
		} else {
			barcode.number = 'error: canvas not an object';
		}   

		if (barcode.callback!=null) {
			barcode.callback(barcode.number);
		} 	
    }

}