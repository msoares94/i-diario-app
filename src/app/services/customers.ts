import { ApiService } from './api';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../data/customer.interface';



@Injectable()
export class CustomersService {
  constructor(
    private http: HttpClient,
    private api: ApiService
  ){} 

  getCustomers(): Observable<Customer[]> {
    return this.http.get<any[]>(this.api.getallHostsUrl()).pipe(
      map((response: any) => {
        console.log(response)
        if (response && response.customers) {
          return response.customers.map((customer: Customer) => {
            return { name: customer.name, url: customer.url, support_url: customer.support_url };
          });
        } else {
          // Caso a resposta não tenha a propriedade 'customers' ou seja nula, retorne um array vazio.
          return [];
        }
      })
    );
  }
}