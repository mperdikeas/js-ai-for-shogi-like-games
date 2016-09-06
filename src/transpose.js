import assert from 'assert';

function transpose(m: Array<Array<any>>) {
    const rv: Array<Array<any>> = [];
    const rows: number = m.length;
    const cols: number = m[0].length;
    for (let j: number = 0; j < cols; j++) {
        for (let i: number = 0; i < rows; i++) {
            if (!rv[j]) {
                rv[j] = [];
            }
            rv[j][i] = m[i][j];
        }
    }
    assert(rv.length    === cols);
    assert(rv[0].length === rows);
    return rv;
}


exports.transpose = transpose;
