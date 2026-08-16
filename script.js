(function(){
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
(function(){
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

  (function(){
    var items = [
      'kurgusu tamamlandı','e-postalar yanıtlandı','aramalar karşılandı',
      'randevular ayarlandı','içerikler üretildi','yeni müşteriler bulundu'
      ];
    var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
    var track = document.getElementById('tickerTrack');
    var html = '';
    for (var pass = 0; pass < 2; pass++){
      items.forEach(function(t){
        html += '<span class="ticker-item">' + t + check + '</span><span class="ticker-sep"></span>';
      });
    }
    track.innerHTML = html;
  })();

  (function(){
    var canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var wrap = canvas.parentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var COUNT = 46;
    var LINK_DIST = 150;

    function resize(){
      W = wrap.clientWidth; H = wrap.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    function seed(){
      nodes = [];
      for (var i=0;i<COUNT;i++){
        nodes.push({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18
        });
      }
    }

    function step(){
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<nodes.length;i++){
        var n = nodes[i];
        if (!reduce){
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
        }
      }
      for (var i=0;i<nodes.length;i++){
        for (var j=i+1;j<nodes.length;j++){
          var a = nodes[i], b = nodes[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var d = Math.sqrt(dx*dx+dy*dy);
          if (d < LINK_DIST){
            ctx.strokeStyle = 'rgba(113,113,244,' + (0.16*(1-d/LINK_DIST)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      for (var i=0;i<nodes.length;i++){
        ctx.fillStyle = 'rgba(184,184,250,0.55)';
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI*2);
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(step);
    }

    resize(); seed(); step();
    window.addEventListener('resize', function(){ resize(); seed(); if(reduce) step(); }, { passive:true });
  })();

  (function(){
    var overlay = document.getElementById('bookingOverlay');
    var closeBtn = document.getElementById('bookingClose');
    var doneBtn = document.getElementById('bookingDone');
    var triggers = [document.getElementById('navBookingTrigger')];
    var bookingView = document.getElementById('bookingView');
    var successView = document.getElementById('bookingSuccess');

    var calMonthLabel = document.getElementById('calMonthLabel');
    var calDays = document.getElementById('calDays');
    var calPrev = document.getElementById('calPrev');
    var calNext = document.getElementById('calNext');
    var slotsDateLabel = document.getElementById('slotsDateLabel');
    var slotsGrid = document.getElementById('slotsGrid');
    var form = document.getElementById('bookingForm');
    var submitBtn = document.getElementById('bookingSubmit');
    var nameInput = document.getElementById('bkName');
    var emailInput = document.getElementById('bkEmail');
    var noteInput = document.getElementById('bkNote');
    var summaryBox = document.getElementById('bookingSummary');
    var summaryText = document.getElementById('bookingSummaryText');
    var successSummary = document.getElementById('successSummary');

    var MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    var WEEKDAY_FULL = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
    var SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'];

    var today = new Date(); today.setHours(0,0,0,0);
    var viewYear, viewMonth, selectedDate, selectedSlot, lastFocused;
    var submitBtnDefaultHTML = submitBtn.innerHTML;

    function mondayIndex(d){ return (d.getDay() + 6) % 7; } // Mon=0 ... Sun=6

    function renderCalendar(){
      calMonthLabel.textContent = MONTHS[viewMonth] + ' ' + viewYear;
      calDays.innerHTML = '';

      var firstOfMonth = new Date(viewYear, viewMonth, 1);
      var leading = mondayIndex(firstOfMonth);
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      var isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
      calPrev.disabled = isCurrentMonth;

      for (var i = 0; i < leading; i++){
        var empty = document.createElement('span');
        empty.className = 'cal-day cal-day-empty';
        calDays.appendChild(empty);
      }

      for (var day = 1; day <= daysInMonth; day++){
        var d = new Date(viewYear, viewMonth, day);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-day';
        btn.textContent = day;

        var weekday = mondayIndex(d);
        var isPast = d < today;
        var isWeekend = weekday === 5 || weekday === 6; // Cmt / Pzr
        if (isPast || isWeekend) btn.disabled = true;

        if (d.getTime() === today.getTime()) btn.classList.add('is-today');
        if (selectedDate && d.getTime() === selectedDate.getTime()) btn.classList.add('is-selected');

        (function(dateObj, buttonEl){
          buttonEl.addEventListener('click', function(){ selectDate(dateObj); });
        })(d, btn);

        calDays.appendChild(btn);
      }
    }

    function selectDate(d){
      selectedDate = d;
      selectedSlot = null;
      renderCalendar();
      renderSlots();
      updateSubmitState();
    }

    function renderSlots(){
      slotsGrid.innerHTML = '';
      if (!selectedDate){
        slotsDateLabel.textContent = 'Önce bir tarih seçin';
        return;
      }
      slotsDateLabel.textContent = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()];

      SLOTS.forEach(function(time){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot-btn';
        b.textContent = time;
        if (selectedSlot === time) b.classList.add('is-selected');
        b.addEventListener('click', function(){
          selectedSlot = time;
          renderSlots();
          updateSubmitState();
        });
        slotsGrid.appendChild(b);
      });
    }

    function updateSubmitState(){
      var ready = !!selectedDate && !!selectedSlot && nameInput.value.trim() && emailInput.value.trim();
      submitBtn.disabled = !ready;

      if (selectedDate && selectedSlot){
        summaryBox.hidden = false;
        summaryText.textContent = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear() + ' · ' + selectedSlot;
      } else {
        summaryBox.hidden = true;
      }
    }

    nameInput.addEventListener('input', updateSubmitState);
    emailInput.addEventListener('input', updateSubmitState);
    calPrev.addEventListener('click', function(){
      viewMonth--; if (viewMonth < 0){ viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    calNext.addEventListener('click', function(){
      viewMonth++; if (viewMonth > 11){ viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!selectedDate || !selectedSlot || !nameInput.value.trim() || !emailInput.value.trim()) return;

      var dateLabel = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Gönderiliyor...';

      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          note: noteInput ? noteInput.value.trim() : '',
          date: dateLabel,
          time: selectedSlot
        })
      })
      .then(function(res){
        if (!res.ok) throw new Error('request-failed');
        return res.json();
      })
      .then(function(){
        successSummary.textContent = dateLabel + ' · ' + selectedSlot;
        bookingView.hidden = true;
        successView.hidden = false;
        doneBtn.focus();
      })
      .catch(function(){
        submitBtn.innerHTML = submitBtnDefaultHTML;
        submitBtn.disabled = false;
        alert('Talebiniz gönderilirken bir sorun oluştu. Lütfen tekrar deneyin ya da bize e-posta ile ulaşın: info@mynerasoft.com');
      });
    });

    function resetBooking(){
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      selectedDate = null;
      selectedSlot = null;
      form.reset();
      submitBtn.innerHTML = submitBtnDefaultHTML;
      bookingView.hidden = false;
      successView.hidden = true;
      renderCalendar();
      renderSlots();
      updateSubmitState();
    }

    function openModal(){
      lastFocused = document.activeElement;
      resetBooking();
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      var firstDay = calDays.querySelector('.cal-day:not(:disabled)');
      (firstDay || closeBtn).focus();
    }

    function closeModal(){
      overlay.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    triggers.forEach(function(t){ if (t) t.addEventListener('click', openModal); });
    closeBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !overlay.hidden) closeModal();
    });
  })();
  
})();

(function(){
  var items = [
    'kurgusu tamamlandı','e-postalar yanıtlandı','aramalar karşılandı',
    'randevular ayarlandı','içerikler üretildi','yeni müşteriler bulundu'
  ];
  var check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  var track = document.getElementById('tickerTrack');
  var html = '';
  for (var pass = 0; pass < 2; pass++){
    items.forEach(function(t){
      html += '<span class="ticker-item">' + t + check + '</span><span class="ticker-sep"></span>';
    });
  }
  track.innerHTML = html;
})();

(function(){
  var canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var wrap = canvas.parentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [];
  var COUNT = 46;
  var LINK_DIST = 150;

  function resize(){
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function seed(){
    nodes = [];
    for (var i=0;i<COUNT;i++){
      nodes.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18
      });
    }
  }

  function step(){
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<nodes.length;i++){
      var n = nodes[i];
      if (!reduce){
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
    }
    for (var i=0;i<nodes.length;i++){
      for (var j=i+1;j<nodes.length;j++){
        var a = nodes[i], b = nodes[j];
        var dx = a.x-b.x, dy = a.y-b.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        if (d < LINK_DIST){
          ctx.strokeStyle = 'rgba(113,113,244,' + (0.16*(1-d/LINK_DIST)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    for (var i=0;i<nodes.length;i++){
      ctx.fillStyle = 'rgba(184,184,250,0.55)';
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI*2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(step);
  }

  resize(); seed(); step();
  window.addEventListener('resize', function(){ resize(); seed(); if(reduce) step(); }, { passive:true });
})();

(function(){
  var overlay = document.getElementById('bookingOverlay');
  var closeBtn = document.getElementById('bookingClose');
  var doneBtn = document.getElementById('bookingDone');
  var triggers = [document.getElementById('navBookingTrigger')];
  var bookingView = document.getElementById('bookingView');
  var successView = document.getElementById('bookingSuccess');

  var calMonthLabel = document.getElementById('calMonthLabel');
  var calDays = document.getElementById('calDays');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var slotsDateLabel = document.getElementById('slotsDateLabel');
  var slotsGrid = document.getElementById('slotsGrid');
  var form = document.getElementById('bookingForm');
  var submitBtn = document.getElementById('bookingSubmit');
  var nameInput = document.getElementById('bkName');
  var emailInput = document.getElementById('bkEmail');
  var summaryBox = document.getElementById('bookingSummary');
  var summaryText = document.getElementById('bookingSummaryText');
  var successSummary = document.getElementById('successSummary');

  var MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var WEEKDAY_FULL = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
  var SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'];

  var today = new Date(); today.setHours(0,0,0,0);
  var viewYear, viewMonth, selectedDate, selectedSlot, lastFocused;

  function mondayIndex(d){ return (d.getDay() + 6) % 7; } // Mon=0 ... Sun=6

  function renderCalendar(){
    calMonthLabel.textContent = MONTHS[viewMonth] + ' ' + viewYear;
    calDays.innerHTML = '';

    var firstOfMonth = new Date(viewYear, viewMonth, 1);
    var leading = mondayIndex(firstOfMonth);
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    var isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    calPrev.disabled = isCurrentMonth;

    for (var i = 0; i < leading; i++){
      var empty = document.createElement('span');
      empty.className = 'cal-day cal-day-empty';
      calDays.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++){
      var d = new Date(viewYear, viewMonth, day);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = day;

      var weekday = mondayIndex(d);
      var isPast = d < today;
      var isWeekend = weekday === 5 || weekday === 6; // Cmt / Pzr
      if (isPast || isWeekend) btn.disabled = true;

      if (d.getTime() === today.getTime()) btn.classList.add('is-today');
      if (selectedDate && d.getTime() === selectedDate.getTime()) btn.classList.add('is-selected');

      (function(dateObj, buttonEl){
        buttonEl.addEventListener('click', function(){ selectDate(dateObj); });
      })(d, btn);

      calDays.appendChild(btn);
    }
  }

  function selectDate(d){
    selectedDate = d;
    selectedSlot = null;
    renderCalendar();
    renderSlots();
    updateSubmitState();
  }

  function renderSlots(){
    slotsGrid.innerHTML = '';
    if (!selectedDate){
      slotsDateLabel.textContent = 'Önce bir tarih seçin';
      return;
    }
    slotsDateLabel.textContent = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()];

    SLOTS.forEach(function(time){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-btn';
      b.textContent = time;
      if (selectedSlot === time) b.classList.add('is-selected');
      b.addEventListener('click', function(){
        selectedSlot = time;
        renderSlots();
        updateSubmitState();
      });
      slotsGrid.appendChild(b);
    });
  }

  function updateSubmitState(){
    var ready = !!selectedDate && !!selectedSlot && nameInput.value.trim() && emailInput.value.trim();
    submitBtn.disabled = !ready;

    if (selectedDate && selectedSlot){
      summaryBox.hidden = false;
      summaryText.textContent = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear() + ' · ' + selectedSlot;
    } else {
      summaryBox.hidden = true;
    }
  }

  nameInput.addEventListener('input', updateSubmitState);
  emailInput.addEventListener('input', updateSubmitState);
  calPrev.addEventListener('click', function(){
    viewMonth--; if (viewMonth < 0){ viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener('click', function(){
    viewMonth++; if (viewMonth > 11){ viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !nameInput.value.trim() || !emailInput.value.trim()) return;
    successSummary.textContent = WEEKDAY_FULL[mondayIndex(selectedDate)] + ', ' + selectedDate.getDate() + ' ' + MONTHS[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear() + ' · ' + selectedSlot;
    bookingView.hidden = true;
    successView.hidden = false;
    doneBtn.focus();
  });

  function resetBooking(){
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedDate = null;
    selectedSlot = null;
    form.reset();
    bookingView.hidden = false;
    successView.hidden = true;
    renderCalendar();
    renderSlots();
    updateSubmitState();
  }

  function openModal(){
    lastFocused = document.activeElement;
    resetBooking();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var firstDay = calDays.querySelector('.cal-day:not(:disabled)');
    (firstDay || closeBtn).focus();
  }

  function closeModal(){
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  triggers.forEach(function(t){ if (t) t.addEventListener('click', openModal); });
  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
})();
