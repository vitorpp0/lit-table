import {LitElement, html, nothing, unsafeCSS, TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import styleCSS from "./style.scss";
import data from "./local_data.json";

import {TableConfig, TableColumn, TableRow} from './lit-table-tree.d'

import '@polymer/paper-icon-button/paper-icon-button'
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';

@customElement('lit-table-tree')
export class LitTableTree extends LitElement {
    @property({attribute:"data", type:Object}) tableData:TableConfig = data as TableConfig;
    @state() subheaderIconButton:String = "icons:arrow-drop-up"
    @state() showSubheader:Boolean = false;

    static styles = unsafeCSS(styleCSS);

    constructor(){super();}

    render() {
        return html`
            <div id="title-train">
                <p id="title">${this.tableData.title}</p>
                <div id="button-train">
                    <slot></slot>
                    ${this.getDefaultButtons(this.tableData)}
                </div>
            </div>
            <table>
                ${this.getTableHead(this.tableData.headers, "main")}
                ${this.getTableHead(this.tableData.subheaders, "sub")}        
                ${this.tableData.data.map((row:TableRow, idx)=>{return this.getHTMLRow(row,idx+1,0)})}
            </table>
        `;
    }

    // render support
    getDefaultButtons(config:TableConfig){
        return html`
            ${
                config.subheaders 
                    ? html`
                        <paper-icon-button 
                            icon="icons:arrow-drop-${this.showSubheader ? "up" : "down"}"
                            @click=${this.showOrHideSubheader}
                        ></paper-icon-button>` 
                    : nothing
            }
            <paper-icon-button 
                icon="icons:info-outline"
            ></paper-icon-button>
        `;
    }

    getTableHead(head:Array<TableColumn>, type:"main"|"sub"){
        const tr_class = type=="main" ? "header" : "subheader";
        if(head.length==0){
            return nothing;
        }else{
            return html`
                <tr class="${tr_class}" ?show=${this.showSubheader}>
                    ${head.map((header:TableColumn)=>html`<th>${header.value}</th>`)}
                </tr>
            `
        }
    }

    getHTMLRow(row:TableRow,row_idx:number=0,level:number=0):TemplateResult{
        const test = `${level==0 ? "" : "hidden"} data`
        return html`
            <tr id="row${row_idx}" class="${test}" parent_row="${row_idx}">
                ${
                    row.parent.map((data:any, idx:number)=>{
                        const test2 = level>0 && idx==0 ? `padding-left:${24+level*10}px` : nothing;
                        return html`<td style="${test2}">
                            ${
                                (idx==0 && row.children.length>0) 
                                ?  html`
                                    <iron-icon
                                        icon="icons:arrow-drop-down"
                                        @click=${(e:any)=>{this.showHideRows(e,{row:row_idx,children:row.children.length})}}
                                    ></iron-icon>` 
                                : nothing
                            }
                            ${data}
                        </td>`
                    })
                }
            </tr>
            ${row.children.map((childRow, idx)=>this.getHTMLRow(childRow,row_idx*10+idx+1,level+1))}
        `
    }

    // events
    showOrHideSubheader(){
        this.showSubheader = !this.showSubheader;
    }

    showHideRows(e:any, detail:{row:number, children:number}){
        e.target.icon = e.target.icon == "icons:arrow-drop-down" ? "icons:arrow-drop-up" : "icons:arrow-drop-down" ;
        for(let i=0; i<detail.children; i++){
            let child:HTMLTableRowElement = this.renderRoot.querySelector(`#row${10*detail.row+i+1}`);
            child.style.display= child.style.display == "none" || child.style.display == ""  ? "table-row" : "none";
        }
    }
}