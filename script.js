document.getElementById("analyze-button").addEventListener("click", async () => {
    const gene = document.getElementById("gene-input").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!gene) {
        resultsDiv.innerHTML = "<p>Please enter a gene symbol.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>Searching mutations...</p>";

    try {
        // Step 1: Search ClinVar for gene mutations
        const searchURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=clinvar&term=${gene}[gene]&retmode=json`;
        const searchRes = await fetch(searchURL);
        const searchData = await searchRes.json();
        const idList = searchData.esearchresult.idlist.slice(0, 10); // limit to first 10 for demo

        if (idList.length === 0) {
            resultsDiv.innerHTML = "<p>No mutations found for this gene.</p>";
            return;
        }

        // Step 2: Fetch mutation summaries
        const summaryURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=${idList.join(",")}&retmode=json`;
        const summaryRes = await fetch(summaryURL);
        const summaryData = await summaryRes.json();

        let output = "<h3>Mutations Found:</h3><table border='1' cellpadding='6'><tr><th>rsID</th><th>Change</th><th>Condition</th><th>Significance</th></tr>";

        for (const id of idList) {
            const item = summaryData.result[id];

            const title = item.title || "-";
            const condition = item.condition_set?.[0]?.name || "-";
            const clinical = item.clinical_significance?.description || "-";
            const rsidMatch = title.match(/rs\d+/);
            const rsid = rsidMatch ? rsidMatch[0] : "-";

            output += `<tr>
                <td>${rsid}</td>
                <td>${title}</td>
                <td>${condition}</td>
                <td>${clinical}</td>
            </tr>`;
        }

        output += "</table>";
        resultsDiv.innerHTML = output;

    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "<p>Error retrieving data.</p>";
    }
});


//Now I am creating the DNA sequence for the DNA art.
document.getElementById("art-button").addEventListener("click", () => {
    const sequence = document.getElementById("dna-sequence").value.trim().toUpperCase();
    const canvas = document.getElementById("dna-canvas");
    const ctx = canvas.getContext("2d");

    if (!sequence || sequence.length < 1) {
        alert("Please enter a DNA sequence.");
        return;
    }

    const colors = {
        A: "#e74c3c",     // Red
        T: "#2ecc71",     // Green
        G: "#3498db",     // Blue
        C: "#f1c40f",     // Yellow
        N: "#95a5a6"      // Gray (for unknowns)
    };

    const gridSize = Math.ceil(Math.sqrt(sequence.length));
    const blockSize = Math.floor(canvas.width / gridSize);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let i = 0; i < sequence.length; i++) {
        const x = (i % gridSize) * blockSize;
        const y = Math.floor(i / gridSize) * blockSize;
        const base = sequence[i];
        ctx.fillStyle = colors[base] || colors["N"];
        ctx.fillRect(x, y, blockSize, blockSize);
    }
});

