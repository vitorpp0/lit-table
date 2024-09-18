import {LitElement, html, nothing, unsafeCSS, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import styleCSS from "./style.scss";

import '@polymer/paper-icon-button/paper-icon-button'
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';

import { ProcessController, ProcessControllerAggRules, Operation } from './controllers/preprocessController';

@customElement('lit-table-tree')
export class LitTableTree extends LitElement {
    @property({attribute:"title", type:String}) title:string = 'Default Title';
    @property({attribute:"headers", type:Object}) headers:Array<string> = ['col1', 'col2', 'col3']; 
    @property({attribute:"data", type:Object}) data:Array<any>;
    @property({attribute:'agg-rules', type:Object}) aggRules:ProcessControllerAggRules;
    @state() subheaderIconButton:String = "icons:arrow-drop-up"
    @state() showSubheader:Boolean = false;

    private processController = new ProcessController(this);
 
    static styles = [unsafeCSS(styleCSS)];

    constructor(){super();}

    protected willUpdate(_changedProperties: PropertyValues): void {
        if(_changedProperties.has('data')){
            this.processController.setDataframe();
            this.processController.updateTable();
            console.log(this.processController.table);
        }
        if(_changedProperties.has('aggRules')){
            this.processController.setAggRules();
            this.processController.updateTable();
            console.log(this.processController.table);
        }
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
                const props = Object.keys(row).filter((key:string)=>!key.includes('ctrl'))
                let hasIcon = false;
                return html`<tr class="data">
                    ${
                        props.map((prop: keyof typeof row, propIdx)=>{
                            if(row[prop]!==null){
                                if(!hasIcon && row.ctrl_expansible){
                                    hasIcon=true;
                                    const op:Operation = {
                                        value:`${row[prop]}`,
                                        prop:propIdx,
                                        target:idx,
                                        parent: propIdx==0 ? null : propIdx-1
                                    };
                                    return html`
                                        <td>
                                            <iron-icon
                                                icon="icons:arrow-drop-down"
                                                @click=${(e:any)=>{this.handleExpand(e,op)}}
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

    handleExpand(e:any, obj:Operation){
        console.log(obj);
        this.processController.setOperation(obj);
        // this.processController.operations.push(obj);
        // this.processController.updateTable();
        // this.requestUpdate();
    }
}