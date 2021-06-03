const buildDay = (d) => {
    let new_elem = document.createElement("div");
    new_elem.innerHTML = `<p>${d.format("dddd")}</p><p>${d.format("MMM DD")}</p>`;
    new_elem.classList.add("week_day");

    return new_elem;
}

const buildWrapper = () => {
    let buttonWrapper = document.createElement("div");
    buttonWrapper.innerHTML = `<button onClick="bundle.toggleWeek(-1)">Back</button><button onClick="bundle.toggleWeek(1)">Next</button>`;

    return buttonWrapper;

}

const createUI = (elem, week) => {
    elem.appendChild(buildWrapper(elem));

    week.forEach((day) => {
        elem.appendChild(buildDay(day));
    });
}

module.exports = {
    createUI: createUI
}