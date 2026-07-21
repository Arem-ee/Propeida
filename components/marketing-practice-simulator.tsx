'use client'

import { useState } from 'react'
import { Check, X, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react'

interface QuestionData {
  id: string
  subject: string
  exam: string
  question: string
  options: { key: string; text: string }[]
  correctAnswer: string
  explanation: string
}

export default function MarketingPracticeSimulator() {
  const questions: QuestionData[] = [
    {
      id: 'q1',
      subject: 'Physics',
      exam: 'JAMB',
      question: 'A body of mass 2 kg is moving with a velocity of 10 m/s. Calculate its kinetic energy.',
      options: [
        { key: 'A', text: '10 J' },
        { key: 'B', text: '50 J' },
        { key: 'C', text: '100 J' },
        { key: 'D', text: '200 J' },
      ],
      correctAnswer: 'C',
      explanation:
        'Kinetic Energy (K.E) is calculated using the formula: K.E = 1/2 × m × v². Substituting the given values: K.E = 1/2 × 2 kg × (10 m/s)² = 100 Joules. Option C is correct.',
    },
    {
      id: 'q2',
      subject: 'Chemistry',
      exam: 'JAMB',
      question: 'Which of the following compounds is a saturated hydrocarbon?',
      options: [
        { key: 'A', text: 'C₂H₄' },
        { key: 'B', text: 'C₂H₂' },
        { key: 'C', text: 'C₃H₆' },
        { key: 'D', text: 'C₃H₈' },
      ],
      correctAnswer: 'D',
      explanation:
        'Saturated hydrocarbons (alkanes) follow the general chemical formula CₙH₂ₙ₊₂. For propane (n = 3), the hydrogen count is 2(3) + 2 = 8, giving C₃H₈. Compounds with double or triple bonds are unsaturated. Option D is correct.',
    },
    {
      id: 'q3',
      subject: 'Government',
      exam: 'JAMB',
      question: 'The first Governor-General of amalgamated Nigeria from 1914 was',
      options: [
        { key: 'A', text: 'Lord Frederick Lugard' },
        { key: 'B', text: 'Sir Arthur Richards' },
        { key: 'C', text: 'Sir John Macpherson' },
        { key: 'D', text: 'Dr. Nnamdi Azikiwe' },
      ],
      correctAnswer: 'A',
      explanation:
        'Lord Frederick Lugard became the first Governor-General of colonial Nigeria in 1914 following the amalgamation of the Northern and Southern protectorates which occurred under his administration. Option A is correct.',
    },
    {
      id: 'q4',
      subject: 'Literature',
      exam: 'JAMB',
      question: "Identify the literary device used in the phrase: 'The wind stood up and gave a shout.'",
      options: [
        { key: 'A', text: 'Metaphor' },
        { key: 'B', text: 'Personification' },
        { key: 'C', text: 'Oxymoron' },
        { key: 'D', text: 'Hyperbole' },
      ],
      correctAnswer: 'B',
      explanation:
        "Personification attributes human qualities, actions, or emotions to non-human entities. In this line, the wind is given the human qualities of 'standing up' and 'shouting'. Option B is correct.",
    },
  ]

  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const currentQuestion = questions[activeSubjectIndex]!

  const handleOptionSelect = (key: string) => {
    if (!isSubmitted) {
      setSelectedKey(key)
    }
  }

  const handleSubmit = () => {
    if (selectedKey) {
      setIsSubmitted(true)
    }
  }

  const handleReset = () => {
    setSelectedKey(null)
    setIsSubmitted(false)
  }

  const handleSubjectChange = (index: number) => {
    setActiveSubjectIndex(index)
    setSelectedKey(null)
    setIsSubmitted(false)
  }

  return (
    <section id="simulator" className="border-t border-gray-100 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Interactive practice simulator
          </h2>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            See how PrepIQ helps you master difficult concepts. Select a subject below, choose your answer, and review the detailed post-exam explanation.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => handleSubjectChange(idx)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer ${
                activeSubjectIndex === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {q.subject}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {currentQuestion.exam} Exam Simulator
            </span>
            <span className="rounded-xl bg-white px-2.5 py-1 text-xs font-semibold text-gray-500 border border-gray-100">
              Practice Mode Active
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xs">
            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedKey === option.key
                const isCorrect = option.key === currentQuestion.correctAnswer

                let cardStyle = 'border-gray-200 bg-white hover:border-gray-300'

                if (isSelected) {
                  if (isSubmitted) {
                    cardStyle = isCorrect
                      ? 'border-green-600 bg-green-50/20'
                      : 'border-red-600 bg-red-50/20'
                  } else {
                    cardStyle = 'border-blue-600 bg-blue-50/10'
                  }
                } else if (isSubmitted && isCorrect) {
                  cardStyle = 'border-green-600 bg-green-50/10'
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleOptionSelect(option.key)}
                    disabled={isSubmitted}
                    className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all min-h-[44px] cursor-pointer ${cardStyle}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-bold border transition-colors ${
                      isSelected
                        ? isSubmitted
                          ? isCorrect
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-red-600 border-red-600 text-white'
                          : 'bg-blue-600 border-blue-600 text-white'
                        : isSubmitted && isCorrect
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 text-gray-500 bg-white'
                    }`}>
                      {option.key}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{option.text}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100">
              <div>
                {isSubmitted ? (
                  selectedKey === currentQuestion.correctAnswer ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                      <Check className="h-4 w-4 text-green-600" />
                      Correct answer +1 mark
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                      <X className="h-4 w-4 text-red-600" />
                      Incorrect option selected
                    </div>
                  )
                ) : (
                  <div className="text-xs text-gray-400">
                    Select an option and tap Check Answer to view explanation.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isSubmitted ? (
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 active:bg-gray-100 min-h-[44px] cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedKey}
                    className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-colors min-h-[44px] cursor-pointer ${
                      selectedKey
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                )}
              </div>
            </div>

            {isSubmitted && (
              <div className="mt-6 rounded-xl bg-blue-50/30 border border-blue-50 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  PrepIQ High-Yield Explanation
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white p-3 border border-blue-50/50">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-gray-500 leading-normal">
                    <strong>Syllabus Focus:</strong> This is a highly repeated topic in the national syllabus. Master this formula to secure easy points on exam day.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
