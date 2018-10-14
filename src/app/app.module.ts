import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

import { UserModule } from './user/user.module';
import { ModesModule } from './modes/modes.module';
import { SharedModule} from './shared/shared.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { LoginComponent } from './user/login/login.component';
import { AppService } from './app.service';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ServerErrorComponent
  ],
  imports: [
    BrowserModule,
    NgxSpinnerModule,
    HttpClientModule,
    UserModule,
    ModesModule,
    SharedModule,
    FormsModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot(), // ToastrModule added
    RouterModule.forRoot([
      { path:'', redirectTo:'login', pathMatch:'full' },
      { path:'login', component: LoginComponent},
      { path: 'pageNotFound', component: PageNotFoundComponent },
      { path: 'serverError', component: ServerErrorComponent },
      { path: '*', component: PageNotFoundComponent },
      { path: '**', component: PageNotFoundComponent }
    ])
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
