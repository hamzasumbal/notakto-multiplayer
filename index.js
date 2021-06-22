
(function () {


    var firebaseConfig = {
        apiKey: keys.apiKey,
        authDomain: keys.authDomain,
        projectId: keys.projectId,
        storageBucket: keys.storageBucket,
        messagingSenderId: keys.messagingSenderId,
        databaseURL: keys.databaseURL,
        appId: keys.appId,
        measurementId: keys.measurementId
    };
    firebase.initializeApp(firebaseConfig);


}())

document.querySelector('#rules-of-game').onclick = () => {
    document.querySelector('#inst-box').removeAttribute('hidden')
}

document.querySelector('#how-to-play').onclick = () => {
    document.querySelector('#inst-box-htp').removeAttribute('hidden')
}

document.querySelector('.cross').onclick = () => {
    document.querySelector('#inst-box').setAttribute('hidden', true)
    document.querySelector('#inst-box-htp').setAttribute('hidden', true)
}

document.querySelector('.cross').onclick = () => {
    document.querySelector('#inst-box').setAttribute('hidden', true)
}

document.querySelector('#inst-box-htp .cross').onclick = () => {
    document.querySelector('#inst-box-htp').setAttribute('hidden', true)
}




let players = [];
let turn = 0;
let gameOver = false;
let dimensionRow = parseInt(document.getElementById("dimensionsRow").value);
let dimensionCol = parseInt(document.getElementById("dimensionsCol").value);
let length = parseInt(document.getElementById("length").value);
let board = new Array(dimensionRow)
    .fill("")
    .map(() => new Array(dimensionCol).fill(""));
let username = document.getElementById("user-name").value;



const changeDimensionRow = (event) => {
    dimensionRow = parseInt(event.target.value);
    board = new Array(dimensionRow)
        .fill("")
        .map(() => new Array(dimensionCol).fill(""));

    console.log(board)
};


const changeDimensionCol = (event) => {
    dimensionCol = parseInt(event.target.value);
    board = new Array(dimensionRow)
        .fill("")
        .map(() => new Array(dimensionCol).fill(""));

    console.log(board)
};

const changeLength = (event) => {
    length = parseInt(event.target.value);
    console.log("length", length)
    if (length > dimensionCol || length > dimensionRow) {
        alert("length should be less than row and column")
        length = parseInt(3);
        return;
    }
};

document
    .getElementById("dimensionsRow")
    .addEventListener("change", changeDimensionRow);

document
    .getElementById("length")
    .addEventListener("change", changeLength);

document
    .getElementById("dimensionsCol")
    .addEventListener("change", changeDimensionCol);


const createGame = async () => {
    let username = document.getElementById("user-name").value;
    if (isEmpty(username)) {
        alert("Player name is required");
        return;
    }
    document.querySelector('.menu').setAttribute('hidden', true)
    document.querySelector('#loading').removeAttribute('hidden')
    const timeStamp = new Date().getTime() % 1e6;


    let dataSet = {
        player1: username,
        row: dimensionRow,
        col: dimensionCol,
        length: length,
        ready1: true,
        ready2: false,
        turn: username,
        win: null,
        board: new Array(Number(dimensionRow))
            .fill("")
            .map(() => new Array(Number(dimensionCol)).fill(""))
    }

    try {
        await firebase.database().ref(`rooms/${timeStamp}`).set(dataSet);

    } catch {
        alert("something went wrong. try again")
        document.querySelector('.menu').removeAttribute('hidden')
        document.querySelector('#loading').setAttribute('hidden', true)
        return;
    }

    console.log(timeStamp)
    document.querySelector('#loading').setAttribute('hidden', true)
    document.querySelector('#room-id-box').removeAttribute('hidden')
    document.querySelector('#room-id-text').textContent = `Room ID : ${timeStamp}`
    copyToClipboard(timeStamp)
    let data;

    var readDatabase = firebase.database().ref(`rooms/${timeStamp}/ready2`);
    readDatabase.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("value changed", data)
        if (data) {
            console.log("player 1 confirms player 2 is ready")
            document.querySelector('#room-id-box').setAttribute('hidden', true)
            document.querySelector('#rules-of-game').setAttribute('hidden', true)
            document.querySelector('#how-to-play').setAttribute('hidden', true)
            document.querySelector('#footer-box').setAttribute('hidden', true)
            readDatabase.off()
            startGame(dataSet, timeStamp)
        }

    });
}

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};


const joinGame = async () => {
    let username = document.getElementById("user-name").value;
    let roomID = document.getElementById("room-id").value;



    if (isEmpty(username)) {
        alert("Player name is required");
        return;
    }

    if (isEmpty(roomID)) {
        alert("Enter Room ID");
        return;
    }

    document.querySelector('#join-game').setAttribute('disabled', true)
    document.querySelector('#room-id').setAttribute('disabled', true)
    document.querySelector('#join-game').innerHTML = "Loading"



    let data;

    const dbRef = firebase.database().ref();
    dbRef.child(`rooms/${roomID}`).get().then(async (snapshot) => {
        if (snapshot.exists()) {
            data = snapshot.val();
            console.log(snapshot.val());

            if (username === data.player1) {
                alert("Your name is same as your oponent, Please change")
                return
            }

            await firebase.database().ref(`rooms/${roomID}`).update({
                player2: username,
                ready2: true,
            });

            console.log("player 2 is loaded")
            document.querySelector('#join-game').removeAttribute('disabled')
            document.querySelector('.menu').setAttribute('hidden', true)
            document.querySelector('#rules-of-game').setAttribute('hidden', true)
            document.querySelector('#how-to-play').setAttribute('hidden', true)
            document.querySelector('#footer-box').setAttribute('hidden', true)
            startGame(data, roomID)


        } else {
            alert("Wrong Room ID")
            return;
        }
    }).catch((error) => {
        console.error(error);
        alert("Something went wrong, try again")
        document.querySelector('#join-game').removeAttribute('disabled')
        document.querySelector('#room-id').removeAttribute('disabled')
        document.querySelector('#join-game').innerHTML = "Join Game"

        return;
    });

}



const startGame = async (data, roomID) => {

    let username = document.getElementById("user-name").value;
    let game = document.getElementById("game-container");
    var readDatabase = firebase.database().ref(`rooms/${roomID}`);
    game.classList.remove("hide");


    document.getElementById("turn").innerHTML = data.turn + "'s turn";
    document.querySelector(".setting-show").removeAttribute('hidden')
    document.getElementById("row-show").innerHTML = `Rows: ${data.row}`
    document.getElementById("col-show").innerHTML = `Column: ${data.col}`
    document.getElementById("length-show").innerHTML = `Length: ${data.length}`


    let gameContainer = document.getElementById("game-container");


    if (window.matchMedia("(max-width: 350px)")) {
        if (Number(data.col) > 6) {
            gameContainer.style.transform = 'scale(0.8)'
            gameContainer.style.position = "relative";
            gameContainer.style.bottom = "20px"
        }

    }






    let board = data.board;


    for (let i = 0; i < data.row; i++) {
        let row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < data.col; j++) {
            let cell = document.createElement("div")
            cell.setAttribute('id', `cell${i}${j}`)
            cell.addEventListener("click", (event) => {

               
                

                const dbRef = firebase.database().ref();
                dbRef.child(`rooms/${roomID}`).get().then(async (snapshot) => {
                    if (snapshot.exists()) {
                        let tempData = await snapshot.val();
                        console.log("turn", tempData.turn)
                        console.log("username", username)


                        if (tempData.turn === username & board[i][j] === "") {
                            board[i][j] = "X";
                            firebase.database().ref(`rooms/${roomID}`).update({
                                board: board,
                                turn: tempData.turn === tempData.player1 ? tempData.player2 : tempData.player1
                            });


                            if (calculateWin(tempData.row, tempData.col, tempData.length, board)) {
                                firebase.database().ref(`rooms/${roomID}`).update({
                                    win: tempData.turn
                                });

                            }


                        }




                    }
                }).catch((error) => {
                    console.error(error);
                    alert("Something went wrong, try again")
                    return;
                });







            });
            cell.className = "cell";
            row.appendChild(cell);
        }
        gameContainer.appendChild(row);
    }




    readDatabase.on('value', async (snapshot) => {
        const data = snapshot.val();
        console.log("value changed")

        if (data) {
            board = data.board
            for (let i = 0; i < data.row; i++) {
                for (let j = 0; j < data.col; j++) {


                    document.querySelector(`#cell${i}${j}`).innerHTML = data.board[i][j]
                    document.getElementById("turn").innerHTML = data.turn + "'s turn";

                }


            }

            if (data.win) {
                document.getElementById("turn").innerHTML = data.win + " Won";
                alert(`${data.win} Won`)
                readDatabase.off()
                document.getElementById("play-again").removeAttribute('hidden')

                document.getElementById("play-again").onclick = async () => {

                    let dataSet = {
                        player1: data.player1,
                        row: data.row,
                        col: data.col,
                        length: data.length,
                        ready1: true,
                        ready2: true,
                        win: null,
                        board: new Array(Number(data.row))
                            .fill("")
                            .map(() => new Array(Number(data.col)).fill(""))
                    }

                    await firebase.database().ref(`rooms/${roomID}`).update(dataSet);

                    document.getElementById("play-again").setAttribute('hidden', true)
                    for (let i = 0; i < data.row; i++) {
                        for (let j = 0; j < data.col; j++) {
                            document.querySelector(`#cell${i}${j}`).remove();
                        }
                    }
                    startGame(dataSet, roomID)

                }

            }



        }



    });

}



const calculateWin = (dimensionRow, dimensionCol, length, board) => {
    // first check for all rows in board and then for col and then for diagonals
    /* let len = board.length; */
    let len = length;

    console.log(board)





    //Row check


    for (let i = 0; i < dimensionRow; i++) {

        for (let j = 0; j < dimensionCol - len + 1; j++) {

            let countlen = 0;
            if (board[i][j] === "X" || board[i][j] === "O") {

                countlen++

                for (let z = 1; z < len; z++) {

                    if (board[i][j] === board[i][j + z]) {
                        countlen++

                        if (countlen === len) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }


                }

            }



        }


    }



    // Column Check

    for (let i = 0; i < dimensionCol; i++) {

        for (let j = 0; j < dimensionRow - len + 1; j++) {

            let countlen = 0;
            if (board[j][i] === "X" || board[j][i] === "O") {

                countlen++

                for (let z = 1; z < len; z++) {

                    if (board[j][i] === board[j + z][i]) {
                        countlen++

                        if (countlen === len) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }


                }

            }



        }


    }


    //diagonalCheck

    // right diagonals


    var Ylength = dimensionRow;
    var Xlength = dimensionCol;
    var maxLength = Math.max(Xlength, Ylength);
    var temp;
    var a = [];
    for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
        temp = [];
        for (var y = Ylength - 1; y >= 0; --y) {
            var x = k - (Ylength - y);
            if (x >= 0 && x < Xlength) {
                temp.push(board[y][x]);
            }
        }

        if (temp.length > 0) {
            a.push(temp)
        }
    }

    //a is diagonal converted into rows and columns

    console.log("a - array", a)

    for (let i = 0; i < a.length; i++) {

        for (let j = 0; j < a[i].length; j++) {

            let countlen = 0;
            if (a[i][j] === "X" || a[i][j] === "O") {

                countlen++

                for (let z = 1; z < len; z++) {

                    if (a[i][j] === a[i][j + z]) {
                        countlen++

                        if (countlen === len) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }


                }

            }



        }


    }


    //left diagonals

    var temp;
    var b = [];
    for (var k = 0; k <= 2 * (maxLength - 1); ++k) {
        temp = [];
        for (var y = Ylength - 1; y >= 0; --y) {
            var x = k - y;
            if (x >= 0 && x < Xlength) {
                temp.push(board[y][x]);
            }
        }
        if (temp.length > 0) {
            b.push(temp)
        }
    }

    //b is diagonal converted into rows and columns

    for (let i = 0; i < a.length; i++) {

        for (let j = 0; j < a[i].length; j++) {

            let countlen = 0;
            if (b[i][j] === "X" || b[i][j] === "O") {

                countlen++

                for (let z = 1; z < len; z++) {

                    if (b[i][j] === b[i][j + z]) {
                        countlen++

                        if (countlen === len) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }


                }

            }



        }


    }



    return false;
};


const isEmpty = (value) => !value || !value.trim();

//----------------------------------------------------------------------------------

