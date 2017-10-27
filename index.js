var width = 960,
	height = 1000;

console.log(d3.select("body"));

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9]);

var projection = d3.geoMercator()
  .scale([100])
  .center([0,0])
  .translate([width/2, height/2]);

var path = d3.geoPath().projection(projection);

d3.queue()
	.defer(d3.json, "countries.geojson")
	.await(ready);

function ready(error, countries) {
	if (error) throw error;

	svg.selectAll("path")
			.data(countries.features)
			.enter().append("path")
			.attr('d', path)
			.attr('vector-effect', 'non-scaling-stroke')
			.style("fill", function(d) {
				console.log(d);
				cur = color(Math.floor(Math.random() * 8) + 2 );
				console.log(cur);
				return cur;
			});
}

