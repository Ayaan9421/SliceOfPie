import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import { read, utils } from 'xlsx'; // Correct import for xlsx
import '../App.css'; // Adjust the import path if needed

const DataSheetAndChart = ({ file, fileType }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (fileType === 'csv') {
        Papa.parse(e.target.result, {
          header: false,
          skipEmptyLines: true,
          complete: (result) => {
            setData(result.data);
            processAndRenderChart(result.data);
          },
        });
      } else if (fileType === 'xlsx') {
        const workbook = read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        setData(jsonData);
        processAndRenderChart(jsonData);
      }
    };
    reader.readAsBinaryString(file);
  }, [file, fileType]);

  const processAndRenderChart = (data) => {
    const processedData = data.map(d => ({
      name: d[0],
      value: +d[1]
    }));
    setChartData(processedData);
    renderChart(processedData);
  };

  const handleDataChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
    processAndRenderChart(updatedData);
  };

  const renderChart = (data) => {
    d3.select("#chart").selectAll("*").remove();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", 400)
      .attr("height", 300);

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, 400])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([300, 0]);

    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => 300 - y(d.value))
      .attr("fill", "steelblue");
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: '10px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={row[0]}
                    onChange={(e) => handleDataChange(index, 0, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row[1]}
                    onChange={(e) => handleDataChange(index, 1, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="chart" style={{ flex: 1, padding: '10px' }}></div>
    </div>
  );
};

export default DataSheetAndChart;
