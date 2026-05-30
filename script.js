// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.classList.remove('ph-x');
        icon.classList.add('ph-list');
    } else {
        icon.classList.remove('ph-list');
        icon.classList.add('ph-x');
    }
});

// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('i').classList.remove('ph-x');
        mobileMenuBtn.querySelector('i').classList.add('ph-list');
    });
});

// Google Sheets Integration Configuration
// Paste your Web App URL after deploying in Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn2_OrCRFCgIjJpoR5a3Apm4srwB5PYKwMBtKyP5sL5LWNxODwrbQtFiSQthB62wsp/exec';

// Replace with your business phone number (including country code, without + or spaces, e.g., 919876543210)
const BUSINESS_WHATSAPP_NUMBER = '919003892353';

// Form submission handler
const orderForm = document.getElementById('label-order-form');
if (orderForm) {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const successModal = document.getElementById('success-modal');
    const waRedirectBtn = document.getElementById('whatsapp-redirect-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!orderForm.checkValidity()) return;

        // Verify URL is configured
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            alert('Please configure your GOOGLE_SCRIPT_URL in script.js first!');
            return;
        }

        // Set loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl mr-2"></i> Saving Order Details...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');

        try {
            // Get form values
            const childName = document.getElementById('childName').value;
            const className = document.getElementById('class').value;
            const division = document.getElementById('div').value;
            const rollno = document.getElementById('rollno').value;
            const subject = document.getElementById('subject').value;
            const schoolName = document.getElementById('schoolName').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const address = document.getElementById('address').value;
            const photoInput = document.getElementById('photo');

            // Read photo file and convert to Base64
            let photoData = null;
            let photoName = '';
            let photoType = '';

            if (photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];
                photoName = file.name;
                photoType = file.type;

                // Read file as base64
                photoData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        // Get the base64 string excluding data URL header
                        const base64String = reader.result.split(',')[1];
                        resolve(base64String);
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            }

            // Create JSON payload
            const payload = {
                name: childName,
                className: className,
                division: division,
                roll: rollno,
                subject: subject,
                school: schoolName,
                whatsapp: whatsapp,
                requests: address,
                photoData: photoData,
                photoName: photoName,
                photoType: photoType
            };

            // Post to Google Apps Script Web App
            // Sending as text/plain with no-cors mode to bypass redirect CORS blocks
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            // Generate WhatsApp message
            const message = `Hi MagicLabel! 🌟\n\nI just placed an order on your website:\n\n*Child Name:* ${childName}\n*School:* ${schoolName}\n*Class & Section:* ${className} - ${division}\n*Roll No:* ${rollno || 'N/A'}\n*WhatsApp No:* ${whatsapp}\n*Delivery Address:* ${address}\n\nPlease check my photo and verify the order!`;

            const whatsappURL = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            // Configure modal button
            waRedirectBtn.href = whatsappURL;

            // Reset form
            orderForm.reset();

            // Show Success Modal
            successModal.classList.remove('hidden');

            // Also auto-redirect to WhatsApp after 2.5 seconds
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 2500);

        } catch (error) {
            console.error('Submission error:', error);
            alert('Something went wrong. Please check your internet connection and try again.');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
        }
    });

    // Close Modal event listeners
    if (closeModalBtn && successModal) {
        const closeModal = () => {
            successModal.classList.add('hidden');
        };

        closeModalBtn.addEventListener('click', closeModal);

        // Close modal when clicking the backdrop
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeModal();
            }
        });
    }
}

// ============================================================
// 3D Perspective Carousel — Auto-play, Touch, Dots, Keyboard
// ============================================================
(function initCarousel() {
    const items = Array.from(document.querySelectorAll('.carousel-item'));
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const viewport = document.getElementById('carousel-viewport');

    if (!items.length) return;

    const TOTAL = items.length;
    const INTERVAL = 3500; // ms between auto-advances
    let current = 0;
    let timer = null;

    /** Positive modulo — always returns 0..n-1 */
    function mod(n, m) { return ((n % m) + m) % m; }

    /** Apply is-prev / is-active / is-next classes based on current index */
    function update() {
        items.forEach((el, i) => {
            el.classList.remove('is-prev', 'is-active', 'is-next');
            const dist = mod(i - current, TOTAL);
            if (dist === 0) el.classList.add('is-active');
            else if (dist === 1) el.classList.add('is-next');
            else if (dist === TOTAL - 1) el.classList.add('is-prev');
            // Items with no class transition back to the off-screen hidden state
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function goTo(idx) {
        current = mod(idx, TOTAL);
        update();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoPlay() {
        stopAutoPlay();
        timer = setInterval(next, INTERVAL);
    }

    function stopAutoPlay() {
        clearInterval(timer);
        timer = null;
    }

    // --- Button events ---
    prevBtn?.addEventListener('click', () => { prev(); startAutoPlay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoPlay(); });

    // --- Dot events ---
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); startAutoPlay(); });
    });

    // --- Click a side card to bring it to centre ---
    items.forEach((el, i) => {
        el.addEventListener('click', () => {
            if (i !== current) { goTo(i); startAutoPlay(); }
        });
    });

    // --- Pause auto-play while the user hovers ---
    viewport?.addEventListener('mouseenter', stopAutoPlay);
    viewport?.addEventListener('mouseleave', startAutoPlay);

    // --- Touch / swipe support ---
    let touchX = 0;
    viewport?.addEventListener('touchstart', e => {
        touchX = e.changedTouches[0].clientX;
    }, { passive: true });
    viewport?.addEventListener('touchend', e => {
        const delta = touchX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) {
            delta > 0 ? next() : prev();
            startAutoPlay();
        }
    }, { passive: true });

    // --- Keyboard arrow support (only when carousel is in view) ---
    document.addEventListener('keydown', e => {
        const vp = document.getElementById('carousel-viewport');
        if (!vp) return;
        const rect = vp.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === 'ArrowLeft') { prev(); startAutoPlay(); }
        if (e.key === 'ArrowRight') { next(); startAutoPlay(); }
    });

    // --- Initialise ---
    update();
    startAutoPlay();
})();
