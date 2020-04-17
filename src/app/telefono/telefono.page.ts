import { Component, OnInit } from '@angular/core';
import { AuthService } from '../servicios/auth.service';
import { Router } from '@angular/router';
import { FCM } from '@ionic-native/fcm/ngx';

@Component({
  selector: 'app-telefono',
  templateUrl: './telefono.page.html',
  styleUrls: ['./telefono.page.scss'],
})
export class TelefonoPage implements OnInit {
  correo: string
  contrasena: string
  telefono
  nombre = ''
  email = ''
  password = '0'
  cajainterna = '0'
  estado = 0
  contacts = 0
  codtel = '+591'
  img = 'https://firebasestorage.googleapis.com/v0/b/aplicacion-bdcf5.appspot.com/o/user%2Fdefault.jpg?alt=media&token=773dd56e-f796-41a1-8a85-d40fe7a9693e'

  token = "324"
  constructor(
    private au: AuthService,
    private route: Router,
    private fcm: FCM
  ) { }

  ngOnInit() {

  }

  registro() {
    console.log(this.correo, this.contrasena);

    this.fcm.getToken().then(token => {
      //alert(token)
      this.au.crearusuario(this.correo, this.contrasena, token, this.cajainterna, this.codtel, this.contacts, this.estado, this.img, this.nombre, this.password, this.telefono).then(res => {
        this.route.navigate(['/tabs/tab2'])
        this.au.creocorrecto()
      })

    })
  }

}
