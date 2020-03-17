import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NewBookComponent } from 'src/modals/reception-act/new-book/new-book.component';
import { UpdateBookComponent } from 'src/modals/reception-act/update-book/update-book.component';
import { MatDialog, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { BookProvider } from 'src/providers/reception-act/book.prov';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { FormControl } from '@angular/forms';
import { CookiesService } from 'src/services/app/cookie.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';

moment.locale('es');

@Component({
  selector: 'app-list-books-pages',
  templateUrl: './list-books-pages.component.html',
  styleUrls: ['./list-books-pages.component.scss']
})
export class ListBooksPagesComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorActiveBooks') paginatorActiveBooks: MatPaginator;
  @ViewChild('matPaginatorInactiveBooks') paginatorInactiveBooks: MatPaginator;
  public displayedColumnsActiveBooks: string[];
  public displayedColumnsActiveBooksName: string[];
  public displayedColumnsInactiveBooks: string[];
  public displayedColumnsInactiveBooksName: string[];
  public dataSourceActiveBooks: MatTableDataSource<BookTable>;
  public dataSourceInactiveBooks: MatTableDataSource<BookTable>;
  public search: string;
  public selectedTab: FormControl;
  public loading: boolean;

  listBooks;
  listActiveBooks;
  listInactiveBooks;
  numberActiveBooks = 0;
  numberInactiveBooks = 0;

  constructor(
    public dialog: MatDialog,
    private bookProvider: BookProvider,
    private cookiesService: CookiesService,
    private notificationServ: NotificationsServices,
    private router: Router,
    private routeActive: ActivatedRoute,
  ) { 
    this.getBooks();
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.selectedTab = new FormControl(0);
    this.loading = false;
  }

  ngOnInit() {
    this.displayedColumnsActiveBooksName = ['Nombre del Libro','No. Libro', 'Opción Titulación', 'Carreras', 'Fecha Registro'];
    this.displayedColumnsActiveBooks = ['name', 'number', 'titleOption', 'careers', 'registerDate', 'actions'];

    this.displayedColumnsInactiveBooksName = ['Nombre del Libro','No. Libro', 'Opción Titulación', 'Carreras', 'Fecha Registro'];
    this.displayedColumnsInactiveBooks = ['name', 'number', 'titleOption', 'careers', 'registerDate', 'actions'];
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this.getBooks();
      case 1: return this.getBooks();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceActiveBooks.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceActiveBooks.paginator) {
          this.dataSourceActiveBooks.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceInactiveBooks.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceInactiveBooks.paginator) {
          this.dataSourceInactiveBooks.paginator.firstPage();
        }
        break;
    }
  }

  public refreshActiveBooks() {
    this.getBooks();
  }

  public refreshInactiveBooks() {
    this.getBooks();
  }

  private _refreshActiveBooks(data: Array<any>): void {
    this.dataSourceActiveBooks = new MatTableDataSource(data);
    this.dataSourceActiveBooks.paginator = this.paginatorActiveBooks;
    this.dataSourceActiveBooks.sort = this.sort;
  }

  private _refreshInactiveBooks(data: Array<any>): void {
    this.dataSourceInactiveBooks = new MatTableDataSource(data);
    this.dataSourceInactiveBooks.paginator = this.paginatorInactiveBooks;
    this.dataSourceInactiveBooks.sort = this.sort;
  }

  private _castToTable(data) {
    let careers = data.careers;
    let carreras = '';
    for(let i = 0; i < careers.length; i++){
      carreras += careers[i].acronym;
      if(i < careers.length-1){
        carreras += '/';
      }
    }
    
    return {
      _id: data._id ? data._id : '',
      careers: data.careers ? carreras : '',
      status: data.status ? data.status : '',
      name: data.name ? data.name : '',
      number: data.number ? data.number : '',
      registerDate: data.registerDate ? moment(data.registerDate).format('LL') : '',
      titleOption: data.titleOption ? data.titleOption.split(' ')[0] : ''
    };
  }

  getBooks(){
    this.bookProvider.getAllBooks().subscribe(res => {
      this.listBooks = res;
      this.listActiveBooks = this.listBooks.filter(book => book.status === true);
      this.listInactiveBooks = this.listBooks.filter(book => book.status === false);
      this.numberActiveBooks = this.listActiveBooks.length;
      this.numberInactiveBooks = this.listInactiveBooks.length;

      const dataActive = this.listActiveBooks.map(this._castToTable);
      const dataInactive = this.listInactiveBooks.map(this._castToTable);
      this._refreshActiveBooks(dataActive);
      this._refreshInactiveBooks(dataInactive);
    });
  }

  createBook(){
    const linkModal = this.dialog.open(NewBookComponent, {
      data: {
        operation: 'create'
      },
      disableClose: true,
      hasBackdrop: true,
      width: '59em',
      height: '37em'
    });
    let sub = linkModal.afterClosed().subscribe(
      book=>{
        this.getBooks();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  changeStatusBook(id,status){
    Swal.fire({
      title: status ? '¿Activar Libro?' : '¿Desactivar Libro?',
      text: '',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.bookProvider.updateBook(id,{_status:status}).subscribe(res => {
          this.getBooks();
        });
      }
    });

  }

  updateBook(oldBook){
    let libro = this.listBooks.filter(book => book._id === oldBook._id);
    const linkModal = this.dialog.open(UpdateBookComponent, {
      data: {
        operation: 'update',
        oldBook: libro[0]
      },
      disableClose: true,
      hasBackdrop: true,
      width: '59em',
      height: '37em'
    });
    let sub = linkModal.afterClosed().subscribe(
      book=>{
        this.getBooks();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

}

interface BookTable {
  _id?: string;
  careers?: string;
  status?: string;
  name?: string;
  number?: string;
  registerDate?: string;
  titleOption?
}
