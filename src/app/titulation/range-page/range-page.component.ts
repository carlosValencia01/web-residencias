import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { RangeProvider } from 'src/app/providers/reception-act/range.prov';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eOperation } from 'src/app/enumerators/reception-act/operation.enum';
import { RangeModalComponent } from 'src/app/titulation/range-modal/range-modal.component';
import { IRange } from 'src/app/entities/reception-act/range.model';

@Component({
  selector: 'app-range-page',
  templateUrl: './range-page.component.html',
  styleUrls: ['./range-page.component.scss']
})
export class RangePageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[];
  dataSource: MatTableDataSource<IRange>;
  ranges: any;

  constructor(
    public _RangeProvider: RangeProvider,
    private _NotificationsServices: NotificationsServices,
    public dialog: MatDialog,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.displayedColumns = ['start', 'end', 'quantity', 'edit', 'remove'];
    this.getRanges();
  }

  getRanges(): void {
    const Empleados = new Array<Object>();
    this._RangeProvider.getAll()
      .subscribe(data => {
        this.ranges = data.ranges;
        this.refresh();
      }, _ => {
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error al recuperar los datos, intente nuevamente');
      });
  }

  addRange(): void {
    const ref = this.dialog.open(RangeModalComponent, {
      id: 'RangeModal',
      data: {
        Operation: eOperation.NEW
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });

    ref.afterClosed().subscribe((result: IRange) => {
      if (result) {
        this._RangeProvider.add(result).subscribe(_ => {
          this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Rango registrado exitosamente');
          this.ranges.push(result);
          this.refresh();
        }, _ => {
          this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
        });
      }
    });
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.ranges);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event) {

  }

  onUpload(event) {

  }
}


