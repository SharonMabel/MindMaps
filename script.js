let selectedCard = null;
let mode = null;
let offsetX, offsetY;
let connections = [];

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
    if (selectedCard) {
        selectedCard.classList.remove('active');
        selectedCard = null;
    }
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
    } else if (selectedCard !== card) {
        drawConnection(selectedCard, card);
        selectedCard.classList.remove('active');
        selectedCard = null;
    }
}

function drawConnection(card1, card2) {
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();
    const startX = rect1.left + rect1.width / 2 + window.pageXOffset;
    const startY = rect1.top + rect1.height / 2 + window.pageYOffset;
    const endX = rect2.left + rect2.width / 2 + window.pageXOffset;
    const endY = rect2.top + rect2.height / 2 + window.pageYOffset;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    connections.push({ card1, card2 });
    console.log(`Verbindung gezeichnet von Karte1 (${startX}, ${startY}) zu Karte2 (${endX}, ${endY})`);
}

function redrawConnections() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connections.forEach(conn => {
        const rect1 = conn.card1.getBoundingClientRect();
        const rect2 = conn.card2.getBoundingClientRect();
        const startX = rect1.left + rect1.width / 2 + window.pageXOffset;
        const startY = rect1.top + rect1.height / 2 + window.pageYOffset;
        const endX = rect2.left + rect2.width / 2 + window.pageXOffset;
        const endY = rect2.top + rect2.height / 2 + window.pageYOffset;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function makeCardDraggable(card) {
    card.addEventListener('mousedown', startDragging);
    card.addEventListener('touchstart', startDragging);

    function startDragging(e) {
        e.preventDefault();
        const startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        const startLeft = card.offsetLeft;
        const startTop = card.offsetTop;

        function dragMove(e) {
            const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            const newLeft = startLeft + currentX - startX;
            const newTop = startTop + currentY - startY;

            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
            redrawConnections();
        }

        function dragEnd() {
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

function changeFont(fontFamily) {
    if (selectedCard) {
        selectedCard.style.fontFamily = fontFamily;
    }
}

function changeColor(color) {
    if (selectedCard) {
        selectedCard.style.color = color;
    }
}

function toggleBold() {
    if (selectedCard) {
        selectedCard.style.fontWeight = selectedCard.style.fontWeight === 'bold' ? 'normal' : 'bold';
    }
}

function resizeCard(factor) {
    if (selectedCard) {
        const currentWidth = parseInt(getComputedStyle(selectedCard).width);
        const currentHeight = parseInt(getComputedStyle(selectedCard).height);
        selectedCard.style.width = `${currentWidth * factor}px`;
        selectedCard.style.height = `${currentHeight * factor}px`;
        redrawConnections();
    }
}
