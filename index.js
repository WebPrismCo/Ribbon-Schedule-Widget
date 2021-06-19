var dates = require('./modules/handle_dates');
var ribbon = require('./modules/ribbon');
var ui = require('./modules/gen_ui');
var dayjs = require('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat');
const List = require('list.js');
dayjs.extend(customParseFormat);


//load external css
var cssId = 'ribbon-schedule-custom-css';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId))
{
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = "https://cdn.jsdelivr.net/gh/WebPrismCo/Ribbon-Schedule-Widget/styles.css";
    link.media = 'all';
    head.appendChild(link);
}

//basic state
let refDay = dayjs();
let weekStart = dates.getWeekStart(refDay);
let week = dates.initWeek(weekStart);
let container = document.getElementById("ribbon-schedule");
let ribbonEvents, 
    eventsThisWeek,
    ribbon_event_list,
    refDayEvents;
//end basic state

let ribbon_root_tag = document.getElementById('ribbon-schedule-view-scriptroot');
let got_host_id = ribbon_root_tag.dataset.host
let got_host_token = ribbon_root_tag.dataset.token;

const initRibbon = async (hostId,token) => {
    let ribbonData = await ribbon.getRibbonData(hostId,token);

    return ribbonData;
}

const setWeekEvents = (data) => {
    eventsThisWeek = ribbon.getWeekEvents(data, week[0], week[6]);
    refDayEvents = ribbon.getRefDayEvents(data, refDay);
}

const resetEventList = () => {
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
    init_list();
    addFilterListeners();
}

const addDayListeners = () => {
    let wd_elems = document.querySelectorAll(".week_day");

    wd_elems.forEach((el) => {
        el.addEventListener('click', (e) => {
            setRefDay(e.target.id);
            resetEventList();
        })
    })

}

const addFilterListeners = () => {
    let filter_elems = document.querySelectorAll(".list_filter");
    filter_elems.forEach((el) => {
        el.addEventListener('change', (e) => {
            ribbon_event_list.search(e.target.value);
        });
    })
}

const init_list = () => {
    let eventList = document.getElementById("event_list_container");

    let listOptions = {
        valueNames: ['teacher_name', 'class_time', 'class_duration', 'class_location', {data: ['id', 'online']},]
    }

    ribbon_event_list = new List(eventList, listOptions)
        .on("updated", (e) => {
            if(e.matchingItems.length === 0){
                let em = document.createElement("div");
                em.innerHTML = ui.returnEmptyMessage();
                eventList.appendChild(em);
            } else {
                let emr = document.querySelectorAll(".no_events");

                if (emr.length > 0){
                    emr[0].parentNode.removeChild(emr[0]);
                }
            }
        });
}

const initSchedule = () => {
    ui.createUI(container, week, refDay);
    dates.findRefDay(refDay);
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
    init_list();
    addDayListeners();
    addFilterListeners();
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

    document.getElementById("selected_date").innerHTML = dayjs(d, "DDMMYYYY").format("dddd, MMMM D, YYYY")
}

initRibbon(got_host_id,got_host_token).then((data) => {
    ribbonEvents = data;
    initSchedule();
});



module.exports = {
    toggleWeek: toggleWeek,
    backToToday: backToToday,
    setRefDay: setRefDay
}