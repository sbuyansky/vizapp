//viapp.js
//Handles page setup and data updating

var VizApp = function(){
    var self = this;

    self.init();
}


VizApp.prototype.init = function(){
    var self = this;

    self.data_full = [];
    self.data_filtered = [];
    self.location_mapping = {};
    self.locations = new Locations();
    self.graph = new Graph();
    self.MAX_LOCATIONS = 3;

    //load data	
    d3.csv("data/obesity_data_2013.csv", function(data){
        self.data_full = data;
 
        d3.csv("data/countries.csv", function(data){
            d3.select("#loading").style("opacity",0);    
            data.forEach(function(e,i){
                self.location_mapping[e.location_id] = e.location_name;
            });

            //initialize selection boxes
            self.initLocationSelector();
				
            //start with Global and US
            self.locations.addLocation(1, self.location_mapping[1]);
            self.locations.addLocation(102, self.location_mapping[102]);
            
            //update selection boxes, data, graph
            self.update();
        });
    });
}

VizApp.prototype.updateFilteredData = function(){
    var self = this;
	
    var location_ids = self.locations.collection.map(function(d){return d.id});

    //country is variable, everything else constant
    self.data_filtered = self.data_full.filter(function(row){
        return (row.age_group_id < 36 && row.metric == "overweight" && row.year == "2013" && location_ids.includes(parseInt(row.location_id, 10)) && row.sex_id == "3");
    });
};

VizApp.prototype.initLocationSelector = function(){
    var self = this;

    var locationsSource = [];
    
    Object.keys(self.location_mapping).forEach(function(e,i){
        locationsSource.push({label: self.location_mapping[e], value: e})
    });
    for(var i=0;i < self.MAX_LOCATIONS; i++){
        $("#selector").append(
            $("<input>",{
                pos: i,
                class: "select location" + i
            })
        );
        $("#selector").append(
            $("<input>",{
                class: "button location" + i,
                value: "Clear",
                type:  "button",
                onclick: "vizApp.clearLocation(" + i + ");"
            })
        );

        $("input.select.location" + i).autocomplete({
            source: locationsSource,
            select: function(evt, ui) {
                
                var index = parseInt(evt.target.attributes.pos.value);

                //check for duplicates
                if(self.locations.hasLoc(ui.item.value)){
                    alert("Duplicates are not allowed");
                    evt.preventDefault(); 
                    return;
                }
                if(index == self.locations.size()){
                    self.locations.addLocation(ui.item.value, self.location_mapping[ui.item.value]);
                }
                else{
                    self.locations.changeLocation(ui.item.value, self.location_mapping[ui.item.value], index);
                }
                self.update();
                $("input.select.location" + i).val(ui.item.label);
                evt.preventDefault();
            },
            focus: function(evt, ui){
                $("input.select.location" + i).val(ui.item.label);
                evt.preventDefault();
            }
        });
    }
    $("#selector").css("visibility", "visible"); 
}

VizApp.prototype.updateLocationSelector = function(){
    var self = this;
    var numLocations = self.locations.size();

    for(var i=0; i < numLocations; i++){
        $("input.select.location" + i).val(self.locations.collection[i].name);
        $("input.location" + i).show();
    }
    $("input.select.location" + numLocations).show();
    $("input.select.location" + numLocations).val("");
    $("input.button.location" + numLocations).hide();
    for(var i=numLocations+1; i < self.MAX_LOCATIONS;i++){
        $("input.location" + i).hide();
    }
}

VizApp.prototype.clearLocation = function(index){
    var self = this;

    self.locations.removeLocation(index);
    self.update();
}

VizApp.prototype.update = function(){
    var self = this;

    self.updateLocationSelector();
    self.updateFilteredData();
    self.graph.updateGraph(self.data_filtered, self.locations);
}
