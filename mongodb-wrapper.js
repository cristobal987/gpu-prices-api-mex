 import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'pcComponentsDB';

class mongoCollection{
    constructor(name, callback){
        if(!callback) callback = this.callback

        this.url = url;
        this.client = new MongoClient(this.url);
        this.dbName = dbName
        this.name = name

        this.client.connect().then(()=>{
            let db = this.client.db(this.dbName)
            this.collection = db.collection(name)
            callback(undefined, this.collection)
        }).catch((error)=>{
            callback(error, undefined)
        })
    }

    insertMany = async (data, callback)=>{
        if(!callback) callback = this.callback
        await this.connector(data, 'insertMany', callback)
    }

    find = async (selector, callback)=>{
        if(!callback) callback = this.callback
        await this.connector(selector, 'find', callback)
    }

    deleteMany = async (selector, callback)=>{
        if(!callback) callback = this.callback
        await this.connector(selector, 'deleteMany', callback)
    }

    connector = async (param, method, callback)=>{
        if(!callback) callback = this.callback

        await this.client.connect().then(async ()=>{
            let result = await this.collection[method](param)
            callback(undefined, result)
        }).catch((error)=>{
            callback(error, undefined)
        })
    }

    callback = (error, result)=>{
    }
}

export default mongoCollection