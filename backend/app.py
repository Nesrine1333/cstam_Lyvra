from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from PIL import Image
import io
import os
import time
import re
import json
from typing import Optional, Dict, List, Any
import logging
import requests


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Medical Nutritionist API",
    description="Extract medical results and provide comprehensive AI-powered dietary recommendations using medical models",
    version="5.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tesseract configuration
try:
    import pytesseract
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    ]
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


class MedicalAIDietAdvisor:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        # Medical-focused models (prioritized)
        self.medical_models = [
            "medllama2",           # Medical fine-tuned Llama 2
            "llama2:13b",          # General knowledge with medical context
            "mistral",             # Good medical reasoning
            "medalpaca/medalpaca-7b",  # Specifically trained on medical data
            "codellama:13b"        # Good for structured responses
        ]
        self.current_model = self.medical_models[0]
        self.enabled = self._check_ollama_available()
        
        if self.enabled:
            self._ensure_medical_model()
    
    def _check_ollama_available(self) -> bool:
        """Check if Ollama is running and get available models"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                available_models = [model['name'] for model in response.json().get('models', [])]
                logger.info(f"Available Ollama models: {available_models}")
                
                # Find the best available medical model
                for model in self.medical_models:
                    if any(available_model.startswith(model.split(':')[0]) for available_model in available_models):
                        self.current_model = model
                        logger.info(f"Using medical model: {self.current_model}")
                        break
                
                return True
            return False
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            return False
    
    def _ensure_medical_model(self):
        """Ensure a medical model is available, pull if necessary"""
        try:
            # Check if current model is available
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            available_models = [model['name'] for model in response.json().get('models', [])]
            
            current_available = any(
                available_model.startswith(self.current_model.split(':')[0]) 
                for available_model in available_models
            )
            
            if not current_available:
                logger.info(f"Pulling medical model: {self.medical_models[0]}")
                pull_response = requests.post(
                    f"{self.base_url}/api/pull",
                    json={"name": self.medical_models[0]},
                    timeout=300  # 5 minutes for download
                )
                if pull_response.status_code == 200:
                    logger.info("Medical model pulled successfully")
        except Exception as e:
            logger.warning(f"Could not ensure medical model: {e}")
    
    def get_comprehensive_recommendations(self, medical_data: dict, patient_info: dict) -> dict:
        """Get comprehensive AI-powered medical nutrition recommendations"""
        if not self.enabled:
            return self._get_enhanced_fallback_recommendations(medical_data)
        
        try:
            prompt = self._build_comprehensive_medical_prompt(medical_data, patient_info)
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.current_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for medical accuracy
                        "top_p": 0.85,
                        "top_k": 40,
                        "max_tokens": 2500,  # Longer responses for comprehensive advice
                        "repeat_penalty": 1.1
                    }
                },
                timeout=180  # 3 minutes for complex medical reasoning
            )
            
            if response.status_code == 200:
                ai_response = response.json().get("response", "")
                logger.info(f"AI Response received: {len(ai_response)} characters")
                return self._parse_comprehensive_ai_response(ai_response, medical_data)
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._get_enhanced_fallback_recommendations(medical_data)
                
        except Exception as e:
            logger.error(f"AI recommendation error: {e}")
            return self._get_enhanced_fallback_recommendations(medical_data)
    
    def _build_comprehensive_medical_prompt(self, medical_data: dict, patient_info: dict) -> str:
        """Build a detailed medical nutrition prompt"""
        
        blood_results = medical_data.get("resultats_hemobiologie", {})
        notes = medical_data.get("notes_medicales", [])
        patient_age = patient_info.get('age', 'Unknown')
        patient_name = patient_info.get('nom', 'Patient')
        
        # Extract key values with units
        hemoglobin = blood_results.get("hemoglobine", {}).get("valeur")
        neutrophils = blood_results.get("neutrophiles_pourcentage", {}).get("valeur")
        wbc = blood_results.get("globules_blancs", {}).get("valeur")
        rbc = blood_results.get("globules_rouges", {}).get("valeur")
        platelets = blood_results.get("plaquettes", {}).get("valeur")
        
        prompt = f"""
        You are Dr. Nutrition AI, an expert medical nutritionist with specialized knowledge in hematology and clinical nutrition. 
        Analyze the following complete blood count (CBC) results and provide comprehensive, evidence-based dietary recommendations.

        PATIENT PROFILE:
        - Name: {patient_name}
        - Age: {patient_age} years
        - Context: Routine blood test analysis

        COMPLETE BLOOD COUNT RESULTS:
        - White Blood Cells (Globules Blancs): {wbc or 'N/A'} (Normal: 4.00-10.00 10³/mm³)
        - Red Blood Cells (Globules Rouges): {rbc or 'N/A'} (Normal: 4.20-6.00 10⁶/mm³)
        - Hemoglobin (Hémoglobine): {hemoglobin or 'N/A'} (Normal: 13.00-16.70 g/dL)
        - Neutrophils Percentage: {neutrophils or 'N/A'} (Normal: 42.00-70.00 %)
        - Platelets (Plaquettes): {platelets or 'N/A'} (Normal: 130.00-450.00 10³/mm³)

        CLINICAL NOTES:
        {chr(10).join(notes) if notes else 'No specific clinical notes provided'}

        MEDICAL ANALYSIS REQUESTED:

        Please provide a comprehensive nutritional intervention plan including:

        1. CLINICAL INTERPRETATION:
           - Analysis of abnormal values
           - Potential underlying conditions
           - Nutritional implications

        2. SPECIFIC NUTRIENT FOCUS:
           - Key nutrients needed
           - Recommended daily intake
           - Absorption enhancers/inhibitors

        3. DETAILED FOOD RECOMMENDATIONS:
           - Specific foods with portion sizes
           - Preparation methods
           - Timing recommendations

        4. MEAL PLANNING:
           - 3-day sample meal plan
           - Snack suggestions
           - Hydration guidance

        5. LIFESTYLE RECOMMENDATIONS:
           - Exercise considerations
           - Sleep and stress management
           - Monitoring suggestions

        6. PRECAUTIONS:
           - Foods to avoid
           - Potential interactions
           - When to consult healthcare provider

        RESPONSE FORMAT (STRICT JSON):
        {{
            "clinical_interpretation": {{
                "abnormal_findings": ["list", "of", "key", "findings"],
                "potential_conditions": ["list", "of", "possible", "conditions"],
                "urgency_level": "low/medium/high",
                "recommended_follow_up": "suggestions for medical follow-up"
            }},
            "nutrient_focus": {{
                "primary_nutrients": ["iron", "vitamin_b12", ...],
                "secondary_nutrients": ["vitamin_c", "zinc", ...],
                "daily_targets": {{
                    "nutrient": "target amount with units"
                }}
            }},
            "food_recommendations": [
                {{
                    "food_group": "e.g., Iron-rich proteins",
                    "specific_foods": [
                        {{
                            "name": "spinach",
                            "portion": "1 cup cooked",
                            "frequency": "daily",
                            "benefit": "rich in non-heme iron and folate",
                            "preparation_tips": "cook with vitamin C source"
                        }}
                    ]
                }}
            ],
            "meal_plan": {{
                "day1": {{
                    "breakfast": "detailed meal description",
                    "lunch": "detailed meal description",
                    "dinner": "detailed meal description",
                    "snacks": ["snack 1", "snack 2"]
                }},
                "day2": {{...}},
                "day3": {{...}}
            }},
            "lifestyle_recommendations": [
                "specific actionable advice"
            ],
            "precautions": [
                "important warnings and considerations"
            ],
            "monitoring_suggestions": [
                "how to track progress and when to retest"
            ]
        }}

        Base your recommendations on current clinical nutrition guidelines and evidence-based medicine. 
        Be specific, practical, and prioritize patient safety.
        """
        
        return prompt
    
    def _parse_comprehensive_ai_response(self, ai_response: str, medical_data: dict) -> dict:
        """Parse the comprehensive AI response"""
        try:
            # Extract JSON from response
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                parsed_data = json.loads(json_str)
                
                # Add metadata
                parsed_data["analysis_metadata"] = {
                    "source": "medical_ai_model",
                    "model_used": self.current_model,
                    "timestamp": time.time(),
                    "response_length": len(ai_response)
                }
                
                return parsed_data
            else:
                return self._structure_text_as_comprehensive(ai_response, medical_data)
                
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing failed, structuring text response: {e}")
            return self._structure_text_as_comprehensive(ai_response, medical_data)
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return self._get_enhanced_fallback_recommendations(medical_data)
    
    def _structure_text_as_comprehensive(self, text: str, medical_data: dict) -> dict:
        """Structure text response when JSON parsing fails"""
        return {
            "clinical_interpretation": {
                "abnormal_findings": ["AI Analysis Provided"],
                "potential_conditions": ["See detailed response"],
                "urgency_level": "consult_doctor",
                "recommended_follow_up": "Discuss with healthcare provider"
            },
            "nutrient_focus": {
                "primary_nutrients": ["Comprehensive analysis provided"],
                "secondary_nutrients": ["See AI response"],
                "daily_targets": {"general": "balanced nutrition"}
            },
            "food_recommendations": [
                {
                    "food_group": "AI Generated Recommendations",
                    "specific_foods": [
                        {
                            "name": "Refer to AI analysis",
                            "portion": "See detailed recommendations",
                            "frequency": "As recommended",
                            "benefit": text[:200] + "...",
                            "preparation_tips": "Consult full AI response"
                        }
                    ]
                }
            ],
            "meal_plan": {
                "day1": {
                    "breakfast": "Refer to AI analysis above",
                    "lunch": "Refer to AI analysis above",
                    "dinner": "Refer to AI analysis above",
                    "snacks": ["See comprehensive recommendations"]
                }
            },
            "lifestyle_recommendations": [
                "Review the comprehensive AI analysis provided",
                "Consult with healthcare provider for personalized plan"
            ],
            "precautions": [
                "AI recommendations should be reviewed by medical professional",
                "Individual needs may vary"
            ],
            "monitoring_suggestions": [
                "Follow up with healthcare provider",
                "Repeat blood tests as recommended"
            ],
            "analysis_metadata": {
                "source": "medical_ai_text_response",
                "model_used": self.current_model,
                "full_text_response": text,
                "note": "JSON parsing failed, providing text response"
            }
        }
    
    def _get_enhanced_fallback_recommendations(self, medical_data: dict) -> dict:
        """Enhanced fallback when AI is unavailable"""
        blood_results = medical_data.get("resultats_hemobiologie", {})
        hemoglobin = blood_results.get("hemoglobine", {}).get("valeur")
        neutrophils = blood_results.get("neutrophiles_pourcentage", {}).get("valeur")
        
        conditions = []
        if hemoglobin and hemoglobin < 13.0:
            conditions.append("Possible Iron Deficiency")
        if neutrophils and neutrophils < 42.0:
            conditions.append("Neutropenia")
        
        return {
            "clinical_interpretation": {
                "abnormal_findings": conditions if conditions else ["No significant abnormalities detected"],
                "potential_conditions": conditions,
                "urgency_level": "low",
                "recommended_follow_up": "Consult healthcare provider for personalized advice"
            },
            "nutrient_focus": {
                "primary_nutrients": ["Iron", "Vitamin B12", "Folate", "Protein"],
                "secondary_nutrients": ["Vitamin C", "Zinc", "Copper"],
                "daily_targets": {
                    "iron": "8-18 mg based on needs",
                    "protein": "1.2-1.6 g/kg body weight"
                }
            },
            "food_recommendations": [
                {
                    "food_group": "Iron-Rich Foods",
                    "specific_foods": [
                        {
                            "name": "Lean red meat",
                            "portion": "3-4 oz",
                            "frequency": "2-3 times weekly",
                            "benefit": "Heme iron for better absorption",
                            "preparation_tips": "Cook with vitamin C sources"
                        }
                    ]
                }
            ],
            "meal_plan": {
                "day1": {
                    "breakfast": "Fortified cereal with berries and nuts",
                    "lunch": "Spinach salad with chicken and lemon dressing",
                    "dinner": "Lentil soup with whole grain bread",
                    "snacks": ["Orange", "Yogurt with honey"]
                }
            },
            "lifestyle_recommendations": [
                "Maintain balanced nutrition with variety",
                "Stay well hydrated",
                "Practice good food safety",
                "Get adequate sleep and manage stress"
            ],
            "precautions": [
                "AI service temporarily unavailable",
                "Consult healthcare provider for personalized medical advice",
                "These are general recommendations only"
            ],
            "monitoring_suggestions": [
                "Follow up with healthcare provider",
                "Repeat blood tests as clinically indicated",
                "Monitor energy levels and symptoms"
            ],
            "analysis_metadata": {
                "source": "enhanced_fallback",
                "model_used": "fallback",
                "timestamp": time.time(),
                "note": "AI service unavailable, using evidence-based fallback"
            }
        }

# Initialize medical AI advisor
medical_ai = MedicalAIDietAdvisor()



def extract_patient_info(text: str) -> Dict[str, Any]:
    """Extract patient information from text"""
    patient_info = {}
    
    # Extract NIP
    nip_match = re.search(r'NIP\s*:\s*(\d+)', text)
    if nip_match:
        patient_info['nip'] = nip_match.group(1)
    
    # Extract patient number
    patient_num_match = re.search(r'N°\s*:\s*(\d+)', text)
    if patient_num_match:
        patient_info['patient_number'] = patient_num_match.group(1)
    
    # Extract name
    name_match = re.search(r'Nom\s*:\s*([A-Z]+)', text)
    if name_match:
        patient_info['nom'] = name_match.group(1)
    
    # Extract first name
    prenom_match = re.search(r'Prénom\s*:\s*([A-Z]+)', text)
    if prenom_match:
        patient_info['prenom'] = prenom_match.group(1)
    
    # Extract age and birth date
    age_match = re.search(r'Age\s*:\s*(\d+)\s*ans\s*(\d{2}/\d{2}/\d{4})', text)
    if age_match:
        patient_info['age'] = int(age_match.group(1))
        patient_info['date_naissance'] = age_match.group(2)
    
    # Extract sampling date
    prelevement_match = re.search(r'Prélèvement du\s*:\s*(\d{2}/\d{2}/\d{4}\s*\d{2}:\d{2}:\d{2})', text)
    if prelevement_match:
        patient_info['date_prelevement'] = prelevement_match.group(1)
    
    # Extract prescribing doctor
    docteur_match = re.search(r'Demandé par\s*:\s*([^\n]+)', text)
    if docteur_match:
        patient_info['medecin_prescripteur'] = docteur_match.group(1).strip()
    
    # Extract report date
    edition_match = re.search(r'Edité le\s*:\s*(\d{2}/\d{2}/\d{4}\s*\d{2}:\d{2}:\d{2})', text)
    if edition_match:
        patient_info['date_edition'] = edition_match.group(1)
    
    return patient_info

def extract_laboratory_info(text: str) -> Dict[str, Any]:
    """Extract laboratory information"""
    lab_info = {}
    
    # Extract lab name
    lab_match = re.search(r'LABORATOIRE[^\n]+', text)
    if lab_match:
        lab_info['nom_laboratoire'] = lab_match.group(0).strip()
    
    # Extract doctor name
    docteur_match = re.search(r'Dr\.\s*([^\n-]+)', text)
    if docteur_match:
        lab_info['docteur'] = docteur_match.group(1).strip()
    
    # Extract specialty
    specialite_match = re.search(r'Spécialiste en ([^\n]+)', text)
    if specialite_match:
        lab_info['specialite'] = specialite_match.group(1).strip()
    
    # Extract lab number
    lab_num_match = re.search(r'sous le N°(\d+)', text)
    if lab_num_match:
        lab_info['numero_agrement'] = lab_num_match.group(1)
    
    return lab_info

def extract_blood_count_results(text: str) -> Dict[str, Any]:
    """Extract complete blood count results"""
    results = {}
    
    # Global patterns for blood count
    patterns = {
        "globules_blancs": [r"Globules\s+Blancs?\s*:\s*([\d.,]+)", r"GB\s*:\s*([\d.,]+)"],
        "globules_rouges": [r"Globules\s+Rouges?\s*:\s*([\d.,]+)", r"GR\s*:\s*([\d.,]+)"],
        "hemoglobine": [r"Hémoglobine\s*:\s*([\d.,]+)", r"HGB\s*:\s*([\d.,]+)"],
        "hematocrite": [r"Hématocrite\s*:\s*([\d.,]+)", r"HCT\s*:\s*([\d.,]+)"],
        "vgm": [r"VGM\s*:\s*([\d.,]+)", r"MCV\s*:\s*([\d.,]+)"],
        "ccmh": [r"CCMH\s*:\s*([\d.,]+)", r"MCHC\s*:\s*([\d.,]+)"],
        "tcmh": [r"TCMH\s*:\s*([\d.,]+)", r"MCH\s*:\s*([\d.,]+)"],
        "idr": [r"IDR\s*:\s*([\d.,]+)", r"RDW\s*:\s*([\d.,]+)"],
        "plaquettes": [r"Plaquettes?\s*:\s*([\d.,]+)", r"PLT\s*:\s*([\d.,]+)"],
        "vpm": [r"VPM\s*:\s*([\d.,]+)", r"MPV\s*:\s*([\d.,]+)"],
        
        # White blood cell differential
        "neutrophiles_pourcentage": [r"Neutrophiles\s*\(%\)\s*:\s*([\d.,]+)"],
        "neutrophiles_absolu": [r"Neutrophiles\s*:\s*([\d.,]+)"],
        "eosinophiles_pourcentage": [r"Eosinophiles\s*\(%\)\s*:\s*([\d.,]+)"],
        "eosinophiles_absolu": [r"Eosinophiles\s*:\s*([\d.,]+)"],
        "basophiles_pourcentage": [r"Basophiles\s*\(%\)\s*:\s*([\d.,]+)"],
        "basophiles_absolu": [r"Basophiles\s*:\s*([\d.,]+)"],
        "lymphocytes_pourcentage": [r"Lymphocytes\s*\(%\)\s*:\s*([\d.,]+)"],
        "lymphocytes_absolu": [r"Lymphocytes\s*:\s*([\d.,]+)"],
        "monocytes_pourcentage": [r"Monocytes\s*\(%\)\s*:\s*([\d.,]+)"],
        "monocytes_absolu": [r"Monocytes\s*:\s*([\d.,]+)"]
    }
    
    # Units mapping
    units = {
        "globules_blancs": "10³/mm³",
        "globules_rouges": "10⁶/mm³", 
        "hemoglobine": "g/dL",
        "hematocrite": "%",
        "vgm": "fL",
        "ccmh": "g/dL",
        "tcmh": "pg",
        "idr": "%",
        "plaquettes": "10³/mm³",
        "vpm": "fL",
        "neutrophiles_pourcentage": "%",
        "neutrophiles_absolu": "10³/mm³",
        "eosinophiles_pourcentage": "%",
        "eosinophiles_absolu": "10³/mm³",
        "basophiles_pourcentage": "%",
        "basophiles_absolu": "10³/mm³",
        "lymphocytes_pourcentage": "%",
        "lymphocytes_absolu": "10³/mm³",
        "monocytes_pourcentage": "%",
        "monocytes_absolu": "10³/mm³"
    }
    
    text_clean = re.sub(r'\s+', ' ', text)
    
    for param_name, param_patterns in patterns.items():
        value = None
        for pattern in param_patterns:
            match = re.search(pattern, text_clean, re.IGNORECASE)
            if match and match.groups():
                try:
                    value_str = match.group(1).replace(',', '.')
                    value = float(value_str)
                    break
                except ValueError:
                    continue
        
        results[param_name] = {
            "valeur": value,
            "unite": units.get(param_name, ""),
            "trouve": value is not None
        }
    
    return results

def extract_medical_notes(text: str) -> List[str]:
    """Extract medical notes and comments"""
    notes = []
    
    # Look for notes after "NFS:" or similar indicators
    nfs_note_match = re.search(r'NFS:\s*([^\n]+)', text)
    if nfs_note_match:
        notes.append(nfs_note_match.group(1).strip())
    
    # Look for any lines that might be comments/notes
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if (line and 
            not line.startswith('LABORATOIRE') and
            not line.startswith('Dr.') and
            not line.startswith('Dossier') and
            not line.startswith('N°') and
            not line.startswith('Nom') and
            not line.startswith('Prénom') and
            not line.startswith('Age') and
            not line.startswith('Prélèvement') and
            not line.startswith('Demandé') and
            not line.startswith('Edité') and
            not line.startswith('HEMOBIOLOGIE') and
            not line.startswith('Examens') and
            not re.match(r'^\|', line) and  # Table lines
            not re.match(r'^[\d.,]+\s*[-\s]', line) and  # Values with ranges
            len(line) > 20 and  # Reasonable length for a note
            ':' not in line):  # Not a key-value pair
            notes.append(line)
    
    return notes

def extract_complete_medical_data(text: str) -> Dict[str, Any]:
    """Extract all medical information from text"""
    return {
        "informations_patient": extract_patient_info(text),
        "informations_laboratoire": extract_laboratory_info(text),
        "resultats_hemobiologie": extract_blood_count_results(text),
        "notes_medicales": extract_medical_notes(text),
        "presence_hemobiologie": "HEMOBIOLOGIE" in text
    }

def extract_text_from_pdf(pdf_bytes: bytes, page_range: Optional[str] = None) -> Dict:
    """Extract text from PDF and process complete medical results"""
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            total_pages = len(pdf.pages)
            all_text = ""
            
            # Parse page range
            pages_to_process = []
            if page_range:
                for part in page_range.split(','):
                    part = part.strip()
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_process.extend(range(start-1, end))
                    else:
                        pages_to_process.append(int(part)-1)
            else:
                pages_to_process = range(total_pages)
            
            pages_to_process = sorted(set(pages_to_process))
            
            # Extract text from all pages
            for page_num in pages_to_process:
                if page_num < total_pages:
                    try:
                        page = pdf.pages[page_num]
                        text = page.extract_text() or ""
                        all_text += text + "\n"
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num + 1}: {e}")
            
            # Extract complete medical data
            medical_data = extract_complete_medical_data(all_text)
            
            return {
                "texte_complet": all_text.strip(),
                "donnees_medicales": medical_data,
                "total_pages": total_pages,
                "methode": "analyse_pdf"
            }
    except Exception as e:
        raise HTTPException(500, f"PDF processing failed: {str(e)}")

def extract_text_from_image(image_bytes: bytes, language: str = "fra") -> Dict:
    """Extract text from image and process complete medical results"""
    if not OCR_AVAILABLE:
        raise HTTPException(500, "OCR functionality not available.")
    
    try:
        # Open and process image
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Use French language for better OCR of medical terms
        text = pytesseract.image_to_string(image, lang=language)
        
        # Extract complete medical data
        medical_data = extract_complete_medical_data(text)
        
        return {
            "texte_complet": text.strip(),
            "donnees_medicales": medical_data,
            "total_pages": 1,
            "methode": "ocr"
        }
    except Exception as e:
        raise HTTPException(500, f"OCR processing failed: {str(e)}")

@app.post("/extract-results")
async def extract_medical_results(
    file: UploadFile = File(..., description="PDF or image file with lab results"),
    page_range: Optional[str] = Query(None, description="PDF page range"),
    language: str = Query("fra", description="OCR language for images"),
    use_ai: bool = Query(True, description="Use medical AI for comprehensive recommendations"),
    ai_model: str = Query("auto", description="Specific AI model to use")
):
    """Extract medical results with comprehensive AI-powered medical nutrition recommendations"""
    start_time = time.time()
    
    try:
        contents = await file.read()
        
        if not contents:
            raise HTTPException(400, "Empty file")
        
        # File type detection and extraction
        filename_lower = file.filename.lower()
        if filename_lower.endswith('.pdf') or contents.startswith(b'%PDF'):
            result = extract_text_from_pdf(contents, page_range)
            response_data = {
                "fichier": file.filename,
                "type_fichier": "pdf",
                "statut": "success",
                "methode_extraction": result["methode"],
                "nombre_pages": result["total_pages"],
                "donnees_extractes": result["donnees_medicales"],
                "texte_complet": result["texte_complet"][:800] + "..." if len(result["texte_complet"]) > 800 else result["texte_complet"]
            }
        else:
            if not OCR_AVAILABLE:
                raise HTTPException(400, "Image OCR not available.")
            
            result = extract_text_from_image(contents, language)
            response_data = {
                "fichier": file.filename,
                "type_fichier": "image",
                "statut": "success",
                "methode_extraction": result["methode"],
                "nombre_pages": result["total_pages"],
                "langue_ocr": language,
                "donnees_extractes": result["donnees_medicales"],
                "texte_complet": result["texte_complet"][:800] + "..." if len(result["texte_complet"]) > 800 else result["texte_complet"]
            }
        
        # Add comprehensive AI recommendations if requested
        if use_ai and response_data["statut"] == "success":
            medical_data = response_data["donnees_extractes"]
            patient_info = medical_data["informations_patient"]
            
            # Use specific model if requested
            if ai_model != "auto" and ai_model in medical_ai.medical_models:
                medical_ai.current_model = ai_model
            
            logger.info("Generating comprehensive AI recommendations...")
            ai_start_time = time.time()
            
            ai_recommendations = medical_ai.get_comprehensive_recommendations(medical_data, patient_info)
            ai_processing_time = round(time.time() - ai_start_time, 2)
            
            response_data["recommandations_medicales_ai"] = ai_recommendations
            response_data["temps_analyse_ai"] = ai_processing_time
        
        response_data["temps_traitement_total"] = round(time.time() - start_time, 2)
        return JSONResponse(
            content={
                "texte_complet": response_data["texte_complet"],
                "donnees_extractes": response_data["donnees_extractes"],
                "statut":response_data["statut"]
            },
            status_code=200
        )

        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        raise HTTPException(500, f"Processing failed: {str(e)}")
    
@app.get("/ai-status")
async def get_ai_status():
    """Get comprehensive AI service status"""
    return {
        "ai_service": "Medical AI Diet Advisor",
        "enabled": medical_ai.enabled,
        "current_medical_model": medical_ai.current_model,
        "available_medical_models": medical_ai.medical_models,
        "ollama_base_url": medical_ai.base_url,
        "service_status": "active" if medical_ai.enabled else "inactive"
    }

@app.post("/test-medical-ai")
async def test_medical_ai(medical_data: dict):
    """Test the medical AI with sample data"""
    sample_patient = {
        "age": 52,
        "nom": "BAHLOUL", 
        "prenom": "MOHAMED"
    }
    
    test_start = time.time()
    recommendations = medical_ai.get_comprehensive_recommendations(medical_data, sample_patient)
    processing_time = round(time.time() - test_start, 2)
    
    return {
        "test_results": recommendations,
        "processing_time": processing_time,
        "model_used": medical_ai.current_model
    }



@app.get("/")
async def root():
    return {
        "message": "API d'Extraction Complète de Résultats Médicaux",
        "statut": "actif",
        "ocr_disponible": OCR_AVAILABLE,
        "endpoints": {
            "/extract-results": "Extraction complète des résultats médicaux"
        }
    }

@app.get("/health")
async def health():
    return {
        "statut": "healthy",
        "ocr_disponible": OCR_AVAILABLE,
        "service": "Medical Lab Results Extractor"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")