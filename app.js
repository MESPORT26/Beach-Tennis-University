/* Court geometry in metres: x 0..16 (net at 8, your side 0..8), y 0..8 (your left side at the top). */
var NS="http://www.w3.org/2000/svg";
function X(m){return 60+m*40}
function Y(m){return 40+m*40}
function el(tag,a,p){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var C={you:"#0077B6",opp:"#FF4D6D",oppDark:"#E2365A",line:"#007A74",net:"#0D1B2A",ball:"#FFD23F",sandText:"#8A6A2A"};

/* Ball flight: duration in ms and height (m) along the path, k from 0 to 1 */
var S=Math.sin,PI=Math.PI;
var PROF={
  serve:{d:1700,h:function(k){return 2.8*(1-k)+1.8*S(PI*Math.pow(k,0.7))}},
  dig:{d:1150,h:function(k){return 0.5*(1-k)+2.4*S(PI*k)}},
  neutral:{d:1200,h:function(k){return 3.5*S(PI*k)}},
  push:{d:650,h:function(k){return 1.4*(1-k)+0.3*S(PI*k)}},
  drop:{d:1050,h:function(k){return 1.0*(1-k)+1.4*S(PI*k)}},
  lob:{d:1450,h:function(k){return 5*S(PI*k)}},
  highlob:{d:2100,h:function(k){return 8.5*S(PI*k)}},
  flatsmash:{d:520,h:function(k){return 3*(1-k)}},
  brush:{d:620,h:function(k){return 3*(1-k)+0.5*S(PI*k)}},
  recoverysmash:{d:850,h:function(k){return 2.9*(1-k)+1.6*S(PI*k)}},
  hook:{d:800,h:function(k){return 2.7*(1-k)+1.0*S(PI*k)}},
  bhsmash:{d:650,h:function(k){return 2.8*(1-k)}},
  rainbow:{d:1300,h:function(k){return 0.6*(1-k)+4.2*S(PI*k)}}
};
PROF.fakelob=PROF.drop; PROF.fakedrop=PROF.lob;
/* Incoming balls: end height is the height at which you hit it */
PROF.inPush={d:750,h:function(k){return 1.2*(1-k)+0.5*k+0.3*S(PI*k)}};
PROF.inLow={d:900,h:function(k){return 1.2*(1-k)+0.4*k+0.6*S(PI*k)}};
PROF.inMid={d:1000,h:function(k){return 0.8*(1-k)+1.4*k+0.8*S(PI*k)}};
PROF.inPop={d:1300,h:function(k){return 0.6*(1-k)+2.8*k+2.0*S(PI*k)}};
PROF.inLob={d:1700,h:function(k){return 1.0*(1-k)+2.8*k+4.5*S(PI*k)}};
PROF.inDrop={d:1200,h:function(k){return 1.0*(1-k)+0.4*k+1.2*S(PI*k)}};
PROF.inFloat={d:1400,h:function(k){return 0.8*(1-k)+0.9*k+2.5*S(PI*k)}};

var NET={A:[9.8,2.7],B:[9.8,5.4]}, DEEP={A:[12.6,2.7],B:[12.6,5.4]};

/* ---------------- Shot library ---------------- */
var SHOTS={
serve:{name:"Serve",cat:"Start",hitter:"R",
  start:{L:[1.7,2.6],R:[-0.9,6.3],A:[11.6,2.6],B:[11.6,5.6]}, startAlt:{open:{L:[4.4,2.6]}},
  to:[11.6,5.7],mark:true, react:{L:[2.8,2.6],R:[1.6,5.7]}, reactAlt:{open:{L:[5.2,2.6]}},
  after:{L:[4.4,2.7],R:[4.2,5.3],A:[10,2.7],B:[10,5.4]},
  what:"Overhead from behind the baseline. There is no second serve, so pick a target you can hit every time.",
  when:"Every point you serve. Agree the zone (1–5) with a finger signal first.",
  aim:"Zone 3 down the middle is the most common. Zone 2 at the receiver's body or backhand hip is also safe. Mix in 1, 4 and 5 (signal 5 first) so they can't settle.",
  avoid:"Going for aces with no margin, as a fault loses the point. Serving to 5 without telling your partner.",
  hitDo:"Signal the zone, serve it with spin and dip, then follow it in.",
  partnerDo:"Start moving forward the moment the serve is struck.",
  afterH:"Settle at 4–5 m on your side and split step as they return.",
  afterP:"Settle at 4–5 m, level with your partner, about 3 m apart."},
dig:{name:"Block",cat:"Defence",hitter:"R",
  start:{L:[3.8,2.6],R:[3.8,5.5],A:NET.A,B:NET.B},
  to:[14.2,6.3],mark:true, react:{A:[11.0,3.0],B:[12.6,5.9]}, after:{L:[4.5,2.7],R:[4.5,5.3]},
  what:"A short, firm swing with a stable racket face. You block a hard ball back rather than swing at it. It appeared in almost every pro rally.",
  when:"An opponent pushes or smashes hard at your feet or body.",
  aim:"Long over them, deep. Or straight down the line at medium height. Either way they don't get an easy smash.",
  avoid:"Blocking short. They're waiting at the net, so leave that to very advanced players. Popping it up mid-court. Trying to lob a hard smash, which is very difficult.",
  hitDo:"Firm wrist, short swing. Send it long over them, or straight at medium height.",
  partnerDo:"Shade towards the middle, racket up, ready for the next ball.",
  afterH:"If your block goes deep and they turn, step in a pace together. If it sits up, hold and get ready.",
  afterP:"Get level just behind your 3 m line. Step in with your partner only when they're turning back."},
neutral:{name:"Neutral ball",cat:"Defence",hitter:"R",
  start:{L:[3.6,2.6],R:[3.6,5.4],A:[11.6,2.7],B:[11.6,5.4]},
  to:[14.2,6.6],mark:true, react:{A:[12.0,3.2],B:[13.4,6.2]}, after:{L:[4.5,2.7],R:[4.5,5.3]},
  what:"A gentle, floating ball with height and depth. It buys time and resets the rally.",
  when:"You're under pressure, off balance, or hitting from below net height.",
  aim:"Deep, to a backhand. Against two right-handers that's the outside of B (their left-side player) or the middle side of A.",
  avoid:"Playing it when the ball is high near the net and you could attack.",
  hitDo:"Lift it deep onto a backhand, high enough that they can't attack it.",
  partnerDo:"Get back level with your partner.",
  afterH:"Recover to just behind your 3 m line and split step.",
  afterP:"Get level with your partner just behind the 3 m line, middle covered."},
highlob:{name:"High recovery lob",cat:"Defence",hitter:"L",
  start:{L:[7.4,1.4],R:[3.4,5.9],A:[9.8,3.0],B:[9.8,5.3]},
  to:[14.9,4.0], react:{A:[13.0,3.0],B:[13.0,5.0]}, after:{L:[4.4,2.7],R:[4.4,5.3]},
  what:"A very high, deep, slow lob that buys you three or four seconds.",
  when:"Your partner has fallen, you've just retrieved a drop shot, or you're badly out of position.",
  aim:"Very deep, into the middle. A short one gets smashed.",
  avoid:"Using it when you could play a normal neutral ball, or off a hard smash (block that instead).",
  hitDo:"As high as you can, and deep.",
  partnerDo:"Use the time to get back into position.",
  afterH:"Recover to 4–5 m while it's in the air.",
  afterP:"Get level with your partner before it comes down."},
push:{name:"Push",cat:"Attack",hitter:"R",
  start:{L:[4.6,2.8],R:[4.7,5.3],A:[12.4,2.6],B:[12.5,5.4]},
  to:[12.6,5.6],mark:true, react:{A:[12.4,3.2],B:[12.7,5.6]}, after:{L:[5.4,3.0],R:[5.4,5.0]},
  what:"A flatter, faster ball hit forward and slightly down from net height.",
  when:"The ball reaches you at or above net height, 2–4 m from the net.",
  aim:"At a backhand, at the body (feet or hip), or down the middle.",
  avoid:"Pushing a ball from below net height. It goes up and gets smashed.",
  hitDo:"Hit down at the body or backhand of the player in front of you, or down the middle.",
  partnerDo:"Hold the middle, racket up.",
  afterH:"If they have to block from low, step in a pace together to 2.5–3 m. If they're balanced, hold.",
  afterP:"Step in with your partner, level, 2–3 m apart."},
flatsmash:{name:"Smash",cat:"Attack",hitter:"L",
  start:{L:[4.8,2.9],R:[4.8,5.2],A:DEEP.A,B:DEEP.B},
  to:[12.2,4.1],mark:true, react:{A:[12.3,3.5],B:[12.3,4.7]}, after:{L:[5.5,3.0],R:[5.5,5.0]},
  what:"An overhead hit down. Set it up in six steps.",
  tech:["Turn side on","Point your free hand at the ball","Take the racket back over your shoulder","Get under the ball, as if it would land on your head","Swing a little earlier than feels natural","High ball or more than 4 m from the net, add more brush. Inside about 3 m, hit it flatter"],
  techAfter:"Aim down the middle and hit down, or go at an opponent's body or backhand.",
  when:"The ball is above your head. Within about 5 m of the net you can attack it. Further back, smash deep and safe.",
  aim:"Down the middle between them, at their feet, or at a body. From deep, aim deep into the middle.",
  avoid:"Going for a winner from the back of the court, or smashing while off balance.",
  hitDo:"Side on, point, racket back, get under it, swing early. Hit down into the middle or at a body or backhand.",
  partnerDo:"Hold your side and the middle.",
  afterH:"If the reply is weak, step in together to about 2.5 m. If it's a lob, recover.",
  afterP:"Step in level with your partner and split step as they hit."},
brush:{name:"Brush smash",cat:"Attack",hitter:"R",
  start:{L:[5.8,2.8],R:[5.8,5.4],A:[12.5,2.6],B:[12.5,5.4]},
  to:[12.6,0.6],mark:true, react:{A:[12.6,1.1],B:[12.3,4.2]}, after:{L:[6.3,3.4],R:[6.3,5.4]},
  what:"A smash with brush and spin, so it dips and kicks away. More control and angle than a flat smash.",
  when:"The ball is slightly lower or behind you, or you want a wide angle.",
  aim:"Wide (zone 5) or short at the feet.",
  avoid:"Hitting it long and flat. The spin is what keeps it in.",
  hitDo:"Brush up the back of the ball and angle it wide.",
  partnerDo:"Shift towards the middle. The reply comes back through the middle.",
  afterH:"Recover to your side.",
  afterP:"Cover the middle while your partner recovers."},
rainbow:{name:"Backhand rainbow",cat:"Attack",hitter:"L",
  start:{L:[5.2,1.6],R:[5.4,5.2],A:[9.9,2.6],B:[9.9,5.5]},
  to:[14.2,2.2], react:{A:[13.3,2.4],B:[11.0,4.2]}, after:{L:[6.6,2.8],R:[6.6,5.1]},
  what:"An attacking backhand topspin shot, hit with the underside of the racket so the ball spins up over the opponent and dips.",
  when:"A lowish ball on your backhand side while the opponents are close to the net.",
  aim:"Over the net player, landing deep.",
  avoid:"Using it against a team standing deep.",
  hitDo:"Brush up and under the ball.",
  partnerDo:"Get ready to move in.",
  afterH:"If they turn and run, move in together.",
  afterP:"Move in level with your partner."},
recoverysmash:{name:"Recovery smash",cat:"Overheads under pressure",hitter:"L",
  start:{L:[0.8,1.4],R:[5.4,4.0],A:NET.A,B:NET.B},
  to:[13.6,4.0], react:{A:[11.4,2.8],B:[11.4,5.2]}, after:{L:[4.3,2.6],R:[4.4,5.4]},
  what:"An overhead from the back of the court after you've been lobbed.",
  when:"You get under a lob but you're deep.",
  aim:"Deep into the middle. Placement over power.",
  avoid:"Going for a winner from the back.",
  hitDo:"Deep and safe, then move forward.",
  partnerDo:"You took the middle when your partner chased. Hold it.",
  afterH:"Recover forward to 4–5 m.",
  afterP:"Slide back to your side as your partner recovers."},
hook:{name:"Hook shot",cat:"Overheads under pressure",hitter:"L",
  start:{L:[2.6,1.8],R:[4.6,5.2],A:[10,2.7],B:[10,5.4]},
  to:[13.4,3.8], react:{A:[11,2.8],B:[11,5.2]}, after:{L:[4.3,2.6],R:[4.5,5.3]},
  what:"A windmill-style overhead when the ball has got behind your head. Hit it hard if you're balanced, or as a neutral ball if not.",
  when:"The ball is behind you and there's no time to turn and get under it.",
  aim:"Hard down the middle if balanced, deep and neutral if not.",
  avoid:"Forcing it hard while falling backwards.",
  hitDo:"Full windmill, contact above and behind you.",
  partnerDo:"Cover the middle.",
  afterH:"Recover forward.",
  afterP:"Back to your side, level."},
bhsmash:{name:"Backhand smash",cat:"Overheads under pressure",hitter:"L",
  start:{L:[5.2,1.1],R:[5.4,5.0],A:[12.4,2.7],B:[12.4,5.4]},
  to:[12.6,1.4], react:{A:[12.6,1.7]}, after:{L:[5.6,2.6],R:[5.6,5.0]},
  what:"An overhead on your backhand side.",
  when:"A high ball on your backhand and no time to run around it.",
  aim:"Straight down the line, or the middle. Keep it simple.",
  avoid:"Big angles. The backhand overhead has less power.",
  hitDo:"Short, firm swing, straight.",
  partnerDo:"Shift towards the middle.",
  afterH:"Recover back towards the middle of your side.",
  afterP:"Level up again as your partner recovers."},
drop:{name:"Drop shot",cat:"Touch and lobs",hitter:"R",
  start:{L:[4.2,2.6],R:[4.2,5.5],A:[13.6,2.7],B:[13.5,5.4]},
  to:[9.3,5.4],mark:true, react:{A:[12.6,3.4],B:[11.2,5.3]}, after:{L:[4.8,2.8],R:[4.8,5.3]},
  what:"A soft ball that lands inside the opponents' 3 m line.",
  when:"The player you drop to is mid-court or deep (often after your lob), off balance, or tired. Never drop to a player at their 3 m line or closer, but you can drop to their partner if the partner is back.",
  aim:"Straight and short, towards the deeper player.",
  avoid:"Dropping to a player at their 3 m line or closer. They get to it early and put it away. A cross-court drop opens the line on your partner.",
  hitDo:"Soft hands, land it close to the net.",
  partnerDo:"Hold your lane and step in a little. Watch for the lift.",
  afterH:"Follow in one step, to just behind your 3 m line, and split step.",
  afterP:"Stay level a step in. The lift usually comes straight or high cross-court. Smash it."},
lob:{name:"Lob",cat:"Touch and lobs",hitter:"L",
  start:{L:[3.4,2.6],R:[3.4,5.4],A:NET.A,B:NET.B},
  to:[14.8,7.0], react:{A:[11.0,4.0],B:[14.0,6.4]}, after:{L:[4.6,2.8],R:[4.6,5.2]},
  what:"A high ball over the net player, aimed over their left shoulder (the backhand side of a right-hander).",
  when:"Opponents are close to the net, or you need time.",
  aim:"Deep, over the left shoulder of the net player.",
  avoid:"Short or flat lobs. They become easy smashes. Lobbing straight off a hard smash is very difficult, so block that instead.",
  hitDo:"High and deep over their backhand shoulder.",
  partnerDo:"Watch them turn and get ready to move in.",
  afterH:"If they're running back, move in together to 3–4 m.",
  afterP:"Move in level with your partner while they chase."},
fakelob:{name:"Fake lob, real drop",cat:"Disguise",hitter:"L",
  start:{L:[5.0,2.7],R:[5.0,5.3],A:[12.8,2.8],B:[12.8,5.3]},
  to:[9.3,2.4],mark:true, react:{A:[10.3,2.5],B:[13.0,5.2]}, after:{L:[5.7,2.9],R:[5.6,5.0]},
  what:"Shape up exactly as if to lob, then play a drop shot.",
  when:"Opponents expect a lob (you've lobbed them already) and the player you drop to is drifting back behind their 3 m line.",
  aim:"Short and straight.",
  avoid:"Overusing it. It works because your lob is a real threat.",
  hitDo:"Same backswing as your lob, soften at the last moment.",
  partnerDo:"Hold your lane.",
  afterH:"Follow in one step and split step.",
  afterP:"Step in level, ready for the lift."},
fakedrop:{name:"Fake drop, real lob",cat:"Disguise",hitter:"R",
  start:{L:[5.2,2.7],R:[5.2,5.3],A:[10.2,2.7],B:[10.2,5.4]},
  to:[14.8,6.9], react:{A:[11.0,4.0],B:[13.8,6.4]}, after:{L:[6.6,2.9],R:[6.6,5.1]},
  what:"Show a drop shot, then lift your wrist at the last moment to lob.",
  when:"Opponents are creeping forward expecting a drop.",
  aim:"Deep over the left shoulder.",
  avoid:"Short lifts. If it isn't deep, it gets smashed.",
  hitDo:"Soft drop shape, then a late wrist lift.",
  partnerDo:"Watch them turn.",
  afterH:"Move in together to 3–4 m.",
  afterP:"Move in level with your partner."}
};
var CATCOL={"Start":"var(--sun)","Defence":"var(--turq)","Attack":"var(--coral)","Overheads under pressure":"var(--mango)","Touch and lobs":"var(--palm)","Disguise":"var(--sun)","Basics":"var(--turq)","Tactics":"var(--coral)"};
var ILLUS={signal:'<img src="signal.jpg" alt="A hand showing two fingers next to a beach tennis racket" width="560" height="609">'};
function fillTips(tp){var w=tp.wind||(state.id==="serve"?WIND:null);
  ["when","aim","avoid","wind"].forEach(function(k){["c-","m-"].forEach(function(pf){var ul=$(pf+k);ul.innerHTML="";((k==="wind"?w:tp[k])||[]).forEach(function(t){var li=document.createElement("li");li.textContent=t;ul.appendChild(li)})})});
  ["c","m"].forEach(function(pf){$(pf+"-windc").hidden=!w;$(pf==="c"?"cards":"cards-m").classList.toggle("four",!!w)})}
var WIND=["Into the wind, hit it harder and flatter","Downwind, add more spin so it dips in","In a crosswind, use side spin so it curves back into the court"];
var ZTIPS={
 1:{when:["When the receiver leaves the line open by standing towards the middle","When a crosswind is blowing into the court from that sideline","To mix it up and catch them off guard"],
  aim:["Low and close to the sideline","More spin so it dips and stays in"],
  avoid:["Forgetting to cover your own line, because the straight return comes back down it","Zone 1 when a crosswind is blowing towards that sideline, as it can carry the ball out"]},
 2:{when:["Your safe, everyday serve","When the receiver struggles with balls at the body"],
  aim:["At the body or backhand hip","Topspin and dip so it arrives low"],
  avoid:["Floating it high, because they can attack it"]},
 3:{when:["Most serves, as it's the most common choice","When the receivers aren't sure who takes the middle"],
  aim:["The seam between the two receivers","Topspin and dip so it lands low and gives them no angle"],
  avoid:["Drifting onto a receiver's forehand, which gives them a clean swing"]},
 4:{when:["To change the target and keep them guessing","At a receiver with a weaker backhand or body"],
  aim:["Cross-court at the body","Flatter and a little quicker, as it has more court to travel"],
  avoid:["Going too wide, which turns it into a 5 without the signal"]},
 5:{when:["When the receiver leaves the wide side open","When a crosswind is blowing into the court from that sideline","To mix it up and catch them off guard","Only after you've signalled 5 to your partner"],
  aim:["Wide cross-court, flatter and quicker","Make the receiver stretch"],
  avoid:["Serving it without the signal, because the return comes straight down your partner's line","Floating it, because a slow wide serve gives them time to drive the line","Zone 5 when a crosswind is blowing towards that sideline, as it can carry the ball out"]}};
var TIPS={
 serve:{when:["Every point you serve","After you agree the zone (1–5) with a finger signal"],
  aim:["Zone 3 down the middle is the most common","Zone 2 at the receiver's body or backhand hip","Mix in 1, 4 and 5 so they can't settle","Vary the speed, spin and dip so the receiver can't time their return","A serve that dips low makes them hit up, so your team gets the first attacking ball"],
  avoid:["Going for aces with no margin, as there's no second serve","Serving to the same zone too often, so the receiver gets used to it","Serving to 5 without telling your partner, because the wide serve opens a return straight down their line"]},
 push:{when:["The ball reaches you at or above net height","You're 2–4 m from the net"],
  aim:["At a backhand","At the body, feet or hip","Down the middle between them"],
  avoid:["Pushing a ball from below net height, because it goes up and gets smashed"]},
 flatsmash:{when:["The ball is above your head","Inside about 3 m, hit it flatter and harder","High ball, or more than 4 m from the net, add more brush"],
  aim:["Down the middle, hitting down","At an opponent's body or backhand","Deep into the middle when you're at the back"],
  avoid:["Going for a winner from the back of the court","Smashing while off balance"]},
 neutral:{when:["You're under pressure or off balance","You're hitting from below net height"],
  aim:["Deep, to a backhand","Against two right-handers, the outside of B or the middle side of A"],
  avoid:["Playing it when the ball is high near the net and you could attack"]},
 lob:{when:["The opponents are close to the net","You need time to recover"],
  aim:["Always deep","Over the left shoulder of the net player (a right-hander's backhand)"],
  avoid:["Short or flat lobs, because they get smashed","Lobbing straight off a hard smash, so block it instead"]},
 drop:{when:["The player you drop to is mid-court or deep","Often after your lob has pushed them back","They're off balance or tired"],
  aim:["Short, just over the net","Straight, in front of the deeper player"],
  avoid:["Dropping to a player at their 3 m line or closer","Cross-court drops, because they open the line on your partner"]},
 dig:{when:["An opponent pushes or smashes hard at your feet or body"],
  aim:["Long over them, deep","Or straight down the line at medium height","Either way, no easy smash for them"],
  avoid:["Blocking short, which is only for very advanced players","Popping it up mid-court","Trying to lob a hard smash"]}};
var PATTERNS=["guide","serving","pair","middle"];
var VISIBLE=["serve","push","flatsmash","neutral","lob","drop","dig"];
var ICON={
  serve:{c:"#FFD23F",f:"#0D1B2A",d:'<circle cx="7" cy="6" r="3"/><path d="M7 20V12M7 12l9-6M13 6h3v3"/>'},
  push:{c:"#FF4D6D",f:"#FFFFFF",d:'<path d="M3 12h16M14 7l5 5-5 5"/>'},
  flatsmash:{c:"#FF9F1C",f:"#FFFFFF",d:'<path d="M14 2L5 13h6l-2 9 10-12h-6z"/>'},
  neutral:{c:"#00C2B8",f:"#FFFFFF",d:'<path d="M3 18Q12 4 21 18"/><circle cx="21" cy="18" r="1.6"/>'},
  lob:{c:"#0077B6",f:"#FFFFFF",d:'<path d="M3 21Q12 -6 21 21"/><circle cx="21" cy="21" r="1.6"/>'},
  drop:{c:"#2ECC71",f:"#FFFFFF",d:'<path d="M3 15Q8 4 13 17"/><path d="M17 4v16" stroke-dasharray="2 2.5"/><circle cx="13" cy="18" r="1.6"/>'},
  dig:{c:"#0D1B2A",f:"#FFFFFF",d:'<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/>'}};
var BWHY={push:"If the ball drops below net height before you reach it, block it long instead.",flatsmash:"If you're off balance or too deep to attack, play a deep neutral ball instead.",
  neutral:"If they've both crept in close to the net, lob over them instead.",lob:"If they're already deep, play a deep neutral ball instead.",
  drop:"If the player you'd drop to steps in, lob over them instead.",dig:"If you have time and the ball sits up, play a deep neutral ball instead."};
var SIMPLE={brush:"flatsmash",bhsmash:"flatsmash",hook:"flatsmash",recoverysmash:"flatsmash",rainbow:"lob",highlob:"lob",fakelob:"drop",fakedrop:"lob"};
var BACK2={push:"dig",flatsmash:"neutral",neutral:"lob",lob:"neutral",drop:"lob",dig:"neutral",serve:"serve"};
function simple(id){return SIMPLE[id]||id}
var SHOT_GROUPS=[
  ["Start",["serve"]],
  ["Defence",["dig","neutral","highlob"]],
  ["Attack",["push","flatsmash","brush","rainbow"]],
  ["Overheads under pressure",["recoverysmash","hook","bhsmash"]],
  ["Touch and lobs",["drop","lob"]],
  ["Disguise",["fakelob","fakedrop"]]
];

/* ---------------- When to play ---------------- */
var SCENES={
guide:{name:"Court guide",cat:"Basics",zoneFollow:true,
  init:{L:[4.4,2.6],R:[4.4,5.4],A:DEEP.A,B:DEEP.B},
  steps:[
  {t:"The court",say:"16 m long, 8 m wide, net in the middle. No player may stand inside the dashed line 3 m from the net until the serve is hit. In men's pro events the server's partner must also start behind the 6 m line.",
   L:"You play the left side. With two right-handers, your forehand faces the middle, so the middle ball is usually yours.",
   R:"You play the right side. Your forehand is on the sideline and your backhand faces the middle."},
  {t:"Target zones",zones:true,say:"The receiving side splits into five lanes. Zone 1 is always the lane on the server's side of the court (down the line), 2 is the receiver on that side, 3 the middle, 4 the other receiver and 5 wide cross-court. So when the server moves sides, the numbers flip with them. Teams agree the zone with a finger signal before each serve.",
   L:"You serve from the left, so zone 1 is your sideline (the top here).",R:"You serve from the right, so zone 1 is your sideline (the bottom here)."},
  {t:"Reading the pictures",ball:{f:[4.4,5.4],to:[12.6,5.6],shot:"push"},pos:{R:[5.6,5.3],L:[5.6,2.9]},
   say:"Aqua is your team. You're Y, the bigger player with the glow, and your partner is P. Coral is the opponents. The ball grows as it rises and the dashed line is its path. Arrows show where each player moves next.",
   me:"Your job is always in this box. Switch between Left and Right at the top and Y moves with you.",mate:"Your partner's job is always in this box."}
  ]},
serving:{name:"Serve and the third ball",cat:"Basics",zoneSide:"R",
  init:{L:[1.7,2.6],R:[-0.9,6.3],A:[11.6,2.6],B:[11.6,5.6]}, initAlt:{open:{L:[4.4,2.6]}},
  steps:[
  {t:"Set up",zones:true,say:"Server behind the baseline. In men's pro events the partner waits behind the 6 m line until the serve is struck (in women's and social play, behind the 3 m line). The receivers start just behind their 3 m line.",
   L:"You're the partner. Stand left of centre behind the line, weight forward, ready to go on the serve.",
   R:"You're serving from behind the baseline on the right. Pick your target before the toss. Zone 3 down the middle, or zone 2 at the receiver's body."},
  {t:"The serve with spin and dip",ball:{f:[-0.9,6.3],to:[11.7,5.75],shot:"serve"},mark:true,pos:{R:[1.6,5.7],L:[2.8,2.7]},alt:{open:{L:[4.6,2.7]}},
   say:"Hit up and over the ball with topspin so it clears the net with margin, then dips. It should arrive low, around the receiver's hip, so they have to hit up.",
   L:"Watch the contact. Go the moment the ball is struck.",R:"Brush up and over the ball. Low at the body beats fast and flat."},
  {t:"Move in together",pos:{L:[3.9,2.8],R:[3.9,5.2]},alt:{open:{L:[4.6,2.8]}},
   say:"Keep moving in as the serve travels. Stop and split step as the receiver hits, around 4 m from the net, level and about 3 m apart.",
   L:"Move in on your side and land balanced as they hit. The middle is yours.",R:"Follow the serve in, then split step. Don't be running when they hit."}
  ],
  ask:"What does the returner do? Pick one",
  branches:[
  {label:"Hard at the server's feet",steps:[
   {t:"Hard return at the server's feet",ball:{f:[11.6,5.6],to:[4.0,5.4],shot:"push"},pos:{R:[3.9,5.3],L:[4.0,3.4],A:[10.0,2.8],B:[10.1,5.3]},
    say:"The most common return. Low and hard at the server's feet as they come in. The receivers follow it to the net.",
    R:"Stop, get low, racket head down.",L:"Shade towards the middle, racket up."},
   {t:"Block it long over them",ball:{f:[3.9,5.3],to:[14.2,6.2],shot:"dig"},mark:true,pos:{A:[11.2,3.0],B:[12.8,5.8]},
    say:"Don't swing and don't block it short. They're waiting at the net. Block it long over them, onto B's backhand, or straight at medium height so they don't get an easy smash.",
    R:"Firm block, long over them.",L:"Ready for their next ball."},
   {t:"Settle and wait for a high ball",pos:{L:[4.4,2.8],R:[4.4,5.2]},
    say:"They've had to turn and go back. Settle level at 4–5 m. Attack only when you get a ball above the net.",
    R:"Level with your partner on your side.",L:"Level with your partner, middle covered."}]},
  {label:"Drop shot to the server",steps:[
   {t:"Drop in front of the server",ball:{f:[11.6,5.6],to:[6.9,5.2],shot:"drop"},pos:{L:[4.4,3.8],A:[10.4,2.8],B:[10.6,5.2]},
    say:"The returner plays short in front of the server, and both receivers follow it in. The partner slides towards the middle and stays a step back, because the lob is the danger now.",
    R:"Read it early. It's yours.",L:"Slide to the middle, a step back."},
   {t:"Run in and lob deep over A",pre:{R:[6.9,5.2]},ball:{f:[6.9,5.2],to:[14.6,2.4],shot:"lob"},pos:{R:[4.6,5.1],L:[4.4,2.8],A:[13.9,2.5],B:[11.6,4.4]},
    say:"The server sprints in and lifts a lob deep over A, on the side away from B. Keep it on A's side, not the middle, so B is too far away to cut across and smash it. A has to turn and chase it back to the corner. If you get there early and the ball is above the net, push it at their feet instead.",
    R:"Sprint in, lob deep over A, away from B, then backpedal straight away to level.",L:"Slide back to your side as the lob goes up, level with your partner."},
   {t:"Their reply floats up",ball:{f:[13.9,2.5],to:[4.8,3.6],shot:"highlob"},pos:{L:[4.6,3.3],R:[4.8,5.0],A:[13.0,2.8],B:[11.8,4.6]},
    say:"Chasing back to the corner, A can usually only float it back high. You're level at 4–5 m and ready. Whoever has it on the forehand calls it and smashes.",
    R:"Hold your side, ready to cover.",L:"Middle ball on your forehand. Call it and smash."}]},
  {label:"Drop shot to the partner",steps:[
   {t:"Drop in front of the partner",ball:{f:[11.6,5.6],to:[6.9,2.7],shot:"drop"},pos:{R:[4.4,4.2],A:[10.6,2.8],B:[10.4,5.2]},
    say:"Short in front of the partner, and both receivers follow it in. Same rule, mirrored. The server slides to the middle, a step back.",
    R:"Slide to the middle, a step back for the lob.",L:"Read it early. It's yours."},
   {t:"Run in and lob deep over A",pre:{L:[6.9,2.7]},ball:{f:[6.9,2.7],to:[14.6,2.4],shot:"lob"},pos:{L:[4.6,2.9],R:[4.4,5.2],A:[13.9,2.5],B:[11.6,4.4]},
    say:"The partner sprints in from behind the 3 m line and lifts the lob deep over A, on the side away from B. Don't float it to the middle. That gives B time to come across and smash. A has to turn and chase it back to the corner. If you're early and the ball is above the net, push at their feet instead.",
    R:"Slide back to your side as the lob goes up.",L:"Sprint in, lob deep over A, away from B, then backpedal straight away to level."},
   {t:"Their reply floats up",ball:{f:[13.9,2.5],to:[4.8,3.6],shot:"highlob"},pos:{L:[4.6,3.3],R:[4.8,5.0],A:[13.0,2.8],B:[11.8,4.6]},
    say:"Chasing back to the corner, A can usually only float it back high. You're level at 4–5 m and ready. Whoever has it on the forehand calls it and smashes.",
    R:"Hold your side, ready to cover.",L:"Middle ball on your forehand. Call it and smash."}]},
  {label:"Down the partner's line",steps:[
   {t:"Return down the partner's line",ball:{f:[11.6,5.6],to:[3.6,0.8],shot:"push"},pos:{L:[3.8,1.0],R:[4.0,4.1],A:[10.0,2.7],B:[10.2,5.3]},
    say:"The returner aims down the line on the partner's side while they're still moving in. This is why the partner protects their line first.",
    R:"Slide to the middle as your partner goes wide.",L:"Line first. Don't drift to the middle until the return is struck. Get low and block."},
   {t:"Block it straight",ball:{f:[3.8,1.0],to:[14.0,1.3],shot:"dig"},mark:true,pos:{A:[11.4,1.9],B:[10.8,4.6]},
    say:"Block it straight back down the line at medium height, past A and deep. Don't try to block it short. That's for very advanced players and usually gets put away.",
    R:"Hold the middle, racket up.",L:"Firm block, straight, medium height."},
   {t:"Reset",pos:{L:[4.4,2.8],R:[4.4,5.2]},
    say:"Back to level at 4–5 m, ready for their next push.",
    R:"Back to your side.",L:"Back to your side."}]},
  {label:"Neutral ball",steps:[
   {t:"A floating return",ball:{f:[11.6,5.6],to:[4.3,3.8],shot:"neutral"},pos:{L:[4.2,3.6],R:[4.3,5.2],A:[10.0,2.8],B:[10.2,5.3]},
    say:"A floating return with no pace. This is your team's best chance to take over the point.",
    R:"Hold your side, racket up.",L:"It's coming to the middle on your forehand. Call it."},
   {t:"Hit down at them",ball:{f:[4.2,3.6],to:[10.0,4.1],shot:"flatsmash"},pos:{A:[10.0,3.5],B:[10.0,4.7]},
    say:"If it's above your head and within about 5 m, smash down into the middle or at their feet. If it's lower, push it at their feet.",
    R:"Watch the reply.",L:"Hit down into the middle."},
   {t:"Step in together",pos:{L:[5.4,3.0],R:[5.4,5.0]},
    say:"Your attack made them block from low, so step in a pace together and split step as they hit.",
    R:"Step in, level.",L:"Step in, level."}]},
  {label:"Lob",steps:[
   {t:"Lob over the partner",ball:{f:[11.6,5.6],to:[1.4,1.6],shot:"lob"},pos:{R:[4.4,4.1],A:[10.0,2.8],B:[10.2,5.2]},
    say:"The returner lobs over the partner's left shoulder while you're both moving in. The receivers follow it to the net.",
    R:"Don't follow. Step into the middle and slightly forward.",L:"Turn and chase. Call 'mine' early."},
   {t:"Chase it, recovery smash deep",pre:{L:[1.4,1.6]},ball:{f:[1.4,1.6],to:[13.6,4.0],shot:"recoverysmash"},pos:{L:[4.0,2.8],R:[4.4,5.2],A:[11.4,2.9],B:[11.4,5.1]},
    say:"If you're under it and balanced, play a recovery smash deep into the middle. If not, play a high recovery lob instead.",
    R:"Slide back to your side as the smash goes.",L:"Deep and safe into the middle, then run forward to level straight away."},
   {t:"Step in as they defend",pos:{L:[5.0,2.9],R:[5.0,5.1]},
    say:"Your deep smash makes them defend from the back, so you are level again at 4–5 m. Step in a pace together and split step as they hit.",
    R:"Step in, level.",L:"Step in, level."}]}
  ]},
receiving:{name:"Receiving and taking the net",cat:"Basics",
  init:{L:[4.4,2.6],R:[4.4,5.5],A:[16.9,1.8],B:[14.7,5.4]}, initAlt:{open:{B:[11.6,5.4]}},
  steps:[
  {t:"Starting positions",say:"Both of you stand just behind your 3 m line, level. The serving team starts further back, so you have the head start to the net.",
   L:"Behind the 3 m line, weight forward. If the serve comes to you, you return it.",R:"Same on your side. Whoever doesn't return moves in with the returner."},
  {t:"The serve",ball:{f:[16.9,1.8],to:[4.8,2.5],shot:"serve"},pos:{A:[15.2,2.0],B:[13.0,5.3]},alt:{open:{B:[10.8,5.3]}},
   say:"The serve comes to the left-side player. The server and their partner start moving in.",
   L:"Get your racket to the ball early.",R:"Start moving forward as the serve is struck."},
  {t:"Return low at the server's feet",ball:{f:[4.8,2.5],to:[13.6,2.3],shot:"push"},pos:{L:[6.6,2.8],R:[6.7,5.2],A:[13.6,2.3],B:[11.8,5.2]},
   say:"Return low at the feet of the server as they come in, then both move forward together.",
   L:"Low return at the server's feet, then step in.",R:"Move in level with your partner as the return is hit."},
  {t:"Their block pops up",ball:{f:[13.6,2.3],to:[7.0,3.8],shot:"dig"},pos:{L:[7.0,2.9],R:[7.0,5.1],A:[12.8,2.6],B:[11.6,5.0]},
   say:"The server has to block your low return up. You're at the net and they're still deep.",
   L:"It's coming to the middle on your forehand. Yours.",R:"Hold your side, racket up."},
  {t:"Push it down the middle",ball:{f:[7.0,3.8],to:[12.2,4.0],shot:"push",land:true},pos:{A:[12.5,3.2],B:[11.8,4.6]},
   say:"Push down into the middle between them. Point won.",
   L:"Push down the middle.",R:"Watch the reply in case it comes back."}
  ]},
pair:{name:"Moving as a pair",cat:"Basics",
  init:{L:[4.5,2.6],R:[4.5,5.4],A:NET.A,B:NET.B},
  steps:[
  {t:"Ball goes wide left",ball:{f:[9.8,2.7],to:[4.6,0.7],shot:"push"},pos:{L:[4.6,1.0],R:[4.6,3.8]},
   say:"The hitter goes out to the ball. The partner slides to the middle, not straight across. Keep 2–3 m between you.",
   L:"Go out to the ball.",R:"Slide to the middle. Their best reply is through the gap you just covered."},
  {t:"Block it straight",ball:{f:[4.6,0.9],to:[14.0,1.3],shot:"dig"},pos:{A:[11.2,2.4]},
   say:"Block it straight down the line at medium height, or long over them. Not short.",L:"Firm block, straight.",R:"Hold the middle."},
  {t:"Ball goes wide right",ball:{f:[9.8,5.4],to:[4.6,7.4],shot:"push"},pos:{R:[4.7,7.0],L:[4.7,4.2]},
   say:"Now the other way. Same rule. Hitter out, partner to the middle.",L:"Slide to the middle.",R:"Go out to the ball."},
  {t:"Reset",ball:{f:[4.7,7.1],to:[14.0,6.8],shot:"dig"},pos:{L:[4.5,2.7],R:[4.5,5.3],B:[11.4,5.8]},
   say:"Once the ball is back over, both return to level and centred on your own halves.",L:"Back to your side.",R:"Back to your side."}
  ],
  note:"Seen in almost every rally of the pro matches. The player away from the ball moves to the middle, and the pair keeps roughly 3 m between them."},
middle:{name:"Calling the middle ball",cat:"Basics",
  init:{L:[4.5,2.6],R:[4.5,5.4],A:NET.A,B:NET.B},
  steps:[
  {t:"The wrong way",ball:{f:[9.8,2.7],to:[4.6,4.0],shot:"push",land:true},pos:{L:[4.5,3.5],R:[4.5,4.5]},
   say:"A push down the middle. Both go for it. Rackets clash, or both leave it. When this happened in the pro matches the defending team lost 3 points out of 4.",
   L:"Two players on one ball means nobody covers the sides.",R:"Two players on one ball means nobody covers the sides."},
  {t:"Reset and decide",pos:{L:[4.5,2.6],R:[4.5,5.4]},
   say:"Agree before the point who takes the middle. For two right-handers, the left-side player usually takes it, because their forehand faces the middle.",
   L:"The middle is yours. Call 'mine' early.",R:"The middle belongs to your partner. Call 'yours' and hold your lane."},
  {t:"The right way",ball:{f:[9.8,2.7],to:[4.6,4.0],shot:"push"},pos:{L:[4.6,3.7],R:[4.6,5.3]},
   say:"The left-side player steps across onto the forehand. The right-side player holds their lane.",
   L:"Step across, forehand, call it.",R:"Hold your lane in case it's a fake."},
  {t:"Block it deep",ball:{f:[4.6,3.8],to:[14.2,3.7],shot:"dig"},pos:{L:[4.5,3.1],A:[11.6,3.2],B:[11.0,5.0]},
   say:"Block it long over them, onto A's backhand, then both reset.",L:"Long block over them, then back towards your side.",R:"Hold, then level up."}
  ],
  note:"If one of you is left-handed, the middle may belong to the other player. Agree it before the match."},
pushdig:{name:"Push vs block",cat:"Tactics",
  init:{L:[6.5,2.8],R:[6.6,5.2],A:[12.5,2.7],B:[12.6,5.4]},
  steps:[
  {t:"Push at the feet",ball:{f:[6.6,5.2],to:[12.6,5.6],shot:"push"},mark:true,pos:{A:[12.4,3.2],B:[12.7,5.6]},
   say:"You're near the net and they're deep. Push down at the body or backhand of the player in front of you, or down the middle.",
   L:"Hold the middle, racket up.",R:"Push at the feet, hip or backhand of the player in front of you."},
  {t:"Their block comes up",ball:{f:[12.7,5.6],to:[7.1,4.0],shot:"dig"},pos:{L:[7.2,3.0],R:[7.2,5.0]},
   say:"They had to block from low and the ball is coming up above the net. Step in together a pace, level.",
   L:"Step in with your partner. It's coming to the middle. Yours.",R:"Step in level and cover your side."},
  {t:"Smash the pop-up",ball:{f:[7.2,3.4],to:[12.3,4.2],shot:"flatsmash",land:true},pos:{A:[12.3,3.6],B:[12.3,4.7]},
   say:"Hit down into the middle. Both defenders lunge for the same ball.",
   L:"Smash down the middle.",R:"Hold your side in case it comes back."}
  ],
  note:"In the pro matches more points ended with a push or volley beating a block than any other way. The core contest is the net team pushing and the deep team blocking."},
defend:{name:"Defending from deep",cat:"Tactics",
  init:{L:[4.4,2.7],R:[4.4,5.3],A:NET.A,B:NET.B},
  steps:[
  {t:"They push at your feet",ball:{f:[9.8,2.7],to:[4.5,5.5],shot:"push"},pos:{R:[4.4,5.5],L:[4.4,3.0]},
   say:"They're at the net and you're at 4–5 m. Get low early.",
   L:"Shade towards the middle. If it comes there, it's yours.",R:"Racket head down, knees bent."},
  {t:"Block it long over them",ball:{f:[4.4,5.5],to:[14.2,6.3],shot:"dig"},mark:true,pos:{A:[11.6,3.0],B:[12.9,5.9]},
   say:"Don't block it short and don't try to lob a hard ball. Block it long over them onto B's backhand (or straight at medium height) so there's no easy smash.",
   L:"Hold the middle.",R:"Firm, short swing, long over them."},
  {t:"Their reply comes up",ball:{f:[12.9,5.9],to:[5.5,3.4],shot:"neutral"},pos:{L:[5.4,3.1],R:[5.4,5.0],B:[12.4,5.4]},
   say:"Turning back on the backhand, they can only float it back. Step in together.",
   L:"It's coming to the middle on your forehand. Take it.",R:"Step in level."},
  {t:"Attack",ball:{f:[5.5,3.4],to:[12.0,4.3],shot:"flatsmash",land:true},
   say:"Hit down at their feet. Your defence just became attack.",L:"Hit down at their feet.",R:"Hold your side."}
  ],
  note:"Deep defenders held their own when they slid as a pair and kept their blocks out of smash range. When they lost, it was usually because both went for the same ball."},
lobcover:{name:"Covering the lob",cat:"Tactics",
  init:{L:[6.8,2.8],R:[6.8,5.2],A:[12.4,2.7],B:[12.4,5.4]},
  steps:[
  {t:"Lob over your left shoulder",ball:{f:[12.4,2.7],to:[1.4,1.3],shot:"lob"},pos:{L:[2.2,1.6],R:[6.2,4.0],A:[10.8,2.8],B:[10.8,5.2]},
   say:"You pressed in, and they lob over the left shoulder of the left-side player. The opponents move in behind it.",
   L:"Turn and chase. Call 'mine' or 'switch' early.",R:"Don't follow. Step into the middle, slightly forward, to cover their likely reply."},
  {t:"Recovery smash, deep",ball:{f:[1.5,1.4],to:[13.4,4.0],shot:"recoverysmash"},pos:{A:[11.6,3.0],B:[11.6,5.0]},
   say:"Under it but deep. Play a recovery smash deep into the middle. Placement, not power.",
   L:"Deep into the middle, then move forward.",R:"Hold the middle."},
  {t:"Reset",pos:{L:[4.4,2.7],R:[4.4,5.3]},
   say:"The hitter recovers forward, the partner slides back to their side, and you're level at 4–5 m again. If you can't get balanced under the lob, play a high recovery lob instead.",
   L:"Recover forward to your side.",R:"Slide back to your side."}
  ],
  note:"In about a third of the logged men's rallies, one player chased a lob while the partner took the middle."},
droppattern:{name:"Drop shot when they're deep",cat:"Tactics",
  init:{L:[4.6,2.7],R:[4.8,5.4],A:[13.6,2.7],B:[13.6,5.4]},
  steps:[
  {t:"They're deep",say:"Your lob has pushed them back to the baseline. The space in front of them is open.",
   L:"Look for a ball you can play softly.",R:"Look for a ball you can play softly."},
  {t:"Straight drop",ball:{f:[4.8,5.4],to:[9.3,5.4],shot:"drop"},mark:true,pos:{B:[10.2,5.3],A:[12.4,3.6],R:[5.4,5.2],L:[5.0,2.9]},
   say:"Play it straight and short to the deeper player, then follow in one step, not all the way.",
   L:"Step in a little and hold your lane. Watch their racket face.",R:"Soft hands, close to the net, then one step in."},
  {t:"They lift it",ball:{f:[10.2,5.3],to:[5.8,4.8],shot:"dig"},pos:{L:[5.6,3.0],R:[5.6,5.0]},
   say:"Running forward in sand, they can only lift it.",L:"Split step.",R:"Split step. It's coming to you."},
  {t:"Smash into the space",ball:{f:[5.7,4.9],to:[13.6,6.0],shot:"flatsmash",land:true},
   say:"Smash into the space behind the player who ran forward.",L:"Hold your side.",R:"Into the space behind them."}
  ],
  note:"Avoid the cross-court drop. The reply down the line goes straight at your partner's open side."},
fake:{name:"Fake lob, real drop",cat:"Tactics",
  init:{L:[5.0,2.7],R:[5.0,5.3],A:[11.6,2.7],B:[11.6,5.4]},
  steps:[
  {t:"Shape up for the lob",pos:{A:[12.8,2.8],B:[12.8,5.3]},
   say:"Same backswing as your lob. They read lob and drift back.",L:"Open the racket as if lobbing.",R:"Hold your lane."},
  {t:"Real drop",ball:{f:[5.0,2.7],to:[9.3,2.4],shot:"fakelob"},mark:true,pos:{A:[10.1,2.5],L:[5.7,2.9],R:[5.6,5.0]},
   say:"Soften at the last moment. A drop straight in front of you.",L:"Soft drop, then one step in.",R:"Step in level."},
  {t:"They lift it",ball:{f:[10.1,2.5],to:[6.0,3.4],shot:"dig"},
   say:"Just like the drop pattern, the lift comes up.",L:"It's yours, middle-left.",R:"Split step."},
  {t:"Finish",ball:{f:[6.0,3.3],to:[14.0,1.6],shot:"flatsmash",land:true},
   say:"Smash into the deep corner the drop pulled them out of.",L:"Into the deep corner.",R:"Hold your side."}
  ]},
stepin:{name:"After an attack, step in or hold",cat:"Tactics",
  init:{L:[5.8,2.8],R:[6.0,5.2],A:[12.4,2.7],B:[12.5,5.4]},
  steps:[
  {t:"You attack",ball:{f:[6.0,5.2],to:[12.6,5.6],shot:"push"},pos:{B:[12.7,5.6]},
   say:"You push at their feet.",L:"Hold the middle.",R:"Push at their feet."},
  {t:"Weak reply, so step in",ball:{f:[12.7,5.6],to:[7.0,4.3],shot:"dig"},pos:{L:[6.8,3.0],R:[6.8,5.0]},
   say:"They blocked from low and the ball is coming up. Step in together to 2.5–3 m and split step as it arrives.",
   L:"Step in level with your partner.",R:"Recover from the swing, then step in."},
  {t:"The other case, a balanced defender",pos:{L:[5.8,2.8],R:[6.0,5.2],A:[12.0,2.9],B:[12.4,5.2]},
   say:"Same attack, but this time the defender is balanced and under the ball with time. A lob is coming.",
   L:"Don't step in. Hold your ground.",R:"Hold. Watch their racket face open."},
  {t:"The lob",ball:{f:[12.0,2.9],to:[1.6,1.3],shot:"lob"},pos:{L:[2.4,1.6],R:[5.8,4.0]},
   say:"Because you held, the lob doesn't get far behind you. Chase and cover.",
   L:"Chase it and call it.",R:"Take the middle."}
  ],
  note:"In the pro matches, pressing forward lost more often than it won, mostly to the lob over the advancing player. Step in only when your attack forced a weak reply."}
};
var SCEN_GROUPS=[["Basics",["guide","serving","receiving","pair","middle"]],["Tactics",["pushdig","defend","lobcover","droppattern","fake","stepin"]]];

/* ---------------- State ---------------- */
function load(k,d){try{var v=localStorage.getItem("btp-"+k);return v===null?d:v}catch(e){return d}}
function save(k,v){try{localStorage.setItem("btp-"+k,v)}catch(e){}}
var state={tab:load("tab","shots"),side:load("side","L"),rules:load("rules","open"),zones:load("zones","0")==="1",id:null,step:0,playing:false,branch:null};
var scene=null,timer=null,raf=null,pkTimer=null,preTimer=null;

/* ---------------- Static court ---------------- */
var gC=document.getElementById("g-court"),gZ=document.getElementById("g-zones"),gL=document.getElementById("g-lines"),
    gM=document.getElementById("g-moves"),gT=document.getElementById("g-trail"),gP=document.getElementById("g-players"),gB=document.getElementById("g-ball");
var courtFill=el("rect",{x:X(0),y:Y(0),width:640,height:320,fill:"#F3DFAE",rx:4},gC);
var noGo=el("rect",{x:X(5),y:Y(0),width:240,height:320,fill:"#FF9F1C","fill-opacity":0},gC);
var DASH=[];
el("rect",{x:X(0),y:Y(0),width:640,height:320,fill:"none",stroke:"#0077B6","stroke-width":3},gC);
[0,8].forEach(function(m){el("line",{x1:X(5),y1:Y(m),x2:X(11),y2:Y(m),stroke:"#FF9F1C","stroke-width":4},gC)});
function lbl(x,y,txt,anchor){var t=el("text",{"class":"lb",x:x,y:y,"text-anchor":anchor||"middle",fill:"currentColor",style:"font:700 12px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);t.textContent=txt;return t}
function vline(m,lb){var g=el("g",{},gL);var dl=el("line",{x1:X(m),y1:Y(0),x2:X(m),y2:Y(8),stroke:C.line,"stroke-width":2,"stroke-dasharray":"7 6"},g);DASH.push(dl);
  var t=el("text",{"class":"lb",x:X(m),y:17,"text-anchor":"middle",fill:"currentColor",style:"font:700 12px Montserrat,system-ui,sans-serif;letter-spacing:.06em"},g);t.textContent=lb;return g}
vline(5,"3 m");vline(11,"3 m");var l6a=vline(2,"6 m"),l6b=vline(14,"6 m");
el("line",{x1:X(8),y1:Y(0)-4,x2:X(8),y2:Y(8)+10,stroke:C.net,"stroke-width":6,"stroke-linecap":"round"},gL);
lbl(X(8),17,"NET");lbl(X(4),386,"YOUR SIDE").classList.add("side-lbl");lbl(X(12),386,"OPPONENTS").classList.add("side-lbl");
var s1=el("text",{x:X(0.2),y:Y(0.45),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s1.textContent="LEFT SIDE";
var s2=el("text",{x:X(0.2),y:Y(7.75),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s2.textContent="RIGHT SIDE";

function drawZones(show,side,half,hl){gZ.innerHTML="";if(!show)return;var own=half==="own";
  for(var b=0;b<5;b++){var y0=b*1.6,n=side==="L"?b+1:5-b,on=hl===n;
    el("rect",{x:X(own?0:8),y:Y(y0),width:320,height:64,fill:on?"#FFD23F":C.opp,"fill-opacity":on?0.55:(b%2?0.2:0)},gZ);
    if(on)el("rect",{x:X(own?0:8)+2,y:Y(y0)+2,width:316,height:60,fill:"none",stroke:"#E08A00","stroke-width":3,rx:3},gZ);var t=el("text",{x:X(own?7.3:15.4),y:Y(y0+0.8)+7,"text-anchor":"middle",fill:"#B01E42",style:"font:800 20px Montserrat,sans-serif"},gZ);t.textContent=n;orientText(t)}}

/* Portrait court on phones: rotate the world, keep text upright */
var PORT=false,WORLD=document.getElementById("world"),SVGC=document.getElementById("court");
var UP=[];function upright(t){UP.push(t);orientText(t)}
function orientText(t){if(PORT){var x=+t.getAttribute("x")||0,y=+t.getAttribute("y")||0;t.setAttribute("transform","rotate(90 "+x+" "+y+")")}else t.removeAttribute("transform")}
[].forEach.call(document.querySelectorAll("#g-lines text"),upright);
/* Players */
var COL={L:C.you,R:C.you,A:C.opp,B:C.opp},PL={};
["A","B","L","R"].forEach(function(id){var g=el("g",{"class":"pl"},gP);
  var ring=el("circle",{r:25,fill:"#00C2B8","fill-opacity":0.3,opacity:0},g);
  var c=el("circle",{r:14,fill:COL[id],stroke:"#FFFFFF","stroke-width":2.5},g);
  var t=el("text",{"text-anchor":"middle","dominant-baseline":"central",y:1,fill:"#FFFFFF",style:"font:800 12px Montserrat,system-ui,sans-serif"},g);t.textContent=id;upright(t);
  PL[id]={g:g,ring:ring,c:c,t:t}});
function orient(){var w=document.querySelector(".court-card").getBoundingClientRect().width,p=true;if(p===PORT&&SVGC.dataset.o)return;PORT=p;SVGC.dataset.o="1";
  SVGC.setAttribute("viewBox",PORT?"0 0 420 760":"0 0 760 400");WORLD.setAttribute("transform",PORT?"translate(10 760) rotate(-90)":"");
  document.body.classList.toggle("port",PORT);UP.forEach(orientText);drawDial();
  s2.setAttribute("text-anchor",PORT?"end":"start");s2.setAttribute("x",PORT?X(0.2):X(0.2));
  [].forEach.call(document.querySelectorAll(".side-lbl"),function(e){e.style.display=PORT?"none":""});
  courtScale();if(state.tab==="compete"){if(MATCH&&MATCH.cur)drawPoint()}else if(scene&&state.tab!=="pick"){["A","B","L","R"].forEach(function(k){place(k,posAt(state.step)[k],true)});renderStep()}else if(state.tab==="pick")renderPick()}
var ME="#00C2B8";
var PS=1;function courtScale(){PS=PORT?1.3:1}
var rsT;window.addEventListener("resize",function(){clearTimeout(rsT);rsT=setTimeout(orient,150)});
function place(id,p,instant){var g=PL[id].g;
  if(id==="L"||id==="R"){var me=id===state.side;PL[id].c.setAttribute("fill",ME);PL[id].c.setAttribute("r",me?17:14);PL[id].t.setAttribute("fill","#0D1B2A");PL[id].t.textContent=me?"Y":"P"}if(instant){g.style.transition="none";}g.style.transform="translate("+X(p[0])+"px,"+Y(p[1])+"px) scale("+PS+")";
  if(instant){g.getBoundingClientRect();g.style.transition="";}}

/* Ball */
var tgt=el("ellipse",{rx:20,ry:16,fill:C.opp,"fill-opacity":0.28,opacity:0},gT);
var trail=el("polyline",{fill:"none",stroke:"#8A6A2A","stroke-width":2,"stroke-dasharray":"6 5","stroke-linecap":"round",opacity:0},gT);
var spark=el("circle",{r:6,fill:"none",stroke:"#FFD23F","stroke-width":3,opacity:0},gT);
var land=el("circle",{r:11,fill:"none",stroke:C.oppDark,"stroke-width":3,opacity:0},gT);
var shadow=el("ellipse",{rx:5,ry:3,fill:"#000","fill-opacity":0.25,opacity:0},gB);
var ball=el("circle",{r:6,fill:C.ball,stroke:"#8A6A00","stroke-width":1.2,opacity:0},gB);

var FAST={push:1,flatsmash:1,brush:1,bhsmash:1,hook:1,recoverysmash:1,dig:1,serve:1,inPush:1};
function ease(shot,k){return FAST[shot]?1-(1-k)*(1-k):k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}
var WINDK={calm:0,breezy:0.5,gusty:1};
function runBall(b,mark){if(raf)cancelAnimationFrame(raf);land.setAttribute("opacity",0);spark.setAttribute("opacity",0);
  if(!b){ball.setAttribute("opacity",0);shadow.setAttribute("opacity",0);trail.setAttribute("opacity",0);tgt.setAttribute("opacity",0);sideBall(null);return 0}
  var p=PROF[b.shot]||PROF.neutral,d=RM?150:p.d*1.3,wk=WINDK[state.wind]||0;
  var fx=X(b.f[0]),fy=Y(b.f[1]),tx=X(b.to[0]),ty=Y(b.to[1]),pts=[];
  trail.setAttribute("points","");trail.setAttribute("opacity",0.8);
  tgt.setAttribute("cx",tx);tgt.setAttribute("cy",ty);tgt.setAttribute("opacity",mark?1:0);
  ball.setAttribute("opacity",1);shadow.setAttribute("opacity",1);
  var t0=performance.now();
  function tick(now){var k=Math.max(0,Math.min((now-t0)/d,1)),e=ease(b.shot,k),wv=windV(),bend=wk*26*S(PI*e),
      x=fx+(tx-fx)*e+bend*wv[0],y=fy+(ty-fy)*e+bend*wv[1],h=Math.max(0,p.h(k)),lift=Math.min(60,h*6);
    ball.setAttribute("cx",x);ball.setAttribute("cy",y-lift*(PORT?0:1));ball.setAttribute("transform",PORT?"translate("+(-lift)+",0)":"");
    ball.setAttribute("r",((5+h*0.9)*PS).toFixed(1));
    shadow.setAttribute("cx",x);shadow.setAttribute("cy",y+2);
    pts.push((PORT?x-lift:x).toFixed(1)+","+(PORT?y:y-lift).toFixed(1));trail.setAttribute("points",pts.join(" "));
    sideBall([b.f[0]+(b.to[0]-b.f[0])*e,h]);
    if(k<1){raf=requestAnimationFrame(tick)}else{
      spark.setAttribute("cx",tx);spark.setAttribute("cy",ty);spark.setAttribute("class","");spark.getBoundingClientRect();spark.setAttribute("class","spark");
      if(b.land){land.setAttribute("cx",tx);land.setAttribute("cy",ty);land.setAttribute("opacity",1)}}}
  raf=requestAnimationFrame(tick);return d}
/* Side view of the ball height, net shown at 1.7 m */
var SV=document.getElementById("side"),sv={};
(function(){var NS2="http://www.w3.org/2000/svg",mk=function(t,a){var e=document.createElementNS(NS2,t);for(var k in a)e.setAttribute(k,a[k]);SV.appendChild(e);return e};
  mk("line",{x1:X(0),y1:74,x2:X(16),y2:74,stroke:"#D9C38F","stroke-width":3,"stroke-linecap":"round"});
  mk("line",{x1:X(0),y1:74-17,x2:X(16),y2:74-17,stroke:"currentColor","stroke-width":1,"stroke-dasharray":"3 5",opacity:.35});
  mk("line",{x1:X(8),y1:74,x2:X(8),y2:74-17,stroke:"#0D1B2A","stroke-width":4});
  var t1=mk("text",{x:X(0),y:14,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em",fill:"currentColor",opacity:.7});t1.textContent="SIDE VIEW";
  var t2=mk("text",{x:X(8)+8,y:74-21,style:"font:600 11px Montserrat,system-ui,sans-serif",fill:"currentColor",opacity:.7});t2.textContent="Net height";
  sv.sh=mk("ellipse",{rx:5,ry:2,fill:"#000","fill-opacity":.2,opacity:0});
  sv.b=mk("circle",{r:6,fill:"#FFD23F",stroke:"#8A6A00","stroke-width":1.2,opacity:0})})();
function sideBall(p){if(!p){sv.b.setAttribute("opacity",0);sv.sh.setAttribute("opacity",0);return}
  var x=X(p[0]),y=74-Math.min(68,p[1]*10);sv.b.setAttribute("cx",x);sv.b.setAttribute("cy",y);sv.b.setAttribute("opacity",1);
  sv.sh.setAttribute("cx",x);sv.sh.setAttribute("cy",75);sv.sh.setAttribute("opacity",1)}
/* Wind streaks blowing across the court */
var gW=document.getElementById("g-wind");
/* Wind travels at angle windA (degrees) in court space: 0 = towards the opponents, 90 = from your left side to your right side */
function windV(){var a=(state.windA||0)*PI/180;return [Math.cos(a),Math.sin(a)]}
function drawWind(){gW.innerHTML="";var n={calm:0,breezy:7,gusty:13}[state.wind]||0,v=windV(),L=state.wind==="gusty"?34:22,run=state.wind==="gusty"?150:100;
  for(var i=0;i<n;i++){var x=X(0.6+((i*5.3)%14.8)),y=Y(0.5+((i*2.7)%7));
    el("line",{x1:x,y1:y,x2:x+v[0]*L,y2:y+v[1]*L,stroke:"#0077B6","stroke-width":2.5,"stroke-linecap":"round",opacity:0,"class":"wind-streak",
      style:"--dx:"+(v[0]*run).toFixed(0)+"px;--dy:"+(v[1]*run).toFixed(0)+"px;animation-delay:"+(i*0.21).toFixed(2)+"s;animation-duration:"+(state.wind==="gusty"?1.1:1.8)+"s"},gW)}
  drawDial()}
function drawDial(){var d=document.getElementById("wdial");if(!d)return;var NS2="http://www.w3.org/2000/svg",mk=function(t,a,p){var e=document.createElementNS(NS2,t);for(var k in a)e.setAttribute(k,a[k]);(p||d).appendChild(e);return e};
  d.innerHTML="";mk("circle",{cx:32,cy:32,r:30,fill:"var(--surface-2)",stroke:"var(--line)","stroke-width":2});
  var g=mk("g",{transform:PORT?"rotate(-90 32 32)":""});
  mk("rect",{x:14,y:23,width:36,height:18,rx:2,fill:"#FBF3DF",stroke:"#0077B6","stroke-width":1.5},g);mk("line",{x1:32,y1:21,x2:32,y2:43,stroke:"#0D1B2A","stroke-width":2},g);
  mk("rect",{x:14,y:23,width:18,height:18,fill:"#00C2B8","fill-opacity":.25},g);
  if(state.wind!=="calm"){var v=windV(),ax=32-v[0]*19,ay=32-v[1]*19,bx=32+v[0]*19,by=32+v[1]*19;
    mk("line",{x1:ax,y1:ay,x2:bx,y2:by,stroke:"#0D1B2A","stroke-width":3,"stroke-linecap":"round"},g);
    var px=-v[1],py=v[0];mk("path",{d:"M"+(bx+v[0]*4)+" "+(by+v[1]*4)+"L"+(bx-v[0]*7+px*6)+" "+(by-v[1]*7+py*6)+"L"+(bx-v[0]*7-px*6)+" "+(by-v[1]*7-py*6)+"Z",fill:"#0D1B2A"},g)}
  else{mk("circle",{cx:32,cy:32,r:3,fill:"#0D1B2A"},g)}
  d.setAttribute("aria-valuenow",String(state.windA||0));d.setAttribute("aria-valuetext",windWords())}
function windWords(){if(state.wind==="calm")return "Calm";var v=windV(),f=state.wind==="gusty"?"Gusty":"Breezy";
  if(v[0]>0.7)return f+" wind behind you";if(v[0]<-0.7)return f+" wind into your face";return f+" crosswind from your "+(v[1]>0?"left":"right")}
function windTip(){if(state.wind==="calm")return "";var v=windV(),parts=[];
  if(v[0]>0.4)parts.push("Wind behind you. Add spin so it dips in, and lobs fly long, so aim them shorter.");
  if(v[0]<-0.4)parts.push("Into the wind. Hit harder and flatter. Lobs stay short, so lift them higher and deeper.");
  if(Math.abs(v[1])>0.4){var from=v[1]>0?"left":"right",to=v[1]>0?"right":"left";parts.push("Crosswind from your "+from+". Aim well inside the "+to+" line and use side spin to curve it back.")}
  return (state.wind==="gusty"?"Gusty. ":"")+parts.join(" ")}
function drawMoves(prev,cur){gM.innerHTML="";
  ["A","B","L","R"].forEach(function(id){var a=prev[id],b=cur[id];if(!a||!b)return;
    var dx=X(b[0])-X(a[0]),dy=Y(b[1])-Y(a[1]),len=Math.hypot(dx,dy);if(len<6)return;
    var ux=dx/len,uy=dy/len,opp=(id==="A"||id==="B");
    if(!opp)el("circle",{cx:X(b[0]),cy:Y(b[1]),r:18,fill:"none",stroke:"#00A79E","stroke-width":2,"stroke-dasharray":"4 4",opacity:0.8},gM);
    if(len>(opp?26:20))el("line",{x1:X(a[0])+ux*4,y1:Y(a[1])+uy*4,x2:X(b[0])-ux*18,y2:Y(b[1])-uy*18,stroke:opp?C.oppDark:"#00A79E","stroke-width":2.5,"marker-end":opp?"url(#ar-opp)":"url(#ar-you)"},gM)})}

/* ---------------- Scene building ---------------- */
function merge(a,b){var o={};for(var k in a)o[k]=a[k];if(b)for(var j in b)o[j]=b[j];return o}
/* The ball each shot is played from: [opponent who hits it, flight, description] */
var INC={
  dig:["B","inPush","An opponent at the net pushes hard at your feet."],
  neutral:["B","inLow","An opponent pushes it low at you. You're under pressure and the ball is below the net."],
  highlob:["A","inDrop","They drop it short in front of you. You sprint in and only just get there."],
  push:["B","inMid","Their block floats back at net height while they're still deep."],
  flatsmash:["A","inPop","Their defence pops up a short, high ball."],
  brush:["B","inPop","A high ball comes to you while they're bunched towards the middle."],
  rainbow:["A","inLow","A low ball comes to your backhand while they're at the net."],
  recoverysmash:["A","inLob","They lob over your head. You turn and chase it to the back."],
  hook:["A","inLob","A lob gets behind your head before you can turn."],
  bhsmash:["A","inPop","A high ball comes to your backhand side."],
  drop:["B","inFloat","Their neutral ball floats back to you. Both of them are deep."],
  lob:["A","inLow","An opponent at the net pushes it at you, low but with time to swing."],
  fakelob:["A","inFloat","A floating ball comes to you. You've lobbed them before, so they're expecting another."],
  fakedrop:["B","inFloat","A soft ball comes to you while they're creeping forward."]};
var INCP={recoverysmash:"Don't follow your partner back. Step into the middle.",hook:"Don't follow your partner back. Step into the middle.",highlob:"Hold the middle, a step back in case of a lob."};
var SV0={L:[1.7,2.6],R:[-0.9,6.3],A:[11.6,2.6],B:[11.6,5.6]},SVT={1:[12.6,7.2],2:[11.9,5.75],3:[12.5,4.0],4:[11.9,2.75],5:[12.6,0.75]};
var SVZ={
 1:{rec:"B",rp:[12.3,6.8],op:[11.6,3.3],L:[4.6,3.3],R:[4.6,6.0],
    say:"Down the line, on the server's own side. It surprises the receiver, but the straight return comes back down the server's line, so the server covers it.",
    hit:"Serve down your own line, then cover that line yourself as you move in.",partner:"Slide a little towards the middle. Your partner is covering their own line.",
    mv:"The server protects their own line, the partner takes more of the middle."},
 2:{rec:"B",rp:[11.7,5.7],op:[11.6,3.3],L:[4.6,2.7],R:[4.6,5.3],
    say:"At the receiver on the server's side, aimed at their body or backhand hip. A safe serve that jams them.",
    hit:"Spin and dip at their body or backhand hip.",partner:"Normal start. Go as the serve is struck and cover the middle.",
    mv:"Both move in level to about 4 m from the net, just behind the 3 m line, and split step as they return."},
 3:{rec:"B",rp:[11.9,4.6],op:[11.6,3.2],L:[4.6,2.9],R:[4.6,5.1],
    say:"Down the middle, between the receivers. The most common serve. It can cause confusion over who takes it, and it gives them no angle.",
    hit:"Aim at the seam between them.",partner:"Normal start. The return usually comes back through the middle. Be ready.",
    mv:"Both move in level and close the middle."},
 4:{rec:"A",rp:[11.7,2.7],op:[11.6,4.8],L:[4.6,2.7],R:[4.6,5.2],
    say:"At the other receiver, cross-court. Jams them if it's at the body.",
    hit:"Cross-court at their body.",partner:"The return comes from the receiver opposite you. Hold your side.",
    mv:"Both move in level. The partner watches their line."},
 5:{rec:"A",rp:[12.3,1.2],op:[11.6,4.4],L:[4.6,1.9],R:[4.6,4.6],
    say:"Wide cross-court. A good surprise, but it pulls the receiver wide, and from there the easy return is straight down the partner's line. The server must signal 5 so the partner is ready.",
    hit:"Signal 5 to your partner first. Serve wide, then move in towards the middle.",partner:"You know it's going to 5, so shade towards your line before the return and don't drift to the middle.",
    mv:"The partner guards the line, the server takes the middle."}};
function serveScene(){var s=SHOTS.serve,trunk=[],br=[];
  trunk.push({t:"Zones 1 to 5",hold:SV0.R,zones:true,
    say:"The receiving side is split into five lanes, always counted from the server's side.",
    list:["Down the line, on the server's side","At the receiver on the server's side","Down the middle","At the other receiver","Wide cross-court"],
    after:"Zone 1 always follows the server. When your partner serves, zone 1 is on their side.",
    roles:{hit:state.side==="L"?"You're serving from the left, so zone 1 is the top lane here.":"You're serving from the right, so zone 1 is the bottom lane here.",partner:"Learn the numbers. They tell you where the return will come from."}});
  trunk.push({t:"Signal the serve",hold:SV0.R,zones:true,img:"signal",cap:"Two fingers means zone 2. Show it close to your racket so the receivers can't see it. Your partner glances back to check it, then turns to face the net.",
    say:"Before every serve, the team agrees the zone with a finger signal. One finger for zone 1, up to five for zone 5. Most important is zone 5. The wide serve opens a return straight down the partner's line, so the partner must know it's coming.",
    roles:{hit:"Show your partner the zone with your fingers. Never serve 5 without telling them.",partner:"Check the signal before you set. If it's 5, plan to guard your line."}});
  trunk.push({t:"Set up",hold:SV0.R,zones:true,say:START_SAY.serve,
    roles:{hit:"Behind the baseline, target picked. Change your speed, spin and dip from serve to serve so the receiver never settles.",partner:state.rules==="men"?"As far forward as the rules allow. Just behind the 6 m line, weight forward, ready to go the moment the serve is struck.":"Just behind the 3 m line, weight forward, ready to go the moment the serve is struck."}});
  for(var z=1;z<=5;z++){var c=SVZ[z],rec={};rec[c.rec]=c.rp;rec[c.rec==="A"?"B":"A"]=c.op;
    var steps=[{t:"Serve to zone "+z,tz:z,hl:z,zones:true,ball:{f:SV0.R,to:SVT[z],shot:"serve"},mark:true,pos:merge({R:c.R,L:c.L},rec),alt:{open:{L:[Math.max(4.6,c.L[0]),c.L[1]]}},
      say:c.say+" "+c.mv,roles:{hit:c.hit+" Get to about 4 m and split step as they hit.",partner:c.partner}}];
    if(z===5)steps.push({t:"Why it matters, the line return",tz:5,hl:5,zones:true,ball:{f:c.rp,to:[4.5,1.5],shot:"push"},pos:{L:[4.5,1.5],R:[4.7,4.4]},
      say:"Pulled wide, the receiver drives it straight down the line. Because the partner knew it was a 5, they were already there to block it.",
      roles:{hit:"Cover the middle behind your partner.",partner:"You're on the line already. Block it long or straight."}});
    br.push({label:"Zone "+z,steps:steps})}
  var sc={name:s.name,cat:s.cat,shot:"serve",hitter:"R",zoneSide:"R",init:SV0,initAlt:{open:{L:[4.4,2.6]}},steps:trunk,ask:"Where is the serve going? Pick a zone",askBtn:"Pick a zone",branches:br};
  return state.side==="L"?mirrorScene(sc):sc}
/* Flip the court top to bottom so the left-side player serves */
function mir(p){if(!p)return p;var o={},sw={L:"R",R:"L",A:"B",B:"A"};for(var k in p){o[sw[k]||k]=[p[k][0],8-p[k][1]]}return o}
function mirStep(st){var o=merge(st,null);if(st.pos)o.pos=mir(st.pos);if(st.pre)o.pre=mir(st.pre);if(st.alt&&st.alt.open)o.alt={open:mir(st.alt.open)};
  if(st.ball)o.ball={f:[st.ball.f[0],8-st.ball.f[1]],to:[st.ball.to[0],8-st.ball.to[1]],shot:st.ball.shot};if(st.hold)o.hold=[st.hold[0],8-st.hold[1]];return o}
function mirrorScene(sc){var o=merge(sc,null);o.hitter="L";o.zoneSide="L";o.init=mir(sc.init);o.initAlt={open:mir(sc.initAlt.open)};o.steps=sc.steps.map(mirStep);
  o.branches=sc.branches.map(function(b){return {label:b.label,steps:b.steps.map(mirStep)}});return o}
var OUTRO={serve:"Signal, spin and dip, then follow it in together.",push:"They had to hit up from low. Your team owns the net now.",
 flatsmash:"Down the middle and they both hesitated.",neutral:"You bought time and reset the rally.",lob:"They're running back. You've taken the net.",
 drop:"They're stretching forward. Get ready for the lift.",dig:"No easy smash for them. The rally goes on on your terms."};
function nextItem(){var seq=VISIBLE.concat(PATTERNS),i=seq.indexOf(state.id);if(i<0||i>=seq.length-1)return null;var n=seq[i+1];return {tab:"shots",id:n,name:(SHOTS[n]||SCENES[n]).name}}
function track(ev,p){try{var o={event:ev,ts:Date.now()};for(var k in p)o[k]=p[k];(window.dataLayer=window.dataLayer||[]).push(o);if(window.posthog&&posthog.capture)posthog.capture(ev,p)}catch(e){}}
var START_SAY={serve:"Server behind the baseline. In men's pro the partner starts behind the 6 m line. In women's and social play, it's the 3 m line. The receivers start just behind their 3 m line."};
function shotScene(id){if(id==="serve")return serveScene();var s=SHOTS[id],h=s.hitter,inc=INC[id],steps=[];
  var rp=merge(s.react,null);["L","R"].forEach(function(k){if(!(k in s.react)&&s.after&&s.after[k]){var a=s.start[k],b=s.after[k];rp[k]=[a[0]+(b[0]-a[0])*0.6,a[1]+(b[1]-a[1])*0.6]}});
  var sv=id==="serve";
  steps.push({t:"Starting position",hold:s.start[h],zones:sv,say:START_SAY[id]||(inc?inc[2]:""),
    roles:{hit:sv?"Pick your target before the toss. Zone 2, at the receiver's body or backhand.":"Get to the ball early and set your feet.",
      partner:sv?"Weight forward, ready to go the moment the serve is struck.":(INCP[id]||"Hold your side, ready for the reply.")}});
  steps.push({t:"The shot",ball:{f:s.start[h],to:s.to,shot:id},mark:s.mark,pos:rp,alt:s.reactAlt,say:s.what,list:s.tech,after:s.techAfter,roles:{hit:s.hitDo,partner:s.partnerDo}});
  var mv=MOVE[id];
  steps.push({t:"Where to move",pos:merge(s.after,mv&&mv.opp),say:mv?mv.say:"Where both of you go next, and how the opponents react.",roles:{hit:s.afterH,partner:s.afterP}});
  var sc={name:s.name,cat:s.cat,shot:id,hitter:h,zoneSide:"R",init:s.start,initAlt:s.startAlt,steps:steps};
  if(h===state.side)return sc;
  /* Mirror so the user is always the hitter. Drop shots flip the whole court (keeps them straight); other shots keep the same target on the opponents. */
  var full=id==="drop",o=merge(sc,null);o.hitter=state.side;o.initAlt=null;
  o.init=full?mir(sc.init):teamMir(sc.init);o.steps=sc.steps.map(full?mirStep:mirTeamStep);return o}
function teamMir(p){if(!p)return p;var o={};for(var k in p){if(k==="L"||k==="R")o[k==="L"?"R":"L"]=[p[k][0],8-p[k][1]];else o[k]=p[k]}return o}
function mirTeamStep(st){var o=merge(st,null);if(st.pos)o.pos=teamMir(st.pos);if(st.pre)o.pre=teamMir(st.pre);
  if(st.ball)o.ball={f:[st.ball.f[0],8-st.ball.f[1]],to:st.ball.to,shot:st.ball.shot};if(st.hold)o.hold=[st.hold[0],8-st.hold[1]];return o}
var MOVE={
 push:{say:"They have to block from low, so you step in together and take the net. They stay deep and defend.",opp:{A:[12.6,3.0],B:[12.9,5.3]}},
 flatsmash:{say:"Your smash forces a weak reply. Step in together, ready to finish the point, while they scramble.",opp:{A:[12.8,3.1],B:[12.8,4.9]}},
 neutral:{say:"Your deep ball buys time. Get level just behind your 3 m line while they move to play it from the back.",opp:{A:[11.4,3.0],B:[13.9,6.3]}},
 lob:{say:"They turn and chase it to the back. Step in together while they're running.",opp:{A:[12.8,3.4],B:[14.6,6.6]}},
 drop:{say:"They sprint in to dig it out. Follow in one step and split step, ready for the lift.",opp:{A:[12.2,3.6],B:[10.1,5.3]}},
 dig:{say:"Your long block sends them back. Hold level, and step in only if they turn and run.",opp:{A:[12.2,3.2],B:[13.8,6.1]}}};
function stepsOf(){return scene.branches&&state.branch!=null?scene.steps.concat(scene.branches[state.branch].steps):scene.steps}
function posAt(i){var p=merge(scene.init,scene.initAlt&&scene.initAlt[state.rules]),all=stepsOf();
  for(var n=0;n<=i;n++){var st=all[n];p=merge(p,st.pre);p=merge(p,st.pos);if(st.alt&&st.alt[state.rules])p=merge(p,st.alt[state.rules])}return p}
function initPos(){return merge(scene.init,scene.initAlt&&scene.initAlt[state.rules])}

/* ---------------- Rendering ---------------- */
var $=function(id){return document.getElementById(id)};
function iconBtn(id,label,onclick){var ic=ICON[id],b=document.createElement("button");b.id="item-"+id;b.className="item icon-btn";b.style.setProperty("--tile",ic.c);
  b.innerHTML='<span class="ic" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span>';
  var lab=document.createElement("span");lab.textContent=label;b.appendChild(lab);b.onclick=onclick;return b}
function renderList(){var list=$("list"),l2=$("list2");list.innerHTML="";l2.innerHTML="";var t=state.tab;
  $("selector").hidden=false;list.className="list icons";l2.className="list";l2.hidden=false;$("sel2-title").hidden=false;
  if(t==="shots"){$("sel-title").textContent="Choose a shot";$("sel2-title").textContent="Patterns";
    VISIBLE.forEach(function(id){var b=iconBtn(id,SHOTS[id].name,function(){select(id)});b.setAttribute("aria-current",String(id===state.id));list.appendChild(b)});
    PATTERNS.forEach(function(id,n){var b=document.createElement("button");b.id="item-"+id;b.className="item chip";b.textContent=SCENES[id].name;b.setAttribute("aria-current",String(id===state.id));b.onclick=function(){select(id)};l2.appendChild(b)})}
  else if(t==="pick"){$("sel-title").textContent="Your call. Tap a shot";$("sel2-title").textContent="Real situations";
    VISIBLE.filter(function(v){return v!=="serve"}).forEach(function(id){var b=iconBtn(id,SHOTS[id].name,function(){pickShot(id)});b.setAttribute("aria-current",String(id===PK.pickShot));list.appendChild(b)});
    PRESETS.forEach(function(pr,i){var b=document.createElement("button");b.className="item chip";b.textContent=pr.name;b.setAttribute("aria-current",String(i===PK.preset));b.onclick=function(){usePreset(i)};l2.appendChild(b)})}
  else{$("sel-title").textContent="Sand Series. Choose your opponents";$("sel2-title").hidden=true;l2.hidden=true;list.className="list";renderLobby(list)}}
function select(id){stop();state.id=id;save("id-"+state.tab,id);
  scene=SHOTS[id]?shotScene(id):SCENES[id];state.step=0;state.branch=null;
  [].forEach.call(document.querySelectorAll(".item"),function(b){b.setAttribute("aria-current",String(b.id==="item-"+id))});
  $("title").textContent=scene.name;var cat=$("cat");cat.textContent=scene.cat;cat.style.background=CATCOL[scene.cat]||"var(--turq)";
  renderOptions();
  var isShot=!!SHOTS[id];if(isShot&&ICON[id])document.documentElement.style.setProperty("--shotc",ICON[id].c);$("cards").hidden=!isShot;$("cards-m").hidden=!isShot;
  if(isShot){var s=SHOTS[id];fillTips(TIPS[id]||{when:[s.when],aim:[s.aim],avoid:[s.avoid]})}
  if(scene.note){$("note").hidden=false;$("note").textContent=scene.note}else{$("note").hidden=true}
  var ip=initPos();["A","B","L","R"].forEach(function(k){place(k,ip[k],true)});
  renderStep()}
function renderDots(){var dots=$("dots");dots.innerHTML="";stepsOf().forEach(function(s,i){var b=document.createElement("button");b.setAttribute("aria-label","Step "+(i+1)+": "+s.t);b.onclick=function(){stop();state.step=i;renderStep()};dots.appendChild(b)})}
function renderOptions(){var box=$("opt-btns");box.innerHTML="";if(!scene.branches){$("options").hidden=true;return}
  $("ask").textContent=scene.ask||"What happens next?";
  scene.branches.forEach(function(br,j){var b=document.createElement("button");b.className="opt";b.id="opt-"+j;b.textContent=br.label;
    b.onclick=function(){stop();var base=scene.steps.length-1,from=posAt(base);state.branch=j;state.step=base+1;
      ["A","B","L","R"].forEach(function(k){place(k,from[k],true)});requestAnimationFrame(function(){renderStep()})};box.appendChild(b)})}
function renderStep(){var all=stepsOf(),i=state.step,st=all[i];renderDots();
  var showOpt=!!scene.branches&&i>=scene.steps.length-1;$("options").hidden=!showOpt;
  [].forEach.call($("opt-btns").children,function(b,j){b.setAttribute("aria-pressed",String(j===state.branch))});
  var prev=i>0?posAt(i-1):initPos(),cur=posAt(i);
  var bp=st.ball&&(PROF[st.ball.shot]||PROF.neutral),mv=(bp&&!RM)?Math.round(bp.d*1.3):900;
  clearTimeout(preTimer);var delay=0,pp=null;
  if(st.pre){pp=merge(prev,st.pre);var dist=0;for(var q in st.pre){var a0=prev[q],b0=st.pre[q];if(a0)dist=Math.max(dist,Math.hypot(a0[0]-b0[0],a0[1]-b0[1]))}
    delay=(RM||dist<0.3)?0:Math.round(Math.min(1800,500+dist*300))}
  var setPos=function(P,dur){["A","B","L","R"].forEach(function(k){PL[k].g.style.transitionDuration=dur+"ms";place(k,P[k],false);PL[k].ring.setAttribute("opacity",k===state.side?1:0)})};
  if(delay)setPos(pp,delay);else setPos(cur,mv);
  drawMoves(prev,cur);
  var sv=st.ball&&st.ball.shot==="serve";
  if(sv)drawZones(true,st.ball.f[1]<4?"L":"R",st.ball.to[0]<8?"own":"opp",st.hl);
  else drawZones(state.zones||!!st.zones,(scene.zoneFollow?state.side:scene.zoneSide)||"R","opp",st.hl);

  var d;
  if(delay){if(raf)cancelAnimationFrame(raf);trail.setAttribute("opacity",0);tgt.setAttribute("opacity",0);land.setAttribute("opacity",0);
    if(st.ball){ball.setAttribute("cx",X(st.ball.f[0]));ball.setAttribute("cy",Y(st.ball.f[1]));ball.setAttribute("r",7);ball.setAttribute("opacity",1);shadow.setAttribute("cx",X(st.ball.f[0]));shadow.setAttribute("cy",Y(st.ball.f[1])+2);shadow.setAttribute("opacity",1)}
    preTimer=setTimeout(function(){setPos(cur,mv);runBall(st.ball,st.mark)},delay+120);d=bp?bp.d*1.3:0}
  else d=runBall(st.ball,st.mark);
  if(!st.ball&&st.hold){var hx=X(st.hold[0]+(st.hold[0]<8?0.5:-0.5)),hy=Y(st.hold[1]);ball.setAttribute("cx",hx);ball.setAttribute("cy",hy);ball.setAttribute("r",6*PS);ball.setAttribute("opacity",1);shadow.setAttribute("cx",hx);shadow.setAttribute("cy",hy+2);shadow.setAttribute("opacity",1)}
  if(state.tab==="shots"&&state.id==="serve"){fillTips(st.tz?ZTIPS[st.tz]:TIPS.serve)}
  var pend=!!scene.branches&&state.branch==null&&i===all.length-1;
  $("step-k").textContent=pend?"Step "+(i+1)+" · pick an option to continue":"Step "+(i+1)+" of "+all.length;
  $("step-title").textContent=st.t;$("mcap-t").textContent=st.t;$("court-t").textContent=st.t+". "+(st.say||"");$("say").textContent=st.say||"";
  var ol=$("say-list");ol.innerHTML="";(st.list||[]).forEach(function(t,j){var li=document.createElement("li");var n=document.createElement("b");n.textContent=j+1;li.appendChild(n);li.appendChild(document.createTextNode(t));ol.appendChild(li)});ol.hidden=!st.list;
  var im=$("say-img");im.innerHTML=st.img?ILLUS[st.img]+(st.cap?"<figcaption>"+st.cap+"</figcaption>":""):"";im.hidden=!st.img;
  $("say-after").textContent=st.after||"";$("say-after").hidden=!st.after;
  var chip=$("shotchip"),sid=st.ball&&simple(st.ball.shot);if(!SHOTS[state.id]&&sid&&VISIBLE.indexOf(sid)>=0){chip.hidden=false;chip.textContent="See the "+SHOTS[sid].name.toLowerCase();chip.dataset.shot=sid}else{chip.hidden=true}
  var you,partner,label="Your job";
  if(st.roles){var hit=scene.hitter===state.side;you=hit?st.roles.hit:st.roles.partner;partner=hit?st.roles.partner:st.roles.hit;label=hit?"You hit this one":"Your partner hits"}
  else if(st.me){you=st.me;partner=st.mate}
  else{you=st[state.side];partner=st[state.side==="L"?"R":"L"]}
  $("you-label").textContent=label;
  $("you-text").textContent=you||"";$("partner-text").textContent=partner||"";$("jobs").hidden=!you&&!partner;
  [].forEach.call($("dots").children,function(b,j){b.setAttribute("aria-current",String(j===i))});
  var last=i===all.length-1&&!pend,nx=last?nextItem():null;
  $("prev").disabled=i===0;$("next").disabled=last&&!nx;$("next").innerHTML=pend?(scene.askBtn||"Pick an option")+" &#8595;":last&&nx?"Next: "+nx.name+" &#8594;":"Next &#8594;";
  $("outro").hidden=!last;if(last){$("outro-t").textContent=(OUTRO[state.id])||scene.note||"That's the pattern. Look for it in your next game.";
    var cb=document.querySelector(".court-box");cb.classList.remove("win");setTimeout(function(){cb.classList.add("win")},Math.max(d,300)+delay);
    track("lesson_completed",{tab:state.tab,lesson:state.id,steps_viewed:all.length})}
  $("mcap-k").textContent="Step "+(i+1)+(pend?"":" of "+all.length);
  var wt=$("windtip");wt.hidden=state.wind==="calm";if(!wt.hidden)wt.textContent=windTip();
  try{history.replaceState(null,"","#/"+state.tab+"/"+state.id+"/"+(i+1))}catch(e){}
  track("lesson_step_viewed",{tab:state.tab,lesson:state.id,step:i+1,steps_total:all.length,viewport:innerWidth});
  return Math.max(d,900)+delay}
function stop(){state.playing=false;clearTimeout(timer);clearTimeout(preTimer);$("play").textContent="Play all"}
function play(){if(state.playing){stop();return}state.playing=true;$("play").textContent="Pause";state.step=0;
  var go=function(){if(!state.playing)return;var d=renderStep();
    timer=setTimeout(function(){if(!state.playing)return;if(state.step>=stepsOf().length-1){stop();return}state.step++;go()},d+2600)};go()}

/* ---------------- Controls ---------------- */
function setTab(t){stop();clearTimeout(pkTimer);if(t==="play")t="shots";if(state.tab==="compete"&&t!=="compete")leaveMatch();state.tab=t;save("tab",t);
  ["shots","pick","compete"].forEach(function(k){$("tab-"+k).setAttribute("aria-selected",String(k===t))});
  var pick=t==="pick",comp=t==="compete";$("picker").hidden=!pick;$("ctrls").hidden=pick||comp;$("stepbox").hidden=pick||comp;$("result").hidden=!pick;
  document.body.classList.toggle("picking",pick);document.body.classList.toggle("competing",comp);if(typeof orient==="function"&&SVGC.dataset.o)orient();$("mcap").style.display=pick||comp?"none":"";
  $("cpanel").hidden=!comp;$("score").hidden=true;
  if(pick){resetCall();$("cards").hidden=true;$("cards-m").hidden=true;$("title").textContent="Train";var ct=$("cat");ct.textContent="Decision tool";renderList();renderPickInputs();renderPick();return}
  if(comp){gG.innerHTML="";gM.innerHTML="";drawZones(false);runBall(null);$("title").textContent="Sand Series";renderList();lobbyPanel();return}
  gG.innerHTML="";
  var saved=load("id-shots","serve"),ok=VISIBLE.indexOf(saved)>=0||!!SCENES[saved];state.id=ok?saved:"serve";
  renderList();select(state.id)}
[].forEach.call(document.querySelectorAll(".tabs button"),function(b,i,all){b.addEventListener("keydown",function(e){var d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;var n=all[(i+d+all.length)%all.length];n.focus();n.click()})});
$("tab-shots").onclick=function(){setTab("shots")};$("tab-pick").onclick=function(){setTab("pick")};$("tab-compete").onclick=function(){setTab("compete")};
function seg(id,key){var box=$(id);[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state[key]));
  b.onclick=function(){track("setting_changed",{setting:key,from:state[key],to:b.dataset.v,tab:state.tab,lesson:state.id});state[key]=b.dataset.v;save(key,b.dataset.v);setSum();[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))});
    if(state.tab==="pick"){renderPick();return}
    if(state.tab==="compete"){if(MATCH&&MATCH.cur)drawPoint();return}
    if(state.tab==="shots"){select(state.id);return}
    if(key==="rules"){var keep=state.step;["A","B","L","R"].forEach(function(k){place(k,posAt(keep)[k],true)})}
    renderStep()}})}
seg("seg-side","side");seg("seg-rules","rules");
function setSum(){var b=$("set-btn");if(b)b.innerHTML=(state.side==="L"?"Left side":"Right side")+" · "+(state.rules==="men"?"Men's pro":"Women's &amp; social")+" &#9662;"}
$("set-btn").onclick=function(){var o=document.querySelector(".settings").classList.toggle("open");this.setAttribute("aria-expanded",String(o))};setSum();courtScale();
/* Light sand court with soft blue 3 m and 6 m lines, dusk sand in dark mode */
var DARKQ=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");
function courtTheme(){var dk=document.documentElement.dataset.theme==="dark"||(document.documentElement.dataset.theme!=="light"&&DARKQ&&DARKQ.matches);
  courtFill.setAttribute("fill",dk?"#4A473F":"#FBF3DF");[s1,s2].forEach(function(t){t.setAttribute("fill",dk?"#D9C38F":C.sandText)})}
courtTheme();if(DARKQ&&DARKQ.addEventListener)DARKQ.addEventListener("change",courtTheme);DASH.forEach(function(d){d.setAttribute("stroke","#0077B6");d.setAttribute("stroke-opacity",0.55)});
state.zones=false;
$("prev").onclick=function(){stop();if(state.step>0){state.step--;renderStep()}};
$("next").onclick=function(){stop();if(state.step<stepsOf().length-1){state.step++;renderStep();return}
  if(!(scene.branches&&state.branch==null)){var nx=nextItem();if(nx){if(nx.tab===state.tab){select(nx.id)}else setTab(nx.tab);return}}
  if(scene.branches&&state.branch==null){var o=$("options");o.scrollIntoView({behavior:RM?"auto":"smooth",block:"center"});var f=o.querySelector(".opt");if(f)f.focus({preventScroll:true})}};
$("play").onclick=play;
$("replay").onclick=function(){stop();var i=state.step,prev=i>0?posAt(i-1):initPos();["A","B","L","R"].forEach(function(k){place(k,prev[k],true)});requestAnimationFrame(function(){renderStep()})};
function openShot(s){save("id-shots",simple(s));setTab("shots")}
$("shotchip").onclick=function(){openShot(this.dataset.shot)};
$("r-open").onclick=function(){openShot(this.dataset.shot)};

/* ---------------- Which shot? ---------------- */
var PK={preset:-1,revealed:false,streak:+load("pk-streak","0")||0,side:load("pk-side","fh"),depth:load("pk-depth","mid"),speed:load("pk-speed","med"),height:load("pk-height","med"),A:[0,0],B:[0,2],next:"A"};
try{var spk=JSON.parse(load("pk-opp","null"));if(spk&&spk.A&&spk.B){PK.A=spk.A;PK.B=spk.B}}catch(e){}
var OX=[9.6,12.5,15.0],OY=[1.4,4.0,6.6],DW=["at the net","in the middle","deep"],DI={front:0,mid:1,back:2};
var gG=document.getElementById("g-grid");
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function oppPos(o){return [OX[o[0]],OY[o[1]]]}
function laneWord(y){return y<1.4?"along your left sideline":y<3.2?"on your left side":y<4.8?"down the middle":y<6.6?"on your right side":"along your right sideline"}
function depthWord(x){return x<10.6?"short":x<13.2?"mid-depth":"deep"}
function formationText(){var a=PK.A,b=PK.B,d,l;
  if(a[0]===b[0])d="Both "+DW[a[0]];else{var lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]);d="One "+DW[lo]+", one "+DW[hi]}
  var dl=Math.abs(a[1]-b[1]);
  if(dl===0)l=a[1]===1?"bunched in the middle, so the sidelines are open":"both on your "+(a[1]===0?"left":"right")+", so your "+(a[1]===0?"right":"left")+" side is open";
  else if(dl===2)l="spread wide, so the middle is open";
  else l="close together, so your "+(a[1]+b[1]===1?"right":"left")+" side is open";
  return d+". "+cap(l)+"."}
/* Drop only to a player who is mid-court or deep, and not into the lane of a partner who is at the net */
function dropTarget(){var a=PK.A,b=PK.B,c=[[a,b],[b,a]].sort(function(x,y){return y[0][0]-x[0][0]});
  for(var i=0;i<2;i++){var t=c[i][0],o=c[i][1];if(t[0]<1)continue;if(o[0]===0&&o[1]===t[1])continue;return t}return null}
function dropOK(){return !!dropTarget()}
function choose(){var H=PK.height,D=DI[PK.depth],Sp=PK.speed,Sd=PK.side;
  var minD=Math.min(PK.A[0],PK.B[0]),bothBack=minD===2,anyFront=minD===0,bunched=PK.A[1]===1&&PK.B[1]===1,r;
  if(H==="high"){
    if(D<=1){
      if(Sd==="bh")r=["bhsmash","High on your backhand and close enough to attack. Smash it with a short, firm swing, straight or down the middle."];
      else if(bunched)r=["brush","High ball close to the net and they're bunched in the middle. Smash it with brush and spin, out wide."];
      else r=["flatsmash","High ball within about 5 m of the net. Hit down."];
    }else r=(Sp==="fast"||Sd==="bh")?["hook","High but deep, and you're rushed or on your backhand. Smash it back deep, with a windmill swing if it's behind you."]:["recoverysmash","High but you're deep. A smash from here won't win the point, so place it deep."];
  }else if(H==="med"){
    if(Sp==="fast")r=D===0?["push","Fast at net height and you're close. Punch it back down with a compact swing."]:["dig","Fast and you're further back. No time to swing, so block it long over them or straight at medium height."];
    else if(D===0)r=(dropOK()&&Sp==="slow")?["drop","Slow ball near the net and the player you'd drop to is behind their 3 m line. Play it short in front of them."]:["push","At net height and close to the net. Push it down."];
    else if(D===1){
      if(Sp==="slow"&&anyFront)r=Sd==="bh"?["rainbow","Time on your backhand and an opponent at the net. Lob over them, with topspin if you have it."]:["lob","Time to swing and an opponent at the net. Go over them."];
      else if(Sp==="slow"&&dropOK())r=["drop","Time to swing and the player you'd drop to is behind their 3 m line. Play it short in front of them."];
      else r=["push","At net height in the middle of the court. Push it down at them."];
    }else r=(Sp==="slow"&&minD<=1)?(Sd==="bh"?["rainbow","Time on your backhand and they're forward. Lob over them, with topspin if you have it."]:["lob","You're deep with time and they're forward. Lob over them."]):["neutral","You're deep and can't attack from here. Reset deep onto a backhand."];
  }else{
    if(Sp==="fast")r=["dig","Fast and below the net. Don't swing, and don't try to lob it because that's very difficult. Block it long over them or straight at medium height."];
    else if(D===0)r=(Sp==="slow"&&dropOK())?["drop","Low but slow near the net, and the player you'd drop to is behind their 3 m line. Drop it short in front of them."]:["neutral","Low and slow near the net, with nobody to drop to. Lift it softly and deep so they can't attack it."];
    else if(D===1){
      if(Sp==="slow")r=anyFront?(Sd==="bh"?["rainbow","Low on your backhand with time and an opponent at the net. Lob over them, with topspin if you have it."]:["lob","Below the net with time and an opponent at the net. Go over them."]):(dropOK()?["drop","Below the net with time, and the player you'd drop to is behind their 3 m line. Play short in front of them."]:["neutral","Below the net with time. Reset deep onto a backhand."]);
      else r=["dig","Below the net with some pace. Block it long over them or straight at medium height."];
    }else r=(Sp==="slow"&&anyFront)?["lob","Deep with time and they're at the net. Lob over them."]:["neutral","Low and deep. Reset with a deep neutral ball onto a backhand."];
  }
  if(Sd==="body"&&Sp==="fast"&&H!=="high")r=["dig","Fast at your body. Get the racket in front and block it long or straight, not short."];
  return {shot:r[0],why:r[1]}}
var BACKUP={flatsmash:"brush",brush:"flatsmash",bhsmash:"hook",hook:"highlob",recoverysmash:"highlob",push:"dig",dig:"neutral",neutral:"highlob",lob:"neutral",rainbow:"lob",drop:"fakedrop",highlob:"neutral",fakelob:"lob",fakedrop:"drop"};
function target(shot){var o=[oppPos(PK.A),oppPos(PK.B)],minD=Math.min(PK.A[0],PK.B[0]);
  function near(x,y){return Math.min(Math.hypot(x-o[0][0],y-o[0][1]),Math.hypot(x-o[1][0],y-o[1][1]))}
  function space(x0,x1,ys,bias){var best=null,bs=-1e9;for(var x=x0;x<=x1+0.01;x+=0.3)for(var i=0;i<ys.length;i++){var s=near(x,ys[i])+(bias?bias(x,ys[i]):0);if(s>bs){bs=s;best=[x,ys[i]]}}return best}
  var YS=[0.7,1.6,2.5,3.4,4.0,4.6,5.5,6.4,7.3];
  if(shot==="dig"){var yb=state.side==="L"?1.3:6.7,deepB=minD>=1;
    return deepB?{p:[13.0,yb],txt:"Straight down the line at medium height. Not short."}:{p:space(14.0,15.2,YS),txt:"Long over them, deep, so there's no easy smash. Or straight down the line at medium height. Don't block it short unless you're very advanced."}}
  if(shot==="neutral"){var bh=[[o[0][0],Math.min(7.4,o[0][1]+1.1)],[o[1][0],Math.min(7.4,o[1][1]+1.1)]];
    var pick=Math.hypot(bh[0][1]-o[1][1],0)>=Math.hypot(bh[1][1]-o[0][1],0)?0:1,tp=[14.6,bh[pick][1]];
    return {p:tp,txt:"Deep onto the backhand of the opponent "+laneWord(o[pick][1]).replace("down the middle","in the middle")+"."}}
  if(shot==="bhsmash")return {p:[12.4,4.0],txt:"Down the middle or straight. Keep it simple, with no big angles on the backhand."};
  if(shot==="lob"||shot==="rainbow"||shot==="fakedrop"){var nf=o[0][0]<=o[1][0]?o[0]:o[1];
    return {p:[14.9,Math.min(7.3,nf[1]+1.0)],txt:"Deep over the left shoulder of the opponent "+DW[nf[0]<11?0:nf[0]<14?1:2]+", on their backhand side."}}
  if(shot==="push"&&minD<=1){
    if(PK.A[0]===PK.B[0]&&Math.abs(PK.A[1]-PK.B[1])===2)return {p:[o[0][0]-0.3,4.0],txt:"Down the middle between them, low. Make them both think it's theirs."};
    var f=o[0][0]<=o[1][0]?o[0]:o[1];
    return {p:[f[0]-0.4,f[1]+0.4],txt:"At the feet or backhand hip of the opponent "+DW[f[0]<11?0:f[0]<14?1:2]+" "+laneWord(f[1]).replace("down the middle","in the middle")+"."};
  }
  var p,deepMid=(shot==="neutral"||shot==="recoverysmash"||shot==="highlob");
  if(shot==="drop"||shot==="fakelob"){var dt=dropTarget(),dp=dt?oppPos(dt):(o[0][0]>=o[1][0]?o[0]:o[1]);p=space(9.2,9.8,YS.filter(function(y){return Math.abs(y-dp[1])<=1.0}));
    return {p:p,txt:"Short, just over the net in front of the opponent who is back "+laneWord(dp[1]).replace("down the middle","in the middle")+". Straight is safest."}}
  else if(shot==="brush")p=space(10.2,12.6,[0.6,7.4]);
  else if(shot==="flatsmash"||shot==="bhsmash"||shot==="hook"||shot==="push")p=space(10.2,13.4,YS);
  else p=space(14.4,15.4,YS,deepMid?function(x,y){return -Math.abs(y-4)*0.35}:null);
  return {p:p,txt:cap(depthWord(p[0])+" "+laneWord(p[1]))+", into the space away from both opponents."}}
function drawGrid(){gG.innerHTML="";
  [2.67,5.33].forEach(function(y){el("line",{x1:X(8),y1:Y(y),x2:X(16),y2:Y(y),stroke:"#FFFFFF","stroke-width":1.5,"stroke-dasharray":"4 6"},gG)});
  el("line",{x1:X(14),y1:Y(0),x2:X(14),y2:Y(8),stroke:"#FFFFFF","stroke-width":1.5,"stroke-dasharray":"4 6"},gG);
  var xs=[[8,11],[11,14],[14,16]],ys=[[0,2.67],[2.67,5.33],[5.33,8]];
  for(var d=0;d<3;d++)for(var l=0;l<3;l++)(function(d,l){var r=el("rect",{x:X(xs[d][0]),y:Y(ys[l][0]),width:(xs[d][1]-xs[d][0])*40,height:(ys[l][1]-ys[l][0])*40,fill:"#00C2B8","fill-opacity":0,"class":"cell"},gG);
    r.setAttribute("tabindex","0");r.setAttribute("role","button");r.setAttribute("aria-label","Place opponent "+["at the net","mid-court","deep"][d]+", "+["on your left","in the middle","on your right"][l]);
    r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();r.dispatchEvent(new Event("click"))}});
    r.addEventListener("click",function(){var other=PK.next==="A"?"B":"A";if(PK[other][0]===d&&PK[other][1]===l)return;PK[PK.next]=[d,l];PK.next=other;resetCall();save("pk-opp",JSON.stringify({A:PK.A,B:PK.B}));renderPick()})})(d,l)}
function pkSeg(key){var box=$("pk-"+key);[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===PK[key]));
  b.onclick=function(){resetCall();PK.preset=-1;PK[key]=b.dataset.v;save("pk-"+key,b.dataset.v);[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))});renderPick()}})}
var DEP=["Short","Middle","Deep"],LAN=["Left","Middle","Right"];
function cellOf(p){return [p[0]<11?0:p[0]<14?1:2,p[1]<2.67?0:p[1]<5.33?1:2]}
function cellName(c){return (DEP[c[0]]+" "+LAN[c[1]].toLowerCase()).replace("Middle middle","Middle of the court")}
function pickShot(id){if(PK.revealed)resetCall();PK.pickShot=id;[].forEach.call($("list").children,function(x){x.setAttribute("aria-current",String(x.id==="item-"+id))});
  $("call-hint").textContent="You picked "+SHOTS[id].name.toLowerCase()+". Now pick where you'd aim it.";$("aim-step").hidden=false;
  if(innerWidth<900)$("aim-step").scrollIntoView({behavior:RM?"auto":"smooth",block:"center"})}
var PRESETS=[
 {name:"Their block pops up",s:{side:"fh",depth:"front",speed:"med",height:"high",A:[2,0],B:[2,2]},watch:"pushdig"},
 {name:"Pushed at your feet",s:{side:"body",depth:"mid",speed:"fast",height:"low",A:[0,0],B:[0,2]},watch:"defend"},
 {name:"They're both at the net",s:{side:"fh",depth:"mid",speed:"slow",height:"med",A:[0,0],B:[0,2]},watch:"stepin"},
 {name:"Lobbed over your head",s:{side:"bh",depth:"back",speed:"med",height:"high",A:[0,0],B:[0,2]},watch:"lobcover"},
 {name:"Floating ball, both deep",s:{side:"fh",depth:"front",speed:"slow",height:"med",A:[2,0],B:[2,2]},watch:"droppattern"},
 {name:"Receiving the serve",s:{side:"fh",depth:"mid",speed:"med",height:"low",A:[2,0],B:[1,2]},watch:"receiving"},
 {name:"Disguise chance",s:{side:"fh",depth:"mid",speed:"slow",height:"med",A:[1,0],B:[1,2]},watch:"fake"}];
function usePreset(i){var pr=PRESETS[i];PK.preset=i;["side","depth","speed","height"].forEach(function(k){PK[k]=pr.s[k];save("pk-"+k,pr.s[k])});PK.A=pr.s.A.slice();PK.B=pr.s.B.slice();
  save("pk-opp",JSON.stringify({A:PK.A,B:PK.B}));resetCall();renderList();renderPickInputs();renderPick()}
function buildCall(){var g=$("aim-grid");if(g.children.length)return;g.appendChild(document.createElement("span"));LAN.forEach(function(n){var h=document.createElement("span");h.className="ax";h.textContent=n;g.appendChild(h)});
  [2,1,0].forEach(function(dI){var lab=document.createElement("span");lab.className="ay";lab.textContent=DEP[dI];g.appendChild(lab);
    [0,1,2].forEach(function(lI){var b=document.createElement("button");b.setAttribute("aria-label","Aim "+cellName([dI,lI]));b.setAttribute("aria-pressed","false");
      b.onclick=function(){[].forEach.call(g.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",String(x===b))});judge([dI,lI])};g.appendChild(b)})})}
function judge(cell){var ok=PK.pickShot===PK.answer,ic=PK.ideal,off=Math.abs(cell[0]-ic[0])+Math.abs(cell[1]-ic[1]),sq=off===0?"right":off===1?"close":"wrong";
  PK.streak=(ok&&sq==="right")?PK.streak+1:0;save("pk-streak",String(PK.streak));PK.revealed=true;PK.chosen=cell;
  var v=$("verdict"),shotTxt=ok?"Right shot":"Guto would play "+SHOTS[PK.answer].name.toLowerCase()+", not "+SHOTS[PK.pickShot].name.toLowerCase(),
    sqTxt=sq==="right"?"right square":sq==="close"?"your square was one off. Guto aims "+cellName(ic).toLowerCase():"aim "+cellName(ic).toLowerCase()+" instead";
  v.className="verdict "+(ok&&sq==="right"?"ok":ok||sq!=="wrong"?"mid":"no");
  v.textContent=shotTxt+(ok&&sq==="right"?", right square.":", and "+sqTxt+".")+(ok&&sq==="right"?" Streak "+PK.streak+".":"");
  track("shot_picker_resolved",{side:PK.side,depth:PK.depth,speed:PK.speed,height:PK.height,picked:PK.pickShot,answer:PK.answer,correct:ok,square:sq});
  var pr=PRESETS[PK.preset],wb=$("r-watch");wb.hidden=!(pr&&pr.watch);if(pr&&pr.watch)wb.onclick=function(){save("id-shots",pr.watch);setTab("shots")};
  renderPick();$("reveal").scrollIntoView({behavior:RM?"auto":"smooth",block:"nearest"})}
function resetCall(){PK.revealed=false;PK.pickShot=null;var a=$("aim-step");if(a){a.hidden=true;[].forEach.call(document.querySelectorAll("#aim-grid button"),function(x){x.setAttribute("aria-pressed","false")})}
  if(state.tab==="pick")[].forEach.call($("list").children,function(x){x.setAttribute("aria-current","false")});var h=$("call-hint");if(h)h.textContent="Tap a shot in the row above, then pick where you'd aim it."}
function renderPickInputs(){buildCall();["side","depth","speed","height"].forEach(pkSeg)}
function renderPick(){var c=choose(),t=target(c.shot),mid=simple(c.shot),s=SHOTS[mid],D=DI[PK.depth];
  var youX=[6.4,3.6,1.0][D],youY=state.side==="L"?2.6:5.4,partner=state.side==="L"?"R":"L";
  var pos={A:oppPos(PK.A),B:oppPos(PK.B)};pos[state.side]=[youX,youY];pos[partner]=[D===0?5.4:3.8,state.side==="L"?5.4:2.6];
  ["A","B","L","R"].forEach(function(k){place(k,pos[k],false);PL[k].ring.setAttribute("opacity",k===state.side?1:0)});
  gM.innerHTML="";drawZones(state.zones,"R","opp");drawGrid();

  var cy=youY+(PK.side==="fh"?0.45:PK.side==="bh"?-0.45:0),cx=youX+0.3,src=pos.A[0]<=pos.B[0]?pos.A:pos.B;
  var endH={low:0.4,med:1.4,high:3.0}[PK.height],arc={fast:0.4,med:1.2,slow:2.2}[PK.speed];
  PROF._in={d:{fast:500,med:850,slow:1300}[PK.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  clearTimeout(pkTimer);
  var d1=runBall({f:src,to:[cx,cy],shot:"_in"},false);
  if(PK.revealed)pkTimer=setTimeout(function(){runBall({f:[cx,cy],to:t.p,shot:c.shot},true)},d1+450);
  $("call").hidden=PK.revealed;$("reveal").hidden=!PK.revealed;PK.answer=mid;PK.ideal=cellOf(t.p);
  if(PK.revealed){var cx0=[8,11,14],cw=[3,3,2],cy0=[0,2.67,5.33];
    el("rect",{x:X(cx0[PK.ideal[0]])+3,y:Y(cy0[PK.ideal[1]])+3,width:cw[PK.ideal[0]]*40-6,height:2.67*40-6,rx:6,fill:"#2ECC71","fill-opacity":.25,stroke:"#1E9E55","stroke-width":3,"pointer-events":"none"},gG);
    if(PK.chosen&&(PK.chosen[0]!==PK.ideal[0]||PK.chosen[1]!==PK.ideal[1]))el("rect",{x:X(cx0[PK.chosen[0]])+3,y:Y(cy0[PK.chosen[1]])+3,width:cw[PK.chosen[0]]*40-6,height:2.67*40-6,rx:6,fill:"none",stroke:"#0D1B2A","stroke-width":3,"stroke-dasharray":"6 5","pointer-events":"none"},gG)}
  $("r-shot").textContent=s.name;if(ICON[mid])document.documentElement.style.setProperty("--shotc",ICON[mid].c);$("r-open").dataset.shot=mid;$("r-why").textContent=c.why;
  $("r-target").textContent=t.txt;$("r-form").textContent=formationText();
  var b=SHOTS[BACK2[mid]];$("r-backup").textContent=b?b.name+". "+(BWHY[mid]||b.when):"";
  $("r-you").textContent=s.afterH;$("r-partner").textContent=s.afterP;
  $("pk-next").textContent="Drag A or B, or tap the court. Next tap moves "+PK.next+"."}
/* Drag the opponents onto the grid */
["A","B"].forEach(function(k){var g=PL[k].g,drag=false;g.setAttribute("data-k",k);
  function toM(e){var pt=SVGC.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(WORLD.getScreenCTM().inverse());return [(q.x-60)/40,(q.y-40)/40]}
  g.addEventListener("pointerdown",function(e){if(state.tab!=="pick")return;drag=true;g.setPointerCapture(e.pointerId);e.preventDefault()});
  g.addEventListener("pointermove",function(e){if(!drag)return;var m=toM(e);place(k,[Math.max(8.4,Math.min(15.8,m[0])),Math.max(0.2,Math.min(7.8,m[1]))],true)});
  g.addEventListener("pointerup",function(e){if(!drag)return;drag=false;var m=toM(e),d=m[0]<11?0:m[0]<14?1:2,l=m[1]<2.67?0:m[1]<5.33?1:2,o=k==="A"?"B":"A";
    if(!(PK[o][0]===d&&PK[o][1]===l)){PK[k]=[d,l];save("pk-opp",JSON.stringify({A:PK.A,B:PK.B}))}resetCall();renderPick()})});

/* ---------------- Compete: the Sand Series ---------------- */
function avatar(p){var hair={short:'<path d="M14 26c0-11 8-17 18-17s18 6 18 17c-4-6-10-8-18-8s-14 2-18 8z"/>',
    pony:'<path d="M14 27c0-12 8-18 18-18s18 6 18 18c-4-7-10-9-18-9s-14 2-18 9z"/><path d="M48 20c8 2 10 12 6 20-2-6-4-10-8-12z"/>',
    curly:'<circle cx="20" cy="20" r="7"/><circle cx="30" cy="14" r="8"/><circle cx="42" cy="17" r="8"/><circle cx="47" cy="27" r="6"/><circle cx="16" cy="29" r="5"/>',
    cap:'<path d="M13 26c0-10 8-16 19-16s19 6 19 16z"/><path d="M40 24h20v4H40z"/>',
    bun:'<circle cx="32" cy="8" r="7"/><path d="M14 27c0-12 8-18 18-18s18 6 18 18c-4-7-10-9-18-9s-14 2-18 9z"/>'}[p.hair]||"";
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="'+p.bg+'"/><path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill="'+p.shirt+'"/>'+
    '<circle cx="32" cy="30" r="15" fill="'+p.skin+'"/><g fill="'+p.hc+'">'+hair+'</g>'+(p.visor?'<path d="M15 23h34v5H15z" fill="'+p.visor+'"/>':'')+
    '<circle cx="26" cy="31" r="1.8" fill="#0D1B2A"/><circle cx="38" cy="31" r="1.8" fill="#0D1B2A"/><path d="M27 37q5 4 10 0" stroke="#0D1B2A" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>'}
var RIVALS=[
 {id:"baloes",pair:"Os Balões",from:"Rio de Janeiro",style:"Patient lobbers who push you back and wait for a short ball.",level:1,time:9,mod:0,
  p:[{n:"Duda",skin:"#C68A5E",hair:"pony",hc:"#2B1B12",shirt:"#FFD23F",bg:"#FFE9A8",visor:"#FF9F1C"},{n:"Leo",skin:"#8D5A3B",hair:"curly",hc:"#1A120D",shirt:"#2ECC71",bg:"#C9F2DA"}],
  gen:{height:[["high",5],["med",3],["low",1]],depth:[["back",3],["mid",4],["front",2]],speed:[["slow",4],["med",4],["fast",1]],opp:[[[2,0],[2,2]],[[1,0],[2,2]],[[2,1],[1,2]]]}},
 {id:"wall",pair:"The Wall",from:"Gold Coast",style:"Net blockers who get everything back. Beat them with height or the middle.",level:2,time:8,mod:.05,
  p:[{n:"Kiri",skin:"#B07850",hair:"bun",hc:"#3A2414",shirt:"#00C2B8",bg:"#BFEDEA"},{n:"Sam",skin:"#F1C7A1",hair:"cap",hc:"#0077B6",shirt:"#0077B6",bg:"#CFE6F5"}],
  gen:{height:[["low",4],["med",4],["high",1]],depth:[["mid",4],["front",3],["back",1]],speed:[["fast",4],["med",3],["slow",2]],opp:[[[0,0],[0,2]],[[0,0],[0,1]],[[0,1],[0,2]],[[0,0],[1,2]]]}},
 {id:"breeze",pair:"Breeze & Bolt",from:"Rimini",style:"A big server and a smasher who poaches the middle.",level:3,time:7,mod:.08,
  p:[{n:"Marco",skin:"#E3B08A",hair:"short",hc:"#4A2E1A",shirt:"#FF4D6D",bg:"#FFD1DA"},{n:"Inês",skin:"#D9A27A",hair:"pony",hc:"#1E1E1E",shirt:"#0D1B2A",bg:"#D6DCE4",visor:"#FF4D6D"}],
  gen:{height:[["med",4],["high",3],["low",3]],depth:[["mid",4],["front",3],["back",2]],speed:[["fast",4],["med",4],["slow",1]],opp:[[[0,1],[1,2]],[[0,0],[1,2]],[[1,0],[0,2]],[[0,0],[0,2]]]}},
 {id:"feather",pair:"Feather & Fox",from:"Florianópolis",style:"Drop-shot artists who pull you forward, then lob.",level:4,time:7,mod:.1,
  p:[{n:"Ana",skin:"#A86B45",hair:"curly",hc:"#2A160C",shirt:"#FF9F1C",bg:"#FFDDB3"},{n:"Teo",skin:"#E8BE98",hair:"short",hc:"#C77A2E",shirt:"#2ECC71",bg:"#CDEFD9"}],
  gen:{height:[["low",4],["med",4],["high",2]],depth:[["front",3],["mid",4],["back",2]],speed:[["slow",5],["med",3],["fast",1]],opp:[[[1,0],[2,2]],[[2,0],[2,2]],[[0,0],[2,2]],[[1,1],[2,0]]]}},
 {id:"champs",pair:"The Champions",from:"World No. 1",style:"The best pair on the tour. They mix every style and punish slow decisions.",level:5,time:6,mod:.14,
  p:[{n:"Rafa",skin:"#9C6644",hair:"cap",hc:"#FFD23F",shirt:"#0D1B2A",bg:"#FFE9A8"},{n:"Lia",skin:"#F0C9A6",hair:"bun",hc:"#1A1A1A",shirt:"#FFD23F",bg:"#0D1B2A"}],
  gen:{height:[["high",3],["med",4],["low",3]],depth:[["front",3],["mid",4],["back",3]],speed:[["fast",3],["med",4],["slow",3]],opp:[[[0,0],[0,2]],[[2,0],[2,2]],[[0,0],[2,2]],[[1,0],[1,2]],[[0,1],[2,2]]]}}];
var MOVES=[["in","Step in"],["hold","Hold level"],["back","Move back"]],MOVE_OK={push:"in",flatsmash:"in",lob:"in",drop:"in",neutral:"hold",dig:"hold"};
var MATCH=null,cTimer=null,cTick=null,WIN_AT=7;
function wpick(a){var t=0;a.forEach(function(x){t+=x[1]});var r=Math.random()*t;for(var i=0;i<a.length;i++){r-=a[i][1];if(r<=0)return a[i][0]}return a[0][0]}
function beaten(){try{return JSON.parse(load("sand-beaten","{}"))||{}}catch(e){return {}}}
function pairSvg(r){return '<span class="av-pair">'+avatar(r.p[0])+avatar(r.p[1])+'</span>'}
function renderLobby(list){var w=document.createElement("div");w.className="rivals";var bt=beaten();
  RIVALS.forEach(function(r,i){var locked=i>0&&!bt[RIVALS[i-1].id]&&!bt[r.id],b=document.createElement("button");b.className="rival";b.disabled=locked;
    b.innerHTML=pairSvg(r)+'<b>'+r.pair+'</b><small>'+r.p[0].n+' and '+r.p[1].n+' · '+r.from+'</small><small>'+r.style+'</small><span class="meta"><span class="lvl">'+"●●●●●".slice(0,r.level)+"○○○○○".slice(0,5-r.level)+'</span><span>'+(bt[r.id]?"Beaten "+bt[r.id]:locked?"Beat "+RIVALS[i-1].pair+" to unlock":r.time+" s to decide")+'</span></span>';
    b.onclick=function(){startMatch(r)};w.appendChild(b)});list.appendChild(w)}
function lobbyPanel(){var c=$("cpanel");c.innerHTML='<span class="kicker">Sand Series</span><h3>Play the best pairs</h3><p class="say">Each point, read the ball, then pick your shot, where to aim and where to move before the clock runs out. First to '+WIN_AT+' points, win by 2.</p><p class="say">Beat a pair to unlock the next one.</p>';
  ["A","B","L","R"].forEach(function(k){place(k,{A:[12.5,2.7],B:[12.5,5.3],L:[4.5,2.7],R:[4.5,5.3]}[k],true)});runBall(null)}
function startMatch(r){MATCH={r:r,me:0,them:0,log:[],right:0,points:0,cur:null};$("selector").hidden=true;$("score").hidden=false;track("match_started",{rival:r.id});
  document.querySelector(".court-card").scrollIntoView({behavior:RM?"auto":"smooth",block:"start"});newPoint()}
function leaveMatch(){clearTimeout(cTimer);clearInterval(cTick);MATCH=null;$("score").hidden=true;$("selector").hidden=false}
function renderScore(){var m=MATCH,r=m.r;$("score").innerHTML='<div class="team"><span class="av-pair">'+avatar({skin:"#E0B48C",hair:"short",hc:"#3A2414",shirt:"#00C2B8",bg:"#BFEDEA",visor:"#FFD23F"})+avatar({skin:"#B07850",hair:"pony",hc:"#1A120D",shirt:"#00C2B8",bg:"#E2F6F4"})+'</span><span class="names"><b>You</b><small>and your partner</small></span></div>'+
  '<div class="pts"><span>'+m.me+'</span><i>–</i><span>'+m.them+'</span></div>'+
  '<div class="team them"><span class="names"><b>'+r.pair+'</b><small>'+r.p[0].n+' and '+r.p[1].n+'</small></span>'+pairSvg(r)+'</div>'+
  '<div class="log">'+m.log.map(function(x){return '<span class="'+x+'"></span>'}).join("")+'</div>'}
function solveSit(sit){var keep={side:PK.side,depth:PK.depth,speed:PK.speed,height:PK.height,A:PK.A,B:PK.B};PK.side=sit.side;PK.depth=sit.depth;PK.speed=sit.speed;PK.height=sit.height;PK.A=sit.A;PK.B=sit.B;
  var c=choose(),t=target(c.shot);for(var k in keep)PK[k]=keep[k];return {shot:simple(c.shot),raw:c.shot,why:c.why,p:t.p,cell:cellOf(t.p),txt:t.txt}}
function newPoint(){var m=MATCH,g=m.r.gen,o=g.opp[Math.floor(Math.random()*g.opp.length)];if(Math.random()<.5)o=[o[1],o[0]];
  var sit={side:wpick([["fh",4],["body",2],["bh",3]]),depth:wpick(g.depth),speed:wpick(g.speed),height:wpick(g.height),A:o[0].slice(),B:o[1].slice()};
  m.cur={sit:sit,ans:solveSit(sit),pick:{},t0:0};renderScore();drawPoint();decidePanel()}
function sitPos(sit){var D=DI[sit.depth],youX=[6.4,3.6,1.0][D],youY=state.side==="L"?2.6:5.4,partner=state.side==="L"?"R":"L",pos={A:oppPos(sit.A),B:oppPos(sit.B)};
  pos[state.side]=[youX,youY];pos[partner]=[D===0?5.4:3.8,state.side==="L"?5.4:2.6];var cy=youY+(sit.side==="fh"?0.45:sit.side==="bh"?-0.45:0);return {pos:pos,contact:[youX+0.3,cy]}}
function drawPoint(){var m=MATCH,sit=m.cur.sit,sp=sitPos(sit);gG.innerHTML="";gM.innerHTML="";drawZones(false);
  ["A","B","L","R"].forEach(function(k){place(k,sp.pos[k],true)});
  var endH={low:0.4,med:1.4,high:3.0}[sit.height],arc={fast:0.4,med:1.2,slow:2.2}[sit.speed],src=sp.pos.A[0]<=sp.pos.B[0]?sp.pos.A:sp.pos.B;
  PROF._in={d:{fast:500,med:850,slow:1300}[sit.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};runBall({f:src,to:sp.contact,shot:"_in"},false)}
function describe(sit){return {low:"Low",med:"Net height",high:"High"}[sit.height]+", "+{fast:"fast",med:"medium pace",slow:"slow"}[sit.speed]+", on your "+{fh:"forehand",body:"body",bh:"backhand"}[sit.side]+". You're "+{front:"inside 3 m",mid:"3 to 6 m back",back:"deep"}[sit.depth]+"."}
function decidePanel(){var m=MATCH,c=$("cpanel"),cur=m.cur;
  c.innerHTML='<span class="kicker">Point '+(m.points+1)+'</span><h3>'+describe(cur.sit)+'</h3><div class="timer"><i id="tbar"></i></div>'+
   '<div class="grp"><b>Your shot</b><div class="shots" id="cs-shots"></div></div><div class="grp"><b>Aim</b><div class="aim-grid" id="cs-aim"></div></div><div class="grp"><b>Then move</b><div class="moves" id="cs-moves"></div></div>';
  var sh=$("cs-shots");VISIBLE.filter(function(v){return v!=="serve"}).forEach(function(id){var b=document.createElement("button");b.innerHTML='<i style="background:'+ICON[id].c+'"></i>'+SHOTS[id].name;b.setAttribute("aria-pressed","false");
    b.onclick=function(){cur.pick.shot=id;[].forEach.call(sh.children,function(x){x.setAttribute("aria-pressed",String(x===b))});maybeResolve()};sh.appendChild(b)});
  var g=$("cs-aim");g.appendChild(document.createElement("span"));LAN.forEach(function(n){var h=document.createElement("span");h.className="ax";h.textContent=n;g.appendChild(h)});
  [2,1,0].forEach(function(dI){var lab=document.createElement("span");lab.className="ay";lab.textContent=DEP[dI];g.appendChild(lab);
    [0,1,2].forEach(function(lI){var b=document.createElement("button");b.setAttribute("aria-label","Aim "+cellName([dI,lI]));b.setAttribute("aria-pressed","false");
      b.onclick=function(){cur.pick.cell=[dI,lI];[].forEach.call(g.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",String(x===b))});maybeResolve()};g.appendChild(b)})});
  var mv=$("cs-moves");MOVES.forEach(function(x){var b=document.createElement("button");b.textContent=x[1];b.setAttribute("aria-pressed","false");
    b.onclick=function(){cur.pick.move=x[0];[].forEach.call(mv.children,function(y){y.setAttribute("aria-pressed",String(y===b))});maybeResolve()};mv.appendChild(b)});
  var secs=m.r.time,bar=$("tbar");bar.style.transitionDuration="0ms";bar.style.transform="scaleX(1)";bar.getBoundingClientRect();
  setTimeout(function(){bar.style.transitionDuration=secs+"s";bar.style.transform="scaleX(0)"},450);
  clearTimeout(cTimer);cTimer=setTimeout(function(){resolvePoint(true)},secs*1000+450)}
function maybeResolve(){var p=MATCH.cur.pick;if(p.shot&&p.cell&&p.move){clearTimeout(cTimer);setTimeout(function(){resolvePoint(false)},250)}}
function resolvePoint(late){var m=MATCH;if(!m||!m.cur||m.cur.done)return;var cur=m.cur,a=cur.ans,p=cur.pick;cur.done=true;clearTimeout(cTimer);
  var shotOk=p.shot===a.shot,off=p.cell?Math.abs(p.cell[0]-a.cell[0])+Math.abs(p.cell[1]-a.cell[1]):9,sq=off===0?"right":off===1?"close":"wrong",
    moveOk=p.move&&p.move===MOVE_OK[a.shot],prob=late?0:(shotOk?(sq==="right"?.55:sq==="close"?.45:.3)+(moveOk?.32:.08):.12+(moveOk?.05:0))-m.r.mod,
    won=Math.random()<Math.max(.03,Math.min(.93,prob));
  if(shotOk&&sq==="right"&&moveOk)m.right++;m.points++;if(won)m.me++;else m.them++;m.log.push(won?"w":"l");
  track("point_played",{rival:m.r.id,picked:p.shot||null,answer:a.shot,square:sq,move:p.move||null,late:late,won:won});
  var sp=sitPos(cur.sit),dest=p.cell?[[9.5,12.5,15][p.cell[0]],[1.33,4,6.67][p.cell[1]]]:[12,4],dx={in:1.3,hold:0,back:-1}[p.move||"hold"];
  if(!late)runBall({f:sp.contact,to:dest,shot:p.shot==="flatsmash"?"flatsmash":p.shot||"neutral",land:true},true);
  var mvPos=merge(sp.pos,null);mvPos.L=[sp.pos.L[0]+dx,sp.pos.L[1]];mvPos.R=[sp.pos.R[0]+dx,sp.pos.R[1]];
  ["L","R"].forEach(function(k){PL[k].g.style.transitionDuration="900ms";place(k,mvPos[k],false)});
  var parts=[];parts.push(late?"Too slow. The clock ran out.":shotOk?"Right shot.":"The shot was "+SHOTS[a.shot].name.toLowerCase()+". "+a.why);
  if(!late){parts.push(sq==="right"?"Perfect aim.":"Best aim was "+cellName(a.cell).toLowerCase()+".");parts.push(moveOk?"Good movement.":"After a "+SHOTS[a.shot].name.toLowerCase()+", "+(MOVE_OK[a.shot]==="in"?"step in together.":"hold level and get ready."))}
  var c=$("cpanel");c.innerHTML='<span class="kicker">Point '+m.points+'</span><div class="ptres '+(won?"w":"l")+'"><b>'+(won?"Point to you. ":"Point to "+m.r.pair+". ")+'</b>'+parts.join(" ")+'</div>';
  renderScore();
  var over=(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2;
  setTimeout(function(){if(!MATCH)return;if(over)endMatch();else newPoint()},late?2200:3400)}
function endMatch(){var m=MATCH,won=m.me>m.them,bt=beaten();if(won&&!bt[m.r.id]){bt[m.r.id]=m.me+"–"+m.them;save("sand-beaten",JSON.stringify(bt))}
  track("match_completed",{rival:m.r.id,me:m.me,them:m.them,won:won,perfect_decisions:m.right,points:m.points});
  var idx=RIVALS.indexOf(m.r),nx=RIVALS[idx+1],c=$("cpanel");
  c.innerHTML='<div class="endcard"><span class="kicker">Match over</span><span class="big">'+(won?"You win":"They win")+' '+m.me+'–'+m.them+'</span><p class="say">'+m.right+' of '+m.points+' points had the right shot, aim and movement.'+(won?(nx?" "+nx.pair+" is unlocked.":" You beat the world's best pair."):" Look at the points you lost, then try again.")+'</p>'+
   '<button class="btn primary" id="c-again">Rematch</button>'+(won&&nx?'<button class="btn" id="c-next">Play '+nx.pair+'</button>':'')+'<button class="btn soft" id="c-lobby">All opponents</button></div>';
  $("c-again").onclick=function(){startMatch(m.r)};if($("c-next"))$("c-next").onclick=function(){startMatch(nx)};$("c-lobby").onclick=function(){leaveMatch();renderList();lobbyPanel()};
  MATCH.cur=null}
state.wind=load("wind","calm");
[].forEach.call($("seg-wind").children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state.wind));
  b.onclick=function(){track("setting_changed",{setting:"wind",from:state.wind,to:b.dataset.v,tab:state.tab,lesson:state.id});state.wind=b.dataset.v;save("wind",state.wind);var wt=$("windtip");wt.hidden=state.wind==="calm";wt.textContent=windTip();
    [].forEach.call($("seg-wind").children,function(x){x.setAttribute("aria-pressed",String(x===b))});drawWind();if(state.tab==="pick")renderPick();else if(state.tab==="shots")renderStep()}});
state.windA=+load("wind-a","90");
(function(){var d=$("wdial"),drag=false;
  function setA(a){a=((Math.round(a/45)*45)%360+360)%360;if(a===state.windA)return;state.windA=a;save("wind-a",String(a));if(state.wind==="calm"){state.wind="breezy";save("wind","breezy");[].forEach.call($("seg-wind").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.v==="breezy"))})}
    drawWind();if(state.tab==="pick")renderPick();else if(state.tab==="shots"){var wt=$("windtip");wt.hidden=false;wt.textContent=windTip()}}
  function fromEv(e){var r=d.getBoundingClientRect(),a=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/PI;return PORT?a+90:a}
  d.addEventListener("pointerdown",function(e){drag=true;d.setPointerCapture(e.pointerId);setA(fromEv(e))});
  d.addEventListener("pointermove",function(e){if(drag)setA(fromEv(e))});
  d.addEventListener("pointerup",function(){if(drag){drag=false;track("setting_changed",{setting:"wind_direction",to:state.windA,tab:state.tab,lesson:state.id})}});
  d.addEventListener("keydown",function(e){var s=e.key==="ArrowRight"||e.key==="ArrowUp"?45:e.key==="ArrowLeft"||e.key==="ArrowDown"?-45:0;if(s){e.preventDefault();setA(state.windA+s)}})})();
drawWind();
/* Analytics: session start */
(function(){var last=+load("last-visit","0"),now=Date.now();track("session_start",{returning:!!last,days_since_last:last?Math.round((now-last)/864e5):null});save("last-visit",String(now))})();
/* Deep links: #/shots/lob/2, #/play/lobcover/1, #/pick */
var HASH0=location.hash||"",hp=HASH0.replace(/^#\/?/,"").split("/"),startStep=0;
if(hp[0]==="shots"&&VISIBLE.indexOf(hp[1])>=0){state.tab="shots";save("id-shots",hp[1]);startStep=(+hp[2]||1)-1}
else if((hp[0]==="play"||hp[0]==="shots")&&SCENES[hp[1]]){state.tab="shots";save("id-shots",hp[1]);startStep=(+hp[2]||1)-1}
else if(hp[0]==="pick"||hp[0]==="train")state.tab="pick";
else if(hp[0]==="compete")state.tab="compete";
setTab(["pick","compete"].indexOf(state.tab)>=0?state.tab:"shots");orient();
if(startStep>0&&state.tab==="shots"&&startStep<scene.steps.length){state.step=startStep;["A","B","L","R"].forEach(function(k){place(k,posAt(startStep)[k],true)});renderStep()}
/* First visit welcome */
if(!load("welcomed","")&&!HASH0){var wv={side:"L",rules:"open"};$("welcome").hidden=false;
  ["side","rules"].forEach(function(k){[].forEach.call($("w-"+k).children,function(b){b.onclick=function(){wv[k]=b.dataset.v;[].forEach.call($("w-"+k).children,function(x){x.setAttribute("aria-pressed",String(x===b))})}})});
  var closeW=function(skip){save("welcomed","1");$("welcome").hidden=true;
    if(!skip){state.side=wv.side;state.rules=wv.rules;save("side",wv.side);save("rules",wv.rules);seg("seg-side","side");seg("seg-rules","rules");setSum();save("id-shots","guide");setTab("shots")}
    track("onboarding_completed",{side:wv.side,rules:wv.rules,skipped:!!skip,lang:navigator.language})};
  $("w-go").onclick=function(){closeW(false)};$("w-skip").onclick=function(){closeW(true)}}
