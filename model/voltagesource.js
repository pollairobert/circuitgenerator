"use strict";
exports.__esModule = true;
var VoltageSource = /** @class */ (function () {
    function VoltageSource(voltage, dir) {
        this.id = 'V';
        this.coordinate = [];
        this.voltage = voltage;
        this.direction = dir;
        this.resistance = 0;
    }
    VoltageSource.prototype.cloneElements = function (element) {
        var voltageSourceClone = new VoltageSource(element.getVoltage(), element.getDirection());
        voltageSourceClone.setCurrent(element.getCurrent());
        return voltageSourceClone;
    };
    VoltageSource.prototype.setNumber = function (num) {
        this.number = num;
    };
    VoltageSource.prototype.getNumber = function () {
        return this.number;
    };
    VoltageSource.prototype.setCurrent = function (cur) {
        this.current = cur;
    };
    VoltageSource.prototype.setVoltage = function (vol) {
        this.voltage = vol;
    };
    VoltageSource.prototype.setResistance = function (res) {
        this.resistance = res;
    };
    VoltageSource.prototype.setInverzDirection = function () {
        this.direction = !this.direction;
    };
    VoltageSource.prototype.setCoordinate = function (startX, startY, endX, endY) {
        this.coordinate.push(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));
    };
    VoltageSource.prototype.deleteCoordinateArray = function () {
        this.coordinate = [];
    };
    VoltageSource.prototype.setElementSize = function (size) {
        this.elementSize = size;
    };
    VoltageSource.prototype.replaceWire = function () {
        this.id = 'W';
    };
    VoltageSource.prototype.getElementSize = function () {
        return this.elementSize;
    };
    VoltageSource.prototype.getCoordinate = function () {
        return this.coordinate;
    };
    VoltageSource.prototype.getId = function () {
        return this.id;
    };
    VoltageSource.prototype.getResistance = function () {
        return this.resistance;
    };
    VoltageSource.prototype.getCurrent = function () {
        return this.current;
    };
    VoltageSource.prototype.getVoltage = function () {
        return this.voltage;
    };
    VoltageSource.prototype.getDirection = function () {
        return this.direction;
    };
    return VoltageSource;
}());
exports.VoltageSource = VoltageSource;
