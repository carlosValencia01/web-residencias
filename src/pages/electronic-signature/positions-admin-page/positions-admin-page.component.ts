import {Component, OnInit} from '@angular/core';
import {CookiesService} from 'src/services/app/cookie.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {IDepartment} from 'src/entities/shared/department.model';
import {IPosition} from 'src/entities/shared/position.model';
import {PositionProvider} from 'src/providers/shared/position.prov';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-positions-admin-page',
  templateUrl: './positions-admin-page.component.html',
  styleUrls: ['./positions-admin-page.component.scss']
})
export class PositionsAdminPageComponent implements OnInit {
  public positionForm: FormGroup;
  public positions: Array<IPosition>;
  private positionsCopy: Array<IPosition>;
  public departments: Array<IDepartment>;
  public filteredDepartments: Observable<Array<IDepartment>>;
  private currentPosition: IPosition;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isEditing = false;
  public isViewDetails = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private positionProv: PositionProvider,
    private notificationsService: NotificationsServices,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.initializeForm();
    this.getAllDepartments();
    this.getAllPositions();

    this.filteredDepartments = this.positionForm.get('ascription').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterDepartments(value))
      );
  }

  initializeForm() {
    this.positionForm = new FormGroup({
      'name': new FormControl({value: ''}, Validators.required),
      'ascription': new FormControl({value: ''}, Validators.required),
    });
  }

  getAllDepartments() {
    this.positionProv.getAllDepartments()
      .subscribe(data => {
        this.departments = data.departments;
      });
  }

  private _filterDepartments(value: string): IDepartment[] {
    const filterValue = value ? value.toLowerCase() : '';
    return this.departments.filter(department =>
      department.name.toLowerCase().includes(filterValue));
  }

  getAllPositions() {
    this.positionProv.getAllPositions()
      .subscribe(positions => {
        this.positions = positions.positions;
        this.positionsCopy = this.positions;
        if (this.searchText) {
          this.searchPosition();
        }
      });
  }

  searchPosition() {
    this.positions = this.positionsCopy
      .filter(position => JSON.stringify(position).toLowerCase().includes(this.searchText.toLowerCase()));
  }

  savePosition() {
    const position = this.getFormData();
    if (this.isEditing) {
      this.currentPosition.name = position.name;
      this.currentPosition.ascription = position.ascription;
      this.positionProv.updatePosition(this.currentPosition)
        .subscribe(updated => {
          if (updated.status === 200) {
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto modificado correctamente', '');
            this.positionForm.reset();
            this.titleCardForm = 'Creando puesto';
            this.currentPosition = null;
            this.isEditing = false;
          } else {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Error, no se pudo modificar el puesto', 'Intente de nuevo');
          }
        });
    } else {
      this.positionProv.createPosition({
        name: position.name,
        ascription: position.ascription._id
      })
        .subscribe(created => {
          if (created && !created.status) {
            this.positionForm.reset();
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto creado con éxito', '');
          } else {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Ocurrió un error al crear el puesto', 'Intente de nuevo');
          }
        });
    }
    this.getAllPositions();
  }

  getFormData() {
    return {
      name: this.positionForm.get('name').value,
      ascription: this._getDepartment(this.positionForm.get('ascription').value),
    };
  }

  private _getDepartment(name: string): IDepartment {
    return this.departments.filter(depto => depto.name === name)[0];
  }

  fillForm(position) {
    this.positionForm.setValue({
      'name': position.name,
      'ascription': position.ascription.name,
    });
  }

  newPosition() {
    this.titleCardForm = 'Creando puesto';
    this.positionForm.enable();
    this.positionForm.reset();
    this.currentPosition = null;
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  viewPosition(position) {
    this.titleCardForm = 'Detalles del puesto';
    this.positionForm.markAsUntouched();
    this.positionForm.disable();
    this.isViewDetails = true;
    this.fillForm(position);
    this.showFormPanel = true;
    this.isEditing = false;
    this.currentPosition = null;
  }

  editPosition(position) {
    this.titleCardForm = 'Actualizando puesto';
    this.currentPosition = position;
    this.positionForm.enable();
    this.fillForm(position);
    this.showFormPanel = true;
    this.isEditing = true;
    this.isViewDetails = false;
  }

  removePosition(position) {
    Swal.fire({
      title: 'Ésta acción no se puede revertir',
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
          .subscribe(deleted => {
            if (deleted.status === 200) {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Puesto borrado con éxito', '');
              if (this.currentPosition._id === position._id) {
                this.isEditing = false;
                this.titleCardForm = 'Creando puesto';
              }
              this.getAllPositions();
            } else {
              this.notificationsService.showNotification(eNotificationType.ERROR, 'Error al borrar el puesto', deleted.error);
            }
          });
      }
    });
  }

  closeFormPanel() {
    this.positionForm.reset();
    this.currentPosition = null;
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
  }
}
