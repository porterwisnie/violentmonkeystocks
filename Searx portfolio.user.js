// ==UserScript==
// @name Searx portfolio
// @namespace Violentmonkey Scripts
// @match http://localhost:8888/
// @grant none
// @require https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.js
// ==/UserScript==
if(document.getElementById('main_results') === null && document.getElementById('check-advanced')){
  document.documentElement.style.overflow = 'hidden'
var spacing = document.getElementById('main-logo');
spacing.style = "margin-top: 0vh;margin-bottom: 25px"
const orange = 'rgb(255, 153, 51)';
const green = 'rgb(51, 255, 51)';
const yellow = 'rgb(255,230,0)';
const blue_green = 'rgb(91,251,253)';
const purple = 'rgb(150,56,174)';
const redpink = 'rgb(235,158,142)';
const magenta = 'rgb(242,7,156)';
const maroon = 'rgb(95,19,70)';
const darkgreen = 'rgb(12,97,49)';

const timerange = '6m';
/*Also part of the server migration mentioned below
let endurl = "&token=pk_4385cb35439e4c26bd15da203f6287da";
*/

let dates = [];

let stock = {'aapl':1,'botz':11,'iusg':15,'gd':1,'vwo':18,'lit':4,'xph':2,'brk.b':1,'qqq':2};

let chartstock = Object.keys(stock);
let urlstock = chartstock.join(',');
let opening = []
let dataset = []
let provalue = {};
const xhr = new XMLHttpRequest();
let end = '/stock/market/batch?symbols='+urlstock+'&types=chart&range='+timerange;



/*
 *              This URL Is for when the iex servers go down everntually and mirgrate to the new "cloud" 
 *              holding off on the migration due to limitations 
 *
let testurl = 'https://cloud.iexapis.io/beta&token=pk_4385cb35439e4c26bd15da203f6287da';
*/

const url = 'https://api.iextrading.com/1.0'+end;
xhr.responseType ='json';

xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE) {
                let y = 0;      
                let dpush = true;
                
                chartstock.forEach(function(s){
                        
                        y = 0;
                        provalue[s] = 0;
                        if(dates.length > 1){
                        dpush=false;}
                        
                        

                        xhr.response[s.toUpperCase()]['chart'].forEach(function(x){
                                if(dpush){
                                opening[y] = parseFloat((((x['open'] * stock[s])*100)/100).toFixed(2));
                                
                                dates.push(y);
                                }
                                else{
                                        
                                        opening[y] += parseFloat((((x['open'] *stock[s])*100)/100).toFixed(2));
                                }
                                y+=1;
                                          })

                provalue[s] +=  xhr.response[s.toUpperCase()]['chart'][dates.length-1]["open"]*stock[s];

                })


        
        tablemaker();
        chartmaker();
        majorshares();
        //cryptomarket();
       
               
};
}
xhr.open('GET',url);
xhr.send();

function chartmaker(){
var body = document.getElementsByTagName("body")[0];
var secondrow = document.createElement('div')
secondrow.id = 'secondrow'
secondrow.style = "position: relative;height:40vh;width:99vw"
body.appendChild(secondrow)
var container = document.createElement("div");
container.style = "position: relative;height:10vh;width:43vw;margin-left:3%"
container.id = 'container'


var canvas = document.createElement("canvas");
canvas.id = 'chart'
canvas.width = 30
canvas.height = 15
secondrow.appendChild(container);
container.appendChild(canvas)
let ctx = canvas.getContext('2d');

var chart = new Chart(ctx, {

        type: 'line',


        data: {
                labels: dates,
                datasets: [{
                label:"Portfolio",
                backgroundColor:green,
                borderColor: green,
                data:opening,
                fill:false
                }]

        },
        options:{
                title: {
                        display:true,
                        text:'6 Month Portfolio Value',
                        position:'top'
                },
                maintainAspectRatio: true
        }

    });

}
function tablemaker(){

var container2 = document.createElement("div");
container2.style = "position: relative;width:90vw"
container2.id = 'container2'
let tab = document.createElement("table");
tab.id = 'highest_volume';
tab.class='display';
tab.style = "width: 100%;margin-left:5%"
body = document.getElementsByTagName("body")[0];

body.appendChild(container2)
container2.appendChild(tab)
let xhr2 = new XMLHttpRequest();

        const url2 = "https://api.iextrading.com/1.0/stock/market/list/mostactive";
        
        xhr2.onreadystatechange = () => {
                if(xhr2.readyState === XMLHttpRequest.DONE){
                        let target = tab;
                        jsresp = JSON.parse(xhr2.response);
                        target.innerHTML = 'Most Active<br/>';
                        
                        let row =target.insertRow(0);
                        let c0 = row.insertCell(0)
                        let c1 = row.insertCell(1);
                        let c2 = row.insertCell(2);
                        let c3 = row.insertCell(3);
                        let c4 = row.insertCell(4);
                        let c5 = row.insertCell(5);
                        
                        c0.style.color = "#00AA00";
                        c1.style.color = "#00AA00";
                        c2.style.color = "#00AA00";
                        c3.style.color = "#00AA00";
                        c4.style.color = "#00AA00";
                        c5.style.color = "#00AA00";
                  
                        c0.innerHTML = 'Stock';
                        c1.innerHTML = 'Latest Price';
                        c2.innerHTML = 'Change In Price';
                        c3.innerHTML = 'Todays Volume';
                        c4.innerHTML = 'Average Volume';
                        c5.innerHTML = '% Todays Vol / Average Vol';

                        let z = 1;
                        let y = 0;
                jsresp.forEach(function(x){
                        y=0;
                        row = target.insertRow(z);
                        c0 = row.insertCell(y);
                        c1 = row.insertCell(y+1);
                        c2 = row.insertCell(y+2);
                        c3 = row.insertCell(y+3);
                        c4 = row.insertCell(y+4);
                        c5 = row.insertCell(y+5);
                        c0.innerHTML = x['symbol']+': '+ x['companyName'];
                        c1.innerHTML = x['latestPrice'];
                        c2.innerHTML = x['change'];
                        c3.innerHTML = x['latestVolume'];
                        c4.innerHTML = x['avgTotalVolume'];
                        c5.innerHTML = parseInt((x['latestVolume'] / x['avgTotalVolume'])* 100);
                        z +=1;
                        })
                }
        }
        xhr2.open('GET',url2);
        xhr2.send();
}
function majorshares(){
  let allshares = Object.values(provalue);
  let majors = []
  let finals = []
  for(let x = 0;x <4;x++){
  let mostimp = Math.max(...allshares);
  majors.push(allshares[allshares.indexOf(mostimp)]);
  allshares.splice(allshares.indexOf(mostimp),1);

  }
  for(share in provalue){
     if (provalue.hasOwnProperty(share)) {
         for(s in majors){
       
           if(majors[s] === provalue[share]){
             finals[share] = provalue[share];
           }
         }
    }
  }
  
  var majortable = document.createElement('table')
  majortable.style = "float:right;width:40%;margin-right:5%"
  majortable.innerHTML = 'Largest of Portfolio'
  document.getElementById('secondrow').appendChild(majortable)
  
  let batchend = Object.keys(finals).join(',');
  majorurl = 'https://api.iextrading.com/1.0/stock/market/batch?symbols='+batchend+'&types=quote';
  let r = 1;
  let c = 0;
  let mxhr = new XMLHttpRequest();
  mxhr.onreadystatechange = () => {
    if(mxhr.readyState === XMLHttpRequest.DONE){
      jsresp = JSON.parse(mxhr.response)
      let row = majortable.insertRow(0);
      let c1 = row.insertCell(c)
      let c2 = row.insertCell(c+1)
      let c3 = row.insertCell(c+2)
      c1.innerHTML = 'Company Symbol';
      c2.innerHTML ='Latest Price';
      c3.innerHTML = 'Value of Holdings';
      c1.style.color = "#00AA00";
      c3.style.color = "#00AA00";
      c2.style.color = "#00AA00";
      
      Object.keys(jsresp).forEach(function(x){
        row = majortable.insertRow(r);
        c1 = row.insertCell(c);
        c2 = row.insertCell(c+1);
        c3 = row.insertCell(c+2);
        c1.innerHTML = jsresp[x]['quote']['symbol']+': '+jsresp[x]['quote']['companyName'];
        c2.innerHTML = jsresp[x]['quote']['latestPrice'];
        c3.innerHTML = parseFloat((stock[(jsresp[x]['quote']['symbol']).toLowerCase()]*(jsresp[x]['quote']['latestPrice'])).toFixed(2));
      
      })
    }
  }
  mxhr.open('GET',majorurl)
  mxhr.send()
}
function cryptomarket(){
  url3 = 'https://api.iextrading.com/1.0/stock/market/crypto'
  
  var cryptotable = document.createElement('table')
  cryptotable.style = "float:right;width:40%"
  document.getElementById('secondrow').appendChild(cryptotable)
  let cxhr = new XMLHttpRequest();
  cxhr.onreadystatechange = () => {
    if(cxhr.readyState === XMLHttpRequest.DONE){
      let row = cryptotable.insertRow(0)
      c1 = row.insertCell(0).innerHTML = 'Cryptocurrency'
      c2 = row.insertCell(1).innerHTML = 'Exchange Rate USD'
      jsresp = JSON.parse(cxhr.response);
      let r = 1;
      let c = 0;
      
      jsresp.forEach(function(x){
        if(x['companyName'] === 'Bitcoin USD' || x['companyName'] ==='Ethereum USD' || x['companyName'] === 'Litecoin USD' || x['companyName'] === 'Binance Coin USD'){
        row = cryptotable.insertRow(r);
        c1 = row.insertCell(c);
        c2 = row.insertCell(c+1);
        c1.innerHTML = x['companyName'];
        c2.innerHTML = x['latestPrice'];
        }
      })
      }
    }
  
                  
  cxhr.open('GET',url3);
  cxhr.send();
}
}

