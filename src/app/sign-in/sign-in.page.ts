import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { NgForm } from '@angular/forms';
import { LoadingController, NavController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { ConnectionService } from '../services/connection';
import { CustomersService } from '../services/customers';
import { MessagesService } from '../services/messages';
import { UtilsService } from '../services/utils';
import { Router } from '@angular/router';
import { User } from '../data/user.interface';
import { Customer } from '../data/customer.interface';
import { OfflineDataPersisterService } from '../services/offline_data_persistence/offline_data_persister';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  cities: Customer[] = [
    { name: 'i-Diário', url: 'http://localhost:3000', support_url: '' },
  ];
  anyError: boolean = false;
  errorMessage: string = "";
  selectedCity: Customer | undefined;
  isOnline: boolean = true;
  supportUrl: string = "";

  credentials: string = "";
  password: string = "";


  constructor(
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private connection: ConnectionService,
    private customersService: CustomersService,
    private api: ApiService,
    private utilsService: UtilsService,
    private messages: MessagesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private offlineDataPersister: OfflineDataPersisterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.isOnline = this.connection.isOnline;
    await this.connection.eventOnline.subscribe((online: boolean) =>{
      console.log(online)
      this.changeInputMunicipios(online)
    } );
  }

  ionViewWillEnter() {

  }

  changeInputMunicipios(online: boolean) {
    console.log(online)
    this.isOnline = online;
    if (!this.isOnline) {
      this.selectedCity = undefined;
      this.messages.showToast('Sem conexão!', 1000, 'top');
    } else {
      //this.getCustomers();
    }
  }

  updateSupportUrl() {
    if (this.selectedCity != undefined)
      this.api.setServerUrl(this.selectedCity.url);

    const defaultSupport = "https://portabilis.freshdesk.com/";
    this.supportUrl = this.selectedCity ? this.selectedCity.support_url || defaultSupport : "";
  }

  getCustomers() {
    this.customersService.getCustomers().subscribe(
      (data: Customer[]) => {
        console.log(data)
        this.cities = data;
        this.cdr.detectChanges();
      });
  }

  async loginForm(form: NgForm) {
    console.log(form);
    const credential = this.credentials;
    const password = this.password;
    console.log(credential);
    const loading = await this.loadingCtrl.create({
      message: 'Carregando ...',
      duration: 3000,
    });

    loading.present();

    this.auth.signIn(credential, password).subscribe(
      (user: User) => {
        console.log(user);
        if (user) {
          this.auth.setCurrentUser(user);
          this.offlineDataPersister.persist(user).subscribe(res => {
            console.log(res);
          })

          this.router.navigate([''], { queryParams: user });
        }else{
          this.anyError = true;
          this.errorMessage = " ";
          loading.dismiss();
        }

      },
      (error: any) => {
        console.log(error)
        this.anyError = true;
        this.errorMessage = "Não foi possível efetuar login.";
        loading.dismiss();
      },
      () => {
        loading.dismiss();
      });
  }

  greetingText() {
    let split_afternoon = 12;
    let split_evening = 17;
    let currentHour = this.utilsService.getCurrentDate().getHours();

    let greeting = "bom dia";

    if (currentHour >= split_afternoon && currentHour <= split_evening) {
      greeting = 'boa tarde';
    } else if (currentHour >= split_evening) {
      greeting = 'boa noite';
    }

    return `Olá, ${greeting}!`;
  }

  openSupportUrl() {
    this.utilsService.openUrl(this.supportUrl);
  }
}
