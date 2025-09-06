import React, {useRef, useEffect} from "react";
import * as d3 from "d3";
import type {SnakevizData} from "../../snakeviz";

interface FlameGraphProps {
    data: SnakevizData;
    width?: number;
    height?: number;
}

export const FlameGraph: React.FC<FlameGraphProps> = ({data, width = 1200, height = 600}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Build a hierarchy from table_rows and callees
    const buildHierarchy = () => {
        const nodeMap: Record<string, any> = {};

        // First, create nodes for all functions
        for (const row of data.table_rows) {
            const name = row[6]; // name column from table_rows
            nodeMap[name] = {name, value: row[3], children: []}; // row[3] is cumulative time
        }

        // Link children from callees
        for (const parent in data.callees) {
          const childrenObj = data.callees[parent];
          if (nodeMap[parent] && childrenObj) {
            // `childrenObj` keys are the child names
            nodeMap[parent].children = Object.keys(childrenObj)
              .map(name => nodeMap[name])
              .filter(Boolean);
          }
        }

        // Build a set of all child names
        const allChildren = new Set<string>();
        for (const parent in data.callees) {
          const calleeObj = data.callees[parent]; // Callee type
          if (!calleeObj) continue;
          for (const childName of Object.keys(calleeObj)) {
            allChildren.add(childName); // childName is string
          }
        }

        // Find roots — nodes that are never children
        const roots = Object.keys(nodeMap).filter((name: string) => !allChildren.has(name));

        // If multiple roots, pick the one with highest cumulative time
        let rootNode;
        if (roots.length === 1) {
            rootNode = nodeMap[roots[0]];
        } else {
            rootNode = roots
                .map(name => nodeMap[name])
                .reduce((a, b) => (b.value > a.value ? b : a));
        }

        return d3.hierarchy(rootNode).sum(d => d.value);
    };

    useEffect(() => {
        if (!data) return;
        const rootNode = buildHierarchy();

        const partition = d3.partition<d3.HierarchyNode<any>>().size([width, height]);
        const root = partition(rootNode);

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous render

        const g = svg.append("g");

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        g.selectAll("rect")
            .data(root.descendants())
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "#fff");

        g.selectAll("text")
            .data(root.descendants().filter(d => d.x1 - d.x0 > 40))
            .enter()
            .append("text")
            .attr("x", d => d.x0 + 4)
            .attr("y", d => d.y0 + 14)
            .text(d => d.data.name)
            .attr("fill", "#000")
            .attr("font-size", 12);
    }, [data, width, height]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
};
