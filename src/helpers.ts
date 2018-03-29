export function getNewTileBag() {
    let tileBag: number[] = new Array(108);
    for (let i = 0; i < 108; i++) {
        tileBag[i] = i;
    }
    shuffle(tileBag);
    return tileBag;
}

// from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a: number[]) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}
