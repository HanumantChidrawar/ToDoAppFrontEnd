import { Injectable } from '@angular/core';

//importing socket io
import * as io from 'socket.io-client';
import { Observable, throwError } from 'rxjs';

//for http requests
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AppService } from './app.service';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = "http://api.todoapp.hanumantpatil.co";
  private socket;
  public userId:string;

  constructor(public http: HttpClient, public appService: AppService) {

    //first step where connection is established. i.e. Handshake moment
    this.socket = io(this.url);
    this.userId = appService.getUserInfoFromLocalStorage().userId;
    console.log(this.userId);
   }

   //events to be listened

   public userIdEvent= ()=>{

     return Observable.create((observer)=>{

      this.socket.on(this.userId,(message)=>{

        console.log(message);
        observer.next(message);

      });//end socket
     });//end observable
   }//end userId event

  public verifyUser = () => {

    return Observable.create((observer) => {

      this.socket.on('verifyUser', (data) => {

        observer.next(data);

      });//end socket

    });//end return of Observable

  }//end verifyUser

  public onlineUserList = () => {

    return Observable.create((observer) => {

      this.socket.on("online-user-list", (userList) => {

        observer.next(userList);

      });//end socket

    });//end Observable

  }//end onlineUserList

  public authError = () => {
    return Observable.create((observer) => {

      this.socket.on('auth-error', (data) => {

        observer.next(data);

      })//end socket

    });//end observer

  }//end authError

  public disconnectedSocket = () => {

      this.socket.emit("disconnect", "");//end Socket

  }//end disconnectedSocket

  //end events to be listened

  //events to be emitted

  public setUser = (authToken) => {

    this.socket.emit("set-user", authToken);

  }//end setUser 

  public updateFriend = (data) =>{
    console.log("updateFriend emitted");

    this.socket.emit("updateFriend",data);
  }//end updateFriend

  public listUpdate = (data)=>{
    console.log("List Update called");
    console.log(data);

    this.socket.emit("listUpdate",data);
  }//end listUpdate

  public itemUpdate = (data)=>{
    console.log("List Update called");
    console.log(data);

    this.socket.emit("itemUpdate",data);
  }//end itemUpdate

  public exitSocket = () => {

    this.socket.disconnect();

  }//end exit socket



  private handleError(err: HttpErrorResponse) {

    let errorMessage = "";

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    }//end if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }//end handleError
}
