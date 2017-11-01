(function(){
	var width = 650;
	var height = 800;
	var container = d3.select("#multivariate");
	var svg = container.append("svg");
	svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
	  .scale([100])
	  .center([0,0])
	  .translate([width/2, height/2+50]);

	var path = d3.geoPath().projection(projection);

    var legend_size = 40;
    var legend = svg.append("g")
				.attr("transform", function() {
					return `translate(${width-legend_size*4},0)`;
				});

	var color_map = [
	["#be64ac", "#8c62aa", "#3b4994", ],
	["#dfb0d6", "#a5add3", "#5698b9"],
	["#e8e8e8", "#ace4e4", "#5ac8c8"]];

	var color_map_size = color_map.length;
	

	for(let n=0; n<color_map_size; n++) {
		legend.selectAll('rect' + ` .row-${n}`)
			.data(d3.range(color_map_size))
			.enter()
			.append("rect")
			.attr("class", function(d) {
				return `row-${n}`;
			})
			.attr("height", legend_size)
			.attr("width", legend_size)
			.attr("fill", function(d, i) {
				return color_map[n][i];
			})
			.attr("x", function(d) {
	        	return d*legend_size;
	        })
	        .attr("y", n*legend_size);
	}

	var scale = d3.scaleLinear()
			.domain([1,color_map_size+1])
			.range([0, color_map_size*legend_size]);

	var xAxis = d3.axisBottom(scale)
			.tickValues(d3.range(1,color_map_size+1))
			.tickSize(0);

	var yAxis = d3.axisLeft(scale)
			.tickValues(d3.range(1,color_map_size+1))
			.tickSize(0);

	legend.append("g").attr("class", "x-axis").attr("transform", function() {
		return `translate(${legend_size/2},${color_map_size*legend_size})`;
	}).call(xAxis).select(".domain")
	    .remove();

	legend.append("g").attr("class", "y-axis").attr("transform", function() {
		return `translate(0,${legend_size/2})`;
	}).call(yAxis).select(".domain")
	    .remove();

	d3.queue()
		.defer(d3.json, "countries.geojson")
		.await(ready);

	function ready(error, countries) {
		if (error) throw error;

		svg.append("g")
			.selectAll("path")
				.data(countries.features)
				.enter().append("path")
				.attr('d', path)
				.attr('vector-effect', 'non-scaling-stroke')
				.style("fill", function(d) {
					var x = Math.round(Math.random()*2);
					var y = Math.round(Math.random()*2);
					//console.log(x, y);
					return color_map[x][y];
				});
	}
})();