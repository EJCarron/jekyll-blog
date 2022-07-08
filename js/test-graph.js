function responsivefy(svg) {
  // container will be the DOM element
  // that the svg is appended to
  // we then measure the container
  // and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width"), 10),
    height = parseInt(svg.style("height"), 10),
    aspect = width / height;

  // set viewBox attribute to the initial size
  // control scaling with preserveAspectRatio
  // resize svg on inital page load
  svg
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMid")
    .call(resize);

  // add a listener so the chart will be resized
  // when the window resizes
  // multiple listeners for the same event type
  // requires a namespace, i.e., 'click.foo'
  // api docs: https://goo.gl/F3ZCFr
  d3.select(window).on("resize." + container.attr("id"), resize);

  // this is the code that resizes the chart
  // it will be called on load
  // and in response to window resizes
  // gets the width of the container
  // and resizes the svg to fill it
  // while maintaining a consistent aspect ratio
  function resize() {
    const w = parseInt(container.style("width"));
    svg.attr("width", w);
    svg.attr("height", Math.round(w / aspect));
  }
}

(function () {
  window.onload = function () {
    const margin = { top: 10, right: 20, bottom: 30, left: 30 };
    const width = 400 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    // The svg
    const svg = d3
      .select("svg")
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
