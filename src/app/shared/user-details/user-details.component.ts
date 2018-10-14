import { Component, OnInit, Input } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  @Input() userFirstName: string;
  @Input() userLastName: string;
  @Input() userStatus: string;
  

  public firstChar: string;

  constructor(public toastr: ToastrService) { }

  ngOnInit() {
  
    this.firstChar = this.userFirstName[0];

  }

  public showGroupName = (name: string) => {

    this.toastr.success("You clicked " + name);
  }//end showGroupName
}
