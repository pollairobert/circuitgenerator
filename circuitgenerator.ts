import { CircuitElements } from './interfaceCircElement';
import { Wire } from "./wire";
import { Resistance } from "./resistance";
import { CurrentSource } from "./currentsource";
import { VoltageSource } from "./voltagesource";
import { Branch, branchCounter } from "./branch";
import { Mesh, meshCounter } from "./mesh";
import { Circuit } from "./circuit";
import * as math from 'mathjs';

export class CircuitGenerator {
    private circuit: Circuit;
    private circuitCurrentVector: math.MathType;
    private circuitVoltageVector: math.Matrix;
    private circuitResistanceMatrix: math.Matrix;
    //private circuitInverzResistanceMatrix: math.MathType;
    private circuitResultingResistance: number = 0;
    private commonBranches: Branch[] = [];
    private args: number[] = [];
    private questionOrVoltmeterResistance: number ;
    private questionOrVoltmeterResistanceCurrent: number;
    private questionOrVoltmeterResistanceVoltage: number;

    private connectedVoltagesourceValue: number;
    private connectedVoltagesourceInsideResistance: number;
    private outpuVoltageWithconnectedVoltagesource: number;
    /*private th2PoleMeshNumber: number;
    private th2PoleBranchType: number;
    private th2PoleNumberOfBranch: number;
    private commonAndTh2Pole: number;*/
    public counter = 0;
    /**
     * Aramkor generalasaert felelos. Meghivja a halozat analizalasahoz szukseges fuggvenyeket.
     * Eredmenyul pedig megadja az altala generalt halozat thevenin helyettesiteset
     * @param type aramkor tipusa adott struktura alapjan 
     */
    public generateCircuit(type: number/*mesh: number, res: number, cur: number, volt: number, comm: number*/): void {
        switch (type) {
            //Egyszeru feszultsegoszto
            case 1: {
                this.circuit = new Circuit(2, 2, 0, 1, 1);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());

                    //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                    }
                }
                //this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomE6Resistance()));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new Resistance(2));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(3));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(8));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomE6Resistance()));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(18));
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(1,24),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(120,false));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(5));
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new VoltageSource(90,true));
                //this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));
                this.circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                //let cloneCircuit: Circuit = this.circuit.cloneCircuit(this.circuit);
                //console.log(cloneCircuit);
                //cloneCircuit.getMeshes().splice(1,1);
                console.log(this.counter);
                break;
            }
            //Kettos feszultsegoszto
            case 2: {
                this.circuit = new Circuit(3, 4, 0, 1, 2);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(19));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(19));
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(12));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(11));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(15,false));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new VoltageSource(44,true));//2. feszgen
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(8,true));//3. feszgen
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(3));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[2].setCommon(3);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[1]));//2.feszgen
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[1]));//3.feszgen
                this.circuit.getMeshes()[2].getBranches()[2].setTh2Pole(true);
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;
            }
            //Teszt tipus, egyszeru 2 hurkos, a hurkok kozos agaban a kijelolt 2 polus.
            case 3: {
                this.circuit = new Circuit(2, 3, 0, 1, 1);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
                //this.circuit.getMeshes()[1].getBranches()[0].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));

                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                    }
                }
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;

            }
            //Teszt tipus, 3 hurkos rendszerhdez, belso thevenin 2 polussal.
            case 4: {
                this.circuit = new Circuit(3, 4, 0, 2, 2);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(5,true));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(13));
                //this.circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                
                //this.circuit.getMeshes()[1].getBranches()[0].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(5));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(34));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomVoltageSourceValue(),this.randomBoolean()));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(23,true));
                this.circuit.getMeshes()[1].getBranches()[0].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[2].setCommon(3);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(2);
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[1]));
                this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(12));
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                        //console.log(mesh.getBranches()[j]);
                    }
                }
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;

            }
            /*Teszt tipus, 4 hurkos rendszerhdez, ahol 1 huroknak 2 masikkal is van kozos aga:
            -------------- A
            |  3 |    |
            ------  2 |  4
            | 1  |    |
            -------------- B
            */
            case 5: {
                console.log('**** generateCircuit meghivva a MAIN-bol ****');
                this.circuit = new Circuit(6, 8, 0, 3, 9);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                //A 2-es hurokhoz hozza kell egy plusz felfele mutato branchat adni
                //this.circuit.getMeshes()[1].setBranches(new Branch(0,1));
                this.circuit.getMeshes()[1].getBranches().splice(1,0,new Branch(0,1))
                //1-es hurok elemei
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(5,false));
                //this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(13));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(5));

                //1-es hurok kozos againak beallitasa
                this.circuit.getMeshes()[0].getBranches()[1].setCommon(3);
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);

                //2-es hurok elemei, 
                //1-es hurokkal kozos agaba clonozzuk az 1-esben szereplo ellenallast
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                //3-as hurokkal kozos agban letrehozzunk egy ellenallast. TOLODNI FOG A BRANCH INDEX, mert nem csak 4 elemu lesz!!!!
                this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(15));
                //tovabbi ellenallasok a 2-es hurokban
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(7));
                this.circuit.getMeshes()[1].getBranches()[3].setBranchElements(new Resistance(27));
                this.circuit.getMeshes()[1].getBranches()[3].setBranchElements(new VoltageSource(30,false));

                //2-es hurok kozos againak beallitasa
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                this.circuit.getMeshes()[1].getBranches()[1].setCommon(3);
                this.circuit.getMeshes()[1].getBranches()[3].setCommon(4);

                //3-as hurok elemei
                this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(3));
                //1-es hurokkal kozos agba klonozzuk az 1-esben szereplo ellenallast
                this.circuit.getMeshes()[2].getBranches()[3].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[1].getBranchElements()[0]));
                //2-es hurokkal kozos agba klonozzuk az 2-esben szereplo ellenallast
                this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[1].getBranchElements()[0]));

                //3-as hurok kozos againak beallitasa
                this.circuit.getMeshes()[2].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[2].getBranches()[3].setCommon(1);

                //4-es hurok elemei, ezeket a 2-as hurok kozos agabol klonozzuk
                this.circuit.getMeshes()[3].getBranches()[2].setBranchElements(new Resistance(15)); //belso 2 polushoz kell
                this.circuit.getMeshes()[3].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[3].getBranchElements()[0]));
                this.circuit.getMeshes()[3].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[3].getBranchElements()[1]));

                //4-es hurok kozos aganak beallitasa
                this.circuit.getMeshes()[3].getBranches()[0].setCommon(2);

                //TESZT jelleggel 5-os hurok letrehozasa
                //Hozza kell adni meg egy 3-as tipusu branchet 
                //this.circuit.getMeshes()[4].setBranches(new Branch(3,4));
                this.circuit.getMeshes()[4].getBranches().splice(4,0,new Branch(3,4));
                this.circuit.getMeshes()[4].getBranches()[1].setBranchElements(new VoltageSource(23,true));
                this.circuit.getMeshes()[4].getBranches()[1].setBranchElements(new Resistance(33));

                //5-os hurok kozos agaiba klonozni az elemeket
                this.circuit.getMeshes()[4].getBranches()[3].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[4].getBranches()[4].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[2].getBranches()[1].getBranchElements()[0]));

                //5-os kozos branchek
                this.circuit.getMeshes()[4].getBranches()[3].setCommon(2);
                this.circuit.getMeshes()[4].getBranches()[4].setCommon(3); 

                this.circuit.getMeshes()[1].getBranches()[2].setCommon(5);
                this.circuit.getMeshes()[2].getBranches()[1].setCommon(5);

                //TESZT jelleggel 6-os hurok letrehozasa
                //Hozza kell adni 2 db 2-es tipusu branchet
                this.circuit.getMeshes()[5].getBranches().splice(2,0,new Branch(2,5),new Branch(2,5));
                this.circuit.getMeshes()[5].getBranches()[1].setBranchElements(new VoltageSource(50,true));
                this.circuit.getMeshes()[5].getBranches()[1].setBranchElements(new Resistance(19));
                this.circuit.getMeshes()[5].getBranches()[4].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[0].getBranchElements()[0]));

                //Kozos agak
                this.circuit.getMeshes()[5].getBranches()[2].setCommon(5);
                this.circuit.getMeshes()[5].getBranches()[3].setCommon(3);
                this.circuit.getMeshes()[5].getBranches()[4].setCommon(1);
                this.circuit.getMeshes()[0].getBranches()[0].setCommon(6);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(6);
                this.circuit.getMeshes()[4].getBranches()[0].setCommon(6);

                //thevenin 2 polus a 4-es hurok vegen lesz
                //this.circuit.getMeshes()[4].getBranches()[2].setTh2Pole(true);

                // Belso 2 polus valasztas a 5-os huroknal
                this.circuit.getMeshes()[1].getBranches()[4].setTh2Pole(true);
                    
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    //console.log(this.circuit.getMeshes()[i]);
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                        
                    }
                }
                //console.log(this.circuit);
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;

            }
            //Feladattipusokbol a 4 ellenallas kozos ponton es 2 fesz generator
            case 6: {
                this.circuit = new Circuit(3, 4, 0, 2, 2);
                for (let h = 0; h < this.circuit.getNumberOfMesh(); h++) {
                    this.circuit.setMeshes(new Mesh());
                    for (let i = 0; i < 4; i++){
                        this.circuit.getMeshes()[h].setBranches(new Branch(i,h));
                        
                    }
                }
                this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(this.randomIntNumber(1,24),this.randomBoolean()));
                //this.circuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(5,true));
                this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1000,100000)));
                this.circuit.getMeshes()[0].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1000,100000)));
                //this.circuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(13));
                //this.circuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);
                this.circuit.getMeshes()[0].getBranches()[2].setCommon(2);
                this.circuit.getMeshes()[1].getBranches()[0].setCommon(1);
                
                //this.circuit.getMeshes()[1].getBranches()[0].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[0].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(1,24),this.randomBoolean()));
                this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1000,100000)));
                //this.circuit.getMeshes()[1].getBranches()[0].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(5));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new Resistance(34));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(this.randomIntNumber(5,50),this.randomBoolean()));
                //this.circuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(23,true));
                this.circuit.getMeshes()[2].getBranches()[2].setTh2Pole(true);
                this.circuit.getMeshes()[1].getBranches()[2].setCommon(3);
                this.circuit.getMeshes()[2].getBranches()[0].setCommon(2);
                this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1000,100000)));

                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[0]));
                this.circuit.getMeshes()[2].getBranches()[0].setBranchElements(this.copyCommonElement(this.circuit.getMeshes()[1].getBranches()[2].getBranchElements()[1]));
                //this.circuit.getMeshes()[2].getBranches()[2].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(this.randomIntNumber(1,20)));
                //this.circuit.getMeshes()[2].getBranches()[1].setBranchElements(new Resistance(12));
                for (let i = 0; i < this.circuit.getMeshes().length; i++){
                    for(let j = 0; j < this.circuit.getMeshes()[i].getBranches().length; j++){
                        let mesh : Mesh =  this.circuit.getMeshes()[i];
                        mesh.setMeshVoltage(mesh.getBranches()[j]);
                        mesh.setMeshResistance(mesh.getBranches()[j]);
                        //console.log(mesh.getBranches()[j]);
                    }
                }
                this.finalCalculateOfTheveninSubstitutes(this.circuit);
                break;

            }
        }
    }
    
    public calculateCurrentVector(circuit: Circuit): math.MathType{
        //this.counter++;
        console.log('**** calculateCurrentVector meghivva a calculateCircuitResultingResistance-bol ****');
        let currentVector: math.MathType = math.matrix();
        currentVector.resize([circuit.getNumberOfMesh(),1]);
        currentVector = math.multiply(math.inv(this.calculateResistanceMatrix(circuit)),this.calculateVoltageVector(circuit));
        //currentVector.valueOf
        console.log(currentVector);
        return currentVector;
    }
    public calculateVoltageVector(circuit: Circuit): math.Matrix {
        console.log('**** calculateVoltageVector meghivva a calculateCurrentVector-bol ****');

        let voltageVector = math.matrix();
        voltageVector.resize([circuit.getNumberOfMesh(),1]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            voltageVector.subset(math.index(i, 0),circuit.getMeshes()[i].getMeshVoltage());
        }
        console.log(voltageVector);
        return voltageVector;
    }

    /**
     * A parameterben megadott aramkor objektum ellenallas-matrixat allitja elo.
     * Altalanos metodus, ami barmelyik halozathoz hasznalhato
     * @param circuit aramkor objektumot var
     */
    public calculateResistanceMatrix(circuit: Circuit): math.Matrix {
        console.log('**** calculateResistanceMatrix meghivva a calculateCurrentVector-bol ****');
        let resistanceMatrix: math.Matrix = math.matrix();
        resistanceMatrix.resize([circuit.getNumberOfMesh(),circuit.getNumberOfMesh()]);
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = i; j < circuit.getNumberOfMesh(); j++){
                if (i === j){
                    resistanceMatrix.subset(math.index(i, j),circuit.getMeshes()[i].getMeshResistance());
                } else {
                    for (let k = 0; k < circuit.getMeshes()[j].getBranches().length; k++){
                        if (circuit.getMeshes()[j].getBranches()[k].getCommon() > circuit.getMeshes()[j].getMeshNumber()){
                            if ((circuit.getMeshes()[j].getBranches()[k].getCommon()-circuit.getMeshes()[j].getMeshNumber()) === circuit.getMeshes()[i].getMeshNumber()){
                                resistanceMatrix.subset(math.index(i, j),(circuit.getMeshes()[j].getBranches()[k].getBranchResistance()*-1));
                            }
                        }
                    }   
                    resistanceMatrix.subset(math.index(j, i),resistanceMatrix.subset(math.index(i, j)));
                }
            }
        }
        console.log(resistanceMatrix);
        return resistanceMatrix;
    }
    
    /**
     * Meghatarozza a parameterul kapott aramkor eredo ellenallasat a keresett 2 polus felol egy seged feszultseggenerator segitsegevel.
     * Szukseges a megfelelo objektumok klonozasa, mert maskeppen csak referenciaval dolgozna a rendszer, ami miatt 
     * az eddig kiszamolt ertekek felulirodnanak.
     * @param circuit aramkor objektumot var
     */
    public calculateCircuitResultingResistance(circuit: Circuit): number {
        console.log('**** calculateCircuitResultingResistance meghivva a finalCalculateOfTheveninSubstitutes ****');
        let th2PoleMeshNumber: number;
        let th2PoleBranchType: number;
        let th2PoleNumberOfBranch: number;
        let commonAndTh2Pole: number;
        //let resistanceExistIndex: number;
        //let th2PoleCounter: number = 0;
        let cloneCircuit: Circuit = circuit.cloneCircuit(circuit);
        
        for (let i = 0; i < cloneCircuit.getNumberOfMesh(); i++){
            if (cloneCircuit.getMeshes()[i].getMeshVoltage() !== 0){
                cloneCircuit.getMeshes()[i].clearMeshVoltage();
            }
            for (let j = 0; j < cloneCircuit.getMeshes()[i].getBranches().length; j++){
                if (cloneCircuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    //console.log('van 2polusa a klonnak');
                    if (cloneCircuit.getMeshes()[i].getBranches()[j].getCommon() !== cloneCircuit.getMeshes()[i].getMeshNumber()){
                        commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                        //this.commonAndTh2Pole = cloneCircuit.getMeshes()[i].getBranches()[j].getCommon();
                        //console.log('Kozos ag a 2 polus');
                    }
                    for (let k = 0; k < cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                        if (cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                            this.questionOrVoltmeterResistance = cloneCircuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getResistance();
                            
                        }
                    }
                    
                    th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    th2PoleNumberOfBranch = j;
                    th2PoleMeshNumber = i+1;
                    //th2PoleMeshNumber = cloneCircuit.getMeshes()[i].getMeshNumber();
                    /*this.th2PoleBranchType = cloneCircuit.getMeshes()[i].getBranches()[j].getType();
                    this.th2PoleNumberOfBranch = j;
                    this.th2PoleMeshNumber = cloneCircuit.getMeshes()[i].getMeshNumber();*/
                }
            }
        }
        return this.calculateResultingResistance(10,this.calculateTh2PoleBranchCurrent(cloneCircuit,commonAndTh2Pole,th2PoleBranchType,th2PoleNumberOfBranch,th2PoleMeshNumber,this.questionOrVoltmeterResistance));
        /*if (commonAndTh2Pole === undefined){
            console.log('**** NINCS KOZOS AGBAN A 2 POLUS ****');
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            //cloneCircuit.getMeshes()[i].setBranches(new Branch(th2PoleBranchType,i));
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  cloneCircuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            //return this.calculateResultingResistance(10,this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]);
            //console.log('nem kozos a 2 polus');
            return this.calculateResultingResistance(10,this.calculateTh2PoleBranchCurrent(cloneCircuit));
        } else {
            console.log('**** KOZOS AGBAN A 2 POLUS ****');
            //console.log(commonAndTh2Pole);
            //console.log(th2PoleMeshNumber);
            //console.log(cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length);
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  cloneCircuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            for (let i = 0; i < cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length; i++){
                if (cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].getCommon() === commonAndTh2Pole) {
                    cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].setBranchElements(this.copyCommonElement(cloneCircuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                    let mesh : Mesh =  cloneCircuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1];
                    mesh.setMeshVoltage(mesh.getBranches()[i]);
                }
            }
            console.log('2 polust tartalmazo hurak arama: '+this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]);
            console.log('2 polussal kozos agat tartalmazo hurak arama: '+this.calculateCurrentVector(cloneCircuit).valueOf()[(commonAndTh2Pole - th2PoleMeshNumber)-1]);
            return this.calculateResultingResistance(10,(this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]-this.calculateCurrentVector(cloneCircuit).valueOf()[(commonAndTh2Pole - th2PoleMeshNumber)-1]));
            console.log(this.calculateTh2PoleBranchCurrent(cloneCircuit));
            //return this.calculateResultingResistance(10,this.calculateTh2PoleBranchCurrent(cloneCircuit));

        }*/
        
        //Ez a megoldas CSAK 2 hurokra es azok kozos agan kijelolt ket polusra mukodik!!!!!
        //return this.calculateResultingResistance(10,(this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber-1]-this.calculateCurrentVector(cloneCircuit).valueOf()[th2PoleMeshNumber]));
        
    }
    /**
     * Az aramkor vegso analiziseert felel. 
     * Meghatarozza a halozat Thevenin ellenallasat, majd a keresett 2 polus kozotti rovidzarasi aram segitsegevel
     * meghatarozza a thevenin helyettesito feszultseget a halozatnak.
     * @param circuit aramkor objektumot var
     */
    public finalCalculateOfTheveninSubstitutes(circuit: Circuit): void {
        console.log('**** finalCalculateOfTheveninSubstitutes meghivva a generateCircuit-bol ****');
        //circuit.setThevRes(this.circuitResultingResistance);
        let tempRes: number;
        circuit.setThevRes(this.calculateCircuitResultingResistance(circuit));
        console.log('**** Thevenin ellenallas kiszamolva: '+circuit.getThevRes()+' ****');
        /*for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                //circuit.getMeshes()[i].getBranches()[j].setCurrent(this.calculateCurrentVector(circuit));
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleCurrent = circuit.getMeshes()[i].getBranches()[j].getCurrent();
                }

                console.log('Branch type: '+ circuit.getMeshes()[i].getBranches()[j].getType()+' Arama: '+circuit.getMeshes()[i].getBranches()[j].getCurrent());
            }
        }*/
        //console.log(this.calculateCurrentVector(circuit));
        //console.log(this.calculateCurrentVector(circuit));
        //circuit.setThevVolt(circuit.getThevRes()*this.calculateCurrentVector(circuit).valueOf()[th2PoleMeshNumber]);
        //circuit.setThevVolt(circuit.getThevRes()*th2PoleCurrent);
        circuit.setThevVolt(circuit.getThevRes()*this.calculateTh2PoleBranchCurrent(circuit));
        
        if (this.questionOrVoltmeterResistance !== undefined){
            this.calculateQuestionResistancCurrentAndVoltage(circuit.getThevRes(),circuit.getThevVolt(),this.questionOrVoltmeterResistance);
        }
        if (this.connectedVoltagesourceInsideResistance !== undefined && this.connectedVoltagesourceValue !== undefined){
            //this.connectedVoltagesourceInsideResistance = undefined;
            //this.connectedVoltagesourceValue = undefined;
            this.outpuVoltageWithconnectedVoltagesource = this.calculateConectedVoltagsourceAndInsideResistance(circuit.getThevVolt(),circuit.getThevRes(),this.connectedVoltagesourceValue,this.connectedVoltagesourceInsideResistance);
        }
    }
    /**
     * Eredo ellenallas szamolasahoz metodus.
     * @param voltage 
     * @param current 
     */
    public calculateResultingResistance(voltage: number, current: number):number{
        console.log('**** calculateResultingResistance meghivva a calculateCircuitResultingResistance-bol****');
        console.log(voltage/current);
        return voltage/current;
    }
    /*public calculateTh2PoleBranchCurrent(circuit: Circuit): number {
        let currentVector: math.MathType = this.calculateCurrentVector(circuit);
        let th2PoleCurrent: number;
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                circuit.getMeshes()[i].getBranches()[j].setCurrent(currentVector);
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleCurrent = circuit.getMeshes()[i].getBranches()[j].getCurrent();
                }
                console.log('Branch type: '+ circuit.getMeshes()[i].getBranches()[j].getType()+' Arama: '+circuit.getMeshes()[i].getBranches()[j].getCurrent()+ 'Branch number: ' +circuit.getMeshes()[i].getBranches()[j].getBranchNumber());
                //console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
                //console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
            }
        }
        //console.log(th2PoleCurrent);
        return th2PoleCurrent;
    }*/
    /**
     * Kotelezo parametere a circuit, ami egy halozat objektum.A tobbi parametertol fuggoen tudja a metodus, hogy pl. belso 2 polus van-e 
     * Ennek a halozatnak a megadott ket polusa kozotti rovidzarasi aramot adja vissza.
     * Kiszamolja az aramkor osszes branch objektuman folyo aramot.
     * @param circuit teljes aramkor
     * @param commonAndTh2Pole kozos agban levo 2 polus
     * @param th2PoleBranchType 2 polust tartalmazo Branch tipusa
     * @param th2PoleNumberOfBranch  2 polsut tartalmazo branch sorszama az ot tartalmazo mesh-ben (tombindex)
     * @param th2PoleMeshNumber 2 polsut tartalmazo branch ebben a szamu mesh-ben van
     */
    public calculateTh2PoleBranchCurrent(circuit: Circuit, commonAndTh2Pole?: number, th2PoleBranchType?:number, th2PoleNumberOfBranch?: number, th2PoleMeshNumber?: number, quesRes?:number): number {
        console.log('commonAndTh2Pole: '+commonAndTh2Pole);
        console.log('th2PoleBranchType: '+th2PoleBranchType);
        console.log('th2PoleNumberOfBranch: '+th2PoleNumberOfBranch);
        console.log('th2PoleMeshNumber: '+th2PoleMeshNumber);
        let th2PoleCurrent: number;
        let currentVector: math.MathType;
        console.log(commonAndTh2Pole);
        if (commonAndTh2Pole === undefined && th2PoleBranchType !== undefined && th2PoleNumberOfBranch !== undefined && th2PoleMeshNumber !== undefined){
            console.log('COMMON AND 2 POLE UNDEFINED');
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            //cloneCircuit.getMeshes()[i].setBranches(new Branch(th2PoleBranchType,i));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            currentVector = this.calculateCurrentVector(circuit);
            
        } else if (commonAndTh2Pole === undefined && th2PoleBranchType === undefined && th2PoleNumberOfBranch === undefined && th2PoleMeshNumber === undefined){

            currentVector = this.calculateCurrentVector(circuit);
        }else {
            
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches().splice(th2PoleNumberOfBranch,1,new Branch(th2PoleBranchType,th2PoleMeshNumber-1));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setCommon((commonAndTh2Pole - th2PoleMeshNumber));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setBranchElements(new VoltageSource(10,false));
            circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].setTh2Pole(true);
            let mesh : Mesh =  circuit.getMeshes()[th2PoleMeshNumber-1];
            mesh.setMeshVoltage(mesh.getBranches()[th2PoleNumberOfBranch]);
            for (let i = 0; i < circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches().length; i++){
                if (circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].getCommon() === commonAndTh2Pole) {
                    circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1].getBranches()[i].setBranchElements(this.copyCommonElement(circuit.getMeshes()[th2PoleMeshNumber-1].getBranches()[th2PoleNumberOfBranch].getBranchElements()[0]));
                    let mesh : Mesh =  circuit.getMeshes()[(commonAndTh2Pole - th2PoleMeshNumber)-1];
                    mesh.setMeshVoltage(mesh.getBranches()[i]);
                }
            }
            currentVector = this.calculateCurrentVector(circuit);
            console.log('CURRENT VEKTOR: '+currentVector);
        }
        //let currentVector: math.MathType = this.calculateCurrentVector(circuit);
        
        for (let i = 0; i < circuit.getNumberOfMesh(); i++){
            for (let j = 0; j < circuit.getMeshes()[i].getBranches().length; j++){
                circuit.getMeshes()[i].getBranches()[j].setCurrent(currentVector);
                if (circuit.getMeshes()[i].getBranches()[j].getTh2Pole()){
                    th2PoleCurrent = circuit.getMeshes()[i].getBranches()[j].getCurrent();
                    console.log('EZ A 2 POLUS BRNCH: '+ circuit.getMeshes()[i].getBranches()[j].getCurrent());
                }
                console.log('Branch type: '+ circuit.getMeshes()[i].getBranches()[j].getType()+' Arama: '+circuit.getMeshes()[i].getBranches()[j].getCurrent()+ 'Branch number: ' +circuit.getMeshes()[i].getBranches()[j].getBranchNumber());
                for (let k = 0; k < circuit.getMeshes()[i].getBranches()[j].getBranchElements().length; k++){
                    if (circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getId() === 'R'){
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setCurrent(circuit.getMeshes()[i].getBranches()[j].getCurrent());
                        circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].setVoltage(0);
                        console.log('  Ellenallas arama: '+ circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getCurrent());
                        console.log('  Ellenallas feszultsege: '+ circuit.getMeshes()[i].getBranches()[j].getBranchElements()[k].getVoltage());
                    }
                }
                
                //console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
                //console.log('   Branch common: '+ circuit.getMeshes()[i].getBranches()[j].getCommon());
            }
        }
        console.log('2 POLE CURRENT: '+th2PoleCurrent);
        return th2PoleCurrent;
    }

    public calculateQuestionResistancCurrentAndVoltage(thRes: number, thVoltage: number, questRes: number): void {
        this.questionOrVoltmeterResistanceVoltage = thVoltage * (questRes/(questRes+thRes));
        this.questionOrVoltmeterResistanceCurrent = this.questionOrVoltmeterResistanceVoltage / questRes;
    }

    public calculateConectedVoltagsourceAndInsideResistance(theveninvoltage: number, theveninresistance: number, connvoltage: number, connresistance: number): number {
        //let outputVoltage: number;
        let connectedCircuit: Circuit = new Circuit(2,2,0,2,1);
        for (let h = 0; h < connectedCircuit.getNumberOfMesh(); h++) {
            connectedCircuit.setMeshes(new Mesh());

            //A 4 iranynak megfelelo branch-ek letrehozasa a mesh-en belul
            for (let i = 0; i < 4; i++){
                connectedCircuit.getMeshes()[h].setBranches(new Branch(i,h));
            }
        }
        //if 
        connectedCircuit.getMeshes()[0].getBranches()[0].setBranchElements(new VoltageSource(math.abs(theveninvoltage),(theveninvoltage < 0 ? true : false)));
        connectedCircuit.getMeshes()[0].getBranches()[1].setBranchElements(new Resistance(theveninresistance));
        connectedCircuit.getMeshes()[1].getBranches()[2].setBranchElements(new VoltageSource(connvoltage,true));
        connectedCircuit.getMeshes()[1].getBranches()[1].setBranchElements(new Resistance(connresistance));
        connectedCircuit.getMeshes()[0].getBranches()[2].setCommon(2);
        connectedCircuit.getMeshes()[1].getBranches()[0].setCommon(1);
        connectedCircuit.getMeshes()[0].getBranches()[2].setTh2Pole(true);


        for (let i = 0; i < connectedCircuit.getMeshes().length; i++){
            for(let j = 0; j < connectedCircuit.getMeshes()[i].getBranches().length; j++){
                let mesh : Mesh =  connectedCircuit.getMeshes()[i];
                mesh.setMeshVoltage(mesh.getBranches()[j]);
                mesh.setMeshResistance(mesh.getBranches()[j]);
                //console.log(mesh.getBranches()[j]);
            }
        }
        console.log(connectedCircuit);
        connectedCircuit.setThevRes(this.calculateCircuitResultingResistance(connectedCircuit));
        console.log('CONNECTED EREDO: ' +connectedCircuit.getThevRes());
        connectedCircuit.setThevVolt(connectedCircuit.getThevRes()*this.calculateTh2PoleBranchCurrent(connectedCircuit));
        //this.finalCalculateOfTheveninSubstitutes(connectedCircuit);
        return connectedCircuit.getThevVolt();
    }
     /**
     * A kozos agakban szereplo aramkori elemek masolasat vegzi.
     * A generatoroknal forditja az iranyt, mivel a ket szomszedos hurokban maskepp hatnak.
     * @param element egy aramkori elemet var
     */
    public copyCommonElement(element: CircuitElements): CircuitElements{
        let circuitelement: CircuitElements;
        if (element.getId() === 'R') {
            circuitelement = new Resistance(element.getResistance());
        }
        if (element.getId() === 'V') {
            circuitelement = new VoltageSource(element.getVoltage(),!element.getDirection()); 
        }
        if (element.getId() === 'C') {
            circuitelement = new CurrentSource(element.getVoltage(),!element.getDirection());
        }
        return circuitelement;
    }
    public randomIntNumber(max: number, min: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    public randomFloatNumber(max: number, min: number): number {
        return +(Math.random() * (max - min) + min).toFixed(2);
    }
    public randomBoolean(): boolean {
        if ((Math.floor(Math.random() * 2) + 1) === 1) {
            return false;
        } else {
            return true;
        }
    }
    public randomVoltageSourceValue(): number {
        return this.randomIntNumber(24, 1);
    }
    public randomCurrentSourceValue(): number {
        return this.randomFloatNumber(1.40,0.01);
    }
    /**
     * Az E6-os ellenallas sorhoz tartozo ellenallas ertekek random generalasa,
     * 1K, 10K es 100K ertekekhez
     */
    public randomE6Resistance():number{
        let resistance: number[]=[1000,10000,100000];
        let e6base: number[] = [1,1.5,2.2,3.3,4.7,6.8];
        return e6base[this.randomIntNumber(5,0)]*resistance[this.randomIntNumber(2,0)];
    }
    public setCommonBranches(commonBranch: Branch): void{
        this.commonBranches.push(commonBranch);
    }
    public setQuestionOrVoltmeterResistance(value: number): void{
        this.questionOrVoltmeterResistance = value;
    }
    public setConnectedVoltagesourceValue(value: number): void {
        this.connectedVoltagesourceValue = value;
    }
    public setConnectedVoltagesourceResistance(value: number): void {
        this.connectedVoltagesourceInsideResistance = value;
    }
    public getConnectedVoltagesourceValue(): number {
        return this.connectedVoltagesourceValue;
    }
    public getConnectedVoltagesourceResistance(): number {
        return this.connectedVoltagesourceInsideResistance;
    }
    public getOutputVoltageWithConnectedVoltageSource(): number{
        return this.outpuVoltageWithconnectedVoltagesource;
    }
    public getCircuit(): Circuit {
        return this.circuit;
    }
    public getCircuitCurrentVector(): math.MathType{
        return this.circuitCurrentVector;
    }
    public getCircuitVoltageVector(): math.Matrix{
        return this.circuitVoltageVector;
    }
    public getCircuitResistanceMatrix(): math.Matrix{
        return this.circuitResistanceMatrix;
    }
    public getCircuitResultingResistance(): number {
        return this.circuitResultingResistance;
    }
    public getQuestionResVoltage(): number {
        return this.questionOrVoltmeterResistanceVoltage;
    }
    public getQuestionRes(): number {
        return this.questionOrVoltmeterResistance;
    }
    public getQuestionResCurrent(): number {
        return this.questionOrVoltmeterResistanceCurrent;
    }
}
