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
  * NODE Szerver letrehozasa itt tortenik. Itt van lekezelve a kliens - szerver kapcsolat.
  */
import { Main } from './main';
import { Serverfunction } from './serverfunction';


const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let fs = require('fs');
let serverFunction: Serverfunction = new Serverfunction();
serverFunction.checkExistTaskLOGfile();

serverFunction.intervalTimer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('svg'));
app.use(express.static('scripts'));
app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/scripts/circuitjQuery.js', (req,res)=> {
    res.sendFile(path.join(__dirname + '/scripts/circuitjQuery.js'));
});
app.get('/scripts/clientVariables.js', (req,res)=> {
    res.sendFile(path.join(__dirname + '/scripts/clientVariables.js'));
});
app.get('/scripts/clientFunction.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/scripts/clientFunction.js'));
});
app.get('/scripts/canvas.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/scripts/canvas.js'));
});
app.get('/css/generator.css', function (req, res) {
    res.sendFile(path.join(__dirname + '/css/generator.css'));
});
app.get('/generate', function (req, res) {
    serverFunction.checkExistTaskLOGfile();
    let main: Main = new Main();
    let type: number;
    type = +req.query.type;
    if (req.query.id !== undefined){
        serverFunction.deleteDatatoJSONfile(req.query.id);
        console.log('Nem megoldott feladat, ujrageneralas tortent');
    }
    if (req.query.mesh !== undefined){
        main.start(type,+req.query.mesh);
    } else {
        main.start(type);
    }
    
    let generateResponse = main.getTaskResults();
    res.send(JSON.stringify(generateResponse));
    serverFunction.addDatatoJSONfile(main.getTaskResults());
});
app.get('/timeout', (req, res) => {
    let id = req.query.id;
    serverFunction.deleteDatatoJSONfile(id);
    res.send('Task removed!');
});
let port = process.env.PORT || 3000;
let server=app.listen(port,function() {
    console.log('Listening to '+port+' port');
});