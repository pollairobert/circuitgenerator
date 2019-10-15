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
import { CircuitElements } from "./interfaceCircElement";
import * as math from 'mathjs';

export var branchCounter: number = 1;
export class Branch {
    private meshNumber: number; //az ot tartalmazo hurok sorszama
    private branchNumber: number;
    private orientation: boolean;
    private direction: boolean;
    private current: number = 0;
    private resistanceOfBranch: number[] = [];
    
    /**
     * alapesetben a kozossegi ertek az agat tartalmazo hurok szama.
     * Ha tobb hurokhoz tartozik a hurkok akkor azok szamanak osszege
     * */
    private common: number = 0; 
    
    private branchResistance = 0;
    private branchVoltage = 0;
    private branchElements: CircuitElements[] = [];
    private type: number; //4 tipus. 0: fel, 1: jobbra, 2: le, 3: balra
    private thevenin2pole: boolean = false;
    private commBrancResistance: number;
    private branchSize: number = 0;

    /**
     * Konstruktor, beallitasra kerul az orientacio es az irany
     * @param type 4 tipus. 0: fel, 1: jobbra, 2: le, 3: balra
     * @param meshNumber az ot tartalmazo hurok szama-1 !!!!
     */
    constructor(type: number, meshNumber: number) {
        this.type = type;
        this.meshNumber = (meshNumber+1);
        this.common = this.meshNumber;
        switch (type) {
            case 0: {
                this.orientation = true;
                this.direction = true;
                break;
            }
            case 1: {
                this.orientation = false;
                this.direction = true;
                break;
            }
            case 2: {
                this.orientation = true;
                this.direction = false;
                break;
            }
            case 3: {
                this.orientation = false;
                this.direction = false;
                break;
            }
        }
        this.branchNumber = branchCounter;
        branchCounter++;
    }
    /**
     * Beallitja az ag allanallaserteket a megadott ertekre.
     * @param resNumber ertekadas
     */
    public setResistanceOfBranch(resNumber: number): void {
        this.resistanceOfBranch.push(resNumber);
    }
    /**
     * Agaram beallitasa az analizis soran meghatarozott aramvektor segitsegevel
     * @param currentVector aramvektor
     */
    public setCurrent(currentVector: math.MathType): void {
        let curVect: Object = currentVector.valueOf(); 
        if (this.current === 0) {
            if (this.common === this.meshNumber) {
                this.current = curVect[this.meshNumber-1];
            } else {
                this.current = curVect[this.meshNumber-1] - curVect[(this.common-this.meshNumber)-1]
            }
        }
    }

    /**
     * Az ag altal tarolt halozati elemek hozzaadasa.
     * A kulonbozo tipustol fuggoen beallitja az ag halozatanilizishez szukseges ertekeit (feszultseg, ellenallas).
     * @param element halozati elem
     */
    public setBranchElements(element: CircuitElements): void {
        this.branchElements.push(element);
        if (element.getId() === 'R') {
            this.branchResistance += element.getResistance();
        }
        if (element.getId() === 'V') {
            if (element.getDirection() === true) {
                this.branchVoltage += (element.getVoltage() * (-1));
            } else {
                this.branchVoltage += element.getVoltage();
            }
        }
        if (element.getId() === 'C') {
            if (element.getDirection() === true) {
                this.branchVoltage += element.getVoltage();
            } else {
                this.branchVoltage += (element.getVoltage() * (-1));
            }
        }
    }

    /**
     * Beallitja az agat a keresett ket polusnak, amely felol helyettesitjuk a halozatot
     * @param pole true az ertek ha ez az ag lesz az
     */
    public setTh2Pole(pole: boolean): void {
        this.thevenin2pole = pole;
    }

    /**
     * Beallitja az agnak a kozossegi erteket ugy, hogy a csatlakozo ag hurokszamat hozzaadja a sajatjahoz
     * @param meshNum a csatlakozo hurok szama
     */
    public setCommon(meshNum: number): void{
        this.common += meshNum;
    }
    /**
     * Beallitja a parameterul kapot ertekre az ag hosszat. Megjeleniteskor van ra szukseg.
     * @param size A megjeleniteshez szokseges meret
     */
    public setBranchSize(size: number): void{
        this.branchSize = size;
    }

    /**
     * Torli az ag ellenallas erteket.
     */
    public clearBranchResistance(): void{
        this.branchResistance = 0;
    }

    /**
     * Az objektum property-einek klonozasat vegzo fuggvenyek.
     */
    private cloneSetCommon(com: number): void{
        this.common = com;
    }
    private cloneSetCurrent(curr: number): void{
        this.current = curr;
    }
    private cloneSetBranchResistant(res: number): void{
        this.branchResistance = res;
    }
    private cloneSetBranchVoltage(volt: number): void{
        this.branchVoltage = volt;
    }
    private cloneSetThev2Pole(pole: boolean): void{
        this.thevenin2pole = pole;
    }
    private cloneSetBrancElements(element: CircuitElements): void{
        this.branchElements.push(element);
    }
    private cloneSetBranchNumber(brnumb: number): void{
        this.branchNumber = brnumb;
    }
    private cloneMeshNumber(num: number): void {
        this.meshNumber = num;
    }
    
    /**
     * A parameterul kapott ag objektum teljas klonjat kesziti el.
     * @param branch klonozando ag objektum
     */
    public cloneBranch(branch: Branch): Branch{
        var branchClone: Branch = new Branch(branch.getType(),(branch.getMeshNumber()-1));   
        branchClone.cloneMeshNumber(branch.getMeshNumber());
        branchClone.cloneSetBranchNumber(branch.getBranchNumber()); 
        branchClone.cloneSetCurrent(branch.getCurrent());
        branchClone.cloneSetCommon(branch.getCommon());
        branchClone.cloneSetBranchResistant(branch.getBranchResistance());
        branchClone.cloneSetBranchVoltage(branch.getBranchVoltage());
        branchClone.cloneSetThev2Pole(branch.getTh2Pole())
        for(var i = 0; i < branch.getBranchElements().length; i++){
            branchClone.cloneSetBrancElements(branch.getBranchElements()[i].cloneElements(branch.getBranchElements()[i]));
        }
        return branchClone;
    }
    
    /**
     * Osztaly getter metodusok a propertykhez.
     */
    public getResistanceOfBranch(): number[]{
        return this.resistanceOfBranch;
    }
    public getBranchNumber(): number {
        return this.branchNumber;
    }

    public getOrientation(): boolean {
        return this.orientation;
    }

    public getDirection(): boolean {
        return this.direction;
    }

    public getCurrent(): number {
        return this.current;
    }

    public getCommon(): number {
        return this.common;
    }

    public getBranchElements(): CircuitElements[] {
        return this.branchElements;
    }
    public getBranchResistance(): number {
        return this.branchResistance;
    }
    public getBranchVoltage(): number {
        return this.branchVoltage;
    }
    public getMeshNumber(): number {
        return this.meshNumber;
    }
    public getType(): number {
        return this.type;
    }
    public getTh2Pole(): boolean {
        return this.thevenin2pole;
    }
    public getBrancSize(): number {
        return this.branchSize;
    }
}