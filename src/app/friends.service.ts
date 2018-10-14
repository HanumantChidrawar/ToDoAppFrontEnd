import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
//for using cookies
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  public baseUrl = "http://api.todoapp.hanumantpatil.co/api/v1";

  constructor(private _http: HttpClient) { }

  public sendRequest1(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.userId}/${data.friendId}/sendRequest?authToken=${data.authToken}`);
  }//end sendRequest

  public rejectRequest1(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.userId}/${data.friendId}/rejectRequest?authToken=${data.authToken}`);
  }//end rejectRequest

  public acceptRequest(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.userId}/${data.friendId}/acceptRequest?authToken=${data.authToken}`);
  }//end accepttRequest

  public unFriend(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.userId}/${data.friendId}/unFriend?authToken=${data.authToken}`);
  }//end unFriend

  public addUsersToSharedLists(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.friend1Id}/${data.friend2Id}/addUsersToSharedLists?authToken=${data.authToken}`);
  }//end addUsersToSharedLists

  public removeUsersFromSharedLists(data): Observable<any> {

    return this._http.get(`${this.baseUrl}/friend/${data.friend1Id}/${data.friend2Id}/removeUsersFromSharedLists?authToken=${data.authToken}`);
  }//end removeUsersFromSharedLiIsts

}
