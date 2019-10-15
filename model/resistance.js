"use strict";
exports.__esModule = true;
var Resistance = /** @class */ (function () {
    /**
     * Konstruktor
     * @param resistance ellenallas ertekenek beallitasahoz
     */
    function Resistance(resistance) {
        this.id = 'R';
        this.coordinate = [];
        this.resistance = resistance;
    }
    Resistance.prototype.setNumber = function (num) {
        this.number = num;
    };
    Resistance.prototype.setCurrent = function (cur) {
        this.current = cur;
    };
    Resistance.prototype.setResistance = function (res) {
        this.resistance = res;
    };
    /**
     * Az ot tartalmazo ag aramanak ismereteben kiszamolj a rajta eso feszultseget.
     */
    Resistance.prototype.setVoltage = function (vol) {
        if ((this.resistance !== undefined) && (this.current !== undefined)) {
            this.voltage = this.current * this.resistance;
        }
        else {
            this.voltage = 0;
        }
    };
    Resistance.prototype.cloneElements = function (element) {
        var resistanceClone = new Resistance(element.getResistance());
        resistanceClone.setCurrent(element.getCurrent());
        resistanceClone.setVoltage(0);
        return resistanceClone;
    };
    Resistance.prototype.setInverzDirection = function () {
        throw new Error("Method not implemented.");
    };
    Resistance.prototype.setCoordinate = function (startX, startY, endX, endY) {
        this.coordinate.push(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));
    };
    Resistance.prototype.deleteCoordinateArray = function () {
        this.coordinate = [];
    };
    Resistance.prototype.setElementSize = function (size) {
        this.elementSize = size;
    };
    Resistance.prototype.replaceWire = function () {
        this.id = 'W';
    };
    Resistance.prototype.getNumber = function () {
        return this.number;
    };
    Resistance.prototype.getElementSize = function () {
        return this.elementSize;
    };
    Resistance.prototype.getCoordinate = function () {
        return this.coordinate;
    };
    Resistance.prototype.getId = function () {
        return this.id;
    };
    Resistance.prototype.getResistance = function () {
        return this.resistance;
    };
    Resistance.prototype.getCurrent = function () {
        return this.current;
    };
    Resistance.prototype.getVoltage = function () {
        return this.voltage;
    };
    Resistance.prototype.getDirection = function () {
        return false;
    };
    return Resistance;
}());
exports.Resistance = Resistance;
