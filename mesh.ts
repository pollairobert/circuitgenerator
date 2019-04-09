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

    constructor(/*maxmesh: number, res: number, cur: number, volt: number, comm: number*/) {
        //this.maxMeshNumb = maxmesh;
        this.meshNumber = meshCounter;
        /*var count: number = 0;
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 2; j++) {
                //if (this.meshNumber == 0 && this.maxMeshNumb == 2) {
                if (i == 0 && j == 0) {
                    this.setBranches(new Branch(false, false, this.meshNumber));
                }
                if (i == 0 && j == 1) {
                    this.setBranches(new Branch(false, true, this.meshNumber));
                }
                if (i == 1 && j == 0) {
                    this.setBranches(new Branch(true, false, this.meshNumber));
                    //this.branches[count].setCommon(this.meshNumber+1);
                }
                if (i == 1 && j == 1) {
                    this.setBranches(new Branch(true, true, this.meshNumber));
                }
                count++;
                
            }

        }*/
        meshCounter++;
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

    public setMeshResistance(res: number): void {
        this.meshResistance += res;
    }

    public setMeshVoltage(res: number): void {
        this.meshVoltage += res;
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