import { AnalysisResult } from '../types';

export const DEFAULT_ANALYSIS: AnalysisResult = {
  paper: {
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: ['Albert Gu', 'Tri Dao'],
    year: '2023',
    arxivId: '2312.00752',
    venue: 'ICLR 2024 Oral',
    githubReference: 'https://github.com/state-spaces/mamba',
    url: 'https://arxiv.org/abs/2312.00752',
    tag: 'Selective SSM'
  },
  coreConcept: {
    problemStatement: 'Standard Transformers rely on self-attention with O(N²) quadratic time and memory complexity relative to sequence length, causing crippling latency and enormous memory consumption during long-context generation. Prior linear-time recurrent/state space models (SSMs) suffered from time-invariant dynamics, preventing them from selectively storing, compressing, or filtering contextual information across long horizons.',
    primaryMethodology: 'Mamba introduces a time-varying "Selective State Space" mechanism where the discretization parameters (B, C, and step size Delta) become input-dependent functions of the current token. To make this recurrent formulation fast on modern GPUs, Mamba introduces a hardware-aware parallel scan algorithm that operates in fast SRAM rather than materializing full states in slow HBM.',
    mathematicalBreakthroughs: 'Continuous SSMs defined by h\'(t) = Ah(t) + Bx(t) and y(t) = Ch(t) are traditionally discretized with fixed A_bar and B_bar matrices. Mamba transforms Delta, B, and C into dynamic linear projections of input x_t (Delta = softplus(Parameter + Linear(x_t)), B = Linear(x_t), C = Linear(x_t)). Using a GPU-fused associative scan operator, recurrence is computed in O(N) linear time while matching or outperforming quadratic Transformers.',
    fullSummary: 'Transformers struggle with long sequences due to quadratic O(N²) computational overhead. While classical State Space Models operate in linear O(N) time, their fixed, static parameters prevent them from selectively filtering out noise or remembering relevant tokens. Mamba solves this by making state-space parameters dynamic functions of incoming inputs, paired with a hardware-aware GPU associative scan that computes recurrence in fast SRAM without quadratic memory overhead.',
    wordCount: 168
  },
  flowchart: {
    mermaidCode: `graph TD
    In["Token Input: X [Batch, Length, Dim]"] --> Norm["RMSNorm Layer"]
    Norm --> Fork["Dual Projection Fork"]
    Fork --> BranchA["Branch A: Linear Projection [D -> 2D]"]
    Fork --> BranchB["Branch B: Gating Projection [D -> 2D]"]
    BranchA --> Conv1D["1D Causal Convolution (kernel=4)"]
    Conv1D --> SiLU1["SiLU Non-Linear Activation"]
    SiLU1 --> Disc["Input-Dependent Discretization: Δ, B, C"]
    Disc --> Scan["Hardware-Aware Selective Associative Scan (SRAM Fused)"]
    BranchB --> SiLU2["SiLU Gating Non-Linearity"]
    Scan --> Gate["Element-wise Multiplication & Gating"]
    SiLU2 --> Gate
    Gate --> OutProj["Output Linear Projection [2D -> D]"]
    OutProj --> AddResidual["Residual Addition (X + Y)"]
    AddResidual --> NextBlock["Output: Hidden State [B, L, D]"]`,
    labeledSegment: `[FLOWCHART]

graph TD
    In["Token Input: X [Batch, Length, Dim]"] --> Norm["RMSNorm Layer"]
    Norm --> Fork["Dual Projection Fork"]
    Fork --> BranchA["Branch A: Linear Projection [D -> 2D]"]
    Fork --> BranchB["Branch B: Gating Projection [D -> 2D]"]
    BranchA --> Conv1D["1D Causal Convolution (kernel=4)"]
    Conv1D --> SiLU1["SiLU Non-Linear Activation"]
    SiLU1 --> Disc["Input-Dependent Discretization: Δ, B, C"]
    Disc --> Scan["Hardware-Aware Selective Associative Scan (SRAM Fused)"]
    BranchB --> SiLU2["SiLU Gating Non-Linearity"]
    Scan --> Gate["Element-wise Multiplication & Gating"]
    SiLU2 --> Gate
    Gate --> OutProj["Output Linear Projection [2D -> D]"]
    OutProj --> AddResidual["Residual Addition (X + Y)"]
    AddResidual --> NextBlock["Output: Hidden State [B, L, D]"]`,
    nodesSummary: [
      { id: 'In', name: 'Token Input', role: 'Receives token embeddings of shape [Batch, Length, Dim]' },
      { id: 'Norm', name: 'RMSNorm', role: 'Pre-layer normalization for numerical training stability' },
      { id: 'Fork', name: 'Dual Projection Fork', role: 'Expands channel capacity by factor of 2 into dual branches' },
      { id: 'Conv1D', name: '1D Causal Convolution', role: 'Extracts local sequence context with kernel size 4' },
      { id: 'Disc', name: 'Selective Discretizer', role: 'Computes input-dependent Delta, B, and C matrices dynamically' },
      { id: 'Scan', name: 'Fused Associative Scan', role: 'Executes O(N) parallel prefix scan in GPU SRAM memory hierarchy' },
      { id: 'Gate', name: 'Multiplicative Gate', role: 'Applies gating signal to modulate the state-space outputs' },
      { id: 'OutProj', name: 'Output Projection', role: 'Projects expanded representation back to original model dimension' }
    ]
  },
  studentOpportunities: [
    {
      id: 1,
      title: 'Edge Deployment: INT8 Quantized Mamba for Raspberry Pi / Mobile',
      difficulty: 'Intermediate',
      expectedContribution: 'Port the selective state scan to ONNX Runtime and implement INT8 Post-Training Quantization (PTQ) to enable real-time sub-50ms token inference on resource-constrained ARM Cortex CPUs.',
      targetedPerformanceMetric: '4.2x latency reduction on ARM devices, 72% memory footprint reduction with <0.4 perplexity degradation on Wikitext-2.',
      recommendedTechStack: ['PyTorch', 'ONNX Runtime', 'TensorRT / NCNN', 'Python/C++'],
      estimatedWeeks: 3,
      resumeBullet: 'Engineered an INT8 quantized Mamba-130M inference runtime using ONNX Runtime and C++, reducing edge device RAM usage by 72% and achieving 24 tokens/sec on Raspberry Pi 4.',
      implementationPlan: [
        'Export PyTorch Mamba selective scan operator to custom ONNX custom op.',
        'Implement symmetric INT8 per-channel quantization for linear projections.',
        'Benchmark inference speedup and perplexity on ARM CPU vs standard PyTorch FP32.',
        'Publish reproducible benchmarking suite and documentation on GitHub.'
      ],
      engineeringTakeaway: 'Avoid quantizing the recurrence state matrix A directly to 8 bits; keep accumulation in INT32/FP16 to prevent catastrophic numerical drift over 2k+ tokens.'
    },
    {
      id: 2,
      title: 'Hybrid Mamba-Attention Architecture for Long-Context Code Search',
      difficulty: 'Advanced',
      expectedContribution: 'Build a hybrid backbone replacing 75% of Transformer attention layers with Mamba blocks while preserving top-layer multi-head cross-attention for precise AST token retrieval.',
      targetedPerformanceMetric: '3.1x faster training throughput on 32k context windows with parity on HumanEval code completion benchmark.',
      recommendedTechStack: ['PyTorch', 'Hugging Face Transformers', 'FlashAttention-2', 'Weights & Biases'],
      estimatedWeeks: 4,
      resumeBullet: 'Architected and trained a hybrid Mamba-Transformer 350M model for long repository code search; attained 3.1x faster training throughput on 32k contexts with 98.4% retrieval accuracy.',
      implementationPlan: [
        'Interleave 3 Mamba layers followed by 1 standard Multi-Head Attention layer.',
        'Fine-tune on CodeSearchNet long-context repositories using LoRA/PEFT.',
        'Profile GPU VRAM scaling across 4k, 8k, 16k, and 32k token contexts.',
        'Analyze attention head sparsity vs SSM hidden state retention across file boundaries.'
      ],
      engineeringTakeaway: 'SSMs excel at continuous sequential filtering but lose needle-in-a-haystack retrieval if top attention layers are completely removed.'
    },
    {
      id: 3,
      title: 'Time-Series Streaming Anomaly Detection with Sliding-Window Mamba',
      difficulty: 'Beginner',
      expectedContribution: 'Adapt Mamba for real-time multivariate IoT sensor anomaly detection, replacing LSTMs with a continuous selective state space capable of processing 100Hz sensor telemetry.',
      targetedPerformanceMetric: 'F1-score improvement from 0.78 to 0.89 on SWaT/WADI industrial benchmark while maintaining sub-5ms per-sample latency.',
      recommendedTechStack: ['PyTorch', 'Scikit-learn', 'Pandas', 'FastAPI'],
      estimatedWeeks: 2,
      resumeBullet: 'Designed real-time IoT anomaly detection engine with Mamba SSMs; improved anomaly F1-score by 14% over baseline LSTMs while sustaining <5ms inference latency at 100Hz telemetry.',
      implementationPlan: [
        'Format SWaT multivariate sensor time-series into sliding window tensors.',
        'Train 4-layer 64-dim Mamba SSM with reconstruction loss.',
        'Package into an asynchronous FastAPI endpoint with real-time anomaly score streaming.',
        'Write unit tests and compare against LSTM and GRU baselines.'
      ],
      engineeringTakeaway: 'The input-dependent step size Delta naturally learns to ignore stationary noise and contract when sudden state spikes occur.'
    }
  ],
  tokenStats: {
    promptTokens: 820,
    candidateTokens: 1140,
    totalTokens: 1960,
    tokenBudget: 25000,
    tokenBudgetRemaining: 23040,
    efficiencyRating: 'Optimal (Ultra-Efficient)',
    executionTimeMs: 1680
  },
  analyzedAt: new Date().toISOString()
};
