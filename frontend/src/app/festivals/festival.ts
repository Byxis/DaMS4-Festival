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
        if (now > this.startDate && now < this.endDate) {
            return true;
        }else{
            return false;
        }
    }
}
