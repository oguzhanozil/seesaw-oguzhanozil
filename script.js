//sabitler
const PLANK_LENGTH = 400;
const MAX_ANGLE = 30; 

//HTML elemanlarını seçme
const seesawArea = document.getElementById('seesaw-area');
const plank = document.getElementById('seesaw-plank');
const pivot = document.getElementById('seesaw-pivot');
const leftWeightDisplay = document.getElementById('left-weight');
const rightWeightDisplay = document.getElementById('right-weight');
const angleDisplay = document.getElementById('angle');
const nextWeightDisplay = document.getElementById('next-weight');
const resetButton = document.getElementById('reset-btn');
const distanceIndicator = document.getElementById('distance-indicator');

//başlangıç değerleri
let objects = []; 
let leftWeight = 0;
let rightWeight = 0;
let currentObj = null;
let line = null;

function init(){
    createObject();
    createLine();
}

seesawArea.addEventListener('mousemove', (event) => {
    if (!currentObj) return;
    currentObj.style.display = 'flex';
    // mouse pozisyonuna göre objeyi yerleştirir plank dışına çıkıldığında
    // çıkıldığı yöndeki plank sınırına sabitler
    const rect = plank.getBoundingClientRect();
    let center = (rect.right + rect.left)/2;
    if (rect.left < event.clientX && rect.right > event.clientX) {
    currentObj.style.left = event.clientX + 'px';
    currentObj.style.top = '40%';
    currentObj.style.transform = 'translate(-50%, -50%)';
    updateLine(event.clientX);
    distanceIndicator.textContent = Math.round(event.clientX - center);
    }    
});

seesawArea.addEventListener('mouseleave', () => {
    if (currentObj) {
        currentObj.style.display = 'none';
    }
    if (line) {
        line.style.display = 'none'; 
    }
});

seesawArea.addEventListener('mouseenter', () => {
    if (currentObj) {
        currentObj.style.display = 'flex';
    }
    if (line) {
        line.style.display = 'flex'; 
    }
});

seesawArea.addEventListener('click', (event) => {
    if (!currentObj) return;
    
    const rect = plank.getBoundingClientRect();
    let clickX = event.clientX;
    
    // plank dışına tıklamayı engeller
    if(clickX < rect.left){
        clickX = rect.left;
    }
    if(clickX > rect.right){
        clickX = rect.right;
    }
    
    const relativeX = clickX - rect.left;
    
    // mevcut objenin ağırlığını alır
    const weight = parseInt(currentObj.textContent);   
    addObject(relativeX, weight, currentObj, clickX); 
    currentObj = null;
    init();
});

resetButton.addEventListener('click', resetSeesaw);

function createObject(){
    const weight = Math.floor(Math.random() * 10) + 1;
    const obj = document.createElement('div');
    const size = 22 + (weight * 3);
    obj.className = 'weight-object';
    obj.style.width = size + 'px';
    obj.style.height = size + 'px';
    obj.style.backgroundColor = getRandomColor();
    obj.style.borderRadius = '50%';
    obj.style.position = 'fixed';
    obj.style.display = 'none';
    obj.style.alignItems = 'center';
    obj.style.justifyContent = 'center';
    obj.style.color = 'white';
    obj.style.fontWeight = 'bold';
    obj.style.fontSize = Math.max(10, weight + 2) + 'px';
    obj.textContent = weight + 'kg';
    obj.style.cursor = 'pointer';
    obj.style.pointerEvents = 'none';
    document.body.appendChild(obj);
    currentObj = obj;
    nextWeightDisplay.textContent = weight + ' kg';
}
//obj (top) ile plank arası çizgi oluşturur
function createLine(){
    if (line) {
        document.body.removeChild(line);
    }
    line = document.createElement('div');
    line.style.position = 'fixed';
    document.body.appendChild(line);
    line.style.top = '40%';
    line.style.width = '2px';
    line.style.height = '50px';
    line.style.backgroundColor = 'grey';
    line.style.opacity = '0.7';
    line.style.pointerEvents = 'none';
    line.style.display = 'none';
}
//çizginin konumunu anlık olarak günceller
function updateLine(positionX){
    if (!line) return;
    
    const objRect = currentObj.getBoundingClientRect();
    const plankRect = plank.getBoundingClientRect();
    const height = plankRect.top - objRect.bottom;
    line.style.left = positionX + 'px';
    line.style.top = objRect.bottom + 'px';
    line.style.height = height + 'px';
    line.style.display = 'flex';
}

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function addObject(positionX, weight, obj,clickX) {
    const rect = plank.getBoundingClientRect();
    const seesawRect = seesawArea.getBoundingClientRect();
    obj.style.position = 'fixed';
    obj.style.left = clickX + 'px';
    obj.style.top = (seesawRect.top - 100) + 'px'; 
    obj.style.transform = 'translateX(-50%)';
    const targetY = (rect.top - parseInt(obj.style.height) / 2)+25;
    dropdownAnimation(parseFloat(obj.style.top), clickX, obj, targetY, () => {
        // animasyon bitince planka yerleştirir
        obj.style.position = 'absolute';
        obj.style.left = positionX + 'px';
        obj.style.top = '0px';
        obj.style.bottom = '0%';
        obj.style.transform = 'translateX(-50%) translateY(-100%)';
        plank.appendChild(obj);
        const newRect = plank.getBoundingClientRect();
        const actualLeft = clickX - newRect.left;
        obj.style.left = actualLeft + 'px';
        //objeyi listeye kaydeder
        objects.push({
            x: positionX,
            weight: weight,
            element: obj
        });
        
        calculate();
    });
}
function dropdownAnimation(startY, positionX, obj, targetY, callback){
    let positionY = startY;
    let velocity = 0;
    const gravity = 0.3;

    function animate(){   
    velocity += gravity;
    positionY += velocity;

    if (positionY >= targetY){
        obj.style.top = targetY + 'px';
        callback();
        return;
    }
    obj.style.top = positionY + 'px';
    window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
}
function calculate(){
    let leftTorque = 0;
    let rightTorque = 0;
    leftWeight = 0;
    rightWeight = 0;
    
    const center = PLANK_LENGTH / 2;
    objects.forEach(obj => {
        const distance = obj.x - center;
        const torque = obj.weight * Math.abs(distance); 
        
        if (distance < 0) {
            leftTorque += torque;
            leftWeight += obj.weight;
        } else {
            rightTorque += torque;
            rightWeight += obj.weight;
        }
    });
    
    leftWeightDisplay.textContent = leftWeight;
    rightWeightDisplay.textContent = rightWeight;
    const torqueDifference = rightTorque - leftTorque;
    const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, torqueDifference / 10));
    plank.style.transform = `translateX(-50%) rotate(${angle}deg)`;

    angleDisplay.textContent = angle.toFixed(1) + '°';
    saveState();
}


// kaydetme, yükleme ve reset methodları - küçük bir proje olduğu için yeni script dosyasında oluşturmadım
function saveState(){
    const state = {
         objects: objects.map(obj => ({
            x: obj.x,
            weight: obj.weight,
            color: obj.element.style.backgroundColor,
            size: obj.element.style.width
        })),
        leftWeight: leftWeight,
        rightWeight: rightWeight
    };
    localStorage.setItem('seesawState', JSON.stringify(state));
}

function loadState(){
    const savedState = localStorage.getItem('seesawState');
    if (!savedState) return false;
    const state = JSON.parse(savedState);
    state.objects.forEach(objData => {
        const obj = document.createElement('div');
        obj.className = 'weight-object';
        obj.style.width = objData.size;
        obj.style.height = objData.size;
        obj.style.backgroundColor = objData.color;
        obj.style.borderRadius = '50%';
        obj.style.position = 'absolute';
        obj.style.left = objData.x + 'px';
        obj.style.top = '0px';
        obj.style.display = 'flex';
        obj.style.alignItems = 'center';
        obj.style.justifyContent = 'center';
        obj.style.color = 'white';
        obj.style.fontWeight = 'bold';
        obj.style.fontSize = Math.max(10, objData.weight + 2) + 'px';
        obj.textContent = objData.weight + 'kg';
        obj.style.transform = 'translateX(-50%) translateY(-100%)';
        obj.style.pointerEvents = 'none';
        
        plank.appendChild(obj);
        
        objects.push({
            x: objData.x,
            weight: objData.weight,
            element: obj
        });
    });
    
    leftWeight = state.leftWeight;
    rightWeight = state.rightWeight;    
    calculate();
    init(); 
    return true; 
}

function resetSeesaw(){
    if (currentObj) {
        document.body.removeChild(currentObj);
        currentObj = null;
    }
    if (line) {
        document.body.removeChild(line);
        line = null;
    }
    objects.forEach(obj => {
        plank.removeChild(obj.element);
    });
    objects = [];
    leftWeight = 0;
    rightWeight = 0;
    localStorage.removeItem('seesawState');
    plank.style.transform = 'translateX(-50%) rotate(0deg)';
    leftWeightDisplay.textContent = '0';
    rightWeightDisplay.textContent = '0';
    angleDisplay.textContent = '0°';
    init();
}

// sayfa yüklendiğinde ilk objeyi oluşturur
if (!loadState()) {
    init();
}