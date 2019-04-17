import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";

export var meshCounter: number = 0;
export class Mesh {
    private meshNumber: number;
    private branches: Branch[] = [];
    //private maxMeshNumb: number;
    private meshResistance: number = 0;
    private meshVoltage: number = 0;
    private meshCurrent: number = 0;

    constructor(/*maxmesh: number, res: number, cur: number, volt: number, comm: number*/) {
        //this.maxMeshNumb = maxmesh;
        this.meshNumber = meshCounter;
        meshCounter++;
    }

    public setMeshResistance(branch: Branch): void {
        this.meshResistance += branch.getBranchResistance();
    }

    public setMeshVoltage(branch: Branch): void {
        this.meshVoltage += branch.getBranchVoltage();
    }
    public setMeshCurrent(current: number): void {
        this.meshCurrent = current;
    }
    public setBranches(branch: Branch): void {
        this.branches.push(branch);
        //this.meshResistance += branch.getBranchResistance();
        //this.meshVoltage += branch.getBranchVoltage();
    }
    public getMeshNumber(): number {
        return this.meshNumber;
    }

    public getBranches(): Branch[] {
        return this.branches;
    }

    public getMesCurrent(): number {
        return this.meshCurrent;
    }
    /*public getMaxMesh(): number {
        return this.maxMeshNumb;
    }*/

    public getMeshResistance(): number {
        return this.meshResistance;
    }

    public getMeshVoltage(): number {
        return this.meshVoltage;
    }
}