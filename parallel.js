

(function(){

    var margin = {top: 30, right: 10, bottom: 100, left: 50},
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    var x = d3.scalePoint().range([0, width]);
      y = {};

    var line = d3.line()    ;
    var axis = d3.axisLeft(),
      background,
      foreground;

    var num_countries = 188;
    var svg = d3.select("#parallel").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("hdi_table1.tsv", function(error, hdi) {
        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(hdi[0]).filter(function(d) {
            return d != "ISO_A3" && d != "Country" && d != "rank"
                && d != "HDI rank"
                && d != "GNI per capita rank minus HDI rank"
                && (y[d] = d3.scaleLinear()
                .domain(d3.extent(hdi, function(p) { return +p[d]; }))
                .range([height, 0]));
        }));
        scale = d3.scaleLinear().domain([1, num_countries]).range([0, 1]);

        // Add lines for country.
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(hdi)
            .enter().append("path")
            .attr("d", path)
            .style("stroke", function(d) {
                var rank = d['HDI rank'];
                return d3.interpolateSpectral(scale(rank))
            })
            .on('mouseover', function(d) {
                d3.select(this).style('stroke-width', '3')
                d3.select(this).style('stroke', 'black')
                countryTag.text("Country: " + d['Country'])
                countryTag.style('visibility', 'visible')
                InfoTag.text("HDI: " + d['Human Development Index (HDI)'] + ", " +
                             "LEB: " + d['Life expectancy at birth'] + ", " +
                             "EYS: " + d['Expected years of schooling'] + ", " +
                             "MYS: " + d['Mean years of schooling'] + ", " +
                             "GNI: " + d['Gross national income (GNI) per capita']);
                InfoTag.style('visibility', 'visible')
            })
            .on('mouseout', function(d) {
                var rank = d['HDI rank'];
                d3.select(this).style('stroke', d3.interpolateSpectral(scale(rank)));
                d3.select(this).style('stroke-width', '1')
                countryTag.style('visibility', 'hidden')
                InfoTag.style('visibility', 'hidden')
            });


        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
          .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .attr("fill", "#000")
            .text(function(d) { return d; });

        let countryTag = svg.append("text")
            .attr("x", 0)
            .attr("y", height + 30)
            .attr("class", "caption")
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold");
        let InfoTag = svg.append("text")
            .attr("x", 0)
            .attr("y", height + 60)
            .attr("class", "caption")
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold");
    });


    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

})();
