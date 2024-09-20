import {LitElement, html, nothing, unsafeCSS, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import styleCSS from "./style.scss";

import '@polymer/paper-icon-button/paper-icon-button'
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';

import { ProcessController, AggConfig, DataRows, GroupBy, GroupsIdentifier} from './controllers/preprocessController';

@customElement('lit-table-tree')
export class LitTableTree extends LitElement {
    @property({attribute:"title", type:String}) title:string = 'Default Title';
    @property({attribute:"headers", type:Object}) headers:Array<string> = ['col1', 'col2', 'col3']; 
    @property({attribute:"data", type:Object}) data:DataRows;
    @property({attribute:"group-by", type:Object}) groupBy:GroupBy;
    @property({attribute:'agg-rules', type:Object}) aggRules:AggConfig;
    @property({attribute:'keys', type:Object}) keys:Array<string>;

    private processController = new ProcessController(this);
 
    static styles = [unsafeCSS(styleCSS)];

    constructor(){super();}

    protected willUpdate(_changedProperties: PropertyValues): void {
        if( _changedProperties.has('data') || 
            _changedProperties.has('groupBy') ||
            _changedProperties.has('aggRules') 
        ) this.processController.setDefaultTable(this.data, this.groupBy, this.aggRules);   
    }

    render() {
        return html`
            <div id="title-train">
                <p id="title">${this.title}</p>
                <div id="button-train">
                    <slot></slot>
                </div>
            </div>
            <table>
                ${this.renderHeaders()}
                ${this.renderData()}
            </table>
        `;
    }

    renderHeaders(){
        return this.headers 
            ? html`<tr class="header">
                    ${this.headers.map(col=>html`<th>${col}</th>`)}
                </tr>`
            : nothing;
    }

    renderData(){
        if(this.processController.table){
            return this.processController.table.map((row, idx)=>{
                let hasIcon = false;
                return html`<tr class="data">
                    ${
                        this.keys.map((prop: keyof typeof row, propIdx)=>{
                            if(row[prop]!==null){
                                if(!hasIcon && row.ctr_expansible){
                                    hasIcon=true;
                                    return html`
                                        <td>
                                            <iron-icon
                                                icon="icons:arrow-drop-${row.ctr_open ? 'up' : 'down'}"
                                                @click=${(e:any)=>{
                                                    this.handleExpand(
                                                        e, idx,
                                                        this.processController.getGroupID(row, prop)
                                                    )
                                                }}
                                            ></iron-icon> 
                                            ${row[prop]}
                                        </td>`
                                }else{
                                    return html`<td>${row[prop]}</td>`
                                }
                            }
                            return html`<td></td>`
                        })
                    }
                </tr>`
            })
        }
        return nothing;
    }

    handleExpand(e:any, row:number, groupID:GroupsIdentifier){
        if(e.target.icon=="icons:arrow-drop-down"){
            this.processController.expandGroup(row+1, groupID, this.groupBy, this.aggRules);
        }else{
            this.processController.dropRows(row, groupID);
        }
    }
}