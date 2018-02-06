 /**
 * This is the blob script called in example_draw.html
 * It simulates the blob, it's food source, and it's movement towards that food source.
 */


var simulation=function(){
    
    // define center of blob at start of simulation.
    var centerX = 250;
    var centerY = 250;
    var blobCenter = new jssim.Space2D(300,300);
    // define radius of blob 
    var radius = 15;
    var distanceMaxToCenter = radius;
    
    var Band = function(laxDistance, strength) {
	this.laxDistance = laxDistance;
	this.strength = strength;
    };

    var Boid = function(id, initial_x, initial_y, space, isMembrane, bands) {
        var rank = 1;
        jssim.SimEvent.call(this, rank);
        this.id = id;
        this.space = space;
        this.space.updateAgent(this, initial_x, initial_y);
        this.speed = 1;
        this.separation_space = radius;
        this.velocity = new jssim.Vector2D(Math.random(), Math.random());
        this.isMembrane = isMembrane;
        if(isMembrane){
            this.color = '#eeff00';
            this.size = 1;
	    	this.bands = bands;
        }
        else{
        	this.size = 2;
        	this.color = '#00ff00';    
        }
    };        
    
    Boid.prototype = Object.create(jssim.SimEvent);
    
    Boid.prototype.update = function(deltaTime) {
    
        var boids = this.space.findAllAgents();
        var pos = this.space.getLocation(this.id);
        
        if(this.isMembrane) {	    
            var food = null;
            var attraction_distance = 80;
            for (var boidId in boids)
            {
                var otherboid = boids[boidId];
                var otherboid_pos = this.space.getLocation(otherboid.id);
                var distance = pos.distance(otherboid_pos);
                
                if(! otherboid.isMembrane) {
                    //phospholipide attire par la nourriture la plus proche
                    if(distance < attraction_distance){
                    	if (distance < 5){
                    	console.log("OMNOM");
                    	otherboid.space.updateAgent(otherboid, 1000,1000); //la nourriture repop en dehors du canvas
                    	}
                    	else{
                        attraction_distance = distance;
                        food = otherboid;
                        }
                    }
                } else {
                    //maintient integrite de la membrane
                    if (distance < this.separation_space)
                    {
                        // Separation
                        this.velocity.x += (pos.x - otherboid_pos.x)* (1/(distance+1))*2;
                        this.velocity.y += (pos.y - otherboid_pos.y)* (1/(distance+1))*2;
                    }                   
                }
            }
            
            if(food != null) {
            	//phospholipide avance + vite dans la direction de la nouriture
            	console.log("om")
            	this.color="#ff0000";
                var food_position = this.space.getLocation(food.id);
                var distance_to_food = pos.distance(food_position);
                this.velocity.x += (food_position.x - pos.x);
                this.velocity.y += (food_position.y - pos.y);
                this.speed = 2;
            } 
            else {
            	this.color = '#eeff00';
                this.speed = 0.3;
                var distance_to_center = Math.sqrt(Math.pow((pos.x-centerX),2)+Math.pow((pos.y-centerY),2));
                if (distance_to_center > distanceMaxToCenter){
                	//si un pseudopode s'est forme precedement, il se retracte
                	this.color = '#0000ff';
                	this.velocity.x += (centerX - pos.x);
                	this.velocity.y += (centerY - pos.y);
                }         	
        	}
            
        }  else {
	    this.velocity.x = 0;
	    this.velocity.y = 0;
        }
	
        // check speed
        var speed = this.velocity.length();
        if(speed > this.speed) {
           this.velocity.resize(this.speed);
        }       	
        pos.x += this.velocity.x;
        pos.y += this.velocity.y;
        
        this.separation_space +=0.5; //permet une extension circulaire du blob
    };
    
    //rendu visuel
    Boid.prototype.draw = function(context, pos) {
        var size = this.size;
        context.fillStyle=this.color;
        context.beginPath();
		context.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
        context.fill();	
		context.fillStyle = '#ffffff';
    };
    
    var scheduler = new jssim.Scheduler();
    scheduler.reset();
    var space = new jssim.Space2D();
    space.reset();
    numLipids = 100;
    numFoods = 6;

    var bands = new jssim.Network(numLipids);
    space.network = bands;
    
    //Creation des agents : nourriture 
    var boid = new Boid(0, 100, 500, space, isMembrane=false);
    var boid = new Boid(1, 350, 300, space, isMembrane=false);
    var boid = new Boid(2, 500, 600, space, isMembrane=false);
    var boid = new Boid(3, 200, 120, space, isMembrane=false);
    var boid = new Boid(4, 300, 150, space, isMembrane=false);
    var boid = new Boid(5, 450, 400, space, isMembrane=false);
    
    //Creation des agents : phospholipides
    for (var i = numFoods; i < numLipids; i++) {
        var isMembrane = true;
		var startX = centerX + radius*Math.cos(2*Math.PI*(i/numLipids));
		var startY = centerY + radius*Math.sin(2*Math.PI*(i/numLipids));
        var boid = new Boid(i, startX, startY, space, isMembrane);
	
		var laxDistance = 10;
		var strength = 0;
		if (i > numFoods){
			//liaison entre les phospholipides	   
	    	var band = new Band(laxDistance, strength);
	    	bands.addEdge(new jssim.Edge(i,i-1,band)); 	    
		}
        scheduler.scheduleRepeatingIn(boid, 1);
    }
    // derniere liaison
    bands.addEdge(new jssim.Edge(numLipids-1,numFoods,band));        
    
    //Affichage
    var canvas = document.getElementById("myCanvas");
    setInterval(function(){ 
        scheduler.update();
        distanceMaxToCenter += 0.3;
        space.render(canvas);
        document.getElementById("simTime").value = "Simulation Time: " + scheduler.current_time;
    }, 100);
};

simulation();
