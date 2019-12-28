const electron = require('electron');
const fs = require('fs');
const path = require('path');
const Player = require('./Music');

const { ipcRenderer,remote:{dialog} } = electron;


// dom
function _(data){
  return window.document.querySelector(data);
}

// music config
const musicConfig = {
  song_list:_('.song-list'),
  song_like_list:_('.song-like-list'),
  song_title:_('.song-title'),
  song_like_icon:_('.song-like img'),
  // btn
  prev_btn:_('.prev-btn img'),
  play_btn:_('.play-btn img'),
  next_btn:_('.next-btn img'),
  // time
  cur_time:_('.cur-time'),
  dur_time:_('.dur-time'),
  // time slider
  time_slider:_('.time-slider'),
  // speaker slider
  speaker_slider:_('.speaker-slider'),
  speaker_icon:_('.speaker img'),
  // song status icon
  song_status_icon:_('.song-static img'),
  // music thumbnail icon
  music_thumbnail:_('.music-thumbnail img')
}


// music main class
class Music {
  static Main(){
    this.files = [];
  }

  static Init(){
    // storage
    let files = JSON.parse(window.localStorage.getItem('music-files')); 
    if(files){
      this.files = files;
    }

    Player.setFiles(this.files);
  }

  static openFile(){
    this.files = [];
    const url = dialog.showOpenDialogSync({
      properties:['openFile'],
      filters:[
        {name:'Audio',extensions:['mp3','m4a']}
      ]
    });
    if(!url) return false;
    const parse = path.parse(url[0]);
    const file = {
      name:parse.name,
      file_name:parse.base,
      dir:parse.dir,
      like:false
    };
    // push 
    this.files.push(file);
    this.setStorage(this.files);
    this.Init();
  }

  static openFolder(){
    this.files = [];
    const url = dialog.showOpenDialogSync({
      properties:['openDirectory']
    });
    if(!url) return false;
    // url to files
    this.urlToFiles(url[0]);
    this.Init();
  }

  static urlToFiles(url){
    let files = [];
    let folder = fs.readdirSync(url);
    folder.forEach(f =>{
      let stat = fs.lstatSync(`${url}/${f}`);
      if(stat.isFile()){
        let parse = path.parse(`${url}/${f}`);
        let ext = path.parse(`${url}/${f}`);
        if(this.check_is_mp3(ext)){
          const file = {
            name:parse.name,
            file_name:parse.base,
            dir:parse.dir,
            like:false
          };
          // push 
          this.files.push(file);
        }
       
      }
    })
    this.setStorage(this.files);
  }

  static check_is_mp3(ext){
    if(/.mp3 || .m4a/.test(ext)){
      return true;
    }else{
      return false;
    }
  }

  static setStorage(files){
    window.localStorage.setItem('music-files',JSON.stringify(files));
  }
}

// class init
Music.Main();
Player.Main();
Player.Config(musicConfig);

// window onload
window.onload = ()=>{
  Music.Init();
  // show current song top
  window.location = '#current-title';
}

// listener

// open file
ipcRenderer.on('open-file',e =>{
  Music.openFile();
});

// open folder
ipcRenderer.on('open-folder',e =>{
  Music.openFolder();
});


// song one click
function songOneClick(name){
  Player.clickSongOne(name);
}

// set song like 
function setSongLike(name){
  Player.setLikeSong(name);
}