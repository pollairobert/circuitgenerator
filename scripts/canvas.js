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
  * Ez felelos a zoomert es a mozgatasert, valamint hogy SVG-ben jelenik meg a canvasban a tartalom.
  */

  /**
   * Betolti a halozat kirajzolasat megjelnito feluletet.
   */
function loadCanvas(){	
    
    /**
     * Ebben a reszben van beallitva, hogy a generalt halozat a kanvas kozepere keruljon.
     * A kiszamolt ket ellentetes sarokpont segitsegevel.
     */
    var coordinateArray = circuitResults.falstadTXT;
    translateX = 600;
    translateY = 500;
    negativX = Infinity;
    negativY = Infinity;
    positiveX = -Infinity;
    positiveY = -Infinity;
    findDrawingCircuitPositivAndNegativCorners(coordinateArray);
    translateOffset = [(negativX + positiveX)/2,(negativY + positiveY)/2];
    translateX -= translateOffset[0];
    translateY -= translateOffset[1];
    
    ctx.translate(translateX, translateY);
    trackTransforms(ctx);
    
    /**
     * A halozat megrajzolasat vegzo fuggveny.
     */
    function redraw(){
        
        // Alternatively:
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();
        var directionType;
        
        /**
         * Ebben a ciklusban tortenik a halozat komponenseinek kirajzolasa a canvasra feladattipusokkent kicsit elteroen.
         */
        for(var i = 0; i < coordinateArray.length; i++){
            var branchCoordinates = coordinateArray[i].split(" ");
            directionType = setDirectionTypeToCircuitElementInCanvas(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4]);
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
                var number = +branchCoordinates[12]
                setStartingPositionsToElementsDrawing(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4],directionType);
                ctx.beginPath();
                ctx.arc(arcX, arcY, 10, 0, 2*Math.PI,false);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.fillStyle = 'transparent';
                ctx.fill();
                ctx.stroke();
                if (+select === 10){
                    drawValueOfElements(number,startValueXofVoltageSource,startValueYofVoltageSource,"V");
                } else {
                    drawValueOfElements(voltage,startValueXofVoltageSource,startValueYofVoltageSource,"V");
                    drawVoltageSourceDirection(directionType,arrowX,arrowY,(+select === 9 ? Math.abs(voltage): voltage));
                }
                
            }
            if (branchCoordinates[0] === "r"){
                var kiloOhm = +branchCoordinates[6]/1000;
                var number = +branchCoordinates[7]
                setStartingPositionsToElementsDrawing(branchCoordinates[1],branchCoordinates[2],branchCoordinates[3],branchCoordinates[4],directionType);
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
                ctx.rect(startRectX, startRectY, dimensionOfRect[0], dimensionOfRect[1]);
                ctx.lineWidth = 2;
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.stroke();
                if (+select === 9 || +select === 10){
                    drawValueOfElements(number,startValueXofResistor,startValueYofResistor,"r");
                } else {
                    drawValueOfElements(kiloOhm,startValueXofResistor,startValueYofResistor,"r");
                }
            }
            if (branchCoordinates[0] === "p"){
                if (+select <6 || +select === 8 || +select === 9 || +select === 10){
                    draw2Pole(branchCoordinates,directionType);
                    if (+select === 8){
                        drawConnectedVoltageSource();
                    }
                }
                if (+select === 6){
                    var kiloOhm = circuitResults.resValue/1000;
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
                    ctx.drawImage(img_vmeter, centerOfbranch[0] - 20, centerOfbranch[1] - 20);
                }
            }
        }
        /*
        //Az aramkori rajz bal felso sarka
        //-x -y
        ctx.beginPath();
        ctx.arc(negativX, negativY, 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();
        
        //Az aramkori rajz jobb also sarka
        //+x +y
        ctx.beginPath();
        ctx.arc(positiveX, positiveY, 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();

        //Aramkori rajz kozeppontja
        ctx.beginPath();
        ctx.arc(translateOffset[0], translateOffset[1], 3, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.stroke();

        //0,0 koordinata megjelolese
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 2*Math.PI,false);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#4df50a';
        ctx.fill();
        ctx.stroke();
        */
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

    var scaleFactor = 1.005; //zoomolas lepteke
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
}
/**
 * A "feszultseggenerator hozzadasa" tipusu feladathoz rajzolja ki a kapcsolodo halozatreszt,
 * ami a generatort es az ellenallasat reprezentalja
 */
function drawConnectedVoltageSource(){
    var xCoordToConnected = +negativX - 50;
    var y1CoordToConnected = +translateOffset[1] - 50;
    var y2CoordToConnected = +translateOffset[1] + 50;
    ctx.beginPath();
    ctx.arc(xCoordToConnected, y1CoordToConnected, 3, 0, 2*Math.PI,false);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.moveTo(xCoordToConnected, y1CoordToConnected);
    ctx.lineTo(xCoordToConnected - 50, y1CoordToConnected);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xCoordToConnected, y2CoordToConnected, 3, 0, 2*Math.PI,false);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.moveTo(xCoordToConnected, y2CoordToConnected);
    ctx.lineTo(xCoordToConnected - 50, y2CoordToConnected);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.moveTo(xCoordToConnected - 50, y2CoordToConnected);
    ctx.lineTo(xCoordToConnected - 50, y2CoordToConnected - 50);
    ctx.stroke();

    var voltage = -circuitResults.connVSVolt;
    setStartingPositionsToElementsDrawing(xCoordToConnected - 50,y2CoordToConnected,xCoordToConnected - 50,y2CoordToConnected - 50,"0");
    ctx.beginPath();
    ctx.arc(arcX, arcY, 10, 0, 2*Math.PI,false);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'transparent';
    ctx.fill();
    ctx.stroke();
    drawValueOfElements(voltage,startValueXofVoltageSource,startValueYofVoltageSource,"V");
    drawVoltageSourceDirection("0",arrowX,arrowY,voltage);

    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.moveTo(xCoordToConnected - 50, y2CoordToConnected - 50);
    ctx.lineTo(xCoordToConnected - 50, y2CoordToConnected - 100);
    ctx.stroke();
    
    setStartingPositionsToElementsDrawing(xCoordToConnected - 50,y2CoordToConnected - 50,xCoordToConnected - 50,y2CoordToConnected - 100,"0");
    var kiloOhm = circuitResults.connVSRes / 1000;
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.rect(startRectX, startRectY, dimensionOfRect[0], dimensionOfRect[1]);
    ctx.lineWidth = 2;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    drawValueOfElements(kiloOhm,startValueXofResistor,startValueYofResistor,"r");

    ctx.drawImage(img_a, xCoordToConnected+6, y2CoordToConnected-10);
    ctx.drawImage(img_b, xCoordToConnected+6, y1CoordToConnected-10);
    
}
/**
 * A koordinatak alapjan megkeresi a halozat bal felso, illetve jobb also sarkanak koordinatajat,
 * es beallitja a hozzajuk tartozo valtozokat.
 * @param {*} coordinates a halozat elemeinek koordianatajat tarolo tomb
 */
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

/**
 * Megrajzolja a keresett 2 polust a halozatban.
 * @param {*} coordinates a 2 polust tartalmazo ag koordinatai
 * @param {*} direction es annak iranyitottsaga
 */
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

/**
 * Beallitja a kulonbozo elemek megrajzolasahoz szukseges koordinata valtozok ertekeit az oket tartalmazo ag koordianati alapjan.
 * Valamint a generator iranyt jelzo nyil kezdo poziciojat.
 * @param {*} startPosX Az elemet
 * @param {*} startPosY tartalmazo
 * @param {*} endPosX ag
 * @param {*} endPosY koordinatai
 * @param {*} direction es annak iranya
 */
function setStartingPositionsToElementsDrawing(startPosX,startPosY,endPosX,endPosY,direction){
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
}

/**
 * A halozati elemek ertekeit megjelenito fuggveny, feladattipustol fuggoen.
 * A kapott parameterek segitsegevel.
 * @param {*} value elem erteke
 * @param {*} startPosX az ertek kiierasanak inudlo
 * @param {*} startPosY koordinatai
 * @param {*} elementType az alam tipusa (generator, ellenallas)
 */
function drawValueOfElements(value,startPosX,startPosY,elementType){
    var ohmToString = value.toString();
    var starting = 0;
    var offset = 6;
    
    if (elementType === "V"){
        starting = Number(startPosX);
    } else {
        starting = Number(startPosX);
    }
    if (+select !== 9 && +select !== 10){
        for (var i = 0; i < ohmToString.length; i++){
            if (ohmToString[i] !== "-"){
                ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
                starting += offset;
            }
        }
    } else {
        if (+select === 9) {
            if (elementType === "r"){
                ctx.drawImage(img_r, starting, startPosY);
                starting += 10;
                for (var i = 0; i < ohmToString.length; i++){
                    ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
                    starting += offset;
                }
            }
            if (elementType === "V"){
                for (var i = 0; i < ohmToString.length; i++){
                    if (ohmToString[i] !== "-"){
                        ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
                        starting += offset;
                    }
                }
            }
        }
        if (+select === 10){
            if (elementType === "r"){
                ctx.drawImage(img_r, starting, startPosY);
                starting += 10;
                for (var i = 0; i < ohmToString.length; i++){
                    ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
                    starting += offset;
                    
                }
            }
            if (elementType === "V"){
                ctx.drawImage(img_u, starting, startPosY);
                starting += 10;
                for (var i = 0; i < ohmToString.length; i++){
                    if (ohmToString[i] !== "-"){
                        ctx.drawImage(svgObject[ohmToString[i]], starting, startPosY);
                        starting += offset;
                    }
                }
            }
        }
        
    }
    if (elementType === "V" && +select < 10){
        ctx.drawImage(img_v, starting, startPosY);
    } else if (+select < 9 && elementType !== "V"){
        ctx.drawImage(img_k, starting, startPosY);
    }
}

/**
 * Meghatarozza, hogy az a kirajzolando ag milyen iranyu es ezzel ter vissza: 
 * 0: fel,
 * 1: jobbra,
 * 2: le,
 * 3: balra
 * @param {*} startX Ag objektum kezdo
 * @param {*} startY es
 * @param {*} endX  veg
 * @param {*} endY  koordinatai.
 */
function setDirectionTypeToCircuitElementInCanvas(startX,startY,endX,endY){
    if(startX === endX){
        if (wichBiger(startY,endY) === startY) {
            return "0"
        } else {
            return "2";
        }
    } else {
        if (wichBiger(startX,endX) === startX) {
            return "3";
        } else {
            return "1";
        }
    }
}

/**
 * A fesz.generatoron eso feszultseg iranyat megjelolo nyil kirajzolasaert felel.
 * @param {*} branchDirectionType Az ag iranyanak tipusa, ami a generatort tartalmazza
 * @param {*} startX A generator iranyat jelolo nyil
 * @param {*} startY kezdo koordinatai
 * @param {*} value a generator fesz. erteke.
 */
function drawVoltageSourceDirection(branchDirectionType,startX, startY, value){
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1;
    if(branchDirectionType === "0"){
        if (value <= 0){
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
        } else {
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
        }
    }
    if(branchDirectionType === "1"){
        if (value <= 0){
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
        } else {
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
        }
    }
    if(branchDirectionType === "2"){
        if (value >= 0){
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX,startY+20);
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX-3,startY+0.5+3);
            ctx.moveTo(startX,startY+0.5);
            ctx.lineTo(startX+3,startY+0.5+3);
        } else {
            ctx.moveTo(startX,startY+20);
            ctx.lineTo(startX,startY);
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX-3,startY+19.5-3);
            ctx.moveTo(startX,startY+19.5);
            ctx.lineTo(startX+3,startY+19.5-3);
        }
    }
    if(branchDirectionType === "3"){
        if (value >= 0){
            ctx.moveTo(startX,startY);
            ctx.lineTo(startX-20,startY);
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY-3);
            ctx.moveTo(startX-0.5,startY);
            ctx.lineTo(startX-0.5-3,startY+3);
        } else {
            ctx.moveTo(startX-20,startY);
            ctx.lineTo(startX,startY);
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY-3);
            ctx.moveTo(startX-19.5,startY);
            ctx.lineTo(startX-19.5+3,startY+3);
        }
    }
    ctx.stroke();
    ctx.closePath();
}
/**
 * Meghatarozza a parameterul kapott 2 koordianata kozotti tavolsag felet.
 * @param {*} coord1 
 * @param {*} coord2 
 */
function meanOfCoordinates(coord1, coord2){
    //console.log("meanofcoord: "+ (+coord1 + coord2)/2);
    return ((Number(coord1)+Number(coord2))/2);
}

/**
 * Ket szam kozul a nagyobbal ter vissza
 * @param {*} num1 
 * @param {*} num2 
 */
function wichBiger(num1, num2){
    if (+num1 >= +num2){
        return num1;
    } else {
        return num2;
    }
}