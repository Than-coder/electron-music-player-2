const mm = require('music-metadata');

class Player {

  static Main(){
    this.files = [];
    this.index = 0;
    this.currentSongTitle = '';
    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.song_status = 'normal';
    this.isShowSongLikeList = false;
    // get song status
    let songStatus = window.localStorage.getItem('song-status');
    if(songStatus){
      this.song_status = songStatus;
    }
  }

  static Config(config){
    this.song_list = config.song_list;
    this.song_like_list = config.song_like_list;
    this.song_title = config.song_title;
    // button
    this.prev_btn = config.prev_btn;
    this.play_btn = config.play_btn;
    this.next_btn = config.next_btn;
    // time
    this.cur_time = config.cur_time;
    this.dur_time = config.dur_time;
    // time slider
    this.time_slider = config.time_slider;
    // speaker slider
    this.speaker_slider = config.speaker_slider;
    this.speaker_icon = config.speaker_icon;
    // song like icon
    this.song_like_icon = config.song_like_icon;
    // song status icon
    this.song_status_icon = config.song_status_icon;
    // music thumbnail
    this.music_thumbnail = config.music_thumbnail;
    this.EventListener();
    
    // show song status player init
    this.showSongStatus();
  }

  static setFiles(files){
    this.files = files;
    // remove song
    // window.localStorage.removeItem('current-song');
    if(this.files.length == 0) return false;
    this.Init();
    
  }

  static Init(current=null){

    let file = this.files[this.index];
    if(!current){
      current = window.localStorage.getItem('current-song');
    }
    if(current){
      this.files.forEach((f,index) =>{
        if(f.name == current){
          this.index = index;
          this.currentSongTitle = f.name;
          this.audio.src = `${f.dir}/${f.file_name}`;
        }
      })
    }else{
      this.currentSongTitle = file.name;
      this.audio.src = `${file.dir}/${file.file_name}`;
    }  
    
    this.showSongList(this.files);  
    this.setCurrentSong(this.currentSongTitle);
    // audio loaded
    this.audio.onloadedmetadata = ()=>{
      this.Timer();
      this.UI();
    }
  
  }

  static setSongIndex(){
    let file = this.files[this.index];
    this.currentSongTitle = file.name;
    this.audio.src = `${file.dir}/${file.file_name}`;
    this.showSongList(this.files);  
    this.setCurrentSong(this.currentSongTitle);
    // audio loaded
    this.audio.onloadedmetadata = ()=>{
      this.audio.play();
      this.Timer();
      this.UI();
    }
  }

  static UI(){
    if(this.audio.paused){
      this.play_btn.src = 'icon/media-play.svg';
    }else{
      this.play_btn.src = 'icon/media-pause.svg';
    }
    // call thumbnail
    this.musicThumbnail();
  }

  static musicThumbnail(){
    this.files.forEach(async (f) =>{
      if(f.name == this.currentSongTitle){
        try{
          let meta = await mm.parseFile(`${f.dir}/${f.file_name}`);
          if(meta.common.picture){
            let img = meta.common.picture[0];
            let format = img.format;
            let data = img.data;
            let base64 = `data:${format};base64,${Buffer.from(data).toString('base64')}`;
            // set img
            this.music_thumbnail.src = base64;

          }
        }catch(err){
          console.log(err);
        }
      }else{
        // not found music thumbnail
        this.music_thumbnail.src = 'icon/music_1.jpg';
      }
    })
  }

  static Timer(){
    let duration = this.audio.duration;
    let currentTime = this.audio.currentTime;
    let durM = Math.floor(duration / 60);
    let durS = Math.floor(duration % 60);
    let curM = Math.floor(currentTime / 60);
    let curS = Math.floor(currentTime % 60);
    // show time slider
    let total = Math.floor((100 / duration) * currentTime);
    this.time_slider.value = total;
    // show time 
    this.cur_time.innerText = `${setZero(curM)}:${setZero(curS)}`;
    this.dur_time.innerText = `${setZero(durM)}:${setZero(durS)}`;
    // show speaker slider
    this.speaker_slider.value = this.audio.volume;
      // song ended
      if(this.audio.ended){
        // check song status
      if(this.song_status == 'normal'){
        this.normalSong();
      }else if(this.song_status == 'loop'){
        this.songNext();
      }else if(this.song_status == 'shuffle'){
        this.songNext();
      }
    }
    // audio play timer loop
    if(!this.audio.paused){
      setTimeout(()=>{
        this.Timer();
      },1000);
    }
  }

  static setCurrentSong(name){
    this.song_title.innerHTML = `<a href="#current-title" >${name}</a>`;
    window.localStorage.setItem('current-song',name);
  }

  static showSongList(files){
    let li = '';
    files.forEach((f,i) =>{
      i++;
      if(f.name == this.currentSongTitle){
        li += `
          <li style="color:rgb(31, 165, 14);" id="current-title">
            <span>${i}:</span>
            <span onclick="songOneClick('${f.name}')">${f.name}</span>
            <img onclick="setSongLike('${f.name}')" src="${f.like ? 'icon/heart_red.svg':'icon/unlike.svg'}" class="song-like-icon" alt="song-like" />
          </li>
        `;
      }else{
        li += `
          <li> 
          <span>${i}:</span>
          <span onclick="songOneClick('${f.name}')">${f.name}</span>
          <img onclick="setSongLike('${f.name}')" src="${f.like ? 'icon/heart_red.svg':'icon/unlike.svg'}" class="song-like-icon" alt="song-like" />
          </li>
        `;
      }
    });
    this.song_list.innerHTML = li;
  }

  static showSongStatus(){
    if(this.song_status == 'normal'){
      this.song_status_icon.src = 'icon/media-loop.svg';
    }else if(this.song_status == 'loop'){
      this.song_status_icon.src = 'icon/retweet.svg';
    }else if(this.song_status == 'shuffle'){
      this.song_status_icon.src = 'icon/media-shuffle.svg';
    }
  }

  static clickSongOne(name){
    this.Init(name);
    this.audio.onloadedmetadata = ()=>{
      this.audio.play();
      this.Timer();
      this.UI();
    }
  }

  static changeVolume(value){
    this.audio.volume = value;
  }

  static changeTimeSlider(value){
    let duration = this.audio.duration;
    let total = duration / 100;
    this.audio.currentTime = total * value;
  }

  static songNext(){
    if(this.song_status == 'shuffle'){
      let shuffle = Math.floor(Math.random() * this.files.length);
      this.index = shuffle;
    }else{
      this.index ++;
      if(this.index == this.files.length ){
        this.index = 0;
      }
    }
    this.setSongIndex();
  }
  
  static songPrev(){
    if(this.index == 0){
      this.index = this.files.length ;
    }
    this.index --;
    this.setSongIndex();
  }

  static songStatusChange(){
    if(this.song_status == 'normal'){
      this.song_status = 'loop';
      this.song_status_icon.src = 'icon/retweet.svg';
    }else if(this.song_status == 'loop'){
      this.song_status = 'shuffle';
      this.song_status_icon.src = 'icon/media-shuffle.svg';
    }else if(this.song_status == 'shuffle'){
      this.song_status = 'normal';
      this.song_status_icon.src = 'icon/media-loop.svg';
    }
    // set storage
    window.localStorage.setItem('song-status',this.song_status);
  }

  static clickSpeakerIcon(){
    if(this.audio.muted){
      this.audio.muted = false;
      this.speaker_icon.src = 'icon/volume-full.svg';
    }else{
      this.audio.muted = true;
      this.speaker_icon.src = 'icon/volume-off.svg';
    }
  }

  // song status
  static normalSong(){
    this.index ++;
    if(this.index == this.files.length ){
      this.index = 0;
      let file = this.files[this.index];
      this.currentSongTitle = file.name;
      this.audio.src = `${file.dir}/${file.file_name}`;
      this.showSongList(this.files);  
      this.setCurrentSong(this.currentSongTitle);
      // audio loaded
      this.audio.onloadedmetadata = ()=>{
        this.Timer();
        this.UI();
      }
    }else{
      this.setSongIndex();
    }
  }
  //set like song 
  static setLikeSong(name){
    let files = JSON.parse(window.localStorage.getItem('music-files'));
    this.files = files.map(f =>{
      if(f.name == name){
        return {
          ...f,
          like:!f.like
        }
      }else return f;
    })
    // set storage
    window.localStorage.setItem('music-files',JSON.stringify(this.files));
    // show song list
    this.showSongList(this.files);
  }
  // show like song list
  static showLikeSongList(){
    if(this.isShowSongLikeList){
      this.files = JSON.parse(window.localStorage.getItem('music-files'));
      this.showSongList(this.files);
      this.isShowSongLikeList = false;
      this.song_like_icon.src = 'icon/unlike.svg';
    }else{
      this.files = this.files.filter(f => f.like == true);
      this.showSongList(this.files);
      this.isShowSongLikeList = true;
      this.song_like_icon.src = 'icon/heart_red.svg';
    }

  }

  static EventListener(){
    // song like icon click
    this.song_like_icon.addEventListener('click',e =>{
      this.showLikeSongList();
      
    })
    // play btn click
    this.play_btn.addEventListener('click',e =>{
      if(this.audio.paused){
        this.audio.play();
      }else{
        this.audio.pause();
      }
      this.UI();
      this.Timer();
    })
    // speaker slider change
    this.speaker_slider.addEventListener('input',e =>{
      this.changeVolume(e.target.value);
    })
    // speaker icon click
    this.speaker_icon.addEventListener('click',e =>{
      this.clickSpeakerIcon();
    })
    // time slider change
    this.time_slider.addEventListener('input',e =>{
      this.changeTimeSlider(e.target.value);
    })
    // next btn click
    this.next_btn.addEventListener('click',e =>{
      this.songNext();
    })
    // prev btn click
    this.prev_btn.addEventListener('click',e =>{
      this.songPrev();
    })
    // song status icon click
    this.song_status_icon.addEventListener('click',e =>{
      this.songStatusChange();
    })
  }

}

// set zero
function setZero(data){
  return data < 10 ? '0'+data : data;
}


module.exports = Player;