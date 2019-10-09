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
  * A felhasznalo altal beirt erteket hasonlitja ossze a tenyleges ertekkel. 
  * Legtobb esetben 5 ezrelekes hibahatar megengedett
  * @param {*} userCalc fehasznalo eredmenye
  * @param {*} circResult tenyleges erteke a keresett valtozonak.
  */
function compareResults(userCalc, circResult){
    let resultTolerance = [circResult - 0.005, circResult + 0.005];
    if (Math.abs(+userCalc) >= resultTolerance[0] && Math.abs(+userCalc) <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}

/**
 * Lap betoltesekor elrejti a nem szukseges html elemeket. 
 */
function refresingAndLoadingPage(){
    
    canvas = document.getElementById('drawCircuit');
    ctx = canvas.getContext('2d');
    $("#usrCheck").hide();
    $("#drawCircuit").hide();
    $("#drawCircuit").closest();
    $("#hrUP").hide();
    $("#hrDown").hide();
}

/**
 * Felhasznalo altal beirt eredmeny ellenorzeseset vegzo fuggveny a feladattipusoknak megfeleloen.
 */
function userSolutionCheck(){
    var wrongElement1;
    var wrongElement2;
    if (+select >=1 && +select <=8){
      checkResult(+$("#value1").val(),+$("#value2").val());
    }
    if (+select === 9){
      userResistorsResult = [];
      checkUsrResistors = [];
      for(var i = 0; i < circuitResults.resistorDetails.length; i++){
        userResistorsResult.push(+$("#usrRes"+(i+1)).val());
        checkUsrResistors.push(false);
      }
      checkResistorResult(circuitResults.resistorDetails,userResistorsResult);
    }
    if (+select === 10){
      checkTask10Result(+$("#usrR1").val(),+$("#usrR2").val(),+$("#usrR3").val(),+$("#usrU1").val())
    }
    if (+select > 0 && +select <= 5){
        wrongElement1 = " feszültség ";
        wrongElement2 = " ellenállás ";
    }
    if (+select === 6){
      wrongElement1 = " áram ";
      wrongElement2 = " feszültseg ";
    }
    if (+select === 7){
      wrongElement1 = " abszolút hiba ";
      wrongElement2 = " relatív hiba ";
    }
    if (+select === 8){
      wrongElement1 = " kapocsfeszültség  ";
      checkingUsrResult2 = true;
    }
    
    if (+select > 0 && +select <= 8){
      if (checkingUsrResult1 && checkingUsrResult2) {
        var linkOfFalstad = '<b><a href="' + circuitResults.link + '" target="_blank">Falstad</a></b>';
        $("#timeoutorsolve").html("<h3>Feladat megoldásának ellenőrzése a " + linkOfFalstad + " oldalán.</h3>");
        clearInterval(timer);
        $(".usrIN").hide();
        $(".resultOUT").show();
        $("#checkUsrResult").attr("disabled", "disabled");
        if (+select >0 && +select <=5 ){
          $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.thVolt,prefixes.thVoltPrefix)).toFixed(3)+"</b>");
          $("#out2").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.thRes,prefixes.thResPrefix)).toFixed(3)+"</b>");
        }
        if (+select === 6){
            $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.resCurrent,prefixes.resCurrPrefix)).toFixed(3)+"</b>");
            $("#out2").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.resVolt,prefixes.resVoltPrefix)).toFixed(3)+"</b>");
        }
        if (+select === 7){
            $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.absError,prefixes.absErrorPrefix)).toFixed(3)+"</b>");
            $("#out2").html("<b>" +circuitResults.relError.toFixed(3)+"</b>");
        }
        if (+select === 8){
            $("#out1").html("<b>" +Math.abs(setResultWithPrefix(circuitResults.terminalVolt,prefixes.terminalVoltPrefix)).toFixed(3)+"</b>");
            $("#out2").hide();
        }
        timeout = true;
        timeOutResult(removeTaskID,+select);
        alert('Helyes megoldás!');
      }
      if (!checkingUsrResult1 && checkingUsrResult2) {
        $("#value1").val("");
        alert("Rossz"+wrongElement1+"érték!");
      }
      if (checkingUsrResult1 && !checkingUsrResult2) {
        $("#value2").val("");
        alert("Rossz"+wrongElement2+"érték!");
      }
      if (!checkingUsrResult1 && !checkingUsrResult2) {
        $(".usrIN").val("");
        alert('Helytelen megoldás!');
      }
    }
    if (+select === 9){
      var linkOfFalstad = '<b><a href="' + circuitResults.link + '" target="_blank">Falstad</a></b>';
      var allTrue = true;
      var falseResistor = [];
      
      for (var i = 0; i < checkUsrResistors.length; i++){
        if (checkUsrResistors[i] === false){
          allTrue = false;
        }
      }
      if (allTrue) {
        $("#timeoutorsolve").html("<h3>Feladat egy lehetséges megoldásának ellenőrzése a " + linkOfFalstad + " oldalán.</h3>");
        $(".resultOUTRes").show();
        $(".usrINRes").hide();
        alert("Helyes megoldás");
        timeout = true;
        clearInterval(timer);
        $("#checkUsrResult").attr("disabled", "disabled");
        timeOutResult(removeTaskID,+select);
      } else {
        var wrongRes = [];
        for (var i = 0; i < checkUsrResistors.length; i++){
          if (checkUsrResistors[i] === false){
            wrongRes.push("R"+(i+1));
          }
        }
        alert("Nem megfelelő értékek: \n "+wrongRes);
      }
    }
}
/**
 * Feladathoz tartozo leiras betolteset vegzi a JSON objektumbol a generalaskor.
 */
function getTaskDescription(){
    select = $("select").val();
    var descriptSelect = "type" + select;
    $("#drawCircuit").closest();
    title = Object.keys(description[descriptSelect])[0];
    descript = description[descriptSelect][title];
}
/**
 * Beallitja feladattipusnak megfeleloen a tenyleges vegeredmenyek megfelelo prefixumat.
 * @param {*} resultObj a solver altal kiszamolt eredmenyeket tartalmazo objektum
 * @param {*} type feladat tipusa
 */
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
/**
 * A parameterul kapott ertek prefikszumat keresi meg. (mili, mikro, stb)
 * Majd egy JSON objektben eltarolja a hozza tartozo keresett valtozo tipusaval.
 * @param {*} result a halozat keresett valtozojanak tenyleges erteke
 * @param {*} typeOfPrefix es annak tipusa (thevenin ellenallas, ellenallas arama, stb)
 */
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
/**
 * A halozat szamolt erteket atalakitja a megfelelo prefixumu alakra a megadott parameterek segitsegevel.
 * @param {*} originalResult eredeti erteke a keresett valtozonak
 * @param {*} prefix a scanPrefix() fuggveny altal beallitott perfixumokat tartalmazo objektum
 */
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

/**
 * A feladat vegrehajtasara adott idoszamlalot inditja. 
 * Valamint ebben tortenik a megfelelo HTML elemek feladattipustol fuggo megjelenite, vagy elrejtese (SPA).
 * @param {*} taskType feladat tipusa
 * @param {*} resultsOfcircuit a halozatanalizis utan a szervertol kapott eredmeny objektum
 * @param {*} prefixObj a scanPrefix() fuggveny altal beallitott perfixumokat tartalmazo objektum
 */
function startTimer(taskType, resultsOfcircuit, prefixObj){
    countdownMin = 0;
    countdownSec = 40;
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
    $("#drawCircuit").show();
    //$("#result").append("<p>A kép egérrel nagyítható és mozgatható.</p>");
    //$("#hrDown").show();
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
        $("#value2").hide();
        $("#value1").hide();
        $(".resultOUT").show();
        $("#searchCirc").append("<h3>A csatalakozó hálózat bemeneti korlátozásai:</h3>");
        $("#taskLabel1").html("Bemeneti feszültség: ");
        $("#taskLabel2").html("Bemeneti terhelő ellenállás: ");
        $("#out1").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thVolt,prefixObj.thVoltPrefix)).toFixed(3)+" <b style=\"color:red;\">" + prefixObj.thVoltPrefix + "V</b>");
        $("#out2").html("<b>" +Math.abs(setResultWithPrefix(resultsOfcircuit.thRes,prefixObj.thResPrefix)).toFixed(3)+" <b style=\"color:red;\">" + prefixObj.thResPrefix + "Ω</b>");
        $("#out2").append("<hr>");
        for (var i = 0; i < circuitResults.resistorDetails.length; i++){
            var resistor = circuitResults.resistorDetails[i].split(" ");
            $("#resistorResult").append("<span id= '"+resistor[0]+"' >"+resistor[0]+": </span><input type = 'text' class='usrINRes' id = 'usrRes"+(i+1)+"' value=''><span class='resultOUTRes' id='out"+(i+1)+"'> <b>"+resistor[1]+" </b><b style=\"color:red;\">Ω</b></span><br>");
        }
        $(".resultOUTRes").hide();
    }
    if (+taskType === 10){
        for (var i = 0; i < circuitResults.falstadTXT.length; i++){
            var element = circuitResults.falstadTXT[i].split(" ");
            if (element[0] === "v" && element[12] === "2"){
                task10inputVoltage = +element[8];
            }
        }
        $("#value2").hide();
        $("#value1").hide();
        $(".resultOUT").show();
        $("#searchCirc").append("<h3>A hálózat rendelkezésre álló adatai:</h3>");
        $("#taskLabel1").html("U2 bemenet bipoláris feszültség tartománya: ");
        $("#taskLabel2").html("A - B pontok között megengedett unipoláris feszültség tartomány: ");
        $("#out1").html("<b> -"+task10inputVoltage+ " - +" +task10inputVoltage+ " <b style=\"color:red;\">V</b>");
        $("#out2").html("<b> 0 - "+circuitResults.expectedOutVoltage+" <b style=\"color:red;\">V</b>");
        $("#out2").append("<hr>");
        $("#resistorResult").append("<span id= 'R1' >R1: </span><input type = 'text' class='usrINRes' id = 'usrR1' value=''><span class='resultOUTRes' id='out3'></span><br>");
        $("#resistorResult").append("<span id= 'R2' >R2: </span><input type = 'text' class='usrINRes' id = 'usrR2' value=''><span class='resultOUTRes' id='out4'></span><br>");
        $("#resistorResult").append("<span id= 'R3' >R3: </span><input type = 'text' class='usrINRes' id = 'usrR3' value=''><span class='resultOUTRes' id='out5'></span><br>");
        $("#resistorResult").append("<span id= 'U1' >U1: </span><input type = 'text' class='usrINRes' id = 'usrU1' value=''><span class='resultOUTRes' id='out6'></span><br>");
        $(".resultOUTRes").hide();
    }
    clearInterval(timer);
    let linkOfFalstad = '<b><a href="' + resultsOfcircuit.link + '" target="_blank">Falstad</a></b>';

    /**
     * Az a fuggveny figyeli a a feladatra kiadott idot es mikor lejar, elerhetove teszi a megfelelo HTML elemeket.
     */
    timer = setInterval(function () {
        countdownSec--;
        if (countdownSec === -1) {
            countdownMin--;
            countdownSec = 59;
        }
        if (countdownSec === 0 && countdownMin === 0) {
            clearInterval(timer);
            if (+taskType === 9 || +taskType === 10){
                $("#timeoutorsolve").append("<h3>Hálózat egy lehetséges megoldásának megtekintése a " + linkOfFalstad + " oldalán.</h3>");
            } else {
                $("#timeoutorsolve").append("<h3>Hálózat megtekintése a " + linkOfFalstad + " oldalán.</h3>");
            }
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
            if (+taskType === 10){
                $("#out2").append("<b>Egy lehetséges megoldás: </b><hr>");
                $("#out3").html("<b>"+ circuitResults.resistorDetails[0].split(" ")[1]+"</b> <b style=\"color:red;\">Ω</b>");
                $("#out4").html("<b>"+ circuitResults.resistorDetails[1].split(" ")[1]+"</b> <b style=\"color:red;\">Ω</b>");
                $("#out5").html("<b>"+ (+circuitResults.resistorDetails[2].split(" ")[1]).toFixed(3)+"</b> <b style=\"color:red;\">Ω</b>");
                $("#out6").html("<b>" +task10inputVoltage+ "</b> <b style=\"color:red;\">V</b>");
            }
            timeout = true;
            timeOutResult("timeout");
        }
        $('#usrTimeCounter').text(countdownMin + ' m ' + countdownSec + " s ");
    }, 1000);
}
/**
 * Megallapitja, hogy a parameterul kapott ellenallas egyeduli-e az adott agban.
 * @param {*} multiRes tobb ellenallast is tartalmazo ag adat tombje
 * @param {*} resNumber a vizsgalt ellenallas szama.
 */
function isOnlyResistor(multiRes,resNumber){
    for (var i = 0; i < multiRes.length; i++){
        var branch = multiRes[i].split(" ");
        for(var j = 1; j < branch.length; j++){
            if (resNumber === branch[j]){
                return false;
            }
        }
    }
    return true;
}

/**
 * Az "Áramkör helyes értékeinek megadása I." tipusu feladat felhasznalo altal megadott eredmenyeinek ellenorzeset vegzi.
 * @param {*} resDetail a halozatban szereplo ellenallasok szamat es ertekeit tartalmazo objektum
 * @param {*} usrResValues a felhasznalo altal megadott ellenalas ertekek tombje.
 */
function checkResistorResult(resDetail,usrResValues){
    for (var i =0; i < resDetail.length; i++){
        var resistor = circuitResults.resistorDetails[i].split(" ");
        if (isOnlyResistor(circuitResults.multiResInBranch,resistor[0]) && ((+usrResValues[i]) >= (+resistor[1])-10 && (+usrResValues[i]) <= (+resistor[1])+10)){
            checkUsrResistors[i] = true;
        } 
    }
    for (var i = 0; i < circuitResults.multiResInBranch.length; i++){
        var multi = circuitResults.multiResInBranch[i].split(" ");
        var branchRes = +multi[0];
        for (var j = 1; j < multi.length; j++){
            branchRes -= +$("#usrRes"+multi[j].split("")[1]).val();
        }
        if (branchRes >= (0 - 10) && branchRes <= (0 + 10)){
            for (var j = 1; j < multi.length; j++){
                checkUsrResistors[(multi[j].split("")[1])-1] = true;
            }
        }   
    }
}

/**
 * Az aramkor keresese tipusu feladatok kiveteleval a tobbi feladat megoldasanak helyesseget ellenorzo fuggveny. 
 * @param {*} userResult1 felhasznalo ertekmegadasa
 * @param {*} userResult2 felhasznalo ertekmegadasa
 */
function checkResult(userResult1, userResult2){
    if (+select > 0 && +select <= 5){
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
/**
 * Az "Áramkör helyes értékeinek megadása II." tipusu feladat felhasznalo altal megadott eredmenyeinek ellenorzeset vegzi.
 * @param {*} r1 falhasznalo altal megadott ellenallas ertek
 * @param {*} r2 falhasznalo altal megadott ellenallas ertek
 * @param {*} r3 falhasznalo altal megadott ellenallas ertek
 * @param {*} u1 falhasznalo altal megadott generator ertek
 */
function checkTask10Result(r1, r2, r3, u1) {
    var expectedVoltageTolerance = [(+circuitResults.expectedOutVoltage-0.005),(+circuitResults.expectedOutVoltage+0.005)];
    if ((+r1 < 1000 || +r1 > 680000) || (+r2 < 1000 || +r2 > 680000)){
        alert("R1 és R2 minimum 1 KΩ,\n maximum 680 kΩ lehet.");
        return false;
    }
    if ((r1 !== r2 && u1 !== task10inputVoltage)){
        alert("Nem megfelelő R1, R2 ás U1 értékek!");
        return false;
    }
    if (r1 !== r2){
        alert("Nem megfelelő R1 és R2 értékek!");
        return false;
    }
    if (u1 !== task10inputVoltage){
        alert("Nem megfelelő U1 érték!");
        return false;
    }
    if (calculateTask10Result(r1,r2,r3,u1,expectedVoltageTolerance)){
        var splitedFalstadLink = circuitResults.link.split("%0A");
        var link = splitedFalstadLink[0]+"%0A";
        var tempsplited = [];
        for (var i = 1; i < splitedFalstadLink.length-1; i++){
            var tempArray = splitedFalstadLink[i].split("+");
            if (tempArray[0] === "r"){
                splitedFalstadLink[i] = "";
                if (+tempArray[tempArray.length-1] === 1){
                    tempArray[6] = ""+r1+ "" ;
                }
                if (+tempArray[tempArray.length-1] === 2){
                    tempArray[6] = ""+r2+ "" ;
                }
                if (+tempArray[tempArray.length-1] === 3){
                    tempArray[6] = ""+r3+ "" ;
                }
                splitedFalstadLink[i] += tempArray[0];
                for (var j = 1; j < tempArray.length; j++){
                    splitedFalstadLink[i] += "+"+tempArray[j];
                }
            }
            link += splitedFalstadLink[i]+"%0A"
        }
        var linkOfFalstad = '<b><a href="' + link + '" target="_blank">Falstad</a></b>';
        $("#timeoutorsolve").html("<h3>Helyes megoldásod ellenőrzése a " + linkOfFalstad + " oldalán.</h3>");
        $("#checkUsrResult").attr("disabled", "disabled");
        $(".resultOUT").show();
        $(".resultOUTRes").show();
        $(".usrIN").hide();
        $(".usrINRes").hide();
        $("#out2").append("<b>Megadott értékeid: </b><hr>");
        $("#out3").html("<b>"+ r1+"</b> <b style=\"color:red;\">Ω</b>");
        $("#out4").html("<b>"+ r2+"</b> <b style=\"color:red;\">Ω</b>");
        $("#out5").html("<b>"+ r3+"</b> <b style=\"color:red;\">Ω</b>");
        $("#out6").html("<b>" +u1+ "</b> <b style=\"color:red;\">V</b>");
        alert('Helyes megoldás!');
        timeout = true;
        clearInterval(timer);
        timeOutResult(removeTaskID,+select);
        return true;
    } else {
        alert('Helytelen megoldás!');
        return false;
    }
}
/**
 * Az "Áramkör helyes értékeinek megadása II." tipusu feladat felhasznalo altal beirt ertekeivel a halozat analiziset vegzi.
 * Ez az egy tipusu feladat, aminel a kliens oladlon tortenik a halozatanalizis, mivel nem amugy sem igenyel sok szamolast.
 * Viszont a feledatban megadott kimeneti erteket a szerveren torteno halozatanilizis szabja meg.
 * @param {*} r1 falhasznalo altal megadott ellenallas ertek
 * @param {*} r2 falhasznalo altal megadott ellenallas ertek
 * @param {*} r3 falhasznalo altal megadott ellenallas ertek
 * @param {*} u1 falhasznalo altal megadott generator ertek
 * @param {*} expOutTol elvart kimeneti erteke a halozatnak
 */
function calculateTask10Result(r1, r2, r3, u1, expOutTol){
    var resultingResistance = ((r1*r2)/(r1+r2));
    var calculatedOutputVoltage = u1*(r3/(r3+resultingResistance));
    if (calculatedOutputVoltage >= expOutTol[0] && calculatedOutputVoltage <= expOutTol[1]){
        return true;
    } else {
        return false;
    }
}

/**
 * A feladatraadott ido lejartakor, vagy a helyes megoldaskor meghivott fuggveny, 
 * mely elkuldi a szervernek az aktualis feladat ID-t,hogy torlesre keruljon.
 * @param {*} whereCall egy string, amit akkor kap, ha tenylegesen az ido jart le ami a feladatra lett kiadva
 */
function timeOutResult(whereCall) {
    var timeoutURL = host + "/timeout?id=" + removeTaskID;
    $.get(timeoutURL, function (data, status) {
        if (whereCall === "timeout"){
            alert("Lejárt az idő! Feladat törölve! ");
        }
    });
}