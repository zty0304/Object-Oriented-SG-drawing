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