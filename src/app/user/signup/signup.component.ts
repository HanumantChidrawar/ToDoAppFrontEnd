import { Component, OnInit } from '@angular/core';
//import for service
import { AppService } from '../../app.service';
//import for toastr
import { ToastrService } from 'ngx-toastr';
//import for Routing
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public confirmPassword: string;
  public mobileNumber: String;
  public country: string;
  public allCountries:any;
  public countries:any[]=[];
  public countryCodes: string[];
  public countryCode:string;
  public countryName:string;

  constructor( 
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.getCountries();
    this.getCountryCodes();
  }
  public goToSignIn(): any {
    this.router.navigate(['/']);
  }//end of goToSign function

  public signupFunction(): any {

    if (!this.firstName) {
      this.toastr.warning("First Name is required", "Warning!");
    }
    else if (!this.lastName) {
      this.toastr.warning("Last Name is required", "Warning!");
    }
    else if (!this.mobileNumber) {
      this.toastr.warning("Mobile Number is required", "Warning!");
    }
    else if (!this.country) {
      this.toastr.warning("Country is required", "Warning!");
    }
    else if (!this.email) {
      this.toastr.warning("Email is required", "Warning!");
    }
    else if (!this.password) {
      this.toastr.warning("Password is required", "Warning!");
    }
    else {
      this.spinner.show();
      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNumber: `${this.countryCode} ${this.mobileNumber}`,
        email: this.email,
        password: this.password,
        country: this.countryName,
      }
      this.appService.signUp(data)
        .subscribe((apiResponse) => {

          if (apiResponse.status == 200) {
            this.spinner.hide();
            this.toastr.success("Signed Up", "SuccesFull, Please verify your email");
            setTimeout(() => {
              this.goToSignIn();
            }, 1000);//redirecting to signIn page

          }
          else {
            this.spinner.hide();
            this.toastr.error(apiResponse.message, "Error!");
          }
        },
          (error) => {
            this.spinner.hide();
            this.toastr.error("Some Error Occurred", "Error!");
            this.router.navigate(['/serverError']);
          });//end calling signUpFunction
    }
  }//end signUp function

  public getCountries(){
    this.appService.getCountryNames()
      .subscribe((data) => {
        this.allCountries = data;
        for( let i in data){

          let singleCountry = {
             name:data[i],
             code : i
          }
          this.countries.push(singleCountry);
        }
        this.countries = this.countries.sort((first, second)=>{
          return first.name.toUpperCase() < second.name.toUpperCase() ? -1 :( first.name.toUpperCase() > second.name.toUpperCase()? 1 :0 ) ; 
        });//end sort
      })//end subscribe
      
  }//end getCountries

  public getCountryCodes(){
    this.appService.getCountryNumbers()
      .subscribe((data) => {
        this.countryCodes = data;
      })//end subscribe
  }//end getCountries

  public onChangeOfCountry(){

    this.countryCode = this.countryCodes[this.country];
    this.countryName = this.allCountries[this.country];
  }//end onChangeOfCountry

}
