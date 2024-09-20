import { ReactiveController, ReactiveControllerHost } from 'lit';

export type DataRow = Record<string, any>;
export type DataRows = Array<DataRow>;
export type AggOperation = 'max' | 'min' | 'count' | 'mean';
export type AggConfig = Record<string,AggOperation>;
export type GroupsIdentifier = Record<string, any>;
export type GroupBy = Array<string>;

export type ProcessControllerHost = ReactiveControllerHost & {data:DataRows}

export class ProcessController implements ReactiveController {
    private host: ProcessControllerHost;
    private nestedObject:any;
    public table: DataRows;
    private idIdx:number = -1;

    constructor(host: ProcessControllerHost) {
        this.host = host;
        host.addController(this);
    }

    hostConnected() {
    }

    hostDisconnected() {
    }

    groupByKeys(elements:DataRows, keys:GroupBy) {
        return elements.reduce((result, element) => {
          let group = result;
          keys.forEach((key, index) => {
            const keyValue = element[key];
            if (!group[keyValue]) {
              group[keyValue] = index === keys.length - 1 ? [] : {};
            }
            group = group[keyValue];
          });
          group.push(element);
          return result;
        }, {});
    }
        
    countObjectsAtEachLevel(nestedObject:any, keys:GroupBy) {
        const result:any = {};
      
        function recurse(obj:any, level:number){ 
          let col = keys[level];
          if (!result[col]) {
            result[col] = 0;
          }
          result[col] += 1;
      
          for (const key in obj){
            if (typeof obj[key] === 'object' && obj[key] !== null && level+1<keys.length) {
              recurse(obj[key], level + 1);
            }
          }
        }
      
        recurse(nestedObject, 0);
        return result;
    }
      
    aggregateRows(nestedObject:any, agg:AggConfig){
        let rows:DataRows = []
      
        function recurse(obj:any){
          if(Array.isArray(obj)){
            rows = rows.concat(obj);
          }
      
          for(let key in obj){
            if(typeof obj[key]==='object' && obj[key]!==null) recurse(obj[key]);
          }
        }
        recurse(nestedObject)
       
        const line:Record<string,any> = {}
        for(const [key, value] of Object.entries(agg)){
          line[key] = this.apply(key, value, rows);
        }
        return line;
    }
      
    apply(key:string, aggFunc:AggOperation, rows:DataRows){
        switch(aggFunc){
          case "mean":
            return this.mean(rows, key);
          case "max":
            return this.max(rows, key);
          case "min":
            return this.min(rows, key);
          default:
            return this.count(rows);
        }
    }
      
    count(arr:DataRows) {
        return arr.length;
    }
      
    mean(arr:DataRows, key:string) {
        return arr.reduce((sum, item) => sum + item[key], 0) / arr.length;
    }
      
    max(arr:DataRows, key:string) {
        return Math.max(...arr.map(item => item[key]));
    }
      
    min(arr:DataRows, key:string) {
        return Math.min(...arr.map(item => item[key]));
    }
      
    buildLines(nestedObject:any, keys:GroupBy, agg:AggConfig, root:boolean=false){
        let rows:DataRows = [];
      
        if(Array.isArray(nestedObject)){
          rows = JSON.parse(JSON.stringify(nestedObject))
            .map((row:DataRow)=>{return {...row, ctr_expansible:false}});
        }else if(typeof nestedObject == 'object' && nestedObject!==null){
          for(const [key, value] of Object.entries(nestedObject)){
            let line:Record<string, any> = {};
            line = {...this.countObjectsAtEachLevel(value, keys)};
            line[keys[0]] = key;
            line = {...this.aggregateRows(value, agg), ...line, ctr_expansible:true};
            if(root){
                this.idIdx+=1;
                line['idIdx'] = this.idIdx;
            }
            rows.push(line);
          }
        }
        return rows;
    }
      
    getGroup(groupID:GroupsIdentifier, nestedObject:any, keys:GroupBy){
        let group = JSON.parse(JSON.stringify(nestedObject));
        for(const key of keys){
          if(Object.keys(groupID).includes(key)){
            group = group[groupID[key]]
          }else{
            break;
          }
        }
        return group
    }
      
    getGroupKeys(keys:GroupBy, groupID:GroupsIdentifier){
        const filterKeys = Object.keys(groupID);
        return keys.filter(key=>!filterKeys.includes(key))
    }
      
    getExpandGroupRows(groupID:GroupsIdentifier, keys:GroupBy, nestedObject:any, agg:AggConfig){
        const meta:Record<string, any> = Object.keys(groupID)
          .reduce((agg:Record<string, any>, cur)=>{
            if(cur!='idIdx') agg[cur]=null;
            return agg;
          }, {});
        meta['parent'] = groupID;
      
        const obj = this.getGroup(groupID, nestedObject, keys);
        const groupKeys = this.getGroupKeys(keys, groupID);
        const lines = this.buildLines(obj, groupKeys, agg);
        return lines.map(line=>{return {...line, ...meta}});
    }

    // handle default data
    setDefaultTable(elements:DataRows, keys:GroupBy, agg:AggConfig){
        this.nestedObject = this.groupByKeys(elements, keys);
        this.table = this.buildLines(this.nestedObject, keys, agg, true)
        this.table.map(row=>{
            row['ctr_open'] = false;
            return row;
        })
        this.host.requestUpdate();
    }

    // handle expand
    expandGroup(row:number, groupID:GroupsIdentifier, keys:GroupBy, agg:AggConfig){
        this.table[row-1].ctr_open = true;
        const rows = this.getExpandGroupRows(groupID, keys, this.nestedObject, agg);
        this.table.splice(row, 0, ...rows);
        this.host.requestUpdate();
    }
      
    isChild(row:DataRow, parent:GroupsIdentifier){
        if(row.parent){
          for(let key in parent){
            if(Object.keys(row.parent).includes(key)){
              if(row.parent[key] != parent[key]){
                return false;
              }
            }else{
              return false;
            }
          }
        }else{
          return false
        }
        return true
    }
    
    // handle contract
    dropRows(row:number, parent:GroupsIdentifier){
        this.table[row].ctr_open = false;
        this.table = this.table.filter(row=>!this.isChild(row, parent));
        this.host.requestUpdate();
    }

    // get group by row
    getGroupID(row:DataRow, key:string){
        let groupID:GroupsIdentifier = {};
        if(row.ctr_expansible){
            if(row.parent){
                groupID = {...row.parent};  
                groupID[key] = row[key];
                return groupID;
            }else{
                groupID[key] = row[key];
                groupID['idIdx'] = row.idIdx;
                return groupID;
            }
        }
    }
}