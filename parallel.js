

(function(){

    var margin = {top: 30, right: 10, bottom: 20, left: 50},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

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
                var rank = d['HDI rank']
                return d3.interpolateSpectral(scale(rank));
            })

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

        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(d3.brushY().extent([[-8,0], [8,height]]).handleSize(0).on("start", brushstart).on("brush", brush));
                y[d].brush = this;
            });
    });

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    function brush() {
        var selection = d3.brushSelection(this);
        var actives = dimensions.filter(function(p) {
            return d3.brushSelection(y[p].brush) != null;
        });
        var extents = actives.map(function(p, i) {
            var scale = y[p];
            var selection = d3.brushSelection(scale.brush);
            return [scale.invert(selection[0]), scale.invert(selection[1])];
        });
        foreground.style("stroke", function(d) {
            var rank = d['HDI rank']
            var color =  d3.interpolateSpectral(scale(rank));
            return actives.every(function(p, i) {
                return Math.min(extents[i][0], extents[i][1]) <= d[p] && d[p] <= Math.max(extents[i][0], extents[i][1]);
            }) ? color : "rgba(220,220,220, 0.3)";
        });
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

})();
