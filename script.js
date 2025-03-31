document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
});

let finalScores = [];
let chartLabels = [];

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
            const fullName = `${firstName} ${lastName}`.trim();
            const score = parseFloat(values[values.length - 1].trim());
            if (!isNaN(score)) {
                labels.push(fullName || values[0].trim());
                scores.push(score);
                total += score;
            }
        }
    });

    if (labels.length === 0) {
        alert("No valid data found!");
        return;
    }

    chartLabels = labels;
    finalScores = scores;

    updateChart(labels, scores);
    updateSummary(labels, scores, total);
}

let myChart;

function updateChart(labels, scores) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    // **LIMITING LABELS TO MAX 50**
    const maxLabels = 50;
    const step = Math.ceil(labels.length / maxLabels);
    const filteredLabels = labels.filter((_, index) => index % step === 0);
    const filteredScores = scores.filter((_, index) => index % step === 0);

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'Final Scores',
                data: filteredScores.map(() => 0),  // Start from 0 for animation
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

document.getElementById("animateButton").addEventListener("click", animateChart);

function animateChart() {
    if (!myChart || finalScores.length === 0) return;

    let progress = Array(finalScores.length).fill(0);
    let speeds = finalScores.map(() => Math.random() * 0.2 + 0.05);

    function step() {
        let allComplete = true;
        for (let i = 0; i < progress.length; i++) {
            if (progress[i] < finalScores[i]) {
                progress[i] += speeds[i];
                if (progress[i] > finalScores[i]) progress[i] = finalScores[i];
                allComplete = false;
            }
        }

        myChart.data.datasets[0].data = progress.filter((_, index) => index % Math.ceil(progress.length / 50) === 0);
        myChart.update();

        if (!allComplete) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function updateSummary(labels, scores, total) {
    document.getElementById("scoreList").innerHTML = labels.map((name, i) => `${name}: ${scores[i]}`).join("\n");

    const avgScore = (total / scores.length).toFixed(2);
    document.getElementById("averageScore").textContent = avgScore;
}
