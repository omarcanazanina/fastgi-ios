import { Component, OnInit } from '@angular/core';
import { LoadingController} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})

export class IndexPage implements OnInit {
  
  constructor(
    private loadingController: LoadingController,
    private router: Router

  ) { }
  //registro numero
  usuario = {
    uid: ""
  }
  result='ShFT2jNNpadqJXA2jYevAoZM1sH2'
  ngOnInit() {

  }

  //logueo
  logueo() {
      this.router.navigate(['/index2'])
  }

  //registrarse
  registro() {
    this.router.navigate(['/telefono'])
  }
  
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: "Guardando"
    });
    await loading.present();
    return loading
  }
}
