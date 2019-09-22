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
var select;
var checkingUsrResult1;
var checkingUsrResult2;
var canvas, ctx;
var cloneCanvas; 
var cloneContext; 
function compareResults(userCalc, circResult){
    let resultTolerance = [circResult - 0.005, circResult + 0.005];
    console.log("circuitResults: "+ circResult);

    if (+userCalc >= resultTolerance[0] && +userCalc <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}
function setPrefixOfResults(resultObj,type){
    if (+type > 0 && +type <= 5){
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
function startTimerTest(taskType, resultsOfcircuit, prefixObj){
    console.log("taskType: "+taskType);
    
    //taskType = Number(taskType);
    countdownMin = 0;
    countdownSec = 20;
    $("#checkUsrResult").prop("disabled", false);
    $("#result").html('');
    $("#content").html('');
    $("#timeoutorsolve").html('');
    $("#usrCheck").show();
    $("#value1").show();
    $("#value2").show();
    $("#taskLabel2").show();
    $(".resultOUT").hide();
    $("input").val("");
    $("resultOUT").val("");
    $("userIN").val("");
    $("#content").append("<h2>" + title + "</h2>");
    $("#content").append("<p>" + descript + "</p>");
    $("#hrUP").show();
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
            $(".usrIN").hide();
                
            if (+taskType >0 && +taskType <=5 ){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thVolt,prefixObj.thVoltPrefix))+"</b>");
                $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thRes,prefixObj.thResPrefix))+"</b>");
            }
            if (+taskType === 6){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.resCurrent,prefixObj.resCurrPrefix))+"</b>");
                $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.resVolt,prefixObj.resVoltPrefix))+"</b>");
            }
            if (+taskType === 7){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.absError,prefixObj.absErrorPrefix))+"</b>");
                $("#out2").html("<b>" +resultsOfcircuit.relError+"</b>");
            }
            if (+taskType === 8){
                $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.terminalVolt,prefixObj.terminalVoltPrefix))+"</b>");
                $("#out2").hide();
            }
            timeout = true;
            timeOutResult("timeout");
        }
        $('#usrTimeCounter').text(countdownMin + ' m ' + countdownSec + " s ");
    }, 1000);
}
function checkResult(userResult1, userResult2){
    console.log("userResult1: "+userResult1)
    console.log("userResult2: "+userResult2)
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
    console.log(timeoutURL);
    $.get(timeoutURL, function (data, status) {
        console.log(status);
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
