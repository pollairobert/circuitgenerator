import { CircuitElements } from "./interfaceCircElement";
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";

export class CircuitGenerator {
    private circuit: Circuit;
    private circuitCurrentVector: number[];


    public generateAndAnalyzeCircuit(type: number/*mesh: number, res: number, cur: number, volt: number, comm: number*/): void {
        switch (type) {
            //Egyszeru feszultsegoszto
            case 1: {
                this.circuit = new Circuit(2, 2, 0, 1, 1);
                for (var h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (var i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                break;
            }
            //Kettos feszultsegoszto
            case 2: {
                this.circuit = new Circuit(3, 4, 0, 1, 2);
                for (var h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (var i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                break;
            }
        }
   }
    public getCircuit(): Circuit {
        return this.circuit;
    }
    public getCurcCurrVector(): number[]{
        return this.circuitCurrentVector;
    }

    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }



}
