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
   

    public generateAndAnalyzeCircuit(mesh: number, res: number, cur: number, volt: number, comm: number): void {
        
        this.circuit = new Circuit(mesh, res, cur, volt, comm);
            //this.meshes.push(new Mesh(/*meshnumb, res, cur, volt, comm*/));
        for (var i = 0; i < mesh; i++) {
            this.circuit.setMeshes(new Mesh());
            //this.meshes.push(new Mesh(/*meshnumb, res, cur, volt, comm*/));
        }
        //this.circuit = new Circuit(mesh, res, cur, volt, comm);
        //this.numberOfMesh = mesh;
        //this.circuit = new Circuit(mesh, res, cur, volt, comm);
        switch (mesh) {
            case 1: {
                if (cur > 1) {
                    console.log("Egy hurok eseten 1-nel tobb aramgenerator nem lehet, mert sorosan nem kothetoek ossze.");
                    break;
                }
                if (res === 0 && volt > 0) {
                    console.log("Egy hurok eseten a feszultseggeneratorokra terhelest kell kotni sorosan (ellenallas).");
                    break;
                }
                if (cur === 0 && volt === 0){
                    console.log("Egy hurok eseten kellene azert valamilyen generator.");
                    break;
                }
                if (comm > 0){
                    console.log("Egy hurok eseten nincs kozos ag.");
                    break;
                }
                if (cur > 0 && volt > 0){
                    console.log("Egy hurkban ne kossunk sorba aramgeneratort es feszultseggeneratort.");
                    break;
                }
                this.circuit = new Circuit(mesh, res, cur, volt, comm);

                for (var h = 0; h < mesh; h++){
                    var count: number = 0;
                    for (var i = 0; i < 2; i++) {
                        for (var j = 0; j < 2; j++) {
                            //if (this.meshNumber == 0 && this.maxMeshNumb == 2) {
                            if (i == 0 && j == 0) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(false, false, h));
                            }
                            if (i == 0 && j == 1) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(false, true, h));
                            }
                            if (i == 1 && j == 0) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(true, false, h));
                                //this.branches[count].setCommon(this.meshNumber+1);
                            }
                            if (i == 1 && j == 1) {
                                this.circuit.getMeshes()[h].setBranches(new Branch(true, true, h));
                            }
                            count++;
                            
                        }

                    }
                }
                
                console.log(this.circuit.getNumberOfMesh());
                for (var i = 0; i < this.circuit.getMeshes()[mesh-1].getBranches().length; i++){
                    if (this.circuit.getMeshes()[mesh-1].getBranches()[i].getOrientation() === true && this.circuit.getMeshes()[mesh-1].getBranches()[i].getDirection() === true){
                        if (cur > 0 || volt > 0){
                            this.circuit.getMeshes()[mesh-1].getBranches()[i].deleteBranchElement();
                            for (var j = 0; j < cur; j++){
                                this.circuit.getMeshes()[mesh-1].getBranches()[i].setBranchElements(new CurrentSource(3.2,true/*RANDOM LESZ MAJD*/));
                            }
                            for (var j = 0; j < volt; j++){
                                this.circuit.getMeshes()[mesh-1].getBranches()[i].setBranchElements(new VoltageSource(15,false/*RANDOM LESZ MAJD*/));
                            }
                        }
                        
                        
                    }
                }
                break;
            }

        }
    }
    public getCircuit(): Circuit {
        return this.circuit;
    }

    
}
