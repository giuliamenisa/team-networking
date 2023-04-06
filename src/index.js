import { createTeamsRequest, loadTeamsRequest, updateTeamRequest, deleteTeamRequest } from "./Request";
import { sleep } from "./utilities";
// const utilities = require('.utilities');

let allTeams = [];
let editId;

function readTeam() {
  return {
    promotion: document.getElementById("promotion").value,
    members: document.getElementById("members").value,
    name: document.getElementById("name").value,
    url: document.getElementById("url").value
  };
}

function writeTeam({ promotion, members, name, url }) {
  document.getElementById("promotion").value = promotion;
  document.getElementById("members").value = members;
  document.getElementById("name").value = name;
  document.getElementById("url").value = url;
}

function getTeamsHTML(teams) {
  return teams
    .map(
      ({ promotion, members, name, url, id }) => `
        <tr>
          <td>${promotion}</td>
          <td>${members}</td>
          <td>${name}</td>
          
           <td>
             <a href="${url}" target="_blank">${url.replace("https://github.com/", "")}</a>
           </td>
           <td> 
             <a data-id="${id}" class="remove-btn">✖</a>
             <a data-id="${id}" class="edit-btn">&#9998;</a>
           </td>
        </tr>`
    )
    .join("");
}

let oldDisplayTeams;
function displayTeams(teams) {
  if (oldDisplayTeams === teams) {
    console.warn("same teams to display");
    return;
  }
  oldDisplayTeams = teams;
  console.time("display");
  document.querySelector("#teams tbody").innerHTML = getTeamsHTML(teams);
  console.timeEnd("display");
}

function loadTeams() {
  loadTeamsRequest().then(teams => {
    //window.teams = teams;
    allTeams = teams;
    console.info(teams);
    displayTeams(teams);
  });
}

async function onSubmit(e) {
  e.preventDefault();
  const team = readTeam();
  if (editId) {
    team.id = editId;
    const status = await updateTeamRequest(team).then(status => {
      return status;

      if (status.success) {
        // // loadTeams();

        allTeams = allTeams.map(t => {
          if (t.id === team.id) {
            console.warn("t", t, team);
            return {
              ...t,
              ...team
            };
          }
          return t;
        });

        displayTeams(allTeams);
        e.target.reset();
      }
    });
  } else {
    const status = await createTeamRequest(team);
    console.warn("status", status.syccess, status.id);

    if (status.success) {
      team.id = status.id;
      allTeam = [...allTeams, team];
      displayTeams(allTeams);
      e.target.reset();
    }
  }
}
//TODO
function prepareEdit(id) {
  const team = allTeams.find(team => team.id === id);
  editId = id;

  document.getElementById("promotion").value = team.promotion;
  document.getElementById("members").value = team.members;
  document.getElementById("name").value = team.name;
  document.getElementById("url").value = team.url;
}

function initEvents() {
  const form = document.getElementById("editForm");
  form.addEventListener("submit", onSubmit);
  form.addEventListener("reset", () => {
    editId = undefined;
  });

  document.querySelector("#teams tbody").addEventListener("click", async e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;

      const status = await deleteTeamRequest(id);
      if (status.success) {
        loadTeams();
      }
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      prepareEdit(id);
    }
  });
}

loadTeams();

initEvents();

// TODO MOVE IN EXTERNAL FILE
console.info("sleep");
sleep(2000).then(() => {
  console.info("done1");
});

console.warn("after sleep");

(async () => {
  console.info("sleep2");
  var r2 = await sleep(5000);
  console.warn("done2", r2);
})();
