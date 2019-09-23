

/* 
 * The MIT License
 *
 * Copyright 2019 Robert Pollai <pollairobert at gmail.com>, University of Szeged, Department of Technical Informatics.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var img_0 = new Image();
var img_1 = new Image();
var img_2 = new Image();
var img_3 = new Image();
var img_4 = new Image();
var img_5 = new Image();
var img_6 = new Image();
var img_7 = new Image();
var img_8 = new Image();
var img_9 = new Image();
var img_k = new Image();
var img_v = new Image();
var img_dot = new Image();
img_0.src = host+"/number0.svg";
img_1.src = host+"/number1.svg";
img_2.src = host+"/number2.svg";
img_3.src = host+"/number3.svg";
img_4.src = host+"/number4.svg";
img_5.src = host+"/number5.svg";
img_6.src = host+"/number6.svg";
img_7.src = host+"/number7.svg";
img_8.src = host+"/number8.svg";
img_9.src = host+"/number9.svg";
img_k.src = host+"/char_k.svg";
img_v.src = host+"/char_v.svg";
img_dot.src = host+"/char_dot.svg";
var translateX = 500;
var translateY = 300;
//var img = new Image();
function loadCanvas(){		
    //var canvas = document.getElementById('drawCircuit');
    console.log(circuitResults);
    cloneCanvas = canvas;
    cloneContext = ctx;
    var coordinateArray = circuitResults.falstadTXT;
    //console.log("Melyik nagyobb: "+wichBiger(-21,0));
    ctx.translate(translateX, translateY);
    trackTransforms(ctx);
    function redraw(){
        // Clear the entire canvas
        //var p1 = ctx.transformedPoint(0,0);
        //var p2 = ctx.transformedPoint(canvas.width,canvas.height);
        //var p2 = ctx.transformedPoint(canvas.width,canvas.height);
        //ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

        // Alternatively:
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();

        
        
        
        var directionType;
        for(var i = 0; i < coordinateArray.length; i++){
            var branchCoordinates = coordinateArray[i].split(" ");
            //for (var j = 0; j < branchCoordinates.length; j++){
                //console.log("branchCoordinates: "+branchCoordinates);
                directionType = setDirectionTypeToCircuitElementInCanvas(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4]);
                //console.log(branchCoordinates[0]+" directionType: "+ directionType);
                if (branchCoordinates[0] === "v"){
                    var arcX;
                    var arcY;
                    var startValueX;
                    var startValueY;
                    var arrowX;
                    var arrowY;
                    var voltage = +branchCoordinates[8];
                    if (directionType === "0"){
                        arcY = (meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]));
                        arcX = branchCoordinates[1];
                        startValueY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -8);
                        startValueX = +branchCoordinates[1] +11;
                        arrowY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -10);
                        arrowX = +branchCoordinates[1] -14;
                    }
                    if (directionType === "1"){
                        arcX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]));
                        arcY = branchCoordinates[2];
                        startValueX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) -14);
                        startValueY = branchCoordinates[2] -21.5;
                        arrowX = +(meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) +10);
                        arrowY = +branchCoordinates[2] +14;
                    }
                    if (directionType === "2"){
                        arcY = (meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]));
                        arcX = branchCoordinates[1];
                        startValueY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -8);
                        startValueX = +branchCoordinates[1] +11;
                        arrowY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -10);
                        arrowX = +branchCoordinates[1] -14;
                    }
                    if (directionType === "3"){
                        arcX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]));
                        arcY = branchCoordinates[2];
                        startValueX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) -14);
                        startValueY = branchCoordinates[2] -21.5;
                        arrowX = +(meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) +10);
                        arrowY = +branchCoordinates[2] +14;
                    }
                    ctx.beginPath();
                    ctx.arc(arcX, arcY, 10, 0, 2*Math.PI,false);
                    ctx.lineWidth = 2;
                    ctx.fillStyle = 'transparent';
                    ctx.strokestyle = '#ff0000';
                    ctx.fill();
                    ctx.stroke();
                    drawValueOfElements(voltage,startValueX,startValueY,"V");
                    //console.log("arrowX: "+arrowX);
                    //console.log("arrowY: "+arrowY);
                    drawVoltageSourceDirection(directionType,arrowX,arrowY,voltage);
                    
                    
                }
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.moveTo(branchCoordinates[1],branchCoordinates[2]);
                ctx.lineTo(branchCoordinates[3],branchCoordinates[4]);
                ctx.strokestyle = '#ff0000';
                ctx.stroke();
                if (branchCoordinates[0] === "r"){
                    var startRectX;
                    var startRectY;
                    var startValueX;
                    var startValueY;
                    var dimension;
                    var kiloOhm = +branchCoordinates[6]/1000;
                    //console.log("branchCoordinates: "+branchCoordinates);

                    //console.log(kiloOhm.toString()[1]);
                    if (directionType === "0"){
                        startRectY = (meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) - 15);
                        startRectX = branchCoordinates[1] - 5;
                        dimension = [10,30];
                        startValueY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -5);
                        startValueX = +branchCoordinates[1] +6;
                        //console.log("meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]: "+meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]));
                        
                        //console.log("startValueX: "+startValueX);
                        //console.log("startValueY: "+startValueY);
                        }
                    if (directionType === "1"){
                        startRectX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) - 15);
                        startRectY = branchCoordinates[2] - 5;
                        dimension = [30,10];
                        startValueX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) -10);
                        startValueY = branchCoordinates[2] -16.5;
                    }
                    if (directionType === "2"){
                        startRectY = (meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) - 15);
                        startRectX = branchCoordinates[1] - 5;
                        dimension = [10,30];
                        startValueY = +(meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]) -5);
                        startValueX = +branchCoordinates[1] +6;
                        //console.log("meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]: "+meanOfCoordinates(branchCoordinates[2],branchCoordinates[4]));
                        
                        //console.log("startValueX: "+startValueX);
                        //console.log("startValueY: "+startValueY);
                    }
                    if (directionType === "3"){
                        startRectX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) - 15);
                        startRectY = branchCoordinates[2] - 5;
                        dimension = [30,10];
                        startValueX = (meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]) -10);
                        startValueY = branchCoordinates[2] -16.5;
                    }
                    ctx.beginPath();
                    ctx.rect(startRectX, startRectY, dimension[0], dimension[1]);
                    ctx.lineWidth = 2;
                    ctx.fillStyle = 'white';
                    ctx.strokestyle = '#ff0000';
                    ctx.fill();
                    ctx.stroke();
                    drawValueOfElements(kiloOhm,startValueX,startValueY,"r");
                }
                /**/
            //}
            //console.log(branchCoordinates);
        }
        
    }
    redraw();
    
    var lastX=canvas.width, lastY=canvas.height;
    var dragStart,dragged;
    canvas.addEventListener('mousedown',function(evt){
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = ctx.transformedPoint(lastX,lastY);
        

        dragged = false;
    },false);
    canvas.addEventListener('mousemove',function(evt){
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        //console.log("x: "+lastX);
        //console.log("y: "+lastY);
        dragged = true;
        if (dragStart){
            var pt = ctx.transformedPoint(lastX,lastY);
            ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
            redraw();
        }
    },false);
    canvas.addEventListener('mouseup',function(evt){
        dragStart = null;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
    },false);

    var scaleFactor = 1.01; //zoomolas lepteke
    var zoom = function(clicks){
        var pt = ctx.transformedPoint(lastX-translateX,lastY-translateY);  //a translate-el el kellett tolni, hogy jo helyen zoomoljon
        ctx.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,clicks);
        ctx.scale(factor,factor);
        ctx.translate(-pt.x,-pt.y);
        redraw();
    }

    var handleScroll = function(evt){
        var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    canvas.addEventListener('DOMMouseScroll',handleScroll,false);
    canvas.addEventListener('mousewheel',handleScroll,false);
};
//gkhead.src = 'http://phrogz.net/tmp/gkhead.jpg';
//ball.src   = 'http://phrogz.net/tmp/alphaball.png';

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function(){ return xform; };
    
    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(ctx,sx,sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(ctx,radians);
    };
    var translate = ctx.translate;
    ctx.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(ctx,dx,dy);
    };
    var transform = ctx.transform;
    ctx.transform = function(a,b,c,d,e,f){
        var m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(ctx,a,b,c,d,e,f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a,b,c,d,e,f){
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx,a,b,c,d,e,f);
    };
    var pt  = svg.createSVGPoint();
    ctx.transformedPoint = function(x,y){
        pt.x=x; pt.y=y;
        return pt.matrixTransform(xform.inverse());
    }
}

function clearCanvas() {  
    canvas.width = canvas.width;
    //cloneContext.clearRect(-600, -400, cloneCanvas.width, cloneCanvas.height);
}
function drawValueOfElements(value,startPosX,startPosY,elementType){
    var ohmToString = value.toString();
    var starting = 0;
    var offset = 6;
    if (elementType === "v"){
        starting = Number(startPosX);
    } else {
        starting = Number(startPosX);
    }
    //console.log("starting a for elott: "+ starting);
    for (var i = 0; i < ohmToString.length; i++){
        //console.log("starting: "+i+ ". korben: "+ starting);
        switch (ohmToString[i]){
            case "0":{
                ctx.drawImage(img_0, starting, startPosY);
                starting += offset;
                break;
            }
            case "1":{
                ctx.drawImage(img_1, starting, startPosY);
                starting += offset;
                break;
            }
            case "2":{
                ctx.drawImage(img_2, starting, startPosY);
                starting += offset;
                break;
            }
            case "3":{
                ctx.drawImage(img_3, starting, startPosY);
                starting += offset;
                break;
            }
            case "4":{
                ctx.drawImage(img_4, starting, startPosY);
                starting += offset;
                break;
            }
            case "5":{
                ctx.drawImage(img_5, starting, startPosY);
                starting += offset;
                break;
            }
            case "6":{
                ctx.drawImage(img_6, starting, startPosY);
                starting += offset;
                break;
            }
            case "7":{
                ctx.drawImage(img_7, starting, startPosY);
                starting += offset;
                break;
            }
            case "8":{
                ctx.drawImage(img_8, starting, startPosY);
                starting += offset;
                break;
            }
            case "9":{
                ctx.drawImage(img_9, starting, startPosY);
                starting += offset;
                break;
            }
            case ".":{
                ctx.drawImage(img_dot, starting, startPosY);
                starting += offset;
                break;
            }
        }
    }
    
    if (elementType === "V"){
        ctx.drawImage(img_v, starting+3, startPosY);
    } else {
        ctx.drawImage(img_k, starting, startPosY);
    }
    //console.log("ohmToString: "+ ohmToString);
}
function drawVoltageSourceDirection(branchDirectionType,startX, startY, value){
    //console.log("value: "+value);
    if(branchDirectionType === "0"){
        if (value < 0){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        }
    }
    if(branchDirectionType === "1"){
        if (value < 0){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        }
    }
    if(branchDirectionType === "2"){
        if (value > 0){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        }
    }
    if(branchDirectionType === "3"){
        if (value > 0){
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
            ctx.strokestyle = "#ff0000";
            ctx.stroke();
        }
    }
}