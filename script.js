window.onload = function () {
    //----------------  elements de la grille  ----------------//
    const matrix = document.getElementById("matrix");
    const namesMatrix = document.getElementById("namesMatrix");
    const soundGrid = document.getElementsByClassName("soundCell");
    const loopGrid = document.getElementsByClassName("loopCell");
    //-------------------------------------------------------- //
    //------------------------buttons-------------------------//
    const newNotes = document.getElementsByClassName("addBtn");
    const playBtn = document.getElementById("playButton");
    const stopBtn = document.getElementById("stopButton");
    const pauseBtn = document.getElementById("pauseButton");
    const clearBtn = document.getElementById("clearButton");
    clearBtn.addEventListener("click",clear);
    //--------------------------------------------------------//
    //---------------------VARIABLES-------------------------//
    let playing = false;
    let stopped = true;
    const loopLength = 200;
    let timer = 0;
    //-------------------------------------------------------//
    //--------------------AUDIO CONTEXT----------------------//
    const audioBuffers = {};
    async function initAudioContext() {
        await Tone.start();
    }
    function loadSounds(cell) {
        let soundName = cell.classList[1];
        initAudioContext().then(() => {
            const audioFileUrl = `sounds/${soundName}.wav`;            //uniquement fichier .wav
            Tone.Buffer.fromUrl(audioFileUrl).then((buffer) => {
                audioBuffers[soundName] = buffer;
                console.log(audioBuffers);
            })
        });
    }
    //-------------------------------------------------------//
    //----------- Cocher les cellules de la grille------------//
    matrix.onclick = () => tickCell(soundGrid.length);     //problème : double click forcé
    function tickCell(gridSize){
            for(let i=0 ; i<gridSize ; i++){
                soundGrid[i].addEventListener("click" , ()=> {
                    loadSounds(soundGrid[i]);
                    if(soundGrid[i].getAttribute("active")==="off"){
                        soundGrid[i].style.backgroundColor = "rgba(0, 0, 255, 0.3)" ; 
                        return soundGrid[i].setAttribute("active", "on");    
                    }else if(soundGrid[i].getAttribute("active")==="on"){
                        soundGrid[i].style.backgroundColor = " rgba(195, 255, 184, 0.3)";
                        return soundGrid[i].setAttribute("active", "off");
                    }
                })
            }
        }
    //-------------------------------------------------------//
    //-------------  Ajouter Ligne à la grille --------------//
    for(let i=0 ;i<newNotes.length ; i++){
        newNotes[i].onclick = () => addNoteToGrid(i);
    }
    function addNoteToGrid(choosenNote){
        if(soundGrid[choosenNote][1] != true){
            let lastChild = soundGrid[matrix.childElementCount-1];
            let lastChildAttr = parseInt(lastChild.getAttribute('data-row'));
            let noteValue = newNotes[choosenNote].value;
            let noteNameContainer = document.createElement("div");
            noteNameContainer.innerText = noteValue;
            namesMatrix.insertAdjacentElement("beforeend",noteNameContainer);
            for(i=0 ; i<16 ; i++){
                let newCell = document.createElement("div");
                newCell.classList.add("soundCell");
                newCell.classList.add(noteValue);
                newCell.setAttribute("data-row",lastChildAttr+1);
                newCell.setAttribute("data-col", i );
                newCell.setAttribute("active", "off");
                matrix.insertAdjacentElement("beforeend",newCell);
            }
            console.log( soundGrid[choosenNote][1]);
            soundGrid[choosenNote][1] = true;
        }else if(soundGrid[choosenNote][1]===true){
            //suppression note de la grille
        }
    }
    //------------------------------------------------------//
    //-------------------Boucle son-------------------------//
    playBtn.addEventListener("click" , () =>{
        if(playing === false){
            playing = true;
            stopped = false; 
            play();
            return;
        }
    })
    function play(){
        const loop = setTimeout(play,loopLength);
        playBtn.removeEventListener("click",play);
        pauseBtn.addEventListener("click",pause);                    
        stopBtn.addEventListener("click",stop);
        timer >= 16 ? timer=0 : timer=timer;
        loopAnimation(loopGrid,timer);  
        checkCellPosition("data-col", timer);   
        timer++
        function pause(){
            clearTimeout(loop);
            playBtn.addEventListener("click",play);
        }
        function stop(){
            clearTimeout(loop);
            playBtn.addEventListener("click",play);
            timer=0;
        }
    }
    function clear(){
        for(i=0 ; i<soundGrid.length ; i++) {
            soundGrid[i].style.backgroundColor = "rgba(195, 255, 184, 0.3)";
            soundGrid[i].setAttribute("active","off");
        }
    }
    //-----------------------------------------------------//
    //---------------Animation boucle --------------------//
    function loopAnimation(element,number){
        for(let i=0 ; i<element.length; i++){
            if(i != number){
                element[i].style.background = "white";
            }else if(i === timer){
                element[i].style.background = "blue";
            }
        }
    }
    function checkCellPosition(attribute, value){
        for (var i = 0; i < soundGrid.length; i++){
            let cellColor = window.getComputedStyle( soundGrid[i] ,null).getPropertyValue('background-color');
            let cellColorStringArray = cellColor.split(' ');
            let newOpacity = "0.9)";
            let highOpacity = cellColorStringArray[0].concat(' ',cellColorStringArray[1],cellColorStringArray[2],newOpacity);
            let lowOpacity = cellColorStringArray[0].concat(' ',cellColorStringArray[1],cellColorStringArray[2],"0.3");
            if(soundGrid[i].getAttribute(attribute) != value){
                soundGrid[i].style.backgroundColor = lowOpacity;
            }else if (soundGrid[i].getAttribute(attribute) == value) {
                soundGrid[i].style.backgroundColor = highOpacity;
                playSound(soundGrid[i]);
            }
        }
      }
    //------------------------------------------------------//
    //-------------------------JOUER SON--------------------//
    function playSound(currentCell){
        if(currentCell.getAttribute("active")==="on"){
            let soundName = currentCell.classList[1];
            let player = new Tone.Player(audioBuffers[soundName]).toDestination();
            player.start();
        }
    }
}