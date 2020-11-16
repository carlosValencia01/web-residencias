import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

//Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';

// Importar modelos
import { IEnglishStudent } from '../../entities/english-student.model';

@Component({
  selector: 'app-released-options-page',
  templateUrl: './released-options-page.component.html',
  styleUrls: ['./released-options-page.component.scss']
})
export class ReleasedOptionsPageComponent implements OnInit {


  englishStudents: IEnglishStudent[];
  unreleasedStudents;
  releasedStudents;

  
  public unreleasedStudentsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorUnreleasedStudents') paginatorUnreleasedStudents: MatPaginator;
  @ViewChild('sortUnreleasedStudents') sortUnreleasedStudents: MatSort;

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private englishStudentProv: EnglishStudentProvider,) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.getStudentsEnglish();
  }

  getStudentsEnglish() {
    this.englishStudentProv.getAllEnglishStudent().subscribe(res => {

      this.englishStudents = res.englishStudents;
      this.unreleasedStudents = this.englishStudents.filter(student => student.status == 'not_released');
      this.generateUnreleasedStudentsTable();
      this.releasedStudents = this.englishStudents.filter(student => student.status == 'released');

    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  generateUnreleasedStudentsTable() {
    this.unreleasedStudentsDataSource = new MatTableDataSource();
    this.unreleasedStudentsDataSource.data = this.unreleasedStudents.map((student) => this._parseStudentToTable(student));
    this.unreleasedStudentsDataSource.paginator = this.paginatorUnreleasedStudents;
    this.unreleasedStudentsDataSource.sort = this.sortUnreleasedStudents;
  }

  _parseStudentToTable(englishStudent){
    return {
      _id: englishStudent._id,
      controlNumber: englishStudent.studentId.controlNumber,
      name: englishStudent.studentId.fullName,
      career: englishStudent.studentId.careerId ? englishStudent.studentId.careerId.acronym : '',
    };
  }

}
