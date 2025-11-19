//sabitler
const PLANK_LENGTH = 400;
const MAX_ANGLE = 30; 

//HTML elemanlarını seçme
const seesawArea = document.getElementById('seesaw-area');
const plank = document.getElementById('seesaw-plank');
const pivot = document.getElementById('seesaw-pivot');
const leftWeightDisplay = document.getElementById('left-weight');
const rightWeightDisplay = document.getElementById('right-weight');

//başlangıç değerleri
let objects = []; 
let leftWeight = 0;
let rightWeight = 0;
let currentObj = null;

function init(){
    const weight = Math.floor(Math.random() * 10) + 1;
    const obj = document.createElement('div');
    const size = 20 + (weight * 3);
    obj.className = 'weight-object';
    obj.style.width = size + 'px';
    obj.style.height = size + 'px';
    obj.style.backgroundColor = getRandomColor();
    obj.style.borderRadius = '50%';
    obj.style.position = 'fixed';
    obj.style.display = 'flex';
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
}

seesawArea.addEventListener('mousemove', function(event) {
    if (!currentObj) return;
    // mouse pozisyonuna göre objeyi yerleştirmek için
    currentObj.style.left = event.clientX + 'px';
    currentObj.style.top = event.clientY + 'px';
    currentObj.style.transform = 'translate(-50%, -50%)';
});

seesawArea.addEventListener('mouseleave', function() {
    if (currentObj) {
        currentObj.style.display = 'none';
    }
});

seesawArea.addEventListener('mouseenter', function() {
    if (currentObj) {
        currentObj.style.display = 'flex';
    }
});

seesawArea.addEventListener('click', function(event) {
    if (!currentObj) return;
    
    const rect = plank.getBoundingClientRect();
    let clickX = event.clientX;
    
    // plank dışına tıklamayı engellemek için
    if(clickX < rect.left){
        clickX = rect.left;
    }
    if(clickX > rect.right){
        clickX = rect.right;
    }
    
    const relativeX = clickX - rect.left;
    
    // mevcut objenin ağırlığını al
    const weight = parseInt(currentObj.textContent);   
    addObject(relativeX, weight, currentObj); 
    calculate(); 
    currentObj = null;
    init();
});

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function addObject(positionX, weight, obj) {
    // objenin konumunu ayarlamak için  (plank'ın üstünde)
    obj.style.left = positionX + 'px';
    obj.style.transform = 'translateX(-50%)';
    obj.style.top = '-' + (parseInt(obj.style.height) / 2 + 5) + 'px'; 
    
    // planka eklemek için
    plank.appendChild(obj);
    
    //objeyi listeye kaydet
    objects.push({
        x: positionX,
        weight: weight,
        element: obj
    });
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
}

// sayfa yüklendiğinde ilk objeyi oluştur
init();