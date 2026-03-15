import { useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, // عناصر الرسوم
  Legend, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement } from "chart.js";

ChartJS.register( ArcElement, Tooltip, Legend,// تسجيل مكونات الchart
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement );

export default function ExpensesChart({
  expenses,
  categories,
  onSelectCategory,
  onNavigateCategory,
  darkMode = false
}) {

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Expenses by category 
  const dataMap = categories.reduce((acc, cat) => {
    acc[cat.id] = { name: cat.name, total: 0 };
    return acc;
  }, {});

  expenses.forEach(exp => {
    if (dataMap[exp.categoryId]) {
      dataMap[exp.categoryId].total += exp.amount;
    }
  });

  const labels = Object.values(dataMap).map(c => c.name);
  const values = Object.values(dataMap).map(c => c.total);

  // ===== Expenses by month =====
  const monthMap = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthMap[key]) {
      monthMap[key] = {
        total: 0,
        label: date.toLocaleString("default", {
          month: "short",
          year: "numeric"
        }),
        year: date.getFullYear(),
        month: date.getMonth() + 1
      };
    }

    monthMap[key].total += exp.amount;
  });

  const sortedMonths = Object.keys(monthMap).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const monthLabels = sortedMonths.map(m => monthMap[m].label);
  const monthValues = sortedMonths.map(m => monthMap[m].total);

  const colors = [
    "#FF6384","#36A2EB","#FFCE56","#4BC0C0",
    "#9966FF","#FF9F40","#8BC34A","#FF5722"
  ];

  // ===== Click on category charts =====
  const handleCategoryClick = (evt, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const categoryName = labels[index];

    setSelectedCategory(categoryName);

    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
  };

  // ===== Click on month chart =====
  const handleLineClick = (evt, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const monthKey = sortedMonths[index];
    const monthData = monthMap[monthKey];

    if (onNavigateCategory) {
      onNavigateCategory(
        `/expenses?month=${monthData.year}-${monthData.month}`
      );
    }
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom" ,
        labels: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' }
      }
    },
    scales: {
      x: {
        ticks: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' },
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }
      },
      y: {
        ticks: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' },
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }
      }
    },
    onClick: handleCategoryClick
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom" ,
        labels: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' }

        }
    },
    scales: {
      x: {
        ticks: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' },
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }
      },
      y: {
        ticks: { color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151' },
        grid: { color: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }
      }
    },
    onClick: handleLineClick
  };

  const pieData = {
    labels,
    datasets: [{ data: values, backgroundColor: colors }]
  };

  const barData = {
    labels,
    datasets: [{ label: "Expenses", data: values, backgroundColor: colors }]
  };

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Expenses by Month",
        data: monthValues,
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ marginTop: "20px" }}>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px"
      }}>

        <div style={{ height: "350px" }}>
          <h5 style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Pie Chart</h5>
          <Pie data={pieData} options={commonOptions} />
        </div>

        <div style={{ height: "350px" }}>
          <h5 style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Bar Chart</h5>
          <Bar data={barData} options={commonOptions} />
        </div>

        <div style={{ height: "350px" }}>
          <h5 style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>Line Chart</h5>
          <Line data={lineData} options={lineOptions} />
        </div>

      </div>

      {selectedCategory && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#36A2EB",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            onClick={() => onNavigateCategory(
              `/expenses?category=${encodeURIComponent(selectedCategory)}`
            )}
          >
            View "{selectedCategory}" in Expenses Table
          </button>
        </div>
      )}

    </div>
  );
}