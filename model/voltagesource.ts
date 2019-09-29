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

export class VoltageSource implements CircuitElements {
    private id = 'V';
    private number: number;
    private resistance: number;
    private current: number;
    private voltage: number;
    private direction: boolean;
    private coordinate: number[] = [];
    private elementSize: number;
    
    constructor(voltage: number, dir: boolean) {
        this.voltage = voltage;
        this.direction = dir;
        this.resistance = 0;
    }
    public cloneElements(element: CircuitElements): CircuitElements {
        var voltageSourceClone: CircuitElements = new VoltageSource(element.getVoltage(),element.getDirection());
        voltageSourceClone.setCurrent(element.getCurrent());
        return voltageSourceClone;
    }
    public setNumber(num: number): void {
        this.number = num;
    }
    public getNumber(): number{
        return this.number;
    }
    public setCurrent(cur: number): void {
        this.current = cur;
    }
    public setVoltage(vol: number): void {
        this.voltage = vol;
    }
    public setResistance(res: number): void {
        this.resistance = res;
    }
    public setInverzDirection(): void {
        this.direction = !this.direction;
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
        return this.direction;
    }
}