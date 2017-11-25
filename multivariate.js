(function(){

	var CountryInfo = function(iso, xAxisInfo, yAxisInfo){
		this.iso = iso;
		this.xAxisInfo = xAxisInfo;
		this.yAxisInfo = yAxisInfo;
	}

	var toFixed1 = function(x) {return +(x.toFixed(1));}

	var width = 650;
	var height = 550;
	var container = d3.select("#multivariate");
	var svg = container.append("svg");
	svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
	  .scale([100])
	  .center([0,0])
	  .translate([width/2, height/2]);

	var path = d3.geoPath().projection(projection);

    var legend_size = 40;
    var legend = svg.append("g")
				.attr("transform", function() {
					return `translate(${width-legend_size*4},400)`;
				});


	var color_map = [
	["#be64ac", "#dfb0d6", "#e8e8e8"],
	["#8c62aa", "#a5add3", "#ace4e4"],
	["#3b4994", "#5698b9", "#5ac8c8"]];

	var black_color = "#000000";

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
				return color_map[i][n];
			})
			.attr("x", function(d) {
	        	return d*legend_size;
	        })
	        .attr("y", n*legend_size);
	}


	var tickFormat = function(d,i) {
				return "~" + d;
	};


	var countryInfoMap = d3.map();
	var xAxisInfoName = "Life expectancy at birth";
	var yAxisInfoName = "Expected years of schooling";

	var xAxisInfoRange = [Infinity, 0];
	var yAxisInfoRange = [Infinity, 0];

	var single_char_size = 4;

	legend.append("text").attr("class", "component-x").attr("text-anchor", "start").attr("transform", function() {
			return `translate(${(color_map_size*legend_size-single_char_size*xAxisInfoName.length)/2},${color_map_size*legend_size+25})`;
		}).text(xAxisInfoName).style("font-size",10);

	legend.append("text").attr("class", "component-y").attr("text-anchor", "end").attr("transform", function() {
			return `translate(-20,${(color_map_size*legend_size-single_char_size*yAxisInfoName.length)/2})rotate(-90)`;
		}).text(yAxisInfoName).style("font-size",10);

	addQueue();

	function updateComponent(xAxisSpan, yAxisSpan) {
		xAxisInfoName = xAxisSpan.innerText;
		yAxisInfoName = yAxisSpan.innerText;
		xAxisInfoRange = [Infinity, 0];
		yAxisInfoRange = [Infinity, 0];
		d3.select(".component-x").attr("transform", function() {
			return `translate(${(color_map_size*legend_size-single_char_size*xAxisInfoName.length)/2},${color_map_size*legend_size+20})`;
		}).text(xAxisInfoName);
		d3.select(".component-y").attr("transform", function() {
			return `translate(-25,${(color_map_size*legend_size-single_char_size*yAxisInfoName.length)/2})rotate(-90)`;
		}).text(yAxisInfoName);
		countryInfo = d3.map();
		addQueue();
	}

	function addQueue() {
		d3.queue()
		.defer(d3.json, "countries.geojson")
		.defer(d3.tsv, "hdi_table1.tsv", function(d) {
			var xAxisInfo = parseFloat(d[xAxisInfoName]);
			var yAxisInfo = parseFloat(d[yAxisInfoName]);
			xAxisInfoRange = findRange(xAxisInfoRange, xAxisInfo);
			yAxisInfoRange = findRange(yAxisInfoRange, yAxisInfo);
			var countryInfo = new CountryInfo(d["ISO_A3"], xAxisInfo, yAxisInfo);
			countryInfoMap.set(d["ISO_A3"], countryInfo);

		})
		.await(ready);
	}

	function ready(error, countries) {
		if (error) throw error;
		var yScale = d3.scaleLinear()
			.domain([yAxisInfoRange[1], yAxisInfoRange[0]])
			.range([0, color_map_size*legend_size]);

		var xScale = d3.scaleLinear()
			.domain(xAxisInfoRange)
			.range([0, color_map_size*legend_size]);

		var xTick = d3.range(xAxisInfoRange[0], xAxisInfoRange[1], (xAxisInfoRange[1]- xAxisInfoRange[0])/(color_map_size));
		var yTick = d3.range(yAxisInfoRange[0], yAxisInfoRange[1], (yAxisInfoRange[1]- yAxisInfoRange[0])/(color_map_size));
		xTick.push(xAxisInfoRange[1]);
		yTick.push(yAxisInfoRange[1]);

		xTick = xTick.map(toFixed1);
		yTick = yTick.map(toFixed1);


		var xAxis = d3.axisBottom(xScale)
				.tickValues(xTick)
				.tickSize(0);
		var yAxis = d3.axisLeft(yScale)
				.tickValues(yTick)
				.tickSize(0);

		var xToIndexScale = d3.scaleLinear().domain(xAxisInfoRange).range([0, color_map_size]);
		var yToIndexScale = d3.scaleLinear().domain(yAxisInfoRange).range([color_map_size, 0]);

		legend.select(".x-axis").remove();
		legend.select(".y-axis").remove();
		legend.append("g").attr("class", "x-axis").attr("transform", function() {
			return `translate(0,${color_map_size*legend_size})`;
		}).call(xAxis).select(".domain")
		    .remove();



		svg.append("g")
			.selectAll("path")
				.data(countries.features)
				.enter().append("path")
				.attr('d', path)
				.attr('vector-effect', 'non-scaling-stroke')
				.style("fill", function(d) {
					if(!countryInfoMap.has(d.properties.ISO_A3)) {
						return black_color;
					}
					var {xAxisInfo, yAxisInfo} = countryInfoMap.get(d.properties.ISO_A3);
					var x = Math.min(Math.floor(xToIndexScale(xAxisInfo)), 2);
					var y = Math.min(Math.floor(yToIndexScale(yAxisInfo)), 2);

					return color_map[x][y];
				});
	}

	eventDispatcher.on("componentChange", function(xAxis, yAxis) {
			updateComponent(xAxis, yAxis);
		});

	function getRangeIndex(steps, range, val) {
		var stepSize = (range[1]-range[0])/steps;
		return Math.max(Math.ceil((val-range[0])/stepSize -1), 0);
	}
})();
