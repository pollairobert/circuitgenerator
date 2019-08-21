import { CircuitElements } from "./interfaceCircElement";

export class Wire implements CircuitElements {
    private id = 'W';
    private resistance: number = 0;
    private current: number;
    private voltage: number = 0;
    private coordinate: number[] = [];
    /*constructor(){
        wireCounter += 1;
    }*/
    public setInverzDirection(): void {
        throw new Error("Method not implemented.");
    }
    public cloneElements(element: CircuitElements): CircuitElements {
        var wireClone: CircuitElements = new Wire();
        wireClone.setCurrent(element.getCurrent());
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
        this.coordinate.push(startX,startY,endX,endY);
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