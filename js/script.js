let myApi = ""
const findBtn = document.querySelector("#searchButton")
findBtn.addEventListener("click", async (e)=>{
    e.preventDefault();
    if(myApi.length !== 32) {
        requestApiKey();
    } else {
        await getData();
    }
})

const searchDiv = document.querySelector(".search");
const apiBtn = document.querySelector(".apiBtn");
const windowInfo = document.createElement("div");
windowInfo.classList.add("infobox");


function requestApiKey(){
    windowInfo.innerHTML = `<p>Firstly you need to paste your API key</p>`;
    searchDiv.appendChild(windowInfo);
    setTimeout(() => {
        searchDiv.removeChild(windowInfo);
    }, 5000);
    apiBtn.setAttribute("id", "api");
}

const apiInputDiv = document.querySelector(".api-input");
const apiForm = document.querySelector(".get-api");

apiBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    apiBtn.removeAttribute("id");
    if (apiInputDiv.classList.contains("hidden")){
        apiInputDiv.classList.remove("hidden");
    } else {
        apiInputDiv.classList.add("hidden");
    }
})

function getApi(event){
    if (event.srcElement[0].value.length === 32){
        if(apiInputDiv.childElementCount === 3){
            const paraToDel = apiInputDiv.childNodes[3];
            apiInputDiv.removeChild(paraToDel);
        }
        myApi = event.srcElement[0].value;
        apiInputDiv.classList.add("hidden")
        findBtn.style.backgroundColor = "hsl(16, 100%, 66%)"
    } else {
        if(apiInputDiv.childElementCount === 2){
            const para = document.createElement("p")
            para.textContent = "API key must be 32 chars long"
            para.style.color = "red";
            para.style.fontSize = "1.5rem"
            apiInputDiv.insertBefore(para, apiForm)
        }
    }
    event.preventDefault();
}

apiForm.addEventListener('submit', getApi)

const team1Input = document.querySelector("#team1");
const team2Input = document.querySelector("#team2");


async function getData() {

    const team1Data = await getTeamInfo(team1Input);
    const team2Data = await getTeamInfo(team2Input);

    const team1 = team1Data?.teamId;
    const team2 = team2Data?.teamId;

    updateTeamsDisplay(team1Data, team2Data);

    const url = `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${team1}-${team2}`;

    try{
        const response = await fetch(url, {
	                                        "method": "GET",
                                            "headers": {
		                                        "x-rapidapi-host": "v3.football.api-sports.io",
		                                        "x-rapidapi-key": `${myApi}`
	                                        }
                                            })

        if (!response.ok) {
            throw new Error(`Somthing wrong with API`);
        }

        const result = await response.json();
        const allMatches = result.response.sort((a,b)=>b.fixture.date.slice(0,10).replaceAll("-","")-a.fixture.date.slice(0,10).replaceAll("-",""));
    
        updateResult(allMatches);
    }
    catch (error) {
        windowInfo.innerHTML = `<p>${error.message}</p>`;
        searchDiv.appendChild(windowInfo);
        setTimeout(() => {
            searchDiv.removeChild(windowInfo);
        }, 5000);
    }

    

}

async function getTeamInfo(input){
    const url = `https://v3.football.api-sports.io/teams?search=${input.value}`;

    try{
        if (input.value.length === 0) {
            throw new Error(`Fields cannot be empty!`)
        }
        const response = await fetch(url, {
	                                        "method": "GET",
                                            "headers": {
		                                        "x-rapidapi-host": "v3.football.api-sports.io",
		                                        "x-rapidapi-key": `${myApi}`
	                                        }
                                            });

        if(!response.ok){
            throw new Error(`Somthing wrong with API`)
        }

        const result = await response.json();
        if (result.errors.length === 0) {
            const teamId = result.response[0].team.id;
            const teamLogo = result.response[0].team.logo;
            const teamName = result.response[0].team.name;

            return {teamLogo, teamId, teamName};
        } else  if(result.errors.token){
            throw new Error(`${Object.values(result.errors)[0].split('/')[1].split('.')[0]}`)
        } else if(result.errors.search){
            throw new Error(`${result.errors.search}`)
        } else {
            throw new Error(`Unknown Error`)
        }
    }
    catch (error){
        windowInfo.innerHTML = `<p>${error.message}</p>`;
        searchDiv.appendChild(windowInfo);
        setTimeout(() => {
            searchDiv.removeChild(windowInfo);
        }, 5000);
    }

}

function updateTeamsDisplay(team1, team2){
    const teamLogo1 = document.querySelector(".team1 .teamImg img")
    const teamLogo2 = document.querySelector(".team2 .teamImg img")
    const teamName1 = document.querySelector(".team1 p")
    const teamName2 = document.querySelector(".team2 p")

    teamLogo1.src = team1.teamLogo;
    teamLogo2.src = team2.teamLogo;

    teamName1.textContent = team1.teamName;
    teamName2.textContent = team2.teamName;

}


function updateResult(result) {
    const resultsWrapper = document.querySelector(".results-wrapper");
    const resultsCont = document.querySelector(".results");
    resultsCont.innerHTML = "";
    resultsWrapper.classList.remove("displayNone");
    
    if (result.length === 0) {
        resultsCont.innerHTML = `<p class="no-matches">There was no mathes between teams</p>`
    } else {
        for (let match of result){
            const createDiv = document.createElement("div");
            createDiv.classList.add("match");
            if (match.fixture.status.short === "FT" || match.fixture.status.short === "AET") {
                createDiv.innerHTML =   `<img src="${match.teams.home.logo}">
                                        <p>${match.goals.home} : ${match.goals.away} <span class="date">${match.fixture.date.slice(0,10).split("-").reverse().join(".")}</span></p>
                                        <img src="${match.teams.away.logo}">`
            } else if (match.fixture.status.short === "CANC") {
                createDiv.innerHTML =   `<img src="${match.teams.home.logo}">
                                        <p>The match was canceled <span class="date">${match.fixture.date.slice(0,10).split("-").reverse().join(".")}</span></p>
                                        <img src="${match.teams.away.logo}">`
            } else if (match.fixture.status.short === "NS") {
                createDiv.innerHTML =   `<img src="${match.teams.home.logo}">
                                        <p>${match.fixture.date.slice(11,16)} <span class="date">${match.fixture.date.slice(0,10).split("-").reverse().join(".")}</span></p>
                                        <img src="${match.teams.away.logo}">`            
            }
            resultsCont.appendChild(createDiv);
        }
    }

}



