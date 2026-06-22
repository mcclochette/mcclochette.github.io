const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const celebration = document.getElementById('celebration');
const confettiContainer = document.querySelector('.confetti');
const successMessage = document.getElementById('successMessage');
const dateTimePicker = document.getElementById('dateTimePicker');
const finalMessage = document.getElementById('finalMessage');

// Calendar and date elements
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const monthYearDisplay = document.getElementById('monthYear');
const calendarGrid = document.getElementById('calendarGrid');
const confirmBtn = document.getElementById('confirmBtn');
const dateTimeDisplay = document.getElementById('dateTimeDisplay');

// Food picker elements
const foodPicker = document.getElementById('foodPicker');
const confirmFoodBtn = document.getElementById('confirmFoodBtn');
const foodDisplay = document.getElementById('foodDisplay');

// Track state
let celebrating = false;
let selectedDate = null;
let selectedTime = null;
let selectedFood = null;
let currentCalendarMonth = new Date();

// Constants
const EVASION_DISTANCE = 80;
const BOUNDARY_RADIUS = 180;

// Get random position within boundary around Yes button
function getRandomPositionAroundYes() {
    const yesRect = yesBtn.getBoundingClientRect();
    const yesX = yesRect.left + yesRect.width / 2;
    const yesY = yesRect.top + yesRect.height / 2;
    
    let x, y, distance;
    
    do {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * BOUNDARY_RADIUS + 50;
        x = yesX + Math.cos(angle) * radius;
        y = yesY + Math.sin(angle) * radius;
        
        x = Math.max(10, Math.min(x, window.innerWidth - 120));
        y = Math.max(10, Math.min(y, window.innerHeight - 60));
        
        distance = Math.hypot(x - yesX, y - yesY);
    } while (distance < BOUNDARY_RADIUS / 2);
    
    return { x, y };
}

// Initialize No button position
function initializeNoButton() {
    const pos = getRandomPositionAroundYes();
    noBtn.style.left = pos.x + 'px';
    noBtn.style.top = pos.y + 'px';
}

// Track mouse position and evade
document.addEventListener('mousemove', (e) => {
    if (celebrating) return;
    
    const noBtnRect = noBtn.getBoundingClientRect();
    const noBtnX = noBtnRect.left + noBtnRect.width / 2;
    const noBtnY = noBtnRect.top + noBtnRect.height / 2;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const distance = Math.hypot(mouseX - noBtnX, mouseY - noBtnY);
    
    if (distance < EVASION_DISTANCE) {
        const pos = getRandomPositionAroundYes();
        noBtn.style.left = pos.x + 'px';
        noBtn.style.top = pos.y + 'px';
        
        noBtn.style.animation = 'none';
        setTimeout(() => {
            noBtn.style.animation = '';
        }, 10);
    }
});

// Prevent clicking the No button
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

noBtn.addEventListener('mousedown', (e) => {
    if (e.button !== 2) {
        const pos = getRandomPositionAroundYes();
        noBtn.style.left = pos.x + 'px';
        noBtn.style.top = pos.y + 'px';
    }
});

// Yes button click handler
yesBtn.addEventListener('click', () => {
    celebrating = true;
    celebration.classList.add('show');
    createConfetti();
    
    // Show success message then transition to date picker
    setTimeout(() => {
        successMessage.style.display = 'none';
        dateTimePicker.style.display = 'block';
        renderCalendar();
    }, 2000);
});

// Calendar functions
function renderCalendar() {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    
    // Update header
    monthYearDisplay.textContent = currentCalendarMonth.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const weekdayEl = document.createElement('div');
        weekdayEl.className = 'calendar-weekday';
        weekdayEl.textContent = day;
        calendarGrid.appendChild(weekdayEl);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = daysInPrevMonth - i;
        calendarGrid.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        const dateObj = new Date(year, month, day);
        dateObj.setHours(0, 0, 0, 0);
        
        // Calculate max date (5 days from today)
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 5);
        
        // Disable past dates and dates beyond 5 days in advance
        if (dateObj < today || dateObj > maxDate) {
            dayEl.classList.add('disabled');
        } else {
            dayEl.addEventListener('click', () => selectDate(dateObj, dayEl));
        }
        
        // Highlight selected date
        if (selectedDate && 
            selectedDate.getFullYear() === year && 
            selectedDate.getMonth() === month && 
            selectedDate.getDate() === day) {
            dayEl.classList.add('selected');
        }
        
        calendarGrid.appendChild(dayEl);
    }
    
    // Next month days
    const totalCells = calendarGrid.children.length - 7; // Subtract weekday headers
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        calendarGrid.appendChild(dayEl);
    }
}

function selectDate(dateObj, element) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to new date
    element.classList.add('selected');
    selectedDate = dateObj;
}

// Calendar navigation
prevMonthBtn.addEventListener('click', () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1);
    renderCalendar();
});

// Time selection
document.querySelectorAll('input[name="time"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedTime = e.target.value;
    });
});

// Food selection
document.querySelectorAll('input[name="food"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        selectedFood = e.target.value;
    });
});

// Confirm food button
confirmFoodBtn.addEventListener('click', () => {
    if (!selectedFood) {
        alert('Please select a food option! 🍽️');
        return;
    }
    
    // Format the date and time
    const dateStr = selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const timeLabel = ['5pm', '6pm', '7pm', '8pm', '9pm'][parseInt(selectedTime) - 17];
    
    // Format food choice
    const foodEmojis = {
        pizza: '🍕',
        sushi: '🍣',
        burger: '🍔',
        pasta: '🍝',
        taco: '🌮',
        pokeball: '⚫⚪'
    };
    
    const foodLabel = selectedFood.charAt(0).toUpperCase() + selectedFood.slice(1);
    const foodEmoji = foodEmojis[selectedFood] || '';
    
    // Show final message
    foodPicker.style.display = 'none';
    finalMessage.style.display = 'block';
    dateTimeDisplay.textContent = `Our date: ${dateStr} at ${timeLabel}`;
    foodDisplay.textContent = `We're eating: ${foodEmoji} ${foodLabel}`;
    
    // More confetti for celebration
    createConfetti();
});

// Confirm button
confirmBtn.addEventListener('click', () => {
    if (!selectedDate || !selectedTime) {
        alert('Please select both a date and time! 💕');
        return;
    }
    
    // Show food picker
    dateTimePicker.style.display = 'none';
    foodPicker.style.display = 'block';
});

// Create confetti effect
function createConfetti() {
    const confettiPieces = 50;
    const colors = ['#ff6b9d', '#ff8fab', '#ffd6e8', '#ffe5f0', '#fff0f7'];
    
    for (let i = 0; i < confettiPieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.width = Math.random() * 10 + 5 + 'px';
        piece.style.height = piece.style.width;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
        piece.style.opacity = Math.random() * 0.7 + 0.3;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        confettiContainer.appendChild(piece);
        
        const duration = Math.random() * 2000 + 2000;
        const xOffset = (Math.random() - 0.5) * 400;
        
        piece.animate([
            {
                transform: `translateY(0) translateX(0) rotate(0deg)`,
                opacity: Math.random() * 0.7 + 0.3
            },
            {
                transform: `translateY(${window.innerHeight + 100}px) translateX(${xOffset}px) rotate(720deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    initializeNoButton();
});

// Reinitialize No button position on window resize
window.addEventListener('resize', () => {
    if (!celebrating) {
        initializeNoButton();
    }
});
