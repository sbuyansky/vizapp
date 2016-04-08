//graph.js
//handles updating and drawing of graph


var Graph = function(){
    var self = this;

    self.init()
}


Graph.prototype.init = function(){
    var self = this;

    self.width = 1200;
    self.height = 450;
    self.margins = {top:10, right:0, bottom:80, left:40};

    self.graph_width = self.width - self.margins.right - self.margins.left;
    self.graph_height = self.height - self.margins.top - self.margins.bottom;
    
    self.age_group_mapping = {
            34 : "2 - 4", 
            6 : "5 - 9",
            7 : "10 - 14",
            8 : "15 - 19",
            9 : "20 - 24",
            10: "25 - 29",
            11: "30 - 34",
            12: "35 - 39",
            13: "40 - 44",
            14: "45 - 49",
            15: "50 - 54",
            16: "55 - 59",
            17: "60 - 64",
            18: "65 - 69",
            19: "70 - 74",
            20: "75 - 79",
            21: "80+"};
    self.age_group_ids = [
            34, 
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21];

    self.svg = d3.select("#graph").append("svg")
        .attr("width", self.width)
        .attr("height", self.height)
        .append("g")
        .attr("transform", "translate(" + self.margins.left  + "," + self.margins.top  +")");

    self.svg.append("text")
        .attr("id", "loading")
        .attr("x", self.graph_width/2)
        .attr("y", self.graph_height/2 - 50)
        .text("Loading...");
		
	self.initGraph();
}

Graph.prototype.initGraph = function(){
    var self = this;

    self.xscAgeGroups = d3.scale.ordinal()
        .rangeRoundBands([0, self.graph_width], .1)
        .domain(self.age_group_ids);

    self.yscPrevalence = d3.scale.linear()
        .range([self.graph_height, 0])
        .domain([0, 100]);
    
    //initialize x axis
    var xAxis = d3.svg.axis()
        .scale(self.xscAgeGroups)
        .tickFormat(function(d){
            return self.age_group_mapping[d]
        })
        .orient("bottom");
    
    self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.graph_height + ")")
        .call(xAxis)
        .append("text")
        .text("Age Group (Years)")
        .attr("transform", "translate(0,40)");

    //initialize y axis
    var yAxis = d3.svg.axis()
        .scale(self.yscPrevalence)
        .orient("left");
		
    self.svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "")
        .attr("transform", "translate(10,0),rotate(-90)")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Overweight Prevalence (%)");

    //add a 50% line
    self.svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", self.graph_height/2)
        .attr("x2", self.graph_width)
        .attr("y2", self.graph_height/2)
        .style("stroke","rgb(0,0,0)")
        .style("stroke-width","1");
    
}

Graph.prototype.createLegend = function(locations){
    var self = this;
    var legend = self.svg.selectAll(".legend")
        .data(locations.collection, function(d){return d.name});
	
    legend.transition()
        .duration(500)
        .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });
	
    var newLegends = legend.enter()
        .append("g")
        .attr("class", "legend")
        .style("font-size","12px")
        .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

    newLegends.append("rect")
        .attr("x", self.margins.left)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", function(d){return d.color});
            
    newLegends.append("text")
        .attr("x", self.margins.left + 25)
        .attr("y", 9);
            
    newLegends.attr("opacity", "0")
        .transition()
        .duration(500)
        .attr("opacity", "1");
    
    legend
        .selectAll("text")
        .text(function(d) {return d.name; });
    
    legend.exit().remove();
}

Graph.prototype.updateGraph = function(data, locations){
    var self = this;

	
    self.xscGlobalRegion = d3.scale.ordinal()
        .domain(locations.collection.map(function(d){return d.id}))
        .rangeRoundBands([0, self.xscAgeGroups.rangeBand()]);
		
    var prevalences = self.svg.selectAll("rect.prevalences")
        .data(data, function(d){return d.location_id + "^" + d.age_group_id});

    prevalences.enter().append("rect")
        .attr("class", "prevalences")
        .attr("width", self.xscGlobalRegion.rangeBand())
        .attr('height', 0)
        .attr("x", function(d) { return self.xscAgeGroups(d.age_group_id) + self.xscGlobalRegion((d.location_id)); })
        .attr("y", self.graph_height)
        .style("fill", function(d) {return locations.getColor(d.location_id)})
        .append("svg:title")
        .text(function(d){return (d.mean * 100).toFixed(2) + "%"});

    prevalences.transition()
        .duration(500)
        .attr("width", self.xscGlobalRegion.rangeBand())
        .attr("height", function(d) { return self.graph_height - self.yscPrevalence(d.mean * 100); })
        .attr("x", function(d) { return self.xscAgeGroups(d.age_group_id) + self.xscGlobalRegion((d.location_id)); })
        .attr("y", function(d) { return self.yscPrevalence(d.mean * 100); })
   
    prevalences.exit().remove(); 
	
    self.createLegend(locations);
}
