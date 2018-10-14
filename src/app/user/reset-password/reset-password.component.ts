import { Component, OnInit } from '@angular/core';
//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public password: string;
  public confirmPassword: string;
  public userId: string;

  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
     this.userId = this._route.snapshot.paramMap.get('userId');
  }

  public data: any = {};

  public resetPassword = () => {

    if (this.matchPassword()) {
      this.data.userId = this.userId;
      this.data.password = this.password;
      this.appService.resetPassword(this.data)
        .subscribe((apiResponse) => {
          if (apiResponse.status == 200) {
            this.toastr.success("Password Reset Succesfull", "Success!");
            setTimeout(() => {
              this.router.navigate(['/']);
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
    }
    else {
      this.toastr.error("Password Mismatch", "Error!");
    }
  }

  public matchPassword = () => {
    if (this.password === this.confirmPassword) {
      return true;
    }
    else {
      return false;
    }
  }//end matchPassword

  public goToSignUp() {
    this.router.navigate(['/signup']);
  }//end goToSignUp


}
