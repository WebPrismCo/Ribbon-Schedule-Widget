var dates = require('./modules/handle_dates');
var ribbon = require('./modules/ribbon');
var ui = require('./modules/gen_ui');
var dayjs = require('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

//basic state
let refDay = dayjs();
let weekStart = dates.getWeekStart(refDay);
let week = dates.initWeek(weekStart);
let container = document.getElementById("ribbon-schedule");
let ribbonEvents, 
    eventsThisWeek,
    refDayEvents;
//end basic state

const initRibbon = async () => {
    let ribbonData = await ribbon.getRibbonData();

    return ribbonData;
}

const setWeekEvents = (data) => {
    eventsThisWeek = ribbon.getWeekEvents(data, week[0], week[6]);
    refDayEvents = ribbon.getRefDayEvents(data, refDay);
}

const resetEventList = () => {
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
}

const addListeners = () => {
    let wd_elems = document.querySelectorAll(".week_day");

    wd_elems.forEach((el) => {
        el.addEventListener('click', (e) => {
            setRefDay(e.target.id);
            resetEventList()
        })
    })
}

const initSchedule = () => {
    ui.createUI(container, week, refDay);
    dates.findRefDay(refDay);
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
    addListeners();
}

const resetSchedule = (w) => {
    week = dates.initWeek(w);
    
    container.innerHTML = "";
    initSchedule();
}

const backToToday = () => {
    refDay = dayjs();
    resetSchedule(dates.getWeekStart(refDay));
}

const toggleWeek = (iterator) => {
    let newWeekStart = dates.changeWeek(iterator, refDay);
    refDay = newWeekStart;
    
    resetSchedule(newWeekStart);
}

const setRefDay = (d) => {
    let new_refDay = dayjs(d, "DDMMYYYY");

    refDay = new_refDay;
    dates.findRefDay(new_refDay, 1);

    console.log("setting ref day");

    document.getElementById("selected_date").innerHTML = dayjs(d, "DDMMYYYY").format("dddd, MMMM D, YYYY")
}

initRibbon().then((data) => {
    ribbonEvents = data;
    initSchedule();
});

module.exports = {
    toggleWeek: toggleWeek,
    backToToday: backToToday,
    setRefDay: setRefDay
}