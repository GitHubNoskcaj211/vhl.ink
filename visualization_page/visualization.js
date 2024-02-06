const makeCumulativeRedirectsOverTime = async () => {
    const cumulative_redirects_over_time_div = document.getElementById("cumulative_redirects_over_time");
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    const startDateInput = document.getElementById("start-date").value;
    const endDateInput = document.getElementById("end-date").value;

    const data = await fetchData(path);

    // Check if data is fetched successfully
    if (!data) {
        return;
    }

    // Filter data based on start and end dates
    const filteredData = filterDataByDate(data, startDateInput, endDateInput);

    // Assert all the redirect_key values equal the variable path
    const allKeysEqualPath = filteredData.every(item => item.redirect_key === path);
    if (!allKeysEqualPath) {
        cumulative_redirects_over_time_div.innerHTML = `There was an error... check the console logs.`;
        console.error("All redirect_key values equal the path:", allKeysEqualPath);
        return;
    }

    // Sort data by the redirect_time element
    filteredData.sort((a, b) => a.redirect_time - b.redirect_time);

    // Extract timestamps and freq
    const timestamps = filteredData.map(item => item.redirect_time);
    const freq = Array.from({ length: timestamps.length }, (_, i) => 1);

    // Calculate cumulative frequency
    let sum = 0;
    const cumulativeFreq = freq.map(freq => sum += freq);

    // Convert timestamps to Date objects
    const times = timestamps.map(t => new Date(t));

    // Create trace for Plotly
    let trace = [
    {
        x: times,
        y: cumulativeFreq,
        type: "scatter",
        mode: "lines+markers",
        marker: { size: 5 },
    },
    ];

    // Create layout for Plotly
    let layout = {
        title: `Cumulative Number of Redirects over Time ${path}`,
    };

    // Plot the chart using Plotly
    let config = { responsive: true };
    cumulative_redirects_over_time_div.innerHTML = '';
    Plotly.newPlot("cumulative_redirects_over_time", trace, layout, config);
};

// Function to filter data by date range
const filterDataByDate = (data, startDate, endDate) => {
    // Convert start and end dates to timestamp
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = endDate ? new Date(endDate).getTime() : Infinity;

    // Filter data based on date range
    return data.filter(item => {
        const timestamp = item.redirect_time;
        return timestamp >= startTimestamp && timestamp <= endTimestamp;
    });
};

// Function to fetch data from API
const fetchData = async (path) => {
    const url = `https://api.vcolink.com/?command=get_analytics_for_path&path=${path}`;

    try {
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
};

const makeAllPlots = () => {
    makeCumulativeRedirectsOverTime();
}
