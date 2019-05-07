import { CircuitElements } from "./interfaceCircElement";

export class CurrentSource implements CircuitElements {
   
    private id = 'C';
    private resistance: number;
    private current: number;
    private subsVoltage: number; //Helyettesito Feszgen feszultsege
    private direction: boolean; //A helyettesito feszgennek az iranya ellentetes ezzel.

    /**
     * Konstruktor
     * @param current aramgenerator aramerteke
     * @param dir aramgenerator altal letrehozott aram iranya
     */
    constructor(current: number, dir: boolean) {
        this.current = current;
        this.direction = dir;
        this.resistance = Infinity;
    }

    public setSubsVoltage(subsvol: number): void {
        this.subsVoltage = subsvol;
    }
    setInverzDirection(): void {
        throw new Error("Method not implemented.");
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
        return this.subsVoltage;
    }

    public getDirection() {
        return this.direction;
    }
}