
var SB_URL="https://xteycbuidxjndouuhjcw.supabase.co",SB_KEY="sb_publishable_qBMaKhNFY4md60Q--koQog_wDns3IKe",NETS={sb:null,user:null,prof:null,err:"",room:null,poll:0};
var AUTH_HASH=/access_token=|error_description=/.test(location.hash)?location.hash.replace(/^#/,""):"";if(AUTH_HASH){try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}

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
  neutral:{d:1200,h:function(k){return 2.3*S(PI*k)}},
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
  what:"A medium height, medium pace ball hit deep. Not high and not fast. It buys time and resets the rally.",
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
hook:{name:"Hook",cat:"Attack",hitter:"L",
  start:{L:[3.2,1.6],R:[4.4,5.2],A:[10,2.7],B:[10,5.4]},
  to:[13.4,3.9],mark:true, react:{A:[11.6,2.9],B:[11.6,5.1]}, after:{L:[4.4,2.7],R:[4.5,5.3]},
  what:"An overhead on your backhand side. Reach up and over your head and hit it with your forehand face, so nobody gets a free lob over that shoulder. Brazilians call it the gancho.",
  tech:["Turn so your backhand shoulder faces the net","Reach the racket up and over your head","Meet the ball high, just above your head","Snap your wrist over the ball so it comes down","Balanced, hit it down. Stretched, send it deep"],
  techAfter:"Aim down the middle or at a body. If you're stretched, play it high and deep instead.",
  when:"A high ball goes over your backhand shoulder and there's no time to run around it.",
  aim:"Down the middle or at a body if you're balanced, deep into the middle if you're stretched.",
  avoid:"Forcing it while falling backwards, or going for big angles.",
  hitDo:"Up and over your head, snap the wrist over it, down the middle.",
  partnerDo:"Hold the middle. Don't drift across to cover your partner.",
  afterH:"Recover forward to just behind your 3 m line.",
  afterP:"Stay level with your partner, middle covered."},
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
  aim:["Deep, to a backhand","Medium height and medium pace","Against two right-handers, the outside of B or the middle side of A"],
  avoid:["Hitting it high, which gives them a smash","Hitting it fast, then it's not a neutral ball","Playing it when the ball is high near the net and you could attack"]},
 lob:{when:["The opponents are close to the net","You need time to recover"],
  aim:["Always deep","Over the left shoulder of the net player (a right-hander's backhand)"],
  avoid:["Short or flat lobs, because they get smashed","Lobbing straight off a hard smash, so block it instead"]},
 drop:{when:["The player you drop to is mid-court or deep","Often after your lob has pushed them back","They're off balance or tired"],
  aim:["Short, just over the net","Straight, in front of the deeper player"],
  avoid:["Dropping to a player at their 3 m line or closer","Cross-court drops, because they open the line on your partner"]},
 hook:{when:["A high ball goes over your backhand shoulder","There's no time to run around it onto your forehand"],
  aim:["Down the middle or at a body when you're balanced","Deep into the middle when you're stretched"],
  avoid:["Forcing it while falling backwards","Big angles, keep it simple"]},
 dig:{when:["An opponent pushes or smashes hard at your feet or body"],
  aim:["Long over them, deep","Or straight down the line at medium height","Either way, no easy smash for them"],
  avoid:["Blocking short, which is only for very advanced players","Popping it up mid-court","Trying to lob a hard smash"]}};
var PATTERNS=[];
/* Level content. Intermediate uses the base tips. Other levels replace a list, or add to it. */
var LV={
 serve:{beginner:{f:"Get every serve in. Use zones 2 and 3, a smooth steady swing and a little spin for safety.",
    when:["Every point you serve","Agree the zone with your partner, even if it's always 3"],aim:["Zone 3 down the middle, the safest target","Zone 2 at the receiver's body","Aim a metre inside the lines"],avoid:["Hitting it hard and flat, as there's no second serve","Trying 1 or 5 before 2 and 3 land every time"]},
  intermediate:{f:"Mix zones 2 and 3 with the odd 1, 4 or 5, and always signal your partner."},
  advanced:{f:"Serve with a plan. Mix zone, spin and pace, and serve to set up your partner's first ball.",add:{aim:["Serve at the weaker returner and have your partner shade to the likely return"],avoid:["Becoming predictable on big points"]}},
  pro:{f:"Every serve starts a pattern. Disguise the zone, change pace on big points and move in together.",add:{aim:["Same toss and shape for every zone so 1 and 5 look like 3","Serve the returner who stands deeper so your team wins the net"],avoid:["The same zone twice in a row on big points"]}}},
 push:{beginner:{f:"Only push a ball at chest height or higher. Short swing, hit through it, aim down the middle.",
    when:["The ball is at chest height or higher","You're close to the net"],aim:["Down the middle between them","At their body"],avoid:["Pushing a low ball, as it goes up","A big backswing, keep it short"]},
  intermediate:{f:"Push any ball at or above net height, at a backhand, a body or the middle."},
  advanced:{f:"Push with intent. Go at the racket-side hip, the feet or the seam, and change the pace.",add:{aim:["The racket-side hip, the hardest ball to block","A slower push into the feet, which is hard to lift"],avoid:["Pushing every ball. Lob them when they crowd the net"]}},
  pro:{f:"Use the push to move them. Wrong-foot the blocker, then finish the next ball with your partner.",add:{aim:["Behind a player who moves early","Short at the feet when they're both at the net"]}}},
 flatsmash:{beginner:{f:"Get side on and point at the ball. Hit it down the middle at three quarter pace. Placement beats power.",
    when:["The ball is high and you can get under it","You're balanced"],aim:["Down the middle","Into the space between them"],avoid:["Swinging as hard as you can","Smashing from the back of the court, play it deep instead"]},
  intermediate:{f:"Flat and hard inside 3 m, more brush from further back. Down the middle or at a body."},
  advanced:{f:"Choose the smash for the moment. Flat inside 3 m, brush from deeper, and hit the side that leaves them weakest.",add:{aim:["Middle, then wide at the feet, to stretch them","A brush smash for angle when the ball drops behind you"]}},
  pro:{f:"Smash to set up the next ball. Disguise flat and brush, and target the weaker blocker.",add:{aim:["Behind a player who's moving","A slower angled smash, often harder to block than a flat one"],avoid:["Going for the line when the middle wins"]}}},
 hook:{beginner:{f:"If the ball goes over your backhand shoulder, reach up and send it back high and deep. Power comes later.",
    when:["A high ball goes over your backhand shoulder"],aim:["High and deep down the middle"],avoid:["Trying to hit it hard","Letting it go and hoping your partner gets it"]},
  intermediate:{f:"Reach up and over, snap the wrist, and keep it deep through the middle."},
  advanced:{f:"Snap the wrist over the ball so it comes down. Hit down when balanced, deep when stretched.",add:{aim:["At the feet of the net player when you're balanced"]}},
  pro:{f:"Make the hook a weapon so nobody lobs your backhand side. Hit it down hard or angle it short.",add:{aim:["Short cross-court angle when they're deep","Through the middle with pace"]}}},
 neutral:{beginner:{f:"When in doubt, play a neutral ball deep down the middle, at medium height and medium pace. It's the safest ball in beach tennis.",
    aim:["Deep down the middle, at medium height"],avoid:["Hitting it short","Hitting it high, which gives them an easy smash","Hitting it fast, then it's not neutral"]},
  intermediate:{f:"Deep to a backhand, high enough that they can't attack it."},
  advanced:{f:"Make the neutral ball awkward. Deep into the backhand corner at medium height and pace, so they can't attack it.",add:{aim:["Into the backhand corner to push them back"]}},
  pro:{f:"Neutral but never passive. Vary depth and direction to pull them out of position, then attack the next ball.",add:{aim:["A lower, quicker neutral ball to rush a player leaning back"]}}},
 lob:{beginner:{f:"Lob high and deep. Short lobs get smashed, so aim for the back of the court.",aim:["High and deep down the middle"]},
  intermediate:{f:"Deep over the left shoulder of the net player, then move in as they turn."},
  advanced:{f:"Lob the player closest to the net, over the backhand shoulder, and step in as they turn.",add:{aim:["Over whoever is closest to the net"]}},
  pro:{f:"Disguise the lob as a drop or a push, and lob with the wind behind you, not into it.",add:{aim:["Lower, quicker lobs over a player leaning forward"],avoid:["Lobbing into a strong headwind"]}}},
 drop:{beginner:{f:"The drop is an advanced shot. Learn it, but only play it when the player you drop to is deep.",
    when:["The player you drop to is deep, at the back of the court"],aim:["Short and straight"],avoid:["Dropping to anyone near the net","Making it your main shot"]},
  intermediate:{f:"Drop to the deeper player, straight, after your lob has pushed them back."},
  advanced:{f:"Set it up with a deep lob, drop straight to the deeper player, then follow in.",add:{aim:["Straight to the deeper player while their partner is at the net"]}},
  pro:{f:"Disguise it. Same shape as your lob or push, and drop where their partner can't help.",add:{aim:["Wide of the deeper player so they stretch forward"]}}},
 dig:{beginner:{f:"Racket up in front, firm wrist, no swing. Just block it back long.",aim:["Long and deep over them"],avoid:["Swinging at it","Blocking short"]},
  intermediate:{f:"Block it long over them, or straight at medium height. No easy smash."},
  advanced:{f:"Direct your block. Long over them, or straight at medium height, so there's no easy smash.",add:{aim:["Back through the middle to cause doubt"]}},
  pro:{f:"Block to start the counter. Take pace off, change direction, and only block short when they're both deep.",add:{aim:["A short block, only when both opponents are deep"]}}}};
function lvTips(id){var base=TIPS[id]||{when:[SHOTS[id].when],aim:[SHOTS[id].aim],avoid:[SHOTS[id].avoid]},l=(LV[id]||{})[state.level]||{},o={};
  ["when","aim","avoid","wind"].forEach(function(k){o[k]=l[k]||base[k];if(l.add&&l.add[k])o[k]=(o[k]||[]).concat(l.add[k])});return o}
var VISIBLE=["serve","push","flatsmash","hook","neutral","lob","drop","dig"];
var ICON={
  serve:{c:"#FFD23F",f:"#0D1B2A",d:'<circle cx="7" cy="6" r="3"/><path d="M7 20V12M7 12l9-6M13 6h3v3"/>'},
  push:{c:"#FF4D6D",f:"#FFFFFF",d:'<path d="M3 12h16M14 7l5 5-5 5"/>'},
  flatsmash:{c:"#FF9F1C",f:"#FFFFFF",d:'<path d="M14 2L5 13h6l-2 9 10-12h-6z"/>'},
  neutral:{c:"#00C2B8",f:"#FFFFFF",d:'<path d="M3 18Q12 4 21 18"/><circle cx="21" cy="18" r="1.6"/>'},
  lob:{c:"#0077B6",f:"#FFFFFF",d:'<path d="M3 21Q12 -6 21 21"/><circle cx="21" cy="21" r="1.6"/>'},
  drop:{c:"#2ECC71",f:"#FFFFFF",d:'<path d="M3 15Q8 4 13 17"/><path d="M17 4v16" stroke-dasharray="2 2.5"/><circle cx="13" cy="18" r="1.6"/>'},
  dig:{c:"#0D1B2A",f:"#FFFFFF",d:'<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/>'},
  hook:{c:"#C21D44",f:"#FFFFFF",d:'<path d="M19 21V11a7 7 0 0 0-14 0"/><path d="M2 8l3 3 3-3"/>'}};
var BWHY={push:"If the ball drops below net height before you reach it, block it long instead.",flatsmash:"If you're off balance or too deep to attack, play a deep neutral ball instead.",
  neutral:"If they've both crept in close to the net, lob over them instead.",lob:"If they're already deep, play a deep neutral ball instead.",
  drop:"If the player you'd drop to steps in, lob over them instead.",hook:"If you're falling back or stretched, send it high and deep as a neutral ball.",dig:"If you have time and the ball sits up, play a deep neutral ball instead."};
var SIMPLE={brush:"flatsmash",bhsmash:"hook",recoverysmash:"flatsmash",rainbow:"lob",highlob:"lob",fakelob:"drop",fakedrop:"lob"};
var BACK2={hook:"neutral",push:"dig",flatsmash:"neutral",neutral:"lob",lob:"neutral",drop:"lob",dig:"neutral",serve:"serve"};
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
  {t:"Set up",zones:true,say:"Server behind the baseline. In men's open and ITF events the partner waits behind the 6 m line until the serve is struck. In women's and mixed play it's the 3 m line. The receivers start just behind their 3 m line.",
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
var EMOJIS=["a01","a02","a03","a04","a05","a06","a07","a08","a09","a10","a11","a12"];
var OPP_E=["a03","a07","a05","a09","a04","a12"];
var AVN={a01:"Wavy brown hair",a02:"Curly hair and beard",a03:"Blond with a backwards cap",a04:"White headband",a05:"Navy cap and beard",a06:"Brown ponytail",a07:"Blonde bun",a08:"Dark ponytail, green lenses",a09:"Black ponytail",a10:"Curly updo",a11:"Short curly hair",a12:"Peach cap"};
function avSrc(id){return "avatars/"+id+".webp"}function avImg(id,cls){return '<img class="'+(cls||"avi")+'" src="'+avSrc(id)+'" alt="" width="64" height="64" decoding="async">'}
var LEVELS=[["beginner","Beginner"],["intermediate","Intermediate"],["advanced","Advanced"],["pro","Pro"]],LVN={beginner:"Beginner",intermediate:"Intermediate",advanced:"Advanced",pro:"Pro"};
var LVHINT={beginner:"Simple targets and the basics of each shot.",intermediate:"The full shot with tactics for club and social play.",advanced:"Angles, disguise and patterns with your partner.",pro:"Tour-level detail. Every ball sets up the next."};
(function(){var ok=function(e){return EMOJIS.indexOf(e)>=0};try{["emoji","mate"].forEach(function(k){var v=localStorage.getItem("btp-"+k);if(v&&!ok(v))localStorage.removeItem("btp-"+k)})}catch(e){}})();
if(load("swiped","")==="1")document.body.classList.add("swiped");
var state={hand:load("hand","R"),level:load("level","beginner"),emoji:load("emoji","a01"),mate:load("mate","a06"),name:load("name",""),tab:load("tab","shots"),side:load("side","L"),rules:load("rules","open"),zones:load("zones","0")==="1",id:null,step:0,playing:false,branch:null};
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
var s1=el("text",{x:X(0.2),y:Y(0.45),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s1.textContent="";
var s2=el("text",{x:X(0.2),y:Y(7.75),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s2.textContent="";

function drawZones(show,side,half,hl){gZ.innerHTML="";if(!show)return;var own=half==="own";
  for(var b=0;b<5;b++){var y0=b*1.6,n=side==="L"?b+1:5-b,on=hl===n;
    el("rect",{x:X(own?0:8),y:Y(y0),width:320,height:64,fill:on?"#FFD23F":C.opp,"fill-opacity":on?0.55:(b%2?0.2:0)},gZ);
    if(on)el("rect",{x:X(own?0:8)+2,y:Y(y0)+2,width:316,height:60,fill:"none",stroke:"#FF9F1C","stroke-width":3,rx:3},gZ);var t=el("text",{x:X(own?7.3:15.4),y:Y(y0+0.8)+7,"text-anchor":"middle",fill:"#C21D44",style:"font:800 20px Montserrat,sans-serif"},gZ);t.textContent=n;orientText(t)}}

/* Portrait court on phones: rotate the world, keep text upright */
var PORT=false,WORLD=document.getElementById("world"),SVGC=document.getElementById("court");
var UP=[];function upright(t){UP.push(t);orientText(t)}
function orientText(t){if(PORT){var x=+t.getAttribute("x")||0,y=+t.getAttribute("y")||0;t.setAttribute("transform","rotate(90 "+x+" "+y+")")}else t.removeAttribute("transform")}
[].forEach.call(document.querySelectorAll("#g-lines text"),upright);
/* Players */
var PL={},EFONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
["A","B","L","R"].forEach(function(id){var g=el("g",{"class":"pl"},gP);
  var ring=el("g",{},g),c=el("g",{},g);el("circle",{r:24,fill:"transparent"},c);
  var rk=el("g",{"class":"rk",style:"display:none"},g);el("line",{x1:-12,y1:0,x2:0,y2:0,stroke:"#0D1B2A","stroke-width":3.5,"stroke-linecap":"round"},rk);el("ellipse",{cx:8,cy:0,rx:10,ry:8,fill:"#0077B6",stroke:"#FFFFFF","stroke-width":1.5},rk);
  var t=el("g",{},g),ti=el("image",{x:-17,y:-17,width:34,height:34,style:"filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))"},t);t.img=ti;upright(t);
  PL[id]={g:g,ring:ring,c:c,t:t,rk:rk}});
function rAv(r,i){var e=r.p[i].e,o=r.p[1-i].e;if(e!==state.emoji&&e!==state.mate)return e;return OPP_E.filter(function(x){return x!==state.emoji&&x!==state.mate&&x!==o})[i]}
function oppEmoji(id){var r=state.tab==="compete"&&MATCH?MATCH.r:null;if(r)return rAv(r,id==="A"?0:1);
  var pool=OPP_E.filter(function(e){return e!==state.emoji&&e!==state.mate});return pool[id==="A"?0:1]}
function emo(id){if(id==="A"||id==="B")return oppEmoji(id);return id===state.side?state.emoji:state.mate}
function orient(){var w=document.querySelector(".court-card").getBoundingClientRect().width,p=true;if(p===PORT&&SVGC.dataset.o)return;PORT=p;SVGC.dataset.o="1";
  SVGC.setAttribute("viewBox",PORT?"0 0 420 760":"0 0 760 400");WORLD.setAttribute("transform",PORT?"translate(10 760) rotate(-90)":"");
  document.body.classList.toggle("port",PORT);UP.forEach(orientText);drawDial();
  s2.setAttribute("text-anchor",PORT?"end":"start");s2.setAttribute("x",PORT?X(0.2):X(0.2));
  [].forEach.call(document.querySelectorAll(".side-lbl"),function(e){e.style.display=PORT?"none":""});
  courtScale();if(state.tab==="compete"){if(MATCH&&MATCH.cur)drawPoint()}else if(scene&&state.tab!=="pick"){["A","B","L","R"].forEach(function(k){place(k,posAt(state.step)[k],true)});renderStep()}else if(state.tab==="pick")renderPick()}
var ME="#00C2B8";
var PS=1;function courtScale(){PS=PORT?1.3:1}
var rsT;window.addEventListener("resize",function(){clearTimeout(rsT);rsT=setTimeout(orient,150)});
/* Action poses. One sprite per avatar and shot, shown on whoever is hitting */
var POSE={},POSE_AV={a01:"a01",a02:"a02",a03:"a03",a04:"a04",a05:"a05",a06:"a06",a07:"a06",a08:"a08",a09:"a08",a10:"a08",a11:"a11",a12:"a12"};
var POSE_MAP={serve:"serve",push:"push",inPush:"push",inLow:"push",flatsmash:"smash",brush:"smash",bhsmash:"hook",recoverysmash:"smash",hook:"hook",
  neutral:"neutral",inMid:"neutral",inFloat:"neutral",inPop:"neutral",lob:"lob",highlob:"lob",rainbow:"lob",fakedrop:"lob",inLob:"lob",drop:"drop",fakelob:"drop",inDrop:"drop",dig:"defsmash",
  smash:"smash",ready:"ready",smashsetup:"smashsetup",defsmash:"defsmash",dive:"dive",bhneutral:"bhneutral",block:"defsmash"};
/* Full-body sprites from the avatar atlas: 12 poses, front and back. Your side of the court shows backs, theirs fronts; a player chasing a lob over them turns round */
var FLIP={};
function updImg(id){var im=PL[id].t.img,ps=POSE[id]||"ready",ours=id==="L"||id==="R",view=(ours!==!!FLIP[id])?"back":"front",
    src=(window.SPRDIR||"sprites/")+emo(id)+"/"+ps+"-"+view+".webp",w=62,hh=86;
  if(im.getAttribute("href")!==src)im.setAttribute("href",src);im.setAttribute("x",-w/2);im.setAttribute("y",-hh+16);im.setAttribute("width",w);im.setAttribute("height",hh)}
function bSet(k,p,flip){POSE[k]=POSE_MAP[p]||p;if(flip!=null)FLIP[k]=flip;updImg(k)}
function bTeamPose(t,p){bSet(bKey(t,0),p);bSet(bKey(t,1),p)}
function bShotPose(s){return s==="neutral"?(Math.random()<0.35?"bhneutral":"neutral"):s==="block"?"defsmash":s}
function setPoses(map){POSE={};FLIP={};for(var k in map){var v=POSE_MAP[map[k]];if(v)POSE[k]=v}["A","B","L","R"].forEach(updImg)}
function hitterAt(pt,P){var best=null,bd=1.6;["A","B","L","R"].forEach(function(k){if(!P[k])return;var d=Math.hypot(P[k][0]-pt[0],P[k][1]-pt[1]);if(d<bd){bd=d;best=k}});return best}
function oppPose(s){if(s.shot)return s.shot;return s.height==="high"?"lob":s.height==="med"?(s.speed==="fast"?"push":"neutral"):(s.speed==="fast"?"flatsmash":s.speed==="slow"?"drop":"dig")}
function place(id,p,instant){var g=PL[id].g;
  var me=id===state.side,im=PL[id].t.img;if(PL[id].rk){var sh=state.tab==="compete"&&me&&MATCH;PL[id].rk.style.display=sh?"":"none";if(sh)PL[id].rk.setAttribute("transform","translate(0 "+(state.hand==="L"?-26:26)+")")}updImg(id);if(instant){g.style.transition="none";}g.style.transform="translate("+X(p[0])+"px,"+Y(p[1])+"px) scale("+PS+")";
  if(instant){g.getBoundingClientRect();g.style.transition="";}}

/* Ball */
var tgt=el("ellipse",{rx:20,ry:16,fill:C.opp,"fill-opacity":0.28,opacity:0},gT);
var trail=el("polyline",{fill:"none",stroke:"#8A6A2A","stroke-width":2,"stroke-dasharray":"6 5","stroke-linecap":"round",opacity:0},gT);
var spark=el("circle",{r:6,fill:"none",stroke:"#FFD23F","stroke-width":3,opacity:0},gT);
var land=el("circle",{r:11,fill:"none",stroke:C.oppDark,"stroke-width":3,opacity:0},gT);
var shadow=el("ellipse",{rx:5,ry:3,fill:"#000","fill-opacity":0.25,opacity:0},gB);
var ball=el("circle",{r:6,fill:"#DDF02B",stroke:"#9C9A12","stroke-width":0.8,opacity:0},gB);
/* Ball size shows height: small near the sand, big when it is up high */
function ballR(h){var k=Math.max(0,Math.min(1,h/4.2));return 3.5+32*Math.pow(k,1.15)}
/* Stage 2 ball. Orange with a yellow seam that spins faster on quicker balls */
var seamG=el("g",{"pointer-events":"none",opacity:0},gB),seam=el("g",{},seamG);
el("path",{d:"M0 -6C-5.5 -2 5.5 2 0 6A6 6 0 0 0 0 -6Z",fill:"#FF4D6D"},seam);el("path",{d:"M0 -6C-5.5 -2 5.5 2 0 6",fill:"none",stroke:"#FFFFFF","stroke-width":0.7,"stroke-opacity":0.9},seam);
var SPIN=0,spinA=0,spinT=0;
el("clipPath",{id:"ballclip"},gB).appendChild(el("circle",{r:5.6}));seam.setAttribute("clip-path","url(#ballclip)");
function syncSeam(){var op=ball.getAttribute("opacity");seamG.setAttribute("opacity",op);
  if(+op>0){var r=+ball.getAttribute("r")||6,cx=+ball.getAttribute("cx")||0,cy=+ball.getAttribute("cy")||0,tf=ball.getAttribute("transform")||"";
    seamG.setAttribute("transform",tf+" translate("+cx+" "+cy+") scale("+(r/6).toFixed(3)+")");seam.setAttribute("transform","rotate("+spinA.toFixed(1)+")")}}
(function seamLoop(now){var dt=spinT?Math.min(50,now-spinT):0;spinT=now;if(!RM)spinA=(spinA+SPIN*dt)%360;syncSeam();requestAnimationFrame(seamLoop)})(0);
var SPINR={push:1.8,flatsmash:2.2,hook:1.8,dig:1.2,serve:1.4,neutral:0.6,lob:0.45,drop:0.4};

var FAST={push:1,flatsmash:1,brush:1,bhsmash:1,hook:1,recoverysmash:1,dig:1,serve:1,inPush:1};
function fEase(k){return 1-Math.pow(1-k,2.2)}
function ease(shot,k){if(shot==="_inF")return fEase(k);return FAST[shot]?1-(1-k)*(1-k):k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2}
var WINDK={calm:0,breezy:0.5,gusty:1};
function runBall(b,mark){if(raf)cancelAnimationFrame(raf);land.setAttribute("opacity",0);spark.setAttribute("opacity",0);
  if(!b){ball.setAttribute("opacity",0);shadow.setAttribute("opacity",0);trail.setAttribute("opacity",0);tgt.setAttribute("opacity",0);sideBall(null);return 0}
  var p=PROF[b.shot]||PROF.neutral,d=RM?150:p.d*1.3,wk=WINDK[state.wind]||0;if(!/^_(hold|inB|sand|drop)$/.test(b.shot))sfx((b.spin||0)>1.3?"hitF":"hit");SPIN=b.spin!=null?b.spin:(SPINR[b.shot]||0.6);
  trail.setAttribute("stroke-dasharray",b.trail==="fast"?"none":b.trail==="slow"?"1 9":"6 5");trail.setAttribute("stroke-width",b.trail==="fast"?3.5:2);
  var fx=X(b.f[0]),fy=Y(b.f[1]),tx=X(b.to[0]),ty=Y(b.to[1]),pts=[];
  trail.setAttribute("points","");trail.setAttribute("opacity",0.8);
  tgt.setAttribute("cx",tx);tgt.setAttribute("cy",ty);tgt.setAttribute("opacity",mark?1:0);
  ball.setAttribute("opacity",1);shadow.setAttribute("opacity",1);
  var t0=performance.now();
  function tick(now){var k=Math.max(0,Math.min((now-t0)/d,1)),e=ease(b.shot,k),wv=windV(),bend=wk*26*S(PI*e),
      x=fx+(tx-fx)*e+bend*wv[0],y=fy+(ty-fy)*e+bend*wv[1]+(b.curve||0)*S(PI*e),h=Math.max(0,p.h(k)),lift=Math.min(60,h*6);
    ball.setAttribute("cx",x);ball.setAttribute("cy",y-lift*(PORT?0:1));ball.setAttribute("transform",PORT?"translate("+(-lift)+",0)":"");
    ball.setAttribute("r",(ballR(h)*PS).toFixed(1));syncSeam();
    shadow.setAttribute("cx",x);shadow.setAttribute("cy",y+2);
    pts.push((PORT?x-lift:x).toFixed(1)+","+(PORT?y:y-lift).toFixed(1));trail.setAttribute("points",pts.join(" "));
    sideBall([b.f[0]+(b.to[0]-b.f[0])*e,h]);
    if(k<1){raf=requestAnimationFrame(tick)}else{
      spark.setAttribute("cx",tx);spark.setAttribute("cy",ty);spark.setAttribute("class","");spark.getBoundingClientRect();spark.setAttribute("class","spark");
      if(b.land){land.setAttribute("cx",tx);land.setAttribute("cy",ty);land.setAttribute("opacity",1);sfx("sand")}if(b.shot==="_net")sfx("net");SPIN=SPIN*0.25}}
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
  sv.b=mk("circle",{r:6,fill:"#DDF02B",stroke:"#9C9A12","stroke-width":1.2,opacity:0})})();
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
  var ax=Math.abs(v[0]),ay=Math.abs(v[1]),fb=v[0]>0?"behind you":"into your face",lr=v[1]>0?"left":"right";
  if(ax>0.9)return f+" wind "+fb;if(ay>0.9)return f+" crosswind from your "+lr;return f+" wind "+fb+", angled from your "+lr}
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
  hook:["A","inLob","A lob goes high over your backhand shoulder."],
  bhsmash:["A","inPop","A high ball comes to your backhand side."],
  drop:["B","inFloat","Their neutral ball comes back to you at medium height and pace. Both of them are deep."],
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
 drop:"They're stretching forward. Get ready for the lift.",hook:"Your backhand side is covered now. No more free lobs there.",dig:"No easy smash for them. The rally goes on on your terms."};
function nextItem(){var seq=VISIBLE,i=seq.indexOf(state.id);if(i<0||i>=seq.length-1)return null;var n=seq[i+1];return {tab:"shots",id:n,name:(SHOTS[n]||SCENES[n]).name}}
function track(ev,p){try{var o={event:ev,ts:Date.now()};for(var k in p)o[k]=p[k];(window.dataLayer=window.dataLayer||[]).push(o);if(window.posthog&&posthog.capture)posthog.capture(ev,p)}catch(e){}}
var START_SAY={serve:"Server behind the baseline. In men's open and ITF play the partner starts behind the 6 m line. In women's and mixed play, it's the 3 m line. The receivers start just behind their 3 m line."};
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
 hook:{say:"No free lob over your backhand. Recover forward together to just behind your 3 m line while they deal with it.",opp:{A:[11.8,3.0],B:[12.6,5.2]}},
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
  if(t==="shots"){$("sel-title").textContent="";$("sel-title").hidden=true;$("sel2-title").hidden=true;l2.hidden=true;
    VISIBLE.forEach(function(id){var b=iconBtn(id,SHOTS[id].name,function(){select(id)});b.setAttribute("aria-current",String(id===state.id));list.appendChild(b)})}
  else if(t==="pick"){$("sel-title").textContent="Your call. Tap a shot";$("sel2-title").textContent="Real situations";
    VISIBLE.filter(function(v){return v!=="serve"}).forEach(function(id){var b=iconBtn(id,SHOTS[id].name,function(){pickShot(id)});b.setAttribute("aria-current",String(id===PK.pickShot));list.appendChild(b)});
    $("sel2-title").hidden=true;l2.hidden=true}
  else{$("sel-title").textContent="Sand Series";$("sel2-title").hidden=true;l2.hidden=true;list.className="list";renderLobby(list)}}
/* Technique video for each shot. Official clips are uploaded by the admin */
var SHOT_VIDEOS={};
function renderVideo(id){var v=$("shotvid");if(!v)return;if(!id){v.hidden=true;v.innerHTML="";return}v.hidden=false;var url=SHOT_VIDEOS[id];
  v.innerHTML=(url?'<video controls playsinline preload="metadata" src="'+esc(url)+'"></video>':'<div class="vidph"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" opacity=".12"/><path d="M10 8l6 4-6 4z" fill="currentColor"/></svg><span>'+SHOTS[id].name+' video coming soon</span></div>')+
    (typeof NETS!=="undefined"&&NETS.prof&&NETS.prof.is_admin?'<label class="vidup btn soft">'+(url?"Replace":"Upload")+' '+SHOTS[id].name.toLowerCase()+' video<input type="file" accept="video/*" hidden></label>':'');
  var inp=v.querySelector(".vidup input");if(inp)inp.onchange=function(){if(inp.files[0])netUpload(id,inp.files[0])}}
function select(id){stop();state.id=id;save("id-"+state.tab,id);
  scene=SHOTS[id]?shotScene(id):SCENES[id];state.step=0;state.branch=null;
  [].forEach.call(document.querySelectorAll(".item"),function(b){b.setAttribute("aria-current",String(b.id==="item-"+id))});
  $("title").textContent=scene.name;var cat=$("cat");cat.textContent=scene.cat;cat.style.background=CATCOL[scene.cat]||"var(--turq)";
  renderOptions();
  var isShot=!!SHOTS[id];if(isShot&&ICON[id])document.documentElement.style.setProperty("--shotc",ICON[id].c);$("cards").hidden=!isShot;$("cards-m").hidden=!isShot;
  if(isShot)fillTips(lvTips(id));renderVideo(isShot?id:null);
  var lc=$("lvl-chip");lc.hidden=!isShot;lc.textContent=LVN[state.level];lc.setAttribute("aria-label","Level "+LVN[state.level]+". Change in your profile");
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
  var pm={},from=pp||prev;if(st.ball){var hk=hitterAt(st.ball.f,from);if(hk)pm[hk]=st.ball.shot}else if(st.hold&&scene.shot==="serve"){var sk=hitterAt(st.hold,cur);if(sk)pm[sk]="serve"}setPoses(pm);
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
  if(state.tab==="shots"&&state.id==="serve"){fillTips(st.tz?ZTIPS[st.tz]:lvTips("serve"))}
  var ln=$("lvl-note"),lf=state.tab==="shots"&&LV[state.id]&&LV[state.id][state.level];ln.hidden=!lf;if(lf)ln.innerHTML="<b>"+LVN[state.level]+"</b>"+lf.f;
  var pend=!!scene.branches&&state.branch==null&&i===all.length-1;
  $("step-k").textContent=pend?"Step "+(i+1)+" · pick an option to continue":"Step "+(i+1)+" of "+all.length;
  $("step-title").textContent=st.t;$("mcap-t").textContent=st.t;$("mcap-s").textContent=st.say||"";$("court-t").textContent=st.t+". "+(st.say||"");$("say").textContent=st.say||"";
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
function setTab(t){stop();if(typeof lvStop==="function")lvStop();railOff(true);if(t!=="compete"&&typeof resBar==="function"){resBar(null);document.body.classList.remove("hasres")}if(typeof gTag!=="undefined"&&gTag){gTag.innerHTML="";ballTag=null;oppPill=null}if(typeof fbToastOff==="function")fbToastOff();if(typeof cmd==="function")cmd("");document.body.classList.remove("lobby-on");var sh0=$("shout");if(sh0)sh0.className="shout";[].forEach.call(document.querySelectorAll(".cbub"),function(b){b.remove()});clearTimeout(pkTimer);if(t==="learn")t=load("learn-sub","shots")==="pick"?"pick":"shots";if(t==="play")t=["compete","friends","ladder"].indexOf(load("play-sub","compete"))>=0?load("play-sub","compete"):"compete";
  if(t==="compete3d"||t==="classic"){var was=p3dOn();save("p3d",t==="classic"?"0":"1");t="compete";if(was!==p3dOn()&&state.tab==="compete"){if(typeof leaveMatch==="function")leaveMatch();if(typeof p3dLive==="function")p3dLive(false);state.tab=""}}
  if(state.tab==="compete"&&t!=="compete")leaveMatch();state.tab=t;save("tab",t);
  ["home","shots","pick","compete"].forEach(function(k){$("tab-"+k).setAttribute("aria-selected",String(k===t))});
  var grp=t==="home"?"home":/shots|pick/.test(t)?"learn":"play";if(grp==="learn")save("learn-sub",t);if(grp==="play")save("play-sub",t);
  ["home","learn","play"].forEach(function(k){$("tab-"+k).setAttribute("aria-selected",String(k===grp))});renderSubnav(grp,t);
  ["friends","ladder"].forEach(function(k){$(k).hidden=k!==t});$("play3d").hidden=t!=="compete"||!p3dOn();if(t!=="compete"&&typeof p3dLive==="function")p3dLive(false);
  if(t==="friends"||t==="ladder"){document.body.classList.add("homing");document.body.classList.remove("sheet-open","trsu","picking","competing","c-live");$("home").hidden=true;$("trtray").hidden=true;hideShotUI();hideServeUI();if(t==="friends")renderFriends();else renderLadder();return}
  if(t==="compete"&&p3dOn()){document.body.classList.add("homing");document.body.classList.remove("sheet-open","trsu","picking","competing","c-live");$("home").hidden=true;$("trtray").hidden=true;hideShotUI();hideServeUI();p3dShow();return}
  var home=t==="home";document.body.classList.toggle("homing",home);$("home").hidden=!home;if(home){$("trtray").hidden=true;document.body.classList.remove("sheet-open","trsu","picking","competing","c-live");hideShotUI();hideServeUI();renderHome();return}
  var pick=t==="pick",comp=t==="compete";$("picker").hidden=!pick;$("ctrls").hidden=pick||comp;$("stepbox").hidden=pick||comp;$("result").hidden=!pick;
  document.body.classList.toggle("picking",pick);document.body.classList.toggle("competing",comp);if(typeof orient==="function"&&SVGC.dataset.o)orient();$("mcap").style.display=pick||comp?"none":"";
  $("cpanel").hidden=!comp;$("score").hidden=true;$("csit").hidden=true;document.body.classList.remove("c-live");clearAim();
  if(typeof drawWind==="function"){state.wind=pick?load("wind","calm"):"calm";[].forEach.call($("seg-wind").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.v===state.wind))});drawWind();drawDial()}
  renderLegend();
  hideTrainUI();gauge(null);
  $("trtray").hidden=!pick;if(!pick)document.body.classList.remove("sheet-open","trsu","trmin","trmid");
  if(pick){$("cards").hidden=true;$("cards-m").hidden=true;$("title").textContent="Train";trainOpen();return}
  if(comp){gG.innerHTML="";gM.innerHTML="";drawZones(false);runBall(null);$("title").textContent="Sand Series";renderList();lobbyPanel();return}
  gG.innerHTML="";
  var saved=load("id-shots","serve"),ok=VISIBLE.indexOf(saved)>=0||(!!SCENES[saved]&&saved===DEEP_ID);state.id=ok?saved:"serve";
  renderList();select(state.id)}
[].forEach.call(document.querySelectorAll(".tabs button"),function(b,i,all){b.addEventListener("keydown",function(e){var d=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!d)return;var n=all[(i+d+all.length)%all.length];n.focus();n.click()})});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".tabs button,.btn,.seg button,.rhead");if(b)sfx("tap")},true);
(function(){try{if(AUTH_HASH){save("play-sub","friends");setTimeout(function(){setTab("friends")},50)}var q=new URLSearchParams(location.search).get("join");if(q){save("pending-join",q.toUpperCase());save("play-sub","friends");history.replaceState(null,"",location.pathname);setTimeout(function(){setTab("friends")},50)}}catch(e){}netInit()})();
$("tab-home").onclick=function(){setTab("home")};$("tab-learn").onclick=function(){setTab("learn")};$("tab-play").onclick=function(){setTab("play")};
$("tab-shots").onclick=function(){setTab("shots")};$("tab-pick").onclick=function(){setTab("pick")};$("tab-compete").onclick=function(){setTab("compete")};
/* Online play. NET is set once a Supabase project is connected (see config) */
var NET=null;
function ratingStart(){return {beginner:2.0,intermediate:3.5,advanced:4.75,pro:5.75}[state.level]||3.5}
function myRating(){var r=+load("rating","");return r?r:ratingStart()}
/* ===== Online: accounts, friends, game rooms, ladder, shot videos (Supabase) ===== */

function netReady(){return !!(NETS.sb&&NETS.user)}
function netInit(){if(NETS.sb||NETS.loading)return;NETS.loading=true;NETS.failed=false;
  var srcs=[document.querySelector('script[src="app.js"]')?"vendor/supabase.js":null,"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js","https://unpkg.com/@supabase/supabase-js@2.49.4/dist/umd/supabase.js"].filter(Boolean),k=0;
  function start(){try{NETS.sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,detectSessionInUrl:false,flowType:"implicit"}});NET=NETS;NETS.loading=false;
      NETS.sb.auth.onAuthStateChange(function(ev,ses){NETS.user=ses&&ses.user||null;if(NETS.user)netProfile();else{NETS.prof=null;netRefresh()}});
      if(AUTH_HASH){var hp2=new URLSearchParams(AUTH_HASH);AUTH_HASH="";
        if(hp2.get("access_token"))NETS.sb.auth.setSession({access_token:hp2.get("access_token"),refresh_token:hp2.get("refresh_token")||""}).then(function(r){if(r.error)netErr("That sign-in link didn't work: "+r.error.message+".")});
        else if(hp2.get("error_description"))NETS.err="Sign-in link problem: "+hp2.get("error_description").replace(/\+/g," ")+"."}
      NETS.sb.auth.getSession().then(function(r){NETS.user=r.data&&r.data.session&&r.data.session.user||null;if(NETS.user)netProfile();else netRefresh()},function(e){netErr("Couldn't reach the online service ("+(e&&e.message||"network")+").")});
      netVideos();netRefresh()}catch(e){NETS.sb=null;NETS.loading=false;NETS.failed=true;NETS.why="start: "+(e&&e.message);netRefresh()}}
  function next(){if(k>=srcs.length){NETS.loading=false;NETS.failed=true;NETS.why=NETS.why||"couldn't download the online code";netRefresh();return}
    var sc=document.createElement("script");sc.src=srcs[k++];sc.onload=function(){if(window.supabase&&window.supabase.createClient)start();else next()};sc.onerror=next;document.head.appendChild(sc)}
  next()}
function netRefresh(){if(state.tab==="friends")renderFriends();if(state.tab==="ladder")renderLadder();if(state.tab==="shots"&&state.id&&SHOTS[state.id])renderVideo(state.id);var pj=load("pending-join","");if(pj&&netReady()){save("pending-join","");netJoin(pj)}}
function netErr(m){NETS.err=m||"Something went wrong. Check your connection and try again.";netRefresh()}
function netProfile(){var sb=NETS.sb,u=NETS.user;sb.from("profiles").select("*").eq("id",u.id).maybeSingle().then(function(r){
    if(r.error)return netErr("Couldn't load your profile ("+(r.error.message||r.error.code||"unknown")+"). Run supabase/schema.sql in Supabase, then reload.");
    if(r.data){NETS.prof=r.data;save("rating",String(r.data.rating));netRefresh();return}
    var nm=state.name||(u.email||"Player").split("@")[0];sb.from("profiles").insert({id:u.id,name:nm.slice(0,40),avatar:state.emoji||"a01",side:state.side,level:state.level,rating:ratingStart()}).select().single().then(function(r2){
      if(r2.error)return netErr("Couldn't create your profile ("+(r2.error.message||r2.error.code)+").");NETS.prof=r2.data;netRefresh()})})}
function netSignIn(email){NETS.err="";return NETS.sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:location.origin+location.pathname}}).then(function(r){if(r.error)netErr(r.error.message);else{NETS.sent=email;netRefresh()}})}
function netSignOut(){NETS.sb.auth.signOut().then(function(){NETS.room=null;netRefresh()})}
function joinLink(code){return location.origin+location.pathname+"?join="+code}
function shareLink(code){var url=joinLink(code),txt="Join my beach tennis game on Beach Tennis University. Code "+code;
  if(navigator.share){navigator.share({title:"Beach Tennis University",text:txt,url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast("Link copied")},function(){prompt("Copy this link",url)})}}
/* Game rooms */
function netCreate(){var sb=NETS.sb;sb.from("games").insert({host:NETS.user.id}).select().single().then(function(r){if(r.error)return netErr("Couldn't create a game.");
  sb.from("game_players").insert({game_id:r.data.id,user_id:NETS.user.id,team:1,side:state.side}).then(function(r2){if(r2.error)return netErr("Couldn't take your seat.");NETS.room=r.data;netRoomWatch();track("online_game_created",{})})})}
function netJoin(code){code=String(code||"").trim().toUpperCase();if(!code)return;var sb=NETS.sb;
  sb.from("games").select("*").eq("code",code).maybeSingle().then(function(r){if(r.error||!r.data)return netErr("No game with code "+code+".");var g=r.data;
    sb.from("game_players").select("*").eq("game_id",g.id).then(function(r2){var ps=r2.data||[];if(ps.some(function(x){return x.user_id===NETS.user.id})){NETS.room=g;netRoomWatch();return}
      var seat=[[1,"L"],[1,"R"],[2,"L"],[2,"R"]].filter(function(s){return !ps.some(function(x){return x.team===s[0]&&x.side===s[1]})})[0];if(!seat)return netErr("That game is full.");
      sb.from("game_players").insert({game_id:g.id,user_id:NETS.user.id,team:seat[0],side:seat[1]}).then(function(r3){if(r3.error)return netErr("Couldn't join that game.");NETS.room=g;netRoomWatch();track("online_game_joined",{})})})})}
function netRoomWatch(){clearInterval(NETS.poll);netRoomLoad();NETS.poll=setInterval(function(){if(state.tab!=="friends"||!NETS.room){clearInterval(NETS.poll);return}netRoomLoad()},3000)}
function netRoomLoad(){var sb=NETS.sb,g=NETS.room;if(!g)return;sb.from("game_players").select("team,side,user_id,profiles(name,rating,avatar)").eq("game_id",g.id).then(function(r){
  if(r.error)return;NETS.seats=r.data||[];sb.from("games").select("*").eq("id",g.id).single().then(function(r2){if(r2.data)NETS.room=r2.data;if(state.tab==="friends")renderFriends()})})}
function netSeat(team,side){var sb=NETS.sb,g=NETS.room;if(!g)return;if((NETS.seats||[]).some(function(x){return x.team===team&&x.side===side}))return;
  sb.from("game_players").update({team:team,side:side}).eq("game_id",g.id).eq("user_id",NETS.user.id).then(function(){netRoomLoad()})}
function netLeave(){var sb=NETS.sb,g=NETS.room;if(!g)return;sb.from("game_players").delete().eq("game_id",g.id).eq("user_id",NETS.user.id).then(function(){NETS.room=null;NETS.seats=null;renderFriends()})}
function netRecord(t1,t2){NETS.sb.rpc("record_result",{p_game:NETS.room.id,p_t1:t1,p_t2:t2}).then(function(r){if(r.error)return netErr(r.error.message);toast("Result saved. Ratings updated.");track("ranked_result",{t1:t1,t2:t2});NETS.room=null;netProfile();setTab("ladder")})}
/* Friends */
function netFriends(cb){var sb=NETS.sb,me=NETS.user.id;sb.from("friendships").select("user_id,friend_id,status").or("user_id.eq."+me+",friend_id.eq."+me).then(function(r){
  var rows=r.data||[],ids=rows.map(function(x){return x.user_id===me?x.friend_id:x.user_id});if(!ids.length)return cb([]);
  sb.from("profiles").select("id,name,rating,avatar").in("id",ids).then(function(r2){var P={};(r2.data||[]).forEach(function(p){P[p.id]=p});
    cb(rows.map(function(x){var other=x.user_id===me?x.friend_id:x.user_id;return {p:P[other]||{id:other,name:"Player"},status:x.status,incoming:x.friend_id===me,row:x}}))})})}
function netFindPlayers(q,cb){NETS.sb.from("profiles").select("id,name,rating,avatar").ilike("name","%"+q.replace(/[%_]/g,"")+"%").neq("id",NETS.user.id).limit(8).then(function(r){cb(r.data||[])})}
function netAddFriend(id){NETS.sb.from("friendships").insert({user_id:NETS.user.id,friend_id:id}).then(function(r){if(r.error&&!/duplicate/.test(r.error.message))return netErr("Couldn't send the request.");toast("Request sent");renderFriends()})}
function netAccept(row){NETS.sb.from("friendships").update({status:"accepted"}).eq("user_id",row.user_id).eq("friend_id",row.friend_id).then(function(){renderFriends()})}
/* Videos: anyone can watch, only the admin uploads */
function netVideos(){NETS.sb.from("shot_videos").select("shot,path").then(function(r){(r.data||[]).forEach(function(v){SHOT_VIDEOS[v.shot]=NETS.sb.storage.from("shot-videos").getPublicUrl(v.path).data.publicUrl+"?v="+Date.parse(v.updated_at||0)});if(state.tab==="shots"&&state.id&&SHOTS[state.id])renderVideo(state.id)})}
function netUpload(shot,file){var sb=NETS.sb,ext=(file.name.split(".").pop()||"mp4").toLowerCase(),path=shot+"."+ext;toast("Uploading…");
  sb.storage.from("shot-videos").upload(path,file,{upsert:true,contentType:file.type||"video/mp4"}).then(function(r){if(r.error)return toast("Upload failed: "+r.error.message);
    sb.from("shot_videos").upsert({shot:shot,path:path,updated_at:new Date().toISOString()}).then(function(r2){if(r2.error)return toast("Saved the file but not the link: "+r2.error.message);toast("Video saved");netVideos()})})}
function esc2(t){return esc(String(t==null?"":t))}
function renderFriends(){var f=$("friends");
  if(!NETS.sb){f.innerHTML='<div class="pcard"><h2>Play with friends</h2><p class="pmuted">Up to four players, each on their own phone.</p>'+
      (NETS.failed?'<p class="perr">Online play couldn\'t start'+(NETS.why?' ('+esc2(NETS.why)+')':'')+'.</p><p class="pnote">Open mebt-app-q38a.vercel.app in Safari or Chrome. It won\'t work inside the Claude app or an email app.</p><button class="btn soft" id="net-retry">Try again</button>':'<p class="pnote">Connecting…</p>')+'</div>';
    if($("net-retry"))$("net-retry").onclick=function(){NETS.failed=false;netInit();renderFriends()};if(!NETS.loading&&!NETS.failed)netInit();return}
  var err=NETS.err?'<p class="perr" role="alert">'+esc2(NETS.err)+'</p>':'';NETS.err="";
  if(!NETS.user){f.innerHTML='<div class="pcard"><h2>Sign in to play</h2>'+
      '<form class="pwform" id="pw-form"><input id="pw-email" type="email" required placeholder="Email" autocomplete="email"><input id="pw-pass" type="password" required minlength="6" placeholder="Password (6+ characters)" autocomplete="current-password">'+
      '<div class="pbtns two"><button class="btn primary" type="submit" data-m="in">Sign in</button><button class="btn soft" type="submit" data-m="up">Create account</button></div></form>'+err+
      '<details class="orlink"><summary>Or get an email link</summary>'+
      (NETS.sent?'<p class="pnote">We emailed '+esc2(NETS.sent)+'. Tap the link in it, or type the 6-digit code here.</p><form class="fradd" id="otp-form"><input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="6-digit code"><button class="btn primary" type="submit">Sign in</button></form><button class="lnk" id="si-again">Use a different email</button>':'<form class="fradd" id="si-form"><input id="si-email" type="email" required placeholder="Your email" autocomplete="email"><button class="btn soft" type="submit">Email me</button></form>')+'</details></div>';
    var pf=$("pw-form"),mode="in";if(pf){[].forEach.call(pf.querySelectorAll("button[data-m]"),function(b){b.onclick=function(){mode=b.dataset.m}});
      pf.onsubmit=function(e){e.preventDefault();var em=$("pw-email").value.trim(),pw=$("pw-pass").value;NETS.err="";
        (mode==="up"?NETS.sb.auth.signUp({email:em,password:pw}):NETS.sb.auth.signInWithPassword({email:em,password:pw})).then(function(r){
          if(r.error)return netErr(r.error.message==="Invalid login credentials"?"Email or password not right. New here? Tap Create account.":r.error.message);
          if(mode==="up"&&!r.data.session)netErr("Account made. Check your email to confirm it, then sign in.")})}}
    var fm=$("si-form");if(fm)fm.onsubmit=function(e){e.preventDefault();netSignIn($("si-email").value.trim())};
    var of=$("otp-form");if(of)of.onsubmit=function(e){e.preventDefault();var code=$("otp").value.replace(/\D/g,"");if(code.length<6){toast("Enter the code from the email");return}
      NETS.sb.auth.verifyOtp({email:NETS.sent,token:code,type:"email"}).then(function(r){if(r.error)netErr("That code didn't work: "+r.error.message)})};
    if($("si-again"))$("si-again").onclick=function(){NETS.sent=null;renderFriends()};return}
  var me=NETS.prof||{name:"…",rating:myRating()};
  if(NETS.room){var g=NETS.room,seats=NETS.seats||[],host=g.host===NETS.user.id,seatHtml=function(team,side){var x=seats.filter(function(s){return s.team===team&&s.side===side})[0],mine=x&&x.user_id===NETS.user.id;
      return '<button class="seat'+(x?" taken":"")+(mine?" mine":"")+'" data-team="'+team+'" data-side="'+side+'"><span>'+(side==="L"?"Left":"Right")+'</span><b>'+(x?esc2(x.profiles&&x.profiles.name||"Player"):"Computer")+'</b><small>'+(x&&x.profiles?(+x.profiles.rating).toFixed(2):"tap to sit here")+'</small></button>'};
    f.innerHTML='<div class="pcard"><div class="rmhead"><h2>Game '+esc2(g.code)+'</h2><button class="btn soft" id="rm-share">Invite</button></div><p class="pmuted">Send the link. Friends who open it join this game.</p>'+err+
      '<div class="teams"><div><h3>Your team</h3>'+seatHtml(1,"L")+seatHtml(1,"R")+'</div><div><h3>Opponents</h3>'+seatHtml(2,"L")+seatHtml(2,"R")+'</div></div>'+
      '<p class="pnote">Live online matches arrive in the next update. For now, play it on the sand and record the score to move up the ladder.</p>'+
      (host?'<div class="recres"><label>Your team <input id="rs-1" type="number" min="0" max="99" inputmode="numeric"></label><label>Opponents <input id="rs-2" type="number" min="0" max="99" inputmode="numeric"></label><button class="btn primary" id="rs-go">Record ranked result</button></div>':'<p class="pmuted">The host records the result.</p>')+
      '<button class="lnk" id="rm-leave">Leave game</button></div>';
    $("rm-share").onclick=function(){shareLink(g.code)};$("rm-leave").onclick=netLeave;
    [].forEach.call(f.querySelectorAll(".seat:not(.taken)"),function(b){b.onclick=function(){netSeat(+b.dataset.team,b.dataset.side)}});
    if($("rs-go"))$("rs-go").onclick=function(){var a=+$("rs-1").value,b2=+$("rs-2").value;if(isNaN(a)||isNaN(b2)||a===b2){toast("Enter both scores");return}netRecord(a,b2)};return}
  f.innerHTML='<div class="pcard"><div class="rmhead"><h2>Play with friends</h2><button class="lnk" id="so">Sign out</button></div><p class="pmuted">'+esc2(me.name)+' · rating '+(+me.rating).toFixed(2)+'</p>'+err+
    '<div class="pbtns"><button class="btn primary big" id="fr-new">Create a game</button><form class="fradd" id="jn-form"><input id="jn-code" placeholder="Game code" maxlength="6" autocapitalize="characters" autocomplete="off"><button class="btn soft" type="submit">Join</button></form></div></div>'+
    '<div class="pcard"><h3>Friends</h3><form class="fradd" id="fs-form"><input id="fs-q" placeholder="Find players by name" autocomplete="off"><button class="btn soft" type="submit">Find</button></form><ul class="frlist" id="fs-res"></ul><ul class="frlist" id="fr-list"><li class="pmuted">Loading…</li></ul></div>';
  $("so").onclick=netSignOut;$("fr-new").onclick=netCreate;$("jn-form").onsubmit=function(e){e.preventDefault();netJoin($("jn-code").value)};
  $("fs-form").onsubmit=function(e){e.preventDefault();var q=$("fs-q").value.trim();if(q.length<2)return;netFindPlayers(q,function(rs){$("fs-res").innerHTML=rs.length?rs.map(function(p){return '<li><span class="fav">'+esc2((p.name||"?")[0]).toUpperCase()+'</span><b>'+esc2(p.name)+'</b><small>'+(+p.rating).toFixed(2)+'</small><button class="btn soft" data-add="'+p.id+'">Add</button></li>'}).join(""):'<li class="pmuted">No players found. Invite them with a game link.</li>';
    [].forEach.call($("fs-res").querySelectorAll("[data-add]"),function(b){b.onclick=function(){netAddFriend(b.dataset.add)}})})};
  netFriends(function(list){var el2=$("fr-list");if(!el2)return;el2.innerHTML=list.length?list.map(function(x,i){return '<li><span class="fav">'+esc2((x.p.name||"?")[0]).toUpperCase()+'</span><b>'+esc2(x.p.name)+'</b><small>'+(x.status==="accepted"?(+x.p.rating||0).toFixed(2):x.incoming?"wants to be friends":"request sent")+'</small>'+(x.status!=="accepted"&&x.incoming?'<button class="btn soft" data-acc="'+i+'">Accept</button>':'<span></span>')+'</li>'}).join(""):'<li class="pmuted">No friends yet. Find them above, or create a game and send the link.</li>';
    [].forEach.call(el2.querySelectorAll("[data-acc]"),function(b){b.onclick=function(){netAccept(list[+b.dataset.acc].row)}})})}
function renderLadder(){var f=$("ladder"),r=myRating();
  var head='<div class="pcard rate"><span class="pmuted">Your rating</span><b>'+(NETS.prof?(+NETS.prof.rating).toFixed(2):r.toFixed(2))+'</b><small>Scale 2.0 to 8.0 · +0.1 for a win · daily loss capped at 0.3</small></div>';
  if(!netReady()){f.innerHTML=head+'<div class="pcard"><h3>Ladder</h3><p class="pnote">'+(NETS.sb?"Sign in under Friends to join the ladder.":"The ladder lives on the live website.")+'</p></div>';return}
  f.innerHTML=head+'<div class="pcard"><h3>Ladder</h3><ol class="ladder" id="ld"><li class="pmuted">Loading…</li></ol></div>';
  NETS.sb.from("ladder").select("*").order("place").limit(100).then(function(res){var l=$("ld");if(!l)return;if(res.error){l.innerHTML='<li class="pmuted">Couldn\'t load the ladder.</li>';return}
    l.innerHTML=(res.data||[]).map(function(x){return '<li class="'+(x.id===NETS.user.id?"me":"")+'"><span>'+x.place+'</span><b>'+esc2(x.name)+'</b><em>'+(+x.rating).toFixed(2)+'</em></li>'}).join("")||'<li class="pmuted">No players yet.</li>'})}
function renderSubnav(grp,t){var n=$("subnav");if(grp==="home"){n.hidden=true;return}n.hidden=false;
  var items=grp==="learn"?[["shots","Shots"],["pick","Train"]]:[["compete3d","3D"],["classic","2D"],["friends","Friends"],["ladder","Ladder"]];
  n.innerHTML=items.map(function(x){var on=x[0]===t||(t==="compete"&&(x[0]==="compete3d"?p3dOn():x[0]==="classic"?!p3dOn():false));return '<button role="tab" data-t="'+x[0]+'" aria-pressed="'+on+'">'+x[1]+'</button>'}).join("");
  [].forEach.call(n.children,function(b){b.onclick=function(){if(b.getAttribute("aria-pressed")!=="true")setTab(b.dataset.t)}})}
function seg(id,key){var box=$(id);[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state[key]));
  b.onclick=function(){track("setting_changed",{setting:key,from:state[key],to:b.dataset.v,tab:state.tab,lesson:state.id});state[key]=b.dataset.v;save(key,b.dataset.v);setSum();[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))});
    if(key==="level"||key==="hand"){refreshView();return}
    if(state.tab==="pick"){renderPick();return}
    if(state.tab==="compete"){if(MATCH&&MATCH.cur)drawPoint();return}
    if(state.tab==="shots"){select(state.id);return}
    if(key==="rules"){var keep=state.step;["A","B","L","R"].forEach(function(k){place(k,posAt(keep)[k],true)})}
    renderStep()}})}
seg("seg-side","side");seg("seg-rules","rules");seg("seg-level","level");seg("seg-hand","hand");
function setSum(){$("pb-emoji").innerHTML=avImg(state.emoji);$("pb-name").textContent=state.name||"Profile";$("pb-level").textContent=LVN[state.level];
  $("p-big").innerHTML=avImg(state.emoji);$("p-title").textContent=state.name||"Profile";$("lvl-hint").textContent=LVHINT[state.level]}
function renderLegend(){var L=$("legend");if(!L)return;
  L.innerHTML='<span>'+avImg(state.emoji,"lgE")+'You</span><span>'+avImg(state.mate,"lgE")+'Partner</span><span>'+avImg(oppEmoji("A"),"lgE")+'Opponents</span><span><i class="dot" style="background:linear-gradient(135deg,#FF4D6D 50%,#DDF02B 50%)"></i>Ball</span>'}
function emojiGrid(box,get,set,other){box.innerHTML="";EMOJIS.forEach(function(e){var b=document.createElement("button");b.type="button";b.dataset.v=e;b.innerHTML=avImg(e);b.setAttribute("role","radio");b.setAttribute("aria-label",AVN[e]);
  b.onclick=function(){set(e);paint()};box.appendChild(b)});
  function paint(){[].forEach.call(box.children,function(b){b.setAttribute("aria-checked",String(b.dataset.v===get()));b.disabled=b.dataset.v===other()})}paint();box._paint=paint}
function refreshView(){setSum();renderLegend();if(state.tab==="shots"&&state.id){var k=state.step,br=state.branch;select(state.id);if(br!=null){state.branch=br}if(k<stepsOf().length){state.step=k;["A","B","L","R"].forEach(function(q){place(q,posAt(k)[q],true)});renderStep()}}
  else if(state.tab==="pick")renderPick();else if(state.tab==="compete"){if(MATCH&&MATCH.cur){renderScore();drawPoint()}else{renderList();lobbyPanel()}}}
var lastFocus=null;
function openProfile(tab){lastFocus=document.activeElement;$("profile").hidden=false;pTab(tab||"profile");$("p-name").value=state.name;
  $("p-emo")._paint();$("p-emo2")._paint();setSum();setTimeout(function(){$("p-close").focus()},30);track("profile_opened",{tab:tab||"profile"})}
function closeProfile(){$("profile").hidden=true;if(lastFocus)lastFocus.focus()}
function pTab(t){["profile","password","notify"].forEach(function(k){$("pt-"+k).hidden=k!==t;$("pt-b-"+k).setAttribute("aria-selected",String(k===t))});$("pw-msg").textContent="";$("n-msg").textContent=""}
[].forEach.call(document.querySelectorAll(".ptabs button"),function(b){b.onclick=function(){pTab(b.dataset.p)}});
$("prof-btn").onclick=function(){openProfile()};$("p-close").onclick=closeProfile;$("p-done").onclick=closeProfile;
$("lvl-chip").onclick=function(){openProfile()};
$("profile").addEventListener("click",function(e){if(e.target===this)closeProfile()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("profile").hidden)closeProfile()});
$("p-name").addEventListener("input",function(){state.name=this.value.trim();save("name",state.name);setSum()});
emojiGrid($("p-emo"),function(){return state.emoji},function(e){state.emoji=e;save("emoji",e);track("setting_changed",{setting:"emoji",to:e});refreshView();$("p-emo2")._paint()},function(){return state.mate});
emojiGrid($("p-emo2"),function(){return state.mate},function(e){state.mate=e;save("mate",e);track("setting_changed",{setting:"partner_emoji",to:e});refreshView();$("p-emo")._paint()},function(){return state.emoji});
/* Password. Needs sign in. Connect window.BTU_AUTH (for example Supabase) to make it live. Passwords are never stored in the browser. */
$("pw-save").onclick=function(){var m=$("pw-msg"),cur=$("pw-cur").value,nw=$("pw-new").value,cf=$("pw-conf").value,em=$("pw-email").value.trim();m.className="pmsg err";
  if(!cur){m.textContent="Enter your current password.";return}
  if(nw.length<8||!/[0-9]/.test(nw)){m.textContent="Use at least 8 characters, including a number.";return}
  if(nw!==cf){m.textContent="The new passwords don't match.";return}
  if(nw===cur){m.textContent="Pick a password you haven't used here before.";return}
  var A=window.BTU_AUTH;if(!A||!A.updatePassword){m.textContent="Sign in isn't switched on yet, so your password can't be changed. Your profile is saved on this device.";return}
  m.className="pmsg";m.textContent="Updating";
  Promise.resolve(A.updatePassword({email:em,current:cur,next:nw})).then(function(){m.className="pmsg ok";m.textContent="Password updated.";["pw-cur","pw-new","pw-conf"].forEach(function(i){$(i).value=""});track("password_changed",{})},
    function(err){m.className="pmsg err";m.textContent=(err&&err.message)||"That didn't work. Check your current password and try again."})};
/* Notifications */
var NP;try{NP=JSON.parse(load("notify","")||"null")}catch(e){NP=null}NP=NP||{content:false,tips:false,compete:false,email:""};
["content","tips","compete"].forEach(function(k){var c=$("n-"+k);c.checked=!!NP[k];c.onchange=function(){NP[k]=c.checked;saveNP();track("notification_preference",{topic:k,on:c.checked})}});
$("n-sound").checked=load("sound","1")==="1";$("n-sound").onchange=function(){save("sound",this.checked?"1":"0");if(this.checked)sfx("reach");else musStop()};
$("n-vibe").checked=load("vibe","1")==="1";$("n-vibe").onchange=function(){save("vibe",this.checked?"1":"0");if(this.checked)buzz(15)};
$("n-email").value=NP.email||"";$("n-email").addEventListener("change",function(){NP.email=this.value.trim();saveNP()});
function saveNP(){save("notify",JSON.stringify(NP));var m=$("n-msg"),on=NP.content||NP.tips||NP.compete;
  if(on&&NP.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(NP.email)){m.className="pmsg err";m.textContent="Check your email address.";return}
  if(window.BTU_NOTIFY&&window.BTU_NOTIFY.subscribe)Promise.resolve(window.BTU_NOTIFY.subscribe(NP)).then(function(){m.className="pmsg ok";m.textContent="Saved."},function(){m.className="pmsg err";m.textContent="Saved on this device. We couldn't reach the server."});
  else{m.className="pmsg ok";m.textContent=on?(NP.email?"Saved. We'll email "+NP.email+" when there's news.":"Saved. Add your email so we can reach you."):"Saved. You won't get updates."}}
$("n-device").onclick=function(){var m=$("n-msg");if(!("Notification" in window)){m.className="pmsg err";m.textContent="This browser doesn't support notifications.";return}
  Notification.requestPermission().then(function(p){m.className="pmsg "+(p==="granted"?"ok":"err");m.textContent=p==="granted"?"Notifications are on for this device.":"Notifications are blocked. You can allow them in your browser settings.";
    if(p==="granted"){NP.device=true;saveNP();m.textContent="Notifications are on for this device."}track("notification_permission",{result:p})})};
setSum();courtScale();
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
    else if(D===0)r=(Sp==="slow"&&dropOK())?["drop","Low but slow near the net, and the player you'd drop to is behind their 3 m line. Drop it short in front of them."]:["neutral","Low and slow near the net, with nobody to drop to. Play a neutral ball deep, at medium height and pace, so they can't attack it."];
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
  ["trsit","trball"].forEach(function(k){var e=$(k);if(!e.hidden)popMin(e,$("trsit-tab"),"Set up")});$("trball-tab").hidden=true;buzz(10);
  cmd(SHOTS[id].name+". Select where to hit");if(innerWidth<900)document.querySelector(".court-card").scrollIntoView({behavior:RM?"auto":"smooth",block:"start"})}
var PRESETS=[
 {name:"Their block pops up",s:{side:"fh",depth:"front",speed:"med",height:"high",A:[2,0],B:[2,2]},watch:"pushdig"},
 {name:"Pushed at your feet",s:{side:"body",depth:"mid",speed:"fast",height:"low",A:[0,0],B:[0,2]},watch:"defend"},
 {name:"They're both at the net",s:{side:"fh",depth:"mid",speed:"slow",height:"med",A:[0,0],B:[0,2]},watch:"stepin"},
 {name:"Lobbed over your head",s:{side:"bh",depth:"back",speed:"med",height:"high",A:[0,0],B:[0,2]},watch:"lobcover"},
 {name:"Floating ball, both deep",s:{side:"fh",depth:"front",speed:"slow",height:"med",A:[2,0],B:[2,2]},watch:"droppattern"},
 {name:"Receiving the serve",s:{side:"fh",depth:"mid",speed:"med",height:"low",A:[2,0],B:[1,2]},watch:"receiving"},
 {name:"Disguise chance",s:{side:"fh",depth:"mid",speed:"slow",height:"med",A:[1,0],B:[1,2]},watch:"fake"}];
function usePreset(i){var pr=PRESETS[i];PK.preset=i;["side","depth","speed","height"].forEach(function(k){PK[k]=pr.s[k];save("pk-"+k,pr.s[k])});PK.A=pr.s.A.slice();PK.B=pr.s.B.slice();
  save("pk-opp",JSON.stringify({A:PK.A,B:PK.B}));resetCall();renderList();renderPickInputs();renderPick();
  var e=$("trsit");if(!e.hidden)popMin(e,$("trsit-tab"),"Set up");paintSit()}
function buildCall(){var g=$("aim-grid");if(g.children.length)return;g.appendChild(document.createElement("span"));LAN.forEach(function(n){var h=document.createElement("span");h.className="ax";h.textContent=n;g.appendChild(h)});
  [2,1,0].forEach(function(dI){var lab=document.createElement("span");lab.className="ay";lab.textContent=DEP[dI];g.appendChild(lab);
    [0,1,2].forEach(function(lI){var b=document.createElement("button");b.setAttribute("aria-label","Aim "+cellName([dI,lI]));b.setAttribute("aria-pressed","false");
      b.onclick=function(){[].forEach.call(g.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",String(x===b))});judge([dI,lI])};g.appendChild(b)})})}
function judge5(cell){var ok=shotTiers(PK,PK.answer)[PK.pickShot]===2,exact=PK.pickShot===PK.answer,ic=PK.ideal5,t=aimTier(cell,PK.pickShot||PK.answer,PK,"neutral"),sq=t===0?"right":t===1?"close":"wrong";
  PK.streak=(ok&&sq==="right")?PK.streak+1:0;save("pk-streak",String(PK.streak));PK.revealed=true;PK.chosen=cell;
  track("shot_picker_resolved",{side:PK.side,depth:PK.depth,speed:PK.speed,height:PK.height,picked:PK.pickShot,answer:PK.answer,correct:ok,square:sq});
  renderPick();var c=choose(),tg=target(c.shot),s=SHOTS[PK.answer],b=SHOTS[BACK2[PK.answer]],pr=PRESETS[PK.preset];
  var head=ok&&sq==="right"?"Spot on."+(PK.streak>1?" Streak "+PK.streak+".":""):ok?"Good shot, but the target could be better.":sq==="right"?"Good target, but not the best shot.":"Not this time.";
  var html='<div class="ptres '+(ok&&sq==="right"?"w":ok||sq==="right"?"m":"l")+'"><b>'+head+'</b></div>'+
    '<div class="fbbest"><b>Best play</b><p>'+s.name+" to the "+cellName5(ic).toLowerCase()+".</p></div>"+(pr&&pr.watch?'<button class="btn soft" id="fb-watch">Watch the point</button>':'')+"<!--more-->"+
    fbSec("Shot",exact?"Right shot. "+c.why:ok?"Good. Best: "+s.name.toLowerCase()+". "+c.why:"Best: "+s.name.toLowerCase()+". "+c.why)+tiersHtml(PK,PK.answer,PK.pickShot)+
    fbSec("Where you aimed",(sq==="right"?"Great target, ":sq==="close"?"Close, ":"Risky target, ")+cellName5(cell).toLowerCase()+"."+(sq==="right"?"":" Guto aims "+cellName5(ic).toLowerCase()+". "+tg.txt)+" Green squares are high percentage, orange medium, red low.")+
    fbSec("Opponents",formationText())+fbSec("Wind",windText())+
    fbSec("Then",s.afterH+" Your partner. "+s.afterP)+(b?fbSec("Other option",b.name+". "+(BWHY[PK.answer]||b.when)):"")+
    fbSec("Target",tg.txt);
  ["trsit","trball"].forEach(function(k){var e=$(k);if(!e.hidden)popMin(e,$("trsit-tab"),"Set up")});$("trball-tab").hidden=true;
  fbShow(html,"Try another",function(){resetCall();renderPick()});
  var w=$("fb-watch");if(w)w.onclick=function(){save("id-shots",pr.watch);setTab("shots")};cmd("")}
function judge(cell){var ok=PK.pickShot===PK.answer,ic=PK.ideal,off=Math.abs(cell[0]-ic[0])+Math.abs(cell[1]-ic[1]),sq=off===0?"right":off===1?"close":"wrong";
  PK.streak=(ok&&sq==="right")?PK.streak+1:0;save("pk-streak",String(PK.streak));PK.revealed=true;PK.chosen=cell;
  var v=$("verdict"),shotTxt=ok?"Right shot":"Guto would play "+SHOTS[PK.answer].name.toLowerCase()+", not "+SHOTS[PK.pickShot].name.toLowerCase(),
    sqTxt=sq==="right"?"right square":sq==="close"?"your square was one off. Guto aims "+cellName(ic).toLowerCase():"aim "+cellName(ic).toLowerCase()+" instead";
  v.className="verdict "+(ok&&sq==="right"?"ok":ok||sq!=="wrong"?"mid":"no");
  v.textContent=shotTxt+(ok&&sq==="right"?", right square.":", and "+sqTxt+".")+(ok&&sq==="right"?" Streak "+PK.streak+".":"");
  track("shot_picker_resolved",{side:PK.side,depth:PK.depth,speed:PK.speed,height:PK.height,picked:PK.pickShot,answer:PK.answer,correct:ok,square:sq});
  var pr=PRESETS[PK.preset],wb=$("r-watch");wb.hidden=!(pr&&pr.watch);if(pr&&pr.watch)wb.onclick=function(){save("id-shots",pr.watch);setTab("shots")};
  renderPick();$("reveal").scrollIntoView({behavior:RM?"auto":"smooth",block:"nearest"})}
function resetCall(){PK.revealed=false;PK.pickShot=null;if(state.tab==="pick"){var f=$("fbpop");if(f){f.hidden=true;$("fbtab").hidden=true}cmd("Pick a situation or a shot")}var a=$("aim-step");if(a){a.hidden=true;[].forEach.call(document.querySelectorAll("#aim-grid button"),function(x){x.setAttribute("aria-pressed","false")})}
  if(state.tab==="pick")[].forEach.call($("list").children,function(x){x.setAttribute("aria-current","false")});var h=$("call-hint");if(h)h.textContent="Tap a shot in the row above, then pick where you'd aim it."}
function renderPickInputs(){buildCall();var hb=$("pk-height");if(hb){hb.innerHTML=hbBands(PK.height,false,"pk-height-");$("pk-hfig").src=hbFig()}["side","depth","speed","height"].forEach(pkSeg)}
function renderPick(){var c=choose(),t=target(c.shot),mid=simple(c.shot),s=SHOTS[mid],D=DI[PK.depth];
  var youX=[6.4,3.6,1.0][D],youY=state.side==="L"?2.6:5.4,partner=state.side==="L"?"R":"L";
  var pos={A:oppPos(PK.A),B:oppPos(PK.B)};pos[state.side]=[youX,youY];pos[partner]=[D===0?5.4:3.8,state.side==="L"?5.4:2.6];
  ["A","B","L","R"].forEach(function(k){place(k,pos[k],false);PL[k].ring.setAttribute("opacity",k===state.side?1:0)});
  gM.innerHTML="";drawZones(state.zones,"R","opp");trainAim();

  var cy=youY+(PK.side==="fh"?0.45:PK.side==="bh"?-0.45:0),cx=youX+0.3,src=pos.A[0]<=pos.B[0]?pos.A:pos.B;
  var endH={low:0.4,med:1.4,high:3.0}[PK.height],arc={fast:0.4,med:1.2,slow:2.2}[PK.speed];
  PROF._in={d:{fast:380,med:850,slow:1800}[PK.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  clearTimeout(pkTimer);
  var pm={};pm[pos.A[0]<=pos.B[0]?"A":"B"]=oppPose(PK);setPoses(pm);
  var d1=runBall({f:src,to:[cx,cy],shot:"_in"},false);gauge(PK.height,d1);
  if(PK.revealed)pkTimer=setTimeout(function(){if(simple(c.shot)==="flatsmash")0;runBall({f:[cx,cy],to:t.p,shot:c.shot},true)},d1+450);
  $("call").hidden=PK.revealed;$("reveal").hidden=!PK.revealed;PK.answer=mid;PK.ideal=cellOf(t.p);
  PK.ideal5=bestCell(mid,PK,"neutral",[cellOf(t.p)[0],Math.max(0,Math.min(4,Math.floor(t.p[1]/1.6)))]);
  if(PK.revealed)heatAim(PK.chosen,{shot:PK.pickShot||PK.answer,sit:PK},"neutral",gG);
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

/* Compete. Drag your own player to show where you move */
["L","R"].forEach(function(k){var g=PL[k].g,drag=false,last=null;
  function toM(e){var pt=SVGC.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(WORLD.getScreenCTM().inverse());return [Math.max(0.3,Math.min(7.6,(q.x-60)/40)),Math.max(0.3,Math.min(7.7,(q.y-40)/40))]}
  function live(){return state.tab==="compete"&&k===state.side&&MATCH&&MATCH.cur&&!MATCH.cur.done&&MATCH.cur.from}
  g.addEventListener("pointerdown",function(e){if(!live())return;drag=true;last=null;g.setPointerCapture(e.pointerId);e.preventDefault()});
  g.addEventListener("pointermove",function(e){if(!drag||!live())return;if(MATCH.cur.ghost){MATCH.cur.ghost.remove();MATCH.cur.ghost=null}last=toM(e);place(k,last,true);var t=MATCH.cur.trail;if(t){t.setAttribute("x2",X(last[0]));t.setAttribute("y2",Y(last[1]))}});
  g.addEventListener("pointerup",function(e){if(!drag)return;drag=false;if(!live())return;var cur=MATCH.cur,pos=last||cur.from,dx=pos[0]-cur.from[0];
    if(!cur.mate&&!cur.atBall&&cur.runTo){cur.runTo(pos);return}cur.pick.move=dx>0.6?"in":dx<-0.6?"back":"hold";cur.pick.pos=pos;var h=$("cs-movehint");if(h)h.textContent={in:"Stepping in",hold:"Holding level",back:"Moving back"}[cur.pick.move];maybeResolve()})});

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
 {id:"baloes",R:{aim:0.3,react:.32,run:4.0,back:.55,reach:1.3,ue:.08,fe:.15,shortLob:.35,blunder:.25,hes:.2,bh:.12,attack:.25},pair:"Os Chinelos",from:"Rio",style:"Weekend legends in flip-flops. Everything goes up high, and sometimes it comes down short.",rating:800,tags:["Lob everything", "Slow to the net"],weak:"Short lobs",talk:{"hello": ["Bora! Hope you brought sunscreen. This could take a while.", "We don't smash much. We just wait for you to miss."], "theyWin": ["Too easy, parceiro!", "See? Patience wins.", "The lob gods are with us today."], "youWin": ["Okay, okay. Nice one.", "Lucky! The wind helped you.", "Hey, that one was going out... right?"], "yourErr": ["Thanks for the gift!", "Into the net? We'll take it."], "bigShot": ["Didn't even have to run!", "Wide open, amigo."], "matchPoint": ["One more and it's caipirinha time."], "theyWonMatch": ["Good game! Come back when you can put away a short lob."], "youWonMatch": ["Fine, you win. The next round's on us."]},level:1,time:15,mod:0,
  p:[{n:"Duda",e:"a06",skin:"#C68A5E",hair:"pony",hc:"#2B1B12",shirt:"#FFD23F",bg:"#FFE9A8",visor:"#FF9F1C"},{n:"Leo",e:"a02",skin:"#8D5A3B",hair:"curly",hc:"#1A120D",shirt:"#2ECC71",bg:"#C9F2DA"}],
  gen:{height:[["high",5],["med",3],["low",1]],depth:[["back",3],["mid",4],["front",2]],speed:[["slow",4],["med",4],["fast",1]],opp:[[[2,0],[2,2]],[[1,0],[2,2]],[[2,1],[1,2]]]}},
 {id:"wall",R:{aim:0.45,react:.26,run:4.4,back:.5,reach:1.6,ue:.06,fe:.10,shortLob:.25,blunder:.18,hes:.15,bh:.12,attack:.4},pair:"Muralha",from:"Lisbon",style:"They stand at the net and block everything you hit. Go over the top or through the middle.",rating:1100,tags:["Block everything", "Live at the net"],weak:"Deep lobs",talk:{"hello": ["Nothing gets past us.", "Hit it hard. It's coming back."], "theyWin": ["Straight back.", "The wall's still standing.", "Too easy."], "youWin": ["Over the top. Nice.", "Okay, that one got through.", "Won't happen twice."], "yourErr": ["Thanks for that one.", "Out by a mile."], "bigShot": ["Right through the gap."], "matchPoint": ["Match point. Brace yourselves."], "theyWonMatch": ["Good effort. Try going over us next time."], "youWonMatch": ["Great match. You found the way through."]},level:2,time:14,mod:.05,
  p:[{n:"Kiri",e:"a10",skin:"#B07850",hair:"bun",hc:"#3A2414",shirt:"#00C2B8",bg:"#BFEDEA"},{n:"Sam",e:"a03",skin:"#F1C7A1",hair:"cap",hc:"#0077B6",shirt:"#0077B6",bg:"#CFE6F5"}],
  gen:{height:[["low",4],["med",4],["high",1]],depth:[["mid",4],["front",3],["back",1]],speed:[["fast",4],["med",3],["slow",2]],opp:[[[0,0],[0,2]],[[0,0],[0,1]],[[0,1],[0,2]],[[0,0],[1,2]]]}},
 {id:"breeze",R:{aim:0.6,react:.24,run:4.8,back:.6,reach:1.5,ue:.05,fe:.08,shortLob:.18,blunder:.12,hes:.08,bh:.1,attack:.55},pair:"Hammer Time",from:"Rimini, Italy",style:"A huge serve and a smasher who steals the middle. If it sits up, it's gone.",rating:1400,tags:["Big serve", "Poach the middle"],weak:"The line",talk:{"hello": ["Ciao! Hope you like fast serves.", "I take the middle. All of it."], "theyWin": ["Boom! Did you see that?", "Mamma mia, too fast for you.", "The middle is mine, always."], "youWin": ["Bravo... don't get used to it.", "Okay, that was good. Molto bene."], "yourErr": ["Grazie mille!", "Pressure, eh?"], "bigShot": ["Hammer time!"], "matchPoint": ["Last point. Ready?"], "theyWonMatch": ["Too much hammer. Come back stronger."], "youWonMatch": ["Complimenti! You handled the hammer."]},level:3,time:13,mod:.08,
  p:[{n:"Marco",e:"a01",skin:"#E3B08A",hair:"short",hc:"#4A2E1A",shirt:"#FF4D6D",bg:"#FFD1DA"},{n:"Inês",e:"a09",skin:"#D9A27A",hair:"pony",hc:"#1E1E1E",shirt:"#0D1B2A",bg:"#D6DCE4",visor:"#FF4D6D"}],
  gen:{height:[["med",4],["high",3],["low",3]],depth:[["mid",4],["front",3],["back",2]],speed:[["fast",4],["med",4],["slow",1]],opp:[[[0,1],[1,2]],[[0,0],[1,2]],[[1,0],[0,2]],[[0,0],[0,2]]]}},
 {id:"feather",R:{aim:0.7,react:.2,run:5.2,back:.65,reach:1.55,ue:.04,fe:.06,shortLob:.1,blunder:.08,hes:.1,bh:.08,attack:.7},pair:"The Magicians",from:"Florianópolis, Brazil",style:"Drop shots, fake lobs and disguise. They pull you in, then send it over your head.",rating:1700,tags:["Drop then lob", "Disguise"],weak:"Pace at the body",talk:{"hello": ["Watch closely. You still won't see it coming.", "Drop or lob? Even we don't know yet."], "theyWin": ["Now you see it, now you don't.", "Gotcha. It was a drop.", "Too slow, too far back."], "youWin": ["Ooh, you read that one.", "Okay, you've seen that trick before."], "yourErr": ["Pressure does funny things.", "Abracadabra... out!"], "bigShot": ["Over you, and gone."], "matchPoint": ["Last trick coming up."], "theyWonMatch": ["Magic beats muscle. Work on reading the ball."], "youWonMatch": ["You saw through every trick. Respect."]},level:4,time:12,mod:.1,
  p:[{n:"Ana",e:"a12",skin:"#A86B45",hair:"curly",hc:"#2A160C",shirt:"#FF9F1C",bg:"#FFDDB3"},{n:"Teo",e:"a11",skin:"#E8BE98",hair:"short",hc:"#C77A2E",shirt:"#2ECC71",bg:"#CDEFD9"}],
  gen:{height:[["low",4],["med",4],["high",2]],depth:[["front",3],["mid",4],["back",2]],speed:[["slow",5],["med",3],["fast",1]],opp:[[[1,0],[2,2]],[[2,0],[2,2]],[[0,0],[2,2]],[[1,1],[2,0]]]}},
 {id:"champs",R:{aim:0.85,react:.16,run:5.8,back:.75,reach:1.7,ue:.02,fe:.04,shortLob:.05,blunder:.03,hes:.03,bh:.05,attack:.85},pair:"Kings of the Sand",from:"World No. 1",style:"The best pair on the tour. No weak side. They punish every slow decision and every gap.",rating:2100,tags:["No weak side", "Read everything"],weak:"None. Build the point",talk:{"hello": ["Show us something we haven't seen.", "Every slow decision is a point for us."], "theyWin": ["Too slow.", "Expected that.", "You left the middle open."], "youWin": ["Good point. Do it again.", "Hm. Not bad."], "yourErr": ["That's what playing No. 1 feels like."], "bigShot": ["We read it before you hit it."], "matchPoint": ["This is where champions are made."], "theyWonMatch": ["Close. Come back when you're ready."], "youWonMatch": ["Incredible. You're the new Kings of the Sand."]},level:5,time:10,mod:.14,
  p:[{n:"Rafa",e:"a05",skin:"#9C6644",hair:"cap",hc:"#FFD23F",shirt:"#0D1B2A",bg:"#FFE9A8"},{n:"Lia",e:"a07",skin:"#F0C9A6",hair:"bun",hc:"#1A1A1A",shirt:"#FFD23F",bg:"#0D1B2A"}],
  gen:{height:[["high",3],["med",4],["low",3]],depth:[["front",3],["mid",4],["back",3]],speed:[["fast",3],["med",4],["slow",3]],opp:[[[0,0],[0,2]],[[2,0],[2,2]],[[0,0],[2,2]],[[1,0],[1,2]],[[0,1],[2,2]]]}}];
var MOVES=[["in","Step in"],["hold","Hold level"],["back","Move back"]],MOVE_OK={hook:"hold",push:"in",flatsmash:"in",lob:"in",drop:"in",neutral:"hold",dig:"hold"};
var MATCH=null,cTimer=null,cTick=null,WIN_AT=7;
function wpick(a){var t=0;a.forEach(function(x){t+=x[1]});var r=Math.random()*t;for(var i=0;i<a.length;i++){r-=a[i][1];if(r<=0)return a[i][0]}return a[0][0]}
function beaten(){try{return JSON.parse(load("sand-beaten","{}"))||{}}catch(e){return {}}}
function eb(e){return '<span class="eb" aria-hidden="true">'+avImg(e)+'</span>'}
function pairSvg(r){return '<span class="av-pair">'+eb(rAv(r,0))+eb(rAv(r,1))+'</span>'}
/* Decision clock. Short, like the real thing. Set by your level, the ball coming at you and the pair you play. Practice mode has no clock */
var LVT={beginner:12,intermediate:9,advanced:6,pro:4},BALLT={push:.6,flatsmash:.55,hook:.75,dig:.85,neutral:1,drop:.9,lob:1.2};
state.clock=load("clock","match");state.pmode=load("pmode","beat");state.btpace=load("btpace","normal");state.btpick=load("btpick","choose");
function decideSecs(r,kind){if(state.clock==="practice")return 0;var b=LVT[state.level]||9,cur=MATCH&&MATCH.cur,f=1;
  if(kind==="serve")f=1.6;else if(cur&&cur.mate)f=0.9;else if(cur&&cur.srv==="opp"&&!cur.rally)f=0.8;else if(cur&&cur.sit)f=BALLT[cur.sit.shot||oppPose(cur.sit)]||1;
  return Math.max(kind==="serve"?5:3,Math.round(b*f*(1-((r.level||1)-1)*0.08)*10)/10)}
/* Lobby. The next pair up front with their banter, the ladder below */
var lobSel=null;
function rivalOpen(i){var bt=beaten();return i===0||!!bt[RIVALS[i-1].id]||!!bt[RIVALS[i].id]}
function sayLine(r,key){var t=(r.talk&&r.talk[key])||[];return t.length?t[Math.floor(Math.random()*t.length)]:""}
function renderLobby(list){var bt=beaten(),w=document.createElement("div");w.className="lobby";var md=document.createElement("div");md.className="pmode";md.innerHTML='<div class="seg" role="group" aria-label="Game type"><button data-m="beat" aria-pressed="'+(state.pmode!=="arcade")+'"><b>Tactics</b><small>Both sides choose at once</small></button><button data-m="arcade" aria-pressed="'+(state.pmode==="arcade")+'"><b>Arcade</b><small>Real-time, unranked</small></button></div>';
  md.insertAdjacentHTML("beforeend",'<div class="seg pace" role="group" aria-label="Timer"><span>Timer</span>'+[["quick","Quick"],["normal","Normal"],["relaxed","Relaxed"],["off","Off"]].map(function(o){return '<button data-pace="'+o[0]+'" aria-pressed="'+(state.btpace===o[0])+'">'+o[1]+'</button>'}).join("")+'</div><div class="seg pace" role="group" aria-label="Shot choice"><span>Shots</span>'+[["auto","Auto-pick"],["choose","I choose"]].map(function(o){return '<button data-pick="'+o[0]+'" aria-pressed="'+(state.btpick===o[0])+'">'+o[1]+'</button>'}).join("")+'</div><small class="build">Build '+BTU_BUILD+'</small>');
  [].forEach.call(md.querySelectorAll("[data-pick]"),function(b){b.onclick=function(){state.btpick=b.dataset.pick;save("btpick",state.btpick);[].forEach.call(md.querySelectorAll("[data-pick]"),function(x){x.setAttribute("aria-pressed",String(x===b))})}});
  [].forEach.call(md.querySelectorAll("[data-pace]"),function(b){b.onclick=function(){state.btpace=b.dataset.pace;save("btpace",state.btpace);[].forEach.call(md.querySelectorAll("[data-pace]"),function(x){x.setAttribute("aria-pressed",String(x===b))})}});list.appendChild(md);[].forEach.call(md.querySelectorAll("[data-m]"),function(b){b.onclick=function(){state.pmode=b.dataset.m;save("pmode",state.pmode);[].forEach.call(md.querySelectorAll("[data-m]"),function(x){x.setAttribute("aria-pressed",String(x===b))})}});
  if(lobSel==null){lobSel=0;for(var j=0;j<RIVALS.length;j++){if(rivalOpen(j)&&!bt[RIVALS[j].id]){lobSel=j;break}lobSel=j}}
  w.innerHTML=RIVALS.map(function(x,i){var op=rivalOpen(i),b2=bt[x.id],on=i===lobSel&&op,who=Math.random()<.5?0:1;
    return '<div class="rung'+(on?" on":"")+(op?"":" lock")+'" data-i="'+i+'"><button class="rhead" aria-expanded="'+on+'"><span class="rav">'+avImg(rAv(x,0))+avImg(rAv(x,1))+'</span><span class="rt"><b>'+x.pair+'</b></span><span class="rs">'+(b2?'<i class="tick">&#10003;</i>':op?'':'<i class="lk" aria-label="Locked">&#00776F;</i>')+'</span></button>'+
      (on?'<div class="rbody"><button class="btn primary big" data-play="'+i+'">'+(b2?"Rematch":"Play")+'</button><small class="rmeta">First to '+WIN_AT+'</small></div>':'')+'</div>'}).join("");
  list.appendChild(w);
  [].forEach.call(w.querySelectorAll(".rung"),function(r){var i=+r.dataset.i;r.querySelector(".rhead").onclick=function(){if(!rivalOpen(i)){r.classList.remove("shake");void r.offsetWidth;r.classList.add("shake");toast("Beat "+RIVALS[i-1].pair+" first");return}lobSel=i;renderList()}});
  var pb=w.querySelector("[data-play]");if(pb)pb.onclick=function(){startMatch(RIVALS[+pb.dataset.play])}}
function toast(t){var e=$("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="toast";e.setAttribute("role","status");document.body.appendChild(e)}e.textContent=t;e.classList.remove("go");void e.offsetWidth;e.classList.add("go")}
/* Floating shot buttons on the left of the court, only when it is time to play */
function shotRail(sel,onPick,mode){var box=$("cmd")&&$("cmd").parentNode;if(!box)return;var r=$("shotrail");if(!r){r=document.createElement("div");r.id="shotrail";r.className="shotrail";r.setAttribute("role","group");r.setAttribute("aria-label","Your shot");box.appendChild(r)}
  var comp=state.tab==="compete",ids=VISIBLE.filter(function(v){return v!=="serve"});if(comp)ids=["serve"].concat(ids);
  r.innerHTML=ids.map(function(id){var ic=ICON[id],off=mode==="idle"||(mode==="serve"?id!=="serve":id==="serve");
    return '<button data-v="'+id+'" aria-pressed="'+(sel===id)+'"'+(off?' disabled':'')+' aria-label="'+SHOTS[id].name+'"><span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span><small>'+SHOTS[id].name.replace(" ball","").replace(" shot","")+'</small></button>'}).join("");
  r.className="shotrail"+(mode?" m-"+mode:"");r.hidden=false;document.body.classList.add("railon");
  [].forEach.call(r.children,function(b){b.onclick=function(e){e.stopPropagation();if(b.disabled||!onPick)return;[].forEach.call(r.children,function(x){x.setAttribute("aria-pressed",String(x===b))});onPick(b.dataset.v)}})}
function railOff(force){if(!force&&state.tab==="compete"&&MATCH&&MATCH.cur){shotRail(null,null,"idle");return}var r=$("shotrail");if(r)r.hidden=true;document.body.classList.remove("railon")}
/* Speech bubbles over the players on court */
function bubble(k,text,cls,ms){var box=document.querySelector(".court-box"),pl=PL[k];if(!box||!pl)return;
  var b=document.createElement("div");b.className="cbub "+(cls||"");b.textContent=text;box.appendChild(b);
  /* Follow the player while it shows, the court can resize under it */
  (function loop(){if(!b.isConnected)return;var r=box.getBoundingClientRect(),pr=(pl.t&&pl.t.img?pl.t.img:pl.g).getBoundingClientRect();if(pr.width){var top=pr.top-r.top,bl=top<60;
    b.classList.toggle("below",bl);b.style.left=Math.max(80,Math.min(r.width-80,pr.left+pr.width/2-r.left))+"px";b.style.top=(bl?pr.bottom-r.top+2:top-2)+"px"}requestAnimationFrame(loop)})();
  setTimeout(function(){b.classList.add("out");setTimeout(function(){b.remove()},300)},ms||2400)}
var MATE_TALK={win:["Boa!","Vamos!","Great shot!","Yes! Keep going."],err:["Mine next.","Shake it off.","All good. Next one.","We've got this."],mp:["One more!","Finish it!"],mine:["Mine!"],yours:["Yours!"]};
function mateKey(){return state.side==="L"?"R":"L"}
function mateSay(key,p){if(p!=null&&Math.random()>p)return;var t=MATE_TALK[key];bubble(mateKey(),t[Math.floor(Math.random()*t.length)],"mate",1800)}
/* Banter. A speech bubble from one of them, now and then */
var banterT=null;
function banter(key,force){return;/* opponent chatter switched off */var m=MATCH;if(!m||!m.r.talk)return;if(!force&&Math.random()>0.6)return;var line=sayLine(m.r,key);if(!line)return;var who=Math.random()<.5?0:1,e=$("banter");if(!e)return;
  bubble(who===0?"A":"B",line,"rival",2800)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function lobbyPanel(){if(oppPill){oppPill.remove();oppPill=null}gauge(null);clearAim();hideServeUI();hideShotUI();$("ctimer").hidden=true;$("cwind").hidden=true;setPoses({});if(state.tab==="compete"){state.wind="calm";drawWind()}document.body.classList.remove("c-live");document.body.classList.add("lobby-on");$("csit").hidden=true;$("cpanel").innerHTML="";
  ["A","B","L","R"].forEach(function(k){place(k,{A:[12.5,2.7],B:[12.5,5.3],L:[4.5,2.7],R:[4.5,5.3]}[k],true)});runBall(null)}
var MWIND={baloes:[["calm",5],["breezy",3],["gusty",1]],wall:[["calm",3],["breezy",4],["gusty",2]],breeze:[["calm",2],["breezy",4],["gusty",3]],feather:[["calm",2],["breezy",4],["gusty",3]],champs:[["calm",2],["breezy",3],["gusty",4]]};
function startMatchLP(){LASTPT=""}
function startMatch(r){LASTPT="";musStart();document.body.classList.remove("beat");var bh=$("bthab");if(bh)bh.hidden=true;MATCH={mode:state.pmode==="arcade"?"arcade":"beat",r:r,me:0,them:0,log:[],right:0,points:0,cur:null,st:{w:0,fe:0,tue:0,ue:0,gap:0,open:0,conv:0,combo:0}};
  state.wind=wpick(MWIND[r.id]||[["calm",1]]);state.windA=90*Math.floor(Math.random()*4);MATCH.wind=state.wind;drawWind();renderLegend();$("selector").hidden=true;$("score").hidden=false;track("match_started",{rival:r.id});
  document.querySelector(".court-card").scrollIntoView({behavior:RM?"auto":"smooth",block:"start"});document.body.classList.remove("lobby-on");newPoint();setTimeout(function(){if(MATCH&&MATCH.r===r)banter("hello",true)},900)}
function leaveMatch(){lvStop();if(typeof bPhase==="function")bPhase("");document.body.classList.remove("btrecv");musStop();if(typeof BT!=="undefined"){clearTimeout(BT.clk);bDock("")}document.body.classList.remove("beat");railOff(true);fbToastOff();resBar(null);document.body.classList.remove("hasres");var bn=$("banter");if(bn)bn.classList.remove("go");if(oppPill){oppPill.remove();oppPill=null}gauge(null);hideServeUI();hideShotUI();$("ctimer").hidden=true;$("cwind").hidden=true;clearTimeout(cTimer);clearInterval(cTick);MATCH=null;railOff(true);$("score").hidden=true;$("csit").hidden=true;$("selector").hidden=false;clearAim();document.body.classList.remove("c-live")}
/* On-court aim. Nine squares on the opponents' side */
var gA=el("g",{id:"g-aim"},WORLD),gTag=el("g",{id:"g-tag","pointer-events":"none"},WORLD);
function clearAim(){if(gA)gA.innerHTML="";if(typeof ballTag!=="undefined"&&ballTag&&!(MATCH&&MATCH.cur&&!MATCH.cur.done)){ballTag.remove();ballTag=null}}
var AX=[[8,11],[11,14],[14,16]],AY=[[0,1.6],[1.6,3.2],[3.2,4.8],[4.8,6.4],[6.4,8]],LAN5=["Left line","Left","Middle","Right","Right line"];
function cellName5(c){return (DEP[c[0]]+" "+LAN5[c[1]].toLowerCase()).replace("Middle middle","Middle of the court")}
/* Picture cues. Whatever comes next pulses */
function cue(k){document.body.classList.toggle("cue-rail",k==="rail");document.body.classList.toggle("cue-aim",k==="aim");document.body.classList.toggle("cue-move",k==="move");
  var o=document.getElementById("mvcue");if(k==="move"&&!o&&typeof gM!=="undefined"){o=el("rect",{id:"mvcue",x:X(0)+3,y:Y(0)+3,width:X(8)-X(0)-6,height:Y(8)-Y(0)-6,rx:6,fill:"#00A79E","fill-opacity":0.12,stroke:"#00A79E","stroke-width":3,"stroke-dasharray":"8 8","pointer-events":"none"},gM)}else if(k!=="move"&&o)o.remove()}
function serveHint(on){var h=$("svhint");if(!on){if(h)h.remove();return}if(h)return;var box=$("cmd")&&$("cmd").parentNode;if(!box)return;h=document.createElement("div");h.id="svhint";h.className="svhint";h.setAttribute("aria-hidden","true");
  h.innerHTML='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="9" fill="#fff" stroke="#0D1B2A" stroke-width="3"/></svg><span>Flick to serve</span>';box.appendChild(h)}
function drawAim(onPick,onMove){clearAim();
  if(onMove){var mv=el("rect",{x:X(0),y:Y(0),width:X(8)-X(0),height:Y(8)-Y(0),fill:"#FFFFFF","fill-opacity":0,"class":"mvarea",style:"cursor:crosshair"},gA);
  mv.addEventListener("click",function(e){var pt=SVGC.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(WORLD.getScreenCTM().inverse());
    onMove([Math.max(0.3,Math.min(7.6,(q.x-60)/40)),Math.max(0.3,Math.min(7.7,(q.y-40)/40))])})}
  if(!onPick)return;
  for(var d=0;d<3;d++)for(var l=0;l<5;l++)(function(d,l){var g=el("g",{"class":"ac",tabindex:"0",role:"button","aria-label":"Aim "+cellName5([d,l]),"data-c":d+","+l},gA);
    var x0=X(AX[d][0]),y0=Y(AY[l][0]),w=X(AX[d][1])-x0,h=Y(AY[l][1])-y0;
    el("rect",{x:x0,y:y0,width:w,height:h,fill:"#FFFFFF","fill-opacity":0},g);
    var go=function(){sfx("aim",{d:d});onPick([d,l]);markAim([d,l])};g.addEventListener("click",go);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})})(d,l);
  var ln=el("g",{"pointer-events":"none"},gA),st={stroke:"#0D1B2A","stroke-opacity":0.6,"stroke-width":2.5,"stroke-dasharray":"1 7","stroke-linecap":"round"};
  [11,14].forEach(function(x){el("line",Object.assign({x1:X(x),y1:Y(0),x2:X(x),y2:Y(8)},st),ln)});
  [1.6,3.2,4.8,6.4].forEach(function(y){el("line",Object.assign({x1:X(8),y1:Y(y),x2:X(16),y2:Y(y)},st),ln)})}
/* Shouts over the court and the contact height gauge */
var shoutT=null;function shout(txt,cls,sub){var e=$("shout");if(!e)return;clearTimeout(shoutT);e.className="shout";e.innerHTML=txt+(sub?"<small>"+sub+"</small>":"");void e.offsetWidth;e.className="shout go "+(cls||"");shoutT=setTimeout(function(){e.className="shout"},/long/.test(cls||"")?2500:1700)}
function cheer(won,pair){return;shout(Math.random()<.5?"LET&rsquo;S GOOO!":"COME ONN!!",(won?"":"them")+" long",won?"":pair)}
var GY={low:147,med:96,high:44},gaugeRAF=null;
function gauge(h,anim){var g=$("hgauge"),b=$("hg-ball");if(!g)return;g.hidden=true;return;if(!h){g.hidden=true;return}g.hidden=false;g.className="hgauge";cancelAnimationFrame(gaugeRAF);
  if(!anim||RM){b.setAttribute("transform","translate(32 "+GY[h]+")");g.classList.add("on-"+h);return}
  var t0=performance.now(),from=12,to=GY[h],dur=anim;b.setAttribute("transform","translate(32 "+from+")");
  (function step(t){var k=Math.min(1,(t-t0)/dur),y=from+(to-from)*k-(h==="high"?0:Math.sin(Math.PI*k)*10);b.setAttribute("transform","translate(32 "+y.toFixed(1)+")");
    if(k<1)gaugeRAF=requestAnimationFrame(step);else g.classList.add("on-"+h)})(t0)}
function ripple(d,l){var c=svTarget([d,l]),r=el("circle",{cx:X(c[0]),cy:Y(c[1]),r:6,fill:"none",stroke:"#0D1B2A","stroke-width":3,"class":"ripple","pointer-events":"none"},gTag);setTimeout(function(){r.remove()},600)}
function markAim(c,best){[].forEach.call(gA.children,function(g){var k=g.getAttribute("data-c");if(!k)return;var r=g.firstChild,on=c&&k===c[0]+","+c[1],ok=best&&k===best[0]+","+best[1];
  r.setAttribute("fill",ok?"#2ECC71":on?"#FFD23F":"#FFFFFF");r.setAttribute("fill-opacity",ok?0.4:on?0.5:0)})}
function renderScore(){var m=MATCH,r=m.r;$("score").innerHTML='<div class="team"><span class="av-pair">'+eb(state.emoji,"#FFF3C4")+eb(state.mate,"#DDF6F3")+'</span><span class="names"><b>'+(state.name?esc(state.name):"You")+'</b><small>and your partner</small></span></div>'+
  '<div class="pts"><span>'+m.me+'</span><i>–</i><span>'+m.them+'</span></div><span class="pips" id="pips" role="img" aria-label="Pressure 0 of 3"><i></i><i></i><i></i></span>'+
  '<div class="team them"><span class="names"><b>'+r.pair+'</b><small>'+r.p[0].n+' and '+r.p[1].n+'</small></span>'+pairSvg(r)+'</div>'+
  '<div class="log">'+m.log.map(function(x){return '<span class="'+x+'"></span>'}).join("")+'</div><button class="cmus ctime" id="c-time" aria-label="Timer: '+(state.btpace||"normal")+'" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 9v4l3 2M9 3h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button><button class="cexit" id="c-exit" aria-label="Leave match"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>';
  $("c-time").onclick=function(e){e.stopPropagation();var b=this,pp=$("timepop");if(pp){pp.remove();b.setAttribute("aria-expanded","false");return}
    pp=document.createElement("div");pp.id="timepop";pp.className="timepop";pp.setAttribute("role","menu");
    pp.innerHTML='<b>Timer</b>'+[["quick","Quick"],["normal","Normal"],["relaxed","Relaxed"],["off","Off"]].map(function(o){return '<button role="menuitemradio" data-pace="'+o[0]+'" aria-checked="'+(state.btpace===o[0])+'">'+o[1]+'</button>'}).join("")+'<b>Shots</b>'+[["auto","Auto-pick"],["choose","I choose"]].map(function(o){return '<button role="menuitemradio" data-pick="'+o[0]+'" aria-checked="'+(state.btpick===o[0])+'">'+o[1]+'</button>'}).join("")+'<small>Applies from your next shot</small>';
    $("score").appendChild(pp);b.setAttribute("aria-expanded","true");
    [].forEach.call(pp.querySelectorAll("[data-pick]"),function(x){x.onclick=function(ev){ev.stopPropagation();state.btpick=x.dataset.pick;save("btpick",state.btpick);pp.remove();b.setAttribute("aria-expanded","false");toast("Shots: "+x.textContent)}});
    [].forEach.call(pp.querySelectorAll("[data-pace]"),function(x){x.onclick=function(ev){ev.stopPropagation();state.btpace=x.dataset.pace;save("btpace",state.btpace);b.setAttribute("aria-label","Timer: "+state.btpace);pp.remove();b.setAttribute("aria-expanded","false");toast("Timer: "+x.textContent)}});
    setTimeout(function(){document.addEventListener("click",function cl(){var q=$("timepop");if(q)q.remove();b.setAttribute("aria-expanded","false");document.removeEventListener("click",cl)})},0)};
  $("c-exit").onclick=function(){runBall(null);leaveMatch();if(typeof renderList==="function")renderList();if(typeof lobbyPanel==="function")lobbyPanel()}}
/* Real-game checks. No smash off a serve. Smash only on a high ball within about 4.5 m, further back it is a hook or soft brush smash */
function realShot(sit,c){var s=simple(c.shot);
  if(sit.ret&&(s==="flatsmash"||s==="hook"||s==="lob"&&sit.height==="low"&&sit.speed==="fast"))return sit.height==="med"&&sit.speed!=="fast"?{shot:"push",why:"Return of serve at net height. Push it firm and low at the server as they come in."}:sit.speed==="fast"?{shot:"dig",why:"A fast serve that dips. Block it back long and deep, no big swing."}:{shot:"neutral",why:"The serve dips low, so lift it deep and neutral, ideally to the backhand."};
  if(sit.height==="high"&&sit.depth==="back"&&s==="flatsmash")return {shot:"hook",why:"High but you are deep, past about 4.5 m. Play a hook or soft brush smash deep to the middle, not a hard smash."};
  return c}
function solveSit(sit){var keep={side:PK.side,depth:PK.depth,speed:PK.speed,height:PK.height,A:PK.A,B:PK.B};PK.side=sit.side;PK.depth=sit.depth;PK.speed=sit.speed;PK.height=sit.height;PK.A=sit.A;PK.B=sit.B;
  var c=choose();c=realShot(sit,c);var t=target(c.shot);for(var k in keep)PK[k]=keep[k];var near=[cellOf(t.p)[0],Math.max(0,Math.min(4,Math.floor(t.p[1]/1.6)))],c5=bestCell(c.shot,sit,"neutral",near);return {shot:simple(c.shot),raw:c.shot,why:c.why,p:svTarget(c5),cell:cellOf(svTarget(c5)),cell5:c5,txt:t.txt}}
/* What comes back. The likely reply to each shot, from the pro match logs and coaching notes.
   Each row lists the opponents' replies with a base weight. Weights then shift with depth, pace, where you stand, the wind and the forehand */
var REPLY_TXT={drop:"Drop shot",neutral:"Neutral ball",push:"Push",lob:"Lob",hook:"Hook",flatsmash:"Smash",dig:"Block"};
function replyCtx(sh,cell,speed,move,q,by){var o={shot:simple(sh),d:cell?cell[0]:1,l:cell?cell[1]:2,speed:speed||"neutral",move:move||"hold",q:q||"ok",by:by||"me"};return o}
function replyRows(c){var r=[],add=function(k,w,why,to){r.push({k:k,w:w,why:why,to:to||"either"})},S=c.speed,D=c.d,wide=c.l===0||c.l===4,
    skill=MATCH?Math.max(0,RIVALS.indexOf(MATCH.r))/Math.max(1,RIVALS.length-1):0.5;
  switch(c.shot){
  case "serve":
    add("drop",40,"Off the serve they drop it short at the server as they move in.","server");
    add("neutral",45,"A neutral return to the middle, medium height and pace, to start the rally.","either");
    add("push",D===0||S==="slow"||c.q==="risky"?35:8,D===0||S==="slow"?"A short or slow serve sits up, so they push it hard at the server.":"They take the serve early and push it at the server's feet.","server");
    add("lob",4,"Rare off a serve. A lob over the partner.","either");break;
  case "flatsmash":
    add("lob",55,"Under a smash the defender lifts a high, deep lob to buy time.","either");
    add("dig",30,"They block the smash back low at medium pace.","either");
    add("drop",8+22*skill,"A very good defender softens the smash into a drop.","either");
    if(S==="slow"||c.q==="risky")add("neutral",25,"The smash had no pace, so they reset with a neutral ball.","either");break;
  case "hook":case "lob":
    if(D===2){add("hook",c.shot==="hook"?55:45,"Your ball went high and deep behind them, so they answer with a hook from the back.","either");
      add("lob",c.shot==="lob"?30:22,"Pushed right back, they send a high recovery lob.","either");add("neutral",20,"They reset with a neutral ball to the middle.","either")}
    else{add("flatsmash",D===1?60:80,"Your ball landed around 3 to 4 m, in smashing range, so they smash it back.","either");
      add("hook",D===1?20:5,"Slightly behind them, so a hook rather than a full smash.","either");add("push",15,"They take it early and push it down at you.","either")}
    break;
  case "drop":
    var perfect=D===0&&S==="slow";
    if(perfect){add("drop",50,"They reply to a good drop with a cross-court drop.","either");add("lob",32,"From low at the net they flick a lob over you.","either");add("neutral",15,"They lift it neutral to the middle.","either")}
    else{add("push",60,"The drop wasn't tight, so they get there early and push it hard.","either");add("flatsmash",20,"The drop sat up above the net. They put it away.","either");add("drop",20,"They answer with a drop back.","either")}
    if(wide)add("push",45,"Your drop went wide cross court, so they push it down the line past your partner.","mate");break;
  case "neutral":
    add("neutral",45,"Neutral meets neutral. They send it back to the middle at medium pace.","either");
    add("push",D===0?45:20,D===0?"Your neutral ball dropped short, so they step in and push it.":"They attack a neutral ball that sits up.","either");
    add("lob",20,"They lob over the player at the net.","either");add("drop",15,"They change the rhythm with a drop.","either");break;
  case "push":
    add("dig",45,"The defender blocks your push back low at medium pace.","either");
    add("lob",30,"Under pressure they lift a lob.","either");
    add("push",S==="slow"?45:25,S==="slow"?"A slow push gives them time to push straight back.":"They push it back at you.","either");break;
  case "dig":default:
    add("push",45,"Your block came up, so the net team pushes it down.","either");
    add("flatsmash",D===0||S==="slow"?40:15,"The block sat up short. They smash it.","either");
    add("neutral",D===2?40:20,D===2?"Your block went long and deep, so they can only reset neutral.":"They reset with a neutral ball.","either");
    add("drop",10,"They drop it short.","either")}
  /* Where you stand: space is where they play */
  if(c.shot!=="serve")r.forEach(function(x){if(c.move==="in"){if(x.k==="lob")x.w*=(c.shot==="lob"||c.shot==="hook")&&c.d===2?1:1.6;if(x.k==="drop")x.w*=0.6}if(c.move==="back"){if(x.k==="drop")x.w*=1.8;if(x.k==="lob")x.w*=0.4}});
  /* Close to them on the forehand: expect it back hard */
  if(c.fh)r.forEach(function(x){if(x.k==="push"||x.k==="flatsmash")x.w*=2.2});
  /* Wind. Lobs into the wind fall short. Lobs with it carry */
  var v=windV(),mw=state.wind==="gusty"?1:state.wind==="breezy"?0.5:0;
  if(mw)r.forEach(function(x){if(v[0]>0.7){if(x.k==="lob")x.w*=1-0.6*mw;if(x.k==="drop")x.w*=1+0.4*mw}if(v[0]<-0.7){if(x.k==="lob")x.w*=1+0.6*mw;if(x.k==="drop")x.w*=1-0.4*mw}});
  var m={};r.forEach(function(x){if(m[x.k]&&m[x.k].w>=x.w){m[x.k].w+=x.w*0.3;return}if(m[x.k])x.w+=m[x.k].w*0.3;m[x.k]=x});
  var out=Object.keys(m).map(function(k){return m[k]}),t=0;out.forEach(function(x){t+=x.w});out.forEach(function(x){x.pct=Math.round(100*x.w/t)});
  return out.sort(function(a,b){return b.w-a.w})}
/* Turn the chosen reply into the ball that comes to you */
var REPLY_BALL={drop:{depth:"front",height:"low",speed:"slow"},neutral:{depth:"mid",height:"med",speed:"med"},push:{depth:"mid",height:"med",speed:"fast"},
  lob:{depth:"back",height:"high",speed:"slow"},hook:{depth:"back",height:"med",speed:"fast"},flatsmash:{depth:"mid",height:"low",speed:"fast"},dig:{depth:"mid",height:"med",speed:"med"}};
function applyReply(cur,c,hitter,team){var rows=replyRows(c),pick=wpick(rows.map(function(x){return [x,x.w]})),b=REPLY_BALL[pick.k],
    sit={shot:pick.k,depth:b.depth,height:b.height,speed:b.speed,side:pick.k==="neutral"?"body":wpick([["fh",4],["body",2],["bh",3]])};
  if(pick.k==="neutral"&&Math.random()<0.35)sit.speed="slow";
  if(pick.k==="lob"){sit.side="bh";var into=state.wind!=="calm"&&windV()[0]>0.7;if(Math.random()<(into?0.5:0.2)){sit.depth="mid";pick=Object.assign({},pick,{why:pick.why+(into?" Into the wind it falls short.":" It came up short.")})}}
  /* Where the opponents end up. The hitter is where your ball went, the partner covers */
  var hd=Math.min(2,c.d),pd={lob:Math.max(1,hd),hook:2,dig:Math.max(1,hd),drop:0,push:0,flatsmash:0,neutral:1}[pick.k];
  var hk=hitter||(c.l<=2?"A":"B"),ok=hk==="A"?"B":"A";sit[hk]=[hd,hk==="A"?0:2];sit[ok]=[pd,ok==="A"?0:2];
  var mate=pick.to==="mate"?true:pick.to==="server"?c.by==="mate":Math.random()<0.3;
  if(team)mate=placeBall(sit,pick.k,team,pick.to==="server"?(c.by==="mate"?"mate":"me"):null,false,sit.depth==="mid"&&pick.k==="lob",false);
  cur.sit=sit;cur.mate=mate;cur.srcKey=hk;cur.why=pick.why;cur.rows=rows;return pick}
function nearFH(cell,sit){if(!cell||!sit)return false;var t=svTarget(cell);return ["A","B"].some(function(k){var o=oP(sit,k);return o&&o[0]<11.5&&Math.abs(t[0]-o[0])<2&&t[1]<o[1]&&o[1]-t[1]<1.6})}
function replyListHtml(rows){return rows.slice(0,3).map(function(x){return x.pct+"% "+REPLY_TXT[x.k].toLowerCase()}).join(", ")}
/* Every point starts with a serve. Order, two points each. You, them, your partner, them */
function serverFor(n){var t=Math.floor(n/2)%4;return t===0?"me":t===2?"mate":"opp"}
/* ===== Live rally. You move any time, at match speed. Nobody waits for you ===== */
var LV={on:false,pos:{},vel:{},tgt:{},raf:0,last:0,ball:null,swing:null,g:null,lock:null};
var LSPEED={beginner:0.5,intermediate:0.65,advanced:0.82,pro:1},SLOWMO={beginner:0.35,intermediate:0.5,advanced:0.7,pro:1};
var RUNV=4.2,BACKV=2.7,ACC=0.35,MATEV=3.9,REACH=1.15;
function lvMe(){return state.side}function lvPt(){return state.side==="L"?"R":"L"}
function lvScale(){return LSPEED[state.level]||0.65}
function lvSet(k,p){LV.pos[k]=p.slice();var g=PL[k].g;g.style.transition="none";g.style.transform="translate("+X(p[0])+"px,"+Y(p[1])+"px) scale("+PS+")"}
function lvGo(k,p){if(!p){LV.tgt[k]=null;return}LV.tgt[k]=[Math.max(-1.2,Math.min(7.6,p[0])),Math.max(-0.4,Math.min(8.4,p[1]))];
  if(k===lvMe()){if(!LV.mk||!LV.mk.isConnected){LV.mk=el("circle",{r:7,fill:"none",stroke:"#0D1B2A","stroke-width":2.5,"stroke-dasharray":"3 3","pointer-events":"none"},gM)}LV.mk.setAttribute("cx",X(LV.tgt[k][0]));LV.mk.setAttribute("cy",Y(LV.tgt[k][1]));LV.mk.setAttribute("opacity",0.7)}}
function lvStart(pos){LV.on=true;LV.pos={};LV.vel={};LV.tgt={};LV.lock=null;LV.swing=null;LV.ball=null;
  [lvMe(),lvPt()].forEach(function(k){lvSet(k,pos[k]);LV.vel[k]=0});
  if(!LV.raf){LV.last=performance.now();LV.raf=requestAnimationFrame(lvTick)}}
function lvStop(){LV.on=false;LV.ball=null;cancelAnimationFrame(LV.raf);LV.raf=0;document.body.classList.remove("inwin");lvChip(null);lvHold(null)}
/* Steps, not teleports: speed builds over the first third of a second, backwards is slower */
function lvMove(k,dt){var t=LV.tgt[k],p=LV.pos[k];if(!t||!p)return;var dx=t[0]-p[0],dy=t[1]-p[1],d=Math.hypot(dx,dy);
  if(d<0.03){LV.vel[k]=0;LV.tgt[k]=null;if(k===lvMe()&&LV.mk)LV.mk.setAttribute("opacity",0);return}
  var vmax=(k===lvMe()?(dx<-0.3&&Math.abs(dx)>Math.abs(dy)?BACKV:RUNV):MATEV),v=Math.min(vmax,(LV.vel[k]||0)+vmax*dt/ACC);LV.vel[k]=v;
  var s=Math.min(d,v*dt);lvSet(k,[p[0]+dx/d*s,p[1]+dy/d*s])}
function lvTick(now){LV.raf=requestAnimationFrame(lvTick);var rdt=Math.min(0.05,(now-LV.last)/1000);LV.last=now;if(!LV.on)return;
  var b=LV.ball,slow=!!(b&&b.win&&!b.hit),dt=rdt*lvScale()*(slow?(SLOWMO[state.level]||0.5):1);
  lvMove(lvMe(),dt);lvMove(lvPt(),dt);
  if(LV.hold)lvHoldDraw();
  if(!b||b.hit)return;
  b.t+=dt;var e=Math.min(1,b.t/b.T),B=[b.src[0]+(b.to[0]-b.src[0])*e,b.src[1]+(b.to[1]-b.src[1])*e],h=b.H(e);b.e=e;b.B=B;b.h=h;lvBallDraw(b,B,h);
  var rk=b.mate?lvPt():lvMe(),P=LV.pos[rk],d=dst(P,B),inr=d<=REACH&&h<=3.4&&h>=0.12;
  if(b.mate){if(inr&&e>0.25){lvMateHit(b);return}}
  else{if(inr!==b.win){b.win=inr;document.body.classList.toggle("inwin",inr);if(inr){setPrompt(h<NET_H?"Below the net: lift it":"Above the net: attack");buzz(8)}}
    if(inr){var below=h<NET_H;if(below!==b.below){b.below=below;lvRail(b)}}
    if(inr&&LV.swing&&now<=LV.swing.exp){var sw=LV.swing;LV.swing=null;lvHit(b,sw);return}}
  if(e>=1){b.hit=true;document.body.classList.remove("inwin");lvLand(b)}}
/* Ball drawing for the live flight */
function lvBallDraw(b,B,h){var x=X(B[0]),y=Y(B[1]),lift=Math.min(60,h*6);ball.setAttribute("opacity",1);shadow.setAttribute("opacity",1);
  ball.setAttribute("cx",x);ball.setAttribute("cy",y-lift*(PORT?0:1));ball.setAttribute("transform",PORT?"translate("+(-lift)+",0)":"");ball.setAttribute("r",(ballR(h)*PS).toFixed(1));syncSeam();
  shadow.setAttribute("cx",x);shadow.setAttribute("cy",y+2);b.pts.push((PORT?x-lift:x).toFixed(1)+","+(PORT?y:y-lift).toFixed(1));if(b.pts.length>60)b.pts.shift();trail.setAttribute("points",b.pts.join(" "));trail.setAttribute("opacity",0.8);sideBall([B[0],h])}
/* An incoming ball: from their racket towards the sand on our side */
function lvIncoming(){var m=MATCH,cur=m.cur,sit=cur.sit,osv=cur.srv==="opp",me=lvMe(),pt=lvPt();hideServeUI();hideShotUI();gG.innerHTML="";gM.innerHTML="";drawZones(false);clearAim();
  document.body.classList.add("c-live");$("csit").hidden=true;setWindBadge();cur.pick={};cur.rally=cur.rally||0;
  if(osv){var form=serveForm("opp",cur.os);["A","B"].forEach(function(k){place(k,form[k],true)});lvStart(form);
    setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;var sp1=sitPos(sit);["A","B"].forEach(function(k){PL[k].g.style.transitionDuration="1000ms";place(k,sp1.pos[k],false)})},250)}
  else if(!LV.on){var sp0=sitPos(sit),ps={};ps[me]=sp0.pos[me];ps[pt]=sp0.pos[pt];lvStart(ps)}
  var sp=sitPos(sit),sk=osv?cur.os:(cur.srcKey||(sp.pos.A[0]<=sp.pos.B[0]?"A":"B")),src=osv?[serveForm("opp",cur.os)[sk][0]-0.3,serveForm("opp",cur.os)[sk][1]]:oP(sit,sk),
    to=sit.cxy?sit.cxy.slice():(cur.mate?sp.mateContact:sp.contact),dist=dst(src,to),
    spd=({fast:15,med:10.5,slow:7.5}[sit.speed]||10)*(sit.height==="high"?0.6:1)*(osv?1.1:1),T=dist/spd+(sit.height==="high"?0.55:0.12);
  var pm={};pm[sk]=osv?"serve":oppPose(sit);setPoses(pm);
  if(oppPill){oppPill.remove();oppPill=null}oppPill=courtPill(src,osv?"Serve":SHOTS[oppPose(sit)].name);var op0=oppPill;setTimeout(function(){if(oppPill===op0){op0.remove();oppPill=null}},900);
  var b={cur:cur,src:src,to:to,T:T,t:0,H:flightH(sit),mate:!!cur.mate,pts:[],win:false,hit:false};
  cur.flight={src:src,to:to,T:T*1000,H:b.H,t0:performance.now()};cur.rings=ringsFor(cur);b.rings=cur.rings;
  /* Ring guides: where to stand to meet it early, on time or late */
  if(!b.mate)cur.rings.forEach(function(r){var col=r.h>=NET_H?"#00C2B8":r.h>=1.0?"#FF9F1C":"#A9B6C4",g=el("g",{"class":"cring c-"+r.k,"pointer-events":"none"},gM);
    el("circle",{cx:X(r.P[0]),cy:Y(r.P[1]),r:18,fill:"#FFFFFF","fill-opacity":0.85,stroke:col,"stroke-width":4},g);
    var t=el("text",{x:X(r.P[0]),y:Y(r.P[1])+4,"text-anchor":"middle",fill:"#0D1B2A",style:"font:800 12px Montserrat,system-ui,sans-serif"},g);t.textContent="";if(r.k!=="ontime")g.setAttribute("display","none");orientText(t);r.g=g});
  LV.ball=b;sfx("hit");
  if(b.mate){lvGo(pt,[to[0]-0.3,to[1]]);setPrompt("Partner's ball · get into position")}else{lvGo(pt,[4.3,laneY(pt)]);setPrompt("Get to the ball")}
  shotRail(LV.lock,function(id){LV.lock=id;var c=$("lp-hint");lvChipShow()},b.mate?"idle":null);
  $("c-sr").textContent=(b.mate?"Your partner's ball. ":"Your ball. ")+describe(sit)}
/* Their ball lands in our court */
function lvRail(b){var r=$("shotrail");if(!r)return;var h=b.h||1.4;[].forEach.call(r.children,function(x){var v=x.dataset.v;if(v==="serve")return;var ok=v!=="dig"||incomingAttack(b.cur.sit);x.disabled=!ok;if(!ok&&LV.lock===v){LV.lock=null;x.setAttribute("aria-pressed","false")}})}
function lvLand(b){var cur=b.cur,m=MATCH;if(!m||m.cur!==cur||cur.done)return;land.setAttribute("cx",X(b.to[0]));land.setAttribute("cy",Y(b.to[1]));land.setAttribute("opacity",1);sfx("sand");
  var who=b.mate?lvPt():lvMe(),gap=dst(LV.pos[who],b.to);lvEnd(cur,false,"sand",{gap:gap,mate:b.mate,to:b.to})}
/* Your partner plays automatically */
function lvMateHit(b){var cur=b.cur;b.hit=true;var pt=lvPt(),a=cur.ans,from=LV.pos[pt].slice(),ch=b.h,sh=a.shot,cell=a.cell5;if(!shotLegal(sh,ch,cur.sit)){sh=ch>=NET_H?"push":incomingAttack(cur.sit)?"dig":"neutral";cell=sh==="push"?[1,2]:[2,2]}
  POSE[pt]=POSE_MAP[sh]||null;updImg(pt);var out=shotOutcome({shot:sh,speed:MATE_SPD[sh]==="fast"?"fast":MATE_SPD[sh]==="slow"?"slow":"neutral",cell:cell,tier:2,aimT:aimTier(cell,sh,cur.sit,"neutral"),from:from,sit:cur.sit,ch:ch,ct:"ontime"});
  cur.hist=(cur.hist||[]);cur.hist.push({shot:sh,cell:cell,Q:out.Q,by:"mate"});lvAfterShot(cur,out,sh,cell,from,"mate")}
/* Your swing. Contact height is wherever the ball is when you hit it */
function lvHit(b,sw){var cur=b.cur;b.hit=true;document.body.classList.remove("inwin");lvChip(null);
  var e=b.e,rs=b.rings,ct=e<rs[0].e+(rs[1].e-rs[0].e)/2?"early":e>rs[1].e+(rs[2].e-rs[1].e)/2?"late":"ontime",ch=b.h,from=b.B.slice();
  cur.from=from;cur.ch=ch;cur.ctype=ct;cur.spare=0.3;cur.atBall=true;
  var shot=LV.lock&&(LV.lock!=="dig"||incomingAttack(cur.sit))?LV.lock:inferShot(ch,sw,cur.sit);LV.lock=null;var p=cur.pick={shot:shot,cell:sw.cell,speed:sw.pace,spin:sw.spin,move:"hold"};
  POSE[lvMe()]=POSE_MAP[shot]||null;updImg(lvMe());buzz(sw.pace==="fast"?25:sw.pace==="slow"?10:15);
  var sitC=Object.assign({},cur.sit,{height:ch>=2.2?"high":ch>=1.0?"med":"low"}),curC=Object.assign({},cur,{sit:sitC,ans:solveSit(sitC)}),
    t=shotTiers(sitC,curC.ans.shot)[shot];if(t==null)t=1;
  var intoNet=!!ATTACK3[aimShot(shot)]&&ch<NET_H,
    out=intoNet?{end:"miss",net:true,why:"Below the net you can't hit down. It went into the net."}:shotOutcome({shot:shot,speed:p.speed,cell:p.cell,tier:t,aimT:aimTier(p.cell,shot,sitC,p.speed),from:from,sit:cur.sit,ch:ch,ct:ct,spare:0.3});
  cur.G=gradeChoice(curC,p);if(intoNet){cur.G.mine=-1;cur.G.d=cur.G.best.v+1;cur.G.lab="Blunder";cur.netRule=true}cur.hist=(cur.hist||[]);cur.hist.push({shot:shot,cell:p.cell,Q:out.Q,by:"me"});
  var m=MATCH;m.shots=m.shots||[];m.shots.push({pt:m.points,lab:cur.G.lab,d:+cur.G.d.toFixed(2),ct:ct,ch:+ch.toFixed(2),dec:null,open:!!cur.wasOpening,sit:JSON.parse(JSON.stringify(cur.sit)),pick:{shot:shot,cell:p.cell,speed:p.speed,spin:p.spin},best:{shot:cur.G.best.shot,cell:cur.G.best.cell},end:out.end||null});
  if(cur.G&&LABSC[cur.G.lab]===2)m.right++;
  lvAfterShot(cur,out,shot,p.cell,from,"me")}
/* Our ball flies to them. Either the point ends, or they reply to where we actually are */
function lvAfterShot(cur,out,shot,cell,from,by){var m=MATCH,sc=lvScale(),dest=out.rc?out.rc.land:svTarget(cell);setPrompt(by==="me"?"Move into position":"");
  var travel=out.rc?out.rc.tBall:0.6,ms=Math.max(250,travel/sc*1000),pr=PROF[shot]||PROF.neutral;PROF._me={d:ms/1.3,h:pr.h};
  if(LV.ball&&LV.ball.rings)LV.ball.rings.forEach(function(r){if(r.g)r.g.remove()});
  if(out.end==="miss"){errBall(from,dest[1],out.net!=null?out.net:Math.random()<0.5)}else runBall({f:from,to:dest,shot:"_me",land:true},true);
  if(out.end){setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;var won=out.end==="winner"||out.end==="forced"||out.end==="theymiss";if(out.rc)reachRing(out.rc,rv());lvEnd(cur,won,out.end,{out:out,by:by})},ms+150);return}
  /* Pressure builds over shots */
  var hm=[11.5,out.rc.who==="A"?2.5:5.5],disp=dst(out.rc[out.rc.who],hm)>1.5,pz=0.5*(cur.press||0)+Math.max(0,Math.min(1,(0.6-out.rc.m)/0.6))+(cur.ctype==="early"&&cur.ch>=NET_H&&by==="me"?0.25:0)+(disp?0.2:0)+(out.arrH<1?0.15:0);
  out.Q=Math.max(0,out.Q-0.35*pz);if(pz>=1)out.forcePop=true;cur.pressOut=Math.min(1.2,pz);
  setPosture(out.rc.who,out.rc.m<0.3?"str":out.rc.m<0.65?"mov":"set");setPosture(out.rc.who==="A"?"B":"A",disp?"mov":"set");setPips(pz);
  ["A","B"].forEach(function(k){var tg=k===out.rc.who?out.rc.land:out.rc[k];PL[k].g.style.transitionDuration=Math.round(ms)+"ms";place(k,[Math.max(8.6,tg[0]),tg[1]],false)});
  var react=(rv().react||0.25)/sc*1000;
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur||cur.done)return;
    /* They read where you and your partner are NOW */
    var team=[LV.pos[lvMe()].slice(),LV.pos[lvPt()].slice()],ctx=replyCtx(shot,cell,cur.pick&&cur.pick.speed||"neutral","hold","ok",by),c2={},rep;
    if((cur.rally||0)>=16){lvEnd(cur,true,"theymiss",{});return}
    rep=rallyReply(c2,ctx,out,team);
    if(rep.theyWin){var g=rep.gap,bb=REPLY_BALL[g.sh]||REPLY_BALL.push;c2.sit={shot:g.sh,depth:bb.depth,height:bb.height,speed:g.sh==="lob"?"slow":"fast",side:"body",A:out.rc.A?toGrid(out.rc.A):[1,0],B:out.rc.B?toGrid(out.rc.B):[1,2],oA:out.rc.A,oB:out.rc.B,cxy:g.tg.slice()};
      c2.mate=dst(g.tg,team[1])<dst(g.tg,team[0]);c2.srcKey=out.rc.who;c2.why="They found the space: "+GAPTXT[g.sh]+".";c2.opening=false}
    var nc={sit:c2.sit,pick:{},srv:"rally",os:cur.os,rally:(cur.rally||0)+1,mate:c2.mate,srcKey:c2.srcKey,why:c2.why,hist:cur.hist,wasOpening:c2.opening,press:cur.pressOut||0,G:null};
    nc.ans=solveSit(nc.sit);m.cur=nc;if(c2.opening)sfx("open");
    var hk=nc.srcKey;if(nc.sit["o"+hk])place(hk,nc.sit["o"+hk],false);
    lvIncoming()},ms+react)}
/* Point over */
function lvEnd(cur,won,kind,info){var m=MATCH;if(!m||m.cur!==cur||cur.done)return;cur.done=true;if(LV.ball)LV.ball.hit=true;document.body.classList.remove("inwin");lvChip(null);lvHold(null);
  pointEnd(m,won,kind==="sand"?"sand":kind);renderScore();var G=cur.G,E=ENDTXT[kind],over=(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2;
  var head=cur.netRule&&kind==="miss"?"Into the net.":kind==="sand"?(info.mate?"Your partner couldn't reach it.":info.gap>3?"Too far.":"Too slow."):E?E[1]:"Point over.",
    sub=cur.netRule&&kind==="miss"?"You met it at "+cur.ch.toFixed(1)+" m, below the net. A "+SHOTS[cur.pick.shot].name.toLowerCase()+" from there can't clear it. Lift it instead.":kind==="sand"?(info.mate?"":"You were "+info.gap.toFixed(1)+" m from where it landed."):kind==="gap"?"":(E&&E[2]||"");
  if(!won)saveLost({sit:cur.sit,pick:cur.pick||{},ans:{shot:(G?G.best.shot:cur.ans.shot),cell5:(G?G.best.cell:cur.ans.cell5)},kind:kind==="sand"?"far":kind,tier:G?(LABSC[G.lab]===2?2:0):1,aimT:0,moveOk:kind!=="sand",why:"",rival:m.r.pair,gap:info.gap?+info.gap.toFixed(1):null});
  var R=rv(),o=info.out,html='<div class="ptres '+(won?"w":"l")+'"><b>'+head+'</b> '+sub+'</div>'+
    (G&&info.by==="me"?'<div class="fbbest"><b>Best play</b><p>'+SHOTS[G.best.shot].name+" to the "+cellName5(G.best.cell).toLowerCase()+'.</p></div>':'')+'<!--more-->'+
    (G&&info.by==="me"&&cur.ch!=null?fbSec("Contact",contactText(cur,o||{},cur.pick)):"")+
    (G&&info.by==="me"?fbSec("Your choice",G.lab+". "+(G.best.shot===cur.pick.shot&&G.best.cell.join()===cur.pick.cell.join()?"That was the best play here.":"Best was a "+SHOTS[G.best.shot].name.toLowerCase()+" to the "+cellName5(G.best.cell).toLowerCase()+".")):"")+
    (o&&o.rc?fbSec("Race",reachText(o.rc,R)):"")+
    (kind==="sand"&&!info.mate?fbSec("Movement","Move as soon as they hit. You run about 4 m a second forwards and sideways, slower going back. Recover to the middle of your half, level with your partner, so every ball is within reach."):"")+
    fbSec("Wind",windText())+(G?'<button class="lnk flagbtn" type="button">Coach: disagree with the best play?</button>':'');
  var tk=G&&info.by==="me"?[[G.lab,LABSC[G.lab],true],[{early:"Early",ontime:"On time",late:"Late"}[cur.ctype]+" "+cur.ch.toFixed(1)+" m",cur.ch>=NET_H?2:cur.ch>=1?1:0,true]]:null;
  if(tk&&LABSC[G.lab]<1&&won)tk.push(["Lucky",1,true]);if(tk&&LABSC[G.lab]===2&&!won)tk.push(["Unlucky",1,true]);
  FBRACE=o&&o.rc?{b:o.rc.tBall,n:o.rc.tNeed,who:nm(o.rc.who)}:null;
  buzz(won?[30,40,30]:[60]);if(cur.wasOpening){m.st.open++;if(won)m.st.conv++}
  track("point_played",{rival:m.r.id,live:true,end:kind,won:won,lab:G?G.lab:null,contact:cur.ctype||null});
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;FBTICKS=tk;fbShow(html,over?"See the result":"Next point",function(){playOn(over)})},700)}
/* ---------- The swing gesture: touch, hold for height, flick to aim ---------- */
function lvWorld(e){var q=SVGC.createSVGPoint();q.x=e.clientX;q.y=e.clientY;var w=q.matrixTransform(WORLD.getScreenCTM().inverse());return [(w.x-60)/40,(w.y-40)/40]}
function lvActive(){var c=MATCH&&MATCH.cur;return LV.on&&state.tab==="compete"&&c&&!c.done&&!(c.srv==="me"&&!c.served)}
function bandOf(ms){return ms<200?"low":ms<550?"mid":"high"}
function cellAt(w){var d=0,l=0;for(var i=0;i<3;i++)if(w[0]>=AX[i][0])d=i;for(var j=0;j<5;j++)if(w[1]>=AY[j][0])l=j;return [Math.max(0,Math.min(2,d)),Math.max(0,Math.min(4,l))]}
/* Rules: no smash, push or hook from below the net. Block only against a smash, push or hook */
var ATTACK3={push:1,flatsmash:1,hook:1};
function incomingAttack(sit){return !!ATTACK3[aimShot(sit.shot||oppPose(sit))]}
function shotLegal(sh,ch,sit){sh=aimShot(sh);if(ATTACK3[sh]&&ch<NET_H)return false;if(sh==="dig"&&!incomingAttack(sit))return false;return true}
function inferShot(ch,sw,sit){var att=sit?incomingAttack(sit):true;if(sw.tap)return att?"dig":(ch>=NET_H?"push":"neutral");var hb=sw.band,pc=sw.pace;
  if(ch<NET_H){if(hb==="high")return "lob";if(pc==="slow")return "drop";return (pc==="neutral"&&att&&hb==="low")?"dig":"neutral"}
  if(hb==="high")return "lob";if(hb==="mid")return "neutral";
  if(ch>=NET_H){if(pc==="slow")return "drop";if(pc==="fast")return sw.curve?"hook":"flatsmash";return "push"}
  if(ch>=1.0)return pc==="slow"?"drop":"push";
  return pc==="slow"?"drop":"neutral"}
function lvReadSwing(g,now){var pts=g.pts,n=pts.length,last=pts[n-1],first=pts[0],hold=(g.holdEnd||now)-g.t0,
    k=n-1;while(k>0&&last[2]-pts[k][2]<80)k--;var vdt=Math.max(16,last[2]-pts[k][2]),v=Math.hypot(last[0]-pts[k][0],last[1]-pts[k][1])/vdt,
    L=Math.hypot(last[0]-first[0],last[1]-first[1]),pace=v>1.3?"fast":v>0.55?"neutral":"slow",
    dev=0;for(var i=1;i<n-1;i++){var x0=first[0],y0=first[1],x1=last[0],y1=last[1],px=pts[i][0],py=pts[i][1],dd=Math.abs((y1-y0)*px-(x1-x0)*py+x1*y0-y1*x0)/Math.max(1,L);if(dd>Math.abs(dev))dev=((x1-x0)*(py-y0)-(y1-y0)*(px-x0))>0?dd:-dd}
  var curve=L>60&&Math.abs(dev)/L>0.12,wEnd=lvWorld({clientX:last[0],clientY:last[1]}),w0=g.w0,cell;
  if(wEnd[0]>8.2)cell=cellAt(wEnd);
  else{var dy=wEnd[1]-w0[1],lane=Math.max(0,Math.min(4,Math.round(2+dy/1.2)));cell=[pace==="slow"?0:pace==="neutral"?1:2,lane]}
  var spin=curve?(dev>0?"right":"left"):pace==="fast"?"top":"flat";
  return {tap:L<16&&hold<250,band:bandOf(hold),pace:pace,curve:curve,spin:spin,cell:cell,L:L,v:v,wEnd:wEnd,toNet:wEnd[0]>w0[0]+0.4||wEnd[0]>8.2}}
function lvChip(t){var c=$("swchip");if(!t){if(c)c.hidden=true;return}if(!c){c=document.createElement("div");c.id="swchip";c.className="swchip";document.body.appendChild(c)}
  c.hidden=false;c.innerHTML=t.html;c.style.left=t.x+"px";c.style.top=(t.y-64)+"px"}
function lvChipShow(){}
function lvHold(on){var me=lvMe(),pl=PL[me];if(!pl)return;var c=pl.hold;if(!on){if(c)c.setAttribute("opacity",0);LV.hold=null;return}
  if(!c){c=el("circle",{r:30,fill:"none","stroke-width":5,"pointer-events":"none"},pl.g);pl.g.insertBefore(c,pl.g.firstChild);pl.hold=c}LV.hold=on;c.setAttribute("opacity",1)}
function lvHoldDraw(){var g=LV.g,c=PL[lvMe()].hold;if(!g||!c)return;var ms=(g.holdEnd||performance.now())-g.t0,b=bandOf(ms);
  c.setAttribute("stroke",{low:"#00C2B8",mid:"#FF9F1C",high:"#0077B6"}[b]);c.setAttribute("stroke-dasharray",(Math.min(1,ms/550)*188).toFixed(0)+" 188");
  if(b!==LV.hold.b){LV.hold.b=b;if(b!=="low")buzz(8)}}
function lvSwingPossible(){var b=LV.ball;return b&&!b.hit&&!b.mate}
SVGC.addEventListener("pointerdown",function(e){if(!lvActive())return;e.preventDefault();e.stopPropagation();var now=performance.now();
  LV.g={t0:now,w0:lvWorld(e),pts:[[e.clientX,e.clientY,now]],moved:false,holdEnd:null,id:e.pointerId};try{SVGC.setPointerCapture(e.pointerId)}catch(x){}
  if(lvSwingPossible())lvHold({b:"low"})},true);
SVGC.addEventListener("pointermove",function(e){var g=LV.g;if(!g||!lvActive())return;e.preventDefault();var now=performance.now();g.pts.push([e.clientX,e.clientY,now]);if(g.pts.length>40)g.pts.shift();
  if(!g.moved){var s0=g.first||(g.first=[g.pts[0][0],g.pts[0][1]]);if(Math.hypot(e.clientX-s0[0],e.clientY-s0[1])>10){g.moved=true;g.holdEnd=now}}
  if(lvSwingPossible()&&g.moved){var sw=lvReadSwing(g,now),sh=LV.lock&&(LV.lock!=="dig"||incomingAttack(LV.ball.cur.sit))?LV.lock:inferShot(LV.ball.h||1.4,sw,LV.ball.cur.sit),ic=ICON[sh];
    lvChip({x:e.clientX,y:e.clientY,html:'<span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+ic.d+'</svg></span><b>'+SHOTS[sh].name+'</b><small>'+cellName5(sw.cell)+'</small>'})}},true);
function lvUp(e){var g=LV.g;LV.g=null;lvChip(null);if(!g||!lvActive()){lvHold(null);return}e.preventDefault();var now=performance.now();g.pts.push([e.clientX,e.clientY,now]);
  var sw=lvReadSwing(g,now),b=LV.ball;lvHold(null);
  var swing=lvSwingPossible()&&(sw.tap?b.win:(sw.toNet||sw.v>0.55));
  if(swing){LV.swing=Object.assign(sw,{exp:now+(b.win?0:320)});if(b.win){var s2=LV.swing;LV.swing=null;lvHit(b,s2)}return}
  /* Otherwise it's a move: tap or drag on your half. Near a ring guide, stand on it */
  var w=sw.tap?g.w0:sw.wEnd;if(w[0]>8)return;var rs=b&&!b.hit&&b.rings;if(rs){var nr=rs.slice().sort(function(a,c){return dst(w,a.P)-dst(w,c.P)})[0];if(nr&&dst(w,nr.P)<1.0)w=[nr.P[0]-0.25,nr.P[1]]}
  lvGo(lvMe(),w);sfx("run")}
SVGC.addEventListener("pointerup",lvUp,true);SVGC.addEventListener("pointercancel",function(){LV.g=null;lvChip(null);lvHold(null)},true);

/* ===== Beat Model: every shot is a read. Both sides choose at once, then it plays out =====
   Own-frame coordinates per team: x = metres from the net (0..8), y = 0..8 across (same as the court). */
var BT={};
var BSHOT={smash:{v:17,hang:0,sd:0.55,hmin:2.1,netK:0.9},push:{v:12.5,hang:0.05,sd:0.5,hmin:1.5,netK:0.6},neutral:{v:9,hang:0.3,sd:0.45,hmin:0,netK:0},
  lob:{v:6.5,hang:0.95,sd:0.5,hmin:0,netK:0},drop:{v:6,hang:0.35,sd:0.4,hmin:0,netK:0},block:{v:8.5,hang:0.15,sd:0.45,hmin:0,netK:0},serve:{v:11,hang:0.25,sd:0.6,hmin:0,netK:0},hook:{v:13,hang:0.1,sd:0.55,hmin:1.9,netK:0.7}};
var BHCON={smash:[1.0,0.7,0.35],push:[1.5,1.1,0.6],block:[2.0,1.4,0.8],neutral:[2.1,1.5,0.9],drop:[0.9,0.55,0.25],lob:[3.0,2.3,1.2],serve:[1.7,1.2,0.8],hook:[1.3,0.9,0.5]};
var BTIM={early:{need:0.4,steal:0.18},on:{need:0.12,steal:0},late:{need:-0.15,steal:-0.2}};
var BRISK={safe:{pace:0.88,margin:1.4,sdm:0.85,err:0.6},normal:{pace:1,margin:1.0,sdm:1,err:1},bold:{pace:1.12,margin:0.45,sdm:1.15,err:1.8}};
var BDEPTH={short:1.8,mid:4.2,deep:6.6},BLANES=[1.2,4,6.8],BHOMEX={net:2.4,mid:3.8,deep:5.2},BCOV=[];["net","mid","deep"].forEach(function(d){[0,1,2].forEach(function(l){BCOV.push({d:d,l:l})})});
var BOLD={smash:"flatsmash",block:"dig",serve:"serve",push:"push",neutral:"neutral",lob:"lob",drop:"drop",hook:"hook"},BNEW={flatsmash:"smash",dig:"block"};
function bName(s){return SHOTS[BOLD[s]]?SHOTS[BOLD[s]].name:s}
function bGauss(){var u=Math.random()||1e-9,v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function bP(skill){return {react:0.30-0.10*skill,run:4.0+1.2*skill,back:0.62+0.1*skill,reach:1.35+0.15*skill,sdm:1.35-0.6*skill,errBase:0.028-0.016*skill,read:skill,iq:skill}}
function bHcon(shot,k,lx){var b=BHCON[shot][k];if(shot==="smash"||shot==="push")return b;if(shot==="lob")return lx<5.5?b+0.35*(5.5-lx):b-0.25*(lx-5.5);return b+(lx<4?0.15*(4-lx):-0.18*(lx-4))}
function bCovPt(c,i){return [({net:1.9,mid:4.3,deep:6.4})[c.d],i===0?[1.1,2.6,3.0][c.l]:[5.0,5.4,6.9][c.l]]}
/* Court zones drawn flush on the court lines: 0-3 m, 3-6 m, 6-8 m from the net */
var BBAND={short:[0,3],mid:[3,6],deep:[6,8]},BBNM={short:"0–3 m",mid:"3–6 m",deep:"6–8 m"};
function bZone(xa,xb,ya,yb,col,label,aria,cls,fn){var x0=Math.min(X(xa),X(xb)),x1=Math.max(X(xa),X(xb)),y0=Y(ya),y1=Y(yb),g=el("g",{"class":"ac bt "+(cls||""),role:"button","aria-label":aria},gA);
  el("rect",{x:x0,y:y0,width:x1-x0,height:y1-y0,fill:col,"fill-opacity":0.13,stroke:col,"stroke-width":1.5},g);
  if(label){var t=el("text",{x:(x0+x1)/2,y:(y0+y1)/2+6,"text-anchor":"middle",fill:col,"pointer-events":"none",style:"font:800 15px Montserrat,sans-serif"},g);t.textContent=label;orientText(t)}
  g.addEventListener("click",function(e){var w=null;if(e&&(e.clientX||e.clientY)){var q=lvWorld(e);w=[q[0],q[1]]}fn(w)});return g}
function bTapOpp(w,xa,xb){if(!w)return {};return {x:Math.max(0.3,Math.min(7.85,w[0]-8)),y:Math.max(0.1,Math.min(7.9,w[1]))}}
/* Error before the ball is struck: hitting down from below the net, risk, balance. Shown to the player */
/* Harder from low, from deep, and drops from far back */
function bHard(st,c){return c.shot==="serve"?1:(1+0.5*Math.max(0,NET_H-st.h))*(0.8+0.05*st.pos[0])*(c.shot==="drop"?1+0.08*st.pos[0]:1)}
function bErr(st,hp,c){var S=BSHOT[c.shot],below=Math.max(0,S.hmin-st.h);return {net:Math.min(0.95,S.netK*below)+(c.shot==="drop"&&st.h>2.2?0.05:0),frame:hp.errBase*BRISK[c.risk].err*4*bPress(st)}}
function bPress(st){var p=0.55*(st.stretch||0);if(st.timing==="late")p+=0.35;p+=Math.max(0,0.75-st.B)*0.9;if(BT.inShot==="smash"||BT.inShot==="push"||BT.inShot==="hook")p+=0.35;return p}
function bSD(st,hp,c){var p=bPress(st);return p<=0?0:p*(BSHOT[c.shot].sd/0.5)*BRISK[c.risk].sdm*hp.sdm}
/* Wind: metres of drift on the far side, by shot. Lobs hang longest */
var BWD={lob:1.3,neutral:0.55,drop:0.4,serve:0.45,block:0.2,push:0.15,smash:0.05,hook:0.1};
function bWind(shot){var k=(WINDK[state.wind]||0)*(BWD[shot]||0.3);if(!k)return [0,0];var v=windV(),sg=BT.hit&&BT.hit[0]===1?-1:1;return [v[0]*k*sg,v[1]*k]}
/* How far away you can still get to it. Hard balls are winners past 2-2.5 m; a floating lob can be chased much further */
var BMAXD={smash:2.0,push:2.5,hook:2.5,block:3.5,drop:3.5,neutral:4.0,serve:4.0,lob:6.5};
function bAim(c){if(c.x!=null&&c.y!=null)return [c.x,c.y];var R=BRISK[c.risk],tx=BDEPTH[c.d],ty=c.y!=null?c.y:BLANES[c.l];if(c.d==="deep")tx=8-R.margin;if(c.d==="short")tx=Math.max(0.8,R.margin+0.6);if(c.y==null){if(c.l===0)ty=R.margin;if(c.l===2)ty=8-R.margin}else ty=Math.max(R.margin*0.6,Math.min(8-R.margin*0.6,ty));return [tx,ty]}
function bResolve(st,hp,c,defs,dps,covers){var S=BSHOT[c.shot],R=BRISK[c.risk],E=bErr(st,hp,c);
  if(Math.random()<E.net)return {end:"err",why:"net"};if(Math.random()<E.frame)return {end:"err",why:"frame"};
  var a=bAim(c),sd=bSD(st,hp,c),land=[a[0]+bGauss()*sd,a[1]+bGauss()*sd],wd=bWind(c.shot);land[0]+=wd[0];land[1]+=wd[1];
  if(land[0]<0.15||land[0]>8||land[1]<0||land[1]>8)return {end:"err",why:"out",land:land};
  var v=S.v*R.pace;if(c.shot==="smash"||c.shot==="push")v*=Math.max(0.75,Math.min(1.25,1+0.25*(st.h-2)))*Math.max(0.6,Math.min(1.1,1.15-0.08*st.pos[0]));
  var tBall=Math.hypot(st.pos[0]+land[0],st.pos[1]-land[1])/v+S.hang,best=null;
  defs.forEach(function(p,i){var dp=dps[i],cp=bCovPt(covers[i],i),pre=toward(p,cp,1.6),readOK=Math.hypot(cp[0]-land[0],cp[1]-land[1])<2.2,
      d=Math.hypot(pre[0]-land[0],pre[1]-land[1])>(BMAXD[c.shot]||4)?99:Math.max(0,Math.hypot(pre[0]-land[0],pre[1]-land[1])-dp.reach),bw=land[0]>pre[0]+0.5,tNeed=d>0?(readOK?dp.react*0.5:dp.react+0.12)+d/(dp.run*(bw?dp.back:1)):0.05,m=tBall-tNeed;
    if(!best||m>best.m)best={i:i,m:m,tNeed:tNeed,readOK:readOK,pre:pre}});
  var m=best.m,base={land:land,m:m,i:best.i,tBall:tBall,tNeed:best.tNeed,readOK:best.readOK,pre:best.pre};
  if(m<-0.25||(m<0&&Math.random()<-m/0.25))return Object.assign(base,{end:"winner"});
  var B=Math.max(0,Math.min(1,m/0.6)),tim=["early","on","late"].filter(function(k){return m>=BTIM[k].need});if(!tim.length)tim=["late"];
  if(c.shot==="lob"&&land[0]-best.pre[0]>(best.readOK?3:1.5)){tim=["late"];B*=0.6}
  return Object.assign(base,{end:null,B:B,tim:tim})}
function bOptions(inShot){var o=[];["smash","push","neutral","lob","drop","block","hook"].forEach(function(s){if(s==="block"&&!(inShot==="smash"||inShot==="push"))return;if(s==="hook"&&inShot!=="lob")return;
  ["short","mid","deep"].forEach(function(d){if(s==="drop"&&d!=="short")return;if(s==="lob"&&d==="short")return;if(s==="block"&&d==="deep")return;if(s==="hook"&&d==="short")return;
    [0,1,2].forEach(function(l){["safe","normal","bold"].forEach(function(r){o.push({shot:s,d:d,l:l,risk:r})})})})});return o}
function bVal(r,inShot){if(r.end==="winner")return 1;if(r.end==="err")return -1;var hb=Math.max.apply(null,r.tim.map(function(k){return bHcon(inShot,["early","on","late"].indexOf(k),r.land[0])}));
  return 0.55*(0.6-r.B)-0.45*Math.max(0,Math.min(1.2,hb-1.9))+0.15*Math.max(0,Math.min(1,1.6-hb))}
function bEval(st,hp,c,defs,dps,guess,N){var v=0;for(var n=0;n<N;n++){var g=guess[(Math.random()*guess.length)|0];v+=bVal(bResolve(st,hp,c,defs,dps,g),c.shot)}return v/N}
/* Habits: what each side tends to do, by ball-height band. The computer reads yours */
function bBand(h){return h<1.3?0:h<2.1?1:2}
function bRemember(store,bk,idx,n){store[bk]=store[bk]||[];store[bk][idx]=(store[bk][idx]||0)*0.9+1}
function bPickHabit(store,bk,read,n){var M=store&&store[bk];if(!M||Math.random()>read)return (Math.random()*n)|0;var tot=0,w=[];for(var i=0;i<n;i++){w[i]=Math.pow(M[i]||0,2);tot+=w[i]}
  if(!tot)return (Math.random()*n)|0;var x=Math.random()*tot;for(i=0;i<n;i++){x-=w[i];if(x<=0)return i}return n-1}
function bCovIdx(c){for(var i=0;i<9;i++)if(BCOV[i].d===c.d&&BCOV[i].l===c.l)return i;return 4}
function bAIcover(T,defP,bk){/* defenders read where your balls go from this height */var i=bPickHabit(T.landMem,bk,defP.read*0.9,9);return BCOV[i]}
function bGuessCovers(opp,readerP,bk){var g=[];for(var k=0;k<6;k++){var i0=bPickHabit(opp.covMem,bk,readerP.read,9),i1=bPickHabit(opp.covMem,bk,readerP.read,9);g.push([BCOV[i0],BCOV[i1]])}return g}
function bAIshot(st,hp,defs,dps,inShot,guess){var opts=bOptions(inShot),N=hp.iq>0.7?10:hp.iq>0.3?6:3,best=null,bv=-9;
  opts.forEach(function(c){var v=bEval(st,hp,c,defs,dps,guess,N)+bGauss()*0.35*(1-hp.iq);if(v>bv){bv=v;best=c}});return best}
/* ---------- Court mapping ---------- */
function bCourt(team,p){return team===0?[8-p[0],p[1]]:[8+p[0],p[1]]}
function bKey(team,i){if(team===1)return i===0?"A":"B";var meI=state.side==="L"?0:1;return i===meI?state.side:(state.side==="L"?"R":"L")}
function bMeI(){return state.side==="L"?0:1}
function bPlace(ms){for(var t=0;t<2;t++)for(var i=0;i<2;i++){var k=bKey(t,i);PL[k].g.style.transitionDuration=(ms||600)+"ms";place(k,bCourt(t,BT.pos[t][i]),!ms)}}
/* ---------- A point ---------- */
function beatNewPoint(){clearPosture();setPips(0);lvStop();var m=MATCH,srv=serverFor(m.points),lv=m.r.level||1,sk=[0.3,0.42,0.55,0.68,0.82][Math.min(4,lv-1)];
  BT={teams:[{p:[bP(0.6),bP(0.6)],landMem:m.bt0L||(m.bt0L=[]),covMem:m.bt0C||(m.bt0C=[])},{p:[bP(sk),bP(sk)],landMem:m.bt1L||(m.bt1L=[]),covMem:m.bt1C||(m.bt1C=[])}],touch:0,log:[]};m.cur={beat:true,rally:0,hist:[],srv:srv,sit:{},pick:{}};BT.cur=m.cur;
  var meI=bMeI();BT.teams[0].p[meI]=bP(({beginner:0.45,intermediate:0.6,advanced:0.72,pro:0.85})[state.level]||0.6);BT.teams[0].p[meI].human=true;
  var serveTeam=srv==="opp"?1:0,serverI=srv==="me"?meI:srv==="mate"?1-meI:((Math.floor(m.points/2)%4)===1?0:1);
  BT.pos=[[[3.6,2.5],[3.6,5.5]],[[3.6,2.5],[3.6,5.5]]];BT.pos[serveTeam][serverI]=[7.6,serverI===0?2.5:5.5];BT.pos[serveTeam][1-serverI]=[3.4,serverI===0?5.5:2.5];
  gG.innerHTML="";gM.innerHTML="";drawZones(false);clearAim();runBall(null);hideServeUI();hideShotUI();document.body.classList.add("c-live","beat");$("csit").hidden=true;setWindBadge();
  bPlace(0);setPoses({});cpanelLive("");renderScore();
  BT.st={pos:BT.pos[serveTeam][serverI].slice(),B:1,h:2.6,timing:"on"};BT.hit=[serveTeam,serverI];BT.inShot="serve";
  if(serveTeam===0&&serverI===meI)bAskServe();else{var pm={};pm[bKey(serveTeam,serverI)]="serve";setPoses(pm);bDefend({shot:"serve",d:Math.random()<0.7?"deep":"mid",l:(Math.random()*3)|0,risk:wpick([["safe",3],["normal",5],["bold",2]])})}}
/* The hitter's choice is made; the other side commits covers at the same moment */
function bDefend(choice){var hT=BT.hit[0],D=1-hT,bk=bBand(BT.st.h),T=BT.teams;
  if(D===0){/* coming to us: you tap where it will land before it hits the sand */bReceive(choice)}
  else bReveal(choice,[bAIcover(T[0].landMem?T[0]:T[0],T[1].p[0],bk),bAIcover(T[0],T[1].p[1],bk)])}
function bReveal(choice,covers){var hT=BT.hit[0],hI=BT.hit[1],D=1-hT,T=BT.teams,hp=T[hT].p[hI],bk=bBand(BT.st.h);
  bRemember(T[D].covMem,bk,bCovIdx(covers[0]),9);bRemember(T[D].covMem,bk,bCovIdx(covers[1]),9);
  var odds=null;if(hT===0&&hI===bMeI()){var o={err:0,win:0,n:400};for(var k=0;k<o.n;k++){var q=bResolve(BT.st,hp,choice,BT.pos[D],T[D].p,covers);if(q.end==="err")o.err++;else if(q.end==="winner")o.win++}odds={err:Math.round(o.err/o.n*100),win:Math.round(o.win/o.n*100)};odds.play=100-odds.err-odds.win;BT.odds=odds}
  var r=bResolve(BT.st,hp,choice,BT.pos[D],T[D].p,covers);
  if(hT===0&&hI===bMeI()&&BT.wrong){BT.odds=null;odds=null;var W0=BT.wrong,att=choice.shot==="smash"||choice.shot==="push"||choice.shot==="hook",roll=Math.random(),a0=bAim(choice);
    if(att&&BT.st.h<NET_H||roll<0.34)r={end:"err",why:"net",wrong:W0};
    else if(roll<0.67){var oy=a0[1]<4?-0.4:8.4,ox=Math.min(8.6,a0[0]+1.2);r={end:"err",why:"out",wrong:W0,land:Math.random()<0.5?[8.5,a0[1]]:[ox,oy]}}
    else{BT.punish=W0;r.end=null;r.B=1;r.tim=["early"];r.land=r.land||a0;r.wrong=W0;if(r.i==null)r.i=0;if(!r.pre)r.pre=BT.pos[D][r.i];r.m=1}
    BT.wrong=null}
  BT.touch++;BT.cur.rally=BT.touch-1;BT.cur.hist.push({by:hT===0?(hI===bMeI()?"me":"mate"):"opp",shot:BOLD[choice.shot]});
  if(r.land){var ci=(r.land[0]<3.1?0:r.land[0]<4.5?1:2)*3+(r.land[1]<2.7?0:r.land[1]<5.3?1:2);bRemember(T[hT].landMem,bk,ci,9)}
  var mine=hT===0&&hI===bMeI();BT.last={choice:choice,covers:covers,r:r,mine:mine,hT:hT,st:BT.st};
  /* Animate: defenders step to their cover, the ball flies */
  var hk=bKey(hT,hI);bSet(hk,bShotPose(choice.shot));bTeamPose(D,(choice.shot==="smash"||choice.shot==="push"||choice.shot==="hook")?"defsmash":"ready");FLIP[bKey(D,0)]=FLIP[bKey(D,1)]=false;
  if(choice.shot==="lob"&&r.land&&r.i!=null&&r.land[0]>BT.pos[D][r.i][0]+0.5)bSet(bKey(D,r.i),"ready",true);
  if(r.end==="winner"&&r.i!=null)setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur)bSet(bKey(D,r.i),"dive")},Math.round(Math.max(0.45,r.tBall||0.8)*1500*0.7));
  setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur&&!BT.cur.done){FLIP[bKey(hT,0)]=FLIP[bKey(hT,1)]=false;bTeamPose(hT,"ready")}},Math.round(Math.max(0.45,r.tBall||0.8)*1500*0.45));
  sfx(choice.shot==="smash"||choice.shot==="push"?"hitF":"hit");
  var from=bCourt(hT,BT.st.pos),to=r.land?bCourt(D,r.land):bCourt(D,[0.1,BT.st.pos[1]]),ms=Math.round(Math.max(0.4,(r.tBall||0.8))*1000*(choice.shot==="lob"?1.9:choice.shot==="smash"||choice.shot==="push"?1.2:1.5));
  for(var i=0;i<2;i++){var pre=toward(BT.pos[D][i],bCovPt(covers[i],i),r.end==="winner"?1.2:1.6);BT.pos[D][i]=pre;var k=bKey(D,i);PL[k].g.style.transitionDuration=Math.round(ms*0.9)+"ms";place(k,bCourt(D,pre),false)}
  bRevealChip(choice,covers,r,hT);if(hT===0&&hI===bMeI()&&!r.end)bMoveMode(r.tBall||0.8);
  if(r.end==="err"&&r.why!=="out"){errBall(from,to[1],r.why==="net")}else{var pr=PROF[BOLD[choice.shot]]||PROF.neutral;PROF._bt={d:ms/1.3,h:pr.h};runBall({f:from,to:to,shot:"_bt",land:true},true)}
  setTimeout(function(){if(!MATCH||MATCH.cur!==BT.cur)return;
    if(r.end){var won=(r.end==="winner")===(hT===0);bPointEnd(won,r,choice,covers,hT);return}
    /* Receiver meets it: best height they can get, the hitting side recovers */
    var rI=r.i,rp=T[D].p[rI],timing=r.tim.indexOf("early")>=0&&bHcon(choice.shot,0,r.land[0])>=1.8?"early":r.tim.indexOf("on")>=0?"on":"late";
    if(rp.iq<0.3&&Math.random()<0.4)timing=r.tim[r.tim.length-1];
    var h=bHcon(choice.shot,["early","on","late"].indexOf(timing),r.land[0])*(1+0.06*bGauss()),recT=r.tBall+(timing==="early"?0.05:timing==="on"?0.3:0.5),
      home=BHOMEX[choice.shot==="lob"||choice.shot==="smash"||choice.shot==="push"?"net":"mid"];
    BT.pos[hT]=BT.pos[hT].map(function(p,i){var mine=hT===0&&i===bMeI()&&BT.moving;if(mine)return BT.myGo?toward(p,BT.myGo,T[hT].p[i].run*Math.max(0,recT-0.1)):p;return toward(p,[home,i===0?2.5:5.5],T[hT].p[i].run*Math.max(0,recT-0.25))});BT.moving=false;BT.myGo=null;
    var contact=[Math.max(0.7,Math.min(8,r.land[0]-(timing==="early"?1.2:timing==="on"?0.5:-0.3))),r.land[1]];BT.pos[D][rI]=contact;
    BT.pos[D][1-rI]=toward(BT.pos[D][1-rI],[3.8,rI===0?5.5:2.5],2);
    BT.st={pos:contact,B:r.B*(timing==="early"?0.85:1),h:Math.max(0.2,h),timing:timing,stretch:Math.max(0,Math.min(1,(dst(r.pre||contact,r.land)-1)/((BMAXD[choice.shot]||4)-1)))};BT.inShot=choice.shot;BT.hit=[D,rI];bPlace(700);
    if(BT.st.h>=2.1){bSet(bKey(D,rI),"smashsetup");if(contact[0]<=3)bTeamPose(hT,"defsmash")}
    var pz=Math.max(0,Math.min(3,Math.round((1-BT.st.B)*3)));setPips(D===0?0:pz/3);
    if(D===0&&rI===bMeI())setTimeout(bAskShot,650);
    else{var g=bGuessCovers(T[1-D],T[D].p[rI],bBand(BT.st.h)),c=bAIshot(BT.st,T[D].p[rI],BT.pos[1-D],T[1-D].p,BT.inShot,g);setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur)bDefend(c)},D===0?650:120)}},ms+120)}
/* ---------- Receiving: tap where it lands before it hits the sand ----------
   The window is real flight time slowed for thumbs (a smash is quick, a lob gives you time).
   Tap early and you get there early: you meet it higher. Too far or too slow and it's past you. */
var BSLOW={beginner:3.2,intermediate:2.7,advanced:2.3,pro:1.9},BFLOOR={beginner:1.3,intermediate:1.05,advanced:0.9,pro:0.75};
function bReceive(choice){var hT=1,hI=BT.hit[1],T=BT.teams,hp=T[1].p[hI],bk=bBand(BT.st.h),cv=[{d:"mid",l:1},{d:"mid",l:1}];
  var r=bResolve(BT.st,hp,choice,BT.pos[0],T[0].p,cv);BT.touch++;BT.cur.rally=BT.touch-1;BT.cur.hist.push({by:"opp",shot:BOLD[choice.shot]});BT.last={choice:choice,covers:cv,r:r,mine:false,hT:1,st:BT.st};
  if(BT.punish){var P=BT.punish;BT.punish=null;var cand=[[7.2,0.6],[7.2,7.4],[1.2,0.8],[1.2,7.2],[4,4],[6,4]],best=cand[0],bd=-1;cand.forEach(function(c){var d=Math.min(dst(c,BT.pos[0][0]),dst(c,BT.pos[0][1]));if(d>bd){bd=d;best=c}});
    var fromW=bCourt(1,BT.st.pos),toW=bCourt(0,best);bSet(bKey(1,hI),bShotPose(choice.shot));bTeamPose(0,"defsmash");sfx("hitF");setPrompt("They put it away");PROF._bt={d:700,h:(PROF[BOLD[choice.shot]]||PROF.neutral).h};runBall({f:fromW,to:toW,shot:"_bt",land:true},true);
    setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur){var near=dst(BT.pos[0][0],best)<dst(BT.pos[0][1],best)?0:1;bSet(bKey(0,near),"dive");bPointEnd(false,{end:"winner",why:"wrongshot",wrong:P,tBall:0.4,tNeed:1.6,land:best},choice,cv,1)}},1000);return}
  if(r.land){var ci=(r.land[0]<3.1?0:r.land[0]<4.5?1:2)*3+(r.land[1]<2.7?0:r.land[1]<5.3?1:2);bRemember(T[1].landMem,bk,ci,9)}
  var hk=bKey(1,hI);bSet(hk,bShotPose(choice.shot));bTeamPose(0,(choice.shot==="smash"||choice.shot==="push"||choice.shot==="hook")?"defsmash":"ready");FLIP.L=FLIP.R=false;sfx(choice.shot==="smash"||choice.shot==="push"?"hitF":"hit");
  var from=bCourt(1,BT.st.pos);
  if(r.end==="err"){var to=r.land?bCourt(0,r.land):bCourt(0,[0.1,BT.st.pos[1]]);setPrompt("Them: "+bName(choice.shot));if(r.why!=="out")errBall(from,to[1],r.why==="net");else{PROF._bt={d:700,h:(PROF[BOLD[choice.shot]]||PROF.neutral).h};runBall({f:from,to:to,shot:"_bt",land:true},true)}
    setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur)bPointEnd(true,r,choice,cv,1)},1100);return}
  BT.inLand=r.land[0];var land=r.land,tB=r.tBall,W=Math.round(Math.min(choice.shot==="lob"?(r.land[0]>5?4800:4000):3200,Math.max((BFLOOR[state.level]||1.5)*1000,tB*(BSLOW[state.level]||2.7)*1000))*bPace());if((+load("recvTaught","0")||0)<3)W=Math.round(W*1.5);var to=bCourt(0,land);
  /* Whoever is nearer takes it; you steer them */
  var mp=BT.pos[0][bMeI()];bRemember(T[0].covMem,bk,(mp[0]<3?0:mp[0]<6?1:2)*3+(mp[1]<2.7?0:mp[1]<5.3?1:2),9);var me=bMeI(),onMate=me===0?land[1]>4.4:land[1]<3.6,M=MATCH,rn=(M.rcvN=(M.rcvN||0)+1),mn=M.rcvMate||0,ri=onMate?1-me:me,auto=ri!==me;/* their side is theirs: you never run across in front of your partner */if(auto)M.rcvMate=mn+1;rp=T[0].p[ri],t0=performance.now(),done=false;BT.recv={ri:ri,land:land,W:W};
  if(choice.shot==="lob"&&land[0]>BT.pos[0][ri][0]+0.5)bSet(bKey(0,ri),"ready",true);
  setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur&&!BT.cur.done){FLIP.A=FLIP.B=false;["A","B"].forEach(function(k){if(POSE[k]!=="defsmash")bSet(k,"ready")})}},Math.round(W*0.45));
  PROF._bt={d:W/1.3,h:(PROF[BOLD[choice.shot]]||PROF.neutral).h};runBall({f:from,to:to,shot:"_bt",land:false},false);
  /* The landing spot is a button: big yellow target, a clock ring that closes green to amber to red, the ball's line drawn to it */
  var TX=X(to[0]),TY=Y(to[1]),teach=!auto&&(+load("recvTaught","0")||0)<3;
  gA.innerHTML="";var fl=el("line",{x1:X(from[0]),y1:Y(from[1]),x2:TX,y2:TY,stroke:"#0D1B2A","stroke-opacity":0.45,"stroke-width":2,"stroke-dasharray":"5 6","pointer-events":"none"},gA);
  var g=el("g",{"class":"ac btland",role:"button","aria-label":"Tap the target to run there"},gA);
  el("circle",{cx:TX,cy:TY,r:56,fill:"#FFD23F","fill-opacity":0.01},g);
  var clk=el("circle",{cx:TX,cy:TY,r:44,fill:"none",stroke:"#00A79E","stroke-width":6,"stroke-linecap":"round",opacity:0.95,"pointer-events":"none"},g);
  clk.innerHTML='<animate attributeName="r" from="46" to="31" dur="'+W+'ms" begin="indefinite" fill="freeze"/><animate attributeName="stroke" values="#2ECC71;#2ECC71;#FFD23F;#FF9F1C;#D6264B" keyTimes="0;0.3;0.55;0.8;1" dur="'+W+'ms" begin="indefinite" fill="freeze"/>';[].forEach.call(clk.children,function(an){try{an.beginElement()}catch(e){}});
  var pop=el("g",{"class":"btpopin"},g);
  var core=el("circle",{cx:TX,cy:TY,r:27,fill:"#2ECC71",stroke:"#fff","stroke-width":4},pop);
  core.innerHTML='<animate attributeName="fill" values="#2ECC71;#2ECC71;#FFD23F;#FF9F1C;#D6264B" keyTimes="0;0.3;0.55;0.8;1" dur="'+W+'ms" begin="indefinite" fill="freeze"/>';
  if(!auto){var tl=el("text",{x:TX,y:TY,"text-anchor":"middle","dominant-baseline":"central",fill:"#0D1B2A","pointer-events":"none",style:"font:800 15px Montserrat,system-ui,sans-serif;letter-spacing:.04em"},pop);tl.textContent="TAP";orientText(tl);tl.innerHTML+='<animate attributeName="fill" values="#0D1B2A;#0D1B2A;#FFFFFF" keyTimes="0;0.78;1" dur="'+W+'ms" begin="indefinite" fill="freeze"/>'}
  [].forEach.call(g.querySelectorAll("animate"),function(an){try{an.beginElement()}catch(e){}});
  buzz(12);sfx("aim",{d:2});document.body.classList.add("btrecv");if(typeof courtInView==="function")courtInView();
  /* Your side stops walking away: everyone set, facing the ball */
  [0,1].forEach(function(i){var kk=bKey(0,i);PL[kk].g.style.transitionDuration="0ms";place(kk,bCourt(0,BT.pos[0][i]),true)});
  setPrompt(auto?"Partner's ball":"Tap where it lands!");bPhase(auto?"PARTNER":"RETURN");if(!auto)cue("aim");bDock("");
  var go=function(){if(done)return;done=true;var tt=(performance.now()-t0)/W;if(BT.clk)clearTimeout(BT.clk);
    var p=BT.pos[0][ri],d=Math.max(0,dst(p,land)-rp.reach),bw=land[0]>p[0]+0.5,trav=d/(rp.run*(bw?rp.back:1)),hang=choice.shot==="lob"?(land[0]>5?1.5:1.25):choice.shot==="neutral"||choice.shot==="drop"?1.1:1,a=0.4*tt+trav/(tB*hang),s=1-a,capd=false;if({smash:1,push:1,hook:1,block:1}[choice.shot]&&tB<1.2&&dst(p,land)>BMAXD[choice.shot]+(tt<0.3?0.5:0)){s=-1;capd=true}
    var k=bKey(0,ri);PL[k].g.style.transitionDuration=Math.round(Math.max(200,trav*(BSLOW[state.level]||2.7)*1000))+"ms";
    var reachPt=toward(p,land,Math.max(0,dst(p,land)-0.4));BT.pos[0][ri]=reachPt;place(k,bCourt(0,reachPt),false);sfx("run");
    gA.innerHTML="";cue(null);bPhase("");document.body.classList.remove("btrecv");if(!auto&&s>=0)save("recvTaught",String((+load("recvTaught","0")||0)+1));
    if(s<-0.22){bSet(k,"dive");bPop(to,"Too late","#D9304F");setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur)bPointEnd(false,Object.assign({},r,{end:"winner",tNeed:capd?Math.max(a,1.3)*tB:a*tB,why:"late",capd:capd}),choice,cv,1)},Math.max(400,W*(1-tt)+200));return}
    var K=[bHcon(choice.shot,0,land[0]),bHcon(choice.shot,1,land[0]),bHcon(choice.shot,2,land[0])],hh;
    if(s>=0.4)hh=K[0];else if(s>=0.15)hh=K[1]+(K[0]-K[1])*(s-0.15)/0.25;else if(s>=0)hh=K[2]+(K[1]-K[2])*s/0.15;else hh=Math.max(0.25,K[2]*0.6);hh*=1.15;
    hh=Math.max(0.2,hh*(1+0.05*bGauss()));if(s<0)bSet(k,"dive");else if(hh>=2.1){bSet(k,"smashsetup");if(land[0]<=3.4)bTeamPose(1,"defsmash")}var timing=s>=0.4?"early":s>=0.12?"on":"late",B=Math.max(0.15,Math.min(1,0.35+s*1.3));

    var contact=[Math.max(0.7,Math.min(8,land[0]-(timing==="early"?1.0:timing==="on"?0.4:-0.2))),land[1]];BT.pos[0][ri]=contact;
    var recT=tB+0.3,home=BHOMEX[choice.shot==="lob"||choice.shot==="smash"||choice.shot==="push"?"net":"mid"];
    BT.pos[1]=BT.pos[1].map(function(p,i){return toward(p,[home,i===0?2.5:5.5],T[1].p[i].run*Math.max(0,recT-0.25))});
    BT.pos[0][1-ri]=toward(BT.pos[0][1-ri],[3.8,ri===0?5.5:2.5],2);
    BT.st={pos:contact,B:B,h:hh,timing:timing,stretch:Math.max(0,Math.min(1,(dst(p,land)-1)/((BMAXD[choice.shot]||4)-1)))};BT.inShot=choice.shot;BT.hit=[0,ri];BT.mateHit=ri!==bMeI();
    var mv=Math.max(450,Math.min(1200,trav*(BSLOW[state.level]||2.7)*1000)),cur0=[from[0]+(to[0]-from[0])*Math.min(0.9,tt),from[1]+(to[1]-from[1])*Math.min(0.9,tt)],cc=bCourt(0,contact);
    PROF._ff={d:mv/1.3,h:function(k){return 1.6*(1-k)+hh*k+0.4*Math.sin(Math.PI*k)}};runBall({f:cur0,to:cc,shot:"_ff",land:false},false);
    setTimeout(function(){if(!MATCH||MATCH.cur!==BT.cur)return;var att=choice.shot==="smash"||choice.shot==="push",lab=(timing==="early"?"Early! ":timing==="late"?"Late · ":"")+hh.toFixed(1)+" m"+(att&&hh<NET_H?" · dig it up":"");
      bPop(cc,lab,hh>=2.1?"#00A79E":hh>=NET_H?"#00A79E":hh>=1?"#FF9F1C":"#D9304F");buzz(15);bPlace(400);setTimeout(function(){if(!MATCH||MATCH.cur!==BT.cur)return;if(!auto){bAskShot();return}var g2=bGuessCovers(T[1],T[0].p[ri],bBand(BT.st.h)),c2=bAIshot(BT.st,T[0].p[ri],BT.pos[1],T[1].p,BT.inShot,g2);bDefend(c2)},450)},mv)};
  if(auto){g.style.pointerEvents="none";setTimeout(go,W*(0.12+0.2*Math.random()))}else g.addEventListener("click",go);
  BT.clk=setTimeout(function(){if(done)return;done=true;gA.innerHTML="";cue(null);document.body.classList.remove("btrecv");bSet(bKey(0,ri),"dive");bPop(to,"Missed it","#D9304F");
    setTimeout(function(){if(MATCH&&MATCH.cur===BT.cur)bPointEnd(false,Object.assign({},r,{end:"winner",tNeed:tB*1.3,why:"late"}),choice,cv,1)},500)},W+150)}
function bPop(p,txt,col){p=[Math.max(1.2,Math.min(14.8,p[0])),Math.max(1.4,Math.min(6.6,p[1]))];var t=el("text",{x:X(p[0]),y:Y(p[1])-30,"text-anchor":"middle",fill:col,stroke:"#fff","stroke-width":5,"paint-order":"stroke","class":"btpop",style:"font:800 26px Montserrat,system-ui,sans-serif"},gTag);t.textContent=txt;orientText(t);setTimeout(function(){t.remove()},1800)}
/* After your shot: tap your half to choose where your player runs. Real running speed, so you only get so far before they hit back */
/* Big phase label at the top of the court: what to do right now */
function bPhase(t){var box=document.querySelector(".court-box"),e=$("btphase");if(!box)return;if(!e){e=document.createElement("div");e.id="btphase";e.className="btphase";e.setAttribute("aria-live","polite");box.appendChild(e)}
  if(!t){e.hidden=true;return}if(e.textContent!==t){e.textContent=t;e.classList.remove("go");void e.offsetWidth;e.classList.add("go")}e.hidden=false}
function bMoveMode(tb){bPhase("MOVE");BT.moving=true;BT.myGo=null;gA.innerHTML="";var me=bMeI(),k=bKey(0,me),g=el("g",{"class":"ac btmove",role:"button","aria-label":"Tap where your player should stand"},gA);
  el("rect",{x:Math.min(X(0),X(8)),y:Y(0),width:Math.abs(X(8)-X(0)),height:Y(8)-Y(0),fill:"#00C2B8","fill-opacity":0.08,stroke:"#00C2B8","stroke-width":2,"stroke-dasharray":"6 6"},g);
  var t=el("text",{x:X(4)+(PORT?0:0),y:Y(4),"text-anchor":"middle","dominant-baseline":"central",fill:"#00776F",opacity:0.75,"pointer-events":"none",style:"font:800 16px Montserrat,system-ui,sans-serif"},g);t.textContent="Tap to move";orientText(t);
  var mk=null;g.addEventListener("click",function(e){if(!e.clientX&&!e.clientY)return;var w=lvWorld(e),p=[Math.max(0.6,Math.min(7.8,8-w[0])),Math.max(0.3,Math.min(7.7,w[1]))];BT.myGo=p;t.remove();
    if(mk)mk.remove();mk=el("circle",{cx:X(8-p[0]),cy:Y(p[1]),r:10,fill:"none",stroke:"#00C2B8","stroke-width":3,"pointer-events":"none"},g);
    var cur=BT.pos[0][me],run=BT.teams[0].p[me].run,d=Math.min(dst(cur,p),run*(tb+0.2));PL[k].g.style.transitionDuration=Math.round(Math.max(250,d/run*1500))+"ms";place(k,bCourt(0,toward(cur,p,d)),false);sfx("run")})}
/* What both sides chose, shown when the shot is struck */
var BCOVNM={net:"Net",mid:"Mid",deep:"Back"};
function bCovLabel(c,i){var mid=(i===0&&c.l===2)||(i===1&&c.l===0);return BCOVNM[c.d]+" · "+(c.l===1?"centre":mid?"middle":"line")}
function bRevealChip(choice,covers,r,hT){var hd=(hT===0?"You: ":"Them: ")+bName(choice.shot)+" "+({short:"short",mid:"mid",deep:"deep"})[choice.d]+" "+["left","middle","right"][choice.l];
  var cv=(hT===0?"They covered ":"You covered ")+bCovLabel(covers[hT===0?r.i||0:bMeI()],hT===0?(r.i||0):bMeI());
  var od=BT.odds&&hT===0&&BT.last&&BT.last.mine?BT.odds:null;setPrompt(od?"That shot: "+od.win+"% winner · "+od.err+"% error":hd+(r.readOK?" · READ!":""));if(!od)BT.odds=null;$("c-sr").textContent=hd+". "+cv}
/* ---------- Your decisions ---------- */
var BCLOCK={beginner:15,intermediate:14,advanced:11,pro:9},BPACE={quick:0.7,normal:1,relaxed:1.6,off:1.6};function bPace(){return BPACE[state.btpace]||1}
function bClock(fn){clearTimeout(BT.clk);if(state.btpace==="off"){startBar(0);return}var s=Math.round((BCLOCK[state.level]||10)*bPace());startBar(s,0);BT.clk=setTimeout(fn,s*1000)}
function bDock(html){var d=$("btdock");if(!d){d=document.createElement("div");d.id="btdock";d.className="btdock"}var cp=$("cpanel"),wide=window.innerWidth>=900;if(wide&&cp){if(d.previousSibling!==cp)cp.parentNode.insertBefore(d,cp.nextSibling)}else if(d.parentNode!==document.body)document.body.appendChild(d);d.classList.toggle("inl",wide);var pr=$("cs-prompt");d.hidden=!html;document.body.classList.toggle("btdocked",!!html);d.innerHTML=html?'<p class="bttitle">'+(pr?pr.textContent:"")+'</p>'+html:""}
function bDefault(st,inShot){var h=st.h,x=st.pos[0],O=BT.pos[1],ox=(O[0][0]+O[1][0])/2,atNet=ox<3,back=ox>5,open=Math.abs(O[0][1]-O[1][1])>5,inShort=BT.inLand!=null&&BT.inLand<3;
  if(inShot==="smash")return ["block","They smashed it: block",["block"]];
  if(inShot==="lob"&&h>=1.9)return ["hook","Lobbed over you: hook it",["hook","push"]];
  if(h>=2.1&&x<=3)return ["smash","High ball inside 3 m: smash",["smash","push"]];
  if(h>=2.1)return ["push","High but deep: push it",["push","hook","neutral"]];
  if(h>=NET_H)return ["push","Just above the net: push",["push","neutral"]];
  if(inShort)return ["drop","They hit it short: drop it back",["drop","lob"]];
  if(h<1.2&&x<=3)return atNet?["lob","Low, and they're at the net: lob",["lob"]]:(back||open)?["drop",back?"Low, and they're back: drop":"Low, with an opening: drop",["drop","lob"]]:["lob","Low ball: lob",["lob","drop","neutral"]];
  if(h<1.2)return atNet?["lob","Low, and they're at the net: lob",["lob","neutral"]]:["neutral","Low and deep: neutral",["neutral","lob"]];
  return ["neutral","Just below the net: neutral",["neutral","lob","drop"]]}
function bAskShot(){bPhase("SHOT");var st=BT.st,opts=bOptions(BT.inShot),legal={};opts.forEach(function(o){legal[o.shot]=1});
  var dr=bDefault(st,BT.inShot),def=dr[0];if(!legal[def]){def="neutral";dr=[def,"Neutral"]}BT.why=dr[1];BT.whyShot=def;BT.okShots=dr[2]||[def];var choose=state.btpick==="choose";BT.pick={shot:choose?null:def,risk:"normal"};BT.cur=MATCH.cur;var hb=st.h>=NET_H,ret=BT.inShot==="serve";
  shotRail(choose?null:BOLD[def],function(id){var s=BNEW[id]||id;if(!legal[s]){toast("Block only against a smash or push");return}BT.pick.shot=s;bTargets();bDockShot()},null);
  var r=$("shotrail");if(r)[].forEach.call(r.children,function(x){var s=BNEW[x.dataset.v]||x.dataset.v;x.disabled=x.dataset.v==="serve"||!legal[s]});
  setPrompt((ret?"Return it":"Your shot")+" · ball at "+st.h.toFixed(1)+" m, "+(hb?"above":"below")+" the net");bHabits();if(!choose)bTargets();bDockShot();
  bClock(function(){if(BT.pick.tg)return;if(!BT.pick.shot)BT.pick.shot=def;bCommit({shot:BT.pick.shot,d:BT.pick.shot==="drop"?"short":BT.pick.shot==="lob"?"deep":"mid",l:(Math.random()*3)|0,risk:"safe"})})}
function bErrPct(st,hp,c){var E=bErr(st,hp,c),S=BSHOT[c.shot],a=bAim(c),sd=bSD(st,hp,c),out=0;
  for(var n=0;n<300;n++){var x=a[0]+bGauss()*sd,y=a[1]+bGauss()*sd;if(x<0.15||x>8||y<0||y>8)out++}var pn=Math.min(0.95,E.net),pf=E.frame;return Math.round(Math.min(0.99,pn+(1-pn)*pf+(1-pn)*(1-pf)*out/300)*100)}
function bRiskSeg(){var p=BT.pick,D={safe:"Fewer errors",normal:"Balanced",bold:"More pace, more errors"};return '<div class="seg btrisk" role="group" aria-label="Risk">'+["safe","normal","bold"].map(function(r){
  return '<button data-r="'+r+'" aria-pressed="'+(p.risk===r)+'"><b>'+r[0].toUpperCase()+r.slice(1)+'</b><small>'+D[r]+'</small></button>'}).join("")+'</div>'}
function bWire(fn){[].forEach.call($("btdock").querySelectorAll("[data-r]"),function(b){b.onclick=function(){BT.pick.risk=b.dataset.r;fn()}})}
function bDockShot(){var p=BT.pick;if(p.shot&&$("g-aim")&&gA.querySelector(".bt"))bTargets();bDock(bRiskSeg()+'<p class="bthint">'+(p.shot?(BT.why&&BOLD[p.shot]&&BT.why.indexOf(":")>0&&p.shot===BT.whyShot?BT.why+". ":"")+"Tap a target to hit":"Pick your shot on the left")+'</p>');bWire(bDockShot)}
function bRows(s){return s==="serve"?["deep"]:s==="drop"?["short"]:s==="lob"?["mid","deep"]:s==="block"?["short","mid"]:s==="hook"?["mid","deep"]:["short","mid","deep"]}
function bTargets(){gA.innerHTML="";var p=BT.pick,rows=bRows(p.shot),hp=BT.teams[0].p[bMeI()],Y0=[[0,8/3],[8/3,16/3],[16/3,8]];
  rows.forEach(function(d){[0,1,2].forEach(function(l){bZone(8+BBAND[d][0],8+BBAND[d][1],Y0[l][0],Y0[l][1],"#00A79E",l===1?BBNM[d]:"",d+" "+["left","middle","right"][l],"",function(w){p.tg=[d,l];bCommit(Object.assign({shot:p.shot,d:d,l:l,risk:p.risk},bTapOpp(w)))})})});cue("aim")}
function bMarkRail(bad,good){var r=$("shotrail");if(!r)return;r.hidden=false;[].forEach.call(r.children,function(b){var s=BNEW[b.dataset.v]||b.dataset.v;b.classList.remove("pk-x","pk-ok");if(s===bad)b.classList.add("pk-x");else if(s===good)b.classList.add("pk-ok")})}
function bCommit(c){bPhase("");BT.wrong=BT.okShots&&BT.okShots.indexOf(c.shot)<0?{shot:c.shot,best:BT.whyShot,why:BT.why}:null;clearTimeout(BT.clk);stopBar();gA.innerHTML="";cue(null);bDock("");railOff();if(BT.wrong)bMarkRail(BT.wrong.shot,BT.wrong.best);
  /* Grade your choice against the best option, given how they usually cover */
  var st=BT.st,hp=BT.teams[0].p[bMeI()],D=BT.teams[1],g=bGuessCovers(D,{read:0.7},bBand(st.h)),opts=bOptions(BT.inShot),best=null,bv=-9,mine=bEval(st,hp,c,BT.pos[1],D.p,g,40);
  opts.forEach(function(o){var v=bEval(st,hp,o,BT.pos[1],D.p,g,5);if(v>bv){bv=v;best=o}});bv=bEval(st,hp,best,BT.pos[1],D.p,g,40);if(mine>bv){bv=mine;best=c}
  var dl=bv-mine,lab=dl<=0.06?"Best":dl<0.15?"Good":dl<0.3?"Inaccuracy":dl<0.5?"Mistake":"Blunder";BT.grade={lab:lab,best:best,d:dl,c:c,h:st.h};
  var m=MATCH;m.shots=m.shots||[];m.shots.push({pt:m.points,lab:lab,d:+dl.toFixed(2),ct:st.timing==="on"?"ontime":st.timing,ch:+st.h.toFixed(2),dec:null,open:false,sit:{height:st.h>=2.1?"high":st.h>=1.0?"med":"low"},
    pick:{shot:BOLD[c.shot],cell:[["short","mid","deep"].indexOf(c.d),c.l*2]},best:{shot:BOLD[best.shot],cell:[["short","mid","deep"].indexOf(best.d),best.l*2]},end:null});
  if(LABSC[lab]===2)m.right++;bDefend(c)}
function bAskServe(){bPhase("SERVE");BT.pick={shot:"serve",risk:"normal"};var pm={};pm[state.side]="serve";setPoses(pm);shotRail("serve",function(){},"serve");
  setPrompt("Your serve: pick a risk, tap a zone");gA.innerHTML="";for(var b=0;b<5;b++)(function(b){var n=state.side==="L"?b+1:5-b;bZone(8,16,b*1.6,b*1.6+1.6,"#FF9F1C",String(n),"Serve zone "+n,"",function(w){var t=bTapOpp(w);bCommitServe(Object.assign({shot:"serve",d:t.x!=null&&t.x<6?"mid":"deep",l:b<2?0:b>2?2:1,y:b*1.6+0.8,risk:BT.pick.risk},t))})})(b);
  var dock=function(){bDock(bRiskSeg()+'<p class="bthint">One serve. Bolder serves miss more but force weaker returns</p>');bWire(dock)};dock();cue("aim");
  bClock(function(){bCommitServe({shot:"serve",d:"deep",l:1,y:4,risk:"safe"})})}
function bCommitServe(c){bPhase("");clearTimeout(BT.clk);stopBar();gA.innerHTML="";bDock("");cue(null);railOff();bDefend(c)}
function bAskCover(choice){BT.cur=MATCH.cur;BT.pendingChoice=choice;var meI=bMeI(),hb=BT.st.h;railOff();gA.innerHTML="";
  var LN=meI===0?[["line",0,[0,2]],["middle",2,[2,4]]]:[["middle",0,[4,6]],["line",2,[6,8]]],D=[["net","Net",[0,3]],["mid","Mid",[3,6]],["deep","Back",[6,8]]];
  D.forEach(function(dd){LN.forEach(function(yy){bZone(8-dd[2][0],8-dd[2][1],yy[2][0],yy[2][1],"#0077B6",yy[0]==="middle"?dd[1]:"","Cover "+dd[1]+" "+yy[0],"cov",function(){bCommitCover({d:dd[0],l:yy[1]})})})});
  var hk=bKey(BT.hit[0],BT.hit[1]);setPrompt("They're hitting from "+hb.toFixed(1)+" m · where do you cover?");bHabits(true);
  bDock('<p class="bthint">'+(hb>=2.1?"High ball: expect a smash. Back off or cover the middle.":hb<1.3?"They must lift it. Close the net, watch for the lob.":"Neutral ball. Hold, and read their habit.")+'</p>');
  bClock(function(){bCommitCover({d:"mid",l:meI===0?2:0})})}
function bCommitCover(cv){clearTimeout(BT.clk);stopBar();gA.innerHTML="";bDock("");var meI=bMeI(),T=BT.teams,bk=bBand(BT.st.h),pc=bAIcover(T[1],T[0].p[1-meI],bk),covers=[];covers[meI]=cv;covers[1-meI]=pc;
  bReveal(BT.pendingChoice,covers)}
/* What they tend to do: shown while you decide */
function bHabits(def){var T=BT.teams[1],bk=bBand(BT.st.h),M=def?(T.landMem&&T.landMem[bk]):(T.covMem&&T.covMem[bk]);var e=$("bthab");if(!e){e=document.createElement("div");e.id="bthab";e.className="bthab";var box=$("cmd")&&$("cmd").parentNode;if(box)box.appendChild(e)}
  if(!M){e.hidden=true;return}var tot=0,arr=[];for(var i=0;i<9;i++){tot+=M[i]||0;arr.push([i,M[i]||0])}arr.sort(function(a,b){return b[1]-a[1]});if(tot<1.5){e.hidden=true;return}
  var top=arr[0],pc=Math.round(top[1]/tot*100),lab=def?["short","mid","deep"][(top[0]/3)|0]+" "+["left","middle","right"][top[0]%3]:BCOVNM[BCOV[top[0]].d]+" "+["","",""][0];
  e.hidden=false;e.textContent=(def?"They usually hit ":"They usually cover ")+(def?lab:BCOVNM[BCOV[top[0]].d].toLowerCase())+" · "+pc+"%"}
/* ---------- Point over ---------- */
function bPointEnd(won,r,choice,covers,hT){bPhase("");var m=MATCH,cur=m.cur;document.body.classList.remove("btrecv");if(!cur||cur.done)return;var OD=BT.odds;BT.odds=null;cur.done=true;clearTimeout(BT.clk);stopBar();bDock("");gA.innerHTML="";railOff();if(r&&r.wrong)bMarkRail(r.wrong.shot,r.wrong.best);var e=$("bthab");if(e)e.hidden=true;
  if(r.end==="err"&&choice&&choice.shot==="serve")r.why="fault";var kind=r.end==="winner"?(won?"winner":"gap"):(won?"theymiss":"miss");pointEnd(m,won,kind);renderScore();
  var you=hT===0,mh=you&&BT.hit&&BT.hit[1]===bMeI(),head=r.why==="wrongshot"?"Their winner.":r.why==="late"?"Too late.":r.why==="fault"?(you?"Service fault.":"They faulted."):r.end==="winner"?(won?"Winner!":"Their winner."):r.why==="net"?(you?(mh?"Into the net.":"Your partner netted it."):"They netted it."):r.why==="out"?(you?(mh?"Out.":"Your partner hit it out."):"They hit it out."):(you?(mh?"You missed.":"Your partner missed."):"They missed.");
  var why=r.wrong?"✗ "+bName(r.wrong.shot)+" doesn't work here. ✓ "+bName(r.wrong.best)+": "+(r.wrong.why.split(": ")[0])+".":r.why==="late"&&r.capd?"A fast "+bName(choice.shot).toLowerCase()+" that far from you can't be reached. Stand closer to where they attack.":r.why==="late"?"You didn't reach it before it hit the sand. Tap the landing spot sooner, or start closer to where they like to hit.":r.why==="fault"?"One serve only. A safer serve faults less.":r.end==="winner"?"The ball took "+r.tBall.toFixed(2)+" s. They needed "+r.tNeed.toFixed(2)+" s"+(r.readOK?", even though they read it.":", and they had covered the wrong spot."):
    r.why==="net"?"Hitting down from "+BT.st.h.toFixed(1)+" m, below the net, mostly finds the net. Lift it instead.":r.why==="out"?"Bold aims near the lines miss more often.":"Off balance, the error chance goes up.";
  var G=BT.grade||null,o=over();function over(){return (m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2}
  var html='<div class="ptres '+(won?"w":"l")+'"><b>'+head+'</b> '+why+'</div>'+(G?'<div class="fbbest"><b>Best play</b><p>'+bName(G.best.shot)+' '+G.best.d+' '+["left","middle","right"][G.best.l]+', '+G.best.risk+'.</p></div>':'')+'<!--more-->'+
    (covers&&r.end!=="err"?fbSec("The read",(you?"They covered ":"You covered ")+bCovLabel(covers[r.i||0],r.i||0)+". "+(r.readOK?"That was the right spot.":"That left the space open.")):"")+
    (OD?fbSec("The odds of that shot","Against where they stood: "+OD.win+"% winner, "+OD.err+"% error, "+OD.play+"% in play."):"")+(G?fbSec("Your last choice",G.lab+". From "+G.h.toFixed(1)+" m the best option was "+bName(G.best.shot).toLowerCase()+" "+G.best.d+" "+["left","middle","right"][G.best.l]+", "+G.best.risk+"."):"")+fbSec("How points are won","Earn a high ball, hit where they aren't covering, and keep your own choices mixed. They learn your habits.");
  if(!won&&G)saveLost({sit:{height:G.h>=2.1?"high":G.h>=1?"med":"low",depth:"mid",speed:"med",side:"body",A:[1,0],B:[1,2]},pick:{shot:BOLD[G.c.shot],cell:[["short","mid","deep"].indexOf(G.c.d),G.c.l*2]},ans:{shot:BOLD[G.best.shot],cell5:[["short","mid","deep"].indexOf(G.best.d),G.best.l*2]},kind:kind,tier:LABSC[G.lab]===2?2:0,aimT:0,moveOk:true,why:"",rival:m.r.pair});
  FBTICKS=(G?[[G.lab,LABSC[G.lab],true],[G.h.toFixed(1)+" m",G.h>=NET_H?2:G.h>=1?1:0,true]]:[]).concat(OD?[[OD.win+"% winner",OD.win>=30?2:1,true],[OD.err+"% error",OD.err>=20?0:OD.err>=10?1:2,true]]:[]);if(!FBTICKS.length)FBTICKS=null;FBRACE=r.tBall&&!r.wrong?{b:r.tBall,n:r.tNeed,who:hT===0?"Them":"You"}:null;BT.grade=null;
  buzz(won?[30,40,30]:[60]);track("point_played",{rival:m.r.id,mode:"beat",won:won,end:kind,touches:BT.touch,lab:G?G.lab:null});
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;fbShow(html,o?"See the result":"Next point",function(){playOn(o)})},700)}

function newPoint(){if(MATCH&&MATCH.mode==="beat"){beatNewPoint();return}clearPosture();setPips(0);lvStop();var m=MATCH,g=m.r.gen,srv=serverFor(m.points),os=(Math.floor(m.points/2)%4)===1?"A":"B",men=state.rules==="men";
  var og=g.opp[Math.floor(Math.random()*g.opp.length)],sit={side:wpick([["fh",4],["body",2],["bh",3]]),depth:"mid",speed:wpick(g.speed),height:wpick(g.height),A:og[0].slice(),B:og[1].slice()};
  if(srv==="opp"){sit.ret=true;sit.height=wpick([["low",3],["med",4]]);sit.speed=wpick([["fast",3],["med",4],["slow",1]]);
    var sl=os==="A"?0:2,pl=2-sl,o=men?[[1,sl],[1,pl]]:[[1,sl],[0,pl]];sit.A=os==="A"?o[0]:o[1];sit.B=os==="A"?o[1]:o[0]}
  if(!sit.ret){var op=oppPose(sit);if(op==="neutral")sit.speed="med";if(op==="lob"&&sit.speed==="fast")sit.speed="med"}
  m.cur={sit:sit,ans:solveSit(sit),pick:{},t0:0,srv:srv,os:os,mate:Math.random()<0.35};renderScore();
  if(srv==="me")servePhase();else if(srv==="mate")mateServe();else lvIncoming()}
function serveForm(srv,os){var men=state.rules==="men",me=state.side,pt=me==="L"?"R":"L",ly={L:2.6,R:5.4},pos={};
  pos.A=[11.6,2.6];pos.B=[11.6,5.4];pos[me]=[4.4,ly[me]];pos[pt]=[4.4,ly[pt]];
  if(srv==="me"){pos[me]=[-0.9,ly[me]];pos[pt]=[men?1.6:4.4,ly[pt]]}
  else if(srv==="mate"){pos[pt]=[-0.9,ly[pt]];pos[me]=[men?1.6:4.4,ly[me]]}
  else{var other=os==="A"?"B":"A";pos[os]=[16.9,os==="A"?2.6:5.4];pos[other]=[men?14.4:11.6,other==="A"?2.6:5.4]}
  return pos}
function windChip(){return state.wind==="calm"?"":'<div class="wchip w-'+state.wind+'"><b>'+{breezy:"Breezy",gusty:"Gusty"}[state.wind]+'</b><small>'+windWords().replace(/^(Breezy|Gusty) /,"").replace(/^wind /,"Wind ").replace(/^crosswind/,"Crosswind")+'</small></div>'}
function ruleNote(){return state.rules==="men"?"Men's open rules. The server's partner waits behind the 6 m line until the serve is struck.":"Women's and mixed rules. The server's partner waits behind the 3 m line until the serve is struck."}
function zoneOf(b,side){return side==="L"?b+1:5-b}
function serveTarget(z,side){var t=SVT[z];return side==="L"?[t[0],8-t[1]]:t.slice()}
function judgeServe(z,side){var v=windV(),cross=state.wind!=="calm"&&Math.abs(v[1])>0.6,b=side==="L"?z-1:5-z,outer=b===0||b===4,toward=(b===4&&v[1]>0)||(b===0&&v[1]<0);
  if(cross&&outer&&toward)return ["risky","The crosswind is blowing towards that sideline and can carry the serve out."];
  if(cross&&outer)return ["good","Smart. The crosswind blows the ball back into the court."];
  if(state.wind==="gusty"&&(z===1||z===5))return ["risky","In gusty wind, keep the serve away from the lines."];
  if(z===2||z===3)return ["good","Good serve. Zones 2 and 3 are the safe, everyday targets."];
  if(z===5)return ["ok","Wide to 5 can surprise them. You signalled it, so your partner guards the line."];
  return ["ok","Fine as a surprise. Mix it in, don't overuse it."]}
/* Your serve. Tap a square, pick a speed, then swipe the ball to set the spin and serve */
var SV_SPD={slow:1400,neutral:1000,fast:700},SV_ROT={slow:0.36,neutral:0.72,fast:1.08},SPIN_LBL={flat:"Flat",top:"Topspin",left:"Curve left",right:"Curve right",slice:"Backspin"};
function serveRisk(d,l,speed,spin){var r=0,why=[],add=function(n,t,base){if(n){r+=n;if(n>0)why.push([n+(base?0:0.5),t])}};
  if(l===0||l===4)add(1,"The lines leave little margin.",1);if(d===0)add(1,"A short serve sits up for them to attack.",1);if(d===2)add(1,"Deep serves leave little room before the baseline.",1);
  if(speed==="fast"){if(d===2)add(1,"A fast serve carries long.");if(l===0||l===4)add(1,"A fast serve near the line has no margin.")}
  if(speed==="slow"){if(d===0)add(1,"A slow short serve is easy to attack.");if(d===2)add(-1)}
  if(spin==="top"){if(d===2)add(-1);if(d===0)add(1,"Topspin dips, so short serves drop too early.")}
  if(spin==="left"||spin==="right"){var cs=spin==="left"?0:4,os=4-cs;if(l===cs)add(2,"Side spin curves it further towards that line.");if(l===os)add(-1)}
  if(spin==="slice"){if(d===2)add(1,"Backspin floats and carries long.");if(d===0)add(-1)}
  var v=windV(),mw=state.wind==="gusty"?2:state.wind==="breezy"?1:0;
  if(mw){if(v[0]>0.7){if(d===2)add(mw,"Wind behind you carries the serve long.");if(d===2&&speed==="fast"&&spin==="flat")add(mw,"Wind behind you plus a fast flat serve carries long.")}
    else if(v[0]<-0.7){if(d===0)add(mw,"Into the wind, short serves die before the net player.");if(d===0&&speed==="slow")add(mw,"A slow serve into the wind falls short.");if(d===2)add(-mw)}
    if(Math.abs(v[1])>0.7){var dl=v[1]>0?4:0,with_=(spin==="right"&&dl===4)||(spin==="left"&&dl===0),against=(spin==="left"&&dl===4)||(spin==="right"&&dl===0);
      if(l===dl&&!against)add(with_?2*mw:mw,with_?"The crosswind and your side spin both push it out.":"The crosswind blows the serve towards that line.")}}
  r=Math.max(0,r);why.sort(function(a,b){return b[0]-a[0]});return {r:r,tier:r<=1?"good":r===2?"ok":"risky",why:why.length?why[0][1]:""}}
function svTarget(c){return [(AX[c[0]][0]+AX[c[0]][1])/2,(AY[c[1]][0]+AY[c[1]][1])/2]}
var BALLSVG='<span class="swipecap">Swipe ball</span><span class="swipehint" aria-hidden="true">&#8593;</span><svg viewBox="-50 -50 100 100" role="img" tabindex="0" aria-label="Swipe the ball to set the spin"><defs><clipPath id="svclip"><circle r="44"/></clipPath></defs><circle r="44" fill="#DDF02B" stroke="#9C9A12" stroke-width="1.5"/><g id="sv-seam" clip-path="url(#svclip)"><path d="M0 -44C-40 -15 40 15 0 44A44 44 0 0 0 0 -44Z" fill="#FF4D6D"/><path d="M0 -44C-40 -15 40 15 0 44" fill="none" stroke="#fff" stroke-width="3"/></g><line id="sv-arrow" x1="0" y1="0" x2="0" y2="0" stroke="#0D1B2A" stroke-width="5" stroke-linecap="round" opacity="0"/></svg>';
function hideServeUI(){document.body.classList.remove("them-pane");["cmd","svpop","svtab"].forEach(function(i){var e=$(i);if(e){e.hidden=true;e.classList.remove("min","in")}})}
/* Compete panel below the court: one short instruction, then the last point */
var LASTPT="";
function alignScore(){var sc=$("score"),pts=sc&&sc.querySelector(".pts");if(!pts||typeof WORLD==="undefined")return;sc.style.transform="";
  if(window.innerWidth>900)return;var q=SVGC.createSVGPoint();q.x=X(8);q.y=Y(4);var n=q.matrixTransform(WORLD.getScreenCTM()),r=pts.getBoundingClientRect(),dx=n.x-(r.left+r.width/2);
  }
window.addEventListener("resize",function(){if(MATCH)setTimeout(alignScore,50)});
function courtInView(){setTimeout(alignScore,30);if(window.innerWidth>900)return;var c=document.querySelector(".court-card");if(!c)return;var r=c.getBoundingClientRect(),room=window.innerHeight-(($("resbar")&&$("resbar").offsetHeight)||70);if(r.top<-2||r.bottom>room)window.scrollBy({top:r.top-6,behavior:RM?"auto":"smooth"})}
function cpanelLive(pr){setTimeout(courtInView,60);var c=$("cpanel");if(!c)return;c.innerHTML='<p class="cprompt big" id="cs-prompt">'+(pr||"")+'</p><div class="timer" hidden><i id="tbar"></i></div><p hidden id="sv-sum"></p><p hidden id="sh-sum"></p>';resBar(LASTPT);setPrompt(pr)}
function resBar(h){var r=$("resbar");if(h===null){if(r)r.remove();return null}if(!r){r=document.createElement("div");r.id="resbar";r.className="resbar";r.setAttribute("role","status");document.body.appendChild(r)}r.innerHTML='<div class="rbin"><p class="cprompt big" id="rb-prompt"></p><div id="lastpt" class="lastpt">'+h+'</div></div>';document.body.classList.add("hasres");wireLast();return r}
function wireLast(){var w=document.querySelector("#lastpt .lp-why");if(w)w.onclick=function(){var d=$("lp-more");if(!d)return;d.hidden=!d.hidden;w.setAttribute("aria-expanded",String(!d.hidden));w.closest(".lp").classList.toggle("open",!d.hidden);w.innerHTML=d.hidden?"Why? &#9652;":"Hide &#9662;"}}
var SHORT={"Pick your shot on the left":"Pick a shot","Pick your shot":"Pick a shot","Pick a shot on the left":"Pick a shot","Flick or tap where to hit":"Aim","Tap where you move":"Move","Select your court position":"Move","Flick or tap where to serve":"Serve: flick or tap a zone","Run to the ball":"Meet the ball: tap a ring","Watch the ball":"Watch the ball","They serve":"Their serve","Watch your partner":"Watch your partner","Read their shot":"Watch the ball","Choose your shot":"Pick a shot"};
function setPrompt(t){["cs-prompt","rb-prompt"].forEach(function(id){var e=$(id);if(e)e.textContent=t||""})}
function cmd(t){if(state.tab==="compete"&&t){var x=SHORT[t]||t;if(x==="Pick a shot"&&MATCH&&MATCH.cur&&MATCH.cur.ch!=null)x+=" · "+MATCH.cur.ch.toFixed(1)+" m"+(MATCH.cur.ch>=NET_H?", above the net":", below the net");setPrompt(x)}var e=$("cmd");if(!t){e.hidden=true;return}e.textContent=t;e.hidden=false;e.classList.remove("pulse");void e.offsetWidth;e.classList.add("pulse")}
function servePhase(){if(oppPill){oppPill.remove();oppPill=null}gauge(null);$("cpanel").classList.remove("fb");hideServeUI();hideShotUI();var m=MATCH,cur=m.cur,me=state.side,pt=me==="L"?"R":"L",form=serveForm("me");
  gG.innerHTML="";gM.innerHTML="";clearTimeout(tagTimer);if(ballTag){ballTag.remove();ballTag=null}runBall(null);drawZones(true,form[me][1]<4?"L":"R","opp");
  ["A","B","L","R"].forEach(function(k){place(k,form[k],true)});lvStart(form);var pm={};pm[me]="serve";setPoses(pm);
  var hb=el("circle",{cx:X(form[me][0]+0.4),cy:Y(form[me][1]),r:6,fill:"#DDF02B",stroke:"#FF4D6D","stroke-width":2},gM);
  document.body.classList.add("c-live");$("csit").hidden=true;$("c-sr").textContent="Point "+(m.points+1)+". Your serve. "+windWords()+". Choose a speed and spin, then select where to serve.";
  cur.sv={cell:null,speed:"neutral",spin:"flat",set:false};
  var c=$("cpanel");cpanelLive("Your serve");
  var pop=$("svpop"),tab=$("svtab"),adv=state.level==="advanced"||state.level==="pro";
  pop.innerHTML=GRAB+'<div class="svhead"><b>Your serve</b><button class="svmin" id="sv-min" aria-label="Minimise serve settings">&#8250;</button></div>'+
    (load("swiped","")?'':'<p class="svtip">Swipe the ball to choose the spin direction. Up for topspin, left or right to curve, down for backspin.</p>')+
    '<div class="svgrid"><div class="svball" id="svball">'+BALLSVG+'<span class="svlbl" id="sv-lbl">Flat</span></div><div class="svside"><div class="seg sv-spd" id="sv-spd"><button data-v="slow" aria-pressed="false">Slow</button><button data-v="neutral" aria-pressed="true">Neutral</button><button data-v="fast" aria-pressed="false">Fast</button></div>'+
    '<div class="svbtns" id="sv-spin"><button data-v="flat" aria-pressed="true">Flat</button>'+'</div><button class="btn primary svdone" id="sv-done">Done &#8250;</button></div></div>';
  function summary(){var t=SPIN_LBL[cur.sv.spin]+", "+cur.sv.speed+" speed";$("sv-sum").textContent=t;tab.innerHTML='<span aria-hidden="true">&#8249;</span><small>'+SPIN_LBL[cur.sv.spin]+'<br>'+cur.sv.speed[0].toUpperCase()+cur.sv.speed.slice(1)+'</small>'}
  function openPop(){tab.hidden=true;pop.hidden=false;pop.classList.remove("min");void pop.offsetWidth;pop.classList.add("in");sheetState();wireGrab(pop,tab,"Serve");cmd("Set your speed and spin")}
  function minPop(){if(pop.hidden)return;setTimeout(sheetState,320);pop.classList.remove("in");pop.classList.add("min");setTimeout(function(){if(pop.classList.contains("min")){pop.hidden=true;pop.classList.remove("min")}},300);tab.hidden=false;summary();if(!cur.served)cmd("Select where to serve")}
  tab.onclick=function(){if(cur.served)return;openPop()};$("sv-min").onclick=minPop;$("sv-done").onclick=minPop;
  cmd("Flick or tap where to serve");cue("aim");if(m.points===0&&!load("served1",""))serveHint(true);
  cur.serveCell=function(cell){if(cur.served)return;cur.sv.cell=cell;doServe(false)};drawAim(cur.serveCell,null);shotRail("serve",null,"serve");
  [].forEach.call($("sv-spd").children,function(b){b.onclick=function(){cur.sv.speed=b.dataset.v;[].forEach.call($("sv-spd").children,function(x){x.setAttribute("aria-pressed",String(x===b))});svRate();summary()}});
  var autoMin=null;function setSpin(v,fromUser){cur.sv.spin=v;$("sv-lbl").textContent=SPIN_LBL[v];[].forEach.call($("sv-spin").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.v===v))});svRate();summary();
    if(fromUser){clearTimeout(autoMin);autoMin=setTimeout(minPop,700)}}
  [].forEach.call($("sv-spin").children,function(b){b.onclick=function(){setSpin(b.dataset.v,true)}});
  var seamEl=$("sv-seam"),ang=0,rate=0,last=0,live=true;function svRate(){rate=cur.sv.spin==="flat"?0.12:SV_ROT[cur.sv.speed]*(cur.sv.spin==="slice"?-1:1)}svRate();
  (function loop(t){if(!live||!document.body.contains(seamEl))return;var dt=last?Math.min(50,t-last):0;last=t;if(!RM)ang=(ang+rate*dt)%360;seamEl.setAttribute("transform","rotate("+ang.toFixed(1)+")");requestAnimationFrame(loop)})(0);
  var svg=$("svball").querySelector("svg"),arrow=$("sv-arrow"),start=null,dir=null;
  svg.addEventListener("pointerdown",function(e){if(cur.served)return;start=[e.clientX,e.clientY];dir=null;svg.setPointerCapture(e.pointerId);e.preventDefault()});
  svg.addEventListener("pointermove",function(e){if(!start)return;var dx=e.clientX-start[0],dy=e.clientY-start[1],dist=Math.hypot(dx,dy),r=svg.getBoundingClientRect(),k=100/r.width;
    arrow.setAttribute("x2",(dx*k).toFixed(1));arrow.setAttribute("y2",(dy*k).toFixed(1));arrow.setAttribute("opacity",dist>6?0.8:0);
    if(dist>=24){var nd=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"top":"slice");if(nd!==dir){dir=nd;setSpin(nd,false)}svRate();rate*=1+Math.min(1.5,dist/120)}});
  svg.addEventListener("pointerup",function(){if(!start)return;start=null;arrow.setAttribute("opacity",0);if(dir){setSpin(dir,true);save("swiped","1");document.body.classList.add("swiped")}});
    svg.addEventListener("keydown",function(e){var k={ArrowUp:"top",ArrowLeft:"left",ArrowRight:"right",ArrowDown:"slice"}[e.key];if(k){e.preventDefault();setSpin(k,true)}});
  function doServe(late){cur.served=true;live=false;clearTimeout(cTimer);clearTimeout(autoMin);cue(null);serveHint(false);
    if(late&&!cur.sv.cell){hb.remove();serveLate(cur,form[me]);return}save("served1","1");var sv=cur.sv;markAim(sv.cell);hb.remove();
    pop.hidden=true;tab.hidden=true;cmd("");sheetState();
    var rk=serveRisk(sv.cell[0],sv.cell[1],sv.speed,sv.spin);cur.serveQ=rk.tier;cur.serveRisk=rk;cur.serveLate=late;
    setPrompt("");track("serve_played",{rival:m.r.id,cell:sv.cell.join(","),speed:sv.speed,spin:sv.spin,quality:rk.tier,late:late});
    var t=svTarget(sv.cell),dur=SV_SPD[sv.speed]/1.3,top=sv.spin==="top",sl=sv.spin==="slice";
    PROF._sv={d:dur,h:function(k){return 2.8*(1-k)+(top?2.4*S(PI*Math.pow(k,0.75)):sl?1.9*S(PI*k):1.3*S(PI*k))}};
    var d=runBall({f:[form[me][0]+0.3,form[me][1]],to:t,shot:"_sv",spin:SV_ROT[sv.speed]*(sv.spin==="flat"?0.5:1.4),curve:sv.spin==="left"?-30:sv.spin==="right"?30:0,land:true},true);
    var rkey=Math.abs(t[1]-form.A[1])<Math.abs(t[1]-form.B[1])?"A":"B";cur.srcKey=rkey;cur.sit[rkey]=[1,t[1]<2.67?0:t[1]<5.33?1:2];
    setTimeout(function(){PL[pt].g.style.transitionDuration="900ms";place(pt,[4.4,form[pt][1]],false);PL[rkey].g.style.transitionDuration="500ms";place(rkey,[form[rkey][0],t[1]],false)},Math.min(d,400));
    lvGo(pt,[4.4,form[pt][1]]);setPrompt("Move in: tap where to go");
    setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;clearAim();applyReply(cur,replyCtx("serve",sv.cell,sv.speed==="neutral"?"med":sv.speed,"in",cur.serveQ,"me"),rkey,[LV.pos[me].slice(),LV.pos[pt].slice()]);cur.ans=solveSit(cur.sit);lvIncoming()},d+Math.round(((rv().react||0.25)+0.2)/lvScale()*1000));
    if(0)setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;
      cmd("Select your court position");setPrompt("Move");
      var from=form[me],tr=el("line",{x1:X(from[0]),y1:Y(from[1]),x2:X(from[0]),y2:Y(from[1]),stroke:"#0D1B2A","stroke-opacity":0.5,"stroke-width":2.5,"stroke-dasharray":"1 7","stroke-linecap":"round"},gM);
      var mvSecs=decideSecs(m.r);startBar(mvSecs||0,0);clearTimeout(cTimer);if(mvSecs)cTimer=setTimeout(function(){if(MATCH&&MATCH.cur===cur&&!cur.svMoved&&cur.svGo)cur.svGo(form[me].slice())},mvSecs*1000);
      cur.svGo=function(pos){if(cur.svMoved)return;cue(null);cur.svMoved=pos;stopBar();cmd("");PL[me].g.style.transitionDuration="700ms";place(me,pos,false);tr.setAttribute("x2",X(pos[0]));tr.setAttribute("y2",Y(pos[1]));
        setTimeout(function(){serveFeedback2(form,function(){clearAim();applyReply(cur,replyCtx("serve",sv.cell,sv.speed==="neutral"?"med":sv.speed,"in",cur.serveQ,"me"),rkey,[cur.svMoved,[4.4,form[pt][1]]]);cur.ans=solveSit(cur.sit);drawPoint(true);decidePanel()})},750)};
      drawAim(null,function(pos){cur.svGo(pos)});cue("move")},d+300)}
  var secs=decideSecs(m.r,"serve");setWindBadge();startBar(secs,300);
  clearTimeout(cTimer);if(secs)cTimer=setTimeout(function(){if(!cur.served)doServe(true)},secs*1000+300)}
function serveLate(cur,at){var m=MATCH;cur.done=true;stopBar();cmd("");PROF._sl={d:420,h:function(k){return 2.2*(1-k)}};runBall({f:[at[0]+0.3,at[1]],to:[at[0]+0.5,at[1]+0.2],shot:"_sl",land:true},false);
  buzz([60]);pointEnd(m,false,"late");renderScore();track("serve_played",{rival:m.r.id,late:true,fault:true});
  var over=(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2;
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;fbShow('<div class="ptres l"><b>Too slow.</b> Serve before the clock ends.</div>',over?"See the result":"Next point",function(){playOn(over)})},1400)}
var TIERC={good:["#2ECC71","High percentage"],ok:["#FF9F1C","Medium percentage"],risky:["#FF4D6D","Low percentage"]};
function serveFeedback2(form,go){var m=MATCH,cur=m.cur,sv=cur.sv,rk=cur.serveRisk,me=state.side,lane=form[me][1];
  drawAim(function(){},null);[].forEach.call(gA.children,function(g){var k=g.getAttribute("data-c");if(!k)return;var c=k.split(",").map(Number),q=serveRisk(c[0],c[1],sv.speed,sv.spin).tier,r=g.firstChild,on=c[0]===sv.cell[0]&&c[1]===sv.cell[1];
    r.setAttribute("fill",TIERC[q][0]);r.setAttribute("fill-opacity",0.42);r.setAttribute("stroke",on?"#0D1B2A":"none");r.setAttribute("stroke-width",on?3:0);g.style.cursor="default"});
  var mp=cur.svMoved,ideal=[4.2,lane<4?2.8:5.2],dist=Math.hypot(mp[0]-ideal[0],mp[1]-ideal[1]),mq=dist<=1?"good":dist<=1.8?"ok":"risky";
  el("circle",{cx:X(ideal[0]),cy:Y(ideal[1]),r:20,fill:"#2ECC71","fill-opacity":0.25,stroke:"#00776F","stroke-width":2.5,"stroke-dasharray":"4 4"},gM);
  if(mq==="risky"&&rk.tier!=="risky")cur.serveQ="ok";
  var head={good:"Good serve.",ok:"Playable serve.",risky:"Risky serve."}[rk.tier],sub=SPIN_LBL[sv.spin]+", "+sv.speed+", to the "+cellName5(sv.cell).toLowerCase()+".";
  var why=rk.tier==="good"?"High percentage target for that speed, spin and wind.":rk.why;
  var mv=mq==="good"?"Good follow in.":mq==="ok"?"Close. Follow in to just behind your 3 m line, the green mark.":"Follow your serve in to just behind your 3 m line, the green mark.";
  var html='<div class="ptres '+(rk.tier==="risky"?"l":rk.tier==="ok"?"m":"w")+'"><b>'+head+'</b> '+(rk.tier==="good"?"":rk.why)+'</div><p class="fbline">'+mv+'</p><!--more-->'+fbSec("Your serve",(cur.serveLate?"Too slow, so you served flat. ":"")+sub+" "+why)+
    fbSec("Where you aimed","Every square is coloured for that speed, spin and wind. Green is high percentage, orange medium, red low.")+fbSec("Your position",mv)+fbSec("Opponents","Both receivers were waiting just behind their 3 m line.")+fbSec("Wind",windText());
  track("serve_move",{quality:mq,distance:+dist.toFixed(2)});fbShow(html,"Play on",function(){if(!MATCH||MATCH.cur!==cur)return;go()})}
function mateServe(){if(oppPill){oppPill.remove();oppPill=null}gauge(null);hideServeUI();hideShotUI();setWindBadge();$("ctimer").hidden=true;$("cpanel").classList.remove("fb");var m=MATCH,cur=m.cur,me=state.side,pt=me==="L"?"R":"L",form=serveForm("mate"),side=form[pt][1]<4?"L":"R",z=wpick([[3,4],[2,4],[4,2],[1,1],[5,1]]);
  gG.innerHTML="";gM.innerHTML="";clearTimeout(tagTimer);if(ballTag){ballTag.remove();ballTag=null}runBall(null);
  ["A","B","L","R"].forEach(function(k){place(k,form[k],true)});lvStart(form);var pm={};pm[pt]="serve";setPoses(pm);drawZones(true,side,"opp",z);
  document.body.classList.add("c-live");$("csit").hidden=true;$("c-sr").textContent="Point "+(m.points+1)+". Your partner serves to zone "+z+". "+windWords()+".";
  showTag(cur.sit,form[pt],0,{hw:"SIGNAL",t2:"ZONE "+z});
  var c=$("cpanel");cpanelLive("Partner serves to zone "+z+(z===5?". Guard your line":""));
  cur.serveQ="ok";cur.serveNote="";cmd("Your partner serves to zone "+z);
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;var t=serveTarget(z,side),d=runBall({f:[form[pt][0]+0.3,form[pt][1]],to:t,shot:"serve"},true);
    var rk=Math.abs(t[1]-form.A[1])<Math.abs(t[1]-form.B[1])?"A":"B";cur.srcKey=rk;cur.sit[rk]=[1,t[1]<2.67?0:t[1]<5.33?1:2];
    setTimeout(function(){lvGo(pt,[3.8,form[pt][1]])},300);setPrompt("Get ready: move any time");
    setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;drawZones(false);applyReply(cur,replyCtx("serve",[1,Math.max(0,Math.min(4,z-1))],"med","in","ok","mate"),rk,[LV.pos[me].slice(),LV.pos[pt].slice()]);cur.ans=solveSit(cur.sit);lvIncoming()},d+700)},1600)}
/* Partner points. The ball goes to your partner, you read their shot and take up position */
var MATE_X={push:5.6,flatsmash:5.6,hook:4.6,neutral:4.5,dig:4.5,lob:5.2,drop:4.8},MATE_SPD={push:"fast",flatsmash:"fast",hook:"fast",dig:"med",neutral:"med",lob:"slow",drop:"slow"};
var MATE_TXT={push:"After an attack, step in level with your partner, about 2.5 m from the net.",flatsmash:"After an attack, step in level with your partner, about 2.5 m from the net.",
  hook:"Recover to just behind your 3 m line, level with your partner.",neutral:"Hold level just behind your 3 m line and get ready.",dig:"Hold level just behind your 3 m line and get ready.",
  lob:"They chase it to the back. Move in towards your 3 m line.",drop:"Follow in one step, just behind your 3 m line, ready for the lift."};
function laneY(k){return k==="L"?2.8:5.2}
function sitPos(sit){var D=DI[sit.depth],youX=[6.4,3.6,1.0][D],youY=state.side==="L"?2.6:5.4,partner=state.side==="L"?"R":"L",pos={A:oP(sit,"A"),B:oP(sit,"B")};
  pos[state.side]=sit.me0||[youX,youY];pos[partner]=sit.mate0||[D===0?5.4:3.8,state.side==="L"?5.4:2.6];var hs=state.hand==="L"?-1:1,off=hs*(sit.side==="fh"?0.55:sit.side==="bh"?-0.55:0),cy=youY+off;
  return {pos:pos,contact:sit.cxy||[youX+0.3,cy],partner:partner,mateContact:sit.cxy||[pos[partner][0]+0.3,pos[partner][1]+off]}}
function drawPoint(smooth){var m=MATCH,sit=m.cur.sit,sp=sitPos(sit),osv=m.cur.srv==="opp";gG.innerHTML="";gM.innerHTML="";drawZones(false);
  var form=osv?serveForm("opp",m.cur.os):null,sk=osv?m.cur.os:(m.cur.srcKey||(sp.pos.A[0]<=sp.pos.B[0]?"A":"B"));
  ["A","B","L","R"].forEach(function(k){if(smooth){PL[k].g.style.transitionDuration="700ms";place(k,sp.pos[k],false)}else place(k,form?form[k]:sp.pos[k],true)});
  var endH={low:0.4,med:1.4,high:3.0}[sit.height],arc={fast:0.4,med:1.2,slow:2.2}[sit.speed],src=form?[form[sk][0]-0.3,form[sk][1]]:sp.pos[sk];
  var pm={};pm[sk]=osv?"serve":oppPose(sit);setPoses(pm);if(pm[sk]==="flatsmash")0;
  if(form)setTimeout(function(){if(!MATCH||!MATCH.cur||MATCH.cur.sit!==sit)return;["A","B","L","R"].forEach(function(k){PL[k].g.style.transitionDuration="1000ms";place(k,sp.pos[k],false)})},250);
  PROF._in={d:{fast:380,med:850,slow:1800}[sit.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  var cur=m.cur,to=cur.mate?sp.mateContact:sp.contact;
  /* When you have to run, the ball stops in the air while you read their shot, then drops towards its shadow once you go */
  var needRun=!cur.mate,d,spin0={fast:2.4,med:1.0,slow:0.35}[sit.speed];cur.flight=null;
  if(needRun){/* One smooth flight: off their racket fast, slowing as it drops to its shadow. Reach it before it lands */
    var st0=sp.pos[state.side],dd0=dst(st0,sp.contact),bk0=sp.contact[0]<st0[0]-1,tP0=TIN[sit.shot||oppPose(sit)]||{fast:.45,med:1,slow:1.6}[sit.speed],
      far0=(0.3+Math.max(0,dd0-1.1)/(4.2*(bk0?0.6:1)))>tP0+0.25,fA=PROF._in.d*1.3*0.6,T=RM?1500:Math.round(fA+(far0?900:runWindow(cur)+600)),
      H=flightH(sit);
    PROF._inF={d:T/1.3,h:function(k){return H(fEase(k))}};cur.flight={src:src,to:to,T:T,H:H,t0:performance.now()};cur.runEnd=cur.flight.t0+T;
    d=runBall({f:src,to:to,shot:"_inF",spin:spin0,trail:sit.speed,land:true},false);d=Math.round(fA);
    clearTimeout(cur.fallTimer);cur.fallTimer=setTimeout(function(){if(MATCH&&MATCH.cur===cur&&!cur.done&&!cur.atBall)sandLoss(cur,cur.unreach?"far":"slow",true)},T+40)}
  else d=runBall({f:src,to:to,shot:"_in",spin:spin0,trail:sit.speed},false);
  m.cur.arrive=d;if(sit.cxy&&sit.cxy[1]>3.1&&sit.cxy[1]<4.9&&!osv){var cc=m.cur;setTimeout(function(){if(MATCH&&MATCH.cur===cc)mateSay(cc.mate?"mine":"yours")},Math.min(500,d*0.4))}
  clearTimeout(tagTimer);if(ballTag){ballTag.remove();ballTag=null}
  if(oppPill){oppPill.remove();oppPill=null}oppPill=courtPill(src,osv?"Serve":SHOTS[oppPose(sit)].name);var op0=oppPill;setTimeout(function(){if(oppPill===op0){op0.remove();oppPill=null}},Math.max(700,Math.min(1400,d||900)));
  if(cur.mate){var ms=cur.ans.shot,d2=RM?150:(PROF[ms]||PROF.neutral).d*1.3;m.cur.arrive=d+250+d2;
    gauge(sit.height,d);tagTimer=setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;POSE[sp.partner]=POSE_MAP[ms]||null;updImg(sp.partner);if(ms==="flatsmash")0;
      runBall({f:sp.mateContact,to:cur.ans.p,shot:ms,land:true},false);

      setPrompt("Move");
      $("c-sr").textContent="Your partner plays a "+SHOTS[ms].name.toLowerCase()+". Tap where you move."},d+250);return d}
  gauge(sit.height,d);
  if(cur.mate){cur.atBall=true;return d}
  var st=sp.pos[state.side],ct=sp.contact,dd=dst(st,ct),back=ct[0]<st[0]-1,tPhys=osv?9:(TIN[sit.shot||oppPose(sit)]||{fast:.45,med:1,slow:1.6}[sit.speed]),
    need=0.3+Math.max(0,dd-1.1)/(4.2*(back?0.6:1));cur.runNeed=need;cur.runT=tPhys;cur.unreach=!osv&&need>tPhys+0.25;
  if(cur.flight)drawRings(cur);else cur.atBall=true;
  return d}
/* Expected value of a choice, played out many times through the same engine. +1 we win the point, -1 we lose it */
var SHOTSET=["push","flatsmash","hook","neutral","lob","drop","dig"];
function evOne(cur,shot,cell,speed,N){var sit=cur.sit,t=shotTiers(sit,cur.ans.shot)[shot];if(t==null)t=1;var aimT=aimTier(cell,shot,sit,speed),v=0;
  for(var i=0;i<N;i++){var o=shotOutcome({shot:shot,speed:speed,cell:cell,tier:t,aimT:aimT,from:cur.from,sit:sit,ch:cur.ch,ct:cur.ctype,spare:cur.spare});
    v+=o.end==="winner"||o.end==="forced"||o.end==="theymiss"?1:o.end?-1:o.Q<0.35?0.35:o.Q>0.7?-0.15*Math.min(1,(o.Q-0.7)/0.3):0.1*(0.7-o.Q)/0.35}
  return v/N}
function gradeChoice(cur,p){var cells=[];for(var d=0;d<3;d++)for(var l=0;l<5;l++)cells.push([d,l]);var best=null,mineCells={};
  SHOTSET.filter(function(sh){return shotLegal(sh,cur.ch,cur.sit)}).forEach(function(sh){var sc=cells.map(function(c){return {c:c,v:evOne(cur,sh,c,p.speed,8)}}).sort(function(a,b){return b.v-a.v}).slice(0,3);
    sc.forEach(function(x){x.v=evOne(cur,sh,x.c,p.speed,30);if(!best||x.v>best.v)best={shot:sh,cell:x.c,v:x.v}})});
  best.v=evOne(cur,best.shot,best.cell,p.speed,60);
  cells.forEach(function(c){mineCells[c.join(",")]=evOne(cur,p.shot,c,p.speed,14)});
  var mine=evOne(cur,p.shot,p.cell,p.speed,60);if(mine>best.v)best={shot:p.shot,cell:p.cell,v:mine};var dl=best.v-mine,
    lab=dl<=0.08?"Best":dl<0.2?"Good":dl<0.35?"Inaccuracy":dl<0.55?"Mistake":"Blunder";
  if(lab==="Best"&&cur.ctype==="early"&&cur.ch>=NET_H&&((cur.press||0)>=0.5||cur.wasOpening))lab="Brilliant";
  return {lab:lab,d:dl,mine:mine,best:best,cells:mineCells}}
function contactText(cur,out,p){var k={early:"early",ontime:"on time",late:"late"}[cur.ctype],h=cur.ch.toFixed(1),a=out.arrH!=null?out.arrH.toFixed(1):null;
  return "You met it "+k+" at "+h+" m"+(cur.ch>=NET_H?", above the net, so you could hit down.":", below the net, so you had to lift it.")+(a&&ATK[aimShot(p.shot)]?" It reached them at "+a+" m"+(out.arrH<1?", so they had to lift it.":out.arrH>1.7?", high enough for them to attack.":"."):"")+(cur.ctype==="early"?" Taking it early gave them less time.":cur.ctype==="late"?" Waiting gave them more time to recover.":"")}
function pressText(pz,out){var n=Math.round(Math.min(3,pz*3));return n>=3?"Full pressure. They could only pop it up.":n?"Pressure "+n+" of 3. Keep them stretched to force a weak ball.":"No pressure yet. Make them run or take it early."}
var FBRACE=null;
var LABSC={Brilliant:2,Best:2,Good:2,Inaccuracy:1,Mistake:0,Blunder:0},LABPTS={Brilliant:100,Best:100,Good:85,Inaccuracy:60,Mistake:35,Blunder:10};
function heatEV(g,pick){var vals=Object.keys(g.cells).map(function(k){return g.cells[k]}),mx=Math.max.apply(null,vals);
  [].forEach.call(gA.children,function(el2){var k=el2.getAttribute("data-c");if(!k)return;var r=el2.firstChild,v=g.cells[k],t=mx-v<0.12?0:mx-v<0.3?1:2,on=pick&&k===pick.join(",");
    r.setAttribute("fill",["#2ECC71","#FF9F1C","#FF4D6D"][t]);r.setAttribute("fill-opacity",t===0?0.5:0.34);r.setAttribute("stroke",on?"#0D1B2A":"none");r.setAttribute("stroke-width",on?3:0)})}
/* How each opponent is standing: set, moving or stretched */
function setPosture(k,st){var pl=PL[k];if(!pl)return;var c=pl.post;if(!st){if(c)c.setAttribute("opacity",0);return}
  if(!c){c=el("circle",{r:25,fill:"none","stroke-width":4,"pointer-events":"none"},pl.g);pl.g.insertBefore(c,pl.g.firstChild);pl.post=c}
  c.setAttribute("stroke",{set:"#2ECC71",mov:"#FF9F1C",str:"#FF4D6D"}[st]);c.setAttribute("stroke-dasharray",st==="str"?"5 4":"none");c.setAttribute("opacity",0.9)}
function clearPosture(){setPosture("A",null);setPosture("B",null)}
function setPips(pz){var e=$("pips");if(!e)return;var n=Math.max(0,Math.min(3,Math.round((pz||0)*3)));[].forEach.call(e.children,function(x,i){x.className=i<n?"on":""});e.setAttribute("aria-label","Pressure "+n+" of 3")}
/* Three places to meet the ball on its way down: early (higher, nearer the net), on time, late (low) */
/* Ball height along its flight: leaves their racket at 1.2 m, peaks, lands at its shadow */
var APEX={high:{slow:5.0,med:4.2,fast:3.4},med:{slow:2.6,med:2.3,fast:2.0},low:{slow:1.5,med:1.3,fast:1.0}};
function flightH(sit){var A=(APEX[sit.height]||APEX.med)[sit.speed]||2.3;return function(e){return Math.max(0,1.2*(1-e)+4*A*e*(1-e))}}
function ringsFor(cur){var f=cur.flight,src=f.src,to=f.to,dx=src[0]-to[0],e0=dx>0.5?Math.max(0.35,Math.min(0.9,(src[0]-6.4)/dx)):0.6;
  return [["early",0.18],["ontime",0.56],["late",0.9]].map(function(r){var e=e0+(1-e0)*r[1],P=[src[0]+(to[0]-src[0])*e,src[1]+(to[1]-src[1])*e];
    return {k:r[0],e:e,P:P,h:f.H(e),t:f.T*(1-Math.pow(1-e,1/2.2))}})}
function drawRings(cur){cur.rings=ringsFor(cur);var f=cur.flight;
  cur.rings.forEach(function(r){var col=r.h>=NET_H?"#00C2B8":r.h>=1.0?"#FF9F1C":"#A9B6C4",g=el("g",{"class":"cring c-"+r.k,"pointer-events":"none"},gM);
    el("circle",{cx:X(r.P[0]),cy:Y(r.P[1]),r:18,fill:"#FFFFFF","fill-opacity":0.85,stroke:col,"stroke-width":4},g);
    var t=el("text",{x:X(r.P[0])+(PORT?0:0),y:Y(r.P[1])+4,"text-anchor":"middle",fill:"#0D1B2A",style:"font:800 12px Montserrat,system-ui,sans-serif"},g);t.textContent="";if(r.k!=="ontime")g.setAttribute("display","none");orientText(t);
    r.g=g;setTimeout(function(){if(cur.cring!==r)g.classList.add("gone")},Math.max(0,r.t-60))})}
/* The ball falls towards its shadow. Get there before it lands */

function holdBall(cur){var f=cur.flight;clearTimeout(cur.fallTimer);if(!f)return;if(raf)cancelAnimationFrame(raf);var k=Math.min(1,(performance.now()-f.t0)/f.T),e=fEase(k),
    p=[f.src[0]+(f.to[0]-f.src[0])*e,f.src[1]+(f.to[1]-f.src[1])*e],h=Math.max(0.5,f.H(e));PROF._hold={d:180,h:function(){return h}};runBall({f:p,to:f.to,shot:"_hold"},false)}
function runWindow(cur){var b=1.2+(TIN[cur.sit.shot||oppPose(cur.sit)]||1)+({beginner:1.0,intermediate:.6,advanced:.3,pro:0}[state.level]||.5);return Math.round((state.clock==="practice"?b*2:b)*1000)}
/* Out of reach. The ball drops into the sand and you pull up short */
function sandLoss(cur,why,landed){var m=MATCH;if(!m||m.cur!==cur||cur.done)return;cur.done=true;clearTimeout(cTimer);stopBar();hideShotUI();cmd("");
  var sp=sitPos(cur.sit),ct=sp.contact,st=PL[state.side]?(cur.start||sp.pos[state.side]):ct,h0={low:0.4,med:1.4,high:3.0}[cur.sit.height]||1;
  if(cur.ghost){cur.ghost.remove();cur.ghost=null}if(!landed){PROF._sand={d:420,h:function(k){return h0*(1-k)}};runBall({f:ct,to:[ct[0]-0.4,ct[1]],shot:"_sand",land:true},true)}if(cur.spot)cur.spot.remove();
  var gap=dst(st,ct),stop=toward(st,ct,Math.max(0,gap-1.7));PL[state.side].g.style.transitionDuration="700ms";place(state.side,stop,false);
  pointEnd(m,false,"sand");saveLost({sit:cur.sit,pick:{},ans:{shot:cur.ans.shot,cell5:cur.ans.cell5},kind:why==="far"?"far":"slowrun",rival:m.r.pair,gap:+gap.toFixed(1)});renderScore();track("point_played",{rival:m.r.id,end:why==="far"?"too_far":"too_slow_to_ball",distance:+gap.toFixed(1)});
  var over=(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2,
    head=why==="far"?"Too far.":"Too slow.",
    txt=why==="far"?"You were "+gap.toFixed(1)+" m away. The ball took about "+cur.runT.toFixed(1)+" s and you needed "+cur.runNeed.toFixed(1)+" s.":"The clock ran out before you got there.",
    tip=why==="far"?"Your position after your last shot left that space open. Recover to the middle of your half, level with your partner, before their ball comes.":"Tap where the ball is coming as soon as you've read their shot.";
  var html='<div class="ptres l"><b>'+head+'</b> '+txt+'</div><div class="fbbest"><b>Next time</b><p>'+tip+'</p></div><!--more-->'+fbSec("Their shot",cur.why||"")+fbSec("Wind",windText());
  buzz([60]);
  setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;FBTICKS=null;fbShow(html,over?"See the result":"Next point",function(){playOn(over)})},1300)}
/* Your ball goes into the net or out. It drops and shrinks */
function errBall(from,y,net){var th=from[0]>8,nx=th?8.15:7.85,dx=th?8.55:7.45;/* a netted ball stays on the hitter's side */
  if(net){PROF._net={d:430,h:function(k){return 1.2*(1-k)+0.5*k+0.5*S(PI*k)}};runBall({f:from,to:[nx,y],shot:"_net"},false);
    setTimeout(function(){PROF._drop={d:300,h:function(k){return 1.0*(1-k)}};runBall({f:[nx,y],to:[dx,y],shot:"_drop",land:true},false)},RM?160:430*1.3)}
  else{PROF._out={d:650,h:function(k){return 1.2*(1-k)+2.2*S(PI*k)}};runBall({f:from,to:[th?-0.9:16.9,Math.max(-0.5,Math.min(8.5,y))],shot:"_out",land:true},true)}}
var ballTag=null,tagTimer=null,oppPill=null;
function courtPill(at,txt){var x=X(at[0]),y=Y(at[1]),g=el("g",{"class":"opill","pointer-events":"none",transform:"translate("+x+" "+y+")"+(PORT?" rotate(90)":"")},gTag);
  var w=txt.length*10+30,inner=el("g",{transform:"translate(0 "+(52*PS*0.55+16)+")"},g);
  el("rect",{x:-w/2,y:-15,width:w,height:30,rx:15,fill:"#00C2B8",stroke:"#FFFFFF","stroke-width":2},inner);
  var t=el("text",{x:0,y:1,"text-anchor":"middle","dominant-baseline":"central",fill:"#0D1B2A",style:"font:800 14px Montserrat,system-ui,sans-serif;letter-spacing:.06em"},inner);t.textContent=txt.toUpperCase();return g}
function showTag(sit,c,endH,lab){if(!MATCH||!MATCH.cur||MATCH.cur.sit!==sit)return;var lift=Math.min(60,endH*6),x=X(c[0]),y=Y(c[1]);
  var g=el("g",{"class":"btag","pointer-events":"none"},gTag);ballTag=g;
  if(endH>1){var dl=PORT?{x1:x-lift,y1:y,x2:x,y2:y}:{x1:x,y1:y-lift,x2:x,y2:y};el("line",Object.assign({stroke:"#0D1B2A","stroke-opacity":0.45,"stroke-width":1.5,"stroke-dasharray":"2 3"},dl),g)}
  var tg=el("g",{transform:"translate("+(PORT?x-lift:x)+" "+(PORT?y:y-lift)+")"+(PORT?" rotate(90)":"")},g);
  var spd=lab?lab.sw:sit.speed,hw=lab?lab.hw:{low:"LOW",med:"MID",high:"HIGH"}[sit.height],sw=lab&&lab.t2?lab.t2:{fast:"FAST",med:"MED",slow:"SLOW"}[spd],sc=lab&&lab.t2?"#FFD23F":{fast:"#FF4D6D",med:"#FF9F1C",slow:"#00C2B8"}[spd];
  var w=(hw.length+sw.length)*9.6+34,cxs=Y(c[1])>Y(4)?-w*0.35:w*0.35,inner=el("g",{"class":"btag-in",transform:"translate("+cxs.toFixed(1)+" "+(-52*PS*0.75-14)+")"},tg);
  el("rect",{x:-w/2,y:-13,width:w,height:26,rx:13,fill:"#0D1B2A","fill-opacity":0.92},inner);
  var t=el("text",{x:0,y:1,"text-anchor":"middle","dominant-baseline":"central",style:"font:800 13px Montserrat,system-ui,sans-serif;letter-spacing:.06em"},inner);
  var a=el("tspan",{fill:"#F7F4E9"},t);a.textContent=hw;var dot=el("tspan",{fill:"#F7F4E9","fill-opacity":0.5},t);dot.textContent=" · ";var b=el("tspan",{fill:sc},t);b.textContent=sw;
  if(MATCH.cur.pick.shot||MATCH.cur.pick.pos)g.classList.add("dim")}
function describe(sit){return {low:"Low",med:"Net height",high:"High"}[sit.height]+", "+{fast:"fast",med:"medium pace",slow:"slow"}[sit.speed]+", on your "+{fh:"forehand",body:"body",bh:"backhand"}[sit.side]+". You're "+{front:"inside 3 m",mid:"3 to 6 m back",back:"deep"}[sit.depth]+"."}
/* Timer bars, in the side panel and on the court */
var hurryT=null;
function startBar(secs,wait){clearTimeout(hurryT);var ct=$("ctimer");ct.classList.remove("hurry");if(!secs){ct.hidden=true;["tbar"].forEach(function(id){var b=$(id);if(b&&b.parentNode)b.parentNode.hidden=true});return}
  hurryT=setTimeout(function(){if(!ct.hidden){ct.classList.add("hurry");buzz([30,170,30,170,30,170,30]);sfx("hurry")}},Math.max(0,(secs-2)*1000+wait));
  ["tbar","ctbar"].forEach(function(id){var bar=$(id);if(!bar)return;bar.style.transitionDuration="0ms";bar.style.transform="scaleX(1)";bar.getBoundingClientRect();
  setTimeout(function(){bar.style.transitionDuration=secs+"s";bar.style.transform="scaleX(0)"},wait)});$("ctimer").hidden=false}
function stopBar(){clearTimeout(hurryT);var ct=$("ctimer");if(ct)ct.classList.remove("hurry");["tbar","ctbar"].forEach(function(id){var bar=$(id);if(!bar)return;var t=getComputedStyle(bar).transform;bar.style.transitionDuration="0ms";bar.style.transform=t==="none"?"scaleX(1)":t})}
function setWindBadge(){var w=$("cwind"),bn=$("banter");if(bn)bn.innerHTML="";if(state.wind==="calm"){w.hidden=true;return}w.hidden=false;w.className="cwind w-"+state.wind;var wv=windV(),ang=(PORT?Math.atan2(-wv[0],wv[1]):Math.atan2(wv[1],wv[0]))*180/Math.PI;w.setAttribute("aria-label",windWords());w.title=windWords();
  w.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate('+ang.toFixed(0)+'deg)"><path d="M3 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'+(state.wind==="gusty"?'<svg viewBox="0 0 24 24" aria-hidden="true" style="transform:rotate('+ang.toFixed(0)+'deg)"><path d="M3 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>':'')}
/* Collapsible overlay boxes */
var GRAB='<button class="grab" aria-label="Resize panel"><i></i></button>';
function sheetState(){var any=["svpop","fbpop","trsit","trball"].some(function(i){if(i==="svpop"&&state.tab==="compete")return false;var e=$(i);return e&&!e.hidden&&!e.classList.contains("min")});document.body.classList.toggle("sheet-open",any);
  var mob=innerWidth<=900,tr=state.tab==="pick"&&mob;document.body.classList.toggle("sheet-pad",tr&&any);
  if(tr&&any){var cb=document.querySelector(".court-box"),off=8;setTimeout(function(){var y=cb.getBoundingClientRect().top+scrollY-off;window.scrollTo({top:Math.max(0,y),behavior:RM?"auto":"smooth"})},60)}}
function popOpen(pop,tab){tab.hidden=true;pop.hidden=false;pop.classList.remove("min");void pop.offsetWidth;pop.classList.add("in");sheetState();
  setTimeout(function(){var h=pop.querySelector(".svhead b");if(h){h.setAttribute("tabindex","-1");try{h.focus({preventScroll:true})}catch(x){}}},80)}
function wireGrab(pop,tab,label){var g=pop.querySelector(".grab");if(!g)return;var y0=null;
  g.onclick=function(){if(y0!==null)return;pop.classList.toggle("full")};
  g.addEventListener("pointerdown",function(e){y0=e.clientY;g.setPointerCapture(e.pointerId)});
  g.addEventListener("pointerup",function(e){if(y0===null)return;var dy=e.clientY-y0;y0=null;if(dy<-30)pop.classList.add("full");else if(dy>30){if(pop.classList.contains("full"))pop.classList.remove("full");else popMin(pop,tab,label)}})}
/* Sound. Everything is synthesised with Web Audio, no files. Pentatonic, so it always sounds good together */
var AC=null,MASTER=null,NB=null;
function acx(){if(load("sound","1")!=="1")return null;try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();MASTER=AC.createGain();MASTER.gain.value=0.55;MASTER.connect(AC.destination);
    NB=AC.createBuffer(1,AC.sampleRate*0.5,AC.sampleRate);var d=NB.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(AC.state==="suspended")AC.resume();return AC}catch(e){return null}}
document.addEventListener("pointerdown",function(){acx()},{passive:true});
function tone(f,t,dur,type,g,f2){var a=acx();if(!a)return;var o=a.createOscillator(),v=a.createGain(),t0=a.currentTime+(t||0);o.type=type||"sine";o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  v.gain.setValueAtTime(0.0001,t0);v.gain.exponentialRampToValueAtTime(g||0.2,t0+0.008);v.gain.exponentialRampToValueAtTime(0.0001,t0+dur);o.connect(v);v.connect(MASTER);o.start(t0);o.stop(t0+dur+0.02)}
function noise(t,dur,ftype,fc,q,g){var a=acx();if(!a)return;var n=a.createBufferSource(),f=a.createBiquadFilter(),v=a.createGain(),t0=a.currentTime+(t||0);n.buffer=NB;f.type=ftype;f.frequency.value=fc;f.Q.value=q||1;
  v.gain.setValueAtTime(0.0001,t0);v.gain.exponentialRampToValueAtTime(g||0.2,t0+0.004);v.gain.exponentialRampToValueAtTime(0.0001,t0+dur);n.connect(f);f.connect(v);v.connect(MASTER);n.start(t0);n.stop(t0+dur+0.02)}

/* Beach party music: an original samba groove, synthesised live (no recordings).
   Surdo on 2 and 4, telecoteco tamborim, shaker 16ths, agogô bells, bass and cavaquinho stabs over C6 - A7 - Dm7 - G7 */
var BTU_BUILD="25 Nov · 7 (3D + 2D)";var MUS={on:false,bus:null,next:0,step:0,timer:0,bpm:104};
function musOn(){return load("music","1")==="1"}
function musStart(){/* music removed until a real samba recording is added */return;if(MUS.on||!musOn())return;var a=acx();if(!a)return;if(!MUS.bus){MUS.bus=a.createGain();MUS.bus.connect(MASTER)}
  MUS.bus.gain.cancelScheduledValues(a.currentTime);MUS.bus.gain.setValueAtTime(0.0001,a.currentTime);MUS.bus.gain.exponentialRampToValueAtTime(0.32,a.currentTime+1.2);
  MUS.on=true;MUS.next=a.currentTime+0.08;MUS.step=0;clearInterval(MUS.timer);MUS.timer=setInterval(musTick,40);musBtn()}
function musStop(){if(!MUS.on){musBtn();return}MUS.on=false;clearInterval(MUS.timer);if(AC&&MUS.bus){MUS.bus.gain.cancelScheduledValues(AC.currentTime);MUS.bus.gain.setTargetAtTime(0.0001,AC.currentTime,0.25)}musBtn()}
function musBtn(){var b=$("c-mus");if(b){b.setAttribute("aria-pressed",String(MUS.on));b.classList.toggle("off",!MUS.on)}}
function mT(f,t,dur,type,g,f2,cut){var a=AC,o=a.createOscillator(),v=a.createGain(),flt=a.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  flt.type="lowpass";flt.frequency.value=cut||6000;v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g,t+0.006);v.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(flt);flt.connect(v);v.connect(MUS.bus);o.start(t);o.stop(t+dur+0.03)}
function mN(t,dur,type,fc,q,g){var a=AC,n=a.createBufferSource(),f=a.createBiquadFilter(),v=a.createGain();n.buffer=NB;f.type=type;f.frequency.value=fc;f.Q.value=q;
  v.gain.setValueAtTime(0.0001,t);v.gain.exponentialRampToValueAtTime(g,t+0.003);v.gain.exponentialRampToValueAtTime(0.0001,t+dur);n.connect(f);f.connect(v);v.connect(MUS.bus);n.start(t,Math.random()*0.3);n.stop(t+dur+0.02)}
var MCH=[[130.8,[261.6,329.6,392,440]],[110,[277.2,329.6,392,440]],[146.8,[293.7,349.2,440,523.3]],[98,[293.7,349.2,392,493.9]]],
  MTAM="1011011010110110",MAGO="1000101000101010",MCAV="0010010100100101",MBAS=[[0,0],[6,1],[8,2],[14,1]];
function musTick(){if(!MUS.on||!AC)return;var s16=60/MUS.bpm/4;
  while(MUS.next<AC.currentTime+0.2){var t=MUS.next,i=MUS.step%16,bar=Math.floor(MUS.step/16)%4,ch=MCH[bar],sw=(i%2)?s16*0.12:0;t+=sw;
    /* surdo: answer on 2, open on 4 */if(i===4)mT(72,t,0.32,"sine",0.55,52);if(i===12)mT(64,t,0.5,"sine",0.75,46);if(i===0)mT(80,t,0.12,"sine",0.25,60);
    /* shaker */mN(t,0.045,"highpass",6500,0.7,i%4===2?0.11:0.05);
    /* tamborim */if(MTAM[i]==="1")mN(t,0.03,"bandpass",4200,6,i%4===0?0.2:0.12);
    /* agogô, two bells */if(MAGO[i]==="1"){var hi=(i===0||i===10);mT(hi?1046.5:784,t,0.14,"triangle",0.07)}
    /* bass */MBAS.forEach(function(b){if(b[0]===i){var f=b[1]===1?ch[0]*1.5:b[1]===2?ch[0]*2:ch[0];mT(f,t,0.22,"triangle",0.28,null,900)}});
    /* cavaquinho stabs */if(MCAV[i]==="1")ch[1].forEach(function(f,k){mT(f*2,t+k*0.006,0.09,"square",0.022,null,2600)});
    /* a whistle to kick off every 8 bars */if(i===0&&Math.floor(MUS.step/16)%8===0){mT(2500,t,0.12,"sine",0.05);mT(2500,t+0.18,0.12,"sine",0.05);mT(2800,t+0.36,0.3,"sine",0.05,2500)}
    MUS.next+=s16;MUS.step++}}
var NOTE={C4:261.6,D4:293.7,E4:329.6,G4:392,A4:440,C5:523.3,D5:587.3,E5:659.3,G5:784,A5:880,C6:1046.5},
  SHOTNOTE={push:"C5",flatsmash:"G5",hook:"E5",neutral:"D5",lob:"A4",drop:"A5",dig:"G4",serve:"C5"};
var VIB={hit:[25],hitF:[40],sand:[15],reach:[15,30,15],open:[20,30,20,30,40],win:[30,40,60],lose:[80],net:[50]};
function sfx(name,o){o=o||{};if(VIB[name])buzz(VIB[name]);if(!acx())return;
  switch(name){
  case "tap":noise(0,0.03,"bandpass",3000,2,0.06);break;
  case "pick":tone(NOTE[SHOTNOTE[o.shot]||"C5"],0,0.14,"sine",0.16);break;
  case "aim":tone([NOTE.C5,NOTE.E5,NOTE.A5][o.d||0],0,0.12,"triangle",0.12);break;
  case "hit":case "hitF":noise(0,0.035,"bandpass",name==="hitF"?2600:1800,2.5,name==="hitF"?0.5:0.35);tone(140,0,0.07,"sine",0.25,70);break;
  case "sand":noise(0,0.09,"lowpass",320,0.7,0.35);break;
  case "net":noise(0,0.12,"lowpass",220,0.7,0.4);tone(95,0,0.15,"sine",0.2,60);break;
  case "run":for(var i=0;i<3;i++)noise(i*0.09,0.05,"lowpass",500,0.7,0.12);break;
  case "reach":tone(NOTE.C5,0,0.12,"sine",0.15);tone(NOTE.G5,0.06,0.16,"sine",0.15);break;
  case "open":["C5","E5","G5","A5"].forEach(function(n,i){tone(NOTE[n],i*0.07,0.22,"triangle",0.14)});break;
  case "win":(o.shots||[]).slice(-5).forEach(function(sh,i){tone(NOTE[SHOTNOTE[sh]||"C5"],i*0.11,0.16,"sine",0.12)});var w=(o.shots||[]).slice(-5).length*0.11;
    ["C5","E5","G5"].forEach(function(n){tone(NOTE[n],w,0.6,"sine",0.12)});tone(NOTE.C6,w+0.05,0.5,"triangle",0.06);break;
  case "lose":tone(NOTE.E4,0,0.28,"sine",0.16,NOTE.C4);tone(NOTE.E4*1.01,0,0.28,"sine",0.08,NOTE.C4*1.01);break;
  case "ok":tone(NOTE.D5,0,0.18,"sine",0.14);tone(NOTE.G5,0.1,0.22,"sine",0.12);break;
  case "hurry":for(var j=0;j<8;j++)noise(j*0.25-(j*j*0.004),0.02,"bandpass",1400,4,0.12);break;
  case "fanfare":["C5","E5","G5","C6","G5","C6"].forEach(function(n,i){tone(NOTE[n],i*0.13,i===5?0.7:0.18,"triangle",0.14)});break}}
function buzz(p){try{if(load("vibe","1")==="1"&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function popMin(pop,tab,label){if(pop.hidden)return;var hadF=pop.contains(document.activeElement);setTimeout(function(){sheetState();if(hadF)try{tab.focus({preventScroll:true})}catch(x){}},320);pop.classList.remove("in");pop.classList.add("min");setTimeout(function(){if(pop.classList.contains("min")){pop.hidden=true;pop.classList.remove("min")}},300);tab.innerHTML='<span aria-hidden="true">&#8249;</span><small>'+label+'</small>';tab.hidden=false}
var SPD_L={slow:"Slow",neutral:"Neutral",fast:"Fast"};
/* Speed and spin that suit each shot */
function idealSS(shot,sit){var v=windV(),tail=state.wind!=="calm"&&v[0]>0.7,head=state.wind!=="calm"&&v[0]<-0.7;
  var I={push:{sp:["fast","neutral"],sn:["flat","top"],why:"A push is hit firm and forward, flat or with a little topspin."},
    flatsmash:{sp:["fast"],sn:sit.depth==="front"?["flat","top"]:["top","flat"],why:sit.depth==="front"?"Close to the net, smash it fast and flat.":"Further back, smash it fast with topspin so it comes down."},
    hook:{sp:["neutral","slow"],sn:["top","flat"],why:"Not hard. Snap the hook down with topspin."},
    neutral:{sp:["neutral"],sn:["top","flat"],why:"A neutral ball is medium height and medium pace, deep, with a little topspin. Not high and not fast."},
    lob:{sp:head?["neutral","slow"]:["slow","neutral"],sn:["top"],why:tail?"With the wind behind you, lob slow with lots of topspin so it comes down in.":head?"Into the wind, lob a little firmer with topspin.":"Lob slow and high with topspin so it drops deep."},
    drop:{sp:["slow"],sn:["flat","slice"],why:"A drop shot is soft and slow, flat or with a touch of slice."},
    dig:{sp:["neutral","slow"],sn:["flat","top"],why:"Block it firm and flat, at neutral pace, long over them."}};return I[shot]||I.neutral}
function ssVerdict(shot,speed,spin,sit){var I=idealSS(shot,sit),sp=I.sp.indexOf(speed)>=0,sn=I.sn.indexOf(spin)>=0;
  return {ok:sp&&sn,part:sp||sn,text:(sp&&sn?"Good speed and spin. ":sp?"Good speed, but the spin could be better. ":sn?"Good spin, but the speed could be better. ":"The speed and spin didn't suit it. ")+I.why+(spin==="slice"&&!sn?" Backspin makes the ball float and sit up, so it's rarely the right choice. Save it for a soft drop shot.":""),best:SPD_L[I.sp[0]]+(I.sn[0]==="flat"?" and flat":" with "+SPIN_LBL[I.sn[0]].toLowerCase())}}
function oppText(sit){var n=["at the net","mid-court","deep"],a=n[sit.A[0]],b=n[sit.B[0]];return a===b?"Both opponents were "+a+".":"One opponent was "+a+", the other "+b+"."}
function windText(){if(state.wind==="calm")return "No wind on this point.";var v=windV(),w=windWords()+". ";
  if(v[0]>0.7)return w+"It carries long balls further, so aim a little shorter and use topspin.";if(v[0]<-0.7)return w+"It holds the ball up, so hit a little firmer and aim deeper.";
  return w+"It drifts the ball sideways, so aim away from the line it blows towards."}
/* Aim scoring. Every square is scored on its own for the shot you play.
   The middle is rarely wrong. The sidelines are riskier. Backhands are good targets. Keep high and chest-high balls away from a forehand.
   Lobs go deep. In the back zone a lob over the outside shoulders (zones 1, 2 and 5) is safe, but a lob into the middle lands on a forehand */
var AIM_W={lob:{fh:1.6,bh:0.6},neutral:{fh:1.3,bh:0.8},dig:{fh:1.4,bh:0.7},hook:{fh:1.6,bh:0.8},push:{fh:0.7,bh:0.8},flatsmash:{fh:0.5,bh:0.6},drop:{fh:1.4,bh:0.5},serve:{fh:0.6,bh:0.6}};
function aimShot(sh){sh=simple(sh||"neutral");return {rainbow:"lob",fakedrop:"lob",highlob:"lob",fakelob:"drop",inDrop:"drop",bhsmash:"flatsmash",brush:"flatsmash",recoverysmash:"hook"}[sh]||sh}
function aimScore(c,shot,sit,speed){var sh=aimShot(shot),d=c[0],l=c[1],x=(AX[d][0]+AX[d][1])/2,y=(AY[l][0]+AY[l][1])/2,s=0,bad=[],good=[],W=AIM_W[sh]||AIM_W.neutral,
    o=[oP(sit,"A"),oP(sit,"B")],my=DI[sit.depth]==null?1:DI[sit.depth],side=l===0||l===4,lob=sh==="lob",
    add=function(n,t){s+=n;if(t)(n<0?bad:good).push([Math.abs(n),t])};
  /* Width */
  if(lob){if(l===2||l===3)add(-1.6,"A lob into the middle drops onto a forehand. Easy for them to attack.")}
  else{if(l===2)add(0.9,"The middle is rarely a bad target. It makes them decide who takes it.");if(side)add(sh==="push"||sh==="flatsmash"?-0.8:-1.2,"The sideline leaves little margin.");if(l===1||l===3)add(0.2)}
  /* Forehand or backhand of each opponent within reach. Right-handers, so a forehand is on your left as you look at them */
  o.forEach(function(op,i){var dy=y-op[1],dx=Math.abs(x-op[0]),reach=Math.abs(dy)<2.4;if(!reach)return;
    var inner=(op[1]<4&&dy>0)||(op[1]>4&&dy<0);
    if(dy<-0.3){if(!lob||inner)add(-W.fh*(lob?1:Math.abs(dy)<1.4?1:0.6),lob?"A lob here lands on a forehand. Easy for them to attack.":sh==="neutral"||sh==="dig"?"Chest high onto a forehand. They will attack it.":"That's on a forehand.")}
    else if(dy>0.3)add(W.bh*(Math.abs(dy)<1.6?1:0.6),"Onto a backhand, the weaker side.")});
  /* Depth, by shot */
  var D={lob:[-3,-1.6,1.2],drop:[1.0,-1.2,-3],neutral:[-1.2,0.4,0.7],dig:[-1.0,0.2,0.7],hook:[-1,0.2,0.9],push:[0.4,0.6,-0.6],flatsmash:[0.6,0.6,-0.4],serve:[0,0.4,0.4]}[sh]||[0,0,0];
  var DT={lob:["A short lob sits up for a smash.","Mid-court lobs are in smashing range. Go deep.",""],drop:["","A drop must land inside their 3 m line, or it gets pushed.","That's not a drop. Keep it short."],
    neutral:["A short neutral ball sits up for them to push.","",""],dig:["A short block pops up for a smash.","",""],hook:["A short hook sits up.","",""],push:["","","A push that deep sails long."],flatsmash:["","","Smash down, not deep."]}[sh]||["","",""];
  add(D[d],DT[d]||"");
  /* Drops go to space, away from a player at the net */
  if(sh==="drop"){var nd=Math.min(Math.hypot(x-o[0][0],y-o[0][1]),Math.hypot(x-o[1][0],y-o[1][1]));if(nd>2.6)add(0.4,"Into the space in front of them.");if(nd<1.4)add(-1,"Straight to a player at the net.")}
  /* Down the line onto a backhand, when you are near the net or mid-court */
  if((sh==="push"||sh==="flatsmash"||sh==="dig")&&side&&my<=1&&good.some(function(g){return /backhand/.test(g[1])}))add(0.6,"Down the line onto the backhand.");
  /* Pace and wind */
  var v=windV(),mw=state.wind==="gusty"?1.2:state.wind==="breezy"?0.7:0;
  if(speed==="fast"&&d===2)add(-0.7,"Fast and deep risks going long.");
  if(mw){if(v[0]>0.7&&d===2)add(-0.8*mw,"The wind behind you carries deep balls long.");
    if(v[0]<-0.7&&d===0&&sh!=="drop")add(-0.5*mw,"Into the wind, short balls die early.");
    if(Math.abs(v[1])>0.7&&l===(v[1]>0?4:0))add(-1*mw,"The crosswind blows towards that sideline.");
    if(state.wind==="gusty"&&side&&!lob)add(-0.4,"In gusts, stay off the lines.")}
  bad.sort(function(a,b){return b[0]-a[0]});good.sort(function(a,b){return b[0]-a[0]});
  return {s:s,why:bad.length?bad[0][1]:good.length?good[0][1]:""}}
function aimTier(c,shot,sit,speed){var r=aimScore(c,shot,sit,speed).s;return r>=0.9?0:r>=-0.3?1:2}
function bestCell(shot,sit,speed,near){var best=null,bs=-1e9;for(var d=0;d<3;d++)for(var l=0;l<5;l++){var sc=aimScore([d,l],shot,sit,speed).s-(near?0.25*(Math.abs(d-near[0])+Math.abs(l-near[1])):0);if(sc>bs){bs=sc;best=[d,l]}}return best}
/* Kept for older callers: score against the shot and situation, ignore the old best square */
function cellTier(c,ctx,speed){return ctx&&ctx.shot?aimTier(c,ctx.shot,ctx.sit,speed||ctx.speed):1}
function heatAim(pick,ctx,speed,grp){[].forEach.call((grp||gA).children,function(g){var k=g.getAttribute("data-c");if(!k)return;var r=g.firstChild,c=k.split(",").map(Number),t=aimTier(c,ctx.shot,ctx.sit,speed||ctx.speed),
    col=["#2ECC71","#FF9F1C","#FF4D6D"][t],on=pick&&c[0]===pick[0]&&c[1]===pick[1];
  r.setAttribute("fill",col);r.setAttribute("fill-opacity",t===0?0.5:0.34);r.setAttribute("stroke",on?"#0D1B2A":"none");r.setAttribute("stroke-width",on?3:0)})}
/* Feedback box with Play on */
var FBT=null;function fbToastOff(){clearTimeout(FBT);FBT=null;var t=$("fbtoast");if(t)t.remove()}
/* Compete: a short result banner on the court, then play goes on by itself. Why opens the full feedback and pauses */
function fbQuick(html,btn,onPlay){fbToastOff();var cm=MATCH&&MATCH.cur;
  var d=document.createElement("div");d.innerHTML=html.split("<!--more-->")[0];var pr=d.querySelector(".ptres"),k=pr?(pr.classList.contains("w")?"w":pr.classList.contains("l")?"l":"m"):"m",
    hd=pr&&pr.querySelector("b")?pr.querySelector("b").textContent:"";hd=(hd.match(/^[^.!?]*[.!?]/)||[hd])[0].replace(/\.$/,"");
  var rest=FBTICKS?FBTICKS.map(function(r){return '<em class="t'+r[1]+(r[2]?' lab':'')+'">'+(r[2]?'':["&#10007;","~","&#10003;"][r[1]]+' ')+r[0]+'</em>'}).join(""):"";FBTICKS=null;
  var race="";if(FBRACE){var mx=Math.max(FBRACE.b,FBRACE.n,0.1);race='<div class="race"><span><i style="width:'+(FBRACE.b/mx*100).toFixed(0)+'%"></i>Ball '+FBRACE.b.toFixed(2)+' s</span><span class="'+(FBRACE.n>FBRACE.b?"late":"")+'"><i style="width:'+(FBRACE.n/mx*100).toFixed(0)+'%"></i>'+FBRACE.who+' '+FBRACE.n.toFixed(2)+' s</span></div>';FBRACE=null}
  var ms=btn==="Play on"?2200:btn==="See the result"?3400:3000,parts=html.split("<!--more-->");
  LASTPT='<div class="lp '+k+'"><div class="lp-top"><b>'+hd+'</b>'+(rest?'<span class="ft-ticks">'+rest+'</span>':'')+'</div>'+race+'<div class="lp-best">'+parts[0].replace(/<div class="ptres[\s\S]*?<\/div>/,"")+'</div>'+(parts[1]?'<button class="lnk lp-why" type="button" aria-expanded="false">Why? &#9652;</button><div id="lp-more" class="lp-more" hidden>'+parts[1]+'</div>':'')+'</div>';
  resBar(LASTPT);var lp=$("lastpt");if(lp){lp.insertAdjacentHTML("beforeend",'<i class="lp-bar" style="--ftms:'+ms+'ms"></i>')}setPrompt("");$("c-sr").textContent=hd;
  var go=function(){fbToastOff();var b=document.querySelector("#lastpt .lp-bar,#lastpt .lp-next");if(b)b.remove();if(!MATCH||MATCH.cur!==cm||state.tab!=="compete")return;onPlay()};
  FBT=setTimeout(go,ms);
  var w=document.querySelector("#lastpt .lp-why");if(w)w.addEventListener("click",function(){if(!FBT)return;clearTimeout(FBT);FBT=null;var b=document.querySelector("#lastpt .lp-bar");if(b)b.remove();
    var nb=document.createElement("button");nb.className="btn primary lp-next";nb.innerHTML=btn+" &#8594;";nb.onclick=go;$("lastpt").appendChild(nb)})}
function fbShow(html,btn,onPlay){if(state.tab==="compete"&&MATCH){hideShotUI();cmd("");stopBar();fbQuick(html,btn,onPlay);return}fbFull(html,btn,onPlay)}
function fbFull(html,btn,onPlay){var pop=$("fbpop"),tab=$("fbtab");hideShotUI();cmd("");stopBar();var parts=html.split("<!--more-->");
  pop.innerHTML=GRAB+'<div class="svhead"><b tabindex="-1"></b><button class="svmin" id="fb-min" aria-label="Minimise feedback">&#8250;</button></div><div class="fbbody">'+parts[0]+'</div>'+(parts[1]?'<details class="why"><summary>Details <span aria-hidden="true">&#9662;</span></summary><div class="fbbody">'+parts[1]+'</div></details>':'');
  var b=document.createElement("button");b.className="btn primary nextpt";b.innerHTML=btn+" &#8594;";b.onclick=function(){b.disabled=true;pop.hidden=true;tab.hidden=true;sheetState();onPlay()};pop.insertBefore(b,pop.querySelector(".why"));
  var wd=pop.querySelector(".why");if(wd)wd.addEventListener("toggle",function(){pop.classList.toggle("full",wd.open)});pop.classList.remove("full");wireGrab(pop,tab,"Feedback");
  popOpen(pop,tab);$("fb-min").onclick=function(){popMin(pop,tab,"Feedback")};tab.onclick=function(){popOpen(pop,tab)};
  var e=$("cs-prompt");if(e)e.textContent="Read the feedback, then play on";$("c-sr").textContent=pop.textContent.slice(0,400);buzz([20,40,20]);
  setTimeout(function(){try{b.focus({preventScroll:true})}catch(x){}},60)}
/* Train. Two sidebars, real situations and describe the ball, and 15 aim squares on court */
function trainAim(){gG.innerHTML="";for(var d=0;d<3;d++)for(var l=0;l<5;l++)(function(d,l){var g=el("g",{"class":"ac",tabindex:"0",role:"button","aria-label":"Aim "+cellName5([d,l]),"data-c":d+","+l},gG);
    var x0=X(AX[d][0]),y0=Y(AY[l][0]);el("rect",{x:x0,y:y0,width:X(AX[d][1])-x0,height:Y(AY[l][1])-y0,fill:"#FFFFFF","fill-opacity":0},g);
    var go=function(){if(PK.revealed)return;if(!PK.pickShot){cmd("Pick a shot first");return}ripple(d,l);buzz(10);judge5([d,l])};g.addEventListener("click",go);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})})(d,l);
  var ln=el("g",{"pointer-events":"none"},gG),st={stroke:"#0D1B2A","stroke-opacity":0.55,"stroke-width":2.5,"stroke-dasharray":"1 7","stroke-linecap":"round"};
  [11,14].forEach(function(x){el("line",Object.assign({x1:X(x),y1:Y(0),x2:X(x),y2:Y(8)},st),ln)});[1.6,3.2,4.8,6.4].forEach(function(y){el("line",Object.assign({x1:X(8),y1:Y(y),x2:X(16),y2:Y(y)},st),ln)})}
function paintSit(){var l=$("trsit-list");if(!l)return;[].forEach.call(l.children,function(b,i){b.setAttribute("aria-pressed",String(i===PK.preset))})}
function hideTrainUI(){["trsit","trball","trsit-tab","trball-tab"].forEach(function(i){var e=$(i);if(e){e.hidden=true;e.classList.remove("min","in")}});var pk=$("picker");if(pk&&$("pk-home")&&pk.parentNode!==$("pk-home"))$("pk-home").appendChild(pk);
  if(state.tab!=="pick"){var f=$("fbpop");if(f&&!document.body.classList.contains("competing")){f.hidden=true;$("fbtab").hidden=true}}}
function trainUI(){var sit=$("trsit"),bal=$("trball"),st=$("trsit-tab"),bt=$("trball-tab");
  var SW=function(on){return '<div class="seg trsw"><button data-to="trsit" aria-pressed="'+(on==="trsit")+'">Situations</button><button data-to="trball" aria-pressed="'+(on==="trball")+'">The ball</button></div>'};
  sit.innerHTML=GRAB+'<div class="svhead"><b>Set up</b><button class="svmin" aria-label="Minimise set up">&#8250;</button></div>'+SW("trsit")+'<p class="svtip">Pick a moment from a real match. The ball plays in, then you choose the shot.</p><div class="sitlist" id="trsit-list"></div>';
  PRESETS.forEach(function(pr,i){var b=document.createElement("button");b.textContent=pr.name;b.onclick=function(){usePreset(i)};$("trsit-list").appendChild(b)});paintSit();
  bal.innerHTML=GRAB+'<div class="svhead"><b>Set up</b><button class="svmin" aria-label="Minimise set up">&#8250;</button></div>'+SW("trball")+'<div id="trball-body"></div><button class="btn primary svdone">Done &#8250;</button>';
  var pk=$("picker");pk.hidden=false;$("trball-body").appendChild(pk);
  function wire(box,tab,label,other,otab,olabel){box.querySelector(".svmin").onclick=function(){popMin(box,tab,label)};var d=box.querySelector(".svdone");if(d)d.onclick=function(){popMin(box,tab,label)};
    tab.onclick=function(){if(!other.hidden)popMin(other,otab,olabel);popOpen(box,tab);otab.hidden=false;otab.innerHTML='<span aria-hidden="true">&#8249;</span><small>'+olabel+'</small>'}}
  var lastBox=sit;function minAll(){[sit,bal].forEach(function(b){if(!b.hidden)popMin(b,st,"Set up")});bt.hidden=true}
  [sit,bal].forEach(function(box){box.querySelector(".svmin").onclick=minAll;var d=box.querySelector(".svdone");if(d)d.onclick=minAll;wireGrab(box,st,"Set up");
    [].forEach.call(box.querySelectorAll(".trsw button"),function(b){b.onclick=function(){var to=$(b.dataset.to);if(to===box)return;box.hidden=true;box.classList.remove("in");lastBox=to;popOpen(to,st);bt.hidden=true}})});
  st.onclick=function(){popOpen(lastBox,st);bt.hidden=true};bt.hidden=true;
  st.innerHTML='<span aria-hidden="true">&#8249;</span><small>Set up</small>';st.hidden=false;
  cmd("Pick a situation or a shot");
  setTimeout(function(){if(state.tab==="pick"&&!PK.revealed&&sit.hidden&&bal.hidden){popOpen(sit,st)}},1000)}
function hideShotUI(){railOff();cue(null);serveHint(false);var rg=$("retgo");if(rg)rg.hidden=true;["svpop","svtab","fbpop","fbtab"].forEach(function(i){var e=$(i);if(e){e.hidden=true;e.classList.remove("min","in","full")}});sheetState()}
function fbSec(h,t){return '<div class="fbsec"><b>'+h+'</b><p>'+t+'</p></div>'}
function playOn(over){if(!MATCH)return;if(over)endMatch();else newPoint()}
function decidePanel(){hideServeUI();hideShotUI();var m=MATCH,c=$("cpanel"),cur=m.cur,MT=cur.mate;c.classList.remove("fb");
  document.body.classList.add("c-live");$("csit").hidden=true;setWindBadge();
  $("c-sr").textContent="Point "+(m.points+1)+". "+windWords()+". "+(MT?"The ball goes to your partner.":describe(cur.sit));
  cpanelLive(MT?"Watch your partner":cur.flight&&!cur.unreach?"Meet the ball: tap a ring":cur.srv==="opp"?"Their serve":"Watch the ball");
  cur.pick={speed:"neutral",spin:"flat"};var p=cur.pick;cmd(MT?"Watch your partner":cur.flight&&!cur.unreach?"Run to the ball":cur.srv==="opp"?"They serve":"Watch the ball");
  var sp0=sitPos(cur.sit);cur.from=sp0.pos[state.side];cur.start=cur.from.slice();if(cur.unreach&&!cur.flight){cmd("");return}
  var gs=52*PS,gh=el("g",{transform:"translate("+X(cur.from[0])+" "+Y(cur.from[1])+")"+(PORT?" rotate(90)":""),opacity:0.3},gM);el("image",{href:avSrc(state.emoji),x:-gs/2,y:-gs/2,width:gs,height:gs},gh);cur.ghost=gh;
  cur.trail=el("line",{x1:X(cur.from[0]),y1:Y(cur.from[1]),x2:X(cur.from[0]),y2:Y(cur.from[1]),stroke:"#0D1B2A","stroke-opacity":0.5,"stroke-width":2.5,"stroke-dasharray":"1 7","stroke-linecap":"round","pointer-events":"none"},gM);
  function moveTo(pos){cue(null);if(cur.ghost){cur.ghost.remove();cur.ghost=null}var dx=pos[0]-cur.from[0];PL[state.side].g.style.transitionDuration="600ms";place(state.side,pos,false);cur.trail.setAttribute("x2",X(pos[0]));cur.trail.setAttribute("y2",Y(pos[1]));
    p.move=dx>0.6?"in":dx<-0.6?"back":"hold";p.pos=pos;cmd("");maybeResolve()}
  var wait=(cur.arrive||450)+150;
  if(MT){drawAim(null,function(pos){if(cur.done)return;moveTo(pos)});
    setTimeout(function(){if(MATCH&&MATCH.cur===cur&&!cur.done){cmd("Select your court position");cue("move")}},wait)}
  else{var pop=$("svpop"),tab=$("svtab"),adv=state.level==="advanced"||state.level==="pro";
    pop.innerHTML=GRAB+'<div class="svhead"><b>The point</b><button class="svmin" id="sh-min" aria-label="Minimise">&#8250;</button></div>'+
      '<div class="seg trsw" id="pt-sw"><button data-p="them" aria-pressed="true">Their shot</button><button data-p="ret" aria-pressed="false">Your return</button></div>'+
      '<div id="pane-them">'+theirShotHtml(cur)+'<button class="btn primary svdone" id="pt-go">Play your return &#8594;</button></div>'+
      '<div id="pane-ret" hidden><div class="shgrid" id="sh-list" role="group" aria-label="Shot"></div>'+
      '<div class="svgrid"><div class="svball" id="svball">'+BALLSVG+'<span class="svlbl" id="sv-lbl">Flat</span></div><div class="svside"><div class="seg sv-spd" id="sv-spd"><button data-v="slow" aria-pressed="false">Slow</button><button data-v="neutral" aria-pressed="true">Neutral</button><button data-v="fast" aria-pressed="false">Fast</button></div>'+
      '<div class="svbtns" id="sv-spin"><button data-v="flat" aria-pressed="true">Flat</button>'+'</div>'+
      '<p class="svtip">Swipe the ball for spin. Up for topspin, left or right to curve, down for backspin.</p><button class="btn primary svdone" id="sh-done">Done &#8250;</button></div></div></div>';
    var started=false;
    function runPhase(){if(!started){started=true;if(cur.runEnd)startBar(Math.max(0.2,(cur.runEnd-performance.now())/1000),0)}}
    function runMs(a,b){return Math.max(250,Math.min(1300,dst(a,b)/4.2*600+(b[0]<a[0]-1?200:0)))}
    function runTo(pos){if(cur.done||cur.atBall||!cur.flight)return;sfx("run");var now=performance.now(),f=cur.flight,rs=cur.rings||[];
      if(cur.ghost){cur.ghost.remove();cur.ghost=null}
      /* Snap to the nearest ring you tapped near, then take the first one you can still reach */
      var pickR=null,near=rs.slice().sort(function(a,b){return dst(pos,a.P)-dst(pos,b.P)})[0];
      if(near&&dst(pos,near.P)<1.8&&!cur.unreach){var from=rs.indexOf(near);for(var i=from;i<rs.length;i++){var r=rs[i],ms0=runMs(cur.start,[r.P[0]-0.3,r.P[1]]);if(now+ms0<=f.t0+r.t-40){pickR=r;r.ms=ms0;break}}}
      if(!pickR){var ms=runMs(cur.start,pos);PL[state.side].g.style.transitionDuration=ms+"ms";place(state.side,pos,false);cur.trail.setAttribute("x2",X(pos[0]));cur.trail.setAttribute("y2",Y(pos[1]));cur.start=pos;return}
      var hit=[pickR.P[0]-0.3,pickR.P[1]];cur.atBall=true;cur.cring=pickR;cur.spare=(f.t0+pickR.t-(now+pickR.ms))/1000;
      rs.forEach(function(r){if(r.g)r.g.classList.toggle("pick",r===pickR)});
      PL[state.side].g.style.transitionDuration=pickR.ms+"ms";place(state.side,hit,false);cur.trail.setAttribute("x2",X(hit[0]));cur.trail.setAttribute("y2",Y(hit[1]));
      setTimeout(function(){if(cur.done)return;holdBall(cur);stopBar();startClock(0);cur.from=pickR.P.slice();cur.ch=pickR.h;cur.ctype=pickR.k;cur.decT0=performance.now();
        rs.forEach(function(r){if(r.g&&r!==pickR)r.g.remove()});
        cur.trail.setAttribute("x1",X(hit[0]));cur.trail.setAttribute("y1",Y(hit[1]));cur.trail.setAttribute("x2",X(hit[0]));cur.trail.setAttribute("y2",Y(hit[1]));sfx("reach");popOpen(pop,tab);showPane("ret")},Math.max(pickR.ms,f.t0+pickR.t-now))}
    cur.runTo=runTo;
    function showPane(w){if(w==="ret"&&!cur.atBall){runPhase();return}if(w==="ret"&&!cur.done)shotRail(p.shot,function(id){var lb=list.querySelector('[data-v="'+id+'"]');if(lb)lb.click();next()});document.body.classList.toggle("them-pane",w==="them");$("pane-them").hidden=w!=="them";$("pane-ret").hidden=w!=="ret";[].forEach.call($("pt-sw").children,function(b){b.setAttribute("aria-pressed",String(b.dataset.p===w))});
      if(w==="ret"){cmd("Pick your shot on the left");next();setPrompt("Pick a shot"+(cur.ch!=null?" · "+cur.ch.toFixed(1)+" m"+(cur.ch>=NET_H?", above the net":", below the net"):""));if(!started){started=true;startClock(0)}}else cmd("Read their shot")}
    [].forEach.call($("pt-sw").children,function(b){b.onclick=function(){showPane(b.dataset.p)}});$("pt-go").onclick=function(){showPane("ret")};
    var list=$("sh-list");VISIBLE.filter(function(v){return v!=="serve"}).forEach(function(id){var b=document.createElement("button"),ic=ICON[id];b.dataset.v=id;b.setAttribute("aria-pressed","false");
      b.innerHTML='<span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span><span>'+SHOTS[id].name+'</span>';
      b.onclick=function(){if(cur.done)return;p.shot=id;sfx("pick",{shot:id});[].forEach.call(list.children,function(x){x.setAttribute("aria-pressed",String(x===b))});if(ballTag)ballTag.classList.add("dim");sum();buzz(10);if(!cur.atBall){cmd("Run to the ball");return}later(p.spinSet?700:2500)};list.appendChild(b)});
    function sum(){var t=(p.shot?SHOTS[p.shot].name:"No shot yet")+", "+SPD_L[p.speed].toLowerCase()+", "+SPIN_LBL[p.spin].toLowerCase();$("sh-sum").textContent=t}
    function label(){return (p.shot?SHOTS[p.shot].name:"Shot")+"<br>"+SPD_L[p.speed]}
    function close(){popMin(pop,tab,label());next()}
    function next(){if(cur.done)return;if(!cur.atBall){cmd(cur.flight?"Run to the ball":"Watch the ball");cue(null);return}cmd(!p.shot?"Pick your shot":!p.cell?"Flick or tap where to hit":!p.move?"Tap where you move":"");cue(!cur.atBall?null:!p.shot?"rail":!p.cell?"aim":!p.move?"move":null)}
    var autoMin=null;function later(ms){clearTimeout(autoMin);if(p.shot)autoMin=setTimeout(close,ms||700)}
    tab.onclick=function(){if(cur.done)return;popOpen(pop,tab);cmd("Choose your shot")};$("sh-min").onclick=close;$("sh-done").onclick=close;
    [].forEach.call($("sv-spd").children,function(b){b.onclick=function(){p.speed=b.dataset.v;[].forEach.call($("sv-spd").children,function(x){x.setAttribute("aria-pressed",String(x===b))});rateFn();sum();if(p.shot)later(2500)}});
    function setSpin(v,user){p.spin=v;$("sv-lbl").textContent=SPIN_LBL[v];[].forEach.call($("sv-spin").children,function(x){x.setAttribute("aria-pressed",String(x.dataset.v===v))});rateFn();sum();if(user){p.spinSet=true;later()}}
    [].forEach.call($("sv-spin").children,function(b){b.onclick=function(){setSpin(b.dataset.v,true)}});
    var seamEl=$("sv-seam"),ang=0,rate=0,last=0;function rateFn(){rate=p.spin==="flat"?0.12:SV_ROT[p.speed]*(p.spin==="slice"?-1:1)}rateFn();
    (function loop(t){if(cur.done||!document.body.contains(seamEl))return;var dt=last?Math.min(50,t-last):0;last=t;if(!RM)ang=(ang+rate*dt)%360;seamEl.setAttribute("transform","rotate("+ang.toFixed(1)+")");requestAnimationFrame(loop)})(0);
    var svg=$("svball").querySelector("svg"),arrow=$("sv-arrow"),start=null,dir=null;
    svg.addEventListener("pointerdown",function(e){if(cur.done)return;start=[e.clientX,e.clientY];dir=null;svg.setPointerCapture(e.pointerId);e.preventDefault()});
    svg.addEventListener("pointermove",function(e){if(!start)return;var dx=e.clientX-start[0],dy=e.clientY-start[1],dist=Math.hypot(dx,dy),r=svg.getBoundingClientRect(),k=100/r.width;
      arrow.setAttribute("x2",(dx*k).toFixed(1));arrow.setAttribute("y2",(dy*k).toFixed(1));arrow.setAttribute("opacity",dist>6?0.8:0);
      if(dist>=24){var nd=Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"top":"slice");if(nd!==dir){dir=nd;setSpin(nd,false)}rateFn();rate*=1+Math.min(1.5,dist/120)}});
    svg.addEventListener("pointerup",function(){if(!start)return;start=null;arrow.setAttribute("opacity",0);if(dir){setSpin(dir,true);save("swiped","1");document.body.classList.add("swiped")}});
    svg.addEventListener("keydown",function(e){var k={ArrowUp:"top",ArrowLeft:"left",ArrowRight:"right",ArrowDown:"slice"}[e.key];if(k){e.preventDefault();setSpin(k,true)}});
    sum();
    /* Pick your shot any time once their ball is coming; aim once you reach it */
    if(!cur.unreach)shotRail(p.shot,function(id){var lb=list.querySelector('[data-v="'+id+'"]');if(lb)lb.click();next()});
    cur.pickCell=function(cell){if(cur.done)return;if(!p.shot){cmd("Pick a shot on the left");return}p.cell=cell;markAim(cell);ripple(cell[0],cell[1]);buzz(10);
      if(cur.aimLine)cur.aimLine.remove();var tc=svTarget(cell),sc=cur.from;cur.aimLine=el("line",{x1:X(sc[0]),y1:Y(sc[1]),x2:X(tc[0]),y2:Y(tc[1]),stroke:"#0D1B2A","stroke-opacity":0.5,"stroke-width":2.5,"stroke-dasharray":"2 6","stroke-linecap":"round","pointer-events":"none"},gM);if(!pop.hidden)popMin(pop,tab,label());next()};
    drawAim(cur.pickCell,
      function(pos){if(cur.done)return;if(!cur.atBall){runTo(pos);return}if(!p.shot||!p.cell){next();return}moveTo(pos)});
    if(cur.atBall)setTimeout(function(){if(!MATCH||MATCH.cur!==cur||cur.done||started)return;sfx("reach");showPane("ret")},Math.max(200,(cur.arrive||450)-100));
    else if(cur.flight)runPhase();
    return}
  startClock(wait)}
function startClock(wait){var m=MATCH;if(!m||!m.cur)return;var secs=decideSecs(m.r);startBar(secs,wait);
  clearTimeout(cTimer);if(secs)cTimer=setTimeout(function(){resolvePoint(true)},secs*1000+wait)}
/* Ball height against your own body */
var HB_ICON='<svg class="hb" viewBox="-14 -14 28 28" aria-hidden="true"><circle r="12" fill="#DDF02B" stroke="#9C9A12"/><path d="M0 -12C-11 -4 11 4 0 12A12 12 0 0 0 0 -12Z" fill="#FF4D6D"/></svg>';
var HB_ROWS=[["high","High","Above your head"],["med","Mid","Chest to head"],["low","Low","Waist and below"]];
function hbFig(){return "poses/"+(POSE_AV[state.emoji]||"a01")+"-push.webp"}
function hbBands(on,ro,idp){return HB_ROWS.map(function(r){var inner=HB_ICON+'<span><b>'+r[1]+'</b><small>'+r[2]+'</small></span>';
  return ro?'<div aria-pressed="'+(r[0]===on)+'">'+inner+'</div>':'<button type="button"'+(idp?' id="'+idp+r[0]+'"':'')+' data-v="'+r[0]+'" aria-pressed="'+(r[0]===on)+'">'+inner+'</button>'}).join("")}
function heightBody(on){var r=HB_ROWS.filter(function(x){return x[0]===on})[0];
  return '<div class="hbody" role="img" aria-label="Ball height: '+r[1]+', '+r[2].toLowerCase()+'"><img class="hfig" src="'+hbFig()+'" alt="" decoding="async"><div class="hbands ro" aria-hidden="true">'+hbBands(on,true)+'</div></div>'}
/* What the opponent just did, before you choose your return */
function theirShotHtml(cur){var sit=cur.sit,m=MATCH,sk=cur.srv==="opp"?cur.os:(cur.srcKey||(oppPos(sit.A)[0]<=oppPos(sit.B)[0]?"A":"B")),who=m.r.p[sk==="A"?0:1].n,
    shot=cur.srv==="opp"?"Serve":SHOTS[oppPose(sit)].name,hs=state.hand==="L"?-1:1,side=sit.side==="body"?"body":(sit.side==="fh")===(hs===1)?"forehand":"backhand";
  var H={low:["Low","Waist height or lower, so you have to lift it"],med:["Mid","Between your chest and your head"],high:["High","Above your head"]}[sit.height],
    SP={fast:["Fast","Little time to set up"],med:["Medium","Some time to set up"],slow:["Slow","Plenty of time to choose"]}[sit.speed],
    D={front:"Inside your 3 m line",mid:"3 to 6 m from the net",back:"Deep, near your baseline"}[sit.depth];
  var seg=function(k,opts,on){return '<div><div class="tsk">'+k+'</div><div class="seg ro" role="img" aria-label="'+k+' '+opts.filter(function(o){return o[0]===on})[0][1]+'">'+opts.map(function(o){return '<button tabindex="-1" aria-pressed="'+(o[0]===on)+'">'+o[1]+'</button>'}).join("")+'</div></div>'};
  return '<div class="tsr2"><div><div class="tsk">Their shot</div><div class="seg ro"><button tabindex="-1" aria-pressed="true">'+shot+'</button></div></div>'+
    seg("Speed",[["slow","Slow"],["med","Neutral"],["fast","Fast"]],sit.speed)+'</div>'+(cur.why?'<p class="tswhy">'+cur.why+'</p>':'')+heightBody(sit.height)}
function maybeResolve(){var p=MATCH.cur.pick;if(MATCH.cur.mate?p.pos:(p.shot&&p.cell&&p.move)){clearTimeout(cTimer);setTimeout(function(){resolvePoint(false)},350)}}
var SVB={good:.06,ok:0,risky:-.12};
/* Shot percentages for this ball. High, medium or low */
function shotTiers(sit,best){var H=sit.height,t={};
  var base={low:{dig:2,neutral:2,lob:1,drop:1,push:0,flatsmash:0,hook:0},med:{push:2,neutral:1,dig:1,drop:1,lob:1,flatsmash:0,hook:0},high:{flatsmash:2,hook:1,push:1,neutral:1,lob:0,drop:0,dig:0}}[H];
  for(var k in base)t[k]=base[k];
  var oppFront=sit.A[0]===0&&sit.B[0]===0,oppDeep=sit.A[0]===2||sit.B[0]===2;
  if(H==="high"&&sit.depth==="back"){t.flatsmash=1;t.neutral=1}
  if(H==="high"&&sit.depth==="front"){t.flatsmash=2;t.hook=1}
  if(H==="low"&&sit.speed==="fast"){t.dig=2;t.neutral=1;t.lob=0}
  if(oppFront){t.drop=0;if(!(H==="low"&&sit.speed==="fast"))t.lob=Math.max(t.lob,2)}
  if(!oppDeep)t.drop=Math.min(t.drop,0);
  if(oppDeep&&H!=="high")t.lob=0;
  if(sit.ret){t.flatsmash=0;t.hook=0}
  if(H==="high"&&sit.depth==="back"){t.flatsmash=Math.min(t.flatsmash,1);t.hook=2}
  if(best&&t[best]!=null)t[best]=2;var b2=BACK2[best];if(b2&&t[b2]!=null)t[b2]=Math.max(t[b2],1);
  return t}
function tiersHtml(sit,best,picked){var t=shotTiers(sit,best),rows=[[2,"High percentage","","hi"],[1,"Medium percentage","","md"],[0,"Low percentage","","lo"]];
  return '<div class="tiers">'+rows.map(function(r){var ids=VISIBLE.filter(function(v){return v!=="serve"&&t[v]===r[0]});if(!ids.length)return "";
    return '<div class="tier t-'+r[3]+'"><span class="tl"><b>'+r[1]+'</b><small>'+r[2]+'</small></span><span class="tc">'+ids.map(function(id){var ic=ICON[id];
      return '<span class="tchip'+(id===picked?" you":"")+'"><span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span>'+SHOTS[id].name+(id===picked?" <i>your pick</i>":"")+'</span>'}).join("")+'</span></div>'}).join("")+'</div>'}
/* How points are won. Time to the ball: a shot wins when the defender can't get there in time.
   Stretched defenders make forced errors or send back a weak ball, which is your opening. Rivals differ in speed, reach, errors and blunders */
var VBALL={flatsmash:{slow:11,neutral:16,fast:20},push:{slow:9,neutral:12,fast:16},hook:{slow:10,neutral:13,fast:15},neutral:{slow:7,neutral:9,fast:11},dig:{slow:8,neutral:10,fast:12},drop:{slow:7,neutral:8,fast:9.5},lob:{slow:6,neutral:7,fast:8}},
  HANG={lob:.9,neutral:.3,drop:.25,hook:.2},TIN={drop:1.1,lob:2.2,neutral:1.0,push:.45,flatsmash:.35,hook:.6,dig:.8},
  HOMEX={push:10.3,flatsmash:10.3,drop:10.0,neutral:11.5,dig:11.5,lob:12.6,hook:12.8};
function rv(){return (MATCH&&MATCH.r.R)||{react:.26,run:4.8,back:.6,reach:1,ue:.05,fe:.08,shortLob:.18,blunder:.12,hes:.08,bh:.08,attack:.6}}
function oP(sit,k){if(sit["o"+k])return sit["o"+k];var g=sit[k]||(k==="A"?[1,0]:[1,2]);return [OX[g[0]],[2.4,4.0,5.6][g[1]]]}
function dst(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
function toward(a,b,d){var L=dst(a,b);if(L<=d||L===0)return b.slice();return [a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L]}
function toGrid(p){var gx=0,gy=0;OX.forEach(function(v,i){if(Math.abs(p[0]-v)<Math.abs(p[0]-OX[gx]))gx=i});OY.forEach(function(v,i){if(Math.abs(p[1]-v)<Math.abs(p[1]-OY[gy]))gy=i});return [gx,gy]}
function nm(k){return MATCH?MATCH.r.p[k==="A"?0:1].n:k}
function reachCheck(shot,speed,from,land,sit,R,vmul,steal){shot=aimShot(shot);var v=(((VBALL[shot]||VBALL.neutral)[speed])||9)*(vmul||1),tBall=dst(from,land)/v+(HANG[shot]||0),
    A=oP(sit,"A"),B=oP(sit,"B"),mid=[(A[0]+B[0])/2,(A[1]+B[1])/2],hes=Math.abs(A[0]-B[0])<1.5&&dst(land,mid)<0.9?R.hes:0;
  function need(d){var n=Math.max(0,dst(d,land)-(R.reach+CAL.reach)*(shot==="drop"?0.8:1)),run=R.run*(land[0]>d[0]+1?R.back:1),dy=land[1]-d[1],bh=dy>0.3&&dy<2.4?R.bh:0;
    return {t:(n>0?R.react+hes+n/run:R.react*0.5+hes*0.5)+bh+(steal||0),bh:bh>0}}
  var nA=need(A),nB=need(B),who=nA.t<=nB.t?"A":"B",n=who==="A"?nA:nB,pos=who==="A"?A:B;
  return {m:tBall-n.t,who:who,tBall:tBall,tNeed:n.t,bh:n.bh,ranBack:land[0]-pos[0],A:A,B:B,land:land}}
/* One shot. Does it land, can they reach it, how good is their reply */
/* The height battle. Above the net (1.7 m) you hit down; below it you have to lift */
var CAL={reach:1.2,win:-0.1},NET_H=1.7,ATK={push:1,flatsmash:1,hook:1,bhsmash:1,brush:1};
function arrHeight(shot,ch){var sh=aimShot(shot),a=ch-NET_H;if(ATK[sh])return a>0?Math.max(0.3,1.0-0.45*a):Math.min(2.4,1.5-0.5*a);return {lob:2.6,neutral:1.3,dig:1.6,drop:0.6}[sh]||1.3}
function shotOutcome(o){var R=rv(),sh0=aimShot(o.shot),ch=o.ch!=null?o.ch:1.4,above=ch-NET_H,
    pMiss=[.12,.07,.03][Math.max(0,o.tier)]+[0,.04,.12][o.aimT]+(o.speed==="fast"?.04:0)+(state.wind==="gusty"&&o.aimT===2?.04:0);
  if(sh0==="flatsmash")pMiss+=ch<1.2?0.35:ch<NET_H?0.2:0;
  /* A rising ball can't be hit hard and short: from below the net, pace into the front row finds the net */
  if(ATK[sh0]&&above<0&&o.cell&&o.cell[0]===0)pMiss+=0.25;else if(ATK[sh0]&&above<0&&o.cell&&o.cell[0]===1&&o.speed==="fast")pMiss+=0.08;if(sh0==="push"&&ch<0.9)pMiss+=0.12;if(sh0==="hook"&&ch<1.4)pMiss+=0.12;
  if(o.ct==="early")pMiss+=((o.spare!=null&&o.spare<0.15)?0.08:0.04)*(o.tier===2?0.5:1);if(o.ct==="late")pMiss-=0.03;pMiss=Math.max(0.01,pMiss);
  var vmul=ATK[sh0]?Math.max(0.6,Math.min(1.25,1+0.22*above)):1,steal=o.ct==="early"?0.15:o.ct==="late"?-0.15:0,arrH=arrHeight(sh0,ch);
  if(state.level==="beginner")pMiss*=.6;var pr=(o.sit&&o.sit.press||0)*0.45*(o.tier===2?0.5:o.tier===1?0.85:1);
  if(Math.random()<pr)return {end:"pressed",why:"Their attack was too good to get back."};
  if(Math.random()<pMiss)return {end:"miss",why:o.aimT===2?"The target was too risky.":o.tier<2?"It wasn't the right shot for that ball.":o.speed==="fast"?"Too much pace.":"Even good shots miss sometimes."};
  var t=svTarget(o.cell),land=[Math.max(8.4,Math.min(15.9,t[0]+(Math.random()-.5)*.6)),Math.max(.2,Math.min(7.8,t[1]+(Math.random()-.5)*.6))],
    rc=reachCheck(o.shot,o.speed,o.from,land,o.sit,R,vmul,steal),Q;rc.arrH=arrH;
  if(rc.m<CAL.win)return {end:"winner",rc:rc,arrH:arrH};
  if(rc.m<0.3){if(Math.random()<R.fe+0.5*(1-rc.m/0.3)+(arrH<0.6?0.1:0))return {end:"forced",rc:rc,arrH:arrH};Q=0.1+0.25*rc.m/0.3}
  else{if(Math.random()<R.ue)return {end:"theymiss",rc:rc,arrH:arrH};Q=Math.min(1,0.35+0.8*(rc.m-0.3))-(rc.bh?0.15:0)}
  if(rc.ranBack>3)Q=Math.min(Q,0.4);Q+=arrH<1?-0.15:arrH>1.7?0.1:0;
  return {end:null,Q:Math.max(0,Q),rc:rc,arrH:arrH}}
/* When they have time, they look for the gap in your court */
function findGap(from,team){var c=[["lob",[1.2,1.5]],["lob",[1.2,4]],["lob",[1.2,6.5]],["drop",[6.9,1.5]],["drop",[6.9,4]],["drop",[6.9,6.5]],["push",[5,4]],["push",[5,0.9]],["push",[5,7.1]]],best=null;
  c.forEach(function(x){var sh=x[0],tg=x[1],tThem=dst(from,tg)/VBALL[sh].neutral+(HANG[sh]||0),
    near=team.reduce(function(b,p){return dst(p,tg)<dst(b,tg)?p:b}),gap=Math.max(0,dst(near,tg)-1.0),back=tg[0]<near[0]-1,
    tMe=(gap>0?0.32+gap/(4.2*(back?0.55:1)):0.15),sc=tMe-tThem;if(!best||sc>best.sc)best={sh:sh,tg:tg,sc:sc,near:near}});
  return best}
var GAPTXT={lob:"a lob over you into the empty back court",drop:"a drop into the space in front of you",push:"a push through the open court"};
/* Where they aim in your court. Into space, away from whoever takes it, so you have to run. Better pairs find the space more often */
var AIMY=[0.7,1.9,3.1,4.0,4.9,6.1,7.3],AIMX={fast:[2.6,3.6,4.6,5.6],lob:[0.8,1.4],slob:[3.0,3.6],drop:[6.5,7.1],pop:[5.4,6.0],neutral:[3.0,3.8]};
function aimAt(k,team,prefer,opening,short,pop){var R=rv(),xs=short?AIMX.slob:pop?AIMX.pop:k==="lob"?AIMX.lob:k==="drop"?AIMX.drop:k==="neutral"?AIMX.neutral:AIMX.fast,
    ys=k==="neutral"&&!opening?[3.1,4.0,4.9]:AIMY,c=[];xs.forEach(function(x){ys.forEach(function(y){c.push([x,y])})});
  var who=prefer==="me"?0:prefer==="mate"?1:(Math.random()<0.65?0:1),P=team[who],O=team[1-who];
  /* They place it where you can only just get to it. Better pairs push it a little further, out of reach */
  var tin=TIN[k]||1,slack=0.12-(R.aim||.5)*0.18,ok=function(q){var d=dst(q,P),back=q[0]<P[0]-1,need=0.3+Math.max(0,d-1.1)/(4.2*(back?0.6:1));return d>=1.5&&need<=tin+0.25-slack};
  var pool=c.filter(function(q){return ok(q)&&dst(q,P)<=dst(q,O)+0.3});if(!pool.length)pool=c.filter(ok);if(!pool.length)pool=c.filter(function(q){return dst(q,P)<=1.8});if(!pool.length)pool=c;
  var t;if(!opening&&Math.random()<(R.aim||0.5)){t=pool.reduce(function(b,q){return Math.min(dst(q,P),dst(q,O))>Math.min(dst(b,P),dst(b,O))?q:b})}
  else{var mid=pool.filter(function(q){var d=dst(q,P);return d<=2.6});t=(mid.length?mid:pool)[Math.floor(Math.random()*(mid.length?mid:pool).length)]}
  t=[t[0]+(Math.random()-.5)*0.4,t[1]+(Math.random()-.5)*0.4];
  return {c:[Math.max(0.4,Math.min(7.4,t[0])),Math.max(0.4,Math.min(7.6,t[1]))],mate:dst(t,team[1])<dst(t,team[0])}}
function placeBall(sit,k,team,prefer,opening,short,pop,tg){var a=tg?{c:tg.slice(),mate:dst(tg,team[1])<dst(tg,team[0])}:aimAt(k,team,prefer,opening,short,pop),P=a.mate?team[1]:team[0],hs0=state.hand==="L"?-1:1,dy=(a.c[1]-P[1])*hs0;
  sit.cxy=a.c;sit.depth=a.c[0]>5.2?"front":a.c[0]>2.3?"mid":"back";sit.side=dy>0.3?"fh":dy<-0.3?"bh":"body";sit.me0=team[0].slice();sit.mate0=team[1].slice();return a.mate}
/* Their reply, with their positions carried through the rally */
function rallyReply(cur,ctx,out,team,meKey){var R=rv(),Q=out.Q,rc=out.rc,pick=null,opening=false;
  if(out.forcePop){opening=true;pick={k:"dig",why:"Under pressure, they could only pop it up.",to:"either",pop:true}}
  else if(Q<0.35){opening=true;var sl=R.shortLob+0.35-Q;
    pick=rc.ranBack>3?{k:"hook",why:"They had to run back. A weak hook from behind them.",to:"either"}:
      Math.random()<sl?{k:"lob",why:"You stretched them. Their lob is short and sitting up.",to:"either",short:true}:{k:"dig",why:"You stretched them. Their block floats up.",to:"either",pop:true}}
  else if(Q>0.7&&team&&Math.random()<(Q-0.7)/0.3*R.attack+0.15){var g=findGap(rc.land,team);
    if(g&&g.sc>-0.1&&Math.random()<Math.max(0,Math.min(1,(g.sc+0.1)/0.4))*(0.55+0.45*R.attack))return {theyWin:true,gap:g};
    if(g)pick={k:g.sh,why:"They had time and attacked the space: "+GAPTXT[g.sh]+".",to:g.near===team[1]?"mate":"me",tg:g.tg}}
  if(!pick){var rows=replyRows(ctx);pick=wpick(rows.map(function(x){return [x,x.w]}));cur.rows=rows}
  /* The ball reached them low: they must lift it. It reached them high: they can attack you */
  var aH=out.arrH!=null?out.arrH:1.3,lifted=false;
  if(pick.k==="dig"&&!ATTACK3[aimShot(ctx.shot||"neutral")])pick={k:"neutral",why:"A soft ball can't be blocked, so they played it back.",to:pick.to};
  if(!opening&&aH<NET_H&&/push|flatsmash|hook/.test(pick.k)){pick=Math.random()<0.55?{k:"dig",why:"It reached them low, so they had to lift it.",to:pick.to}:{k:"lob",why:"It reached them low, so they lobbed.",to:pick.to};lifted=true}
  else if(!opening&&aH>1.7&&/dig|neutral|drop/.test(pick.k)&&Math.random()<0.5){pick={k:"push",why:"It reached them high, so they attacked.",to:pick.to}}
  var b=REPLY_BALL[pick.k],sit={shot:pick.k,depth:b.depth,height:b.height,speed:b.speed,side:pick.k==="neutral"?"body":wpick([["fh",4],["body",2],["bh",3]])};
  if(pick.short){sit.depth="mid";sit.height="high";sit.speed="slow"}
  if(pick.pop){sit.depth="front";sit.height="high";sit.speed="slow"}
  if(pick.k==="hook"&&opening){sit.speed="med";sit.depth="mid"}
  if(pick.k==="lob"&&!pick.short){sit.side="bh";var into=state.wind!=="calm"&&windV()[0]>0.7;if(Math.random()<(into?0.45:R.shortLob*0.6)){sit.depth="mid";opening=true;pick=Object.assign({},pick,{why:pick.why+(into?" Into the wind it falls short.":" It came up short.")})}}
  if(pick.k==="neutral"&&!opening&&Math.random()<0.35)sit.speed="slow";
  if(lifted||(aH<1.0&&!opening)){sit.height=Math.random()<0.6?"high":"med";if(sit.speed==="fast")sit.speed="med"}
  sit.press=opening?0:Math.max(0,Math.min(0.9,(Q-0.35)*({push:1.2,flatsmash:1.4,hook:1,drop:0.9,lob:0.5}[pick.k]||0.4)+(pick.tg?0.25:0)));
  /* Where they end up. The hitter moved to your ball, the partner recovers. Some pairs don't recover well */
  var hk=rc.who,pk=hk==="A"?"B":"A",tIn=TIN[pick.k]||1,hx=HOMEX[pick.k]||11.5,hit=[Math.max(8.8,Math.min(15.8,rc.land[0])),Math.max(.5,Math.min(7.5,rc.land[1]))],
    pp=hk==="A"?rc.B:rc.A,hH=[hx,hk==="A"?2.5:5.5],hP=[hx,pk==="A"?2.5:5.5],o={};
  o[hk]=toward(hit,hH,R.run*tIn*0.7);o[pk]=toward(pp,hP,R.run*(rc.tBall+tIn));
  var bl=null;if(Math.random()<R.blunder){var r=Math.random();
    if(r<0.4&&hit[0]<11){o[hk]=hit;bl=nm(hk)+" is stuck at the net. Lob over them."}
    else if(r<0.75){o[pk][1]=o[pk][1]+(o[hk][1]-o[pk][1])*0.6;bl="They've drifted to one side. The "+(o[hk][1]<4?"right":"left")+" side is open."}
    else{o[pk][0]=Math.max(o[pk][0],13.6);bl=nm(pk)+" stayed deep. Drop it short in front of them."}}
  sit.oA=o.A;sit.oB=o.B;sit.A=toGrid(o.A);sit.B=toGrid(o.B);
  var mate=pick.to==="mate"?true:pick.to==="me"?false:Math.random()<(opening?0.15:0.3);
  if(team)mate=placeBall(sit,pick.k,team,pick.to==="mate"?"mate":pick.to==="me"?"me":opening?"me":null,opening,pick.short,pick.pop,pick.tg);
  cur.sit=sit;cur.mate=mate;cur.srcKey=hk;cur.opening=opening;cur.blunder=bl;
  cur.why=pick.why+(bl&&(state.level==="beginner"||state.level==="intermediate")?" "+bl:"");return pick}
/* Set-ups that won the point */
var SEQ={"drop>lob":"Drop to pull them in, then lob over them","lob>flatsmash":"Deep lob, then smash the short reply","lob>hook":"Deep lob, then attack the weak reply","push>flatsmash":"Push to force the block, then smash it",
  "drop>push":"Drop to pull them in, then push past them","neutral>push":"Neutral to set it up, then push","flatsmash>flatsmash":"Smash, then smash the pop-up","push>push":"Push to the backhand, then push through the gap","lob>drop":"Lob them back, then drop it short"};
function comboOf(hist){if(hist.length<2)return null;var a=hist[hist.length-2],b=hist[hist.length-1];return SEQ[aimShot(a.shot)+">"+aimShot(b.shot)]||(a.Q!=null&&a.Q<0.35?"You forced the weak ball, then finished it":null)}
function reachRing(rc,R){if(!rc)return;var l=rc.land,k=rc.who,p=rc[k],run=R.run*(l[0]>p[0]+1?R.back:1),got=Math.max(0,rc.tBall-R.react)*run,D=dst(p,l),e=toward(p,l,Math.min(D,got+R.reach)),ok=got+R.reach>=D;
  el("line",{x1:X(p[0]),y1:Y(p[1]),x2:X(l[0]),y2:Y(l[1]),stroke:"#0D1B2A","stroke-opacity":0.35,"stroke-width":2,"stroke-dasharray":"3 5","pointer-events":"none"},gM);
  el("line",{x1:X(p[0]),y1:Y(p[1]),x2:X(e[0]),y2:Y(e[1]),stroke:ok?"#0D1B2A":"#FF4D6D","stroke-width":4,"stroke-linecap":"round","pointer-events":"none"},gM);
  el("circle",{cx:X(e[0]),cy:Y(e[1]),r:6,fill:ok?"#0D1B2A":"#FF4D6D","pointer-events":"none"},gM);
  el("path",{d:"M"+(X(l[0])-7)+" "+(Y(l[1])-7)+"L"+(X(l[0])+7)+" "+(Y(l[1])+7)+"M"+(X(l[0])+7)+" "+(Y(l[1])-7)+"L"+(X(l[0])-7)+" "+(Y(l[1])+7),stroke:"#FF4D6D","stroke-width":3,"stroke-linecap":"round","pointer-events":"none"},gM)}
var ENDTXT={winner:["WINNER!","Winner!","They couldn't reach it."],forced:["FORCED ERROR","You forced it.","Your shot rushed them."],
  theymiss:["THEY MISSED","They missed.","An unforced error from them."],miss:["OUT!","You missed.",""],gap:["THEY FOUND THE GAP","They found the gap.",""],late:["TOO SLOW","Too slow.","The clock ran out and you rushed it."],pressed:["FORCED ERROR","You were rushed.","Their attack rushed you."]};
var FBTICKS=null;
function reachText(rc,R){if(!rc)return "";var who=nm(rc.who);return "Your ball took "+rc.tBall.toFixed(2)+" s. "+who+" needed "+rc.tNeed.toFixed(2)+" s to get there"+(rc.bh?", slower on the backhand":"")+". "+(rc.m<0?"Out of reach.":rc.m<0.3?"Only just. They were stretched.":"Plenty of time.")+" The solid line shows how far they got before the ball landed at the cross."}
function pointEnd(m,won,kind){m.st.best=Math.max(m.st.best||0,(m.cur&&m.cur.rally||0)+1);setTimeout(function(){if(MATCH!==m)return;var pm={};pm[state.side]=won?"flatsmash":"dig";pm[mateKey()]=won?"serve":"dig";setPoses(pm)},900);
  setTimeout(function(){if(MATCH!==m)return;},1700);var hs0=(m.cur&&m.cur.hist||[]).filter(function(h){return h.by!=="mate"}).map(function(h){return simple(h.shot)});setTimeout(function(){sfx(won?"win":"lose",{shots:hs0})},450);m.points++;if(won)m.me++;else m.them++;m.log.push(won?"w":"l");var fin=(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2,mp=!fin&&m.them>=WIN_AT-1&&m.them>m.me;
  if(!fin)setTimeout(function(){if(MATCH===m)banter(mp?"matchPoint":won?"youWin":kind==="gap"||kind==="sand"?"bigShot":kind==="miss"||kind==="late"||kind==="pressed"?"yourErr":"theyWin",mp)},2300);var s=m.st;if(kind==="winner")s.w++;if(kind==="forced")s.fe++;if(kind==="theymiss")s.tue++;if(kind==="miss")s.ue++;if(kind==="pressed")s.pfe=(s.pfe||0)+1;if(kind==="sand")s.sand=(s.sand||0)+1;if(kind==="gap")s.gap++}
function resolveMate(late){var m=MATCH,cur=m.cur,a=cur.ans,p=cur.pick,sp=sitPos(cur.sit),ms=a.shot,ideal=[MATE_X[ms]||4.6,laneY(state.side)],R=rv();
  var at=p.pos||cur.from,dist=Math.hypot(at[0]-ideal[0],at[1]-ideal[1]),q=late&&!p.pos?"late":dist<=1?"right":dist<=1.8?"close":"wrong";
  var spd={fast:"fast",slow:"slow"}[MATE_SPD[ms]]||"neutral",out=shotOutcome({shot:ms,speed:spd,cell:a.cell5,tier:2,aimT:aimTier(a.cell5,ms,cur.sit,spd),from:sp.mateContact,sit:cur.sit}),
    team=[at,[ideal[0],laneY(sp.partner)]],kind=out.end,cont=false,rep=null,won;
  cur.hist=(cur.hist||[]);cur.hist.push({shot:ms,cell:a.cell5,Q:out.Q,by:"mate"});
  if(!kind){var ctx=replyCtx(ms,a.cell5,spd,q==="right"?MOVE_OK[ms]:"hold","good","mate");rep=rallyReply(cur,ctx,out,team);
    if(rep.theyWin){kind="gap"}else if((cur.rally||0)>=11){kind="theymiss"}else cont=true}
  if(q==="late"&&!kind){kind="late";cont=false}
  won=kind==="winner"||kind==="forced"||kind==="theymiss";
  if(!cont){if(q==="right")m.right++;pointEnd(m,won,kind)}
  track("point_played",{rival:m.r.id,type:"position",partner_shot:ms,quality:q,distance:+dist.toFixed(2),late:late,won:won,end:kind||"rally"});
  el("circle",{cx:X(ideal[0]),cy:Y(ideal[1]),r:20,fill:"#2ECC71","fill-opacity":0.25,stroke:"#00776F","stroke-width":2.5,"stroke-dasharray":"4 4"},gM);
  PL[sp.partner].g.style.transitionDuration="900ms";place(sp.partner,[ideal[0],laneY(sp.partner)],false);if(out.rc&&!cont)reachRing(out.rc,R);
  if(ballTag)ballTag.classList.add("dim");renderScore();var over=!cont&&(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2;
  var E=ENDTXT[kind]||null,posW=q==="right"?"Great position.":q==="close"?"Close position.":q==="late"?"Too slow.":"Out of position.",
    gapT=kind==="gap"?"They played "+GAPTXT[rep.gap.sh]+". "+(q==="right"?"Even good positions can be beaten.":"Your position left it open."):"";
  var html='<div class="ptres '+(cont?"m":won?"w":"l")+'"><b>'+(cont?(cur.opening?"Opening!":"Rally on."):E[1])+'</b> '+(cont?cur.why:(E[2]||gapT))+' '+posW+'</div><div class="fbbest"><b>Best play</b><p>'+(MATE_TXT[ms]||"")+'</p></div><!--more-->'+
    fbSec("Your partner's shot","They played a "+SHOTS[ms].name.toLowerCase()+". "+a.why)+(out.rc?fbSec("Reach",reachText(out.rc,R)):"")+
    fbSec("Your position",(q==="late"?"Too slow. The clock ran out. ":q==="right"?"Great position. ":q==="close"?"Close. Stand on the green mark. ":"Stand on the green mark. ")+(MATE_TXT[ms]||""))+
    fbSec("Opponents",oppText(cur.sit))+fbSec("Wind",windText());
  hideShotUI();cmd("");stopBar();var cm=m.cur,tk=[["Move",q==="right"?2:q==="close"?1:0]];if(!cont){buzz(won?[30,40,30]:[60])}else buzz([20]);
  setTimeout(function(){if(!MATCH||MATCH.cur!==cm)return;FBTICKS=tk;fbShow(html,cont?"Play on":over?"See the result":"Next point",function(){if(cont)nextShot(cm);else playOn(over)})},cont?800:1200)}
function resolvePoint(late){var m=MATCH;if(!m||!m.cur||m.cur.done)return;var cur=m.cur,a=cur.ans,p=cur.pick;cur.done=true;clearTimeout(cTimer);if(!cur.from){cur.done=false;return}if(cur.mate)return resolveMate(late);
  if(late&&!cur.atBall){cur.done=false;return sandLoss(cur,"slow")}
  if(late&&p.shot&&p.cell){if(!p.move)p.move="hold";if(!p.pos)p.pos=cur.from;cur.rushed=true;late=false}
  var R=rv(),tierP=p.shot?shotTiers(cur.sit,a.shot)[p.shot]:-1,shotOk=tierP===2,shotMid=tierP===1,mvKey=shotOk?p.shot:a.shot,
    aimCtx={shot:p.shot||a.shot,sit:cur.sit},ct=p.cell?aimTier(p.cell,aimCtx.shot,cur.sit,p.speed):2,aimWhy=p.cell?aimScore(p.cell,aimCtx.shot,cur.sit,p.speed).why:"",sq=ct===0?"right":ct===1?"close":"wrong",ss=p.shot?ssVerdict(p.shot,p.speed,p.spin,cur.sit):{ok:false,part:false},
    moveOk=p.move&&p.move===MOVE_OK[mvKey];
  var sp=sitPos(cur.sit),dest=p.cell?svTarget(p.cell):[12,4],dx={in:1.3,hold:0,back:-1}[p.move||"hold"],pt=sp.partner,mvPos=merge(sp.pos,null);
  mvPos[state.side]=p.pos||cur.from;mvPos[pt]=[Math.max(1,Math.min(6.6,mvPos[state.side][0])),laneY(pt)];
  var out=late||!p.shot||!p.cell?{end:"late",net:Math.random()<0.55}:shotOutcome({shot:p.shot,speed:p.speed,cell:p.cell,tier:tierP,aimT:ct,from:cur.from,sit:cur.sit,ch:cur.ch,ct:cur.ctype,spare:cur.spare}),kind=out.end,cont=false,rep=null,combo=null;
  cur.hist=(cur.hist||[]);if(p.shot)cur.hist.push({shot:p.shot,cell:p.cell,Q:out.Q,by:"me"});
  var G=(!late&&p.shot&&p.cell&&cur.ch!=null)?gradeChoice(cur,p):null;
  /* Pressure builds over shots: stretch them, steal their time, pull them out of position. Full pressure pops the ball up */
  if(!kind&&out.rc){var hm=[11.5,out.rc.who==="A"?2.5:5.5],disp=dst(out.rc[out.rc.who],hm)>1.5,
      pz=0.5*(cur.press||0)+Math.max(0,Math.min(1,(0.6-out.rc.m)/0.6))+(cur.ctype==="early"&&cur.ch>=NET_H?0.25:0)+(disp?0.2:0)+(out.arrH<1?0.15:0);
    out.Q=Math.max(0,out.Q-0.35*pz);if(pz>=1)out.forcePop=true;cur.pressOut=Math.min(1.2,pz);
    var ok2=out.rc.who==="A"?"B":"A";setPosture(out.rc.who,out.rc.m<0.3?"str":out.rc.m<0.65?"mov":"set");setPosture(ok2,disp?"mov":"set");setPips(pz)}
  if(!kind){var ctx=replyCtx(p.shot,p.cell,p.speed,p.move,shotOk?(sq==="right"?"good":"ok"):"risky","me");ctx.fh=nearFH(p.cell,cur.sit);
    rep=rallyReply(cur,ctx,out,[mvPos[state.side],mvPos[pt]]);if(rep.theyWin)kind="gap";else if((cur.rally||0)>=16)kind="theymiss";else cont=true}
  var won=kind==="winner"||kind==="forced"||kind==="theymiss";if(won&&kind!=="theymiss")combo=comboOf(cur.hist);
  if(cur.wasOpening){m.st.open++;if(won)m.st.conv++}
  m.shots=m.shots||[];if(G)m.shots.push({pt:m.points,lab:G.lab,d:+G.d.toFixed(2),ct:cur.ctype,ch:+cur.ch.toFixed(2),dec:cur.decT0?Math.round(performance.now()-cur.decT0):null,open:!!cur.wasOpening,
    sit:JSON.parse(JSON.stringify(cur.sit)),pick:{shot:p.shot,cell:p.cell,speed:p.speed,spin:p.spin},best:{shot:G.best.shot,cell:G.best.cell},end:kind||null});
  if(!cont){if(G&&LABSC[G.lab]===2)m.right++;pointEnd(m,won,kind);if(combo)m.st.combo++;if(!won)saveLost({sit:cur.sit,pick:{shot:p.shot,cell:p.cell,speed:p.speed,spin:p.spin,move:p.move,pos:p.pos},ans:{shot:a.shot,cell5:a.cell5},kind:kind,tier:tierP,aimT:ct,moveOk:!!moveOk,why:out.why||"",rival:m.r.pair})}
  track("point_played",{rival:m.r.id,picked:p.shot||null,answer:a.shot,square:sq,speed:p.speed,spin:p.spin,move:p.move||null,late:late,won:won,end:kind||"rally",combo:combo});
  if(p.shot&&!late){POSE[state.side]=POSE_MAP[p.shot]||null;updImg(state.side);var pr=PROF[p.shot]||PROF.neutral;PROF._me={d:pr.d*{slow:1.3,neutral:1,fast:0.75}[p.speed],h:pr.h};
    if(p.shot==="flatsmash")0;
    if(kind==="miss")errBall(cur.from,dest[1],Math.random()<0.5);else runBall({f:cur.from,to:out.rc?out.rc.land:dest,shot:"_me",spin:SV_ROT[p.speed]*(p.spin==="flat"?0.6:1.5)*(p.spin==="slice"?-1:1),curve:p.spin==="left"?-24:p.spin==="right"?24:0,land:true},true)}
  if(kind==="late"&&cur.atBall){POSE[state.side]=POSE_MAP[p.shot||a.shot]||"push";updImg(state.side);errBall(cur.from,cur.from[1]+(Math.random()-.5)*2,out.net)}
  PL[pt].g.style.transitionDuration="900ms";place(pt,mvPos[pt],false);if(!p.pos){PL[state.side].g.style.transitionDuration="900ms";place(state.side,mvPos[state.side],false)}
  if(kind==="gap"&&rep&&rep.gap){var gg=rep.gap,rk=out.rc,hk=rk.who,myd=PROF._me?PROF._me.d*1.3:700;setTimeout(function(){if(!MATCH||MATCH.cur!==cur)return;POSE[hk]=POSE_MAP[gg.sh]||null;updImg(hk);
      runBall({f:rk.land,to:gg.tg,shot:gg.sh,land:true},true);var who=dst(mvPos[state.side],gg.tg)<dst(mvPos[pt],gg.tg)?state.side:pt,from=mvPos[who];
      PL[who].g.style.transitionDuration="900ms";place(who,toward(from,gg.tg,Math.max(0,dst(from,gg.tg)-1.8)),false)},myd+150)}
  if(out.rc){["A","B"].forEach(function(k){var tg=k===out.rc.who?toward(out.rc[k],out.rc.land,Math.max(0,out.rc.tBall-R.react)*R.run+0.3):out.rc[k];PL[k].g.style.transitionDuration="800ms";place(k,tg,false)})}
  if(G)heatEV(G,p.cell);else heatAim(p.cell,aimCtx,p.speed);if(!cont&&out.rc)reachRing(out.rc,R);if(ballTag)ballTag.classList.add("dim");renderScore();
  var over=!cont&&(m.me>=WIN_AT||m.them>=WIN_AT)&&Math.abs(m.me-m.them)>=2,I=idealSS(a.shot,cur.sit),bestSS=ssVerdict(a.shot,I.sp[0],I.sn[0],cur.sit).best;
  var shotT=late?"Too slow. The clock ran out before you played.":p.shot===a.shot?"Right shot.":shotOk?"Good. Best: "+SHOTS[a.shot].name.toLowerCase()+".":shotMid?"Playable. Best: "+SHOTS[a.shot].name.toLowerCase()+". "+a.why:"Best: "+SHOTS[a.shot].name.toLowerCase()+". "+a.why;
  var locT=!p.cell?"You didn't choose a target.":(sq==="right"?"Great target. ":sq==="close"?"OK target. The ring was safer. ":"Risky target. "+aimWhy+" Best: "+cellName5(a.cell5).toLowerCase()+".");
  var posT=!p.move?"You didn't move.":moveOk?"Good movement.":"After a "+SHOTS[mvKey].name.toLowerCase()+", "+(MOVE_OK[mvKey]==="in"?"step in together, about 3 m from the net.":"hold level just behind your 3 m line and get ready.");
  var sumT="";
  var E=ENDTXT[kind]||null,head=cont?(cur.opening?"Opening! ":"Rally on. ")+cur.why:E[1]+" "+(kind==="miss"?out.why:kind==="gap"?"They played "+GAPTXT[rep.gap.sh]+". "+(moveOk?"":"Your position left it open."):E[2]);
  var html='<div class="ptres '+(cont?(cur.opening?"w":"m"):won?"w":"l")+'"><b>'+head+'</b> '+sumT+'</div>'+(combo?'<div class="fbbest"><b>Set-up</b><p>'+combo+'</p></div>':'')+
    '<div class="fbbest"><b>Best play</b><p>'+(G?SHOTS[G.best.shot].name+" to the "+cellName5(G.best.cell).toLowerCase()+".":SHOTS[a.shot].name+" to the "+cellName5(a.cell5).toLowerCase()+".")+'</p></div><!--more-->'+
    (cur.rushed?fbSec("Clock","Time ran out before you moved, so you stayed where you hit it."):"")+(cur.ch!=null?fbSec("Contact",contactText(cur,out,p)):"")+
    (G?fbSec("Your choice",G.lab+". "+(G.best.shot===p.shot&&G.best.cell.join()===p.cell.join()?"That was the best play here.":"Best was a "+SHOTS[G.best.shot].name.toLowerCase()+" to the "+cellName5(G.best.cell).toLowerCase()+".")+(LABSC[G.lab]<1&&won?" Lucky: it worked this time.":LABSC[G.lab]===2&&!won&&!cont?" Unlucky: right choice, they got it back.":"")):fbSec("Shot",shotT))+
    (out.rc?fbSec("Race",reachText(out.rc,R)):"")+(cont&&cur.pressOut!=null?fbSec("Pressure",pressText(cur.pressOut,out)):"")+
    fbSec("Your position",posT)+fbSec("Opponents",oppText(cur.sit))+fbSec("Wind",windText())+(G?'<button class="lnk flagbtn" type="button">Coach: disagree with the best play?</button>':'');
  hideShotUI();cmd("");stopBar();var cm=m.cur,tk=late||!G?null:[[G.lab,LABSC[G.lab],true],[{early:"Early",ontime:"On time",late:"Late"}[cur.ctype]+" "+cur.ch.toFixed(1)+" m",cur.ch>=NET_H?2:cur.ch>=1?1:0,true]];
  if(G&&!cont&&LABSC[G.lab]<1&&won)tk.push(["Lucky",1,true]);if(G&&!cont&&LABSC[G.lab]===2&&!won)tk.push(["Unlucky",1,true]);
  FBRACE=out.rc?{b:out.rc.tBall,n:out.rc.tNeed,who:nm(out.rc.who)}:null;
  if(!cont){buzz(won?[30,40,30]:[60])}else{buzz([20]);if(cur.opening)sfx("open")}
  setTimeout(function(){if(!MATCH||MATCH.cur!==cm)return;FBTICKS=tk;fbShow(html,cont?"Play on":over?"See the result":"Next point",function(){if(cont)nextShot(cm);else playOn(over)})},cont?800:1200)}
/* The rally goes on. Their reply and positions were set when your shot landed */
function nextShot(prev){var m=MATCH;if(!m)return;var cur={sit:prev.sit,pick:{},t0:0,srv:"rally",os:prev.os,rally:(prev.rally||0)+1,mate:prev.mate,srcKey:prev.srcKey,why:prev.why,hist:prev.hist,wasOpening:prev.opening,blunder:prev.blunder,press:prev.pressOut||0};
  m.cur=cur;cur.ans=solveSit(cur.sit);clearAim();drawPoint(true);decidePanel()}
/* Game review: how well you decided, and the moments that mattered */
function matchSummary(m){var sh=m.shots||[],n=sh.length,acc=n?Math.round(sh.reduce(function(a,x){return a+(LABPTS[x.lab]||0)},0)/n):0,
    early=sh.filter(function(x){return x.ct==="early"}).length,above=sh.filter(function(x){return x.ch>=NET_H}).length,
    decs=sh.map(function(x){return x.dec}).filter(function(x){return x!=null}).sort(function(a,b){return a-b}),dec=decs.length?decs[Math.floor(decs.length/2)]/1000:null;
  return {t:Date.now(),rival:m.r.pair,me:m.me,them:m.them,n:n,acc:acc,early:early,above:above,open:m.st.open||0,conv:m.st.conv||0,dec:dec}}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".flagbtn");if(!b||!MATCH||!MATCH.shots||!MATCH.shots.length)return;var x=MATCH.shots[MATCH.shots.length-1];
  try{var f=JSON.parse(load("flags","[]"));f.push({t:Date.now(),sit:x.sit,pick:x.pick,best:x.best,lab:x.lab});save("flags",JSON.stringify(f.slice(-100)))}catch(err){}
  track("answer_flagged",{best:x.best.shot,pick:x.pick.shot,lab:x.lab});b.textContent="Flagged for review. Thanks.";b.disabled=true});
function histList(){try{return JSON.parse(load("hist","[]"))||[]}catch(e){return []}}
function saveHist(sm){try{var h=histList();h.push(sm);save("hist",JSON.stringify(h.slice(-50)))}catch(e){}}
var LABCOL={Brilliant:"#00C2B8",Best:"#2ECC71",Good:"#9BD770",Inaccuracy:"#FF9F1C",Mistake:"#FF4D6D",Blunder:"#D6264B"};
function openReview(m,sm){var sh=m.shots||[],ov=document.createElement("div");ov.className="revov";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Game review");
  var pts={};sh.forEach(function(x){(pts[x.pt]=pts[x.pt]||[]).push(x)});
  var strip=m.log.map(function(r,i){var xs=pts[i]||[];return '<div class="rv-pt '+r+'"><span>'+(i+1)+'</span><div>'+xs.map(function(x){return '<i title="'+x.lab+'" style="background:'+LABCOL[x.lab]+'"></i>'}).join("")+'</div><b>'+(r==="w"?"Won":"Lost")+'</b></div>'}).join("");
  var key=sh.map(function(x,i){return {x:x,i:i}}).filter(function(o){return o.x.d>=0.2}).sort(function(a,b){return b.x.d-a.x.d}).slice(0,3);
  var kHtml=key.length?key.map(function(o,j){var x=o.x;return '<div class="rv-key"><span class="rv-lab" style="background:'+LABCOL[x.lab]+'">'+x.lab+'</span><p><b>Point '+(x.pt+1)+'.</b> '+SHOTS[x.pick.shot].name+' from '+x.ch.toFixed(1)+' m. Best: '+SHOTS[x.best.shot].name.toLowerCase()+' to the '+cellName5(x.best.cell).toLowerCase()+'.</p><button class="btn soft" data-k="'+o.i+'">Practise</button></div>'}).join(""):'<p class="rv-none">No big mistakes. Well played.</p>';
  var line=sm.n?"You took "+sm.early+" of "+sm.n+" balls early, and hit "+Math.round(sm.above/sm.n*100)+"% of them from above the net.":"";
  ov.innerHTML='<div class="rvin"><div class="rv-top"><b>Game review</b><button class="cexit rv-x" aria-label="Close review"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div>'+
    '<div class="rv-acc"><b>'+sm.acc+'<small>%</small></b><span>Accuracy</span></div>'+
    '<div class="rv-stats"><span><b>'+sm.early+'/'+sm.n+'</b>Early</span><span><b>'+(sm.n?Math.round(sm.above/sm.n*100):0)+'%</b>Above net</span><span><b>'+sm.conv+'/'+sm.open+'</b>Chances taken</span><span><b>'+(sm.dec!=null?sm.dec.toFixed(1)+' s':'–')+'</b>To decide</span></div>'+
    (line?'<p class="rv-line">'+line+'</p>':'')+'<h3>Key moments</h3>'+kHtml+'<h3>Every point</h3><div class="rv-strip">'+strip+'</div>'+
    '<div class="rv-legend">'+["Brilliant","Best","Good","Inaccuracy","Mistake","Blunder"].map(function(k){return '<span><i style="background:'+LABCOL[k]+'"></i>'+k+'</span>'}).join("")+'</div></div>';
  document.body.appendChild(ov);ov.querySelector(".rv-x").onclick=function(){ov.remove()};
  [].forEach.call(ov.querySelectorAll("[data-k]"),function(b){b.onclick=function(){var x=sh[+b.dataset.k],t=shotTiers(x.sit,x.best.shot)[x.pick.shot];
    saveLost({sit:x.sit,pick:x.pick,ans:{shot:x.best.shot,cell5:x.best.cell},kind:x.end==="miss"?"miss":"review",tier:x.pick.shot===x.best.shot?2:(t==null?0:Math.min(1,t)),aimT:x.pick.cell.join()===x.best.cell.join()?0:2,moveOk:true,why:"",rival:sm.rival});
    ov.remove();var e=document.querySelector(".endov");if(e)e.remove();leaveMatch();TRMODE="replay";save("tr-mode","replay");AU.i=0;AU.ans=null;setTab("pick")}});
  track("game_review_opened",{acc:sm.acc,n:sm.n})}
function endMatch(){lvStop();if(typeof BT!=="undefined"){clearTimeout(BT.clk);bDock("")}railOff(true);resBar(null);document.body.classList.remove("hasres");if(MATCH&&MATCH.me>MATCH.them)setTimeout(function(){sfx("fanfare")},200);hideShotUI();$("ctimer").hidden=true;var m=MATCH,won=m.me>m.them,bt=beaten();if(won&&!bt[m.r.id]){bt[m.r.id]=m.me+"–"+m.them;save("sand-beaten",JSON.stringify(bt))}
  var SM=matchSummary(m);saveHist(SM);track("match_completed",{rival:m.r.id,me:m.me,them:m.them,won:won,perfect_decisions:m.right,points:m.points,acc:SM.acc,early:SM.early,shots:SM.n,conv:SM.conv,open:SM.open,dec:SM.dec});
  clearAim();document.body.classList.remove("c-live");$("csit").hidden=true;var idx=RIVALS.indexOf(m.r),nx=RIVALS[idx+1],c=$("cpanel");
  var wq=Math.random()<.5?0:1,av=POSE_AV[state.emoji]||"a01",avm=POSE_AV[state.mate]||"a02",ra=POSE_AV[rAv(m.r,0)]||"a03",rb=POSE_AV[rAv(m.r,1)]||"a04",
    tip={baloes:"Smash their short lobs.",wall:"Lob deep over them.",breeze:"When they poach, go down the line.",feather:"Hit hard at their bodies.",champs:"Two good shots, then attack."}[m.r.id],
    lesson={baloes:"flatsmash",wall:"lob",breeze:"push",feather:"push"}[m.r.id];
  c.innerHTML="";var ov=document.createElement("div");ov.className="endov "+(won?"won":"lost");ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Match over");
  ov.innerHTML=(won&&!RM?'<div class="confetti" aria-hidden="true">'+Array.apply(null,Array(42)).map(function(_,i){return '<i style="left:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*0.8).toFixed(2)+'s;background:'+["#FF4D6D","#FF9F1C","#00C2B8","#FFD23F"][i%4]+'"></i>'}).join("")+'</div>':'')+
    '<div class="endin"><span class="hk">'+(won?"Match won":"Match lost")+'</span><div class="endscore">'+m.me+'<i>–</i>'+m.them+'</div>'+
    '<div class="endfigs">'+(won?'<img src="poses/'+av+'-flatsmash.webp" alt=""><img src="poses/'+avm+'-serve.webp" alt="">':'<img src="poses/'+ra+'-flatsmash.webp" alt=""><img src="poses/'+rb+'-serve.webp" alt="">')+'</div>'+
    (won?'':'<p class="endtip">'+esc(tip)+'</p>')+
    '<div class="tiles">'+((m.st.w+m.st.fe)?'<span><b>'+(m.st.w+m.st.fe)+'</b>Winners</span>':'')+(m.right?'<span><b>'+m.right+'</b>Right shots</span>':'')+'<span><b>'+(m.st.best||1)+'</b>Best rally</span></div>'+
    '<div class="endbtns">'+(won&&nx?'<button class="btn primary big" id="c-next">Play '+nx.pair+'</button><button class="btn soft" id="c-again">Rematch</button>':'<button class="btn primary big" id="c-again">'+(won?"Play again":"Rematch")+'</button>'+(!won&&lesson?'<button class="btn soft" id="c-learn">Learn the '+SHOTS[lesson].name.toLowerCase()+'</button>':''))+'<button class="btn soft" id="c-review">Game review · '+SM.acc+'%</button><button class="lnk" id="c-lobby">All pairs</button></div></div>';
  document.body.appendChild(ov);var close=function(){ov.remove()};
  $("c-again").onclick=function(){close();startMatch(m.r)};if($("c-next"))$("c-next").onclick=function(){close();startMatch(nx)};$("c-lobby").onclick=function(){close();leaveMatch();renderList();lobbyPanel()};
  $("c-review").onclick=function(){openReview(m,SM)};
  if($("c-learn"))$("c-learn").onclick=function(){close();leaveMatch();setTab("shots");save("id-shots",lesson);select(lesson)};
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

/* ---------------- Streamlining ---------------- */
(function(){var sb=$("stepbox");if(!sb)return;var d=document.createElement("details");d.className="more";d.id="more";d.innerHTML='<summary>Why?</summary><div class="morein"></div>';
  var inn=d.querySelector(".morein");["say-list","say-img","say-after","windtip","note","jobs"].forEach(function(id){var e=$(id);if(e)inn.appendChild(e)});var cards=$("cards");if(cards)inn.appendChild(cards);
  var x=document.createElement("button");x.className="whyx";x.type="button";x.setAttribute("aria-label","Close");x.innerHTML="&#10005;";x.onclick=function(){document.body.classList.remove("why-open")};sb.insertBefore(x,sb.firstChild);
  var opt=$("options");sb.insertBefore(d,opt&&opt.parentNode===sb?opt.nextSibling:null);
  $("whybtn").onclick=function(){d.open=true;document.body.classList.add("why-open")};
  document.addEventListener("keydown",function(e){if(e.key==="Escape")document.body.classList.remove("why-open")})})();
(function(){var box=$("seg-clock");if(!box)return;[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state.clock));
  b.onclick=function(){state.clock=b.dataset.v;save("clock",state.clock);track("setting_changed",{setting:"clock",to:state.clock});[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))})}})})();

/* ---------------- Train: five real moments. What would you do next? ---------------- */
var TR=null;
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
var TRMODE=load("tr-mode","quiz");
function trainOpen(){document.body.classList.remove("sheet-open");document.body.classList.remove("trsu");if(TRMODE==="setup"){setupOpen();return}if(TRMODE==="replay"){autoOpen();return}if(!TR||TR.done)trainStart();else trainScene(true)}
function modeSeg(){return '<div class="seg trmode" id="tr-mode"><button data-v="quiz" aria-pressed="'+(TRMODE==="quiz")+'">Quiz</button><button data-v="setup" aria-pressed="'+(TRMODE==="setup")+'">Ask the coach</button><button data-v="replay" aria-pressed="'+(TRMODE==="replay")+'">Lost points</button></div>'}
function wireMode(t){[].forEach.call(t.querySelectorAll("#tr-mode button"),function(b){b.onclick=function(){if(TRMODE===b.dataset.v)return;TRMODE=b.dataset.v;save("tr-mode",TRMODE);track("train_mode",{mode:TRMODE});trainOpen()}})}
function trainStart(){TR={set:shuf(PRESETS.map(function(_,i){return i})).slice(0,5),i:0,res:[],done:false};trainScene()}
function rr(a,b){return a+Math.random()*(b-a)}
function trainSit(i){var s;
  if(Math.random()<0.45){s=JSON.parse(JSON.stringify(PRESETS[i].s));s.label=PRESETS[i].name}
  else{var H=wpick([["high",3],["med",4],["low",3]]),Sp=H==="high"?wpick([["slow",3],["med",3]]):H==="low"?wpick([["fast",3],["med",3],["slow",2]]):wpick([["fast",3],["med",4],["slow",2]]),
      F=wpick([[[[0,0],[0,2]],3],[[[1,0],[1,2]],3],[[[2,0],[2,2]],2],[[[0,0],[2,2]],2],[[[2,0],[0,2]],2],[[[0,0],[1,2]],1],[[[1,0],[0,2]],1]]);
    s={side:wpick([["fh",4],["body",2],["bh",3]]),depth:wpick([["front",3],["mid",4],["back",H==="high"?4:1]]),speed:Sp,height:H,A:F[0].slice(),B:F[1].slice()}}
  /* Spread everyone out, a little different every time */
  var oy=function(l){return l===0?rr(1.2,2.8):l===2?rr(5.2,6.8):rr(3.4,4.6)};
  s.oA=[OX[s.A[0]]+rr(-.6,.6),oy(s.A[1])];s.oB=[OX[s.B[0]]+rr(-.6,.6),oy(s.B[1])];if(Math.abs(s.oA[1]-s.oB[1])<1.6)s.oB[1]=Math.min(7.2,s.oA[1]+2.4);
  s.A=toGrid(s.oA);s.B=toGrid(s.oB);
  var D=DI[s.depth],my=state.side==="L"?rr(1.8,3.2):rr(4.8,6.2),me=[[6.2,3.6,1.2][D]+rr(-.5,.5),my],hs=state.hand==="L"?-1:1,
    off=s.side==="fh"?hs*rr(.6,1.3):s.side==="bh"?-hs*rr(.6,1.3):rr(-.25,.25);
  s.me0=me;s.mate0=[rr(3.4,5.6),state.side==="L"?rr(4.8,6.4):rr(1.6,3.2)];s.cxy=[Math.max(.5,Math.min(7.4,me[0]+rr(-.4,.4))),Math.max(.4,Math.min(7.6,my+off))];
  if(!s.label){var hw={high:"High ball",med:"Chest-high ball",low:"Low ball"}[s.height],sw={fast:"fast",med:"",slow:"slow"}[s.speed],side={fh:"on your forehand",bh:"on your backhand",body:"at your body"}[s.side],
    op=s.A[0]===s.B[0]?["Both at the net","Both mid-court","Both deep"][s.A[0]]:"One up, one back";s.label=(sw?sw[0].toUpperCase()+sw.slice(1)+" "+hw.toLowerCase():hw)+" "+side+" · "+op}
  return s}
function trainScene(redraw){var sit=redraw&&TR.sit?TR.sit:trainSit(TR.set[TR.i]);drawWind();
  if(!redraw){TR.sit=sit;TR.ans=solveSit(sit);TR.pick={speed:"neutral",spin:"flat"};TR.step="read"}
  gG.innerHTML="";gM.innerHTML="";clearAim();drawZones(false);runBall(null);
  var sp=sitPos(sit);["A","B","L","R"].forEach(function(k){place(k,sp.pos[k],true)});TR.sp=sp;
  var hk=sp.pos.A[0]<=sp.pos.B[0]?"A":"B",pm={};pm[hk]=oppPose(sit);setPoses(pm);gTag.innerHTML="";courtPill(sp.pos[hk],SHOTS[oppPose(sit)].name);
  var endH={low:0.4,med:1.4,high:3.0}[sit.height],arc={fast:0.4,med:1.2,slow:2.2}[sit.speed];
  PROF._in={d:{fast:380,med:850,slow:1800}[sit.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  if(TR.step==="verdict"){trainVerdictDraw()}else{runBall({f:sp.pos[hk],to:sp.contact,shot:"_in",spin:{fast:2.4,med:1.0,slow:0.35}[sit.speed],trail:sit.speed},false);
    if(TR.step==="target")trainAimOn();if(TR.step==="move")trainMoveOn()}
  trainTray()}
function trProg(){return '<div class="trprog">'+TR.set.map(function(_,i){var r=TR.res[i];return '<i class="'+(r||(i===TR.i?"cur":""))+'"></i>'}).join("")+'</div>'}
function readHtml(sit){var th=SHOTS[sit.shot||oppPose(sit)].name,hw={high:"high",med:"chest-high",low:"low"}[sit.height],sw={fast:"fast",med:"medium pace",slow:"slow"}[sit.speed],
    sd={fh:"to your forehand",bh:"to your backhand",body:"at your body"}[sit.side],me={front:"near the net",mid:"mid-court",back:"deep"}[sit.depth],
    op=sit.A[0]===sit.B[0]?["Both at the net","Both mid-court","Both deep"][sit.A[0]]:"One up, one back";
  return '<div class="trread"><p><b>Their '+th.toLowerCase()+'</b> · '+{high:"high",med:"chest",low:"low"}[sit.height]+' · '+{fast:"fast",med:"medium",slow:"slow"}[sit.speed]+' · '+{fh:"forehand",bh:"backhand",body:"body"}[sit.side]+'</p></div>'}
function trScroll(to){if(window.innerWidth>900)return;var e=to==="court"?document.querySelector(".court-card"):$("trtray");if(e)e.scrollIntoView({behavior:RM?"auto":"smooth",block:to==="court"?"start":"nearest"})}
function trainTray(){var t=$("trtray"),pr=PRESETS[TR.set[TR.i]];t.hidden=false;document.body.classList.remove("trsu");document.body.classList.toggle("trmin",!TR.done&&/target|move/.test(TR.step));document.body.classList.toggle("trmid",!TR.done&&TR.step==="read");var _w=function(){wireMode(t)};setTimeout(_w,0);
  if(TR.done){var sc=TR.res.filter(function(r){return r==="good"}).length,best=Math.max(sc,+load("tr-best","0")||0);save("tr-best",String(best));
    t.innerHTML=modeSeg()+trProg()+'<div class="trend"><b>'+sc+'/5</b><small>Best '+best+'/5</small></div><div class="trbtns"><button class="btn primary big" id="tr-again">Again</button><button class="btn soft" id="tr-comp">Compete</button></div>';
    $("tr-again").onclick=trainStart;$("tr-comp").onclick=function(){setTab("compete")};return}
  var mini=/target|move/.test(TR.step),h=(mini?'':modeSeg())+trProg()+(mini?'':TR.step==="verdict"?'<p class="trk">'+(TR.sit.label||pr.name)+(state.wind!=="calm"?' · '+windWords():'')+'</p>':'');if(mini)h=trProg();
  if(TR.step==="read")h+=readHtml(TR.sit);
  else if(TR.step==="target")h+='<p class="trsub">'+SHOTS[TR.pick.shot].name+' <button class="lnk" id="tr-back">Change</button></p><h3 class="trq">Aim</h3><p class="trk suhint">Flick or tap. Curve = spin.</p>';
  if(TR.step==="shot")h+='<div class="trchips t7">'+VISIBLE.filter(function(v){return v!=="serve"}).map(function(id){var ic=ICON[id];return '<button data-v="'+id+'" aria-pressed="'+(TR.pick.shot===id)+'"><span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span><span>'+SHOTS[id].name+'</span></button>'}).join("")+'</div>'+
    '<div class="trss"><div class="seg" id="tr-spd">'+["slow","neutral","fast"].map(function(v){return '<button data-v="'+v+'" aria-pressed="'+(TR.pick.speed===v)+'">'+SPD_L[v]+'</button>'}).join("")+'</div><div class="trball">'+BALLSVG.replace(/id="sv-seam"/,'class="tr-seam"').replace(/id="sv-arrow"/,'class="tr-arrow"').replace(/svclip/g,"trclip")+'<span class="trspin">'+SPIN_LBL[TR.pick.spin]+'</span></div></div>';
  else if(TR.step==="move")h+='<h3 class="trq">Now move</h3><div class="trmoves">'+MOVES.map(function(m){return '<button data-v="'+m[0]+'">'+m[1]+'</button>'}).join("")+'</div>';
  else if(TR.step==="verdict"){var v=TR.v;h+='<h3 class="trq '+v.cls+'">'+v.head+'</h3><div class="trrows">'+v.rows.map(function(r){return '<span class="'+["no","mid","yes"][r[1]]+'"><i>'+["&#10007;","~","&#10003;"][r[1]]+'</i>'+r[0]+'</span>'}).join("")+'</div><p class="trline">'+v.line+'</p><details class="more"><summary>Why?</summary><div class="morein">'+v.more+'</div></details><button class="btn primary big" id="tr-next">'+(TR.i<TR.set.length-1?"Next":"See score")+'</button>'}
  t.innerHTML=h;cue(TR.done?null:TR.step==="read"?"rail":TR.step==="target"?"aim":null);
  if(!TR.done&&/read|target/.test(TR.step))shotRail(TR.pick.shot,function(id){TR.pick.shot=id;sfx("pick",{shot:id});var first=TR.step==="read";TR.step="target";if(first)trainAimOn();trainTray()});else railOff();
  [].forEach.call(t.querySelectorAll(".trchips button"),function(b){b.onclick=function(){TR.pick.shot=b.dataset.v;sfx("pick",{shot:b.dataset.v});[].forEach.call(t.querySelectorAll(".trchips button"),function(x){x.setAttribute("aria-pressed",String(x===b))});if(TR.step==="shot"){TR.step="target";trainAimOn();trainTray();setTimeout(function(){trScroll("court")},60)}}});
  if($("tr-go"))$("tr-go").onclick=function(){TR.step="shot";trainTray();setTimeout(function(){trScroll("tray")},60)};
  [].forEach.call(t.querySelectorAll("#tr-spd button"),function(b){b.onclick=function(){TR.pick.speed=b.dataset.v;[].forEach.call(t.querySelectorAll("#tr-spd button"),function(x){x.setAttribute("aria-pressed",String(x===b))})}});
  var bs=t.querySelector(".trball svg");if(bs){var st0=null,ar=t.querySelector(".tr-arrow"),lb=t.querySelector(".trspin"),seam=t.querySelector(".tr-seam"),setS=function(v){TR.pick.spin=v;lb.textContent=SPIN_LBL[v];seam.setAttribute("transform","rotate("+{flat:0,top:-60,slice:60,left:-90,right:90}[v]+")")};setS(TR.pick.spin);
    bs.addEventListener("pointerdown",function(e){st0=[e.clientX,e.clientY];bs.setPointerCapture(e.pointerId);e.preventDefault()});
    bs.addEventListener("pointermove",function(e){if(!st0)return;var dx=e.clientX-st0[0],dy=e.clientY-st0[1],r=bs.getBoundingClientRect(),k=100/r.width;ar.setAttribute("x2",(dx*k).toFixed(1));ar.setAttribute("y2",(dy*k).toFixed(1));ar.setAttribute("opacity",Math.hypot(dx,dy)>6?0.8:0);
      if(Math.hypot(dx,dy)>=24)setS(Math.abs(dx)>Math.abs(dy)?(dx<0?"left":"right"):(dy<0?"top":"slice"))});
    bs.addEventListener("pointerup",function(){st0=null;ar.setAttribute("opacity",0)});
    bs.addEventListener("keydown",function(e){var k={ArrowUp:"top",ArrowLeft:"left",ArrowRight:"right",ArrowDown:"slice",Enter:"flat"}[e.key];if(k){e.preventDefault();setS(k)}})}
  [].forEach.call(t.querySelectorAll(".trmoves button"),function(b){b.onclick=function(){trainMove(b.dataset.v)}});
  if($("tr-back"))$("tr-back").onclick=function(){TR.step="read";TR.pick.shot=null;clearAim();trainTray()};
  if($("tr-next"))$("tr-next").onclick=function(){if(TR.i<TR.set.length-1){TR.i++;trainScene()}else{TR.done=true;gM.innerHTML="";clearAim();trainTray()}}}
function trainAimOn(){drawAim(function(cell){if(TR.step!=="target"||!TR.pick.shot)return;TR.pick.cell=cell;ripple(cell[0],cell[1]);buzz(10);TR.step="move";trainMoveOn();trainTray()},null)}
function trMovePos(mv){var c=TR.sp.contact;return [Math.max(0.6,Math.min(7.4,c[0]-0.3+{in:1.4,hold:0,back:-1.2}[mv])),TR.sp.pos[state.side][1]]}
function trainMoveOn(){gM.innerHTML="";MOVES.forEach(function(m){var p=trMovePos(m[0]),g=el("g",{"class":"trspot",tabindex:"0",role:"button","aria-label":m[1]},gM);
  el("circle",{cx:X(p[0]),cy:Y(p[1]),r:16,fill:"#FFFFFF","fill-opacity":0.85,stroke:"#0D1B2A","stroke-width":2,"stroke-dasharray":"4 4"},g);g.addEventListener("click",function(){trainMove(m[0])})})}
function trainMove(mv){if(TR.step!=="move")return;TR.pick.move=mv;var p=trMovePos(mv);PL[state.side].g.style.transitionDuration="600ms";place(state.side,p,false);gM.innerHTML="";trainJudge()}
function firstSentence(t){t=String(t||"");var i=t.indexOf(". ");return i>0?t.slice(0,i+1):t}
function trainJudge(){var sit=TR.sit,a=TR.ans,p=TR.pick,ti=shotTiers(sit,a.shot)[p.shot],shotOk=ti===2,shotMid=ti===1,aimT=aimTier(p.cell,p.shot,sit,p.speed),
    mvKey=shotOk?p.shot:a.shot,moveOk=p.move===MOVE_OK[mvKey],ss=ssVerdict(p.shot,p.speed,p.spin,sit),sc=(shotOk?1:shotMid?.5:0)+(aimT===0?1:aimT===1?.5:0)+(moveOk?1:0)+(ss.ok?.5:ss.part?.25:0),
    r=sc>=3.1?"good":sc>=2&&ti>=1?"ok":"bad",aw=aimScore(p.cell,p.shot,sit,p.speed).why,I0=idealSS(a.shot,sit),bss=ssVerdict(a.shot,I0.sp[0],I0.sn[0],sit).best,
    line=!shotOk?"Best: "+SHOTS[a.shot].name.toLowerCase()+". "+firstSentence(a.why):aimT!==0?(aimT===1?"The ring was safer.":(aw?firstSentence(aw):"Aim inside the lines.")):!moveOk?(MOVE_OK[mvKey]==="in"?"Now step in together.":MOVE_OK[mvKey]==="back"?"Now move back.":"Now hold level."):!ss.ok?firstSentence(ss.text):"Right shot, target and spot.";
  TR.res[TR.i]=r;TR.v={cls:r,head:{good:"Spot on",ok:"Close",bad:"Not this time"}[r],line:line,rows:[["Shot",shotOk?2:shotMid?1:0],["Target",aimT===0?2:aimT===1?1:0],["Speed and spin",ss.ok?2:ss.part?1:0],["Move",moveOk?2:0]],
    more:'<p><b>Shot.</b> '+(p.shot===a.shot?"Right shot.":shotOk?"Also good.":shotMid?"Playable. Better: "+SHOTS[a.shot].name.toLowerCase()+".":SHOTS[a.shot].name+" it.")+' '+a.why+'</p>'+
      '<p><b>Speed and spin.</b> '+(shotOk?ss.text:'For a '+SHOTS[a.shot].name.toLowerCase()+': '+bss.toLowerCase()+'.')+'</p>'+
      '<p><b>Target.</b> '+(aimT===0?"Great target.":aimT===1?"OK. The ring was safer.":"Risky. "+(aw||""))+'</p>'+
      '<p><b>Position.</b> '+(moveOk?"Good.":SHOTS[mvKey].name+", then "+(MOVE_OK[mvKey]==="in"?"step in.":MOVE_OK[mvKey]==="back"?"move back.":"hold level."))+'</p>'};
  track("train_scenario",{preset:PRESETS[TR.set[TR.i]].name,shot:p.shot,answer:a.shot,result:r});TR.step="verdict";
  var pr=PROF[p.shot]||PROF.neutral;PROF._me={d:pr.d,h:pr.h};runBall({f:TR.sp.contact,to:svTarget(p.cell),shot:"_me",spin:SV_ROT[p.speed]*(p.spin==="flat"?0.6:1.5)*(p.spin==="slice"?-1:1),curve:p.spin==="left"?-24:p.spin==="right"?24:0,land:true},true);
  setTimeout(function(){sfx(r==="good"?"win":r==="ok"?"ok":"lose",{shots:r==="good"?[p.shot]:[]})},500);trainVerdictDraw();trainTray();setTimeout(function(){trScroll("tray")},700)}
function trainVerdictDraw(){var p=TR.pick,a=TR.ans;drawAim(function(){},null);heatAim(p.cell,{shot:p.shot,sit:TR.sit},p.speed);
  var bc=svTarget(a.cell5);el("circle",{cx:X(bc[0]),cy:Y(bc[1]),r:22,fill:"none",stroke:"#00C2B8","stroke-width":4,"pointer-events":"none"},gM);
  var mk=MOVE_OK[shotTiers(TR.sit,a.shot)[p.shot]===2?p.shot:a.shot];if(mk!==p.move){var gp=trMovePos(mk),gs=52*PS,gh=el("g",{transform:"translate("+X(gp[0])+" "+Y(gp[1])+")"+(PORT?" rotate(90)":""),opacity:0.35,"pointer-events":"none"},gM);el("image",{href:avSrc(state.emoji),x:-gs/2,y:-gs/2,width:gs,height:gs},gh)}
  if(p.move)place(state.side,trMovePos(p.move),true)}
function trainRedraw(){if(state.tab!=="pick")return;if(TRMODE==="setup"){setupDraw();return}if(TRMODE==="replay"){autoDraw();return}if(TR)trainScene(true)}
renderPick=trainRedraw;

/* ---------------- Train, Set up: build any situation, the coach gives the best shot ---------------- */
var THEIR={push:{height:"med",speed:"fast"},flatsmash:{height:"low",speed:"fast"},hook:{height:"med",speed:"fast"},neutral:{height:"med",speed:"med"},lob:{height:"high",speed:"slow"},drop:{height:"low",speed:"slow"},dig:{height:"med",speed:"med"}};
var SU=null;
function setupInit(){var mL=state.side==="L";SU={their:"neutral",side:"fh",speed:"med",height:"med",A:[11.4,2.2],B:[11.4,5.8],me:[3.8,mL?2.6:5.4],mate:[3.8,mL?5.4:2.6]};
  try{var sv=JSON.parse(load("tr-setup","null"));if(sv&&sv.A)SU=sv}catch(e){}}
function setupSit(){var x=SU.me[0],hs=state.hand==="L"?-1:1,off=SU.side==="fh"?hs*0.8:SU.side==="bh"?-hs*0.8:0,
    sit={side:SU.side,speed:SU.speed,height:SU.height,depth:x>5.2?"front":x>2.3?"mid":"back",oA:SU.A.slice(),oB:SU.B.slice(),me0:SU.me.slice(),mate0:SU.mate.slice(),
      cxy:[Math.max(.4,Math.min(7.5,x+0.2)),Math.max(.3,Math.min(7.7,SU.me[1]+off))],shot:SU.their};
  sit.A=toGrid(sit.oA);sit.B=toGrid(sit.oB);return sit}
function setupOpen(){if(!SU)setupInit();setupDraw(true)}
var suT=null;function setupSoon(){clearTimeout(suT);suT=setTimeout(function(){save("tr-setup",JSON.stringify(SU));setupDraw(true)},120)}
function setupDraw(anim){if(!SU)setupInit();var sit=setupSit(),sp=sitPos(sit),a=solveSit(sit),I=idealSS(a.shot,sit),bs=ssVerdict(a.shot,I.sp[0],I.sn[0],sit).best,mv=MOVE_OK[a.shot];
  gG.innerHTML="";gM.innerHTML="";clearAim();drawZones(false);drawWind();
  ["A","B","L","R"].forEach(function(k){place(k,sp.pos[k],true)});
  var hk=sp.pos.A[0]<=sp.pos.B[0]?"A":"B",pm={};pm[hk]=SU.their;pm[state.side]=a.shot;setPoses(pm);
  drawAim(function(){},null);heatAim(null,{shot:a.shot,sit:sit},I.sp[0]);[].forEach.call(gA.querySelectorAll("*"),function(e){e.style.pointerEvents="none"});
  var bc=svTarget(a.cell5);el("circle",{cx:X(bc[0]),cy:Y(bc[1]),r:22,fill:"none",stroke:"#00C2B8","stroke-width":4,"pointer-events":"none"},gM);
  var c=sp.contact,mp=[Math.max(0.6,Math.min(7.4,c[0]-0.3+{in:1.4,hold:0,back:-1.2}[mv])),sp.pos[state.side][1]],gs=52*PS,gh=el("g",{transform:"translate("+X(mp[0])+" "+Y(mp[1])+")"+(PORT?" rotate(90)":""),opacity:0.3,"pointer-events":"none"},gM);
  el("image",{href:avSrc(state.emoji),x:-gs/2,y:-gs/2,width:gs,height:gs},gh);
  el("line",{x1:X(sp.pos[state.side][0]),y1:Y(sp.pos[state.side][1]),x2:X(mp[0]),y2:Y(mp[1]),stroke:"#0D1B2A","stroke-opacity":.4,"stroke-width":2.5,"stroke-dasharray":"2 6","stroke-linecap":"round","pointer-events":"none"},gM);
  if(anim){var endH={low:0.4,med:1.4,high:3.0}[sit.height],arc={fast:0.4,med:1.2,slow:2.2}[sit.speed];PROF._in={d:{fast:380,med:850,slow:1800}[sit.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
    var d=runBall({f:sp.pos[hk],to:c,shot:"_in",spin:{fast:2.4,med:1.0,slow:0.35}[sit.speed],trail:sit.speed},false);
    clearTimeout(SU.t2);SU.t2=setTimeout(function(){if(state.tab!=="pick"||TRMODE!=="setup")return;var pr=PROF[a.shot]||PROF.neutral;PROF._me={d:pr.d,h:pr.h};runBall({f:c,to:bc,shot:"_me",spin:SV_ROT[I.sp[0]]*(I.sn[0]==="flat"?0.6:1.5)*(I.sn[0]==="slice"?-1:1),curve:I.sn[0]==="left"?-24:I.sn[0]==="right"?24:0,land:true},true)},(RM?150:d)+500)}
  setupTray(a,bs,mv,sit)}
function setupTray(a,bs,mv,sit){var t=$("trtray");t.hidden=false;document.body.classList.add("trsu");document.body.classList.remove("trmin");document.body.classList.toggle("trmid",!SU.open);var tiers=shotTiers(sit,a.shot),also=Object.keys(tiers).filter(function(k){return tiers[k]===2&&k!==a.shot});
  var chips=function(id,opts,cur){return '<div class="seg sus" data-k="'+id+'">'+opts.map(function(o){return '<button data-v="'+o[0]+'" aria-pressed="'+(cur===o[0])+'">'+o[1]+'</button>'}).join("")+'</div>'};
  t.innerHTML=modeSeg()+
    '<div class="suans"><span class="trk">Best shot</span><h3 class="trq">'+SHOTS[a.shot].name+'</h3><p class="trline">'+bs+' to the '+cellName5(a.cell5).toLowerCase()+', then '+(mv==="in"?"step in.":mv==="back"?"move back.":"hold level.")+'</p>'+
      '<p class="trsub">'+firstSentence(a.why)+'</p>'+(also.length?'<p class="trk">Also good: '+also.map(function(k){return SHOTS[k].name}).join(", ")+'</p>':'')+'</div>'+
    '<button class="lnk sutog" id="su-tog">'+(SU.open?"Done":"Change &#9662;")+'</button>'+(SU.open?'':'<p class="trk suhint">Drag players.</p>')+(SU.open?
    '<div class="sugrp"><span class="trk">Their shot</span><div class="trchips t7 sut">'+VISIBLE.filter(function(v){return v!=="serve"}).map(function(id){var ic=ICON[id];return '<button data-v="'+id+'" aria-pressed="'+(SU.their===id)+'"><span class="si" style="background:'+ic.c+'"><svg viewBox="0 0 24 24" fill="none" stroke="'+ic.f+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ic.d+'</svg></span><span>'+SHOTS[id].name+'</span></button>'}).join("")+'</div></div>'+
    '<div class="sugrp"><span class="trk">Comes to your</span>'+chips("side",[["bh","Backhand"],["body","Body"],["fh","Forehand"]],SU.side)+'</div>'+
    '<div class="sugrp two"><div><span class="trk">Speed</span>'+chips("speed",[["slow","Slow"],["med","Neutral"],["fast","Fast"]],SU.speed)+'</div><div><span class="trk">Height</span>'+chips("height",[["low","Low"],["med","Mid"],["high","High"]],SU.height)+'</div></div>'+
    '<p class="trk suhint">Drag players.</p>':'');
  wireMode(t);$("su-tog").onclick=function(){SU.open=!SU.open;setupDraw(false)};
  [].forEach.call(t.querySelectorAll(".sut button"),function(b){b.onclick=function(){SU.their=b.dataset.v;var d=THEIR[SU.their];SU.speed=d.speed;SU.height=d.height;buzz(10);setupSoon()}});
  [].forEach.call(t.querySelectorAll(".sus"),function(g){var k=g.dataset.k;[].forEach.call(g.children,function(b){b.onclick=function(){SU[k]=b.dataset.v;setupSoon()}})})}
/* Drag anyone in Set up */
["A","B","L","R"].forEach(function(k){var g=PL[k].g,drag=false;
  function on(){return state.tab==="pick"&&TRMODE==="setup"&&SU}
  function toM(e){var pt=SVGC.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(WORLD.getScreenCTM().inverse()),x=(q.x-60)/40,y=(q.y-40)/40,opp=k==="A"||k==="B";
    return [opp?Math.max(8.4,Math.min(15.8,x)):Math.max(0.3,Math.min(7.6,x)),Math.max(0.3,Math.min(7.7,y))]}
  g.addEventListener("pointerdown",function(e){if(!on())return;drag=true;g.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation()});
  g.addEventListener("pointermove",function(e){if(!drag||!on())return;var p=toM(e);place(k,p,true);var key=k==="A"||k==="B"?k:(k===state.side?"me":"mate");SU[key]=p});
  g.addEventListener("pointerup",function(){if(!drag)return;drag=false;if(on())setupSoon()})});

/* Flick to hit (Train). Flick from you to where you want it. Where you let go is the target, how fast you flick is the pace,
   a curve in the flick is side spin, pulling back at the end is backspin, a fast straight flick is topspin. A tap on a square still works */
(function(){var pts=null,path=null;
  function mode(){if(state.tab==="pick"&&TRMODE==="quiz"&&TR&&!TR.done&&TR.step==="target"&&TR.pick.shot)return "train";var c=MATCH&&MATCH.cur;
    if(state.tab==="compete"&&c&&!c.done){if(c.srv==="me"&&c.sv&&!c.served&&c.serveCell)return "serve";if(c.atBall&&c.pick&&c.pick.shot&&!c.pick.cell&&c.pickCell)return "ret"}return null}
  function live(){return !!mode()}
  function apply(cell,speed,spin){var m=mode();if(!m)return;sfx("aim",{d:cell[0]});
    if(m==="train"){if(speed){TR.pick.speed=speed;TR.pick.spin=spin;TR.pick.flick=true}TR.pick.cell=cell;markAim(cell);ripple(cell[0],cell[1]);TR.step="move";railOff();trainMoveOn();trainTray()}
    else if(m==="serve"){var c=MATCH.cur;if(speed){c.sv.speed=speed;c.sv.spin=spin}c.serveCell(cell)}
    else{var c2=MATCH.cur;if(speed){c2.pick.speed=speed;c2.pick.spin=spin}c2.pickCell(cell)}}
  function cm(e){var pt=SVGC.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var q=pt.matrixTransform(WORLD.getScreenCTM().inverse());return [(q.x-60)/40,(q.y-40)/40]}
  SVGC.addEventListener("pointerdown",function(e){if(!live())return;pts=[{c:cm(e),x:e.clientX,y:e.clientY,t:performance.now()}];if(path)path.remove();
    path=el("polyline",{fill:"none",stroke:"#FF4D6D","stroke-width":5,"stroke-linecap":"round","stroke-linejoin":"round","stroke-opacity":0.75,"pointer-events":"none"},gM)});
  SVGC.addEventListener("pointermove",function(e){if(!pts||!live())return;pts.push({c:cm(e),x:e.clientX,y:e.clientY,t:performance.now()});
    if(pts.length===4){try{SVGC.setPointerCapture(e.pointerId)}catch(x){}}
    path.setAttribute("points",pts.map(function(p){return X(p.c[0]).toFixed(1)+","+Y(p.c[1]).toFixed(1)}).join(" "))});
  function end(){if(!pts)return;var P=pts;pts=null;var a=P[0],z=P[P.length-1],len=Math.hypot(z.x-a.x,z.y-a.y);
    if(len<24||!live()){if(path){path.remove();path=null}
      /* a tap on their half picks that square with the speed and spin you set */
      if(live()&&z.c[0]>8.2)apply([z.c[0]<11?0:z.c[0]<14?1:2,Math.max(0,Math.min(4,Math.floor(z.c[1]/1.6)))]);
      return}
    var x=z.c[0],y=z.c[1];if(x<8.2){if(path){path.remove();path=null}toast("Flick it over the net");return}
    var cell=[x<11?0:x<14?1:2,Math.max(0,Math.min(4,Math.floor(y/1.6)))],
      /* pace from the last part of the flick */
      k=Math.max(0,P.length-6),dt=Math.max(16,z.t-P[k].t),v=Math.hypot(z.x-P[k].x,z.y-P[k].y)/dt,speed=v>1.3?"fast":v>0.55?"neutral":"slow",
      dx=z.c[0]-a.c[0],dy=z.c[1]-a.c[1],L=Math.hypot(dx,dy)||1,dev=0;
    P.forEach(function(p){var d=((p.c[0]-a.c[0])*dy-(p.c[1]-a.c[1])*dx)/L;if(Math.abs(d)>Math.abs(dev))dev=d});
    var back=false;if(P.length>6){var q=P[P.length-4],r=P[P.length-1];back=((r.c[0]-q.c[0])*dx+(r.c[1]-q.c[1])*dy)<-0.05*L}
    var spin=back?"slice":Math.abs(dev)/L>0.12?(dev>0?"left":"right"):speed==="fast"?"top":"flat";
    setTimeout(function(){if(path){path.remove();path=null}},500);apply(cell,speed,spin)}
  SVGC.addEventListener("touchstart",function(e){if(live())e.preventDefault()},{passive:false});SVGC.addEventListener("touchmove",function(e){if(live())e.preventDefault()},{passive:false});
  SVGC.addEventListener("pointerup",end);SVGC.addEventListener("pointercancel",function(){pts=null;if(path){path.remove();path=null}})})();

/* ---------------- Replay: points you lost in Compete. Work out why ---------------- */
function lostList(){try{return JSON.parse(load("lost","[]"))||[]}catch(e){return []}}
function saveLost(r){try{var l=lostList();r.t=Date.now();l.unshift(JSON.parse(JSON.stringify(r)));save("lost",JSON.stringify(l.slice(0,12)))}catch(e){}}
var CAUSES=[["shot","Wrong shot"],["target","Risky target"],["position","Out of position"],["slow","Too slow"],["they","They played well"]];
function trueCauses(r){var o=[];if(r.kind==="far"||r.kind==="gap"||r.moveOk===false)o.push("position");if(r.kind==="slowrun"||r.kind==="late")o.push("slow");if(r.tier!=null&&r.tier<2)o.push("shot");if(r.aimT===2)o.push("target");if(!o.length)o.push("they");return o}
function trueCause(r){if(r.kind==="far"||r.kind==="gap")return "position";if(r.kind==="slowrun"||r.kind==="late")return "slow";
  if(r.tier!=null&&r.tier<2)return "shot";if(r.aimT===2)return "target";if(r.kind==="pressed"||r.kind==="miss")return r.moveOk===false?"position":"they";return "they"}
var AU={i:0,ans:null};
function autoOpen(){AU.i=0;AU.ans=null;autoDraw()}
function autoDraw(){var L=lostList(),t=$("trtray");document.body.classList.remove("trmin","trsu");document.body.classList.add("trmid");t.hidden=false;gG.innerHTML="";gM.innerHTML="";clearAim();drawZones(false);runBall(null);
  if(!L.length){t.innerHTML=modeSeg()+'<h3 class="trq">Lost points appear here</h3><button class="btn primary big" id="au-go">Play</button>';wireMode(t);$("au-go").onclick=function(){setTab("compete")};return}
  if(AU.i>=L.length)AU.i=0;var r=L[AU.i],sit=r.sit,sp=sitPos(sit);["A","B","L","R"].forEach(function(k){place(k,sp.pos[k],true)});
  var hk=sp.pos.A[0]<=sp.pos.B[0]?"A":"B",pm={};pm[hk]=sit.shot||oppPose(sit);if(r.pick.shot)pm[state.side]=r.pick.shot;setPoses(pm);
  var endH={low:0.4,med:1.4,high:3.0}[sit.height]||1.4,arc={fast:0.4,med:1.2,slow:2.2}[sit.speed]||1.2;PROF._in={d:{fast:380,med:850,slow:1800}[sit.speed]||850,h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  var d=runBall({f:sp.pos[hk],to:sp.contact,shot:"_in",trail:sit.speed},false);
  if(r.pick.shot&&r.pick.cell)setTimeout(function(){if(TRMODE!=="replay"||state.tab!=="pick")return;var pr=PROF[r.pick.shot]||PROF.neutral;PROF._me={d:pr.d,h:pr.h};runBall({f:sp.contact,to:svTarget(r.pick.cell),shot:"_me",land:true},true)},(RM?150:d)+400);
  if(r.pick.pos)setTimeout(function(){if(TRMODE==="replay"){PL[state.side].g.style.transitionDuration="700ms";place(state.side,r.pick.pos,false)}},(RM?150:d)+900);
  var lead='<p class="trk">Point '+(AU.i+1)+' of '+L.length+' · v '+esc(r.rival||"")+'</p>',what=r.pick.shot?'<p class="trsub">You played a '+SHOTS[r.pick.shot].name.toLowerCase()+(r.pick.cell?' to the '+cellName5(r.pick.cell).toLowerCase():'')+'.</p>':'<p class="trsub">You didn\'t reach the ball.</p>';
  if(AU.ans==null){t.innerHTML=modeSeg()+lead+'<h3 class="trq">Why did you lose it?</h3>'+what+'<div class="trmoves aucause">'+CAUSES.map(function(c){return '<button data-v="'+c[0]+'">'+c[1]+'</button>'}).join("")+'</div>';
    wireMode(t);[].forEach.call(t.querySelectorAll(".aucause button"),function(b){b.onclick=function(){AU.ans=b.dataset.v;track("autopsy",{answer:AU.ans,truth:trueCause(r)});autoDraw()}});return}
  var tc=trueCause(r),ok=AU.ans===tc||trueCauses(r).indexOf(AU.ans)>=0,best=r.ans,bc=svTarget(best.cell5);
  drawAim(function(){},null);heatAim(r.pick.cell||null,{shot:best.shot,sit:sit},"neutral");[].forEach.call(gA.querySelectorAll("*"),function(e){e.style.pointerEvents="none"});
  el("circle",{cx:X(bc[0]),cy:Y(bc[1]),r:22,fill:"none",stroke:"#00C2B8","stroke-width":4,"pointer-events":"none"},gM);
  var exp={shot:"A "+SHOTS[best.shot].name.toLowerCase()+" was the shot. "+(r.why||""),target:"The shot was fine, but the target was risky. The ringed square was safer.",position:r.kind==="far"?(r.gap||"Too many")+" m off. Recover level with your partner.":"Your position left a gap.",
    slow:"Go to the ball sooner.",they:"Right call. Keep making it."}[tc];
  t.innerHTML=modeSeg()+lead+'<h3 class="trq '+(ok?"good":"bad")+'">'+(ok?"Correct":"Not quite")+'</h3><p class="trline"><b>'+CAUSES.filter(function(c){return c[0]===tc})[0][1]+'.</b> '+esc(exp)+'</p><p class="trsub">Best play: '+SHOTS[best.shot].name+' to the '+cellName5(best.cell5).toLowerCase()+'.</p><div class="trbtns"><button class="btn primary big" id="au-next">'+(AU.i<L.length-1?"Next point":"Start again")+'</button><button class="lnk" id="au-del">Remove this point</button></div>';
  wireMode(t);sfx(ok?"ok":"lose");$("au-next").onclick=function(){AU.i=(AU.i+1)%L.length;AU.ans=null;autoDraw()};
  $("au-del").onclick=function(){var l=lostList();l.splice(AU.i,1);save("lost",JSON.stringify(l));AU.ans=null;autoDraw()}}

/* ---------------- Home ---------------- */
function progCard(){var h=histList();if(!h.length)return "";var last=h.slice(-8),L=last[last.length-1],w=120,hh=28,mx=100,
    pts=last.map(function(x,i){return (last.length===1?w/2:i*w/(last.length-1)).toFixed(1)+","+(hh-x.acc/mx*hh).toFixed(1)}).join(" "),er=L.n?Math.round(L.early/L.n*100):0;
  return '<button class="hcard prog" id="h-prog"><b>Your progress</b><svg viewBox="-4 -4 '+(w+8)+' '+(hh+8)+'" aria-hidden="true"><polyline points="'+pts+'" fill="none" stroke="#00C2B8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><small>Accuracy '+L.acc+'% · early '+er+'% · '+h.length+' match'+(h.length>1?"es":"")+'</small></button>'}
function renderHome(){var h=$("home"),bt=beaten(),nx=0;for(var j=0;j<RIVALS.length;j++){if(rivalOpen(j)&&!bt[RIVALS[j].id]){nx=j;break}nx=j}var r=RIVALS[nx],won=Object.keys(bt).length,
    sid=load("id-shots","serve"),sh=SHOTS[sid]||SHOTS.serve,best=+load("tr-best","0")||0,L=lostList().length,nm=state.name?esc(state.name.split(" ")[0]):"";
  h.innerHTML='<div class="hhero"><div class="hh-top"><span>'+(nm||"")+'</span><span class="hdots" aria-label="'+won+' of 5 pairs beaten">'+RIVALS.map(function(x){return '<i class="'+(bt[x.id]?"on":"")+'"></i>'}).join("")+'</span></div>'+
    '<div class="hh-vs"><span class="rav big">'+avImg(state.emoji)+avImg(state.mate)+'</span><b>vs</b><span class="rav big">'+avImg(rAv(r,0))+avImg(rAv(r,1))+'</span></div>'+
    '<h2>'+r.pair+'</h2><button class="btn hbtn" id="h-play">Play</button></div>'+
    '<div class="hgrid'+(L?'':' three')+'"><button class="hcard" id="h-calls"><b>Shot quiz</b><small>'+(best?"Pick the best shot · best "+best+"/5":"Pick the best shot")+'</small></button>'+
    '<button class="hcard" id="h-learn"><b>Learn the '+sh.name.toLowerCase()+'</b><small>When and how to play it</small></button>'+
    (L?'<button class="hcard" id="h-replay"><b>Your lost points</b><small>See what went wrong · '+L+'</small></button>':'')+
    '<button class="hcard" id="h-setup"><b>Ask the coach</b><small>Set a situation, get the best shot</small></button>'+progCard()+'</div>'+
    '';
  $("h-play").onclick=function(){setTab("compete");startMatch(r)};
  $("h-calls").onclick=function(){TRMODE="quiz";save("tr-mode","quiz");TR=null;setTab("pick")};
  $("h-learn").onclick=function(){setTab("shots")};
  if($("h-prog"))$("h-prog").onclick=function(){setTab("compete")};
  if($("h-replay"))$("h-replay").onclick=function(){TRMODE="replay";save("tr-mode","replay");setTab("pick")};
  $("h-setup").onclick=function(){TRMODE="setup";save("tr-mode","setup");setTab("pick")};
  [].forEach.call(h.querySelectorAll(".hshots button"),function(b){b.onclick=function(){save("id-shots",b.dataset.v);setTab("shots")}})}
/* Analytics: session start */
(function(){var last=+load("last-visit","0"),now=Date.now();track("session_start",{returning:!!last,days_since_last:last?Math.round((now-last)/864e5):null});save("last-visit",String(now))})();
/* Deep links: #/shots/lob/2, #/play/lobcover/1, #/pick */
var HASH0=location.hash||"",DEEP_ID=null,hp=HASH0.replace(/^#\/?/,"").split("/"),startStep=0;
if(hp[0]==="shots"&&VISIBLE.indexOf(hp[1])>=0){state.tab="shots";save("id-shots",hp[1]);startStep=(+hp[2]||1)-1}
else if((hp[0]==="play"||hp[0]==="shots")&&SCENES[hp[1]]){state.tab="shots";DEEP_ID=hp[1];save("id-shots",hp[1]);startStep=(+hp[2]||1)-1}
else if(hp[0]==="pick"||hp[0]==="train")state.tab="pick";
else if(hp[0]==="compete")state.tab="compete";
setTab(HASH0?(["pick","compete"].indexOf(state.tab)>=0?state.tab:"shots"):"home");orient();
if(startStep>0&&state.tab==="shots"&&startStep<scene.steps.length){state.step=startStep;["A","B","L","R"].forEach(function(k){place(k,posAt(startStep)[k],true)});renderStep()}
/* First visit welcome */
if(!load("welcomed","")&&!HASH0){var wv={side:"L",rules:"open",level:"beginner",emoji:state.emoji};$("welcome").hidden=false;
  emojiGrid($("w-emo"),function(){return wv.emoji},function(e){wv.emoji=e},function(){return ""});
  ["side","rules","level"].forEach(function(k){[].forEach.call($("w-"+k).children,function(b){b.onclick=function(){wv[k]=b.dataset.v;[].forEach.call($("w-"+k).children,function(x){x.setAttribute("aria-pressed",String(x===b))})}})});
  var closeW=function(skip){save("welcomed","1");$("welcome").hidden=true;
    if(!skip){state.side=wv.side;state.rules=wv.rules;save("side",wv.side);save("rules",wv.rules);state.level=wv.level;save("level",wv.level);state.emoji=wv.emoji;save("emoji",wv.emoji);
      seg("seg-side","side");seg("seg-rules","rules");seg("seg-level","level");setSum();save("id-shots","serve");setTab("compete");startMatch(RIVALS[0])}
    track("onboarding_completed",{side:wv.side,rules:wv.rules,level:wv.level,skipped:!!skip,lang:navigator.language})};
  $("w-go").onclick=function(){closeW(false)};$("w-skip").onclick=function(){closeW(true)}}

/* ---------- Play vs the computer: the 3D game (play3d/) lives inside the Play tab ---------- */
var P3Q=null,P3READY=false,P3D_V="0.9";
function p3dOn(){return load("p3d","1")!=="0"}
function p3dFrame(){var f=$("p3d-frame");if(!f){f=document.createElement("iframe");f.id="p3d-frame";f.title="Beach tennis 3D";f.setAttribute("allow","fullscreen; autoplay");
    f.src=(window.P3D_URL||"play3d.html")+"?embed=1&v="+P3D_V+"&level="+encodeURIComponent(state.level||"intermediate");$("play3d").appendChild(f)}return f}
function p3dPost(m){var f=p3dFrame();m.btu3d=1;if(!P3READY){P3Q=m;return}try{f.contentWindow.postMessage(m,"*")}catch(e){}}
function p3dSize(){var s=$("play3d");if(!s||s.hidden||document.body.classList.contains("p3d-live"))return;var top=s.getBoundingClientRect().top+window.scrollY;s.style.height=Math.max(420,window.innerHeight-top-12)+"px"}
function p3dShow(){window.scrollTo(0,0);p3dFrame();p3dSize();p3dPost({type:"level",level:state.level});track("play3d_open",{})}
function p3dLive(on){document.body.classList.toggle("p3d-live",!!on);window.scrollTo(0,0);if(!on)setTimeout(p3dSize,30)}
function p3dStart(r){var i=RIVALS.indexOf(r);p3dPost({type:"start",level:state.level,rival:r?{name:r.pair,lv:i>=0?i+1:1}:null});track("match_started",{rival:r&&r.id,mode:"3d"})}
window.addEventListener("message",function(e){var m=e.data;if(!m||!m.btu3d)return;
  if(m.type==="ready"){P3READY=true;var l=$("p3d-load");if(l)l.remove();if(P3Q){var q=P3Q;P3Q=null;p3dPost(q)}}
  if(m.type==="live")p3dLive(m.on);
  if(m.type==="nav"){p3dLive(false);setTab(m.tab==="learn"?"learn":"home")}});
window.addEventListener("resize",p3dSize);
(function(){var sm=startMatch;startMatch=function(r){if(p3dOn()&&state.tab==="compete"){p3dStart(r);return}return sm.apply(this,arguments)}})();
