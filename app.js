const express = require("express")
const mysql= require("mysql2")
var bodyParser=require('body-parser')
var app=express()
var con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'n0m3l0',
    database:'crud'
})
con.connect();

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(express.static('public'))

app.post('/agregarUsuario',(req,res)=>{
        let nombre=req.body.nombre
        let id=req.body.id

        con.query('INSERT INTO usuario (id_usuario, nombre) VALUES (?, ?)', [id, nombre], (err, respuesta, fields) => {
            if (err) {
                console.log("Error al conectar", err);
                return res.status(500).send("Error al conectar");
            }
           
            return res.send(`<h1>Nombre:</h1> ${nombre}`);
        });
   
})

app.listen(10000,()=>{
    console.log('Servidor escuchando en el puerto 10000')
})

//fin consultar


app.get('/obtenerUsuario',(req,res)=>{
    con.query('select * from usuario', (err,respuesta, fields)=>{
        if(err)return console.log('ERROR: ', err);
        var userHTML=``;
        var i=0;

        respuesta.forEach(user => {
            i++;
            userHTML+= `<tr><td>${i}</td><td>${user.nombre}</td></tr>`;


        });

        return res.send(`<table>
                <tr>
                    <th>id</th>
                    <th>Nombre:</th>
                <tr>
                ${userHTML}
                </table>`
        );


    });
});

app.post('/borrarUsuario', (req, res) => {
    const id = req.body.id; 
    console.log("hola")
    con.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, resultado, fields) => {

        if (err) {
            console.error('Error al borrar el usuario:', err);
            return res.status(500).send("Error al borrar el usuario");
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Usuario no encontrado");
        }
        return res.send(`Usuario con ID ${id} borrado correctamente`);
    });
});

app.post('/editarUsuario', (req, res) => {
    const { id, nuevoNombre } = req.body;
    con.query(
        'UPDATE usuario SET nombre = ? WHERE id_usuario = ?',
        [nuevoNombre, id],
        (err, resultado) => {
            if (err) return res.status(500).send('Error al editar usuario');
            res.redirect('/');
        }
    );
});

app.get('/buscarUsuarioAcciones', (req, res) => {
    const { id, nombre } = req.query;
    let query = 'SELECT * FROM usuario';
    let where = [];
    let values = [];

    if (id) {
        where.push('id_usuario = ?');
        values.push(id);
    }
    if (nombre) {
        where.push('nombre LIKE ?');
        values.push('%' + nombre + '%');
    }
    if (where.length > 0) {
        query += ' WHERE ' + where.join(' AND ');
    }

    con.query(query, values, (err, resultados) => {
        if (err) return res.status(500).send('Error al buscar usuario');
        if (resultados.length === 0) return res.send('Usuario no encontrado');

        let html = '<h3>Resultados:</h3>';
        resultados.forEach(usuario => {
            html += `
                <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                    <p>ID: ${usuario.id_usuario}</p>
                    <p>Nombre: ${usuario.nombre}</p>
                    <form style="display:inline;" action="/editarUsuario" method="POST">
                        <input type="hidden" name="id" value="${usuario.id_usuario}" />
                        <input type="text" name="nuevoNombre" placeholder="Nuevo nombre" required />
                        <button type="submit">Modificar</button>
                    </form>
                    <form style="display:inline;" action="/eliminarUsuario" method="POST" onsubmit="return confirm('¿Seguro que deseas eliminar este usuario?');">
                        <input type="hidden" name="id" value="${usuario.id_usuario}" />
                        <button type="submit">Eliminar</button>
                    </form>
                </div>
            `;
        });
        res.send(html);
    });
});