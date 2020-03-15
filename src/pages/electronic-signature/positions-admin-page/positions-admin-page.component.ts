import {ActivatedRoute, Router} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import Swal from 'sweetalert2';

import {CookiesService} from 'src/services/app/cookie.service';
import {DepartmentProvider} from 'src/providers/shared/department.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {IDepartment} from 'src/entities/shared/department.model';
import {IPosition} from 'src/entities/shared/position.model';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {PositionProvider} from 'src/providers/shared/position.prov';

@Component({
  selector: 'app-positions-admin-page',
  templateUrl: './positions-admin-page.component.html',
  styleUrls: ['./positions-admin-page.component.scss']
})
export class PositionsAdminPageComponent implements OnInit {
  @ViewChild('departmentElement') departmentElement: ElementRef;
  public positionForm: FormGroup;
  public departmentControl = new FormControl();
  public positions: IPosition[];
  public filteredDepartments: Observable<IDepartment[]>;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isViewDetails = false;
  private departments: IDepartment[];
  private positionsCopy: IPosition[];
  private currentPosition: IPosition;
  private isEditing = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private departmentProv: DepartmentProvider,
    private notificationsService: NotificationsServices,
    private positionProv: PositionProvider,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this._getAllDepartments();
  }

  ngOnInit() {
    this._initializeForm();
  }

  public getPositions() {
    this.positionProv.getPositionsByDepartment(this._getDepartment(this.departmentControl.value)._id)
      .subscribe(res => {
        this.positions = res.positions;
        this.positionsCopy = this.positions;
        if (this.searchText) {
          this.searchPosition();
        }
        if (this.isEditing || this.isViewDetails) {
          this.closeFormPanel();
        }
      });
  }

  public searchPosition() {
    this.positions = this.positionsCopy
      .filter(position => JSON.stringify(position).toLowerCase().includes((this.searchText || '').toLowerCase()));
  }

  public savePosition() {
    const position = this._getFormData();
    if (position.ascription) {
      if (this.isEditing) {
        this.currentPosition.name = position.name;
        this.currentPosition.gender = position.gender;
        this.currentPosition.canSign = position.canSign;
        this.currentPosition.isUnique = position.isUnique;
        this.positionProv.updatePosition(this.currentPosition)
          .subscribe(_ => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto modificado correctamente', '');
            this._updatePosition(this.currentPosition);
          }, _ => {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Error, no se pudo modificar el puesto', 'Intente de nuevo');
          });
      } else {
        const positionExists = this.positionsCopy.filter(pos => pos.name.toLowerCase().includes(position.name.toLowerCase()))[0];
        if (!positionExists) {
          this._createPosition(position);
        } else {
          Swal.fire({
            title: '¡Puesto similar encontrado en el mismo departamento!',
            text: `Se ha encontrado el puesto ${positionExists.name},
             con nombre similar al que intenta crear. ¿Desea crear el nuevo puesto?`,
            type: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: 'green',
            cancelButtonColor: 'blue',
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            focusCancel: true
          }).then((result) => {
            if (result.value) {
              this._createPosition(position);
            }
          });
        }
      }
    } else {
      this.notificationsService
        .showNotification(eNotificationType.INFORMATION, 'Para guardar el puesto, debe seleccionar un departamento', '');
      this.departmentElement.nativeElement.focus();
    }
  }

  public newPosition() {
    this.titleCardForm = 'Creando puesto';
    this.positionForm.enable();
    this.positionForm.reset();
    this.currentPosition = null;
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  public viewPosition(position) {
    this.titleCardForm = 'Detalles del puesto';
    this.positionForm.markAsUntouched();
    this.positionForm.disable();
    this.isViewDetails = true;
    this._fillForm(position);
    this.showFormPanel = true;
    this.isEditing = false;
    this.currentPosition = null;
  }

  public editPosition(position) {
    this.titleCardForm = 'Actualizando puesto';
    this.currentPosition = position;
    this.positionForm.enable();
    this._fillForm(position);
    this.showFormPanel = true;
    this.isEditing = true;
    this.isViewDetails = false;
  }

  public removePosition(position) {
    Swal.fire({
      title: 'Esta acción no se puede revertir',
      text: `El puesto ${position.name} adscrito al ${position.ascription.name} se borrará totalmente. ¿Desea borrarlo?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.positionProv.removePosition(position._id)
          .subscribe(_ => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto borrado con éxito', '');
            if (this.isEditing && this.currentPosition._id === position._id) {
              this.isEditing = false;
              this.titleCardForm = 'Creando puesto';
            }
            this._removePosition(position);
          }, err => {
            const message = JSON.parse(err._body).message;
            this.notificationsService.showNotification(eNotificationType.ERROR, 'Error al borrar el puesto', message);
          });
      }
    });
  }

  public closeFormPanel() {
    this.positionForm.reset();
    this.currentPosition = null;
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  private _initializeForm() {
    this.positionForm = new FormGroup({
      'name': new FormControl({value: ''}, Validators.required),
      'canSign': new FormControl({value: false}),
      'isUnique': new FormControl({value: false}),
      'nameMale': new FormControl({value: ''}),
      'nameFemale': new FormControl({value: ''})
    });
  }

  private _getAllDepartments() {
    this.departmentProv.getAllDepartments()
      .subscribe(data => {
        this.departments = data.departments;

        this.filteredDepartments = this.departmentControl.valueChanges
        .pipe(
          startWith(''),
          map(value => value ? this._filterDepartments(value) : [...data.departments])
        );
      });
  }

  private _filterDepartments(value: string): IDepartment[] {
    const filterValue = (value || '').toLowerCase();
    return this.departments.filter(department => department.name.toLowerCase().includes(filterValue));
  }

  private _createPosition(position) {
    position.documents = [];
    this.positionProv.createPosition(position)
      .subscribe(createdPosition => {
        this.positionForm.reset();
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto creado con éxito', '');
        this._addPosition(createdPosition);
      }, _ => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Ocurrió un error al crear el puesto', 'Intente de nuevo');
      });
  }

  private _getFormData() {
    return {
      name: this.positionForm.get('name').value,
      canSign: Boolean(this.positionForm.get('canSign').value),
      ascription: this._getDepartment(this.departmentControl.value),
      isUnique: !!this.positionForm.get('isUnique').value,
      gender: {
        male: this.positionForm.get('nameMale').value,
        female: this.positionForm.get('nameFemale').value
      }
    };
  }

  private _getDepartment(name: string): IDepartment {
    return this.departments.filter(depto => depto.name === name)[0];
  }

  private _fillForm(position) {
    this.positionForm.setValue({
      'name': position.name,
      'canSign': position.canSign,
      'isUnique': !!position.isUnique,
      'nameMale': position.gender ? position.gender.male : '',
      'nameFemale': position.gender ? position.gender.female : ''
    });
  }

  private _addPosition(position: IPosition) {
    this.positionsCopy.push(position);
    this.searchPosition();
  }

  private _removePosition(position: IPosition) {
    const index = this.positionsCopy.findIndex(depto => depto._id === position._id);
    this.positionsCopy.splice(index, 1);
    this.searchPosition();
    if (this.isViewDetails) {
      this.closeFormPanel();
    }
  }

  private _updatePosition(position: IPosition) {
    const index = this.positionsCopy.findIndex(depto => depto._id === position._id);
    this.positionsCopy.splice(index, 1, position);
    this.searchPosition();
    if (this.isEditing || this.isViewDetails) {
      this.closeFormPanel();
    }
  }
}
