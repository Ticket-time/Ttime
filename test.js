function test(){
    let j = 0;
    let k = 0;
    let showList = [];
    for (let i = 0; i < 3; i++) {
        const data = {
            j : j,
            k : k
        }
        j++; k++;
        const jsonString= JSON.stringify(data);
        showList.push(JSON.parse(jsonString));
    }

    // for(let i = 0; i < 3; i++) {
    //     console.log(showList[i]);
    // }
    return showList;
}

function test2() {
    let arr = test();

    console.log(arr);
}

test2();