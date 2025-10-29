import { Routes } from '@angular/router';
import { PdfViewer } from './pdf-viewer/pdf-viewer';
import { Upload } from './upload/upload';

export const routes: Routes = [
  {path:'', component:Upload},
  {path:'view/:path', component:PdfViewer},
  {path:'**', redirectTo:''}
];
