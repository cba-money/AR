import { EventEmitter } from "events";

import {v4 as uuidv4} from 'uuid';

import fs from 'fs/promises';
import path from 'path';

import { slugify } from "./../util/main.js";

import { DatabaseRecord, DatabaseTable } from "./util.js";

async function checkIfFileExists(path: string): Promise<boolean> {
  try {
    // F_OK flag tests for the presence of the file
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export class JsonDatabase extends EventEmitter {
    private dbRootLocation: string;

    constructor(rootLocation: string){
        super();
        this.dbRootLocation = rootLocation;
        //create root if one does not exist
        if (!fs.access(this.dbRootLocation)) {
            fs.mkdir(this.dbRootLocation, { recursive: true });
        }
    }

    public stringifyRecord(data: any){
        const stringifiedString = JSON.stringify(data, null, 2);
        return stringifiedString;
    }

    public async createTable(tableName: string, indexData?: any){
        const tableSlug = slugify(tableName);
        const tableFolderLocation = path.join(
            this.dbRootLocation,
            tableSlug
        );
        const tableExists = await checkIfFileExists(tableFolderLocation);
        //return if table slug already exists
        if(tableExists){
            return;
        }
        //create table if one does not exist
        fs.mkdir(tableFolderLocation, { recursive: true });

        const databaseTableIndex: DatabaseTable = {
            slug: tableSlug,
            displayName: tableName,
            indexData: indexData,
            createdAt: Date.now(),
        }

        const tableIndexLocation = path.join(
            tableFolderLocation,
            'index.json'
        );
        const tableIndexData = this.stringifyRecord(databaseTableIndex);

        try{
            await fs.writeFile(tableIndexLocation, tableIndexData, 'utf-8');
            this.emit("created:table", {
                tableName,
                tableSlug,
                indexData
            });
            return databaseTableIndex;
        } catch (error){
            return;
        }
    }

    public async insert(dbTableSlug: string, data: any, dbRecordId?: string){
        let fileName = '';
        if(!dbRecordId) fileName = 'index';
        if(dbRecordId !== undefined && typeof dbRecordId === "string") fileName = dbRecordId;

        if(fileName === "") return;

        //Create new record
        const entryId = uuidv4();
        const fullFilePath = path.join(
            this.dbRootLocation,
            dbTableSlug,
            `${fileName}.json`
        );

        const databaseEntryObject:DatabaseRecord<typeof data> = {
            id: entryId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            data: data
        }
        const databaseEntryData = this.stringifyRecord(databaseEntryObject);

        try{
        await fs.writeFile(fullFilePath, databaseEntryData, 'utf-8');
        this.emit("created:row", {
            dbTableSlug,
            dbRecordId,
            data
        });
        return true;
    } catch(error){
        return false;
    }
    }

    public async update(
        collection: string,
        id: string,
        changes: any
    ){
        this.emit("updated", {
            collection,
            id,
            changes
        });
    }

    public dalete(){
        
    }

    public find(){

    }

    public async findById(tableSlug: string, recordId: string){
        const tableFolderLocation = path.join(
            this.dbRootLocation,
            tableSlug
        );
        const tableExists = await checkIfFileExists(tableFolderLocation);
        if(!tableExists) return;

        const recordFilePath = path.join(
            tableFolderLocation,
            `${recordId}.json`
        );
        
        try{
            const rawData = await fs.readFile(recordFilePath, 'utf-8');
            const record: DatabaseRecord<any> = JSON.parse(rawData);
            return record;
        } catch (error){
            return false;
        }
        
    }

    public findAll(){

    }

    public exists(){

    }

    public count(){

    }

    public clear(){

    }

}