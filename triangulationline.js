function TriangulationLine(points) {
    let vtxCount = 0;
    let ptsResult = [];

    vtxCount = points.length * 2;

    let s = {};
    for (let j = 0; j < points.length; ++j) {
        let p = points[j];
        if (s.current) {
            s.delta = [p.x - s.current.x, p.z - s.current.z];
            let deltaLength = Math.sqrt(s.delta[0] * s.delta[0] + s.delta[1] * s.delta[1]);
            s.direction = [s.delta[0] / deltaLength, s.delta[1] / deltaLength];
            let normal = [-s.direction[1], s.direction[0]];
            if (s.normal) {
                s.offset = [s.normal[0] + normal[0], s.normal[1] + normal[1]];
                let offsetLength = Math.sqrt(s.offset[0] * s.offset[0] + s.offset[1] * s.offset[1]);
                s.offset[0] /= offsetLength;
                s.offset[1] /= offsetLength;
                let d = s.normal[0] * s.offset[0] + s.normal[1] * s.offset[1];
                s.offset[0] /= d;
                s.offset[1] /= d;
            } else {
                s.offset = [normal[0], normal[1]];
            }
            ptsResult.push(new THREE.Vector3(s.current.x + s.offset[0], p.y, s.current.z + s.offset[1]));
            ptsResult.push(new THREE.Vector3(s.current.x - s.offset[0], p.y, s.current.z - s.offset[1]));
            s.normal = normal;
            s.distance += deltaLength;
        } else {
            s.distance = 0;
        }
        s.current = p;
    }

    ptsResult.push(new THREE.Vector3(s.current.x + s.offset[0], points[0].y, s.current.z + s.offset[1]));
    ptsResult.push(new THREE.Vector3(s.current.x - s.offset[0], points[0].y, s.current.z - s.offset[1]));

    return ptsResult;
}
