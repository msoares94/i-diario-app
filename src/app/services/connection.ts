import { Network } from '@capacitor/network';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ConnectionService {
  public isOnline:boolean = false;
  public eventOnline: EventEmitter<any> = new EventEmitter;
  public status: any;

  constructor(){
    
    this.init();
    //this.isOnline = (this.network.type !== "none");
  }
  async init(){
    this.status = await Network.getStatus();
    console.log(this.status)
    if(this.status.connectionType != "none"){
      this.isOnline = true;
    }
    //console.log(this.isOnline)
  }
  setStatus(online: boolean){
    this.isOnline = online;
    this.eventOnline.emit(this.isOnline);
  }
  getNetworkType() {
    return this.status.connectionType;
  }
}