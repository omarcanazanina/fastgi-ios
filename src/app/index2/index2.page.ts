import { Component, OnInit } from '@angular/core';
import { AuthService } from '../servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index2',
  templateUrl: './index2.page.html',
  styleUrls: ['./index2.page.scss'],
})
export class Index2Page implements OnInit {
  constructor(private au: AuthService,
    private router:Router
  ) { }
  correo
  password
  ngOnInit() {
  
  }

  ingresar(){
    this.au.loginusu(this.correo,this.password).then(res =>{
      this.router.navigate(['/tabs/tab2'])
    }).catch(err => alert('los datos son incorrectos o usuario no existe'))
  }

}