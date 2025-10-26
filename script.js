// DOM Elements
const sourceText = document.getElementById('sourceText');
const translatedText = document.getElementById('translatedText');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');
const translateButton = document.getElementById('translateButton');
const swapButton = document.getElementById('swapLanguages');
const clearButton = document.getElementById('clearSource');
const copyButton = document.getElementById('copyTranslation');
const charCount = document.getElementById('charCount');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');

// Settings Elements
const toggleSettings = document.getElementById('toggleSettings');
const settingsPanel = document.getElementById('settingsPanel');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const apiModel = document.getElementById('apiModel');
const saveSettings = document.getElementById('saveSettings');

// Tone Controls Elements
const formalityRadios = document.querySelectorAll('input[name="formality"]');
const customToneContainer = document.getElementById('customToneContainer');
const customTonePrompt = document.getElementById('customTonePrompt');

// Language Map
const languageNames = {
    'auto': 'Detect Language',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian'
};

// Load saved settings
function loadSettings() {
    const savedSettings = localStorage.getItem('quickTranslateSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        apiEndpoint.value = settings.endpoint || 'https://api.openai.com/v1/chat/completions';
        apiKey.value = settings.apiKey || '';
        apiModel.value = settings.model || 'gpt-3.5-turbo';
    }
}

// Save settings
function saveSettingsToStorage() {
    const settings = {
        endpoint: apiEndpoint.value,
        apiKey: apiKey.value,
        model: apiModel.value
    };
    localStorage.setItem('quickTranslateSettings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
}

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update character count
function updateCharCount() {
    const count = sourceText.value.length;
    charCount.textContent = `${count} / 5000`;
    
    if (count > 4500) {
        charCount.style.color = '#f44336';
    } else if (count > 4000) {
        charCount.style.color = '#ff9800';
    } else {
        charCount.style.color = '#666';
    }
}

// Clear source text
function clearSourceText() {
    sourceText.value = '';
    updateCharCount();
    translatedText.innerHTML = '<span class="placeholder">Translation will appear here...</span>';
}

// Copy translation to clipboard
async function copyTranslation() {
    const text = translatedText.textContent;
    if (text && text !== 'Translation will appear here...') {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Translation copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy translation', 'error');
        }
    }
}

// Swap languages
function swapLanguages() {
    if (sourceLanguage.value === 'auto') {
        showToast('Cannot swap when auto-detect is selected', 'error');
        return;
    }
    
    const tempLang = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = tempLang;
    
    const tempText = sourceText.value;
    const translatedContent = translatedText.textContent;
    
    if (translatedContent && translatedContent !== 'Translation will appear here...') {
        sourceText.value = translatedContent;
        translatedText.innerHTML = tempText ? tempText : '<span class="placeholder">Translation will appear here...</span>';
        updateCharCount();
    }
}

// Translate text
async function translateText() {
    const text = sourceText.value.trim();
    if (!text) {
        showToast('Please enter text to translate', 'error');
        return;
    }
    
    const settings = {
        endpoint: apiEndpoint.value,
        apiKey: apiKey.value,
        model: apiModel.value
    };
    
    if (!settings.apiKey) {
        showToast('Please configure your API key in settings', 'error');
        toggleSettings.click();
        return;
    }
    
    // Show loading state
    loadingSpinner.classList.add('active');
    translateButton.disabled = true;
    translatedText.innerHTML = '';
    
    try {
        const sourceLang = sourceLanguage.value === 'auto' ? 'auto-detect' : languageNames[sourceLanguage.value];
        const targetLang = languageNames[targetLanguage.value];
        
        // Get selected formality level
        const selectedFormality = document.querySelector('input[name="formality"]:checked').value;
        let formalityInstruction = '';
        
        switch(selectedFormality) {
            case 'formal':
                formalityInstruction = 'Use formal, professional language with proper grammar and sophisticated vocabulary. ';
                break;
            case 'informal':
                formalityInstruction = 'Use casual, conversational language as if speaking to a friend. Include colloquialisms where appropriate. ';
                break;
            default:
                formalityInstruction = '';
        }
        
        // Get custom instructions if any
        const customInstruction = customTonePrompt.value.trim();
        const customInstructionText = customInstruction ? customInstruction + ' ' : '';
        
        // Combine all instructions
        const toneInstructions = formalityInstruction + customInstructionText;
        
        const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}.
        ${toneInstructions}Provide only the translation without any explanations or additional text.
        Maintain the original formatting as much as possible.`;
        
        // Build the request body for our serverless function
        const requestBody = {
            endpoint: settings.endpoint,
            apiKey: settings.apiKey,
            model: settings.model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        };
        
        // Call our serverless function instead of the AI API directly
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        // Check if response was successful
        if (!response.ok) {
            throw new Error(data.error || data.message || `API error: ${response.status}`);
        }
        
        // Check for valid response structure
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid response structure:', data);
            throw new Error('Unexpected API response format. Please check your API configuration.');
        }
        
        const translation = data.choices[0].message.content.trim();
        
        // Display translation
        translatedText.textContent = translation;
        
    } catch (error) {
        console.error('Translation error:', error);
        showToast(`Translation error: ${error.message}`, 'error');
        translatedText.innerHTML = '<span class="placeholder">Translation failed. Please check your API settings.</span>';
    } finally {
        loadingSpinner.classList.remove('active');
        translateButton.disabled = false;
    }
}

// Event Listeners
sourceText.addEventListener('input', updateCharCount);
sourceText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        translateText();
    }
});

translateButton.addEventListener('click', translateText);
swapButton.addEventListener('click', swapLanguages);
clearButton.addEventListener('click', clearSourceText);
copyButton.addEventListener('click', copyTranslation);

toggleSettings.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
});

saveSettings.addEventListener('click', saveSettingsToStorage);

// Prevent same language selection
sourceLanguage.addEventListener('change', () => {
    if (sourceLanguage.value === targetLanguage.value && sourceLanguage.value !== 'auto') {
        targetLanguage.value = targetLanguage.options[targetLanguage.selectedIndex + 1]?.value || 'en';
    }
});

targetLanguage.addEventListener('change', () => {
    if (sourceLanguage.value === targetLanguage.value && sourceLanguage.value !== 'auto') {
        sourceLanguage.value = 'auto';
    }
});

// Auto-translate on paste
sourceText.addEventListener('paste', () => {
    setTimeout(() => {
        if (sourceText.value.trim() && apiKey.value) {
            translateText();
        }
    }, 100);
});

// Initialize
loadSettings();
updateCharCount();

// Check for API key on load
window.addEventListener('load', () => {
    if (!apiKey.value) {
        setTimeout(() => {
            showToast('Please configure your API settings to start translating', 'info');
        }, 1000);
    }
    
    // Load saved formality preference
    const savedFormality = localStorage.getItem('quickTranslateFormality');
    if (savedFormality) {
        const formalityRadio = document.querySelector(`input[name="formality"][value="${savedFormality}"]`);
        if (formalityRadio) {
            formalityRadio.checked = true;
        }
    }
    
    // Load saved custom prompt
    const savedCustomPrompt = localStorage.getItem('quickTranslateCustomPrompt');
    if (savedCustomPrompt) {
        customTonePrompt.value = savedCustomPrompt;
    }
});

// Save formality preference when changed
formalityRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        localStorage.setItem('quickTranslateFormality', e.target.value);
    });
});

// Save custom prompt when changed
customTonePrompt.addEventListener('input', () => {
    clearTimeout(customTonePrompt.saveTimeout);
    customTonePrompt.saveTimeout = setTimeout(() => {
        localStorage.setItem('quickTranslateCustomPrompt', customTonePrompt.value);
    }, 1000);
});

// Auto-save draft
let draftTimeout;
sourceText.addEventListener('input', () => {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(() => {
        localStorage.setItem('quickTranslateDraft', sourceText.value);
    }, 1000);
});

// Load draft on startup
window.addEventListener('load', () => {
    const draft = localStorage.getItem('quickTranslateDraft');
    if (draft) {
        sourceText.value = draft;
        updateCharCount();
    }
});

// Clear draft when translation is successful
function clearDraft() {
    localStorage.removeItem('quickTranslateDraft');
}

// Add this to the translate success callback
translatedText.addEventListener('DOMSubtreeModified', function() {
    if (this.textContent && this.textContent !== 'Translation will appear here...' && this.textContent !== 'Translation failed. Please check your API settings.') {
        clearDraft();
    }
});