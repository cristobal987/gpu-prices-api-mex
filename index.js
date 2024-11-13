import express from 'express'
import { getItemsFromCyberpuerta } from './cyberpuerta.js'
//import { gpus } from './gpus-collection.js'
import { getItemsFromGrupodecme } from './grupodecme.js'
import { getItemsFromMercadolibre } from './mercadolibre.js'
import { getItemsFromSupermex } from './supermex.js'

// Definiciones
const PORT = process.env.PORT || 8000
const app = express()
var products = []

const logError = msn => {
    console.log(msn)
}

const concatArray = (array1, array2)=>{
    let len = array2.length

    for(let i = 0; i < len; i ++){
        array1.push(array2[i])
    }
    return array1
}

// loader
function Load(){
    console.log("buscando productos...")
    getItemsFromCyberpuerta().then( cyberpuerta => {
        products = concatArray(products, cyberpuerta)
        console.log("cyberpuerta " + cyberpuerta.length)
    }).catch( logError )

    getItemsFromGrupodecme().then( decme => {
        products = concatArray(products, decme)
        console.log("decme " + decme.length)
    }).catch( logError )

    getItemsFromSupermex().then(supermex => {
        products = concatArray(products, supermex)
        console.log("supermex " + supermex.length)
    }).catch( logError )

    getItemsFromMercadolibre().then( mercadolibre => {
        products = concatArray(products, mercadolibre)
        console.log("mercadolibre " + mercadolibre.length)
    }).catch( logError )

}

function routineLoader(){
    /// first load
    Load()
    /// actual routine
    setInterval(Load,1800000)
}

function gpusFinderArray(name){
    if(name){
        return products.filter( item => item.web == name)
    }
    return products
}

// Get

app.get('/', (req, res)=>{
    res.json(`Bienvenidos a mi API de precios de GPU: /gpus, /mercadolibre, /grupodecme, /cyberpuerta, /supermex`)
})

app.get('/gpus', (req, res)=>{
    res.json(gpusFinderArray())
})

app.get('/cyberpuerta', (req, res)=>{
    res.json(gpusFinderArray('cyberpuerta'))
})

app.get('/grupodecme', (req, res)=>{
    res.json(gpusFinderArray('grupodecme'))
})

app.get('/supermex', (req, res)=>{
    res.json(gpusFinderArray('supermex'))
})

app.get('/mercadolibre', (req, res)=>{
    res.json(gpusFinderArray('mercadolibre'))
})

// Listen

app.listen(PORT, ()=> console.log(`Server running on PORT: ${PORT}`))

// loader

routineLoader()

