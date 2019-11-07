"use strict";
exports.__esModule = true;
var resistance_1 = require("./resistance");
var currentsource_1 = require("./currentsource");
var voltagesource_1 = require("./voltagesource");
var branch_1 = require("./branch");
var mesh_1 = require("./mesh");
var circuit_1 = require("./circuit");
var math = require("mathjs");
var CircuitAnalyzer = /** @class */ (function () {
    function CircuitAnalyzer() {
        this.circuitResultingResistance = 0;
    }
    /**
    * Kivulrol ezt a metodust kell hivni az aramkor analizalasahoz, ez a belepesi pontja az osztalynak.
    * @param circuit aramkor obj.
    */
    CircuitAnalyzer.prototype.analyzeCircuit = function (circuit) {
        this.circuit = circuit;
        this.finalCalculateOfTheveninSubstitutes(this.circuit);
    };
    /**
     * Ellenallas matrix modszerevel kiszamolja a halozat aramvektorat, azaz a hurokaramokat.
     * @param circuit aramkor objektum
     */
    CircuitAnalyzer.prototype.calculateCurrentVector = function (circuit) {
        var currentVector = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(), 1]);
        currentVector = math.multiply(math.inv(this.calculateResistanceMatrix(circuit)), this.calculateVoltageVector(circuit));
        return currentVector;
    };
    /**
     * Letrehozza az ellenallas matrix modszerhez szukseges feszultsegvektoret a hurokhoz tartozo feszultsegertekekbol.
     * @param circuit aramkor objektum
     */
    CircuitAnalyzer.prototype.calculateVoltageVector = function (circuit) {
        var voltageVector = math.matrix();
        voltageVector.resize([circuit.getNumberOfMesh(), 1]);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
            voltageVector.subset(math.index(i, 0), circuit.getMeshes()[i].getMeshVoltage());
        }
        return voltageVector;
    };
    /**
     * A parameterben megadott aramkor objektum ellenallas-matrixat allitja elo.
     * Altalanos metodus, ami a dokumentacioban leirt modon generalt barmely halozathoz hasznalhato.
     * @param circuit aramkor objektumot var
     */
    CircuitAnalyzer.prototype.calculateResistanceMatrix = function (circuit) {
        var resistanceMatrix = math.matrix();
        resistanceMatrix.resize([circuit.getNumberOfMesh(), circuit.getNumberOfMesh()]);
        for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
            for (var j = i; j < circuit.getNumberOfMesh(); j++) {
                if (i === j) {
                    resistanceMatrix.subset(math.index(i, j), circuit.getMeshes()[i].getMeshResistance());
                }
                else {
                    for (var k = 0; k < circuit.getMeshes()[j].getBranches().length; k++) {
                        if (circuit.getMeshes()[j].getBranches()[k].getCommon() > circuit.getMeshes()[j].getMeshNumber()) {
                            if ((circuit.getMeshes()[j].getBranches()[k].getCommon() - circuit.getMeshes()[j].getMeshNumber()) === circuit.getMeshes()[i].getMeshNumber()) {
                                resistanceMatrix.subset(math.index(i, j), (circuit.getMeshes()[j].getBranches()[k].getBranchResistance() * -1));
                            }
                        }
                    }
                    resistanceMatrix.subset(math.index(j, i), resistanceMatrix.subset(math.index(i, j)));
                }
            }
        }
        console.log(resistanceMatrix);
        return resistanceMatrix;
    };
    /**
     * Meghatarozza a parameterul kapott aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     */
    CircuitAnalyzer.prototype.calculateCircuitResultingResistance = function (circuit) {
        var th2PoleMeshNumber;
        var th2PoleBranchType;
        var th2PoleNumberOfBranch;
        var commonAndTh2Pole;
        var cloneCircuit = circuit.cloneCircuit(circuit);
        for (var i = 0; i < cloneCircuit.getNumberOfMesh(); i++) {
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0) {
                cloneCircuit.getMeshes()[i].clearMeshVoltage();
            }
            for (var j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++) {
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()) {
                    if (cloneCircuit.getMeshes()[i].getBranches()[j].getCommon() !== cloneCircuit.getMeshes()[i].getMeshNumber()) {
                        commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                    }
                    for (var k = 0; k < cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++) {
                        if (cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R') {
                            this.questionOrVoltmeterResistance = cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance();
                        }
                    }
                    th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    th2PoleNumberOfBranch = j;
                    th2PoleMeshNumber = i + 1;
                }
            }
        }
        return this.calculateResultingResistance(10, this.calculateTh2PoleBranchCurrent(cloneCircuit, commonAndTh2Pole, th2PoleBranchType, th2PoleNumberOfBranch, th2PoleMeshNumber, this.questionOrVoltmeterResistance));
    };
    /**
     * Az aramkor vegso analiziseert felel.
     * Meghatarozza a halozat Thevenin ellenallasat, majd a keresett 2 polus kozotti rovidzarasi aram segitsegevel
     * meghatarozza a thevenin helyettesito feszultseget a halozatnak.
     * @param circuit aramkor objektumot var
     */
    CircuitAnalyzer.prototype.finalCalculateOfTheveninSubstitutes = function (circuit) {
        var tempRes;
        this.resultOfTheveninResistance = this.calculateCircuitResultingResistance(circuit);
        circuit.setThevRes(this.resultOfTheveninResistance);
        this.resultOfTheveninVoltage = this.resultOfTheveninResistance * this.calculateTh2PoleBranchCurrent(circuit);
        circuit.setThevVolt(this.resultOfTheveninVoltage);
        if (this.questionOrVoltmeterResistance !== undefined) {
            this.calculateQuestionResistancCurrentAndVoltage(circuit.getThevRes(), circuit.getThevVolt(), this.questionOrVoltmeterResistance);
        }
        if (this.connectedVoltagesourceInsideResistance !== undefined && this.connectedVoltagesourceValue !== undefined) {
            this.outpuVoltageWithconnectedVoltagesource = this.calculateConectedVoltagsourceAndInsideResistance(circuit.getThevVolt(), circuit.getThevRes(), this.connectedVoltagesourceValue, this.connectedVoltagesourceInsideResistance);
        }
    };
    /**
     * Ellenallas szamolasahoz metodus Ohm torvenye alapjan.
     * @param voltage feszultseg ertek
     * @param current aram ertek
     */
    CircuitAnalyzer.prototype.calculateResultingResistance = function (voltage, current) {
        return voltage / current;
    };
    /**
     * Kotelezo parametere a circuit, ami egy halozat objektum.A tobbi parametertol fuggoen tudja a metodus, hogy pl. belso 2 polus van-e
     * Ennek a halozatnak a megadott ket polusa kozotti rovidzarasi aramot adja vissza.
     * Az aramkor osszes agaban megadja az elenalasokom eso feszultseget es folyo aramot DE!!! A 2 POLUST ROVIDZARNAK TEKINTI, tehat
     * olyan, mintha lenne plusz egy hurok a rendszerben, igy nem konkretan a megjelenitett halozat elem ertekeit adja vissza.
     * @param circuit teljes aramkor
     * @param commonAndTh2Pole kozos agban levo 2 polus
     * @param th2PoleBranchType 2 polust tartalmazo Branch tipusa
     * @param th2PoleNumberOfBranch  2 polsut tartalmazo branch sorszama az ot tartalmazo mesh-ben (tombindex)
     * @param th2PoleMeshNumber 2 polsut tartalmazo branch ebben a szamu mesh-ben van
     */
    CircuitAnalyzer.prototype.calculateTh2PoleBranchCurrent = function (circuit, commonAndTh2Pole, th2PoleBranchType, th2PoleNumberOfBranch, th2PoleMeshNumber, quesRes) {
        var th2PoleCurrent;
        var currentVector;
        if (commonAndTh2Pole === undefined && th2PoleBranchType !== undefined && th2PoleNumberOfBranch !== undefined && th2PoleMeshNumber !== undefined) {
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches().splice(th2PoleNumberOfBranch, 1, new branch_1.Branch(th2PoleBranchType, th2PoleMeshNumber - 1));
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new voltagesource_1.VoltageSource(10, false));
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            var mesh = circuit.getMeshes()[th2PoleMeshNumber - 1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            currentVector = this.calculateCurrentVector(circuit);
        }
        else if (commonAndTh2Pole === undefined && th2PoleBranchType === undefined && th2PoleNumberOfBranch === undefined && th2PoleMeshNumber === undefined) {
            currentVector = this.calculateCurrentVector(circuit);
        }
        else {
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches().splice(th2PoleNumberOfBranch, 1, new branch_1.Branch(th2PoleBranchType, th2PoleMeshNumber - 1));
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].setCommon((commonAndTh2Pole - th2PoleMeshNumber));
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new voltagesource_1.VoltageSource(10, false));
            circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            var mesh = circuit.getMeshes()[th2PoleMeshNumber - 1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            for (var i = 0; i < circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber) - 1].getBranches().length; i++) {
                if (circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber) - 1].getBranches()[i].getCommon() === commonAndTh2Pole) {
                    circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber) - 1].getBranches()[i].setBranchElements(this.copyCommonElement(circuit.getMeshes()[th2PoleMeshNumber - 1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                    var mesh_2 = circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber) - 1];
                    mesh_2.setMeshVoltage(mesh_2.getBranches()[i]);
                }
            }
            currentVector = this.calculateCurrentVector(circuit);
        }
        for (var i = 0; i < circuit.getNumberOfMesh(); i++) {
            for (var j = 0; j < circuit.getMeshes()[i].getBranches().length; j++) {
                circuit.getMeshes()[i].getBranches()[j].setCurrent(currentVector);
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()) {
                    th2PoleCurrent = circuit.getMeshes()[i].getBranches()[j].getCurrent();
                }
                for (var k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++) {
                    if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R') {
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setCurrent(circuit.getMeshes()[i].getBranches()[j].getCurrent());
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setVoltage(0);
                    }
                }
            }
        }
        return th2PoleCurrent;
    };
    /**
     * A meromuszeres es a keresett ellenallasos feladattipushoz szukseges metodus, mely a mar megkapott thevenin helyettesites ertekeivel
     * egy szimpla egyszeru feszoszto keplettel kiszamolja a keresett ertekeket.
     * @param thRes Thevenin helyettesito ellenallas
     * @param thVoltage Thevenin helyettesito feszultseg
     * @param questRes Keresett ellenallas, vagy a meromuszer belso ellenallasa.
     */
    CircuitAnalyzer.prototype.calculateQuestionResistancCurrentAndVoltage = function (thRes, thVoltage, questRes) {
        this.questionOrVoltmeterResistanceVoltage = thVoltage * (questRes / (questRes + thRes));
        this.questionOrVoltmeterResistanceCurrent = this.questionOrVoltmeterResistanceVoltage / questRes;
    };
    /**
     * A generalt halozathoz csatlakoztatott masik feszgen (ismert V es belso R) hatasa utan kialakult kapocsfeszultseget szamolja ki
     * @param theveninvoltage Thevenin helyettesito feszultseg
     * @param theveninresistance Thevenin helyettesito ellenallas
     * @param connvoltage Csatlakoztatott feszgen feszultsege
     * @param connresistance Csatlakoztatott feszgen belso ellenallasa
     */
    CircuitAnalyzer.prototype.calculateConectedVoltagsourceAndInsideResistance = function (theveninvoltage, theveninresistance, connvoltage, connresistance) {
        var connectedCircuit = new circuit_1.Circuit([2, 0, 0, 0] /*this.circuitParameterLimits(1)*/);
        for (var h = 0; h < connectedCircuit.getNumberOfMesh(); h++) {
            connectedCircuit.setMeshes(new mesh_1.Mesh());
            for (var i = 0; i < 4; i++) {
                connectedCircuit.getMeshes()[h].setBranches(new branch_1.Branch(i, h));
            }
        }
        connectedCircuit.getMeshes()[0].getBranches()[0].setBranchElements(new voltagesource_1.VoltageSource(math.abs(theveninvoltage), (theveninvoltage < 0 ? true : false)));
        connectedCircuit.getMeshes()[0].getBranches()[1].setBranchElements(new resistance_1.Resistance(theveninresistance));
        connectedCircuit.getMeshes()[1].getBranches()[2].setBranchElements(new voltagesource_1.VoltageSource(connvoltage, true));
        connectedCircuit.getMeshes()[1].getBranches()[1].setBranchElements(new resistance_1.Resistance(connresistance));
        connectedCircuit.getMeshes()[0].getBranches()[2].setCommon(2);
        connectedCircuit.getMeshes()[1].getBranches()[0].setCommon(1);
        connectedCircuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
        for (var i = 0; i < connectedCircuit.getMeshes().length; i++) {
            for (var j = 0; j < connectedCircuit.getMeshes()[i].getBranches().length; j++) {
                var mesh = connectedCircuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
            }
        }
        connectedCircuit.setThevRes(this.calculateCircuitResultingResistance(connectedCircuit));
        connectedCircuit.setThevVolt(connectedCircuit.getThevRes() * this.calculateTh2PoleBranchCurrent(connectedCircuit));
        return connectedCircuit.getThevVolt();
    };
    /**
     * A kozos agakban szereplo aramkori elemek masolasat vegzi.
     * A generatoroknal forditja az iranyt, mivel a ket szomszedos hurokban maskepp hatnak.
     * @param element egy aramkori elemet var
     */
    CircuitAnalyzer.prototype.copyCommonElement = function (element) {
        var circuitelement;
        if (element.getId() === 'R') {
            circuitelement = new resistance_1.Resistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            circuitelement = new voltagesource_1.VoltageSource(element.getVoltage(), !element.getDirection());
        }
        if (element.getId() === 'C') {
            circuitelement = new currentsource_1.CurrentSource(element.getVoltage(), !element.getDirection());
        }
        return circuitelement;
    };
    /**
     * Az osztaly tulajdonsagokhoz tartozo GETTER es SETTER metodusok
     */
    CircuitAnalyzer.prototype.setQuestionOrVoltmeterResistance = function (value) {
        this.questionOrVoltmeterResistance = value;
    };
    CircuitAnalyzer.prototype.setConnectedVoltagesourceValue = function (value) {
        this.connectedVoltagesourceValue = value;
    };
    CircuitAnalyzer.prototype.setConnectedVoltagesourceResistance = function (value) {
        this.connectedVoltagesourceInsideResistance = value;
    };
    CircuitAnalyzer.prototype.getConnectedVoltagesourceValue = function () {
        return this.connectedVoltagesourceValue;
    };
    CircuitAnalyzer.prototype.getConnectedVoltagesourceResistance = function () {
        return this.connectedVoltagesourceInsideResistance;
    };
    CircuitAnalyzer.prototype.getOutputVoltageWithConnectedVoltageSource = function () {
        return this.outpuVoltageWithconnectedVoltagesource;
    };
    CircuitAnalyzer.prototype.getCircuitCurrentVector = function () {
        return this.circuitCurrentVector;
    };
    CircuitAnalyzer.prototype.getCircuitVoltageVector = function () {
        return this.circuitVoltageVector;
    };
    CircuitAnalyzer.prototype.getCircuitResistanceMatrix = function () {
        return this.circuitResistanceMatrix;
    };
    CircuitAnalyzer.prototype.getCircuitResultingResistance = function () {
        return this.circuitResultingResistance;
    };
    CircuitAnalyzer.prototype.getResultOfTheveninResistance = function () {
        return this.resultOfTheveninResistance;
    };
    CircuitAnalyzer.prototype.getResultOfTheveninVoltage = function () {
        return this.resultOfTheveninVoltage;
    };
    CircuitAnalyzer.prototype.getQuestionResVoltage = function () {
        return this.questionOrVoltmeterResistanceVoltage;
    };
    CircuitAnalyzer.prototype.getQuestionRes = function () {
        return this.questionOrVoltmeterResistance;
    };
    CircuitAnalyzer.prototype.getQuestionResCurrent = function () {
        return this.questionOrVoltmeterResistanceCurrent;
    };
    return CircuitAnalyzer;
}());
exports.CircuitAnalyzer = CircuitAnalyzer;
