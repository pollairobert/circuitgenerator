import {CircuitElements} from "./interfaceCircElement";
import {Wire} from "./wire";
import {Resistance} from "./resistance";
import {CurrentSource} from "./currentsource";
import {VoltageSource} from "./voltagesource";
import {Branch, branchCounter} from "./branch";

export var meshCounter: number = 0;
export class Mesh {
    private meshNumber: number;
    private branches: Branch[] = [];
    private maxMeshNumb: number;

    constructor(maxmesh: number, res: number, cur: number, volt: number, comm: number){
        this.maxMeshNumb = maxmesh;
        this.meshNumber = meshCounter;
        var count: number = 0;
        for (var i=0; i < 2; i++){
            for (var j=0; j<2; j++){
                if (this.meshNumber == 0 && this.maxMeshNumb == 2) {
                    if (i == 0 && j == 0){
                        this.branches.push(new Branch(false, false, this.meshNumber));
                    } 
                    if (i == 0 && j == 1){
                        this.branches.push(new Branch(false, true, this.meshNumber));
                    } 
                    if (i == 1 && j == 0){
                        this.branches.push(new Branch(true, false, this.meshNumber));
                        this.branches[count].setCommon(this.meshNumber+1);
                    } 
                    if (i == 1 && j == 1){
                        this.branches.push(new Branch(true, true, this.meshNumber));
                    } 
                    count ++;
                } else if (this.meshNumber == 1 && this.maxMeshNumb == 2) {
                    if (i == 0 && j == 0){
                        this.branches.push(new Branch(false, false, this.meshNumber));
                    } 
                    if (i == 0 && j == 1){
                        this.branches.push(new Branch(false, true, this.meshNumber));
                    } 
                    if (i == 1 && j == 0){
                        this.branches.push(new Branch(true, false, this.meshNumber));
                        this.branches[count].setBranchElements(new Resistance(12));
                    } 
                    if (i == 1 && j == 1){
                        this.branches.push(new Branch(true, true, this.meshNumber));
                    } 
                    count ++;
                }
            }
            
        }
        if (this.meshNumber == 0 && this.maxMeshNumb == 2){
            for (var i=0; i < count; i++){

            }
            
        }
        meshCounter++;
    }
    
    
    public setBranches(branch: Branch): void {
        this.branches.push(branch);
    }
    public getMeshNumber(): number {
        return this.meshNumber;
    }

    public getBranches(): Branch[]{
        return this.branches;
    }

    public getMaxMesh(): number{
        return this.maxMeshNumb;
    }
}