import { Injectable, Output, EventEmitter } from '@angular/core';
import { iRole } from 'src/app/entities/app/role.model';

@Injectable()
export class RoleService {
  private role: iRole;

  constructor() { }

  @Output() changeRole: EventEmitter<iRole> = new EventEmitter();

  public setRole(role: iRole) {
    this.role = role || { name: '', permissions: [] };
    this.changeRole.emit(this.role);
  }
}
