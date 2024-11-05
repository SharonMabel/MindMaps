let selectedCard = null;
let mode = 'create';
let connections = [];
let gridSize = 20;

const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Verbindungseinstellungen
let lineColor = "#0000ff";
let lineStyle = "solid";
let lineWidth = 2;

// Funktion zum Zeichnen des Rasters
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

// Einrasten in das Raster
function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
}

// Toggle Lock-Status
function toggleLock(lockIcon) {
    const card = lockIcon.parentElement;
    const isLocked = card.classList.toggle('locked');

    if (isLocked) {
        lockIcon.src = 'https://sharonmabel.github.io/MindMaps/Black%20Lock%20Icon.png'; // Gesperrtes Schloss anzeigen
        lockIcon.style.opacity = '1';
    } else {
        lockIcon.src = 'https://sharonmabel.github.io/MindMaps/Open%20Lock%20Icon.png'; // Offenes Schloss anzeigen
        lockIcon.style.opacity = '0.5';
    }
}


// Karten hinzufügen
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
            <img src="https://sharonmabel.github.io/MindMaps/Black%20Lock%20Icon.png" class="lock-icon" onclick="toggleLock(this)">
        `;

        cardContainer.appendChild(card);
        card.addEventListener('click', () => handleCardClick(card));
        makeCardDraggable(card);
        card.querySelector('.lock-icon').style.filter = 'opacity(0.5)';

        document.getElementById('frontText').value = '';
        document.getElementById('backText').value = '';
    }
}

// Karten verschiebbar machen und prüfen, ob die Karte gesperrt ist
function makeCardDraggable(card) {
    card.addEventListener('mousedown', startDragging);

    function startDragging(e) {
        if (card.classList.contains('locked') || e.target.classList.contains('lock-icon')) {
            return; // Wenn gesperrt oder das Lock-Icon angeklickt wird, verschieben verhindern
        }

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
            const finalLeft = snapToGrid(card.offsetLeft);
            const finalTop = snapToGrid(card.offsetTop);
            card.style.transition = 'all 0.2s ease';
            card.style.left = `${finalLeft}px`;
            card.style.top = `${finalTop}px`;

            setTimeout(() => {
                card.style.transition = '';
            }, 200);

            redrawConnections();
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }
}

// Überprüfung, ob eine Verbindung bereits existiert
function connectionExists(card1, card2) {
    return connections.some(conn => 
        (conn.card1 === card1 && conn.card2 === card2) ||
        (conn.card1 === card2 && conn.card2 === card1)
    );
}

// Verbindung zeichnen (falls keine doppelte Verbindung existiert)
function drawConnection(card1, card2) {
    if (!connectionExists(card1, card2)) {
        connections.push({ card1, card2 });
    }
    redrawConnections();
}

// Verbindungen neu zeichnen
function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    connections.forEach(conn => {
        const rect1 = conn.card1.getBoundingClientRect();
        const rect2 = conn.card2.getBoundingClientRect();
        const startX = rect1.left + rect1.width / 2;
        const startY = rect1.top + rect1.height / 2;
        const endX = rect2.left + rect2.width / 2;
        const endY = rect2.top + rect2.height / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(lineStyle === 'dashed' ? [5, 5] : lineStyle === 'dotted' ? [2, 2] : []);
        ctx.stroke();
    });
    ctx.setLineDash([]);
}

// Karteninteraktionen
function handleCardClick(card) {
    if (mode === 'connect') {
        if (selectedCard === null) {
            selectedCard = card;
            card.classList.add('active');
        } else if (selectedCard !== card) {
            drawConnection(selectedCard, card);
            selectedCard.classList.remove('active');
            selectedCard = null;
        }
    } else {
        toggleCard(card);
    }
}

// Karte umdrehen
function toggleCard(card) {
    card.classList.toggle('flipped');
}

// Initiales Raster zeichnen
drawGrid();

// Event Listener für Fenstergrößenänderungen
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawConnections();
});

//Funktion JSON Cards
async function loadCards() {
    const response = await fetch('https://sharonmabel.github.io/MindMaps/cards.json');
    const cards = await response.json();
    
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = ''; // Leeren des Containers vor dem Hinzufügen

    cards.forEach(cardData => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-front"><h2>${cardData.frontText}</h2></div>
            <div class="card-back"><p>${cardData.backText}</p></div>
        `;
        cardContainer.appendChild(card);
    });
}

// Ruft die Karten beim Laden der Seite ab
window.onload = loadCards;
