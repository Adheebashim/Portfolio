document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    initParticleBackground();
    initNavbarScroll();
    initHamburgerMenu();
    initScrollAnimations();
    initStatsCounter();
    initCardGlowEffect();
    initContactModal();
    initChatbot();
});

// --- Animated Particle Grid Background ---
function initParticleBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };
    // Reduce particle count significantly on mobile to drastically improve initial load time
    const particleCount = window.innerWidth < 768 ? 30 : 60;
    const connectionDistance = 150;
    const mouseRadius = 250;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.2; // Slower
            this.vy = (Math.random() - 0.5) * 0.2; // Slower
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
            // Randomly assign one of the new accent colors
            const colors = ['0, 209, 255', '122, 92, 255', '0, 255, 163'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse repulsion
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius;
                    this.x += dx * force * 0.01; // Calmer interaction
                    this.y += dy * force * 0.01; // Calmer interaction
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    // Use a blend of primary and secondary for connections
                    ctx.strokeStyle = `rgba(0, 209, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    init();
    animate();
}

// --- Navbar Scroll State ---
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --- Mobile Hamburger Menu ---
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// --- GSAP Scroll Animations ---
function initScrollAnimations() {
    // Hero Entrance
    gsap.to(".hero .fade-up", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
    });

    // Sub-elements fade up triggered by scroll
    const sections = document.querySelectorAll('.section:not(.hero)');
    
    sections.forEach(section => {
        const elements = section.querySelectorAll('.fade-up');
        
        if (elements.length > 0) {
            gsap.to(elements, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%", // Triggers when top of section hits 85% of viewport
                    toggleActions: "play none none none"
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power2.out"
            });
        }
    });

    // Tech Marquee fade in
    const marquee = document.querySelector('.tech-marquee');
    if (marquee) {
        gsap.from(marquee, {
            scrollTrigger: {
                trigger: marquee,
                start: "top 95%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    }

    // Parallax on background shapes
    gsap.to(".bg-shape-1", {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        },
        y: -200,
        ease: "none"
    });

    gsap.to(".bg-shape-2", {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        },
        y: 200,
        ease: "none"
    });


}

// --- Stats Counter Animation ---
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        if (isNaN(target)) return;

        const suffix = stat.textContent.includes('+') ? '+' : '';

        ScrollTrigger.create({
            trigger: stat,
            start: "top 90%",
            once: true,
            onEnter: () => {
                gsap.to(stat, {
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: function() {
                        const current = Math.round(this.progress() * target);
                        stat.textContent = current + suffix;
                    }
                });
            }
        });
    });
}

// --- Interactive Card Glow Effect & 3D Tilt ---
function initCardGlowEffect() {
    const cards = document.querySelectorAll('.service-card, .project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Subtle tilt effect
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                y: -4,
                duration: 0.1,
                ease: "none",
                transformPerspective: 1000
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // Lite 3D Profile Showcase Tilt on Hover
    const showcase = document.getElementById('profile-showcase');
    if (showcase) {
        showcase.addEventListener('mousemove', (e) => {
            const rect = showcase.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Very lite tilt
            const rotateX = (y - centerY) / 40;
            const rotateY = (centerX - x) / 40;

            gsap.to(showcase, {
                rotationY: rotateY,
                rotationX: rotateX,
                duration: 0.4,
                ease: "power2.out",
                transformPerspective: 1000
            });
        });
        
        showcase.addEventListener('mouseleave', () => {
            gsap.to(showcase, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }

}

// --- Contact Modal Logic ---
function initContactModal() {
    const modal = document.getElementById('contact-modal');
    const openBtn = document.getElementById('open-contact-modal');
    const closeBtn = document.getElementById('close-modal');

    // Also support nav button if any
    const navBtn = document.querySelector('.nav-btn');

    if (!modal || !closeBtn) return;

    const openModal = (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (navBtn) navBtn.addEventListener('click', openModal);

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
        // Close if clicking outside the modal content window
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// --- AI Chatbot Assistant Logic ---
function initChatbot() {
    const fab = document.getElementById('chatbot-fab');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-chat');
    const clearBtn = document.getElementById('clear-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const messagesContainer = document.getElementById('chat-messages');
    const quickReplies = document.querySelectorAll('.quick-reply');

    if (!fab || !chatWindow) return;

    // ── Context Extraction (The "Brain" Upgrade) ─────────────────────────
    // Dynamically extract text content from the portfolio sections to give the AI real-time context
    function extractPortfolioContext() {
        let context = "";
        const sections = ['services', 'work', 'experience'];
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Remove extra whitespace and newlines for a cleaner prompt string
                context += `\n[Section: ${id.toUpperCase()}]\n` + el.innerText.replace(/\s+/g, ' ') + "\n";
            }
        });
        return context;
    }
    
    const pageContext = extractPortfolioContext();

    // ── Gemini API config ──────────────────────────────────────────────────
    const GEMINI_ENDPOINT = `https://portfolio-chat-proxy.adheebashim1010.workers.dev/`;

    // Expanded System Persona
    const SYSTEM_CONTEXT = `You are "Adheeb's AI", a highly intelligent, friendly, and persuasive virtual assistant embedded in Adheeb Ashim's personal portfolio website. 
Your primary goal is to help visitors understand Adheeb's value, explain his projects, and ultimately encourage them to hire him or contact him.

### Strict Persona Guidelines:
1. Tone: Professional yet warm, confident, and conversational. Use emojis naturally but sparingly (e.g., 🚀, 💡, 👋).
2. Formatting: You MUST use Markdown for formatting. Use **bolding** for emphasis, bullet points for lists, and \`code tags\` for technical terms. DO NOT output large walls of plain text.
3. Identity Guardrails: You are an assistant talking *about* Adheeb. You are not Adheeb. If asked to write code, build an app, or perform complex tasks not related to the portfolio, politely decline and steer the conversation back to Adheeb's skills and how *he* can build those things for the user.

### Current Portfolio Context (Extracted directly from the website):
This is the real-time data currently displayed on the website. Use this to accurately answer questions about his services, projects, and experience:
${pageContext}

### Key Facts:
- Full name: Adheeb Ashim
- Role: Data & AI Engineer / Data Operational Analyst at NielsenIQ
- Contact: adheebashim1010@gmail.com | +91 8281759103 | WhatsApp
- Location: Kerala, India (open to remote/global)
- Highlight Projects: AI ATS Resume Optimizer (uses Gemini & Groq APIs), PowerPlus Electronics, CRM Facility Management.

Keep your answers concise (1-3 paragraphs max) unless specifically asked for details. Always be helpful!`;

    // Maintain conversation history
    let conversationHistory = [];

    // Toggle chat window
    fab.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            setTimeout(() => chatInput.focus(), 300);
            fab.classList.remove('pulse-glow');
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Clear chat logic
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Keep the initial greeting message
            messagesContainer.innerHTML = `
                <div class="chat-message ai-message fade-in">
                    <div class="msg-content">
                        Hi there! 👋 I'm Adheeb's AI Assistant. You can ask me about his skills, experience, or how to get in touch!
                    </div>
                </div>
            `;
            conversationHistory = [];
        });
    }

    // Quick Replies logic
    quickReplies.forEach(chip => {
        chip.addEventListener('click', () => {
            if (sendBtn.disabled) return;
            chatInput.value = chip.textContent;
            handleSend();
        });
    });

    // Send message logic
    const handleSend = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user-message');
        chatInput.value = '';
        sendBtn.disabled = true;

        showTypingIndicator();

        try {
            const reply = await getGeminiResponse(text);
            removeTypingIndicator();
            // Use typewriter effect to append AI message using markdown parsing
            await typeWriterAppend(reply, 'ai-message');
        } catch (err) {
            removeTypingIndicator();
            console.error('Chatbot error:', err);
            
            // Surface specific API configuration errors to the UI for debugging
            if (err.message && err.message.includes('API key')) {
                appendMessage(`⚠️ **Configuration Error:** ${err.message}. Please check your Cloudflare Environment Variables.`, 'ai-message');
            } else {
                appendMessage("Sorry, I'm having a little trouble right now. Please reach out to Adheeb directly at [adheebashim1010@gmail.com](mailto:adheebashim1010@gmail.com)! 😊", 'ai-message');
            }
        } finally {
            sendBtn.disabled = false;
            chatInput.focus();
        }
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // ── Gemini API call ──────────────────────────────────────────────────────
    async function getGeminiResponse(userMessage) {

        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

        const requestBody = {
            system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
            contents: conversationHistory
        };

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Unknown API Error from Cloudflare/Google");
        }
        
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that — feel free to email Adheeb directly!";

        conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });

        return aiText;
    }

    // ── Rule-based fallback ─────────────────────────────────────────────────
    function getRuleBasedResponse(input) {
        const text = input.toLowerCase();
        if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
            return "Hello there! 👋 I'm Adheeb's AI assistant. Ask me about his **skills**, **experience**, or how to hire him!";
        } else if (text.includes('skill') || text.includes('stack') || text.includes('technolog')) {
            return "Adheeb specialises in:\n*   **Python**, **JavaScript**, **React**\n*   **SQL**, **AWS**, **Power BI**\n*   **LLMs** and Machine Learning\n\nCheck out the Services section for full details!";
        } else if (text.includes('experience') || text.includes('background') || text.includes('work')) {
            return "Adheeb is a **Data Operational Analyst** at NielsenIQ with 2+ years of experience and 10+ shipped projects.";
        } else if (text.includes('hire') || text.includes('contact') || text.includes('email') || text.includes('freelance')) {
            return "You can reach Adheeb at [adheebashim1010@gmail.com](mailto:adheebashim1010@gmail.com) or via WhatsApp — use the 'Start a Conversation' button below!";
        } else if (text.includes('project') || text.includes('portfolio')) {
            return "Adheeb has built an AI ATS Resume Optimizer, a CRM system, and an e-commerce platform. Scroll down to see the Portfolio!";
        } else if (text.includes('ats') || text.includes('resume')) {
            return "The AI ATS Optimizer uses Gemini & Groq APIs to tailor resumes and cover letters to any job description. Try it in the Portfolio section!";
        }
        return "Great question! For specifics, I'd suggest reaching out to Adheeb directly via email or WhatsApp — he's super responsive. 🚀";
    }

    // ── UI helpers ───────────────────────────────────────────────────────────
    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${className}`;
        
        // For user messages, escape HTML. AI messages come through typewriter/markdown.
        if (className === 'user-message') {
            const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            msgDiv.innerHTML = `<div class="msg-content">${safeText}</div>`;
        } else {
            // Render markdown for direct appends (like fallbacks/errors)
            const htmlContent = typeof marked !== 'undefined' ? marked.parse(text) : text.replace(/\n/g, '<br>');
            msgDiv.innerHTML = `<div class="msg-content">${htmlContent}</div>`;
        }
        
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    // Typewriter effect for AI responses
    async function typeWriterAppend(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${className}`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';
        msgDiv.appendChild(contentDiv);
        messagesContainer.appendChild(msgDiv);
        
        // Convert markdown to HTML string
        const htmlContent = typeof marked !== 'undefined' ? marked.parse(text) : text.replace(/\n/g, '<br>');
        
        // Temporary hidden div to parse HTML nodes
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Function to recursively type out text nodes
        async function typeNode(node, parent) {
            if (node.nodeType === Node.TEXT_NODE) {
                const textStr = node.textContent;
                for (let i = 0; i < textStr.length; i++) {
                    parent.appendChild(document.createTextNode(textStr[i]));
                    scrollToBottom();
                    // Fast typing speed
                    await new Promise(r => setTimeout(r, 8));
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const newEl = document.createElement(node.tagName);
                // Copy attributes
                for (let attr of node.attributes) {
                    newEl.setAttribute(attr.name, attr.value);
                }
                parent.appendChild(newEl);
                for (let child of node.childNodes) {
                    await typeNode(child, newEl);
                }
            }
        }

        // Start typing
        for (let child of tempDiv.childNodes) {
            await typeNode(child, contentDiv);
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

