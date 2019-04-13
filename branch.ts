import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Mesh } from "./mesh";

export var branchCounter: number = 0;
export class Branch {
    private meshNumber: number; //az ot tartalmazo hurok sorszama
    private branchNumber: number;
    private orientation: boolean;
    private direction: boolean;
    private current: number = 0;
    private common: number = 0;
    private branchResistance = 0;
    private branchVoltage = 0;
    private branchElements: CircuitElements[] = [];
    private type: number; //4 tipus. 0: fel, 1: jobbra, 2: le, 3: fel
    private commBrancResistance: number;

    constructor(type: number, meshNumber: number) {
        //this.setBranchElements(new Wire());
        //this.branchElements.push(new Wire());
        this.type = type;
        this.meshNumber = meshNumber;
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

    public setCurrent(currentVector: number[]) {
        if (this.current === 0) {
            if (this.common === 0) {
                this.current = currentVector[this.meshNumber];
            } else {
                this.current = currentVector[this.meshNumber] - currentVector[this.common - this.meshNumber];
            }
        }
    }

    public setCommon(comm: number): void {
        this.common = comm;
    }

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

    public deleteBranchElement(): void {
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
}