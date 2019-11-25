import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';

import {CookiesService} from 'src/services/app/cookie.service';
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
  public documentsAssigns: Array<IDocument>;
  public documentsNotAssigns: Array<IDocument>;
  public filteredDepartments: Observable<Array<IDepartment>>;
  public filteredPositions: Observable<Array<IPosition>>;
  public showDocumentsPanel = false;
  private departments: Array<IDepartment>;
  private positions: Array<IPosition>;
  private documents: Array<IDocument>;
  private currentPosition: IPosition;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private documentProv: DocumentProvider,
    private notifications: NotificationsServices,
    private positionProv: PositionProvider,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initializeForm();
    this._getAllDepartments();

    this.filteredDepartments = this.positionForm.get('department').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterAutocomplete(this.departments, value))
      );
    this.filteredPositions = this.positionForm.get('position').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterAutocomplete(this.positions, value))
      );
  }

  private _initializeForm() {
    this.positionForm = new FormGroup({
      'department': new FormControl(null, Validators.required),
      'position': new FormControl(null, Validators.required)
    });
  }

  private _getAllDepartments() {
    this.positionProv.getAllDepartments()
      .subscribe(res => {
        this.departments = res.departments;
      });
  }

  public getPositions() {
    const departmentId = this._findDepartmentId(this.positionForm.get('department').value);
    if (departmentId) {
      this.positionProv.getPositionsForDepartment(departmentId)
        .subscribe(res => {
          this.positions = res.positions;
          this.positionForm.get('position').reset();
          this.showDocumentsPanel = false;
        });
    }
  }

  private _filterAutocomplete(array: Array<any>, value: string): Array<any> {
    const filterValue = (value || '').toLowerCase();
    return (array && filterValue) ? array.filter(data => data.name.toLowerCase().includes(filterValue)) : null;
  }

  private _findDepartmentId(departmentName): string {
    return departmentName
      ? this.departments.filter(department => department.name.toLowerCase() === departmentName.toLowerCase())[0]._id
      : null;
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

  private _getPositionDocuments(positionName: string): Array<IDocument> {
    this.currentPosition = positionName
      ? this.positions.filter(position => position.name.toLowerCase() === positionName.toLowerCase())[0]
      : null;
    return this.currentPosition ? this.currentPosition.documents : null;
  }

  private _getDocumentsNotAssigned(allDocuments, documentsAssigned) {
    const docsNotAssigned = new Set(allDocuments
      .filter((doc: IDocument) => !JSON.stringify(documentsAssigned).includes(doc._id)));
    return Array.from(docsNotAssigned);
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
          .subscribe(res => {
            if (res.status === 200) {
              this.notifications
                .showNotification(eNotificationType.SUCCESS,
                  'Los documentos se han actualizado con éxito', '');
            } else {
              this.notifications
                .showNotification(eNotificationType.ERROR, 'Error, no se ha podido actualizar', 'Intente de nuevo');
            }
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
}
