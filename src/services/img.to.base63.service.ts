import { Injectable } from '@angular/core';

@Injectable()
export class ImageToBase64Service {

    img = './assets/imgs/front.png';

    constructor(

    ) {

    }

    async getBase64(urlFile) {

        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', urlFile);
            xhr.responseType = 'blob';
            xhr.send();
            xhr.addEventListener('load', function () {
                const reader = new FileReader();
                reader.readAsDataURL(xhr.response);
                reader.addEventListener('loadend', function () {
                    console.log('se ejectuo la funcion');
                    // console.log(reader.result);
                    resolve(reader.result);
                });
            });
        });

        const result = await promise; // wait till the promise resolves (*)

        // console.log(result); // "done!"
        return result;
    }


}
