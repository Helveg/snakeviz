import type {SnakevizData} from "./snakeviz";

export interface CallNode {
    name: string;
    display_name: string;
    time: number;
    cumulative: number;
    parent_name?: string;
    children?: CallNode[];
}

export function buildHierarchy(
  data: SnakevizData,
  node_name: string,
  depth: number,
  max_depth: number,
  cutoff: number,
  node_time: number,
  parent_name?: string,
  call_stack: Set<string> = new Set([node_name])
): CallNode {
  const stats = data.callees;
  const callee = stats[node_name];

  const node: CallNode = {
    name: node_name,
    display_name: callee.display_name,
    time: node_time,
    cumulative: callee.stats[3],
    parent_name,
  };

  if (depth < max_depth && Object.keys(callee.children).length > 0) {
    const child_names: Record<string, [number, number, number, number]> = {};

    // Avoid recursion loops
    for (const child_name in callee.children) {
      if (!call_stack.has(child_name)) {
        child_names[child_name] = callee.children[child_name];
      }
    }

    // Normalize child times
    const child_times: Record<string, number> = {};
    let total_children_time = 0.0;
    for (const child_name in child_names) {
      const callerStats = stats[child_name]?.callers[node_name];
      if (callerStats) {
        child_times[child_name] = callerStats[3];
        total_children_time += callerStats[3];
      }
    }

    if (total_children_time > node_time) {
      for (const child_name in child_times) {
        child_times[child_name] *= node_time / total_children_time;
      }
    }

    node.children = [];

    for (const child_name in child_names) {
      if (child_times[child_name] / node_time > cutoff) {
        const nextCallStack = new Set(call_stack);
        nextCallStack.add(node_name);

        node.children.push(
          buildHierarchy(
            data,
            child_name,
            depth + 1,
            max_depth,
            cutoff,
            child_times[child_name],
            node_name,
            nextCallStack
          )
        );
      }
    }

    // If node_time is not fully accounted for by children, add a remainder node
    if (total_children_time < node_time) {
      node.children.push({
        name: node_name,
        display_name: node.display_name,
        parent_name: node.parent_name,
        cumulative: callee.stats[3],
        time: node_time - total_children_time,
      });
    }
  }

  return node;
}