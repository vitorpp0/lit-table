import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DataFrame, toJSON } from 'danfojs';

export type Operation = {value:string, prop:number, target:number, opIdx?:number, parent:number|null}; 
export type ProcessControllerAggRules = {groupBy:Array<string>,apply:Record<string,string>}
export type ProcessControllerHost = ReactiveControllerHost & {data:Array<any>,aggRules:ProcessControllerAggRules}


export class ProcessController implements ReactiveController {
    private host: ProcessControllerHost;
    private aggRules:ProcessControllerAggRules;
    private dataframe: DataFrame;
    public table:Array<any>;
    public operations:Array<Operation>=[];
    private operationsID:number = -1;


    constructor(host: ProcessControllerHost) {
        this.host = host;
        host.addController(this);
    }

    hostConnected() {
    }

    hostDisconnected() {
    }

    setDataframe(){
        if(this.host.data) this.dataframe = new DataFrame(this.host.data);
    }

    setAggRules(){
        this.aggRules = this.host.aggRules;
    }

    
    updateTable(){
        let df:DataFrame;
        if(this.aggRules && this.dataframe){
            df = this.applyDefaultState();
            df = this.applyOperations(df);
        }else if(this.dataframe){
            df = this.dataframe.copy();
        }
        if(df) this.table = toJSON(df) as Array<any>;
        this.host.requestUpdate();
    }

    // handle expand/contract events
    applyDefaultState():DataFrame{
        const df:DataFrame = this.dataframe
            .groupby([this.aggRules.groupBy[0]])
            .agg({
                ...this.aggRules.groupBy.slice(1).reduce((acc:any, cur)=>{
                    acc[cur] = 'count';
                    return acc;
                }, {}),
                ...this.aggRules.apply, 
            });
        const nRows = df.shape[0]
        df.addColumn('ctrl_expansible',Array(nRows).fill(true), {inplace:true});
        df.addColumn('ctrl_open',Array(nRows).fill(false), {inplace:true});
        df.addColumn('ctrl_parent',Array(nRows).fill(null), {inplace:true});
        return df
    }

    handleOpen(df_old:DataFrame, op:Operation):DataFrame{
        const df = df_old.copy();
        let ctrl_open_idx:number = df.columns.indexOf('ctrl_open');
        console.log(df.values);
        (df.values[op.target] as any)[ctrl_open_idx]= true;
        return df;
    }

    applySecondaryAggregations(df_old:DataFrame, op:Operation):DataFrame{
        let df:DataFrame = df_old.copy();
        if(op.prop+1<this.aggRules.groupBy.length){
            df = df.groupby([this.aggRules.groupBy[op.prop+1]])
            .agg({
                ...this.aggRules.groupBy.slice(op.prop+2).reduce((acc:any, cur)=>{
                    acc[cur] = 'count';
                    return acc;
                }, {}),
                ...this.aggRules.apply, 
            });
        }else{
            df.drop({ columns:this.aggRules.groupBy, inplace: true });
            df = df.copy();
        };
        return df
    }

    recoverGroupColumns(df_old:DataFrame, op:Operation){
        const df = df_old.copy();
        for(let prop of this.aggRules.groupBy.slice(0, op.prop+1)){
            df.addColumn(prop, Array(df.shape[0]).fill(null),{inplace:true})
        }
        return df;
    }

    addControlColumns(df_old:DataFrame, op:Operation, idx:number):DataFrame{
        let df = df_old.copy()
        const final_cols = [...df.columns.slice(-(op.prop+1)), ...df.columns.slice(0, -(op.prop+1))];
        df = df.loc({columns:final_cols});
        df.addColumn('ctrl_expansible',Array(df.shape[0]).fill(op.prop+1<this.aggRules.groupBy.length), {inplace:true});
        df.addColumn('ctrl_open',Array(df.shape[0]).fill(false), {inplace:true});
        df.addColumn('ctrl_parent',Array(df.shape[0]).fill(idx), {inplace:true});
        return df;
    }

    mergedf(baseDF:DataFrame, dfToMerge:DataFrame, op:Operation){
        return new DataFrame(
            [...baseDF.values.slice(0,op.target+1), ...dfToMerge.values, ...baseDF.values.slice(op.target+1)],
            {columns:baseDF.columns}
        )
    }

    applyOperations(old_df:DataFrame):DataFrame{
        let df = old_df.copy();
        const orgDF = this.dataframe.copy()
        this.operations.forEach((op,idx)=>{
            df = this.handleOpen(df, op);
            let dfToMerge:DataFrame = orgDF.loc({rows:orgDF[this.aggRules.groupBy[op.prop]].eq(op.value)});
            dfToMerge = this.applySecondaryAggregations(dfToMerge, op);
            dfToMerge = this.recoverGroupColumns(dfToMerge, op);
            dfToMerge = this.addControlColumns(dfToMerge,op, idx);
            df = this.mergedf(df,dfToMerge,op);
        })
        return df; 
    }

    // close handle
    setOperation(operation:Operation){
        const opIdx:number = this.findOperation(operation);
        console.log(opIdx)
        console.log(this.operations)
        if(opIdx==-1){
            this.operationsID+=1;
            operation.opIdx = this.operationsID;
            this.operations.push(operation)
        }else{
            const toDeleteOpIdx = this.getChainBlock(operation);
            this.operations = this.operations.filter(op=>!toDeleteOpIdx.includes(op.opIdx));
        }
        this.updateTable();
    }

    getChainBlock(selected:Operation, memoization:Array<number>=[]){
        if(memoization.length==0){
            let opToDelete = this.findOperation(selected);
            opToDelete = opToDelete==-1 ? -1 : this.operations[opToDelete].opIdx;
            if(opToDelete!=-1 && !memoization.includes(opToDelete)){
                memoization.push(opToDelete);
                this.getChainBlock(this.operations[opToDelete], memoization);
            }
        }else{
            this.operations.filter(op=>op.parent==memoization.slice(-1)[0])
            .map(op=>this.findOperation(op))
            .forEach(opIdx=>{
                opIdx = opIdx==-1 ? opIdx : this.operations[opIdx].opIdx
                if(opIdx!=-1 && !memoization.includes(opIdx)){
                    memoization.push(opIdx);
                    this.getChainBlock(this.operations[opIdx], memoization);
                }
            });
        }
        return memoization
    }
    
    findOperation(selected:Operation){
        return this.operations.findIndex(op=>{
            return op.value == selected.value &&
              op.prop==selected.prop && 
              op.parent == selected.parent
        })
    }
}