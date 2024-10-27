let selectedCard = null;
let mode = 'create'; // Startet im Erstellmodus
let connections = [];

const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function addCard() {
    const frontText = document.getElementById('frontText').value;
    const backText = document.getElementById('backText').value;
    const cardContainer = document.getElementById('cardContainer');

    if (frontText && backText) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.top = '50px';
        card.style.left = '50px';
        card.innerHTML = `
            <div class="card-front"><h2>${frontText}</h2></div>
            <div class="card-back"><p>${backText}</p></div>
        `;
        
        cardContainer.appendChild(card);
        card.addEventListener('click', () => handleCardClick(card));
        makeCardDraggable(card);

        document.getElementById('frontText').value = '';
        document.getElementById('backText').value = '';
    }
}

function toggleConnectMode() {
    mode = mode === 'connect' ? 'create' : 'connect';
    document.querySelector("button[onclick='toggleConnectMode()']").innerText = `Verbindungsmodus: ${mode === 'connect' ? 'An' : 'Aus'}`;
}

function handleCardClick(card) {
    if (mode === 'connect') {
        if (selectedCard === null) {
            selectedCard = card;
            card.classList.add('active');
        } else if (selectedCard !== card) {
            drawConnection(selectedCard, card);
            connections.push({ card1: selectedCard, card2: card });
            selectedCard.classList.remove('active');
            selectedCard = null;
        }
    } else {
        toggleCard(card);
    }
}

function toggleCard(card) {
    card.classList.toggle('flipped');
}

function makeCardDraggable(card) {
    card.addEventListener('mousedown', startDragging);

    function startDragging(e) {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = card.offsetLeft;
        const startTop = card.offsetTop;

        function dragMove(e) {
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            redrawConnections();
        }

        function dragEnd() {
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
}

function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(conn => drawConnection(conn.card1, conn.card2));
}

function drawConnection(card1, card2) {
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();
    const startX = rect1.left + rect1.width / 2;
    const startY = rect1.top + rect1.height / 2;
    const endX = rect2.left + rect2.width / 2;
    const endY = rect2.top + rect2.height / 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineColor;          // Farbe setzen
    ctx.lineWidth = lineWidth;            // Breite setzen
    ctx.setLineDash(lineStyle === 'dashed' ? [5, 5] : lineStyle === 'dotted' ? [2, 2] : []); // Stil setzen
    ctx.stroke();

    ctx.setLineDash([]); // Zurücksetzen auf Standard
}
function updateModeIndicator() {
    const modeIndicator = document.getElementById('modeIndicator');
    modeIndicator.innerText = `Modus: ${mode === 'connect' ? 'Verbindungsmodus' : 'Erstellen'}`;
}
function toggleConnectMode() {
    mode = mode === 'connect' ? 'create' : 'connect';
    document.querySelector("button[onclick='toggleConnectMode()']").innerText = `Verbindungsmodus: ${mode === 'connect' ? 'An' : 'Aus'}`;
    updateModeIndicator(); // Modusanzeige aktualisieren
}
// Aktuelle Verbindungseinstellungen
let lineColor = "#0000ff"; // Standardfarbe Blau
let lineStyle = "solid";   // Standardstil Durchgezogen
let lineWidth = 2;         // Standardbreite

// Event Listener für Verbindungseinstellungen
document.getElementById('lineColor').addEventListener('change', (e) => {
    lineColor = e.target.value;
});

document.getElementById('lineStyle').addEventListener('change', (e) => {
    lineStyle = e.target.value;
});

document.getElementById('lineWidth').addEventListener('change', (e) => {
    lineWidth = parseInt(e.target.value);
});
