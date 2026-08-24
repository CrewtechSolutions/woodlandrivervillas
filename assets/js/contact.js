'use strict';

(function () {

    // -------------------------------------------------------------------------
    // FormSubmit.co AJAX endpoint
    // -------------------------------------------------------------------------
    const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/woodlandrivervilla@gmail.com';

    // -------------------------------------------------------------------------
    // DOM refs
    // -------------------------------------------------------------------------
    const form = document.querySelector('.contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitBtnText');
    const formMessage = document.getElementById('formMessage');

    // -------------------------------------------------------------------------
    // Validators
    // -------------------------------------------------------------------------
    const validators = {

        firstName(value) {
            if (!value) return 'Please enter your first name.';
            if (value.length < 2) return 'First name must be at least 2 characters.';
            if (value.length > 50) return 'First name must be under 50 characters.';
            if (!/^[a-zA-Z\s'\-\.]+$/.test(value)) return 'First name contains invalid characters.';
            return null;
        },

        lastName(value) {
            if (!value) return 'Please enter your last name.';
            if (value.length < 2) return 'Last name must be at least 2 characters.';
            if (value.length > 50) return 'Last name must be under 50 characters.';
            if (!/^[a-zA-Z\s'\-\.]+$/.test(value)) return 'Last name contains invalid characters.';
            return null;
        },

        email(value) {
            if (!value) return 'Please enter your email address.';
            if (value.length > 254) return 'Email address is too long.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
                return 'Please enter a valid email address.';
            return null;
        },

        phone(value) {
            if (!value) return null; // optional

            // Strip all formatting characters to count real digits
            const digits = value.replace(/[\s\+\-\(\)\.]/g, '');

            // Must be digits only after stripping formatting
            if (!/^\d+$/.test(digits))
                return 'Phone number contains invalid characters.';

            // Handle country code: if starts with + it can be up to 15 digits
            // If no country code, standard 7–12 digits
            if (value.startsWith('+')) {
                if (digits.length < 7 || digits.length > 15)
                    return 'Phone number must be between 7 and 15 digits.';
            } else {
                if (digits.length < 7 || digits.length > 12)
                    return 'Phone number must be between 7 and 12 digits.';
            }

            return null;
        },

        subject(value) {
            if (!value) return 'Please enter a subject.';
            if (value.length < 3) return 'Subject must be at least 3 characters.';
            if (value.length > 150) return 'Subject must be under 150 characters.';
            return null;
        },

        message(value) {
            if (!value) return 'Please enter your message.';
            if (value.length < 10) return 'Message must be at least 10 characters.';
            if (value.length > 5000) return 'Message must be under 5000 characters.';
            return null;
        }

    };

    // -------------------------------------------------------------------------
    // Show / clear field error
    // -------------------------------------------------------------------------
    function showError(fieldName, message) {
        const el = document.getElementById(`error-${fieldName}`);
        const input = document.getElementById(fieldName);
        if (el) { el.textContent = message; el.style.display = 'block'; }
        if (input) { input.classList.add('is-invalid'); input.classList.remove('is-valid'); }
    }

    function clearError(fieldName) {
        const el = document.getElementById(`error-${fieldName}`);
        const input = document.getElementById(fieldName);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
        if (input) { input.classList.remove('is-invalid'); input.classList.add('is-valid'); }
    }

    // -------------------------------------------------------------------------
    // Validate all fields
    // -------------------------------------------------------------------------
    function validateAll() {
        const fields = ['firstName', 'lastName', 'email', 'phone', 'subject', 'message'];
        let valid = true;

        fields.forEach(field => {
            const input = document.getElementById(field);
            if (!input) return;
            const error = validators[field](input.value.trim());
            if (error) { showError(field, error); valid = false; }
            else clearError(field);
        });

        return valid;
    }

    // -------------------------------------------------------------------------
    // Inline validation on blur + live clear on input
    // -------------------------------------------------------------------------
    ['firstName', 'lastName', 'email', 'phone', 'subject', 'message'].forEach(field => {
        const input = document.getElementById(field);
        if (!input) return;

        input.addEventListener('blur', () => {
            const error = validators[field](input.value.trim());
            if (error) showError(field, error);
            else clearError(field);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                const error = validators[field](input.value.trim());
                if (!error) clearError(field);
            }
        });
    });

    // -------------------------------------------------------------------------
    // Phone: restrict input to numbers + formatting characters only
    // -------------------------------------------------------------------------
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {

        phoneInput.addEventListener('keydown', (e) => {
            // Always allow control keys
            const controlKeys = [
                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End'
            ];
            if (controlKeys.includes(e.key)) return;

            // Allow Ctrl/Cmd + A, C, V, X, Z
            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) return;

            // Allow digits 0-9
            if (/^\d$/.test(e.key)) return;

            // Allow + only at position 0 (country code prefix)
            if (e.key === '+' && phoneInput.selectionStart === 0) return;

            // Allow formatting characters: space, dash, dot, brackets
            if ([' ', '-', '.', '(', ')'].includes(e.key)) return;

            // Block everything else
            e.preventDefault();
        });

        // Handle paste — strip anything invalid, preserve structure
        phoneInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');

            let cleaned = '';
            for (let i = 0; i < pasted.length; i++) {
                const char = pasted[i];
                if (/\d/.test(char)) {
                    cleaned += char;
                } else if (char === '+' && i === 0) {
                    cleaned += char;
                } else if ([' ', '-', '.', '(', ')'].includes(char)) {
                    cleaned += char;
                }
                // Hard cap at 17 chars (+XX XXXXXXXXXXXX with formatting)
                if (cleaned.length >= 17) break;
            }

            // Insert cleaned value at cursor position
            const start = phoneInput.selectionStart;
            const end = phoneInput.selectionEnd;
            const current = phoneInput.value;
            phoneInput.value = current.slice(0, start) + cleaned + current.slice(end);

            // Re-trigger validation after paste
            const error = validators.phone(phoneInput.value.trim());
            if (error) showError('phone', error);
            else clearError('phone');
        });
    }

    // -------------------------------------------------------------------------
    // Form message helpers
    // -------------------------------------------------------------------------
    function showFormMessage(message, type = 'success') {
        formMessage.textContent = message;
        formMessage.className = `form-message form-message--${type}`;
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideFormMessage() {
        formMessage.style.display = 'none';
        formMessage.textContent = '';
    }

    // -------------------------------------------------------------------------
    // Button state
    // -------------------------------------------------------------------------
    function setLoading(state) {
        submitBtn.disabled = state;
        submitText.textContent = state ? 'Sending...' : 'SEND YOUR MESSAGE';
    }

    // -------------------------------------------------------------------------
    // Submit handler
    // -------------------------------------------------------------------------
    let isSubmitting = false;

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        hideFormMessage();

        if (isSubmitting) return;
        if (!validateAll()) return;

        // Client-side honeypot check
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value) return;

        isSubmitting = true;
        setLoading(true);

        const payload = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            _honey: honeypot ? honeypot.value : '',   // FormSubmit built-in honeypot field
            _captcha: 'false'                           // Disable FormSubmit's own captcha page
        };

        try {
            const res = await fetch(FORMSUBMIT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            // FormSubmit returns { success: "true" } as a string, not a boolean
            if (res.ok && data.success === 'true') {
                showFormMessage(data.message || 'Thank you! Your message has been sent.', 'success');
                form.reset();
                document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

            } else {
                showFormMessage(data.message || 'Something went wrong. Please try again.', 'error');
            }

        } catch (err) {
            console.error('Submission error:', err);
            showFormMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            isSubmitting = false;
            setLoading(false);
        }
    });

})();