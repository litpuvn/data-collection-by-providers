
var svgWidth = 800;
var svgHeight = 600;

var innerRadius = 200;
var outerRadius = 220;

var angleOffset = Math.PI / 20;

var svg = d3.select('body').select('#container').append('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
;

var colorFunction = d3.scaleOrdinal(d3.schemeCategory10);


svg.append('circle')
    .attr('cx', svgWidth / 2)
    .attr('cy', svgHeight / 2)
    .attr('r', outerRadius + 10)
    .style("stroke", colorFunction(0))
    .style("stroke-width", 10)
    .style("fill", 'none')
;

var companies = ["Facebook", "Google", "Amazon", "Yahoo"];

var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(Math.PI / 2)
;

var arcGroup = svg
    .append('g')
    .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

var startingAngle = 0;
var endAngle = 2*Math.PI / companies.length;



for(var i=0; i< companies.length; i++) {

    endAngle = startingAngle + 2*Math.PI / companies.length;

    startingAngle = startingAngle + angleOffset;

    arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startingAngle)
            .endAngle(endAngle - angleOffset)
        ;

    startingAngle = endAngle;
    arcGroup
        .append("path")
        .style("fill", colorFunction(i + 1))
        .attr("d", arc)
    ;
}
