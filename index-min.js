!function(){var e={apiKey:keys.apiKey,authDomain:keys.authDomain,projectId:keys.projectId,storageBucket:keys.storageBucket,messagingSenderId:keys.messagingSenderId,databaseURL:keys.databaseURL,appId:keys.appId,measurementId:keys.measurementId};firebase.initializeApp(e)}(),document.querySelector("#rules-of-game").onclick=(()=>{document.querySelector("#inst-box").removeAttribute("hidden")}),document.querySelector("#how-to-play").onclick=(()=>{document.querySelector("#inst-box-htp").removeAttribute("hidden")}),document.querySelector(".cross").onclick=(()=>{document.querySelector("#inst-box").setAttribute("hidden",!0),document.querySelector("#inst-box-htp").setAttribute("hidden",!0)}),document.querySelector(".cross").onclick=(()=>{document.querySelector("#inst-box").setAttribute("hidden",!0)}),document.querySelector("#inst-box-htp .cross").onclick=(()=>{document.querySelector("#inst-box-htp").setAttribute("hidden",!0)});let players=[],turn=0,gameOver=!1,dimensionRow=parseInt(document.getElementById("dimensionsRow").value),dimensionCol=parseInt(document.getElementById("dimensionsCol").value),length=parseInt(document.getElementById("length").value),theme="light",board=new Array(dimensionRow).fill("").map(()=>new Array(dimensionCol).fill("")),username=document.getElementById("user-name").value;const changeDimensionRow=e=>{dimensionRow=parseInt(e.target.value),board=new Array(dimensionRow).fill("").map(()=>new Array(dimensionCol).fill("")),console.log(board)},changeDimensionCol=e=>{dimensionCol=parseInt(e.target.value),board=new Array(dimensionRow).fill("").map(()=>new Array(dimensionCol).fill("")),console.log(board)},changeLength=e=>{if(length=parseInt(e.target.value),console.log("length",length),length>dimensionCol||length>dimensionRow)return alert("length should be less than row and column"),void(length=parseInt(3))},changeTheme=e=>{console.log(e)};var checkbox=document.querySelector("#theme-selector");checkbox.addEventListener("change",function(e){this.checked?(document.body.classList.remove("light-mode"),document.body.classList.add("dark-mode"),document.getElementById("inst-box").className="inst-box inst-box-dark",document.getElementById("inst-box-htp").className="inst-box inst-box-dark",theme="dark"):(document.body.classList.add("light-mode"),document.body.classList.remove("dark-mode"),document.getElementById("inst-box").className="inst-box inst-box-light",document.getElementById("inst-box-htp").className="inst-box inst-box-light",theme="light")}),document.getElementById("dimensionsRow").addEventListener("change",changeDimensionRow),document.getElementById("length").addEventListener("change",changeLength),document.getElementById("dimensionsCol").addEventListener("change",changeDimensionCol);const createGame=async()=>{let e=document.getElementById("user-name").value;if(isEmpty(e))return void alert("Player name is required");document.querySelector(".menu").setAttribute("hidden",!0),document.querySelector("#loading").removeAttribute("hidden");const t=(new Date).getTime()%1e6;let o={player1:e,row:dimensionRow,col:dimensionCol,length:length,ready1:!0,ready2:!1,turn:e,win:null,board:new Array(Number(dimensionRow)).fill("").map(()=>new Array(Number(dimensionCol)).fill(""))};try{await firebase.database().ref(`rooms/${t}`).set(o)}catch{return alert("something went wrong. try again"),document.querySelector(".menu").removeAttribute("hidden"),void document.querySelector("#loading").setAttribute("hidden",!0)}console.log(t),document.querySelector("#loading").setAttribute("hidden",!0),document.querySelector("#room-id-box").removeAttribute("hidden"),document.querySelector("#room-id-text").textContent=`Room ID : ${t}`,copyToClipboard(t);var n=firebase.database().ref(`rooms/${t}/ready2`);n.on("value",e=>{const r=e.val();console.log("value changed",r),r&&(console.log("player 1 confirms player 2 is ready"),document.querySelector("#room-id-box").setAttribute("hidden",!0),document.querySelector("#rules-of-game").setAttribute("hidden",!0),document.querySelector("#how-to-play").setAttribute("hidden",!0),document.querySelector("#footer-box").setAttribute("hidden",!0),n.off(),startGame(o,t))})},copyToClipboard=e=>{const t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)},joinGame=async()=>{let e,t=document.getElementById("user-name").value,o=document.getElementById("room-id").value;if(isEmpty(t))return void alert("Player name is required");if(isEmpty(o))return void alert("Enter Room ID");document.querySelector("#join-game").setAttribute("disabled",!0),document.querySelector("#room-id").setAttribute("disabled",!0),document.querySelector("#join-game").innerHTML="Loading",firebase.database().ref().child(`rooms/${o}`).get().then(async n=>{n.exists()?(e=n.val(),console.log(n.val()),t!==e.player1?(await firebase.database().ref(`rooms/${o}`).update({player2:t,ready2:!0}),console.log("player 2 is loaded"),document.querySelector("#join-game").removeAttribute("disabled"),document.querySelector(".menu").setAttribute("hidden",!0),document.querySelector("#rules-of-game").setAttribute("hidden",!0),document.querySelector("#how-to-play").setAttribute("hidden",!0),document.querySelector("#footer-box").setAttribute("hidden",!0),startGame(e,o)):alert("Your name is same as your oponent, Please change")):alert("Wrong Room ID")}).catch(e=>{console.error(e),alert("Something went wrong, try again"),document.querySelector("#join-game").removeAttribute("disabled"),document.querySelector("#room-id").removeAttribute("disabled"),document.querySelector("#join-game").innerHTML="Join Game"})},startGame=async(e,t)=>{let o=document.getElementById("user-name").value,n=document.getElementById("game-container");var r=firebase.database().ref(`rooms/${t}`);n.classList.remove("hide"),document.getElementById("turn").innerHTML=e.turn+"'s turn",document.querySelector(".setting-show").removeAttribute("hidden"),document.getElementById("row-show").innerHTML=`Rows: ${e.row}`,document.getElementById("col-show").innerHTML=`Column: ${e.col}`,document.getElementById("length-show").innerHTML=`Length: ${e.length}`;let l=document.getElementById("game-container");window.matchMedia("(max-width: 350px)")&&Number(e.col)>6&&(l.style.transform="scale(0.8)",l.style.position="relative",l.style.bottom="20px");let a=e.board;for(let n=0;n<e.row;n++){let r=document.createElement("div");r.className="row";for(let l=0;l<e.col;l++){let e=document.createElement("div");e.setAttribute("id",`cell${n}${l}`),e.addEventListener("click",e=>{firebase.database().ref().child(`rooms/${t}`).get().then(async e=>{if(e.exists()){let r=await e.val();console.log("turn",r.turn),console.log("username",o),r.turn===o&""===a[n][l]&&(a[n][l]="X",firebase.database().ref(`rooms/${t}`).update({board:a,turn:r.turn===r.player1?r.player2:r.player1}),calculateWin(r.row,r.col,r.length,a)&&firebase.database().ref(`rooms/${t}`).update({win:r.turn}))}}).catch(e=>{console.error(e),alert("Something went wrong, try again")})}),e.className="dark"===theme?"cell cell-white-border":"cell cell-black-border",r.appendChild(e)}l.appendChild(r)}r.on("value",async e=>{const o=e.val();if(console.log("value changed"),o){a=o.board;for(let e=0;e<o.row;e++)for(let t=0;t<o.col;t++)document.querySelector(`#cell${e}${t}`).innerHTML=o.board[e][t],document.getElementById("turn").innerHTML=o.turn+"'s turn";o.win&&(document.getElementById("turn").innerHTML=o.win+" Won",alert(`${o.win} Won`),r.off(),document.getElementById("play-again").removeAttribute("hidden"),document.getElementById("play-again").onclick=(async()=>{let e={player1:o.player1,row:o.row,col:o.col,length:o.length,ready1:!0,ready2:!0,win:null,board:new Array(Number(o.row)).fill("").map(()=>new Array(Number(o.col)).fill(""))};await firebase.database().ref(`rooms/${t}`).update(e),document.getElementById("play-again").setAttribute("hidden",!0);for(let e=0;e<o.row;e++)for(let t=0;t<o.col;t++)document.querySelector(`#cell${e}${t}`).remove();startGame(e,t)}))}})},calculateWin=(e,t,o,n)=>{let r=o;console.log(n);for(let o=0;o<e;o++)for(let e=0;e<t-r+1;e++){let t=0;if("X"===n[o][e]||"O"===n[o][e]){t++;for(let l=1;l<r&&n[o][e]===n[o][e+l];l++)if(++t===r)return!0}}for(let o=0;o<t;o++)for(let t=0;t<e-r+1;t++){let e=0;if("X"===n[t][o]||"O"===n[t][o]){e++;for(let l=1;l<r&&n[t][o]===n[t+l][o];l++)if(++e===r)return!0}}for(var l,a=e,d=t,i=Math.max(d,a),s=[],m=0;m<=2*(i-1);++m){l=[];for(var c=a-1;c>=0;--c){(y=m-(a-c))>=0&&y<d&&l.push(n[c][y])}l.length>0&&s.push(l)}console.log("a - array",s);for(let e=0;e<s.length;e++)for(let t=0;t<s[e].length;t++){let o=0;if("X"===s[e][t]||"O"===s[e][t]){o++;for(let n=1;n<r&&s[e][t]===s[e][t+n];n++)if(++o===r)return!0}}var u=[];for(m=0;m<=2*(i-1);++m){l=[];for(c=a-1;c>=0;--c){var y;(y=m-c)>=0&&y<d&&l.push(n[c][y])}l.length>0&&u.push(l)}for(let e=0;e<s.length;e++)for(let t=0;t<s[e].length;t++){let o=0;if("X"===u[e][t]||"O"===u[e][t]){o++;for(let n=1;n<r&&u[e][t]===u[e][t+n];n++)if(++o===r)return!0}}return!1},isEmpty=e=>!e||!e.trim();