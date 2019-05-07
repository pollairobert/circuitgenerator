import { CircuitElements } from "./interfaceCircElement";

export class Wire implements CircuitElements {
    private id = 'W';
    private resistance: number = 0;
    private current: number;
    private voltage: number = 0;
    /*constructor(){
        wireCounter += 1;
    }*/
    public setInverzDirection(): void {
        throw new Error("Method not implemented.");
    }
    public cloneElements(element: CircuitElements): CircuitElements {
        throw new Error("Method not implemented.");
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