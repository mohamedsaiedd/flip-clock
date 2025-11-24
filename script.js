// Flip clock logic for old Safari browsers (ES5 compatible)
(function() {
    'use strict';
    
    var flipCards = {
        hoursTens: document.getElementById('hours-tens'),
        hoursOnes: document.getElementById('hours-ones'),
        minutesTens: document.getElementById('minutes-tens'),
        minutesOnes: document.getElementById('minutes-ones')
    };
    
    var periodElement = document.getElementById('period');
    var dateElement = document.getElementById('date');
    
    var currentTime = {
        hoursTens: 0,
        hoursOnes: 0,
        minutesTens: 0,
        minutesOnes: 0
    };
    
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    var timeOffset = 0; // Offset in milliseconds from local time
    var useLocalTime = false;
    
    function padZero(num) {
        return num < 10 ? '0' + num : num.toString();
    }
    
    function flipCard(card, newValue) {
        var topSpan = card.querySelector('.flip-card-top span');
        var bottomSpan = card.querySelector('.flip-card-bottom span');
        var backTopSpan = card.querySelector('.flip-card-back-top span');
        var backBottomSpan = card.querySelector('.flip-card-back-bottom span');
        
        // Set the new value on the back cards
        backTopSpan.textContent = newValue;
        backBottomSpan.textContent = newValue;
        
        // Add flipping class
        card.classList.add('flipping');
        
        // After animation completes, update front cards and remove class
        setTimeout(function() {
            topSpan.textContent = newValue;
            bottomSpan.textContent = newValue;
            card.classList.remove('flipping');
        }, 600);
    }
    
    function getCurrentTime() {
        var now = new Date();
        if (!useLocalTime) {
            // Apply offset from world time API
            now = new Date(now.getTime() + timeOffset);
        }
        return now;
    }
    
    function updateClock() {
        var now = getCurrentTime();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        
        // Determine AM/PM
        var period = hours >= 12 ? 'PM' : 'AM';
        periodElement.textContent = period;
        
        // Update date
        var dayName = dayNames[now.getDay()];
        var monthName = monthNames[now.getMonth()];
        var day = now.getDate();
        var year = now.getFullYear();
        dateElement.textContent = dayName + ', ' + monthName + ' ' + day + ', ' + year;
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        var hoursStr = padZero(hours);
        var minutesStr = padZero(minutes);
        
        var newTime = {
            hoursTens: parseInt(hoursStr[0]),
            hoursOnes: parseInt(hoursStr[1]),
            minutesTens: parseInt(minutesStr[0]),
            minutesOnes: parseInt(minutesStr[1])
        };
        
        // Update each digit if changed
        if (newTime.hoursTens !== currentTime.hoursTens) {
            flipCard(flipCards.hoursTens, newTime.hoursTens);
            currentTime.hoursTens = newTime.hoursTens;
        }
        
        if (newTime.hoursOnes !== currentTime.hoursOnes) {
            flipCard(flipCards.hoursOnes, newTime.hoursOnes);
            currentTime.hoursOnes = newTime.hoursOnes;
        }
        
        if (newTime.minutesTens !== currentTime.minutesTens) {
            flipCard(flipCards.minutesTens, newTime.minutesTens);
            currentTime.minutesTens = newTime.minutesTens;
        }
        
        if (newTime.minutesOnes !== currentTime.minutesOnes) {
            flipCard(flipCards.minutesOnes, newTime.minutesOnes);
            currentTime.minutesOnes = newTime.minutesOnes;
        }
    }
    
    // Fetch world time from API
    function syncWorldTime() {
        // Using WorldTimeAPI - free and reliable
        fetch('https://worldtimeapi.org/api/ip')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                var serverTime = new Date(data.datetime);
                var localTime = new Date();
                timeOffset = serverTime.getTime() - localTime.getTime();
                useLocalTime = false;
                console.log('Synced with world time. Offset:', timeOffset, 'ms');
            })
            .catch(function(error) {
                console.log('Failed to sync with world time, using local time:', error);
                useLocalTime = true;
            });
    }
    
    // Sync time on load
    syncWorldTime();
    
    // Re-sync every hour to maintain accuracy
    setInterval(syncWorldTime, 3600000);
    
    // Initialize clock immediately
    updateClock();
    
    // Update every second
    setInterval(updateClock, 1000);
    
    // Theme toggle functionality
    var themeToggle = document.getElementById('theme-toggle');
    var body = document.body;
    var themeIcon = themeToggle.querySelector('.icon');
    
    // Load saved theme
    var savedTheme = localStorage.getItem('flipClockTheme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        themeIcon.textContent = '🌙';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');
        var isLight = body.classList.contains('light-theme');
        themeIcon.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('flipClockTheme', isLight ? 'light' : 'dark');
    });
    
    // Fullscreen toggle functionality
    var fullscreenToggle = document.getElementById('fullscreen-toggle');
    
    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || 
                  document.mozFullScreenElement || document.msFullscreenElement ||
                  document.webkitIsFullScreen || document.mozFullScreen);
    }
    
    function enterFullscreen() {
        var elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.webkitEnterFullscreen) {
                elem.webkitEnterFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } catch (e) {
            console.log('Fullscreen error:', e);
        }
    }
    
    function exitFullscreen() {
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } catch (e) {
            console.log('Exit fullscreen error:', e);
        }
    }
    
    fullscreenToggle.addEventListener('click', function() {
        if (isFullscreen()) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    });
})();
