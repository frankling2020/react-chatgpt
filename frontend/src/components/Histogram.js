/** Based on codes from https://www.react-graph-gallery.com/histogram
* it is a histogram that shows the distribution of the length of words
* in the text
*/

import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import React from 'react';

// define constants for the visualization
const MARGIN = { top: 30, right: 30, bottom: 40, left: 50 };
const BUCKET_NUMBER = 5;
const BUCKET_PADDING = 0;

// define the component of Histogram
export const Histogram = ({ width, height, data }) => {
  const axesRef = useRef(null);

  // compute the width and height of the bounds
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // compute the xScale, buckets, yScale
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, 30])
      .range([10, boundsWidth]);
  }, [boundsWidth]);

  const buckets = useMemo(() => {
    const bucketGenerator = d3
      .bin()
      .value((d) => d)
      .domain(xScale.domain())
      .thresholds(xScale.ticks(BUCKET_NUMBER));
    return bucketGenerator(data);
  }, [xScale, data]);

  const yScale = useMemo(() => {
    const max = Math.max(...buckets.map((bucket) => bucket?.length));
    return d3.scaleLinear().range([boundsHeight, 0]).domain([0, max]).nice();
  }, [boundsHeight, buckets]);

  // Render the X axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();

    // add the x axis
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append('g')
      .attr('transform', 'translate(0,' + boundsHeight + ')')
      .call(xAxisGenerator);

    // add the y axis
    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append('g').call(yAxisGenerator);

    // add the title
    svgElement.append('text')
      .attr('x', width / 2 - 50)
      .attr('y', -10)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Word Length Count in Summary');
  }, [xScale, yScale, boundsHeight, width]);

  // create the rectangles for the histogram
  const allRects = buckets.map((bucket, i) => {
    return (
      <rect
        key={i}
        fill="#69b3a2"
        x={xScale(bucket.x0) + BUCKET_PADDING / 2}
        width={xScale(bucket.x1) - xScale(bucket.x0) - BUCKET_PADDING}
        y={yScale(bucket.length)}
        height={boundsHeight - yScale(bucket.length)}
      />
    );
  });

  // return the svg to render the histogram
  return (
    <svg width={width} height={height}>
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
      >
        {allRects}
      </g>
      <g
        width={boundsWidth}
        height={boundsHeight}
        ref={axesRef}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
      />
    </svg>
  );
};
