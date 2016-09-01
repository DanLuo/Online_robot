//Global variable definition
var ev3Names={};
var ev3list=[];
var N=1;
var ev3address;

//var ev3Names={'ev3.1':'120.34.4.3','ev3.2':'123.54.3.2'};

//deal with communication with the server
function xml_http_post(url, data, callback) {
    var req = false;
    try {
        // Firefox, Opera 8.0+, Safari
        req = new XMLHttpRequest();
    }
    catch (e) {
        // Internet Explorer
        try {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                alert("Your browser does not support AJAX!");
                return false;
            }
        }
    }
    req.open("POST", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status==200) {
            callback(req);
        }
    }
    req.send(data);
}


function GetEv3List(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                var begin=0;
                var last=0;
                //var info;
                console.log(allText);
                console.log(typeof(allText));
                console.log(allText.length);
                while (begin<allText.length)
                {
                   last=allText.indexOf('}',begin);
                   console.log(allText.substr(last,1));
                   console.log(allText.substring(begin,last+1));
                   info=allText.substring(begin,last+1);
                   info=JSON.parse(info);
                   begin=last+2;
                  // if (ev3list.indexOf(info)==-1){
                   ev3list.push(info);
                   //getev3();
                   console.log(ev3list);
                  //}
                }

              }

       }
    rawFile.send(null);
    getev3();
     //t = setTimeout(function(){GetEv3List(file)}, 2000);
  }    //t = setTimeout(function(){GetEv3List(file)}, 500);
}
function loadev3(){

}
//var address="ws://10.246.104.58:9000";
//var address="ws://130.64.187.212:9001";

function socketCommunication(address,data)
{
  var ws = new WebSocket(address);
  ws.onopen = function() {
     ws.send(data);
    };
  ws.onmessage=function(event){
     message_handle(event.data);
    };
}


function gatherInfo(){
   data={'service':'deviceInfo','ip':'130.64.187.212','port':'9000'};
   data=JSON.stringify(data);
   xml_http_post('index.html',data,message_handle);
   //socketCommunication(address,data);
   //getev3();
}


function message_handle(message){
    console.log(message);
    console.log(typeof(message));
    var type=message.substring(0,4);
    message=message.substr(4);
    console.log(type);
    if(type=='JSON'){
        var m1=message.substr(4)
        m1=JSON.parse(m1);

        var key=Object.keys(m1);

        if(key=='ip'){
           $("#test_result").html(key+" : "+m1[key]);
           $("#test_result").fadeOut(200).fadeIn(200);
         }
       }
    else if(type=='STRN'){
           //$("#test_result").html(message.substr(4));
           $("#test_result").html(message);
           $("#test_result").fadeOut(200).fadeIn(200);
      }
  //document.getElementById("bindingInfo").innerHTML=message;
}
function getev3(){
    for (var i=0;i<ev3list.length;i++){
         var item=new EV3();
         var name=ev3list[i].ip;
         item.ev3.innerHTML=name;
         item.ev3.address=ev3list[i].ip;
         item.ev3.port=ev3list[i].port;
         console.log(item.ev3.address)
         item.createItem();
   }
}

var admin=function() {
  this.ev3list=0;
}

function createItem(){
  var br=document.createElement('br');
  //ev3.innerHTML='hehe';
  this.ev3.style.color="blue";
  this.ev3.style.position="relative";
  //this.ev3.style.left="30%";
  this.ev3.style.fontSize="20px";
  this.ev3.style.width="50px";
  this.ev3.style.cursor="pointer";
  this.parent.appendChild(this.ev3);
  this.parent.appendChild(br);
}

function bind(){
  //$("#test_result").html="You are binding with";
  var target="ws://"+this.address+":"+9001;
  console.log(target);
  data={'service':'bind'};
  data=JSON.stringify(data);
  socketCommunication(target,data);
  ev3address=target;
  console.log(ev3address);
  //document.getElementById("bindingInfo").innerHTML="You are binding with:"+this.innerHTML;
}

var EV3=function(){
  this.parent=document.getElementById("dropdown-menu");
  this.ev3=document.createElement('li');
  this.createItem=createItem;
  this.ev3.onclick=bind;
}




//EV3 actions
function runMotor(){
  data={'device':'motor','cmd':'run'};
  data=JSON.stringify(data);
  socketCommunication(ev3address,data);
}

function led(){
  data={'device':'led'};
  data=JSON.stringify(data);
  socketCommunication(ev3address,data);

}
function mouseOver(id){
document.getElementById(id).style.backgroundColor="grey";
}
function mouseOut(element){
  element.style.backgroundColor="white";
}

function clicktestfunction(){
$("#test_result").html("Hello!");
}
