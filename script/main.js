import gameCards from "./cards.js";

const allCards = 24;
let totalCards = [20, 30, 48]; // 30(28) 48
let gameDifficulty = ['EASY', 'NORMAL', 'HARD'];
let columnsNum = [5, 6, 8]; // 5-20  6-30  8-48
let cardsWidth = ['188px', '155px', '113px']; // 5-20  6-30  8-48
let soundOn = false;
let repeatFour = false; // 4 of a kind  or 2 of  a kind
let score = 0;
let pointsPerMatch = 15000;
let pointsPerMiss = -1000;
let difficulty = 0; //  0 easy  1 normal  2 hard
let playerName ='meatbag #01';
const maxDisplayLines = 7;
let displayLines = [];
let playCards = [];
let cards = null;
let flippedCards = [];
let remainingCards = 0;
let clicksNumber = 0;
let fuelLeft = 0;
const delay = 1000;
let cheatOn = false;
let cheatClicksCount = 0;
let resetConfirmed = false;
const soundPaths = ['nomatch','match','match1','win','theme','shiny','bring_it_on','beep','click'];
const preloadImageNames = ['selector_2_0','selector_2_1','selector_2_2','switch_2_1','switch_2_0','switch_1_1','switch_1_0','reset_btn_pressed','dummy','butn_cancel','butn_ok'];
let sounds = [];
let displayDifficulty = 0;
let records = [];
let listedRecords = [];
let recordListScrollBase = 0;

const options = {
 totalCards : 20,
 columnsNum : 5,
 cardsWidth: '188px',
};

const dummyCard = {
    id: 99,
    charName: "dummy",
    charFullName: "",
    charImagePath: "./assets/img/cards/99.png",
    charBonus: "none",
    charQuote: "",
  };

//test
let butState = 0;

//dom binds
const outputDisplay = document.querySelector(".display-output");
// const movesDisplay = document.querySelector(".small-display");
const gameField = document.querySelector(".game-field");
const difficultySelector = document.querySelector(".difficulty-selector");
const difficultySelectorUp = document.querySelector(".difficulty-selector-up");
const difficultySelectorDown = document.querySelector(".difficulty-selector-down");
const resetButton = document.querySelector(".reset-button");
const pairSwitcher = document.querySelector(".switch-button-pairs");
const cheatSwitcher = document.querySelector(".switch-button-broken");
const soundSwitcher = document.querySelector(".switch-button-sound");
const okButtons = document.querySelectorAll(".ok-button");
const winPopup = document.querySelector(".popup-win");
const winMessage = document.querySelector(".win-message");
//const confirmationPopup = document.querySelector(".popup-confirmation");
const recordListTabs = document.querySelectorAll(".rec-nav-item");
const recordButtons = document.querySelectorAll(".rec-footer-nav-item");
const recordListContainer = document.querySelector(".rec-list");
const playerNameInput = document.querySelector(".player-name-input");


//event hooks
difficultySelectorUp.addEventListener("click", increaseDifficulty);
difficultySelectorDown.addEventListener("click", decreaseDifficulty);
resetButton.addEventListener("click", resetGame);
pairSwitcher.addEventListener("click", pairsSwitch);
cheatSwitcher.addEventListener("click", cheatSwitch);
soundSwitcher.addEventListener("click", soundSwitch);
okButtons.forEach((item) =>
  item.addEventListener("click", okButtonCheck)
);
recordListTabs.forEach((item) =>
  item.addEventListener("click", recordListTabsChange)
);
recordButtons.forEach((item) =>
  item.addEventListener("click", recordButtonsClick)
);


function recordListTabsChange(event) {
    playSound('click');
    switchTab(event.target.dataset.listtab);
}

function switchTab(tab) {

    recordListTabs.forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.listtab == tab) {item.classList.add("active");}

    });
    makeRecordsList(tab);
    recordListScrollBase = 0;
    displayRecordList(recordListScrollBase);

}

function displayRecordList(baseIndex) {
   // length 50. name space - len 30
    
    let outData = '';
    for (let i=0; i <= 5;i++) {
        outData = outData + listedRecords[i + baseIndex]+'<br>';
    }
    recordListContainer.innerHTML = outData;
 
}


function recordButtonsClick(event) {
    
    playSound('click');
    switch(event.target.dataset.footclick) {
        case 'clear':  
          clearLocalData()
          break;
      
        case 'up':  
           recordListScrollBase--;
           if (recordListScrollBase < 0) {
            recordListScrollBase = 0;
           }
           displayRecordList(recordListScrollBase);
           break;
          
        case 'down':  
        recordListScrollBase++;
           if (recordListScrollBase > 4) {
            recordListScrollBase = 4;
           }
           displayRecordList(recordListScrollBase);
        
          break;  
        default:
            break
      }

}

function preloadImages() {
    for (let i = 1; i <  preloadImageNames.length; i++) {
        const img = new Image();
        img.src = `./assets/img/${preloadImageNames[i]}.png`;
      }
}

function preloadAudio() {
    let i = 0;
    for (let soundName of soundPaths) {
      sounds[i] = new Audio();
      sounds[i].src = `./assets/sound/${soundName}.mp3`;
      sounds[i].autoplay = false
      sounds[i].volume = 0.8;
      i++;
    }
}

function playSound(sound) {
    if (soundOn) {

        sounds[soundPaths.indexOf(sound)].play();
    }
}

function playMusic() {
    sounds[soundPaths.indexOf('theme')].currentTime = 0;
    sounds[soundPaths.indexOf('theme')].play();
    sounds[soundPaths.indexOf('theme')].loop = true;
    sounds[soundPaths.indexOf('theme')].volume = 0.1; //10%
}

function stopMusic() {
    sounds[soundPaths.indexOf('theme')].pause();

}

function playWinMusic() {
    sounds[soundPaths.indexOf('win')].currentTime = 0;
    sounds[soundPaths.indexOf('win')].play();
    sounds[soundPaths.indexOf('win')].loop = true;
    sounds[soundPaths.indexOf('win')].volume = 0.12; //10%
}

function stopWinMusic() {
    sounds[soundPaths.indexOf('win')].pause();

}

function translit(value) {
    const lat= 'abvgdeejziklmnoprstufhccsseua--i';
    const cyr= 'абвгдеёжзиклмнопрстуфхцчшщэюяьъы';
    return value.split('').map((item,index)=>{
        if (cyr.indexOf(item) !=-1 ){ 
            return lat[cyr.indexOf(item)];
        }
        return item
   }).join('');
}

function okButtonCheck(event) {
    switch(event.target.dataset.button) {
        case 'win_ok':  
          
          // если ввели в винпопапе имя - и не было читов - то добавить в рекорд лист.  сохранить в локал стораджжж.  спарсить реокрд лист в отображаемыйе строки, вывести в окно

          //records.push(new)
          let pName = (playerNameInput.value == '') ? 'unknown meatbag #0' + Math.trunc(Math.random()*100) : playerNameInput.value.slice(0,30);
          pName = translit(pName);
          let today = new Date();
          let cDate = '';
          cDate = cDate.concat('', today.getFullYear());
          cDate = cDate.concat('/', (today.getMonth() > 8) ? (today.getMonth()+1) : '0' + (today.getMonth()+1));
          cDate = cDate.concat('/', (today.getDate() > 9) ? today.getDate(): '0' + today.getDate());

        //   today.getFullYear().toString(10) + '-' + (today.getMonth()) >8 ? (today.getMonth()+1).toString(10) : '0' + (today.getMonth()+1).toString(10) +'-' + (today.getDate()>9) ? today.getDate(): '0' + today.getDate();
          
        //   console.log(cDate);
        //   console.log(today);
        //   console.log(today.getFullYear());
        //   console.log(today.getMonth());
        //   console.log(today.getDate());


          let newRecordItem = {
            'date': cDate,
            'playerName':pName,
            'difficulty':displayDifficulty,
            'matchFours': repeatFour,
            'moves': clicksNumber,
            'score': score,
            'cheatsUsed': cheatOn,
            };
          
          if (!newRecordItem.cheatsUsed) {
                records.push(newRecordItem);
                localStorage.setItem('memorama-records', JSON.stringify(records));
                makeRecordsList(gameDifficulty[displayDifficulty].toLowerCase());
                recordListScrollBase=0;
                displayRecordList(0);
                recordListTabs.forEach((item) => {
                    item.classList.remove("active");
                    if (item.dataset.listtab == gameDifficulty[displayDifficulty].toLowerCase()) {item.classList.add("active");}
                });
          };

          // save records to LS
          winPopup.style.display = "none";
          if (soundOn) {
              stopWinMusic();
              playMusic();
          }
          break;
      
        case 'record_ok':  
          
          break;
          
        case 'reset_ok':  
        //   resetConfirmed = true;
        //   confirmationPopup.style.display = "none";
          break;  
        case 'reset_cancel':  
            // resetConfirmed = false;
            // confirmationPopup.style.display = "none";
          break;
      
        default:
            break
      }
}

function displayLog(message) {
    let headLine = `<div class="t1">moves:<span class="t2">${(clicksNumber < 10 ? '0' + clicksNumber : clicksNumber)}</span>
    &nbsp;cards:<span class="t2">${totalCardsCheck(displayDifficulty,repeatFour)}</span>
    &nbsp;cheats:<span class="t2">${(cheatOn ? 'on' : 'off')}</span>
    &nbsp;</div>`;
    let numLines = 0;
    if (message !='') {
        numLines = displayLines.push((displayLines.length<10 ? '0'+displayLines.length : displayLines.length) +': ' + message);
    } else {
        numLines = displayLines.length;
    }
    outputDisplay.innerHTML = headLine + '<br>'+ displayLines.slice(Math.max(0, numLines - maxDisplayLines)).join('<br>'); // + '<br> >';
}

function displayLogClear() {
    displayLines = [];
    outputDisplay.innerHTML = '.';
}

function redrawGameField() {
    function addCard(id) {
      const cardBlock = document.createElement("div");
      cardBlock.classList.add("card-block");
      const cardItem = document.createElement("div");
      cardItem.classList.add("card-item");
      const cardFront = document.createElement("div");
      const cardBack = document.createElement("div");
      cardFront.classList.add("card_front");
      cardBack.classList.add("card_back");
      
      gameField.append(cardBlock);
      cardBlock.append(cardItem);
      cardItem.append(cardFront);
      cardItem.append(cardBack);

      cardItem.dataset.id = id;
      if (id == 99) {
        cardFront.classList.add("dummy");
        cardItem.classList.add("dummy");

      } else {
        cardBack.style.backgroundImage = `url(${gameCards[id].charImagePath})`;
      }
        
    }
  
    document.documentElement.style.setProperty("--card-width", cardsWidth[difficulty]);
    document.documentElement.style.setProperty("--grid-columns",columnsNum[difficulty]);
    
    clearGameField();
  
    for (let i = 0; i < playCards.length; i++) {
      addCard(playCards[i]);
    }
    cards = null;
    cards = document.querySelectorAll(".card-item");
    cards.forEach((card) => {if (card.dataset.id != 99) {card.addEventListener("click", cardFlip)}});
      
  }

function cardFlip(event) {

    if (flippedCards.length < 2) {
        event.target.classList.add("flipped");
        flippedCards.push(event.target);
        clicksNumber++;
        // movesDisplay.innerHTML = "Moves: " + clicksNumber;
        displayLog('');
    }  
  
    if (flippedCards.length == 2) {
        setTimeout(() => {
        if (flippedCards[0].dataset.id == flippedCards[1].dataset.id ) {
            playSound('match1');
            flippedCards.forEach((card) => {
                card.classList.add("has-match");
                });
            remainingCards = remainingCards -2;
            score = score + Math.trunc(pointsPerMatch * remainingCards / totalCardsCheck(displayDifficulty,repeatFour) /100)*100
            displayLog('Match! Remaining cards: ' + remainingCards);
            //displayLog(score < 0 ? 0 : score );
            let quote = gameCards[flippedCards[0].dataset.id].charName + ": " + gameCards[flippedCards[0].dataset.id].charQuote;
            for (let i=0; i <= Math.trunc(quote.length / 33); i++) { //33 chars fit 1 display line so we have to split long string
                displayLog(quote.slice(i*33, 33 +i*33));
            }//todo  make function


            if (remainingCards == 0) {
                winMessage.innerHTML = "Congratulations, pilot! <br>You have won!<br>Total moves: " + clicksNumber;
                //playerNameInput.value ='';
                winPopup.style.display = "flex";
                displayLog('You have won in ' + clicksNumber + ' moves');
                if (soundOn) {
                    stopMusic();
                    playWinMusic();
                }
            }
        } else {
            flippedCards.forEach((card) => {
                card.classList.remove("flipped");
            });
            playSound('nomatch');
            score = score + pointsPerMiss;
            //displayLog(score < 0 ? 0 : score );
        }
        flippedCards = [];
    }, delay);
    }
}  

function shuffleCards() {
    //create card array, draw cardgs

    playCards = [];
    let numPairs = Math.trunc(totalCards[difficulty] / 2);
    
    if (repeatFour) {
       numPairs = Math.trunc(numPairs / 2); // 30 - > 28
    } 
    for (let i = 0; i < numPairs; i++) {
        let randNum = Math.trunc(Math.random()*allCards);
        while (playCards.indexOf(randNum, 0) != -1) {
          randNum = Math.trunc(Math.random()*allCards);
        }
         playCards.push(randNum);
    }
    playCards = playCards.concat(playCards);
    if (repeatFour) {playCards = playCards.concat(playCards)};

    //28 -> 30
    remainingCards = playCards.length;
    
    if (playCards.length == 28) {
        playCards.push(99);
        playCards.push(99);
    }

    playCards.sort(() => -1 + 2 * Math.random()).sort(() => -1 + 2 * Math.random()); 

    
    
    score = 0;
    clicksNumber = 0;

}

// function hasConfirmation() {
//     //todo  - show conf dialog  - if ok - true.  if cancel - false
//     confirmationPopup.style.display = "block";

//     return resetConfirmed;
// }


// function resetVerify() {
//     if (hasConfirmation()) {
//         resetGame()
//     }
// }

function resetGame() {
    
    
    displayLogClear();
    shuffleCards();
    redrawGameField();

    cheatOn = false;
    cheatClicksCount = 0;
    clicksNumber = 0;
    displayDifficulty = difficulty;
    score = 0;
    playSound('bring_it_on');

    displayLog("Game restarted.");
    displayLog("Total cards: " + totalCardsCheck(difficulty, repeatFour) +  ",  " + (repeatFour ? "4 of a kind":"2 of a kind"));
    // movesDisplay.innerHTML = "Moves: " + clicksNumber;

  
}

function totalCardsCheck(difficulty, repeatFour) {
  if (difficulty == 1 && repeatFour) {
      return 28; // black holes do not count as cards
  } 
  return totalCards[difficulty]
}

function increaseDifficulty() {
    switchDifficulty('up');
}
function decreaseDifficulty() {
    switchDifficulty('down');
}

function switchDifficulty(direction) {
   
   let newDifficulty = difficulty; 
   if (direction == 'up') {
       newDifficulty++;
       if (newDifficulty >2) {
           newDifficulty = 2;
        } else {
            playSound('click');
        }
   } else {
    newDifficulty--;
    if (newDifficulty < 0) {
        newDifficulty = 0;
     } else {
        playSound('click');
    }
   }

   //moves:00 cards:00 cheats:off

   if (newDifficulty != difficulty ) {
    difficulty = newDifficulty;
    difficultySelector.style.backgroundImage = `url('./assets/img/selector_2_${difficulty}.png')`;

    displayLog("Selected settings: " + gameDifficulty[difficulty] );
    displayLog("Cards: " + totalCardsCheck(difficulty,repeatFour) + ", pairs / fours: " + (repeatFour ? "fours":"pairs"));
    displayLog("Press RESET to restart");
  } 
  
}

function clearGameField() {
    while (gameField.firstChild) {
        gameField.removeChild(gameField.firstChild);
    }
  }
  


function pairsSwitch() {
    if (!repeatFour) {
        
        pairSwitcher.style.backgroundImage = "url('./assets/img/switch_1_1.png')";
        repeatFour = true;

    } else {
        
        pairSwitcher.style.backgroundImage = "url('./assets/img/switch_1_0.png')";
        repeatFour = false;

        

    }
    displayLog("Selected settings: " + gameDifficulty[difficulty] );
    displayLog("Cards: " + totalCardsCheck(difficulty,repeatFour) + ", pairs / fours: " + (repeatFour ? "fours":"pairs"));
    displayLog("Press RESET to restart");
}

function cheatSwitch() {
    if (!cheatOn) {
        cheatClicksCount++;
        if (cheatClicksCount == 7) {
            cheatOn = true;
            for (let i=0; i< totalCards[difficulty]; i++) {
                gameField.children[i].children[0].children[0].innerHTML = gameField.children[i].children[0].dataset.id;
            }
            displayLog("IDDQD");
        }
    }

}

function soundSwitch() {
    
    if (!soundOn) {
        soundSwitcher.style.backgroundImage = "url('./assets/img/switch_2_1.png')";
        soundOn = true;
        playMusic();
        // setTimeout(() => {soundSwitcher.style.backgroundImage = "url('./assets/img/switch_2_0.png')"}, 500);
        // displayLog("Bender has sold our");
        // displayLog("acoustic system! :)");
    } else {
        soundSwitcher.style.backgroundImage = "url('./assets/img/switch_2_0.png')";
        soundOn = false;
        stopMusic();

    }
    

}
//-------loc storage

const recordItem = {
'date':'',
'playerName':'',
'difficulty':0,
'matchFours': false,
'moves':0,
'score':0,
'cheatsUsed':false,
};

const lctest = [
    {
        'date':'2022/02/19',
'playerName':'meatbag #01',
'difficulty':0,
'matchFours': false,
'moves':31,
'score':0,
'cheatsUsed':false,
},{
    'date':'2022/01/23',
'playerName':'Dr John A. Zoidberg',
'difficulty':1,
'matchFours': false,
'moves':999,
'score':0,
'cheatsUsed':false,
},{
    'date':'2022/02/23',
'playerName':'Bender Bending Rodrigez',
'difficulty':0,
'matchFours': false,
'moves':5,
'score':0,
'cheatsUsed':false,
}];


function clearLocalData() {
    if (window.confirm("Do you really want to clear Local Storage data?")) {
        localStorage.clear();
      }
    records = [];
    makeRecordsList('easy');
    
    recordListTabs.forEach((item) => {
        item.classList.remove("active");
        if (item.dataset.listtab == 'easy') {item.classList.add("active");}

    });
    
    recordListScrollBase=0;
    displayRecordList(0);
    
}

function readRecordsFromLocalStorage() {
    let records = JSON.parse(localStorage.getItem('memorama-records'));
    if (records == null) {
        records = [];
    }
    return records;
}

function makeRecordsList(tab) {
//fill with dummy lines
    for (let i = 0; i<10; i++) {
        if (i < 9) {
            listedRecords[i]="0"+ (i+1) +'.'.repeat(48);
        } else {
            listedRecords[i]= (i+1) +'.'.repeat(48);
        }
        
    }
    if (records.length > 0) { //got something from loc storg


//filter by difficulty level
        let tabRecords = records.filter(function(item) { 
            return gameDifficulty[item.difficulty].toLowerCase() == tab.toLowerCase(); 
        });
//sort по moves ?
         tabRecords.sort(function(a, b) { return a.moves - b.moves;});
 //обрезать до 10шт, проверить что непусто
        if (tabRecords.length == 0) {return};
        for (let i = 0; i  < Math.min(10, tabRecords.length); i++) {
          (i == 9) ? listedRecords[i]='':listedRecords[i]='0';
          listedRecords[i]=listedRecords[i] + (i+1)+ '.' + tabRecords[i].playerName + ".".repeat(31-tabRecords[i].playerName.length) + tabRecords[i].date + ".." +"0".repeat(4-tabRecords[i].moves.toString(10).length) + tabRecords[i].moves;

        }
    } 
}



//console.table(records);

console.log("Вёрстка (10/10)\n--[+] реализован интерфейс игры (5/5)\n--[+] в футере приложения есть ссылка на гитхаб автора приложения, год создания приложения, логотип курса со ссылкой на курс (5/5)\n\n[+] Логика игры. Карточки, по которым кликнул игрок, переворачиваются согласно правилам игры (10/10)\n[+] Игра завершается, когда открыты все карточки (10/10)\n[+] По окончанию игры выводится её результат - количество ходов, которые понадобились для завершения игры (10/10)\n[-] Результаты последних 10 игр сохраняются в local storage. Есть таблица рекордов, в которой сохраняются результаты предыдущих 10 игр (10/10)\n[+] По клику на карточку – она переворачивается плавно, если пара не совпадает – обе карточки так же плавно переварачиваются рубашкой вверх (10/10)\n[+] Очень высокое качество оформления приложения и/или дополнительный не предусмотренный в задании функционал, улучшающий качество приложения (10/10)\n\n звук и локал сторадж добавлены, но после дедлайна сабмита- итого 60 баллов");

preloadImages();
preloadAudio();
//initiate record list
//localStorage.setItem('memorama-records', JSON.stringify(lctest));

records = readRecordsFromLocalStorage();
makeRecordsList('easy');
displayRecordList(0);

resetGame();

displayLog(`Welcome, ${playerName}!`); 
displayLog('Game ready, difficulty: ' + gameDifficulty[difficulty]);
displayLog('Click on cards to start');

// displayLog(' ');
// displayLog('PS: "local storage" module');
// displayLog('has been stolen by Robot');
// displayLog('Mafia. We should have it');
// displayLog('back by Thu :)');












