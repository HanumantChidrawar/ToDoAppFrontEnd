import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';

import { SelectComponent } from './select/select.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { MultiUserComponent } from './multi-user/multi-user.component';
import { ManageFriendsComponent } from './manage-friends/manage-friends.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'select', component: SelectComponent },
      { path: 'singleUser', component: SingleUserComponent },
      { path: 'multiUser', component: MultiUserComponent },
      { path: 'manageFriends', component: ManageFriendsComponent }
    ]),
    SharedModule
  ],
  declarations: [SelectComponent, SingleUserComponent, MultiUserComponent, ManageFriendsComponent]
})
export class ModesModule { }
