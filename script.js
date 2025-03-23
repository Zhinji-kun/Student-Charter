document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
});

function processCSV(data) {
    const lines = data.split("\n").map(line => line.trim()).filter(line => line);
    if (lines.length < 2) return alert("Invalid CSV data!");

    const labels = [];
    const scores = [];
    let total = 0;
    
    lines.slice(1).forEach(line => {
        const values = line.split(",");
        if (values.length > 1) {
            const firstName = values.length > 2 ? values[1].trim() : "";
            const lastName = values.length > 3 ? values[2].trim() : "";  
            const fullName = `${firstName} ${lastName}`.trim();  // Merge first & last name
            const score = parseFloat(values[values.length - 1].trim());
            if (!isNaN(score)) {
                labels.push(fullName || values[0].trim()); // Use full name or fallback to ID
                scores.push(score);
                total += score;
            }
        }
    });

    if (labels.length === 0) {
        alert("No valid data found!");
        return;
    }

    updateChart(labels, scores);
    updateSummary(labels, scores, total);
}



function updateChart(labels, scores) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    if (window.myChart) {
        window.myChart.destroy();
    }

    // **LIMITING TOO MANY LABELS**
    const maxLabels = 50;
    const step = Math.ceil(labels.length / maxLabels);
    const filteredLabels = labels.filter((_, index) => index % step === 0);
    const filteredScores = scores.filter((_, index) => index % step === 0);

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'Final Scores',
                data: filteredScores,
                backgroundColor: 'tomato',
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: "white", autoSkip: false } },
                y: { ticks: { color: "white" }, beginAtZero: true }
            }
        }
    });
}

function updateSummary(labels, scores, total) {
    const scoreList = document.getElementById("scoreList");
    scoreList.innerHTML = labels.map((name, i) => `${name}: ${scores[i]}`).join("\n");

    const avgScore = (total / scores.length).toFixed(2);
    document.getElementById("averageScore").textContent = avgScore;
}
