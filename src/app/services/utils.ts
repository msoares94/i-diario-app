import { Injectable } from '@angular/core';
import { ConnectionService } from './connection';
import { Browser } from '@capacitor/browser';
import { MessagesService } from './messages';
import { Subject } from 'rxjs';

@Injectable()
export class UtilsService {
  constructor(
    private _connectionService: ConnectionService,
    private messages: MessagesService,
  ) { }

  private viewSubject: Subject<boolean> = new Subject<boolean>();

  public leaveView(isLeaving: boolean): void {
    this.viewSubject.next(isLeaving);
  }

  public viewIsLeaving() {
    return this.viewSubject.asObservable();
  }

  public toStringWithoutTime(date: Date) {
    return date.getFullYear() +
      '-' + this.pad(date.getMonth() + 1) +
      '-' + this.pad(date.getDate());
  }

  public compareStrings(string1: string, string2: string) {
    return this.comparableString(string1) === this.comparableString(string2);
  }

  public comparableString(string: string) {
    return string.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  private pad(number: number): string {
    if (number < 10) {
      return '0' + number;
    }
    return number.toString();
  }

  public toExtensiveFormat(date: Date): string {
    return date.toLocaleDateString('pt-BR', { month: "short", day: "numeric" });
  }

  public toBrazilianFormat(date: Date): string {
    return date.toLocaleDateString('pt-BR', { year: "numeric", month: "numeric", day: "numeric" });
  }

  public showRefreshPageError(): void {
    let offlineMessage = "";

    if (!this._connectionService.isOnline) {
      offlineMessage = " Parece que você está offline";
    }

    this.messages.showToast('Não foi possível completar a atualização.' + offlineMessage);
  }

  public convertTextToHtml(text: string): string {
    if (!text) return '';
    return text.replace(new RegExp('\n', 'g'), "<br />");
  }

  public forceCapitalize(text: string): string {
    return text.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
  }

  public async openUrl(url: string): Promise<void> {

    await Browser.open({ url });

  }

  public getDate(date?: string | number | Date): Date {
    if (date)
      return new Date(date);
    else
      return new Date();
  }

  public getCurrentDate(): Date {
    return this.getDate();
  }

  public dateToTimezone(date: Date): Date {
    const currentTimezone = (this.getCurrentDate().getTimezoneOffset()) / 60;
    return new Date(new Date(date).setUTCHours(currentTimezone));
  }

  public async hasAvailableStorage(): Promise<boolean> {
    // A lógica para verificar o armazenamento pode ser implementada aqui
    return true;
  }
}
