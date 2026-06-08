/*
 * Ethiopian Orthodox Calendar — interactive monthly view
 * Source data: Bahire Hasab (public), Swedish röda dagar (lag 1989:253)
 * 0 dependencies, pure math, works for all years 1900-2099
 */

var ETH_WEEKDAYS_AM = ['እሁድ','ሰኞ','ማክሰኞ','ረቡዕ','ሐሙስ','አርብ','ቅዳሜ'];
var ETH_WEEKDAYS_SV = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];

// Fixed Ethiopian Orthodox holidays (month, day, sv name, am name, type)
var ETH_FIXED_HOLIDAYS = [
  [1,1,'Enkutatash (Nyår)','እንቁጣጣሽ','major'],
  [1,17,'Meskel (Korsets fest)','መስቀል','major'],
  [1,26,'Tsige (Blomsterfest)','ፅጌ','minor'],
  [2,12,'Mikael (månatlig)','ቅዱስ ሚካኤል','monthly'],
  [3,6,'Qusquam (Flykten till Egypten)','ቁስቋም ማርያም','marian'],
  [3,12,'Mikael (årets stora fest)','ቅዱስ ሚካኤል','major'],
  [3,21,'Hidar Tsion (Marias ark)','ኅዳር ጽዮን','major'],
  [3,24,'Tekle Haymanot (årsfest)','አቡነ ተክለ ሃይማኖት','major'],
  [4,3,'Ba\'eta (Maria i templet)','ባዕታ ለማርያም','marian'],
  [4,29,'Genna (Jul)','ገና / ልደት','major'],
  [5,6,'Gizret (Jesu omskärelse)','ግዝረት','minor'],
  [5,11,'Timkat (Epifania)','ጥምቀት','major'],
  [5,12,'Qana ze Galila (Bröllopet i Kana)','ቃና ዘገሊላ','minor'],
  [6,16,'Kidane Mihret (Barmhärtighetens förbund)','ኪዳነ ምሕረት','major'],
  [7,10,'Megabit Meskel (Vårens kors)','መጋቢት መስቀል','minor'],
  [7,29,'Sibket (Bebådelsen)','ስብከት / ብሥራት','major'],
  [8,23,'Giorgis (S:t Göran)','ቅዱስ ጊዮርጊስ','major'],
  [9,1,'Lideta (Marias födelse)','ልደታ ለማርያም','marian'],
  [9,5,'Gebre Menfes Kidus','አቡነ ገብረ መንፈስ ቅዱስ','major'],
  [10,12,'Mikael (sommarfest)','ቅዱስ ሚካኤል','major'],
  [10,19,'Gabriel (årsfest)','ቅዱስ ገብርኤል','major'],
  [11,5,'Petros & Paulos','ጴጥሮስ ወጳውሎስ','major'],
  [12,13,'Debre Tabor / Buhe','ደብረ ታቦር / ቡሄ','major'],
  [12,16,'Filseta (Marias himmelsfärd)','ፊልሰታ','major'],
];

// Monthly saints (every month on this day)
var ETH_MONTHLY_SAINTS = [
  [1,'Lideta (Maria)','ልደታ'],
  [5,'Gebre Menfes Kidus','አቡነ ገብረ መንፈስ ቅዱስ'],
  [7,'Kidist Selassie (Treenigheten)','ቅድስት ሥላሴ'],
  [12,'Mikael','ቅዱስ ሚካኤል'],
  [16,'Kidane Mihret','ኪዳነ ምሕረት'],
  [19,'Gabriel','ቅዱስ ገብርኤል'],
  [21,'Dingil Mariam','ድንግል ማርያም'],
  [23,'Giorgis','ቅዱስ ጊዮርጊስ'],
  [24,'Tekle Haymanot','አቡነ ተክለ ሃይማኖት'],
  [27,'Medhane Alem','መድኃኔ ዓለም'],
  [29,'Bale Wold (Kristi födelse)','ባለ ወልድ'],
];

// Fasting periods (start month, start day, end month, end day, sv, am)
var ETH_FASTING = [
  [3,15,4,28,'Tsome Nebiyat (Advent)','ጾመ ነቢያት','advent'],
  [12,1,12,16,'Tsome Filseta (Mariafastan)','ጾመ ፊልሰታ','filseta'],
];

// Swedish public holidays (gregorian month, day, sv name)
var SWE_HOLIDAYS = [
  [1,1,'Nyårsdagen 🇸🇪'],
  [1,6,'Trettondedag jul 🇸🇪'],
  [5,1,'Första maj 🇸🇪'],
  [6,6,'Nationaldagen 🇸🇪'],
  [12,24,'Julafton 🇸🇪'],
  [12,25,'Juldagen 🇸🇪'],
  [12,26,'Annandag jul 🇸🇪'],
  [12,31,'Nyårsafton 🇸🇪'],
];

// Convert Ethiopian date to Gregorian
function ethToGregorian(eYear, eMonth, eDay) {
  var JD_EPOCH = 1723856;
  var jdn = JD_EPOCH + 365 * (eYear - 1) + Math.floor(eYear / 4) + 30 * (eMonth - 1) + eDay - 1;
  // JDN to Gregorian
  var l = jdn + 68569;
  var n = Math.floor(4 * l / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  var i = Math.floor(4000 * (l + 1) / 1461001);
  l = l - Math.floor(1461 * i / 4) + 31;
  var j = Math.floor(80 * l / 2447);
  var day = l - Math.floor(2447 * j / 80);
  l = Math.floor(j / 11);
  var month = j + 2 - 12 * l;
  var year = 100 * (n - 49) + i + l;
  return { year: year, month: month, day: day };
}

function getEthMonthDays(eMonth, eYear) {
  if (eMonth <= 12) return 30;
  return (eYear + 1) % 4 === 0 ? 6 : 5;
}

function getEthDayOfWeek(eYear, eMonth, eDay) {
  var greg = ethToGregorian(eYear, eMonth, eDay);
  var d = new Date(greg.year, greg.month - 1, greg.day);
  return d.getDay();
}

function getHolidaysForDay(eMonth, eDay) {
  var results = [];
  for (var i = 0; i < ETH_FIXED_HOLIDAYS.length; i++) {
    var h = ETH_FIXED_HOLIDAYS[i];
    if (h[0] === eMonth && h[1] === eDay) results.push(h);
  }
  for (var i = 0; i < ETH_MONTHLY_SAINTS.length; i++) {
    var s = ETH_MONTHLY_SAINTS[i];
    if (s[0] === eDay) results.push([eMonth, eDay, s[1], s[2], 'monthly']);
  }
  return results;
}

function getSwedishHolidayForGregorian(gMonth, gDay) {
  for (var i = 0; i < SWE_HOLIDAYS.length; i++) {
    if (SWE_HOLIDAYS[i][0] === gMonth && SWE_HOLIDAYS[i][1] === gDay) return SWE_HOLIDAYS[i][2];
  }
  return null;
}

function isFastingDay(eMonth, eDay) {
  for (var i = 0; i < ETH_FASTING.length; i++) {
    var f = ETH_FASTING[i];
    if (f[0] === f[2]) {
      if (eMonth === f[0] && eDay >= f[1] && eDay <= f[3]) return f;
    } else {
      if ((eMonth === f[0] && eDay >= f[1]) || (eMonth === f[2] && eDay <= f[3]) || (eMonth > f[0] && eMonth < f[2])) return f;
    }
  }
  return null;
}

function renderCalendarGrid(containerId, eYear, eMonth, lang) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var monthDays = getEthMonthDays(eMonth, eYear);
  var firstDayOfWeek = getEthDayOfWeek(eYear, eMonth, 1);
  var ethMonthName = lang === 'am' ? ETH_MONTHS_AM[eMonth - 1] : ETH_MONTHS_SV[eMonth - 1];
  var gregStart = ethToGregorian(eYear, eMonth, 1);
  var gregEnd = ethToGregorian(eYear, eMonth, monthDays);
  var gregMonths = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
  var gregRange = gregMonths[gregStart.month - 1] + ' ' + gregStart.day + ' – ' + gregMonths[gregEnd.month - 1] + ' ' + gregEnd.day + ', ' + gregEnd.year;

  var html = '';

  // Header with navigation
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  html += '<button onclick="calNav(-1)" style="background:var(--accent);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer">◀</button>';
  html += '<div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--accent)">' + ethMonthName + ' ' + eYear + (lang === 'am' ? ' ዓ.ም.' : '') + '</div>';
  html += '<div style="font-size:13px;color:var(--muted)">' + gregRange + '</div></div>';
  html += '<button onclick="calNav(1)" style="background:var(--accent);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer">▶</button>';
  html += '</div>';

  // Weekday headers
  var weekdays = lang === 'am' ? ETH_WEEKDAYS_AM : ETH_WEEKDAYS_SV;
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">';
  for (var w = 0; w < 7; w++) {
    html += '<div style="text-align:center;font-size:12px;font-weight:600;padding:6px 0;color:var(--muted)">' + weekdays[w] + '</div>';
  }
  html += '</div>';

  // Calendar grid
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">';

  // Empty cells before first day
  for (var e = 0; e < firstDayOfWeek; e++) {
    html += '<div style="padding:8px;min-height:48px"></div>';
  }

  // Day cells
  var today = toEthiopian(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  var eventsList = [];

  for (var d = 1; d <= monthDays; d++) {
    var isToday = (eYear === today.year && eMonth === today.month && d === today.day);
    var holidays = getHolidaysForDay(eMonth, d);
    var greg = ethToGregorian(eYear, eMonth, d);
    var sweHoliday = getSwedishHolidayForGregorian(greg.month, greg.day);
    var fasting = isFastingDay(eMonth, d);

    var bg = isToday ? 'var(--accent)' : (holidays.length > 0 && holidays[0][4] === 'major') ? '#7C3AED22' : fasting ? '#CA8A0411' : 'transparent';
    var color = isToday ? '#fff' : 'var(--fg)';
    var border = holidays.length > 0 ? '2px solid var(--accent)' : sweHoliday ? '2px solid #2563eb' : '1px solid var(--border)';

    html += '<div style="padding:4px;min-height:48px;border-radius:8px;background:' + bg + ';border:' + border + ';color:' + color + ';font-size:14px;position:relative;cursor:pointer" title="';

    var titleParts = [];
    for (var h = 0; h < holidays.length; h++) titleParts.push(lang === 'am' ? holidays[h][3] : holidays[h][2]);
    if (sweHoliday) titleParts.push(sweHoliday);
    if (fasting) titleParts.push(lang === 'am' ? fasting[5] : fasting[4]);
    html += titleParts.join(', ') + '">';

    html += '<div style="font-weight:600">' + d + '</div>';
    html += '<div style="font-size:9px;color:' + (isToday ? '#ddd' : 'var(--muted)') + '">' + greg.day + '/' + greg.month + '</div>';

    if (holidays.length > 0 && holidays[0][4] === 'major') html += '<div style="position:absolute;top:2px;right:4px;font-size:10px">⛪</div>';
    if (sweHoliday) html += '<div style="position:absolute;bottom:2px;right:4px;font-size:10px">🇸🇪</div>';
    if (fasting) html += '<div style="position:absolute;top:2px;left:4px;font-size:8px;color:#CA8A04">◆</div>';

    html += '</div>';

    // Collect events for list below
    for (var h = 0; h < holidays.length; h++) {
      if (holidays[h][4] !== 'monthly') {
        eventsList.push({ day: d, name: lang === 'am' ? holidays[h][3] : holidays[h][2], type: holidays[h][4] });
      }
    }
    if (sweHoliday) eventsList.push({ day: d, name: sweHoliday, type: 'swedish' });
  }

  html += '</div>';

  // Legend
  html += '<div style="display:flex;gap:16px;margin-top:12px;font-size:12px;color:var(--muted);flex-wrap:wrap">';
  html += '<span>⛪ ' + (lang === 'am' ? 'ከፍተኛ በዓል' : 'Stor högtid') + '</span>';
  html += '<span>🇸🇪 ' + (lang === 'am' ? 'ቀይ ቀን' : 'Röd dag') + '</span>';
  html += '<span>◆ ' + (lang === 'am' ? 'ጾም' : 'Fasta') + '</span>';
  html += '<span style="width:12px;height:12px;border-radius:50%;background:var(--accent);display:inline-block;vertical-align:middle"></span> ' + (lang === 'am' ? 'ዛሬ' : 'Idag');
  html += '</div>';

  // Events list for this month
  if (eventsList.length > 0) {
    html += '<div style="margin-top:16px"><h3 style="margin-bottom:8px">' + (lang === 'am' ? 'የወሩ ዝግጅቶች' : 'Månadens händelser') + '</h3>';
    for (var i = 0; i < eventsList.length; i++) {
      var ev = eventsList[i];
      var icon = ev.type === 'swedish' ? '🇸🇪' : ev.type === 'major' ? '⛪' : '•';
      html += '<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:14px">' + icon + ' ' + ethMonthName + ' ' + ev.day + ' — ' + ev.name + '</div>';
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

// Navigation state
var calCurrentYear = 0;
var calCurrentMonth = 0;
var calCurrentLang = 'sv';

function calNav(direction) {
  calCurrentMonth += direction;
  if (calCurrentMonth > 13) { calCurrentMonth = 1; calCurrentYear++; }
  if (calCurrentMonth < 1) { calCurrentMonth = 13; calCurrentYear--; }
  renderCalendarGrid('calendar-grid', calCurrentYear, calCurrentMonth, calCurrentLang);
}

function initCalendar(containerId, lang) {
  var now = new Date();
  var eth = toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
  calCurrentYear = eth.year;
  calCurrentMonth = eth.month;
  calCurrentLang = lang || 'sv';
  renderCalendarGrid(containerId, calCurrentYear, calCurrentMonth, calCurrentLang);
}

if (typeof window !== 'undefined') {
  window.initCalendar = initCalendar;
  window.calNav = calNav;
  window.renderCalendarGrid = renderCalendarGrid;
  window.ethToGregorian = ethToGregorian;
}
