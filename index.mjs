export default {
  async fetch(request, env, ctx) {
    return new Response(HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Subnet Splitter — Interactive IPv4 Subnet Tree</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0b1020;--panel:#121a31;--ink:#e8eefc;--muted:#8ea2c9;
    --accent:#5b8cff;--line:rgba(120,150,220,.25);
  }
  body{
    font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
    background:radial-gradient(1200px 700px at 80% -10%,#1b2a52 0%,transparent 60%),
               radial-gradient(900px 600px at -10% 10%,#16234a 0%,transparent 55%),
               var(--bg);
    color:var(--ink);min-height:100vh;padding:0 16px 80px;
  }
  .wrap{max-width:1100px;margin:0 auto}
  header.hero{
    text-align:center;padding:54px 16px 30px;
  }
  .hero .logo{
    display:inline-flex;align-items:center;gap:12px;font-weight:800;
    font-size:clamp(28px,5vw,46px);letter-spacing:-.5px;
  }
  .hero .logo .glyph{
    width:46px;height:46px;border-radius:12px;flex:0 0 auto;
    background:linear-gradient(135deg,#5b8cff,#8a5bff);
    display:grid;place-items:center;font-size:24px;box-shadow:0 8px 30px rgba(91,140,255,.45);
  }
  .hero p{color:var(--muted);margin-top:12px;font-size:clamp(15px,2.4vw,18px)}
  .controls{
    background:var(--panel);border:1px solid var(--line);border-radius:16px;
    padding:18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;
    box-shadow:0 20px 60px rgba(0,0,0,.35);
  }
  .controls .field{flex:1 1 260px;display:flex;flex-direction:column;gap:6px}
  .controls label{font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.4px;text-transform:uppercase}
  input[type=text]{
    background:#0c1428;border:1px solid var(--line);color:var(--ink);
    padding:13px 14px;border-radius:11px;font-size:17px;font-family:'SFMono-Regular',Consolas,monospace;
    outline:none;transition:.15s;
  }
  input[type=text]:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(91,140,255,.25)}
  button.btn{
    background:linear-gradient(135deg,#5b8cff,#7a6bff);color:#fff;border:none;
    padding:13px 20px;border-radius:11px;font-size:15px;font-weight:700;cursor:pointer;
    transition:.15s;white-space:nowrap;
  }
  button.btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(91,140,255,.4)}
  button.ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
  button.ghost:hover{border-color:var(--accent);box-shadow:none}
  .err{color:#ff8a8a;font-size:14px;min-height:18px;margin:10px 4px 0}
  .examples{margin:14px 4px 0;color:var(--muted);font-size:13px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .examples span{cursor:pointer;border:1px dashed var(--line);padding:4px 9px;border-radius:8px;font-family:monospace}
  .examples span:hover{border-color:var(--accent);color:var(--ink)}
  .legend{margin:24px 4px 6px;color:var(--muted);font-size:13px}
  #tree{margin-top:8px}
  .node{margin:8px 0}
  .children{
    margin-left:26px;padding-left:20px;border-left:2px dashed var(--line);
    position:relative;
  }
  .tile{
    --h:210;
    background:linear-gradient(180deg,hsla(var(--h),70%,55%,.14),hsla(var(--h),70%,45%,.07));
    border:1px solid hsla(var(--h),70%,60%,.35);
    border-left:5px solid hsl(var(--h),80%,62%);
    border-radius:14px;padding:13px 15px;cursor:pointer;transition:.15s;
    user-select:text;
  }
  .tile:hover{border-color:hsl(var(--h),85%,68%);box-shadow:0 6px 24px hsla(var(--h),70%,40%,.25);transform:translateY(-1px)}
  .tile.open{background:linear-gradient(180deg,hsla(var(--h),70%,55%,.20),hsla(var(--h),70%,45%,.10))}
  .thead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .cidr{font-family:'SFMono-Regular',Consolas,monospace;font-size:19px;font-weight:700;color:#fff}
  .hint{
    margin-left:auto;font-size:12px;font-weight:600;color:var(--muted);
    border:1px solid var(--line);padding:4px 9px;border-radius:20px;white-space:nowrap;
  }
  .hint.merge{color:#ffd27a;border-color:rgba(255,210,122,.4)}
  .hint.split{color:#86f0b0;border-color:rgba(134,240,176,.4)}
  .copy{
    background:rgba(255,255,255,.07);border:1px solid var(--line);color:var(--muted);
    border-radius:7px;padding:3px 8px;font-size:12px;cursor:pointer;transition:.12s;
  }
  .copy:hover{color:#fff;border-color:var(--accent);background:rgba(91,140,255,.2)}
  .meta{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 18px;margin-top:11px;
  }
  .mrow{display:flex;align-items:center;gap:8px;font-size:13px}
  .mrow .lbl{color:var(--muted);min-width:78px}
  .mrow .val{font-family:'SFMono-Regular',Consolas,monospace;color:var(--ink);user-select:text}
  .empty{color:var(--muted);text-align:center;padding:50px 0;font-size:15px}
  #toast{
    position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);
    background:#1b2746;border:1px solid var(--accent);color:#fff;padding:11px 18px;border-radius:11px;
    font-size:14px;opacity:0;pointer-events:none;transition:.25s;box-shadow:0 10px 40px rgba(0,0,0,.5);z-index:50;
  }
  #toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  footer{text-align:center;color:var(--muted);font-size:13px;margin-top:40px}
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <div class="logo"><span class="glyph">🌳</span><span>Subnet Splitter</span></div>
    <p>Enter an IPv4 network, then click a tile to split it into two halves — click again to merge it back. Build a full subnet tree, expand and collapse as you go.</p>
  </header>

  <div class="controls">
    <div class="field">
      <label for="cidr">Network CIDR</label>
      <input id="cidr" type="text" placeholder="192.168.0.0/24" value="192.168.0.0/24" autocomplete="off" spellcheck="false">
    </div>
    <button class="btn" id="buildBtn">Build tree</button>
    <button class="btn ghost" id="expandBtn">Split all leaves</button>
    <button class="btn ghost" id="collapseBtn">Collapse all</button>
  </div>
  <div class="err" id="err"></div>
  <div class="examples">
    Try:
    <span data-ex="10.0.0.0/8">10.0.0.0/8</span>
    <span data-ex="192.168.1.0/24">192.168.1.0/24</span>
    <span data-ex="172.16.0.0/16">172.16.0.0/16</span>
    <span data-ex="203.0.113.0/27">203.0.113.0/27</span>
  </div>

  <div class="legend">💡 Click a subnet to split (▶) or merge (▼). Use the <b>copy</b> buttons or just select any text in a tile to copy it.</div>
  <div id="tree"></div>
</div>
<div id="toast"></div>

<script>
  var tree=null;

  function ipToInt(s){var p=s.split('.');return ((+p[0]<<24)+(+p[1]<<16)+(+p[2]<<8)+(+p[3]))>>>0;}
  function intToIp(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');}
  function maskFor(p){return p===0?0:(0xFFFFFFFF<<(32-p))>>>0;}
  function fmt(n){return n.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');}

  function err(m){document.getElementById('err').textContent=m||'';}

  function toast(m){
    var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');
    clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},1400);
  }

  function copyText(t){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(function(){toast('Copied  '+t);},function(){fallbackCopy(t);});
    }else{fallbackCopy(t);}
  }
  function fallbackCopy(t){
    var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);
    ta.select();try{document.execCommand('copy');toast('Copied  '+t);}catch(e){}
    document.body.removeChild(ta);
  }

  function build(){
    var v=document.getElementById('cidr').value.trim();
    var m=v.match(/^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\/(\\d{1,2})$/);
    if(!m){err('Enter a valid CIDR, e.g. 192.168.0.0/24');return;}
    var oct=[+m[1],+m[2],+m[3],+m[4]];
    if(oct.some(function(o){return o>255;})){err('Each octet must be 0–255.');return;}
    var p=+m[5];
    if(p>32){err('Prefix length must be 0–32.');return;}
    var ip=ipToInt(oct.join('.'));
    var net=(ip & maskFor(p))>>>0;
    tree={net:net,prefix:p,children:null};
    err('');
    render();
  }

  function findNode(path){
    var node=tree;
    for(var i=0;i<path.length;i++){node=node.children[+path[i]];}
    return node;
  }

  function splitNode(node){
    if(node.prefix>=32)return false;
    var cp=node.prefix+1;
    var size=Math.pow(2,32-cp);
    node.children=[
      {net:node.net,prefix:cp,children:null},
      {net:(node.net+size)>>>0,prefix:cp,children:null}
    ];
    return true;
  }

  function toggle(path){
    if(window.getSelection().toString().length>0)return;
    var node=findNode(path);
    if(node.children){node.children=null;}
    else{splitNode(node);}
    render();
  }

  function expandLeaves(node){
    if(node.children){node.children.forEach(expandLeaves);}
    else{splitNode(node);}
  }

  function nodeHtml(node,path){
    var size=Math.pow(2,32-node.prefix);
    var netStr=intToIp(node.net);
    var lastStr=intToIp((node.net+size-1)>>>0);
    var cidr=netStr+'/'+node.prefix;
    var mask=intToIp(maskFor(node.prefix));
    var usable;
    if(node.prefix<=30)usable=size-2; else if(node.prefix===31)usable=2; else usable=1;
    var open=!!node.children;
    var canSplit=node.prefix<32;
    var hue=((node.prefix*23)%360+360)%360;

    var hint;
    if(open){hint='<span class="hint merge">▼ click to merge</span>';}
    else if(canSplit){hint='<span class="hint split">▶ click to split</span>';}
    else{hint='<span class="hint">/32 · single host</span>';}

    var h='';
    h+='<div class="node">';
    h+='<div class="tile '+(open?'open':'')+'" style="--h:'+hue+'" data-path="'+path+'">';
    h+='  <div class="thead">';
    h+='    <span class="cidr">'+cidr+'</span>';
    h+='    <button class="copy" data-copy="'+cidr+'">copy CIDR</button>';
    h+=     hint;
    h+='  </div>';
    h+='  <div class="meta">';
    h+= mrow('Netmask',mask,mask);
    h+= mrow('Range',netStr+' – '+lastStr,netStr+' - '+lastStr);
    h+= mrow('Addresses',fmt(size),''+size);
    h+= mrow('Usable',fmt(usable),''+usable);
    h+='  </div>';
    h+='</div>';
    if(open){
      h+='<div class="children">';
      h+=nodeHtml(node.children[0],path+'0');
      h+=nodeHtml(node.children[1],path+'1');
      h+='</div>';
    }
    h+='</div>';
    return h;
  }

  function mrow(lbl,disp,copy){
    return '<div class="mrow"><span class="lbl">'+lbl+'</span>'+
           '<span class="val">'+disp+'</span>'+
           '<button class="copy" data-copy="'+copy+'">copy</button></div>';
  }

  function render(){
    var c=document.getElementById('tree');
    if(!tree){c.innerHTML='<div class="empty">No network yet — build one above to start splitting.</div>';return;}
    c.innerHTML=nodeHtml(tree,'');
  }

  document.getElementById('tree').addEventListener('click',function(e){
    var cb=e.target.closest('[data-copy]');
    if(cb){e.stopPropagation();copyText(cb.getAttribute('data-copy'));return;}
    var tile=e.target.closest('.tile');
    if(tile){
      if(window.getSelection().toString().length>0)return;
      toggle(tile.getAttribute('data-path'));
    }
  });

  document.getElementById('buildBtn').addEventListener('click',build);
  document.getElementById('cidr').addEventListener('keydown',function(e){if(e.key==='Enter')build();});
  document.getElementById('expandBtn').addEventListener('click',function(){if(!tree){build();return;}expandLeaves(tree);render();});
  document.getElementById('collapseBtn').addEventListener('click',function(){if(tree){tree.children=null;render();}});
  document.querySelectorAll('.examples span').forEach(function(s){
    s.addEventListener('click',function(){document.getElementById('cidr').value=s.getAttribute('data-ex');build();});
  });

  build();
</script>
</body>
</html>`;
