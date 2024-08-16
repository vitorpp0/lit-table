import {LitElement, html, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import styleCSS from "./style.scss";
import data from "./local_data.json";

import '@polymer/paper-icon-button/paper-icon-button'
import '@polymer/iron-icons/iron-icons';

@customElement('simple-lit-table')
export class SimpleLitTable extends LitElement {

    @property({attribute:"data", type:Object}) tableData:any = data;
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
                ${this.getTableData(this.tableData.data)}  
            </table>
        `;
    }

    // render support 
    getDefaultButtons(config:any){
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

    getTableHead(head:Array<any>, type:"main"|"sub"){
        const tr_class = type=="main" ? "header" : "subheader";
        const isSelectable = (type=="main" && this.tableData.selectable=="column");
        return head.length!=0 
            ? html`
                <tr class="${tr_class}" ?show=${ type=="sub" ? this.showSubheader : nothing}>
                    ${head.map((header:any, idx:number)=>
                        html`
                            <th
                                class="${ isSelectable ? "selectable" : nothing}"
                                @click=${ isSelectable ?  (e:any)=>{this.axisSelectedHandler(e, "column", idx)} : nothing}
                            >
                                ${header.value}
                            </th>
                        `
                    )}
                </tr>`
            : nothing
    }

    getTableData(data:any){
        return data.map((row:any)=>{
            return html`
                <tr class="data">
                    ${ row.map((cell:any)=>{return html`<td>${cell}</td>`})}
                </tr>
            `
        })
    }

    // events
    showOrHideSubheader(){
        this.showSubheader = !this.showSubheader;
    }

    axisSelectedHandler(e:any, axis:"column"|"row", index:number){
        const detail = axis == 'column' ? this.tableData.headers[index] : this.tableData.data[index];
        this.dispatchEvent(new CustomEvent("axis-selected", {detail:detail}));
    }
}