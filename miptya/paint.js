window.onload = onLoad;

var defaultColors = [
	{ red: 255, green: 255, blue: 255, 	angle: 0 },
	{ red: 255, green: 0, 	blue: 0, 	angle: Math.PI / 2 },
	{ red: 0, 	green: 0, 	blue: 0, 	angle: Math.PI },
	{ red: 0, 	green: 0, 	blue: 255, 	angle: 3 * Math.PI / 2 }
];

var colors = [];

function onLoad() {

	colors = JSON.parse(localStorage.getItem("aColors"));
	if(!colors)
		colors = defaultColors;
	
	colors.forEach(function(item){
		renderPoint(item.red, item.green, item.blue, item.angle);
	});
	
	fnDraw();
};

function reset(){
	var oCont = document.getElementById('points');
	while (oCont.firstChild) {
		oCont.removeChild(oCont.firstChild);
	}

	
	defaultColors.forEach(function(item){
		renderPoint(item.red, item.green, item.blue, item.angle);
	});	
	fnDraw();
};

function renderPoint(red, green, blue, angle) {
	var sPoint = "<input class='jscolor' value='' onchange='fnDraw()'/>"
		+ "<input class='slider' oninput='slider()' min='0' max='359' step='1' value='XXX' type='range' >"
		+ "<input class='slider' oninput='slider()' min='0' max='359' step='1' value='XXX' type='number' style='width:40px' />"
		+ "<button onclick='deletePoint()'>X</button>";
	var oCont = document.getElementById('points');
	var div = document.createElement('div');
	div.innerHTML = sPoint.replace(/XXX/g, Math.floor(angle*180/Math.PI));
	var colorPicker = $('.jscolor', div)[0]; 
	colorPicker.value = rgbToHex(red, green, blue);
	new jscolor(colorPicker);
	oCont.appendChild(div);	
};

function fnDraw() {
	//drawMultiRadiantCircle(150, 150, 120, colors);
	var aColors = [];
	var aDiv = document.getElementById('points').childNodes;
	for (var i = 0; i < aDiv.length; i++) {
		if(aDiv[i].nodeType === document.ELEMENT_NODE){			
			var hexColor = $('.jscolor', aDiv[i])[0].value;
			var color = hexToRgb(hexColor);
			color.angle = $('.slider', aDiv[i])[0].value/180*Math.PI;
			aColors.push(color);
		}
	};
	localStorage.setItem("aColors",JSON.stringify(aColors))
	drawByPixel(
		getNumValue("R"),
		getNumValue("R") - getNumValue("r"),
		aColors
	);
};

function onCanvas() {
	var evt = window.event;
    var rect = event.srcElement.getBoundingClientRect();
    var x = event.clientX - rect.left - rect.width/2;
    var y = event.clientY - rect.top - rect.height/2;
    console.log("x: " + x + ", y: " + y);
};

function deletePoint() {
	var evt = window.event;
	var cont = evt.srcElement.parentNode; 
	if (cont.parentNode.children.length > 1 ){
		cont.remove();
		fnDraw();		
	}
};

function addPoint() {
	var evt = window.event;
    var rect = event.srcElement.getBoundingClientRect();
    var x = event.clientX - rect.left - rect.width/2;
    var y = - event.clientY + rect.top + rect.height/2;

	renderPoint(
		Math.floor(256*Math.random()), 
		Math.floor(256*Math.random()), 
		Math.floor(256*Math.random()), 
		(Math.atan2(y, x) + 2*Math.PI) % (2*Math.PI)
	);
	fnDraw();
};

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}

function slider(){
	var val = window.event.srcElement.value;
	console.log(val);
	var arr = window.event.path[1].getElementsByClassName("slider");
	for (var i = 0; i < arr.length; i++) {
		arr[i].value = val;
	}
	fnDraw();
};

function getNumValue(id){
	var field = document.getElementById(id);
	if(!field) return 0;
	return parseFloat(field.value);
};

function drawByPixel(R, r, colors) {
	R = parseFloat(R);
	r = parseFloat(r);
	if ( R<=0 || r<=0 || r > R ) return;
	
	var cBlur = getNumValue("blur");
	
	var canvas = document.getElementById("canvas");
	var size = 2*(R + cBlur);
	canvas.width = canvas.height = size;
	var ctx = canvas.getContext("2d");
		
	colors = formatColors(colors);
	
	var imgData = ctx.createImageData(size, size);
	var i;
	for (i = 0; i < imgData.data.length; i += 4) {
		var x = i/4 % (size) - size/2;
		var y = size/2 - ( i/4 - x ) / size;
		var rad = Math.sqrt(x*x + y*y);
		var angle = (Math.atan2(y, x) + 2*Math.PI) % (2*Math.PI);
//		console.log("x: " + x + ", y: " + y + ", angle: " + angle*180/Math.PI);
		var pixel = getPixel(rad, angle, r, R, colors);
		imgData.data[i+0] = pixel.red;
	    imgData.data[i+1] = pixel.green;
	    imgData.data[i+2] = pixel.blue;
	    imgData.data[i+3] = pixel.alpha;
	};
	ctx.putImageData(imgData, 0, 0);
	
	function getPixel(rad, angle, r, R, colors){
		var pixel = {};
		pixel.alpha = getAlpha(rad, r, R);
		if (pixel.alpha > 0) {
			var color = getColor(angle, r, R, colors);
			for (var attrname in color)
				pixel[attrname] = color[attrname];			
		} else {
			pixel.red 	= 255;
			pixel.green = 255;
			pixel.blue 	= 255;
		}
		return pixel;
	};
	
	function getColor(angle, r, R, colors){
		var pixel = {
			red		: 255,
		    green	: 255,
		    blue	: 255
		};
		if (!colors || colors.length < 2) return;
		for (var i = 1; i < colors.length; i++) {
			if (colors[i].angle > angle){
				var colorFrom = colors[i-1];
				var colorTo = colors[i];
				break;
			}
		}
//		console.log("angle: " + angle*180/Math.PI + ", colorFrom: " +
//				colorFrom.angle*180/Math.PI + ", colorTo: " + colorTo.angle*180/Math.PI);
		function colorAverage(name, angle, from, to){
			return ((angle - from.angle)*to[name] + (to.angle - angle)*from[name]) / (to.angle - from.angle);
		};
		pixel.red 	= colorAverage("red", angle, colorFrom, colorTo);
		pixel.blue 	= colorAverage("blue", angle, colorFrom, colorTo);
		pixel.green = colorAverage("green", angle, colorFrom, colorTo);		 
		return pixel;
	};
	function getAlpha(rad, r, R){
		var del_r = rad - r;
		var del_R = R - rad;
		var delta = ( Math.abs(del_r) < Math.abs(del_R) ) ? del_r : del_R;
		if (delta < -cBlur) {
			return 0;
		} else if(delta > cBlur) {
			return 255;
		} else {
			return Math.floor( 255/2*(delta/cBlur + 1) );	
		}
	};
	//return imgData;
};

function formatColors(colors){
	var aColor = [].concat(colors);
	aColor.sort(function(a,b){
		return (a.angle > b.angle) ? 1 : -1;
	});
	aColor.forEach(function(color){
		color.angle += 2*Math.PI;
		color.angle %= 2*Math.PI; 
	});
	var first = cloneObject(aColor[0]);
	first.angle += 2*Math.PI;
	var last = cloneObject(aColor[aColor.length - 1]);
	last.angle -= 2*Math.PI;
	aColor.push(first);
	aColor.unshift(last);
	return aColor;
};


function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
 
    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key]);
    }
 
    return temp;
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
};
