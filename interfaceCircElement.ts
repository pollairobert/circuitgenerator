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
    cloneElements(element: CircuitElements): CircuitElements;
    setCurrent(cur: number): void;
    setResistance(res: number): void;
    setVoltage(vol: number): void;
    setCoordinate(startX: number, startY: number, endX: number, endY: number): void;
    getCoordinate(): number[];
    setElementSize(size: number): void;
    getElementSize(): number;
    deleteCoordinateArray(): void;
}