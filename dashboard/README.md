# AI Metrics & KPI Operations Center

A modern, high-performance operations dashboard for monitoring AI systems SLA, response accuracy, latency, failure rates, and token expenditures. This application is optimized for local development and integrates with a local **Ollama** instance to generate AI-powered operational insights.

## Key Features
- **Modern Dark SaaS Aesthetics**: Deep obsidian styling with responsive glassmorphic cards and dynamic, glowing state indicators.
- **Aggregated KPI Tracking**: Visual representation of Daily Active Users (DAU), Monthly Active Users (MAU), Accuracy, Latency, Failure Rates, and Token Expenditures.
- **Dynamic Schema Detection**: Accepts different CSV formats including Schema A (KPI Metrics with Revenue) and Schema B (Request/Timestamp Analytics), automatically mapping columns and adapting charts.
- **Interactive Visualizations**: Transparent Plotly charts showing Request/Revenue trends, Accuracy SLAs, Latency Thresholds, and Dual-Axis efficiency charts.
- **Local Ollama AI Engine**:
  - Connects to your local machine LLM model (e.g. `qwen2.5:latest`, `phi3:mini`, `mistral:7b`, `llama3:latest`).
  - Automatic system memory detection with a fallback chain (automatically retrying with a smaller model if local memory limits or KV cache allocations fail).
  - Friendly warnings when switching models due to resource constraints.
- **Offline Simulated Analyst Fallback**: If Ollama is offline or not running, the dashboard runs a local, rule-based analyst simulation that inspects metrics and anomalies (e.g. load spikes) to generate a tailored markdown analysis report.
- **Intelligent Analytical Report Caching**: Caches repetitive AI prompt queries using Streamlit's data caching to bypass LLM latency.

## Tech Stack
- **Python 3.8+**
- **Streamlit** (UI & Application Logic)
- **Plotly** (Interactive Telemetry Charts)
- **Pandas / NumPy** (Telemetry Data Pipeline)
- **Ollama API** (Local AI Engine)
- **Requests** (HTTP Communication)

---

## Getting Started

### Prerequisites
1. **Ollama**: Download and install Ollama from [ollama.com](https://ollama.com).
2. **Pull a Model**: Pull the default Qwen model (or any preferred lightweight model):
   ```bash
   ollama pull qwen2.5:latest
   ```

### Running Locally
1. Clone this repository to your local workspace.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Streamlit application:
   ```bash
   python -m streamlit run app.py
   ```
4. Access the dashboard in your web browser at `http://localhost:8501`.
