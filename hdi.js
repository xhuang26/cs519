(function() {

    var HdiInfo = function(iso, rank, hdi_1990, hdi_2000, hdi_2010, hdi_2011, hdi_2012, hdi_2013, hdi_2014, hdi_2015){
        this.iso = iso;
        this.rank = rank;
        this.hdi_1990 = hdi_1990;
        this.hdi_2000 = hdi_2000;
        this.hdi_2010 = hdi_2010;
        this.hdi_2011 = hdi_2011;
        this.hdi_2012 = hdi_2012;
        this.hdi_2013 = hdi_2013;
        this.hdi_2014 = hdi_2014;
        this.hdi_2015 = hdi_2015;
    }

    var width = 1600;
    var height = 800;
    var num_countries = 188;
    var hdi_d3 = d3.select("#hdi");
    var svg = hdi_d3.append("svg");
    svg.attr("width", width);
    svg.attr("height", height);

    var projection = d3.geoMercator()
        .scale([190])
        .translate([700, 550]);

    var path = d3.geoPath().projection(projection);

    var x = d3.scaleThreshold()
        .domain(d3.range(1, num_countries))
        .range(d3.range(width - 200, width - 20));
    var countryToHDI= d3.map();
    var year = "1990";
    var scale;

    var gray = d3.color('rgba(0,0,0,0.4)');

    d3.queue()
        .defer(d3.tsv, "hdi_ranges.tsv")
        .await(function(error, ranges) {
            var min = Math.min.apply(null, Object.values(ranges[0]));
            var max = Math.max.apply(null, Object.values(ranges[1]));
            var range = [min,max];
            scale = d3.scaleLinear().domain(range).range([0, 1]);
            legendTicks(range);
        });

    d3.queue()
        .defer(d3.json, "countries.geojson")
        .defer(d3.tsv, "hdi_historical.tsv", function(d) {

            var hdiInfo = new HdiInfo(d["ISO_A3"], d["rank"], d[1990], d[2000],d[2010],d[2011],d[2012],d[2013],d[2014],d[2015]);
            countryToHDI.set(d["ISO_A3"], hdiInfo);
        })
        .await(ready);

    // Drawing the scale bar on the map
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-1300,600)");
    g.selectAll("rect")
      .data(x.domain())
      .enter().append("rect")
        .attr("height", 5)
        .attr("x", function(d) {  return x(d); })
        .attr("width", function(d) { return x(2) - x(1); })
        .attr("fill", function(d) { return d3.interpolateRdBu(d / num_countries); });

    g.append("text")
    .attr("x", x.range()[0])
    .attr("y", -10)
    .attr("class", "caption")
    .attr("fill", "#fff")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("HDI");

    function ready(error, countries) {
        if (error) throw error;

        svg.selectAll("path")
            .data(countries.features)
            .enter().append("path")
            .attr("class", "country-polygon")
            .attr("id", function(d) {
                return `polygon-${d.properties.ISO_A3}`;
            })
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style("fill", function(d) {
                var cur = gray;
                if (countryToHDI.has(d.properties.ISO_A3)) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    var hdi = hdiInfo[`hdi_${year}`];
                    if(hdi !== '..')  {
                        cur = d3.interpolateRdBu(scale(hdi));
                    }
                }
                d3.select(this).attr("color", cur);
                return cur;
            })
            .style('cursor', function(d) {
                if(d3.select(this).attr("color") == gray) {
                    return 'default';
                }
                return 'pointer';
            })
            .on('click', function(country){
                if(d3.select(this).attr("color") == gray) {
                    return;
                }
                eventDispatcher.call('mapCountrySelect', this, country.properties.ISO_A3);
                eventDispatcher.call('countrySelectorCountrySelect', this, country.properties.ISO_A3);
                eventDispatcher.call('graphCountrySelect', this, country.properties.ISO_A3);

            });

        let nameTag = svg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("class", "caption")
            .attr("fill", "#fff")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold");
        eventDispatcher.on("sliderMove", function(year) {
            svg.selectAll(".country-polygon")
                .style("fill", function(d) {
                    var cur = gray;
                    if (countryToHDI.has(d.properties.ISO_A3)) {
                        var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                        var hdi = hdiInfo[`hdi_${year}`];
                        cur = d3.interpolateRdBu(scale(hdi));
                    }
                    return cur;
                });
        });
        var countries = d3.selectAll(".country-polygon");
        eventDispatcher.on('mapCountrySelect', function(countryISO) {
            var id = `#polygon-${countryISO}`;
            countries.style("stroke", function (d) {
                var curr_id = `#polygon-${d.properties.ISO_A3}`;
                if(curr_id === id) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    document.getElementById("countryDetailInfo").style.visibility = "visible";
                    document.getElementById("span-value").innerText = hdiInfo[`hdi_${year}`];
                    document.getElementById("span-rank").innerText  = hdiInfo["rank"];
                    return '#000';
                } else {
                    return null;
                }
            });
        });

        eventDispatcher.on("mapFilterCountries", function(countryISOArray) {
            var ids = countryISOArray.map(function(countryISO) {return `#polygon-${countryISO}`;});
            countries.style("fill", function(d) {
                var curr_id = `#polygon-${d.properties.ISO_A3}`;
                var cur = gray;
                if(countryToHDI.has(d.properties.ISO_A3) && ids.includes(curr_id)) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    var hdi = hdiInfo[`hdi_${year}`];
                    cur = d3.interpolateRdBu(scale(hdi));
                    d3.select(this).style("cursor", "pointer");
                } else {
                    d3.select(this).style("cursor", 'default');
                }
                d3.select(this).style("stroke", null);
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
