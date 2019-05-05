import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Mesh } from "./mesh";
import * as math from 'mathjs';

export var branchCounter: number = 0;
export class Branch {
    private meshNumber: number; //az ot tartalmazo hurok sorszama
    private branchNumber: number;
    private orientation: boolean;
    private direction: boolean;
    private current: number = 0;
    
    /*alapesetben a kozossegi ertek az agat tartalmazo hurok szama.
    Ha tobb hurokhoz tartozik a hurkok akkor azok szamanak osszege*/
    private common: number = 0; 
    private branchResistance = 0;
    private branchVoltage = 0;
    private branchElements: CircuitElements[] = [];
    private type: number; //4 tipus. 0: fel, 1: jobbra, 2: le, 3: balra
    private thevenin2pole: boolean = false;
    private commBrancResistance: number;

    /**
     * Konstruktor, beallitasra kerul az orientacio es az irany
     * @param type 4 tipus. 0: fel, 1: jobbra, 2: le, 3: balra
     * @param meshNumber az ot tartalmazo hurok szama
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
     * Agaram beallitasa az analizis soran meghatarozott aramvektor segitsegevel
     * @param currentVector aramvektor
     */
    public setCurrent(currentVector: math.Matrix) {
        if (this.current === 0) {
            if (this.common === this.meshNumber) {
                this.current = +currentVector.subset(math.index(this.meshNumber,0));
            } else {
                this.current = +currentVector.subset(math.index(this.meshNumber,0)) - (+currentVector.subset(math.index(this.common-this.meshNumber,0)));
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
            //mesh.setMeshResistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            if (element.getDirection() === true) {
                this.branchVoltage += (element.getVoltage() * (-1));
                //mesh.setMeshVoltage(element.getVoltage());
            } else {
                this.branchVoltage += element.getVoltage();
                //mesh.setMeshVoltage(element.getVoltage() * (-1));
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
    public setTh2Pole(pole: boolean): void {
        this.thevenin2pole = pole;
    }
    public setCommon(meshNum: number): void{
        this.common += meshNum;
    }
    public deleteLastBranchElement(): void {
        this.branchElements.pop();
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
}