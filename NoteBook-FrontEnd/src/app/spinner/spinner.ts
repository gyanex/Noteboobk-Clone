import { Component } from '@angular/core';
import {  MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner, MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  imports: [MatProgressSpinner, MatDialogModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {

}
