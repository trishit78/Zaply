'use client'

import CustomNode from "@/component/CustomNode";
import Sidebar from "@/component/ui/Sidebar";
import { nodeDefinitions } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/lib/store";
import { NodeData, WorkFlowNode } from "@/lib/types";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, NodeTypes, OnNodesChange, useEdgesState, useNodesState } from "reactflow";


let nodeIdCounter = 0;

const nodeTypes:NodeTypes={
  custom:CustomNode
}

export default function Home() {
  const {nodes,edges,addEdge,addNode,updateNode,setNodes,setEdges} = useWorkflowStore();
  
  const [ , , onNodesChange] = useNodesState([]);
  const [onEdgesChange] = useEdgesState([]);

  const [isExecuting,setIsExecuting] = useState(false);
  const [selectedNodeId,setSelectedNodeId] = useState<string| null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance,setReactFlowInstance] = useState<any>(null);
  

  

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // Update store with the changes
      changes.forEach((change) => {
        if (change.type === "remove") {
          const { nodes: currentNodes } = useWorkflowStore.getState();
          setNodes(currentNodes.filter((node) => node.id !== change.id));
        } else if (change.type === "position" && "position" in change) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.position) {
            const updatedNodes = nodes.map((n) =>
              n.id === change.id ? { ...n, position: change.position! } : n
            );
            setNodes(updatedNodes);
          }
        }
      });
    },
    [nodes, onNodesChange, setNodes]
  );


  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type];
      if (!definition) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkFlowNode = {
        id: `node-${nodeIdCounter++}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: { ...definition.defaultConfig, type: definition.type },
        } as NodeData,
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-100">
     
      <Sidebar ></Sidebar>
      <div className="flex-1" ref={reactFlowWrapper}>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange as onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50 dark:bg-gray-900"

        >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
        </div>

    </div>
  );
}
