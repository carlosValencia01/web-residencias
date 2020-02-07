import { Component, OnInit } from '@angular/core';
import { NewBookComponent } from 'src/modals/reception-act/new-book/new-book.component';
import { MatDialog } from '@angular/material';
import { BookProvider } from 'src/providers/reception-act/book.prov';
import * as moment from 'moment';
import Swal from 'sweetalert2';

moment.locale('es');

@Component({
  selector: 'app-list-books-pages',
  templateUrl: './list-books-pages.component.html',
  styleUrls: ['./list-books-pages.component.scss']
})
export class ListBooksPagesComponent implements OnInit {
  listBooks;
  listActiveBooks;
  listInactiveBooks;
  numberActiveBooks = 0;
  numberInactiveBooks = 0;

    //Paginator AB
    pageAB = 1;
    pagAB;
    pageSizeAB = 10;
  
    //Paginator IB
    pageIB = 1;
    pagIB;
    pageSizeIB = 10;

  constructor(
    public dialog: MatDialog,
    private bookProvider: BookProvider
  ) { 
    this.getBooks();
  }

  ngOnInit() {

  }

  pageChangedAB(ev) {
    this.pageAB = ev;
  }

  pageChangedIB(ev) {
    this.pageIB = ev;
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

  getBooks(){
    this.bookProvider.getAllBooks().subscribe(res => {
      this.listBooks = res;
      this.listActiveBooks = this.listBooks.filter(book => book.status === true);
      this.listInactiveBooks = this.listBooks.filter(book => book.status === false);
      this.numberActiveBooks = this.listActiveBooks.length;
      this.numberInactiveBooks = this.listInactiveBooks.length;
    });
  }

  public displayData(property: any): string {
    const type = typeof property;
    switch (type) {
      case 'undefined': return '';
      case 'boolean': return !!property ? 'Activo' : 'Inactivo';
      case 'object': {
        if (property instanceof Date) {
          return moment(new Date(property)).format('LL');
        } else if (Array.isArray(property)) {
          let carreras = '';
          for(let i = 0; i < property.length; i++){
            carreras += property[i].acronym;
            if(i < property.length-1){
              carreras += '/';
            }
          }
          return carreras;
        }
      }
      default: return property;
    }
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

}
