$(document).ready(function() {
  
  const minute = 60; // secs
  const second = 1000; // ms
  
  // set up state
  
  var workTimer = 25 * minute; // minutes
  var breakTimer = 5 * minute; // minutes
  
  var working = true;
  var paused = true;
  var audioPlayback = true;
  
  var testMode = false;
  
  if (testMode) {
    workTimer = 0.1 * minute;
    breakTimer = 0.1 * minute;
  } 
  
  // we'll need these later
  
  var currentTimer = working ? workTimer : breakTimer;
  
  var timeStarted = 0, timeNow = 0, timeElapsed = 0, startOfPause = 0, endOfPause = 0, totalPause = 0;
  
  // media
    
  var steel_drums = new Audio('sounds/steel_drums.mp3');
  var arpeggio = new Audio('sounds/arpeggio.mp3');
  /* credit:
  - https://www.freesound.org/people/kaponja/sounds/54217/
  and
  - https://www.freesound.org/people/ajubamusic/sounds/320806/
  */
  
  /* ==========================================
  |              Initialize UI                |
  ===========================================*/
  
  $('#workTimer').val(workTimer / minute);
  $('#breakTimer').val(breakTimer / minute);
  
  function addLeadingZeroes(iNum, oLen) {
    var oNum = '';
    while (iNum.toString().length + oNum.length < oLen) {
      oNum += '0';
    }
    oNum += iNum.toString();
    return oNum;
  }
  
  function writeTime() {
    $('#timerDisplay').html(Math.floor((currentTimer - timeElapsed) / minute) + ':' + addLeadingZeroes(Math.floor(currentTimer - timeElapsed) % minute, 2));
  }
  
  writeTime();
  
  /* ==========================================
  | Writing status + switching between timers |
  ===========================================*/
  
  function writeStatus() {
    $('#status').css('opacity', '0');
    if (paused) {
      $('#status').html('Paused...');
    } else if (working) {
      $('#status').html('Time to work!');
    } else {
      $('#status').html('Ripening... Take a break!');
    }
    $('#status').animate({opacity: 1}, second);
  }
  
  function switchover() {
    timeStarted = Date.now() / second;
    timeNow = timeElapsed = startOfPause = endOfPause = totalPause = 0;
    if (working) {
      currentTimer = breakTimer;
      working = false;
      if (audioPlayback) {
        steel_drums.play();
      }
    } else {
      currentTimer = workTimer;
      working = true;
      if (audioPlayback) {
        arpeggio.play();
      }
    }
    writeStatus();
    writeTime();
  }
  
  /* ==========================================
  |                Countdown                  |
  ===========================================*/
  
  function refreshTimeElapsed() {
    timeNow = Date.now() / second;
    timeElapsed = timeNow - timeStarted - totalPause;
   }
  
  var countdownTimeout;
  
  function countdown() {
        
    refreshTimeElapsed();
    
    if (timeElapsed >= currentTimer) {
      switchover();
    } else {
      writeTime();
      if (working) {
        sliceTomato(Math.floor(currentTimer), Math.floor(timeElapsed + 1));
      } else {
        ripenTomato(Math.floor(currentTimer), Math.floor(timeElapsed + 1));
      }
    }
    
    var timeToNext = ((timeElapsed * second) - (timeElapsed * second) % second) - (timeElapsed * second - second);
    
    countdownTimeout = setTimeout(countdown, timeToNext < second ? timeToNext : timeToNext - second);
    console.log(timeToNext);
    
  }
  
  /* ===========================================
  |       Start and stop counting down         |
  ============================================*/
  
  function startStopTimer(e) {
    
    e.preventDefault();
    
    if (timeStarted === 0) {
      timeStarted = Date.now() / second;
    }
    
    refreshTimeElapsed();
    
    if (paused) {
      if (startOfPause !== 0) {
        endOfPause = Date.now() / second;
        totalPause += endOfPause - startOfPause;
        refreshTimeElapsed();
        startOfPause = 0;
      }
      
      countdown();
      paused = false;
    
    } else {
      clearTimeout(countdownTimeout);
      paused = true;
      startOfPause = Date.now() / second;
    }
    writeStatus();
  }
  
  $('#startStop').click(function(e) {startStopTimer(e)});
  
  $('#startStop').keydown(function(e) {
    var keyCode = e.which;
    if (keyCode === 13 || keyCode === 32) {
      // enter and space
      startStopTimer(e);
    }
  });
  
  /* ===========================================
  |               Tomato animations            |
  ============================================*/
  
  function sliceTomato(secondsToCount, oneIdxedCurrentSecond) {
    
    //assume width === height - only works for perfect circles within perfect squares

    var diameter = $('#cutout').width();

    var radius = diameter/2;
    var over180Deg;
    var clockHandX;
    var clockHandY;
    
    var startpoint = 90;  

    var currentDegrees = ((oneIdxedCurrentSecond/secondsToCount) * 360) + startpoint;
    var currentRadians = currentDegrees * (Math.PI / 180);

    clockHandX = radius - (radius * Math.cos(currentRadians));

    clockHandY = radius - (radius * Math.sin(currentRadians));

    over180Deg = currentDegrees > 180 ? 1 : 0;

    if (oneIdxedCurrentSecond === secondsToCount) {
      $('#cutout').html(`
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#5e4" />
      `)
    } else {
      $('#cutout').html(`
        <path d="M ${radius} ${radius}
        L ${radius} 0
        A ${radius} ${radius},
        0,
        ${over180Deg},
        1,
        ${clockHandX} ${clockHandY}
        Z"
        fill="#5e4"
        />
      `); // fill is $main-background-color from SCSS
    }
  }
  
  function ripenTomato(secondsToCount, oneIdxedCurrentSecond) {
    
    $('#cutout').html('');
    
    $('#breakTimerImg').css('opacity', 1 - oneIdxedCurrentSecond/secondsToCount);
    
  }
  
  /* ===========================================
  |                 Misc UI stuff              |
  ============================================*/
  
  function validate(input) {
    if (isNaN(input) || input < 1 || input > 60) {
      return false;
    } else {
      return true;
    }
  }
  
  $('#workTimer').change(function() {
    var input = $(this).val();
    if (!validate(input)) {
      alert('Please input a number between 1 and 60.');
      $(this).val(workTimer / minute);
    } else {
      workTimer = input * minute;
      if (working) {
        working = false;
        switchover();
      }
    }
  });

  $('#breakTimer').change(function() {
    var input = $(this).val();
    if (!validate(input)) {
      alert('Please input a number between 1 and 60.');
      $(this).val(breakTimer / minute);
    } else {
      breakTimer = input * minute;
      if (!working) {
        working = true;
        switchover();
      }
    }
  });
  
  $('#soundControls').click(function() {
    
    if (audioPlayback) {
      $('#soundMute').css('opacity', '0');
      $('#soundOn').css('opacity', '1');
    } else {
      $('#soundOn').css('opacity', '0');
      $('#soundMute').css('opacity', '1');
    }
    audioPlayback = !audioPlayback;
    
  });
  
  $('#soundControls').keydown(function(e) {
    var keyCode = e.which;
    if (keyCode === 13 || keyCode === 32) {
      // enter and space
      $(this).click();
    }
  });
  
});
