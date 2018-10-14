import { Component, OnInit } from '@angular/core';
//import for toastr
import { ToastrService } from 'ngx-toastr';
//for Service
import { AppService } from '../../app.service';
//for routing
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  public userId:string;
  constructor(
    public appService: AppService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.userId = this._route.snapshot.paramMap.get('userId');
    this.verifyUser();
  }

  public verifyUser(){

    this.appService.verifyUser(this.userId)
      .subscribe((apiResponse)=>{

        if(apiResponse.status == 200){
          this.toastr.success("User Verified","Success!");
        }else{
          this.toastr.error(apiResponse.message, "Error!");
          this.router.navigate(['/serverError']);
        }
      },
      (error) => {
        this.toastr.error("Some Error Occurred", "Error!");
        this.router.navigate(['/serverError']);
      })//end subscribe
  }//end verifyuser

  public goToSignIn() {
    this.router.navigate(['/login']);
  }//end goToSignUp
}
