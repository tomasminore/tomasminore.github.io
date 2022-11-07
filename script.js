//Lista de telas disponibles y su precio
const stockTelas = [
    { id: 1, tela: "Tropical", precio: 1690 },
    { id: 2, tela: "Gruesa", precio: 1920 },
    { id: 3, tela: "Fina", precio: 1690 },
    { id: 4, tela: "Propia", precio: 410 },
    { id: 5, tela: "Papel", precio: 280 }];

//Uso de fetch.
const lista = document.querySelector("#lista")
fetch("/data.json")
    .then((res) => res.json())
    .then((data) => {
        data.forEach((producto) => {
            const div = document.createElement("div")
            div.innerHTML = `
        <h4>${producto.tela}</h4>
        <h5>$${producto.precio}</h5>
        `
            lista.append(div)
        })
    })

const cotizarForm = document.querySelector('#cotizarForm');
const metrosInput = document.querySelector('#metrosInput');
const telaSeleccionada = document.querySelector('#telaSeleccionada');
const inputProteccion = document.querySelector("#proteccion")
const inputConfeccion = document.querySelector("#confeccion")
const inputPleno = document.querySelector("#pleno")
const inputCorte = document.querySelector("#corte")
const btnCotizar = document.querySelector('#btnAlert');
const mostrarResultado = document.querySelector('#mostrarResultado');
const mostrar = document.querySelector('#mostrar')

//Funcion que recibe el nombre de una tela, la busca dentro del array y devuelve el objeto que contenga ese nombre de tela.
const buscarTela = (nombre) => {
    let telaEncontrada = stockTelas.find(tela => tela.tela == nombre);
    return telaEncontrada;
}

//Si se selecciona una tela propia se pregunta si esa tela requiere proteccion
telaSeleccionada.addEventListener("change", (e) => {
    if (e.target.value == "Propia") {
        inputProteccion.innerHTML = ''
        inputPleno.innerHTML = '';
        inputProteccion.innerHTML = ''
        inputCorte.innerHTML = '';
        let proteccion = document.createElement(`div`)
        proteccion.innerHTML = ` <div>
        <label>¿Su tela necesita papel de proteccion?</label><br>
        <input type="Radio" value="si" name="proteccion">Si
        <input type="Radio" value="no" name="proteccion">No
        </div> `
        inputProteccion.appendChild(proteccion)
    }
    //Si se selecciona cualquier tela se pregunta si el trabajo necesita confeccion o si se selecciona papel se pregunta si el diseño es pleno
    if (e.target.value !== "Papel") {
        inputConfeccion.innerHTML = ''
        inputPleno.innerHTML = '';
        inputCorte.innerHTML = '';
        let confeccion = document.createElement(`div`)
        confeccion.innerHTML = ` <div>
            <label>¿El trabajo va a necesitar confeccion?</label><br>
            <input type="Radio" value="si" name="confeccion">Si
            <input type="Radio" value="No" name="confeccion">No
            </div> `
        inputConfeccion.appendChild(confeccion)
    } else {
        inputPleno.innerHTML = '';
        inputCorte.innerHTML = '';
        inputConfeccion.innerHTML = ''
        inputProteccion.innerHTML = ''
        let pleno = document.createElement(`div`)
        pleno.innerHTML = ` <div>
        <label>¿El diseño es de un solo color pleno?</label><br>
        <input type="Radio" value="si" name="pleno">Si
        <input type="Radio" value="no" name="pleno">No
        </div> `
        inputPleno.appendChild(pleno)
    }
})
//Si el trabajo va sin confeccion se pregunta si necesita corte
inputConfeccion.addEventListener("click", (e) => {
    if (e.target.value == "No") {
        inputCorte.innerHTML = '';
        inputPleno.innerHTML = '';
        let corte = document.createElement(`div`)
        corte.innerHTML = ` <div>
        <label>¿El trabajo necesita corte?</label><br>
        <input type="Radio" value="si" name="corte">Si
        <input type="Radio" value="no" name="corte">No
        </div> `
        inputCorte.appendChild(corte)
    }
})

//Aca se crea el historial de presupuestos
class Presupuesto {
    constructor(metros, tela, confeccion, proteccion, corte, pleno, precio) {
        this.metros = metros
        this.tela = tela
        this.confeccion = confeccion
        this.proteccion = proteccion
        this.corte = corte
        this.pleno = pleno
        this.precio = precio
    }
}

//Aqui se realizan todas las operaciones, obtengo los valores de los input, select y radio y luego calculo la cotizacion
btnCotizar.addEventListener('click', (e) => {
    e.preventDefault();
    let metros = parseInt(metrosInput.value);

    //Habiendo seleccionado la tela que quiere el cliente se la busca en el array con la funcion.
    let nombreTela = telaSeleccionada[telaSeleccionada.selectedIndex].value;
    let telaElegida = buscarTela(nombreTela);

    //Aca le doy el valor a cada agregado
    let costoConfeccion = 0;
    if (nombreTela !== "Papel") {
        for (item of cotizarForm.confeccion) {
            if (item.checked) {
                if (item.value == "si") {
                    costoConfeccion = 130;
                } else { costoConfeccion = 0 }
                break;
            }
        }
    } else { costoConfeccion = 0 }
    let costoProteccion = 0;
    if (nombreTela == "Propia") {
        for (item of cotizarForm.proteccion) {
            if (item.checked) {
                if (item.value == "si") {
                    costoProteccion = 110;
                } else { }
                break;
            }
        }
    }
    let costoPleno = 0;
    if (nombreTela == "Papel") {
        for (item of cotizarForm.pleno) {
            if (item.checked) {
                if (item.value == "si") {
                    costoPleno = 15;
                } else { }
                break;
            }
        }
    }
    let costoCorte = 0;
    if (nombreTela != "Papel") {
        if (costoConfeccion == 0) {
            for (item of cotizarForm.corte) {
                if (item.checked) {
                    if (item.value == "si") {
                        costoCorte = 190;
                    } else { }
                    break;
                }
            }
        }
    }
    let subtotal = telaElegida.precio + costoConfeccion + costoProteccion + costoCorte + costoPleno;
    let precioFinal = metros * subtotal;

    let final = document.createElement(`div`)
    mostrarResultado.appendChild(final)
    Swal.fire({
        title: 'Info',
        text: `El presupuesto estimado para su trabajo es: $${precioFinal} mas IVA`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    })

    //Registro de los presupuestos solicitados por el usuario y se sube al local storage

    const guardarPresupuesto = new Presupuesto(`${metros}`, `${nombreTela}`, `${costoConfeccion}`, `${costoProteccion}`, `${costoCorte}`, `${costoPleno}`, `${precioFinal}`)
    const registroPresupuestos = [];
    registroPresupuestos.push(guardarPresupuesto)
    const registroJSON = JSON.stringify(registroPresupuestos)
    localStorage.setItem("registro Presupuesto", registroJSON)

    //Traemos del local storage la info para que aparezca el historial

    let registro = localStorage.getItem('registro Presupuesto')
    let mostrarRegistro = document.createElement(`div`)
    mostrarRegistro.innerHTML = `<div>
    <h3>Historial de presupuestos</h3></div>
    <div class="mostrar">
    <p><strong>Metros:</strong>${guardarPresupuesto.metros}</p>
    <p><strong>Tela:</strong>${guardarPresupuesto.tela}</p>
    <p><strong>Confecion:</strong>${guardarPresupuesto.confeccion}</p>
    <p><strong>Proteccion:</strong>${guardarPresupuesto.proteccion}</p>
    <p><strong>Corte:</strong>${guardarPresupuesto.corte}</p>
    <p><strong>Pleno:</strong>${guardarPresupuesto.pleno}</p>
    <p><strong>Precio:</strong>${guardarPresupuesto.precio}</p>
    </div>`
    mostrar.appendChild(mostrarRegistro)
})