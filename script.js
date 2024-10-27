let selectedCard = null;
let mode = 'create'; // Startet im Erstellmodus
let connections = [];

// Modusanzeige-Element aktualisieren
const modeIndicator = document.createElement('div');
modeIndicator.id = 'modeIndicator';
modeIndicator.style.position = 'fixed';
modeIndicator.style.top = '10px';
modeIndicator.style.right = '10px';
modeIndicator.style.padding = '5px';
modeIndicator.style.backgroundColor = 'lightgray';
modeIndicator.style.borderRadius = '5px';
modeIndicator.innerText = `Modus: ${mode === 'connect' ? 'Verbindungsmodus' : 'Karten erstellen'}`;
document.body.appendChild(modeIndicator);

// Toggle-Button für Modi
const toggleModeButton = document.createElement('button');
toggleModeButton.innerText = 'Modus wechseln';
toggleModeButton.style.position = 'fixed';
toggleModeButton.style.top = '40px';
toggleModeButton.style.right = '10px';
toggleModeButton.addEventListener('click', () => setMode(mode === 'connect' ? 'create' : 'connect'));
document.body.appendChild(toggleModeButton);

const cardContainer = document.getElementById('cardContainer');
const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    redrawConnections();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function addCard() {
    const frontText = document.getElementById('frontText').value;
    const backText = document.getElementById('backText').value;
    if (frontText && backText) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.top = "50px";
        card.style.left = "50px";
        card.innerHTML = `
            <div class="card-front"><h2>${frontText}</h2></div>
            <div class="card-back"><p>${backText}</p></div>
        `;
        cardContainer.appendChild(card);
        makeCardDraggable(card);
        document.getElementById('frontText').value = '';
        document.getElementById('backText').value = '';
        toggleInputFields();
    } else {
        alert('Bitte Vorder- und Rückseite ausfüllen!');
    }
}

function toggleInputFields() {
    const inputContainer = document.getElementById('inputContainer');
    inputContainer.style.display = inputContainer.style.display === 'none' ? 'block' : 'none';
}

function setMode(newMode) {
    mode = newMode;
    modeIndicator.innerText = `Modus: ${mode === 'connect' ? 'Verbindungsmodus' : 'Karten erstellen'}`;
    // Aktive Karte zurücksetzen beim Moduswechsel
    if (selectedCard) {
        selectedCard.classList.remove('active');
        selectedCard = null;
    }
    // Cursor-Style für alle Karten aktualisieren
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.cursor = mode === 'connect' ? 'pointer' : 'move';
    });
}

cardContainer.addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    if (!card) return;

    if (mode === 'connect') {
        selectCard(card);
    } else {
        toggleCard(card);
    }
    event.stopPropagation();
});

function toggleCard(card) {
    card.classList.toggle('flipped');
}

function selectCard(card) {
    if (selectedCard === null) {
        selectedCard = card;
        card.classList.add('active');
    } else {
        if (selectedCard !== card) {
            // Prüfen ob Verbindung bereits existiert
            if (!connectionExists(selectedCard, card)) {
                drawConnection(selectedCard, card);
                connections.push({ card1: selectedCard, card2: card });
            }
        }
        selectedCard.classList.remove('active');
        selectedCard = null;
    }
}

function connectionExists(card1, card2) {
    return connections.some(conn => 
        (conn.card1 === card1 && conn.card2 === card2) ||
        (conn.card1 === card2 && conn.card2 === card1)
    );
}

function drawConnection(card1, card2) {
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();
    
    // Mittelpunkte der Karten berechnen
    const startX = rect1.left + rect1.width / 2;
    const startY = rect1.top + rect1.height / 2;
    const endX = rect2.left + rect2.width / 2;
    const endY = rect2.top + rect2.height / 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(conn => {
        if (conn.card1.isConnected && conn.card2.isConnected) {
            drawConnection(conn.card1, conn.card2);
        }
    });
}

// Verbesserte Version der makeCardDraggable Funktion
function makeCardDraggable(card) {
    let isDragging = false;
    
    card.addEventListener('mousedown', startDragging);
    card.addEventListener('touchstart', startDragging);

    function startDragging(e) {
        // Nur im Erstellmodus Drag erlauben
        if (mode === 'connect') return;
        
        isDragging = true;
        e.preventDefault();
        const startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        const startLeft = card.offsetLeft;
        const startTop = card.offsetTop;

        function dragMove(e) {
            if (!isDragging) return;
            
            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            const newLeft = startLeft + currentX - startX;
            const newTop = startTop + currentY - startY;

            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            redrawConnections();
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('touchend', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('touchend', dragEnd);
    }
}