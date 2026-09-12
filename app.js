(function(){
  "use strict";
  const engine=window.FOXEngine,programs=window.FOX_PROGRAMS,template=window.FOX_DAY_TEMPLATE,$=id=>document.getElementById(id);
  const els={clock:$("stationClock"),mode:$("modeLabel"),title:$("nowTitle"),programTime:$("programTime"),enter:$("enterButton"),stationCard:$("stationCard"),cardLabel:$("stationCardLabel"),cardTitle:$("stationCardTitle"),cardCountdown:$("stationCardCountdown"),stationWatch:$("stationWatch"),startOver:$("startOverButton"),rewind:$("rewindButton"),live:$("liveButton"),position:$("positionLabel"),remaining:$("remainingLabel"),progress:$("progressBar"),next:$("nextCards"),guide:$("guideRows"),guideDate:$("guideDate"),share:$("shareButton"),shareStatus:$("shareStatus")};
  let player=null,playerReady=false,apiRequested=false,entered=false,loadedKey="",loadedProgramVideoId="",scheduleKey="",schedule=[],mode="live",timeShiftBaseMs=0,timeShiftStartedMs=0,startupPending=false,startupAttempts=0,startupTimer=0;
  const failedVideoIds=new Set();
  function activeClockMs(){return mode==="live"?Date.now():timeShiftBaseMs+(Date.now()-timeShiftStartedMs);}
  function buildSchedule(nowMs){
    const built=engine.createDaySchedule(nowMs,programs,template);
    return built.map((block,index)=>{
      if(block.movie.videoId&&block.movie.cleared&&!failedVideoIds.has(block.movie.videoId))return block;
      const choices=(template[index]&&template[index].choices)||[];
      const fallbackKey=choices.find(key=>{const item=programs[key];return item&&item.videoId&&item.cleared&&!failedVideoIds.has(item.videoId);});
      const networkFallback=(window.FOX_INLINE_KEYS||[]).find(key=>{const item=programs[key];return item&&item.videoId&&item.cleared&&!failedVideoIds.has(item.videoId);});return fallbackKey||networkFallback?{...block,movie:programs[fallbackKey||networkFallback]}:block;
    });
  }
  function ensureSchedule(nowMs){const key=engine.dateKey(nowMs);if(key!==scheduleKey){scheduleKey=key;schedule=buildSchedule(nowMs);renderGuide();}}
  function formatStationTime(ms){return new Intl.DateTimeFormat("en-US",{timeZone:engine.TIME_ZONE,hour:"numeric",minute:"2-digit"}).format(new Date(ms));}
  function formatDuration(seconds){const mins=Math.max(0,Math.ceil(seconds/60));return mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins} min`;}
  function programHue(item){let hash=0;for(const c of item.title)hash=((hash<<5)-hash+c.charCodeAt(0))|0;return Math.abs(hash)%360;}
  function artFor(item){if(item.posterUrl)return item.posterUrl;if(item.videoId)return `https://i.ytimg.com/vi/${item.videoId}/maxresdefault.jpg`;return "assets/channel-share.png";}
  function setProgramArt(item){document.body.style.setProperty("--program-hue",programHue(item));document.body.style.setProperty("--program-art",`url("${artFor(item)}")`);}
  function renderGuide(){
    if(!schedule.length)return;
    els.guideDate.textContent=new Intl.DateTimeFormat("en-US",{timeZone:engine.TIME_ZONE,weekday:"long",month:"long",day:"numeric"}).format(new Date(schedule[0].startsAtMs));
    els.guide.innerHTML=schedule.map(item=>`<article class="guide-row" data-id="${item.id}"><time>${formatStationTime(item.startsAtMs)}</time><div><strong>${item.movie.title}</strong><small>${item.movie.era||"FOX"}</small></div><span>${item.movie.year} · ${item.movie.collection}</span></article>`).join("");
  }
  function renderNext(currentBlock){
    const currentIndex=schedule.findIndex(item=>item.id===currentBlock.id);
    els.next.innerHTML=[1,2,3].map(step=>{const item=schedule[Math.min(schedule.length-1,currentIndex+step)],art=artFor(item.movie).replace(/"/g,"%22");return `<article class="next-card" style="--card-hue:${programHue(item.movie)};--card-art:url('${art}')"><time>${formatStationTime(item.startsAtMs)}</time><div><small>${item.movie.era||"FOX"}</small><h3>${item.movie.title}</h3><p>${item.movie.collection}</p></div></article>`;}).join("");
  }
  function hideStationWatch(){els.stationWatch.hidden=true;els.stationWatch.removeAttribute("href");}
  function showStationCard(state,message){
    els.stationCard.hidden=false;els.cardLabel.textContent=(state.block.movie.era||"").includes("Current")?"FOX · CURRENT ERA":"FOX · THROUGH THE YEARS";els.cardTitle.textContent=state.segment.title;
    if(state.segment.watchUrl){els.stationWatch.href=state.segment.watchUrl;els.stationWatch.hidden=false;els.cardCountdown.textContent=message||"This program opens from its available streaming source.";}
    else{hideStationWatch();els.cardCountdown.textContent=message||(state.segment.cleared?`${formatDuration(state.segmentRemaining)} until the next program`:"Archive slot · inline source not currently available.");}
  }
  function clearStartupTimer(){if(startupTimer){clearTimeout(startupTimer);startupTimer=0;}}
  function nudgePlayback(){clearStartupTimer();if(!entered||!playerReady||!startupPending||!player)return;let state;try{state=player.getPlayerState();}catch(_){return;}if(state===YT.PlayerState.PLAYING){startupPending=false;startupAttempts=0;return;}if(state===YT.PlayerState.PAUSED){startupPending=false;return;}if(state===YT.PlayerState.UNSTARTED||state===YT.PlayerState.CUED||state===YT.PlayerState.BUFFERING){if(startupAttempts<5){startupAttempts++;try{player.playVideo();}catch(_){}startupTimer=setTimeout(nudgePlayback,startupAttempts===1?250:650);}}}
  function loadMedia(state){
    if(!entered)return;const playable=state.segment.videoId&&state.segment.cleared&&!failedVideoIds.has(state.segment.videoId),mediaKey=`${state.block.id}:${state.segment.stationStart}:${state.segment.videoId}`;
    if(!playable){startupPending=false;clearStartupTimer();showStationCard(state);if(playerReady&&loadedKey!==mediaKey){try{player.stopVideo();}catch(_){}}loadedKey=mediaKey;return;}
    els.stationCard.hidden=true;hideStationWatch();
    if(loadedKey!==mediaKey){loadedKey=mediaKey;loadedProgramVideoId=state.segment.videoId;startupPending=false;startupAttempts=0;clearStartupTimer();const current=document.getElementById("player");const iframe=document.createElement("iframe");iframe.id="player";iframe.title=state.segment.title;iframe.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";iframe.allowFullscreen=true;iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.src="https://www.youtube.com/embed/"+encodeURIComponent(state.segment.videoId)+"?autoplay=1&playsinline=1&controls=1&rel=0&loop=1&playlist="+encodeURIComponent(state.segment.videoId)+"&origin="+encodeURIComponent(location.origin);current.replaceWith(iframe);player=null;playerReady=false;return;}
    if(!playerReady)return;
    if(startupPending)nudgePlayback();if(mode==="live"&&player.getPlayerState()===YT.PlayerState.PLAYING){const drift=state.mediaSeconds-player.getCurrentTime();if(Math.abs(drift)>2.5)player.seekTo(state.mediaSeconds,true);}
  }
  function tick(){
    const now=activeClockMs();ensureSchedule(now);const state=engine.resolve(now,schedule),liveSchedule=buildSchedule(Date.now()),liveState=engine.resolve(Date.now(),liveSchedule);
    window.FOX_LIVE_CONTEXT={program:state.block.movie,stationSeconds:state.blockElapsed,mediaSeconds:state.mediaSeconds,playing:entered&&!!(state.segment.videoId&&state.segment.cleared&&!failedVideoIds.has(state.segment.videoId)),mode:mode,sourceUrl:state.segment.watchUrl||state.block.movie.watchUrl||"",updatedAt:Date.now()};
    if(!entered){const inlineReady=!!(state.segment.videoId&&state.segment.cleared&&!failedVideoIds.has(state.segment.videoId));if(inlineReady){els.enter.hidden=false;els.stationCard.hidden=true;els.enter.innerHTML="<span>Enter FOX</span><small>Join the program at the moment airing now</small>";}else{els.enter.hidden=true;showStationCard(state,"Inline playback is not available for this scheduled program. Open its official source below.");}}
    els.clock.textContent=`${formatStationTime(Date.now())} local`;els.mode.textContent=mode==="live"?"LIVE FOX":"TIME SHIFTED";els.title.textContent=state.block.movie.title;setProgramArt(state.block.movie);els.programTime.textContent=`${formatStationTime(state.block.startsAtMs)}–${formatStationTime(state.block.endsAtMs)}`;
    els.position.textContent=mode==="live"?"Synced with the viewer’s local FOX channel clock":`${formatDuration(state.blockElapsed)} from start`;els.remaining.textContent=`${formatDuration(state.blockRemaining)} remaining in slot`;els.progress.style.width=`${Math.min(100,(state.blockElapsed/state.block.blockSeconds)*100)}%`;
    document.querySelectorAll(".guide-row").forEach(row=>row.classList.toggle("current",row.dataset.id===state.block.id));renderNext(liveState.block);loadMedia(state);
  }
  function enterStation(){entered=true;els.enter.hidden=true;loadedKey="";tick();}
  function loadYouTubeApi(){if(apiRequested||playerReady)return;apiRequested=true;if(window.YT&&window.YT.Player){window.onYouTubeIframeAPIReady();return;}const tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";tag.referrerPolicy="strict-origin-when-cross-origin";document.head.appendChild(tag);}
  function startOver(){const liveSchedule=buildSchedule(Date.now()),live=engine.resolve(Date.now(),liveSchedule);mode="timeshift";timeShiftBaseMs=live.block.startsAtMs;timeShiftStartedMs=Date.now();loadedKey="";tick();}
  function rewind(){mode="timeshift";timeShiftBaseMs=activeClockMs()-30000;timeShiftStartedMs=Date.now();loadedKey="";tick();}
  function joinLive(){mode="live";loadedKey="";scheduleKey="";tick();}
  function localShareCredit(reference){
    const attemptId=`fox-share-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch(_){return fallback;}},session=parse("starquest_session",null),users=parse("starquest_users",{}),signedIn=session&&session.key&&users[session.key],profile=signedIn||parse("starquest_guest_profile_v1",{key:"__guest__",username:"Guest",tokens:0,shareCount:0,pendingShareCredits:0,shareEvents:[],ledger:[]});
    profile.tokens=Math.max(0,Number(profile.tokens)||0);profile.shareCount=Math.max(0,Number(profile.shareCount)||0)+1;profile.pendingShareCredits=Math.max(0,Number(profile.pendingShareCredits)||0)+1;let awarded=0;while(profile.pendingShareCredits>=10){profile.pendingShareCredits-=10;profile.tokens+=1;awarded+=1;}
    const event={id:attemptId,contentId:reference,createdAt:Date.now(),confirmed:true};profile.shareEvents=(profile.shareEvents||[]).concat(event).slice(-250);profile.ledger=(profile.ledger||[]).concat({id:`tx-${attemptId}`,type:awarded?"share_reward":"share_credit",amount:awarded,balance:profile.tokens,pendingShareCredits:profile.pendingShareCredits,createdAt:Date.now()}).slice(-500);
    if(signedIn){users[session.key]=profile;localStorage.setItem("starquest_users",JSON.stringify(users));}else localStorage.setItem("starquest_guest_profile_v1",JSON.stringify(profile));return{awarded,progressToNextCoin:profile.pendingShareCredits,balance:profile.tokens};
  }
  async function shareChannel(){
    const title=els.title.textContent&&!els.title.textContent.includes("Loading")?els.title.textContent:document.title,share={title:`${title} · FOX Through the Years`,text:`Watch ${title} on FOX Through the Years — 1987 to now.`,url:location.href};
    if(!navigator.share){try{await navigator.clipboard.writeText(share.url);els.shareStatus.textContent="Link copied. Open Android Share to earn 1/10 StarCoin.";}catch(_){els.shareStatus.textContent="Sharing is unavailable in this browser.";}return;}
    try{await navigator.share(share);const result=localShareCredit(share.url);els.shareStatus.textContent=result.awarded?"Shared · 1 StarCoin completed!":`Shared · StarCoin progress ${result.progressToNextCoin}/10`;}catch(error){if(!error||error.name!=="AbortError")els.shareStatus.textContent="Share did not complete.";}
  }
  window.onYouTubeIframeAPIReady=function(){player=new YT.Player("player",{width:"100%",height:"100%",playerVars:{playsinline:1,controls:1,enablejsapi:1,autoplay:0,origin:location.origin,widget_referrer:location.href},events:{onReady:()=>{playerReady=true;try{player.unMute();player.setVolume(100);}catch(_){}if(entered){loadedKey="";tick();nudgePlayback();}},onStateChange:event=>{if(event.data===YT.PlayerState.PLAYING){startupPending=false;startupAttempts=0;clearStartupTimer();}else if(event.data===YT.PlayerState.ENDED&&entered){try{player.seekTo(0,true);player.playVideo();}catch(_){}}},onError:()=>{if(loadedProgramVideoId)failedVideoIds.add(loadedProgramVideoId);startupPending=false;clearStartupTimer();scheduleKey="";loadedKey="";loadedProgramVideoId="";setTimeout(tick,150);}}});};
  els.enter.addEventListener("click",enterStation);els.startOver.addEventListener("click",startOver);els.rewind.addEventListener("click",rewind);els.live.addEventListener("click",joinLive);els.share.addEventListener("click",shareChannel);ensureSchedule(Date.now());tick();setInterval(tick,1000);
})();
