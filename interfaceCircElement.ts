/* 
 * The MIT License
 *
 * Copyright 2019 Robert Pollai <pollairobert at gmail.com>, University of Szeged, Department of Technical Informatics.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
    replaceWire(): void;
    setCurrent(cur: number): void;
    setResistance(res: number): void;
    setVoltage(vol: number): void;
    setCoordinate(startX: number, startY: number, endX: number, endY: number): void;
    getCoordinate(): number[];
    setElementSize(size: number): void;
    getElementSize(): number;
    deleteCoordinateArray(): void;
}