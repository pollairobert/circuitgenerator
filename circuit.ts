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
    private theveninResistance: number = 0;
    private theveninVoltage: number = 0;
    private numbOfResistance: number;
    private numbOfCurrentSource: number;
    private numbOfVoltageSource: number;
    private numbOfCommonBranch: number; // meg kerdeses, hogy kell-e
    
    constructor(meshnumb: number, res: number, cur: number, volt: number, comm: number) {
        this.numberOfMesh = meshnumb;
        this.numbOfResistance = res;
        this.numbOfCurrentSource = cur;
        this.numbOfVoltageSource = volt;
        this.numbOfCommonBranch = comm;
    }
    public setMeshes(mesh: Mesh): void {
        this.meshes.push(mesh);
    }
    public setThevRes(res: number): void {
        this.theveninResistance = res;
    }
    public setThevVolt(volt: number): void {
        this.theveninVoltage = volt;
    }
    public getThevRes(): number {
        return this.theveninResistance;
    }
    public getThevVolt(): number {
        return this.theveninVoltage;
    }
    public getMeshes(): Mesh[] {
        return this.meshes;
    }
    public getNumberOfMesh(): number {
        return this.numberOfMesh;
    }
    public getNumbOfRes(): number{
        return this.numbOfResistance;
    }
    public getNumbOfVoltSource(): number{
        return this.numbOfVoltageSource;
    }
    public getNumbOfCurrSource(): number{
        return this.numbOfCurrentSource;
    }
    public getNumbOfCommonBranc(): number{
        return this.numbOfCommonBranch;
    }
}