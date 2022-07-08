(function () {
  window.onload = function () {
    const margin = { top: 10, right: 20, bottom: 30, left: 30 };
    const width = 400 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // The svg
    const svg = d3
      .select("#d3_graph_example_post_datavis_1")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .call(responsivefy);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3
      .geoMercator()
      .scale(70)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    // Data and color scale
    const data = new Map();
    const colorScale = d3
      .scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(d3.schemeBlues[7]);

    // Load external data and boot
    Promise.all([
      d3.json(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
      ),
      d3.csv(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
        function (d) {
          data.set(d.code, +d.pop);
        }
      ),
    ]).then(function (loadData) {
      let topo = loadData[0];

      let mouseOver = function (d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.5);
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black");
      };

      let mouseLeave = function (d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.8);
        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "transparent");
      };

      // Draw the map
      svg
        .append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath().projection(projection))
        // set the color of each country
        .attr("fill", function (d) {
          d.total = data.get(d.id) || 0;
          return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function (d) {
          return "Country";
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave);
    });
  };
}.call(this));
