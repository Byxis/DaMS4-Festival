export class Festival {
    constructor(
        public id: number,
        public name: string,
        public location: string,
        public startDate: Date,
        public endDate: Date,
        public table: number = 0,
        public bigTable: number = 0,
        public townTable: number = 0

    ) {}
    get currentlyGoing(): boolean{
        const now = new Date();
        console.log("Festival", this.name, " - Checking if currently going...");
        console.log("Now : ", now);
        console.log("StartDate : ", this.startDate);
        console.log("EndDate : ", this.endDate);
        if (now > this.startDate && now < this.endDate) {
            return true;
        }else{
            return false;
        }
    }
}
