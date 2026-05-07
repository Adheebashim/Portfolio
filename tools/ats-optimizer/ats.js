document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const providerSelect = document.getElementById('ai-provider');
    const modelSelect = document.getElementById('ai-model');
    const apiKeyInput = document.getElementById('api-key');
    const genTypeSelect = document.getElementById('gen-type');
    const jdInput = document.getElementById('job-description');
    const resumeInput = document.getElementById('current-resume');
    const resumeUpload = document.getElementById('resume-upload');
    const generateBtn = document.getElementById('generate-btn');
    
    // Output Elements
    const outputContainer = document.getElementById('output-container');
    const resumeOutput = document.getElementById('resume-output');
    const loader = document.getElementById('btn-loader');
    const errorMsg = document.getElementById('error-msg');
    
    // API Status Elements
    const testApiBtn = document.getElementById('test-api-btn');
    const apiStatus = document.getElementById('api-status');
    
    // Action Buttons
    const copyBtn = document.getElementById('copy-btn');
    const btnPdf = document.getElementById('download-pdf-btn');
    const btnWord = document.getElementById('download-word-btn');
    
    // Help Modal
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => helpModal.showModal());
    }
    if (closeModalBtn && helpModal) {
        closeModalBtn.addEventListener('click', () => helpModal.close());
    }


    let rawMarkdownOutput = "";

    // --- Key Management --- //
    const savedKeys = JSON.parse(localStorage.getItem('atsApiKeys')) || {};
    
    function updateKeyInput() {
        const provider = providerSelect.value;
        apiKeyInput.value = savedKeys[provider] || '';
    }

    const modelsMap = {
        gemini: [
            { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast)' },
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Advanced)' },
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
        ],
        groq: [
            { id: 'llama3-8b-8192', name: 'Llama 3 (8B)' },
            { id: 'llama3-70b-8192', name: 'Llama 3 (70B)' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral (8x7B)' }
        ],
        cohere: [
            { id: 'command-r', name: 'Command-R (Recommended)' },
            { id: 'command-r-plus', name: 'Command-R+' },
            { id: 'command-light', name: 'Command Light' }
        ]
    };

    function updateModelsDropdown() {
        const provider = providerSelect.value;
        const models = modelsMap[provider] || [];
        modelSelect.innerHTML = '';
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            modelSelect.appendChild(opt);
        });
    }

    const apiLinksMap = {
        gemini: { url: 'https://aistudio.google.com/app/apikey', text: 'Get a free Google Gemini API Key' },
        groq: { url: 'https://console.groq.com/keys', text: 'Get a free Groq API Key' },
        cohere: { url: 'https://dashboard.cohere.com/api-keys', text: 'Get a free Cohere API Key' }
    };

    function updateApiHelpLink() {
        const provider = providerSelect.value;
        const linkElem = document.getElementById('api-help-anchor');
        if (linkElem && apiLinksMap[provider]) {
            linkElem.href = apiLinksMap[provider].url;
            linkElem.innerHTML = `${apiLinksMap[provider].text} <i class='bx bx-link-external'></i>`;
        }
    }

    providerSelect.addEventListener('change', () => {
        updateModelsDropdown();
        updateKeyInput();
        updateApiHelpLink();
    });
    
    updateModelsDropdown();
    updateKeyInput(); 
    updateApiHelpLink();

    apiKeyInput.addEventListener('input', (e) => {
        const provider = providerSelect.value;
        savedKeys[provider] = e.target.value.trim();
        localStorage.setItem('atsApiKeys', JSON.stringify(savedKeys));
        apiStatus.textContent = ''; // Clear status on input
    });

    // --- API Test Connection --- //
    testApiBtn.addEventListener('click', async () => {
        const provider = providerSelect.value;
        const selectedModel = modelSelect.value;
        const apiKey = apiKeyInput.value.trim();
        
        apiStatus.textContent = '';
        apiStatus.style.color = '';

        if (!apiKey) {
            apiStatus.textContent = 'Please enter an API key first.';
            apiStatus.style.color = '#ef4444'; // Red
            return;
        }

        testApiBtn.disabled = true;
        const originalText = testApiBtn.innerHTML;
        testApiBtn.innerHTML = "<i class='bx bx-loader-alt loader' style='display:inline-block;'></i>";

        try {
            let isValid = false;
            if (provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
                });
                if (response.ok) isValid = true;
                else console.error("Gemini Test Error:", await response.text());
            } else if (provider === 'groq') {
                const url = `https://api.groq.com/openai/v1/chat/completions`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: selectedModel, messages: [{ role: "user", content: "hi" }], max_tokens: 1 })
                });
                if (response.ok) isValid = true;
                else console.error("Groq Test Error:", await response.text());
            } else if (provider === 'cohere') {
                const url = `https://api.cohere.com/v1/chat`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: selectedModel, message: "hi", max_tokens: 1 })
                });
                if (response.ok) isValid = true;
                else console.error("Cohere Test Error:", await response.text());
            }
            
            if (isValid) {
                apiStatus.textContent = 'Connection Successful! ✓';
                apiStatus.style.color = '#4ade80'; // Green
            } else {
                throw new Error("Invalid API key or network error");
            }
        } catch (err) {
            console.error(err);
            apiStatus.textContent = 'Connection Failed. Check your API Key. ✗';
            apiStatus.style.color = '#ef4444'; // Red
        } finally {
            testApiBtn.disabled = false;
            testApiBtn.innerHTML = originalText;
        }
    });

    // --- File Extractors --- //
    
    const dropZone = document.getElementById('drop-zone');
    
    // Set PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    async function handleFileProcess(file) {
        if (!file) return;
        resumeInput.value = "Extracting text, please wait...";

        try {
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    
                    // Extract underlying PDF hyperlinks that are typically dropped
                    const annotations = await page.getAnnotations();
                    const urls = annotations.filter(a => a.subtype === 'Link' && a.url).map(a => a.url);
                    
                    fullText += pageText + "\n";
                    if (urls.length > 0) fullText += " " + urls.join(' ') + " \n\n";
                }
                resumeInput.value = fullText.trim() || "Failed to extract text. Please paste manually.";
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                
                // Extract underlying DOCX hyperlinks first
                const htmlResult = await mammoth.convertToHtml({arrayBuffer: arrayBuffer});
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlResult.value;
                const links = Array.from(tempDiv.querySelectorAll('a')).map(a => a.href).filter(href => href);
                
                // Then extract clean text
                const result = await mammoth.extractRawText({arrayBuffer: arrayBuffer});
                let fullText = result.value.trim();
                if (links.length > 0) fullText += "\n\nExtracted Contact Links: " + links.join(' ');
                
                resumeInput.value = fullText || "Failed to extract text. Please paste manually.";
            } else {
                resumeInput.value = "Unsupported file format. Please upload PDF or DOCX.";
            }
        } catch (err) {
            console.error(err);
            resumeInput.value = "Error extracting file text. Please try pasting the text manually.";
        }
    }

    if (dropZone) {
        dropZone.addEventListener('click', () => resumeUpload.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFileProcess(e.dataTransfer.files[0]);
        });
    }

    resumeUpload.addEventListener('change', (e) => handleFileProcess(e.target.files[0]));


    // --- Prompt Engineering (Gold Standard ATS) --- //
    const buildResumePrompt = (jd, resume, context = '') => `
You are an expert ATS optimizer and technical recruiter. Optimize this resume specifically for the provided Job Description to guarantee 100% ATS selection and human recruiter impact.

CRITICAL INSTRUCTIONS:
1. KEYWORD MIRRORING & ACRONYMS: Scrutinize the Job Description. Use the EXACT terminology. Whenever an acronym is relevant, you MUST use the "Full Name (Acronym)" format (e.g., "Search Engine Optimization (SEO)").
2. GOOGLE XYZ FORMULA & ACTION VERBS: Every single experience bullet point MUST start with a powerful Action Verb (e.g., Engineered, Orchestrated, Developed) and follow the Google XYZ structure: "Accomplished [X] as measured by [Y], by doing [Z]".
   - DO NOT include literal labels like "(X)", "(Y)", or "(Z)" in the text. 
   - Example: "Engineered a new lead-gen workflow generating $20k revenue, exceeding quarterly targets by 15%."
3. ONE-PAGE ATS RULE & SECTIONING:
   - Summary: Must strictly follow this specific formula: [Years of Experience] + [Core Specialization] + [1-2 Quantified Achievements] + [TARGET JOB TITLE from JD].
   - Skills: Extensively group and categorize keywords found in the JD into bullet points (e.g., "Languages: Python, SQL").
   - Experience: Max 3-4 high-impact, XYZ-formatted bullet points per role.
   - Dates: Strictly enforce mathematical chronological formats: Month YYYY – Month YYYY (e.g., "July 2024 – Present").
4. Output exclusively as a raw JSON object string. No markdown code blocks. No creative tables.

JSON STRUCTURE TO EXACTLY FOLLOW:
{
  "name": "[Candidate Name]",
  "targetJobTitle": "[The Exact Job Title from JD]",
  "contact": "[City, Country | Phone | Email | LinkedIn URL | Portfolio URL]",
  "summary": "[Strictly formulated paragraph]",
  "competencies": [
    "[Category 1]: [Skill 1], [Skill 2]",
    "[Category 2]: [Skill 3], [Skill 4]"
  ],
  "experience": [
    {
      "title": "[Exact Job Title]",
      "company": "[Company]",
      "dates": "[Dates]",
      "bullets": ["[XYZ Bullet 1]", "[XYZ Bullet 2]"]
    }
  ],
  "education": [
    {
      "degree": "[Degree]",
      "institution": "[University]",
      "dates": "[Dates]"
    }
  ]
}

JOB DESCRIPTION:
${jd}

CURRENT RESUME:
${resume}

${context ? `USER DIRECTIVES / ADDITIONAL CONTEXT:\n${context}\n` : ''}
`;

    const buildCoverLetterPrompt = (jd, resume, context = '') => {
        const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return `
You are an expert career consultant. Write a modern, highly compelling Cover Letter for the provided Job Description based strictly on the candidate's Resume.

CRITICAL INSTRUCTIONS (2025/2026 STANDARDS):
1. Abandon the generic "To Whom It May Concern". Act as a modern Hiring Manager.
2. The letter MUST be a maximum of 3 short paragraphs (under 250 words total).
3. The first paragraph MUST immediately establish value by addressing the core pain point in the Job Description. No fluff.
4. Highlight exactly 2 specific data metrics or achievements from the resume tied directly to that core pain point.
5. Do NOT regurgitate the entire resume or list soft skills without evidence.
6. You MUST output the ENTIRE cover letter exclusively as a raw JSON object string without any markdown wrappers.

JSON STRUCTURE TO EXACTLY FOLLOW:
{
  "name": "[Candidate Name]",
  "contact": "[Phone | Email | LinkedIn]",
  "date": "${currentDate}",
  "recipient": "[Hiring Manager or 'Hiring Team'], [Company Name]",
  "paragraphs": [
    "[Value-first opening paragraph addressing the specific role immediately]",
    "[Body paragraph highlighting 2 specific relevant mapped achievements]",
    "[Closing paragraph with a confident call to action]"
  ]
}

JOB DESCRIPTION:
${jd}

CURRENT RESUME:
${resume}

${context ? `USER DIRECTIVES / ADDITIONAL CONTEXT:\n${context}\n` : ''}
`;
    };

    const buildColdEmailPrompt = (jd, resume, context = '') => `
You are an expert executive recruiter. Write a highly targeted, direct Cold Email to the hiring manager for the provided Job Description based strictly on the candidate's Resume.

CRITICAL INSTRUCTIONS (2025/2026 "LOW-FRICTION" RULES):
1. Word Count: Hard limit of 125 words max. Be ruthless with editing.
2. Subject Line (The Gatekeeper): Must be 4-7 words, human-sounding, and curious (e.g., "Quick question regarding [Company] engineering"). Do not use clickbait.
3. The Hook & Value Prop: Do NOT say "I am writing to apply". Instantly inject one single, powerful, and hyper-relevant achievement/metric from the resume that solves the core need in the Job Description.
4. The Ask (Low-Friction): End with a pressure-free, soft call-to-action (e.g., "Would you be open to a brief 10-minute chat next week to share your perspective?"). Never ask for a job directly.
5. No Marketing: Eliminate buzzwords, exclamation points, and fluff.
6. You MUST output exclusively as a raw JSON object string without any markdown wrappers.

JSON STRUCTURE TO EXACTLY FOLLOW:
{
  "subject_line": "[4-7 Word Subject Line]",
  "salutation": "Hi [Hiring Manager Name / Team],",
  "paragraphs": [
    "[The 2-sentence hook and single power-metric value prop]",
    "[The 1-sentence low-friction call to action]"
  ],
  "sign_off": "Best,<br><br>[Candidate Name]<br>[Link to Profile]"
}

JOB DESCRIPTION:
${jd}

CURRENT RESUME:
${resume}

${context ? `USER DIRECTIVES / ADDITIONAL CONTEXT:\n${context}\n` : ''}
`;

    // --- API Calls --- //
    async function callGemini(apiKey, promptText, model) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        if (!response.ok) throw new Error("Gemini API Error: Check your API Key.");
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async function callGroq(apiKey, promptText, model) {
        const url = `https://api.groq.com/openai/v1/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: model, messages: [{ role: "user", content: promptText }], temperature: 0.7 })
        });
        if (!response.ok) throw new Error("Groq API Error: Check your API Key.");
        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function callCohere(apiKey, promptText, model) {
        const url = `https://api.cohere.com/v1/chat`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: model, message: promptText, temperature: 0.7 })
        });
        if (!response.ok) throw new Error("Cohere API Error: Check your API Key.");
        const data = await response.json();
        return data.text;
    }

    // --- Generation Trigger --- //
    generateBtn.addEventListener('click', async () => {
        const provider = providerSelect.value;
        const selectedModel = modelSelect.value;
        const apiKey = apiKeyInput.value.trim();
        const genType = genTypeSelect.value;
        const jd = jdInput.value.trim();
        const resume = resumeInput.value.trim();
        const contextElem = document.getElementById('additional-context');
        const context = contextElem ? contextElem.value.trim() : '';

        errorMsg.textContent = '';
        
        if (!apiKey) return errorMsg.textContent = "Please enter an API Key.";
        if (!jd || !resume) return errorMsg.textContent = "Please provide both a Job Description and a Base Resume.";

        const promptText = genType === 'cover-letter' ? buildCoverLetterPrompt(jd, resume, context) : genType === 'cold-email' ? buildColdEmailPrompt(jd, resume, context) : buildResumePrompt(jd, resume, context);

        generateBtn.disabled = true;
        loader.style.display = 'inline-block';
        outputContainer.style.display = 'none';
        
        try {
            if (provider === 'gemini') rawMarkdownOutput = await callGemini(apiKey, promptText, selectedModel);
            else if (provider === 'groq') rawMarkdownOutput = await callGroq(apiKey, promptText, selectedModel);
            else if (provider === 'cohere') rawMarkdownOutput = await callCohere(apiKey, promptText, selectedModel);
            
            // Clean any potential JSON wrappers the LLM might have ignored instructions and added anyway
            rawMarkdownOutput = rawMarkdownOutput.replace(/^```json\n/gmi, '').replace(/^```\n?/gm, '').trim();
            
            // Safety: Strip literal (X), (Y), (Z) markers if the AI hallucinated them into the text
            rawMarkdownOutput = rawMarkdownOutput.replace(/\s?\([XYZ]\)/g, '');
            
            // Render the JSON visibly in HTML
            try {
                const data = JSON.parse(rawMarkdownOutput);
                let html = "";
                
                if (genType === 'cold-email') {
                    html += `<p><strong>Subject:</strong> ${data.subject_line}</p><hr style="border: 1px solid var(--border); margin: 15px 0;"><br>`;
                    html += `<p style="margin-bottom: 20px;">${data.salutation}</p>`;
                    data.paragraphs.forEach(p => html += `<p style="margin-bottom: 15px;">${p}</p>`);
                    html += `<p style="margin-top: 20px;">${data.sign_off}</p>`;
                } else if (genType === 'cover-letter') {
                    html += `<h1 style="margin: 0; text-align: center;">${data.name}</h1>`;
                    
                    // Render HTML clickable contact links
                    const contactHTML = data.contact.split('|').map(p => p.trim()).map(part => {
                        if (part.includes('@')) return `<a href="mailto:${part}" style="color: #0066cc; text-decoration: none;">Email</a>`;
                        if (part.includes('.') && !part.includes(' ')) {
                            let url = part.startsWith('http') ? part : 'https://' + part;
                            let display = "Portfolio";
                            if (part.toLowerCase().includes("linkedin.com")) display = "LinkedIn";
                            else if (part.toLowerCase().includes("github.com")) display = "GitHub";
                            return `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: none;">${display}</a>`;
                        }
                        return part;
                    }).join(' | ');

                    html += `<p style="text-align: center; margin-top: 5px;">${contactHTML}</p>`;
                    html += `<p style="margin-top: 30px;">${data.date}</p>`;
                    html += `<p><strong>${data.recipient}</strong></p><br>`;
                    data.paragraphs.forEach(p => html += `<p style="margin-bottom: 10px;">${p}</p>`);
                } else {
                    html += `<h1 style="margin: 0; text-align: center;">${data.name}</h1>`;
                    
                    const contactHTML = data.contact.split('|').map(p => p.trim()).map(part => {
                        if (part.includes('@')) return `<a href="mailto:${part}" style="color: #0066cc; text-decoration: none;">Email</a>`;
                        if (part.includes('.') && !part.includes(' ')) {
                            let url = part.startsWith('http') ? part : 'https://' + part;
                            let display = "Portfolio";
                            if (part.toLowerCase().includes("linkedin.com")) display = "LinkedIn";
                            else if (part.toLowerCase().includes("github.com")) display = "GitHub";
                            return `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: none;">${display}</a>`;
                        }
                        return part;
                    }).join(' | ');

                    html += `<p style="text-align: center; margin-top: 5px;">${contactHTML}</p>`;
                    html += `<h2 style="border-bottom: 2px solid #000; margin-top: 20px; text-transform: uppercase;">Summary</h2><p>${data.summary}</p>`;
                    html += `<h2 style="border-bottom: 2px solid #000; margin-top: 20px; text-transform: uppercase;">Skills</h2><ul style="list-style-type: disc; margin-left: 20px; padding-left: 20px; margin-top: 8px; margin-bottom: 15px;">`;
                    data.competencies.forEach(c => {
                        let parts = c.split(':');
                        let liText = parts.length > 1 ? `<strong>${parts[0]}:</strong>${parts.slice(1).join(':')}` : c;
                        html += `<li style="margin-bottom: 6px;">${liText}</li>`;
                    });
                    html += `</ul><h2 style="border-bottom: 2px solid #000; margin-top: 20px; text-transform: uppercase;">Work Experience</h2>`;
                    data.experience.forEach(exp => {
                        html += `<div style="margin-bottom: 15px;">`;
                        html += `<div style="display: flex; justify-content: space-between;"><strong>${exp.title}</strong><span>${exp.dates}</span></div>`;
                        html += `<div style="font-style: italic;">${exp.company}</div><ul style="list-style-type: disc; margin-left: 20px; padding-left: 20px; margin-top: 8px; margin-bottom: 15px;">`;
                        exp.bullets.forEach(b => html += `<li style="margin-bottom: 6px;">${b}</li>`);
                        html += `</ul></div>`;
                    });
                    html += `<h2 style="border-bottom: 2px solid #000; margin-top: 20px; text-transform: uppercase;">Education</h2>`;
                    data.education.forEach(edu => {
                        html += `<div style="display: flex; justify-content: space-between;"><strong>${edu.degree}</strong><span>${edu.dates}</span></div>`;
                        html += `<div>${edu.institution}</div><br>`;
                    });
                }
                resumeOutput.innerHTML = html;
            } catch (jsonErr) {
                resumeOutput.innerHTML = `<p style="color: red;">Error parsing AI JSON output. Displaying raw data:</p><pre>${rawMarkdownOutput}</pre>`;
            }
            
            outputContainer.style.display = 'block';
            outputContainer.style.opacity = '0';
            outputContainer.style.transform = 'translateY(20px)';
            outputContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            setTimeout(() => {
                outputContainer.style.opacity = '1';
                outputContainer.style.transform = 'translateY(0)';
                outputContainer.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        } catch (err) {
            console.error(err);
            errorMsg.textContent = err.message || "An error occurred while generating the content.";
        } finally {
            generateBtn.disabled = false;
            loader.style.display = 'none';
        }
    });

    // --- Export Logic --- //

    // Copy Text
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(rawMarkdownOutput);
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = "<i class='bx bx-check'></i> <span class='btn-text'>Copied!</span>";
            copyBtn.style.color = "#4ade80"; copyBtn.style.borderColor = "#4ade80";
            setTimeout(() => { copyBtn.innerHTML = originalHtml; copyBtn.style.color = ""; copyBtn.style.borderColor = ""; }, 2000);
        } catch (err) { alert("Failed to copy text. Please select manually."); }
    });

    // Download PDF (PDFMake Vector Compilation)
    btnPdf.addEventListener('click', () => {
        try {
            const data = JSON.parse(rawMarkdownOutput);
            let docDefinition = {};

            if (genTypeSelect.value === 'cover-letter') {
                const contactArray = [];
                data.contact.split('|').map(p => p.trim()).forEach((part, index, arr) => {
                    if (part.includes('@')) {
                        contactArray.push({ text: 'Email', link: 'mailto:' + part, color: '#0066cc', decoration: 'underline' });
                    } else if (part.includes('.') && !part.includes(' ')) {
                        let url = part.startsWith('http') ? part : 'https://' + part;
                        let display = "Portfolio";
                        if (part.toLowerCase().includes("linkedin.com")) display = "LinkedIn";
                        else if (part.toLowerCase().includes("github.com")) display = "GitHub";
                        contactArray.push({ text: display, link: url, color: '#0066cc', decoration: 'underline' });
                    } else {
                        contactArray.push({ text: part });
                    }
                    if (index < arr.length - 1) contactArray.push({ text: ' | ' });
                });

                docDefinition = {
                    content: [
                        { text: data.name, style: 'header' },
                        { text: contactArray, style: 'contact' },
                        { text: data.date, margin: [0, 20, 0, 10] },
                        { text: data.recipient, bold: true, margin: [0, 0, 0, 20] },
                        ...data.paragraphs.map(p => ({ text: p, margin: [0, 0, 0, 10], lineHeight: 1.2 }))
                    ],
                    styles: {
                        header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
                        contact: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] }
                    },
                    defaultStyle: { fontSize: 10, color: '#000000' }
                };
            } else {
                const experienceBlocks = data.experience.map(exp => ({
                    stack: [
                        {
                            columns: [
                                { text: exp.title, bold: true },
                                { text: exp.dates, alignment: 'right' }
                            ]
                        },
                        { text: exp.company, italics: true, margin: [0, 2, 0, 5] },
                        { ul: exp.bullets, margin: [0, 0, 0, 10] }
                    ],
                    unbreakable: true // CRITICAL: Stop random page breaks in the middle of a job!
                }));

                const educationBlocks = data.education.map(edu => ({
                    stack: [
                        {
                            columns: [
                                { text: edu.degree, bold: true },
                                { text: edu.dates, alignment: 'right' }
                            ]
                        },
                        { text: edu.institution, margin: [0, 2, 0, 10] }
                    ],
                    unbreakable: true
                }));

                // Render exact PDFMake clickable Contact Layout
                const contactArray = [];
                data.contact.split('|').map(p => p.trim()).forEach((part, index, arr) => {
                    if (part.includes('@')) {
                        contactArray.push({ text: 'Email', link: 'mailto:' + part, color: '#0066cc', decoration: 'underline' });
                    } else if (part.includes('.') && !part.includes(' ')) {
                        let url = part.startsWith('http') ? part : 'https://' + part;
                        let display = "Portfolio";
                        if (part.toLowerCase().includes("linkedin.com")) display = "LinkedIn";
                        else if (part.toLowerCase().includes("github.com")) display = "GitHub";
                        contactArray.push({ text: display, link: url, color: '#0066cc', decoration: 'underline' });
                    } else {
                        contactArray.push({ text: part });
                    }
                    if (index < arr.length - 1) contactArray.push({ text: ' | ' });
                });

                docDefinition = {
                    content: [
                        { text: data.name.toUpperCase(), style: 'header' },
                        { text: contactArray, style: 'contact' },
                        
                        { text: 'SUMMARY', style: 'sectionHeader' },
                        { text: data.summary, margin: [0, 0, 0, 10], lineHeight: 1.2 },
                        
                        { text: 'SKILLS', style: 'sectionHeader' },
                        { 
                            ul: data.competencies, 
                            margin: [0, 0, 0, 10], 
                            lineHeight: 1.2 
                        },

                        { text: 'WORK EXPERIENCE', style: 'sectionHeader' },
                        ...experienceBlocks,

                        { text: 'EDUCATION', style: 'sectionHeader' },
                        ...educationBlocks
                    ],
                    styles: {
                        header: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 0, 0, 5], color: '#111' },
                        contact: { fontSize: 9.5, alignment: 'center', margin: [0, 0, 0, 15], color: '#444' },
                        sectionHeader: { fontSize: 11, bold: true, margin: [0, 8, 0, 4], color: '#000' }
                    },
                    defaultStyle: { fontSize: 10, color: '#222', lineHeight: 1.1 },
                    pageMargins: [48, 48, 48, 48] // Slightly wider margins for better professional aesthetic
                };

                // Gold Standard ATS formatting: Simple left-aligned headers with subtle dividers
                const newContent = [];
                docDefinition.content.forEach(el => {
                    newContent.push(el);
                    if (el.style === 'sectionHeader') {
                        el.margin = [0, 12, 0, 2];
                        newContent.push({
                            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: 0.5, lineColor: '#aaa' }],
                            margin: [0, 0, 0, 8]
                        });
                    }
                });
                docDefinition.content = newContent;
            }

            let fileName = 'Optimized_Resume.pdf';
            if (genTypeSelect.value === 'cold-email') {
                fileName = 'Cold_Email.pdf';
                // Cold email: simple plain text PDF
                docDefinition = {
                    content: [
                        { text: `Subject: ${data.subject_line}`, bold: true, margin: [0, 0, 0, 15] },
                        { text: data.salutation, margin: [0, 0, 0, 10] },
                        ...data.paragraphs.map(p => ({ text: p, margin: [0, 0, 0, 10], lineHeight: 1.4 })),
                        { text: data.sign_off.replace(/<br>/gi, '\n'), margin: [0, 15, 0, 0] }
                    ],
                    defaultStyle: { fontSize: 11, color: '#222', lineHeight: 1.3 },
                    pageMargins: [60, 60, 60, 60]
                };
            } else if (genTypeSelect.value === 'cover-letter') {
                fileName = 'Cover_Letter.pdf';
            } else if (data.name) {
                const namePart = data.name.trim().replace(/\s+/g, '_');
                const titlePart = data.targetJobTitle ? data.targetJobTitle.trim().replace(/\s+/g, '_') : 'Resume';
                fileName = `${namePart}_${titlePart}.pdf`;
            }

            pdfMake.createPdf(docDefinition).download(fileName);
            
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Error generating PDF: " + (err.message || "Unknown PDF compiler error"));
        }
    });

    // Download JSON Source Code
    btnWord.addEventListener('click', () => {
        const blob = new Blob([rawMarkdownOutput], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        
        let filename = 'Optimized_Resume.json';
        try {
            const data = JSON.parse(rawMarkdownOutput);
            if (genTypeSelect.value === 'cold-email') {
                filename = 'Cold_Email.json';
            } else if (genTypeSelect.value === 'cover-letter') {
                filename = 'Cover_Letter.json';
            } else if (data.name) {
                const namePart = data.name.trim().replace(/\s+/g, '_');
                const titlePart = data.targetJobTitle ? data.targetJobTitle.trim().replace(/\s+/g, '_') : 'Resume';
                filename = `${namePart}_${titlePart}.json`;
            }
        } catch(e) {}
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
});
