(function() {
    var width = 650;
    var height = 650;
    var num_countries = 188;
    var hdi_d3 = d3.select("#hdi");
    var svg = hdi_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    console.log("HEY");
    var projection = d3.geoMercator()
        .scale([100])
        .translate([width/2, height/2]);

    var path = d3.geoPath().projection(projection);

    var x = d3.scaleThreshold()
        .domain(d3.range(1, num_countries))
        .range(d3.range(width - 200, width - 20));
    var x2 = d3.scaleLinear()
        .domain([1, num_countries])
        .range([width - 200, width - 20]);
    // Drawing the scale bar on the map
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,30)");
    g.selectAll("rect")
      .data(x.domain())
      .enter().append("rect")
        .attr("height", 5)
        .attr("x", function(d) {  return x(d); })
        .attr("width", function(d) { return x(2) - x(1); })
        .attr("fill", function(d) { return d3.interpolateRdPu(d / num_countries); });

    g.append("text")
    .attr("x", x.range()[0])
    .attr("y", -10)
    .attr("class", "caption")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("HDI Rank");

    g.call(d3.axisBottom(x2)
    .tickSize(10)
    .tickFormat(function(x, i) {
        return x
    })
    .tickValues(x2.domain()))
        .select(".domain")
        .remove();

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
                var cur = d3.rgb("black");
                if (countryToHDIRank.has(d.properties.ISO_A3)) {
                    // HDI rank for each country
                    var rank = parseFloat(countryToHDIRank.get(d.properties.ISO_A3))
                    //console.log(d.properties.ISO_A3 + "," + rank);
                    cur = d3.interpolateRdPu(rank / num_countries)
                }
                return cur;
            })
            .on('mouseover', function(country) {
                d3.select(this).style('stroke', '#00e68a')
                nameTag.text("Country: " + country.properties.ADMIN)
                nameTag.style('visibility', 'visible')
            })
            .on('mouseout', function() {
                d3.select(this).style('stroke', null)
                nameTag.style('visibility', 'hidden')
            })

        let nameTag = svg.append("text")
            .attr("x", 10)
            .attr("y", 15)
            .attr("class", "caption")
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
    }

})();
