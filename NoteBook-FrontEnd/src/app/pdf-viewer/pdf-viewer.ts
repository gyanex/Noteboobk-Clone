import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgSelectOption } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {PdfViewerModule} from 'ng2-pdf-viewer'
import { Spinner } from '../spinner/spinner';
import { NgStyle } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pdf-viewer',
  imports: [PdfViewerModule, MatFormFieldModule, MatInputModule, MatIcon, FormsModule, RouterLink, NgStyle, MatButton],
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.css',
})
export class PdfViewer {
  constructor(private route:ActivatedRoute, private http:HttpClient, private dialog:MatDialog){
  }
  pdfSrc:string|undefined
  query:string | undefined
  data:Array<{message:string,isAnswer:boolean,page?:number[]}> = []
  page =1;
  ngOnInit(){
    this.route.params.subscribe((res:any) => {this.pdfSrc=`${environment.apiUrl}${res.path}.pdf`})
    
  }

  ask(){
    if(this.query && this.query?.length>0){
      this.data.push({message:this.query!, isAnswer:false})
    this.openDialog()
    this.http.get(`${environment.apiUrl}query/${this.query}`).subscribe((res:any) => {
      this.query = ''
      this.dialog.closeAll();
      this.data.push({message:res.result.message.content, isAnswer:true,page:[]})
      res.result.sourceNodes.forEach((element:any) => {
        this.data[this.data.length-1].page?.push(element.node.metadata.page_number)
      });
      (() => {
        this.dialog.closeAll()
      })
    })
    }
    
  }

  openDialog(): void {
    this.dialog.open(Spinner, {
      width: '250px',
    });
  }
}