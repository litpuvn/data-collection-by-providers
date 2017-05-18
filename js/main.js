
var svgWidth = 800;
var svgHeight = 600;

var innerRadius = 200;
var outerRadius = 220;

var angleOffset = Math.PI / 20;
var FACEBOOK = 'facebook', GOOGLE = 'google', AMAZON = 'amazon', YAHOO = 'yahoo';

var svg = d3.select('body').select('#container').append('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight)
;

var colorFunction = d3.scaleOrdinal(d3.schemeCategory10);
var companies = [{name: FACEBOOK, color: colorFunction(1)}, {name: GOOGLE, color: colorFunction(2)}, {name: AMAZON, color: colorFunction(3)}, {name: YAHOO, color: colorFunction(4)}];

function getColorByCompany(company) {
    let c;
    for(let i=0; i< companies.length; i++) {
        c = companies[i];
        if (c.name == company) {
            return c.color;
        }
    }
}

function getCompanyCenter(company) {
    let c;
    for(let i=0; i< companies.length; i++) {
        c = companies[i];
        if (c.name == company) {
            return c.center;
        }
    }
}

svg.append('circle')
    .attr('cx', svgWidth / 2)
    .attr('cy', svgHeight / 2)
    .attr('r', outerRadius + 10)
    .style("stroke", colorFunction(0))
    .style("stroke-width", 10)
    .style("fill", 'none')
;

var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(0)
        .endAngle(Math.PI / 2)
;

var groupTranslateX = svgWidth / 2;
var groupTranslateY = svgHeight / 2;

var arcGroup = svg
    .append('g')
    .attr("transform", "translate(" + groupTranslateX + "," + groupTranslateY + ")");

var startingAngle = 0;
var endAngle = 2*Math.PI / companies.length;

companies.forEach(function (com) {
    endAngle = startingAngle + 2*Math.PI / companies.length;
    startingAngle = startingAngle + angleOffset;

    arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(startingAngle)
        .endAngle(endAngle - angleOffset)
    ;

    com.center = calculateCentroid(0, 0, startingAngle, endAngle - angleOffset, innerRadius - 30);

    startingAngle = endAngle;

    arcGroup
        .append("path")
        .style("fill", com.color)
        .attr("d", arc)
    ;


    arcGroup
        .append('circle')
        .attr('class', 'company-center')
        .attr('r', 3)
        .style('fill', getColorByCompany(com.name))
        .attr('cx', com.center.x)
        .attr('cy', com.center.y)
    ;
});

// draw ceter of companies

var nodes = [
    {
        id: 1,
        name: 'node1',
        companies: [AMAZON, GOOGLE, FACEBOOK, YAHOO]
    },
    {
        id: 2,
        name: 'node2',
        companies: [AMAZON, GOOGLE, FACEBOOK]
    },
    {
        id: 3,
        name: 'node3',
        companies: [AMAZON, GOOGLE]
    },
    {
        id: 4,
        name: 'node4',
        companies: [AMAZON, GOOGLE]
    },
    {
        id: 5,
        name: 'node5',
        companies: [AMAZON]
    },
    {
        id: 6,
        name: 'node6',
        companies: [GOOGLE]
    },
    {
        id: 7,
        name: 'node7',
        companies: [AMAZON, GOOGLE]
    },
    {
        id: 8,
        name: 'node8',
        companies: [AMAZON, GOOGLE]
    },
    {
        id: 9,
        name: 'node9',
        companies: [AMAZON, GOOGLE]
    },
    {
        id: 10,
        name: 'node10',
        companies: [AMAZON, GOOGLE]
    }
];

var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-0.4))
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide(10))
;

var pie = d3.pie()
    .sort(null)
    .value(function(d) {
        return 1;
    });

var pieArc = d3.arc()
    .outerRadius(10)
    .innerRadius(0);

var node = arcGroup.selectAll('.individual-data').data(nodes)
    .enter().append('g')
        .attr("class", "individual-data")
    ;

node.selectAll('path')
    .data(function(d, i) {
        return pie(d.companies);
    })
    .enter()
    .append('svg:path')
    .attr('class', 'individual-data')
    .attr('d', pieArc)
    .style("fill", function (c) {

        return  getColorByCompany(c.data);
    })
;

simulation.on('tick', handleTick);

function handleTick() {

    node.each(moveTowardCompanyCenter(this.alpha()));
    node
        .attr("transform", (n) => {
            return "translate(" + n.x + ", " + n.y + ")";
        })
    ;
}

function moveTowardCompanyCenter(alpha) {
    return function(d) {
        d.companies.forEach(function (c) {
            let center = getCompanyCenter(c);
            d.x += (center.x - d.x) * alpha;
            d.y += (center.y - d.y) * alpha;
        });
    };
}