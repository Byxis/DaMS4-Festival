export class Festival {
    constructor(
        public id: number,
        public name: string,
        public location: string,
        public start_date: Date,
        public end_date: Date,
        public table_count: number = 0,
        public big_table_count: number = 0,
        public town_table_count: number = 0

    ) {}
    get currentlyGoing(): boolean{
        const now = new Date();
        if (now > this.start_date && now < this.end_date) {
            return true;
        }else{
            return false;
        }
    }
}
