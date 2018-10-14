import { Component, OnInit } from '@angular/core';
//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';
//for cookies
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: string;
  public password: string;

  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
  }

  public goToSignUp() {
    this.router.navigate(['/signup']);
  }//end goToSignUp

  public signInFunction(): any {
    let data: any = {
      email: this.email,
      password: this.password
    }

    if (!this.email) {
      this.toastr.warning("Email is required", "Warning");
    }
    else if (!this.password) {
      this.toastr.warning("Password is required", "Warning");
    }
    else {
      this.spinner.show();
      this.appService.signInFunction(data)
        .subscribe((apiResponse) => {

          if (apiResponse.status == 200) {
            this.spinner.hide();
            this.toastr.success("Signed In", "Success");

            Cookie.set('authToken', apiResponse.data.authToken);
            Cookie.set('userId', apiResponse.data.userDetails.userId);
            Cookie.set('userName', `${apiResponse.data.userDetails.firstName} ${apiResponse.data.userDetails.lastName}`);
            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails);
            setTimeout(() => {
              this.router.navigate(['/select']);
            }, 1000);
          }
          else {
            this.spinner.hide();
            this.toastr.error("Error!", apiResponse.message);
          }
        },
          (error) => {
            if (error.status == 300) {
              this.spinner.hide();
              this.toastr.error("Error!", "Incorrect Password");
            }
            else if (error.status == 305) {
              this.spinner.hide();
              this.toastr.info("Update!", "Verification Pending, Check email");
            } else {
              this.spinner.hide();
              this.toastr.error("Some error occured");
              console.log(error);
              this.router.navigate(['/serverError']);
            }
          });
    }
  }//end of signIn function

}
