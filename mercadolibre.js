import axios from 'axios'
import * as cheerio from 'cheerio';

let url_root = 'https://computacion.mercadolibre.com.mx/'
let cards_url = 'https://computacion.mercadolibre.com.mx/componentes-pc-tarjetas-video/_Tienda_all#applied_filter_id%3Dofficial_store%26applied_filter_name%3DTiendas+oficiales%26applied_filter_order%3D9%26applied_value_id%3Dall%26applied_value_name%3DSolo+tiendas+oficiales%26applied_value_order%3D1%26applied_value_results%3D255%26is_custom%3Dfalse'

async function getItemsFromMercadolibre(url){
    if(!url){ 
        url = cards_url
    }

    let url_list = await getPagesFromMercadolibre(url)
    if (url_list.length == 0){
        url_list.push(url)
    }

    let product_list = []
    for(let item of url_list){
        product_list = product_list.concat( await getItemsFromMercadolibrePage(item))
    }

    return product_list
}

async function getPagesFromMercadolibre(url){
    return await axios.get(url)
    .then( async (response)=>{
        let url_list = []
        let url_next = ""
        const html = response.data
        const $ = cheerio.load(html)
        
        url_list.push(url)
        url_next = $('li.andes-pagination__button--next > a').attr('href')
        if(url_next){
            url_list = url_list.concat(await getPagesFromMercadolibre(url_next))
        }
        return url_list
    }).catch( onErrorCallback )
}

async function getExtradatafromItemMercadolibre(url){
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

async function getItemsFromMercadolibrePage(url){
    return await axios.get(url)
    .then( async (response)=>{
        let array_items = []
        const html = response.data
        const $ = cheerio.load(html)
        $('ol.ui-search-layout > li.ui-search-layout__item').each(function(){
            let product = {
                title : $('h2.ui-search-item__title', this).text().trim(),
                url : $('a.ui-search-item__group__element.ui-search-link', this).attr('href'),
                price : $('div.ui-search-price.ui-search-price--size-medium > div.ui-search-price__second-line > span.price-tag.ui-search-price__part > span.price-tag-amount > span.price-tag-fraction', this).text().trim(),
                stock : '-',
                sku : '-',
                web: 'mercadolibre'
            }
            array_items.push(product)
        })
        
        for(let item of array_items){
            let extra = await getExtradatafromItemMercadolibre( item.url )
            item.sku = extra.version
            item.stock = extra.stock
        }

        return array_items
    }).catch( onErrorCallback )
}
function onErrorCallback(error){
    console.log("error al conectar con "+ url_root + ": " + error.status) 
    return []
}
export { getItemsFromMercadolibre }