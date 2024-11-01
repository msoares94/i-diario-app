import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Device } from '@capacitor/device';
import { environment } from '../../environments/environment';
import { StorageService } from '../services/storage.service';


@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {
  app_version!: string;
  binary_version!: string;
  minor_version!: string;
  public user_email!: string;
  public user_full_name!: string;
  public device!: any;
  public carregou: boolean = false;

  constructor(private storage: StorageService, private router: Router,) {
    this.storage.get('user').then((user) => {
      //console.log(user);
      this.user_email = user.email;
      this.user_full_name = user.first_name + ' ' + user.last_name;
    });
  }

  async ngOnInit() {
    this.app_version = environment.appversion;
    await Device.getInfo().then(res => {
      console.log(res);
      if (res) {
        this.device = res;
        this.carregou = true;
      }
    });

    console.log(this.device);
  }

  logout() {

    this.storage.clear().then(res => {
      console.log(res);
    }).finally(() => {
      this.router.navigate(['/sign-in']);
    });

  }

}
