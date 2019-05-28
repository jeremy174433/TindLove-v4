import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PeoplesService } from '../../services/peoples-service/peoples.service';
import { HomepageService } from '../../services/crud/homepage.service';
import { DetailsPage } from '../details/details.page';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  api = this.peoplesService.getPeoples();
  apiByM = this.peoplesService.getByGenderM();
  apiByF = this.peoplesService.getByGenderF();
  data: any;
  private peoples = [];
  public lookingForGender;

  constructor(
    private peoplesService: PeoplesService,
    private homepageService: HomepageService,
    private modalCtrl: ModalController) { 
      
      this.displayData();
      this.displayUsers();
  }

  ngOnInit() { }

  // Disable back button on tabs page to not return on sign-in page after user authentification
  ionViewCanLeave() {
    return false;
  }

  ionViewWillEnter() {
    // Skeleton screen
    setTimeout(() => {
      this.data = {};
    }, 2000);
  }

  // Call API
  displayData() {
    const userID = firebase.auth().currentUser.uid;
    firebase.firestore().doc('userProfile/' + userID).get()
    .then((lookingForGenderSnapshot) => {
      this.lookingForGender = lookingForGenderSnapshot.get('lookingForGender');
      console.log(this.lookingForGender);
      if(this.lookingForGender === 'All') {
        console.log('all');
      }
      else if(this.lookingForGender === 'Male') {
        console.log('male');
      }
      else if(this.lookingForGender === 'Female') {
        console.log('female');
      }
    });

    this.api
    .subscribe(
      (data) => {
        // Success
        this.peoples = data['results'];
      },
      (error) => {
        console.error(error);
      }
    ).unsubscribe;
  }

  // Display userProfile
  displayUsers() {
    console.log('display users data');
    this.homepageService.getUsersData();
  }

  // Display details page modal
  async detailsPeople(people) {
    this.peoplesService.setPeople(people); // Retrieve data
    const modal = await this.modalCtrl.create({
      component: DetailsPage,
      componentProps: { people: people }
    });
    return await modal.present();
  }

  // Pull to refresh
  doRefresh(event) {
    setTimeout(() => {
      this.displayData();
      event.target.complete();
    }, 500);
  }
  
  // Infinite scroll
  loadMore(event) {
     this.api
     .subscribe(
      (data) => {
        // Success
        for(const peoples of data['results']) {
          this.peoples.push(peoples);
        }
        event.target.complete();
      },
      (error) => {
        console.error(error);
      }
    ).unsubscribe;
  }
  
}