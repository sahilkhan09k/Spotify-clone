let currentSong = new Audio();
const play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");
let songs;
let currFolder;
let cardContainer = document.querySelector(".cardContainer");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let links = div.getElementsByTagName("a");

        songs = [];
        for (let link of links) {
            if (link.href.endsWith(".mp3")) {
                songs.push(link.href.split(`${folder}/`)[1]);
            }
        }

        let songUl = document.querySelector(".songlist ul");
        songUl.innerHTML = "";

        for (const song of songs) {
            songUl.innerHTML += `
                <li>
                    <img class="invert" src="img/music.svg" alt="music">
                    <div class="info">
                        <div class="name font">${song.replaceAll("%20", " ")}</div>
                        <div class="font">Sahil Khan</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="play">
                    </div>
                </li>`;
        }

        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(element => {
            element.addEventListener("click", () => {
                let songName = element.querySelector(".info .name").textContent;
                playMusic(songName);
            });
        });
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
    return songs;
}

const playMusic = (song, pause = false) => {
    currentSong.src = `/${currFolder}/` + song;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").textContent = decodeURI(song);
    document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
};

async function displayAlbums() {
    try {
        let response = await fetch("http://127.0.0.1:3000/songs/");
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a");

        for (let anchor of anchors) {
            if (anchor.href.includes("/songs")) {
                let folder = anchor.href.split("/").slice(-2)[0];
                try {
                    let albumInfo = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                    let response = await albumInfo.json();
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <i class="fa-solid fa-play" style="color: black; font-size: 20px; margin: 0; padding: 0; display: inline-flex; align-items: center; margin-bottom: 3px;"></i>
                            </div>
                            <img aria-hidden="false" draggable="false" loading="lazy" src="/songs/${folder}/cover.jpg" data-testid="card-image" alt="" class="mMx2LUixlnN_Fu45JpFB yMQTWVwLJ5bV8VGiaqU3 yOKoknIYYzAE90pe7_SE Yn2Ei5QZn19gria6LjZj">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
                } catch (error) {
                    console.error("Error fetching album info:", error);
                }
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                console.log("Card clicked, folder:", folder);
                songs = await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function main() {
    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.src = "img/pause.svg";
            currentSong.play();
        } else {
            play.src = "img/play.svg";
            currentSong.pause();
        }
    });

    previous.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (idx - 1 >= 0) {
            playMusic(songs[idx - 1]);
        }
    });

    next.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (idx + 1 < songs.length) {
            playMusic(songs[idx + 1]);
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", el => {
        let p = (el.offsetX / el.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${p}%`;
        currentSong.currentTime = (p * currentSong.duration) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("ran").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volimg").addEventListener("click", (el) => {
       console.log(el.target);
       if(el.target.src.includes("img/volume.svg")) {
        el.target.src = el.target.src.replace("img/volume.svg", "img/mute.svg");
        currentSong.volume = 0;
        document.getElementById("ran").value = 0;
       } else {
        el.target.src = el.target.src.replace("img/mute.svg", "img/volume.svg");
        currentSong.volume = 1;
        document.getElementById("ran").value = 100;
       }
    })
}

main();