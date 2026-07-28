import React, { useState, useEffect } from "react";
import { Bar, Doughnut, Pie, Line, Scatter } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Filler, BarController, BarElement, CategoryScale, LinearScale, PointElement, LineElement, LineController, TimeScale } from "chart.js";
import request from "@hubleto/react-ui/core/Request";
import Spinner from '@hubleto/react-ui/fc/Spinner';

ChartJS.register(ArcElement, Tooltip, Legend, Filler, BarController, BarElement, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, LineController);

export type HubletoChartType = 'bar' | 'doughnut' | 'pie' | 'goals' | 'scatter' | 'line';

export interface HubletoChartProps {
  type: HubletoChartType,
  data?: any,
  legend?: any,
  options?: any,
  async?: boolean,
  endpoint?: string,
  endpointParams?: any,
}

export default function HubletoChart(props: HubletoChartProps) {
  const [data, setData] = useState<any>(props.data);
  const [legend, setLegend] = useState<any>(props.legend);
  const [options, setOptions] = useState<any>(props.options);

  useEffect(() => {
    if (props.async) {
      request.get(
        props.endpoint,
        props.endpointParams ?? {},
        (chart: any) => {
          try {
            setData(chart.data);
            setLegend(chart.legend);
            setOptions(chart.options);
          } catch (err) {
            console.error(err);
          }
        }
      );
    }
    // Matches the original componentDidMount: runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) {
    return <Spinner></Spinner>;
  }

  let labels: any = data.labels ?? [];
  let dataset: any = {};
  dataset.data = data.values ?? [];
  if (data.colors) dataset.backgroundColor = data.colors;

  switch (props.type) {
    case "scatter":
      return <Scatter options={options} data={data} />;
    case "line":
      return <Line options={options} data={data} />;
    case "bar":
      return (
        <Bar
          width={0}
          height={0}
          options={{
            scales: {
              x: { ticks: { display: false } },
              y: { beginAtZero: true },
            },
          }}
          data={{
            labels: labels,
            datasets: [ dataset ],
          }}
        />
      );
    case "doughnut":
      return (
        <div className="h-full m-auto relative">
          <Doughnut
            options={{
              responsive: true,
              plugins: {
                legend: props.legend ? props.legend : {
                  display: false,
                },
              },
            }}
            data={{
              labels: labels,
              datasets: [ dataset ],
            }}
          />
        </div>
      );
    case "pie":
      return (
        <div className="h-full w-full m-auto relative">
          <Pie
            options={{
              responsive: true,
              aspectRatio: 2,
              plugins: {
                legend: props.legend ? props.legend : {
                  display: false,
                },
              },
            }}
            data={{
              labels: labels,
              datasets: [ dataset ],
            }}
          />
        </div>
      );
    case "goals":
      return <Bar
        data={{
          datasets: [
            {
              type: 'bar',
              label: 'Goals',
              backgroundColor: "#ffb12b",
              borderColor: "#a87316",
              data: props.data ? [...props.data.goals] : [],
            },
            {
              type: 'bar',
              label: 'Won Deals',
              backgroundColor: "#66c24f",
              data: props.data ? [...props.data.won] : [],
              stack: "stack"
            },
            {
              type: 'bar',
              label: 'Pending Deals',
              backgroundColor: "#cfcecc",
              data: props.data ? [...props.data.pending] : [],
              stack: "stack"
            },
          ],
          labels: props.data ? [...props.data.labels] : [],
        }}
      />;
    default:
      return <></>;
  }
}
