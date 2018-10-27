import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  roll () {
    const randomdice=Math.round(Math.random()*5);
    alert (randomdice)
  }

}
