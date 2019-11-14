import { Injectable } from '@angular/core';
import { Api } from 'src/providers/app/api.prov';
import { map } from 'rxjs/operators';

@Injectable()
export class DocumentProvider {
    constructor(
        private api: Api,
    ) { }

    getApiURL() {
        return this.api.getURL();
    }

    getAllDocuments() {
        return this.api.get('document/all')
            .pipe(map(docs => docs.json()));
    }

    getAllDocumentsOnly() {
        return this.api.get('document/allDocuments')
            .pipe(map(docs => docs.json()));
    }

    createDocument(document) {
        return this.api.post('document/create', document)
            .pipe(map(created => created.json()));
    }

    updateDocument(document) {
        return this.api.put(`document/update/${document._id}`, document)
            .pipe(map(updated => updated.json()));
    }

    removeDocument(documentId) {
        return this.api.delete(`document/remove/${documentId}`)
            .pipe(map(deleted => deleted.json()));
    }
}
