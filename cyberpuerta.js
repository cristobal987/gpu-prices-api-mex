import axios from 'axios'
import * as cheerio from 'cheerio';

let url_root = 'https://www.cyberpuerta.mx/Computo-Hardware/Componentes/Tarjetas-de-Video/'

async function getItemsFromCyberpuerta(url){
    if(!url){ 
        url = url_root
    }

    let url_list = await getPagesFromCyberpuerta(url)
    if (url_list.length == 0){
        url_list.push(url)
    }

    let product_list = []
    for(let item of url_list){
        product_list = product_list.concat( await getItemsFromCyberpuertaPage(item))
    }
    return product_list
}

async function getPagesFromCyberpuerta(url){
    return await axios.get(url)
    .then( (response)=>{
        let url_list = []
        const html = response.data
        const $ = cheerio.load(html)
        $('div#emlistpager > div > a.page').each(function(){
            url_list.push($(this).attr('href'))
        })
        return url_list
    }).catch((error)=>{
        console.log(error)
        return []
    })
}

async function getItemsFromCyberpuertaPage(url){
    return await axios.get(url)
    .then( (response)=>{
        let array_items = []
        const html = response.data
        const $ = cheerio.load(html)
        $('ul#productList > li').each(function(){
            let product = {
                title : $('a.emproduct_right_title', this).text().trim(),
                url :  $('a.emproduct_right_title', this).attr('href'),
                price : $('label.price', this).text().replace('$','').trim(),
                stock : $('div.emstock > span', this).text().trim(),
                sku : $('div.emproduct_right_artnum',this).text()?.replace('Art: ','').trim(),
                web: 'cyberpuerta'
            }
            array_items.push(product)
        })
        return array_items
    }).catch( (error)=>{
        console.log(error) 
        return []
    })
    
}

export { getItemsFromCyberpuerta }