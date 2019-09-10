import { CircuitElements } from "./interfaceCircElement";

export class Wire implements CircuitElements {
    private id = 'W';
    private resistance: number = 0;
    private current: number;
    private voltage: number = 0;
    private coordinate: number[] = [];
    private elementSize: number;
    /*constructor(){
        wireCounter += 1;
    }*/
    public setInverzDirection(): void {
        throw new Error("Method not implemented.");
    }
    public cloneElements(element: CircuitElements): CircuitElements {
        var wireClone: CircuitElements = new Wire();
        wireClone.setCurrent(element.getCurrent());
        //wireClone.setCoordinate(element.getCoordinate()[0],element.getCoordinate()[1],element.getCoordinate()[2],element.getCoordinate()[3]);
        return wireClone;
    }
    public setVoltage(vol: number): void {
        this.voltage = vol;
    }
    public setResistance(res: number): void {
        this.resistance = res;
    }
    public setCurrent(cur: number): void {
        this.current = cur;
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

    public getCurrent(): number {
        return this.current;
    }

    public getVoltage() {
        return this.voltage;
    }
    public getDirection() {
        return false;
    }
}