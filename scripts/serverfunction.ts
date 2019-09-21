export class Serverfunction{
    private fs = require('fs');
    private checkTimeToSolvedTask: number = 30*60*1000;

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
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        delete resultLOG[id];
        let refreshlogData = JSON.stringify(resultLOG, null, 2);
        this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
            if (err){
                return console.error(err);
            }
        });
        
    }
    /*public deleteData(id: string){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        if (generateLOG[0] === undefined){
            console.log('Ures file volt');
            generateLOG = '{}';
        }
        let resultLOG = JSON.parse(generateLOG);
        delete resultLOG[id];
        let refreshlogData = JSON.stringify(resultLOG, null, 2);
        this.fs.writeFileSync('generateLOG.json',refreshlogData, (err) => {
            if (err) {
                return console.error(err);
            }
        });
        
    }*/
    public setResultWithPrefix(originalResult:number,prefix: string){
        let result: number = originalResult;
        if (prefix ==="m"){
            result = result * 1000;
        }
        if (prefix ==="µ"){
            result = result * 1000000;
        }
        if (prefix ==="n"){
            result = result * 1000000000;
        }
        if (prefix ==="p"){
            result = result * 1000000000000;
        }
        if (prefix ==="k"){
            result = result / 1000;
        }
        if (prefix ==="M"){
            result = result / 1000000;
        }
        return +result;
    }
    public compareResults(userCalc: number, circuitResult: number, toleranceType?: string){
        console.log("circuitResult: "+circuitResult);
        console.log("userCalc: "+userCalc);
        let resultTolerance: number[] = [circuitResult - 0.005, circuitResult + 0.005];
        console.log(resultTolerance);
        if (+userCalc.toFixed(3) >= resultTolerance[0] && +userCalc.toFixed(3) <= resultTolerance[1]){
            return true;
        } else {
            return false;
        }
    }
    public searchResults(id, usrVolt, usrRes?, usrCur?,voltPref?,currentPref?,ohmPrefix?){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        console.log('id: '+id);
        console.log('usrVolt: '+usrVolt);
        console.log('usrRes: '+usrRes);
        console.log('usrCur: '+usrCur);
        console.log('voltPref: '+voltPref);
        console.log('currentPref: '+currentPref);
        console.log('ohmPrefix: '+ohmPrefix);
        console.log();
        console.log('resultlog[id]');
        console.log(resultLOG[id]);
        //let userThres: boolean = compareResults(usrRes, +resultLOG[id].thres);
        //let userVolt: boolean = compareResults(usrVolt, +resultLOG[id].thvolt);
        //let resCurrent: boolean = compareResults(usrCur, +resultLOG[id].resCurrent)
        
        if (usrCur === undefined && usrRes !== undefined && voltPref !== undefined && currentPref === undefined && ohmPrefix !== undefined){
            let thvolt: number = this.setResultWithPrefix(resultLOG[id].thvolt,voltPref);
            let thres: number = this.setResultWithPrefix(resultLOG[id].thres,ohmPrefix);
            console.log('thvolt: '+thvolt);
            console.log('thres: '+thres);
            let userThres: boolean = this.compareResults(usrRes, +thres);
            let userVolt: boolean = this.compareResults(usrVolt, +thvolt);
            return {
                res: userThres,
                volt: userVolt,
                circuitTHres: this.setResultWithPrefix(resultLOG[id].thres,ohmPrefix),
                circuitTHvolt: this.setResultWithPrefix(resultLOG[id].thvolt,voltPref),
                link: undefined
            };
        } else if (usrCur !== undefined && usrRes === undefined && voltPref !== undefined && currentPref !== undefined && ohmPrefix === undefined ){
            console.log('BELEPETT');
            let resVolt: number = this.setResultWithPrefix(resultLOG[id].resVolt,voltPref);
            let resCur: number = this.setResultWithPrefix(resultLOG[id].resCurrent,currentPref);
            let usrResVolt: boolean = this.compareResults(usrVolt, +resVolt);
            let usrResCurrent: boolean = this.compareResults(usrCur, +resCur);
            let absError: number = this.setResultWithPrefix(resultLOG[id].absError,voltPref);
            let relError: number = resultLOG[id].relativeError;
            let compareAbs: boolean = false;
            let compareRel: boolean = false;
            if (resultLOG[id].absError !== null && resultLOG[id].relativeError !== null){
                compareAbs = this.compareResults(usrCur, +absError);
                compareRel = this.compareResults(usrVolt, +relError);
            } 
            
            return {
                current: usrResCurrent,
                volt: usrResVolt,
                resCur: this.setResultWithPrefix(resultLOG[id].resCurrent,currentPref),
                resVolt: this.setResultWithPrefix(resultLOG[id].resVolt,voltPref),
                abs: compareAbs,
                rel: compareRel,
                absErr: absError,
                relErr: relError,
                link: undefined
            };
        }
    }
    public timeOutResult(id,voltPref?,currentPref?,type?,resPrefix?){
        let generateLOG = this.fs.readFileSync('generateLOG.json');
        let resultLOG = JSON.parse(generateLOG);
        console.log("resultLOG: ");
        //console.log(resultLOG);
        if (type === "6" || type === "7"){
            if (type === "7"){
                return {
                    resCur: this.setResultWithPrefix(resultLOG[id].absError,voltPref),
                    resVolt: resultLOG[id].relativeError 
                }
            } else {
                return {
                    resCur: this.setResultWithPrefix(resultLOG[id].resCurrent,currentPref),
                    resVolt: this.setResultWithPrefix(resultLOG[id].resVolt,voltPref)
                }
            }
            
        } else {
            return {
                circuitTHres: this.setResultWithPrefix(resultLOG[id].thres,resPrefix),
                circuitTHvolt: this.setResultWithPrefix(resultLOG[id].thvolt,voltPref),
            }
        }
        
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
                    if (difference[0] > 0 || difference[1] > 0 || difference[2] > 29 /*|| difference[3] > 30 */ ){
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