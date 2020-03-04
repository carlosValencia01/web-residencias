import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';

import {CookiesService} from 'src/services/app/cookie.service';
import {DepartmentProvider} from 'src/providers/shared/department.prov';
import {DocumentProvider} from 'src/providers/shared/document.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {IDepartment} from 'src/entities/shared/department.model';
import {IDocument} from 'src/entities/shared/document.model';
import {IPosition} from 'src/entities/shared/position.model';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {PositionProvider} from 'src/providers/shared/position.prov';

@Component({
  selector: 'app-documents-assign-page',
  templateUrl: './documents-assign-page.component.html',
  styleUrls: ['./documents-assign-page.component.scss']
})
export class DocumentsAssignPageComponent implements OnInit {
  public positionForm: FormGroup;
  public documentsAssigns: IDocument[];
  public documentsNotAssigns: IDocument[];
  public filteredDepartments: Observable<IDepartment[]>;
  public filteredPositions: Observable<IPosition[]>;
  public showDocumentsPanel = false;
  private departments: IDepartment[];
  private positions: IPosition[];
  private documents: IDocument[];
  private currentPosition: IPosition;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private departmentProv: DepartmentProvider,
    private documentProv: DocumentProvider,
    private notifications: NotificationsServices,
    private positionProv: PositionProvider,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this._initializeForm();
  }

  ngOnInit() {
    this._getAllDepartments();
  }

  public getPositions() {
    const departmentId = this._findDepartmentId(this.positionForm.get('department').value);
    if (departmentId) {
      this.positionProv.getPositionsByDepartment(departmentId)
        .subscribe(res => {
          this.positions = res.positions;
          this.positionForm.get('position').reset();
          this.showDocumentsPanel = false;

          this.filteredPositions = this.positionForm.get('position').valueChanges
            .pipe(
              startWith(''),
              map(value => value ? this._filterAutocomplete(this.positions, value) : this.positions)
            );
        });
    }
  }

  public searchDocuments() {
    this.documentProv.getAllDocumentsOnly()
      .subscribe(res => {
        this.documents = res.documents || [];
        this.documentsAssigns = this._getPositionDocuments(this.positionForm.get('position').value) || [];
        this.documentsNotAssigns = this._getDocumentsNotAssigned(this.documents, this.documentsAssigns) || [];
        this.showDocumentsPanel = true;
      });
  }

  public updateAssignDocuments() {
    Swal.fire({
      title: 'Actualización de documentos',
      text: `Los documentos del puesto ${this.currentPosition.name},
       adscrito al ${this.currentPosition.ascription.name} se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.positionProv.updateDocumentAssign(this.currentPosition._id, this.documentsAssigns)
          .subscribe(_ => {
            this.notifications
              .showNotification(eNotificationType.SUCCESS,
                'Los documentos se han actualizado con éxito', '');
          }, _ => {
            this.notifications
              .showNotification(eNotificationType.ERROR, 'Error, no se ha podido actualizar', 'Intente de nuevo');
          });
      }
    });
  }

  public addDocument(document) {
    const index = this.documentsNotAssigns.indexOf(document);
    if (index >= 0) {
      this.documentsAssigns.push(document);
      this.documentsNotAssigns.splice(index, 1);
    }
  }

  public removeDocument(document) {
    const index = this.documentsAssigns.indexOf(document);
    if (index >= 0) {
      this.documentsNotAssigns.push(document);
      this.documentsAssigns.splice(index, 1);
    }
  }

  public closeDocumentsPanel() {
    this.showDocumentsPanel = false;
    this.positionForm.reset();
    this.currentPosition = null;
    this.positions = null;
    this.documentsAssigns = null;
    this.documentsNotAssigns = null;
    this.documents = null;
  }

  private _initializeForm() {
    this.positionForm = new FormGroup({
      'department': new FormControl(null, Validators.required),
      'position': new FormControl(null, Validators.required)
    });
  }

  private _getAllDepartments() {
    this.departmentProv.getAllDepartments()
      .subscribe(res => {
        this.departments = res.departments;

        this.filteredDepartments = this.positionForm.get('department').valueChanges
          .pipe(
            startWith(''),
            map(value => value ? this._filterAutocomplete(this.departments, value) : this.departments)
          );
      });
  }

  private _filterAutocomplete(array: any[], value: string): any[] {
    const filterValue = (value || '').toLowerCase();
    return (array || []).filter(data => data.name.toLowerCase().includes(filterValue));
  }

  private _findDepartmentId(departmentName: string): string {
    const name = (departmentName || '').toLocaleLowerCase();
    return departmentName
      ? this.departments.filter(department => department.name.toLowerCase() === name)[0]._id
      : null;
  }

  private _getPositionDocuments(positionName: string): Array<IDocument> {
    this.currentPosition = positionName
      ? this.positions.filter(position => position.name.toLowerCase() === positionName.toLowerCase())[0]
      : null;
    return this.currentPosition ? this.currentPosition.documents : null;
  }

  private _getDocumentsNotAssigned(allDocuments, documentsAssigned) {
    return allDocuments.filter((doc: IDocument) => !documentsAssigned.some((document: IDocument) => document._id === doc._id));
  }
}
