'use client'

import CustomNode from "@/component/CustomNode";
import Sidebar from "@/component/ui/Sidebar";
import { nodeDefinitions } from "@/lib/node-definitions";
import { useWorkflowStore } from "@/lib/store";
import { NodeData, WorkFlowNode } from "@/lib/types";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, NodeTypes, OnEdgesChange, OnNodesChange, Panel, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css"

let nodeIdCounter = 0;

const nodeTypes:NodeTypes={
  custom:CustomNode
}

export default function Home() {
  const {nodes,edges,addEdge,addNode,updateNode,setNodes,setEdges} = useWorkflowStore();
  
  const [ , , onNodesChange] = useNodesState([]);
  const [,,onEdgesChange] = useEdgesState([]);

  const [isExecuting,setIsExecuting] = useState(false);
  const [selectedNodeId,setSelectedNodeId] = useState<string| null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance,setReactFlowInstance] = useState<any>(null);
  

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: "smoothstep",
        animated: true,
      };
      addEdge(edge as any);
    },
    [addEdge]
  );
  const handleEdgesChange:OnEdgesChange = useCallback((changes)=>{
    onEdgesChange(changes);
    changes.forEach((change)=>{
      if(change.type === 'remove'){
        const {edges:currentEdges} = useWorkflowStore.getState();
        setEdges(currentEdges.filter((edge) => edge.id !== change.id ))
      }
    })
  },[edges,onEdgesChange,setEdges])

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

  const onNodeDoubleClick = useCallback(
    (_event:React.MouseEvent,node:any)=>{
      setSelectedNodeId(node.id)
    },
    []
  );

  return (
    <div className="flex h-screen w-screen bg-gray-100">
     
      <Sidebar ></Sidebar>
      <div className="flex-1" ref={reactFlowWrapper}>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange as onNodesChange}
        onEdgesChange={handleEdgesChange as onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50 dark:bg-gray-900"

        >
        <Background />
        <Controls />
        <MiniMap
        nodeColor={(node)=>{
          const definition = nodeDefinitions[node.data.type];
          return definition?.color.includes("gradient") 
          ? "#8bcf6" :definition?.color.replace("bg-","") || "#6366f1"
        }}
        className="bg-white dark:bg-gray-800"
        />
        <Panel
          position="top-center"
          className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{nodes.length}</span>{" "}
            nodes  {"  "}
            <span className="font-semibold text-gray-900 dark:text-white">
            {edges.length}
            </span>{" "}
            connections
          </div>
          </Panel>
      </ReactFlow>
        </div>
{/* 
        {selectedNodeId &&(
          <NodeConfigPanel nodeId={selectedNodeId} />
        )} */}

    </div>
  );
}
