var socket = io();
var gen = document.getElementById('gen');
var saldo = document.getElementById('direccion');
var usuario = document.getElementById('usuario');
var ingreso = document.getElementById('ingreso');
var loguen = document.getElementById('loguen');
var loby = document.getElementById('loby');
var generarSaldo = document.getElementById('generarSaldo');
var juego = document.getElementById('juego');
var mono = document.getElementById('mono');
var correr = document.getElementById('correr');

var ganaste = document.getElementById('ganaste');
var perdiste = document.getElementById('perdiste');
var premio = document.getElementById('premio');
var qrcodeGanador = document.getElementById('qrcodeGanador');
var qrganador = document.getElementById('qrganador');

var presentes = document.getElementById('presentes');

var usuarios = [];

socket.on('nuevo_usuario', (data) => {
    usuarios = data;
    while(presentes.firstChild){
        presentes.removeChild(presentes.firstChild)
    }

    for(let per of data){
        const p = document.createElement('p');
        const t = document.createTextNode(per);
        p.appendChild(t);
        presentes.appendChild(p);
    }
});

socket.on('usuario_desconectado', (data) => {
    usuarios = data;
    while(presentes.firstChild){
        presentes.removeChild(presentes.firstChild)
    }

    for(let per of data){
        const p = document.createElement('p')
        const t = document.createTextNode(per)
        p.appendChild(t);
        presentes.appendChild(p)
    }
});

ingreso.addEventListener('click', ()=>{
    loguen.style.display = 'none';
    loby.style.display = 'block';
    socket.emit('nuevo_usuario', usuario.value); 
    generarSaldo.style.display = 'block';
});

gen.addEventListener('click', () => {
    socket.emit('generarQR', 'Generando QR para pagar');
});

socket.on("gen_factura", data => {
    console.log(data);
    saldo.textContent = data.payment_hash
    new QRCode(document.getElementById("qrcode"), data.payment_request);
});

socket.on("pagado", data => {
    // senial.textContent = "Pago realizado" 
    //loby.style.display = 'none' 
    generarSaldo.style.display = 'none'
    juego.style.display = 'block'
});


socket.on('termino', data => {
    juego.style.display = 'none'
    if(data == usuario.value){
        ganaste.style.display = 'block'
    }else{
        perdiste.style.display = 'block'
    }
});

premio.addEventListener('click', () => {
    socket.emit('premioQR', "");
});

socket.on('premioQR', data => {
    ganaste.style.display = 'none';
    qrganador.style.display = 'block';
    new QRCode(document.getElementById("qrcodeGanador"), data.lnurl);
});

var ctx = mono.getContext('2d');
ctx.font = "20px Arial";   


let pos=0;
correr.addEventListener('click', () => {
    pos += 2*Math.random();

    socket.emit('corriendo', {"pos": pos, "nombre": usuario.value});
});

socket.on('corriendo', (data) => {
    let mapa = new Map(data)
    console.log(mapa)

    ctx.clearRect(0, 0, mono.width, mono.height);
    for (let index = 0; index < usuarios.length; index++) {
        var user = usuarios[index];
        ctx.fillText(user, 10, 50*(index+1));
        ctx.fillText(String(Math.round(mapa.get(user))), 80, 50*(index+1));      
    }

});



