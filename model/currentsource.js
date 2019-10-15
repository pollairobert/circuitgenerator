"use strict";
exports.__esModule = true;
/**
 * Aramgenerator osztaly. Egyelore meg nem lett felhasznalva.
 */
var CurrentSource = /** @class */ (function () {
    /**
     * Konstruktor
     * @param current aramgenerator aramerteke
     * @param dir aramgenerator altal letrehozott aram iranya
     */
    function CurrentSource(current, dir) {
        this.id = 'C';
        this.coordinate = [];
        this.current = current;
        this.direction = dir;
        this.resistance = Infinity;
    }
    CurrentSource.prototype.setNumber = function (num) {
        this.number = num;
    };
    CurrentSource.prototype.getNumber = function () {
        return this.number;
    };
    CurrentSource.prototype.setVoltage = function (vol) {
        this.subsVoltage = vol;
    };
    CurrentSource.prototype.setInverzDirection = function () {
        throw new Error("Method not implemented.");
    };
    CurrentSource.prototype.cloneElements = function (element) {
        var currentSourceClone = new CurrentSource(element.getCurrent(), element.getDirection());
        currentSourceClone.setVoltage(element.getVoltage());
        return currentSourceClone;
    };
    CurrentSource.prototype.setResistance = function (res) {
        this.resistance = res;
    };
    CurrentSource.prototype.setCurrent = function (cur) {
        this.current = cur;
    };
    CurrentSource.prototype.setCoordinate = function (startX, startY, endX, endY) {
        this.coordinate.push(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));
    };
    CurrentSource.prototype.deleteCoordinateArray = function () {
        this.coordinate = [];
    };
    CurrentSource.prototype.setElementSize = function (size) {
        this.elementSize = size;
    };
    CurrentSource.prototype.replaceWire = function () {
        this.id = 'W';
    };
    CurrentSource.prototype.getElementSize = function () {
        return this.elementSize;
    };
    CurrentSource.prototype.getCoordinate = function () {
        return this.coordinate;
    };
    CurrentSource.prototype.getId = function () {
        return this.id;
    };
    CurrentSource.prototype.getResistance = function () {
        return this.resistance;
    };
    CurrentSource.prototype.getCurrent = function () {
        return this.current;
    };
    CurrentSource.prototype.getVoltage = function () {
        return this.subsVoltage;
    };
    CurrentSource.prototype.getDirection = function () {
        return this.direction;
    };
    return CurrentSource;
}());
exports.CurrentSource = CurrentSource;
