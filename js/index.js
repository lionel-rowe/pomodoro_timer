$(document).ready(function() {
  
  // TODO
  // * Fix timing of pauses (sometimes skips a second)
  // * Make timers skip 0
  
  const minute = 60; // secs
  const second = 1000; // ms
  
  // set up state
  
  var workTimer = 25 * minute; // minutes
  var breakTimer = 5 * minute; // minutes
  
  // media
    
  var steel_drums = new Audio('sounds/steel_drums.mp3');
  var arpeggio = new Audio('sounds/arpeggio.mp3');
  /* credit:
  - https://www.freesound.org/people/kaponja/sounds/54217/
  and
  - https://www.freesound.org/people/ajubamusic/sounds/320806/
  */
  
  /* uncomment to turn on test mode
  
  var testMode = true;
  
  if (testMode) {
    workTimer = 0.1 * minute;
    breakTimer = 0.1 * minute;
  } */
  
  
  var working = true;
  var paused = true;
  var audioPlayback = true;
  var currentTimer = working ? workTimer : breakTimer;
  
  // initialize UI
  
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
    $('#timerDisplay').html(Math.floor(currentTimer / minute) + ':' + addLeadingZeroes(currentTimer % minute, 2));
  }
  
  writeTime();
  
  function switchover() {
    totalPause = 0;
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

  var timeStarted, timeNow, timeElapsed, startOfPause, endOfPause, totalPause = 0;
  
  var secondsToCount, currentSecond, oneIdxedCurrentSecond;
  
  function countdown() {
    
    secondsToCount = working ? workTimer : breakTimer;
    currentSecond = secondsToCount - currentTimer;
    oneIdxedCurrentSecond = currentSecond === secondsToCount ? 0 : currentSecond + 1;
    
    if (currentSecond <= 0) {
      timeStarted = Math.floor(new Date().getTime() / second);
    }
    
    timeNow = Math.floor(new Date().getTime() / second);
    timeElapsed = timeNow - timeStarted - totalPause + 1;
    
    if (currentTimer <= 0) {
      switchover();
    } else {
      currentTimer = secondsToCount - timeElapsed;
      writeTime();
    }
    if (working) {
      sliceTomato(secondsToCount, oneIdxedCurrentSecond);
    } else {
      ripenTomato(secondsToCount, oneIdxedCurrentSecond);
    }
  }
  
  var blinkInterval;
  
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
  
  var cdInterval;
  
  function startStopTimer(e) {
    e.preventDefault();    
    
    if (paused) {
      cdInterval = setInterval(countdown, second);
      paused = false;
      
      if (startOfPause) {
        endOfPause = Math.floor(new Date().getTime() / second);
        totalPause += endOfPause - startOfPause;
      }
    
    } else {
      clearInterval(cdInterval);
      paused = true;
      startOfPause = Math.floor(new Date().getTime() / second);
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
        currentTimer = workTimer;
        writeTime();
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
        currentTimer = breakTimer;
        writeTime();
      }
    }
  });
  
  
  // slicing animation
  
  
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
  
  $('#mute').click(function() {
    
    if (audioPlayback) {
      $('#mute').attr('src', '/img/sound_mute.svg');
    } else {
      $('#mute').attr('src', '/img/sound_on.svg');
    }
    audioPlayback = !audioPlayback;
    
  });
  
});
