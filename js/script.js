document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector(".background-grid");

    function animateGrid() {
        let posY = 0;
        setInterval(() => {
            posY += 5;
            grid.style.backgroundPosition = `0px ${posY}px`;
        }, 50);
    }

    animateGrid();
});
