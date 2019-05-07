/**
 * Interfesz a halozat elemi epitoelemeihez, mint ellenallas, generatorok es vezetek.
 * Mivel a branch ezeket tarolja, igy szukseges egy kozos interfesz tipus.
 */

export interface CircuitElements {
    setInverzDirection(): void;
    getId(): string;
    getResistance(): number;
    getCurrent(): number;
    getVoltage(): number;
    getDirection(): boolean;
}