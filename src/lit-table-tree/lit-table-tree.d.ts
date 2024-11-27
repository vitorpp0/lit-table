export type TableRow = Array<number | string | boolean>

export type TableColumn={
    id:number,
    colId?:number,
    value:any
}

export type TableConfig={
    title:String,
    headers:Array<TableColumn>,
    subheaders:Array<TableColumn>
    data:Array<TableRow>,
    aggRules:Array<AggRules>
}

type AggOperations = 'count' | 'avg' | 'sum';
export type AggRules = {
    by:number,
    with: AggOperations
}