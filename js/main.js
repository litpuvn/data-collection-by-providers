
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
        .attr("id", function(d,i) { return "companyArc_"+i; })
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

    arcGroup.append('text')
        .attr("x", com.center.x) //Move the text from the start angle of the arc
        .attr("dy", com.center.y) //Move the text down
        .text(com.name)
        // .append("textPath")
        // .attr("xlink:href",function(d,i){return "#companyArc_"+i;})
    ;
});

console.log(companies);

// draw ceter of companies

var nodes = [
    {
        id: 0,
        name: 'node0',
        companies: [AMAZON, GOOGLE, FACEBOOK, YAHOO]
    },
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
        companies: [GOOGLE]
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
    },
    {
        id: 11,
        name: 'node11',
        companies: [AMAZON, GOOGLE, FACEBOOK, YAHOO]
    },
];

/**
 * Calculate center for each node
 */
nodes.forEach(function (n) {
    n.cx = d3.mean(n.companies, function (c) {
        let cx = getCompanyCenter(c).x;
        return cx;
    });

    n.cy = d3.mean(n.companies, function (c) {
        let cy = getCompanyCenter(c).y;
        return cy;
    });

    n.radius = 10;
    n.group = n.companies.join("-");
});

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

var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-104))
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide(20))
        // .force("collide", collide)
        // .force("clustering", clustering)

    ;
simulation.on('tick', handleTick);

function handleTick() {

    node.each(moveTowardCompanyCenter(this.alpha()));
    node.each(manualCollide(0.4));

    node
        .attr("transform", (n) => {
            // console.log("setX:" + n.x + ";setY:" + n.y);
            return "translate(" + n.x + ", " + n.y + ")";
        })
    ;
}

function moveTowardCompanyCenter(alpha) {
    return function(d) {
        d.y += (d.cy - d.y) * (1-alpha) * 0.7;
        d.x += (d.cx - d.x) * (1-alpha) * 0.7;
    };
}


let
    padding = 6, // separation between nodes
    maxRadius = 20;

// Resolve collisions between nodes.
// Resolve collisions between nodes.
function manualCollide(alpha) {
    var quadtree = d3.quadtree()
            .x((d) => d.x)
            .y((d) => d.y)
            .addAll(nodes)
            ;
    return function(d) {
        var r = d.radius + maxRadius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;

        quadtree.visit(function(quad, x1, y1, x2, y2) {

            if (quad.data && (quad.data !== d)) {
                var x = d.x - quad.data.x,
                    y = d.y - quad.data.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.radius + quad.data.radius + (d.color !== quad.data.color) * padding;
                if (l < r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.data.x += x;
                    quad.data.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}
