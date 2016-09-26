// ==UserScript==
// @name         Duolingo Back To Back Practice
// @description  Starts another practice when one ends
// @author       Eedrah
// @namespace    https://github.com/eedrah/duolingo-scripts/raw/master/back-to-back-practice.user.js
// @downloadURL  https://github.com/eedrah/duolingo-scripts/raw/master/back-to-back-practice.user.js
// @match        https://www.duolingo.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @version      2.0.0
// ==/UserScript==

/* globals GM_getValue GM_setValue */

var ContinuousPractice = {
  get: function () {
    return GM_getValue('continuous_practice')
  },
  set: function (value) {
    GM_setValue('continuous_practice', value)
    updateGui()
    ifNotBlockedByUserExecute(runContinuousPractice)
  }
}

function findButtonOfInterest () {
  var textOfInterest = [
    'Practice again',
    'Practice without a timer'
  ]
  var buttons = document.querySelectorAll('button')
  var buttonsOfInterest = Array.prototype.filter.call(buttons, function (button) {
    return textOfInterest.indexOf(button.textContent) !== -1
  })
  return buttonsOfInterest[0]
}

function isGeneralPractice () {
  return window.location.pathname === '/practice'
}

function ifNotBlockedByUserExecute (callback) {
  if (ContinuousPractice.get()) {
    callback()
  }
}

function displaySettings () {
  var container = document.querySelector('.player-header-left')
  if (!container) {
    return
  }

  var settingsElement = document.createElement('li')
  var p = document.createElement('p')
  p.classList.add('player-quit')
  p.classList.add('gray')
  p.classList.add('gray-text')
  var label = document.createElement('label')
  var input = document.createElement('input')
  input.classList.add('border')
  input.setAttribute('type', 'checkbox')
  var text = document.createTextNode('Continuous practice')

  if (ContinuousPractice.get()) {
    input.setAttribute('checked', 'checked')
  }
  input.addEventListener('change', function () {
    ContinuousPractice.set(!ContinuousPractice.get())
  })

  label.appendChild(input)
  label.appendChild(text)
  p.appendChild(label)
  settingsElement.appendChild(p)

  container.innerHTML = ''
  container.appendChild(settingsElement)
}

function runContinuousPractice () {
  var button = findButtonOfInterest()
  button && button.click()
}

function updateGui () {
  displaySettings()
  var progressBar = document.querySelector('#progress-bar')
  if (progressBar) {
    if (ContinuousPractice.get()) {
      progressBar.style.display = 'none'
    } else {
      progressBar.style.display = ''
    }
  }
}

new MutationObserver(function (nodes) { // eslint-disable-line no-undef
  if (isGeneralPractice()) {
    updateGui()
    ifNotBlockedByUserExecute(runContinuousPractice)
  }
}).observe(document.querySelector('body'), {
  childList: true
})
