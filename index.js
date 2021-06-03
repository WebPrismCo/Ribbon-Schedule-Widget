var dates = require('./handle_dates');
var ui = require('./gen_ui');
var dayjs = require('dayjs');

let refDay = dayjs();

let weekStart = dates.getWeekStart(refDay);

let week = dates.initWeek(weekStart);

let container = document.getElementById("ribbon-schedule");

const initSchedule = () => {
    ui.createUI(container, week);
}

const resetSchedule = () => {
    container.innerHTML = "";
    initSchedule();
}

const toggleWeek = (iterator) => {
    let newWeekStart = dates.changeWeek(iterator, refDay);
    refDay = newWeekStart;

    week = dates.initWeek(newWeekStart);
    
    resetSchedule();
}

initSchedule(container, week);

module.exports = {
    toggleWeek: toggleWeek
}