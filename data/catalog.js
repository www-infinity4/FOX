// FOX full-episode catalog.
// Only long-form complete episodes are eligible for airtime. Promos, first looks,
// highlight reels, best-moment compilations and age-restricted movies are excluded.
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
  jumpLowAway:{id:"FOX-21JS-S1E11",title:"21 Jump Street — Low and Away",year:1987,era:"FOX Launch Era",collection:"21 Jump Street · Full Episode",runtimeSeconds:2836,videoId:"w9gDQsr-kTU",cleared:true,watchUrl:"https://www.youtube.com/watch?v=w9gDQsr-kTU"}
};
window.FOX_INLINE_KEYS=Object.keys(window.FOX_PROGRAMS);
const reality=["hkVegas","hkBreakfast","hkWedding","knSandwich","knHarryPotter","knGreenBurger","knLettuce","knOctopus","knLaughing","knAmys"];
const classics=["jumpPilot","jumpLowAway"];
window.FOX_DAY_TEMPLATE=[];
for(let minute=0,index=0;minute<1440;index++){
  const choices=index%4===0?classics:reality;
  window.FOX_DAY_TEMPLATE.push({minute:minute,duration:60,choices:choices});
  minute+=60;
}
window.INFINITY_CHANNEL={id:"FOX",era:"1987 to now",reset:"12:00 AM viewer local time",feature:"Verified complete FOX episodes only",playbackPolicy:"No promos, clips, highlight reels, R-rated movies or age-restricted sources"};
