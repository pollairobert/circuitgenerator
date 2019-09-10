import { CircuitElements } from "./interfaceCircElement";

export class Resistance implements CircuitElements {
    private id = 'R';
    private resistance: number;
    private current: number;
    private voltage: number;
    private coordinate: number[] = [];
    private elementSize: number;
    /**
     * Konstruktor
     * @param resistance ellenallas ertekenek beallitasahoz
     */
    constructor(resistance: number) {
        this.resistance = resistance;
    }

    public setCurrent(cur: number): void {
        this.current = cur;
    }
    public setResistance(res: number): void {
        this.resistance = res;
    }
    /**
     * Az ot tartalmazo ag aramanak ismereteben kiszamolj a rajta eso feszultseget.
     */
    public setVoltage(vol: number): void {
        if ((this.resistance !== undefined) && (this.current !== undefined)) {
            this.voltage = this.current * this.resistance;
        } else {
            this.voltage = 0;
            //console.log('Hianyzo ertek');
        }

    }
    public cloneElements(element: CircuitElements): CircuitElements {
        var resistanceClone: CircuitElements = new Resistance(element.getResistance());
        resistanceClone.setCurrent(element.getCurrent());
        resistanceClone.setVoltage(0);
        return resistanceClone;
    }
    public setInverzDirection(): void {
        throw new Error("Method not implemented.");
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
        return false;
    }
}