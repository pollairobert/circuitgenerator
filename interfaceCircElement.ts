export interface CircuitElements {
    //id: string;
    //resistance: number;
    getId(): string;
    getResistance(): number;
    getCurrent(): number;
    getVoltage(): number;
    getDirection(): boolean;
}