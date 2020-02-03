// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyDBJQc2NAZuPUahVGZdwfxm8BvOtaYj_gI',
    authDomain: 'ceremonia-graduacion.firebaseapp.com',
    databaseURL: 'https://ceremonia-graduacion.firebaseio.com',
    projectId: 'ceremonia-graduacion',
    storageBucket: 'ceremonia-graduacion.appspot.com',
    messagingSenderId: '452486540507',
    appId: '1:452486540507:web:214d62ad8c0e0147'
  },
  // filesURL:'http://localhost:3003/escolares/credenciales/drive/upload/file'
  filesURL: 'https://rijimenezesdev.me/escolares/credenciales/drive/upload/file',
  documentHelper: {
    birthCertificate: { video: 'https://drive.google.com/file/d/1OZNev3eyn5MHwZWIFjM4DxAaqWNNBMek/preview', file: 'https://drive.google.com/file/d/1rYSj38vDqpqrhN7nqpMsnMTq_70WVKaM/preview' },
    curp: { video: 'https://drive.google.com/file/d/1vJ2wrbI_rwv5yObst3O_3uYJeH7OuXEp/preview', file: 'https://drive.google.com/file/d/1UVHPCBpSFlXBJFcC6SLcpVd3zkeeHnq0/preview' },
    bachlersDegree: { video: 'https://drive.google.com/file/d/1IJs-SllKJcwvN6K7Uiu9F_KTMgQ5vbjc/preview', file: 'https://drive.google.com/file/d/1tOwBn4KIT5DoRfkA9pmOFuWIXQ8dps24/preview' },
    technicalID: { video: '', file: '' },
    degreeCertificate: { video: 'https://drive.google.com/file/d/14w3kvltOYQsgcjIQXzITGMb5N-vkbUE0/preview', file: 'https://drive.google.com/file/d/17boXo5Jz8spmCT0ojZu-2ngNuYFgx-ur/preview' },
    socialService: { video: 'https://drive.google.com/file/d/1dS90s_sNrs53puRwSxgONnmksG-_9V1A/preview', file: 'https://drive.google.com/file/d/1UdyctEPhR9TOz0YGQP2lCndsfJwzVwsl/preview' },
    constancyOfEnglish: { video: 'https://drive.google.com/file/d/1LNPRphPPo7PiItDz-ndLh18CXqd9p-lW/preview', file: 'https://drive.google.com/file/d/1SjrogJZ8ogGGAZ6UxQy2dUzV2ZPXIeiX/preview' },
    receiptOfPayment: { video: '', file: '' },
    revalidation: { video: '', file: '' }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
