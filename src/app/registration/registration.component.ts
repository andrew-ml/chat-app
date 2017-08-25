import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { UserService } from '../shared';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  image = '';
  first = '111111';
  last = '222222';
  email = 'test@gmail.com';
  password = '111111';
  phone = '12345';
  address = '54321';
  language = 'english';
  username = 'test';
  gender = 'Male';
  birthday = moment().format('DD-MM-YYYY');

  constructor(
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  submit() {
    this.userService.postUser({
      picture: this.image,
      firstName: this.first,
      lastName: this.last,
      fullName: this.first + ' ' + this.last,
      email: this.email,
      password: this.password,
      phone: this.phone,
      address: this.address,
      language: this.language,
      username: this.username,
      gender: this.gender,
    }).subscribe(res => {
      if (res.success) {
        this.userService.attemptAuth({ email: this.email, password: this.password })
        .subscribe(data => this.router.navigateByUrl('/chat'));
      }
    });
  }

  changeImage($event) {
    this.readThis($event.target);
  }

  readThis(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.image = myReader.result;
    };
    myReader.readAsDataURL(file);
  }
}
