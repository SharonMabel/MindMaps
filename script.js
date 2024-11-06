// Globale Variablen
let selectedCard = null;
let mode = 'create';
let connections = [];
let gridSize = 50;
let lineColor = "#0000ff";
let lineStyle = "solid";
let lineWidth = 2;

// Canvas Setup
const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Funktion zum Zeichnen des Rasters
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;

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
    card.classList.toggle('locked');
    lockIcon.classList.toggle('locked');
    lockIcon.classList.toggle('unlocked');
}

// Karten hinzufügen
function addCard() {
    const frontText = document.getElementById('frontText').value;
    const backText = document.getElementById('backText').value;
    const cardContainer = document.getElementById('cardContainer');

    if (frontText && backText) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.width = '300px';
        card.style.height = '200px';
        card.style.position = 'absolute';
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
        card.querySelector('.lock-icon').classList.add('unlocked');
        
        document.getElementById('frontText').value = '';
        document.getElementById('backText').value = '';
    }
}

// Karten verschiebbar machen
function makeCardDraggable(card) {
    card.addEventListener('mousedown', startDragging);

    function startDragging(e) {
        if (card.classList.contains('locked') || e.target.classList.contains('lock-icon')) {
            return;
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

// Verbindung zeichnen
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

// Einstellungsmenü
const settingsMenu = document.getElementById('settingsMenu');
const modeToggle = document.getElementById('modeToggle');
const lineColorInput = document.getElementById('lineColor');
const lineStyleSelect = document.getElementById('lineStyle');
const lineWidthInput = document.getElementById('lineWidth');

// Toggle Verbindungsmodus
modeToggle.addEventListener('click', () => {
    mode = mode === 'connect' ? 'create' : 'connect';
    modeToggle.textContent = `Modus: ${mode === 'connect' ? 'Verbinden' : 'Erstellen'}`;
    settingsMenu.classList.toggle('hidden', mode === 'connect');
});

// Einstellungen aktualisieren
lineColorInput.addEventListener('input', () => {
    lineColor = lineColorInput.value;
    redrawConnections();
});

lineStyleSelect.addEventListener('change', () => {
    lineStyle = lineStyleSelect.value;
    redrawConnections();
});

lineWidthInput.addEventListener('input', () => {
    lineWidth = parseInt(lineWidthInput.value);
    redrawConnections();
});

// Initiales Setup
window.addEventListener('load', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
});

// Event Listener für Fenstergrößenänderungen
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawConnections();
});
// ... (vorheriger Code bleibt unverändert bis zum Event Listener für Fenstergrößenänderungen)

// Funktion zum Laden der Karten aus JSON
async function loadCards() {
    try {
        console.log('Fetching cards from JSON...');
        const response = await fetch('https://sharonmabel.github.io/MindMaps/cards.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const cards = await response.json();
        console.log('Loaded cards:', cards);

        const cardContainer = document.getElementById('cardContainer');
        cardContainer.innerHTML = ''; // Container leeren
        
        // Karten aus JSON erstellen
        cards.forEach((cardData, index) => {
            console.log('Creating card:', cardData);
            
            const card = document.createElement('div');
            card.classList.add('card');
            card.style.width = '300px';
            card.style.height = '200px';
            card.style.position = 'absolute';
            
            // Position aus JSON verwenden oder Standard-Position setzen
            card.style.top = cardData.top || `${50 + (index * 20)}px`;
            card.style.left = cardData.left || `${50 + (index * 20)}px`;
            
            card.innerHTML = `
                <div class="card-front"><h2>${cardData.frontText}</h2></div>
                <div class="card-back"><p>${cardData.backText}</p></div>
                <img src="https://sharonmabel.github.io/MindMaps/Black%20Lock%20Icon.png" class="lock-icon" onclick="toggleLock(this)">
            `;

            // Karte zum Container hinzufügen
            cardContainer.appendChild(card);
            
            // Event Listener und Funktionalität hinzufügen
            card.addEventListener('click', () => handleCardClick(card));
            makeCardDraggable(card);
            
            // Lock-Status setzen
            const lockIcon = card.querySelector('.lock-icon');
            lockIcon.classList.add('unlocked');
            if (cardData.locked) {
                toggleLock(lockIcon);
            }
        });

        // Verbindungen aus JSON laden, falls vorhanden
        if (cards.connections) {
            cards.connections.forEach(conn => {
                const card1 = cardContainer.children[conn.from];
                const card2 = cardContainer.children[conn.to];
                if (card1 && card2) {
                    drawConnection(card1, card2);
                }
            });
        }

    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

// Funktion zum Speichern des aktuellen Zustands als JSON
function saveCardsToJSON() {
    const cardContainer = document.getElementById('cardContainer');
    const cards = Array.from(cardContainer.children).map(card => ({
        frontText: card.querySelector('.card-front h2').textContent,
        backText: card.querySelector('.card-back p').textContent,
        top: card.style.top,
        left: card.style.left,
        locked: card.classList.contains('locked')
    }));

    // Verbindungen speichern
    const connectionData = connections.map(conn => ({
        from: Array.from(cardContainer.children).indexOf(conn.card1),
        to: Array.from(cardContainer.children).indexOf(conn.card2)
    }));

    const saveData = {
        cards: cards,
        connections: connectionData
    };

    // JSON-String erstellen
    const jsonString = JSON.stringify(saveData, null, 2);
    console.log('Saved JSON:', jsonString);
    
    // Optional: Download als Datei anbieten
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Initiales Setup erweitern
window.addEventListener('load', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
    loadCards(); // Karten beim Start laden
});

// Optional: Speicher-Button zum Interface hinzufügen
const saveButton = document.createElement('button');
saveButton.textContent = 'Mindmap speichern';
saveButton.onclick = saveCardsToJSON;
document.body.appendChild(saveButton);