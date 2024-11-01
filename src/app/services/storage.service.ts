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
    //console.log(this._storage)
  }
  public async set(key: string, value: any) {
    if(!this._storage)
      await this.configDB() ;
      this._storage?.set(key, value);
    

  }
  public async get(key: string) {
    if(!this._storage)
            await this.configDB() ;
    return await this._storage?.get(key);
  }

  public async remove(key: string) {
    if(!this._storage)
            await this.configDB() ;
    return await this._storage?.remove(key);
  }

  public async clear() {
    await this._storage?.clear();
  }
}
