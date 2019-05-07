import { CircuitElements } from "./interfaceCircElement";

export class VoltageSource implements CircuitElements {
    private id = 'V';
    private resistance: number;
    private current: number;
    private voltage: number;
    private direction: boolean;

    constructor(voltage: number, dir: boolean) {
        this.voltage = voltage;
        this.direction = dir;
        this.resistance = 0;
    }

    public setCurrent(cur: number): void {
        this.current = cur;
    }
    public setInverzDirection(): void {
        this.direction = !this.direction;
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