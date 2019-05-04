import { CircuitElements } from "./interfaceCircElement";

export class Wire implements CircuitElements {
    private id = 'W';
    private resistance: number = 0;
    private current: number;
    private voltage: number = 0;
    /*constructor(){
        wireCounter += 1;
    }*/
    public getId() {
        return this.id;
    }

    public getResistance() {
        return this.resistance;
    }

    public setCurrent(cur: number): void {
        this.current = cur;
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