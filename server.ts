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

import { CircuitGenerator } from './circuitgenerator';
import { Circuit } from './circuit';
import { CircuitAnalyzer } from './circuitanalyzer';
import { Main } from './main';
import * as math from 'mathjs';
import { finished } from 'stream';
import { Serverfunction } from './scripts/serverfunction';


const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

let fs = require('fs');
let chekTime = 60*1000;
let serverFunction: Serverfunction = new Serverfunction();
serverFunction.checkExistTaskLOGfile();
/*if (!fs.existsSync('generateLOG.json')){
    fs.writeFileSync('generateLOG.json','{}', (err) => {
        if (err) {
            return console.error(err);
        }
    });
}*/
serverFunction.intervalTimer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('scripts'));
app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/scripts/circuitjQuery.js', (req,res)=> {
    res.sendFile(path.join(__dirname + '/scripts/circuitjQuery.js'));
});
app.get('/descript/description.json', (req,res)=> {
    res.sendFile(path.join(__dirname + '/descript/description.json'));
});
app.get('/generate', function (req, res) {
    let circuitCoordinateArray: string[];
    let link: string;
    let main = new Main();
    //globalMain = main;
    console.log('req.query.id: '+req.query.id);
    let type: number;
    let checkID: number;
    let voltPrefix: string;
    let currentPrefix: string;
    let ohmPrefix: string;
    type = +req.query.type;
    console.log(typeof(type));
    console.log(type);
    //checkID = req.query.id;
    
    if (req.query.id === undefined){
        console.log('req.query.id: '+req.query.id);
        //deleteData(req.query.id);
        main.start(type);
        link = main.getFalstadLink();
        circuitCoordinateArray = main.getCircuitCoordinateArray();
        //if (type === 7){
         //   voltPrefix = main.getMeasurementVoltPrefix();
        //} else {
            voltPrefix = main.getVoltagePrefix();
        //}
        currentPrefix = main.getCurrentPrefix();
        ohmPrefix = main.getOhmPrefix();
        console.log('voltPrefix: '+voltPrefix);
        //let id = Math.random();
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let response = {
            array: circuitCoordinateArray,
            link: link,
            id: id,
            voltPrefix: voltPrefix,
            currentPrefix: currentPrefix,
            ohmPrefix: ohmPrefix
        };
        //console.log('response: ');
        //console.log(response);
        serverFunction.addDatatoJSONfile(main.getResults(),id);
        res.send(JSON.stringify(response));
    } else {
        serverFunction.deleteDatatoJSONfile(req.query.id);
        console.log('req.query.id: '+req.query.id);
        main.start(+type);
        link = main.getFalstadLink();
        circuitCoordinateArray = main.getCircuitCoordinateArray();
        voltPrefix = main.getVoltagePrefix();
        currentPrefix = main.getCurrentPrefix();
        ohmPrefix = main.getOhmPrefix();
        console.log('ohmPrefix: '+ohmPrefix);
        //let id = Math.random();
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let response = {
            array: circuitCoordinateArray,
            link: link,
            id: id,
            voltPrefix: voltPrefix,
            currentPrefix: currentPrefix,
            ohmPrefix: ohmPrefix
        };
        //console.log('response: ');
        //console.log(response);
        serverFunction.addDatatoJSONfile(main.getResults(),id);
        res.send(JSON.stringify(response));
        console.log('nem megoldott feladat, ujrageneralas tortent');
    }
});

app.post('/check', (req, res) => {
    let id = req.body.id;
    //console.log(id);

    let response = serverFunction.searchResults(id,Math.abs(+req.body.thvolt),+req.body.thres,undefined, req.body.voltPrefix, undefined, req.body.ohmPrefix);
    console.log('response - check ben: ');
    console.log(response);
    if (response.res && response.volt){
        //response.link = globalMain.getFalstadLink();
        serverFunction.deleteDatatoJSONfile(id);
        console.log('data removed');
    }
    //console.log(response);
    //checkSolving();
    res.send(JSON.stringify(response));
});
app.post('/check2', (req, res) => {
    let id = req.body.id;
    console.log('req.body.voltPrefix: '+req.body.voltPrefix);
    let response = serverFunction.searchResults(id,Math.abs(+req.body.thvolt),undefined,Math.abs(+req.body.resCurrent),req.body.voltPrefix,req.body.currentPrefix,undefined);
    console.log(response);
    
    if (response.current && response.volt){
        //response.link = globalMain.getFalstadLink();
        serverFunction.deleteDatatoJSONfile(id);
        console.log('data removed');
    }
    //checkSolving();
    res.send(JSON.stringify(response));
});
app.post('/timeout', (req, res) => {
    let id = req.query.id;
    let response = serverFunction.timeOutResult(id, req.query.voltPrefix,req.query.currentPrefix, req.query.type, req.query.resPrefix );
    serverFunction.deleteDatatoJSONfile(id);
    res.send(JSON.stringify(response));
});
/*function addDatatoJSONfile(pushData,id){
    console.log()
    let generateLOG = fs.readFileSync('generateLOG.json');
    if (generateLOG[0] === undefined){
        console.log('Ures file volt');
        generateLOG = '{}';
    }
    let resultLOG = JSON.parse(generateLOG);
    resultLOG[id] = pushData;
    let pushlogData = JSON.stringify(resultLOG, null, 2);
    

    fs.writeFileSync('generateLOG.json',pushlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function deleteDatatoJSONfile(id: string){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    delete resultLOG[id];
    let refreshlogData = JSON.stringify(resultLOG, null, 2);
    fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function deleteData(id: string){
    let generateLOG = fs.readFileSync('generateLOG.json');
    if (generateLOG[0] === undefined){
        console.log('Ures file volt');
        generateLOG = '{}';
    }
    let resultLOG = JSON.parse(generateLOG);
    delete resultLOG[id];
    let refreshlogData = JSON.stringify(resultLOG, null, 2);
    fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
        if (err) {
            return console.error(err);
        }
    });
    
}
function setResultWithPrefix(originalResult:number,prefix: string){
    let result: number = originalResult;
    if (prefix ==="m"){
        result = result * 1000;
    }
    if (prefix ==="u"){
        result = result * 1000000;
    }
    if (prefix ==="n"){
        result = result * 1000000000;
    }
    if (prefix ==="p"){
        result = result * 1000000000000;
    }
    return +result;
}
function compareResults(userCalc: number, circuitResult: number, toleranceType?: string){
    console.log(circuitResult);
    let resultTolerance: number[] = [circuitResult - 0.005, circuitResult + 0.005];
    console.log(resultTolerance);
    if (+userCalc.toFixed(3) >= resultTolerance[0] && +userCalc.toFixed(3) <= resultTolerance[1]){
        return true;
    } else {
        return false;
    }
}
function searchResults(id, usrVolt, usrRes?, usrCur?,voltPref?,currentPref?){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    //console.log(resultLOG[id]);
    //let userThres: boolean = compareResults(usrRes, +resultLOG[id].thres);
    //let userVolt: boolean = compareResults(usrVolt, +resultLOG[id].thvolt);
    //let resCurrent: boolean = compareResults(usrCur, +resultLOG[id].resCurrent)
    
    if (usrCur === undefined && usrRes !== undefined && voltPref !== undefined && currentPref === undefined){
        let thvolt: number = setResultWithPrefix(resultLOG[id].thvolt,voltPref);
        //console.log('thvolt: '+thvolt);
        let userThres: boolean = compareResults(usrRes, +resultLOG[id].thres);
        let userVolt: boolean = compareResults(usrVolt, +thvolt);
        return {
            res: userThres,
            volt: userVolt,
            circuitTHres: +resultLOG[id].thres,
            circuitTHvolt: setResultWithPrefix(resultLOG[id].thvolt,voltPref),
            link: undefined
        };
    } else if (usrCur !== undefined && usrRes === undefined && voltPref !== undefined && currentPref !== undefined){
        console.log('BELEPETT');
        let resVolt: number = setResultWithPrefix(resultLOG[id].resVolt,voltPref);
        let resCur: number = setResultWithPrefix(resultLOG[id].resCurrent,currentPref);
        let usrResVolt: boolean = compareResults(usrVolt, +resVolt);
        let usrResCurrent: boolean = compareResults(usrCur, +resCur);
        return {
            current: usrResCurrent,
            volt: usrResVolt,
            resCur: setResultWithPrefix(resultLOG[id].resCurrent,currentPref),
            resVolt: setResultWithPrefix(resultLOG[id].resVolt,voltPref),
            link: undefined
        };
    }
}
function timeOutResult(id,voltPref?,currentPref?,type?){
    let generateLOG = fs.readFileSync('generateLOG.json');
    let resultLOG = JSON.parse(generateLOG);
    if (type === "6"){
        return {
            resCur: setResultWithPrefix(resultLOG[id].resCurrent,currentPref),
            resVolt: setResultWithPrefix(resultLOG[id].resVolt,voltPref)
        }
    } else {
        return {
            circuitTHres: +resultLOG[id].thres,
            circuitTHvolt: setResultWithPrefix(resultLOG[id].thvolt,voltPref),
        }
    }
    
}
function checkSolving(){
    let generateLOG = fs.readFileSync('generateLOG.json');
    if (generateLOG[0] === undefined){
        fs.writeFileSync('generateLOG.json',"{}", (err) => {
            if (err) {
                return console.error(err);
            }
        });
        generateLOG = fs.readFileSync('generateLOG.json');
    }
    let resultLOG = JSON.parse(generateLOG);
    let deleted: boolean = false;
    let difference; 
    console.log(Object.keys(resultLOG).length);
    
    if (Object.keys(resultLOG).length > 0){
        console.log('resultLOG elotte: ');
        console.log(resultLOG);
        for (let key in resultLOG) {
            if (resultLOG.hasOwnProperty(key)) {
                difference = timeDifference(new Date(),new Date(resultLOG[key].timestamp));
                console.log(key+': '+difference[0]+ ' day '+difference[1]+ ' hour '+difference[2]+ ' minute '+difference[3]+ ' sec.');
                if (difference[0] > 0 || difference[1] > 0 || difference[2] > 1 || difference[3] > 30  ){
                    console.log('van torolni vali');
                    deleted = true;
                    delete resultLOG[key];
                    //serverFunction.deleteDatatoJSONfile(key);
                }
            }
        }
        console.log('resultLOG torles utan: ');
        console.log(resultLOG);
        if (deleted){
            console.log('resultLOG utana: ');
            //setTimeout(() =>{
                let refreshlogData = JSON.stringify(resultLOG, null, 2);
                console.log(refreshlogData);
                fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
                    console.log(refreshlogData);
                    if (err) {
                        return console.error(err);
                    }
                });
            //},200);
            console.log('Idokorlaton tuli feladatok torolve!')
        } else {
            console.log('Minden feladat aktiv');
        }
    } else {
        console.log('Kiadott feladatok listaja ures!');
    }
}
function timeDifference(date1,date2) {
    let difference = date1 - date2;
    let daysDifference = Math.floor(difference/1000/60/60/24);
    difference -= daysDifference*1000*60*60*24

    let hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    let minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    let secondsDifference = Math.floor(difference/1000);

    //return daysDifference+ ' day '+hoursDifference+ ' hour '+minutesDifference+ ' minute '+secondsDifference+ ' sec.';
    return [daysDifference, hoursDifference, minutesDifference, secondsDifference];
}*/
//setInterval(this.checkSolving, chekTime);
let port = process.env.PORT || 3000;
let server=app.listen(port,function() {
    console.log('Listening to '+port+' port');
});