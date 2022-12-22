// ==UserScript==
// @name         퇴근시간얼마남았니
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  오늘은 몇시에 퇴근할 수 있는지 확인할 수 있습니다
// @author       이수연(프론트앤드개발자)
// @match        https://flex.team/time-tracking/work-record/my*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flex.team
// @grant        none
// ==/UserScript==

'use strict';

// **** 표시되는 문구는 참고용이니 정확하지 않을 수 있습니다. 책임은 본인에게 있습니다 ****
window.onload = function () {
    setTimeout(() => {
        getByeCompanyTime();
    }, 1000);

    const today = document.querySelector('[data-key="global.오늘"]');

    // '내 근무'페이지에서 다른달 보려고 버튼클릭했을때 다시 계산하려고 넣은로직!
    let url = window.location.href;
    ['click', 'popstate', 'onload', 'touch'].forEach( evt =>
        window.addEventListener(evt, function () {
            if (url !== location.href) {
                const today = document.querySelector('[data-key="global.오늘"]');
                today.innerText = '오늘'

                setTimeout(() => {
                    getByeCompanyTime();
                }, 5000)

            }
            url = location.href;
        }, true)
    );

};



const getByeCompanyTime = () => {
    const days = document.querySelectorAll('[data-role="header-column-cell"]');
    let overWorkTimeNumber = 0;
    const day = new Date();
    const todayDate = day.getDate();
    for(let i = 0; i < days.length; i++) {
        const timeElem = days[i].querySelector('span');
        const dateElem = days[i].querySelector('.PJLV');
        
        if(!timeElem || Number(dateElem?.textContent.split(' ')[1]) > todayDate) {
            continue;
        }
        const timeText = timeElem.textContent
        const timeArray = timeText.split(' ') || [];
        let hour = 0;
        let minute = 0;
        for(let j = 0; j < timeArray.length; j++) {
            const text = timeArray[j]
            if(text.indexOf('시간') > -1) {
                hour = Number(text.replace('시간', ''))
            }
            if(text.indexOf('분') > -1) {
                minute = Number(text.replace('분', ''))
            }
        }
        const time = Number(hour + (minute/60))
        const WORK_HOUR = 8;

        const upperDiv = days[i].parentNode
        if(time === 0 || upperDiv.textContent.indexOf('원격') > -1) {
            continue;
        }

        if(time > WORK_HOUR) {
            const overTime = time - WORK_HOUR
            overWorkTimeNumber += Number(overTime.toFixed(2));
        }else{
            const leakTime = WORK_HOUR - time
            overWorkTimeNumber = Number((overWorkTimeNumber - Number(leakTime.toFixed(2))).toFixed(3));
        }
    }
    setTextInHtml(overWorkTimeNumber);

}


const setTextInHtml = (overWorkTimeNumber) => {
    const today = document.querySelector('[data-key="global.오늘"]');

    if(overWorkTimeNumber === 0) {
        today.innerText = today.innerText + ' 초과,미달시간 없음🤭';
        return;
    }
    let calcTime = Number((overWorkTimeNumber * 60).toFixed(3));
    if(calcTime < 0) {
        calcTime = calcTime * -1
    }
    const hour = parseInt(calcTime / 60);
    const minute = parseInt((calcTime % 60).toFixed(3));
    if(hour > 0) {
        today.innerText = today.innerText + ` ${hour}시간`
    }

    today.innerText += ` ${minute}분`;

    const isCurrentMonth = today.closest("button").disabled;

    if(overWorkTimeNumber < 0) {
        if(isCurrentMonth) {
            today.innerText = today.innerText + ` 늦게 집에가야되요🧚🏻‍♂️`
        }else{
            today.innerText = today.innerText + ` 미달😉`
        }

    }else{
        if(isCurrentMonth) {
            today.innerText = today.innerText + ` 일찍 집에가도되요💃💃`
        }else{
            today.innerText = today.innerText + ` 초과😎😎`
        }
    }

}
