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

 /**
  * Ennek a forrasnak a skeletonja innen szarmazik: http://phrogz.net/tmp/canvas_zoom_to_cursor.html,
  * Szerzo: Gavin Kistner.
  * Ez felelos a zoom es a mozgatasert, valamint hogy SVG-ben jelenik meg a canvasban.
  */
var img_0 = new Image(); img_0.src = host+"/number0.svg";
var img_1 = new Image(); img_1.src = host+"/number1.svg";
var img_2 = new Image(); img_2.src = host+"/number2.svg";
var img_3 = new Image(); img_3.src = host+"/number3.svg";
var img_4 = new Image(); img_4.src = host+"/number4.svg";
var img_5 = new Image(); img_5.src = host+"/number5.svg";
var img_6 = new Image(); img_6.src = host+"/number6.svg";
var img_7 = new Image(); img_7.src = host+"/number7.svg";
var img_8 = new Image(); img_8.src = host+"/number8.svg";
var img_9 = new Image(); img_9.src = host+"/number9.svg";
var img_k = new Image(); img_k.src = host+"/char_k.svg";
var img_v = new Image(); img_v.src = host+"/char_v.svg";
var img_dot = new Image(); img_dot.src = host+"/char_dot.svg";
var img_a = new Image(); img_a.src = host+"/char_a.svg";
var img_b = new Image(); img_b.src = host+"/char_b.svg";
var img_vmeter = new Image(); img_vmeter.src = host+"/voltmeter.svg";
var svgObject = {
    "0" : img_0,
    "1" : img_1,
    "2" : img_2,
    "3" : img_3,
    "4" : img_4,
    "5" : img_5,
    "6" : img_6,
    "7" : img_7,
    "8" : img_8,
    "9" : img_9,
    "k" : img_k,
    "v" : img_v,
    "." : img_dot,
    "a" : img_a,
    "b" : img_b
}
//var translateX = 500;
//var translateY = 300;
var arcX;
var arcY;
var startValueXofVoltageSource;
var startValueYofVoltageSource;
var startValueXofResistor;
var startValueYofResistor;
var arrowX;
var arrowY;
var startRectX;
var startRectY;
var dimensionOfRect = [];
var negativX = Infinity;
var negativY = Infinity;
var positiveX = -Infinity;
var positiveY = -Infinity;
//var translateOffset;
//var task8Th2poleBranchCoordinates = [];
//var img = new Image();
function loadCanvas(){	
    var coordinateArray = circuitResults.falstadTXT;
    var translateOffset;
    var task8Th2poleBranchCoordinates = [];
    var translateX = 600;
    var translateY = 500;
    negativX = Infinity;
    negativY = Infinity;
    positiveX = -Infinity;
    positiveY = -Infinity;
    cloneCanvas = canvas;
    cloneContext = ctx;
    //console.log("Melyik nagyobb: "+wichBiger(-21,0));
    findDrawingCircuitPositivAndNegativCorners(coordinateArray);
    translateOffset = [(negativX + positiveX)/2,(negativY + positiveY)/2];
    translateX -= translateOffset[0];
    translateY -= translateOffset[1];
    console.log("negativX: "+negativX);
    console.log("negativY: "+negativY);
    console.log("positiveX: "+positiveX);
    console.log("positiveY: "+positiveY);
    console.log("translateOffset: "+translateOffset);
    console.log("translateX: "+translateX);
    console.log("translateY: "+translateY);
    
    ctx.translate(translateX, translateY);
    
    trackTransforms(ctx);
    /*if ((negativX + translateX) < 0 || (negativY + translateY) < 0){
        ctx.scale(0.3,0.3);
    } else
    if ((negativX + translateX) > translateX / 2 || (negativY + translateY) > translateY / 2){
        ctx.scale(3,3);
    }*/
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
        //ctx.drawImage(svgObject["5"], 0, 0);
        
        var directionType;
        
        //if (negativ )
        //ctx.scale(2,2);
        
        for(var i = 0; i < coordinateArray.length; i++){
            var branchCoordinates = coordinateArray[i].split(" ");
            //console.log("branchCoordinates: "+branchCoordinates)
            directionType = setDirectionTypeToCircuitElementInCanvas(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4]);
            //console.log(branchCoordinates[0]+" directionType: "+ directionType);
            if (branchCoordinates[0] !== "p"){
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.moveTo(branchCoordinates[1],branchCoordinates[2]);
                ctx.lineTo(branchCoordinates[3],branchCoordinates[4]);
                ctx.stroke();
            }
            if (branchCoordinates[0] === "v"){
                var voltage = +branchCoordinates[8];
                setStartingPositionsToElementsDrawing(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4],directionType);
                ctx.beginPath();
                ctx.arc(arcX, arcY, 10, 0, 2*Math.PI,false);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.fillStyle = 'transparent';
                ctx.fill();
                ctx.stroke();
                drawValueOfElements(voltage,startValueXofVoltageSource,startValueYofVoltageSource,"V");
                drawVoltageSourceDirection(directionType,arrowX,arrowY,voltage);
            }
            
            if (branchCoordinates[0] === "r"){
                var kiloOhm = +branchCoordinates[6]/1000;
                setStartingPositionsToElementsDrawing(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4],directionType);
                
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
                ctx.rect(startRectX, startRectY, dimensionOfRect[0], dimensionOfRect[1]);
                ctx.lineWidth = 2;
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.stroke();
                drawValueOfElements(kiloOhm,startValueXofResistor,startValueYofResistor,"r");
            }
            if (branchCoordinates[0] === "p"){
                if (+select <6 || +select === 8){
                    //console.log("branchCoordinates: "+ branchCoordinates);
                    draw2Pole(branchCoordinates,directionType);
                    if (+select === 8){
                        task8Th2poleBranchCoordinates = branchCoordinates;
                    }
                    //alert("kisebb mint 6");
                }
                if (+select === 6){
                    var kiloOhm = circuitResults.resValue/1000;
                    //console.log("kiloOhm: "+ kiloOhm);
                    ctx.beginPath();
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.moveTo(branchCoordinates[1],branchCoordinates[2]);
                    ctx.lineTo(branchCoordinates[3],branchCoordinates[4]);
                    ctx.stroke();

                    setStartingPositionsToElementsDrawing(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4],directionType);
                    ctx.beginPath();
                    ctx.strokeStyle = '#ff0000';
                    ctx.rect(startRectX, startRectY, dimensionOfRect[0], dimensionOfRect[1]);
                    ctx.lineWidth = 2;
                    ctx.fillStyle = '#ff0000';
                    ctx.fill();
                    ctx.stroke();
                    drawValueOfElements(kiloOhm,startValueXofResistor,startValueYofResistor,"r");
                }
                if (+select === 7){
                    ctx.beginPath();
                    ctx.strokeStyle = '#16600b';
                    ctx.lineWidth = 2;
                    ctx.moveTo(branchCoordinates[1],branchCoordinates[2]);
                    ctx.lineTo(branchCoordinates[3],branchCoordinates[4]);
                    ctx.stroke();
                    draw2Pole(branchCoordinates,directionType);
                    var centerOfbranch = [meanOfCoordinates(branchCoordinates[1],branchCoordinates[3]),meanOfCoordinates(branchCoordinates[2],branchCoordinates[4])];
                    //console.log("branchCoordinates: "+ branchCoordinates);
                    //console.log("centerOfbranch: "+ centerOfbranch);
                    ctx.drawImage(img_vmeter, centerOfbranch[0] - 20, centerOfbranch[1] - 20);
                    
                }
            }
            
        }
        /*console.log("negativX: "+negativX);
        console.log("negativY: "+negativY);
        console.log("positiveX: "+positiveX);
        console.log("positiveY: "+positiveY);*/
        if (+select === 8){
            //task8Th2poleBranchCoordinates = branchCoordinates;
            //var offsetX1 = 
            //var offsetY1 = 
            //var offsetX2 = 
            //var offsetY2 = 
            ctx.beginPath();
            //console.log("task8Th2poleBranchCoordinates: "+ task8Th2poleBranchCoordinates);
            ctx.arc(task8Th2poleBranchCoordinates[1], task8Th2poleBranchCoordinates[2], 3, 0, 2*Math.PI,false);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(task8Th2poleBranchCoordinates[3], task8Th2poleBranchCoordinates[4], 3, 0, 2*Math.PI,false);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(negativX, negativY, 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(positiveX, positiveY, 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(translateOffset[0], translateOffset[1], 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();
        
    }
    ctx.scale(1,1);
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

    var scaleFactor = 1.005; //zoomolas lepteke
    var zoom = function(clicks){
        //ctx.scale(2,2);
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

function findDrawingCircuitPositivAndNegativCorners(coordinates){
    for(var i = 0; i < coordinates.length; i++){
        var branchCoordinates = coordinates[i].split(" ");
        //console.log("branchCoordinates: "+branchCoordinates)
        if (+branchCoordinates[1] < negativX){
            negativX = +branchCoordinates[1];
        } 
        if (+branchCoordinates[3] < negativX){
            negativX = +branchCoordinates[3];
        }
        if (+branchCoordinates[2] < negativY){
            negativY = +branchCoordinates[2];
        }
        if (+branchCoordinates[4] < negativY){
            negativY = +branchCoordinates[4];
        } 
        if (+branchCoordinates[1] > positiveX){
            positiveX = +branchCoordinates[1];
        }
        if (+branchCoordinates[3] > positiveX){
            positiveX = +branchCoordinates[3];
        }
        if (+branchCoordinates[2] > positiveY){
            positiveY = +branchCoordinates[2];
        }
        if (+branchCoordinates[4] > positiveY){
            positiveY = +branchCoordinates[4];
        }
    }
}
function draw2Pole(coordinates,direction){
    
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.moveTo(coordinates[1],coordinates[2]);
    ctx.lineTo(+coordinates[1] + (direction === "1" ? 7 : (direction === "3") ? -7 : 0),
               +coordinates[2] + (direction === "0" ? -7 : (direction === "2") ? 7 : 0));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "transparent";
    ctx.fillStyle="#ff0000";
    ctx.arc(+coordinates[1] + (direction === "1" ? 7 : (direction === "3") ? -7 : 0),
            +coordinates[2] + (direction === "0" ? -7 : (direction === "2") ? 7 : 0), 
            3, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(img_a, +coordinates[1] + (direction === "1" ? 7 : (direction === "3") ? -7 : 0) + ((direction === "0") ? -10 : (direction === "1") ? 4 : (direction === "3") ? -24 : -10),
                         +coordinates[2] + (direction === "0" ? -7 : (direction === "2") ? 7 : 0) + ((direction === "0") ? -24 : (direction === "1") ? -10 :(direction === "3") ? -10: 4));
    

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.moveTo(coordinates[3],coordinates[4]);
    ctx.lineTo(+coordinates[3] + (direction === "1" ? -7 : (direction === "3") ? 7 : 0),
               +coordinates[4] + (direction === "0" ? 7 : (direction === "2") ? -7 : 0));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "transparent";
    ctx.fillStyle="#ff0000";
    ctx.arc(+coordinates[3] + (direction === "1" ? -7 : (direction === "3") ? 7 : 0),
            +coordinates[4] + (direction === "0" ? 7 : (direction === "2") ? -7 : 0), 
            3, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();  
    
    ctx.drawImage(img_b, +coordinates[3] + (direction === "1" ? -7 : (direction === "3") ? 7 : 0)  + ((direction === "0") ? -10 : (direction === "1") ? -24 : (direction === "3") ? 4 : -10),
                         +coordinates[4] + (direction === "0" ? 7 : (direction === "2") ? -7 : 0) + ((direction === "0") ? 4 : (direction === "1") ? -10 : (direction === "3") ? -10 :-24));

    
}
function setStartingPositionsToElementsDrawing(startPosX,startPosY,endPosX,endPosY,direction){
    /*console.log("---------setStarting Metodus kapta: ---------");
    console.log("startPosX: "+startPosX);
    console.log("startPosY: "+startPosY);
    console.log("endPosX: "+endPosX);
    console.log("endPosY: "+endPosY);
    console.log("direction: "+direction);
     console.log("------------------------");*/
    if (direction === "0" || direction === "2"){
        offsetsToValue = [11,-8];
        offsetsToArrow = [-14,-10];
        offsetsToRectOfResistor = [-5,-15];
        offsetsToValueOfResistor = [6,-5];
        arcX = +startPosX;
        arcY = +(meanOfCoordinates(startPosY,endPosY));
        startValueXofVoltageSource = +startPosX + 11;
        startValueYofVoltageSource = +(meanOfCoordinates(startPosY,endPosY) -8);
        arrowX = +startPosX - 14;
        arrowY = +(meanOfCoordinates(startPosY,endPosY) -10);

        startRectX = +startPosX - 5;
        startRectY = +(meanOfCoordinates(startPosY,endPosY) - 15);
        dimensionOfRect = [10,30];
        startValueXofResistor = +startPosX +6;
        startValueYofResistor = +(meanOfCoordinates(startPosY,endPosY) -5);
    }
    if (direction === "1" || direction === "3"){
        offsetsToValue = [-14,-21.5];
        offsetsToArrow = [10,14];
        arcX = +(meanOfCoordinates(startPosX,endPosX));
        arcY = +startPosY;
        startValueXofVoltageSource = +(meanOfCoordinates(startPosX,endPosX) - 11);
        startValueYofVoltageSource = +startPosY - 21.5;
        arrowX = +(meanOfCoordinates(startPosX,endPosX) + 10);
        arrowY = +startPosY + 14;

        startRectX = +(meanOfCoordinates(startPosX,endPosX) - 15);
        startRectY = +startPosY - 5;
        dimensionOfRect = [30,10];
        startValueXofResistor = +(meanOfCoordinates(startPosX,endPosX) -10);
        startValueYofResistor = +startPosY -16.5;
    }
    /*console.log("---------setStarting Metodus kimenetei: ---------");
    console.log("arcX: "+arcX);
    console.log("arcY: "+arcY);
    console.log("startValueXofVoltageSource: "+startValueXofVoltageSource);
    console.log("startValueYofVoltageSource: "+startValueYofVoltageSource);
    console.log("arrowX: "+arrowX);
    console.log("arrowY: "+arrowY);
    console.log("------------------------");*/
    
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
        //console.log(typeof(ohmToString[i]));
        //console.log(ohmToString[i]);
        if (ohmToString[i] !== "-"){
            ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
            starting += offset;
        }
        
        /*switch (ohmToString[i]){
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
            case "a":{
                ctx.drawImage(img_at, starting, startPosY);
                starting += offset;
                break;
            }
            case "b":{
                ctx.drawImage(img_b, starting, startPosY);
                starting += offset;
                break;
            }
        }*/
    }
    
    if (elementType === "V"){
        ctx.drawImage(img_v, starting, startPosY);
    } else {
        ctx.drawImage(img_k, starting, startPosY);
    }
    //console.log("ohmToString: "+ ohmToString);
}
function drawVoltageSourceDirection(branchDirectionType,startX, startY, value){
    //console.log("value: "+value);
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1;
    if(branchDirectionType === "0"){
        if (value < 0){
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            //ctx.strokestyle = "#0f8500";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        } else {
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
           // ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        }
    }
    if(branchDirectionType === "1"){
        if (value < 0){
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        } else {
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            //ctx.strokestyle = "#ff0000";
           // ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        }
    }
    if(branchDirectionType === "2"){
        if (value > 0){
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        } else {
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        }
    }
    if(branchDirectionType === "3"){
        if (value > 0){
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        } else {
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.lineWidth = 1;
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
            //ctx.strokestyle = "#ff0000";
            //ctx.stroke();
        }
    }
    ctx.stroke();
    ctx.closePath();
}