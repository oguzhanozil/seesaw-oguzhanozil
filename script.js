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
let objects = []; // uzaklık(pivot noktasından), weight, element şeklinde objeler oluşturmak için
let leftWeight = 0;
let rightWeight = 0;

seesawArea.addEventListener('click', function(event) {
    const rect = plank.getBoundingClientRect();
    const clickX = event.clientX - rect.left; //  tıklanılan koordinat
    const weight = Math.floor(Math.random() * 10) + 1; // 1 ile 10 arasında rastgele ağırlık
    /* seesaw area plank uzunluğundna büyük, bu if bloğu plank üstünde
    olmayan kısma tıklamayı engeller */
    if(rect.left > event.clientX){
        clickX = rect.left;
    }
    if(rect.right < event.clientX){
        clickX = rect.right;
    }
    addObject(clickX, weight); 
    calculate();
});

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
}
function addObject(positionX, weight) {   
    const obj = document.createElement('div');
    const size = 20 + (weight * 3); // ağırlığa göre boyut belirlensin
    obj.className = 'weight-object';
    obj.style.width = size + 'px';
    obj.style.height = size + 'px';
    obj.style.backgroundColor = getRandomColor();
    obj.style.borderRadius = '50%'; // daire şekli
    obj.style.transform = 'translateX(-50%)'; // div'in tam ortalanması için
    obj.style.position = 'absolute';
    obj.style.left = positionX + 'px';
    obj.style.bottom = '50px'; // plank üstünde görünmesi için
    obj.style.display = 'flex';
    obj.style.alignItems = 'center';
    obj.style.justifyContent = 'center';
    obj.style.color = 'white';
    obj.style.fontWeight = 'bold';
    obj.style.fontSize = Math.max(10, weight + 2) + 'px'; // Yazı boyutu da weight'e göre
    obj.textContent = weight + 'kg';

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
        const distance = obj.x - center; // merkezden uzaklık eğer soldaysa negatif sağdaysa pozitif değer alır
        const torque = obj.weight * Math.abs(distance); 
        
        if (distance < 0) {
            leftTorque += torque;
            leftWeight += obj.weight;
        } else {
            rightTorque += torque;
            rightWeight += obj.weight;
        }
    });
    //ağırlıkları güncelle
    leftWeightDisplay.textContent = leftWeight;
    rightWeightDisplay.textContent = rightWeight;

    const torqueDifference = rightTorque - leftTorque;
    const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, torqueDifference / 10)); // açının MAX_ANGLE'ı geçmemesi için  
    plank.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    
}