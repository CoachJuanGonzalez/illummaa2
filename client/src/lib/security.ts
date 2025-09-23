export const SecurityModule = {
    // Input sanitization
    sanitizeInput(input: any): string {
        if (!input || typeof input !== 'string') return '';
        
        // Remove HTML tags and scripts
        let cleaned = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
        cleaned = cleaned.replace(/<[^>]+>/g, '');
        
        // Escape special characters
        const escapeMap: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        cleaned = cleaned.replace(/[&<>"'`=\/]/g, s => escapeMap[s]);
        
        // Trim and limit length
        return cleaned.trim().substring(0, 2000);
    },
    
    // Email validation
    validateEmail(email: string): boolean {
        if (!email) return false;
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email) && email.length <= 254;
    },
    
    // Phone validation (North American)
    validatePhone(phone: string): boolean {
        if (!phone) return false;
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 10 || cleaned.length === 11;
    },
    
    // Name validation
    validateName(name: string): boolean {
        if (!name) return false;
        const pattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        return pattern.test(name);
    },
    
    // Generate session token
    generateToken(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return timestamp.toString(36) + random;
    },
    
    // Check for SQL injection patterns
    checkSQLInjection(value: string): boolean {
        const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|EVAL)\b|--|\/\*|\*\/|xp_|sp_|<script|javascript:|onerror=|onload=)/i;
        return !sqlPatterns.test(value);
    },
    
    // Session management
    sessionManager: {
        timeout: null as NodeJS.Timeout | null,
        duration: 30 * 60 * 1000, // 30 minutes
        
        start() {
            this.reset();
            document.addEventListener('mousedown', () => this.reset());
            document.addEventListener('keypress', () => this.reset());
            document.addEventListener('touchstart', () => this.reset());
        },
        
        reset() {
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                alert('Your session has expired for security. Please refresh the page.');
                window.location.reload();
            }, this.duration);
        },
        
        clear() {
            if (this.timeout) clearTimeout(this.timeout);
        }
    }
};

// Initialize session management when module is imported
if (typeof window !== 'undefined') {
    SecurityModule.sessionManager.start();
}

// Generate session token for forms
export const generateSessionToken = () => SecurityModule.generateToken();