import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
//for using cookies
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AppService {

  public baseUrl = "http://api.todoapp.hanumantpatil.co/api/v1";
  constructor(private _http: HttpClient) { }

  public getCountryNames(): Observable<any> {

    return this._http.get("../assets/countryList.json");

  }//end getCountryNames

  public getCountryNumbers(): Observable<any> {

    return this._http.get("../assets/countryCodes.json");

  }//end getCountryNumbers

  public signUp(data): Observable<any> {

    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('country', data.country)

    return this._http.post(`${this.baseUrl}/users/signup`, params);
  }//end signUp

  public signInFunction(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this._http.post(`${this.baseUrl}/users/login`, params);
  }//end of signInFunction

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }//end of setlocalstorage Function

  public getUserInfoFromLocalStorage: any = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }//end getlocalstorage function

  public setListInfoInLocalStorage = (data) => {
    localStorage.setItem('selectedList', JSON.stringify(data));
  }//end of setlocalstorage Function

  public getListFromLocalStorage: any = () => {
    return JSON.parse(localStorage.getItem('selectedList'));
  }//end getlocalstorage function

  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken', Cookie.get('authToken'));

    let userdetails = this.getUserInfoFromLocalStorage();

    return this._http.post(`${this.baseUrl}/users/${userdetails.userId}/logout`, params);
  }//end of logout function

  public sendResetLinkFunction(email: string): Observable<any> {
    return this._http.get(`${this.baseUrl}/users/${email}/forgotPassword`);
  }//end sendResetLink function

  public verifyUser(id: string): Observable<any> {

    return this._http.get(`${this.baseUrl}/users/${id}/verifyUser`);
  }//end sendResetLink function

  public getUser(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/users/${data.email}/getUser?authToken=${data.authToken}`);
  }//end getUser function

  public getUsers(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/users/${data.userId}/getUsers?authToken=${data.authToken}`);
  }//end getUsers function

  public resetPassword(data: any): Observable<any> {
    const params = new HttpParams()
      .set('userId', data.userId)
      .set('password', data.password);
    return this._http.post(`${this.baseUrl}/users/resetPassword?authToken=${data.authToken}`, params);

  }//end resetPassword Function

  //lists function

  public getLists(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/lists/${data.userId}/${data.listType}/getLists?authToken=${data.authToken}`);
  }//end getLists

  public getList(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/lists/${data.listId}/getList?authToken=${data.authToken}`);
  }//end getLists

  public getItems(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/lists/${data.listId}/getItems?skip=${data.skip}&authToken=${data.authToken}`);
  }//end getItems

  public getSubItems(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/lists/getSubItems?itemIds=${data.itemids}&authToken=${data.authToken}`);
  }//end getSubItems

  public createList(data: any): Observable<any> {

    const params = new HttpParams()
      .set('userId', data.userId)
      .set('listType', data.listType)
      .set('listName', data.listName)

    return this._http.post(`${this.baseUrl}/lists/createList?authToken=${data.authToken}`, params);
  }//end createList

  public updateList(data: any): Observable<any> {

    const params = new HttpParams()
      .set('listName', data.listName)

    return this._http.post(`${this.baseUrl}/lists/${data.listId}/updateList?authToken=${data.authToken}`, params);
  }//end updateList

  public deleteList(data: any): Observable<any> {
    return this._http.get(`${this.baseUrl}/lists/${data.listId}/deleteList?authToken=${data.authToken}`);
  }//end deleteList

  public deleteHistoryList(data: any): Observable<any> {
    return this._http.get(`${this.baseUrl}/history/${data.listId}/deleteHistoryList?authToken=${data.authToken}`)
  }

  public createItem(data: any): Observable<any> {


    if (data.itemId) {

      const params = new HttpParams()
        .set('listId', data.listId)
        .set('itemName', data.itemName)
        .set('itemId', data.itemId)
        .set('itemStatus', data.itemStatus)
        .set('createdOn', data.createdOn)
        .set('userName', data.createdBy);
      return this._http.post(`${this.baseUrl}/lists/createItem?authToken=${data.authToken}`, params);
    } else {
      const params = new HttpParams()
        .set('listId', data.listId)
        .set('itemName', data.itemName)
        .set('userName', data.userName);
      return this._http.post(`${this.baseUrl}/lists/createItem?authToken=${data.authToken}`, params);
    }

  }//end createItem

  public updateItem(data: any): Observable<any> {

    if (data.both) {
      const params = new HttpParams()
        .set('itemStatus', data.itemStatus)
        .set('itemName', data.itemName);
      return this._http.post(`${this.baseUrl}/lists/${data.itemId}/updateItem?authToken=${data.authToken}`, params);
    }
    else if (data.itemName) {
      const params = new HttpParams()
        .set('itemName', data.itemName);

      return this._http.post(`${this.baseUrl}/lists/${data.itemId}/updateItem?authToken=${data.authToken}`, params);
    } else {
      const params = new HttpParams()
        .set('itemStatus', data.itemStatus);

      return this._http.post(`${this.baseUrl}/lists/${data.itemId}/updateItem?authToken=${data.authToken}`, params);
    }
  }//end updateItem

  public deleteItem(data: any): Observable<any> {
    return this._http.get(`${this.baseUrl}/lists/${data.itemId}/deleteItem?authToken=${data.authToken}`);
  }//end deleteItem

  public createSubItem(data: any): Observable<any> {




    if (data.subItemId) {
      const params = new HttpParams()
        .set('itemId', data.itemId)
        .set('subItemName', data.subItemName)
        .set('subItemId', data.subItemId)
        .set('subItemStatus', data.subItemStatus)
        .set('createdOn', data.createdOn)
        .set('userName', data.createdBy);
      return this._http.post(`${this.baseUrl}/lists/createSubItem?authToken=${data.authToken}`, params);
    }
    else {
      const params = new HttpParams()
        .set('itemId', data.itemId)
        .set('subItemName', data.subItemName)
        .set('userName', data.userName);
      return this._http.post(`${this.baseUrl}/lists/createSubItem?authToken=${data.authToken}`, params);
    }


  }//end createSubItem

  public updateSubItem(data: any): Observable<any> {

    if (data.both) {
      const params = new HttpParams()
        .set('subItemStatus', data.subItemStatus)
        .set('subItemName', data.subItemName);
      return this._http.post(`${this.baseUrl}/lists/${data.subItemId}/updateSubItem?authToken=${data.authToken}`, params);
    }
    else if (data.subItemName) {
      const params = new HttpParams()
        .set('subItemName', data.subItemName);
      return this._http.post(`${this.baseUrl}/lists/${data.subItemId}/updateSubItem?authToken=${data.authToken}`, params);
    } else {
      const params = new HttpParams()
        .set('subItemStatus', data.subItemStatus);
      return this._http.post(`${this.baseUrl}/lists/${data.subItemId}/updateSubItem?authToken=${data.authToken}`, params);
    }

  }//end updateSubItem

  public deleteSubItem(data: any): Observable<any> {
    return this._http.get(`${this.baseUrl}/lists/${data.subItemId}/deleteSubItem?authToken=${data.authToken}`);
  }//end deleteSubItem

  //history controller methods

  public createHistoryList(data: any): Observable<any> {
    return this._http.get(`${this.baseUrl}/history/${data.listId}/createHistoryList?authToken=${data.authToken}`);
  }//end createHistoryList

  public saveObject(data: any): Observable<any> {

    if (data.item) {
      const params = new HttpParams()
        .set('item', data.item)
        .set('itemId', data.itemId)
        .set('operationType', data.operationType);
      return this._http.post(`${this.baseUrl}/history/${data.listId}/saveObject?authToken=${data.authToken}`, params)
    }
    else if (data.subItem) {
      const params = new HttpParams()
        .set('subItem', data.subItem)
        .set('subItemId', data.subItemId)
        .set('operationType', data.operationType);
      return this._http.post(`${this.baseUrl}/history/${data.listId}/saveObject?authToken=${data.authToken}`, params)
    } else if (data.itemId) {
      const params = new HttpParams()
        .set('itemId', data.itemId);
      return this._http.post(`${this.baseUrl}/history/${data.listId}/saveObject?authToken=${data.authToken}`, params)
    } else {
      const params = new HttpParams()
        .set('subItemId', data.subItemId);
      return this._http.post(`${this.baseUrl}/history/${data.listId}/saveObject?authToken=${data.authToken}`, params)
    }

  }//endsaveObject

  public getObject(data: any): Observable<any> {

    return this._http.get(`${this.baseUrl}/history/${data.listId}/deleteObject?authToken=${data.authToken}`);
  }//end getObject

}
