export class Serverfunction{
    private fs = require('fs');
    private checkTimeToSolvedTask: number = 60*1000;

    public addDatatoJSONfile(pushData,id){
        console.log()
        /*if (!this.fs.existsSync('generateLOG.json')){
            this.fs.writeFileSync('generateLOG.json','{}', (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }*/
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        if (generateLOG[0] === undefined){
            console.log('Ures file volt');
            generateLOG = '{}';
        }
        let resultLOG = JSON.parse(generateLOG);
        resultLOG[id] = pushData;
        let pushlogData = JSON.stringify(resultLOG, null, 2);
        
    
        this.fs.writeFileSync('generateLOG.json',pushlogData, (err) => {
            if (err) {
                return console.error(err);
            }
        });
        
    }
    public deleteDatatoJSONfile(id: string){
        console.log("Ezt kellene torolni: "+id);
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        console.log("torlos fuggvenyben");
        console.log(resultLOG);
        delete resultLOG[id];
        let refreshlogData = JSON.stringify(resultLOG, null, 2);
        this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
            if (err){
                return console.error(err);
            }
        });
        
    }
    
    public checkSolving(){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        /*if (generateLOG[0] === undefined){
            this.fs.writeFileSync('generateLOG.json',"{}", (err) => {
                if (err) {
                    return console.error(err);
                }
            });
            generateLOG = this.fs.readFileSync('generateLOG.json');
        }*/
        let resultLOG = JSON.parse(generateLOG);
        let deleted: boolean = false;
        let difference; 
        console.log(Object.keys(resultLOG).length);
        
        if (Object.keys(resultLOG).length > 0){
            console.log('resultLOG elotte: ');
            console.log(resultLOG);
            for (let key in resultLOG) {
                if (resultLOG.hasOwnProperty(key)) {
                    difference = this.timeDifference(new Date(),new Date(resultLOG[key].timestamp));
                    console.log(key+': '+difference[0]+ ' day '+difference[1]+ ' hour '+difference[2]+ ' minute '+difference[3]+ ' sec.');
                    if (difference[0] > 0 || difference[1] > 0 || difference[2] > 5 /*|| difference[3] > 25 */ ){
                        console.log('van torolni vali');
                        deleted = true;
                        delete resultLOG[key];
                        //deleteDatatoJSONfile(key);
                    }
                }
            }
            console.log('resultLOG torles utan: ');
            console.log(resultLOG);
            if (deleted){
                console.log('resultLOG utana: ');
                //setTimeout(() =>{
                    let refreshlogData = JSON.stringify(resultLOG, null, 2);
                    console.log(refreshlogData);
                    this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
                        console.log(refreshlogData);
                        if (err) {
                            return console.error(err);
                        }
                    });
                //},200);
                console.log('Idokorlaton tuli feladatok torolve!')
            } else {
                console.log('Minden feladat aktiv');
            }
        } else {
            console.log('Kiadott feladatok listaja ures!');
        }
        return;
    }
    public timeDifference(date1,date2) {
        let difference = date1 - date2;
        let daysDifference = Math.floor(difference/1000/60/60/24);
        difference -= daysDifference*1000*60*60*24
    
        let hoursDifference = Math.floor(difference/1000/60/60);
        difference -= hoursDifference*1000*60*60
    
        let minutesDifference = Math.floor(difference/1000/60);
        difference -= minutesDifference*1000*60
    
        let secondsDifference = Math.floor(difference/1000);
    
        //return daysDifference+ ' day '+hoursDifference+ ' hour '+minutesDifference+ ' minute '+secondsDifference+ ' sec.';
        return [daysDifference, hoursDifference, minutesDifference, secondsDifference];
    }
    public checkExistTaskLOGfile(): void{
        if (!this.fs.existsSync('generateLOG.json')){
            this.fs.writeFileSync('generateLOG.json','{}', (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
    }
    public intervalTimer(){
        setInterval(() =>this.checkSolving(),this.checkTimeToSolvedTask);
        //return setInterval(this.checkSolving(),this.checkTimeToSolvedTask);
    }
    public getCheckTime():number {
        return this.checkTimeToSolvedTask;
    }
    public getFs(){
        return this.fs;
    }
}