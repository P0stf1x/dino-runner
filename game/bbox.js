export function bboxs_intersect(bbox0, bbox1) {
    if (bbox0.x1 < bbox1.x0) { return false }
    if (bbox0.x0 > bbox1.x1) { return false }
    if (bbox0.y1 < bbox1.y0) { return false }
    if (bbox0.y0 > bbox1.y1) { return false }
    return true;
}
