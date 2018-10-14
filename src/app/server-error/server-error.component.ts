import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css']
})
export class ServerErrorComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {
  }

   //goBack Method
   public goBack(): any {
    this.location.back();
  }//end goBackMethod
}
