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
  start:{L:[1.2,2.6],R:[-0.9,6.3],A:[11.6,2.6],B:[11.6,5.6]}, startAlt:{open:{L:[4.4,2.6]}},
  to:[11.6,5.7],mark:true, react:{L:[2.8,2.6],R:[1.6,5.7]}, reactAlt:{open:{L:[5.2,2.6]}},
  after:{L:[4.4,2.7],R:[4.2,5.3],A:[10,2.7],B:[10,5.4]},
  what:"Overhead from behind the baseline. There is no second serve, so pick a target you can hit every time.",
  when:"Every point you serve.",
  aim:"Zone 2, at the receiver's body or backhand hip. Mix in zones 4 and 1 so they can't settle.",
  avoid:"Going for aces with no margin. A fault loses the point.",
  hitDo:"Serve at the receiver's body or backhand (zone 2), then follow it in.",
  partnerDo:"Start moving forward the moment the serve is struck.",
  afterH:"Settle at 4–5 m on your side and split step as they return.",
  afterP:"Settle at 4–5 m, level with your partner, about 3 m apart."},
dig:{name:"Block",cat:"Defence",hitter:"R",
  start:{L:[4.4,2.6],R:[4.4,5.5],A:NET.A,B:NET.B},
  to:[14.2,6.3],mark:true, react:{A:[11.0,3.0],B:[12.6,5.9]}, after:{L:[4.6,2.7],R:[4.6,5.3]},
  what:"A short, firm swing with a stable racket face. You block a hard ball back rather than swing at it. It appeared in almost every pro rally.",
  when:"An opponent pushes or smashes hard at your feet or body.",
  aim:"Long over them, deep. Or straight down the line at medium height. Either way they don't get an easy smash.",
  avoid:"Blocking short: they're waiting at the net, so leave that to very advanced players. Popping it up mid-court. Trying to lob a hard smash, which is very difficult.",
  hitDo:"Firm wrist, short swing. Send it long over them, or straight at medium height.",
  partnerDo:"Shade towards the middle, racket up, ready for the next ball.",
  afterH:"If your block goes deep and they turn, step in a pace together. If it sits up, hold and get ready.",
  afterP:"Hold 4–5 m, level. Step in with your partner only when they're turning back."},
neutral:{name:"Neutral ball",cat:"Defence",hitter:"R",
  start:{L:[4.4,2.6],R:[4.4,5.4],A:NET.A,B:NET.B},
  to:[14.2,6.6],mark:true, react:{A:[12.0,3.2],B:[13.4,6.2]}, after:{L:[4.6,2.7],R:[4.6,5.3]},
  what:"A gentle, floating ball with height and depth. It buys time and resets the rally.",
  when:"You're under pressure, off balance, or hitting from below net height.",
  aim:"Deep, to a backhand. Against two right-handers that's the outside of B (their left-side player) or the middle side of A.",
  avoid:"Playing it when the ball is high near the net and you could attack.",
  hitDo:"Lift it deep onto a backhand, high enough that they can't attack it.",
  partnerDo:"Get back level with your partner.",
  afterH:"Recover to 4–5 m and split step.",
  afterP:"Same: 4–5 m, level, middle covered."},
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
  start:{L:[6.2,2.8],R:[6.3,5.3],A:[12.4,2.6],B:[12.5,5.4]},
  to:[12.6,5.6],mark:true, react:{A:[12.4,3.2],B:[12.7,5.6]}, after:{L:[7.0,3.0],R:[7.0,5.0]},
  what:"A flatter, faster ball hit forward and slightly down from net height.",
  when:"The ball reaches you at or above net height, 2–4 m from the net.",
  aim:"At a backhand, at the body (feet or hip), or down the middle.",
  avoid:"Pushing a ball from below net height. It goes up and gets smashed.",
  hitDo:"Hit down at the body or backhand of the player in front of you, or down the middle.",
  partnerDo:"Hold the middle, racket up.",
  afterH:"If they have to block from low, step in a pace together to 2.5–3 m. If they're balanced, hold.",
  afterP:"Step in with your partner, level, 2–3 m apart."},
flatsmash:{name:"Flat smash",cat:"Attack",hitter:"L",
  start:{L:[5.6,2.9],R:[5.8,5.3],A:DEEP.A,B:DEEP.B},
  to:[12.2,4.1],mark:true, react:{A:[12.3,3.5],B:[12.3,4.7]}, after:{L:[6.8,3.0],R:[6.8,5.0]},
  what:"A hard, flat overhead hit down.",
  when:"The ball is above your head, you're balanced, and you're within about 5 m of the net.",
  aim:"Down the middle between them, at their feet, or at a body.",
  avoid:"Smashing flat from deep. Use a recovery smash there.",
  hitDo:"Hit down, through the ball, into the middle.",
  partnerDo:"Hold your side and the middle.",
  afterH:"If the reply is weak, step in together. If it's a lob, recover.",
  afterP:"Step in level with your partner and split step as they hit."},
brush:{name:"Brush smash",cat:"Attack",hitter:"R",
  start:{L:[5.8,2.8],R:[5.8,5.4],A:[12.5,2.6],B:[12.5,5.4]},
  to:[12.6,0.6],mark:true, react:{A:[12.6,1.1],B:[12.3,4.2]}, after:{L:[6.3,3.4],R:[6.3,5.4]},
  what:"A smash with brush and spin, so it dips and kicks away. More control and angle than a flat smash.",
  when:"The ball is slightly lower or behind you, or you want a wide angle.",
  aim:"Wide (zone 5) or short at the feet.",
  avoid:"Hitting it long and flat. The spin is what keeps it in.",
  hitDo:"Brush up the back of the ball and angle it wide.",
  partnerDo:"Shift towards the middle: the reply comes back through the middle.",
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
  start:{L:[4.6,2.6],R:[4.8,5.5],A:[13.6,2.7],B:[13.5,5.4]},
  to:[9.3,5.4],mark:true, react:{A:[12.5,3.6],B:[10.2,5.3]}, after:{L:[5.0,2.9],R:[5.4,5.2]},
  what:"A soft ball that lands inside the opponents' 3 m line.",
  when:"The player you drop to is mid-court or deep (often after your lob), off balance, or tired. Never drop to a player at their 3 m line or closer, but you can drop to their partner if the partner is back.",
  aim:"Straight and short, towards the deeper player.",
  avoid:"Dropping to a player at their 3 m line or closer: they get to it early and put it away. A cross-court drop opens the line on your partner.",
  hitDo:"Soft hands, land it close to the net.",
  partnerDo:"Hold your lane and step in a little. Watch for the lift.",
  afterH:"Follow in one step to about 4 m, not all the way, and split step.",
  afterP:"Stay level a step in. The lift usually comes straight or high cross-court: smash it."},
lob:{name:"Lob",cat:"Touch and lobs",hitter:"L",
  start:{L:[4.4,2.6],R:[4.4,5.4],A:NET.A,B:NET.B},
  to:[14.8,7.0], react:{A:[11.0,4.0],B:[14.0,6.4]}, after:{L:[6.4,2.9],R:[6.4,5.1]},
  what:"A high ball over the net player, aimed over their left shoulder (the backhand side of a right-hander).",
  when:"Opponents are close to the net, or you need time.",
  aim:"Deep, over the left shoulder of the net player.",
  avoid:"Short or flat lobs: they become easy smashes. Lobbing straight off a hard smash is very difficult, so block that instead.",
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
guide:{name:"Court guide",cat:"Basics",
  init:{L:[4.4,2.6],R:[4.4,5.4],A:DEEP.A,B:DEEP.B},
  steps:[
  {t:"The court",say:"16 m long, 8 m wide, net in the middle. The dashed line 3 m from the net on each side is out of bounds for everyone until the serve is struck. In men's pro events the server's partner must also start behind the 6 m line.",
   L:"You play the left side. Two right-handers: your forehand faces the middle, so the middle ball is usually yours.",
   R:"You play the right side. Your forehand is on the sideline and your backhand faces the middle."},
  {t:"Target zones",zones:true,say:"Serving from the right side, the opponents' half splits into five lanes: 1 down the line, 2 at the near opponent, 3 the middle, 4 at the other opponent, 5 wide cross-court. Serving from the left flips the numbers.",
   L:"When you serve from the left, zone 1 is your sideline (the top here).",R:"When you serve from the right, zone 1 is your sideline (the bottom here)."},
  {t:"Reading the pictures",ball:{f:[4.4,5.4],to:[12.6,5.6],shot:"push"},pos:{R:[5.6,5.3],L:[5.6,2.9]},
   say:"Blue is your team and the ring marks you. Coral is the opponents. The ball grows as it rises and the dashed line is its path. Arrows show where each player moves next.",
   L:"Pick Left or Right at the top and every play shows your job.",R:"Pick Left or Right at the top and every play shows your job."}
  ]},
serving:{name:"Serve and the third ball",cat:"Basics",zoneSide:"R",
  init:{L:[1.2,2.6],R:[-0.9,6.3],A:[11.6,2.6],B:[11.6,5.6]}, initAlt:{open:{L:[4.4,2.6]}},
  steps:[
  {t:"Set up",zones:true,say:"Server behind the baseline. In men's pro events the partner waits behind the 6 m line until the serve is struck (in women's and social play, behind the 3 m line). The receivers start just behind their 3 m line.",
   L:"You're the partner. Stand left of centre behind the line, weight forward, ready to go on the serve.",
   R:"You're serving from behind the baseline on the right. Pick your target before the toss: zone 2, at the receiver's body."},
  {t:"The serve: spin and dip",ball:{f:[-0.9,6.3],to:[11.7,5.75],shot:"serve"},mark:true,pos:{R:[1.6,5.7],L:[2.8,2.7]},alt:{open:{L:[4.6,2.7]}},
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
    say:"The most common return: low and hard at the server's feet as they come in. The receivers follow it to the net.",
    R:"Stop, get low, racket head down.",L:"Shade towards the middle, racket up."},
   {t:"Block it long over them",ball:{f:[3.9,5.3],to:[14.2,6.2],shot:"dig"},mark:true,pos:{A:[11.2,3.0],B:[12.8,5.8]},
    say:"Don't swing and don't block it short: they're waiting at the net. Block it long over them, onto B's backhand, or straight at medium height so they don't get an easy smash.",
    R:"Firm block, long over them.",L:"Ready for their next ball."},
   {t:"Settle and wait for a high ball",pos:{L:[4.4,2.8],R:[4.4,5.2]},
    say:"They've had to turn and go back. Settle level at 4–5 m. Attack only when you get a ball above the net.",
    R:"Level with your partner on your side.",L:"Level with your partner, middle covered."}]},
  {label:"Drop shot to the server",steps:[
   {t:"Drop in front of the server",ball:{f:[11.6,5.6],to:[6.9,5.2],shot:"drop"},pos:{L:[4.4,3.8],A:[10.4,2.8],B:[10.6,5.2]},
    say:"The returner plays short in front of the server, and both receivers follow it in. The partner slides towards the middle and stays a step back, because the lob is the danger now.",
    R:"Read it early. It's yours.",L:"Slide to the middle, a step back."},
   {t:"Run in and lob over A's backhand",pre:{R:[6.9,5.2]},ball:{f:[6.9,5.2],to:[14.6,2.4],shot:"lob"},pos:{R:[4.6,5.1],L:[4.4,2.8],A:[13.9,2.5],B:[11.6,4.4]},
    say:"The server sprints in and lifts a lob just over A's left shoulder, onto their backhand. Keep it on A's side, not the middle, so B is too far away to cut across and smash it. A has to turn and chase it back on the backhand. If you get there early and the ball is above the net, push it at their feet instead.",
    R:"Sprint in, lob over A's backhand shoulder, then backpedal straight away to level.",L:"Slide back to your side as the lob goes up, level with your partner."},
   {t:"Their reply floats up",ball:{f:[13.9,2.5],to:[4.8,3.6],shot:"highlob"},pos:{L:[4.6,3.3],R:[4.8,5.0],A:[13.0,2.8],B:[11.8,4.6]},
    say:"Chasing back on the backhand, A can usually only float it back high. You're level at 4–5 m and ready. Whoever has it on the forehand calls it and smashes.",
    R:"Hold your side, ready to cover.",L:"Middle ball on your forehand: call it and smash."}]},
  {label:"Drop shot to the partner",steps:[
   {t:"Drop in front of the partner",ball:{f:[11.6,5.6],to:[6.9,2.7],shot:"drop"},pos:{R:[4.4,4.2],A:[10.6,2.8],B:[10.4,5.2]},
    say:"Short in front of the partner, and both receivers follow it in. Same rule, mirrored: the server slides to the middle, a step back.",
    R:"Slide to the middle, a step back for the lob.",L:"Read it early. It's yours."},
   {t:"Run in and lob over A's backhand",pre:{L:[6.9,2.7]},ball:{f:[6.9,2.7],to:[14.6,2.4],shot:"lob"},pos:{L:[4.6,2.9],R:[4.4,5.2],A:[13.9,2.5],B:[11.6,4.4]},
    say:"The partner sprints in from behind the 3 m line and lifts the lob just over A's left shoulder, onto their backhand. Don't float it to the middle: that gives B time to come across and smash. A has to turn and chase it on the backhand. Early and above the net: push at their feet instead.",
    R:"Slide back to your side as the lob goes up.",L:"Sprint in, lob over A's backhand shoulder, then backpedal straight away to level."},
   {t:"Their reply floats up",ball:{f:[13.9,2.5],to:[4.8,3.6],shot:"highlob"},pos:{L:[4.6,3.3],R:[4.8,5.0],A:[13.0,2.8],B:[11.8,4.6]},
    say:"Chasing back on the backhand, A can usually only float it back high. You're level at 4–5 m and ready. Whoever has it on the forehand calls it and smashes.",
    R:"Hold your side, ready to cover.",L:"Middle ball on your forehand: call it and smash."}]},
  {label:"Down the partner's line",steps:[
   {t:"Return down the partner's line",ball:{f:[11.6,5.6],to:[3.6,0.8],shot:"push"},pos:{L:[3.8,1.0],R:[4.0,4.1],A:[10.0,2.7],B:[10.2,5.3]},
    say:"The returner aims down the line on the partner's side while they're still moving in. This is why the partner protects their line first.",
    R:"Slide to the middle as your partner goes wide.",L:"Line first. Don't drift to the middle until the return is struck. Get low and block."},
   {t:"Block it straight",ball:{f:[3.8,1.0],to:[14.0,1.3],shot:"dig"},mark:true,pos:{A:[11.4,1.9],B:[10.8,4.6]},
    say:"Block it straight back down the line at medium height, past A and deep. Don't try to block it short: that's for very advanced players and usually gets put away.",
    R:"Hold the middle, racket up.",L:"Firm block, straight, medium height."},
   {t:"Reset",pos:{L:[4.4,2.8],R:[4.4,5.2]},
    say:"Back to level at 4–5 m, ready for their next push.",
    R:"Back to your side.",L:"Back to your side."}]},
  {label:"Neutral ball",steps:[
   {t:"A floating return",ball:{f:[11.6,5.6],to:[4.3,3.8],shot:"neutral"},pos:{L:[4.2,3.6],R:[4.3,5.2],A:[10.0,2.8],B:[10.2,5.3]},
    say:"A floating return with no pace. This is your team's best chance to take over the point.",
    R:"Hold your side, racket up.",L:"It's coming to the middle on your forehand: call it."},
   {t:"Hit down at them",ball:{f:[4.2,3.6],to:[10.0,4.1],shot:"flatsmash"},pos:{A:[10.0,3.5],B:[10.0,4.7]},
    say:"Above your head and within about 5 m: smash down into the middle or at their feet. Lower than that: push it at their feet.",
    R:"Watch the reply.",L:"Hit down into the middle."},
   {t:"Step in together",pos:{L:[5.4,3.0],R:[5.4,5.0]},
    say:"Your attack made them block from low, so step in a pace together and split step as they hit.",
    R:"Step in, level.",L:"Step in, level."}]},
  {label:"Lob",steps:[
   {t:"Lob over the partner",ball:{f:[11.6,5.6],to:[1.4,1.6],shot:"lob"},pos:{R:[4.4,4.1],A:[10.0,2.8],B:[10.2,5.2]},
    say:"The returner lobs over the partner's left shoulder while you're both moving in. The receivers follow it to the net.",
    R:"Don't follow. Step into the middle and slightly forward.",L:"Turn and chase. Call 'mine' early."},
   {t:"Chase it, recovery smash deep",pre:{L:[1.4,1.6]},ball:{f:[1.4,1.6],to:[13.6,4.0],shot:"recoverysmash"},pos:{L:[4.0,2.8],R:[4.4,5.2],A:[11.4,2.9],B:[11.4,5.1]},
    say:"Under it and balanced: recovery smash deep into the middle. Not balanced: a high recovery lob instead.",
    R:"Slide back to your side as the smash goes.",L:"Deep and safe into the middle, then run forward to level straight away."},
   {t:"Step in as they defend",pos:{L:[5.0,2.9],R:[5.0,5.1]},
    say:"Your deep smash makes them defend from the back, so you are level again at 4–5 m. Step in a pace together and split step as they hit.",
    R:"Step in, level.",L:"Step in, level."}]}
  ]},
receiving:{name:"Receiving: take the net",cat:"Basics",
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
   L:"It's coming to the middle on your forehand: yours.",R:"Hold your side, racket up."},
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
   say:"Now the other way. Same rule: hitter out, partner to the middle.",L:"Slide to the middle.",R:"Go out to the ball."},
  {t:"Reset",ball:{f:[4.7,7.1],to:[14.0,6.8],shot:"dig"},pos:{L:[4.5,2.7],R:[4.5,5.3],B:[11.4,5.8]},
   say:"Once the ball is back over, both return to level and centred on your own halves.",L:"Back to your side.",R:"Back to your side."}
  ],
  note:"Seen in almost every rally of the pro matches: the player away from the ball moves to the middle, and the pair keeps roughly 3 m between them."},
middle:{name:"Calling the middle ball",cat:"Basics",
  init:{L:[4.5,2.6],R:[4.5,5.4],A:NET.A,B:NET.B},
  steps:[
  {t:"The wrong way",ball:{f:[9.8,2.7],to:[4.6,4.0],shot:"push",land:true},pos:{L:[4.5,3.5],R:[4.5,4.5]},
   say:"A push down the middle. Both go for it: rackets clash, or both leave it. When this happened in the pro matches the defending team lost 3 points out of 4.",
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
   L:"Step in with your partner. It's coming to the middle: yours.",R:"Step in level and cover your side."},
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
   L:"It's coming to the middle on your forehand: take it.",R:"Step in level."},
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
   say:"Under it but deep: play a recovery smash deep into the middle. Placement, not power.",
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
  note:"Avoid the cross-court drop: the reply down the line goes straight at your partner's open side."},
fake:{name:"Disguise: fake lob, real drop",cat:"Tactics",
  init:{L:[5.0,2.7],R:[5.0,5.3],A:[11.6,2.7],B:[11.6,5.4]},
  steps:[
  {t:"Shape up for the lob",pos:{A:[12.8,2.8],B:[12.8,5.3]},
   say:"Same backswing as your lob. They read lob and drift back.",L:"Open the racket as if lobbing.",R:"Hold your lane."},
  {t:"Real drop",ball:{f:[5.0,2.7],to:[9.3,2.4],shot:"fakelob"},mark:true,pos:{A:[10.1,2.5],L:[5.7,2.9],R:[5.6,5.0]},
   say:"Soften at the last moment: a drop straight in front of you.",L:"Soft drop, then one step in.",R:"Step in level."},
  {t:"They lift it",ball:{f:[10.1,2.5],to:[6.0,3.4],shot:"dig"},
   say:"Just like the drop pattern, the lift comes up.",L:"It's yours, middle-left.",R:"Split step."},
  {t:"Finish",ball:{f:[6.0,3.3],to:[14.0,1.6],shot:"flatsmash",land:true},
   say:"Smash into the deep corner the drop pulled them out of.",L:"Into the deep corner.",R:"Hold your side."}
  ]},
stepin:{name:"After an attack: step in or hold?",cat:"Tactics",
  init:{L:[5.8,2.8],R:[6.0,5.2],A:[12.4,2.7],B:[12.5,5.4]},
  steps:[
  {t:"You attack",ball:{f:[6.0,5.2],to:[12.6,5.6],shot:"push"},pos:{B:[12.7,5.6]},
   say:"You push at their feet.",L:"Hold the middle.",R:"Push at their feet."},
  {t:"Weak reply: step in",ball:{f:[12.7,5.6],to:[7.0,4.3],shot:"dig"},pos:{L:[6.8,3.0],R:[6.8,5.0]},
   say:"They blocked from low and the ball is coming up. Step in together to 2.5–3 m and split step as it arrives.",
   L:"Step in level with your partner.",R:"Recover from the swing, then step in."},
  {t:"The other case: balanced defender",pos:{L:[5.8,2.8],R:[6.0,5.2],A:[12.0,2.9],B:[12.4,5.2]},
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
var state={tab:load("tab","shots"),side:load("side","L"),rules:load("rules","men"),zones:load("zones","0")==="1",id:null,step:0,playing:false,branch:null};
var scene=null,timer=null,raf=null,pkTimer=null,preTimer=null;

/* ---------------- Static court ---------------- */
var gC=document.getElementById("g-court"),gZ=document.getElementById("g-zones"),gL=document.getElementById("g-lines"),
    gM=document.getElementById("g-moves"),gT=document.getElementById("g-trail"),gP=document.getElementById("g-players"),gB=document.getElementById("g-ball");
el("rect",{x:X(0),y:Y(0),width:640,height:320,fill:"#F3DFAE",rx:4},gC);
el("rect",{x:X(0),y:Y(0),width:640,height:320,fill:"none",stroke:"#FFFFFF","stroke-width":4},gC);
function lbl(x,y,txt,anchor){var t=el("text",{x:x,y:y,"text-anchor":anchor||"middle",fill:"#FFFFFF",style:"font:700 12px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);t.textContent=txt;return t}
function vline(m,lb){var g=el("g",{},gL);el("line",{x1:X(m),y1:Y(0),x2:X(m),y2:Y(8),stroke:C.line,"stroke-width":2,"stroke-dasharray":"7 6"},g);
  var t=el("text",{x:X(m),y:28,"text-anchor":"middle",fill:"#FFFFFF",style:"font:700 12px Montserrat,system-ui,sans-serif;letter-spacing:.06em"},g);t.textContent=lb;return g}
vline(5,"3 m");vline(11,"3 m");var l6a=vline(2,"6 m"),l6b=vline(14,"6 m");
el("line",{x1:X(8),y1:Y(0)-10,x2:X(8),y2:Y(8)+10,stroke:C.net,"stroke-width":6,"stroke-linecap":"round"},gL);
lbl(X(8),28,"NET");lbl(X(4),386,"YOUR SIDE");lbl(X(12),386,"OPPONENTS");
var s1=el("text",{x:X(0.2),y:Y(0.45),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s1.textContent="LEFT SIDE";
var s2=el("text",{x:X(0.2),y:Y(7.75),fill:C.sandText,style:"font:700 11px Montserrat,system-ui,sans-serif;letter-spacing:.08em"},gL);s2.textContent="RIGHT SIDE";

function drawZones(show,side,half){gZ.innerHTML="";if(!show)return;var own=half==="own";
  for(var b=0;b<5;b++){var y0=b*1.6;
    el("rect",{x:X(own?0:8),y:Y(y0),width:320,height:64,fill:C.opp,"fill-opacity":b%2?0.2:0.08},gZ);
    var n=side==="L"?b+1:5-b;var t=el("text",{x:X(own?7.3:15.4),y:Y(y0+0.8)+7,"text-anchor":"middle",fill:"#B01E42",style:"font:800 20px Montserrat,sans-serif"},gZ);t.textContent=n}}

/* Players */
var COL={L:C.you,R:C.you,A:C.opp,B:C.opp},PL={};
["A","B","L","R"].forEach(function(id){var g=el("g",{"class":"pl"},gP);
  var ring=el("circle",{r:20,fill:"none",stroke:"#0D1B2A","stroke-width":3,opacity:0},g);
  el("circle",{r:14,fill:COL[id],stroke:"#FFFFFF","stroke-width":2.5},g);
  var t=el("text",{"text-anchor":"middle","dominant-baseline":"central",y:1,fill:"#FFFFFF",style:"font:800 12px Montserrat,system-ui,sans-serif"},g);t.textContent=id;
  PL[id]={g:g,ring:ring}});
function place(id,p,instant){var g=PL[id].g;if(instant){g.style.transition="none";}g.style.transform="translate("+X(p[0])+"px,"+Y(p[1])+"px)";
  if(instant){g.getBoundingClientRect();g.style.transition="";}}

/* Ball */
var tgt=el("ellipse",{rx:20,ry:16,fill:C.opp,"fill-opacity":0.28,opacity:0},gT);
var trail=el("line",{stroke:"#8A6A2A","stroke-width":2,"stroke-dasharray":"6 5",opacity:0},gT);
var land=el("circle",{r:11,fill:"none",stroke:C.oppDark,"stroke-width":3,opacity:0},gT);
var shadow=el("ellipse",{rx:5,ry:3,fill:"#000","fill-opacity":0.25,opacity:0},gB);
var ball=el("circle",{r:6,fill:C.ball,stroke:"#8A6A00","stroke-width":1.2,opacity:0},gB);

function runBall(b,mark){if(raf)cancelAnimationFrame(raf);land.setAttribute("opacity",0);
  if(!b){ball.setAttribute("opacity",0);shadow.setAttribute("opacity",0);trail.setAttribute("opacity",0);tgt.setAttribute("opacity",0);return 0}
  var p=PROF[b.shot]||PROF.neutral,d=RM?150:p.d*1.3;
  var fx=X(b.f[0]),fy=Y(b.f[1]),tx=X(b.to[0]),ty=Y(b.to[1]);
  trail.setAttribute("x1",fx);trail.setAttribute("y1",fy);trail.setAttribute("x2",fx);trail.setAttribute("y2",fy);trail.setAttribute("opacity",0.8);
  tgt.setAttribute("cx",tx);tgt.setAttribute("cy",ty);tgt.setAttribute("opacity",mark?1:0);
  ball.setAttribute("opacity",1);shadow.setAttribute("opacity",1);
  var t0=performance.now();
  function tick(now){var k=Math.max(0,Math.min((now-t0)/d,1)),x=fx+(tx-fx)*k,y=fy+(ty-fy)*k,h=Math.max(0,p.h(k));
    ball.setAttribute("cx",x);ball.setAttribute("cy",y);ball.setAttribute("r",(5+h*1.6).toFixed(1));
    shadow.setAttribute("cx",x);shadow.setAttribute("cy",y+2);trail.setAttribute("x2",x);trail.setAttribute("y2",y);
    if(k<1){raf=requestAnimationFrame(tick)}else if(b.land){land.setAttribute("cx",tx);land.setAttribute("cy",ty);land.setAttribute("opacity",1)}}
  raf=requestAnimationFrame(tick);return d}

function drawMoves(prev,cur){gM.innerHTML="";
  ["A","B","L","R"].forEach(function(id){var a=prev[id],b=cur[id];if(!a||!b)return;
    var dx=X(b[0])-X(a[0]),dy=Y(b[1])-Y(a[1]),len=Math.hypot(dx,dy);if(len<12)return;
    var ux=dx/len,uy=dy/len,opp=(id==="A"||id==="B");
    if(len>26)el("line",{x1:X(a[0])+ux*4,y1:Y(a[1])+uy*4,x2:X(b[0])-ux*18,y2:Y(b[1])-uy*18,stroke:opp?C.oppDark:C.you,"stroke-width":2.5,"marker-end":opp?"url(#ar-opp)":"url(#ar-you)"},gM)})}

/* ---------------- Scene building ---------------- */
function merge(a,b){var o={};for(var k in a)o[k]=a[k];if(b)for(var j in b)o[j]=b[j];return o}
/* The ball each shot is played from: [opponent who hits it, flight, description] */
var INC={
  dig:["B","inPush","An opponent at the net pushes hard at your feet."],
  neutral:["B","inLow","An opponent at the net pushes it at you. You're under pressure and the ball is below the net."],
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
function shotScene(id){var s=SHOTS[id],h=s.hitter,inc=INC[id],steps=[],init=s.start,initAlt=s.startAlt;
  var pre=null;
  if(inc){init=merge(s.start,{L:[4.4,2.7],R:[4.4,5.3]});initAlt=null;var p1=merge(s.start,null);delete p1[h];pre={};pre[h]=s.start[h];
    steps.push({t:"The ball comes in",ball:{f:s.start[inc[0]],to:s.start[h],shot:inc[1]},pos:p1,say:inc[2],
      roles:{hit:"Read where it's going and get ready to move.",partner:INCP[id]||"Adjust to cover the middle."}})}
  var rp=merge(s.react,null);["L","R"].forEach(function(k){if(!(k in s.react)&&s.after&&s.after[k]){var a=s.start[k],b=s.after[k];rp[k]=[a[0]+(b[0]-a[0])*0.6,a[1]+(b[1]-a[1])*0.6]}});
  steps.push({t:inc?"Move to it and play the shot":"Play the shot",pre:pre,ball:{f:s.start[h],to:s.to,shot:id},mark:s.mark,pos:rp,alt:s.reactAlt,say:s.what,roles:{hit:s.hitDo,partner:s.partnerDo}});
  steps.push({t:"After the shot",pos:s.after,say:"Where both players go next.",roles:{hit:s.afterH,partner:s.afterP}});
  return {name:s.name,cat:s.cat,shot:id,hitter:h,zoneSide:"R",init:init,initAlt:initAlt,steps:steps}}
function stepsOf(){return scene.branches&&state.branch!=null?scene.steps.concat(scene.branches[state.branch].steps):scene.steps}
function posAt(i){var p=merge(scene.init,scene.initAlt&&scene.initAlt[state.rules]),all=stepsOf();
  for(var n=0;n<=i;n++){var st=all[n];p=merge(p,st.pre);p=merge(p,st.pos);if(st.alt&&st.alt[state.rules])p=merge(p,st.alt[state.rules])}return p}
function initPos(){return merge(scene.init,scene.initAlt&&scene.initAlt[state.rules])}

/* ---------------- Rendering ---------------- */
var $=function(id){return document.getElementById(id)};
function renderList(){var list=$("list");list.innerHTML="";
  var groups=state.tab==="shots"?SHOT_GROUPS:SCEN_GROUPS,src=state.tab==="shots"?SHOTS:SCENES;
  groups.forEach(function(g){var h=document.createElement("div");h.className="glabel";var dot=document.createElement("i");dot.style.background=CATCOL[g[0]]||"var(--turq)";h.appendChild(dot);h.appendChild(document.createTextNode(g[0]));list.appendChild(h);
    g[1].forEach(function(id){var b=document.createElement("button");b.className="item";b.id="item-"+id;b.textContent=src[id].name;
      if(state.tab==="play"){var sm=document.createElement("small");var sc=SCENES[id];sm.textContent=sc.branches?sc.steps.length+" steps + options":sc.steps.length+" steps";b.appendChild(sm)}
      b.setAttribute("aria-current",String(id===state.id));b.onclick=function(){select(id)};list.appendChild(b)})})}
function select(id){stop();state.id=id;save("id-"+state.tab,id);
  scene=state.tab==="shots"?shotScene(id):SCENES[id];state.step=0;state.branch=null;
  [].forEach.call(document.querySelectorAll(".item"),function(b){b.setAttribute("aria-current",String(b.id==="item-"+id))});
  $("title").textContent=scene.name;var cat=$("cat");cat.textContent=scene.cat;cat.style.background=CATCOL[scene.cat]||"var(--turq)";
  renderOptions();
  var isShot=state.tab==="shots";$("cards").hidden=!isShot;
  if(isShot){var s=SHOTS[id];$("c-what").textContent=s.what;$("c-when").textContent=s.when;$("c-aim").textContent=s.aim;$("c-avoid").textContent=s.avoid}
  if(scene.note){$("note").hidden=false;$("note").textContent=scene.note}else{$("note").hidden=true}
  var ip=initPos();["A","B","L","R"].forEach(function(k){place(k,ip[k],true)});
  renderStep()}
function renderDots(){var dots=$("dots");dots.innerHTML="";stepsOf().forEach(function(s,i){var b=document.createElement("button");b.textContent=i+1;b.setAttribute("aria-label","Step "+(i+1)+": "+s.t);b.onclick=function(){stop();state.step=i;renderStep()};dots.appendChild(b)})}
function renderOptions(){var box=$("opt-btns");box.innerHTML="";if(!scene.branches){$("options").hidden=true;return}
  $("ask").textContent=scene.ask||"What happens next?";
  scene.branches.forEach(function(br,j){var b=document.createElement("button");b.className="opt";b.id="opt-"+j;b.textContent=br.label;
    b.onclick=function(){stop();var base=scene.steps.length-1,from=posAt(base);state.branch=j;state.step=base+1;
      ["A","B","L","R"].forEach(function(k){place(k,from[k],true)});requestAnimationFrame(function(){renderStep()})};box.appendChild(b)})}
function renderStep(){var all=stepsOf(),i=state.step,st=all[i];renderDots();
  var showOpt=!!scene.branches&&i>=scene.steps.length-1;$("options").hidden=!showOpt;
  [].forEach.call($("opt-btns").children,function(b,j){b.setAttribute("aria-pressed",String(j===state.branch))});
  var prev=i>0?posAt(i-1):initPos(),cur=posAt(i);
  var bp=st.ball&&(PROF[st.ball.shot]||PROF.neutral),mv=(bp&&!RM)?Math.round(bp.d*1.3*1.1):900;
  clearTimeout(preTimer);var delay=0,pp=null;
  if(st.pre){pp=merge(prev,st.pre);var dist=0;for(var q in st.pre){var a0=prev[q],b0=st.pre[q];if(a0)dist=Math.max(dist,Math.hypot(a0[0]-b0[0],a0[1]-b0[1]))}
    delay=(RM||dist<0.3)?0:Math.round(Math.min(1800,500+dist*300))}
  var setPos=function(P,dur){["A","B","L","R"].forEach(function(k){PL[k].g.style.transitionDuration=dur+"ms";place(k,P[k],false);PL[k].ring.setAttribute("opacity",k===state.side?1:0)})};
  if(delay)setPos(pp,delay);else setPos(cur,mv);
  drawMoves(prev,cur);
  var sv=st.ball&&st.ball.shot==="serve";
  if(sv)drawZones(true,st.ball.f[1]<4?"L":"R",st.ball.to[0]<8?"own":"opp");
  else drawZones(state.zones||!!st.zones,scene.zoneSide||"R","opp");
  var showSix=state.rules==="men";l6a.style.display=showSix?"":"none";l6b.style.display=showSix?"":"none";
  var d;
  if(delay){if(raf)cancelAnimationFrame(raf);trail.setAttribute("opacity",0);tgt.setAttribute("opacity",0);land.setAttribute("opacity",0);
    if(st.ball){ball.setAttribute("cx",X(st.ball.f[0]));ball.setAttribute("cy",Y(st.ball.f[1]));ball.setAttribute("r",7);ball.setAttribute("opacity",1);shadow.setAttribute("cx",X(st.ball.f[0]));shadow.setAttribute("cy",Y(st.ball.f[1])+2);shadow.setAttribute("opacity",1)}
    preTimer=setTimeout(function(){setPos(cur,mv);runBall(st.ball,st.mark)},delay+120);d=bp?bp.d*1.3:0}
  else d=runBall(st.ball,st.mark);
  $("step-title").textContent=st.t;$("say").textContent=st.say||"";
  var chip=$("shotchip");if(st.ball&&SHOTS[st.ball.shot]){chip.hidden=false;chip.textContent=SHOTS[st.ball.shot].name;chip.dataset.shot=st.ball.shot}else{chip.hidden=true}
  var you,partner,label="Your job";
  if(st.roles){var hit=scene.hitter===state.side;you=hit?st.roles.hit:st.roles.partner;partner=hit?st.roles.partner:st.roles.hit;label=hit?"Your job (you hit it)":"Your job (partner hits it)"}
  else{you=st[state.side];partner=st[state.side==="L"?"R":"L"]}
  $("you-label").textContent=label+" · "+(state.side==="L"?"left side":"right side");
  $("you-text").textContent=you||"";$("partner-text").textContent=partner||"";$("jobs").hidden=!you&&!partner;
  [].forEach.call($("dots").children,function(b,j){b.setAttribute("aria-current",String(j===i))});
  $("prev").disabled=i===0;$("next").disabled=i===all.length-1;
  return Math.max(d,900)+delay}
function stop(){state.playing=false;clearTimeout(timer);clearTimeout(preTimer);$("play").textContent="Play all"}
function play(){if(state.playing){stop();return}state.playing=true;$("play").textContent="Pause";state.step=0;
  var go=function(){if(!state.playing)return;var d=renderStep();
    timer=setTimeout(function(){if(!state.playing)return;if(state.step>=stepsOf().length-1){stop();return}state.step++;go()},d+2600)};go()}

/* ---------------- Controls ---------------- */
function setTab(t){stop();clearTimeout(pkTimer);state.tab=t;save("tab",t);
  ["shots","play","pick"].forEach(function(k){$("tab-"+k).setAttribute("aria-selected",String(k===t))});
  var pick=t==="pick";$("list").hidden=pick;$("picker").hidden=!pick;$("ctrls").hidden=pick;$("stepbox").hidden=pick;$("result").hidden=!pick;
  if(pick){$("cards").hidden=true;$("title").textContent="Which shot?";var ct=$("cat");ct.textContent="Decision tool";ct.style.background="var(--sun)";renderPickInputs();renderPick();return}
  gG.innerHTML="";
  var def=t==="shots"?"serve":"guide",saved=load("id-"+t,def),src=t==="shots"?SHOTS:SCENES;state.id=src[saved]?saved:def;
  renderList();select(state.id)}
$("tab-shots").onclick=function(){setTab("shots")};$("tab-play").onclick=function(){setTab("play")};$("tab-pick").onclick=function(){setTab("pick")};
function seg(id,key){var box=$(id);[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state[key]));
  b.onclick=function(){state[key]=b.dataset.v;save(key,b.dataset.v);[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))});
    if(state.tab==="pick"){renderPick();return}
    if(key==="rules"){var keep=state.step;["A","B","L","R"].forEach(function(k){place(k,posAt(keep)[k],true)})}
    renderStep()}})}
seg("seg-side","side");seg("seg-rules","rules");
$("zones").checked=state.zones;$("zones").onchange=function(e){state.zones=e.target.checked;save("zones",state.zones?"1":"0");if(state.tab==="pick")renderPick();else renderStep()};
$("prev").onclick=function(){stop();if(state.step>0){state.step--;renderStep()}};
$("next").onclick=function(){stop();if(state.step<stepsOf().length-1){state.step++;renderStep()}};
$("play").onclick=play;
$("replay").onclick=function(){stop();var i=state.step,prev=i>0?posAt(i-1):initPos();["A","B","L","R"].forEach(function(k){place(k,prev[k],true)});requestAnimationFrame(function(){renderStep()})};
function openShot(s){save("id-shots",s);setTab("shots")}
$("shotchip").onclick=function(){openShot(this.dataset.shot)};
$("r-open").onclick=function(){openShot(this.dataset.shot)};

/* ---------------- Which shot? ---------------- */
var PK={side:load("pk-side","fh"),depth:load("pk-depth","mid"),speed:load("pk-speed","med"),height:load("pk-height","med"),A:[0,0],B:[0,2],next:"A"};
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
  return d+"; "+l+"."}
/* Drop only to a player who is mid-court or deep, and not into the lane of a partner who is at the net */
function dropTarget(){var a=PK.A,b=PK.B,c=[[a,b],[b,a]].sort(function(x,y){return y[0][0]-x[0][0]});
  for(var i=0;i<2;i++){var t=c[i][0],o=c[i][1];if(t[0]<1)continue;if(o[0]===0&&o[1]===t[1])continue;return t}return null}
function dropOK(){return !!dropTarget()}
function choose(){var H=PK.height,D=DI[PK.depth],Sp=PK.speed,Sd=PK.side;
  var minD=Math.min(PK.A[0],PK.B[0]),bothBack=minD===2,anyFront=minD===0,bunched=PK.A[1]===1&&PK.B[1]===1,r;
  if(H==="high"){
    if(D<=1){
      if(Sd==="bh")r=["bhsmash","High on your backhand and close enough to attack: a short, firm overhead."];
      else if(bunched)r=["brush","High ball close to the net and they're bunched in the middle: spin it wide."];
      else r=["flatsmash","High ball within about 5 m of the net: hit down."];
    }else r=(Sp==="fast"||Sd==="bh")?["hook","High but deep, and rushed or on your backhand: windmill it back deep."]:["recoverysmash","High but you're deep. A smash from here won't win the point, so place it deep."];
  }else if(H==="med"){
    if(Sp==="fast")r=D===0?["push","Fast at net height and you're close: punch it back down with a compact swing."]:["dig","Fast and you're further back: no time to swing, so block it long over them or straight at medium height."];
    else if(D===0)r=(dropOK()&&Sp==="slow")?["drop","Slow ball near the net and the player you'd drop to is behind their 3 m line: play it short in front of them."]:["push","At net height and close to the net: push it down."];
    else if(D===1){
      if(Sp==="slow"&&anyFront)r=Sd==="bh"?["rainbow","Time on your backhand and an opponent at the net: spin it up over them."]:["lob","Time to swing and an opponent at the net: go over them."];
      else if(Sp==="slow"&&dropOK())r=["drop","Time to swing and the player you'd drop to is behind their 3 m line: play it short in front of them."];
      else r=["push","At net height in the middle of the court: push it down at them."];
    }else r=(Sp==="slow"&&minD<=1)?(Sd==="bh"?["rainbow","Time on your backhand and they're forward: spin it over them."]:["lob","You're deep with time and they're forward: lob over them."]):["neutral","You're deep and can't attack from here: reset deep onto a backhand."];
  }else{
    if(Sp==="fast")r=["dig","Fast and below the net: don't swing and don't try to lob it, that's very difficult. Block it long over them or straight at medium height."];
    else if(D===0)r=(Sp==="slow"&&dropOK())?["drop","Low but slow near the net, and the player you'd drop to is behind their 3 m line: drop it short in front of them."]:["dig","Below the net you can't hit down: block it long over them or straight at medium height."];
    else if(D===1){
      if(Sp==="slow")r=anyFront?(Sd==="bh"?["rainbow","Low on your backhand with time and an opponent at the net: spin it up over them."]:["lob","Below the net with time and an opponent at the net: go over them."]):(dropOK()?["drop","Below the net with time, and the player you'd drop to is behind their 3 m line: play short in front of them."]:["neutral","Below the net with time: reset deep onto a backhand."]);
      else r=["dig","Below the net with some pace: block it long over them or straight at medium height."];
    }else r=(Sp==="slow"&&anyFront)?["lob","Deep with time and they're at the net: lob over them."]:["neutral","Low and deep: reset with a deep neutral ball onto a backhand."];
  }
  if(Sd==="body"&&Sp==="fast"&&H!=="high")r=["dig","Fast at your body: get the racket in front and block it long or straight, not short."];
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
    return {p:tp,txt:"Deep onto the backhand of the opponent "+laneWord(o[pick][1]).replace("down the middle","in the middle")+" (for a right-hander, that's the side of them away from their right hand)."}}
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
    r.addEventListener("click",function(){var other=PK.next==="A"?"B":"A";if(PK[other][0]===d&&PK[other][1]===l)return;PK[PK.next]=[d,l];PK.next=other;save("pk-opp",JSON.stringify({A:PK.A,B:PK.B}));renderPick()})})(d,l)}
function pkSeg(key){var box=$("pk-"+key);[].forEach.call(box.children,function(b){b.setAttribute("aria-pressed",String(b.dataset.v===PK[key]));
  b.onclick=function(){PK[key]=b.dataset.v;save("pk-"+key,b.dataset.v);[].forEach.call(box.children,function(x){x.setAttribute("aria-pressed",String(x===b))});renderPick()}})}
function renderPickInputs(){["side","depth","speed","height"].forEach(pkSeg)}
function renderPick(){var c=choose(),t=target(c.shot),s=SHOTS[c.shot],D=DI[PK.depth];
  var youX=[6.4,3.6,1.0][D],youY=state.side==="L"?2.6:5.4,partner=state.side==="L"?"R":"L";
  var pos={A:oppPos(PK.A),B:oppPos(PK.B)};pos[state.side]=[youX,youY];pos[partner]=[D===0?5.4:3.8,state.side==="L"?5.4:2.6];
  ["A","B","L","R"].forEach(function(k){place(k,pos[k],false);PL[k].ring.setAttribute("opacity",k===state.side?1:0)});
  gM.innerHTML="";drawZones(state.zones,"R","opp");drawGrid();
  var showSix=state.rules==="men";l6a.style.display=showSix?"":"none";l6b.style.display=showSix?"":"none";
  var cy=youY+(PK.side==="fh"?0.45:PK.side==="bh"?-0.45:0),cx=youX+0.3,src=pos.A[0]<=pos.B[0]?pos.A:pos.B;
  var endH={low:0.4,med:1.4,high:3.0}[PK.height],arc={fast:0.4,med:1.2,slow:2.2}[PK.speed];
  PROF._in={d:{fast:500,med:850,slow:1300}[PK.speed],h:function(k){return 1.2*(1-k)+endH*k+arc*S(PI*k)}};
  clearTimeout(pkTimer);
  var d1=runBall({f:src,to:[cx,cy],shot:"_in"},false);
  pkTimer=setTimeout(function(){runBall({f:[cx,cy],to:t.p,shot:c.shot},true)},d1+450);
  $("r-shot").textContent=s.name;$("r-open").dataset.shot=c.shot;$("r-why").textContent=c.why;
  $("r-target").textContent=t.txt;$("r-form").textContent=formationText();
  var b=SHOTS[BACKUP[c.shot]];$("r-backup").textContent=b?b.name+". "+b.when:"";
  $("r-you").textContent=s.afterH;$("r-partner").textContent=s.afterP;
  $("pk-next").textContent="Next tap moves "+PK.next+"."}

setTab(["play","pick"].indexOf(state.tab)>=0?state.tab:"shots");
