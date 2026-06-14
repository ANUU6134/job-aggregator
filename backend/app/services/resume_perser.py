import io
import re
from typing import Dict, List, Optional
import PyPDF2
from docx import Document
import logging

logger = logging.getLogger(__name__)

class ResumeParser:
    """Parse resumes to extract information"""
    
    async def parse_resume(self, file_content: bytes, content_type: str) -> Dict:
        """Parse resume file and extract information"""
        text = ""
        
        if content_type == "application/pdf":
            text = self._parse_pdf(file_content)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            text = self._parse_docx(file_content)
        
        if not text:
            return {}
        
        # Extract information
        data = {
            "name": self._extract_name(text),
            "email": self._extract_email(text),
            "phone": self._extract_phone(text),
            "skills": self._extract_skills(text),
            "experience": self._extract_experience(text),
            "education": self._extract_education(text)
        }
        
        return data
    
    def _parse_pdf(self, content: bytes) -> str:
        """Parse PDF file"""
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            logger.error(f"Failed to parse PDF: {str(e)}")
            return ""
    
    def _parse_docx(self, content: bytes) -> str:
        """Parse DOCX file"""
        try:
            doc_file = io.BytesIO(content)
            doc = Document(doc_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            logger.error(f"Failed to parse DOCX: {str(e)}")
            return ""
    
    def _extract_name(self, text: str) -> Optional[str]:
        """Extract name from resume text"""
        # Look for common name patterns
        lines = text.split('\n')[:5]  # Name is usually in first few lines
        for line in lines:
            line = line.strip()
            # Name pattern: at least two words starting with capital letters
            if re.match(r'^[A-Z][a-z]+ [A-Z][a-z]+( [A-Z][a-z]+)?$', line):
                return line
        return None
    
    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text"""
        phone_patterns = [
            r'\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from text"""
        common_skills = [
            'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'asp.net',
            'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
            'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
            'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
            'machine learning', 'data science', 'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy',
            'agile', 'scrum', 'kanban', 'leadership', 'communication', 'teamwork'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills[:20]  # Return top 20 skills
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience from text"""
        experiences = []
        
        # Look for common experience patterns
        experience_sections = re.split(r'(?i)(work experience|employment history|professional experience)', text)
        
        if len(experience_sections) > 1:
            exp_text = experience_sections[2] if len(experience_sections) > 2 else ""
            
            # Look for job entries (simplified)
            job_pattern = r'([A-Za-z\s]+?)\n([A-Za-z\s]+?)\n(\d{4}[-–]\d{4}|\w+\s\d{4}[-–]\w+\s\d{4}|Present|Current)'
            matches = re.findall(job_pattern, exp_text)
            
            for match in matches[:3]:  # Limit to 3 jobs
                experiences.append({
                    "title": match[0].strip(),
                    "company": match[1].strip(),
                    "period": match[2].strip()
                })
        
        return experiences
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information from text"""
        education = []
        
        # Look for common education patterns
        edu_sections = re.split(r'(?i)(education|academic background)', text)
        
        if len(edu_sections) > 1:
            edu_text = edu_sections[2] if len(edu_sections) > 2 else ""
            
            # Look for degree patterns
            degree_pattern = r'(Bachelor|Master|PhD|B\.?Sc|M\.?Sc|B\.?A|M\.?A|Associate)[\s]+(?:of[\s]+)?([A-Za-z\s]+?)(?:\n|$)'
            matches = re.findall(degree_pattern, edu_text)
            
            for match in matches[:2]:  # Limit to 2 degrees
                education.append({
                    "degree": f"{match[0]} of {match[1]}".strip(),
                    "institution": "Unknown"  # Would need more sophisticated parsing
                })
        
        return education