var dayjs = require('dayjs');

const buildDay = (d) => {
    let new_elem = document.createElement("div");
    new_elem.id = d.format("DDMMYYYY");
    new_elem.innerHTML = `<p class="day_of_week">${d.format("ddd").toUpperCase()}</p><p class="short_date">${d.format("MMM D")}</p>`;
    
    new_elem.classList.add("week_day");
    if( d.isBefore(dayjs().subtract(1, 'day')) ){
        new_elem.classList.add("in_past");
    }

    return new_elem;
}

const buildEventListContainer = () => {
    let elc = document.createElement('div');
    elc.classList.add("event_list_container");
    elc.id = "event_list_container";
    return elc;
}

const buildPrevButton = () => {
    let prevButton = document.createElement("div");
    prevButton.classList.add("prevButton")
    prevButton.innerHTML = `<button onClick="bundle.toggleWeek(0)"><<</button>`;

    return prevButton;
}

const buildNextButton = () => {
    let nextButton = document.createElement("div");
    nextButton.classList.add("nextButton")
    nextButton.innerHTML = `<button onClick="bundle.toggleWeek(1)">>></button>`;

    return nextButton;
}

const buildEventLineItem = (e) => {
    let lineItem = document.createElement("div");
    lineItem.classList.add('schedule_item');
    lineItem.innerHTML =   `<div class="time_dur">
                                <span class="class_time">${dayjs(e.dateTime).format("hh:mm A")}</span><br>
                                <span>${e.duration} min</span>
                            </div>
                            <div>
                                <span>${e.teacher || ""}</span>
                            </div>`;

    let signUpButton = document.createElement("div");
    signUpButton.innerHTML = `<a class="sign_up_button" href="${e.link}">Sign Up</a>`;

    if( e.image2 !== null){
        let teacherImg = document.createElement('div');
        teacherImg.style.backgroundImage = `url(${encodeURI(e.image2)})`;
        teacherImg.style.backgroundSize = 'cover';
        teacherImg.classList.add("teacher_img");

        lineItem.appendChild(teacherImg);
    }

    let eTitle = document.createElement("div");
    eTitle.classList.add("event_title");
    eTitle.innerHTML = `<span>${e.title}</span>`;

    lineItem.appendChild(eTitle)

    if(dayjs(e.dateTime).isBefore(dayjs()) == false ){
        lineItem.appendChild(signUpButton);
    }

    return lineItem;
}

const buildEventList = (ribbonEvents) => {
    let list_container = document.getElementById("event_list_container");

    list_container.innerHTML = "";

    if(ribbonEvents.length == 0){
        list_container.innerHTML = `<div class="no_events"><img height='100px' width='100px' src="https://cdn.jsdelivr.net/gh/WebPrismCo/Ribbon-Schedule-Widget@latest/assets/noun_empty_glass_1245571.png" alt='empty glass by Waiyi Fung from the Noun Project'><p>No Events Today</p></div>`;
    } else {
        ribbonEvents.forEach((rEvent) => {
            list_container.appendChild(buildEventLineItem(rEvent))
        });
    }
}

const createUI = (elem, week, refDay) => {
    let week_container = document.createElement("div");
    week_container.id = "week_container";

    week_container.appendChild(buildPrevButton());

    week.forEach((day) => {
        let elem = buildDay(day);

        week_container.appendChild(elem);
    });

    week_container.appendChild(buildNextButton());
    
    let today_container = document.createElement("div");
    today_container.classList.add('today_container');
    today_container.innerHTML = `<span id="selected_date">${refDay.format("dddd, MMMM D, YYYY")}</span><button onClick='bundle.backToToday()'>Today</button>`;

    elem.appendChild(week_container);

    elem.appendChild(today_container);

    elem.appendChild(buildEventListContainer());
}

module.exports = {
    createUI: createUI,
    buildEventList: buildEventList
}