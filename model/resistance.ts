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
import { CircuitElements } from "./interfaceCircElement";

export class Resistance implements CircuitElements {
    private id = 'R';
    private number: number;
    private resistance: number;
    private current: number;
    private voltage: number;
    private coordinate: number[] = [];
    private elementSize: number;
    /**
     * Konstruktor
     * @param resistance ellenallas ertekenek beallitasahoz
     */
    constructor(resistance: number) {
        this.resistance = resistance;
    }
    public setNumber(num: number): void {
        this.number = num;
    }
    public setCurrent(cur: number): void {
        this.current = cur;
    }
    public setResistance(res: number): void {
        this.resistance = res;
    }
    /**
     * Az ot tartalmazo ag aramanak ismereteben kiszamolj a rajta eso feszultseget.
     */
    public setVoltage(vol: number): void {
        if ((this.resistance !== undefined) && (this.current !== undefined)) {
            this.voltage = this.current * this.resistance;
        } else {
            this.voltage = 0;
            //console.log('Hianyzo ertek');
        }

    }
    public cloneElements(element: CircuitElements): CircuitElements {
        var resistanceClone: CircuitElements = new Resistance(element.getResistance());
        resistanceClone.setCurrent(element.getCurrent());
        resistanceClone.setVoltage(0);
        return resistanceClone;
    }
    public setInverzDirection(): void {
        throw new Error("Method not implemented.");
    }
    public setCoordinate(startX: number, startY: number, endX: number, endY: number): void {
        this.coordinate.push(Math.round(startX),Math.round(startY),Math.round(endX),Math.round(endY));
    }
    public deleteCoordinateArray(): void{
        this.coordinate = [];
    }
    public setElementSize(size: number): void {
        this.elementSize = size;
    }
    public replaceWire(): void {
        this.id = 'W';
    }
    public getNumber(): number {
        return this.number;
    }
    public getElementSize(): number {
        return this.elementSize;
    }
    public getCoordinate(): number[]{
        return this.coordinate;
    }
    public getId() {
        return this.id;
    }

    public getResistance() {
        return this.resistance;
    }

    public getCurrent() {
        return this.current;
    }

    public getVoltage() {
        return this.voltage;
    }
    public getDirection() {
        return false;
    }
}