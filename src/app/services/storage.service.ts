import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  constructor(private storage: Storage) { 
      this.configDB();
  }

  async configDB(){
    const store = new Storage();
    await store.create();
    this._storage = store;
  }
  public set(key: string, value: any) {

      this._storage?.set(key, value);
    

  }
  public async get(key: string) {
    if(!this._storage)
            await this.configDB() ;
    return await this._storage?.get(key);
  }
}
