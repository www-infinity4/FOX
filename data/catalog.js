// FOX full-program catalog.
// Programming rule: FOX should rotate eras and formats instead of becoming a Gordon Ramsay loop.
// Only complete long-form programs from cleared sources enter the automatic schedule.
window.FOX_PROGRAMS={
  hkVegas:{id:"FOX-HK-S19E1",title:"Hell's Kitchen — Welcome to Vegas",year:2021,era:"FOX Reality",collection:"Hell's Kitchen · Full Episode",runtimeSeconds:2545,videoId:"KAWvDsghyc8",cleared:true,watchUrl:"https://www.youtube.com/watch?v=KAWvDsghyc8"},
  hkBreakfast:{id:"FOX-HK-S21E5",title:"Hell's Kitchen — Breakfast 911",year:2022,era:"FOX Reality",collection:"Hell's Kitchen · Full Episode",runtimeSeconds:2445,videoId:"2D8KCV70nHI",cleared:true,watchUrl:"https://www.youtube.com/watch?v=2D8KCV70nHI"},
  hkWedding:{id:"FOX-HK-S21E6",title:"Hell's Kitchen — Til Chef Do Us Part",year:2022,era:"FOX Reality",collection:"Hell's Kitchen · Full Episode",runtimeSeconds:2441,videoId:"ZIDcNhBbN4w",cleared:true,watchUrl:"https://www.youtube.com/watch?v=ZIDcNhBbN4w"},

  knSandwich:{id:"FOX-KN-SANDWICH",title:"Kitchen Nightmares — Powdered Sugar Sandwich",year:2011,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2438,videoId:"TWP0YpfvGvM",cleared:true,watchUrl:"https://www.youtube.com/watch?v=TWP0YpfvGvM"},
  knHarryPotter:{id:"FOX-KN-HARRY",title:"Kitchen Nightmares — Something Out of Harry Potter",year:2012,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2438,videoId:"Ya74LVYel1I",cleared:true,watchUrl:"https://www.youtube.com/watch?v=Ya74LVYel1I"},
  knGreenBurger:{id:"FOX-KN-GREEN",title:"Kitchen Nightmares — Green Burgers",year:2013,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2617,videoId:"Lu2tAefNvC0",cleared:true,watchUrl:"https://www.youtube.com/watch?v=Lu2tAefNvC0"},
  knLettuce:{id:"FOX-KN-LETTUCE",title:"Kitchen Nightmares — The Infamous Grilled Lettuce",year:2011,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2472,videoId:"27is5tVlBHI",cleared:true,watchUrl:"https://www.youtube.com/watch?v=27is5tVlBHI"},
  knOctopus:{id:"FOX-KN-OCTOPUS",title:"Kitchen Nightmares — Octopus Tastes Like Hubba Bubba",year:2012,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2465,videoId:"Seop9juFYYA",cleared:true,watchUrl:"https://www.youtube.com/watch?v=Seop9juFYYA"},
  knLaughing:{id:"FOX-KN-LAUGH",title:"Kitchen Nightmares — Gordon Can't Stop Laughing",year:2010,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2441,videoId:"VPMxB7N2Znc",cleared:true,watchUrl:"https://www.youtube.com/watch?v=VPMxB7N2Znc"},
  knAmys:{id:"FOX-KN-AMYS",title:"Kitchen Nightmares — Amy's Baking Company",year:2013,era:"FOX Reality",collection:"Kitchen Nightmares · Full Episode",runtimeSeconds:2473,videoId:"FlYPkLRHeD4",cleared:true,watchUrl:"https://www.youtube.com/watch?v=FlYPkLRHeD4"},

  jumpPilot:{id:"FOX-21JS-PILOT",title:"21 Jump Street — Pilot, Part 1",year:1987,era:"FOX Launch Era",collection:"21 Jump Street · Full Episode",runtimeSeconds:2800,videoId:"v51HzZFP_Yc",cleared:true,watchUrl:"https://www.youtube.com/watch?v=v51HzZFP_Yc"},
  jumpLowAway:{id:"FOX-21JS-S1E11",title:"21 Jump Street — Low and Away",year:1987,era:"FOX Launch Era",collection:"21 Jump Street · Full Episode",runtimeSeconds:2836,videoId:"w9gDQsr-kTU",cleared:true,watchUrl:"https://www.youtube.com/watch?v=w9gDQsr-kTU"},
  jumpMarathon:{id:"FOX-21JS-SERIES",title:"21 Jump Street — Complete Series Marathon",year:1987,era:"FOX Launch Era",collection:"21 Jump Street · Licensed Shout! Studios marathon",runtimeSeconds:10800,videoId:"g-pYWkS-m-0",cleared:true,watchUrl:"https://www.youtube.com/watch?v=g-pYWkS-m-0",source:"Shout! Studios"}
};

window.FOX_INLINE_KEYS=Object.keys(window.FOX_PROGRAMS);
const HELL=["hkVegas","hkBreakfast","hkWedding"];
const KITCHEN=["knSandwich","knHarryPotter","knGreenBurger","knLettuce","knOctopus","knLaughing","knAmys"];
const JUMP=["jumpPilot","jumpLowAway"];
window.FOX_DAY_TEMPLATE=[];
const foxSlot=(minute,duration,choices)=>window.FOX_DAY_TEMPLATE.push({minute,duration,choices});

// Curated clock: Kitchen Nightmares is capped at TWO hours in a 24-hour day.
// Classic FOX blocks and Hell's Kitchen are deliberately separated so the guide
// does not show the same franchise hour after hour.
foxSlot(0,180,["jumpMarathon"]); // midnight–3 AM classic FOX marathon
foxSlot(180,60,JUMP);            // 3 AM
foxSlot(240,60,HELL);            // 4 AM
foxSlot(300,60,JUMP);            // 5 AM
foxSlot(360,60,HELL);            // 6 AM
foxSlot(420,60,JUMP);            // 7 AM
foxSlot(480,60,HELL);            // 8 AM
foxSlot(540,60,JUMP);            // 9 AM
foxSlot(600,60,KITCHEN);         // 10 AM — Kitchen Nightmares slot 1 of 2
foxSlot(660,60,JUMP);            // 11 AM
foxSlot(720,180,["jumpMarathon"]); // noon–3 PM classic FOX marathon
foxSlot(900,60,HELL);            // 3 PM
foxSlot(960,60,JUMP);            // 4 PM
foxSlot(1020,60,HELL);           // 5 PM
foxSlot(1080,60,JUMP);           // 6 PM
foxSlot(1140,60,HELL);           // 7 PM
foxSlot(1200,60,JUMP);           // 8 PM
foxSlot(1260,60,KITCHEN);        // 9 PM — Kitchen Nightmares slot 2 of 2
foxSlot(1320,60,JUMP);           // 10 PM
foxSlot(1380,60,HELL);           // 11 PM

window.INFINITY_CHANNEL={
  id:"FOX",
  era:"1987 to now",
  reset:"12:00 AM viewer local time",
  feature:"Verified complete FOX programs only",
  playbackPolicy:"No promos, clips, highlight reels, R-rated movies or age-restricted sources",
  rotationPolicy:"Kitchen Nightmares is capped at two scheduled hours per day and may never run in consecutive slots. Classic FOX programming must remain a major part of the daily clock. Expand Simpsons, Herman's Head, Get a Life, Married... with Children and other FOX-era shows only when a genuine embeddable full-program source is verified."
};
