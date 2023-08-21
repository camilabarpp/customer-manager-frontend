import {Location} from '@angular/common';
import {Customer} from "./model/customer.model";
import {Injectable, OnDestroy} from "@angular/core";
import {ComponentStore, tapResponse} from "@ngrx/component-store";
import {catchError, EMPTY, Observable, of, retry, switchMap, tap} from "rxjs";
import {CustomerService} from "../service/customer.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface CustomerState {
  customer?: Customer;
  customers?: Customer[];
}

const initialState: CustomerState = {};

@Injectable()
export class CustomerStore extends ComponentStore<CustomerState> {
  constructor(
    private _service: CustomerService,
    private _snackBar: MatSnackBar,
    private _location: Location
  ) {
    super(initialState);
  }

  readonly customer$: Observable<Customer | undefined> = this.select(state => state.customer);
  readonly customers$: Observable<Customer[] | undefined> = this.select(state => state.customers);

    readonly listAllCustomers = this.effect<void>(() =>
        this._service.listAllCustomers.pipe(
            tap(customerStates => {
              this.patchState({ customers: customerStates });
              console.log(customerStates)
            })

        )
    );

  readonly getCustomerById = this.effect<string>((customerId$) =>
    customerId$.pipe(
      switchMap((customerId) =>
        this._service.findACustomerById(customerId).pipe(
          tapResponse((customer) => {
              this.setCustomer(customer);
              this.setState({ customer })
              this.patchState({ customer });
              console.log(customer)
            },
            (error: any) => console.error(error)
          )
        )
      )
    ));

  readonly createCustomer = this.effect((customer$: Observable<Customer>) =>
    customer$.pipe(
      switchMap((customer) =>
        this._service.createCustomer(customer).pipe(
          tap(() => {
            this._snackBar.open('Cliente criado com sucesso!', 'Fechar', {
                duration: 5000,
            });
          }),
          catchError((error) => {
            console.error('Error creating customer:', error);
            this._snackBar.open('Erro ao criar cliente!', 'Fechar', {
                duration: 5000,
            });
            return of(null);
          })
        )
      )
    )
  );

  readonly updateCustomerPf = this.effect((request$: Observable<[string, Customer]>) => {
    return request$.pipe(
      switchMap((request) =>
        this._service.updateCustomerPf(request[0], request[1]).pipe(
          tapResponse((response) => {
              this._snackBar.open('Cliente atualizado com sucesso!', 'Fechar', {
                duration: 5000,
              });
              this.onCancel();
            },
            (error: HttpErrorResponse) => {
              this._snackBar.open('Erro ao atualizar cliente!', 'Fechar', {
                duration: 5000,
              });
              console.error(error)
            }
          ),
          catchError(() => {
            // this.setErrors(new Error('Erro desconhecido.'));
            return EMPTY;
          })
        )
      )
    )
  });

  readonly updateCustomerPj = this.effect((request$: Observable<[string, Customer]>) => {
    return request$.pipe(
      switchMap((request) =>
        this._service.updateCustomerPj(request[0], request[1]).pipe(
          tapResponse((response) => {
              this._snackBar.open('Cliente atualizado com sucesso!', 'Fechar', {
                duration: 5000,
              });
              this.onCancel();
            },
            (error: HttpErrorResponse) => {
              this._snackBar.open('Erro ao atualizar cliente!', 'Fechar', {
                duration: 5000,
              });
              console.error(error)
            }
          ),
          catchError(() => {
            // this.setErrors(new Error('Erro desconhecido.'));
            return EMPTY;
          })
        )
      )
    )
  });

  readonly deleteCustomer = this.effect((customerId$: Observable<number>) => {
    return customerId$.pipe(
      switchMap((customerId) =>
        this._service.deleteCustomer(customerId).pipe(
          tapResponse((response) => {
              this._snackBar.open('Cliente excluído com sucesso!', 'Fechar', {
                duration: 5000,
              });
              // this.onCancel();
            },
            (error: HttpErrorResponse) => {
              this._snackBar.open('Erro ao excluir cliente!', 'Fechar', {
                duration: 5000,
              });
              console.error(error)
            }
          ),
          catchError(() => {
            // this.setErrors(new Error('Erro desconhecido.'));
            return EMPTY;
          })
        )
      )
    )
  });

    readonly setCustomers = this.updater((state, customers: Customer[] | undefined)  => {
        return {...state, customers};
    });

    readonly setCustomer = this.updater((state, customer: Customer | undefined)  => {
        return {...state, customer};
    });

    getCustomers(): Observable<Customer[] | undefined> {
        return this.select(state => state.customers);
    }

    getCustomer(): Observable<Customer | undefined> {
        return this.select(state => state.customer);
    }

  onCancel() {
    this._location.back();
      setTimeout(()=>{
      location.reload();
    }, 100);
  }
}
