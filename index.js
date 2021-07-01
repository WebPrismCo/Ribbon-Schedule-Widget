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

let got_teacher = ribbon_root_tag.dataset.teacher;
let got_eventType = ribbon_root_tag.dataset.eventtype;
let got_location = ribbon_root_tag.dataset.location;


const initRibbon = async (hostId,token) => {
    let ribbonData = await ribbon.getRibbonData(hostId,token);

    return ribbonData;
}

const setWeekEvents = (data) => {
    eventsThisWeek = ribbon.getWeekEvents(data, week[0], week[6]);
    refDayEvents = ribbon.getRefDayEvents(data, refDay);
}

const fire_search = () => {
    let filters = document.querySelectorAll('.list_filter');

    let filter_string = "";

    filters.forEach((f) => {
        if(f.disabled == false){
            f.value == "" ? "" :  filter_string = filter_string + f.value + " "
        }
    });

    ribbon_event_list.search(filter_string);
}

const setFilterParams = (params) => {
    let search_string = '';

    function elemSelect(e,v){
        let doesValExist = document.getElementById(e).querySelector('[value="' + v + '"]');

        console.log(doesValExist);

        if(document.getElementById(e) !== null && doesValExist !== null){
            document.getElementById(e).value = v;
        } else if(document.getElementById(e) !== null && doesValExist == null){
            let filterOption = document.createElement("option");

            filterOption.value = params.teacher;
            filterOption.innerHTML = params.teacher;
            
            document.getElementById(e).appendChild(filterOption);

            document.getElementById(e).value = v;
        }

    }

    if(params.teacher !== undefined){
        elemSelect("teacher_filter", params.teacher);

        search_string = search_string + `"${params.teacher}" `;
    }

    if(params.eventType !== undefined){
        elemSelect("eventType_filter", params.eventType.toLowerCase());

        search_string = search_string + `"${params.eventType}" `;
    }

    if(params.location !== undefined){
        elemSelect("location_filter", params.location); 

        search_string = search_string + `"${params.location}" `;
    }

    ribbon_event_list.search(search_string);
}

const resetEventList = () => {
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
    init_list();
    if(refDayEvents.length > 0){
        addFilterListeners();
        setFilterParams({
            teacher: got_teacher,
            eventType: got_eventType,
            location: got_location
        });
    }
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
        el.addEventListener('change', () => {
            fire_search();
            // ribbon_event_list.search(e.target.value);
        });
    });
}

const init_list = () => {
    let eventList = document.getElementById("event_list_container");

    let listOptions = {
        valueNames: [   {data: ['id']}, 
                        {name: 'online', attr: 'data-online'},
                        'teacher_name', 
                        'class_time', 
                        'class_duration', 
                        'class_location',
                        'livestream_inperson'
                    ]
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

    ribbon_event_list.sort('class_time', {
        sortFunction: (a,b) => {
            console.log(a.elm.attributes["data-classtime"].value)
            if(dayjs(a.elm.attributes["data-classtime"].value).isBefore(dayjs(b.elm.attributes["data-classtime"].value))) return -1;
            else return 1;
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

    if(refDayEvents.length > 0){
        addFilterListeners();
        setFilterParams({
            teacher: got_teacher,
            eventType: got_eventType,
            location: got_location
        });
    }

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