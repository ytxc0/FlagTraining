function getBorderIntersections(point, polygon)
{
    let pointOutside = [0, 90];

    let xDiff = pointOutside[0] - point[0];
    let yDiff = pointOutside[1] - point[1];

    let raySlope = yDiff / xDiff;
    let rayYIntercept = point[1] - raySlope * point[0];

    console.log(`Ray function: ${raySlope}x + ${rayYIntercept}`);

    borderIntersections = 0;
    for (let i = 0; i < polygon.length - 1; i++)
    {
        let lineStart = polygon[i];
        let lineEnd = polygon[i + 1];

        let xDiff = lineEnd[0] - lineStart[0];
        let yDiff = lineEnd[1] - lineStart[1];

        let lineSlope = yDiff / xDiff;
        let lineYIntercept = lineStart[1] - lineSlope * lineStart[0];


        xIntersect = (rayYIntercept - lineYIntercept) / (lineSlope - raySlope);

        if (xIntersect > Math.min(lineStart[0], lineEnd[0]) && xIntersect < Math.max(lineStart[0], lineEnd[0]) &&
            xIntersect > Math.min(point[0], pointOutside[0]) && xIntersect < Math.max(point[0], pointOutside[0]))
        {
            borderIntersections += 1;
            console.log(`Segment start: ${lineStart}; Segment end: ${lineEnd}`);
            console.log(`Border segment line function: ${lineSlope}x + ${lineYIntercept}`);
            console.log(`xIntersect: ${xIntersect}`);
        }
    }

    return borderIntersections;
}


function isPointInCountry(point, country)
{
    let startTime = new Date();

    let multipoly = countryShapes[country];
    let borderIntersections = 0;
    multipoly.forEach(poly =>
    {
        poly.forEach(subpoly =>
        {
            borderIntersections += getBorderIntersections(point, subpoly);
        });
    });

    let endTime = new Date();
    console.log(`The calculation took ${endTime.getTime() - startTime.getTime()}ms`);

    return (borderIntersections % 2) == 1;
}