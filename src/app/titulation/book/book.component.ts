import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
  public title: string;
  public formMinuteBook: FormGroup;
  private book: IBook;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BookComponent>,
  ) {
    this.title = this.data.operation === 'edit' ? 'Editar datos del libro' : 'Datos del libro';
    const { name, number, registerDate } = this.data.book;
    this.book = {
      date: new Date(registerDate),
      bookNumber: number,
      foja: '',
      career: name
    };
    this._initializeForm(this.book);
  }

  ngOnInit() {
    document.getElementById("foja").focus();
  }

  onClose() {
    this.dialogRef.close({action: 'close'});
  }

  onFormSubmit() {
    this.book.foja = this.formMinuteBook.get('foja').value.trim();
    this.dialogRef.close({action: 'create', data: this.book});
  }

  private _initializeForm(book: IBook) {
    this.formMinuteBook = new FormGroup({
      'date': new FormControl({ value: book.date, disabled: true }, [Validators.required]),
      'bookNumber': new FormControl({ value: book.bookNumber, disabled: true }, [Validators.required]),
      'foja': new FormControl({ value: book.foja, disabled: false }, [Validators.required]),
      'name': new FormControl({ value: book.career, disabled: true }, [Validators.required]),
    });
  }
}

interface IBook {
  date: Date;
  bookNumber: string;
  foja: string;
  career: string;
}
