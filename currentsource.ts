import {CircuitElements} from "./interfaceCircElement";

export class CurrentSource implements CircuitElements {
    private id = 'C';
    private resistance: number;
    private current: number;
    private voltage: number; //Helyettesito Feszgen feszultsege
    private direction: boolean; //A helyettesito feszgennek az iranya ellentetes ezzel.

    constructor(current: number, dir: boolean){
        this.current = current; 
        this.direction = dir;
        this.resistance = Infinity;
    }

    public setVoltage (): void {
        //circuitobject.currentGenSubstitutes() fuggveny hivasa
        //this.current = volt;
    }

    public getId(){
        return this.id;
    }

    public getResistance(){
        return this.resistance;
    }

    public getCurrent(){
        return this.current;
    }

    public getVoltage(){
        return this.voltage;
    }

    public getDirection(){
        return this.direction;
    }
}