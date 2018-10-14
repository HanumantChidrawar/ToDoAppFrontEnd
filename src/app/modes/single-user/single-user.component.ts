import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';

//for routing
import { ActivatedRoute, Router } from '@angular/router';
//import for services
import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';
import { Cookie } from 'ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.css']
})
export class SingleUserComponent implements OnInit {

  @ViewChild('scrollMe', { read: ElementRef })

  public scrollMe: ElementRef;

  public userInfo: any;
  public authToken: any;
  public userId: String;
  public userName: String;
  public userLists: any = [];
  public listName: String;
  public listType: String = "private";
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

  constructor(
    private appService: AppService,
    private socketService: SocketService,
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.userInfo = this.appService.getUserInfoFromLocalStorage();//getting userInfo which was stored in login component
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('userId');//getting the authtoken, receiverId, recieverName from cookies which were set in login component.
    this.userName = Cookie.get('userName');
    this.selectedListId = Cookie.get('selectedListId');
    this.selectedListName = Cookie.get('selectedListName');

    if (!this.authToken) {
      this.router.navigate(['/login']);
    }
    if (this.selectedListId && this.selectedListName) {
      this.getItems();
    }
    this.getLists();

  }

  public selectedToDoList = (listId: string, listname: string) => {
    this.selectedListId = listId;
    this.selectedListName = listname;
    Cookie.set('selectedListId', listId);
    Cookie.set('selectedListName', listname);
    this.items = [];
    this.getItems();
  }//end selectedToDoList

  public getLists = () => {
    let data: any = {};
    data.userId = this.userId;
    data.listType = "private";
    data.authToken = this.authToken;
    this.appService.getLists(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.userLists = apiResponse.data;
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

  public createList = () => {
    if (!this.listName) {
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
            Cookie.set('selectedListName', this.selectedListName);
            Cookie.set('selectedListId', this.selectedListId);
            this.toastr.success("Success", `Todo list ${data.listName} created.`);
            this.items = [];
            this.getLists();
            let data1: any = { listId: this.selectedListId, authToken: this.authToken }
            this.appService.createHistoryList(data1).subscribe(
              (apiResponse) => {
                console.log(apiResponse);
              }
            );//end subscribe
          }
        },
        (error) => {
          this.toastr.error("Some error occured");
          console.log(error);
          this.router.navigate(['/serverError']);
        }
      );//end subscribe
    }
  }//end createList 

  public deleteList = () => {
    let data: any = { authToken: this.authToken, listId: this.selectedListId }
    this.appService.deleteHistoryList(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.appService.deleteList(data).subscribe(
            (apiResponse) => {
              if (apiResponse.status == 200) {
                this.toastr.success(`ToDo List Deleted ${this.selectedListName}`);
                this.items = [];
                this.selectedListId = "";
                this.selectedListName = "";
                Cookie.set('selectedListId', "");
                Cookie.set("selectedListName", "");
                this.userLists = this.getLists();
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

  public getItems = (skipvalue?: Number) => {
    let data: any = {};
    data.listId = this.selectedListId;
    data.skip = skipvalue;
    data.authToken = this.authToken;
    this.appService.getItems(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.items = apiResponse.data
          let itemids: any[] = [];
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

  public getSubItems = (itemIds) => {
    let data: any = { itemids: itemIds.toString(), authToken: this.authToken }

    this.appService.getSubItems(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.subItems = apiResponse.data;
          for (let item of this.items) {
            item.subItems = [];
            for (let subitem of this.subItems) {
              if (subitem.itemId == item.itemId) {
                item.subItems.push(subitem);
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
          let saveItem: any = {};
          saveItem.itemId = apiResponse.data.itemId;
          saveItem.listId = this.selectedListId;
          saveItem.authToken = this.authToken;
          this.saveObjectToHistory(saveItem);
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
          let saveItem: any = {};
          saveItem.subItemId = apiResponse.data.subItemId;
          saveItem.listId = this.selectedListId;
          saveItem.authToken = this.authToken;
          this.saveObjectToHistory(saveItem);
          this.toastr.success("Success", `SubItem ${apiResponse.data.subItemName} is added to ${this.selectedListName} lists.`)
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
    if (itemName && itemStatus != undefined) {
      data.both = true;
    }
    if (!updateOnly) {
      let saveObject: any = {};
      saveObject.itemId = itemId;
      saveObject.item = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "update";
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
      saveObject.authToken = this.authToken
      this.saveObjectToHistory(saveObject);

    }

    this.appService.updateSubItem(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `SubItem updated from ${this.selectedListName} lists.`)
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
      saveObject.authToken = this.authToken
      this.saveObjectToHistory(saveObject);

    }
    let data: any = { itemId: itemId, authToken: this.authToken };
    this.appService.deleteItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `Item deleted from ${this.selectedListName} lists.`)
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end deleteItem

  public deleteSubItem = (subItemId: string, deleteOnly?: boolean) => {

    if (!deleteOnly) {
      let saveObject: any = {};
      saveObject.subItemId = subItemId;
      saveObject.subItem = true;
      saveObject.listId = this.selectedListId;
      saveObject.operationType = "delete";
      saveObject.authToken = this.authToken;
      this.saveObjectToHistory(saveObject);
    }
    let data: any = { subItemId: subItemId, authToken: this.authToken }
    this.appService.deleteSubItem(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this.getItems();
          this.toastr.info("Update", `SubItem deleted from ${this.selectedListName} lists.`)
        }
      },
      (error) => {
        this.toastr.error("Error!", "Some error occured");
        this.router.navigate(['/serverError']);
      }
    );//end subscribe
  }//end deleteSubItem

  public createHistoryForList = (listId: string) => {

    let data: any = { listId: listId, authToken: this.authToken };
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

  public saveObjectToHistory = (data: any) => {

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

  public getObjectFromHistory = (listId: string) => {

    let data: any = { listId: listId, authToken: this.authToken }
    this.appService.getObject(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          if (apiResponse.data.deletedObject) {
            if (!(apiResponse.data.deletedObject.createdBy)) {//undo the action incase of newly created object 
              if (apiResponse.data.deletedObject.subItemId) {
                this.deleteSubItem(apiResponse.data.deletedObject.subItemId, true);
              }
              else {
                this.deleteItem(apiResponse.data.deletedObject.itemId, true);
              }
            }
            else if (apiResponse.data.deletedObject.operationType == "update") {//undo the action incase of update of object
              if (apiResponse.data.deletedObject.subItemId && apiResponse.data.deletedObject.itemId) {
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

    this.pageValue++;
    this.scrollToChatTop = true;

    this.getPreviousItems();

  }//end loadPreviousChat

  public getPreviousItems: any = () => {

    let previousData = (this.items.length > 0 ? this.items.slice() : []);
    let data: any = { listId: this.selectedListId, skip: this.pageValue }
    data.authToken = this.authToken;
    this.appService.getItems(data)
      .subscribe((apiResponse) => {

        if (apiResponse.status == 200) {
          this.items = apiResponse.data.concat(previousData);
        } else {
          this.items = previousData;
        }
        let itemids: any[] = [];
        for (let item of this.items) {
          itemids.push(item.itemId);
        }
        this.getSubItems(itemids);
        this.loadingPreviousItems = false;
      }, (err) => {
        if (err.status = 500) {
          this.toastr.warning('No More Items', "Warning!");
        }
      });

  }//end getPreviousItems

  public showListName = (name: string) => {

    this.toastr.success("You are Viewing List " + name);
  }//end showGroupName

  public createItemUsingEnter: any = (event: any) => {

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.createItem();
    }


  }//end createItemUsingEnter

  public updateItemUsingEnter: any = (event: any, itemId: string) => {

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.updateItem(itemId, false, this.updateItemName);
      this.updateitem = false;
    }

  }//end updateItemUsingEnter

  public createSubItemUsingEnter: any = (event: any, itemId: string) => {

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.createSubItem(itemId);

    }

  }//end createSubItemUsingEnter

  public updateSubItemUsingEnter: any = (event: any, subItemId: string) => {

    if (event.keyCode === 13) {//13 is keycode of enter key

      this.updateSubItem(subItemId, false, this.updateSubItemName);
      this.updateitem = false;
    }

  }//end updateSubItemUsingEnter

  //method to perform undo using shortcut keys
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'z' || event.metaKey && event.key == 'z') {
      if (this.selectedListId) {
        this.getObjectFromHistory(this.selectedListId);
      }

    }

  }//end

  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          Cookie.delete('authToken');
          Cookie.delete('userId');
          Cookie.delete('userName');
          Cookie.delete('selectedListName');
          Cookie.delete('selectedListId');

          this.socketService.disconnectedSocket();
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


}
