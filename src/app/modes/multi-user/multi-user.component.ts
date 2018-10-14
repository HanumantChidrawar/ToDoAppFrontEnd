import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';

//for routing
import { ActivatedRoute, Router } from '@angular/router';

//services
import { SocketService } from '../../socket.service';
import { AppService } from '../../app.service';
import { FriendsService } from '../../friends.service';

import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-multi-user',
  templateUrl: './multi-user.component.html',
  styleUrls: ['./multi-user.component.css'],
  providers: [FriendsService, SocketService]
})
export class MultiUserComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe', { read: ElementRef })

  public scrollMe: ElementRef;

  public userInfo: any;
  public authToken: any;
  public userId: String;
  public userName: String;
  public userLists: any = [];
  public listName: String;
  public listType: String = "public";
  public selectedListName: string;
  public selectedListId: string;
  public items: any[] = []
  public subItems: any[] = [];
  public itemName: string;
  public subItemName: string;
  public updateItemName: string;
  public updateSubItemName: string;
  public saved: boolean;
  public updateitem: boolean;
  public createSubitem: boolean;
  public checkId: string;
  public scrollToChatTop: boolean;
  public pageValue: number = 0;
  public loadingPreviousItems: boolean;
  public allUsers: any[] = [];
  public friends: any[] = [];
  public disconnectedSocket: boolean;
  public onlineUserList: any[] = [];
  public selectedListUsers: any;

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
    let todo = this.appService.getListFromLocalStorage();
    if (todo) {
      this.selectedListId = todo.listId;
      this.selectedListName = todo.listName;
      this.selectedListUsers = todo.users;
    }
    if (!this.authToken) {//checking for the presence of authToken if not then redirecting to login 
      this.router.navigate(['/login']);
    }
    if (this.selectedListId && this.selectedListName) {
      this.getItems();
    }
    this.getLists();
    this.verifyUserConfirmation();
    this.getOnlineUserList();
    this.userIdEvent();
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

  public userIdEvent = () => {
    this.socketService.userIdEvent()
      .subscribe((data) => {

        this.getUsers();
        this.getLists();
        this.toastr.info("Update", data.message);
        if (data.updateitem) {
          this.getItems();
        }

      });//end subscribe
  }//end userIdEvent

  public loadUsers = () => {
    
    let data: any = { email: this.userInfo.email, authToken: this.authToken }
    this.appService.getUser(data).subscribe(//get the latest details of user.
      (apiResponse) => {
        if (apiResponse.status == 200) {

          this.userInfo = apiResponse.data;
          this.friends = apiResponse.data.friends;//setting the freinds array.
          for (let user of this.allUsers) {//pick one user.
            if (this.onlineUserList.includes(user.userId)) {//check for user in online use list.
              user.status = 'online';//set the user status accordingly.
            } else {
              user.status = 'offline';
            }
            for (let friend of this.friends) {//check for user in friends array.
              friend.status = user.status;
              if (user.userId == friend.friendId) {//if present then delete from allUsers array.
                let index = this.allUsers.indexOf(user);
                this.allUsers.splice(index, 1);
                break;//break the inner lopp
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

  public sendRequest = (friendId: string) => {
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.sendRequest1(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.success("Succes!", "Friend request sent");
          let data: any = { friendId: friendId, message: `Received a new Friend Request from ${this.userName}` };
          this.socketService.updateFriend(data);
          this.getUsers();
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.error("Error!", error.message);
        }
      }
    );//end subscribe
  }//end sendRequest

  public unFriend = (friendId: string) => {//method to unfriend a particular user.
    let data: any = { friendId: friendId, userId: this.userId }
    data.authToken = this.authToken;
    this.friendService.unFriend(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.info("Update!", "UnFriend Completed");
          let data1: any = { friend1Id: this.userId, friend2Id: friendId };
          data1.authToken = this.authToken;
          this.friendService.removeUsersFromSharedLists(data1).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              this.getLists();
            }
          );//end subscribe
          let data: any = { friendId: friendId, message: `${this.userName} has unFriend You.` };
          this.socketService.updateFriend(data);//will notify the other user about the unfriend action
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

  public getUsers = () => {//to get all the users of todo app.

    let data: any = { userId: this.userInfo.userId, authToken: this.authToken }
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

  public selectedToDoList = (todo: any) => {//method to set the selected todo list.
    this.selectedListId = todo.listId;
    this.selectedListName = todo.listName;
    this.selectedListUsers = todo.users;
    this.appService.setListInfoInLocalStorage(todo);//will the list details in local storage.
    this.items = [];
    this.getItems();//will get the items of selected list.
  }//end selectedToDoList

  public getLists = () => {//method to get all the shared lists for users which his own and his friends. 
    let data: any = {};
    data.userId = this.userId;
    data.listType = "public";
    data.authToken = this.authToken;
    this.appService.getLists(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          console.log(apiResponse);
          this.userLists = apiResponse.data;
          for (let list of this.userLists) {
            if (list.listId == this.selectedListId) {
              this.selectedListUsers = list.users;
              this.appService.setListInfoInLocalStorage(list);//refreshing the list details in local storage.
              break;
            }
          }
          this.toastr.info("Update", "All Private ToDO lists loaded.")
        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.info("Update", "No Private ToDO lists Found.")
        }
      }
    );//end subscribe

  }//end getLists

  public createList = () => {//this will create a list
    if (!this.listName) {//checking for the name of the list
      this.toastr.warning("warning", "ToDO List Name should not be empty")
    }
    else {
      let data: any = {};
      data.listName = this.listName;
      data.listType = this.listType;
      data.userId = this.userId;
      data.authToken = this.authToken;
      this.appService.createList(data).subscribe(
        (apiResponse) => {
          if (apiResponse.status == 200) {
            this.selectedListName = apiResponse.data.listName;
            this.selectedListId = apiResponse.data.listId;
            this.appService.setListInfoInLocalStorage(apiResponse.data);//setting the list name in local storage for future referrences.
            this.toastr.success("Success", `Todo list ${apiResponse.data.listName} created.`);
            this.items = [];
            this.getLists();//refreshing the shared lists of users.
            let data1 = { friends: this.userInfo.friends, message: `${this.userName} has created a public ToDo list ${apiResponse.data.listName}.` };
            this.socketService.listUpdate(data1);//will notify the friends about the creation of new list.
            let data: any = { listId: this.selectedListId, authToken: this.authToken }
            this.appService.createHistoryList(data).subscribe(
              (apiResponse) => {
                console.log(apiResponse);
              }
            );//end subscribe
          }
        },
        (error) => {
          this.toastr.error("Some error occured");
          this.router.navigate(['/serverError']);
        }
      );//end subscribe
    }
  }//end createList 

  public deleteList = () => {//method to delete the selected list
    let data: any = {
      listId: this.selectedListId,
      authToken: this.authToken
    }
    this.appService.deleteHistoryList(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.appService.deleteList(data).subscribe(
            (apiResponse) => {
              if (apiResponse.status == 200) {
                this.toastr.success(`ToDo List Deleted ${this.selectedListName}`);
                let data1 = { friends: this.friends, message: `${this.userName} has deleted a public ToDo list ${this.selectedListName}.` };
                this.socketService.listUpdate(data1);//will notify all the users of shared list about its deletion 
                this.items = [];
                this.selectedListId = "";//setting the list parameters to null
                this.selectedListName = "";
                this.appService.setListInfoInLocalStorage("");
                this.userLists = this.getLists();//method to refreshing the  other shared lists of users
              }
            },
            (error) => {
              this.toastr.error("Some error occured");
              this.router.navigate(['/serverError']);
            }
          );//end subscribe
        }
      },
      (error) => {
        this.toastr.error("Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end delete List

  public getItems = (skipvalue?: Number) => {//method to get all the items of selected list.
    let data: any = {};
    data.listId = this.selectedListId;
    data.skip = skipvalue;
    data.authToken = this.authToken;
    this.appService.getItems(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.items = apiResponse.data
          let itemids: any[] = [];//making array of only the itemsId's which will be used for fething the subitems.
          for (let item of this.items) {
            itemids.push(item.itemId);
          }
          this.getSubItems(itemids);
        }
        if (apiResponse.status == 300) {
          this.items = [];
          this.toastr.warning("Update!", "No items found");
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end getItems

  public getSubItems = (itemIds) => {//method to get all the subItems of the items which are provided in itemds string.

    let data: any = { itemids: itemIds.toString(), authToken: this.authToken }

    this.appService.getSubItems(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.subItems = apiResponse.data;
          for (let item of this.items) {//picking one item from all items array.
            item.subItems = [];//initializing the subItems array.
            for (let subitem of this.subItems) {
              if (subitem.itemId == item.itemId) {//checking for a match of itemIds
                item.subItems.push(subitem);//if mathced then pushing the subitem to the subitems array.
              }//end If
            }//end innerLoop
          }//end outerLoop
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end getSubItems

  public createItem = (preDefinedValue?: boolean, data1?: any) => {

    let data: any = {}
    data.itemName = this.itemName;
    this.itemName = "";
    data.userName = this.userName;
    data.listId = this.selectedListId
    if (preDefinedValue) {
      data = data1;
    }
    data.authToken = this.authToken;
    this.appService.createItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.items.push(apiResponse.data);
          this.scrollToChatTop = true;
          this.toastr.success("Success", `Item ${apiResponse.data.itemName} is added to ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has created a Item ${apiResponse.data.itemName} in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);
          if (!data.operationType) {
            let saveItem: any = {};
            saveItem.itemId = apiResponse.data.itemId;
            saveItem.listId = this.selectedListId;
            saveItem.authToken = this.authToken;
            this.saveObjectToHistory(saveItem);
          }

        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end createItem

  public createSubItem = (itemId: string, preDefinedValue?: boolean, data1?: any) => {

    let data: any = {}
    data.subItemName = this.subItemName;
    this.subItemName = "";
    data.userName = this.userName;
    data.itemId = itemId
    if (preDefinedValue) {
      data = data1;
    }
    data.authToken = this.authToken;

    this.appService.createSubItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          if (!data.operationType) {//if operation type is not set then save the object to history before performing the action.
            let saveItem: any = {};
            saveItem.subItemId = apiResponse.data.subItemId;
            saveItem.listId = this.selectedListId;
            saveItem.authToken = this.authToken;
            this.saveObjectToHistory(saveItem);
          }
          this.toastr.success("Success", `SubItem ${apiResponse.data.subItemName} is added to ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has created a SubItem ${apiResponse.data.subItemName} in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);//event to notify other friends/users about the action performed on item/subitem
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end createSubItem

  public updateItem = (itemId: string, updateOnly?: boolean, itemName?: string, itemStatus?: boolean) => {

    let data: any = {}
    data.itemId = itemId;
    data.authToken = this.authToken;
    if (itemName) {
      data.itemName = itemName;
    }
    data.itemStatus = itemStatus
    if (itemName && itemStatus != undefined) {//setting the flag to indicate that the both name and status are to be updated.
      data.both = true;
    }
    if (!updateOnly) {//if don't want the object to be saved in history then send the update only flag as true.
      let saveObject: any = {};
      saveObject.itemId = itemId;
      saveObject.item = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "update";//setting the operation type to make sure it doesn't goes in to lop while performing the undo action.
      saveObject.authToken = this.authToken;
      this.saveObjectToHistory(saveObject);
    }

    this.appService.updateItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          for (let item of this.items) {
            if (item.itemId == itemId) {
              if (itemName) {
                item.itemName = itemName;
              }
              else {
                item.itemStatus = itemStatus;
              }
              break;
            }
          }
          this.toastr.info("Update", `Item updated from ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has updated a Item  in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);//event to notify other friends/users about the action performed on item/subitem
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end updateItem

  public updateSubItem = (subItemId: string, updateOnly?: boolean, subItemName?: string, subItemStatus?: string) => {

    let data: any = {}
    data.subItemId = subItemId;
    data.subItemStatus = subItemStatus;
    data.authToken = this.authToken;
    if (subItemName) {
      data.subItemName = subItemName;
    }
    if (subItemName && subItemStatus != undefined) {
      data.both = true;
    }
    if (!updateOnly) {
      let saveObject: any = {};
      saveObject.subItemId = subItemId;
      saveObject.subItem = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "update";
      saveObject.authToken = this.authToken;
      this.saveObjectToHistory(saveObject);

    }

    this.appService.updateSubItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `SubItem updated from ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has updated a SubItem in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end updateSubItem

  public deleteItem = (itemId: string, deleteOnly?: boolean) => {

    if (!deleteOnly) {
      let saveObject: any = {};
      saveObject.itemId = itemId;
      saveObject.item = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "delete";
      saveObject.authToken = this.authToken;
      this.saveObjectToHistory(saveObject);

    }
    let data: any = { itemId: itemId, authToken: this.authToken };
    this.appService.deleteItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `Item deleted from ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has deleted a Item in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end deleteItem

  public deleteSubItem = (subItemId: string, deleteOnly?: boolean) => {

    if (!deleteOnly) {//when we want to do the undo action then set delete only flag to false which will save the object in History before deleting it.
      let saveObject: any = {};
      saveObject.subItemId = subItemId;
      saveObject.subItem = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "delete";//setting the property to identify the operation type which will used while undoing the action.
      saveObject.authToken = this.authToken;
      this.saveObjectToHistory(saveObject);
    }

    let data: any = { subItemId: subItemId, authToken: this.authToken };
    this.appService.deleteSubItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `SubItem deleted from ${this.selectedListName} lists.`)
          let data1 = { users: this.selectedListUsers, message: `${this.userName} has deleted a SubItem in public ToDo list ${this.selectedListName}.` };
          this.socketService.itemUpdate(data1);//event to notify other friends/users about the action performed on item/subitem
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end deleteSubItem

  public createHistoryForList = (listId: string) => {//method to create a history list for new Todo list whoose id is provided..
    let data: any = { authToken: this.authToken, listId: listId }

    this.appService.createHistoryList(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          console.log(apiResponse);
        }
      },
      (error) => {
        console.log(error);
      }
    );//end subscribe
  }//end createHistory for List

  public saveObjectToHistory = (data: any) => {//method to save the object which is being edited to the history database which will be used for undo action.

    data.authToken = this.authToken;
    this.appService.saveObject(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          console.log(apiResponse);
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end saveObjectToHistory

  public getObjectFromHistory = (listId: string) => { // the method which gets the object from histroy list of currently selected list for undo operations.

    let data: any = { listId: listId, authToken: this.authToken };
    this.appService.getObject(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          if (apiResponse.data.deletedObject) {
            if (!(apiResponse.data.deletedObject.createdBy)) {//undo the action incase of newly created object 
              if (apiResponse.data.deletedObject.subItemId) {
                this.deleteSubItem(apiResponse.data.deletedObject.subItemId, true);//if subitem is just created then its undo action will be deletion of it permanantely.
              }
              else {
                this.deleteItem(apiResponse.data.deletedObject.itemId, true);//if item is just created then its undo action will be deletion of it permanantely.
              }
            }
            else if (apiResponse.data.deletedObject.operationType == "update") {//undo the action incase of update of object
              if (apiResponse.data.deletedObject.subItemId && apiResponse.data.deletedObject.itemId) {//checking for object as subitem.
                this.updateSubItem(apiResponse.data.deletedObject.subItemId, true, apiResponse.data.deletedObject.subItemName, apiResponse.data.deletedObject.subItemStatus);
              }
              else {
                this.updateItem(apiResponse.data.deletedObject.itemId, true, apiResponse.data.deletedObject.itemName, apiResponse.data.deletedObject.itemStatus);
              }
            }
            else {//undo the action in case of deletion of object
              if (apiResponse.data.deletedObject.subItemId && apiResponse.data.deletedObject.itemId) {
                this.createSubItem(apiResponse.data.deletedObject.itemId, true, apiResponse.data.deletedObject);
              }
              else {
                this.createItem(true, apiResponse.data.deletedObject);
              }
            }
            this.getItems();
          }
          else {
            this.toastr.warning("Warning", "No Undo Available");
          }

        }
      },
      (error) => {
        if (error.status == 300) {
          this.toastr.warning("Warning!", "No More Undo's available.")
        }
      }
    );//end subscribe
  }//end getObjectFromHistory

  public loadEarlierItems: any = () => {

    this.loadingPreviousItems = true;

    this.pageValue++;//increasing the the skip value each time the method is called so that fetched items are new than the previous one. 
    this.scrollToChatTop = true;

    this.getPreviousItems();

  }//end loadPreviousChat

  public getPreviousItems: any = () => {//method to get the previous items of the selected ToDo list.

    let previousData = (this.items.length > 0 ? this.items.slice() : []);//checking for the current array of items.
    let data: any = { listId: this.selectedListId, skip: this.pageValue }
    data.authToken = this.authToken;
    this.appService.getItems(data)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.items = apiResponse.data.concat(previousData);//concatinating the previous and the newly fethced array of items.
        } else {
          this.items = previousData;
        }
        let itemids: any[] = [];
        for (let item of this.items) {
          itemids.push(item.itemId);
        }
        this.getSubItems(itemids);//getting the subItems of newly fetched items. 
        this.loadingPreviousItems = false;
      }, (err) => {
        if (err.status = 500) {
          this.toastr.warning('No More Items', "Warning!");
        }
      });

  }//end getPreviousItems

  public showListName = (name: string) => {//method to show the list name on clicking the icon of seleted list.

    this.toastr.success("You are Viewing List " + name);
  }//end showGroupName

  public createItemUsingEnter: any = (event: any) => {//method to create the Item on enter.

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.createItem();
    }


  }//end createItemUsingEnter

  public updateItemUsingEnter: any = (event: any, itemId: string) => {//method to update the Item on enter.

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.updateItem(itemId, false, this.updateItemName);
      this.updateitem = false;
    }

  }//end updateItemUsingEnter

  public createSubItemUsingEnter: any = (event: any, itemId: string) => {//method to create the subItem on enter.

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.createSubItem(itemId);

    }

  }//end createSubItemUsingEnter

  public updateSubItemUsingEnter: any = (event: any, subItemId: string) => {//method to update the subItem on enter.

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.updateSubItem(subItemId, false, this.updateSubItemName);
      this.updateitem = false;
    }

  }//end updateSubItemUsingEnter

  //method to perform undo using shortcut keys
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'z' || event.metaKey && event.key == 'z') {//confirming the event occured due to the 'ctrl + Z' or 'cmd + Z' keys.
      if (this.selectedListId) {
        this.getObjectFromHistory(this.selectedListId);//preforming the undo action on it.
      }

    }

  }//end

  public logout: any = () => {//method to log the user out of the application

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          Cookie.delete('authToken');//deleting all the cookies set previously and also clearing the local storage.
          Cookie.delete('userId');
          Cookie.delete('userName');
          Cookie.delete('selectedListName');
          Cookie.delete('selectedListId');
          localStorage.clear();

          this.socketService.disconnectedSocket();//disconnecting the socket connection.
          this.socketService.exitSocket();
          this.router.navigate(['/']);//navigating to login page
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      }, (err) => {
        this.toastr.error('some error occured');
      });//end subscribe

  }//end logout

  public ngOnDestroy(){
    this.socketService.exitSocket();//need to call this method inorder to avoid listening the event multiple times(to avoid multiple toastr messages.)
  }//end ngOnDestroy

}
