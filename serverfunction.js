"use strict";
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
exports.__esModule = true;
/**
 * A server oldali fuggvenyeket osszegyujto osztaly.
 */
var Serverfunction = /** @class */ (function () {
    function Serverfunction() {
        this.fs = require('fs');
        this.checkTimeToSolvedTask = 50 * 60 * 1000; //ennyi ideig hagyja meg a generateLOG fajlban a generalt de valamiert nem torolt (pl oldal ujratoltes) feladatot.
    }
    /**
     * A kapott adatot (feladat informaciok) lementi a generateLOG.json fajlba.
     * @param pushData a menteni kivant adat
     */
    Serverfunction.prototype.addDatatoJSONfile = function (pushData) {
        var generateLOG = this.fs.readFileSync('generateLOG.json');
        if (generateLOG[0] === undefined) {
            generateLOG = '{}';
        }
        var resultLOG = JSON.parse(generateLOG);
        resultLOG[pushData.id] = pushData;
        delete resultLOG[pushData.id].falstadTXT;
        delete resultLOG[pushData.id].link;
        delete resultLOG[pushData.id].id;
        var pushlogData = JSON.stringify(resultLOG, null, 2);
        this.fs.writeFileSync('generateLOG.json', pushlogData, function (err) {
            if (err) {
                return console.error(err);
            }
        });
    };
    /**
     * A megadott ID-val rendelkezo feladat torleset vegzi el a LOG fajlbol
     * (megoldott feladat, lejart ido, valamint idokorlatun tul tarolt feladatokra)
     * @param id feladat ID
     */
    Serverfunction.prototype.deleteDatatoJSONfile = function (id) {
        var generateLOG = this.fs.readFileSync('generateLOG.json');
        var resultLOG = JSON.parse(generateLOG);
        delete resultLOG[id];
        var refreshlogData = JSON.stringify(resultLOG, null, 2);
        this.fs.writeFileSync('generateLOG.json', refreshlogData, function (err) {
            if (err) {
                return console.error(err);
            }
        });
    };
    /**
     * Ezt a fuggvenyt egy idozitoben hivja a fuggveny, hogy a LOG-olt feladatok letrehozasanak idejet ellenorizze.
     * Ha pedig bent ragadt valamilyen okbol egy feladat a LOG fajlban, akkor az idokorlatot meghaladot torli.
     */
    Serverfunction.prototype.checkSolving = function () {
        var generateLOG = this.fs.readFileSync('generateLOG.json');
        var resultLOG = JSON.parse(generateLOG);
        var deleted = false;
        var difference;
        if (Object.keys(resultLOG).length > 0) {
            for (var key in resultLOG) {
                if (resultLOG.hasOwnProperty(key)) {
                    difference = this.timeDifference(new Date(), new Date(resultLOG[key].timestamp));
                    if (difference[0] > 0 || difference[1] > 23 /*|| difference[2] > 5 || difference[3] > 25 */) {
                        deleted = true;
                        delete resultLOG[key];
                    }
                }
            }
            if (deleted) {
                var refreshlogData = JSON.stringify(resultLOG, null, 2);
                this.fs.writeFileSync('generateLOG.json', refreshlogData, function (err) {
                    if (err) {
                        return console.error(err);
                    }
                });
                console.log('Idokorlaton tuli feladatok torolve!');
            }
        }
        else {
            console.log('Kiadott feladatok listaja ures!');
        }
        return;
    };
    /**
     * Kiszamolja ket idopont kozott eltelt ido.
     * @param date1 egyik idopont
     * @param date2 masik idopont
     */
    Serverfunction.prototype.timeDifference = function (date1, date2) {
        var difference = date1 - date2;
        var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
        difference -= daysDifference * 1000 * 60 * 60 * 24;
        var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
        difference -= hoursDifference * 1000 * 60 * 60;
        var minutesDifference = Math.floor(difference / 1000 / 60);
        difference -= minutesDifference * 1000 * 60;
        var secondsDifference = Math.floor(difference / 1000);
        return [daysDifference, hoursDifference, minutesDifference, secondsDifference];
    };
    /**
     * Megviszgalja server inditasakor, hogy letezik-e a generateLOG.json fajl es ha nem akkor letrehozza.
     */
    Serverfunction.prototype.checkExistTaskLOGfile = function () {
        if (!this.fs.existsSync('generateLOG.json')) {
            this.fs.writeFileSync('generateLOG.json', '{}', function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    };
    /**
     * Idozito, ami megadott idonkent lefuttatja a feladat ellenorzo fuggvenyt.
     */
    Serverfunction.prototype.intervalTimer = function () {
        var _this = this;
        setInterval(function () { return _this.checkSolving(); }, this.checkTimeToSolvedTask);
    };
    return Serverfunction;
}());
exports.Serverfunction = Serverfunction;
