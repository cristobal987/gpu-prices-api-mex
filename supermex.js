import axios from 'axios'
import * as cheerio from 'cheerio';

let url_root = 'https://www.supermexdigital.com'
let cards_url = 'https://www.supermexdigital.com/componentes/componentes-para-pc/tarjeta-de-video'

async function getItemsFromSupermex(url){
    if(!url){ 
        url = cards_url
    }
    
    let url_list = await getPagesFromSupermex(url)
    if (url_list.length == 0){
        url_list.push(url)
    }

    let product_list = []
    for(let item of url_list){
        product_list = product_list.concat( await getItemsFromSupermexPage(item))
    }

    return product_list
}

async function getPagesFromSupermex(url){
    return await axios.get(url)
    .then( async (response)=>{
        let url_list = []
        let url_next = ""
        const html = response.data
        const $ = cheerio.load(html)
        
        url_list.push(url)
        url_next = $('li.andes-pagination__button--next > a').attr('href')
        if(url_next){
            url_list = url_list.concat(await getPagesFromSupermex(url_next))
        }
        return url_list
    }).catch( onErrorCallback )
}

async function getExtradatafromItemSupermex(url){
    return await axios.get(url)
    .then( response => {
        const html = response.data
        const $ = cheerio.load(html)
        let version = $('th:contains("Versión")',this).closest('tr').children('td').text()
        if (version == undefined || version == ''){
            version = $('th:contains("Modelo")',this).closest('tr').children('td').text()
        }

        let stock = $('span.ui-pdp-buybox__quantity__available',this).text()

        return {version, stock}
    }).catch( (error => '-'))
}

async function getItemsFromSupermexPage(url){
    return await axios.get(url)
    .then( async (response)=>{
        let array_items = []
        const html = response.data
        const $ = cheerio.load(html)
        $('div.vtex-search-result-3-x-galleryItem').each(function(){
            let product = {
                title : $('span.vtex-product-summary-2-x-productBrand', this).text().trim(),
                url : url_root + $('a.vtex-product-summary-2-x-clearLink', this).attr('href'),
                price : $('span.vtex-product-price-1-x-sellingPrice.vtex-product-price-1-x-sellingPrice--summary.vtex-product-price-1-x-sellingPrice--hasListPrice.vtex-product-price-1-x-sellingPrice--summary--hasListPrice', this).text().replace('$','').trim(),
                stock : '-',
                sku : '-',
                web: 'supermex'
            }
            array_items.push(product)
        })
        
        /*for(let item of array_items){
            let extra = await getExtradatafromItemSupermex( item.url )
            item.sku = extra.version
            item.stock = extra.stock
        }*/

        return array_items
    }).catch( onErrorCallback )
}
function onErrorCallback(error){
    console.log("error al conectar con "+ url_root + ": " + error.status) 
    return []
}
export { getItemsFromSupermex }