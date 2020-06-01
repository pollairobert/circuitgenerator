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
 * Kliens oldali valtozok deklaralasa.
 */
var host = "https://circuitgenerator.herokuapp.com";
//var host = "http://localhost:3000";
//var host = "http://87.229.23.189:3000";
//var host = "http://192.168.1.12:3000";
var setTimer = false;
var prefixes = {
    thResPrefix: undefined,
    thVoltPrefix: undefined,
    resCurrPrefix: undefined,
    resVoltPrefix: undefined,
    absErrorPrefix: undefined,
    terminalVoltPrefix: undefined
};
var checkUsrResistors = [];
var userResistorsResult = [];
var timer, timeout, thr, thv, countdownMin, countdownSec, select, removeTaskID, 
    title, descript, 
    circuitResults, //A servertol kapott valasz Obj
    checkingUsrResult1, checkingUsrResult2, canvas, ctx,
    task10outputVoltage,task10inputVoltage, stdTime, userTime;

/**
 * Megjeleniteshez (CANVAS) tartozo valtozok.
 * Az svg image-k azert kellenek, mert a sima szoveget a canvas nem kezeli SVG-ben. 
 * Elso verzioban volt zoom es mozgatasi lehetoseg, igy az SVG formatumu szoveget bennehagytam.
 * 
 */
var arcX, arcY, startValueXofVoltageSource, startValueYofVoltageSource, startValueXofResistor,translateOffset, translateX,
    translateY, startValueYofResistor, arrowX, arrowY, startRectX, startRectY, negativX, negativY, positiveX, positiveY;
var dimensionOfRect = [];
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
var img_r = new Image(); img_r.src = host+"/char_r.svg";
var img_u = new Image(); img_u.src = host+"/char_u.svg";
var img_vmeter = new Image(); img_vmeter.src = host+"/voltmeter.svg";
var svgObject = {
    "0" : img_0, "1" : img_1, "2" : img_2, "3" : img_3,
    "4" : img_4, "5" : img_5, "6" : img_6, "7" : img_7,
    "8" : img_8, "9" : img_9, "k" : img_k, "v" : img_v,
    "." : img_dot, "a" : img_a, "b" : img_b, "r" : img_r,
    "u" : img_u
}

/**
 * Feladatkiirashoz szukseges JSON objektum.
 */
var description = {
    "type1": {
        "Egyszerű feszültségosztó": 
            "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
            
    },
    "type1.1": {
        "Egyszerű feszültségosztó (2 generátor)": 
            "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type2": {
        "Kettős feszültségosztó": 
            "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type3": {
        "Feszültségosztó (2 generátor)": 
            "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type3.1": {
        "Feszültségosztó (3 generátor)": 
            "Old meg az A - B pontok közötti hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type4": {
        "A hálózat KÜLSŐ 2 pólus közötti helyettesítése": 
            "Old meg az A - B pontok közötti összetett hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type5": {
        "A hálózat BELSŐ 2 pólus közötti helyettesítése": 
            "Old meg az A - B pontok közötti összetett hálózat Thevenin helyattesítését!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type6": {
        "Ellenálláson eső feszültség és a rajta folyó áram megadása": 
            "Thevenin helyettesítés segíségével határozd meg a jelölt ellenalláson folyó áramot, valamint annak feszültségét!<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen és abszolút értékben add meg!"
    },
    "type7": {
        "Mérési hiba megadása": 
            "Adott egy <b style=\"color:red;font-size: 25px;\">10 MΩ</b> belső ellenállású feszültségmérő.<br>"+
            "Mekkora lesz az eltérés a tényleges és mért érték között (abszolút hiba), ha az alábbi hálózat  A - B pontján mérjük meg a feszültséget?<br>"+
            "Add meg százalékosan is az eltérés nagyságát (relatív hiba). <br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen és abszolút értékben add meg!!"
    },
    "type8": {
        "Megadott belső ellenállású feszültséggenerátor beiktatása": 
            "Adott a képen balra látható belső ellenállású és feszültségű generátor.<br>"+
            "Add meg mekkora lesz az A és B pontok közötti kapocsfeszültség, ha rákötjük a generátort ezen pontokra.<br>"+
            "Figyelj az eredmény megadásánál zárójelben szereplő prefixum szerinti értékadásra!<br>"+
            "Legalább 3 tizedesjegy pontosságú legyen!"
    },
    "type9": {
      "Áramkör helyes értékeinek megadása I.": 
          "Adott az alábbi feszültségű generátorhoz tartozó hálózat, melyet az A és B pontjaival szeretnénk egy másik halózathoz csatlakoztatni.<br>"+
          "A másik hálózat bemenetén korlátozás van, amely megszabja, hogy mekkora feszultségű és ellenállású hálózat köthető rá.<br>"+
          "Add meg a jelölt ellenállások értékeit úgy, hogy az áramkör kimeneti értékei megfeleljenek a megadott értékeknek!<br>"+
          "Az eredményeket itt prefixum nélkül, <b style=\"color:red;font-size: 25px;\">Ω</b> -ban add meg!<br>"
    },
    "type10": {
      "Áramkör helyes értékeinek megadása II.": 
          "Az alábbi hálózat egy olyan eszköz áramkörét reprezentálja, melynek az U1-es generátora 0 és 24 V között állítható tápfeszültséget jelöl,<br>"+
          "vele sorosan R1 egy potenciometer, melyet tételezzük fel, hogy 1 kΩ és 680 kΩ közötti értékekre lehet beállítani.<br>"+ 
          "U2 egy maximum 24 V-os bipoláris bementet jelöl (pl. mért érték), vele sorosan egy R2-es előtététellenállással (potenciométer, lsd. R1).<br>"+
          "Az A és B-vel jelölt kimenet egy olyan másik eszközhöz csatlakozik, amelynek bemenetére csak meghetározott nagyságú unipoláris feszültség köthető.<br>"+
          "A feladat, hogy a megadott U2 bemeneti tartomány és az elvárt A - B kimeneti érték ismeretében megadd a hiányzó elemek értékeit.<br>"+
          "Az eredményeket itt prefixum nélkül, <b style=\"color:red;font-size: 25px;\">Ω</b> -ban és <b style=\"color:red;font-size: 25px;\">V</b> -ban add meg!<br>"
    }
}
function init(){}
    