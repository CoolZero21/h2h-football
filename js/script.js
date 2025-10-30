const findBtn = document.querySelector("#searchButton")
findBtn.addEventListener("click", async (e)=>{
    e.preventDefault();
    if(myApi.length === 0) {
        const apiBtn = document.querySelector(".apiBtn")
        const searchDiv = document.querySelector(".search")
        const window = document.createElement("div")
        window.innerHTML = `<p>Firstly you need to paste your API key</p>`
        window.classList.add("infobox")
        searchDiv.appendChild(window)
        apiBtn.setAttribute("id", "api")
    } else {
        await getData();
    }
})


const team1Input = document.querySelector("#team1");
const team2Input = document.querySelector("#team2");
let myApi = ""


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
            throw new Error(`Somthing went wrong`);
        }

        const result = await response.json();
        const allMatches = result.response.sort((a,b)=>b.fixture.date.slice(0,10).replaceAll("-","")-a.fixture.date.slice(0,10).replaceAll("-",""));
    
        updateResult(allMatches);
    }
    catch (error) {
        console.error(error.message)
    }

    

}

async function getTeamInfo(input){

    const url = `https://v3.football.api-sports.io/teams?search=${input.value}`;

    try{
        const response = await fetch(url, {
	                                        "method": "GET",
                                            "headers": {
		                                        "x-rapidapi-host": "v3.football.api-sports.io",
		                                        "x-rapidapi-key": `${myApi}`
	                                        }
                                            });

        if(!response.ok){
            throw new Error(`Somthing went wrong`)
        }

        const result = await response.json();
        const teamId = result.response[0].team.id;
        const teamLogo = result.response[0].team.logo;
        const teamName = result.response[0].team.name;

        return {teamLogo, teamId, teamName};

    }
    catch (error){
        console.error(error.message);
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
    
    for (let match of result){
        console.log(match)
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



