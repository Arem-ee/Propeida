'use client'

import { Check, X, BookOpen } from 'lucide-react'

interface Question {
  id: string
  subjectId: string
  questionText: string
  options: { key: string; text: string }[]
  selectedAnswer?: string | null
  isCorrect?: boolean | null
}

interface Feedback {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
}

interface QuestionCardProps {
  question: Question
  mode: 'practice' | 'mock'
  feedback: Feedback | null
  selectedOption: string | null
  onSelectOption: (key: string) => void
}

export default function QuestionCard({ question, mode, feedback, selectedOption, onSelectOption }: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs">
      <h3 className="text-base font-bold text-gray-900 leading-snug mb-6">
        {question.questionText}
      </h3>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.key
          const isCorrectOption = feedback?.correctAnswer === option.key
          const showResult = mode === 'practice' && feedback

          let cardStyle = 'border-gray-200 bg-white hover:border-gray-300'

          if (showResult) {
            if (isSelected) {
              cardStyle = feedback.isCorrect
                ? 'border-green-600 bg-green-50/20'
                : 'border-red-600 bg-red-50/20'
            } else if (isCorrectOption) {
              cardStyle = 'border-green-600 bg-green-50/10'
            }
          } else if (isSelected) {
            cardStyle = 'border-blue-600 bg-blue-50/10'
          }

          return (
            <button
              key={option.key}
              onClick={() => onSelectOption(option.key)}
              disabled={mode === 'practice' && !!feedback}
              className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all min-h-[44px] cursor-pointer ${cardStyle}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-bold border transition-colors ${
                showResult
                  ? isSelected
                    ? feedback.isCorrect
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-red-600 border-red-600 text-white'
                    : isCorrectOption
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-500 bg-white'
                  : isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500 bg-white'
              }`}>
                {option.key}
              </span>
              <span className="text-sm font-semibold text-gray-800">{option.text}</span>
            </button>
          )
        })}
      </div>

      {feedback && mode === 'practice' && (
        <div className="mt-6 space-y-4">
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
            feedback.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {feedback.isCorrect ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <X className="h-4 w-4 shrink-0" />
            )}
            <span className="text-sm font-bold">
              {feedback.isCorrect ? 'Correct' : `Incorrect — correct answer: ${feedback.correctAnswer}`}
            </span>
          </div>

          <div className="rounded-xl bg-blue-50/30 border border-blue-50 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Explanation
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{feedback.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
