/**
 *
 * @param cx: circle center x coordinate
 * @param cy: circle center y coordinate
 * @param startAngle:
 * @param endAngle
 * @param radius optional
 * @returns {{x: *, y: *}}
 */
function calculateCentroid(cx, cy, startAngle, endAngle, radius) {
    let myRadius = radius || 50;

    let centroidAngle = startAngle + (endAngle - startAngle)/2;
    let alpha = centroidAngle - Math.PI/ 2;

    return {x: cx + myRadius * Math.cos(alpha), y: cy + myRadius * Math.sin(alpha)};

}

