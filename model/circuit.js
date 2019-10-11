"use strict";
exports.__esModule = true;
var Circuit = /** @class */ (function () {
    /**
     * Aramkor konstruktora, amely beallitja a szukseges ertkeit a prameterek alapjan
     * @param meshnumb az aramkorben letrehozott hurkok szama (technikai okok miatt a kivezetest is horokkent tarolja)
     * @param res aramkori ellanalasok darabszama
     * @param cur aramgeneratorok szama
     * @param volt feszultseggeneratorok szama
     * @param comm hurkok kozos againak szama (ez meg kerdeses, hogy marad-e)
     *
    constructor(meshnumb: number, res: number, cur: number, volt: number, comm: number) {
        this.numberOfMesh = meshnumb;
        this.numbOfResistance = res;
        this.numbOfCurrentSource = cur;
        this.numbOfVoltageSource = volt;
        this.numbOfCommonBranch = comm;
    }*/
    function Circuit(parameters) {
        this.meshes = [];
        this.theveninResistance = 0;
        this.theveninVoltage = 0;
        this.numberOfMesh = parameters[0];
        //this.numbOfResistance = parameters[1];
        this.numbOfCurrentSource = parameters[2];
        this.numbOfVoltageSource = parameters[3];
        this.circuitParameters = parameters;
    }
    Circuit.prototype.setMeshes = function (mesh) {
        this.meshes.push(mesh);
    };
    Circuit.prototype.setThevRes = function (res) {
        this.theveninResistance = res;
    };
    Circuit.prototype.setExpOutVolt = function (volt) {
        this.expectedOutputVoltage = volt;
    };
    /**
     * setNumberOfResistance
     */
    Circuit.prototype.setNumberOfResistors = function (number) {
        this.numbOfResistors = number;
    };
    Circuit.prototype.setThevVolt = function (volt) {
        this.theveninVoltage = volt;
    };
    Circuit.prototype.cloneCircuitMeshes = function (msh) {
        this.meshes.push(msh);
    };
    Circuit.prototype.cloneNumbOfMesh = function (num) {
        this.numberOfMesh = num;
    };
    Circuit.prototype.cloneTheveninResistance = function (res) {
        this.theveninResistance = res;
    };
    Circuit.prototype.cloneTheveninVoltage = function (volt) {
        this.theveninVoltage = volt;
    };
    Circuit.prototype.cloneNumbOfRes = function (num) {
        this.numbOfResistors = num;
    };
    Circuit.prototype.cloneNumbOfCurrentSource = function (num) {
        this.numbOfCurrentSource = num;
    };
    Circuit.prototype.cloneNumbOfVoltageSource = function (num) {
        this.numbOfVoltageSource = num;
    };
    Circuit.prototype.cloneCircuit = function (circ) {
        //var circuitClone: Circuit = new Circuit(circ.getNumberOfMesh(),circ.getNumbOfRes(),circ.getNumbOfCurrSource(),circ.getNumbOfVoltSource(),circ.getNumbOfCommonBranc());
        var circuitClone = new Circuit(this.circuitParameters);
        for (var i = 0; i < circ.getMeshes().length; i++) {
            circuitClone.cloneCircuitMeshes(circ.getMeshes()[i].cloneMesh(circ.getMeshes()[i]));
        }
        circuitClone.cloneNumbOfMesh(circ.getNumberOfMesh());
        circuitClone.cloneTheveninResistance(circ.getThevRes());
        circuitClone.cloneTheveninVoltage(circ.getThevVolt());
        circuitClone.cloneNumbOfRes(circ.getNumbOfRes());
        circuitClone.cloneNumbOfCurrentSource(circ.getNumbOfCurrSource());
        circuitClone.cloneNumbOfVoltageSource(circ.getNumbOfVoltSource());
        return circuitClone;
    };
    Circuit.prototype.setNumberOfMesh = function (number) {
        this.numberOfMesh = number;
    };
    Circuit.prototype.getThevRes = function () {
        return this.theveninResistance;
    };
    Circuit.prototype.getThevVolt = function () {
        return this.theveninVoltage;
    };
    Circuit.prototype.getMeshes = function () {
        return this.meshes;
    };
    Circuit.prototype.getNumberOfMesh = function () {
        return this.numberOfMesh;
    };
    Circuit.prototype.getNumbOfRes = function () {
        return this.numbOfResistors;
    };
    Circuit.prototype.getNumbOfVoltSource = function () {
        return this.numbOfVoltageSource;
    };
    Circuit.prototype.getNumbOfCurrSource = function () {
        return this.numbOfCurrentSource;
    };
    Circuit.prototype.getParameters = function () {
        return this.circuitParameters;
    };
    Circuit.prototype.getExpOutVolt = function () {
        return this.expectedOutputVoltage;
    };
    return Circuit;
}());
exports.Circuit = Circuit;
