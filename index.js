import "./mapbits.js";
import "./style.css";

var i1;
var i3;
var o1;
var o2;
var mbs;
var currentMbs;

if('serviceWorker' in navigator) {
    console.log('~~: oh!');
    setupElements();        
    navigator.serviceWorker.register('./sw.js', { scope: '/' });
}

function setupElements() {
    i1 = e('i1');
    i3 = e('i3');
    o1 = e('o1');
    o2 = e('o2');
    if (i1) {
        i1.oninput = clearout;
        i1.onkeyup = checkDone;
        i3.onblur = changeMap;
        e('go1').onclick = gotIt;
        e('go2').onclick = clearIt;
        e('ic1').onclick = showPass;
        e('ic2').onclick = showMap;
        initialize();
    }
}

function changeIt(intext) {
    var uu = Array.from(intext);
    var tt = [];
    var i;

    for (i = 0; i < uu.length; i++) {
        const chip = mbs.chips.find(chp => chp.f === uu[i]);
        tt.push(chip ? chip.t: uu[i]);
    }
    return tt.join('');
}

function gotIt() {
    o1.value = changeIt(i1.value);
    o1.select();
    document.execCommand('copy');
    o2.value = o1.value;
}

function clearIt() {
    i1.value = '';
    clearout();
}

function clearout() {
    o1.value = '';
    o2.value = '';
    flipShow(o2, ic1, true);
    flipShow(i3, ic2, true);
}

function e(idValue) {
    return document.getElementById(idValue);
}

function initialize() {
    var lastLocator = (!!currentMap) ? currentMap : localStorage.getItem('lastLocator');
    if (!!lastLocator) {
        resolveItem(lastLocator);
    }
}

function resolveItem(locator) {
    getItemLocal(locator);
    if (!mbs) {
        getItemRemote(locator);
    } else {
        i3.value = locator;
        localStorage.setItem('lastLocator', locator);
    }
}

function getItemLocal(locator) {
    mbs = mapbits.find(bits => bits.tag === locator);
}

function getItemRemote(locator) {
    const onResp = function() {
        if (this.readyState === 4) {
            console.log(this.responseText);
            mbs = (JSON.parse(this.responseText))[0]['spec'];
            console.log(mbs);
            if(!!mbs) {
                localStorage.setItem('lastLocator', locator);
                i3.value = locator;
            } else {
                mbs = currentMbs;
                i3.value = localStorage.getItem('lastLocator');        
            }
        }
    };
    
    const query = `q={"locator":"${locator}"}`
    const ch = String.fromCharCode(47);
    const resource = `https:${ch}${ch}cypherbits-e669.restdb.io/rest/swapbits?${query}`;
    
    sendRequest('GET', resource, null, onResp);
}

function sendRequest(verb, url, data, onResponse) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener('readystatechange', onResponse);
    
    xhr.open(verb, url);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("x-apikey", "61d0b2e6ccd0211b32089409");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}

function showPass() {
    flipShow(o2, ic1);
}

function showMap() {
    flipShow(i3, ic2)
}

function flipShow(box, icon, reset) {
    if (box.type === 'password' && !reset) {
        box.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add("fa-eye-slash");
    } else if (box.type === 'text') {
        box.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add("fa-eye");
    }    
}

function changeMap() {
    currentMbs = mbs;
    var newLocator = i3.value;
    if (!!newLocator) {
        resolveItem(newLocator);
    }
}

function checkDone(e) {
    if (e.code === 'Enter') {
        gotIt();        
    }
}

setupElements();