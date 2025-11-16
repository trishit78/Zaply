/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node, Edge } from "reactflow";

export type NodeType =
  | "webhook"
  | "schedule"
  | "aiTextGenerator"
  | "aiAnalyzer"
  | "aiChatbot";

export interface NodeData {
    label:string,
    type:NodeType,
    config:Record<string,any>;
    output?:any;
    isExecuting?:boolean;
    error?:string;
}

export interface WorkFlowNode extends  Node{
    data:NodeData;
}

export type WorkFlowEdge = Edge;


export interface WorkFlowState {
    nodes:WorkFlowNode[];
    edges:WorkFlowEdge[];
    addNode:(node: WorkFlowNode)=> void;
    updateNode:(id:string,data:Partial<NodeData>)=> void;
    deleteNode:(id:string)=>void;
    addEdge:(edge:WorkFlowEdge)=> void;
    deleteEdge:(id:string)=> void;
    setEdges:(nodes:WorkFlowEdge[])=> void;
    setNodes:(edges:WorkFlowNode[])=> void;
    clearWorkflow:()=> void;
}

export interface NodeExecutionContext {
    nodeId:string;
    input:any;
    config:Record<string,any>
    previousNodes:Record<string,any>
}

export interface NodeExecutionResult{
    success:boolean;
    output?:any;
    error?:string;
}