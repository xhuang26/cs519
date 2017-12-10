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
    };

    var tooltipTexts = {
        "default": "click to see detail info",
        "noData": "no data available",
        "filtered": "country has been filtered out",
    }

    var width = 1600;
    var height = 800;
    var num_countries = 188;
    var hdi_d3 = d3.select("#hdi");
    var svg1 = hdi_d3.append("svg");
    svg1.attr("width", width);
    svg1.attr("height", height);
    var svg = svg1.append("g");
    svg1.call(d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    }));

    var projection = d3.geoMercator()
        .scale([190])
        .translate([700, 550]);

    var path = d3.geoPath().projection(projection);

    var x = d3.scaleThreshold()
        .domain(d3.range(1, num_countries))
        .range(d3.range(width - 200, width - 20));
    var countryToHDI= d3.map();
    var year = "1990";
    var selectedCountry = null;
    //var selectedCountryPolygon = null;
    var scale;


    // Append Div for tooltip to SVG
    var tooltipContainer = d3.select("body")
                .append("div")
                .attr("id", "tooltip-container")
                .attr("class", "tooltip")
                .style("opacity", 0);
    var tooltipCountry = tooltipContainer.append("div")
                .attr("id", "tooltip-country");
    var tooltipNote = tooltipContainer.append("div")
                .attr("id", "tooltip-note");

    d3.queue()
        .defer(d3.json, "countries.geojson")
        .defer(d3.tsv, "hdi_historical.tsv", function(d) {

            var hdiInfo = new HdiInfo(d["ISO_A3"], d["rank"], d[1990], d[2000],d[2010],d[2011],d[2012],d[2013],d[2014],d[2015]);
            countryToHDI.set(d["ISO_A3"], hdiInfo);
        })
        .await(ready);

    d3.queue()
        .defer(d3.tsv, "hdi_ranges.tsv")
        .await(function(error, ranges) {
            var min = Math.min.apply(null, Object.values(ranges[0]));
            var max = Math.max.apply(null, Object.values(ranges[1]));
            range = [min,max];
            scale = d3.scaleLinear().domain(range).range([0, 1]);

        });

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
            .on("mouseover", function(d) {
                    tooltipContainer.transition()
                        .duration(200)
                        .style("opacity", .7);

            })
            .on("mousemove", function(d) {
                document.getElementById("tooltip-country").innerText = d.properties.ADMIN;
                document.getElementById("tooltip-note").innerText = tooltipTexts[this.getAttribute("tooltipText")];
                var height = document.getElementById("tooltip-container").getBoundingClientRect().height;
                tooltipContainer.style("left", (d3.event.pageX-70)+"px")
                        .style("top", (d3.event.pageY-height)+"px");
            })
            .on("mouseout", function(d) {
                tooltipContainer.transition()
                    .duration(100)
                    .style("opacity", 0);
            });
        updatePolygon();

        let nameTag = svg.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("class", "caption")
            .attr("fill", "#fff")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold");
        eventDispatcher.on("sliderMove", function(newyear) {
            year = newyear;
            if(selectedCountry != null) {
                document.getElementById("span-year").innerText = year;
                var hdiInfo = countryToHDI.get(selectedCountry);
                document.getElementById("span-value").innerText = hdiInfo[`hdi_${year}`] == ".." ? "(no data available)" : hdiInfo[`hdi_${year}`];
                document.getElementById("span-rank").innerText  = hdiInfo["rank"];
            }

            updatePolygon();
        });
        var countries = d3.selectAll(".country-polygon");
        eventDispatcher.on('mapCountrySelect', function(countryISO) {
            var id = `polygon-${countryISO}`;

            selectedCountry = countryISO;
            countries.style("stroke", function (d) {
                if(countryISO === d.properties.ISO_A3) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    document.getElementById("countryDetailInfo").style.visibility = "visible";
                    document.getElementById("span-value").innerText = hdiInfo[`hdi_${year}`] == ".." ? "(no data available)" : hdiInfo[`hdi_${year}`];
                    document.getElementById("span-rank").innerText  = hdiInfo["rank"];
                    d3.select(this).style("stroke-width", 2);
                    return '#fff';
                } else {
                    if(d3.select(this).attr("stroke") === "#fff") {
                        return null;
                    }
                    return d3.select(this).attr("stroke");
                }
            });
        });

        eventDispatcher.on("mapFilterCountries", function(countryISOArray) {
            var ids = countryISOArray.map(function(countryISO) {return `#polygon-${countryISO}`;});
            selectedCountry = null;
            //selectedCountryPolygon = null;
            countries.style("fill", function(d) {
                var curr_id = `#polygon-${d.properties.ISO_A3}`;
                var cur = gray;
                this.setAttribute("tooltipText", "noData");
                d3.select(this).attr("stroke", strokeColor)
                                .attr("stroke-width", 1);
                if(countryToHDI.has(d.properties.ISO_A3) && ids.includes(curr_id)) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    var hdi = hdiInfo[`hdi_${year}`];
                    if(hdi !== '..')  {
                        cur = d3.interpolateRdBu(scale(hdi));
                        d3.select(this).style("cursor", "pointer");
                        this.setAttribute("tooltipText", "default");
                        d3.select(this).attr("stroke", null);
                    } else {
                        d3.select(this).style("cursor", 'default');
                    }
                } else {
                    d3.select(this).style("cursor", 'default');
                    if(countryToHDI.has(d.properties.ISO_A3) && !ids.includes(curr_id)) {
                        this.setAttribute("tooltipText", "filtered");
                    }
                }
                return cur;
            });

        });
        legendTicks(range);
    }

    function updatePolygon() {
        svg.selectAll(".country-polygon")
        .style("fill", function(d) {

                var cur = gray;
                this.setAttribute("tooltipText", "noData");
                d3.select(this).attr("stroke", strokeColor)
                                .attr("stroke-width", 1);
                if (countryToHDI.has(d.properties.ISO_A3)) {
                    var hdiInfo = countryToHDI.get(d.properties.ISO_A3);
                    var hdi = hdiInfo[`hdi_${year}`];
                    if(hdi !== '..')  {
                        cur = d3.interpolateRdBu(scale(hdi));
                        this.setAttribute("tooltipText", "default");
                        d3.select(this).attr("stroke", null);
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
            dispatchCountrySelect(country.properties.ISO_A3);
        });
    }


    function legendTicks(range) {
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
