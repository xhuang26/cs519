(function() {

    var HdiInfo = function(iso, hdi_1990, hdi_2000, hdi_2010, hdi_2011, hdi_2012, hdi_2013, hdi_2014, hdi_2015){
        this.iso = iso;
        this.hdi_1990 = hdi_1990;
        this.hdi_2000 = hdi_2000;
        this.hdi_2010 = hdi_2010;
        this.hdi_2011 = hdi_2011;
        this.hdi_2012 = hdi_2012;
        this.hdi_2013 = hdi_2013;
        this.hdi_2014 = hdi_2014;
        this.hdi_2015 = hdi_2015;
    }

    var width = 650;
    var height = 650;
    var num_countries = 188;
    var hdi_d3 = d3.select("#hdi");
    var svg = hdi_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
        .scale([100])
        .translate([width/2, height/2]);

    var path = d3.geoPath().projection(projection);

    var x = d3.scaleThreshold()
        .domain(d3.range(1, num_countries))
        .range(d3.range(width - 200, width - 20));
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
    .text("HDI");

    var countryToHDI= d3.map();
    var year = "1990";
    var ranges;
    d3.queue()
        .defer(d3.json, "countries.geojson")
        .defer(d3.tsv, "hdi_ranges.tsv")
        .defer(d3.tsv, "hdi_historical.tsv", function(d) {
            
            var hdiInfo = new HdiInfo(d["ISO_A3"], d[1990], d[2000],d[2010],d[2011],d[2012],d[2013],d[2014],d[2015]);
            countryToHDI.set(d["ISO_A3"], hdiInfo);
        })
        .await(ready);


    function ready(error, countries, ranges) {
        if (error) throw error;
        var range = [ranges[0][year], ranges[1][year]];
        console.log(countryToHDI);
        var scale = d3.scaleLinear().domain(range).range([0, 1]);

        

        svg.selectAll("path")
            .data(countries.features)
            .enter().append("path")
            .attr("class", "country-polygon")
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style("fill", function(d) {
                var cur = d3.rgb("black");
                if (countryToHDI.has(d.properties.ISO_A3)) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    var hdi = hdiInfo[`hdi_${year}`];
                    cur = d3.interpolateRdPu(scale(hdi));
                }
                return cur;
            });
        legendTicks(range);
        sliderMove.on("sliderMove", function(year) {
            range = [ranges[0][year], ranges[1][year]];
            legendTicks(range);
            svg.selectAll(".country-polygon")
                .style("fill", function(d) {
                    var cur = d3.rgb("black");
                    if (countryToHDI.has(d.properties.ISO_A3)) {
                        var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                        var hdi = hdiInfo[`hdi_${year}`];
                        cur = d3.interpolateRdPu(scale(hdi));
                    }
                    return cur;
                });
        });

    }

    function legendTicks(range) {
        var x2 = d3.scaleLinear()
        .domain(range)
        .range([width - 200, width - 20]);

        g.call(d3.axisBottom(x2)
            .tickSize(10)
            .tickFormat(function(x, i) {
                return x;
            })
            .tickValues(range))
            .select(".domain")
            .remove();
    }

})();
