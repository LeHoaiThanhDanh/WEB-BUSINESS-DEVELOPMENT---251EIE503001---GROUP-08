
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("related-container");
    if (!container) {
        console.error("Không tìm thấy phần tử #related-container");
        return;
    }

    const cards = Array.from(container.querySelectorAll(".related-card"));
    if (cards.length === 0) {
        console.warn("Không có bài viết nào trong #related-container");
        return;
    }
    shuffleArray(cards);

    const selectedCards = cards.slice(0, 3);

    container.innerHTML = "";

    selectedCards.forEach(card => container.appendChild(card));

    container.style.opacity = "0";
    setTimeout(() => {
        container.style.transition = "opacity 0.6s ease";
        container.style.opacity = "1";
    }, 50);
});

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}
