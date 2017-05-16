$(document).ready(function() {
  
  const hour = 60; // mins
  const minute = 60; // secs
  const second = 1000; // ms
  
  // set up state
  
  var workTimer = 25 * minute; // minutes
  var breakTimer = 5 * minute; // minutes
  var displayMessageTimer = 5; // seconds
  
  var working = true;
  var paused = true;
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
    if (working) {
      currentTimer = breakTimer;
      working = false;
      $('#timerImg').attr('src', 'img/tomato_green.png');
      
    } else {
      currentTimer = workTimer;
      working = true;
      $('#timerImg').attr('src', 'img/tomato_red.png');
    }
    writeStatus();
    writeTime();
  }
  
  function countdown() {
    if (currentTimer === 0) {
      switchover();
    } else {
      currentTimer--;
      writeTime();
    }
    sliceTomato();
  }
  
  function writeStatus() {
    $('#status').css('opacity', '0');
    if (paused) {
      $('#status').html('Paused...')
    } else if (working) {
      $('#status').html('Time to work!');
    } else {
      $('#status').html('Break time!');
    }
    $('#status').animate({opacity: 1}, 1000);
  }
  
  var cdInterval;
  
  $('#startStop').click(function(e) {
    e.preventDefault();
    if (paused) {
      cdInterval = setInterval(countdown, second);
      
      paused = false;
      
      $(this).html('Stop');
      
    } else {
      clearInterval(cdInterval);
      paused = true;
      $(this).html('Start');
      
    }
    writeStatus();

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
  
  
  function sliceTomato() {
    
    //assume width === height - only works for perfect circles within perfect squares

    var diameter = $('#cutout').width();

    var radius = diameter/2;
    var over180Deg;
    var clockHandX;
    var clockHandY;

    var secondsToCount = working ? workTimer : breakTimer;
    var currentSecond = secondsToCount - currentTimer;

    var startpoint = 90;  

    var currentDegrees = ((currentSecond/secondsToCount) * 360) + startpoint;
    var currentRadians = currentDegrees * (Math.PI / 180);

    clockHandX = radius - (radius * Math.cos(currentRadians));

    clockHandY = radius - (radius * Math.sin(currentRadians));

    over180Deg = currentDegrees > 180 ? 1 : 0;

    if (currentSecond === secondsToCount) {
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
  
});
