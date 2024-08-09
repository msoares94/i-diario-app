import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable()
export class MessagesService {
  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) { }

  public async showError(message: string) {

    let title = 'Erro';
    let buttons = [{
      text: 'OK',
      handler: () => { }
    }]

    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      //enableBackdropDismiss: false,
      buttons: buttons,
    });

    await alert.present();
  }

  public async showAlert(message: string,
    title = 'Mensagem',
    buttons = [{
      text: 'OK',
      handler: () => { }
    }]) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      //enableBackdropDismiss: false,
      buttons: buttons,
    });

    await alert.present();
  };

  public async showToast(message: string,
    duration = 3000,
    position = 'middle') {

      const toast = await this.toastCtrl.create({
        message: message,
        duration: duration,
        position: 'middle',
      });
  
      await toast.present();

  }

  public insuficientStorageErrorMessage(action: string) {
    return `Espaço de armazenamento insuficiente no dispositivo para ${action}. São necessários, no mínimo, 50 MB livres para executar a operação.`;
  }
}