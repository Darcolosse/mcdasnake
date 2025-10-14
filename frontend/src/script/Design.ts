export class Design {

    private color!: string;

    constructor(color: string){
        this.setColor(color);
    }

    // ============================ Set ============================ \\

    public setColor(color : string) : void {
        this.color = color;
    }

    // ============================ Get ============================ \\

    public getColor() : string{
        return this.color
    }
    
}