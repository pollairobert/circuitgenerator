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
var mesh_1 = require("./mesh");
var circuitgenerator_1 = require("./circuitgenerator");
var circuitanalyzer_1 = require("./circuitanalyzer");
/**
 * Szerver oldalon a logika belepesi pontja.
 */
var Main = /** @class */ (function () {
    function Main() {
    }
    /**
     * Ezzel a metodussal indul a halozat generalasa es megoldasa a feladattipusnak megfeleloen.
     * Majd itt kap erteket a szervertol kuldott valasz objektum is a halozatanalizis ertekeive,
     * hogy kliens oldalon elvegezheto legyen a felhasznalo altal beirt ertekek helyessegellenorzese.
     * A kliens-szerver kozotti keres-valasz kommunikacio csokkentese miatt dontottem a mellet,
     * hogy a kliens oldalon tortenjen az ellenorzes. Igaz, hogy a valasz nincs encryptelve (meg),
     * de a cel a felhasznalonak is a gyakorlas, attol, hogy a bongeszo megfelelo funkcioival meg tudja
     * nezni a valasz objektum tartalmat konzolra iratas nelkul is.
     *
     * Lehetosege van a felhasznalonak bizonyos feladatoknal megadni a hurokszamot, akkor a fuggveny ezt a parametert is megkapja,
     * majd ennek megfeleloen hivja meg az aramkort letrehozo fuggvenyt.
     * @param type feladat tipusa
     * @param pieceOfMesh felhasznalo altal megadott hurokszam (opcionalis)
     */
    Main.prototype.start = function (type, pieceOfMesh) {
        var cg = new circuitgenerator_1.CircuitGenerator();
        var can = new circuitanalyzer_1.CircuitAnalyzer();
        var circuit;
        var typeArray = [2, 3, 3.1, 4, 5];
        var temptype = type;
        var measurementError = [];
        if (type === 2) {
            temptype = cg.randomChoiseTwoNumber(2, 2.1);
        }
        if (type === 6) {
            temptype = 6;
            can.setQuestionOrVoltmeterResistance(cg.randomE6Resistance());
        }
        if (type === 7) {
            temptype = cg.randomChoiseTwoNumber(4, 5);
            can.setQuestionOrVoltmeterResistance(10000000);
        }
        if (type === 8) {
            if (pieceOfMesh !== undefined) {
                temptype = cg.randomChoiseTwoNumber(4, 5);
            }
            else {
                temptype = cg.randomChoiseInAnyArray(typeArray);
            }
            can.setConnectedVoltagesourceValue(cg.randomVoltageSourceValue());
            can.setConnectedVoltagesourceResistance(cg.randomE6Resistance());
        }
        if (pieceOfMesh !== undefined) {
            circuit = cg.generateCircuit(temptype, pieceOfMesh);
        }
        else {
            circuit = cg.generateCircuit(temptype);
        }
        if (type === 10) {
            var paralellRes = void 0;
            var inputVoltage = void 0;
            var found = [false, false];
            for (var i = 0; i < circuit.getMeshes()[0].getBranches().length; i++) {
                for (var j = 0; j < circuit.getMeshes()[0].getBranches()[i].getBranchElements().length; j++) {
                    if (!found[0]) {
                        if (circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getId() === "V") {
                            found[0] = true;
                            inputVoltage = circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getVoltage();
                        }
                    }
                    if (!found[1]) {
                        if (circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getId() === "R") {
                            found[1] = true;
                            paralellRes = circuit.getMeshes()[0].getBranches()[i].getBranchElements()[j].getResistance();
                        }
                    }
                }
            }
            var r3resistance = this.calculateTask10R3resistanceValue(paralellRes, inputVoltage, circuit.getExpOutVolt());
            for (var i = 0; i < circuit.getMeshes()[1].getBranches().length; i++) {
                if (circuit.getMeshes()[1].getBranches()[i].getType() !== circuit.getMeshes()[1].getCommonBranchesArray()[0][0]) {
                    for (var j = 0; j < circuit.getMeshes()[1].getBranches()[i].getBranchElements().length; j++) {
                        if (circuit.getMeshes()[1].getBranches()[i].getBranchElements()[j].getId() === "R") {
                            circuit.getMeshes()[1].getBranches()[i].getBranchElements()[j].setResistance(r3resistance);
                        }
                    }
                }
            }
            cg.getCircuitResistorsDetails().push("R3 " + r3resistance);
        }
        can.analyzeCircuit(circuit);
        cg.setMultiplyResistorInBranch(cg.getCircuitResistorsDetails());
        this.circuitCoordinateArray = cg.getCircuitCoordinatesToFalstad();
        this.falstadLink = cg.generateFalstadLink(circuit, type, ((type === 6 || type === 7) ? can.getQuestionRes() : can.getConnectedVoltagesourceResistance()), can.getConnectedVoltagesourceValue());
        if (type === 7) {
            measurementError = this.calculateMeasurementError(can.getQuestionResVoltage(), can.getResultOfTheveninVoltage());
        }
        var randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.taskResults = {
            falstadTXT: this.getCircuitCoordinateArray(),
            link: this.getFalstadLink(),
            id: randomID,
            thVolt: can.getResultOfTheveninVoltage(),
            thRes: can.getResultOfTheveninResistance(),
            resCurrent: can.getQuestionResCurrent(),
            resVolt: can.getQuestionResVoltage(),
            absError: measurementError[0],
            relError: measurementError[1],
            terminalVolt: can.getOutputVoltageWithConnectedVoltageSource(),
            resValue: can.getQuestionRes(),
            connVSRes: can.getConnectedVoltagesourceResistance(),
            connVSVolt: can.getConnectedVoltagesourceValue(),
            resistorDetails: undefined,
            multiResInBranch: undefined,
            expectedOutVoltage: undefined,
            tasktime: undefined,
            timestamp: new Date()
        };
        if (type >= 4 && type < 9) {
            this.taskResults["tasktime"] = this.calculateTaskTime(circuit);
        }
        if (type === 10) {
            this.taskResults["expectedOutVoltage"] = circuit.getExpOutVolt();
        }
        if (type === 9 || type === 10) {
            this.taskResults["resistorDetails"] = cg.getCircuitResistorsDetails();
            this.taskResults["multiResInBranch"] = cg.getMultiplyResistorInBranch();
        }
        mesh_1.resetMeshCounter();
    };
    /**
     * Csak es kizarolag az Aramkor keresese II. tipusu feladathoz tartozo R3 ellenallas erteket adja meg
     * a parameterek megfelelo szamolasaval.
     * @param paralellResistorsValue parhozamosan kotott R1 es R2 ellenallasok erteke
     * @param inputVoltage a maximalis feszultseg, amit a bemenet hataroz meg.
     * @param expextedOutputVoltage elvart kimeneti feszultseg legnagyobb erteke.
     */
    Main.prototype.calculateTask10R3resistanceValue = function (paralellResistorsValue, inputVoltage, expextedOutputVoltage) {
        var resultingResistance = ((paralellResistorsValue * paralellResistorsValue) / (paralellResistorsValue + paralellResistorsValue));
        var r3resistance = ((resultingResistance * expextedOutputVoltage) / (inputVoltage - expextedOutputVoltage));
        return r3resistance;
    };
    /**
     * Kiszamolja es egy tombben eltarolja az abszolut es relativ hiba nagysagat a megfelelo feladattipusnal.
     * @param measuredVoltage mert ertek
     * @param realVoltage a halozat kimeneti erteke
     */
    Main.prototype.calculateMeasurementError = function (measuredVoltage, realVoltage) {
        var measurementErr = [];
        var absolutError = Math.abs(measuredVoltage) - Math.abs(realVoltage);
        var relativeError = (Math.abs(absolutError) / Math.abs(measuredVoltage)) * 100;
        measurementErr.push(Math.abs(absolutError), relativeError);
        return measurementErr;
    };
    /**
     * A parameterul kapott aramkor hurokszamanak megfeleloen beallit egy standard idokrlatot a feladat megoldasahoz.
     * @param circuit aramkor objektum
     */
    Main.prototype.calculateTaskTime = function (circuit) {
        var time = 10 + ((circuit.getNumberOfMesh() - 3) * 10);
        return time;
    };
    /**
     * Az osztaly propertykhez tartozo getter metodusok.
     */
    Main.prototype.getTaskResults = function () {
        return this.taskResults;
    };
    Main.prototype.getVoltagePrefix = function () {
        return this.voltegePrefix;
    };
    Main.prototype.getCurrentPrefix = function () {
        return this.currentPrefix;
    };
    Main.prototype.getOhmPrefix = function () {
        return this.ohmPrefix;
    };
    Main.prototype.getMeasurementVoltPrefix = function () {
        return this.measurementVoltPrefix;
    };
    Main.prototype.getCircuitCoordinateArray = function () {
        return this.circuitCoordinateArray;
    };
    Main.prototype.getFalstadLink = function () {
        return this.falstadLink;
    };
    return Main;
}());
exports.Main = Main;
