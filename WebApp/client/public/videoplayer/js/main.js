import { VideoPlayer } from "./video-player.js";
import {
  registerGamepadEvents,
  registerKeyboardEvents,
  registerMouseEvents,
  sendClickEvent,
} from "../../js/register-events.js";
import { getServerConfig } from "../../js/config.js";

setup();

let playButton;
let videoPlayer;
let useWebSocket;

window.document.oncontextmenu = function () {
  return false; // cancel default menu
};

window.addEventListener(
  "resize",
  function () {
    videoPlayer.resizeVideo();
  },
  true
);

window.addEventListener(
  "beforeunload",
  async () => {
    await videoPlayer.stop();
  },
  true
);

window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("button");
  const result = document.getElementById("recognised-speech");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let ignoreSpeechAtIndex = -1;
  if (typeof SpeechRecognition === "undefined") {
    button.remove();
  } else {
    let listening = false;
    const recognition = new SpeechRecognition();
    const start = () => {
      recognition.start();
      button.textContent = "Stop listening";
    };
    const stop = () => {
      recognition.stop();
      button.textContent = "Start listening";
    };
    const onResult = (event) => {
      result.innerHTML = "";
      // console.log(event.results) //.splice(0, event.results.length - 2));
      if (event.results.length > 0) {
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal) {
          console.log(event.results[event.results.length - 1][0].transcript);
          const text = document.createTextNode(
            event.results[event.results.length - 1][0].transcript
          );
          const p = document.createElement("p");
          p.classList.add("final");
          p.appendChild(text);
          result.appendChild(p);
          if (event.results.length - 1 > ignoreSpeechAtIndex) {
            ignoreSpeechAtIndex = event.results.length - 1;
            //send message to unity
            sendEncodedMsgToUnity(
              event.results[event.results.length - 1][0].transcript
            );
            console.log(
              "ignoreSpeechAtIndex",
              ignoreSpeechAtIndex,
              event.results[event.results.length - 1][0].transcript
            );
          }
        } else {
          for (const res of event.results) {
            if (!res.isFinal) {
              const text = document.createTextNode(res[0].transcript);
              const p = document.createElement("p");
              if (res.isFinal) {
                p.classList.add("final");
              }
              p.appendChild(text);
              result.appendChild(p);
            }
          }
        }
      }
    };
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.addEventListener("result", onResult);
    button.addEventListener("click", () => {
      listening ? stop() : start();
      listening = !listening;

      result.innerHTML = "";
      ignoreSpeechAtIndex = -1;
    });
  }
});

async function setup() {
  const res = await getServerConfig();
  useWebSocket = res.useWebSocket;
  showWarningIfNeeded(res.startupMode);
  showPlayButton();
}

function showWarningIfNeeded(startupMode) {
  const warningDiv = document.getElementById("warning");
  if (startupMode == "private") {
    warningDiv.innerHTML =
      "<h4>Warning</h4> This sample is not working on Private Mode.";
    warningDiv.hidden = false;
  }
}

function showPlayButton() {
  if (!document.getElementById("playButton")) {
    let elementPlayButton = document.createElement("img");
    elementPlayButton.id = "playButton";
    elementPlayButton.src = "images/Play.png";
    elementPlayButton.alt = "Start Streaming";
    playButton = document
      .getElementById("player")
      .appendChild(elementPlayButton);
    playButton.addEventListener("click", onClickPlayButton);
  }
}

function sendEncodedMsgToUnity(msg) {
  msg = msg.toLowerCase();
  if (msg.indexOf("open") !== -1) {
    if (msg.indexOf("door") !== -1) {
      sendClickEvent(videoPlayer, 0);
    }
    if (msg.indexOf("boot") !== -1) {
      sendClickEvent(videoPlayer, 2);
    }
    if (msg.indexOf("driver") !== -1) {
      sendClickEvent(videoPlayer, 12);
    }
  }
  if (msg.indexOf("close") !== -1) {
    if (msg.indexOf("door") !== -1) {
      sendClickEvent(videoPlayer, 1);
    }
    if (msg.indexOf("boot") !== -1) {
      sendClickEvent(videoPlayer, 3);
    }
    if (msg.indexOf("driver") !== -1) {
      sendClickEvent(videoPlayer, 13);
    }
  }
  if (msg.indexOf("engine") !== -1) {
    if (msg.indexOf("start") !== -1) {
      sendClickEvent(videoPlayer, 4);
    }
    if (msg.indexOf("stop") !== -1) {
      sendClickEvent(videoPlayer, 5);
    }
  }
  if (msg.indexOf("exterior") !== -1) {
    if (msg.indexOf("silver") !== -1) {
      sendClickEvent(videoPlayer, 6);
    }
    if (msg.indexOf("red") !== -1) {
      sendClickEvent(videoPlayer, 7);
    }
    if (msg.indexOf("black") !== -1) {
      sendClickEvent(videoPlayer, 8);
    }
  }
  if (msg.indexOf("ambient") !== -1) {
    if (msg.indexOf("purple") !== -1) {
      sendClickEvent(videoPlayer, 9);
    }
    if (msg.indexOf("red") !== -1) {
      sendClickEvent(videoPlayer, 10);
    }
    if (msg.indexOf("blue") !== -1) {
      sendClickEvent(videoPlayer, 11);
    }
  }
}

function onClickPlayButton() {
  playButton.style.display = "none";

  const playerDiv = document.getElementById("player");

  // add video player
  const elementVideo = document.createElement("video");
  elementVideo.id = "Video";
  elementVideo.style.touchAction = "none";
  playerDiv.appendChild(elementVideo);

  // add video thumbnail
  // const elementVideoThumb = document.createElement('video');
  // elementVideoThumb.id = 'VideoThumbnail';
  // elementVideoThumb.style.touchAction = 'none';
  // playerDiv.appendChild(elementVideoThumb);

  setupVideoPlayer([elementVideo]).then((value) => (videoPlayer = value));

  // // add blue button
  // const elementBlueButton = document.createElement('button');
  // elementBlueButton.id = "blueButton";
  // elementBlueButton.innerHTML = "Light on";
  // playerDiv.appendChild(elementBlueButton);
  // elementBlueButton.addEventListener("click", function () {
  //   sendClickEvent(videoPlayer, 1);
  // });

  // // add green button
  // const elementGreenButton = document.createElement('button');
  // elementGreenButton.id = "greenButton";
  // elementGreenButton.innerHTML = "Light off";
  // playerDiv.appendChild(elementGreenButton);
  // elementGreenButton.addEventListener("click", function () {
  //   sendClickEvent(videoPlayer, 2);
  // });

  // // add orange button
  // const elementOrangeButton = document.createElement('button');
  // elementOrangeButton.id = "orangeButton";
  // elementOrangeButton.innerHTML = "Play audio";
  // playerDiv.appendChild(elementOrangeButton);
  // elementOrangeButton.addEventListener("click", function () {
  //   sendClickEvent(videoPlayer, 3);
  // });

  // add fullscreen button
  const elementFullscreenButton = document.createElement("img");
  elementFullscreenButton.id = "fullscreenButton";
  elementFullscreenButton.src = "images/FullScreen.png";
  playerDiv.appendChild(elementFullscreenButton);
  elementFullscreenButton.addEventListener("click", function () {
    if (!document.fullscreenElement || !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      } else {
        if (playerDiv.style.position == "absolute") {
          playerDiv.style.position = "relative";
        } else {
          playerDiv.style.position = "absolute";
        }
      }
    }
  });
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);
  document.addEventListener("fullscreenchange", onFullscreenChange);

  function onFullscreenChange() {
    if (document.webkitFullscreenElement || document.fullscreenElement) {
      playerDiv.style.position = "absolute";
      elementFullscreenButton.style.display = "none";
    } else {
      playerDiv.style.position = "relative";
      elementFullscreenButton.style.display = "block";
    }
  }
}

async function setupVideoPlayer(elements) {
  const videoPlayer = new VideoPlayer(elements);
  await videoPlayer.setupConnection(useWebSocket);

  videoPlayer.ondisconnect = onDisconnect;
  registerGamepadEvents(videoPlayer);
  registerKeyboardEvents(videoPlayer);
  registerMouseEvents(videoPlayer, elements[0]);

  return videoPlayer;
}

function onDisconnect() {
  const playerDiv = document.getElementById("player");
  clearChildren(playerDiv);
  videoPlayer.stop();
  videoPlayer = null;
  showPlayButton();
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
