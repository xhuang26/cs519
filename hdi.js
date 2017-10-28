
(function() {
    var width = 960;
    var	height = 1000;

    var hdi_d3 = d3.select("#hdi");
    var svg = hdi_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    var color = d3.scaleThreshold()
        .domain(d3.range(2, 10))
        .range(d3.schemeBlues[9]);

    var projection = d3.geoMercator()
      .scale([100])
      .center([0,0])
      .translate([width/2, height/2]);

    var path = d3.geoPath().projection(projection);

    var countryToHDIRank = d3.map();
    d3.queue()
    	.defer(d3.json, "countries.geojson")
        .defer(d3.tsv, "hdi_table1.tsv", function(d) {
            countryToHDIRank.set(d["ISO_A3"], d["HDI rank"]);
        })
    	.await(ready);


    function ready(error, countries) {
    	if (error) throw error;

        console.log(countryToHDIRank.get("THA"))

    	svg.selectAll("path")
    			.data(countries.features)
    			.enter().append("path")
    			.attr('d', path)
    			.attr('vector-effect', 'non-scaling-stroke')
    			.style("fill", function(d) {
    				var cur = 10
                    if (countryToHDIRank.has(d.properties.ISO_A3)) {
                        // HDI rank for each country
                        var rank = parseFloat(countryToHDIRank.get(d.properties.ISO_A3))
                        console.log(d.properties.ISO_A3 + "," + rank);
                        cur = color(Math.floor(rank / 188 * 8) + 2);
                    }
    				return cur;
    			});
    }
})();
