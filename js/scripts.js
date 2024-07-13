

// Open the email overlay
document.getElementById('emailLink').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('emailOverlay').style.display = 'block';
});

// Close the email overlay
document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('emailOverlay').style.display = 'none';
});

// Handle form submission
document.getElementById('emailForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const userEmail = document.getElementById('userEmail').value;
    const message = document.getElementById('message').value;
    
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        from_email: userEmail,
        message: message
    }).then(function(response) {
        document.getElementById('responseMessage').innerText = '200 OK';
        setTimeout(function() {
            document.getElementById('responseMessage').innerText = '';
            document.getElementById('emailOverlay').style.display = 'none';
        }, 2000);
    }, function(error) {
        document.getElementById('responseMessage').innerText = 'Failed to send';
    });
});

// Simple 8-bit style animation using canvas
window.onload = function() {
    const canvas = document.getElementById('animationCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00FF00';
        ctx.font = fontSize + 'px "Press Start 2P"';

        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);
};
