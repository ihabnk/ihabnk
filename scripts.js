document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.typing');
    elements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        const speed = 50; // typing speed in milliseconds

        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        typeWriter();
    });
});
