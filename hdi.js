(function() {
    var width = 960;
    var	height = 1000;
    var num_countries = 188;

    var hdi_d3 = d3.select("#hdi");
    var svg = hdi_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
      .scale([100])
      .center([0,0])
      .translate([width/2, height/2]);

    var path = d3.geoPath().projection(projection);


    var channels = {
      h: {scale: d3.scaleLinear().domain([0, 360]).range([0, 360]), x: 300},
      s: {scale: d3.scaleLinear().domain([0, 1]).range([0, 1]), x: 0.5},
      l: {scale: d3.scaleLinear().domain([0, 1]).range([0, 1]), x: 0.4},
    };


    var countryToHDIRank = d3.map();
    d3.queue()
    	.defer(d3.json, "countries.geojson")
        .defer(d3.tsv, "hdi_table1.tsv", function(d) {
            countryToHDIRank.set(d["ISO_A3"], d["HDI rank"]);
        })
    	.await(ready);


    function ready(error, countries) {
    	if (error) throw error;

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
                        //console.log(d.properties.ISO_A3 + "," + rank);
                        var current = d3.hsl(
                            channels.h.scale.invert(channels.h.x),
                            channels.s.scale.invert(channels.s.x),
                            channels.l.scale.invert(channels.l.x)
                        );
                        current['s'] = 1 - rank / num_countries;
                        // console.log(current['h']);
                        // console.log(current['s']);
                        // console.log(current['l']);
                        cur = d3.rgb(current);
                    }
    				return cur;
    			});
    }
})();
