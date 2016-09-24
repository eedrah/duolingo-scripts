// ==UserScript==
// @name         Duolingo Back To Back Practice
// @description  Starts another practice when one ends
// @author       Eedrah
// @namespace    https://github.com/eedrah/duolingo-scripts/raw/master/back-to-back-practice.user.js
// @match        https://www.duolingo.com/practice*
// @downloadURL  https://github.com/eedrah/duolingo-scripts/raw/master/back-to-back-practice.user.js
// @version      1.1.1
// ==/UserScript==

var textOfInterest = [
  'Practice again',
  'Practice without a timer'
]

function findButtonOfInterest () {
  var buttons = document.querySelectorAll('button')
  var buttonsOfInterest = Array.prototype.filter.call(buttons, function (button) {
    return textOfInterest.indexOf(button.textContent) !== -1
  })
  return buttonsOfInterest[0]
}

function hideProgressBar () {
  var progressBar = document.querySelector('#progress-bar')
  if (progressBar) {
    progressBar.style.display = 'none'
  }
}

new MutationObserver(function (nodes) { // eslint-disable-line no-undef
  hideProgressBar()
  var button = findButtonOfInterest()
  button && button.click()
}).observe(document.querySelector('body'), {
  childList: true
})
