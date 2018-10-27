import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Shake } from '@ionic-native/shake';
import { AlertController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Platform } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';

export interface ScoreItem {
  Score: number;
  Rolls: number;
  Name: string;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private myshakability = false
  private mydice1 = 1
  private mydice2 = 1
  private myrolls = 0
  private myscore = 0
  private watch: any;
  private itemsCollection: AngularFirestoreCollection<ScoreItem>;
  items: Observable<ScoreItem[]>;

  constructor(
    public navCtrl: NavController,
    private shake: Shake,
    private alertCtrl: AlertController,
    private db: AngularFirestore,
    private platform: Platform,
    private nativeAudio: NativeAudio
  ) {

    this.nativeAudio.preloadSimple('uniqueId1', 'assets/sounds/shake.mp3').then(data => {
      console.log('audion file 1 loaded')
    }, err => {
      console.log('audio file not loaded')
    });
    this.nativeAudio.preloadSimple('uniqueId2', 'assets/sounds/tada.mp3').then(data => {
      console.log('audion file 2 loaded')
    }, err => {
      console.log('audio file not loaded')
    });

    this.itemsCollection = db.collection<ScoreItem>('items');

    try {

      if (this.platform.is('android') || this.platform.is('ios')) {

        this.watch = this.shake.startWatch(40).subscribe(() => {
          console.log('shake')
          this.roll()
        });

        this.myshakability = true
      } else {
        console.log('platform not mobile', this.platform.platforms())
      }

    } catch (error) {
      console.log('no shake shake')
    }

    this.init()

  }

  init() {
    this.mydice1 = 1
    this.mydice2 = 1
    this.myrolls = 0
    this.myscore = 0
  }

  ionViewWillLeave() {
    // https://blog.ionicframework.com/navigating-lifecycle-events/

    try {
      // this.watch.unsubscribe();
    } catch (error) {
      // we were not watching
    }
  }

  public get shakability() {
    return this.myshakability
  }

  public get rolls() {
    return this.myrolls
  }

  public get score() {
    return this.myscore
  }

  public get class() {
    return 'color' + this.myrolls
  }

  dice(num) {

    switch (num) {
      case 1:
        return this.mydice1
      case 2:
        return this.mydice2
    }
    return null

  }

  roll() {
    this.nativeAudio.play('uniqueId1', () => console.log('uniqueId1 is done playing'));
    console.log('roll');
    if (this.myrolls > 5) {
      this.init()
    }
    setTimeout(() => {
      this.myrolls++
      this.mydice1 = Math.round(Math.random() * 5) + 1;
      this.myscore = this.myscore + this.mydice1
      console.log('roll done', this.mydice1);


    })
    setTimeout(() => {
      this.mydice2 = Math.round(Math.random() * 5) + 1;
      this.myscore = this.myscore + this.mydice2
      console.log('roll done', this.mydice2);
    })
    setTimeout(() => {
      if (this.myrolls > 5) {
        this.setScore({ Score: this.myscore, Rolls: this.myrolls, Name: null })
      }
    }, 100)

  }


  setScore(score) {
    this.nativeAudio.play('uniqueId2', () => console.log('uniqueId1 is done playing'));
    console.log('score', score)
    this.presentPrompt()
  }

  setWebScore(data: any) {
    const scoreItem: ScoreItem = { Name: data.Name, Score: this.myscore, Rolls: this.myrolls }
    this.itemsCollection.add(scoreItem).then(data => {
      console.log('success added score', data)
    }).catch(err => {
      console.log('error score', err)
    })
  }

  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Hign Score!',
      inputs: [
        {
          name: 'Name',
          placeholder: 'Your Nick Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enter High Score',
          handler: data => {
            if (data) {
              console.log(data)
              this.setWebScore(data);
            }
          }
        }
      ]
    });
    alert.present();
  }

}
