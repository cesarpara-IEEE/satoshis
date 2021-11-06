import fetch from 'node-fetch';
import express from 'express';
import {Server} from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

async function bal() {
  const url = 'https://legend.lnbits.com/api/v1/wallet'
  let response = await fetch(url, { method : 'GET',
                              headers: {'X-Api-Key': '3ade9cd3cbc74a1db618a9be1fab8a51'}
                            })
  let data = await response.json();
  //console.log(data);
  return data.balance; 
}

async function factura(){
  const url2 = 'https://legend.lnbits.com/api/v1/payments'
  const body = {"out": false, "amount": 20, "memo": "Rasec"}
  let response = await fetch(url2, 
                            { method: 'POST',
                              body: JSON.stringify(body),
                              headers: {'X-Api-Key'   : "3ade9cd3cbc74a1db618a9be1fab8a51", 
                                        'Content-Type': 'application/json'}
                            })
  let data = await response.json();                    
  return data;
}


async function check_pay(hash){
  const url = 'https://legend.lnbits.com/api/v1/payments/' + hash
  let response = await fetch( url, { method : 'GET',
                        headers: {'X-Api-Key': '3ade9cd3cbc74a1db618a9be1fab8a51'}
                      });
  let data = await response.json();
  return data 
}

async function premio(monto){
  const url = 'https://legend.lnbits.com/withdraw/api/v1/links'
  const body = {"title": "GANASTE", 
                "min_withdrawable": monto, 
                "max_withdrawable": monto,
                "uses":1, 
                "wait_time": 1, 
                "is_unique": true}

  let response = await fetch(url, 
                            { method: 'POST',
                              body: JSON.stringify(body),
                              headers: {'X-Api-Key'   : "25d22e160dac4687b099cf8f503bc69d",
                                        'Content-Type': 'application/json'}
                            })
  let data = await response.json();                    
  return data;
}


app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);

/* app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('index.ejs');
}); */

const server = app.listen(app.get('port'), () => {
  console.log("Server on port 3000")
})

const io = new Server(server);

const usuarios = new Set();
let corredores = new Map();
let num_p = 0;

io.on('connection', socket => {
  console.log("Conectado con socket" + " " + socket.id)

  socket.on('nuevo_usuario', (data) => {
    socket.usuarioID = data;
    usuarios.add(data);
    io.emit('nuevo_usuario', [...usuarios]);
  });

  socket.on('disconnect', () => {
    console.log("Usuario desconectado");
    usuarios.delete(socket.usuarioID);
    io.emit('usuario_desconectado', [...usuarios]);
  });

  socket.on('generarQR', async (msg) => {
    console.log('message: ' + msg);
    let valor = await factura() 
    //console.log(valor)
    socket.emit('gen_factura', valor);

    async function pagado(){
      let condition = await check_pay(valor.payment_hash);
      if (condition.paid) {
        socket.emit('pagado', 'cancelado');
        num_p += 1;
        return 0;
      }
      setTimeout(pagado, 1000);
    }
    let c = await pagado()
  });

  socket.on('corriendo', (data) => {
    if (data.pos > 50) {
      io.emit('termino', data.nombre);
    }else {
      corredores.set(data.nombre, data.pos);
      io.emit('corriendo', [...corredores]);
    }
  });


  socket.on('premioQR', async data => {
    // console.log("Generar QR premio")
    let valor = await premio(20*num_p);
    num_p = 0;
    // console.log(valor)
    socket.emit('premioQR', valor)
  });

});
















