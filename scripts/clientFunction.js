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
var host = "http://localhost:3000";
var timer;
var timeout;
var setTimer = false;
var thr;
var thv;
var prefixes = {
    thResPrefix: undefined,
    thVoltPrefix: undefined,
    resCurrPrefix: undefined,
    resVoltPrefix: undefined,
    absErrorPrefix: undefined,
    terminalVoltPrefix: undefined
};
var countdownMin;
var countdownSec;
var select;
var removeTaskID;
var title;
var descript;
var circuitResults; //A servertol kapott valasz Obj
//var select;
var checkingUsrResult1;
var checkingUsrResult2;
var canvas, ctx;
var cloneCanvas; 
var cloneContext; 
var checkUsrResistors = [];
var userResistorsResult = [];
function compareResults(userCalc, circResult){
    let resultTolerance = [circResult - 0.005, circResult + 0.005];
    //console.log("circuitResults: "+ circResult);

    if (+userCalc >= resultTolerance[0] && +userCalc <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}
function setPrefixOfResults(resultObj,type){
    if (+type > 0 && +type <= 5 || +type === 9){
        scanPrefix(Math.abs(resultObj.thRes),"thResPrefix");
        scanPrefix(Math.abs(resultObj.thVolt),"thVoltPrefix");
    }
    if (+type === 6){
        scanPrefix(Math.abs(resultObj.resCurrent),"resCurrPrefix");
        scanPrefix(Math.abs(resultObj.resVolt),"resVoltPrefix");
    }
    if (+type === 7){
        scanPrefix(Math.abs(resultObj.absError),"absErrorPrefix");
    }
    if (+type === 8){
        scanPrefix(Math.abs(resultObj.terminalVolt),"terminalVoltPrefix");
    }
}
function scanPrefix(result, typeOfPrefix){
    //console.log("circuit result a scanprefixben: "+ result);
    let prefix = "";
    let prefixNumb = result * 1000;
    if (prefixNumb < 1000000000 && prefixNumb > 1000000){
        prefix = "k";
    } 
    if (prefixNumb < 1000000000000 && prefixNumb > 1000000000){
        prefix = "M";
    } 
    if (prefixNumb < 1000 && prefixNumb > 1){
        prefix = "m";
    } 
    if (prefixNumb < 1 && prefixNumb > 0.001){
        prefix = "µ";
    } 
    if (prefixNumb < 0.001 && prefixNumb > 0.000001){
        prefix = "n";
    }
    if (prefixNumb < 0.000001 && prefixNumb > 0.000000001){
        prefix = "p";
    }  
    prefixes[typeOfPrefix] = prefix;
    
}
function setResultWithPrefix(originalResult ,prefix){
    let result = originalResult;
    if (prefix ==="m"){
        result = result * 1000;
    }
    if (prefix ==="µ"){
        result = result * 1000000;
    }
    if (prefix ==="n"){
        result = result * 1000000000;
    }
    if (prefix ==="p"){
        result = result * 1000000000000;
    }
    if (prefix ==="k"){
        result = result / 1000;
    }
    if (prefix ==="M"){
        result = result / 1000000;
    }
    return result;
}
function startTimer(taskType, resultsOfcircuit, prefixObj){
    //console.log("taskType: "+taskType);
    
    //taskType = Number(taskType);
    countdownMin = 0;
    countdownSec = 30;
    $("#checkUsrResult").prop("disabled", false);
    $("#result").html('');
    $("#content").html('');
    $("#timeoutorsolve").html('');
    $("#searchCirc").html('');
    $("#usrCheck").show();
    $("#value1").show();
    $("#value2").show();
    $("#taskLabel2").show();
    $("#taskLabel1").show();
    $(".resultOUT").hide();
    $(".resultOUTRes").hide();
    $("input").val("");
    $(".resultOUT").val("");
    $(".resultOUTRes").val("");
    $("userIN").val("");
    $("#content").append("<h2>" + title + "</h2>");
    $("#content").append("<p style=\"font-size: 20px;\">" + descript + "</p>");
    $("#hrUP").show();
    $("#resistorResult").html("");
    //$("#resistorResult").hide();
    //$("#result").append("<h1>Ide jon majd a megjelenitese a halozatnak (CANVAS?)</h1>");
    $("#drawCircuit").show();
    $("#result").append("<p>A kép egérrel nagyítható és mozgatható.</p>");
    //$("#result").append("<canvas id=\"drawCircuit\" ></canvas>");
    $("#hrDown").show();
    if (+taskType >0 && +taskType <=5 ){
        $("#taskLabel1").html("Thevenin feszültség (<b style=\"color:red;\">" + prefixObj.thVoltPrefix + "V</b>): ");
        $("#taskLabel2").html("Thevenin ellenállás (<b style=\"color:red;\">" + prefixObj.thResPrefix + "Ω</b>): ");
    }
    if (+taskType === 6){
        $("#taskLabel1").html("Ellenálláson folyó áram (<b style=\"color:red;\">" + prefixObj.resCurrPrefix + "A</b>): ");
        $("#taskLabel2").html("Ellenálláson eső feszültseg (<b style=\"color:red;\">" + prefixObj.resVoltPrefix + "V</b>): ");
    }
    if (+taskType === 7){
        $("#taskLabel1").html("Abszolút hiba nagysága (<b style=\"color:red;\">" + prefixObj.absErrorPrefix + "V</b>): ");
        $("#taskLabel2").html("Relatív hiba nagysága (<b style=\"color:red;\">%</b>): ");
    }
    if (+taskType === 8){
        $("#taskLabel1").html("Kapocsfeszültség (<b style=\"color:red;\">" + prefixObj.terminalVoltPrefix + "V</b>): ");
        $("#taskLabel2").hide();
        $("#value2").hide();
        $("#out2").hide();
    }
    if (+taskType === 9){
        //$("#taskLabel1").hide();
        //$("#taskLabel2").hide();
        $("#value2").hide();
        //$("#out2").hide();
        $("#value1").hide();
        //$("#out1").hide();
        $(".resultOUT").show();

        $("#searchCirc").append("<h3>A csatalakozó hálózat bemeneti korlátozásai:</h3>");
        $("#taskLabel1").html("Bemeneti feszültség: ");
        $("#taskLabel2").html("Bemeneti terhelő ellenállás: ");
        $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thVolt,prefixObj.thVoltPrefix)).toFixed(3)+" <b style=\"color:red;\">" + prefixObj.thVoltPrefix + "V</b>");
        $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thRes,prefixObj.thResPrefix)).toFixed(3)+" <b style=\"color:red;\">" + prefixObj.thResPrefix + "Ω</b>");
        $("#out2").append("<hr>");
        for (var i = 0; i < circuitResults.resistorDetails.length; i++){
            var resistor = circuitResults.resistorDetails[i].split(" ");
            $("#resistorResult").append("<span>"+resistor[0]+": </span><input type = 'text' class='usrINRes' id = 'usrRes"+(i+1)+"' value=''><span class='resultOUTRes' id='out"+(i+1)+"'> <b>"+resistor[1]+" </b><b style=\"color:red;\">Ω</b></span><br>");
            //$("#resistorResult").append("<span>"+resistor[0]+": </span><input type = 'text' id = 'result"+(i+1)+"' value=''><span class=\"resultOUT\" id=\"out1\"> eredmeny</span><br>");
        }
        $(".resultOUTRes").hide();

    }
    clearInterval(timer);
    let linkOfFalstad = '<b><a href="' + resultsOfcircuit.link + '" target="_blank">Falstad</a></b>';
    timer = setInterval(function () {
        countdownSec--;
        if (countdownSec === -1) {
            countdownMin--;
            countdownSec = 9;
        }
        if (countdownSec === 0 && countdownMin === 0) {
            clearInterval(timer);
            $("#timeoutorsolve").append("<h3>Hálózat megtekintése a " + linkOfFalstad + " oldalán.</h3>");
            $("#checkUsrResult").attr("disabled", "disabled");
            $(".resultOUT").show();
            $(".resultOUTRes").show();
            $(".usrIN").hide();
            $(".usrINRes").hide();
                
            if (+taskType >0 && +taskType <=5 ){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thVolt,prefixObj.thVoltPrefix)).toFixed(3)+"</b>");
                $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thRes,prefixObj.thResPrefix)).toFixed(3)+"</b>");
            }
            if (+taskType === 6){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.resCurrent,prefixObj.resCurrPrefix)).toFixed(3)+"</b>");
                $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.resVolt,prefixObj.resVoltPrefix)).toFixed(3)+"</b>");
            }
            if (+taskType === 7){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.absError,prefixObj.absErrorPrefix)).toFixed(3)+"</b>");
                $("#out2").html("<b>" +resultsOfcircuit.relError.toFixed(3)+"</b>");
            }
            if (+taskType === 8){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.terminalVolt,prefixObj.terminalVoltPrefix)).toFixed(3)+"</b>");
                $("#out2").hide();
            }
            timeout = true;
            timeOutResult("timeout");
        }
        $('#usrTimeCounter').text(countdownMin + ' m ' + countdownSec + " s ");
    }, 1000);
}
function checkResistorResult(resDetail,usrResValues){
    var branchResistance = [];
    for (var i =0; i < resDetail.length; i++){
        var resistor = circuitResults.resistorDetails[i].split(" ");
        branchResistance.push(resistor[2]);
    }
    for (var i =0; i < resDetail.length; i++){
        var resistor = circuitResults.resistorDetails[i].split(" ");
        console.log("branchResistance: " +branchResistance)
        if ((+branchResistance[i] - (+usrResValues[i])) === 0){
            checkUsrResistors[i] = true;
        }
        if ((+branchResistance - (+usrResValues[i])) > 0) {
            branchResistance[i] -=(+usrResValues[i])
        }
    }
    console.log("checkUsrResistors: " +checkUsrResistors)
}
function checkResult(userResult1, userResult2){
    //console.log("userResult1: "+userResult1)
    //console.log("userResult2: "+userResult2)
    if (+select > 0 && +select <= 5){
        //console.log("VALAMIJE: "+Math.abs(setResultWithPrefix(circuitResults.thVolt,prefixes.thVoltPrefix)));
        checkingUsrResult1 = compareResults(userResult1,+Math.abs(setResultWithPrefix(circuitResults.thVolt,prefixes.thVoltPrefix)));
        checkingUsrResult2 = compareResults(userResult2,+Math.abs(setResultWithPrefix(circuitResults.thRes,prefixes.thResPrefix)));
    }
    if (+select === 6){
        checkingUsrResult1 = compareResults(userResult1,+Math.abs(setResultWithPrefix(circuitResults.resCurrent,prefixes.resCurrPrefix)));
        checkingUsrResult2 = compareResults(userResult2,+Math.abs(setResultWithPrefix(circuitResults.resVolt,prefixes.resVoltPrefix)));
    }
    if (+select === 7){
        checkingUsrResult1 = compareResults(userResult1,+Math.abs(setResultWithPrefix(circuitResults.absError,prefixes.absErrorPrefix)));
        checkingUsrResult2 = compareResults(userResult2,+circuitResults.relError);
    }
    if (+select === 8){
        checkingUsrResult1 = compareResults(userResult1,+Math.abs(setResultWithPrefix(circuitResults.terminalVolt,prefixes.terminalVoltPrefix)));
    }
}
function timeOutResult(whereCall) {
    var timeoutURL = host + "/timeout?id=" + removeTaskID;
    //console.log(timeoutURL);
    $.get(timeoutURL, function (data, status) {
        //console.log(status);
        if (whereCall === "timeout"){
            alert("Lejárt az idő! Feladat törölve! ");
        }
    });
}
function wichBiger(num1, num2){
    if (+num1 >= +num2){
        return num1;
    } else {
        return num2;
    }
}
function setDirectionTypeToCircuitElementInCanvas(startX,startY,endX,endY){
    if(startX === endX){
        //console.log("melyik nagyobb: "+wichBiger(startY,endY));
        if (wichBiger(startY,endY) === startY) {
            return "0"
        } else {
            return "2";
        }
    } else {
        //console.log("melyik nagyobb: "+wichBiger(startX,endX));
        if (wichBiger(startX,endX) === startX) {
            return "3";
        } else {
            return "1";
        }
    }
}
function meanOfCoordinates(coord1, coord2){
    //console.log("meanofcoord: "+ (+coord1 + coord2)/2);
    return ((Number(coord1)+Number(coord2))/2);
}
