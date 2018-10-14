import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path:'signup', component: SignupComponent },
      { path:'forgotPassword', component: ForgetPasswordComponent },
      { path:'resetPassword/:userId', component:ResetPasswordComponent },
      { path: 'verifyUser/:userId', component: VerifyEmailComponent }
    ])
  ],
  declarations: [LoginComponent, SignupComponent, ForgetPasswordComponent, ResetPasswordComponent, VerifyEmailComponent]
})
export class UserModule { }
