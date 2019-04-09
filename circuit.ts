import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";

export class Circuit {
    private meshes: Mesh[] = [];
    private numberOfMesh: number;
    private numbOfResistance: number;
    private numbOfCurrentSource: number;
    private numbOfVoltageSource: number;
    private numbOfCommonBranch: number;

    constructor(meshnumb: number, res: number, cur: number, volt: number, comm: number) {
        this.numberOfMesh = meshnumb;
        this.numbOfResistance = res;
        this.numbOfCurrentSource = cur;
        this.numbOfVoltageSource = volt;
        this.numbOfCommonBranch = comm;
        /*for (var i = 0; i < meshnumb; i++) {
            this.setMeshes(new Mesh());
            //this.meshes.push(new Mesh(/*meshnumb, res, cur, volt, comm*/
        //}
    }

    public setMeshes(mesh: Mesh): void {
        this.meshes.push(mesh);
    }

    public getMeshes(): Mesh[] {
        return this.meshes;
    }
    
    public getNumberOfMesh(): number {
        return this.numberOfMesh;
    }

}