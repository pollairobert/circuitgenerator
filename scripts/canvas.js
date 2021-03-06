﻿/* 
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
     * A kiszamolt ket ellentetes sarokpont segitsegevel. Valamint dinamikus canvas meret beallitas.
     */
    var coordinateArray = circuitResults.falstadTXT;
    var scale;
    negativX = Infinity;
    negativY = Infinity;
    positiveX = -Infinity;
    positiveY = -Infinity;
    findDrawingCircuitPositivAndNegativCorners(coordinateArray);
    var circuitMaxWidth = Math.abs(negativX - positiveX);
    var circuitMaxHeight = Math.abs(negativY - positiveY);
    if (circuitMaxWidth > circuitMaxHeight) {
        scale = 750 / circuitMaxWidth;
        if (scale > 1.5){
            scale = 1.5;
        }
    } else {
        scale = 750 / circuitMaxHeight;
        if (scale > 1.5){
            scale = 1.5;
        }
    }
    scale = 1.5;
    if (circuitMaxHeight > 350){
        scale = 1.2;
    }
    ctx.canvas.width = scale*(Math.abs(negativX - positiveX) + (+select === 8 ? 170: 100));
    ctx.canvas.height = scale*(Math.abs(negativY - positiveY) + 50);
    ctx.scale(scale,scale);
    translateX = ctx.canvas.width / 2;
    translateY = ctx.canvas.height / 2;
    translateOffset = [(negativX + positiveX)/2,(negativY + positiveY)/2];
    translateX = (translateX / scale) - translateOffset[0];
    translateY = (translateY / scale) - translateOffset[1];
    ctx.translate(translateX + ((+select === 8 ? 40 : 0)), translateY);
    
    /**
     * A halozat megrajzolasa innen kezdodik.
     */
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    var directionType;
    var isCommonBranch = [];
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
        if (branchCoordinates[branchCoordinates.length-2] === "com"){
            isCommonBranch.push(coordinateArray[i]);
           }
    }
    drawJunction(isCommonBranch);
};

/**
 * Torli  canvas tartalmat.
 */
function clearCanvas() {  
    canvas.width = canvas.width;
}

/**
 * Megrajzolja a halozat againak csatlakozasi pontjat a szakirodalom szerinte csatlakozasi jelolessel (2 agnal tobb csatlakozo csomopontok)
 * @param {*} commonBranchDetails a kozos agak adatait tartalmazo tomb
 */
function drawJunction(commonBranchDetails) {
    var junction = [];
    var newCommon = true;
    for (var i = 0; i < commonBranchDetails.length; i++){
        if (newCommon) {
            junction.push(+commonBranchDetails[i].split(" ")[1]+","+commonBranchDetails[i].split(" ")[2]);
        }
        var branchDetails = commonBranchDetails[i].split(" ");
        if (commonBranchDetails[i+1] !== undefined){
            var iplus1 = +commonBranchDetails[i+1].split(" ")[+commonBranchDetails[i+1].split(" ").length-1];
            if (iplus1 !== +branchDetails[branchDetails.length-1]){
                junction.push(+commonBranchDetails[i].split(" ")[3]+","+commonBranchDetails[i].split(" ")[4]);
                newCommon = true;
            } else {
                newCommon = false;
            }
        } else if (commonBranchDetails.length > 1){
            if (+commonBranchDetails[i-1].split(" ")[+commonBranchDetails[i-1].split(" ").length-1] !== +branchDetails[branchDetails.length-1]){
                junction.push(+commonBranchDetails[i].split(" ")[1]+","+commonBranchDetails[i].split(" ")[2]);
                junction.push(+commonBranchDetails[i].split(" ")[3]+","+commonBranchDetails[i].split(" ")[4]);
            } else {
                junction.push(+commonBranchDetails[i].split(" ")[3]+","+commonBranchDetails[i].split(" ")[4]);
            }
        } else {
            junction.push(+commonBranchDetails[i].split(" ")[1]+","+commonBranchDetails[i].split(" ")[2]);
            junction.push(+commonBranchDetails[i].split(" ")[3]+","+commonBranchDetails[i].split(" ")[4]);
        }
    }
    for (var i = 0; i < junction.length; i++){
        var junctoinCoord = junction[i].split(",");
        ctx.beginPath();
        ctx.arc(junctoinCoord[0], junctoinCoord[1], 2.5, 0, 2*Math.PI,false);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.stroke();
    }
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
        arrowX = +startPosX + 5;
        arrowY = +(meanOfCoordinates(startPosY,endPosY) -14);

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
        arrowX = +(meanOfCoordinates(startPosX,endPosX) + 14);
        arrowY = +startPosY + 5;

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
 * A fesz.generator polaritasat kirajzolo fuggveny (+ -).
 * @param {*} branchDirectionType Az ag iranyanak tipusa, ami a generatort tartalmazza
 * @param {*} startX A generator + vegenek 
 * @param {*} startY koordinataja
 * @param {*} value a generator fesz. erteke.
 */
function drawVoltageSourceDirection(branchDirectionType,startX, startY, value){
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1.6;
    if(branchDirectionType === "0"){
        if (value <= 0){
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3+28);
            ctx.lineTo(startX,startY+3+28);
            ctx.moveTo(startX-3,startY+28);
            ctx.lineTo(startX+3,startY+28);
            
        } else {
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3);
            ctx.lineTo(startX,startY+3);
            ctx.moveTo(startX-3,startY+28);
            ctx.lineTo(startX+3,startY+28);
        }
    }
    if(branchDirectionType === "1"){
        if (value <= 0){ 
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX-28,startY-3);
            ctx.lineTo(startX-28,startY+3);
            ctx.moveTo(startX-31,startY);
            ctx.lineTo(startX-25,startY);
        } else {
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3);
            ctx.lineTo(startX,startY+3);
            ctx.moveTo(startX-31,startY);
            ctx.lineTo(startX-25,startY);
        }
    }
    if(branchDirectionType === "2"){
        if (value >= 0){
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3+28);
            ctx.lineTo(startX,startY+3+28);
            ctx.moveTo(startX-3,startY+28);
            ctx.lineTo(startX+3,startY+28);
        } else {
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3);
            ctx.lineTo(startX,startY+3);
            ctx.moveTo(startX-3,startY+28);
            ctx.lineTo(startX+3,startY+28);
        }
    }
    if(branchDirectionType === "3"){
        if (value >= 0){
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX-28,startY-3);
            ctx.lineTo(startX-28,startY+3);
            ctx.moveTo(startX-31,startY);
            ctx.lineTo(startX-25,startY);
        } else {
            ctx.moveTo(startX-3,startY);
            ctx.lineTo(startX+3,startY);
            ctx.moveTo(startX,startY-3);
            ctx.lineTo(startX,startY+3);
            ctx.moveTo(startX-31,startY);
            ctx.lineTo(startX-25,startY);
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