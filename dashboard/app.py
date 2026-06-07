import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import requests
import json
from datetime import datetime, timedelta

# ==========================================
# 1. PAGE CONFIGURATION & THEME
# ==========================================
st.set_page_config(
    page_title="AI Ops Metrics & KPI Dashboard",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Premium CSS Injection
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

    /* Global styling */
    html, body, [data-testid="stAppViewContainer"] {
        background-color: #0b0f19 !important;
        font-family: 'Outfit', sans-serif !important;
        color: #f3f4f6 !important;
    }
    
    /* Header blur */
    [data-testid="stHeader"] {
        background-color: rgba(11, 15, 25, 0.8) !important;
        backdrop-filter: blur(12px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    /* Sidebar styling */
    [data-testid="stSidebar"] {
        background-color: #0e1322 !important;
        border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
    }
    
    /* Gradient Headings */
    .dashboard-title {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #9b51e0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 5px;
    }
    
    .dashboard-subtitle {
        font-size: 1rem;
        color: #9ca3af;
        margin-bottom: 30px;
        font-weight: 300;
    }
    
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #ffffff;
        margin-top: 20px;
        margin-bottom: 15px;
        border-left: 4px solid #4facfe;
        padding-left: 12px;
    }
    
    /* KPI Card Grid */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    
    /* Glassmorphic KPI Card */
    .kpi-card {
        background: linear-gradient(135deg, rgba(22, 27, 34, 0.5) 0%, rgba(13, 17, 23, 0.75) 100%);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 14px;
        padding: 22px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        position: relative;
        overflow: hidden;
    }
    
    .kpi-card:hover {
        transform: translateY(-5px);
        border-color: rgba(79, 172, 254, 0.4);
        box-shadow: 0 10px 30px rgba(79, 172, 254, 0.15);
    }
    
    .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
    }
    
    /* Card Accent Colors */
    .kpi-card.blue::before { background: linear-gradient(to bottom, #3b82f6, #2563eb); }
    .kpi-card.purple::before { background: linear-gradient(to bottom, #8b5cf6, #7c3aed); }
    .kpi-card.green::before { background: linear-gradient(to bottom, #10b981, #059669); }
    .kpi-card.yellow::before { background: linear-gradient(to bottom, #f59e0b, #d97706); }
    .kpi-card.red::before { background: linear-gradient(to bottom, #ef4444, #dc2626); }
    
    .kpi-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #9ca3af;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.07em;
    }
    
    .kpi-value {
        font-size: 2.1rem;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.1;
        margin-bottom: 8px;
    }
    
    .kpi-delta {
        font-size: 0.85rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 20px;
    }
    
    .kpi-delta.up {
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }
    
    .kpi-delta.down {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
    
    .kpi-delta.neutral {
        background-color: rgba(156, 163, 175, 0.1);
        color: #9ca3af;
    }
    
    /* Ollama Status styling */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 15px;
    }
    
    .status-badge.online {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .status-badge.offline {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    /* AI Insights Container */
    .insights-card {
        background: linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(79, 70, 229, 0.04) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(147, 51, 234, 0.25);
        border-radius: 14px;
        padding: 26px;
        margin-top: 25px;
        margin-bottom: 40px;
        box-shadow: 0 10px 40px rgba(147, 51, 234, 0.08);
    }
    
    .insights-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        color: #c084fc;
        font-size: 1.3rem;
        font-weight: 700;
        border-bottom: 1px solid rgba(147, 51, 234, 0.2);
        padding-bottom: 12px;
    }
    
    /* Custom Streamlit Button Styling */
    div.stButton > button {
        background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        font-weight: 600 !important;
        font-size: 1rem !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3) !important;
    }
    
    div.stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45) !important;
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%) !important;
    }
    
    /* File uploader hover styling */
    [data-testid="stFileUploader"] {
        border: 1px dashed rgba(255, 255, 255, 0.15) !important;
        background-color: rgba(22, 27, 34, 0.3) !important;
        border-radius: 10px !important;
    }
    
</style>
""", unsafe_allow_html=True)


# ==========================================
# 2. DATA PIPELINE & LOADER
# ==========================================

@st.cache_data
def load_default_data():
    """Loads the pre-packaged sample_metrics.csv dataset."""
    try:
        df = pd.read_csv("sample_metrics.csv")
        df['Date'] = pd.to_datetime(df['Date'])
        df['Revenue_USD'] = np.nan
        df = df.sort_values('Date')
        return df
    except Exception as e:
        st.error(f"Error loading sample dataset: {e}")
        # Return fallback empty dataframe with correct columns
        return pd.DataFrame(columns=[
            'Date', 'Requests', 'DAU', 'MAU', 'Accuracy', 'Latency', 'Failure_Rate', 'Tokens_Used', 'Revenue_USD'
        ])

def validate_and_parse_csv(file):
    """Validates schema, detects columns, and maps columns case-insensitively for Schema A, B or Default."""
    try:
        df = pd.read_csv(file)
        cols_lower = [c.strip().lower() for c in df.columns]
        
        # 1. Schema A Detection: KPI Metrics
        # Look for DAU, MAU, Latency_ms, Accuracy_pct
        if 'dau' in cols_lower and 'mau' in cols_lower and 'accuracy_pct' in cols_lower:
            schema_type = "Schema A (KPI Metrics)"
            mapping = {
                'dau': 'DAU',
                'mau': 'MAU',
                'accuracy_pct': 'Accuracy',
                'latency_ms': 'Latency',
                'failure_rate_pct': 'Failure_Rate',
                'token_usage': 'Tokens_Used',
                'revenue_usd': 'Revenue_USD'
            }
            
            # Date detection
            date_col = next((c for c in df.columns if c.strip().lower() in ['date', 'timestamp', 'time']), None)
            if not date_col:
                return None, "Default Schema", "Missing date column (expected 'Date' or 'Timestamp')"
                
            mapped_df = pd.DataFrame()
            mapped_df['Date'] = pd.to_datetime(df[date_col])
            for rc in df.columns:
                clean = rc.strip().lower()
                if clean in mapping:
                    mapped_df[mapping[clean]] = df[rc]
                    
            # Pad missing columns with NaN
            for col in ['Requests', 'DAU', 'MAU', 'Accuracy', 'Latency', 'Failure_Rate', 'Tokens_Used', 'Revenue_USD']:
                if col not in mapped_df.columns:
                    mapped_df[col] = np.nan
            return mapped_df, schema_type, None
            
        # 2. Schema B Detection: Request Analytics
        # Look for Requests, Avg_Response_Time_ms, Success_Rate_pct
        elif 'requests' in cols_lower and ('avg_response_time_ms' in cols_lower or 'success_rate_pct' in cols_lower):
            schema_type = "Schema B (Request Analytics)"
            mapping = {
                'requests': 'Requests',
                'avg_response_time_ms': 'Latency',
                'success_rate_pct': 'Accuracy'
            }
            
            # Date detection
            date_col = next((c for c in df.columns if c.strip().lower() in ['date', 'timestamp', 'time']), None)
            if not date_col:
                return None, "Default Schema", "Missing date/timestamp column"
                
            mapped_df = pd.DataFrame()
            mapped_df['Date'] = pd.to_datetime(df[date_col])
            for rc in df.columns:
                clean = rc.strip().lower()
                if clean in mapping:
                    mapped_df[mapping[clean]] = df[rc]
                    
            # Convert Accuracy to 0-100 scale if it is 0-1
            if 'Accuracy' in mapped_df.columns and mapped_df['Accuracy'].max() <= 1.0:
                mapped_df['Accuracy'] = mapped_df['Accuracy'] * 100.0
                
            # Compute Failure Rate from Success Rate (Accuracy)
            if 'Accuracy' in mapped_df.columns:
                mapped_df['Failure_Rate'] = 100.0 - mapped_df['Accuracy']
                
            # Pad missing columns with NaN
            for col in ['Requests', 'DAU', 'MAU', 'Accuracy', 'Latency', 'Failure_Rate', 'Tokens_Used', 'Revenue_USD']:
                if col not in mapped_df.columns:
                    mapped_df[col] = np.nan
            return mapped_df, schema_type, None
            
        # 3. Default/Fallback Schema (check for date and common keys)
        else:
            schema_type = "Default Schema"
            mapping = {
                'requests': 'Requests',
                'dau': 'DAU',
                'mau': 'MAU',
                'accuracy': 'Accuracy',
                'latency': 'Latency',
                'failure_rate': 'Failure_Rate',
                'tokens_used': 'Tokens_Used',
                'token_usage': 'Tokens_Used'
            }
            
            date_col = next((c for c in df.columns if c.strip().lower() in ['date', 'timestamp', 'time']), None)
            if not date_col:
                return None, "Default Schema", "Missing date column (expected 'Date' or 'Timestamp')"
                
            mapped_df = pd.DataFrame()
            mapped_df['Date'] = pd.to_datetime(df[date_col])
            for rc in df.columns:
                clean = rc.strip().lower()
                if clean in mapping:
                    mapped_df[mapping[clean]] = df[rc]
                    
            for col in ['Requests', 'DAU', 'MAU', 'Accuracy', 'Latency', 'Failure_Rate', 'Tokens_Used', 'Revenue_USD']:
                if col not in mapped_df.columns:
                    mapped_df[col] = np.nan
            return mapped_df, schema_type, None
            
    except Exception as e:
        return None, "Default Schema", f"Invalid CSV file format: {str(e)}"

# ==========================================
# 3. OLLAMA API CALLS & STATUS
# ==========================================

OLLAMA_API_BASE = "http://localhost:11434"

def check_ollama_connection():
    """Checks if local Ollama API is running and lists available models."""
    try:
        response = requests.get(f"{OLLAMA_API_BASE}/api/tags", timeout=1.5)
        if response.status_code == 200:
            data = response.json()
            models = [m['name'] for m in data.get('models', [])]
            return True, models
        return False, []
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        return False, []

def generate_ai_insights(prompt, model):
    import requests
    
    # 1. Fetch available models from Ollama to know what is actually installed
    installed_models = []
    try:
        res_tags = requests.get("http://localhost:11434/api/tags", timeout=2)
        if res_tags.status_code == 200:
            installed_models = [m['name'] for m in res_tags.json().get('models', [])]
    except Exception:
        pass
        
    # 2. Define fallback candidate queue (qwen2.5 is the preferred default)
    fallback_candidates = ["qwen2.5:latest", "qwen2.5:7b", "qwen2.5:3b", "qwen", "phi3:mini", "mistral:7b", "llama3:latest"]
    
    def find_installed_match(candidate):
        if candidate in installed_models:
            return candidate
        base = candidate.split(':')[0]
        for m in installed_models:
            if m.split(':')[0] == base:
                return m
        return None
        
    models_to_try = [model]
    for cand in fallback_candidates:
        matched = find_installed_match(cand)
        if matched and matched not in models_to_try:
            models_to_try.append(matched)
            
    warnings = []
    # 3. Execution loop with fallback and 60s timeout
    for i, current_model in enumerate(models_to_try):
        try:
            payload = {
                "model": str(current_model).strip(),
                "prompt": str(prompt),
                "stream": False
            }
            response = requests.post(
                "http://localhost:11434/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    return data.get("response", "No response returned."), warnings
                except Exception as je:
                    return f"Exception parsing response: {str(je)}", warnings
            
            # Error checking (memory limits or typical 500 error)
            err_text = response.text
            is_mem_err = "kv cache" in err_text.lower() or "allocate buffer" in err_text.lower() or "oom" in err_text.lower() or response.status_code == 500
            
            if is_mem_err and i < len(models_to_try) - 1:
                warnings.append(f"Selected model exceeded local memory capacity. Switching to lightweight model.")
                continue
            else:
                return f"OLLAMA ERROR {response.status_code}\n\n{err_text}", warnings
                
        except Exception as e:
            if i < len(models_to_try) - 1:
                warnings.append(f"Selected model connection failed. Switching to lightweight model.")
                continue
            return f"Exception: {str(e)}", warnings
            
    return "All attempted models failed to generate insights.", warnings

@st.cache_data(show_spinner=False, ttl=3600)
def cached_generate_ai_insights(prompt, model):
    return generate_ai_insights(prompt, model)



def generate_simulated_insights(metrics_summary, start_date, end_date, has_anomaly, schema_type):
    start_str = start_date.strftime('%B %d, %Y')
    end_str = end_date.strftime('%B %d, %Y')
    
    if "Schema B" in schema_type:
        # Schema B: Request Analytics specific fallback report
        anomaly_bullet = ""
        anomaly_risk = ""
        anomaly_rec = ""
        if has_anomaly:
            anomaly_bullet = """* **System Load Alert**: Telemetry data indicates a correlation between high request traffic and critical latency spikes. On May 15th, average latency spiked to over **600 ms** under peak load."""
            anomaly_risk = """* **Latency Violations**: High response times risk customer timeout states.
* **Server Queue Overflow**: Rising response times suggest backend model processes are hitting context length bottlenecks."""
            anomaly_rec = """* **Concurrency Adjustments**: Tune model max sequence limits to speed up generation phases.
* **Load Balancer Rules**: Throttle burst request traffic before it reaches backend GPU nodes."""
        else:
            anomaly_bullet = """* **Normal Request Processing**: System request counts and response times remained stable within nominal limits."""
            anomaly_risk = """* **No Critical Issues**: Latency is steady and requests are processed without delays."""
            anomaly_rec = """* **Continue Baseline Logs**: Keep tracing request intervals to spot future spikes."""

        simulated_markdown = f"""### Executive Summary (Request Analytics)
Analysis of model traffic data from **{start_str}** to **{end_str}** indicates typical request volume and response times.

---

### Key Business Insights
* **Request Volume**: Total processed requests served reached **{metrics_summary['total_requests']:.0f}**.
* **Model Quality Profile**: Accuracy / Success rate averaged **{metrics_summary.get('avg_accuracy', 0):.2f}%** with average response time at **{metrics_summary.get('avg_latency', 0):.1f} ms**.
{anomaly_bullet}

---

### Identified Risks
{anomaly_risk}

---

### Actionable Recommendations
{anomaly_rec}
"""
        return simulated_markdown

    else:
        # Schema A or Default Schema report
        anomaly_bullet = ""
        anomaly_risk = ""
        anomaly_rec = ""
        
        if has_anomaly:
            anomaly_bullet = """* **Critical System Anomaly (May 15, 2026)**: A major performance degradation occurred. Model accuracy plunged to **86.4%**, failure rate spiked to **7.4%**, and latency reached a severe peak of **685.2 ms**. This incident directly correlated with a massive request volume spike (**15,800 requests/day**), showing that system stability degrades under load."""
            anomaly_risk = """* **Resource Constraints & Scaling Failure**: The system lacks horizontal auto-scaling or sufficient compute buffers. When requests peaked on May 15, the model serving host throttled, leading to latency inflation, degraded accuracy (possibly due to fallback timeouts or truncated contexts), and a spike in API request failures.
* **SLA Violations**: The peak latency of 685.2 ms and a 7.4% failure rate represent clear violations of standard enterprise-level SLAs (e.g., Latency < 300 ms, Failure Rate < 1%)."""
            anomaly_rec = """* **Implement Autoscaling**: Deploy the model on a Kubernetes cluster (KServe/vLLM) with horizontal pod autoscaling based on concurrent request counts.
* **Rate Limiting & Queueing**: Add token-bucket rate limiting at the API gateway layer to prevent backend model server exhaustion.
* **Model Cache & Fallback**: Implement a local fallback cache for frequent queries, and route overflow traffic to a smaller, faster quantized model (e.g., 8-bit or 4-bit) during peak times to protect system latency."""
        else:
            anomaly_bullet = """* **Stable Performance Profile**: Throughout this specific timeframe, accuracy remained high and stable (averaging above **96.5%**), failure rates remained well below the **1.5%** threshold, and latency was maintained within target limits (**~240 ms**)."""
            anomaly_risk = """* **No Critical Anomalies**: The system shows a clean bill of health. However, growth in MAU indicates an upcoming increase in base workload.
* **Idle Capacity**: If traffic remains low without spikes, ensure server provisioning matches demand to avoid unnecessary infrastructure costs."""
            anomaly_rec = """* **Proactive Monitoring**: Establish alerts for rolling 5-minute averages of latency and failure rate to detect issues before they affect end-users.
* **Capacity Planning**: Use the growing MAU curve to forecast computing requirements for the next quarter."""

        simulated_markdown = f"""### Executive Summary
Analysis of system telemetry data from **{start_str}** to **{end_str}** indicates that while the system exhibits solid baseline capabilities, scaling resilience requires immediate attention.

---

### Key Business Insights
* **Usage & Retention Trends**: 
  - The dataset showcases strong user adoption. Daily Active Users (DAU) averaged **{metrics_summary['avg_dau']:.0f}**, while Monthly Active Users (MAU) scaled up to **{metrics_summary['max_mau']:.0f}**.
  - Total queries served during the period reached **{metrics_summary['total_requests']:,}** with a total expenditure of **{metrics_summary['total_tokens']:,}** tokens.
* **Seasonality Patterns**: 
  - There is a noticeable weekly cycle: request volumes, active users, and token counts decrease by 30-40% on weekends (Saturdays and Sundays) compared to weekdays, suggesting a B2B utility profile.
{anomaly_bullet}

---

### Identified Risks
{anomaly_risk}
* **Token Efficiency**: The constant tokens-per-request ratio suggests a lack of context optimization. Without prompt caching or prefix tuning, token costs will scale linearly with query volume, increasing operating expenses.

---

### Actionable Recommendations
{anomaly_rec}
* **Optimize Prompts & Enable Caching**: Implement prompt caching (e.g., via vLLM or Ollama's model configs) to reuse system prompts, reducing token overhead and latency for repetitive developer commands.
* **Establish Automated SLA Reporting**: Create automated alerts in Prometheus/Grafana mirroring the metrics tracked in this dashboard.
"""
        return simulated_markdown

# ==========================================
# 4. SIDEBAR CONTROLS
# ==========================================

st.sidebar.markdown("<h2 style='text-align: center; color: #4facfe;'>⚙️ Configuration</h2>", unsafe_allow_html=True)
st.sidebar.markdown("---")

# File Upload Support
st.sidebar.subheader("📁 Data Source")
uploaded_file = st.sidebar.file_uploader(
    "Upload custom CSV file",
    type=["csv"],
    help="CSV must contain: Date, Requests, DAU, MAU, Accuracy, Latency, Failure_Rate, Tokens_Used"
)

# Load Selected Dataset
if uploaded_file is not None:
    df, uploaded_schema, err = validate_and_parse_csv(uploaded_file)
    if err:
        st.sidebar.error(err)
        st.sidebar.info("Falling back to sample metrics data.")
        df = load_default_data()
        schema_type = "Default Schema"
        data_source_label = "Sample Data (Fallback)"
    else:
        st.sidebar.success(f"Detected: {uploaded_schema}")
        schema_type = uploaded_schema
        data_source_label = f"Custom Upload ({uploaded_schema})"
else:
    df = load_default_data()
    schema_type = "Default Schema"
    data_source_label = "Sample Data"

# Date Range Filter
st.sidebar.subheader("📅 Date Range Filter")
min_date = df['Date'].min().to_pydatetime()
max_date = df['Date'].max().to_pydatetime()

selected_range = st.sidebar.slider(
    "Select Period",
    min_value=min_date,
    max_value=max_date,
    value=(min_date, max_date),
    format="YYYY-MM-DD"
)
start_date, end_date = selected_range

# Filter dataframe based on date selection
filtered_df = df[(df['Date'] >= start_date) & (df['Date'] <= end_date)].reset_index(drop=True)

# Ollama API Panel in Sidebar
st.sidebar.subheader("🤖 Local AI Engine (Ollama)")
is_connected, available_models = check_ollama_connection()

if is_connected:
    st.sidebar.markdown('<div class="status-badge online">● Ollama Online</div>', unsafe_allow_html=True)
    if available_models:
        # Default index lookup for qwen or phi3
        default_idx = 0
        for idx, m in enumerate(available_models):
            if "qwen" in m.lower():
                default_idx = idx
                break
        else:
            for idx, m in enumerate(available_models):
                if "phi3" in m.lower():
                    default_idx = idx
                    break
        selected_model = st.sidebar.selectbox("Choose Model", available_models, index=default_idx)
    else:
        selected_model = st.sidebar.text_input("Enter Model Name", value="qwen2.5:latest", help="No models found in Ollama tags. Please input one manually.")
else:
    st.sidebar.markdown('<div class="status-badge offline">▲ Ollama Offline (Simulated Fallback)</div>', unsafe_allow_html=True)
    st.sidebar.warning("Ollama is not running locally. Clicking 'Generate AI Insights' will show simulated insights tailored to your filtered metrics.")
    selected_model = "Simulated Analyst"

# Download Sample CSV link
st.sidebar.markdown("---")
st.sidebar.subheader("📥 Reference Templates")

# Convert sample data to CSV for download
sample_csv = load_default_data().to_csv(index=False).encode('utf-8')
st.sidebar.download_button(
    label="Download sample_metrics.csv",
    data=sample_csv,
    file_name="sample_metrics.csv",
    mime="text/csv"
)

# ==========================================
# 5. CORE LAYOUT & TITLE
# ==========================================

st.markdown("<div class='dashboard-title'>AI Metrics & KPI Operations Center</div>", unsafe_allow_html=True)
st.markdown(f"<div class='dashboard-subtitle'>Interactive production analytics and SLA monitoring dashboard. Data Source: <b>{data_source_label}</b> ({len(filtered_df)} days selected)</div>", unsafe_allow_html=True)

if filtered_df.empty:
    st.error("No data available for the selected date range. Please adjust your date range filter in the sidebar.")
    st.stop()

# ==========================================
# 6. KPI CARDS GRID CALCULATION
# ==========================================

# We extract the final day in our filtered range as the "current value"
# And compare it to the preceding day in the filtered dataset to calculate the delta
latest_idx = len(filtered_df) - 1
latest_row = filtered_df.iloc[latest_idx]

# Calculate Deltas
# Find if there is a preceding day in the dataset. If yes, compare.
if latest_idx > 0:
    prev_row = filtered_df.iloc[latest_idx - 1]
    
    def calc_pct_delta(curr, prev):
        if pd.isna(curr) or pd.isna(prev) or prev == 0: return 0.0
        return ((curr - prev) / prev) * 100.0
        
    def calc_diff_delta(curr, prev):
        if pd.isna(curr) or pd.isna(prev): return 0.0
        return curr - prev

    dau_delta = calc_pct_delta(latest_row['DAU'], prev_row['DAU'])
    mau_delta = calc_pct_delta(latest_row['MAU'], prev_row['MAU'])
    accuracy_delta = calc_diff_delta(latest_row['Accuracy'], prev_row['Accuracy']) # Difference in percentage points
    latency_delta = calc_pct_delta(latest_row['Latency'], prev_row['Latency'])
    failure_delta = calc_diff_delta(latest_row['Failure_Rate'], prev_row['Failure_Rate']) # Difference in percentage points
    tokens_delta = calc_pct_delta(latest_row['Tokens_Used'], prev_row['Tokens_Used'])
else:
    dau_delta = mau_delta = accuracy_delta = latency_delta = failure_delta = tokens_delta = 0.0

# Helper function to compile html cards
def get_kpi_card_html(title, value, delta, is_pct=False, is_latency=False, is_failure=False, is_tokens=False, higher_better=True):
    if pd.isna(value):
        return f"""<div class="kpi-card blue" style="opacity: 0.65;">
<div class="kpi-title">{title}</div>
<div class="kpi-value">N/A</div>
<div class="kpi-delta neutral">
<span>●</span> 0.0% <span style="font-weight: 300; opacity: 0.6; font-size: 0.75rem;">no data</span>
</div>
</div>"""

    if is_pct:
        val_str = f"{value:.1f}%"
        delta_str = f"{delta:+.1f}%" if delta != 0 else "0.0%"
    elif is_latency:
        val_str = f"{value:.1f} ms"
        delta_str = f"{delta:+.1f}%" if delta != 0 else "0.0%"
    elif is_failure:
        val_str = f"{value:.2f}%"
        delta_str = f"{delta:+.2f}%" if delta != 0 else "0.00%"
    elif is_tokens:
        # Format tokens into readable formats e.g. millions
        if value >= 1_000_000:
            val_str = f"{value/1_000_000:.2f}M"
        else:
            val_str = f"{value:,}"
        delta_str = f"{delta:+.1f}%" if delta != 0 else "0.0%"
    else:
        val_str = f"{value:,}"
        delta_str = f"{delta:+.1f}%" if delta != 0 else "0.0%"
        
    if delta == 0:
        delta_class = "neutral"
        arrow = "●"
    elif delta > 0:
        if higher_better:
            delta_class = "up"
            arrow = "▲"
        else:
            delta_class = "down" # bad increase (failure, latency)
            arrow = "▲"
    else:
        if higher_better:
            delta_class = "down" # bad decrease (accuracy, users)
            arrow = "▼"
        else:
            delta_class = "up" # good decrease (failure, latency)
            arrow = "▼"
            
    # Glow theme
    glow_class = "blue"
    if title == "Accuracy %":
        glow_class = "green" if value >= 95 else ("yellow" if value >= 90 else "red")
    elif title == "Latency":
        glow_class = "green" if value < 250 else ("yellow" if value < 400 else "red")
    elif title == "Failure Rate":
        glow_class = "green" if value < 1.5 else ("yellow" if value < 3.0 else "red")
    elif title == "Token Usage":
        glow_class = "purple"
        
    return f"""<div class="kpi-card {glow_class}">
<div class="kpi-title">{title}</div>
<div class="kpi-value">{val_str}</div>
<div class="kpi-delta {delta_class}">
<span>{arrow}</span> {delta_str} <span style="font-weight: 300; opacity: 0.6; font-size: 0.75rem;">vs prev day</span>
</div>
</div>"""

# Render KPI Cards in a grid
kpi_html = f"""<div class="kpi-grid">
{get_kpi_card_html("Daily Active Users", latest_row['DAU'], dau_delta)}
{get_kpi_card_html("Monthly Active Users", latest_row['MAU'], mau_delta)}
{get_kpi_card_html("Accuracy %", latest_row['Accuracy'], accuracy_delta, is_pct=True)}
{get_kpi_card_html("Latency", latest_row['Latency'], latency_delta, is_latency=True, higher_better=False)}
{get_kpi_card_html("Failure Rate", latest_row['Failure_Rate'], failure_delta, is_failure=True, higher_better=False)}
{get_kpi_card_html("Token Usage", latest_row['Tokens_Used'], tokens_delta, is_tokens=True)}
</div>"""
st.markdown(kpi_html, unsafe_allow_html=True)


# ==========================================
# 7. INTERACTIVE CHARTS (PLOTLY)
# ==========================================

st.markdown("<div class='section-title'>System Performance Trends & Analytics</div>", unsafe_allow_html=True)

# Helper function to style Plotly charts
def customize_plotly_layout(fig):
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Outfit, sans-serif", color="#e5e7eb", size=12),
        margin=dict(l=50, r=40, t=30, b=40),
        hovermode="x unified",
        xaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.05)",
            zeroline=False,
            showgrid=True,
            linecolor="rgba(255, 255, 255, 0.1)",
            title=""
        ),
        yaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.05)",
            zeroline=False,
            showgrid=True,
            linecolor="rgba(255, 255, 255, 0.1)"
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            bgcolor="rgba(14, 19, 34, 0.6)",
            bordercolor="rgba(255, 255, 255, 0.05)",
            borderwidth=1
        )
    )
    return fig

col1, col2 = st.columns(2)

with col1:
    # 1. Request / Revenue Trend Chart
    fig_req = go.Figure()
    if schema_type == "Schema A (KPI Metrics)":
        fig_req.add_trace(go.Scatter(
            x=filtered_df['Date'],
            y=filtered_df['Revenue_USD'],
            mode='lines+markers',
            name='Daily Revenue ($)',
            line=dict(color='#00f2fe', width=3),
            marker=dict(size=6, color='#00f2fe', line=dict(width=0)),
            fill='tozeroy',
            fillcolor='rgba(0, 242, 254, 0.08)'
        ))
        fig_req.update_layout(title="Revenue Trend (Daily Business Volume)", yaxis_title="Revenue ($ USD)")
    else:
        fig_req.add_trace(go.Scatter(
            x=filtered_df['Date'],
            y=filtered_df['Requests'],
            mode='lines+markers',
            name='Daily Requests',
            line=dict(color='#00f2fe', width=3),
            marker=dict(size=6, color='#00f2fe', line=dict(width=0)),
            fill='tozeroy',
            fillcolor='rgba(0, 242, 254, 0.08)'
        ))
        fig_req.update_layout(title="Request Trend (Daily API Volume)", yaxis_title="Number of Requests")
    fig_req = customize_plotly_layout(fig_req)
    st.plotly_chart(fig_req, use_container_width=True)

    # 2. Latency Trend Chart
    if not filtered_df['Latency'].isna().all():
        fig_lat = go.Figure()
        fig_lat.add_trace(go.Scatter(
            x=filtered_df['Date'],
            y=filtered_df['Latency'],
            mode='lines+markers',
            name='Avg Latency (ms)',
            line=dict(color='#f59e0b', width=3),
            marker=dict(size=6, color='#f59e0b')
        ))
        fig_lat.add_shape(
            type="line",
            x0=filtered_df['Date'].min(),
            y0=300,
            x1=filtered_df['Date'].max(),
            y1=300,
            line=dict(color="rgba(239, 68, 68, 0.5)", width=2, dash="dash"),
            name="SLA Threshold"
        )
        fig_lat.add_annotation(
            x=filtered_df['Date'].iloc[min(len(filtered_df)-1, 2)],
            y=310,
            text="SLA Threshold (300 ms)",
            showarrow=False,
            font=dict(color="rgba(239, 68, 68, 0.8)", size=10)
        )
        fig_lat.update_layout(title="Latency Trend (Response Time)", yaxis_title="Latency (ms)")
        fig_lat = customize_plotly_layout(fig_lat)
        st.plotly_chart(fig_lat, use_container_width=True)
    else:
        st.info("Latency data not available in this dataset schema.")

with col2:
    # 3. Accuracy Trend Chart
    if not filtered_df['Accuracy'].isna().all():
        fig_acc = go.Figure()
        fig_acc.add_trace(go.Scatter(
            x=filtered_df['Date'],
            y=filtered_df['Accuracy'],
            mode='lines+markers',
            name='Model Accuracy (%)',
            line=dict(color='#10b981', width=3),
            marker=dict(size=6, color='#10b981')
        ))
        fig_acc.add_shape(
            type="line",
            x0=filtered_df['Date'].min(),
            y0=95,
            x1=filtered_df['Date'].max(),
            y1=95,
            line=dict(color="rgba(16, 185, 129, 0.5)", width=2, dash="dash"),
        )
        fig_acc.add_annotation(
            x=filtered_df['Date'].iloc[min(len(filtered_df)-1, 2)],
            y=94.5,
            text="Target Accuracy (95%)",
            showarrow=False,
            font=dict(color="rgba(16, 185, 129, 0.8)", size=10)
        )
        min_acc_val = filtered_df['Accuracy'].min()
        fig_acc.update_layout(title="Model Accuracy Trend", yaxis_title="Accuracy %", yaxis_range=[min(min_acc_val - 2 if not pd.isna(min_acc_val) else 90, 90), 101])
        fig_acc = customize_plotly_layout(fig_acc)
        st.plotly_chart(fig_acc, use_container_width=True)
    else:
        st.info("Accuracy data not available in this dataset schema.")

    # 4. Usage / Value Analytics
    fig_usage = make_subplots(specs=[[{"secondary_y": True}]])
    if schema_type == "Schema A (KPI Metrics)":
        fig_usage.add_trace(
            go.Bar(
                x=filtered_df['Date'],
                y=filtered_df['Revenue_USD'],
                name='Daily Revenue ($)',
                marker=dict(color='rgba(0, 242, 254, 0.35)', line=dict(color='#00f2fe', width=1)),
                hoverinfo='x+y'
            ),
            secondary_y=False
        )
        fig_usage.add_trace(
            go.Scatter(
                x=filtered_df['Date'],
                y=filtered_df['Tokens_Used'],
                name='Tokens Used',
                mode='lines',
                line=dict(color='#9b51e0', width=3),
                hoverinfo='x+y'
            ),
            secondary_y=True
        )
        fig_usage.update_layout(title="Revenue vs Token Cost", legend=dict(orientation="h", y=1.1, x=1))
        fig_usage = customize_plotly_layout(fig_usage)
        fig_usage.update_yaxes(title_text="Daily Revenue ($)", secondary_y=False)
        fig_usage.update_yaxes(title_text="Tokens Used", secondary_y=True, gridcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_usage, use_container_width=True)
        
    elif schema_type == "Schema B (Request Analytics)":
        fig_usage.add_trace(
            go.Bar(
                x=filtered_df['Date'],
                y=filtered_df['Requests'],
                name='Daily Requests',
                marker=dict(color='rgba(0, 242, 254, 0.35)', line=dict(color='#00f2fe', width=1)),
                hoverinfo='x+y'
            ),
            secondary_y=False
        )
        fig_usage.add_trace(
            go.Scatter(
                x=filtered_df['Date'],
                y=filtered_df['Latency'],
                name='Avg Latency (ms)',
                mode='lines',
                line=dict(color='#f59e0b', width=3),
                hoverinfo='x+y'
            ),
            secondary_y=True
        )
        fig_usage.update_layout(title="System Load vs Latency Profile", legend=dict(orientation="h", y=1.1, x=1))
        fig_usage = customize_plotly_layout(fig_usage)
        fig_usage.update_yaxes(title_text="Daily Requests", secondary_y=False)
        fig_usage.update_yaxes(title_text="Latency (ms)", secondary_y=True, gridcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_usage, use_container_width=True)
        
    else:
        fig_usage.add_trace(
            go.Bar(
                x=filtered_df['Date'],
                y=filtered_df['Requests'],
                name='Daily Requests',
                marker=dict(color='rgba(0, 242, 254, 0.35)', line=dict(color='#00f2fe', width=1)),
                hoverinfo='x+y'
            ),
            secondary_y=False
        )
        fig_usage.add_trace(
            go.Scatter(
                x=filtered_df['Date'],
                y=filtered_df['Tokens_Used'],
                name='Tokens Used',
                mode='lines',
                line=dict(color='#9b51e0', width=3),
                hoverinfo='x+y'
            ),
            secondary_y=True
        )
        fig_usage.update_layout(title="Usage Analytics (Volume vs Token Cost)", legend=dict(orientation="h", y=1.1, x=1))
        fig_usage = customize_plotly_layout(fig_usage)
        fig_usage.update_yaxes(title_text="Daily Requests", secondary_y=False)
        fig_usage.update_yaxes(title_text="Tokens Used", secondary_y=True, gridcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_usage, use_container_width=True)


# ==========================================
# 8. OLLAMA AI INSIGHTS GENERATION
# ==========================================

st.markdown("<div class='section-title'>⚡ AI Executive Insights & Recommendations</div>", unsafe_allow_html=True)
st.write("Generate dynamic business insights, anomaly detection, risk assessment, and operational advice based on your current filtered dashboard views.")

# Statistics calculation for prompt compiler
avg_requests = filtered_df['Requests'].mean() if not filtered_df['Requests'].isna().all() else 0.0
total_requests = filtered_df['Requests'].sum() if not filtered_df['Requests'].isna().all() else 0.0
avg_dau = filtered_df['DAU'].mean() if not filtered_df['DAU'].isna().all() else 0.0
max_mau = filtered_df['MAU'].max() if not filtered_df['MAU'].isna().all() else 0.0
avg_accuracy = filtered_df['Accuracy'].mean() if not filtered_df['Accuracy'].isna().all() else 0.0
min_accuracy = filtered_df['Accuracy'].min() if not filtered_df['Accuracy'].isna().all() else 0.0
max_accuracy = filtered_df['Accuracy'].max() if not filtered_df['Accuracy'].isna().all() else 0.0
avg_latency = filtered_df['Latency'].mean() if not filtered_df['Latency'].isna().all() else 0.0
max_latency = filtered_df['Latency'].max() if not filtered_df['Latency'].isna().all() else 0.0
avg_failure = filtered_df['Failure_Rate'].mean() if not filtered_df['Failure_Rate'].isna().all() else 0.0
max_failure = filtered_df['Failure_Rate'].max() if not filtered_df['Failure_Rate'].isna().all() else 0.0
total_tokens = filtered_df['Tokens_Used'].sum() if not filtered_df['Tokens_Used'].isna().all() else 0.0
avg_tokens = filtered_df['Tokens_Used'].mean() if not filtered_df['Tokens_Used'].isna().all() else 0.0
total_revenue = filtered_df['Revenue_USD'].sum() if not filtered_df['Revenue_USD'].isna().all() else 0.0

# Check for anomalies to specify in the prompt and simulation
anomalies_list = []
for idx, row in filtered_df.iterrows():
    day_anoms = []
    if not pd.isna(row['Accuracy']) and row['Accuracy'] < 90.0:
        day_anoms.append(f"Low Accuracy ({row['Accuracy']:.1f}%)")
    if not pd.isna(row['Latency']) and row['Latency'] > 350.0:
        day_anoms.append(f"High Latency ({row['Latency']:.1f} ms)")
    if not pd.isna(row['Failure_Rate']) and row['Failure_Rate'] > 3.0:
        day_anoms.append(f"High Failure Rate ({row['Failure_Rate']:.2f}%)")
        
    if day_anoms:
        date_str = row['Date'].strftime('%Y-%m-%d')
        req_val = f"{int(row['Requests']):,}" if not pd.isna(row['Requests']) else "N/A"
        tok_val = f"{int(row['Tokens_Used']):,}" if not pd.isna(row['Tokens_Used']) else "N/A"
        day_anoms.append(f"[Requests: {req_val}, Tokens: {tok_val}]")
        anomalies_list.append(f"- **{date_str}**: " + ", ".join(day_anoms[:-1]) + f" {day_anoms[-1]}")

anomalies_str = "\n".join(anomalies_list) if anomalies_list else "- No significant metric anomalies detected in selected timeframe."

# Prepare a structured Markdown Table of filtered data to send to LLM
# Only include columns that are not entirely NaN
present_cols = ['Date']
for col in ['Requests', 'DAU', 'MAU', 'Accuracy', 'Latency', 'Failure_Rate', 'Tokens_Used', 'Revenue_USD']:
    if not filtered_df[col].isna().all():
        present_cols.append(col)
df_markdown = filtered_df[present_cols].copy()
df_markdown['Date'] = df_markdown['Date'].dt.strftime('%Y-%m-%d')
data_table_str = df_markdown.to_markdown(index=False)

# Compile Ollama Prompt (Optimized layout to reduce prompt size & response latency)
ollama_prompt = f"""Analyze these LLM app KPI metrics from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({schema_type}):

SUMMARY METRICS:
- Range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} (Days: {len(filtered_df)})
- Total Requests: {int(total_requests):,} (Avg: {avg_requests:.1f}/day)
- Avg DAU: {avg_dau:.1f} | Peak MAU: {max_mau:.1f}
- Avg Accuracy: {avg_accuracy:.2f}% (Min: {min_accuracy:.2f}%, Max: {max_accuracy:.2f}%)
- Avg Latency: {avg_latency:.1f} ms (Max: {max_latency:.1f} ms)
- Avg Failure Rate: {avg_failure:.2f}% (Max: {max_failure:.2f}%)
- Total Tokens: {int(total_tokens):,} (Avg: {avg_tokens:,.1f}/day)
- Total Revenue: ${total_revenue:,.2f}

ANOMALIES DETECTED:
{anomalies_str}

PROMPT REQUIREMENT:
Analyze KPI metrics and provide business insights, anomalies, risks, and recommendations. Format the output with clear markdown headings, bullet points, and highlight key takeaways."""

# Hard limit prompt size to 1500 characters
ollama_prompt = ollama_prompt[:1500]

# Trigger button for generation
if st.button("Generate AI Insights", key="btn_generate"):
    st.markdown('<div class="insights-card">', unsafe_allow_html=True)
    st.markdown(f'<div class="insights-header">🔮 AI Analysis & Diagnostic Report ({selected_model})</div>', unsafe_allow_html=True)
    
    report_placeholder = st.empty()
    
    if is_connected:
        st.write("Selected model:", selected_model)
        st.write("Prompt preview:", ollama_prompt[:300])
        with st.spinner("Connecting to local Ollama API and generating report..."):
            res, warnings = cached_generate_ai_insights(ollama_prompt, selected_model)
            
            for w in warnings:
                st.warning(w)
                
            if res.startswith("OLLAMA ERROR") or res.startswith("Exception:"):
                st.error(res)
                st.warning("Ollama API failed. Falling back to Simulated Analyst.")
                sim_text = generate_simulated_insights(
                    {
                        "avg_dau": avg_dau,
                        "max_mau": max_mau,
                        "total_requests": total_requests,
                        "total_tokens": total_tokens,
                        "avg_latency": avg_latency,
                        "avg_accuracy": avg_accuracy
                    },
                    start_date, end_date,
                    has_anomaly=(len(anomalies_list) > 0),
                    schema_type=schema_type
                )
                report_placeholder.markdown(sim_text)
            else:
                report_placeholder.markdown(res)
    else:
        # Ollama Offline Simulation Fallback
        with st.spinner("Generating analytical summary (Ollama Simulated Offline Fallback)..."):
            sim_text = generate_simulated_insights(
                {
                    "avg_dau": avg_dau,
                    "max_mau": max_mau,
                    "total_requests": total_requests,
                    "total_tokens": total_tokens,
                    "avg_latency": avg_latency,
                    "avg_accuracy": avg_accuracy
                },
                start_date, end_date,
                has_anomaly=(len(anomalies_list) > 0),
                schema_type=schema_type
            )
            report_placeholder.markdown(sim_text)
                
    st.markdown('</div>', unsafe_allow_html=True)
