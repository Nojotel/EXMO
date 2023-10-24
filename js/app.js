class VoiceRecorder {
  constructor() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported");
    } else {
      console.log("getUserMedia is not supported on your browser!");
    }

    this.mediaRecorder;
    this.stream;
    this.chunks = [];
    this.isRecording = false;

    this.recorderRef = document.querySelector(".recorder");
    this.playerRef = document.querySelector(".player");
    this.startRef = document.querySelector(".microphone_start");
    this.stopRef = document.querySelector(".microphone_stop");

    this.startRef.onclick = this.startRecording.bind(this);
    this.stopRef.onclick = this.stopRecording.bind(this);

    this.constraints = {
      audio: true,
      video: false,
    };
  }

  handleSuccess(stream) {
    this.stream = stream;
    this.stream.oninactive = () => {
      console.log("Stream ended!");
    };
    this.recorderRef.srcObject = this.stream;
    this.mediaRecorder = new MediaRecorder(this.stream);
    console.log(this.mediaRecorder);
    this.mediaRecorder.ondataavailable = this.onMediaRecorderDataAvailable.bind(this);
    this.mediaRecorder.onstop = this.onMediaRecorderStop.bind(this);
    this.recorderRef.play();
    this.mediaRecorder.start();
  }

  handleError(error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  onMediaRecorderDataAvailable(e) {
    this.chunks.push(e.data);
  }

  onMediaRecorderStop(e) {
    const blob = new Blob(this.chunks, { type: "audio/mp3" });
    const audioURL = window.URL.createObjectURL(blob);
    this.playerRef.src = audioURL;
    this.chunks = [];
    this.stream.getAudioTracks().forEach((track) => track.stop());
    this.stream = null;
    senVoice(blob);
  }

  startRecording() {
    if (this.isRecording) return;
    this.isRecording = true;
    this.playerRef.src = "";
    navigator.mediaDevices.getUserMedia(this.constraints).then(this.handleSuccess.bind(this)).catch(this.handleError.bind(this));
  }

  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.recorderRef.pause();
    this.mediaRecorder.stop();
  }
}

async function senVoice(blob) {
  let formData = new FormData();
  formData.append("audio", blob);
  console.log(blob);
  let promise = await fetch("https://farm.pythonanywhere.com/upload/", {
    method: "POST",
    body: formData,
  });
  let response = await promise.json();
  console.log(response.recognized_text);
  answer.textContent = `${response.recognized_text}`;
}

const sendVoice = document.querySelector(".microphone_start");
const stopVoice = document.querySelector(".microphone_stop");
const answer = document.querySelector(".neznayka__answer");
const question = document.querySelector(".neznayka__question");

sendVoice.addEventListener("click", function () {
  sendVoice.classList.add("hidden");
  stopVoice.classList.remove("hidden");
  question.textContent = "Привет, Незнайка! Меня зовут Александр. Расскажи, а Земля круглая?";
  answer.textContent = "...";
});
stopVoice.addEventListener("click", function () {
  stopVoice.classList.add("hidden");
  sendVoice.classList.remove("hidden");
});

window.voiceRecorder = new VoiceRecorder();
