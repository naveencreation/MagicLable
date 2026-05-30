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
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxk93WeZft1tT7eA6HIgXBGy-1temY2n_0TaE5Gau47pEkVzJpuhJWAqupnmLE_UMKN/exec'; 

// Replace with your business phone number (including country code, without + or spaces, e.g., 919876543210)
const BUSINESS_WHATSAPP_NUMBER = '917010689737'; 

// Form submission handler
const orderForm = document.getElementById('label-order-form');
if (orderForm) {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const successModal = document.getElementById('success-modal');
    const waRedirectBtn = document.getElementById('whatsapp-redirect-btn');

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
            const requests = document.getElementById('requests').value;
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
                requests: requests,
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
            const message = `Hi StickerStars! 🌟\n\nI just placed an order on your website:\n\n*Child Name:* ${childName}\n*School:* ${schoolName}\n*Class & Section:* ${className} - ${division}\n*Roll No:* ${rollno || 'N/A'}\n*WhatsApp No:* ${whatsapp}\n*Requests:* ${requests || 'None'}\n\nPlease check my photo and verify the order!`;
            
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
}
