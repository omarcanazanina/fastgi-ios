import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';

import { Contacts, Contact } from '@ionic-native/contacts/ngx';
export interface json {
  id: string
  nombre: string
  key:string
  value:string
}

export interface usu {
  cuenta: string;
  numerito: string,
  correo: string,
  nombre: string,
  id: string,
  telefono: string,
  cajabancaria: number,
  cajainterna: number,
  monto: number,
  clave: string,
  //  badge:number
}
export interface actualizado {
  id: string
  nombre: string
}
export interface cont {
  numero: string
  id: string
}
export interface ingresos {
  id: string,
  descripcion: string,
  fecha: string,
  monto: number,
  saldo: number,
  nombre: string
}
export interface transferencias {
  id: string,
  clave: string,
  dato: string,
  detalle: string,
  fecha: string,
  fechita: string,
  monto: number,
  nombre: string,
  saldo: number,
  telefono: string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tran: any;
  datito: any = [];
  uid: any;
  database: any;
  nombre: any;
  id_cajaapp = 'ZRyippkKqJIiL1Ha5PR9';
  ingresoscollection: AngularFirestoreCollection<ingresos>;
  ingresos: Observable<ingresos[]>;
  ingresosDoc: AngularFirestoreDocument<ingresos>;
  abcs: any
  constructor(
    private db: AngularFireAuth,
    private route: Router,
    public fire: AngularFirestore,
    public abase: AngularFireDatabase,
    public toastController: ToastController,
    public alertController: AlertController,
    public nav: NavController,
    private emailComposer: EmailComposer,
    private loadingController: LoadingController,
    private camera: Camera,
    private afStorage:AngularFireStorage,
    private contactos: Contacts
  ) { }

  //TODO PARA IOS
  loginusu(correo,password):Promise <any>{
    return new Promise((resolve, rejected) =>{
      this.db.auth.signInWithEmailAndPassword(correo,password).then( res =>{
        console.log(res);
        this.route.navigate(['tabs/tab2'])
        resolve(res)
    }).catch(err =>rejected(err))
    })
  }

 crearusuario(correo:string , contrasena:string, token: string,  cajainterna:string, codtel:string,contacts: number, estado: number, img: string, nombre: string, password:string, telefono: string ){
    return new Promise((resolve, reject) => {
      this.db.auth.createUserWithEmailAndPassword(correo, contrasena).then(res => {
         const uid = res.user.uid;
        this.fire.collection('user').doc(uid).set({
          uid,
          correo,
          contrasena,
          cajainterna,
          codtel,
          contacts,
          estado,
          img,
          nombre,
          password,
          telefono,
          token
        })
        resolve(res);
      }).catch(err => reject(err));
    })
  }


  login(dato: string, pass: string): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.db.auth.signInWithEmailAndPassword(dato, pass).then(usuario => {
        const id = usuario.user.uid;
        const email = usuario.user.email;
        this.datito.push(email);
        resolve(usuario);
      }).catch(err => rejected(err));
    })
  }


  //verifica si el usuario existe 
  verificausuarioexistente(telefono): Observable<any> {
    var query = ref => ref.where('telefono', '==', telefono)
    return this.fire.collection('user', query).valueChanges()
  }

  async usuarionoexiste() {
    const alert = await this.alertController.create({
      header: 'Registrese!',
      message: 'Usuario inexistente, registrese por favor',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.route.navigate(['/telefono'])
          }
        }
      ]
    });
    await alert.present();
  }

  async usuarioyaexiste() {
    const alert = await this.alertController.create({
      header: 'Registrese!',
      message: 'Usuario ya registrado, ingrese por favor',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.route.navigate(['/index2'])
          }
        }
      ]
    });
    await alert.present();
  }


  async usuarionoexiste1() {
    const alert = await this.alertController.create({
      header: 'Registrese',
      backdropDismiss: false,
      // subHeader: 'Envio Exitoso',
      message: 'Usuario inexistente primero registrese por favor.',
      buttons: ['Aceptar']

    });
    await alert.present();
  }

 
  
  //para recuperar el logueado
  pruebita() {
    var user = this.db.auth.currentUser;
    var email, uid;
    if (user != null) {
      email = user.email;
      uid = user.uid;
      return user.uid;
    }
  }

  cerrarsesion() {
    this.db.auth.signOut().then(() => {
      this.route.navigate(['/index']);
    });
  }

  //recupera la caja de la aplicacion
  recuperacajaapp(): Observable<any> {
    return this.fire.collection('cajaapp').doc(this.id_cajaapp).valueChanges()
  }
  actualizacajaapp(monto) {
    return this.fire.collection('cajaapp').doc(this.id_cajaapp).set(monto, { merge: true })
  }
 

  //actualiza token
  actualizatoken(token, id) {
    return this.fire.collection('user').doc(id).set(token, { merge: true })
  }

  //recupera datos de los usuarios
  recuperadatos() {
    return this.fire.collection('user').snapshotChanges().pipe(map(dat => {
      return dat.map(a => {
        const data = a.payload.doc.data() as usu;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  recuperaundato(usu_id: string): Observable<any> {
    return this.fire.collection('user').doc(usu_id).valueChanges()
  }
  //actualiza cajainterna del usuario
  actualizacaja(cajainterna, id) {
    return this.fire.collection('user').doc(id).set(cajainterna, { merge: true })
  }
  //regitra pin
  registrapin(pin, id) {
    return this.fire.collection('user').doc(id).set(pin, { merge: true })
  }
  //regitra correo
  registracorreo(correo, id) {
    return this.fire.collection('user').doc(id).set(correo, { merge: true })
  }
  //regitra o actualiza nombre 
  registranombre(nombre, id) {
    return this.fire.collection('user').doc(id).set(nombre, { merge: true })
  }
  //actualiza badge del usuario
  actualizarbadge(badge, id) {
    return this.fire.collection('user').doc(id).set(badge, { merge: true })
  }
  //recupera datos del usuario con el correo
  recuperaconcorreo(correo: string): Observable<any> {
    var query = ref => ref.where('correo', '==', correo)
    return this.fire.collection('user', query).valueChanges()
  }
  recuperacontoken(token: string): Observable<any> {
    var query = ref => ref.where('token', '==', token)
    return this.fire.collection('user', query).valueChanges()
  }

  recupera1ingreso(id: string, uid: string): Observable<any> {
    return this.fire.collection('/user/' + id + '/ingresos').doc(uid).valueChanges()
  }

  ordenaringresos(id: string): Observable<any> {
    this.ingresoscollection = this.fire.collection('/user/' + id + '/ingresos/', x => x.orderBy('fecha', 'desc'));
    return this.ingresos = this.ingresoscollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  recupera1egreso(id: string, uid: string): Observable<any> {
    return this.fire.collection('/user/' + id + '/egreso').doc(uid).valueChanges()
  }
  ordenaregresos(id: string): Observable<any> {
    this.ingresoscollection = this.fire.collection('/user/' + id + '/egreso/', x => x.orderBy('fecha', 'desc'));
    return this.ingresos = this.ingresoscollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }
  // alertas de aviso para el pago


  async presentToast(monto, usu) {
    const alert = await this.alertController.create({
      header: 'Fastgi',
      backdropDismiss:false,
      // subHeader: 'Envio Exitoso',
      message: 'El pago de ' + monto + ' Bs. a ' + usu + ' se realizo correctamente',
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  // // alerta img save exit
  // async imgsave() {
  //   const toast = await this.toastController.create({
  //     message: 'Se guardo en la galeria correctamente',
  //     duration: 3000,
  //     position: 'top'
  //   });
  //   toast.present();
  // }
  async passincorrecta() {
    const alert = await this.alertController.create({
      //header: 'Atención',
      message: 'Su Pin es incorrecto ',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  //alertas de aviso para la transferencia

  async transexitoso1(monto, usu) {
    const alert = await this.alertController.create({
      header: 'Fastgi',
      // subHeader: 'Envio Exitoso',
      message: 'La transferencia de ' + monto + '  Bs. a ' + usu + ' se realizo con éxito.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async ahorroinsuficiente1(ruta) {
    const alert = await this.alertController.create({
      header: 'Fastgi',
      message: 'Su ahorro es insuficiente o datos incorrectos',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Carga Saldo',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.route.navigate(ruta)
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    })
    await alert.present();
  }


  async pagodecobroexitoso(monto, usu) {
    const toast = await this.toastController.create({
      message: 'el pago de ' + monto + ' Bs. a ' + usu + ' se realizo con exito',
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async insuficiente() {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: 'Tu ahorro es insuficiente para realizar esta acción',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  //
  async haberhaber(uid) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message: 'Este es el uid' + uid,
      buttons: ['Aceptar']
    });
    await alert.present();
  }


  //alertas ingreso de monto obligatorio
  async ingresemonto() {
    const toast = await this.toastController.create({
      message: 'Debe ingresar monto correcto',
      duration: 4000,
      position: 'top'
    });
    toast.present();
  }

  //alerta para el cobro
  async datosincorrectos() {
    const alert = await this.alertController.create({
      header: 'Fastgi',
      // subHeader: 'Envio Exitoso',
      message: 'Los dos campos son obligatorios.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  //alertas de error ingreso de tarjetas **confirmacargasaldo**
  async revisedatos() {
    const toast = await this.toastController.create({
      message: 'Revise sus datos',
      duration: 4000,
      position: 'top'
    });
    toast.present();
  }
  async ingresoinvalido() {
    const alert = await this.alertController.create({
      header: 'INGRESO INVALIDO',
      // subHeader: 'Envio Exitoso',
      message: 'Revise sus datos por favor.',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  async ingresoinvalido1() {
    const alert = await this.alertController.create({
     // header: 'INGRESO INVALIDO',
      // subHeader: 'Envio Exitoso',
      message: 'Monto inválido.',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async codigoinvalido() {
    const alert = await this.alertController.create({
      header: 'INGRESO INVALIDO',
      // subHeader: 'Envio Exitoso',
      message: 'PIN incorrecto.',
      backdropDismiss: false,
      buttons: ['Aceptar']

    });
    await alert.present();
  }
  //se modifico exitosamente
  async modificardatos() {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: 'Se modifico exitosamente.',
      backdropDismiss: false,
      buttons: ['Aceptar']

    });
    await alert.present();
  }
  //usuario registrado
  async creocorrecto() {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: 'Se creo el usuario de manera satisfactoria.',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  //tarjeta registrada
  async creotarjeta(monto, usu) {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: 'La carga de ' + monto + 'Bs. de ' + usu + ' y el registro la tarjeta fue exitoso',
      backdropDismiss: false,
      buttons: ['Aceptar']

    });
    await alert.present();
  }
  //alertas actualizo contactos
  async updatecontacts() {
    const toast = await this.toastController.create({
      message: 'Se actualizó tu lista de contactos.',
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  //tarjeta registrada
  async cargocontarjeta(monto, usu) {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: '  La carga de ' + monto + ' Bs. desde ' + usu + ' fue exitoso',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  //retirodirecto
  async retiracuenta(monto, usu) {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: 'El retiro del monto a su cuenta fue exitoso',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  //tarjeta registrada
  async creocuenta(monto, usu, nombre) {
    const alert = await this.alertController.create({
      header: 'CORRECTO',
      // subHeader: 'Envio Exitoso',
      message: 'El retiro de ' + monto + 'Bs. a la cuenta ' + usu + ' de ' + nombre + ' y registro de la cuenta fue exitosa',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
  //para recuperar datos de la tarjeta
  recuperatarjeta(id: string) {
    return this.fire.collection('/user/' + id + '/tarjetas').snapshotChanges().pipe(map(dat => {
      return dat.map(a => {
        const data = a.payload.doc.data() as usu;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  recupera1tarjeta(numero: string, uid: string): Observable<any> {
    var query = ref => ref.where('numero', '==', numero)
    return this.fire.collection('/user/' + uid + '/tarjetas', query).valueChanges()
  }

  actualizacajatarjeta(monto, id) {
    return this.fire.collection('/user/' + id + '/tarjetas').doc(id).set(monto, { merge: true })
  }

  //para recuperar datos de la cuenta
  recuperacuenta(id: string) {
    return this.fire.collection('/user/' + id + '/cuentas').snapshotChanges().pipe(map(dat => {
      return dat.map(a => {
        const data = a.payload.doc.data() as usu;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }


 
 


  // confirmacion de envio de cobro
  async enviocobro(monto, usu) {
    const alert = await this.alertController.create({
      header: 'GoPay',
      // subHeader: 'Envio Exitoso',
      message: 'Se envio la petición de pago de ' + monto + '  Bs. a ' + usu + ' exitosamente.',
      backdropDismiss: false,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  //recupera las transferencias para meter en *pagarenviocobro* aun no usado
  recuperacobrostransferencias(idco, id): Observable<any> {
    var query = ref => ref.where('clave', '==', idco)
    return this.fire.collection('/user/' + id + '/cobrostransferencias', query).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }


  ordenarjson(data, key, orden) {
    return data.sort(function (a, b) {
      var x = a[key],
        y = b[key];
      if (orden === 'asc') {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      }
      if (orden === 'desc') {
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
      }
    });
  }

  //actualiza el estado de cobrosapagar *pagarenviocobro*
  actualizaestadodecobro(estado, id, id1) {
    return this.fire.collection('/user/' + id + '/cobrostransferencias').doc(id1).set(estado, { merge: true })
  }
  //recupera enviocobros por id *pagarenviocobro* 
  recuperaenviocobros(pagador, cobrador, fechita): Observable<any> {
    var query = ref => ref.where('clave', '==', pagador).where('fechita', '==', fechita)
    return this.fire.collection('/user/' + cobrador + '/cobrostransferencias', query).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }


  //actualiza el estado de enviocobro *pagarenviocobro*
  agregafechapagocobros(fecha, id, id1) {
    return this.fire.collection('/user/' + id + '/cobrostransferencias').doc(id1).set(fecha, { merge: true })
  }

  //recupera los badges por id *tab1* 
  recuperabadge(pagador, cobrador): Observable<any> {
    var query = ref => ref.where('clave', '==', pagador)
    return this.fire.collection('/user/' + cobrador + '/cobrostransferencias', query).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }
  //recupera usuario por numero
  verificausuarioActivo(numero): Observable<any> {
    var query = ref => ref.where('telefono', '==', numero)
    return this.fire.collection('user', query).valueChanges()
  }


  //ordena historial 1er pantalla
  ordenarcobrostransferencias(id: string): Observable<any> {
    this.ingresoscollection = this.fire.collection('/user/' + id + '/cobrostransferencias/', x => x.orderBy('fecha', 'asc'));
    return this.ingresos = this.ingresoscollection.snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  async datosgmail(pin, correo, telefono) {
    const alert = await this.alertController.create({
      header: 'Fastgi',
      message: '<div> Por su seguridad y respaldo se enviara los datos a su correo <strong>' + correo + '</strong><br><br></div><table><tr><td><strong>Telefono:</strong></td><td>' + telefono + '</td></tr> <tr><td><strong>Correo:</strong></td><td>' + correo + '</td></tr><tr><td><strong>Pin:</strong></td><td>' + pin + '</td></tr></table>',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Enviar',
          handler: () => {
            let email = {
              to: correo,
              cc: [],
              bcc: [],
              attachments: [],
              subject: 'Fastgi',
              body: 'MUY IMPORTANTE, SE RECOMIENDA GUARDAR SUS DATOS <br><br>' + ' ' + '<strong>Telefono:</strong>' + ' ' + telefono + '<br> ' + '<strong>Correo:</strong>' + ' ' + correo + ' <br>' + '<strong>Pin:</strong>' + ' ' + pin,
              isHtml: true
              //app: 'Gmail'
            }
            this.emailComposer.open(email);
            //modificar el estado
            //this.au.enviocorreo({ estado: 1 }, this.usuario.uid)
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }

  async loadinginicio() {
    const loading = await this.loadingController.create({
      message: 'Espere por favor...!'
    });
    await loading.present();
    return loading
  }
  // generar numero serial para el pago
  recuperacont() {
    return this.fire.collection('cont').snapshotChanges().pipe(map(dat => {
      return dat.map(a => {
        const data = a.payload.doc.data() as cont;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  actualizacontpago(numero, id) {
    return this.fire.collection('cont').doc(id).set(numero, { merge: true })
  }

  dos_decimales(cadena) {
    let expresion = /^\d+(\.\d{0,2})?$/;
    let resultado = expresion.test(cadena);
    return resultado;
  }

  async enviocorreo1(idusuario, telefonousuario) {
    const alert = await this.alertController.create({
      header: 'Muy importante!',
      message: 'PIN para realizar transacciones, CORREO para guardar sus datos.',
      backdropDismiss: false,
      inputs: [
        {
          name: 'pin',
          type: 'number',
          placeholder: 'Pin'
        }, 
        {
          name: 'correo',
          type: 'text',
          placeholder: 'Correo'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: data => {
            console.log('Confirm Ok');
            this.registrapin({ password: data.pin }, idusuario);
            this.registracorreo({ correo: data.correo }, idusuario);
            this.datosgmail(data.pin, data.correo, telefonousuario)
          }
        }
      ]
    });
    await alert.present();
  }

 //
 actualizabadge(badge, id) {
  return this.fire.collection('user').doc(id).set(badge, { merge: true })
}

  //verifica si el usuario existe 
  contarbadges(estado,uidpersona): Observable<any> {
    var query = ref => ref.where('estado', '==', estado)
    return this.fire.collection('/user/' + uidpersona + '/cobrostransferencias', query).valueChanges()
  }

  //recupera las transferencias para meter en *pagarenviocobro* aun no usado
  recuperacobrostransferencias1(idco, id,estado): Observable<any> {
    var query = ref => ref.where('clave', '==', idco).where('estado', '==', estado)
    return this.fire.collection('/user/' + id + '/cobrostransferencias', query).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }
  //recupera las transferencias para meter en *pagarenviocobro* aun no usado
  recuperacobrostransferencias2(idnologueado, idlogueado,estado): Observable<any> {
    var query = ref => ref.where('estado', '==', estado)
    return this.fire.collection('/user/' + idlogueado + '/transferencias/'+idnologueado+'/', query).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as ingresos;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }

  actualizaestados(estado, id,idusuario) {
    return this.fire.collection('/user/' + idusuario + '/cobrostransferencias').doc(id).set(estado, { merge: true })
  }

  actualizarcontacts(contacts, id) {
    return this.fire.collection('user').doc(id).set(contacts, { merge: true })
  }

  codigo(num) {
    let nuevo = num.replace("+591", "").trim()
    return nuevo
  }
  //recupera nombre del contacto para las transacciones
  recupera_nombre_contacto(telefono,uid): Observable<any> {
    var query = ref => ref.where('telefono', '==', telefono)
    return this.fire.collection('/user/' + uid + '/contactos', query).valueChanges()
  }

  deletecontact(id,uid): Promise <void> {
   return this.fire.collection('/user/'+id+'/contactostext').doc(uid).delete()
  }


takecamera(){
  const options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }
  
  return this.camera.getPicture(options).then((imageData) => {
   // imageData is either a base64 encoded string or a file URI
   // If it's base64 (DATA_URL):
  let base64Image = 'data:image/jpeg;base64,' + imageData;
  return base64Image
  });
}

  takeGalley(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    return this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
    let base64Image = 'data:image/jpeg;base64,' + imageData;
    return base64Image
    });
  }

    // subir imagen base 64
    uploadImgB64(path: string, imageB64): Promise<any> {
      return new Promise((resolve, reject) => {
        let ref = this.afStorage.ref(path)
        let task = ref.putString(imageB64, 'data_url');
        task.snapshotChanges().pipe(
          finalize(() => {
            ref.getDownloadURL().subscribe(data => {
              console.log(data);
              resolve(data)
            })
          })
        )
          .subscribe()
      });
    }
    async loading() {
      const loading = await this.loadingController.create({
        message: 'Espere por favor...',
        duration: 2000
      });
      await loading.present();
      return loading;
    }

    
    actualizarimg(image, id) {
      return this.fire.collection('user').doc(id).set(image, { merge: true })
    }
//**  IMAGENES*/
    //reducir imagen base64
   reducirImagen(base64) {
		return this.generateFromImage(base64, 600, 600, 1)
			.then(data => {
				//this.smallImg = data;
				//this.smallSize = this.getImageSize(this.smallImg);
				//return { base64: data, size: this.getImageSize(this.smallImg), blob: this.dataURLtoBlob(data) }
        //return this.dataURLtoBlob(data)
        return data
			});
  }
  //imagen resize
	 generateFromImage(img, MAX_WIDTH: number = 1025, MAX_HEIGHT: number = 1025, quality: number = 1): Promise<string> {
		return new Promise((resolve, reject) => {

			var canvas: any = document.createElement("canvas");
			var image = new Image();

			image.onload = () => {
				var width = image.width;
				var height = image.height;

				if (width > height) {
					if (width > MAX_WIDTH) {
						height *= MAX_WIDTH / width;
						width = MAX_WIDTH;
					}
				} else {
					if (height > MAX_HEIGHT) {
						width *= MAX_HEIGHT / height;
						height = MAX_HEIGHT;
					}
				}
				canvas.width = width;
				canvas.height = height;
				var ctx = canvas.getContext("2d");

				ctx.drawImage(image, 0, 0, width, height);

				// IMPORTANT: 'jpeg' NOT 'jpg'
				var dataUrl = canvas.toDataURL('image/jpeg', quality);

				resolve(dataUrl)
			}
			image.src = img;
		})
  }
  //guardar contactos en text

  codigoiphone(num) {
    let nuevo = num.replace(" ", "").trim()
    let nuevo1 = nuevo.replace("(", "").trim()
    let nuevo2 = nuevo1.replace(")", "").trim()
    let nuevo3 = nuevo2.replace("-", "").trim()
  return nuevo3
}

  guardarcontactos(id_usuario) {
    let options = {
      filter: '',
      multiple: true,
      hasPhoneNumber: true
    }
    this.contactos.find(['*'], options).then((contactos: Contact[]) => {
      const aux: any = []
      for (let item of contactos) {
       let nrotelefono = this.codigoiphone(this.codigo(item.phoneNumbers[0].value))
        aux.push({'nombre': item.name.formatted , 'telefono' : nrotelefono})
      }
      this.fire.collection('/user/' + id_usuario + '/contactostext').add({
        key: 'contactstext',
        value: JSON.stringify({
          todo: aux
        })
      })

    })
  }


//
  contactosprueba(uid:string) {
    return this.fire.collection('/user/'+uid+'/contactostext').snapshotChanges().pipe(map(dat => {
      return dat.map(a => {
        const data = a.payload.doc.data() as json;
        data.id = a.payload.doc.id;
        return data;
      })
    }))
  }
  

// recuperar nombres de =l contactostext
  recupera_nombre_contactstext(usuario_id, nro_telefono){
  return  this.contactosprueba(usuario_id).subscribe(dat =>{
      const a  = JSON.parse(dat[0].value)
      const b = a.todo
      for (let i = 0; i < b.length; i++) {
        const element = b[i];
      if(element.telefono == nro_telefono){
       
        console.log('es este'+ JSON.stringify(element));
        return element.nombre
      }
      }
    })
  } 


  
  
}



