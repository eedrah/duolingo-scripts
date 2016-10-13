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

/* globals MutationObserver */

const AnswerChecker = new class {
  isEqual (possibleAnswers, answer) {
    return possibleAnswers.indexOf(answer) > -1
  }
}

const Challenges = new class {
  constructor () {
    this._types = {}
  }
  getType (session) {
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

class AbstractChallenge {
  constructor (node) {
    this._challengeNode = node
    this._input = undefined
  }
}

class TranslateChallenge extends AbstractChallenge {
  _deactivate () {
    this._input.disabled = true
  }

  reactivate () {
    this._challengeNode.querySelector('.challenge-cell #submitted-text').style.display = 'none'
    this._input = this._challengeNode.querySelector('.challenge-cell textarea')
    this._input.style.display = null
    this._input.disabled = false
    setTimeout(function () { // stop the spurious new line
      this._input.value = this._input.value.trim()
    }.bind(this))
    this._input.focus()
  }
  monitorCorrectAnswer (possibleAnswers, continueButton) {
    this._input.addEventListener('input', function () {
      if (AnswerChecker.isEqual(possibleAnswers, this._input.value)) {
        continueButton.reactivate()
        this._deactivate()
      }
    }.bind(this))
  }
}
Challenges.register('challenge-translate', TranslateChallenge)

class ListenChallenge extends AbstractChallenge {
  _deactivate () {
    this._input.contentEditable = false
  }

  reactivate () {
    this._input = this._challengeNode.querySelector('#graded-word-input')
    this._input.contentEditable = true
    this._input.focus()
    this._input.textContent = this._input.textContent.trim()
    this._input.addEventListener('keydown', function (e) { e.stopPropagation() }) // fixes the backspace key
  }
  monitorCorrectAnswer (possibleAnswers, continueButton) {
    this._monitor = new MutationObserver(function () {
      if (AnswerChecker.isEqual(possibleAnswers, this._input.textContent)) {
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
}
Challenges.register('challenge-listen', ListenChallenge)
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
  const challenge = Challenges.getType(session)
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
