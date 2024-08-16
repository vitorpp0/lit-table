import "./lit-table-tree/lit-table-tree";
import "./simple-lit-table/simple-lit-table"

document.body.style.backgroundColor = "#1D242B";

let el:HTMLElement  =  document.createElement("lit-table-tree");
document.body.appendChild(el);

el  =  document.createElement("simple-lit-table");
document.body.appendChild(el);