import "./lit-table-tree/lit-table-tree"

document.body.style.backgroundColor = "#1D242B";

let el:any = document.createElement("lit-table-tree");

el.title = "hey";
el.headers = ['fruta', 'carro', 'desert', 'numero', 'numero', 'bool'];
el.data = [
    {"prop1": "apple", "prop2": 3, "prop3": true, "prop4": "sedan", "prop5": 7, "prop6": "cake"},
    {"prop1": "berry", "prop2": 5, "prop3": false, "prop4": "coupe", "prop5": 2, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 8, "prop3": true, "prop4": "suv", "prop5": 9, "prop6": "tart"},
    {"prop1": "apple", "prop2": 1, "prop3": false, "prop4": "sedan", "prop5": 4, "prop6": "cake"},
    {"prop1": "berry", "prop2": 6, "prop3": true, "prop4": "coupe", "prop5": 5, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 2, "prop3": false, "prop4": "suv", "prop5": 8, "prop6": "tart"},
    {"prop1": "apple", "prop2": 7, "prop3": true, "prop4": "sedan", "prop5": 3, "prop6": "pie"},
    {"prop1": "berry", "prop2": 4, "prop3": false, "prop4": "coupe", "prop5": 6, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 9, "prop3": true, "prop4": "suv", "prop5": 1, "prop6": "tart"},
    {"prop1": "apple", "prop2": 10, "prop3": false, "prop4": "suv", "prop5": 7, "prop6": "cake"},
    {"prop1": "berry", "prop2": 3, "prop3": true, "prop4": "coupe", "prop5": 2, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 5, "prop3": false, "prop4": "suv", "prop5": 9, "prop6": "tart"},
    {"prop1": "apple", "prop2": 8, "prop3": true, "prop4": "sedan", "prop5": 4, "prop6": "cake"},
    {"prop1": "berry", "prop2": 1, "prop3": false, "prop4": "suv", "prop5": 5, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 6, "prop3": true, "prop4": "suv", "prop5": 8, "prop6": "tart"}
];
el.groupBy = ['prop1', 'prop4', 'prop6'];
el.aggRules = {'prop2':'max','prop5':'mean', 'prop3':'count'};
// el.keys = ['prop1', 'prop4', 'prop6', 'prop2', 'prop5', 'prop3'];
document.body.appendChild(el);

el = document.createElement("lit-table-tree");
el.title = "hey";
el.headers = ['fruta', 'carro', 'desert', 'numero', 'numero', 'bool'];
el.data = [
    {"prop1": "apple", "prop2": 3, "prop3": true, "prop4": "sedan", "prop5": 7, "prop6": "cake"},
    {"prop1": "berry", "prop2": 5, "prop3": false, "prop4": "coupe", "prop5": 2, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 8, "prop3": true, "prop4": "suv", "prop5": 9, "prop6": "tart"},
    {"prop1": "apple", "prop2": 1, "prop3": false, "prop4": "sedan", "prop5": 4, "prop6": "cake"},
    {"prop1": "berry", "prop2": 6, "prop3": true, "prop4": "coupe", "prop5": 5, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 2, "prop3": false, "prop4": "suv", "prop5": 8, "prop6": "tart"},
    {"prop1": "apple", "prop2": 7, "prop3": true, "prop4": "sedan", "prop5": 3, "prop6": "pie"},
    {"prop1": "berry", "prop2": 4, "prop3": false, "prop4": "coupe", "prop5": 6, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 9, "prop3": true, "prop4": "suv", "prop5": 1, "prop6": "tart"},
    {"prop1": "apple", "prop2": 10, "prop3": false, "prop4": "suv", "prop5": 7, "prop6": "cake"},
    {"prop1": "berry", "prop2": 3, "prop3": true, "prop4": "coupe", "prop5": 2, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 5, "prop3": false, "prop4": "suv", "prop5": 9, "prop6": "tart"},
    {"prop1": "apple", "prop2": 8, "prop3": true, "prop4": "sedan", "prop5": 4, "prop6": "cake"},
    {"prop1": "berry", "prop2": 1, "prop3": false, "prop4": "suv", "prop5": 5, "prop6": "pie"},
    {"prop1": "cherry", "prop2": 6, "prop3": true, "prop4": "suv", "prop5": 8, "prop6": "tart"}
];
el.groupBy = ['prop1', 'prop4', 'prop6'];
el.aggRules = {'prop2':'max','prop5':'mean', 'prop3':'count'};
// el.keys = ['prop1', 'prop4', 'prop6', 'prop2', 'prop5', 'prop3'];
document.body.appendChild(el);