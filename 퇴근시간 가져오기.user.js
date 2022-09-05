// ==UserScript==
// @name         퇴근시간얼마남았니
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  오늘은 몇시에 퇴근할 수 있는지 확인할 수 있습니다
// @author       이수연(프론트앤드개발자)
// @match        https://flex.team/time-tracking/work-record/my*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flex.team
// @grant        none
// @updateURL   https://gist.github.com/codingrun/919354b638c0bac537de1219d1fa5bd6/raw/1975f7369df0691e002665775339b977556cea6c/%25ED%2587%25B4%25EA%25B7%25BC%25EC%258B%259C%25EA%25B0%2584%2520%25EA%25B0%2580%25EC%25A0%25B8%25EC%2598%25A4%25EA%25B8%25B0.user.js
// @downloadURL https://gist.github.com/codingrun/919354b638c0bac537de1219d1fa5bd6/raw/1975f7369df0691e002665775339b977556cea6c/%25ED%2587%25B4%25EA%25B7%25BC%25EC%258B%259C%25EA%25B0%2584%2520%25EA%25B0%2580%25EC%25A0%25B8%25EC%2598%25A4%25EA%25B8%25B0.user.js
// ==/UserScript==

'use strict';

// **** 표시되는 문구는 참고용이니 정확하지 않을 수 있습니다. 책임은 본인에게 있습니다 ****
window.onload = function () {
    getByeCompanyTime();

    const today = document.querySelector('[data-key="global.오늘"]');

//    today.parentNode.parentNode.append()

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
    for(let i = 0; i < days.length; i++) {
        const timeText = days[i].querySelector('.ant-tag').textContent
        const time = Number(timeText.replace('h', ''))
        let WORK_HOUR = 8;

        const upperDiv = days[i].parentNode
        if(time === 0 || upperDiv.textContent.indexOf('원격근무') > -1 || (upperDiv.textContent.indexOf('연차') > -1 && time === WORK_HOUR)) {
            continue;
        }

        // 반차
        if(upperDiv.textContent.indexOf('연차') > -1 && time < WORK_HOUR) {
            const rowDate = Number(upperDiv.textContent.split(' ')[1])
            const today = new Date().getDate()
            if(rowDate > today) {
                continue;
            }
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
            today.innerText = today.innerText + ` 늦게 집에가야되요😂`
        }else{
            today.innerText = today.innerText + ` 미달😂`
        }

    }else{
        if(isCurrentMonth) {
            today.innerText = today.innerText + ` 일찍 집에가도되요😎`
        }else{
            today.innerText = today.innerText + ` 초과😎😎`
        }
    }

}