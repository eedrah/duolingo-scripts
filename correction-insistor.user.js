// ==UserScript==
// @name         Duolingo Correction Insistor
// @description  Insists on correct answers before progressing
// @author       Eedrah
// @namespace    https://github.com/eedrah/duolingo-scripts/raw/master/correction-insistor.user.js
// @downloadURL  https://github.com/eedrah/duolingo-scripts/raw/master/correction-insistor.user.js
// @match        https://www.duolingo.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @version      0.0.1
// ==/UserScript==

// /* globals GM_getValue GM_setValue */

/* eslint-disable no-multiple-empty-lines */

// on mutation
  // check if there is a badge-wrong grade
    // get correct answers
    // disable continue button
    // enable entry fields again
    // on change of fields
      // check if correct against possible answers
        // enable continue button

// For lols, three different ways of defining classes
function newTranslateChallenge () {
  function hello () {
    console.log('translate')
  }
  return {
    hello: hello
  }
}

function ListenChallenge () {}
ListenChallenge.prototype.hello = function () {
  console.log('listen')
}

class JudgeChallenge {
  hello () {
    console.log('judge')
  }
}

class Challenge {
  static get (className) {
    return className
  }
}

function getChallengeTypeFixer () {
  const session = document.querySelector('session-element-container')
  Challenge.get(session.children[0].classList[0])
}

function fixIncorrectAnswer (possibleAnswers) {
  const challengeFixer = getChallengeTypeFixer()
  challengeFixer
// document.querySelector('.challenge-cell #submitted-text').style.display = 'none'
// document.querySelector('.challenge-cell textarea, .challenge-cell input')
// a.style.display = null
// a.disabled = null
}

function findAnswers (gradeNode) {
  const answerNodes = gradeNode.querySelector('span.lighter').querySelectorAll('bdi')
  return Array.prototype.map.call(answerNodes, answerNode => answerNode.textContent
  )
}

function gradeChanged (gradeNode) {
  if (gradeNode.children.length > 0) {
    if (gradeNode.children[0].classList.contains('badge-wrong-big')) {
      const possibleAnswers = findAnswers(gradeNode)
      fixIncorrectAnswer(possibleAnswers)
    }
  }
}

new MutationObserver(function (nodes) { // eslint-disable-line no-undef
  const gradeNode = document.querySelector('#grade')
  if (!gradeNode) {
    return
  }
  if (nodes.some(node => node.target === gradeNode)) {
    gradeChanged(gradeNode)
  }
}).observe(document.querySelector('body'), {
  childList: true,
  subtree: true
})
