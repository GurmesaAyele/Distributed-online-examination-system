import re
from PyPDF2 import PdfReader
from typing import List, Dict

def parse_pdf_questions(pdf_file) -> List[Dict]:
    """
    Parse questions from a PDF file.
    Expected format:
    1. Question text here?
    A) Option A
    B) Option B
    C) Option C
    D) Option D
    Answer: A
    
    Or:
    Q1: Question text?
    a. Option A
    b. Option B
    c. Option C
    d. Option D
    Correct: a
    """
    questions = []
    
    try:
        reader = PdfReader(pdf_file)
        full_text = ""
        
        # Extract text from all pages
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        
        # Parse questions using regex patterns
        questions = extract_questions_from_text(full_text)
        
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        raise Exception(f"Failed to parse PDF: {str(e)}")
    
    return questions


def extract_questions_from_text(text: str) -> List[Dict]:
    """Extract questions from text using multiple patterns"""
    questions = []
    
    # Pattern 1: Numbered questions with A) B) C) D) options
    pattern1 = r'(\d+)\.\s*(.+?)\n\s*A\)\s*(.+?)\n\s*B\)\s*(.+?)\n\s*C\)\s*(.+?)\n\s*D\)\s*(.+?)\n\s*(?:Answer|Correct):\s*([A-D])'
    matches1 = re.finditer(pattern1, text, re.IGNORECASE | re.DOTALL)
    
    for match in matches1:
        question = {
            'question_text': match.group(2).strip(),
            'question_type': 'mcq',
            'marks': 1,
            'option_a': match.group(3).strip(),
            'option_b': match.group(4).strip(),
            'option_c': match.group(5).strip(),
            'option_d': match.group(6).strip(),
            'correct_answer': match.group(7).strip().upper(),
            'explanation': ''
        }
        questions.append(question)
    
    # Pattern 2: Q1: format with a. b. c. d. options
    pattern2 = r'Q(\d+):\s*(.+?)\n\s*a[\.\)]\s*(.+?)\n\s*b[\.\)]\s*(.+?)\n\s*c[\.\)]\s*(.+?)\n\s*d[\.\)]\s*(.+?)\n\s*(?:Answer|Correct):\s*([a-d])'
    matches2 = re.finditer(pattern2, text, re.IGNORECASE | re.DOTALL)
    
    for match in matches2:
        question = {
            'question_text': match.group(2).strip(),
            'question_type': 'mcq',
            'marks': 1,
            'option_a': match.group(3).strip(),
            'option_b': match.group(4).strip(),
            'option_c': match.group(5).strip(),
            'option_d': match.group(6).strip(),
            'correct_answer': match.group(7).strip().upper(),
            'explanation': ''
        }
        questions.append(question)
    
    # Pattern 3: True/False questions
    pattern3 = r'(\d+)\.\s*(.+?)\n\s*(?:Answer|Correct):\s*(True|False)'
    matches3 = re.finditer(pattern3, text, re.IGNORECASE | re.DOTALL)
    
    for match in matches3:
        question = {
            'question_text': match.group(2).strip(),
            'question_type': 'true_false',
            'marks': 1,
            'option_a': '',
            'option_b': '',
            'option_c': '',
            'option_d': '',
            'correct_answer': match.group(3).strip(),
            'explanation': ''
        }
        questions.append(question)
    
    # If no questions found with strict patterns, try simpler extraction
    if not questions:
        questions = extract_simple_questions(text)
    
    return questions


def extract_simple_questions(text: str) -> List[Dict]:
    """Fallback: Extract questions with simpler pattern"""
    questions = []
    
    # Split by question numbers
    lines = text.split('\n')
    current_question = None
    options = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line starts with a number (potential question)
        if re.match(r'^\d+[\.\)]\s*', line):
            # Save previous question if exists
            if current_question and len(options) >= 4:
                questions.append({
                    'question_text': current_question,
                    'question_type': 'mcq',
                    'marks': 1,
                    'option_a': options[0] if len(options) > 0 else '',
                    'option_b': options[1] if len(options) > 1 else '',
                    'option_c': options[2] if len(options) > 2 else '',
                    'option_d': options[3] if len(options) > 3 else '',
                    'correct_answer': 'A',  # Default, teacher can edit
                    'explanation': ''
                })
            
            # Start new question
            current_question = re.sub(r'^\d+[\.\)]\s*', '', line)
            options = []
        
        # Check if line is an option
        elif re.match(r'^[A-Da-d][\.\)]\s*', line):
            option_text = re.sub(r'^[A-Da-d][\.\)]\s*', '', line)
            options.append(option_text)
    
    # Add last question
    if current_question and len(options) >= 4:
        questions.append({
            'question_text': current_question,
            'question_type': 'mcq',
            'marks': 1,
            'option_a': options[0],
            'option_b': options[1],
            'option_c': options[2],
            'option_d': options[3],
            'correct_answer': 'A',
            'explanation': ''
        })
    
    return questions
