import { Component, OnInit } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-student-page',
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.scss']
})
export class StudentPageComponent implements OnInit {

  data: Array<any>;
  search: any;
  showTable = false;

  constructor(
    private studentProv: StudentProvider
  ) { }

  ngOnInit() {
    this.getAllStundets();
  }

  getAllStundets() {
    this.studentProv.getAllStudents().subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }

  searchStudent() {
    this.studentProv.searchStudents(this.search).subscribe(res => {
      console.log('res', res);
      this.data = res.students;

      if (this.data.length > 0) {
        this.showTable = true;
      } else {
        this.showTable = false;
      }

    }, err => {
      console.log('err', err);
    });
  }

}
