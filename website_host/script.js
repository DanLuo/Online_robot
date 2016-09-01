//Global variable definition
var ev3Names={};
var ev3list=[];//avaibable ev3 ip information displayed in the dropdown list
var statuslist={};
var N=1;
var targetIP='';//ev3 address used when doing shake-hand
var targetPort=0;//ev3 port used when doing shake-hand
var ev3address='';//indicator to run command, program will not run if this is empty
var motorlist=[];
var motordict={'address':''};
var targetlist=[]; //list for rectangle
var itemlist=[]; //list of control elements
var Indx=0;
var commandlist=[];
var sensorValue=0;
var sensorInfo={};
var loop=0;
var ev3MainPort=9001;//default port for communication on ev3
var nextFire='yes'; //status to control sending the commands to ev3
var runningTime=0;
var runStatus="normal";
var runIndicator;
var blinkIndicator=0;
var ev3AccessCode='';

var motorLeft="style/turnleft.png";
var motorRight="style/turnright.png";
var stop="style/stop.png";
var touchDown="style/touch1.png";
var touchUp="style/touch0.png";
var timeWait="style/timer.png";
var ultraLongerThan="style/ultraLongerThan.png";
var ultraShorterThan="style/ultraShorterThan.png";
var lightOff="style/light0.png";
var lightOn="style/light1.png";
var sensorPack=[touchDown,touchUp,ultraShorterThan,ultraLongerThan,lightOn,lightOff,timeWait];

var oneSecond="style/1s.png";
var twoSeconds="style/2s.png";
var fourSeconds="style/4s.png";
var sixSeconds="style/6s.png";
var eightSeconds="style/8s.png";
var timerList=[oneSecond,twoSeconds,fourSeconds,sixSeconds,eightSeconds,timeWait];

var screen_size=screen.width;
var icon_size=0;
var icon_top=0;
var icon_left=0;
//device specification
function onLoad(){
  if(screen_size>1200){
      icon_size=75;
      icon_top=180;
      document.getElementById("smartArea").style.width=(screen_size*0.9).toString()+"px";
      document.getElementById("smartArea").style.height=(screen_size*0.4).toString()+"px";
      document.getElementById("smartArea").style.marginLeft=(-screen_size*0.9*0.5).toString()+"px";
      document.getElementById("looping").style.top="430px";
      document.getElementById("looping").style.left="350px";
      document.getElementById("run").style.top="425px";
      document.getElementById("run").style.left="450px";
      acquireEV3();
  }
  else if(screen_size<1000 && screen_size>700){
    icon_size=65;
    icon_top=150;
    document.getElementById("smartArea").style.width="950px";
    document.getElementById("smartArea").style.height="500px";
    document.getElementById("smartArea").style.marginLeft="-475px";
    acquireEV3();
  }
  presets("#preset");
  // $("#run").draggable();
  // $("#looping").draggable();
  //pilot1();
  //var acquireList=setInterval(acquireEV3,20000);
}
window.onbeforeunload = function(event)
   {
    if (ev3address !=''){
       unbind();
     }
   };

 var isMobile = {
     Android: function() {
         return navigator.userAgent.match(/Android/i);
     },
     BlackBerry: function() {
         return navigator.userAgent.match(/BlackBerry/i);
     },
     iOS: function() {
         return navigator.userAgent.match(/iPhone|iPad|iPod/i);
     },
     Opera: function() {
         return navigator.userAgent.match(/Opera Mini/i);
     },
     Windows: function() {
         return navigator.userAgent.match(/IEMobile/i);
     },
     any: function() {
         return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
     }
 };
//deal with communication with the server
function http_post(url, data, callback) {
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
    req.onerror=function(){
      alert("Can not send request to the web server");
    }
    req.send(data);
}
//Import ev3 ip information to the dropdown list
function GetEv3List(url,data){
    var rawFile = new XMLHttpRequest();
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
                // var begin=0;
                // var last=0;
                // console.log(allText);
                // console.log(typeof(allText));
                // console.log(allText.length);
                // while (begin<allText.length)
                // {
                //       last=allText.indexOf("}",begin);
                //       console.log(allText.substr(last,1));
                //       console.log(allText.substring(begin,last+1));
                //       info=allText.substring(begin,last+1);
                //       info=JSON.parse(info);
                //       console.log(info);
                //       begin=last+2;
                //       if (ev3list.indexOf(info.ip)==-1){
                //       ev3list.push(info.ip);
                //       statuslist[info.ip]=info.status;
                //       console.log(statuslist);
                //       }
                // }
                //parseIP(rawFile.responseText);
            }
        }
    }
    rawFile.open("GET", url, true);
    rawFile.send('get list');
}
function formlist(req){
  //  ev3list=[];
  //  statuslist={};
  //alert(req.responseText);
   ev3info=JSON.parse(req.responseText);
   console.log(ev3info);
   console.log(Object.keys(ev3info).length);
   for (var i=0;i<Object.keys(ev3info).length;i++){
       ev3list[i]=Object.keys(ev3info)[i];
       console.log(ev3list[i]);
       statuslist[ev3list[i]]=ev3info[ev3list[i]];
       console.log(statuslist[ev3list[i]]);
   }
   //console.log(ev3list);
   //console.log(statuslist);
   getev3();
}
//Build the content of the dropdown list
function getev3(){
    for (var i=0;i<ev3list.length;i++){
         var item=new EV3();
         var name=ev3list[i];
         item.ev3.innerHTML=name;
         item.ev3.address=ev3list[i];
         //item.ev3.port=ev3list[i].port;
         //console.log(item.ev3.address)
         item.createItem();
         console.log('item created');
         console.log(statuslist[ev3list[i]]);
         if(statuslist[ev3list[i]]=='busy' && item.ev3.address!=targetIP){
           item.ev3.style.backgroundColor="red";
           console.log('get busy one');
         }
         if(item.ev3.address==targetIP && statuslist[ev3list[i]]=='busy'){
           item.ev3.style.backgroundColor="green";
           console.log('currently bind with '+ev3address);
         }
   }
}
//create each ev3 instance to be added to the dropdown list
function createItem(){
  var br=document.createElement('br');
  this.ev3.style.color="blue";
  this.ev3.style.position="relative";
  //this.ev3.style.left="30%";
  this.ev3.style.fontSize="20px";
  this.ev3.style.width="100%";
  this.ev3.style.cursor="pointer";
  this.parent.appendChild(this.ev3);
  this.parent.appendChild(br);
}
//instance of the ev3 ip information
var EV3=function(){
  this.parent=document.getElementById("dropdown-menu");
  this.ev3=document.createElement('li');
  this.createItem=createItem;
  this.ev3.onclick=bind;
}
function acquireEV3(){
    ev3list=[];
    parent=document.getElementById("dropdown-menu");
    childnodes=parent.childNodes;
    //console.log(childnodes.length);
    //console.log(childnodes);
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
    var dataHTTP={'action':'EV3List'};
    dataHTTP=JSON.stringify(dataHTTP);
    http_post("index.html",dataHTTP,formlist);
    //GetEv3List("index.html",dataHTTP);
    //alert('ev3list updated');
}
//parse IP information from the logfile.txt
function parseIP(text){
    var allText = text;
    var begin=0;
    var last=0;
    var info='';
    //console.log(allText);
    //console.log(typeof(allText));
    //console.log(allText.length);
    while (begin<allText.length)
    {
          last=allText.indexOf("}",begin);
          //console.log(allText.substr(last,1));
          //console.log(allText.substring(begin,last+1));
          info=allText.substring(begin,last+1);
          info=JSON.parse(info);
          begin=last+2;
          if (ev3list.indexOf(info.ip)==-1){
          ev3list.push(info.ip);
          }
    }
}
//Send message to the ev3 through WebSocket
function socketCommunication(address,data,source,callback){
  var ws = new WebSocket(address);
  var message;
  ws.onopen = function() {
     ws.send(data);
    };
  ws.onmessage=function(event){
     message_handle(event.data,source);
     //nextFire='yes';
    };
  ws.onerror=function(event){
    alert("Can't send request to this ev3");
    var dataHTTP={'target':targetIP,'targetport':ev3MainPort,'action':'release'};
    var dataHTTP=JSON.stringify(dataHTTP);
    http_post('index.html',dataHTTP,changeStatus);
  }
}
//handling message returned from the ev3
function message_handle(message,source){
    var type=message.substring(0,4);
    var message=message.substr(4);
    console.log(message);

    //console.log(type);
    if(runStatus=="normal"){
        //console.log('run normally');
      if(type=='STRN'){
        alert(message);
      }
      if(type=='JSON'){
          message=JSON.parse(message);
          $("#test_result").html(message.message);
          var key=Object.keys(message);
          console.log(key);
          if(key.indexOf("accesscode")!=-1){
            ev3AccessCode=message.accesscode;
            var parent=document.getElementById('dropdown-menu');
            for(var i=0;i<parent.childNodes.length;i++){
                if (parent.childNodes[i].innerHTML==targetIP){
                    parent.childNodes[i].style.backgroundColor='green';
                }
            }
            console.log(ev3AccessCode);
          }
          if(key.indexOf("releasecode")!=-1){
              var dataHTTP={'target':targetIP,'targetport':ev3MainPort,'action':'release'};
              var dataHTTP=JSON.stringify(dataHTTP);
              http_post('index.html',dataHTTP,changeStatus);
              // var parent=document.getElementById('dropdown-menu');
              // for(var i=0;i<parent.childNodes.length;i++){
              //     if (parent.childNodes[i].innerHTML==targetIP){
              //         parent.childNodes[i].style.backgroundColor='transparent';
              //     }
              // }
              // targetIP='';
              // targetPort=0;
              // ev3address='';
          }
          if(message.nextfire=="yes"){
            if(source.Type=="sensor"){
               source.childNodes[2].value=message.value;
            }
            var i=changetrigger();
            //console.log(i);
            if(i<itemlist.length){
            var data=JSON.stringify(itemlist[i].data);
            socketCommunication(itemlist[i].address,data,itemlist[i]);
            console.log(data);
             }
             else if(i==itemlist.length && loop==0){
               Stop();
             }
             else if(i==itemlist.length && loop==1){
               //document.getElementById("currentCommand").innerHTML='0';
               $("#currentCommand").html('0');
               fire();
             }
          }
          else if(message.nextfire=='no'){
              if(message.thisfire=='yes'){
                  var i=parseInt(document.getElementById("currentCommand").innerHTML);
                  var data=JSON.stringify(itemlist[i].data);
                  socketCommunication(ev3address,data,itemlist[i]);
                  console.log(data);
                  //$(itemlist[i].childNodes[1]).fadeOut(200).fadeIn(200);
                  if(source.Type=="sensor"){
                     source.childNodes[2].value=message.value;
                     $("#test_result").html('waiting for triggering sensor');
                     //$("#test_result").fadeOut(500).fadeIn(500);
                  }
              }
              else{
                //console.log(message.message)
              }
          }
      }
    }
    else if(runStatus=="interruped"){
        $("#test_result").html('interruped by user');
    }
}
//binding webbrowser with ev3
function bind(){
  if(this.style.backgroundColor=="red"){
    alert("address is being using");
  }
  else if(this.style.backgroundColor=='green'){
    alert("You are already connected with this ev3");
  }
  else if (targetIP==''){
      targetIP=this.address;
      targetPort=ev3MainPort;
      // console.log(target);
      // var dataWS={'service':'bind'};
      // dataWS=JSON.stringify(dataWS);
      // socketCommunication(target,dataWS);
      var dataHTTP={'target':this.address,'targetport':ev3MainPort,'action':'bind'};
      dataHTTP=JSON.stringify(dataHTTP);
      http_post('index.html',dataHTTP,changeStatus);
    //ev3address=target;
    // motordict.address=ev3address;
    // this.style.backgroundColor="green";
    // if(itemlist.length>0){//assign address to all control blocks
    //   for (var i=0;i<itemlist.length;i++){
    //     itemlist[i].address=target;
    //   }
    // }
  }
  else if(targetIP!=''&&targetIP!=this.address){
    alert('You aleardy binded with '+targetIP+', disconnect first');
  }
  //console.log(ev3address);
  //$("#bindingInfo").html("You are binding with:"+this.innerHTML);
}
function changeStatus(req){
  var status=req.responseText;
  var parent=document.getElementById('dropdown-menu');
  console.log(status);
  if (status=='Binded') {
      // for(var i=0;i<parent.childNodes.length;i++){
      //     if (parent.childNodes[i].innerHTML==targetIP){
      //         parent.childNodes[i].style.backgroundColor='green';
      //     }
      // }
      var target="ws://"+targetIP+":"+ev3MainPort;
      ev3address=target;
      var dataWS={'service':'bind'};
      dataWS=JSON.stringify(dataWS);
      socketCommunication(target,dataWS);
      if(itemlist.length>0){//assign address to all control blocks
        for (var i=0;i<itemlist.length;i++){
          itemlist[i].address=target;
        }
      }
  }
  else if (status=='Busy'){
    alert('This ev3 is busy');
    targetIP='';
    targetPort=0;
    ev3address='';
  }
  else if(status=='Disconnected'){
    for(var i=0;i<parent.childNodes.length;i++){
        if (parent.childNodes[i].innerHTML==targetIP){
            parent.childNodes[i].style.backgroundColor='transparent';
        }
    }
    // var target="ws://"+targetIP+":"+ev3MainPort;
    // ev3address=target;
    // var dataWS={'service':'release'};
    // dataWS=JSON.stringify(dataWS);
    // socketCommunication(target,dataWS);
    targetIP='';
    targetPort=0;
    ev3address='';

  }
}
function unbind(){
    if(targetIP==''){
        alert("You are not connected with any EV3s");
    }
    else{
        var target="ws://"+targetIP+":"+ev3MainPort;
        var dataWS={'service':'release'};
        dataWS=JSON.stringify(dataWS);
        socketCommunication(target,dataWS);
    }
}
function newTarget(){
  this.mother=document.createElement("div");
  this.Location=targetlist.length*102;
  this.mother.style.border="1px solid yellow";
  this.mother.style.position="absolute";
  this.mother.style.top="140px";
  if (this.Location==0){
  this.mother.style.left="50px";}
  else{
  this.mother.style.left=(this.Location+50).toString()+"px";
  }
  this.mother.style.float="left";
  this.mother.style.marginLeft="10px";
  this.mother.style.height="130px";
  this.mother.style.width="100px";

  // this.mother.setAttribute("ondragover","allowDrop(event)");
  // this.mother.setAttribute("ondrop","drop(event)");
  //$(this.mother).fsortable();

  targetlist.push(this.mother);
  document.getElementById("parkinglot").appendChild(this.mother);
}
function newItem(){
  //shape section
  var padding=15;
  var start=80;
  this.mother=document.createElement("div");
  this.Location=itemlist.length*icon_size+padding;
  //this.mother.xposi=this.Location;
  //console.log(this.mother.xposi);
  this.mother.style.position="absolute";
  this.mother.style.top=icon_top.toString()+"px";
  // if (this.Location==padding){
  // this.mother.style.left="70px";
  // this.mother.xposi=this.Location+255;
  // console.log(this.mother.xposi);
  // }
  // else{
  // this.mother.style.left=(this.Location+start).toString()+"px";
  // this.mother.xposi=this.Location+255;
  // console.log(this.mother.xposi);
  // }
  if(itemlist.length==0){
  this.Location=start;
  this.mother.style.left=start.toString()+"px";
  this.mother.xposi=start+210;
  //console.log(this.mother.xposi);
  }
  else{
  //this.Location=this.previousSibling.Location+icon_size+start+padding;
  this.Location=itemlist.length*1.2*icon_size+start;

  this.mother.style.left=(this.Location).toString()+"px";
  this.mother.xposi=this.Location+210;
  //console.log(this.mother.xposi);
  }
  this.mother.style.float="left";
  //this.mother.style.marginLeft="10px";
  this.mother.style.height=(icon_size*1.5).toString()+"px";
  this.mother.style.width=icon_size.toString()+"px";



//dragable setup
  $(this.mother).draggable(
      { start:function(event,ui){
        //console.log(event.clientX);
        },
        create:function(event,ui){
        //console.log(event);
        },
        stop: function (event, ui) {
        //console.log(event.clientX);
        var Locat=event.clientX;
        this.xposi=Locat;
        itemlist.sort(function(a,b){
          return a.xposi-b.xposi;});
        for(var i=0;i<itemlist.length;i++){
            itemlist[i].indx=itemlist.indexOf(itemlist[i]);
            //console.log(itemlist[i].data);
          }
        },
        axis:"x",
        containment:"#parkinglot",
        delay:200
      }
    );
    //drop dropdown-menu
  this.ports=document.createElement("select");
  this.ports.style.width="100%";
  this.ports.style.height="20%";
  this.mother.appendChild(this.ports);
  this.imag=document.createElement("img");
  this.imag.style.height=icon_size.toString()+"px";
  this.imag.style.width="100%";
  this.imag.style.cursor="pointer";
  this.imag.setAttribute("data-toggle","dropdown");
  this.mother.appendChild(this.imag);


  //data Section
  this.mother.data={};
  this.mother.address=ev3address;
  this.mother.indx;//index of this instance in the item list
  this.mother.Type;
  this.mother.nextfire=nextFire;
}
function layout(item){
  item.style.width="200px";
  item.style.height="100px";
  item.style.backgroundColor="yellow";
}
function popoverElement(type){
  var mother=document.createElement("div");
  mother.style.height="60px";
  mother.style.width="60px";
  var title=document.createElement("h6");
  title.style.display="none";
  mother.appendChild(title);
  switch (type) {
    case "style/light1.png":
        title.innerHTML="light on";
        break;
    case "style/light0.png":
        title.innerHTML="light off";
    case "style/turnleft.png":
        var control=document.createElement("input");
        control.style.display="none";
        control.setAttribute("type","range");
        mother.appendChild(control);
        title.innerHTML="Speed: "+control.value;
    case "style/turnright.png":
        var control=document.createElement("input");
        control.style.display="none";
        control.setAttribute("type","range");
        mother.appendChild(control);
        title.innerHTML="Speed: "+control.value;
  }
  return mother;
}
function addindicator(){
  var indicator=document.createElement("textarea");
  indicator.style.width="100%";
  indicator.style.height="25%";
  indicator.style.float="left";
  indicator.onchange;
  return indicator;
}
function rangecontrol(type){
  //var rangeControl=document.createElement("div");
  var control=document.createElement("input");
  // var indicator=document.createElement("span");
  // indicator.innerHTML="dd";
  control.setAttribute("type","range");
  control.style.width="80%";
  switch (type) {
    case "motor":
      control.mim=0;
      control.max=100;
      control.value=30;
      break;
    case ultraLongerThan:
      control.min=0;
      control.max=2550;
      control.value=500;
      break;
    case ultraShorterThan:
      control.min=0;
      control.max=2550;
      control.value=500;
      break;
    case lightOn:
      control.min=0;
      control.max=100;
      control.value=30;
      break;
    case lightOff:
      control.min=0;
      control.max=100;
      control.value=30;
      break;
    case 'light':
      control.min=0;
      control.max=100;
      control.value=30;
      break;
    case 'ultrasonic':
      control.min=0;
      control.max=2550;
      control.value=500;
      break;
  }
  //rangeControl.appendChild(control);
  //rangeControl.appendChild(indicator);
  //return rangeControl;
  return control;
}
function sensorPort(item){
  for (var i=1;i<5;i++){
    var port=document.createElement("option");
    port.value=i;
    port.innerHTML=i.toString();
    item.childNodes[0].appendChild(port);
  }
}
function DropDown(type){
  var dropdown=document.createElement("ul");
  var list=document.createElement("li");
  dropdown.setAttribute("class","dropdown-menu");
  switch (type) {
      case 'motor':
            var left=document.createElement("img");
            var right=document.createElement("img");
            left.src="style/turnleft.png";
            right.src="style/turnright.png";
            left.style.width="65px";
            left.style.height="65px";
            left.style.marginLeft="10px";
            right.style.width="65px";
            right.style.height="65px";
            right.style.marginLeft="10px";
            left.onclick=switchMotor;
            right.onclick=switchMotor;
            left.direction="left";
            right.direction="right";
            list.appendChild(left);
            list.appendChild(right);
            break;
      case 'sensor':
            var group=[];
            for(var i=0;i<sensorPack.length;i++){
              group[i]=document.createElement("img");
              group[i].src=sensorPack[i];
              group[i].style.width="65px";
              group[i].style.height="65px";
              group[i].style.marginLeft="10px";
              group[i].onclick=switchSensor;
              group[i].name=sensorPack[i];
              list.appendChild(group[i]);
            }
            break;
      case 'timerchoice':
            var group=[];
            for(var i=0;i<timerList.length;i++){
              group[i]=document.createElement("img");
              group[i].src=timerList[i];
              group[i].value=timerList[i][6];
              group[i].style.width="65px";
              group[i].style.height="65px";
              group[i].style.marginLeft="10px";
              group[i].onclick=switchWait;
              group[i].name=timerList[i];
              list.appendChild(group[i]);
            };
            break;
      case 'ultrasonic':
            var range=rangecontrol(type);
            var indicator=addindicator();
            range.onchange=changerange;
            list.appendChild(range);
            indicator.style.width="30%";
            indicator.style.height="20px";
            indicator.style.marginTop="5px";
            indicator.innerHTML=range.value;
            //indicator.style.marginLeft="20px";
            list.appendChild(indicator);
            break;
     case 'light':
           var range=rangecontrol(type);
           var indicator=addindicator();
           range.onchange=changerange;
           list.appendChild(range);
           indicator.style.width="30%";
           indicator.style.height="20px";
           indicator.style.marginTop="5px";
           indicator.innerHTML=range.value;
           //indicator.style.marginLeft="20px";
           list.appendChild(indicator);
           break;
  }
  var br=document.createElement("br");
  list.appendChild(br);
  var remove=document.createElement("input");
  remove.setAttribute("type","button");
  remove.style.marginTop="15px";
  remove.style.marginLeft="10px";
  remove.value="remove";
  remove.onclick=removeItem;
  list.appendChild(remove);
  dropdown.appendChild(list);
  return dropdown;
}
function changerange(){
  this.nextSibling.innerHTML=this.value;
  this.parentNode.parentNode.parentNode.data["trigger"]=parseInt(this.value);
  console.log(this.parentNode.parentNode.parentNode.data);
}
function changerange2(){
  this.nextSibling.innerHTML=this.value;
  this.parentNode.data["trigger"]=parseInt(this.value);
  console.log(this.parentNode.data);
}
function changerange3(item,value){
  item=value;
}
function switchMotor(){
  this.parentNode.parentNode.parentNode.childNodes[1].src=this.src;
  this.parentNode.parentNode.parentNode.data["direction"]=this.direction;
  //this.parentNode.
  console.log(this.parentNode.parentNode.parentNode.childNodes[1]);
}
function switchWait(){
    var parent=this.parentNode.parentNode.parentNode;
    parent.childNodes[1].src=this.src;
    parent.type='wait';
    parent.data['time']=this.value;
    if (this.value=='t'){
      //parent.childNodes[2].style.visibility="visible";
      parent.appendChild(textInput("timer"));
      parent.data['time']=parent.childNodes[3].value;
      parent.childNodes[3].setAttribute('onchange',"changeProperty(this,'time')")
    }
}
function switchSensor(){
  //this.parentNode.parentNode.parentNode.childNodes[1].src=this.src;
  //this.parentNode.parentNode.parentNode.data;
  var parent=this.parentNode.parentNode.parentNode;
  parent.childNodes[1].src=this.src;
  // console.log(parent.childNodes.length);
  if(parent.childNodes.length>5){
    parent.removeChild(parent.lastChild);
    parent.removeChild(parent.lastChild);
  }
  if (this.name==timeWait){
      $(parent.childNodes[2]).replaceWith(textInput('timer'));
      parent.Type="wait";
      parent.data={"service":"wait","time":parent.childNodes[2].innerHTML};
      parent.childNodes[2].setAttribute('onchange',"changeProperty(this,'time')");
      console.log(parent.childNodes[2]);
  }
  else{
        parent.Type="sensor";
        $(parent.childNodes[2]).replaceWith(addindicator());
        var range=rangecontrol(this.name);
        range.style.width="100%";
        range.onchange=changerange2;
        var indicator=addindicator();
        indicator.innerHTML=range.value;
        parent.appendChild(range);
        parent.appendChild(indicator);
        parent.data={'device':'sensor','port':parent.childNodes[0].value,'time':1}
        switch (this.name) {
          case lightOn:
              parent.data['triggerType']="SmallerThan";
              parent.data['trigger']=parseInt(parent.lastChild.innerHTML);
              break;
          case lightOff:
              parent.data['triggerType']="GreaterThan";
              parent.data['trigger']=parseInt(parent.lastChild.innerHTML);
              break;
          case ultraLongerThan:
              parent.data['triggerType']="GreaterThan";
              parent.data['trigger']=parseInt(parent.lastChild.innerHTML);
              break;
          case ultraShorterThan:
              parent.data['triggerType']="SmallerThan";
              parent.data['trigger']=parseInt(parent.lastChild.innerHTML);
              break;
          case touchDown:
              if(parent.childNodes.length>5){
                parent.removeChild(parent.lastChild);
                parent.removeChild(parent.lastChild);
              };
              parent.data['triggerType']='touch';
              parent.data['trigger']=1;
              break;
          case touchUp:
              if(parent.childNodes.length>5){
                parent.removeChild(parent.lastChild);
                parent.removeChild(parent.lastChild);
              };
              parent.data['triggerType']='touch';
              parent.data['trigger']=0;
              break;
          // case timeWait:
          //         // if(parent.childNodes.length>5){
          //         //   parent.removeChild(parent.lastChild);
          //         //   parent.removeChild(parent.lastChild);
          //         //   parent.removeChild(parent.lastChild.previousSibling);
          //         // }
          //         // else{
          //         //   parent.removeChild(parent.lastChild.previousSibling);
          //         // }
          //         // parent.appendChild(textInput("timer"));
          //         // parent.data={"service":"wait","time":parent.lastChild.value};
          //         // parent.lastChild.setAttribute('onchange',"changeProperty(this,'time')");
          //         if(parent.childNodes.length>5){
          //           parent.removeChild(parent.lastChild);
          //           parent.removeChild(parent.lastChild);
          //         };
          //         $(parent.childNodes[2]).replaceWith(textInput('timer'));
          //         parent.data={"service":"wait","time":parent.childNodes[2].innerHTML};
          //         parent.childNodes[2].setAttribute('onchange',"changeProperty(this,'time')");
          //         console.log(parent.childNodes[2]);
          //     break;
          default:
           break;
    //}
   }
}
  console.log(parent.childNodes);
  console.log(this.parentNode.parentNode.parentNode.data);
}
function removeItem(){
  var Parent=this.parentNode.parentNode.parentNode.parentNode;
  console.log(Parent.id);
  var Child=this.parentNode.parentNode.parentNode;
  //console.log(Child);
  var target=Child.indx;
  console.log(target);
  if(target==itemlist.length){
    itemlist.pop();}
  else{
  itemlist.splice(target,1);
  for(var i=target;i<itemlist.length;i++){
    console.log("before"+itemlist[i].indx);
    itemlist[i].indx=itemlist[i].indx-1;
    console.log("after"+itemlist[i].indx);
  }}
  Parent.removeChild(Child);
  console.log(itemlist);
  Indx=Indx-1;
}
function motorPort(item){
  for (var i=65;i<69;i++){
    var letter = String.fromCharCode(i);
    var port=document.createElement("option");
    port.value=letter;
    port.innerHTML=letter;
    item.childNodes[0].appendChild(port);
  }
  var port=document.createElement("option");
  port.innerHTML='AB';
  item.childNodes[0].appendChild(port);
  // var port=document.createElement("option");
  // port.innerHTML='BC';
  // item.childNodes[0].appendChild(port);
  // var port=document.createElement("option");
  // port.innerHTML='ABC';
  // item.childNodes[0].appendChild(port);
}
function changeport(item){
 console.log(item.value);
 item.parentNode.data['port']=item.value;
 console.log(item.parentNode.data);
}
function changeProperty(item,key){
  item.parentNode.data[key]=item.value;
  //console.log(item.parentNode.data);
}
function textInput(type){
  var timer=document.createElement("input");
  timer.setAttribute("type","text");
  timer.style.width="100%";
  timer.style.height="25%";
  timer.onclick=clearContent;
  switch (type) {
    case 'motor':
         timer.value="40";
      break;
    case 'timer':
         timer.value="time(s)";
      break;
    default:
         timer.value="";
  }
  return timer;
}
function clearContent(){
  this.value='';
}
function clearInnerHTML(){
  this.innerHTML='0';
}
function create(item){
   //print(parkinglot.childNodes);
if(itemlist.length<8){
   var node=new newItem();
   node=node.mother;
   //console.log(node.childNodes);
   //print(parkinglot.childNodes);
   var name;
   switch (item){
     case 'sensor':
          name='sensor';
          break;
     case 'timerchoice':
          name='timerchoice';
          break;
     default:
          name=document.getElementById(item).id;

   }
   switch (name) {
     case "style/light1.png":
         //layout(node);
         node.Type="sensor";
         node.childNodes[1].src="style/light1.png";
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('light'));
         node.data={"device":node.Type,"triggerType":"SmallerThan","port":node.childNodes[0].value,"time":1,"trigger":30};
         break;
     case "style/light0.png":
         node.Type="sensor";
         node.childNodes[1].src="style/light0.png";
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('light'));
         node.data={"device":node.Type,"triggerType":"GreaterThan","port":node.childNodes[0].value,"time":1,"trigger":30};
         break;
     case "style/turnleft.png":
         //print(parkinglot.childNodes);
         node.Type="motor";
         node.childNodes[1].src="style/turnleft.png";
         //node.appendChild(addcontrol('motor'));
         node.appendChild(textInput('motor'));
         motorPort(node);
         node.appendChild(DropDown('motor'));
         node.data={"device":node.Type,"cmd":"run","port":node.childNodes[0].value,"speed":node.childNodes[2].value,"time":0.1};
         node.data["direction"]="left";
         node.childNodes[2].setAttribute("onchange","changeProperty(this,'speed')");
         break;
     case "style/turnright.png":
         //print(parkinglot.childNodes);
         node.Type="motor";
         node.childNodes[1].src="style/turnright.png";
         //node.appendChild(addcontrol('motor'));
         node.appendChild(textInput('motor'));
         motorPort(node);
         node.appendChild(DropDown('motor'));
         node.data={"device":node.Type,"cmd":"run","port":node.childNodes[0].value,"speed":node.childNodes[2].value,"time":0.1};
         node.data["direction"]="right";
         node.childNodes[2].setAttribute("onchange","changeProperty(this,'speed')");
         break;
     case "style/stop.png":
         node.Type="motor";
         //node.childNodes[0].style.display="none";
         node.childNodes[1].src="style/stop.png";
         //node.childNodes[1].style.position="relative";
         //node.childNodes[1].style.top="18px";
         motorPort(node);
         node.appendChild(DropDown('stop'));
         node.data={"device":node.Type,"port":node.childNodes[0].value,"cmd":"stop","time":0};
         break;
     case "style/touch1.png":
         node.Type="sensor";
         node.childNodes[1].src="style/touch1.png";
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('touch'));
         node.data={"device":node.Type,"triggerType":"touch","port":node.childNodes[0].value,"time":0.2,"trigger":1};
         break;
     case "style/touch0.png":
         node.Type="sensor";
         node.childNodes[1].src="style/touch0.png";
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('touch'));
         node.data={"device":node.Type,"triggerType":"touch","port":node.childNodes[0].value,"time":0.2,"trigger":0};
         break;
    case "style/timer.png":
         node.Type="wait";
         node.childNodes[1].src="style/timer.png";
         node.childNodes[0].style.display="none";
         node.appendChild(textInput('timer'));
         node.appendChild(DropDown());
         node.data={"service":node.Type,"time":node.childNodes[2].value};
         node.childNodes[2].setAttribute("onchange","changeProperty(this,'time')");
         node.style.top=(icon_top+0.3*icon_size).toString()+"px";
         break;
    case "timerchoice":
          node.Type="wait";
          node.childNodes[1].src="style/1s.png";
          node.childNodes[0].style.display="none";
          //node.appendChild(textInput('timer'));
          //node.childNodes[2].style.visibility="hidden";
          node.appendChild(DropDown('timerchoice'));
          node.data={"service":node.Type,"time":'1'};
          //node.childNodes[2].setAttribute("onchange","changeProperty(this,'time')");
          node.style.top=(icon_top+0.3*icon_size).toString()+"px";
          break;

    case ultraLongerThan:
         node.Type="sensor";
         node.childNodes[1].src=ultraLongerThan;
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('ultrasonic'));
         node.data={"device":node.Type,"triggerType":"GreaterThan","port":node.childNodes[0].value,"time":0.2,"trigger":500};
         break;
    case ultraShorterThan:
         node.Type="sensor";
         node.childNodes[1].src=ultraShorterThan;
         sensorPort(node);
         node.appendChild(addindicator());
         node.appendChild(DropDown('ultrasonic'));
         node.data={"device":node.Type,"triggerType":"SmallerThan","port":node.childNodes[0].value,"time":0.2,"trigger":500};
         break;
    case 'sensor':
          node.Type="sensor";
          node.childNodes[1].src=touchDown;
          sensorPort(node);
          node.appendChild(addindicator());
          node.appendChild(DropDown('sensor'));
          node.data={"device":node.Type,"triggerType":"touch","port":node.childNodes[0].value,"time":0.2,"trigger":1};
          break;

   }
  itemlist.push(node);
  node.indx=Indx;
  Indx=Indx+1;
  node.childNodes[0].setAttribute("onchange","changeport(this)");
  document.getElementById("parkinglot").appendChild(node);
 }
 else{
   alert("Maximum number of blocks is exceeded");
 }
}

//utility for creating control elements
function getName(item){
  var name=document.getElementById(item).id;
  //console.log(name);
  return name;
  //clicktestfunction(name);
  $(name).mousemove(function( event ) {
    $( "#position4" ).position({
      my: "left+3 bottom-3",
      of: event,
      collision: "fit"
    });
  });
}
function getPosition(ev){
   var x=ev.clientX.toString();
   //var id=ev.target.id="drag1";
   console.log(typeof(ev.target));
   console.log(x);
   ev.dataTransfer.setData("text", x);
   //console.log(posi);
}
function printLocation(){
  for(var i=0;i<itemlist.length;i++){
    console.log(itemlist[i].xposi);
  };
}
function allowDrop(ev) {
    ev.preventDefault();
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    //ev.target.appendChild(document.getElementById("drag1"));
    console.log(data);
}



//Running synchronized control elements
var interval;
function runCommand(item){
  if(ev3address==''){
    alert("You are not binded with any ev3");
  }
  else{
     if(blinkIndicator==0){
        runStatus="normal";
        item.parentNode.style.backgroundColor="red";
        fire();
        runIndicator=setInterval(function(){$("#Run").fadeOut(200).fadeIn(200);},500);
        blinkIndicator=1;
     }
     else{
        stopAll();
        $("#test_result").html('interruped by user');
        blinkIndicator=0;
     }
  }
}
function totalTime(){
  var duration=0;
  for(var i=0;i<itemlist.length;i++){
    duration=duration+itemlist[i].data['time']*1000;
  }
  return duration;
}
function commands(){
    var delay=0;var i=0;
    for(var i=0;i<itemlist.length;i++){
    var data=JSON.stringify(itemlist[i].data);
    delay=delay+itemlist[i].data['time']*1000;
    command(ev3address,data,itemlist[i],delay);
   }
   //runningTime=delay;
}
function command(ev3address,data,item,delay){
  setTimeout(function(){socketCommunication(ev3address,data,item)},delay);
}
//document.getElementById("currentCommand").addEventListener("change", fire);
//var trigger=document.getElementById("currentCommand").innerHTML;
function fire(){
  var index=document.getElementById("currentCommand").value;
  console.log(index);
  index=parseInt(index);
  var data=JSON.stringify(itemlist[index].data);
  print(data);
  //socketCommunication(ev3address,data,itemlist[index]);
  console.log(itemlist[index].address);
  socketCommunication(itemlist[index].address,data,itemlist[index]);

}
function changetrigger(){
  var trigger=document.getElementById("currentCommand");
  console.log(trigger.innerHTML);
  var Next=parseInt(trigger.innerHTML)+1;
  print(Next);
  trigger.innerHTML=Next.toString();
  return Next;
  }
function sleep(time) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > time){
      break;
    }
  }
}
function deleteItem(item){
  var parent=document.getElementById("parkinglot");
}


//Bumper Car Section
//
// function BumperCarSetup(){
//   create(motorLeft);
//   create(stop);
//   create(motorLeft);
//   create(touchDown);
//   create(motorLeft);
//   create(stop);
//   create(motorLeft);
//   create(touchDown);
// }
//
// //Preset function Test
// function touchControl(){
//   var data={"service":"touchSensorControl"};
//   data=JSON.stringify(data);
//   socketCommunication(ev3address,data);
// }
// //EV3 actions
// function runMotor(){
//   data={'device':'motor','cmd':'run','A':'20','B':'20','time':2};
//   data=JSON.stringify(data);
//   socketCommunication(ev3address,data);
// }
// function stopMotor(){
//   data={'device':'motor','cmd':'stop'};
//   data=JSON.stringify(data);
//   socketCommunication(ev3address,data);
// }
// function readsensor(){
//     var data={'device':'sensor','port':'port1'};
//     data=JSON.stringify(data);
//     socketCommunication(ev3address,data);
//     reading=message_handle(message);
//     return reading;
// }
// function sensorControlMotor(){
//     var data={'service':'SCM','sPort':1,'sLimit':1,'mPort':'B','mSpeed':20};
//     data=JSON.stringify(data);
//     socketCommunication(ev3address,data);
//     //var read=readsensor();
// }
function stopAll(){
    clearInterval(runIndicator);
    //blinkIndicator=0;
    document.getElementById("run").style.backgroundColor="transparent";
    var data={'service':'stopAll'};
    data=JSON.stringify(data);
    socketCommunication(ev3address,data);
    //clearInterval(interval);
    var loopstatus=document.getElementById("setloop").src;
    loop=0;
    runStatus="interruped";
    //runIndicator=0;
    document.getElementById("setloop").src="style/onetime.png";
    $("#currentCommand").html(0);
}
function Stop(){
  clearInterval(runIndicator);
  blinkIndicator=0;
  document.getElementById("run").style.backgroundColor="transparent";
  var data={'service':'stop'};
  data=JSON.stringify(data);
  socketCommunication(ev3address,data);
  loop=0;
  document.getElementById("setloop").src="style/onetime.png";
  $("#currentCommand").html(0);

}
function wait(time){
    var data={'service':'wait','time':time};
    data=JSON.stringify(data);
    socketCommunication(ev3address,data);
}
function clearinterval(){
  clearInterval(runIndicator);
}


//Pilot section
function presets(item){
  print(item.value);
  var preset=item.value;
  switch (preset) {
    case 'Pilot 1':
      clearNodes("parkinglot");
      pilot1();
      break;
    case 'Pilot 3':
      clearNodes("parkinglot");
      pilot3();
      break;
    case 'Pilot 5':
      clearNodes("parkinglot");
      pilot5();
      break;
    default:
      clearNodes("parkinglot");
      pilot1();

  }
}
function pilot1(){
  clearNodes("parkinglot");
  create(motorLeft);
  create('timerchoice');
  create(motorRight);
  create('timerchoice');
if(screen_size<1000&&screen_size>700){
  itemlist[0].style.left="170px";
  itemlist[1].style.left="270px";
  itemlist[2].style.left="370px";
  itemlist[3].style.left="470px";}
else if(screen_size>1200){
  itemlist[0].style.left="270px";
  itemlist[1].style.left="370px";
  itemlist[2].style.left="470px";
  itemlist[3].style.left="570px";
}

  for (var i=0;i<itemlist.length;i++){
    $(itemlist[i]).draggable({
      disabled:true
    })
  }
}
function pilot3(){
  var start=60;
  var temp;
  var size=65;
  var padding=15;
  create(motorLeft);
  create(motorLeft);
  create(motorLeft);
  create('sensor');
  create(motorRight);
  create(motorRight);
  create(motorRight);
  create('sensor');
  for(var i=0;i<3;i++){
    itemlist[i].childNodes[0].value=String.fromCharCode(i+65);
    itemlist[i].data['port']=itemlist[i].childNodes[0].value;
  }
  for(var i=4;i<7;i++){
    itemlist[i].childNodes[0].value=String.fromCharCode(i+61);
    itemlist[i].data['port']=itemlist[i].childNodes[0].value;
  }
  if(screen_size>1200){
    itemlist[0].style.left="70px";
    itemlist[1].style.left="150px";
    itemlist[2].style.left="230px";
    itemlist[3].style.left="350px";
    itemlist[4].style.left="480px";
    itemlist[5].style.left="560px";
    itemlist[6].style.left="640px";
    itemlist[7].style.left="760px";
  }
  else if(screen_size<1000&&screen_size>700){
    itemlist[0].style.left="70px";
    itemlist[1].style.left="140px";
    itemlist[2].style.left="210px";
    itemlist[3].style.left="300px";
    itemlist[4].style.left="390px";
    itemlist[5].style.left="460px";
    itemlist[6].style.left="530px";
    itemlist[7].style.left="620px";
  }
  for (var i=0;i<itemlist.length;i++){
    $(itemlist[i]).draggable({
      disabled:true
    })
  }
}
function pilot5(){
  create(motorLeft);
  create(touchDown);
  create(stop);
  create(ultraShorterThan);
  create(motorRight);
  create(lightOff);
}


//uitiity functions
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
function clicktestfunction(text){
    $("#test_result").html(text);
    $("#test_result").fadeOut(200).fadeIn(200);
}
function print(item){
    console.log(item);
}
function getelementvalue(item){
   var display=document.getElementById(item).value;
   clicktestfunction(display);
}
function readSlider(item){
    item.title=item.value;
}
function clearNodes(pid){//parent identification
    parent=document.getElementById(pid);
    childnodes=parent.childNodes;
    //console.log(childnodes.length);
    //console.log(childnodes);
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
    itemlist=[];
    //targetlist=[];
    Indx=0;
    //for(var i=0;i<6;i++){var n=new newTarget()};
}
function checkitem(item){
    clicktestfunction(item.src.substr(28));
}
function setLoop(item){
  switchIcon(item)
  loop=1;
  print(loop);
}
function setOnetime(item){
  switchIcon(item)
  loop=0;
}
function switchIcon(item){
  var newicon=item.src;
  console.log(item.parentNode.parentNode.parentNode.childNodes);
  item.parentNode.parentNode.parentNode.childNodes[1].src=newicon;
}
function changeBackGround(item,fill,type){
  if (type=='color'){
  item.style.backgroundColor=fill;
  }
  else if (type=='image') {
  item.style.backgroundImage=fill;
  }
  else{

  }
}
function printItemList(){
  for (var i=0;i<itemlist.length;i++){
  console.log(itemlist[i].data);
  }
}
