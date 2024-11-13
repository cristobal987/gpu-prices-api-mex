import axios from 'axios'
import * as cheerio from 'cheerio';

let url_root = 'https://grupodecme.com'
let cards_url = 'https://grupodecme.com/collections/tarjetas-de-video-gamer'

async function getItemsFromGrupodecme(url){
    if(!url){ 
        url = cards_url
    }
    
    let url_list = await getPagesFromGrupodecme(url)
    if (url_list.length == 0){
        url_list.push(url)
    }

    let product_list = []
    for(let item of url_list){
        product_list = product_list.concat( await getItemsFromGrupodecmePage(item))
    }

    return product_list
}

async function getPagesFromGrupodecme(url){
    return await axios.get(url)
    .then( (response)=>{
        let url_list = []
        const html = response.data
        const $ = cheerio.load(html)
        
        url_list.push(url)
        $('ul.pagination.pagination-sm > li.page-item > a').each(function(){
            url_list.push( url_root + $(this).attr('href'))
        })
        return url_list
    }).catch((error)=>{
        console.log(error)
        return []
    })
}

async function getSKUfromItemGrupodecme(url){
    return await axios.get(url)
    .then( response => {
        const html = response.data
        const $ = cheerio.load(html)
        let array = $('p:contains("SKU")',this).text().trim().split(' ')
        return array[array.length -3]
    }).catch( (error => '-'))
}

async function getItemsFromGrupodecmePage(url){
    return await axios.get(url)
    .then( async (response)=>{
        let array_items = []
        const html = response.data
        const $ = cheerio.load(html)
        $('div.pd-item-gd').each(function(){
            let product = {
                title : $('h2.t-pro-gd > a', this).attr('data-title-cp').trim(),
                url : url_root + $('a', this).attr('href'),
                price : $('span.price-gd', this).text().replace('$','').trim(),
                stock : '-',
                sku : '-',
                web: 'grupodecme'
            }
            array_items.push(product)
        })
        
        for(let item of array_items){
            item.sku = await getSKUfromItemGrupodecme( item.url )
        }

        return array_items
    }).catch( (error)=>{
        console.log(error) 
        return []
    })
}

export { getItemsFromGrupodecme }