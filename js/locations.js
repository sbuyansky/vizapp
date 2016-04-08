//locations.js
//Keeps track of currently selected location info
//including name, id, and color

var Locations = function(){
    var self = this;

    self.init()
}

Locations.prototype.init = function(){
    var self = this;

    self.collection = [];
    self.colors = ['purple', '#84C664','#EB3833','#3251A1' ];
}

Locations.prototype.addLocation = function(id, name){
    var self = this;
	
    var color = self.colors.pop();
    
    var location = new Location(id, name, color);
    self.collection.push(location);
}

Locations.prototype.changeLocation = function(id, name, index){
    var self = this;
    index = parseInt(index);
    self.collection[index].id = parseInt(id);
    self.collection[index].name = name;
}

Locations.prototype.removeLocation = function(index){
    var self = this;

    var color = self.collection.splice(index, 1)[0].color;
	
    self.colors.push(color);
}

Locations.prototype.size = function(){
    var self = this;
    return self.collection.length;
}

Locations.prototype.getColor = function(id){
    var self = this;
    
    for(var i = 0; i < self.collection.length; i++){
        if(self.collection[i].id == id){
                return self.collection[i].color;
        }
    }
    return "black";
}

Locations.prototype.hasLoc = function(id){
    var self = this;

    for(var i = 0; i < self.collection.length; i++){
        if(self.collection[i].id == id){
                return true;
        }
    }
    return false;
}

var Location = function(id, name, color){
    var self = this;

    self.id = parseInt(id);
    self.name = name;
    self.color = color;
}
