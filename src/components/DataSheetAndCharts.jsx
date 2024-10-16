import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { read, utils } from "xlsx"; // Correct import for xlsx
import { Chart } from "chart.js/auto"; // Import Chart.js
import "../App.css"; // Ensure this path is correct

const DataSheetAndChart = ({ file, fileType }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [labels, setLabels] = useState({ xLabel: "", yLabel: "" });
  const [chartType, setChartType] = useState("bar"); // Default to 'bar' chart
  const chartRef = useRef(null); // Using useRef to manage the chart reference
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (fileType === "csv") {
        Papa.parse(e.target.result, {
          header: true, // Automatically treat the first row as headers
          skipEmptyLines: true,
          complete: (result) => {
            const header = result.meta.fields;
            setLabels({ xLabel: header[0], yLabel: header[1] });
            setData(result.data);
          },
        });
      } else if (fileType === "xlsx") {
        const workbook = read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        const [header, ...rows] = jsonData;
        const dataWithKeys = rows.map((row) => ({
          [header[0]]: row[0],
          [header[1]]: row[1],
        }));
        setLabels({ xLabel: header[0], yLabel: header[1] });
        setData(dataWithKeys);
      }
    };
    reader.readAsBinaryString(file);
  }, [file, fileType]);

  useEffect(() => {
    if (data.length && chartRef.current) {
      processAndRenderChart(data);
    }
  }, [data, chartType]); // Rerun when chartType changes or data updates

  const processAndRenderChart = (data) => {
    const processedData = data.map((d) => ({
      name: d[labels.xLabel],
      value: +d[labels.yLabel],
    }));
    setChartData(processedData);

    if (chartInstance) {
      chartInstance.destroy(); // Destroy the existing chart before rendering a new one
    }

    const newChartInstance = renderChart(processedData);
    setChartInstance(newChartInstance); // Save chart instance for future updates
  };

  const renderChart = (data) => {
    const ctx = chartRef.current.getContext("2d");

    // Function to generate random colors
    const generateRandomColors = (numColors) => {
      const colors = [];
      for (let i = 0; i < numColors; i++) {
        const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`; // Generate random HSL color
        colors.push(color);
      }
      return colors;
    };

    // Generate enough colors for the data points
    const backgroundColors = generateRandomColors(data.length);

    const isPieOrDonut = chartType === "pie" || chartType === "doughnut";

    return new Chart(ctx, {
      type: chartType,
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: "Values",
            data: data.map((d) => d.value),
            backgroundColor: backgroundColors, // Apply dynamically generated colors
          },
        ],
      },
      options: {
        responsive: false, // Prevent Chart.js from resizing the canvas
        scales: isPieOrDonut
          ? {} // No scales for Pie or Donut charts
          : {
              x: {
                title: {
                  display: true,
                  text: labels.xLabel,
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: labels.yLabel,
                },
              },
            },
      },
    });
  };

  // Handle changes in the input fields of the table
  const handleDataChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const isPieOrDonutValid = () => {
    return chartData.every((d) => d.value > 0); // Pie/Donut charts require positive values
  };

  return (
    <div>
      <div className="data-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{labels.xLabel}</th>
              <th>{labels.yLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={row[labels.xLabel] || ""}
                    onChange={(e) =>
                      handleDataChange(index, labels.xLabel, e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row[labels.yLabel] || ""}
                    onChange={(e) =>
                      handleDataChange(index, labels.yLabel, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          id="chart"
          className={
            chartType === "pie" || chartType === "doughnut"
              ? "pie-donut-chart"
              : ""
          }
        >
          <canvas ref={chartRef} width="300" height="300"></canvas>{" "}
          {/* Explicitly set width and height */}
        </div>
      </div>

      {/* Radio buttons to switch between chart types */}
      <div className="chart-type-options">
        <label>
          <input
            type="radio"
            value="bar"
            checked={chartType === "bar"}
            onChange={handleChartTypeChange}
          />
          Bar Chart
        </label>
        <label>
          <input
            type="radio"
            value="line"
            checked={chartType === "line"}
            onChange={handleChartTypeChange}
          />
          Line Chart
        </label>
        {isPieOrDonutValid() && (
          <>
            <label>
              <input
                type="radio"
                value="pie"
                checked={chartType === "pie"}
                onChange={handleChartTypeChange}
              />
              Pie Chart
            </label>
            <label>
              <input
                type="radio"
                value="doughnut"
                checked={chartType === "doughnut"}
                onChange={handleChartTypeChange}
              />
              Donut Chart
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default DataSheetAndChart;
