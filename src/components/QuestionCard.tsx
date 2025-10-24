import React from 'react';

export default function QuestionCard({
  question,
  value,
  onChange
}: {
  question: any;
  value: any;
  onChange: (v:any)=>void;
}) {
  // question: { id, text, type: 'mcq'|'text', choices: [...] }
  return (
    <div className="question card">
      <div className="q-text"><strong>Q:</strong> {question.text}</div>
      {question.type === 'mcq' && (
        <div className="choices">
          {question.choices.map((c: string, idx: number) => (
            <label key={idx} className="choice">
              <input type="radio" name={question.id} checked={value === c} onChange={()=> onChange(c)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea value={value || ''} onChange={(e)=>onChange(e.target.value)} placeholder="Write your answer here..." />
      )}
    </div>
  );
}
