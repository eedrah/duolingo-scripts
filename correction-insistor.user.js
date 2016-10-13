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

/* globals MutationObserver */

// on mutation
  // check if there is a badge-wrong grade
    // get correct answers
    // disable continue button
    // enable entry fields again
    // on change of fields
      // check if correct against possible answers
        // enable continue button

const Challenge = new class {
  constructor () {
    this._types = {}
  }
  get (session) {
    const challengeNode = session.children[0]
    const className = challengeNode.classList[0]
    const ChallengeClass = this._types[className]
    if (ChallengeClass) {
      return new ChallengeClass(challengeNode)
    }
  }
  register (name, type) {
    this._types[name] = type
  }
}

// ////////////////////////////////////////
// For lols, three different ways of defining classes
function TranslateChallenge (node) {
  this._challengeNode = node
  this._input
  this._deactivate = function () {
    this._input.disabled = true
  }

  this.reactivate = function () {
    this._challengeNode.querySelector('.challenge-cell #submitted-text').style.display = 'none'
    this._input = this._challengeNode.querySelector('.challenge-cell textarea')
    this._input.style.display = null
    this._input.disabled = false
    setTimeout(function () {
      this._input.value = this._input.value.trim()
    }.bind(this))
    this._input.focus()
  }
  this.monitorCorrectAnswer = function (possibleAnswers, continueButton) {
    this._input.addEventListener('input', function () {
      if (possibleAnswers.indexOf(this._input.value) > -1) {
        continueButton.reactivate()
        this._deactivate()
      }
    }.bind(this))
  }
}
Challenge.register('challenge-translate', TranslateChallenge)

function ListenChallenge (node) {
  this._challengeNode = node
  this._input
  this._monitor
}
ListenChallenge.prototype._deactivate = function () {
  this._input.contentEditable = false
}
ListenChallenge.prototype.reactivate = function () {
  this._input = this._challengeNode.querySelector('#graded-word-input')
  this._input.contentEditable = true
  this._input.focus()
  this._input.textContent = this._input.textContent.trim()
  this._input.addEventListener('keydown', function (e) { e.stopPropagation() })
}
ListenChallenge.prototype.monitorCorrectAnswer = function (possibleAnswers, continueButton) {
  this._monitor = new MutationObserver(function () {
    if (possibleAnswers.indexOf(this._input.textContent) > -1) {
      continueButton.reactivate()
      this._deactivate()
      this._monitor.disconnect()
    }
  }.bind(this))
  this._monitor.observe(this._input, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  })
}
Challenge.register('challenge-listen', ListenChallenge)

class JudgeChallenge {
  reactivate () {
    console.log('judge')
  }
}
Challenge.register('challenge-judge', JudgeChallenge)
// ////////////////////////////////////////

class ContinueButton {
  constructor () {
    this._button = document.querySelector('#next_button')
  }
  deactivate () {
    this._button.disabled = true
  }
  reactivate () {
    this._button.disabled = false
  }
}

function fixIncorrectAnswer (possibleAnswers) {
  const session = document.querySelector('#session-element-container')
  const challenge = Challenge.get(session)
  if (challenge) {
    const continueButton = new ContinueButton()
    continueButton.deactivate()
    challenge.reactivate()
    challenge.monitorCorrectAnswer(possibleAnswers, continueButton)
  }
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

new MutationObserver(function (nodes) {
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
