import React from 'react';
import { View, Text, StyleSheet, Svg, Path, G } from '@react-pdf/renderer';
import { cleanPdfText, formatRupeesShort } from '@/lib/utils';

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2f5aa8',
    marginBottom: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    marginRight: 4,
  },
  legendText: {
    fontSize: 8,
    color: '#475569',
  },
  noDataText: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 20,
  }
});

interface PieChartProps {
  title: string;
  data: { category: string; value: number }[];
  colors: Record<string, string>;
  defaultColor: string;
}

export const PieChart = ({ title, data, colors, defaultColor }: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{cleanPdfText(title)}</Text>
        <Text style={styles.noDataText}>No {title.toLowerCase().includes('liabilit') ? 'liabilities' : 'assets'} recorded</Text>
      </View>
    );
  }

  // Merge slices < 2% into "Other"
  let processedData: { category: string; value: number; color: string }[] = [];
  let otherValue = 0;

  data.forEach(item => {
    const percentage = (item.value / total) * 100;
    if (percentage < 2) {
      otherValue += item.value;
    } else {
      let catName = item.category;
      let matchedColor = defaultColor;
      // Match color keys (which might be substrings)
      for (const [key, color] of Object.entries(colors)) {
        if (catName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(catName.toLowerCase())) {
          matchedColor = color;
          break;
        }
      }
      processedData.push({ category: catName, value: item.value, color: matchedColor });
    }
  });

  if (otherValue > 0) {
    const existingOther = processedData.find(d => d.category.toLowerCase().includes('other'));
    if (existingOther) {
      existingOther.value += otherValue;
    } else {
      processedData.push({ category: "Other", value: otherValue, color: defaultColor });
    }
  }

  // Generate SVG paths
  const size = 160;
  const center = size / 2;
  const radius = size / 2;
  let currentAngle = -Math.PI / 2;

  const paths = processedData.map((d, i) => {
    const percentage = d.value / total;
    const sliceAngle = percentage * 2 * Math.PI;
    
    // If it's 100%, render a full circle
    if (percentage > 0.999) {
      return (
        <Path 
          key={i} 
          d={`M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius} Z`} 
          fill={d.color} 
        />
      );
    }

    const x1 = center + radius * Math.cos(currentAngle);
    const y1 = center + radius * Math.sin(currentAngle);
    currentAngle += sliceAngle;
    const x2 = center + radius * Math.cos(currentAngle);
    const y2 = center + radius * Math.sin(currentAngle);
    
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    
    const dPath = `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    
    return <Path key={i} d={dPath} fill={d.color} />;
  });

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{cleanPdfText(title)}</Text>
      
      <View style={{ width: size, height: size, marginBottom: 10 }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths}
        </Svg>
      </View>

      <View style={styles.legendContainer}>
        {processedData.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>
              {cleanPdfText(d.category)} ({(d.value / total * 100).toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
