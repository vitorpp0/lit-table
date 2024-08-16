export type TableRow = {
    parent:Array<any>,
    children:Array<TableRow>
}

export type TableColumn={
    id:number,
    value:any
}

export type TableConfig={
    title:String,
    headers:Array<TableColumn>,
    subheaders:Array<TableColumn>
    data:Array<TableRow>
}