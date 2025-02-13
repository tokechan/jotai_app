export class Note {
    constructor(
        public id: string,
        public title: string,
        public content: string,
        public lastEditTime: number
    ) {}
}