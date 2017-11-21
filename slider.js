(function(){
    var margin = 50;
	var width = 500;
    var height = 100;

	var container = d3.select("#slider");
	var svg = container.append("svg");
	svg.attr("width", width);
    svg.attr("height", height);
    var slider = svg.append("g")
    	.attr("class", "slider")
        .attr("transform", "translate(20,30)");

    var year_range = [1990, 2015];

    var year_ticks =[1990, 2000, 2010, 2015];
    var years = [1990, 2000, 2010, 2011, 2012, 2013, 2014, 2015];

    var x = d3.scaleLinear()
    	.domain(year_range)
    	.range([0, width-margin*2])
    	.clamp(true);

    slider.append("line")
    	.attr("class", "track")
    	.attr("x1", x.range()[0])
    	.attr("x2", x.range()[1])
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() {slider.interrupt();})
            .on("start drag", function() {
                var year = x.invert(d3.event.x);
                dragSlide(year); 
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "slider-ticks")
        .attr("transform", "translate(0," + 30 + ")")
        .selectAll("text")
        .data(year_ticks)
        .enter().append("text")
            .attr("x", x)
            .attr("text-anchor", "middle")
            .text(function(d) {return d;})
        .select(function() {
            return this.parentNode;
        })
        .selectAll("line")
        .data([2000, 2010, 2011, 2012, 2013, 2014])
        .enter().append("line")
            .attr("transform", "translate(0,-25)")
            .attr("x1", function(d) {
                return x(d);
            })
            .attr("y1", 0)
            .attr("x2", function(d) {
                return x(d);
            })
            .attr("y2", 4)
            .attr("stroke", "#bbb")
            .attr("stroke-width", 1);




    var handler = slider.insert("g", ".track-overlay")
        .attr("class", "handler-group")
        .append("circle")
        .attr("class", "handle")
        .attr("r", 9);

    var handler_text = handler.select(function() {
        return this.parentNode;
    }).append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, -15)")
        .text(year_range[0]);

    function dragSlide(h) {
        handler.attr("cx", x(h));
        var year = Math.floor(h);
        for(let i=years.length-1; i>=0; i--) {
            if(years[i] <= year) {
                year = years[i];
                break;
            }
        }
        eventDispatcher.call("sliderMove", this, year);
        handler_text.attr("x", x(h)).text(year);
    };

})();