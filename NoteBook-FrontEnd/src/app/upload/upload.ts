import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule} from '@angular/material/card';
import { MatIcon} from '@angular/material/icon'
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-upload',
  imports: [MatCardModule, MatIcon],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {
  constructor(private http:HttpClient, private router:Router){}
  protected title = 'NoteBook-FrontEnd';

  upload(event:any){
    const formData = new FormData();
        formData.append('pdf', event.target.files[0]);
        this.http.post(`${environment.apiUrl}upload`, formData, {reportProgress:true}).subscribe((res: any) =>
          {
          this.router.navigate(['view', res.path.split('.pdf')[0]])
        })
        
      }
}
