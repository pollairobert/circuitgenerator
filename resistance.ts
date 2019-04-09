import { CircuitElements } from "./interfaceCircElement";

export class Resistance implements CircuitElements {
    private id = 'R';
    private resistance: number;
    private current: number;
    private voltage: number;

    constructor(resistance: number) {
        this.resistance = resistance;
    }

    public setCurrent(cur: number): void {
        this.current = cur;
    }

    public setVoltage(): void {
        if ((this.resistance !== undefined) && (this.current !== undefined)) {
            this.voltage = this.current * this.resistance;
        } else {
            console.log('Hianyzo ertek');
        }

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