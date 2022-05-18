var $$ = go.GraphObject.make, 
diagram = $$(go.Diagram, "myDiagramDiv",{
    initialContentAlignment:  go.Spot.Center,
    "toolManager.mouseWheelBehavior":  go.ToolManager.WheelZoom,//通过鼠标滚轮放大或缩小画布 
    // moving and copying nodes also moves and copies their subtrees
    "commandHandler.copiesTree": true,  // for the copy command
    "commandHandler.copiesParentKey" :  true ,
    "commandHandler.deletesTree": true, // for the delete command
    "draggingTool.dragsTree": true,  // dragging for both move and copy
    "undoManager.isEnabled": true  
});

diagram.nodeTemplate =
    $$(go.Node, "Auto",
    $$(go.Shape, "RoundedRectangle",
        { fill: "yellow" },
        new go.Binding("fill", "color")),
    $$(go.TextBlock,
        { margin: 5 ,
        editable:true,
        text:"Object" 
        },
        new go.Binding("text", "key").makeTwoWay()) 
    );

diagram.layout = $$(go.TreeLayout);
diagram.model.undoManager.isEnabled = true;

var $=function(id){
    return document.getElementById(id);
};



diagram.addDiagramListener("BackgroundContextClicked",
    function(e){
        addObj();
    }
);


addObj = function(){
    diagram.commit(function(d) {
    diagram.startTransaction("Add Node");
    var newnode = {key: "Object", color:"#ec8c69"};
    d.model.addNodeData(newnode);
    diagram.commitTransaction("Add Node");
    }, "add node and link");
}

addAtt = function(){
    var selnode = diagram.selection.first();
	if (!(selnode instanceof go.Node)) return;
	diagram.commit(function(d) {
        diagram.startTransaction("Add Node");
		// have the Model add a new node data
		var newnode = { key: "Attribute", color:"lightblue"};
		d.model.addNodeData(newnode);  // this makes sure the key is unique
		// and then add a link data connecting the original node with the new one
		var newlink = { from: selnode.data.key, to: newnode.key };
		// add the new link to the model
		d.model.addLinkData(newlink);
        diagram.commitTransaction("Add Node");
	}, "add node and link");
};

addRel = function() {
	var selnode = diagram.selection.first();
	if (!(selnode instanceof go.Node)) return;
	diagram.commit(function(d) {
        diagram.startTransaction("Add Node");
		var newnode = { key: "relationship", color:"yellow"};
		d.model.addNodeData(newnode); 
		var newlink = { from: selnode.data.key, to: newnode.key };
		d.model.addLinkData(newlink);
        addAimObj(newnode);
        diagram.commitTransaction("Add Node");
	}, "add node and link");
};

addAimObj = function(newnode){
    diagram.commit(function(d) {
        diagram.startTransaction("Add Node");
		var newnode1 = { key: "AimObject", color:"#ec8c69"};
		d.model.addNodeData(newnode1); 
		var newlink1 = { from: newnode.key, to: newnode1.key };
		d.model.addLinkData(newlink1);
        diagram.commitTransaction("Add Node");
	}, "add node and link");
}


linkNode = function(){
    var obj =[ {key:"0"},{key:"0"}];
    var i=0;
        diagram.addDiagramListener("ObjectContextClicked",
        function(e){
            var part = e.subject.part;
            if(!(part instanceof go.Link)) var firstObject = part.data;
            console.log("firstObject   "+firstObject.key);
                obj[i]= firstObject;
                i++;
                if(i==2){
                    var newlink2 = { from: obj[0].key, to: obj[1].key };
                    diagram.model.addLinkData(newlink2);
                    obj = [ {key:"0"},{key:"0"}];
                    i=0;
                }
        }
        );
}

linkNode();


AddAttFromButton = function(value){
    var selnode = diagram.selection.first();
	if (!(selnode instanceof go.Node)) return;
	diagram.commit(function(d) {
        diagram.startTransaction("Add Node");
		// have the Model add a new node data
		var newnode = { key: value, color:"lightblue"};
		d.model.addNodeData(newnode);  // this makes sure the key is unique
		// and then add a link data connecting the original node with the new one
		var newlink = { from: selnode.data.key, to: newnode.key };
		// add the new link to the model
		d.model.addLinkData(newlink);
        diagram.commitTransaction("Add Node");
	}, "add node and link");
};

AddRelFromButton = function(value){
    var selnode = diagram.selection.first();
	if (!(selnode instanceof go.Node)) return;
	diagram.commit(function(d) {
        diagram.startTransaction("Add Node");
		var newnode = { key: value, color:"yellow"};
		d.model.addNodeData(newnode); 
		var newlink = { from: selnode.data.key, to: newnode.key };
		d.model.addLinkData(newlink);
        addAimObj(newnode);
        diagram.commitTransaction("Add Node");
	}, "add node and link");
};


function layoutTree(node) {
    if (node.data.key === 0) {  // adding to the root?
      layoutAll();  // lay out everything
    } else {  // otherwise lay out only the subtree starting at this parent node
      var parts = node.findTreeParts();
      layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
    }
  }

diagram.addDiagramListener("Modified", e => {
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !diagram.isModified;
    var idx = document.title.indexOf("*");
    if (diagram.isModified) {
        if (idx < 0) document.title += "*";
    } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
    }
});
function save() {
    /* document.getElementById("mySavedModel").value = diagram.model.toJson();
    diagram.isModified = false; */
    download('Json.txt', diagram.model.toJson());
}
/* function load() {
    diagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
} */
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

//读取文件
function load(){
var inputElement = document.getElementById("files");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
var selectedFile = document.getElementById("files").files[0];//获取读取的File对象
var name = selectedFile.name;//读取选中文件的文件名
var size = selectedFile.size;//读取选中文件的大小
//console.log("文件名:"+name+"大小："+size);
var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
reader.readAsText(selectedFile);//读取文件的内容
//生成模型
reader.onload = function(){
    //console.log(this.result);
    var text = this.result;
    //console.log(text);
    var nodeB = text.indexOf("nodeDataArray");
    var nodeS = text.indexOf("],");
    var linkB = text.indexOf("linkDataArray");
    var linkS = text.indexOf("]}");
    var nodeStr = text.substring(nodeB+17,nodeS);
    var linkStr = text.substring(linkB+17,linkS);
    //console.log(nodeStr);
    //console.log(linkStr);
    var L1 = nodeStr.length;
    var L2 = linkStr.length;
    var keyStr;
    var colorStr;
    var FromStr;
    var ToStr;
    for(i=0;i<L1;i++){
        if(nodeStr[i]==":"){
            for(j=i;j<L1;j++){
                if(nodeStr[j]==",")
                {
                    keyStr = nodeStr.substring(i+2,j-1);
                    //console.log(keyStr);
                    break;
                }
                else if(nodeStr[j]=="}"){
                    colorStr = nodeStr.substring(i+2,j-1);
                   //console.log(colorStr);
                    var tem = { key: keyStr, color: colorStr};
                    diagram.model.addNodeData(tem);
                    break;
                }
            }
        }
    }

    for(count=0;count<L2;count++){
        if(linkStr[count]==":"){
            for(countL=count;countL<L2;countL++){
                if(linkStr[countL]==",")
                {
                    FromStr = linkStr.substring(count+2,countL-1);
                    //console.log(FromStr);
                    break;
                }
                else if(linkStr[countL]=="}"){
                    ToStr = linkStr.substring(count+2,countL-1);
                    //console.log(ToStr);
                    var temp = { from: FromStr, to: ToStr};
                    diagram.model.addLinkData(temp);
                    break;
                }
            }
        }
    }
};
}
}


// When the blob is complete, make an anchor tag for it and use the tag to initiate a download
// Works in Chrome, Firefox, Safari, Edge, IE11
function myCallback(blob) {
    var url = window.URL.createObjectURL(blob);
    var filename = "mySVGFile.svg";

    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = filename;

    // IE 11
    if (window.navigator.msSaveBlob !== undefined) {
        window.navigator.msSaveBlob(blob, filename);
        return;
    }

    document.body.appendChild(a);
    requestAnimationFrame(function() {
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
    }
//生成svg 并下载
function makeSvg() {
var svg = diagram.makeSvg({ scale: 1, background: "white" });
var svgstr = new XMLSerializer().serializeToString(svg);
var blob = new Blob([svgstr], { type: "image/svg+xml" });
myCallback(blob);
}
  
  


/* ADD COMMON OBJECTS */
function AddObjMan(){
    var newnode = {key: "man", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "river", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "bench", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "big ears", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "shirt", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "jeans", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "bald", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "thinking", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "worried", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "lost", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "asian", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "wears", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "has", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "sits on", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "in front of", color:"yellow"};
    diagram.model.addNodeData(newnode);
    var newlink = {from:"man",to:"thinking"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"bald"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"worried"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"lost"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"wears"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"has"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"sits on"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"in front of"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"sits on",to:"bench"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"in front of",to:"river"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"wears",to:"jeans"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"wears",to:"shirt"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"has",to:"big ears"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"man",to:"asian"};
    diagram.model.addLinkData(newlink);
}
function AddObjCat(){
    var newnode = {key: "cat", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "cup", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "desk", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "black", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "eating", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "fluffy", color:"lightblue"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "behind", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "sitting on", color:"yellow"};
    diagram.model.addNodeData(newnode);

    var newlink = {from:"cat",to:"behind"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"behind",to:"cup"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"cat",to:"sitting on"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"sitting on",to:"desk"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"cat",to:"black"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"cat",to:"eating"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"cat",to:"fluffy"};
    diagram.model.addLinkData(newlink);
}
function AddObjBus(){
    var newnode = {key: "bus", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "tree", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "woman", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "yellow", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "parked", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "old", color:"lightblue"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "under", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "waiting for", color:"yellow"};
    diagram.model.addNodeData(newnode);

    var newlink = {from:"bus",to:"parked"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"bus",to:"yellow"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"bus",to:"smaller"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"bus",to:"under"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"under",to:"tree"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"bus",to:"waiting for"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"waiting for",to:"woman"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"woman",to:"old"};
    diagram.model.addLinkData(newlink);
}
function AddObjCup(){
    var newnode = {key: "chair", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "table", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "dinning room", color:"#ec8c69"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "wooden", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "green", color:"lightblue"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "weathered", color:"lightblue"};
    diagram.model.addNodeData(newnode);

    newnode = {key: "near", color:"yellow"};
    diagram.model.addNodeData(newnode);
    newnode = {key: "at", color:"yellow"};
    diagram.model.addNodeData(newnode);

    var newlink = {from:"chair",to:"wooden"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"chair",to:"green"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"chair",to:"near"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"near",to:"table"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"chair",to:"at"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"at",to:"dinning room"};
    diagram.model.addLinkData(newlink);
    newlink = {from:"chair",to:"weathered"};
    diagram.model.addLinkData(newlink);
}