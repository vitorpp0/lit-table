function groupByKeys(elements, keys) {
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

function aggregateRows(nestedObject, agg){
  let rows = []

  function recurse(obj){
    if(Array.isArray(obj)){
      rows = rows.concat(obj);
    }

    for(let key in obj){
      if(typeof obj[key]==='object' && obj[key]!==null) recurse(obj[key]);
    }
  }
  recurse(nestedObject)
 
  const line = {}
  for(const [key, value] of Object.entries(agg)){
    line[key] = apply(key, value, rows);
  }
  return line;
}

function apply(key, aggFunc, rows){
  switch(aggFunc){
    case "mean":
      return mean(rows, key);
    case "max":
      return max(rows, key);
    case "min":
      return min(rows, key);
    default:
      return count(rows);
  }
}

function count(arr) {
  return arr.length;
}

function mean(arr, key) {
  return arr.reduce((sum, item) => sum + item[key], 0) / arr.length;
}

function max(arr, key) {
  return Math.max(...arr.map(item => item[key]));
}

function min(arr, key) {
  return Math.min(...arr.map(item => item[key]));
}

function buildLines(nestedObject, keys, agg, root=false){
  let rows = [];

  if(Array.isArray(nestedObject)){
    rows = JSON.parse(JSON.stringify(nestedObject))
      .map(row=>{return {...row, ctr_expansible:false}});

  }else if(typeof nestedObject == 'object' && nestedObject!==null){
    for(const [key, value] of Object.entries(nestedObject)){
      let line = {};
      line = {...countObjectsAtEachLevel(value, keys)};
      line[keys[0]] = key;
      line = {...aggregateRows(value, agg), ...line, ctr_expansible:true};
      if(root) line['idIdx'] = 2;
      rows.push(line);
    }
  }
  return rows;
}

function getGroup(groupID, nestedObject, keys){
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

function getGroupKeys(keys, groupID){
  const filterKeys = Object.keys(groupID);
  return keys.filter(key=>!filterKeys.includes(key))
}

function getExpandGroupRows(groupID, keys, nestedObject, agg){
  const meta = Object.keys(groupID)
    .reduce((agg, cur)=>{
      if(cur!='idIdx') agg[cur]=null;
      return agg;
    }, {});
  meta['parent'] = groupID;

  const obj = getGroup(groupID, nestedObject, keys);
  const groupKeys = getGroupKeys(keys, groupID);
  const lines = buildLines(obj, groupKeys, agg);
  return lines.map(line=>{return {...line, ...meta}});
}

function countObjectsAtEachLevel(nestedObject, keys) {
  const result = {};

  function recurse(obj, level){ 
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

function setDefaultTable(elements, keys, agg){
  const nestedObject = groupByKeys(elements, keys);
  return buildLines(nestedObject, keys, agg, true)
}

function ExpandGroup(table, row, groupID, keys, nestedObject, agg){
  const rows = getExpandGroupRows(groupID, keys, nestedObject, agg);
  table.splice(row, 0, ...rows);
}

function isChild(row, parent){
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

function dropRows(table,parent){
  return table.filter(row=>!isChild(row, parent));
}

// Example usage:
const elements = [
  { name: "Alice", age: 25, city: "New York", color:1},
  { name: "Bob", age: 30, city: "San Francisco", color:2},
  { name: "Charlie", age: 25, city: "New York", color:2 },
  { name: "David", age: 30, city: "San Francisco", color:2 },
  { name: "Eve", age: 25, city: "Los Angeles", color:1 }
];
const keys = ["age", "city"];
const groupedElements = groupByKeys(elements, keys);
const agg={name:"count", color:"mean"}

console.log(JSON.stringify(groupedElements, null, 2))
  


let table = setDefaultTable(elements, keys, agg);
console.log(table);

let row = 1
let groupID = {age:25, idIdx:1}
ExpandGroup(table, row, groupID, keys, groupedElements, agg);
console.log(table);

row=4
groupID = {age:30, idIdx:2}
ExpandGroup(table, row, groupID, keys, groupedElements, agg);
console.log(table)

row=5
groupID = {age:30, city:'San Francisco', idIdx:2}
ExpandGroup(table, row, groupID, keys, groupedElements, agg);
console.log(table)

table = dropRows(table,  {age: 30, idIdx: 2})
console.log(table)



// console.log(setDefaultTable(groupedElements, keys, agg))

// console.log(JSON.stringify(groupedElements, null, 2))

// const groupID = {age:25, city:"New York", idIdx:2}

// console.log(expandGroup(groupID, keys, groupedElements, agg))
