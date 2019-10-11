"use strict";
exports.__esModule = true;
var Wire = /** @class */ (function () {
    function Wire() {
        this.id = 'W';
        this.resistance = 0;
        this.voltage = 0;
        this.coordinate = [];
    }
    /*constructor(){
        wireCounter += 1;
    }*/
    Wire.prototype.setInverzDirection = function () {
        throw new Error("Method not implemented.");
    };
    Wire.prototype.cloneElements = function (element) {
        var wireClone = new Wire();
        wireClone.setCurrent(element.getCurrent());
        //wireClone.setCoordinate(element.getCoordinate()[0],element.getCoordinate()[1],element.getCoordinate()[2],element.getCoordinate()[3]);
        return wireClone;
    };
    Wire.prototype.setNumber = function (num) {
        this.number = num;
    };
    Wire.prototype.getNumber = function () {
        return this.number;
    };
    Wire.prototype.setVoltage = function (vol) {
        this.voltage = vol;
    };
    Wire.prototype.setResistance = function (res) {
        this.resistance = res;
    };
    Wire.prototype.setCurrent = function (cur) {
        this.current = cur;
    };
    Wire.prototype.setCoordinate = function (startX, startY, endX, endY) {
        this.coordinate.push(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));
    };
    Wire.prototype.replaceWire = function () {
        this.id = 'W';
    };
    Wire.prototype.deleteCoordinateArray = function () {
        this.coordinate = [];
    };
    Wire.prototype.setElementSize = function (size) {
        this.elementSize = size;
    };
    Wire.prototype.getElementSize = function () {
        return this.elementSize;
    };
    Wire.prototype.getCoordinate = function () {
        return this.coordinate;
    };
    Wire.prototype.getId = function () {
        return this.id;
    };
    Wire.prototype.getResistance = function () {
        return this.resistance;
    };
    Wire.prototype.getCurrent = function () {
        return this.current;
    };
    Wire.prototype.getVoltage = function () {
        return this.voltage;
    };
    Wire.prototype.getDirection = function () {
        return false;
    };
    return Wire;
}());
exports.Wire = Wire;
