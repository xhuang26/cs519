(function() {
    var width = 700;
    var height = 700;
    var random_d3 = d3.select("#random");
    var svg = random_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
        .scale([100])
        .translate([width/2, height/2]);

    var path = d3.geoPath().projection(projection);

    var color = d3.scaleThreshold()
        .domain(d3.range(2, 10))
        .range(d3.schemeBlues[9]);

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
                // console.log(d);
                cur = color(Math.floor(Math.random() * 8) + 2 );
                // console.log(cur);
                return cur;
            });
    }
})();
