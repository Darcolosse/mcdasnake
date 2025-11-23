import type { Ref } from "vue";

export class Scoreboard {
  private records: Ref<Map<string, [string, number, number, number]>>

  constructor(records : Ref<Map<string, [string, number, number, number]>>){
    this.records.value 
  }
}
