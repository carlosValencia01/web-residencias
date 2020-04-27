import { Injectable } from '@angular/core';
import { Api } from 'src/providers/app/api.prov';
import { map } from 'rxjs/operators';

@Injectable()
export class PositionProvider {
    constructor(
        private api: Api,
    ) {}

    getApiURL() {
        return this.api.getURL();
    }

    getAllPositions() {
        return this.api.get('position/all')
            .pipe(map(positions => positions.json()));
    }

    createPosition(position) {
        return this.api.post('position/create', position)
            .pipe(map(created => created.json()));
    }

    updatePosition(position) {
        return this.api.put(`position/update/${position._id}`, position)
            .pipe(map(updated => updated.json()));
    }

    updatePositionRole(positionId: string, data: any) {
        return this.api.put(`position/${positionId}/role`, data)
            .pipe(map(res => res.json()));
    }

    removePosition(positionId) {
        return this.api.delete(`position/remove/${positionId}`)
            .pipe(map(deleted => deleted.json()));
    }

    updateDocumentAssign(positionId, documents) {
        return this.api.put(`position/updateDocumentAssign/${positionId}`, {documents: documents })
            .pipe(map(updated => updated.json()));
    }

    getPositionsByDepartment(departmentId) {
        return this.api.get(`position/getPositions/${departmentId}`)
            .pipe(map(res => res.json()));
    }

    getAvailablePositionsByDepartment(employeeId, departmentId) {
        return this.api.get(`position/getAvailablePositions/${employeeId}/${departmentId}`)
            .pipe(map(res => res.json()));
    }

    getPositionById(positionId) {
      return this.api.get(`position/getPosition/${positionId}`)
        .pipe(map(res => res.json()));
    }
}
