import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
//for cookies
import { Cookie } from 'ng2-cookies/ng2-cookies';


@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {

  public authToken: string;

  constructor(
    private appService: AppService,
    private socketService: SocketService,
    public _route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {

    this.authToken = Cookie.get('authToken');
    if (!this.authToken) {
      this.router.navigate(['/login']);
    }
  }

  public logout = () => {

    this.appService.logout().subscribe(
      (apiResponse) => {
        if (apiResponse.status === 200) {
          localStorage.clear();
          Cookie.delete('authToken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          localStorage.clear();
          this.socketService.disconnectedSocket();
          this.socketService.exitSocket();
          this.router.navigate(['/login']);
        } else {
          this.toastr.error(apiResponse.message)
          this.router.navigate(['/serverError']);
        } // end condition
      },
      (err) => {
        this.toastr.error('Server error occured')
        this.router.navigate(['/serverError']);
      });

  }//end logout
}
