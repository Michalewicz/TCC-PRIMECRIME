import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { tooltipLinger } from '../../utils/tooltipLinger';

// Imported for its side effect: registers, once, everything the charts need.
ChartJS.register(
  CategoryScale,
  LogarithmicScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  ChartDataLabels,
  tooltipLinger
);
