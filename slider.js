(function(){
    var margin = 50;
	var width = 300;
    var height = 100;

	var container = d3.select("#slider");
	var svg = container.append("svg");
	svg.attr("width", width);
    svg.attr("height", height);
    var slider = svg.append("g")
    	.attr("class", "slider")
        .attr("transform", "translate(20,30)");

    var year_range = [1990, 2015];

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
                var year = Math.round(x.invert(d3.event.x));
                dragSlide(year); 
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "slider-ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(4))
        .enter().append("text")
            .attr("x", x)
            .attr("text-anchor", "middle")
            .text(function(d) {return d;});



    var handler = slider.insert("g", ".track-overlay")
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
        handler_text.attr("x", x(h)).text(h);
    };

})();