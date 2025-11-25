import { ref, type Ref } from 'vue'
import { DisplayGameSimple } from '../core/display/DisplayGameSimple';
import { Design, Graphism } from '../core/display/Design';
import { SnakeDisplayed } from '../core/display/SnakeDisplayed';
import { CookieType, getCookiePlus, setCookie } from '../util/cookies';
import type { SpriteName } from '../core/display/SpriteManager';
import { reactive } from 'vue'

export interface colorInterface{
    name:string,
    value:string
}

export interface spriteInterface{
    name:string,
    src:string
}

interface settingChoice{
    value: string,
    enabled: boolean,
    element: Ref<string>,
}

export const SettingName = {
  GRAPHISM:"GRAPHISM",
  COLOR1:"COLOR1",
  COLOR2:"COLOR2",
  CUSTOMCOLOR1:"CUSTOMCOLOR1",
  CUSTOMCOLOR2:"CUSTOMCOLOR2",
  TEXTURE:"TEXTURE",
  HEAD:"HEAD",
} as const;
export type SettingName = typeof SettingName[keyof typeof SettingName];

export class SettingsAction {

    // general settings
    private choice! : Record<SettingName, settingChoice>;

    // html
    private mode = ref<"color" | "texture">("color");

    // preview
    private canvas : (HTMLCanvasElement | null) = null;
    private preview : (DisplayGameSimple | null) = null;
    private design! : Design;

    constructor(){
        this.loadCookieParameter();
        console.log(this.choice);
    }

    public getMode() : string{
        return this.mode.value
    }

    public getElement(settingName: SettingName) : string{
        return this.choice[settingName].element.value;
    }

    public isEnabled(settingName: SettingName) : boolean{
        return this.choice[settingName].enabled;
    }

    public getValue(settingName: SettingName) : string{
        return this.choice[settingName].value;
    }

    public setMode(state: ("color" | "texture")) : void{
        this.mode.value = state;
    }

    public setCanvas(canvas: HTMLCanvasElement){
        if (!this.canvas || !this.preview) {
            this.canvas = canvas;
            this.preview = new DisplayGameSimple(this.canvas, [5,3]);
            let snakePreview = new SnakeDisplayed(this.preview, [[1,1],[2,1],[3,1]], 0, this.design, 1, 0);
            this.preview.setEntity2("preview", snakePreview);
            this.preview.show();
        }
        else{
            this.canvas = canvas;
            this.preview.setCanvas(this.canvas);
        }
    }

    public loadCookieParameter(){
        const raw = getCookiePlus(CookieType.Design);
        let defaultValue = true;
        this.design = new Design("white","HEAD_CLASSIC","NORMAL");
        console.log("trying load ",raw);
        if (raw) {
            try {
                this.choice = SettingsAction.parseChoice(raw);
                console.log("load finish ",this.choice);
                defaultValue = false;
                this.updateDesign();
                
            } catch (err) {
                defaultValue = true;
            }
        }

        if (defaultValue){
            this.choice = SettingsAction.getDefaultChoice();
        }   
    }

    public changeColor(numColor: number, color: string, isCustom: boolean) {
        const existColor = (color) ? true : false;
        const choice = this.choice["COLOR"+numColor as SettingName];
        
        if (choice){
            choice.value = color;
            choice.enabled = existColor;
            if (existColor){
                if (isCustom){
                    choice.element.value = "custom"+numColor+"_";
                    this.choice["CUSTOMCOLOR"+numColor as SettingName].value = color;
                    this.choice["CUSTOMCOLOR"+numColor as SettingName].element.value = color;
                } else{
                    choice.element.value = "default"+numColor+"_"+color;
                }
                if (numColor===1) this.design.setColor1(color);
                if (numColor===2) this.design.setColor2(color);
            }
            else{
                choice.element.value = ("noColor" + numColor + "_");
                if (numColor===1) this.design.setColor1(undefined);
                if (numColor===2) this.design.setColor2(undefined);
            }
        }
        this.choice[SettingName.TEXTURE].enabled = false;
        this.design.setTexture(undefined);
        this.drawPreview();
    }

    public selectHead(name: SpriteName) {
        this.design.setHead(name);
        this.setAttribut(SettingName.HEAD, name, name, true);
        
    }

    public selectTexture(name: SpriteName) {
        this.design.setTexture(name);
        this.setAttribut(SettingName.TEXTURE, name, name, true);
    }

    public selectGraphics(level: Graphism){
        this.design.setGraphism(level as Graphism);
        if (level === "VERY_LOW") { // Mode couleurs (1) exclusif   
            this.removeColor2();
        }
        if (level === "LOW" || level === "VERY_LOW"){ // pas de choix de tete
            this.choice[SettingName.HEAD].enabled = false;
        }
        else{
            this.choice[SettingName.HEAD].enabled = true;
        }
        this.setAttribut(SettingName.GRAPHISM, level, level, true);
    }

    public removeColor2(){
        this.choice[SettingName.COLOR2].enabled = false;
        this.design.setColor2(undefined);
        this.drawPreview();
    }

    public applyChanges() {
        console.log('Applied settings:', this.stringifyChoice());
        setCookie(CookieType.Design, this.stringifyChoice(), 1)
    }

    // ============================ STATIC =========================== \\

    public static getStringDesign(SettingCookie : string) : string {
        const settingChoice = SettingsAction.parseChoice(SettingCookie);
        const designObject = SettingsAction.createDesignCookieObject(settingChoice);
        return JSON.stringify(designObject);
    }

    // ============================ PRIVATE =========================== \\

    private static getDefaultChoice() : Record<SettingName, settingChoice>{
        return {
            [SettingName.GRAPHISM] : {value:"NORMAL", enabled:true, element: ref("NORMAL")},
            [SettingName.COLOR1] : {value:"white", enabled:true, element: ref("custom_ffffff")},
            [SettingName.COLOR2] : {value:"", enabled:false, element: ref("custom_ffffff")},
            ["CUSTOMCOLOR1"] : {value:"white", enabled:false, element: ref("custom_ffffff")},
            ["CUSTOMCOLOR2"] : {value:"white", enabled:false, element: ref("custom_ffffff")},
            [SettingName.TEXTURE] : {value:"", enabled:false, element: ref("")},
            [SettingName.HEAD] : {value:"HEAD_CLASSIC", enabled:true, element: ref("HEAD_CLASSIC")}
        };
    }

    private setAttribut(settingName: SettingName, value : string, newSet : string, enabled : boolean){
        const choice = this.choice[settingName];
        choice.value = value;
        choice.element.value = newSet;
        choice.enabled = enabled;
        this.drawPreview();
    }

    private stringifyChoice(): string {
        const clean: Record<string, { value: string; enabled: boolean; element: string }> = {};
        for (const key in this.choice) {
            const c = this.choice[key as SettingName];
            clean[key] = {
                value: c.value,
                enabled: c.enabled,
                element: c.element.value
            };
        }
        return JSON.stringify(clean);
    }

    private static parseChoice(raw: string) : Record<SettingName, settingChoice> {
        try{
            const parsed = JSON.parse(raw);
            const result = {} as any;
            for (const key in parsed) {
                const c = parsed[key];

                result[key as SettingName] = {
                    value: c.value,
                    enabled: c.enabled,
                    element: ref(c.element),
                };
                }
            return result;
        }
        catch(e){
            return SettingsAction.getDefaultChoice();
        }
    }




    private static createDesignCookieObject(settingChoice: Record<SettingName, settingChoice>) : object {
        const obj: Record<string, string> = {};
        if (settingChoice[SettingName.GRAPHISM].enabled) {
            obj.graphism = settingChoice[SettingName.GRAPHISM].value;
        }
        if (settingChoice[SettingName.COLOR1].enabled) {
            obj.color1 = settingChoice[SettingName.COLOR1].value;
        }
        if (settingChoice[SettingName.COLOR2].enabled) {
            obj.color2 = settingChoice[SettingName.COLOR2].value;
        }
        if (settingChoice[SettingName.TEXTURE].enabled) {
            obj.texture = settingChoice[SettingName.TEXTURE].value;
        }
        if (settingChoice[SettingName.HEAD].enabled) {
            obj.head = settingChoice[SettingName.HEAD].value;
        }
        return obj;
    }



    private updateDesign(){
        if (this.choice[SettingName.GRAPHISM].enabled){
            this.design.setGraphism(this.choice[SettingName.GRAPHISM].value as Graphism);
        }
        if (this.choice[SettingName.COLOR1].enabled){
            this.design.setColor1(this.choice[SettingName.COLOR1].value);
        }
        if (this.choice[SettingName.COLOR2].enabled){
            this.design.setColor2(this.choice[SettingName.COLOR2].value);
        }
        if (this.choice[SettingName.TEXTURE].enabled){
            this.design.setTexture(this.choice[SettingName.TEXTURE].value as SpriteName);
        }
        if (this.choice[SettingName.HEAD].enabled){
            this.design.setHead(this.choice[SettingName.HEAD].value as SpriteName);
        }
    }


    private drawPreview() {
        if (this.preview){
            this.preview.show();
        }
    }
    
}