(function(){
  "use strict";
  function context(){return window.FOX_LIVE_CONTEXT||{program:{id:"FOX",title:"FOX Through the Years",era:"FOX",collection:"Television"},stationSeconds:0,playing:false};}
  function program(){
    const item=context().program||{};
    return{id:item.id||item.title||"FOX",title:item.title||"FOX Through the Years",channel:"FOX",year:item.year,era:item.era,collection:item.collection,sourceUrl:context().sourceUrl||item.watchUrl||""};
  }
  function metadataIndex(){
    const item=program();
    return{program:item,indexLevel:"program-metadata",moments:[{
      id:item.id+"-metadata",
      start:0,
      end:Math.max(60,Number(context().stationSeconds||0)+120),
      transcript:"",
      setting:"FOX Through the Years live-style channel",
      actions:["The viewer is watching or opening the scheduled "+item.title+" block."],
      themes:[item.era||"FOX television",item.collection||"programming history"],
      entities:[{name:item.title,type:"television-program",description:[item.year,item.era,item.collection].filter(Boolean).join(" · ")}],
      objects:[],
      connections:[
        {from:item.title,fromType:"television-program",relationship:"aired within",to:"FOX television history",toType:"broadcast-era"}
      ],
      source:{kind:"schedule-metadata",url:item.sourceUrl||"",confidence:1}
    }]};
  }
  function mount(){
    const root=document.getElementById("cosmo");
    if(!root||!window.Cosmo)return;
    window.foxCosmo=Cosmo.mount({
      root,
      user:{id:localStorage.getItem("infinity_user_id")||"fox-guest"},
      program,
      playback:()=>({seconds:Number(context().stationSeconds)||0,playing:!!context().playing}),
      index:metadataIndex,
      proactiveEveryMs:240000
    });
    const open=document.getElementById("cosmoOpen");
    if(open)open.addEventListener("click",()=>{root.hidden=false;});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();