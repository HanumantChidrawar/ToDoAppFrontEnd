import { Component, OnInit, OnDestroy } from '@angular/core';

//for routing
import { ActivatedRoute, Router } from '@angular/router';

//services
import { SocketService } from '../../socket.service';
import { FriendsService } from '../../friends.service';
import { AppService } from '../../app.service';

import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-friends',
  templateUrl: './manage-friends.component.html',
  styleUrls: ['./manage-friends.component.css'],
  providers: [SocketService, FriendsService]
})
export class ManageFriendsComponent implements OnInit, OnDestroy {

  public userInfo: any;
  public authToken: any;
  public userId: String;
  public userName: String;
  public friends: any[] = [];
  public allUsers: any[] = [];
  public disconnectedSocket: boolean;
  public onlineUserList: any[] = [];

  constructor(
    private appService: AppService,
    private socketService: SocketService,
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private friendService: FriendsService
  ) { }

  ngOnInit() {
    this.userInfo = this.appService.getUserInfoFromLocalStorage();//getting userInfo which was stored in login component
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');//getting the authtoken, receiverId, recieverName from cookies which were set in login component.
    this.userName = Cookie.get('userName');
    if (!this.authToken) {//check for the presence of authToken before performing operations else redirect to login
      this.router.navigate(['/login']);
    }
    this.getUsers();//to load all the users of the application
    this.verifyUserConfirmation();
    this.getOnlineUserList();
    this.userIdEvent();//subscribe to an userId event to get notified about the action taken by other friend.
  }

  public verifyUserConfirmation: any = () => {

    this.socketService.verifyUser()
      .subscribe((data) => {
        this.disconnectedSocket = false;
        this.socketService.setUser(this.authToken);

      });//end subscribe
  }//end verifyUserConfirmation

  public getOnlineUserList: any = () => {

    this.socketService.onlineUserList()
      .subscribe((userListfromdb) => {

        this.onlineUserList = [];

        for (let x in userListfromdb) {

          let temp = x;

          this.onlineUserList.push(temp);
        }
        this.getUsers();

      });//end subscribe

  }//end getOnlineUserList


  public loadUsers = () => {//to load all the friends/ other users/ recieved/ sent friend requests in the component. 

    let data: any = { email: this.userInfo.email, authToken: this.authToken };
    this.appService.getUser(data).subscribe(//get the most recent details of currently logged in user.
      (apiResponse) => {
        if (apiResponse.status == 200) {

          this.userInfo = apiResponse.data;
          this.appService.setUserInfoInLocalStorage(apiResponse.data);//update the user details in local storage.
          this.friends = apiResponse.data.friends;//refresh the friends array.
          for (let user of this.allUsers) {

            if (this.onlineUserList.includes(user.userId)) {//check for user in online use list.
              user.status = 'online';//set the user status accordingly.
            } else {
              user.status = 'offline';
            }

            for (let friend of this.friends) {//chek the presence of user from all users array in the friends array.

              if (user.userId == friend.friendId) {//checking for match of userIds.
                friend.status = user.status;
                let index = this.allUsers.indexOf(user);//if matched get index of user from allUsers array which will be used to delete it from the array.
                this.allUsers.splice(index, 1);
                break;//break the inner loop
              }
            }
            for (let friend of this.userInfo.receivedFriendRequests) { //this will remove the users from allUsers array if they have sent a friend request to current user.

              if (user.userId == friend.friendId) {
                friend.status = user.status;
                let index = this.allUsers.indexOf(user);
                this.allUsers.splice(index, 1);
                break;
              }
            }
            for (let friend of this.userInfo.sentFriendRequests) {//this will remove the users from allUsers array if they have been sent a friend request from current user.

              if (user.userId == friend.friendId) {
                friend.status = user.status;
                let index = this.allUsers.indexOf(user);
                this.allUsers.splice(index, 1);
                break;
              }
            }
          }
        }
      },
      (error) => {
        this.toastr.error("Error!", "Unable to get user details.")
      }
    );//end subcribe
  }//end loadUsers

  public userIdEvent = () => {//this method will notify the current user about its update on sent/received/accept/unfriend requests.
    this.socketService.userIdEvent()
      .subscribe((data) => {

        this.getUsers();//to refresh the users array after the updation.
        this.toastr.info("Update", data.message);

      });//end subscribe
  }//end userIdEvent

  public sendRequest1 = (friendId: string) => {//to send a friend request to some other user whoose friendId is provided
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.sendRequest1(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.success("Succes!", "Friend request sent");
          let data: any = { friendId: friendId, message: `Received a new Friend Request from ${this.userName}` };
          this.socketService.updateFriend(data);//emitting an event for the other user to notify him about the Friend Request.
          this.getUsers();//refeersh the users array.
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.error("Error!", error.message);
        }
      }
    );//end subscribe
  }//end sendRequest

  public unFriend = (friendId: string) => {//to unfriend a user whoose friend Id is provided.
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.unFriend(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.info("Update!", "UnFriend Completed");
          let data1: any = { friend1Id: this.userId, friend2Id: friendId };
          data1.authToken = this.authToken;
          this.friendService.removeUsersFromSharedLists(data1).subscribe(//addtional work needs to be done incase of unFriend is to remove the unFriend user from the shared lists array of cureent user.
            (apiResponse) => {
              console.log(apiResponse);
            }
          );//end subscribe
          let data: any = { friendId: friendId, message: `${this.userName} has unFriend You.` };
          this.socketService.updateFriend(data);//emitting an event for the other user to notify him about the Friend Request.
          this.getUsers();
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.error("Error!", error.message);
        }
      }
    );//end subscribe
  }//end unFriend

  public getUsers = () => {//it will get all the users and then load the users in component according to their conditions.

    let data: any = { userId: this.userInfo.userId, authToken: this.authToken };
    this.appService.getUsers(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.allUsers = apiResponse.data;
          this.loadUsers();
        }
      },
      (error) => {
        this.toastr.error("Error!", "Unable to get all users.")
      }
    );//end subcribe
  }//end getUsers

  public rejectRequest = (friendId: string) => {//To reject an friend request from other user whoose friendId is provided.
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.rejectRequest1(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          let data: any = {};
          data.friend1Id = friendId; data.friend2Id = this.userId;
          this.toastr.success("Succes!", "Friend request rejected.");
          let data1: any = { friendId: friendId, message: `${this.userName} has rejected your Request.` };
          this.socketService.updateFriend(data1);//emitting an event for the other user to notify him about the Friend Request.
          this.getUsers();
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.error("Error!", error.message);
        }
      }
    );//end subscribe
  }//end rejectRequest

  public acceptRequest = (friendId: string) => {//to accept a friend request from other user whoose Id is provided.
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.acceptRequest(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.success("Succes!", "Friend request accepted.");
          let data1: any = { friendId: friendId, message: `${this.userName} has accepted your Request.` };
          this.socketService.updateFriend(data1);//emitting an event for the other user to notify him about the Friend Request.
          let data: any = {};
          data.friend1Id = friendId; data.friend2Id = this.userId;
          data.authToken = this.authToken;
          this.friendService.addUsersToSharedLists(data).subscribe(//addtional work needs to be done incase of acceptance of request is to add both the Friends to the shared lists array of both.
            (apiResponse) => {
              console.log(apiResponse)
            },
            (error) => {
              console.log(error);
            }
          );//end subscribe
          this.getUsers();
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.error("Error!", error.message);
        }
      }
    );//end subscribe
  }//end acceptRequest


  public ngOnDestroy() {
    this.socketService.exitSocket();//need to call this method inorder to avoid listening the event multiple times(to avoid multiple toastr messages.)
  }//end ngOnDestroy

}
