import { Component, OnInit } from '@angular/core';
//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  public email: string;

  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
  }

  public sendResetLink = () => {

    this.appService.sendResetLinkFunction(this.email)
      .subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.success("Mail Sent SuccessFully", "Success!");
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
          this.router.navigate(['/serverError']);
        }
      },
        (error) => {
          this.toastr.error("Some Error Occurred", "Error!");
          this.router.navigate(['/serverError']);
        });

  }//end of sendResetLink 

  public goToSignUp() {
    this.router.navigate(['/signup']);
  }//end goToSignUp
  
}
