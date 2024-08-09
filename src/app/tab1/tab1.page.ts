import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils';
import { SyncProvider } from '../services/sync';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  shownGroup: string | null = null;
  lastFrequencyDays: any[] | null = null;
  emptyFrequencies = false;
  currentDate: Date | null = null;
  frequenciesLoaded = false;

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    private storage: Storage,
    private router: Router,
    private utilsService: UtilsService,
    private sync: SyncProvider

  ) { }

  async ngOnInit() {
    await this.auth.currentUser().subscribe(res => {
      console.log(res);
      if (!res) {
        this.router.navigate(['/sign-in']);
      }
    })
    await this.utilsService.viewIsLeaving().subscribe(async isLeaving => {
      if (isLeaving) {
        await this.loadFrequencies();
        this.frequenciesLoaded = true;
      }
    });

    await this.sync.isSyncDelayed();
  }

  ionViewWillEnter() {
    if (
      !this.frequenciesLoaded &&
      (!this.currentDate //||
        // this.navCtrl.last()['component']['name'] == 'FrequencyPage' ||
        // this.navCtrl.last()['component']['name'] == 'StudentsFrequencyPage'
      )
    ) {
      this.loadFrequencies();
    }
    this.frequenciesLoaded = false;
  }

  async loadFrequencies() {
    this.shownGroup = null;
    this.currentDate = this.utilsService.getCurrentDate();
    this.currentDate.setHours(0, 0, 0, 0);
    const frequencies = await this.storage.get('frequencies');
    if (frequencies) {
      // this.lastFrequencyDays = this.lastTenFrequencies(frequencies.daily_frequencies);
      this.emptyFrequencies = false;
    } else {
      this.emptyFrequencies = true;
      this.currentDate = null;
    }
    this.emptyFrequencies = true;
  }

  async newFrequency() {
    /*const available = await this.utilsService.hasAvailableStorage();
    if (!available) {
      this.messages.showError(this.messages.insuficientStorageErrorMessage('lançar novas frequências'));
      return;
    }
    const unities = await this.storage.get('unities');
    this.navCtrl.navigateForward(['FrequencyPage'], { queryParams: { unities: unities } });*/
  }

  toggleGroup(group: string) {
    this.shownGroup = this.isGroupShown(group) ? null : group;
  }

  isGroupShown(group: string) {
    return this.shownGroup === group;
  }

  private lastTenFrequencies(frequencies: any[]) {
  /*  const lastDays = [];
    const frequencyLimit = 10;
    for (let i = frequencyLimit; i > 0; i--) {
      // const shortDate = this.utilsService.toStringWithoutTime(this.currentDate);
      // const frequenciesOfDay = this.frequenciesOfDay(frequencies, shortDate);
      lastDays.push({
        // date: shortDate,
        // format_date: this.utilsService.toExtensiveFormat(this.currentDate),
        // exists: frequenciesOfDay.length > 0,
        unities: this.unitiesOfFrequency(frequenciesOfDay)
      });
      // this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    return lastDays;*/
  }

  private frequenciesOfDay(frequencies: any[], date: string) {
    return frequencies.filter((frequency) => frequency.frequency_date == date);
  }

  unitiesOfFrequency(frequencies: any[]) {
   /* if (!frequencies) return null;
    let unities = [];
    frequencies.forEach(frequency => {
      if (unities.filter((unity) => unity.id == frequency.unity_id).length == 0) {
        unities.push({
          id: frequency.unity_id,
          name: frequency.unity_name,
          classroomDisciplines: this.classroomDisciplinesOfUnityFrequency(frequencies, frequency.unity_id)
        });
      }
    });
    return unities;*/
  }


  loadMoreFrequencies() {
    console.log('o q isso faz?');
  }
  doRefresh() {

  }

  editFrequency(um: any, dois: any, tres: any, quatro: any, cinco: any) {
    console.log(um);
    console.log(dois);


  }
}