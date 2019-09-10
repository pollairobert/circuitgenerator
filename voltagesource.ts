﻿import { CircuitElements } from "./interfaceCircElement";

export class VoltageSource implements CircuitElements {
    private id = 'V';
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