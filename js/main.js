
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
var companies = [{name: FACEBOOK, color: colorFunction(1)}, {name: GOOGLE, color: colorFunction(2)}, {name: AMAZON, color: colorFunction(3)}, {name: YAHOO, color: colorFunction(4)}];

var groupNodeBySharedCompanySize = {};
var totalCompanySize = 0;

function getColorByCompany(company) {
    if (!!company.name) {
        company = company.name;
    }
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
    .style("stroke", '#000000')
    .style("opacity", 0.4)
    .style("stroke-dasharray", ("10,3")) // make the stroke dashed
    .style("stroke-width", 2)
    .style("fill", '#000000')
    .style("opacity", 0.01)
    .on('click', sortNodesByCompanySize)
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

    com.center = calculateCentroid(0, 0, startingAngle, endAngle - angleOffset, innerRadius - 40);

    startingAngle = endAngle;

    arcGroup
        .append("path")
        .attr("id", function(d,i) { return "companyArc_"+i; })
        .style("fill", com.color)
        .attr("d", arc)
        .on("mouseover", function (d) {

            let c = com;
            let companyCenter = getCompanyCenter(c.name);

            nodes.forEach(function (n) {

                if (n.companies.indexOf(c.name) >= 0) {

                    simulation.alphaTarget(0.15).restart();

                    n.cx = companyCenter.x;
                    n.cy = companyCenter.y;


                }
                else {
                    n.fx = n.x;
                    n.fx = n.y;
                }
            });

            node.attr('opacity', function (d) {
                let opacity = 0.1;
                if (d.companies.indexOf(c.name) >= 0) {
                    opacity = 1;
                }

                return opacity;
            });

            labels.style('opacity', function (d) {
                let opacity = 0.1;
                if (d.companies.indexOf(c.name) >= 0) {
                    opacity = 1;
                }

                return opacity;
            });
        })
        .on("mouseout", function (d) {
            let c = com;
            let companyCenter = getCompanyCenter(c.name);

            nodes.forEach(function (n) {

                if (n.companies.indexOf(c.name) < 0) {
                    n.fx = null;
                    n.fx = null;
                }

                n.cx = n.fcx;
                n.cy = n.fcy;

            });

            simulation.alphaTarget(0.15).restart();

            node.attr('opacity', 1);
            labels.style('opacity', 1);
        })
        // .on('click', function (d) {
        //
        //     let c = com;
        //     c.selected = !c.selected;
        //
        //     d3.select(this)
        //         .style('stroke-width', c.selected ? 1 : 0)
        //         .style('stroke', '#000000')
        //     ;
        // })

    ;


    // arcGroup
    //     .append('circle')
    //     .attr('class', 'company-center')
    //     .attr('r', 3)
    //     .style('fill', getColorByCompany(com.name))
    //     .attr('cx', com.center.x)
    //     .attr('cy', com.center.y)
    // ;
    //
    // arcGroup.append('text')
    //     .attr("x", com.center.x) //Move the text from the start angle of the arc
    //     .attr("dy", com.center.y) //Move the text down
    //     .text(com.name)
    //
    // ;
});

console.log(companies);

// Add legends
var ledgends = svg.selectAll('.company-legend').data(companies).enter()
    .append('g')
    .attr("class", "company-legend")
    .attr("transform", "translate(" + 0 + "," + 80 + " )")
    ;

ledgends.selectAll('rect-legend').data(companies).enter()
    .append('rect')
        .attr("class", 'rect-legend')
        .classed('background', true)
        .attr('y', function(d, i) {return i * 20; })
        .attr('x', svgWidth - 150)
        .attr('height', 20)
        .attr('width', 20 )
        .attr('fill', function (c) {
            let color =  getColorByCompany(c.name);
            return color;
        });

ledgends.selectAll('text-legend').data(companies).enter()
    .append('text')
    .attr("class", 'text-legend')
    .text(function (c) {
            return c.name;
        })
        .attr("transform", (n, i) => {
            return "translate(" + (svgWidth - 120) + ", " + (15 + i*20) + ")";
        });

// draw ceter of companies
/**
 * Calculate center for each node
 */
nodes.forEach(function (n) {
    n.fcx = n.cx = d3.mean(n.companies, function (c) {
        let cx = getCompanyCenter(c).x;
        return cx;
    });

    n.fcy = n.cy = d3.mean(n.companies, function (c) {
        let cy = getCompanyCenter(c).y;
        return cy;
    });

    n.radius = 10;
    n.group = n.companies.join("-");
    n.opacity = 1;

    if (!groupNodeBySharedCompanySize.hasOwnProperty(n.companies.length))  {
        groupNodeBySharedCompanySize[n.companies.length] = [];
        totalCompanySize ++;
    }

    let tmp = groupNodeBySharedCompanySize[n.companies.length];
    tmp.push(n);
});

let companyGroupItem;
var myNodesByCompanySize = [];
for(let companySize in groupNodeBySharedCompanySize) {
    if (!groupNodeBySharedCompanySize.hasOwnProperty(companySize)) {
        continue;
    }

    companyGroupItem = groupNodeBySharedCompanySize[companySize];
    myNodesByCompanySize.push({size: companySize, nodes: companyGroupItem})
}

myNodesByCompanySize.sort(function (node1, node2) {
   return node2.size - node1.size;
});

let step = (2*innerRadius) / (1+totalCompanySize);
myNodesByCompanySize.forEach(function (n, i) {
    n.center = {x: 0, y: 0 - innerRadius + (i + 1) * step};
});

function sortNodesByCompanySize() {
    simulation.alphaTarget(0.15).restart();

    nodes.forEach(function (n) {
        myNodesByCompanySize.forEach(function (centerNode) {
            if (centerNode.size == n.companies.length) {
                n.cx = centerNode.center.x;
                n.cy = centerNode.center.y;
            }
        });
    });
}

//
// // draw vertical centroids
// arcGroup.selectAll('.company-sort-center').data(myNodesByCompanySize).enter()
//     .append('circle')
//     .attr('class', 'company-sort-center')
//     .attr('r', 3)
//     .style('fill', '#000000')
//     .style('opacity', 0.4)
//     .attr('cx', function (n) {
//         return n.center.x;
//     })
//     .attr('cy', function (n) {
//         return n.center.y;
//     })
// ;

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
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
;

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

node.selectAll('path')
    .data(function(d, i) {
        return pie(d.companies);
    })
    .enter()
    .append('svg:path')
    .attr('class', 'individual-data')
    .attr('d', pieArc)
    // .style('opacity', function (d) {
    //     debugger;
    //     return d.opacity;
    // })
    .style("fill", function (c) {

        return  getColorByCompany(c.data);
    })
;

var labels = arcGroup.selectAll('.data-label').data(nodes)
    .enter()
    .append('text')
        .text(function (n) {
            return n.name;
        })
          .style('font-size', 9)
          .style('opacity', 1)
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

    labels
        .attr("transform", (n) => {
            return "translate(" + n.x + ", " + (n.y - n.radius-2) + ")";
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
