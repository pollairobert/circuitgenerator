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
    
    /**
     * Aramkor konstruktora, amely beallitja a szukseges ertkeit a prameterek alapjan
     * @param meshnumb az aramkorben letrehozott hurkok szama (technikai okok miatt a kivezetest is horokkent tarolja)
     * @param res aramkori ellanalasok darabszama
     * @param cur aramgeneratorok szama
     * @param volt feszultseggeneratorok szama
     * @param comm hurkok kozos againak szama (ez meg kerdeses, hogy marad-e)
     */
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
    private cloneCircuitMeshes(msh: Mesh): void {
        this.meshes.push(msh);
    }
    private cloneNumbOfMesh(num: number): void {
        this.numberOfMesh = num;
    }
    private cloneTheveninResistance(res: number): void {
        this.theveninResistance = res;
    }
    private cloneTheveninVoltage(volt: number): void {
        this.theveninVoltage = volt;
    } 
    private cloneNumbOfRes(num: number): void {
        this.numbOfResistance = num;
    }
    private cloneNumbOfCurrentSource(num: number): void {
        this.numbOfCurrentSource = num;
    }
    private cloneNumbOfVoltageSource(num: number): void {
        this.numbOfVoltageSource = num;
    }
    private cloneNumbOfCommonBranch(num: number): void {
        this.numbOfCommonBranch = num;
    }
    public cloneCircuit(circ: Circuit): Circuit {
        var circuitClone: Circuit = new Circuit(circ.getNumberOfMesh(),circ.getNumbOfRes(),circ.getNumbOfCurrSource(),circ.getNumbOfVoltSource(),circ.getNumbOfCommonBranc());
        for(var i = 0; i < circ.getMeshes().length; i++){
            circuitClone.cloneCircuitMeshes(circ.getMeshes()[i].cloneMesh(circ.getMeshes()[i]));
        }
        circuitClone.cloneNumbOfMesh(circ.getNumberOfMesh());
        circuitClone.cloneTheveninResistance(circ.getThevRes());
        circuitClone.cloneTheveninVoltage(circ.getThevVolt());
        circuitClone.cloneNumbOfRes(circ.getNumbOfRes());
        circuitClone.cloneNumbOfCurrentSource(circ.getNumbOfCurrSource());
        circuitClone.cloneNumbOfVoltageSource(circ.getNumbOfVoltSource());
        circuitClone.cloneNumbOfCommonBranch(circ.getNumbOfCommonBranc());
        return circuitClone;
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